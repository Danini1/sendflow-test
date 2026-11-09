import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import { requireUid } from '../../../lib/firebase/currentUser';
import { docToModel } from '../../../lib/firebase/mapDoc';
import type { Contact, ContactFormValues } from '../types/contact';
import { normalizePhone } from '../utils/phone';

const MAX_LISTED_CONTACTS = 500;

export async function createContact(values: ContactFormValues) {
  return addDoc(collection(db, 'contacts'), {
    ownerId: requireUid(),
    connectionId: values.connectionId,
    name: values.name.trim(),
    phone: normalizePhone(values.phone),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** `ownerId` e `connectionId` são imutáveis (garantido pelas rules). */
export async function updateContact(
  contactId: string,
  values: Pick<ContactFormValues, 'name' | 'phone'>,
) {
  return updateDoc(doc(db, 'contacts', contactId), {
    name: values.name.trim(),
    phone: normalizePhone(values.phone),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContact(contactId: string) {
  return deleteDoc(doc(db, 'contacts', contactId));
}

/** Assina os contatos de uma connection. Retorna a função de cancelamento. */
export function subscribeContacts(
  connectionId: string,
  onData: (contacts: Contact[]) => void,
  onError: (error: unknown) => void,
) {
  const contactsQuery = query(
    collection(db, 'contacts'),
    where('ownerId', '==', requireUid()),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
    limit(MAX_LISTED_CONTACTS),
  );

  return onSnapshot(
    contactsQuery,
    (snapshot) => onData(snapshot.docs.map((d) => docToModel<Contact>(d))),
    onError,
  );
}
