import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  CONTACT_NAME_MAX,
  contactSchema,
  type ContactInput,
} from '../schemas/contactSchema';
import type { Contact } from '../types/contact';
import { formatPhone, maskPhoneInput } from '../utils/phone';

type ContactFormProps = {
  contact: Contact | null;
  onSubmit: (values: ContactInput) => Promise<void>;
  onClose: () => void;
};

export function ContactForm({ contact, onSubmit, onClose }: ContactFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = contact !== null;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name ?? '',
      phone: contact ? formatPhone(contact.phone) : '',
    },
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
        <DialogTitle>{isEditing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-3">
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            label="Nome"
            autoFocus
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            slotProps={{ htmlInput: { maxLength: CONTACT_NAME_MAX } }}
            {...register('name')}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                label="Telefone"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                required
                placeholder="(11) 99999-9999"
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message ?? 'DDD + número (celular ou fixo).'}
                {...field}
                onChange={(event) => field.onChange(maskPhoneInput(event.target.value))}
              />
            )}
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
            {isEditing ? 'Salvar contato' : 'Criar contato'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
