import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '../../../lib/firebase/client';
import { requireUid } from '../../../lib/firebase/currentUser';
import { docToModel } from '../../../lib/firebase/mapDoc';
import type {
  Broadcast,
  BroadcastResult,
  BroadcastStatusFilter,
  CreateBroadcastInput,
  UpdateBroadcastInput,
} from '../types/broadcast';

const MAX_LISTED_BROADCASTS = 200;

const createBroadcastCallable = httpsCallable<CreateBroadcastInput, BroadcastResult>(
  functions,
  'createBroadcast',
);
const updateBroadcastCallable = httpsCallable<UpdateBroadcastInput, BroadcastResult>(
  functions,
  'updateBroadcast',
);

/** Envio imediato (`scheduledAtMillis: null`) ou agendado. */
export async function createBroadcast(
  input: CreateBroadcastInput,
): Promise<BroadcastResult> {
  const response = await createBroadcastCallable(input);
  return response.data;
}

export async function updateBroadcast(
  input: UpdateBroadcastInput,
): Promise<BroadcastResult> {
  const response = await updateBroadcastCallable(input);
  return response.data;
}

/** Exclusão direta: as Security Rules só permitem ao dono do documento. */
export async function deleteBroadcast(broadcastId: string) {
  return deleteDoc(doc(db, 'broadcasts', broadcastId));
}

/** A ordem dos filtros acompanha os índices de firestore.indexes.json. */
export function subscribeBroadcasts(
  statusFilter: BroadcastStatusFilter,
  connectionId: string | null,
  onData: (broadcasts: Broadcast[]) => void,
  onError: (error: unknown) => void,
) {
  const constraints: QueryConstraint[] = [where('ownerId', '==', requireUid())];

  if (connectionId) {
    constraints.push(where('connectionId', '==', connectionId));
  }

  if (statusFilter !== 'all') {
    constraints.push(where('status', '==', statusFilter));
  }

  constraints.push(orderBy('createdAt', 'desc'), limit(MAX_LISTED_BROADCASTS));

  return onSnapshot(
    query(collection(db, 'broadcasts'), ...constraints),
    (snapshot) => onData(snapshot.docs.map((d) => docToModel<Broadcast>(d))),
    onError,
  );
}
