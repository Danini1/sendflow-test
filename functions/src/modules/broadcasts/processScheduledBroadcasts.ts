import {logger} from "firebase-functions/v2";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {Timestamp} from "firebase-admin/firestore";
import {processDueBroadcasts} from "./broadcast.scheduler";

export const processScheduledBroadcasts = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Etc/UTC",
    timeoutSeconds: 120,
    retryCount: 0,
  },
  async () => {
    const processed = await processDueBroadcasts(Timestamp.now());
    logger.info("Broadcasts agendados processados.", {processed});
  },
);
