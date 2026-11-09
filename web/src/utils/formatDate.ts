import type { Timestamp } from 'firebase/firestore';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateTime(timestamp: Timestamp | null): string {
  return timestamp ? dateTimeFormatter.format(timestamp.toDate()) : '—';
}
