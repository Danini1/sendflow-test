
# Backend Development Rules

## 1. Technology

- Firebase Cloud Functions.
- TypeScript.
- Firebase Admin SDK.
- Cloud Firestore.

## 2. Architecture

Use a modular functional structure.

Recommended structure:

functions/src/
  index.ts
  config/
  modules/
    broadcasts/
      broadcast.service.ts
      broadcast.scheduler.ts
      broadcast.validators.ts
      broadcast.types.ts
    connections/
    contacts/
    auth/
  shared/
    validators/
    utils/

Adapt to the existing project setup.

Do not create classes.

## 3. Cloud Functions

Use the Firebase Functions SDK.

Prefer:
- onCall for authenticated client-triggered operations.
- onSchedule for scheduled background processing.
- onRequest only when an HTTP endpoint is explicitly necessary.

Keep function handlers small.

Move business logic into reusable service functions.

## 4. Authentication and Authorization

For callable functions:
- Require an authenticated user.
- Obtain UID from request.auth.uid.
- Never trust ownerId from request.data.
- Validate all document references.
- Verify tenant ownership before processing.

Firebase Admin SDK bypasses Firestore Security Rules.

Implement explicit backend authorization.

## 5. Broadcast Processing

The application does not send real messages.

Sending is a simulation.

Immediate broadcast:
- Validate the authenticated user.
- Validate connection ownership.
- Validate selected contact ownership.
- Validate contact relationship with the connection.
- Update the broadcast status to sent.
- Set sentAt using a server timestamp.

Scheduled broadcast:
- Store status as scheduled.
- Store scheduledAt as a Firestore Timestamp.
- Do not execute the broadcast before its scheduled time.

## 6. Automatic Scheduling

Implement a scheduled Cloud Function using onSchedule.

The function must:
1. Execute periodically.
2. Query broadcasts with status == scheduled.
3. Find documents where scheduledAt <= current server time.
4. Process eligible documents.
5. Change status to sent.
6. Set sentAt.
7. Update updatedAt.

The process must work even when no frontend client is connected.

Use UTC internally and Firestore Timestamp for date storage.

Do not rely on browser timers or frontend setTimeout.

## 7. Reliability

The scheduling process must be safe against duplicate processing.

Consider:
- Concurrent executions.
- Multiple function instances.
- Repeated scheduler invocations.
- Atomic status transitions.
- Batch processing and query limits.

Use transactions when needed to prevent multiple workers from processing the same broadcast.

Do not mark a broadcast as sent before its simulated processing succeeds.

## 8. Editing and Deletion

Define clear rules for editing and deleting scheduled broadcasts.

Recommended behavior:
- Scheduled broadcasts can be edited.
- Scheduled broadcasts can be deleted.
- Sent broadcasts cannot be edited.
- Sent broadcasts cannot be deleted unless the assessment explicitly requires otherwise.

If changing these rules, document the decision and keep frontend and backend behavior consistent.

## 9. Firestore

Use root-level collections only.

Do not create subcollections.

Use serverTimestamp for server-controlled timestamps.

Use Firestore transactions for operations that require atomicity.

Keep queries efficient and create the necessary composite indexes.

## 10. Validation

Validate:
- Message content is not empty.
- At least one contact is selected.
- All selected contacts exist.
- All selected contacts belong to the specified connection.
- The connection belongs to the authenticated user.
- Scheduled date is valid and in the future when scheduling.

Reject invalid requests with appropriate HttpsError codes.

## 11. Environment and Secrets

Never expose Firebase Admin credentials in the frontend.

Never commit secrets or private keys.

Use Firebase-managed credentials in deployed Cloud Functions.

## 12. Testing

Test:
- Authentication requirements.
- Tenant isolation.
- Invalid references.
- Immediate broadcast simulation.
- Future scheduling.
- Due broadcast processing.
- Repeated scheduler execution.
- Unauthorized operations.

Run the backend build and lint commands before finishing.


## 13. Broadcast Editing and Deletion

Owner decision: only scheduled broadcasts can be edited. Sent broadcasts are history and can only be deleted.

Scheduled broadcasts support editing and deletion. Sent broadcasts support deletion only.

When editing a scheduled broadcast, validate its scheduling information and selected contacts. Without a scheduled date, it is sent immediately.

The backend must reject editing a sent broadcast (`failed-precondition`), inside the same transaction that reads the document, so a broadcast sent by the scheduler while the form was open is also rejected.

The frontend must show the edit action as disabled for sent broadcasts, explaining why.

When deleting a broadcast, remove the corresponding Firestore document after validating ownership.

Keep frontend and backend behavior consistent.
