import type { Timestamp } from 'firebase/firestore';

/** Documento da collection `connections`. */
export type Connection = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** O ownerId nunca vem do formulário: é obtido do usuário autenticado. */
export type CreateConnectionDTO = {
  name: string;
};

export type UpdateConnectionDTO = {
  name: string;
};
