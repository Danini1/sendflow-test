import { useEffect, useState } from 'react';

import { getErrorMessage } from '../../../lib/firebase/errors';
import { subscribeContacts } from '../services/contactService';
import type { Contact } from '../types/contact';

type ContactsSnapshot = {
  connectionId: string;
  contacts: Contact[];
  error: string | null;
};

type ContactsState = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
};

/** Contatos de uma connection, atualizados em tempo real. */
export function useContacts(connectionId: string | undefined): ContactsState {
  const [snapshot, setSnapshot] = useState<ContactsSnapshot | null>(null);

  useEffect(() => {
    if (!connectionId) return;

    return subscribeContacts(
      connectionId,
      (contacts) => setSnapshot({ connectionId, contacts, error: null }),
      (error) =>
        setSnapshot({ connectionId, contacts: [], error: getErrorMessage(error) }),
    );
  }, [connectionId]);

  // Ao trocar de connection, o dado anterior é descartado até chegar o novo.
  const isCurrent = snapshot !== null && snapshot.connectionId === connectionId;

  return {
    contacts: isCurrent ? snapshot.contacts : [],
    loading: connectionId !== undefined && !isCurrent,
    error: isCurrent ? snapshot.error : null,
  };
}
