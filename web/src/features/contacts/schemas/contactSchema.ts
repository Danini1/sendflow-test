import { z } from 'zod';
import { isValidPhone } from '../utils/phone';

export const CONTACT_NAME_MAX = 80;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(CONTACT_NAME_MAX, `O nome deve ter no máximo ${CONTACT_NAME_MAX} caracteres.`)
    .regex(/\p{L}/u, 'O nome deve conter letras.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Informe o telefone.')
    .refine(
      isValidPhone,
      'Telefone inválido. Informe DDD + número: celular com 9 dígitos ou fixo com 8.',
    ),
});

export type ContactInput = z.infer<typeof contactSchema>;
