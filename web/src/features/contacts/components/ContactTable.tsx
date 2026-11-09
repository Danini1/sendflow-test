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
import type { Contact } from '../types/contact';
import { formatPhone } from '../utils/phone';

type ContactTableProps = {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

export function ContactTable({ contacts, onEdit, onDelete }: ContactTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="Contatos">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
              Criado em
            </TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} hover>
              <TableCell>{contact.name}</TableCell>
              <TableCell className="whitespace-nowrap">{formatPhone(contact.phone)}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {formatDateTime(contact.createdAt)}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label={`Editar ${contact.name}`}
                      onClick={() => onEdit(contact)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label={`Excluir ${contact.name}`}
                      color="error"
                      onClick={() => onDelete(contact)}
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
