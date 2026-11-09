import { useEffect, useState } from 'react';

import { getErrorMessage } from '../../../lib/firebase/errors';
import { subscribeConnections } from '../services/connectionService';
import type { Connection } from '../types/connection';

type ConnectionsState = {
  connections: Connection[];
  loading: boolean;
  error: string | null;
};

/** Lista de connections do usuário, atualizada em tempo real. */
export function useConnections(): ConnectionsState {
  const [state, setState] = useState<ConnectionsState>({
    connections: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    return subscribeConnections(
      (connections) => setState({ connections, loading: false, error: null }),
      (error) =>
        setState({
          connections: [],
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, []);

  return state;
}
