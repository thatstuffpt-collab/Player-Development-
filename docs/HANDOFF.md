# Project Handoff — Fresh ChatGPT / Engineer

## Why this file exists

The initial product discovery happened conversationally with Brent and Shandon. Treat this repository as the durable handoff so a fresh engineering session can continue without reconstructing product discovery from chat history.

## People

### Shandon
Basketball trainer and product/domain owner for That's Tuff Performance Training. Shandon owns coaching workflow, drill progressions, evaluation logic, parent communication needs, and recruiting/player-development use cases.

### Brent
InnoTechByte software developer guiding the engineering process and the ChatGPT + GitHub workflow.

## Product behavior distilled

The useful chain is:

```text
player goal
-> training progression
-> meaningful benchmark evidence
-> periodic formal evaluation
-> updated development plan
-> visible progress for player/parent
-> approved recruiting/player profile
```

Normal training should capture meaningful results and progression points only, not every drill or repetition. Trainer judgment remains authoritative for formal ratings.

## Evaluation model

Current documented scale:

1. Building Foundation
2. Developing
3. Game Ready
4. Getting Tuff
5. Tuff

Current default 12-category evaluation:
- Ball Control
- Finishing
- Shooting
- Decision Making
- Playing Under Pressure
- Off-Ball Awareness
- On-Ball Defense
- Defensive Awareness
- Effort & Competitiveness
- Coachability
- Confidence
- Response to Mistakes

These 12 categories are the MVP default template, not a permanent universal schema. Historical evaluations must preserve the template meaning used at the time.

## Current engineering state — 2026-09-22

The real MVP stack is active:
- Next.js + TypeScript;
- Prisma 7;
- PostgreSQL 16 on Cloud SQL;
- Cloud Run;
- Artifact Registry;
- GitHub Actions;
- Secret Manager;
- Workload Identity Federation;
- Google Identity Platform / Firebase Authentication.

Cloud Run service:
`https://player-development-rx4wq25jsq-uc.a.run.app`

Trainer authentication has been verified end-to-end. Real player creation, profile data, baseline evaluation, normal-session persistence, Quick Logs, results/athletic testing, and related trainer workflows are connected to Cloud SQL.

## Reevaluation + development timeline batch

PR #27 implements the next Phase 2 increment and has passed CI. Production deployment and hands-on acceptance are still required before the README roadmap items should be treated as fully verified.

Implemented behavior:
- the player profile exposes a Reevaluation action after a baseline exists;
- reevaluation loads the athlete's latest saved evaluation rather than sample data;
- the previous evaluation remains unchanged;
- meaningful ProgressEvent/Quick Log evidence since the previous evaluation is surfaced during reevaluation;
- the trainer chooses new 1–5 ratings and may add trainer-only rating notes;
- saving creates a brand-new Evaluation record using the same historical template;
- saving separately closes the old active DevelopmentFocus and creates the updated focus;
- the updated short-term development goal is saved as a new development goal;
- the player profile now includes a chronological development timeline combining formal evaluations, meaningful progress events, athletic tests, and achievements.

The reevaluation API validates the 1–5 range and requires an existing baseline, 2–3 priorities, and an updated short-term goal.

## Validated trainer workflows

### Normal training session
At session open prioritize today's focus, persistent coach tags, current development focus, last meaningful result, active goals, editable practice plan, and a 10–20 second Quick Log. Quick Logs capture meaningful evidence and what it means next.

### New athlete / baseline
Three-step flow:
1. athlete intake;
2. 12-category baseline, with Not Assessed allowed;
3. first development plan with top 2–3 priorities and one short-term goal.

### Reevaluation
Approved flow:
- preserve previous evaluation unchanged;
- show meaningful evidence since it;
- compare previous rating to new trainer-selected rating;
- optional trainer explanation;
- save a brand-new historical evaluation;
- separately update active priorities and short-term goal.

## Parent / trainer privacy boundary

Parent-visible by default:
- player basics needed for the dashboard;
- goals;
- current/historical development focus;
- formal evaluation ratings/history and parent-safe summary/plan fields;
- achievements;
- assigned work;
- Quick Logs only when explicitly marked Parent Visible.

