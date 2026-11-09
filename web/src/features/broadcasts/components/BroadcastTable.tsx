import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import { DisabledReason } from '../../../components/common/DisabledReason';
import { formatDateTime } from '../../../utils/formatDate';
import type { Broadcast } from '../types/broadcast';
import { BroadcastStatusChip } from './BroadcastStatusChip';

type BroadcastTableProps = {
  broadcasts: Broadcast[];
  connectionNames: Map<string, string>;
  onView: (broadcast: Broadcast) => void;
  onEdit: (broadcast: Broadcast) => void;
  onDelete: (broadcast: Broadcast) => void;
};

export function BroadcastTable({
  broadcasts,
  connectionNames,
  onView,
  onEdit,
  onDelete,
}: BroadcastTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="Mensagens">
        <TableHead>
          <TableRow>
            <TableCell>Mensagem</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Data</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
              Conexão
            </TableCell>
            <TableCell
              align="right"
              sx={{ display: { xs: 'none', sm: 'table-cell' } }}
            >
              Contatos
            </TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {broadcasts.map((broadcast) => (
            <TableRow key={broadcast.id} hover>
              <TableCell className="max-w-48 truncate sm:max-w-xs" title={broadcast.message}>
                {broadcast.message}
              </TableCell>
              <TableCell>
                <BroadcastStatusChip status={broadcast.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(
                  broadcast.status === 'scheduled'
                    ? broadcast.scheduledAt
                    : broadcast.sentAt,
                )}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {connectionNames.get(broadcast.connectionId) ?? '—'}
              </TableCell>
              <TableCell
                align="right"
                sx={{ display: { xs: 'none', sm: 'table-cell' } }}
              >
                {broadcast.contactIds.length}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip title="Ver detalhes">
                    <IconButton
                      aria-label="Ver detalhes da mensagem"
                      onClick={() => onView(broadcast)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {broadcast.status === 'scheduled' ? (
                    <Tooltip title="Editar">
                      <IconButton aria-label="Editar mensagem" onClick={() => onEdit(broadcast)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <DisabledReason reason="Mensagens enviadas não podem ser editadas.">
                      <IconButton aria-label="Editar mensagem (indisponível: já enviada)" disabled>
                        <EditIcon />
                      </IconButton>
                    </DisabledReason>
                  )}
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label="Excluir mensagem"
                      color="error"
                      onClick={() => onDelete(broadcast)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
