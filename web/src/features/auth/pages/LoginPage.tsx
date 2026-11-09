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
  loginSchema,
  type LoginFormValues,
} from '../schemas/authSchemas';
import { loginUser } from '../services/authService';
import { getErrorMessage } from '../../../lib/firebase/errors';

export default function LoginPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await loginUser(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <AuthCard
      title="Entrar no Sendflow"
      subtitle="Acesse sua conta para gerenciar suas mensagens."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/register">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {submitError && <Alert severity="error">{submitError}</Alert>}

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
          autoComplete="current-password"
          required
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  );
}