Trainer-only by default:
- TrainerNote records;
- PlayerCoachTag records;
- DOB and nonessential intake context;
- self-reported needs and playing-experience notes;
- training limitations;
- practice plans and internal session planning;
- evaluation observation tags, evidence, internal notes, rating-change explanation;
- ProgressEvent internal context/notes/next-time reminder;
- all Quick Logs unless explicitly Parent Visible.

A server-side Prisma allowlist defines the parent player view. UI hiding is never sufficient authorization.

## Authentication model

Identity: Google Identity Platform / Firebase Authentication.

Authorization: application-controlled User.role plus GuardianPlayer relationships.

Protected APIs verify Firebase ID tokens server-side and then apply application role/relationship authorization. Do not auto-create arbitrary signed-in Firebase users as application users.

## Current continuation — 2026-10-03

Shandon validated the Athlete Workspace V2 (Overview / Plan / Results / History) in production. The current priority is the Today Dashboard V2 and planned-workout workflow.

Product decision:
- planning a workout and starting a live session are separate actions;
- a trainer can build and save a workout before arriving at the gym;
- a saved workout is **Planned** until the trainer explicitly starts it;
- starting it changes it to **In Progress**;
- wrap-up completion changes it to **Completed**;
- the saved practice plan must survive leaving and returning to the app;
- Today should surface Planned and In Progress sessions for fast access.

Implementation approach:
- TrainingSession gains nullable `startedAt`;
- the migration backfills existing sessions with `startedAt = createdAt` so historical behavior remains unchanged;
- newly saved planned workouts keep `startedAt = null`;
- planned workouts can be edited before start;
- Today exposes planned workouts and in-progress sessions separately.

## Next action

Run CI for the Today Dashboard V2 / planned-workout PR. Fix ordinary failures automatically. After CI passes, deploy to Cloud Run using Shandon's explicit approval from the current development session, verify the migration and deployed-service checks, then have Shandon test: save a workout, leave the app, return later, reopen it, start it, Quick Log during training, and complete wrap-up.

## Engineering guidance

Do not confuse AI-assisted development with the application needing runtime AI. The MVP is deterministic CRUD/workflow/reporting/authorization.

Do not mark roadmap work complete just because code exists. Require verification. Keep README status/checklists and this handoff aligned with evidence.

Historical evaluations must never be overwritten. Historical benchmark/progress results must remain attributable to date/session/context. Trainer-private data must never be exposed through parent APIs.

## Current continuation — organization acceptance preparation

The next V2 milestone is the true multi-organization acceptance test. To make that test possible, the active branch adds organization staff invitations.

Current implementation direction:
- Owner/Admin can invite a trainer by email into the active organization.
- An invited trainer gets an organization membership without needing a separate duplicate login identity.
- First Firebase sign-in with the invited email binds the existing application User row.
- Existing trainer users can be added to another organization through an additional membership.
- Guardian accounts are not silently converted into trainer accounts.
- Organization staff roster shows Active vs Invited status.

After CI/deployment, acceptance should use a second organization and second trainer account, create athletes in both organizations, switch organizations, and verify that cross-organization athlete/session data cannot be read or changed.


## Current continuation — Parent / Guardian MVP

Shandon hands-on verified the true multi-organization acceptance test: a second organization/trainer can be used without mixing athlete/session data.

The active Parent MVP branch now implements:
- invited parent/guardian account setup using the email already connected by the trainer;
- Firebase sign-in binding to the existing GUARDIAN application user;
- a ParentAuthGate that rejects non-guardian accounts from /parent;
- /api/parent/players and /api/parent/players/[id] with explicit GuardianPlayer relationship checks;
- parent data returned only through parentPlayerSelect;
- a read-only parent dashboard for current focus, goals, evaluations, trainer-shared progress, achievements, and assigned work;
- no trainer notes, coach tags, practice plans, readiness/body check data, private evaluation notes/evidence, or non-parent-visible Quick Logs.

Next engineering checkpoint:
- run CI on the Parent MVP PR;
- fix lint/typecheck/build failures automatically;
- after CI is green, request production deployment approval;
- after deployment, test with a real invited guardian account and also verify that an unrelated guardian cannot open another athlete by direct URL/API path.
