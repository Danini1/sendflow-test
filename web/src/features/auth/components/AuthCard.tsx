import type { ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Paper className="w-full max-w-md p-6 sm:p-8">
        <Typography variant="h2" component="h1" className="!mb-1">
          {title}
        </Typography>
        <Typography color="text.secondary" className="!mb-6">
          {subtitle}
        </Typography>
        {children}
        <div className="mt-6 text-center text-sm">{footer}</div>
      </Paper>
    </main>
  );
}
