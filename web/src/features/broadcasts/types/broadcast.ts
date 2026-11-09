import type { Timestamp } from 'firebase/firestore';

export type BroadcastStatus = 'scheduled' | 'sent';

/** Documento da collection `broadcasts`. Contatos são referenciados só por ID. */
export type Broadcast = {
  id: string;
  ownerId: string;
  connectionId: string;
  contactIds: string[];
  message: string;
  status: BroadcastStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** Filtro da listagem de broadcasts. */
export type BroadcastStatusFilter = BroadcastStatus | 'all';

/** Payload da callable `createBroadcast`. `null` significa envio imediato. */
export type CreateBroadcastInput = {
  connectionId: string;
  contactIds: string[];
  message: string;
  scheduledAtMillis: number | null;
};

/** Payload da callable `updateBroadcast`. */
export type UpdateBroadcastInput = CreateBroadcastInput & {
  broadcastId: string;
};

export type BroadcastResult = {
  broadcastId: string;
  status: BroadcastStatus;
};
