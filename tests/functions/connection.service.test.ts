import { beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, now } from './helpers';
import { db } from '../../functions/src/config/firebaseAdmin';
import { deleteConnectionCascade } from '../../functions/src/modules/connections/connection.service';

const ALICE = 'alice';
const BOB = 'bob';

const connection = (ownerId: string, name = 'Loja') => ({
  ownerId,
  name,
  createdAt: now(),
  updatedAt: now(),
});

const contact = (ownerId: string, connectionId: string) => ({
  ownerId,
  connectionId,
  name: 'Maria',
  phone: '+5511999999999',
  createdAt: now(),
  updatedAt: now(),
});

const broadcast = (ownerId: string, connectionId: string) => ({
  ownerId,
  connectionId,
  contactIds: [],
  message: 'Olá',
  status: 'scheduled',
  scheduledAt: now(),
  sentAt: null,
  createdAt: now(),
  updatedAt: now(),
});

async function count(collection: string, connectionId: string): Promise<number> {
  const snapshot = await db
    .collection(collection)
    .where('connectionId', '==', connectionId)
    .get();
  return snapshot.size;
}

beforeEach(async () => {
  await clearFirestore();
});

describe('deleteConnectionCascade', () => {
  it('remove a connection, seus contatos e broadcasts, preservando o resto', async () => {
    await db.doc('connections/c1').set(connection(ALICE));
    await db.doc('connections/c2').set(connection(ALICE, 'Outra'));
    await db.doc('connections/cb').set(connection(BOB));
    await db.doc('contacts/k1').set(contact(ALICE, 'c1'));
    await db.doc('contacts/k2').set(contact(ALICE, 'c1'));
    await db.doc('contacts/k3').set(contact(ALICE, 'c2'));
    await db.doc('contacts/kb').set(contact(BOB, 'cb'));
    await db.doc('broadcasts/b1').set(broadcast(ALICE, 'c1'));
    await db.doc('broadcasts/b2').set(broadcast(ALICE, 'c2'));
    await db.doc('broadcasts/bb').set(broadcast(BOB, 'cb'));

    await deleteConnectionCascade(ALICE, 'c1');

    expect((await db.doc('connections/c1').get()).exists).toBe(false);
    expect(await count('contacts', 'c1')).toBe(0);
    expect(await count('broadcasts', 'c1')).toBe(0);

    // Dados da mesma dona em outra connection e de outro tenant continuam.
    expect((await db.doc('connections/c2').get()).exists).toBe(true);
    expect((await db.doc('contacts/k3').get()).exists).toBe(true);
    expect((await db.doc('broadcasts/b2').get()).exists).toBe(true);
    expect((await db.doc('connections/cb').get()).exists).toBe(true);
    expect((await db.doc('contacts/kb').get()).exists).toBe(true);
    expect((await db.doc('broadcasts/bb').get()).exists).toBe(true);
  });

  it('recusa excluir a connection de outro tenant sem apagar nada', async () => {
    await db.doc('connections/c1').set(connection(ALICE));
    await db.doc('contacts/k1').set(contact(ALICE, 'c1'));
    await db.doc('broadcasts/b1').set(broadcast(ALICE, 'c1'));

    await expect(deleteConnectionCascade(BOB, 'c1')).rejects.toMatchObject({
      code: 'not-found',
    });

    expect((await db.doc('connections/c1').get()).exists).toBe(true);
    expect(await count('contacts', 'c1')).toBe(1);
    expect(await count('broadcasts', 'c1')).toBe(1);
  });

  it('responde not-found para connection inexistente', async () => {
    await expect(deleteConnectionCascade(ALICE, 'nao-existe')).rejects.toMatchObject({
      code: 'not-found',
    });
  });

  it('exclui mais documentos do que cabe em um único batch', async () => {
    await db.doc('connections/c1').set(connection(ALICE));

    const total = 850;
    const writer = db.bulkWriter();
    for (let i = 0; i < total; i++) {
      void writer.set(db.doc(`contacts/k${i}`), contact(ALICE, 'c1'));
    }
    await writer.close();
    expect(await count('contacts', 'c1')).toBe(total);

    await deleteConnectionCascade(ALICE, 'c1');

    expect(await count('contacts', 'c1')).toBe(0);
    expect((await db.doc('connections/c1').get()).exists).toBe(false);
  });
});
