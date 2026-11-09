import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary">{description}</Typography>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}
