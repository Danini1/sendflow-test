import {HttpsError} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";

import {db} from "../../config/firebaseAdmin";
import {COLLECTIONS} from "../../shared/constants";
import {getOwnedConnection} from "../connections/connection.service";
import type {ContactDoc} from "../contacts/contact.types";
import type {
  BroadcastCreateData,
  BroadcastDoc,
  BroadcastResult,
  CreateBroadcastRequest,
  UpdateBroadcastRequest,
} from "./broadcast.types";
import {MAX_SCHEDULE_DAYS} from "./broadcast.validators";

const DAY_MS = 24 * 60 * 60 * 1000;

export function resolveSchedule(
  scheduledAtMillis: number | null | undefined,
  nowMillis: number,
): Timestamp | null {
  if (scheduledAtMillis === null || scheduledAtMillis === undefined) {
    return null;
  }

  if (scheduledAtMillis <= nowMillis) {
    throw new HttpsError(
      "invalid-argument",
      "A data de agendamento deve estar no futuro.",
    );
  }

  if (scheduledAtMillis > nowMillis + MAX_SCHEDULE_DAYS * DAY_MS) {
    throw new HttpsError(
      "invalid-argument",
      "O agendamento pode ser de no máximo 1 ano.",
    );
  }

  return Timestamp.fromMillis(scheduledAtMillis);
}

export async function assertContactsBelongToConnection(
  ownerId: string,
  connectionId: string,
  contactIds: string[],
): Promise<void> {
  const refs = contactIds.map((id) =>
    db.collection(COLLECTIONS.contacts).doc(id),
  );
  const snapshots = await db.getAll(...refs);

  for (const snapshot of snapshots) {
    const contact = snapshot.data() as ContactDoc | undefined;

    if (!snapshot.exists || !contact || contact.ownerId !== ownerId) {
      throw new HttpsError("not-found", "Contato não encontrado.");
    }

    if (contact.connectionId !== connectionId) {
      throw new HttpsError(
        "invalid-argument",
        "Contato não pertence a esta conexão.",
      );
    }
  }
}


export async function createBroadcastForOwner(
  ownerId: string,
  request: CreateBroadcastRequest,
): Promise<BroadcastResult> {
  await getOwnedConnection(ownerId, request.connectionId);
  await assertContactsBelongToConnection(
    ownerId,
    request.connectionId,
    request.contactIds,
  );

  const scheduledAt = resolveSchedule(request.scheduledAtMillis, Date.now());
  const status = scheduledAt ? "scheduled" : "sent";

  const data: BroadcastCreateData = {
    ownerId,
    connectionId: request.connectionId,
    contactIds: request.contactIds,
    message: request.message,
    status,
    scheduledAt,
    // O envio é simulado: não há integração externa que possa falhar.
    sentAt: scheduledAt ? null : FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const ref = db.collection(COLLECTIONS.broadcasts).doc();
  await ref.set(data);

  return {broadcastId: ref.id, status};
}

export async function updateBroadcastForOwner(
  ownerId: string,
  request: UpdateBroadcastRequest,
): Promise<BroadcastResult> {
  const ref = db.collection(COLLECTIONS.broadcasts).doc(request.broadcastId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.data() as BroadcastDoc | undefined;

    if (!snapshot.exists || !existing || existing.ownerId !== ownerId) {
      throw new HttpsError("not-found", "Mensagem não encontrada.");
    }

    if (existing.status === "sent") {
      throw new HttpsError(
        "failed-precondition",
        "Mensagens já enviadas não podem ser editadas.",
      );
    }

    if (existing.connectionId !== request.connectionId) {
      throw new HttpsError(
        "invalid-argument",
        "A conexão de uma mensagem não pode ser alterada.",
      );
    }

    await assertContactsBelongToConnection(
      ownerId,
      existing.connectionId,
      request.contactIds,
    );

    const scheduledAt = resolveSchedule(request.scheduledAtMillis, Date.now());
    const changes: Record<string, unknown> = {
      contactIds: request.contactIds,
      message: request.message,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (scheduledAt) {
      changes.scheduledAt = scheduledAt;
    } else {
      changes.status = "sent";
      changes.scheduledAt = null;
      changes.sentAt = FieldValue.serverTimestamp();
    }

    transaction.update(ref, changes);

    return {
      broadcastId: request.broadcastId,
      status: scheduledAt ? "scheduled" : "sent",
    };
  });
}
