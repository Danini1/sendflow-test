import {onCall} from "firebase-functions/v2/https";
import {requireUid} from "../../shared/auth";
import {parseRequest} from "../../shared/validation";
import {updateBroadcastForOwner} from "./broadcast.service";
import {updateBroadcastSchema} from "./broadcast.validators";

export const updateBroadcast = onCall(async (request) => {
  const ownerId = requireUid(request);
  const data = parseRequest(updateBroadcastSchema, request.data);

  return updateBroadcastForOwner(ownerId, data);
});
