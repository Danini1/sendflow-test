
# Architecture Rules

## 1. Application Architecture

Use a feature-based architecture in the frontend and a modular functional architecture in the backend.

Frontend features:
- auth
- connections
- contacts
- broadcasts

Keep responsibilities separated:
- Components: UI rendering.
- Hooks: React state and application interactions.
- Services: Firebase communication and data access.
- Types: TypeScript contracts.
- Utils: reusable pure functions.

Do not mix Firestore queries directly into presentation components.

## 2. Firestore Data Model

Use only root-level collections.

### users

Document ID: Firebase Authentication UID.

Fields:
- uid: string
- email: string
- displayName: string
- createdAt: Timestamp
- updatedAt: Timestamp

### connections

Document ID: automatically generated.

Fields:
- ownerId: string
- name: string
- createdAt: Timestamp
- updatedAt: Timestamp

### contacts

Document ID: automatically generated.

Fields:
- ownerId: string
- connectionId: string
- name: string
- phone: string
- createdAt: Timestamp
- updatedAt: Timestamp

### broadcasts

Document ID: automatically generated.

Fields:
- ownerId: string
- connectionId: string
- contactIds: string[]
- message: string
- status: "scheduled" | "sent"
- scheduledAt: Timestamp | null
- sentAt: Timestamp | null
- createdAt: Timestamp
- updatedAt: Timestamp

## 3. Data Relationships

A user owns multiple connections.

A connection belongs to exactly one user.

A contact belongs to exactly one connection and one user.

A broadcast belongs to exactly one connection and one user.

A broadcast can target multiple contacts belonging to its connection.

The relationship between documents must be represented through IDs.

Do not embed complete contact documents inside broadcasts.

Do not use Firestore subcollections.

## 4. Tenant Isolation

The authenticated user's UID is the source of truth for ownership.

Every read and write operation must be scoped to the authenticated UID.

Example:

Query connections where:
ownerId == authenticatedUser.uid

Query contacts where:
ownerId == authenticatedUser.uid
connectionId == selectedConnectionId

Query broadcasts where:
ownerId == authenticatedUser.uid

Never accept ownerId from untrusted frontend input.

For document updates and deletes, validate ownership.

For contacts and broadcasts, also validate that their referenced connection belongs to the same owner.

## 5. Firestore Query Strategy

Use Firestore real-time listeners (onSnapshot) where appropriate.

Prefer:
- onSnapshot for real-time lists.
- getDoc for individual document reads when real-time updates are unnecessary.
- addDoc for document creation.
- updateDoc for updates.
- deleteDoc for deletion.
- serverTimestamp for timestamps.

Unsubscribe from listeners when components or hooks are no longer active.

Avoid unnecessary listeners and duplicate subscriptions.

## 6. Security

Firestore Security Rules are mandatory.

The backend must independently validate:
- Authentication.
- Document ownership.
- Connection ownership.
- Contact ownership.
- Broadcast ownership.
- Valid document relationships.

Firebase Admin SDK bypasses Firestore Security Rules.

Therefore, every Cloud Function using Admin SDK must implement its own authorization and validation.

Never assume that a frontend check provides security.

## 7. Firestore Indexes

Create composite indexes when required by queries.

Document indexes in firestore.indexes.json.

Typical combinations may include:
- ownerId + createdAt
- ownerId + connectionId
- ownerId + status + scheduledAt

Verify actual query requirements before creating indexes.

## 8. Data Integrity

Use Firestore transactions or batched writes when multiple related writes must succeed together.

Do not allow a broadcast to reference contacts belonging to another tenant or connection.

When deleting a connection, define and implement a safe strategy for its contacts and broadcasts.

Prefer explicit application-level deletion of related root-level documents rather than relying on subcollections or implicit cascades.
