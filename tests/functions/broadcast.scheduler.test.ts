import { beforeEach, describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';

import { clearFirestore } from './helpers';
import { ALICE, BOB, HOUR, seedBroadcast, seedConnection, seedContact } from './fixtures';
import { db } from '../../functions/src/config/firebaseAdmin';
import { processDueBroadcasts } from '../../functions/src/modules/broadcasts/broadcast.scheduler';

const past = (ms: number) => Timestamp.fromMillis(Date.now() - ms);
const future = (ms: number) => Timestamp.fromMillis(Date.now() + ms);

async function status(id: string): Promise<string | undefined> {
  return (await db.doc(`broadcasts/${id}`).get()).data()?.status;
}

beforeEach(async () => {
  await clearFirestore();
  await seedConnection('c1', ALICE);
  await seedContact('k1', ALICE, 'c1');
});

describe('processDueBroadcasts', () => {
  it('envia apenas os agendados vencidos, de qualquer tenant', async () => {
    await seedBroadcast('due-alice', { scheduledAt: past(HOUR) });
    await seedBroadcast('due-bob', { ownerId: BOB, scheduledAt: past(HOUR) });
    await seedBroadcast('later', { scheduledAt: future(HOUR) });

    const processed = await processDueBroadcasts(Timestamp.now());

    expect(processed).toBe(2);
    expect(await status('due-alice')).toBe('sent');
    expect(await status('due-bob')).toBe('sent');
    expect(await status('later')).toBe('scheduled');

    const sent = (await db.doc('broadcasts/due-alice').get()).data();
    expect(sent?.sentAt).not.toBeNull();
    expect(sent?.updatedAt).toBeDefined();
  });

  it('é idempotente: uma segunda execução não reprocessa nem altera sentAt', async () => {
    await seedBroadcast('b1', { scheduledAt: past(HOUR) });

    expect(await processDueBroadcasts(Timestamp.now())).toBe(1);
    const firstSentAt = (await db.doc('broadcasts/b1').get()).data()?.sentAt;

    expect(await processDueBroadcasts(Timestamp.now())).toBe(0);
    const secondSentAt = (await db.doc('broadcasts/b1').get()).data()?.sentAt;
    expect(secondSentAt.toMillis()).toBe(firstSentAt.toMillis());
  });

  it('execuções concorrentes processam cada broadcast uma única vez', async () => {
    for (let i = 0; i < 20; i++) {
      await seedBroadcast(`b${i}`, { scheduledAt: past(HOUR) });
    }

    const counts = await Promise.all([
      processDueBroadcasts(Timestamp.now()),
      processDueBroadcasts(Timestamp.now()),
      processDueBroadcasts(Timestamp.now()),
    ]);

    expect(counts.reduce((a, b) => a + b, 0)).toBe(20);
  });

  it('não toca em broadcasts já enviados', async () => {
    const sentAt = past(2 * HOUR);
    await seedBroadcast('old', { status: 'sent', scheduledAt: null, sentAt });

    expect(await processDueBroadcasts(Timestamp.now())).toBe(0);
    expect((await db.doc('broadcasts/old').get()).data()?.sentAt.toMillis()).toBe(
      sentAt.toMillis(),
    );
  });

  it('processa mais de um lote por execução', async () => {
    for (let i = 0; i < 25; i++) {
      await seedBroadcast(`b${i}`, { scheduledAt: past(HOUR + i) });
    }

    // lote de 10 => 3 consultas para esvaziar a fila
    expect(await processDueBroadcasts(Timestamp.now(), 10, 10)).toBe(25);
  });

  it('respeita o limite de lotes por execução', async () => {
    for (let i = 0; i < 25; i++) {
      await seedBroadcast(`b${i}`, { scheduledAt: past(HOUR + i) });
    }

    expect(await processDueBroadcasts(Timestamp.now(), 10, 1)).toBe(10);
    // A próxima execução continua de onde parou.
    expect(await processDueBroadcasts(Timestamp.now(), 10, 10)).toBe(15);
  });
});
