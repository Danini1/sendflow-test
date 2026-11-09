# Sendflow

Aplicação SaaS multi-tenant **simplificada** de broadcast. Cada cliente gerencia suas **conexões**, os **contatos** de cada conexão e **mensagens**, que podem ser enviadas na hora ou agendadas. O envio é apenas **simulado**: não há integração com SMS ou WhatsApp. Mensagens agendadas passam de **Agendada** para **Enviada** automaticamente, por uma Cloud Function, mesmo com o app fechado.

> Para estudar o projeto passo a passo, veja o [Guia de estudo](docs/GUIA_DE_ESTUDO.md); o histórico de decisões está em [docs/SPEC.md](docs/SPEC.md).

**Stack:** React 19 + TypeScript + Vite · Material UI (componentes) + Tailwind CSS (layout e utilitários) · Firebase Authentication, Cloud Firestore e Cloud Functions (v2, TypeScript, Admin SDK).

---

## Estrutura

```
/web        Frontend (React + Vite)
  src/features/{auth,connections,contacts,broadcasts}/
      components/  UI (recebe dados por props, emite callbacks)
      hooks/       estado React + assinaturas em tempo real (onSnapshot)
      services/    acesso ao Firebase (queries, CRUD, callables)
      schemas/     validação de formulários (zod)
      types/       contratos espelhando os documentos do Firestore
  src/components/  layout e componentes comuns (PageHeader, ConfirmDialog...)
  src/lib/firebase cliente Firebase, UID atual, mapeamento de docs, erros
  src/routes/      rotas públicas/protegidas
/functions  Cloud Functions
  src/modules/{broadcasts,connections,contacts}/  handlers finos + services
  src/shared/      auth (UID), validação (zod -> HttpsError), utilitários
  src/config/      Admin SDK e opções globais (região)
/tests      Testes no emulador: Security Rules e serviços do backend
firestore.rules, firestore.indexes.json, firebase.json
```

**Paradigma funcional:** não há classes. Componentes são funções, a lógica fica em hooks e funções puras, e os services são módulos de funções exportadas. Nas functions, cada handler (`onCall`/`onSchedule`) só autentica, valida e delega a uma função de serviço testável.

---

## Modelagem de dados

Todas as collections ficam **na raiz**. Não existem subcoleções: as relações são feitas por **ID**.

| Collection | ID | Campos |
|---|---|---|
| `users` | UID do Auth | `uid`, `email`, `displayName`, `createdAt`, `updatedAt` |
| `connections` | auto | `ownerId`, `name`, `createdAt`, `updatedAt` |
| `contacts` | auto | `ownerId`, `connectionId`, `name`, `phone`, `createdAt`, `updatedAt` |
| `broadcasts` | auto | `ownerId`, `connectionId`, `contactIds[]`, `message`, `status` (`scheduled` \| `sent`), `scheduledAt`, `sentAt`, `createdAt`, `updatedAt` |

```
users/{uid} ── 1:N ── connections (ownerId)
                        └── 1:N ── contacts   (ownerId, connectionId)
                        └── 1:N ── broadcasts (ownerId, connectionId, contactIds[])
```

- **Tenant = cliente = UID** do Firebase Auth. Todo documento de negócio carrega `ownerId`.
- Um broadcast guarda só os **IDs** dos contatos (`contactIds`), sem cópia de nome ou telefone. Os detalhes são resolvidos em tempo real a partir de `contacts`.
- Timestamps são sempre do servidor (`serverTimestamp`) e as datas ficam armazenadas como `Timestamp` (UTC).
- Na interface, um documento de `broadcasts` aparece como "mensagem".

**Por que collections na raiz:** além de ser um requisito, elas permitem consultas diretas por `ownerId`/`connectionId`/`status` com índices compostos. Isso inclui a consulta do scheduler, que varre as mensagens vencidas de todos os tenants com uma única query, sem `collectionGroup`.

---

## Isolamento entre clientes (multi-tenant)

O isolamento é garantido em **três camadas independentes**:

1. **Identidade.** O `ownerId` é sempre o UID autenticado: `requireUid()` no frontend (`web/src/lib/firebase/currentUser.ts`) e `request.auth.uid` nas functions (`functions/src/shared/auth.ts`). Ele nunca vem de formulário ou de payload.
2. **Security Rules** (`firestore.rules`):
   - Leitura só quando `resource.data.ownerId == request.auth.uid`. Por isso toda listagem precisa filtrar por `ownerId`; uma query sem esse filtro é negada.
   - Na criação, `ownerId` precisa ser o UID; em seguida passa a ser **imutável**.
   - Schema validado: campos permitidos e obrigatórios, tipos, tamanhos, telefone brasileiro `+55` + DDD + celular (9 dígitos, inicia com 9) ou fixo (8 dígitos, inicia de 2 a 5), `createdAt == request.time` e `createdAt` imutável.
   - `contacts`: a connection referenciada precisa existir e ser do mesmo dono (`ownsConnection`), e `connectionId` é imutável.
   - Qualquer path fora do modelo, incluindo subcoleções, é negado.
3. **Cloud Functions.** O Admin SDK **ignora** as rules, então cada callable revalida tudo:
   - autenticação;
   - posse da connection;
   - que cada contato existe, é do usuário e pertence à connection;
   - posse do broadcast.

   Recursos de outro tenant respondem `not-found`, para não revelar que existem.

### Quem escreve em cada collection

