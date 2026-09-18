# That's Tuff Player Development

This repository is the durable source of truth for the That's Tuff Player Development product, roadmap, and engineering handoff.

## Product goal

Build a secure, mobile-first player-development system that lets Shandon manage long-term athlete development without turning normal training into constant data entry.

The core product loop is:

```text
player goal
-> training progression
-> meaningful benchmark evidence
-> periodic formal evaluation
-> updated development plan
-> visible progress for player/parent
```

Trainer judgment remains authoritative for formal ratings. The software should organize, preserve, and present evidence; it should not replace coaching judgment.

## MVP finish line

The MVP is complete when Shandon can use the app for real recurring clients from his phone or laptop and complete the full weekly development workflow securely.

A successful MVP must allow Shandon to:

- sign in as the trainer;
- create and edit a player;
- record player profile information;
- record big-picture and specific development goals;
- complete a baseline evaluation using the documented 1–5 That's Tuff scale;
- create later reevaluations without overwriting prior evaluations;
- record meaningful benchmark/progression results without logging every drill or repetition;
- see a chronological development history;
- create and update a next-session/development focus;
- create and complete achievements;
- assign workouts or development work;
- keep trainer-private notes that are never exposed to parents;
- invite/connect a parent or guardian;
- allow a parent to securely sign in and view only their own athlete's approved development information;
- use the core trainer workflow comfortably on a phone in the gym;
- use the deeper evaluation/history workflow comfortably on a laptop or tablet;
- persist all real application data in Cloud SQL PostgreSQL;
- deploy automatically from GitHub through GitHub Actions to Cloud Run;
- pass the MVP security and history tests listed below.

The MVP is **not complete** merely because screens exist. The full trainer-to-parent workflow must work against the real database in the deployed environment.

## MVP scope

### Included in MVP

#### Trainer experience
- Trainer authentication
- Player create/edit/archive
- Player profile
- Goals
- Baseline evaluation
- Reevaluation history
- Meaningful benchmark/progression events
- Development timeline
- Next-session/development focus
- Achievements
- Assigned workouts
- Trainer-private notes
- Mobile-first trainer workflow

#### Parent/guardian experience
- Secure parent/guardian authentication
- Parent-to-player relationship
- Read-only approved player development view
- Current goals
- Evaluation history/progress
- Achievements
- Assigned workouts/development work
- Current development focus
- No trainer-private notes

#### Evaluation model
Current default rating scale:

1. Building Foundation
2. Developing
3. Game Ready
4. Getting Tuff
5. Tuff

Current default evaluation categories:

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

These categories are the first MVP template, not a permanent universal schema. Historical evaluations must preserve the meaning of the template used at the time.

### Explicitly out of MVP

These are valuable, but they do not block MVP completion:

- public/recruiter shareable profiles;
- college coach access;
- highlight-video hosting;
- social/recruiting links;
- camp intake and mass camp evaluation;
- advanced college/pro evaluation templates;
- full drill library;
- automatic benchmark-to-rating decisions;
- AI-generated player ratings or coaching decisions;
- player logins;
- native iOS/Android apps;
- payments/billing;
- PDFs or printable reports unless later promoted into MVP;
- public profile publishing;
- complex analytics beyond basic progress/history views.

These should be added after the recurring-client + parent workflow is stable.

## Chosen application stack

- Framework: Next.js
- Language: TypeScript
- Database: PostgreSQL 16
- ORM/data layer: Prisma
- Application hosting: Google Cloud Run
- Database hosting: Google Cloud SQL
- Container registry: Google Artifact Registry
- CI/CD: GitHub Actions
- Secrets: Google Secret Manager
- GitHub-to-Google authentication: Workload Identity Federation

Authentication implementation is still to be finalized. It must support secure trainer and parent/guardian access and server-side authorization.

## Infrastructure

Google Cloud project: `thats-tuff-player-development`

Primary region: `us-central1`

Cloud SQL instance: `player-development-db`

Application database: `player_development`

Application DB user: `player_app`

Artifact Registry repository: `player-development`

Cloud Run runtime service account:

`player-development-runtime@thats-tuff-player-development.iam.gserviceaccount.com`

GitHub deployer service account:

`github-deployer@thats-tuff-player-development.iam.gserviceaccount.com`

The Cloud Run service remains private by default until authentication and any future public-profile policy are deliberately implemented.

## Delivery roadmap

Checkboxes may only be marked complete when the result is implemented and verified. File creation alone is not completion.

### Phase 0 — Product and infrastructure decisions

- [x] Capture durable product handoff
- [x] Define core player-development outcome
- [x] Define current 1–5 rating scale
- [x] Capture current 12-category evaluation template
- [x] Establish meaningful-result-not-every-rep UX principle
- [x] Establish historical evaluation preservation requirement
- [x] Establish trainer-private-note privacy boundary
- [x] Choose Google Cloud infrastructure
- [x] Choose Next.js + TypeScript + Prisma + PostgreSQL application stack
- [x] Create Google Cloud project
- [x] Create Artifact Registry repository
- [x] Create Cloud SQL PostgreSQL instance and application database
- [x] Create application database user and Secret Manager password
- [x] Create runtime and deployment service accounts
- [x] Configure GitHub Workload Identity Federation
- [x] Verify GitHub Actions can authenticate to Google Cloud
- [x] Add automated container build/deploy workflow
- [x] Verify first automated Cloud Run deployment is fully successful
- [ ] Validate trainer normal-session UX
- [ ] Validate new-client/baseline-evaluation UX
- [ ] Validate reevaluation UX
- [ ] Finalize MVP parent-visible field set
- [ ] Finalize trainer-private field set
- [ ] Choose authentication implementation

