# Design Rules for Claude Code

These rules are mandatory when creating or modifying frontend screens and components.

## Source of truth

- Read `@DESIGN_GUIDELINES.md` before implementing or significantly changing any screen.
- `DESIGN_GUIDELINES.md` is the source of truth for colors, typography, spacing, interaction states, responsive behavior and UX standards.
- When the owner updates the design guidelines, follow the latest version. Do not preserve an older visual choice over a newer explicit instruction.
- The SendFlow website is a visual reference only. Do not copy logos, proprietary assets, marketing sections or exact branded compositions.

## Required UX quality

- Treat spacing, alignment, readability, responsive behavior and accessibility as functional requirements, not optional polish.
- Prevent text overlap, clipped labels, hidden actions, broken layouts and unintended scrollbars.
- Do not use fixed heights for variable text content. Use flexible layout, wrapping and appropriate overflow handling.
- For flex/grid children containing text, verify `min-width: 0` where needed.
- If text is truncated, provide a way to inspect the full value.
- Every interactive element must have appropriate default, hover, focus-visible, active, disabled and loading states.
- Hover must improve affordance and visibility, but essential information/actions must also work on touch and keyboard.
- Disabled controls must look disabled. Explain why an action is unavailable whenever the reason is not obvious, and show how the user can make it available.
- Never rely only on color to communicate status, errors or availability.
- Provide clear loading, empty, success and error states.
- Prevent duplicate form submissions while an operation is in progress.
- Confirm destructive actions when they can cause meaningful data loss.

## Implementation conventions

- Use Material UI for common interface components and Tailwind CSS mainly for layout and responsive utilities.
- Reuse the existing theme and shared components. Do not introduce arbitrary color, spacing, radius or shadow values when design tokens already exist.
- Do not add another component or icon library without approval.
- Check the screen at desktop, tablet and mobile sizes.
- Respect keyboard navigation, visible focus, readable contrast and reduced-motion preferences.
- Before reporting completion, run the design checklist in `DESIGN_GUIDELINES.md` and fix applicable issues. Mention any issue that could not be verified or resolved.

## Product-specific semantics

- The broadcast feature simulates sending. Do not use UI copy that implies a real WhatsApp/SMS message was delivered by an external provider.
- Use consistent labels for scheduled and sent states.
- Keep all screen behavior consistent with the backend rules and assessment requirements.
