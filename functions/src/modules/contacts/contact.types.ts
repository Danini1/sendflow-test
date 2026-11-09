import type {Timestamp} from "firebase-admin/firestore";

/** Documento da collection `contacts` */
export interface ContactDoc {
  ownerId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
