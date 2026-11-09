import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { getErrorMessage } from '../../../lib/firebase/errors';
import {
  CONNECTION_NAME_MAX,
  connectionSchema,
  type ConnectionFormValues,
} from '../schemas/connectionSchema';
import type { Connection } from '../types/connection';

type ConnectionFormProps = {
  /** Connection em edição; `null` para criar uma nova. */
  connection: Connection | null;
  onSubmit: (values: ConnectionFormValues) => Promise<void>;
  onClose: () => void;
};

/** Renderize apenas enquanto o diálogo estiver aberto (o estado é reiniciado a cada abertura). */
export function ConnectionForm({
  connection,
  onSubmit,
  onClose,
}: ConnectionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = connection !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: { name: connection?.name ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <Dialog open onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle>{isEditing ? 'Editar conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-3">
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            label="Nome da conexão"
            autoFocus
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            slotProps={{ htmlInput: { maxLength: CONNECTION_NAME_MAX } }}
            {...register('name')}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          >
            {isEditing ? 'Salvar conexão' : 'Criar conexão'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
