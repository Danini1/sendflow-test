import {HttpsError, type CallableRequest} from "firebase-functions/v2/https";

/** UID autenticado: única fonte do ownerId (nunca vem de request.data). */
export function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  return uid;
}
