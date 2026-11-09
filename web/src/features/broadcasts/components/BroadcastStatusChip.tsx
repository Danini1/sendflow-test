import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Chip from '@mui/material/Chip';
import type { BroadcastStatus } from '../types/broadcast';

const STATUS_CONFIG = {
  scheduled: { label: 'Agendada', color: 'warning', icon: <ScheduleIcon /> },
  sent: { label: 'Enviada', color: 'success', icon: <CheckCircleIcon /> },
} as const;

export function BroadcastStatusChip({ status }: { status: BroadcastStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      size="small"
      variant="outlined"
      label={config.label}
      color={config.color}
      icon={config.icon}
    />
  );
}
