import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { FeedbackSnackbar } from '../../../components/common/FeedbackSnackbar';
import { PageHeader } from '../../../components/common/PageHeader';
import { useFeedback } from '../../../hooks/useFeedback';
import { getErrorMessage } from '../../../lib/firebase/errors';
import { ROUTES } from '../../../routes/paths';
import { useConnections } from '../../connections/hooks/useConnections';
import { ContactForm } from '../components/ContactForm';
import { ContactTable } from '../components/ContactTable';
import { useContacts } from '../hooks/useContacts';
import type { ContactInput } from '../schemas/contactSchema';
import {
  createContact,
  deleteContact,
  updateContact,
} from '../services/contactService';
import type { Contact } from '../types/contact';

type FormTarget = Contact | null | undefined;

export default function ContactsPage() {
  const { connections, loading: loadingConnections, error: connectionsError } =
    useConnections();
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();

  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [search, setSearch] = useState('');
  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Se a seleção deixar de existir (ex.: connection excluída), usa a primeira.
  const connectionId = connections.some((c) => c.id === selectedConnectionId)
    ? selectedConnectionId
    : connections[0]?.id;

  const { contacts, loading: loadingContacts, error: contactsError } =
    useContacts(connectionId);

  const visibleContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;

    const digits = term.replace(/\D/g, '');
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (digits !== '' && c.phone.includes(digits)),
    );
  }, [contacts, search]);

  const handleSubmit = async (values: ContactInput) => {
    if (formTarget) {
      await updateContact(formTarget.id, values);
      showSuccess('Contato atualizado.');
    } else if (connectionId) {
      await createContact({ ...values, connectionId });
      showSuccess('Contato criado.');
    }
    setFormTarget(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteContact(deleteTarget.id);
      showSuccess('Contato excluído.');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const newContactButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setFormTarget(null)}
      disabled={!connectionId}
    >
      Novo contato
    </Button>
  );

  const hasConnections = connections.length > 0;
  const loading = loadingConnections || loadingContacts;
  const error = connectionsError ?? contactsError;

  return (
    <>
      <PageHeader
        title="Contatos"
        description="Gerencie os contatos de cada conexão."
        actions={hasConnections ? newContactButton : undefined}
      />

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {!loadingConnections && !connectionsError && !hasConnections && (
        <EmptyState
          title="Crie uma conexão primeiro"
          description="Os contatos são cadastrados dentro de uma conexão."
          action={
            <Button component={RouterLink} to={ROUTES.connections} variant="contained">
              Ir para conexões
            </Button>
          }
        />
      )}

      {hasConnections && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <TextField
            select
            label="Conexão"
            value={connectionId ?? ''}
            onChange={(event) => setSelectedConnectionId(event.target.value)}
            className="sm:max-w-xs"
          >
            {connections.map((connection) => (
              <MenuItem key={connection.id} value={connection.id}>
                {connection.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Buscar por nome ou telefone"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-sm"
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-8" role="status" aria-label="Carregando">
          <CircularProgress />
        </div>
      )}

      {hasConnections && !loading && !contactsError && contacts.length === 0 && (
        <EmptyState
          title="Nenhum contato nesta conexão"
          description="Cadastre contatos para poder enviar mensagens a eles."
          action={newContactButton}
        />
      )}

      {contacts.length > 0 && visibleContacts.length === 0 && (
        <EmptyState
          title="Nenhum resultado"
          description="Nenhum contato corresponde à busca."
        />
      )}

      {visibleContacts.length > 0 && (
        <ContactTable
          contacts={visibleContacts}
          onEdit={setFormTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {formTarget !== undefined && (
        <ContactForm
          contact={formTarget}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir contato?"
        confirmLabel="Excluir contato"
        description={`O contato "${deleteTarget?.name ?? ''}" será excluído. Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
    </>
  );
}
