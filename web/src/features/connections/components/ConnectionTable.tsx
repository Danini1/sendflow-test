import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import { formatDateTime } from '../../../utils/formatDate';
import type { Connection } from '../types/connection';

type ConnectionTableProps = {
  connections: Connection[];
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
};

export function ConnectionTable({
  connections,
  onEdit,
  onDelete,
}: ConnectionTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="Conexões">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              Criada em
            </TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {connections.map((connection) => (
            <TableRow key={connection.id} hover>
              <TableCell>{connection.name}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {formatDateTime(connection.createdAt)}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label={`Editar ${connection.name}`}
                      onClick={() => onEdit(connection)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label={`Excluir ${connection.name}`}
                      color="error"
                      onClick={() => onDelete(connection)}
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
