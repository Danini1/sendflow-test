import {logger} from "firebase-functions/v2";
import type {DocumentReference, Timestamp} from "firebase-admin/firestore";
import {FieldValue} from "firebase-admin/firestore";

import {db} from "../../config/firebaseAdmin";
import {COLLECTIONS} from "../../shared/constants";
import type {BroadcastDoc} from "./broadcast.types";

export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_MAX_BATCHES = 10;

async function markAsSent(
  ref: DocumentReference,
  now: Timestamp,
): Promise<boolean> {
  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const broadcast = snapshot.data() as BroadcastDoc | undefined;

      if (
        !snapshot.exists ||
        !broadcast ||
        broadcast.status !== "scheduled" ||
        !broadcast.scheduledAt ||
        broadcast.scheduledAt.toMillis() > now.toMillis()
      ) {
        return false;
      }

      transaction.update(ref, {
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return true;
    });
  } catch (error) {
    logger.error("Falha ao processar broadcast agendado.", {
      broadcastId: ref.id,
      error,
    });
    return false;
  }
}

export async function processDueBroadcasts(
  now: Timestamp,
  batchSize = DEFAULT_BATCH_SIZE,
  maxBatches = DEFAULT_MAX_BATCHES,
): Promise<number> {
  let processed = 0;

  for (let batch = 0; batch < maxBatches; batch++) {
    const due = await db
      .collection(COLLECTIONS.broadcasts)
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .orderBy("scheduledAt", "asc")
      .limit(batchSize)
      .get();

    if (due.empty) {
      break;
    }

    const results = await Promise.all(
      due.docs.map((doc) => markAsSent(doc.ref, now)),
    );
    processed += results.filter(Boolean).length;

    if (due.size < batchSize) {
      break;
    }
  }

  return processed;
}
