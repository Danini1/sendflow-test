import type { ReactElement } from 'react';
import Tooltip from '@mui/material/Tooltip';

type DisabledReasonProps = {
  reason?: string;
  children: ReactElement;
};

/** O Tooltip não dispara em elemento `disabled`, por isso o `span` em volta. */
export function DisabledReason({ reason, children }: DisabledReasonProps) {
  if (!reason) {
    return children;
  }

  return (
    <Tooltip title={reason}>
      <span className="inline-flex">{children}</span>
    </Tooltip>
  );
}
