import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ALICE = 'alice';
const BOB = 'bob';

let env: RulesTestEnvironment;

const asAlice = () => env.authenticatedContext(ALICE).firestore();
const asBob = () => env.authenticatedContext(BOB).firestore();
const anonymous = () => env.unauthenticatedContext().firestore();

/** Cria documentos ignorando as rules (dados de partida dos testes). */
async function seed(
  data: Record<string, Record<string, Record<string, unknown>>>,
): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [col, docs] of Object.entries(data)) {
      for (const [id, fields] of Object.entries(docs)) {
        await setDoc(doc(db, col, id), fields);
      }
    }
  });
}

const stamp = () => ({ createdAt: new Date(), updatedAt: new Date() });

const aliceConnection = { ownerId: ALICE, name: 'Loja', ...stamp() };
const bobConnection = { ownerId: BOB, name: 'Outra', ...stamp() };
const aliceContact = {
  ownerId: ALICE,
  connectionId: 'c-alice',
  name: 'Maria',
  phone: '+5511999999999',
  ...stamp(),
};
const aliceBroadcast = {
  ownerId: ALICE,
  connectionId: 'c-alice',
  contactIds: ['ct-alice'],
  message: 'Ola',
  status: 'scheduled',
  scheduledAt: new Date(),
  sentAt: null,
  ...stamp(),
};

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-sendflow',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('sem autenticacao', () => {
  it('nega leitura e escrita em todas as collections', async () => {
    await seed({ connections: { 'c-alice': aliceConnection } });
    const db = anonymous();
    await assertFails(getDoc(doc(db, 'connections', 'c-alice')));
    await assertFails(
      addDoc(collection(db, 'connections'), {
        ownerId: ALICE,
        name: 'x',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(getDoc(doc(db, 'users', ALICE)));
  });
});

describe('users', () => {
  const profile = (uid: string) => ({
    uid,
    email: `${uid}@teste.com`,
    displayName: 'Alice',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  it('permite criar o proprio perfil', async () => {
    await assertSucceeds(setDoc(doc(asAlice(), 'users', ALICE), profile(ALICE)));
  });

  it('nega criar perfil com o uid de outro usuario', async () => {
    await assertFails(setDoc(doc(asAlice(), 'users', BOB), profile(BOB)));
  });

  it('nega campos fora do schema (ex.: "name" legado)', async () => {
    await assertFails(
      setDoc(doc(asAlice(), 'users', ALICE), { ...profile(ALICE), name: 'x' }),
    );
  });

  it('nega timestamps vindos do cliente', async () => {
    await assertFails(
      setDoc(doc(asAlice(), 'users', ALICE), {
        ...profile(ALICE),
        createdAt: new Date('2020-01-01'),
      }),
    );
  });

  it('nega ler o perfil de outro usuario e excluir o proprio', async () => {
    await seed({
      users: {
        [ALICE]: { uid: ALICE, email: 'a@a.com', displayName: 'A', ...stamp() },
        [BOB]: { uid: BOB, email: 'b@b.com', displayName: 'B', ...stamp() },
      },
    });
    await assertSucceeds(getDoc(doc(asAlice(), 'users', ALICE)));
    await assertFails(getDoc(doc(asAlice(), 'users', BOB)));
    await assertFails(deleteDoc(doc(asAlice(), 'users', ALICE)));
  });

  it('permite alterar displayName, mas nao email nem uid', async () => {
    await seed({
      users: {
        [ALICE]: { uid: ALICE, email: 'a@a.com', displayName: 'A', ...stamp() },
      },
    });
    const ref = doc(asAlice(), 'users', ALICE);
    await assertSucceeds(
      updateDoc(ref, { displayName: 'Novo', updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, { email: 'x@x.com', updatedAt: serverTimestamp() }),
    );
  });
});

describe('connections', () => {
  const newConnection = (ownerId: string, name = 'Loja') => ({
    ownerId,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  it('permite criar uma connection propria', async () => {
    await assertSucceeds(
      addDoc(collection(asAlice(), 'connections'), newConnection(ALICE)),
    );
  });

  it('nega criar connection em nome de outro tenant', async () => {
    await assertFails(
      addDoc(collection(asAlice(), 'connections'), newConnection(BOB)),
    );
  });

  it('nega nome vazio, campos extras e timestamps do cliente', async () => {
    const col = collection(asAlice(), 'connections');
    await assertFails(addDoc(col, newConnection(ALICE, '')));
    await assertFails(addDoc(col, { ...newConnection(ALICE), extra: 1 }));
    await assertFails(
      addDoc(col, { ...newConnection(ALICE), createdAt: new Date() }),
    );
  });

  it('lista apenas as proprias connections', async () => {
    await seed({
      connections: { 'c-alice': aliceConnection, 'c-bob': bobConnection },
    });
    const own = query(
      collection(asAlice(), 'connections'),
      where('ownerId', '==', ALICE),
    );
    const snapshot = await assertSucceeds(getDocs(own));
    if (snapshot.size !== 1) throw new Error(`esperava 1, veio ${snapshot.size}`);
  });

  it('nega consulta sem filtro de ownerId e consulta ao tenant alheio', async () => {
    await seed({
      connections: { 'c-alice': aliceConnection, 'c-bob': bobConnection },
    });
    await assertFails(getDocs(collection(asAlice(), 'connections')));
    await assertFails(
      getDocs(
        query(collection(asAlice(), 'connections'), where('ownerId', '==', BOB)),
      ),
    );
    await assertFails(getDoc(doc(asAlice(), 'connections', 'c-bob')));
  });

  it('permite renomear, mas nao trocar ownerId nem editar a de outro tenant', async () => {
    await seed({
      connections: { 'c-alice': aliceConnection, 'c-bob': bobConnection },
    });
    const own = doc(asAlice(), 'connections', 'c-alice');
    await assertSucceeds(
      updateDoc(own, { name: 'Renomeada', updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(own, { ownerId: BOB, updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(doc(asAlice(), 'connections', 'c-bob'), {
        name: 'Invasao',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('nega excluir pelo cliente (exclusao so via callable)', async () => {
    await seed({ connections: { 'c-alice': aliceConnection } });
    await assertFails(deleteDoc(doc(asAlice(), 'connections', 'c-alice')));
  });
});

describe('contacts', () => {
  const newContact = (overrides: Record<string, unknown> = {}) => ({
    ownerId: ALICE,
    connectionId: 'c-alice',
    name: 'Maria',
    phone: '+5511999999999',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  });

  beforeEach(async () => {
    await seed({
      connections: { 'c-alice': aliceConnection, 'c-bob': bobConnection },
    });
  });

  it('permite criar contato em connection propria', async () => {
    await assertSucceeds(addDoc(collection(asAlice(), 'contacts'), newContact()));
  });

  it('nega criar contato em connection de outro tenant ou inexistente', async () => {
    const col = collection(asAlice(), 'contacts');
    await assertFails(addDoc(col, newContact({ connectionId: 'c-bob' })));
    await assertFails(addDoc(col, newContact({ connectionId: 'nao-existe' })));
  });

  it('nega criar contato com ownerId de outro tenant', async () => {
    await assertFails(
      addDoc(collection(asAlice(), 'contacts'), newContact({ ownerId: BOB })),
    );
  });

  it('valida nome e telefone', async () => {
    const col = collection(asAlice(), 'contacts');
    await assertFails(addDoc(col, newContact({ name: '' })));
    await assertFails(addDoc(col, newContact({ phone: 'abc' })));
    await assertFails(addDoc(col, newContact({ phone: '123' })));
  });

  it('aceita apenas telefone brasileiro normalizado (+55 + DDD + numero)', async () => {
    const col = collection(asAlice(), 'contacts');
    // celular e fixo validos
    await assertSucceeds(addDoc(col, newContact({ phone: '+5511999999999' })));
    await assertSucceeds(addDoc(col, newContact({ phone: '+551133334444' })));
    // sem +55, curto, fixo iniciando com 9, DDD com 0, estrangeiro
    for (const phone of [
      '11999999999',
      '+55119999999',
      '+551199999999',
      '+5501999999999',
      '+14155550100',
    ]) {
      await assertFails(addDoc(col, newContact({ phone })));
    }
  });

  it('lista contatos de uma connection propria e nega os de outro tenant', async () => {
    await seed({
      contacts: {
        'ct-alice': aliceContact,
        'ct-bob': { ...aliceContact, ownerId: BOB, connectionId: 'c-bob' },
      },
    });
    const own = query(
      collection(asAlice(), 'contacts'),
      where('ownerId', '==', ALICE),
      where('connectionId', '==', 'c-alice'),
    );
    await assertSucceeds(getDocs(own));
    await assertFails(getDoc(doc(asAlice(), 'contacts', 'ct-bob')));
    await assertFails(getDocs(collection(asAlice(), 'contacts')));
  });

  it('permite editar nome e telefone, mas nao ownerId nem connectionId', async () => {
    await seed({ contacts: { 'ct-alice': aliceContact } });
    const ref = doc(asAlice(), 'contacts', 'ct-alice');
    await assertSucceeds(
      updateDoc(ref, { name: 'Maria S.', updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, { ownerId: BOB, updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, { connectionId: 'c-bob', updatedAt: serverTimestamp() }),
    );
  });

  it('permite excluir contato proprio e nega excluir o de outro tenant', async () => {
    await seed({
      contacts: {
        'ct-alice': aliceContact,
        'ct-bob': { ...aliceContact, ownerId: BOB, connectionId: 'c-bob' },
      },
    });
    await assertFails(deleteDoc(doc(asAlice(), 'contacts', 'ct-bob')));
    await assertSucceeds(deleteDoc(doc(asAlice(), 'contacts', 'ct-alice')));
  });
});

describe('broadcasts', () => {
  beforeEach(async () => {
    await seed({
      connections: { 'c-alice': aliceConnection },
      contacts: { 'ct-alice': aliceContact },
      broadcasts: {
        'b-alice': aliceBroadcast,
        'b-bob': { ...aliceBroadcast, ownerId: BOB },
      },
    });
  });

  it('nega criar e editar pelo cliente (apenas via callable)', async () => {
    await assertFails(
      addDoc(collection(asAlice(), 'broadcasts'), {
        ...aliceBroadcast,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(asAlice(), 'broadcasts', 'b-alice'), { message: 'x' }),
    );
  });

  it('permite ler apenas os proprios broadcasts', async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(asAlice(), 'broadcasts'),
          where('ownerId', '==', ALICE),
          where('status', '==', 'scheduled'),
        ),
      ),
    );
    await assertFails(getDoc(doc(asAlice(), 'broadcasts', 'b-bob')));
    await assertFails(getDocs(collection(asAlice(), 'broadcasts')));
  });

  it('filtro por conexao: exige o filtro de ownerId do proprio usuario', async () => {
    const byConnection = (ownerId: string | null) =>
      ownerId
        ? query(
            collection(asAlice(), 'broadcasts'),
            where('ownerId', '==', ownerId),
            where('connectionId', '==', 'c-alice'),
            where('status', '==', 'scheduled'),
          )
        : query(
            collection(asAlice(), 'broadcasts'),
            where('connectionId', '==', 'c-alice'),
          );

    await assertSucceeds(getDocs(byConnection(ALICE)));
    await assertFails(getDocs(byConnection(BOB)));
    await assertFails(getDocs(byConnection(null)));
  });

  it('permite excluir o proprio broadcast e nega o de outro tenant', async () => {
    await assertFails(deleteDoc(doc(asAlice(), 'broadcasts', 'b-bob')));
    await assertSucceeds(deleteDoc(doc(asAlice(), 'broadcasts', 'b-alice')));
  });
});

describe('colecoes desconhecidas e subcollections', () => {
  it('nega qualquer acesso fora do modelo', async () => {
    await assertFails(
      setDoc(doc(asAlice(), 'messages', 'm1'), { ownerId: ALICE }),
    );
    await assertFails(
      setDoc(doc(asAlice(), 'connections', 'c-alice', 'contacts', 'x'), {
        ownerId: ALICE,
      }),
    );
  });
});

// Garante que o Bob nao consegue usar o contexto da Alice por engano.
describe('contextos', () => {
  it('Bob nao le dados da Alice', async () => {
    await seed({ connections: { 'c-alice': aliceConnection } });
    await assertFails(getDoc(doc(asBob(), 'connections', 'c-alice')));
  });
});
