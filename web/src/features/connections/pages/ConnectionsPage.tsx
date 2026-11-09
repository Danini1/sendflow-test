import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { FeedbackSnackbar } from '../../../components/common/FeedbackSnackbar';
import { PageHeader } from '../../../components/common/PageHeader';
import { useFeedback } from '../../../hooks/useFeedback';
import { getErrorMessage } from '../../../lib/firebase/errors';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionTable } from '../components/ConnectionTable';
import { useConnections } from '../hooks/useConnections';
import type { ConnectionFormValues } from '../schemas/connectionSchema';
import {
  createConnection,
  deleteConnection,
  updateConnection,
} from '../services/connectionService';
import type { Connection } from '../types/connection';

/** `undefined` = formulário fechado; `null` = nova conexão; objeto = edição. */
type FormTarget = Connection | null | undefined;

export default function ConnectionsPage() {
  const { connections, loading, error } = useConnections();
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Connection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (values: ConnectionFormValues) => {
    if (formTarget) {
      await updateConnection(formTarget.id, values);
      showSuccess('Conexão atualizada.');
    } else {
      await createConnection(values);
      showSuccess('Conexão criada.');
    }
    setFormTarget(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteConnection(deleteTarget.id);
      showSuccess('Conexão excluída.');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const newConnectionButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setFormTarget(null)}
    >
      Nova conexão
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Conexões"
        description="Cada conexão agrupa seus contatos e mensagens."
        actions={connections.length > 0 ? newConnectionButton : undefined}
      />

      {loading && (
        <div className="flex justify-center p-8" role="status" aria-label="Carregando">
          <CircularProgress />
        </div>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && connections.length === 0 && (
        <EmptyState
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
          action={newConnectionButton}
        />
      )}

      {connections.length > 0 && (
        <ConnectionTable
          connections={connections}
          onEdit={setFormTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {formTarget !== undefined && (
        <ConnectionForm
          connection={formTarget}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir conexão?"
        confirmLabel="Excluir conexão"
        description={`Ao excluir "${deleteTarget?.name ?? ''}", todos os contatos e mensagens desta conexão também serão excluídos. Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
    </>
  );
}
