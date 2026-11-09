import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { formatDateTime } from '../../../utils/formatDate';
import { useContacts } from '../../contacts/hooks/useContacts';
import { formatPhone } from '../../contacts/utils/phone';
import type { Broadcast } from '../types/broadcast';
import { BroadcastStatusChip } from './BroadcastStatusChip';

type BroadcastDetailsDialogProps = {
  broadcast: Broadcast;
  connectionName: string;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </div>
  );
}

export function BroadcastDetailsDialog({
  broadcast,
  connectionName,
  onClose,
}: BroadcastDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { contacts, loading, error } = useContacts(broadcast.connectionId);

  const contactsById = new Map(contacts.map((contact) => [contact.id, contact]));

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle className="flex items-center justify-between gap-2">
        Detalhes da mensagem
        <BroadcastStatusChip status={broadcast.status} />
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <Typography className="whitespace-pre-wrap break-words">
          {broadcast.message}
        </Typography>

        <Divider />

        <div className="flex flex-col gap-1">
          <DetailRow label="Conexão" value={connectionName} />
          <DetailRow label="Criada em" value={formatDateTime(broadcast.createdAt)} />
          {broadcast.status === 'scheduled' && (
            <DetailRow
              label="Agendada para"
              value={formatDateTime(broadcast.scheduledAt)}
            />
          )}
          {broadcast.status === 'sent' && (
            <DetailRow label="Enviada em" value={formatDateTime(broadcast.sentAt)} />
          )}
        </div>

        <Divider />

        <div>
          <Typography variant="subtitle2" component="h3">
            Destinatários ({broadcast.contactIds.length})
          </Typography>

          {loading && (
            <div className="flex justify-center p-4" role="status" aria-label="Carregando">
              <CircularProgress size={24} />
            </div>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && (
            <List dense disablePadding>
              {broadcast.contactIds.map((contactId) => {
                const contact = contactsById.get(contactId);

                return (
                  <ListItem key={contactId} disableGutters>
                    <ListItemText
                      primary={contact ? contact.name : 'Contato removido'}
                      secondary={
                        contact
                          ? formatPhone(contact.phone)
                          : 'Este contato foi excluído depois da criação da mensagem.'
                      }
                      slotProps={{
                        primary: contact ? undefined : { color: 'text.secondary' },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
