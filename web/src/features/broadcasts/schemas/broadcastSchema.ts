import { z } from 'zod';

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_CONTACTS_PER_BROADCAST = 100;
export const MAX_SCHEDULE_DAYS = 365;

const DAY_MS = 24 * 60 * 60 * 1000;

export const broadcastFormSchema = z
  .object({
    connectionId: z.string().min(1, 'Selecione uma conexão.'),
    contactIds: z
      .array(z.string())
      .min(1, 'Selecione pelo menos um contato.')
      .max(
        MAX_CONTACTS_PER_BROADCAST,
        `Selecione no máximo ${MAX_CONTACTS_PER_BROADCAST} contatos.`,
      ),
    message: z
      .string()
      .trim()
      .min(1, 'Escreva a mensagem.')
      .max(
        MAX_MESSAGE_LENGTH,
        `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
      ),
    sendMode: z.enum(['now', 'schedule']),
    // valor de <input type="datetime-local">, no horário local
    scheduledAt: z.string(),
  })
  .superRefine((values, context) => {
    if (values.sendMode !== 'schedule') return;

    const time = new Date(values.scheduledAt).getTime();

    if (!values.scheduledAt || Number.isNaN(time) || time <= Date.now()) {
      context.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'Escolha uma data e hora futuras.',
      });
    } else if (time > Date.now() + MAX_SCHEDULE_DAYS * DAY_MS) {
      context.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'O agendamento pode ser de no máximo 1 ano.',
      });
    }
  });

export type BroadcastFormValues = z.infer<typeof broadcastFormSchema>;
