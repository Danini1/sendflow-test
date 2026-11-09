import type { Timestamp } from 'firebase/firestore';

/** Documento da collection `contacts`. */
export type Contact = {
  id: string;
  ownerId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** O ownerId nunca vem do formulário: é obtido do usuário autenticado. */
export type ContactFormValues = {
  connectionId: string;
  name: string;
  phone: string;
};
