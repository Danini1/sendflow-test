import { beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore } from './helpers';
import {
  ALICE,
  BOB,
  HOUR,
  seedBroadcast,
  seedConnection,
  seedContact,
} from './fixtures';
import { db } from '../../functions/src/config/firebaseAdmin';
import {
  createBroadcastForOwner,
  resolveSchedule,
  updateBroadcastForOwner,
} from '../../functions/src/modules/broadcasts/broadcast.service';
import {
  createBroadcastSchema,
  updateBroadcastSchema,
} from '../../functions/src/modules/broadcasts/broadcast.validators';

const baseRequest = {
  connectionId: 'c1',
  contactIds: ['k1', 'k2'],
  message: 'Olá, tudo bem?',
};

async function getBroadcast(id: string) {
  const snapshot = await db.doc(`broadcasts/${id}`).get();
  return snapshot.data();
}

beforeEach(async () => {
  await clearFirestore();
  await seedConnection('c1', ALICE);
  await seedConnection('c2', ALICE);
  await seedConnection('cb', BOB);
  await seedContact('k1', ALICE, 'c1');
  await seedContact('k2', ALICE, 'c1');
  await seedContact('k-other-conn', ALICE, 'c2');
  await seedContact('kb', BOB, 'cb');
});

describe('resolveSchedule', () => {
  it('retorna null quando não há horário (envio imediato)', () => {
    expect(resolveSchedule(null, 1000)).toBeNull();
    expect(resolveSchedule(undefined, 1000)).toBeNull();
  });

  it('converte horários futuros e recusa passado ou presente', () => {
    expect(resolveSchedule(2000, 1000)?.toMillis()).toBe(2000);
    expect(() => resolveSchedule(1000, 1000)).toThrow();
    expect(() => resolveSchedule(500, 1000)).toThrow();
  });

  it('aceita até 1 ano à frente e recusa além disso', () => {
    const now = Date.now();
    const year = 365 * 24 * HOUR;
    expect(resolveSchedule(now + year, now)?.toMillis()).toBe(now + year);
    expect(() => resolveSchedule(now + year + 1, now)).toThrow(/1 ano/);
  });
});

describe('validators', () => {
  it('rejeitam payloads inválidos', () => {
    const invalid = [
      { ...baseRequest, message: '   ' },
      { ...baseRequest, contactIds: [] },
      { ...baseRequest, contactIds: ['k1', 'k1'] },
      { ...baseRequest, connectionId: 'a/b' },
      { ...baseRequest, scheduledAtMillis: 'amanhã' },
      { ...baseRequest, message: 'x'.repeat(1001) },
      { connectionId: 'c1' },
    ];
    for (const payload of invalid) {
      expect(createBroadcastSchema.safeParse(payload).success).toBe(false);
    }
  });

  it('aceitam envio imediato e agendado, e exigem broadcastId na edição', () => {
    expect(createBroadcastSchema.safeParse(baseRequest).success).toBe(true);
    expect(
      createBroadcastSchema.safeParse({ ...baseRequest, scheduledAtMillis: null }).success,
    ).toBe(true);
    expect(updateBroadcastSchema.safeParse(baseRequest).success).toBe(false);
    expect(
      updateBroadcastSchema.safeParse({ ...baseRequest, broadcastId: 'b1' }).success,
    ).toBe(true);
  });
});

