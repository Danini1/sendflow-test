import type {Timestamp} from "firebase-admin/firestore";

/** Documento da collection `connections` */
export interface ConnectionDoc {
  ownerId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Payload da callable `deleteConnection` (exclusão em cascata). */
export interface DeleteConnectionRequest {
  connectionId: string;
}
