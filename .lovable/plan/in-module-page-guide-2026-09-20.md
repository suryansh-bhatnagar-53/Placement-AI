# In-module page guide

## Scope
- Keep the dashboard tour bulb available after tour completion so users can replay the tour.
- Add one shared, static guide control and right-side panel to the six existing modules only.
- Preserve all module behavior, onboarding, architecture pages, and tour content.

## Implementation
- Create a reusable guide layout with six module-specific copy entries.
- Type A (Interview, Resume, AI Guide): reserve a right column while open so the module remains usable without overlap.
- Type B (Performance, Roadmap, Cheat Sheet): keep the module in place and animate it to invisible while the right panel opens.
- On mobile, use a full-width in-flow guide view with the module temporarily hidden and restored on close.
- Keep panel state local to each mounted screen; navigation resets it.

## Verification
- Check all six pages at desktop and mobile widths, including toggle labels, panel scrolling, transitions, and preserved layout.
- Run the existing focused tests and TypeScript check through the project harness.
