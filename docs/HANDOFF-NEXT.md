# Current continuation — 2026-09-29

The current product-owner priority is connecting workout / practice-plan setup directly to the reusable drill Library.

## Current workflow direction

- Practice plans remain Section -> Drill.
- While building today's plan, a trainer should be able to add a drill from the master Library instead of retyping drill names.
- Library selection includes search and category filtering, with drills that fit the current section surfaced first.
- Custom drills remain available for improvised or new work.
- A drill selected from the Library keeps the canonical Library name and maps its primary basketball category into the session focus area when applicable.
- Quick Log continues to pull directly from the saved drills in today's practice plan.
- The Quick Log "Other / add drill" field also exposes Library names while still allowing custom entry.
- The full Library remains available at `/trainer/drills`.

## Immediate continuation

1. Deploy and mobile-test the Library -> workout-builder integration.
2. Verify search, category filters, drill selection, custom drill entry, session save, and Quick Log behavior on iPhone-sized screens.
3. After acceptance, expand Library beyond drills into reusable workout / practice-plan templates without duplicating canonical drills.
4. Continue the V2 trainer information architecture and organization/staff work after the core coaching workflow is stable.

Do not add runtime AI for workout suggestions in MVP. Suggestions should remain deterministic/rules-based from structured focus, logs, templates, readiness data, and Library metadata unless the product owner explicitly reprioritizes runtime AI.
