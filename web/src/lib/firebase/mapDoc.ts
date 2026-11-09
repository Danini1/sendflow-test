import type { QueryDocumentSnapshot } from 'firebase/firestore';

/** 'estimate' evita timestamps null em escritas locais ainda pendentes. */
export function docToModel<T extends { id: string }>(
  snapshot: QueryDocumentSnapshot,
): T {
  return {
    id: snapshot.id,
    ...snapshot.data({ serverTimestamps: 'estimate' }),
  } as T;
}
