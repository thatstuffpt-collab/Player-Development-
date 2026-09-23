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

## Next action

Finish PR #27 documentation, let CI verify the final PR head, squash-merge only after required checks pass, then verify the main-branch Deploy to Cloud Run workflow including the Verify deployed service step. After successful deployment, Shandon should hands-on test one existing athlete by completing a reevaluation and confirming both the old and new evaluations remain represented in history, then review the chronological development timeline for evaluation, Quick Log/result, athletic-test, and achievement entries.

After this acceptance pass, continue the Phase 2 trainer workflow from the first eligible incomplete README item, with Achievements and Assigned Work as the next product capabilities unless an earlier implemented-but-unverified item still needs acceptance.

## Engineering guidance

Do not confuse AI-assisted development with the application needing runtime AI. The MVP is deterministic CRUD/workflow/reporting/authorization.

Do not mark roadmap work complete just because code exists. Require verification. Keep README status/checklists and this handoff aligned with evidence.

Historical evaluations must never be overwritten. Historical benchmark/progress results must remain attributable to date/session/context. Trainer-private data must never be exposed through parent APIs.