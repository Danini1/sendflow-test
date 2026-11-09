import {onCall} from "firebase-functions/v2/https";
import {requireUid} from "../../shared/auth";
import {parseRequest} from "../../shared/validation";
import {createBroadcastForOwner} from "./broadcast.service";
import {createBroadcastSchema} from "./broadcast.validators";

export const createBroadcast = onCall(async (request) => {
  const ownerId = requireUid(request);
  const data = parseRequest(createBroadcastSchema, request.data);

  return createBroadcastForOwner(ownerId, data);
});
