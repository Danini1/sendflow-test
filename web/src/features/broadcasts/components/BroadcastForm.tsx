import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { DisabledReason } from '../../../components/common/DisabledReason';
import { getErrorMessage } from '../../../lib/firebase/errors';
import type { Connection } from '../../connections/types/connection';
import { useContacts } from '../../contacts/hooks/useContacts';
import { formatPhone } from '../../contacts/utils/phone';
import {
  MAX_CONTACTS_PER_BROADCAST,
  MAX_MESSAGE_LENGTH,
  MAX_SCHEDULE_DAYS,
  broadcastFormSchema,
  type BroadcastFormValues,
} from '../schemas/broadcastSchema';
import type { Broadcast } from '../types/broadcast';
import { toDateTimeLocalValue } from '../utils/schedule';

type BroadcastFormProps = {
  /** Broadcast em edição; `null` para criar um novo. */
  broadcast: Broadcast | null;
  connections: Connection[];
  onSubmit: (values: BroadcastFormValues) => Promise<void>;
  onClose: () => void;
};

function getDefaultValues(
  broadcast: Broadcast | null,
  defaultConnectionId: string,
): BroadcastFormValues {
  if (!broadcast) {
    return {
      connectionId: defaultConnectionId,
      contactIds: [],
      message: '',
      sendMode: 'now',
      scheduledAt: '',
    };
  }

  const isScheduled = broadcast.status === 'scheduled' && broadcast.scheduledAt;

  return {
    connectionId: broadcast.connectionId,
    contactIds: broadcast.contactIds,
    message: broadcast.message,
    sendMode: isScheduled ? 'schedule' : 'now',
    scheduledAt: isScheduled
      ? toDateTimeLocalValue(broadcast.scheduledAt!.toDate())
      : '',
  };
}

/** Renderize apenas enquanto o diálogo estiver aberto (o estado é reiniciado a cada abertura). */
export function BroadcastForm({
  broadcast,
  connections,
  onSubmit,
  onClose,
}: BroadcastFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [submitError, setSubmitError] = useState<string | null>(null);
  // Limites do campo de data, fixados na abertura do formulário.
  const [scheduleBounds] = useState(() => {
    const now = Date.now();
    return {
      min: toDateTimeLocalValue(new Date(now + 60_000)),
      max: toDateTimeLocalValue(new Date(now + MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000)),
    };
  });

  const isEditing = broadcast !== null;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: getDefaultValues(broadcast, connections[0]?.id ?? ''),
  });

  const connectionId = useWatch({ control, name: 'connectionId' });
  const sendMode = useWatch({ control, name: 'sendMode' });
  const message = useWatch({ control, name: 'message' });
  const selectedIds = useWatch({ control, name: 'contactIds' });

  const { contacts, loading: loadingContacts, error: contactsError } =
    useContacts(connectionId || undefined);

  const removedCount = loadingContacts
    ? 0
    : selectedIds.filter((id) => !contacts.some((c) => c.id === id)).length;

  const submit = handleSubmit(async (values) => {
    const validIds = values.contactIds.filter((id) =>
      contacts.some((contact) => contact.id === id),
    );

    if (validIds.length === 0) {
      setError('contactIds', { message: 'Selecione pelo menos um contato.' });
      return;
    }

    setSubmitError(null);

    try {
      await onSubmit({ ...values, contactIds: validIds });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
    >
      <form onSubmit={submit} noValidate>
        <DialogTitle>{isEditing ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-3">
          {submitError && <Alert severity="error">{submitError}</Alert>}
          {contactsError && <Alert severity="error">{contactsError}</Alert>}

          <Controller
            name="connectionId"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Conexão"
                required
                disabled={isEditing}
                error={Boolean(errors.connectionId)}
                helperText={
                  errors.connectionId?.message ??
                  (isEditing ? 'A conexão de uma mensagem não pode ser alterada.' : undefined)
                }
                {...field}
                onChange={(event) => {
                  field.onChange(event);
                  setValue('contactIds', []);
                }}
              >
                {connections.map((connection) => (
                  <MenuItem key={connection.id} value={connection.id}>
                    {connection.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="contactIds"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={contacts}
                  loading={loadingContacts}
                  loadingText="Carregando contatos..."
                  noOptionsText="Nenhum contato nesta conexão."
                  getOptionLabel={(contact) => `${contact.name} (${formatPhone(contact.phone)})`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={contacts.filter((c) => field.value.includes(c.id))}
                  onChange={(_, selected) => field.onChange(selected.map((c) => c.id))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Contatos"
                      required
                      error={Boolean(errors.contactIds)}
                      helperText={
                        errors.contactIds?.message ??
                        `${selectedIds.length} selecionado(s) (máximo ${MAX_CONTACTS_PER_BROADCAST}).`
                      }
                    />
                  )}
                />
                {!isEditing && contacts.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    className="self-start"
                    onClick={() =>
                      setValue(
                        'contactIds',
                        contacts.slice(0, MAX_CONTACTS_PER_BROADCAST).map((c) => c.id),
                        { shouldValidate: true },
                      )
                    }
                  >
                    Selecionar todos
                  </Button>
                )}
              </div>
            )}
          />

          {removedCount > 0 && (
            <Alert severity="warning">
              {removedCount} contato(s) desta mensagem foram excluídos e serão
              desconsiderados ao salvar.
            </Alert>
          )}

          <TextField
            label="Mensagem"
            multiline
            minRows={4}
            required
            error={Boolean(errors.message)}
            helperText={
              errors.message?.message ?? `${message.length}/${MAX_MESSAGE_LENGTH}`
            }
            slotProps={{ htmlInput: { maxLength: MAX_MESSAGE_LENGTH } }}
            {...register('message')}
          />

          <Controller
            name="sendMode"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel id="send-mode-label">Envio</FormLabel>
                <RadioGroup row aria-labelledby="send-mode-label" {...field}>
                  <FormControlLabel value="now" control={<Radio />} label="Enviar agora" />
                  <FormControlLabel value="schedule" control={<Radio />} label="Agendar" />
                </RadioGroup>
              </FormControl>
            )}
          />

          {sendMode === 'schedule' && (
            <TextField
              label="Data e hora do envio"
              type="datetime-local"
              required
              error={Boolean(errors.scheduledAt)}
              helperText={
                errors.scheduledAt?.message ?? 'No seu horário local, até 1 ano à frente.'
              }
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: scheduleBounds.min, max: scheduleBounds.max },
              }}
              {...register('scheduledAt')}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <DisabledReason
            reason={
              loadingContacts && !isSubmitting
                ? 'Aguarde o carregamento dos contatos.'
                : undefined
            }
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || loadingContacts}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
            >
              {isEditing
                ? 'Salvar mensagem'
                : sendMode === 'schedule'
                  ? 'Agendar mensagem'
                  : 'Enviar mensagem'}
            </Button>
          </DisabledReason>
        </DialogActions>
      </form>
    </Dialog>
  );
}
