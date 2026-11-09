import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';

import { AuthCard } from '../components/AuthCard';
import {
  EMAIL_MAX,
  NAME_MAX,
  PASSWORD_MAX,
  registerSchema,
  type RegisterFormValues,
} from '../schemas/authSchemas';
import { registerUser } from '../services/authService';
import { getErrorMessage } from '../../../lib/firebase/errors';

export default function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await registerUser(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Cadastre-se para criar conexões, contatos e mensagens."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {submitError && <Alert severity="error">{submitError}</Alert>}

        <TextField
          label="Nome"
          autoComplete="name"
          required
          error={Boolean(errors.displayName)}
          helperText={errors.displayName?.message}
          slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
          {...register('displayName')}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          slotProps={{ htmlInput: { maxLength: EMAIL_MAX } }}
          {...register('email')}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          required
          error={Boolean(errors.password)}
          helperText={
            errors.password?.message ?? 'Mínimo de 8 caracteres, com letras e números.'
          }
          slotProps={{ htmlInput: { maxLength: PASSWORD_MAX } }}
          {...register('password')}
        />
        <TextField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          required
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          slotProps={{ htmlInput: { maxLength: PASSWORD_MAX } }}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </AuthCard>
  );
}
