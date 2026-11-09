import { z } from 'zod';

export const EMAIL_MAX = 254;
export const NAME_MAX = 80;
export const PASSWORD_MAX = 128;

const email = z
  .string()
  .trim()
  .max(EMAIL_MAX, 'E-mail muito longo.')
  .pipe(z.email('Informe um e-mail válido.'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .max(NAME_MAX, `O nome deve ter no máximo ${NAME_MAX} caracteres.`)
      .regex(/\p{L}/u, 'O nome deve conter letras.'),
    email,
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .max(PASSWORD_MAX, `A senha deve ter no máximo ${PASSWORD_MAX} caracteres.`)
      .regex(/\p{L}/u, 'A senha deve conter pelo menos uma letra.')
      .regex(/\d/, 'A senha deve conter pelo menos um número.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