### Phase 1 — Real application foundation

- [x] Replace temporary Python health app with Next.js + TypeScript
- [x] Add Prisma
- [ ] Connect Prisma securely to Cloud SQL
- [ ] Create initial database schema and migrations
- [x] Add local development configuration with no committed secrets
- [ ] Add automated tests and CI checks
- [x] Add production health/readiness endpoint
- [x] Verify Next.js application deploys successfully to Cloud Run

### Phase 2 — Trainer core workflow

- [ ] Trainer authentication
- [ ] Player create/edit/archive
- [ ] Player profile
- [ ] Big-picture goals
- [ ] Development goals
- [ ] Baseline evaluation
- [ ] Historical reevaluations
- [ ] Meaningful benchmark/progression event logging
- [ ] Development timeline
- [ ] Next-session/development focus
- [ ] Achievements
- [ ] Assigned workouts
- [ ] Trainer-private notes
- [ ] Mobile gym workflow usability pass

### Phase 3 — Parent/guardian MVP

- [ ] Parent/guardian authentication
- [ ] Guardian-player relationship
- [ ] Parent invitation/onboarding flow
- [ ] Parent read-only player dashboard
- [ ] Parent evaluation/progress history
- [ ] Parent goals view
- [ ] Parent achievements view
- [ ] Parent assigned-work view
- [ ] Parent current-focus view
- [ ] Verify private trainer fields are never returned to parents

### Phase 4 — MVP verification and launch readiness

- [ ] Validate rating range 1–5
- [ ] Verify later evaluations cannot overwrite historical evaluations
- [ ] Verify historical template meaning remains reconstructable
- [ ] Verify parent cannot access trainer-private notes
- [ ] Verify unauthenticated users cannot access protected player data
- [ ] Verify one guardian cannot access an unrelated player's protected record
- [ ] Verify server-side authorization rather than UI-only hiding
- [ ] Verify mobile trainer workflow with a real training scenario
- [ ] Verify laptop/tablet evaluation workflow
- [ ] Verify deployed Cloud Run app uses Cloud SQL and Secret Manager correctly
- [ ] Complete basic backup/recovery procedure
- [ ] Complete production privacy/consent decisions required for real minor data
- [ ] Shandon performs final MVP acceptance walkthrough
- [ ] MVP COMPLETE

## Definition of MVP acceptance

Before the final checkbox can be marked complete, Shandon must be able to walk through this scenario in the deployed application:

1. Sign in as trainer.
2. Create a new athlete.
3. Record athlete information and goals.
4. Complete a baseline evaluation.
5. Add a private trainer note and next-session focus.
6. Record at least one meaningful progression/benchmark event.
7. Complete a later reevaluation and see both evaluations preserved.
8. Add an achievement and assign development work.
9. Connect a parent/guardian.
10. Sign in as that parent and see the approved athlete progress.
11. Confirm the parent cannot access the private trainer note.
12. Confirm an unrelated user cannot access the athlete.
13. Use the trainer workflow successfully on a phone-sized screen.

If any of those core steps fails, the MVP is not complete.

## README progress rule

This README is the project's active work board.

Every meaningful engineering session must:

1. read this README before starting;
2. work from the first eligible incomplete roadmap item unless Shandon gives a different priority;
3. update the relevant checkbox only after implementation and verification;
4. add newly discovered required work to the appropriate phase instead of silently doing untracked work;
5. update `docs/HANDOFF.md` when the immediate continuation point or a major product decision changes;
6. never mark work complete based only on intention, code generation, or file existence;
7. leave the **Next action** below accurate before ending the session.

## Next action

Validate the trainer normal-session UX with Shandon: define what he needs to see when opening a player during a session, what qualifies as a meaningful result worth saving, and the fastest acceptable interaction for recording it. Then use that decision to finalize the first trainer workflow and database migration.

## Product behavior and invariants

- Normal training data entry must be quick and purposeful.
- Do not require logging every drill or repetition.
- Historical evaluations must never be silently overwritten.
- Historical benchmark/progress results must remain attributable to date/session/context.
- Trainer-private notes must never be exposed to parents.
- UI hiding is not authorization.
- Camp history should eventually remain attached to the same player identity if a camp participant becomes a recurring client.
- Progress views must derive from historical records rather than mutable current fields alone.
- Runtime AI is not required for the MVP.

## Youth/minor privacy boundary

This product handles youth-athlete information.

Before production use with real minors, the project must define and verify:
- parent/guardian access and ownership;
- private-note enforcement;
- appropriate personal-information minimization;
- media/highlight consent expectations where applicable;
- authorization negative paths.

A future public recruiting profile and a parent-authenticated profile must be treated as separate authorization surfaces.

## Repository guidance

Read `AGENTS.md` and `docs/HANDOFF.md` before substantive product or engineering changes.
