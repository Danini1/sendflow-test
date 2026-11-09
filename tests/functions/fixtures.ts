import { Timestamp } from 'firebase-admin/firestore';

import { db } from '../../functions/src/config/firebaseAdmin';

export const ALICE = 'alice';
export const BOB = 'bob';

export const HOUR = 60 * 60 * 1000;

export const now = (): Timestamp => Timestamp.now();

export async function seedConnection(id: string, ownerId: string): Promise<void> {
  await db.doc(`connections/${id}`).set({
    ownerId,
    name: `Conexão ${id}`,
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function seedContact(
  id: string,
  ownerId: string,
  connectionId: string,
): Promise<void> {
  await db.doc(`contacts/${id}`).set({
    ownerId,
    connectionId,
    name: `Contato ${id}`,
    phone: '+5511999999999',
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function seedBroadcast(
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await db.doc(`broadcasts/${id}`).set({
    ownerId: ALICE,
    connectionId: 'c1',
    contactIds: ['k1'],
    message: 'Olá',
    status: 'scheduled',
    scheduledAt: Timestamp.fromMillis(Date.now() - HOUR),
    sentAt: null,
    createdAt: now(),
    updatedAt: now(),
    ...fields,
  });
}
