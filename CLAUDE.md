
# SENDFLOW — PROJECT INSTRUCTIONS

## 1. Project Overview

Sendflow is a simplified SaaS multi-tenant broadcast management application.

The application allows authenticated customers to:
- Create and manage connections.
- Create and manage contacts associated with connections.
- Create and manage message broadcasts.
- Send messages immediately (simulation only).
- Schedule messages for future delivery.
- Monitor scheduled and sent messages.

## 2. Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Material UI (MUI)
- Tailwind CSS
- Firebase Web SDK

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Firebase Admin SDK
- TypeScript

### Project Structure
- `/web`: frontend application.
- `/functions`: backend Cloud Functions.
- Root directory: Firebase configuration and project documentation.

## 3. Mandatory Architectural Rules

- Follow functional programming principles.
- DO NOT use classes or object-oriented programming.
- Prefer pure functions whenever applicable.
- Use TypeScript with explicit and meaningful types.
- Keep components small and focused.
- Separate UI, business logic and data access.
- Avoid duplicated logic.
- Use reusable components and hooks.
- Avoid unnecessary abstractions.
- Follow the existing project structure.
- Do not introduce new dependencies without a clear reason.

## 4. Multi-Tenant Architecture

The application must isolate all customer data.

Firebase Authentication UID is the tenant identifier.

Every tenant-owned document must contain an `ownerId` field.

The ownerId must always be obtained from the authenticated user, never trusted from frontend input.

A customer must NEVER:
- Read another customer's data.
- Create documents owned by another customer.
- Update documents owned by another customer.
- Delete documents owned by another customer.

Firestore Security Rules must enforce tenant isolation.

Cloud Functions must independently validate ownership when processing requests.

Never rely exclusively on frontend validation for security.

## 5. Firestore Rules

- Use root-level collections only.
- DO NOT use Firestore subcollections.
- Validate authentication and document ownership.
- Validate required fields and data types.
- Prevent changes to ownerId after document creation.
- Validate relationships between connections, contacts and broadcasts.
- Use server-side timestamps when appropriate.

## 6. Broadcast Requirements

Messages must support:

- Immediate sending (simulation only).
- Future scheduling.
- Multiple selected contacts.
- Scheduled and sent statuses.
- Listing and filtering.
- Editing and deletion.

Allowed statuses:
- scheduled
- sent

Scheduled messages must be processed automatically by Cloud Functions.

The scheduling process must not depend on the frontend being open.

No real SMS, WhatsApp or external messaging integration is required.

## 7. Development Workflow

Before implementing a new feature:

1. Inspect the existing project structure.
2. Read the relevant configuration and source files.
3. Identify dependencies and existing implementations.
4. Explain the proposed implementation briefly.
5. Implement the feature following existing conventions.
6. Run the appropriate build, lint and tests.
7. Report changed files and remaining issues.

Do not rewrite working code unnecessarily.

Do not silently change architectural decisions.

If a requirement is ambiguous, explain the ambiguity before making assumptions.

## 8. Code Quality

- Avoid using `any`.
- Prefer interfaces and type aliases for data contracts.
- Use descriptive names.
- Handle loading, error and empty states.
- Avoid unnecessary useEffect hooks.
- Avoid business logic directly inside large UI components.
- Use async/await consistently.
- Handle Firebase errors appropriately.
- Keep functions focused on a single responsibility.

## 9. Documentation

When implementing significant features:
- Document relevant architectural decisions.
- Keep types and interfaces synchronized with Firestore models.
- Update Firestore indexes when required.
- Update Security Rules when data access requirements change.
- Explain any non-obvious implementation decisions.

## 10. Mandatory Constraints

- Do not use Firestore subcollections.
- Do not use object-oriented programming.
- Do not implement real message delivery.
- Do not expose Firebase Admin SDK in the frontend.
- Do not expose secrets or private credentials.
- Do not bypass Firestore Security Rules.
- Do not change the required technology stack without approval.

## 11. Project Documentation References

Read the following files when relevant:

- @.claude/rules/architecture.md
- @.claude/rules/frontend.md
- @.claude/rules/backend.md
- @.claude/rules/design.md
- @DESIGN_GUIDELINES.md

These files contain additional architectural, implementation and visual guidelines.

## 12. Agent Behavior

Act as a senior full-stack software engineer.

Prioritize correctness, simplicity, maintainability and security.

Do not implement features beyond the assessment requirements unless explicitly requested.

When asked to implement a feature, prefer completing the entire requested workflow instead of delivering isolated UI components.

Always verify that the implementation respects the existing architecture.
