import {z} from "zod";
import {documentIdSchema} from "../../shared/validation";
import type {DeleteConnectionRequest} from "./connection.types";

export const deleteConnectionSchema: z.ZodType<DeleteConnectionRequest> =
  z.object({connectionId: documentIdSchema});
