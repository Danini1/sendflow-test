import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { DisabledReason } from '../../../components/common/DisabledReason';
import { EmptyState } from '../../../components/common/EmptyState';
import { FeedbackSnackbar } from '../../../components/common/FeedbackSnackbar';
import { PageHeader } from '../../../components/common/PageHeader';
import { useFeedback } from '../../../hooks/useFeedback';
import { getErrorMessage } from '../../../lib/firebase/errors';
import { ROUTES } from '../../../routes/paths';
import { useConnections } from '../../connections/hooks/useConnections';
import { BroadcastDetailsDialog } from '../components/BroadcastDetailsDialog';
import { BroadcastForm } from '../components/BroadcastForm';
import { BroadcastTable } from '../components/BroadcastTable';
import { useBroadcasts } from '../hooks/useBroadcasts';
import type { BroadcastFormValues } from '../schemas/broadcastSchema';
import {
  createBroadcast,
  deleteBroadcast,
  updateBroadcast,
} from '../services/broadcastService';
import type {
  Broadcast,
  BroadcastStatusFilter,
  CreateBroadcastInput,
} from '../types/broadcast';

/** `undefined` = formulário fechado; `null` = nova mensagem; objeto = edição. */
type FormTarget = Broadcast | null | undefined;

const FILTER_OPTIONS: { value: BroadcastStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'scheduled', label: 'Agendadas' },
  { value: 'sent', label: 'Enviadas' },
];

function toBroadcastInput(values: BroadcastFormValues): CreateBroadcastInput {
  return {
    connectionId: values.connectionId,
    contactIds: values.contactIds,
    message: values.message.trim(),
    scheduledAtMillis:
      values.sendMode === 'schedule' ? new Date(values.scheduledAt).getTime() : null,
  };
}

export default function BroadcastsPage() {
  const [statusFilter, setStatusFilter] = useState<BroadcastStatusFilter>('all');
  /** '' = todas as conexões. */
  const [connectionFilter, setConnectionFilter] = useState('');
  const { connections, loading: loadingConnections, error: connectionsError } =
    useConnections();

  // Se a conexão filtrada deixar de existir (ex.: foi excluída), volta para "Todas".
  const activeConnectionId = connections.some((c) => c.id === connectionFilter)
    ? connectionFilter
    : null;

  const { broadcasts, loading, error } = useBroadcasts(
    statusFilter,
    activeConnectionId,
  );
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [detailsTarget, setDetailsTarget] = useState<Broadcast | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Broadcast | null>(null);
  const [deleting, setDeleting] = useState(false);

  const connectionNames = useMemo(
    () => new Map(connections.map((c) => [c.id, c.name])),
    [connections],
  );

  const handleSubmit = async (values: BroadcastFormValues) => {
    const input = toBroadcastInput(values);

    if (formTarget) {
      await updateBroadcast({ ...input, broadcastId: formTarget.id });
      showSuccess('Mensagem atualizada.');
    } else {
      const result = await createBroadcast(input);
      showSuccess(
        result.status === 'sent'
          ? 'Mensagem enviada (simulação).'
          : 'Mensagem agendada.',
      );
    }
    setFormTarget(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteBroadcast(deleteTarget.id);
      showSuccess('Mensagem excluída.');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const hasConnections = connections.length > 0;

  const newBroadcastButton = (
    <DisabledReason
      reason={hasConnections ? undefined : 'Crie uma conexão antes de criar uma mensagem.'}
    >
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setFormTarget(null)}
        disabled={!hasConnections}
      >
        Nova mensagem
      </Button>
    </DisabledReason>
  );

  const pageError = error ?? connectionsError;
  const hasActiveFilters = statusFilter !== 'all' || activeConnectionId !== null;

  return (
    <>
      <PageHeader
        title="Mensagens"
        description="Envie mensagens agora ou agende para depois. O envio é simulado."
        actions={newBroadcastButton}
      />

      {pageError && (
        <Alert severity="error" className="mb-4">
          {pageError}
        </Alert>
      )}

      {!loadingConnections && !connectionsError && !hasConnections && (
        <EmptyState
          title="Crie uma conexão primeiro"
          description="As mensagens são enviadas aos contatos de uma conexão."
          action={
            <Button component={RouterLink} to={ROUTES.connections} variant="contained">
              Ir para conexões
            </Button>
          }
        />
      )}

      {hasConnections && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={statusFilter}
            onChange={(_, value: BroadcastStatusFilter | null) => {
              if (value) setStatusFilter(value);
            }}
            aria-label="Filtrar por status"
          >
            {FILTER_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            select
            label="Conexão"
            value={activeConnectionId ?? ''}
            onChange={(event) => setConnectionFilter(event.target.value)}
            className="sm:max-w-xs"
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="">Todas as conexões</MenuItem>
            {connections.map((connection) => (
              <MenuItem key={connection.id} value={connection.id}>
                {connection.name}
              </MenuItem>
            ))}
          </TextField>
        </div>
      )}

      {hasConnections && loading && (
        <div className="flex justify-center p-8" role="status" aria-label="Carregando">
          <CircularProgress />
        </div>
      )}

      {hasConnections && !loading && !error && broadcasts.length === 0 && (
        <EmptyState
          title={
            hasActiveFilters
              ? 'Nenhuma mensagem com estes filtros'
              : 'Nenhuma mensagem ainda'
          }
          description={
            hasActiveFilters
              ? 'Altere os filtros para ver as demais mensagens.'
              : 'Crie uma mensagem para enviá-la agora ou agendá-la.'
          }
          action={hasActiveFilters ? undefined : newBroadcastButton}
        />
      )}

      {broadcasts.length > 0 && (
        <BroadcastTable
          broadcasts={broadcasts}
          connectionNames={connectionNames}
          onView={setDetailsTarget}
          onEdit={(broadcast) => {
            if (broadcast.status === 'scheduled') setFormTarget(broadcast);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      {detailsTarget && (
        <BroadcastDetailsDialog
          broadcast={detailsTarget}
          connectionName={connectionNames.get(detailsTarget.connectionId) ?? '—'}
          onClose={() => setDetailsTarget(null)}
        />
      )}

      {formTarget !== undefined && (
        <BroadcastForm
          broadcast={formTarget}
          connections={connections}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir mensagem?"
        confirmLabel="Excluir mensagem"
        description={
          deleteTarget?.status === 'scheduled'
            ? 'Esta mensagem está agendada e não será mais enviada. Esta ação não pode ser desfeita.'
            : 'O registro desta mensagem será excluído. Esta ação não pode ser desfeita.'
        }
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
    </>
  );
}
