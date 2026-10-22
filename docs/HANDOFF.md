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


## Current continuation — Account switching / logout

During Parent MVP acceptance, Shandon found that the app had no visible logout control.

The active branch adds:
- a reusable Firebase sign-out control;
- trainer logout in the desktop navigation;
- trainer logout in the Organization page so it is reachable on mobile;
- parent/guardian logout in the parent navigation;
- cleanup of the active organization localStorage key on logout before returning to /login.

After CI passes, deploy this change and continue Parent MVP acceptance with a fake athlete + guardian account.

## Current continuation — automated application/domain tests

The next Phase 1 foundation increment adds the repository's first automated application/domain test suite.

Implemented on the active branch:
- a shared pure evaluation-rating parser enforcing integer ratings 1–5 while preserving Not Assessed as null;
- baseline and reevaluation APIs both use that shared deterministic rule;
- Node's built-in test runner covers valid/invalid rating behavior;
- privacy-invariant tests lock down the parent-facing Player allowlist, ensure trainer-only fields remain excluded, and require only explicitly parent-visible ProgressEvents;
- package.json exposes `npm test`;
- GitHub CI now runs tests after typecheck and before the production build.

Verification status:
- PR #45 passed lint, typecheck, the new automated Test step, and production build on GitHub Actions;
- the README roadmap item is now checked off because implementation and CI verification are complete;
- the remaining step is a final CI rerun after documentation updates;
- if that final CI remains green and PR #45 is mergeable, request Shandon's explicit approval before merging, because merging to main triggers the production Cloud Run workflow.

Immediate continuation:
- do not merge or deploy without Shandon's approval;
- after a successful production deployment, continue from the first eligible incomplete MVP roadmap item.

## Current continuation — player edit/archive acceptance

PR #45, which added the automated application/domain testing foundation, has been merged to `main` and successfully deployed to Cloud Run. CI, automated tests, database migration, and deployed-service verification all passed.

The next eligible incomplete Phase 2 roadmap item is **Player create/edit/archive**.

Current implementation state:
- player creation is already hands-on verified;
- editing is implemented through the protected trainer player PATCH route and athlete profile edit form;
- archiving is implemented as a soft archive using `archivedAt`, preserving the athlete's historical data;
- active player lists exclude archived athletes;
- permanent deletion exists separately and must not be used for acceptance testing.

Immediate continuation:
1. use an obvious test athlete;
2. edit several profile fields and save;
3. leave and reopen the athlete to confirm persistence;
4. archive the athlete;
5. confirm the athlete is removed from the active Players list;
6. if all checks pass, mark **Player create/edit/archive** complete in README and continue to the next eligible incomplete MVP item.

Do not mark the roadmap item complete until Shandon finishes the hands-on production acceptance.



## Current continuation — 2026-10-17 MVP acceptance status

Shandon completed the broad production MVP acceptance pass. The trainer core workflow, player create/edit/archive, goals, baseline evaluation, historical reevaluation behavior, meaningful progress logging, development timeline, achievements, assigned work, trainer-private notes, mobile trainer workflow, parent authentication/onboarding/dashboard views, parent privacy boundary, unrelated-guardian denial, and laptop/tablet evaluation workflow were reported working.

PR #51 was merged to `main`, passed CI, and deployed successfully to Cloud Run. It addressed the acceptance issues found during that pass:
- planned-workout saves are re-read from the server before the UI confirms success;
- shooting Quick Logs include Free Throw Line (15 ft) and a descriptive custom-location field;
- Quick Logs can be explicitly shared/unshared with parents from the live session and athlete Results view;
- parents receive only the athlete's starting evaluation and latest/current evaluation while trainers retain the full history.

Remaining focused acceptance:
1. retest planned workout save → leave → reopen → start → complete;
2. retest share/unshare of a Quick Log against the parent account;
3. retest parent starting/latest evaluation presentation while trainer history remains complete;
4. approve or refine session wrap-up auto-fill behavior.

Remaining launch-readiness work after those checks: unauthenticated negative-path verification, basic backup/recovery procedure, production privacy/consent decisions for real minor data, and Shandon's final acceptance walkthrough.

Do not mark **MVP COMPLETE** until those remaining checks and launch-readiness items are closed.


## Current continuation — 2026-10-18 group/camp practice planning

Shandon promoted a new coach workflow into the MVP before final sign-off: a standalone practice-plan builder for group sessions and camps.

Product decision:
- reuse the same Section -> Drill builder and Master Drill Library used when planning an individual session;
- do not require a player, live-session state, Quick Log, readiness check, or wrap-up;
- save reusable group/camp plans at the active organization/tenant level;
- support both Group Session and Camp plan types;
- include plan title, optional date/time, overall coach/staff notes, section notes, drill notes, and library/custom drills;
- provide a coach-facing printable layout so the browser can print the plan or save it as a PDF for staff distribution.

Implementation branch: `feat/group-camp-practice-plans`.

Do not mark the roadmap item complete until CI/deployment and a production save -> reopen/edit -> Print/Save PDF acceptance check pass.


## Current continuation — 2026-10-19 manageable drill library

Shandon likes the deployed Group/Camps workflow and wants the Drill Library cleaned up before final MVP sign-off. The hard-coded starter library contains duplicate/overlapping terminology and the website had no upload-management flow.

The active branch adds a tenant-scoped Drill model and Library management workflow. The trainer can download a CSV template, rebuild the master list in Excel/Google Sheets, upload and preview it, then Replace Library or Add/Update drills. One official name is stored per drill; alternate names/aliases remain searchable. Name normalization collapses punctuation/case differences, while genuinely different wording should be consolidated by Shandon into the Aliases column. The starter library remains a fallback/reset option. Individual-session and Group/Camp workout builders load the active tenant library through the protected trainer API.

Acceptance after deployment: download template; upload a cleaned CSV; verify duplicate official-name warning; replace library; search a drill by alias; add an uploaded drill to an individual workout; add an uploaded drill to a Group/Camp plan; verify another organization does not inherit the custom library.
