import type { Timestamp } from 'firebase/firestore';

/** Documento da collection `users`. O ID do documento é o UID do Firebase Auth. */
export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
