import { auth } from './client';

/** Única fonte do ownerId no frontend. */
export function requireUid(): string {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error('Usuário não autenticado.');
  }

  return uid;
}
