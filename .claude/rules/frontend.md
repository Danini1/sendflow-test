
# Frontend Development Rules

## 1. Technology

- React
- TypeScript
- Vite
- Material UI
- Tailwind CSS
- Firebase Web SDK
- React Hooks

## 2. Architecture

Follow a feature-based folder structure.

Recommended structure:

web/src/
  assets/
  components/
    layout/
    common/
  features/
    auth/
      components/
      hooks/
      services/
      types/
    connections/
      components/
      hooks/
      services/
      types/
    contacts/
      components/
      hooks/
      services/
      types/
    broadcasts/
      components/
      hooks/
      services/
      types/
  hooks/
  lib/
    firebase/
  routes/
  types/
  utils/

Adapt the structure to existing files instead of duplicating folders.

## 3. Functional Programming

Do not use classes.

Use:
- Functional components.
- Custom hooks.
- Pure utility functions.
- Function composition when appropriate.
- TypeScript interfaces and type aliases.

Avoid unnecessary state and side effects.

## 4. Component Responsibilities

Components:
- Render the interface.
- Receive data through props.
- Emit user interactions through callbacks.

Hooks:
- Manage React state.
- Coordinate application logic.
- Subscribe to real-time Firestore updates.

Services:
- Encapsulate Firebase operations.
- Implement CRUD operations.
- Handle data access and query construction.

Types:
- Define Firestore document models.
- Define form values.
- Define service contracts.

Do not place large Firestore queries inside visual components.

## 5. Firebase Integration

Initialize Firebase in a centralized module.

Recommended files:
- lib/firebase/config.ts
- lib/firebase/auth.ts
- lib/firebase/firestore.ts

Use environment variables for Firebase client configuration.

Never import firebase-admin into the frontend.

Use the authenticated Firebase user as the source of tenant identity.

## 6. Authentication

Implement:
- Registration.
- Login.
- Logout.
- Authentication state persistence.
- Protected routes.

Use Firebase Authentication.

Do not allow unauthenticated access to protected application pages.

Create the corresponding user document after successful registration.

Handle loading and authentication errors.

## 7. CRUD Operations

Every feature must support the required operations.

Connections:
- Create.
- Read.
- Update.
- Delete.

Contacts:
- Create.
- Read.
- Update.
- Delete.

Broadcasts:
- Create.
- Read.
- Update.
- Delete.

Always scope queries to the authenticated user.

## 8. Real-Time Data

Prefer Firestore onSnapshot for:
- Connections lists.
- Contacts lists.
- Broadcast lists.
- Broadcast status changes.

Manage subscription cleanup correctly.

Avoid redundant listeners.

## 9. UI Libraries

Use Material UI for:
- Inputs.
- Dialogs.
- Menus.
- Tables.
- Selects.
- Buttons.
- Feedback components.

Use Tailwind CSS for:
- Layout.
- Spacing.
- Responsive behavior.
- Flexbox and Grid.
- Utility-based styling.

Avoid conflicting styling responsibilities.

Do not introduce another UI library without approval.

## 10. Forms and Validation

Use controlled forms where appropriate.

Validate:
- Required fields.
- Phone numbers.
- Message content.
- Selected contacts.
- Scheduling date and time.

Provide clear validation feedback.

Prevent invalid submissions.

## 11. UX Requirements

Every screen should handle:
- Loading states.
- Empty states.
- Error states.
- Success feedback.
- Responsive layouts.

Use confirmation dialogs for destructive operations.

Do not use browser alert() or confirm() as the default UI experience.

## 12. Performance

Avoid unnecessary re-renders.

Use useMemo and useCallback only when beneficial.

Use pagination or limits for potentially large Firestore lists.

Clean up subscriptions and event listeners.

## 13. Code Quality

- Avoid any.
- Avoid giant components.
- Avoid duplicated business logic.
- Use descriptive naming.
- Keep files focused.
- Prefer reusable components.
- Maintain strict TypeScript compatibility.

Before finishing, run the available frontend build and lint commands.
