# Project Handoff — Fresh ChatGPT / Engineer

## Why this file exists

The initial product discovery happened conversationally with Brent and Shandon.

The intended workflow is for this GitHub repository to be cloned/shared with Shandon and then continued by a different ChatGPT session. That next session may have **none of the original conversation context**.

Treat this repository as the durable handoff.

## People

### Shandon
Basketball trainer and product/domain owner for That's Tuff Performance Training.

Shandon knows the coaching workflow, drill progressions, evaluation logic, parent communication needs, and recruiting/player-development use cases.

### Brent
InnoTechByte software developer guiding the engineering process and showing Shandon how to use ChatGPT + GitHub as an AI-assisted development workflow.

The intent is not for Shandon to become a programmer before using the system. The repository and AI engineering workflow should let his basketball expertise drive product decisions while engineering structure remains durable and reviewable.

## What has already been learned

Do not ask the product owner to repeat these unless something conflicts.

### Existing workflow
Shandon currently keeps individual client information in notes/files:
goals;
achievements;
current progress toward goals;
starting evaluation;
reevaluations every roughly two weeks to one month;
trainer observations;
planning for what to do next.

He also evaluates players at camps.

### Product outcome
He wants a better system that:
tracks long-term development;
demonstrates progress to parents;
can present a complete player profile to college coaches;
includes highlight video;
preserves the evidence behind progress;
keeps private trainer notes hidden from parents.

### Evaluation model
Current documented scale:

1. Building Foundation
2. Developing
3. Game Ready
4. Getting Tuff
5. Tuff

Current documented 12-category evaluation:
Ball Control
Finishing
Shooting
Decision Making
Playing Under Pressure
Off-Ball Awareness
On-Ball Defense
Defensive Awareness
Effort & Competitiveness
Coachability
Confidence
Response to Mistakes

Shandon also mentioned speed/agility-type development, so these 12 are **not** assumed to be the permanent universal schema.

Youth/foundation athletes and advanced college/pro athletes should not necessarily use the same evaluation template.

### How ratings are supported
Ratings are not meant to be arbitrary numbers.

Shandon uses drill performance and progression benchmarks as evidence. Examples may include:
time to complete a defined number of combinations;
makes/attempts;
repetitions;
successful execution under pressure;
progression into live/game-like contexts.

However, benchmark evidence should support—not automatically replace—Shandon's coaching judgment.

### Ball-control progression example
The first progression discussed was:
text
stationary dribbling
-> low and waist-level control
-> crossover / between / behind
-> combinations
-> timed combination benchmark
-> hands-match-the-feet coordination
-> live defender / guide hand
-> realistic live reads / game situations

This is an example proving that progressions exist. It is not yet a fully specified production drill library.

### Normal training data capture
Shandon does **not** want to log every drill/repetition.

He wants to capture meaningful results and progression points only.

This is an important UX constraint: data entry during training should be quick and purposeful.

### Goals
Both types are required:
big-picture goals (example: make varsity, play college basketball);
specific development goals (example: improve a skill/rating or pass a benchmark).

### Achievements
Flexible achievement types are desired:
team selections;
awards;
offers;
personal milestones;
rating improvements;
training-level milestones;
camp recognition;
other meaningful accomplishments.

### Access model
Shandon wants parent logins.

Parents should see their child's development information but **not** Shandon's private notes.

Shandon also described separate trainer-only planning notes used to remember what to work on in the next session.

The coach/recruiter experience should be a polished shareable profile containing approved information such as:
player photo;
age/class year;
height;
position;
school/team;
ratings/progress;
strengths/development areas;
achievements;
comments appropriate for sharing;
stats;
highlight video;
social/recruiting/contact information as appropriate.

Exact public/share-link privacy rules remain undecided.

## Product behavior distilled

The useful chain is:
text
player goal
-> training progression
-> meaningful benchmark evidence
-> periodic formal evaluation
-> updated development plan
-> visible progress for player/parent
-> approved recruiting/player profile
The system should make progress understandable without turning normal training into constant data entry.

## Current engineering state — 2026-09-18

The real MVP stack is now active:
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

The web service is browser-accessible at the Cloud Run IAM layer. That does **not** mean player data is public. Sensitive APIs must verify Firebase ID tokens and apply application authorization before returning data.

Safe sample routes contain fake data only:
- `/preview`
- `/preview/session`
- `/preview/baseline`
- `/preview/reevaluation`

The current trainer sample routes are:
- `/trainer/session`
- `/trainer/evaluation/new`
- `/trainer/evaluation/reevaluate`

Trainer routes are wrapped in a Firebase client auth gate. The server has an authenticated `/api/auth/me` endpoint that verifies the Firebase ID token with Firebase Admin, resolves the app User, binds an invited email to its Firebase UID on first successful login, and returns the app role.

The application User table now includes nullable unique `firebaseUid`; its production migration has been applied successfully through the Cloud Run migration job.

Trainer authentication is **not yet marked complete** because a real trainer account has not been bootstrapped and successfully signed in end-to-end.

## Infrastructure / database verification

Verified production deployment order:
1. GitHub Actions authenticates to Google Cloud with Workload Identity Federation;
2. container is built and pushed to Artifact Registry;
3. Cloud Run migration job is updated with runtime service account, Cloud SQL attachment, and Secret Manager password;
4. `prisma migrate deploy` completes against Cloud SQL;
5. the web service deploys;
6. Cloud Run service verification succeeds.

The database contains the MVP schema and seeded That's Tuff Default Evaluation v1 template.

## Validated trainer workflows

### Normal training session
At session open show:
- today's main focus;
- quick persistent coach-note tags;
- current development focus;
- last meaningful result;
- active goals;
- editable practice plan;
- Quick Log.

Quick Log should take roughly 10–20 seconds and capture only meaningful evidence such as shooting results, dribbling results, drill progression, goal checks, or important observations. Each entry captures the next meaning: goal met, keep progressing, revisit next session, or change focus.

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

Flow:
1. browser signs in with Firebase;
2. browser receives Firebase ID token;
3. protected API receives ID token as Bearer token;
4. Firebase Admin verifies it server-side;
5. verified email/UID maps to the app User row;
6. role and player relationships decide authorization;
7. parent queries use the parent-safe Prisma allowlist.

Current MVP login UI supports email/password. Public sample preview pages require no sign-in because they contain no real client data.

## Next action

Bootstrap the first trainer account:
1. get from Shandon the exact email he wants to use as his trainer login;
2. create or seed an application User with that email and role TRAINER;
3. have Shandon create the matching email/password user in Identity Platform (or add an admin-assisted invitation flow later);
4. sign in through `/login`;
5. verify `/api/auth/me` binds the Firebase UID and returns TRAINER;
6. only then check off Trainer authentication in README.

After trainer auth is verified, connect Player create/edit and baseline evaluation to real Cloud SQL persistence.

## Engineering guidance

Do not confuse AI-assisted development with the application needing runtime AI. The MVP is deterministic CRUD/workflow/reporting/authorization.

Do not mark roadmap work complete just because code exists. Require verification. Read README first, update it after verified milestones, and leave its Next action accurate.

Do not expose trainer-private data in parent APIs. Every future protected API must verify Firebase identity and server-side authorization.

Do not auto-create arbitrary signed-in Firebase users as application users. Accounts must be explicitly invited/created in the application so a random authenticated Firebase user cannot gain access.