| Collection | Escrita | Motivo |
|---|---|---|
| `users` | Cliente, só no próprio documento | Perfil criado no cadastro |
| `connections` | Cliente cria e edita; **exclusão pela callable `deleteConnection`** | A exclusão remove em cascata os contatos e as mensagens da conexão |
| `contacts` | Cliente (CRUD), validado pelas rules | Uma única referência (connection), verificável nas rules |
| `broadcasts` | **Criação e edição pelas callables `createBroadcast` / `updateBroadcast`**; exclusão pelo cliente (rule de dono); o scheduler altera o status | As rules não conseguem validar uma lista de N contatos; o backend consegue |

---

## Envio, agendamento e scheduler

- **Enviar agora:** `createBroadcast` valida e grava com `status: sent` e `sentAt` do servidor.
- **Agendar:** grava com `status: scheduled` e `scheduledAt`. A data precisa estar no futuro e no máximo 1 ano à frente (validado no front e no back).
- **`processScheduledBroadcasts`** (`onSchedule`, a cada 1 minuto, UTC):
  - Busca `status == scheduled && scheduledAt <= agora` em lotes de 100 (até 10 lotes por execução).
  - Cada mensagem passa para `sent` **dentro de uma transação que relê o documento**. Com isso, execuções repetidas ou concorrentes nunca processam a mesma mensagem duas vezes.
  - Uma falha isolada é registrada e não interrompe as demais.
  - A precisão é de até cerca de 1 minuto após o horário agendado.
- **Editar:**
  - Agendada: mensagem, contatos e data são revalidados. Sem data, a mensagem é enviada na hora.
  - Enviada: **não pode ser editada** (é histórico), só excluída. O backend recusa com `failed-precondition`, na mesma transação, o que cobre a mensagem enviada pelo scheduler enquanto o formulário estava aberto.
  - A conexão de uma mensagem não pode ser alterada.
- **Excluir conexão:** apaga mensagens, depois contatos e por último a conexão. A exclusão é feita em lotes de 400 (o Firestore limita 500 operações por batch). Se falhar no meio, a conexão continua existindo e a operação pode ser repetida.

---

## Tempo real

As listas de conexões, contatos e mensagens usam `onSnapshot`. A mudança de **Agendada → Enviada** feita pelo scheduler aparece na tela sem recarregar. As assinaturas são canceladas ao desmontar o componente.

---

## Como rodar

Pré-requisitos: Node 24 (o Node 26 funciona, com aviso), Firebase CLI e Java 21 ou superior (para os emuladores).

```bash
npm --prefix web install
npm --prefix functions install
npm --prefix tests install
```

Crie `web/.env.local` com a configuração do app Web do Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
# Opcional, em desenvolvimento: usar os emuladores locais
VITE_USE_EMULATORS=true
```

### Local, com emuladores

```bash
npm --prefix functions run build
firebase emulators:start --only auth,firestore,functions   # terminal 1
npm --prefix web run dev                                    # terminal 2
```

App: URL exibida pelo Vite (normalmente http://localhost:5173). Interface dos emuladores: http://localhost:4000.

> O emulador **não executa** funções agendadas (`processScheduledBroadcasts` é ignorada sem o emulador de Pub/Sub, e mesmo com ele não dispara sozinha). No ambiente local, mensagens agendadas permanecem como *Agendada*. O comportamento do scheduler é coberto pelos testes automatizados e funciona automaticamente no ambiente publicado.

### Testes

```bash
npm --prefix tests run test:emulator
# equivale a (na raiz): firebase emulators:exec --only firestore --project demo-sendflow "npm --prefix tests test"
# a porta 8080 precisa estar livre (feche os emuladores do desenvolvimento antes)
```

São 54 testes no emulador:
- **Security Rules:** isolamento entre clientes, schema, campos imutáveis, relação contato ↔ conexão, negação de subcoleções.
- **Exclusão em cascata:** incluindo mais de 500 documentos.
- **Criar e editar mensagens:** validações e acesso entre tenants.
- **Scheduler:** apenas vencidas, idempotência, execuções concorrentes e lotes.

Lint e build: `npm --prefix web run lint && npm --prefix web run build` · `npm --prefix functions run lint && npm --prefix functions run build`.

### Deploy

Requer o **plano Blaze**, exigido pelo Cloud Scheduler e pelas Functions v2, e o provedor **E-mail/senha** ativo no Authentication.

```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting   # https://sendflow-test-35619.web.app
```

Região: `southamerica-east1`, a mesma do Firestore. O cliente chama as functions nessa região.

---

## Decisões e limitações conhecidas

- **Envio simulado:** a mudança de status representa a entrega.
- **Contato excluído** não altera mensagens existentes. Nos detalhes, aparece como "Contato removido"; ao editar a mensagem, é descartado.
- **Limites:**
  - 1000 caracteres por mensagem, até 100 contatos por envio e agendamento de até 1 ano. Os valores são duplicados no front e no back (marcados com `// Par:`) e precisam ser mantidos em sincronia.
- **Validações de formulário:** telefone brasileiro com máscara `(11) 99999-9999` (salvo como `+5511999999999`); nomes com 2 a 60/80 caracteres e letras; senha de cadastro com 8+ caracteres, letras e números, e confirmação.
  - As listas têm teto (200 conexões e mensagens, 500 contatos) e não há paginação.
- **Visual:** segue o `DESIGN_GUIDELINES.md` (tema escuro com amarelo de marca, fonte Inter). Os tokens ficam em `web/src/theme/theme.ts` e viram variáveis CSS `--mui-palette-*`. A paleta é uma aproximação inicial. Ficam para uma próxima etapa: listas em cards no mobile, skeletons, etapa de revisão antes de enviar, aviso de simulação no formulário e exibição do fuso horário.
- Sem testes automatizados de componentes do frontend. As regras críticas (segurança e backend) estão cobertas no emulador.