describe('createBroadcastForOwner', () => {
  it('envio imediato: nasce como sent, com sentAt e ownerId do usuário autenticado', async () => {
    const result = await createBroadcastForOwner(ALICE, baseRequest);

    expect(result.status).toBe('sent');
    const data = await getBroadcast(result.broadcastId);
    expect(data).toMatchObject({
      ownerId: ALICE,
      connectionId: 'c1',
      contactIds: ['k1', 'k2'],
      message: 'Olá, tudo bem?',
      status: 'sent',
      scheduledAt: null,
    });
    expect(data?.sentAt).not.toBeNull();
    expect(data?.createdAt).toBeDefined();
    // Sem snapshot de contatos dentro do broadcast.
    expect(data).not.toHaveProperty('recipientsSnapshot');
  });

  it('agendado: nasce como scheduled, sem sentAt', async () => {
    const at = Date.now() + HOUR;
    const result = await createBroadcastForOwner(ALICE, {
      ...baseRequest,
      scheduledAtMillis: at,
    });

    expect(result.status).toBe('scheduled');
    const data = await getBroadcast(result.broadcastId);
    expect(data?.status).toBe('scheduled');
    expect(data?.scheduledAt.toMillis()).toBe(at);
    expect(data?.sentAt).toBeNull();
  });

  it('recusa data de agendamento no passado', async () => {
    await expect(
      createBroadcastForOwner(ALICE, {
        ...baseRequest,
        scheduledAtMillis: Date.now() - 1000,
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('recusa connection de outro tenant ou inexistente, sem criar nada', async () => {
    await expect(
      createBroadcastForOwner(BOB, baseRequest),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      createBroadcastForOwner(ALICE, { ...baseRequest, connectionId: 'nada' }),
    ).rejects.toMatchObject({ code: 'not-found' });

    expect((await db.collection('broadcasts').get()).size).toBe(0);
  });

  it('recusa contatos de outro tenant, inexistentes ou de outra connection', async () => {
    await expect(
      createBroadcastForOwner(ALICE, { ...baseRequest, contactIds: ['k1', 'kb'] }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      createBroadcastForOwner(ALICE, { ...baseRequest, contactIds: ['nada'] }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      createBroadcastForOwner(ALICE, {
        ...baseRequest,
        contactIds: ['k1', 'k-other-conn'],
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });

    expect((await db.collection('broadcasts').get()).size).toBe(0);
  });
});

describe('updateBroadcastForOwner', () => {
  it('scheduled: atualiza mensagem, contatos e horário mantendo o status', async () => {
    await seedBroadcast('b1', {});
    const at = Date.now() + 2 * HOUR;

    const result = await updateBroadcastForOwner(ALICE, {
      ...baseRequest,
      message: 'Nova mensagem',
      contactIds: ['k2'],
      scheduledAtMillis: at,
      broadcastId: 'b1',
    });

    expect(result.status).toBe('scheduled');
    const data = await getBroadcast('b1');
    expect(data).toMatchObject({ message: 'Nova mensagem', contactIds: ['k2'] });
    expect(data?.scheduledAt.toMillis()).toBe(at);
    expect(data?.sentAt).toBeNull();
  });

  it('scheduled sem horário: passa a ser enviado agora', async () => {
    await seedBroadcast('b1', {});

    const result = await updateBroadcastForOwner(ALICE, {
      ...baseRequest,
      broadcastId: 'b1',
    });

    expect(result.status).toBe('sent');
    const data = await getBroadcast('b1');
    expect(data?.status).toBe('sent');
    expect(data?.scheduledAt).toBeNull();
    expect(data?.sentAt).not.toBeNull();
  });

  it('scheduled com horário no passado é recusado', async () => {
    await seedBroadcast('b1', {});

    await expect(
      updateBroadcastForOwner(ALICE, {
        ...baseRequest,
        scheduledAtMillis: Date.now() - 1000,
        broadcastId: 'b1',
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('recusa editar mensagem já enviada, sem alterá-la', async () => {
    const { Timestamp } = await import('firebase-admin/firestore');
    const sentAt = Timestamp.fromMillis(Date.now() - HOUR);
    await seedBroadcast('b1', { status: 'sent', scheduledAt: null, sentAt });

    await expect(
      updateBroadcastForOwner(ALICE, {
        ...baseRequest,
        message: 'Corrigida',
        scheduledAtMillis: Date.now() + HOUR,
        broadcastId: 'b1',
      }),
    ).rejects.toMatchObject({ code: 'failed-precondition' });

    const data = await getBroadcast('b1');
    expect(data?.message).toBe('Olá');
    expect(data?.status).toBe('sent');
    expect(data?.scheduledAt).toBeNull();
    expect(data?.sentAt.toMillis()).toBe(sentAt.toMillis());
  });

  it('recusa editar o broadcast de outro tenant, sem alterá-lo', async () => {
    await seedBroadcast('b1', {});

    await expect(
      updateBroadcastForOwner(BOB, { ...baseRequest, connectionId: 'cb', broadcastId: 'b1' }),
    ).rejects.toMatchObject({ code: 'not-found' });
    expect((await getBroadcast('b1'))?.message).toBe('Olá');
  });

  it('recusa trocar a connection e contatos inválidos', async () => {
    await seedBroadcast('b1', {});

    await expect(
      updateBroadcastForOwner(ALICE, { ...baseRequest, connectionId: 'c2', broadcastId: 'b1' }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
    await expect(
      updateBroadcastForOwner(ALICE, {
        ...baseRequest,
        contactIds: ['kb'],
        broadcastId: 'b1',
      }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      updateBroadcastForOwner(ALICE, { ...baseRequest, broadcastId: 'nada' }),
    ).rejects.toMatchObject({ code: 'not-found' });
  });
});
