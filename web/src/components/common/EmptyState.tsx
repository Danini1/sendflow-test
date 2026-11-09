import type { ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper className="flex flex-col items-center gap-2 p-8 text-center">
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary">{description}</Typography>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Paper>
  );
}
