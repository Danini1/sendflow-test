import {HttpsError} from "firebase-functions/v2/https";
import type {DocumentSnapshot} from "firebase-admin/firestore";

import {db} from "../../config/firebaseAdmin";
import {chunk} from "../../shared/chunk";
import {COLLECTIONS} from "../../shared/constants";
import type {ConnectionDoc} from "./connection.types";

const BATCH_SIZE = 400;

export async function getOwnedConnection(
  ownerId: string,
  connectionId: string,
): Promise<DocumentSnapshot<ConnectionDoc>> {
  const snapshot = await db
    .collection(COLLECTIONS.connections)
    .doc(connectionId)
    .get() as DocumentSnapshot<ConnectionDoc>;

  if (!snapshot.exists || snapshot.data()?.ownerId !== ownerId) {
    throw new HttpsError("not-found", "Conexão não encontrada.");
  }

  return snapshot;
}

export async function deleteConnectionCascade(
  ownerId: string,
  connectionId: string,
): Promise<void> {
  const connection = await getOwnedConnection(ownerId, connectionId);

  for (const collectionName of [COLLECTIONS.broadcasts, COLLECTIONS.contacts]) {
    const dependents = await db
      .collection(collectionName)
      .where("ownerId", "==", ownerId)
      .where("connectionId", "==", connectionId)
      .get();

    for (const refs of chunk(dependents.docs.map((d) => d.ref), BATCH_SIZE)) {
      const batch = db.batch();
      refs.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  }

  await connection.ref.delete();
}
