import CircularProgress from '@mui/material/CircularProgress';

export function FullPageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Carregando"
    >
      <CircularProgress />
    </div>
  );
}
