import type {FieldValue, Timestamp} from "firebase-admin/firestore";

export type BroadcastStatus = "scheduled" | "sent";

/** Documento da collection `broadcasts` */
export interface BroadcastDoc {
  ownerId: string;
  connectionId: string;
  contactIds: string[];
  message: string;
  status: BroadcastStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Dados gravados na criação: timestamps resolvidos pelo servidor. */
export interface BroadcastCreateData
  extends Omit<BroadcastDoc, "sentAt" | "createdAt" | "updatedAt"> {
  sentAt: Timestamp | FieldValue | null;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

/** Payload da callable `createBroadcast`. O ownerId vem de `request.auth`. */
export interface CreateBroadcastRequest {
  connectionId: string;
  contactIds: string[];
  message: string;
  scheduledAtMillis?: number | null;
}

/** Payload da callable `updateBroadcast`. */
export interface UpdateBroadcastRequest extends CreateBroadcastRequest {
  broadcastId: string;
}

export interface BroadcastResult {
  broadcastId: string;
  status: BroadcastStatus;
}
