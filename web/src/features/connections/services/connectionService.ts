import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '../../../lib/firebase/client';
import { requireUid } from '../../../lib/firebase/currentUser';
import { docToModel } from '../../../lib/firebase/mapDoc';
import type {
  Connection,
  CreateConnectionDTO,
  UpdateConnectionDTO,
} from '../types/connection';

const MAX_LISTED_CONNECTIONS = 200;

const deleteConnectionCallable = httpsCallable<
  { connectionId: string },
  { deleted: boolean }
>(functions, 'deleteConnection');

/** O ownerId é sempre o UID do usuário autenticado. */
export async function createConnection(input: CreateConnectionDTO) {
  return addDoc(collection(db, 'connections'), {
    ownerId: requireUid(),
    name: input.name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateConnection(
  connectionId: string,
  input: UpdateConnectionDTO,
) {
  return updateDoc(doc(db, 'connections', connectionId), {
    name: input.name.trim(),
    updatedAt: serverTimestamp(),
  });
}

/** Via Cloud Function: exclui em cascata contatos e mensagens. */
export async function deleteConnection(connectionId: string) {
  await deleteConnectionCallable({ connectionId });
}

/** Assina a lista de connections do usuário. Retorna a função de cancelamento. */
export function subscribeConnections(
  onData: (connections: Connection[]) => void,
  onError: (error: unknown) => void,
) {
  const connectionsQuery = query(
    collection(db, 'connections'),
    where('ownerId', '==', requireUid()),
    orderBy('createdAt', 'desc'),
    limit(MAX_LISTED_CONNECTIONS),
  );

  return onSnapshot(
    connectionsQuery,
    (snapshot) => onData(snapshot.docs.map((d) => docToModel<Connection>(d))),
    onError,
  );
}
