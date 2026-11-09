import {onCall} from "firebase-functions/v2/https";
import {requireUid} from "../../shared/auth";
import {parseRequest} from "../../shared/validation";
import {deleteConnectionCascade} from "./connection.service";
import {deleteConnectionSchema} from "./connection.validators";

export const deleteConnection = onCall(async (request) => {
  const ownerId = requireUid(request);
  const {connectionId} = parseRequest(deleteConnectionSchema, request.data);

  await deleteConnectionCascade(ownerId, connectionId);

  return {deleted: true};
});
