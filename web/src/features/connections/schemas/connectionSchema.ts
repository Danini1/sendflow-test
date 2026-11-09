import { z } from 'zod';

export const CONNECTION_NAME_MAX = 60;

export const connectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(
      CONNECTION_NAME_MAX,
      `O nome deve ter no máximo ${CONNECTION_NAME_MAX} caracteres.`,
    )
    .regex(/[\p{L}\p{N}]/u, 'O nome deve conter letras ou números.'),
});

export type ConnectionFormValues = z.infer<typeof connectionSchema>;
