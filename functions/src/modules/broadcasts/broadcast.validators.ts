import {z} from "zod";
import {documentIdSchema} from "../../shared/validation";
import type {
  CreateBroadcastRequest,
  UpdateBroadcastRequest,
} from "./broadcast.types";

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_CONTACTS_PER_BROADCAST = 100;
export const MAX_SCHEDULE_DAYS = 365;

const createBroadcastShape = {
  connectionId: documentIdSchema,
  contactIds: z
    .array(documentIdSchema)
    .min(1, "Selecione pelo menos um contato.")
    .max(
      MAX_CONTACTS_PER_BROADCAST,
      `Selecione no máximo ${MAX_CONTACTS_PER_BROADCAST} contatos.`,
    )
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Existem contatos duplicados.",
    ),
  message: z
    .string()
    .trim()
    .min(1, "A mensagem não pode estar vazia.")
    .max(
      MAX_MESSAGE_LENGTH,
      `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
    ),
  scheduledAtMillis: z
    .number("Data de agendamento inválida.")
    .finite("Data de agendamento inválida.")
    .nullish(),
};

export const createBroadcastSchema: z.ZodType<CreateBroadcastRequest> =
  z.object(createBroadcastShape);

export const updateBroadcastSchema: z.ZodType<UpdateBroadcastRequest> =
  z.object({
    ...createBroadcastShape,
    broadcastId: documentIdSchema,
  });
