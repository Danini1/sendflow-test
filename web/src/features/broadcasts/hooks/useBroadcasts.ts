import { useEffect, useState } from 'react';

import { getErrorMessage } from '../../../lib/firebase/errors';
import { subscribeBroadcasts } from '../services/broadcastService';
import type { Broadcast, BroadcastStatusFilter } from '../types/broadcast';

type BroadcastsSnapshot = {
  /** Identifica a combinação de filtros a que estes dados pertencem. */
  key: string;
  broadcasts: Broadcast[];
  error: string | null;
};

type BroadcastsState = {
  broadcasts: Broadcast[];
  loading: boolean;
  error: string | null;
};

export function useBroadcasts(
  statusFilter: BroadcastStatusFilter,
  connectionId: string | null,
): BroadcastsState {
  const [snapshot, setSnapshot] = useState<BroadcastsSnapshot | null>(null);
  const key = `${statusFilter}|${connectionId ?? ''}`;

  useEffect(() => {
    const currentKey = `${statusFilter}|${connectionId ?? ''}`;

    return subscribeBroadcasts(
      statusFilter,
      connectionId,
      (broadcasts) => setSnapshot({ key: currentKey, broadcasts, error: null }),
      (error) =>
        setSnapshot({ key: currentKey, broadcasts: [], error: getErrorMessage(error) }),
    );
  }, [statusFilter, connectionId]);

  // Ao trocar os filtros, o dado anterior é descartado até chegar o novo.
  const isCurrent = snapshot !== null && snapshot.key === key;

  return {
    broadcasts: isCurrent ? snapshot.broadcasts : [],
    loading: !isCurrent,
    error: isCurrent ? snapshot.error : null,
  };
}
