# Current continuation — 2026-09-21

The current product-owner priority is the day-to-day trainer session workflow.

The public fake-data preview is `/preview/session-workflow`.

The latest validated decisions are documented in `docs/session-workflow-decisions.md`:
- practice plans are Section -> Drill, not flat section descriptions;
- Quick Log chooses drills already placed in today's practice plan;
- shooting drills use a court-spot dropdown;
- other/add-drill remains available for improvised work;
- Quick Logs are editable after save;
- external/camp evaluations using the same evaluation model with branded PDF export are a later feature.

Immediate continuation after this change:
1. Shandon walks through the deployed preview again and gives UX feedback.
2. Once accepted, translate the preview into the protected trainer workflow and persistence model.
3. Production schema should preserve reusable drill identity, session sections, plan drills, location-specific measurable results, body/readiness history, and planned-vs-actual context where useful.
4. Keep external/camp PDF evaluations in the backlog until the recurring-client session workflow is stable.

Do not add runtime AI for workout suggestions in MVP. Suggestions should remain deterministic/rules-based from structured focus, logs, templates, and readiness data unless the product owner explicitly reprioritizes runtime AI.
