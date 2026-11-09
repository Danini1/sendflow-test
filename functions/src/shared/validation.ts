import {HttpsError} from "firebase-functions/v2/https";
import {z} from "zod";

/** ID de documento do Firestore (sem barras). */
export const documentIdSchema = z
  .string()
  .min(1, "ID inválido.")
  .max(200, "ID inválido.")
  .regex(/^[^/]+$/, "ID inválido.");

/** Valida o payload da callable e converte falhas em HttpsError. */
export function parseRequest<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Dados inválidos.";
    throw new HttpsError("invalid-argument", message);
  }

  return result.data;
}
