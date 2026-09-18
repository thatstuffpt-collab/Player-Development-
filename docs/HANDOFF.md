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

## What has NOT been decided

Do not invent these as settled facts:

whether the first UX is desktop-first, phone-first, or balanced responsive web;
exact parent invitation/account recovery flow;
whether coach/recruiter links are public, secret-token, expiring, or authenticated;
exact youth/foundation evaluation templates beyond the documented example;
exact advanced/college/pro templates;
complete drill library;
exact numeric benchmark thresholds;
video hosting/storage provider;
whether parents may edit any player information or are read-only;
whether players eventually receive their own login;
branding/design system;
whether PDFs/reports are required in addition to live profiles;
legal/privacy/consent policy for minor profiles/media;
production deployment architecture.

## Recommended continuation

Start with the remaining Phase 0 decisions in README.

A good first question to Shandon is:

 When you're actually using this during your week, where do you picture yourself opening it most—your phone in the gym, a laptop after training, or both? And when you need to record one meaningful result, what is the fastest interaction you would want?

Do not spend multiple sessions choosing infrastructure before validating the trainer workflow.

After the primary UX is understood:
1. map the trainer screens;
2. map parent screens;
3. map coach/recruiter profile;
4. model authorization;
5. validate domain entities/relationships;
6. choose stack;
7. bootstrap code/tests/CI.

## Suggested first UX walkthrough

Ask Shandon to walk through these scenarios one at a time:

1. **New ongoing client**
   - create player;
   - connect parent;
   - record goals;
   - baseline evaluation;
   - decide initial development focus.

2. **Normal training day**
   - open player;
   - see previous focus/next-session plan;
   - train;
   - record one important benchmark/progression event;
   - update next-session plan.

3. **Reevaluation**
   - see evidence since previous evaluation;
   - rate each applicable criterion;
   - explain progress/current focus;
   - establish next development plan.

4. **Parent**
   - login;
   - view current progress/history/goals/achievements;
   - understand what is improving and what is next;
   - never access trainer-private material.

5. **College coach/recruiter**
   - receive profile;
   - rapidly understand player identity, current development, achievements/stats, video, and relevant contact info.

6. **Camp**
   - create/select camp;
   - intake participants;
   - rapidly evaluate many players;
   - distribute/retain results;
   - preserve player if they become an ongoing client.

## Engineering guidance for the next ChatGPT

Do not confuse "AI-assisted development" with "the application needs AI."

This application's known core workflows are currently deterministic CRUD/workflow/reporting/authorization problems. Build those well first.

If an AI feature is later proposed, state:
what user problem it solves;
what inputs it receives;
what output it produces;
why deterministic logic is insufficient;
how the result is validated;
whether it can affect consequential actions.

## Definition of a successful handoff

The handoff is successful if a fresh ChatGPT can read the repository and say, in substance:

 I understand what Shandon is building, who it serves, how the evaluation/progression system works at a conceptual level, what must remain private, what is already decided, what is still open, and what question I should ask next.

If the next session needs the original conversation to reconstruct those basics, this documentation has failed.


## Infrastructure decision — 2026-09-17

Shandon selected the following infrastructure direction:
- GitHub for source control;
- GitHub Actions for CI/CD;
- Google Artifact Registry for container images;
- Google Cloud Run for application hosting;
- Cloud SQL PostgreSQL 16 for the database;
- Google Secret Manager for application secrets;
- Workload Identity Federation for GitHub Actions authentication to Google Cloud.

Google Cloud project: `thats-tuff-player-development`
Primary region: `us-central1`
Cloud SQL instance: `player-development-db`
Application database: `player_development`
Application DB user: `player_app`
Artifact Registry repository: `player-development`
Cloud Run runtime service account: `player-development-runtime@thats-tuff-player-development.iam.gserviceaccount.com`
GitHub deployer service account: `github-deployer@thats-tuff-player-development.iam.gserviceaccount.com`

A minimal containerized health service and GitHub Actions deployment workflow are being used to verify the infrastructure path before choosing the actual application language/framework. This infrastructure placeholder does not settle the application framework.

The Cloud Run service should remain private by default until the product's authentication/public-profile rules are deliberately defined.

The next product/domain work remains the Phase 0 UX walkthroughs and authorization model described above. Infrastructure setup should not be mistaken for completion of those product decisions.


## MVP and stack decision — 2026-09-17

Shandon selected the real application stack:
- Next.js;
- TypeScript;
- Prisma;
- PostgreSQL on Cloud SQL;
- Cloud Run;
- Artifact Registry;
- GitHub Actions;
- Secret Manager.

The README is now the active MVP work board and definition of completion.

MVP finish line: Shandon can securely run the recurring-client player-development workflow from phone/laptop, preserve historical evaluations and meaningful progression evidence, keep trainer-private notes private, and give a connected parent/guardian secure read-only access to the approved development view.

Recruiting/public profiles, camps, advanced templates, video hosting, player accounts, and AI coaching features are post-MVP unless explicitly reprioritized.

Every meaningful engineering session must update README checkboxes only to match verified evidence and leave the README Next action accurate.


## Trainer normal-session UX decision — 2026-09-17

Shandon validated the normal training-session workspace.

At session open, the trainer should see today's main focus, quick coach-note tags, current development focus, the last session's most meaningful result, current goals, and an editable practice-plan outline.

Default session focus options: Ball Handling, Finishing, Shooting, Defense, Footwork, Decision Making, Conditioning, plus custom/other.

Quick coach notes are persistent player tags used as fast reminders (examples: stronger dribble, clean up footwork). They are not the same as development-history evidence.

Quick Log is the fast session evidence flow. It should take roughly 10–20 seconds and capture meaningful information only: shooting results, dribbling results, drill progressions, goal checks, or important observations. Each entry should also say what the result means next: goal met, keep progressing, revisit next session, or change focus.

The Prisma domain model now includes TrainingSession, PracticePlanItem, PlayerCoachTag, session-linked ProgressEvent data, focus areas, event types, and next-step outcomes. An interactive trainer session prototype exists at /trainer/session. Persistence is not yet complete.


## New athlete / baseline evaluation UX decision — 2026-09-17

Shandon approved the proposed baseline workflow.

The baseline is a three-step trainer flow:
1. athlete intake;
2. 12-category evaluation;
3. first development plan.

Intake captures core athlete identity and basketball context: name, DOB/grade, height, position, school/team, years playing, playing experience, player/parent view of development needs, basketball goals, guardian contact, and only training limitations relevant to safe/appropriate training.

The current 12-category template remains visible for consistency. A category may be marked Not Assessed when the trainer did not meaningfully observe it. Assessed categories use the 1–5 That's Tuff scale with quick observation tags plus optional trainer notes/evidence.

At the end, Shandon selects the top 2–3 development priorities and one short-term goal. These seed the athlete's initial development focus. The purpose of the baseline is to leave with an actionable first plan, not merely a set of ratings.

The Prisma model now allows nullable category ratings, quick observation tags, baseline priority snapshots, and a short-term-goal snapshot. The interactive prototype is at /trainer/evaluation/new. Persistence is still pending database migration/server actions.


## Reevaluation prototype — pending Shandon approval

A proposed reevaluation flow now exists at /trainer/evaluation/reevaluate.

It preserves the prior evaluation and creates a new evaluation rather than editing history. For each category, the trainer sees the previous rating, meaningful evidence logged since the previous evaluation, the new rating controls, and an optional explanation for why the rating changed or stayed the same.

The final step updates the active 2–3 development priorities and short-term goal separately from the historical evaluation record.

This flow is implemented as a prototype but is not yet marked validated. Shandon should review whether this is how he wants reevaluations to work before the first production database migration is finalized.


## Reevaluation UX approved — 2026-09-17

Shandon approved the proposed reevaluation workflow without changes.

The approved flow is:
- preserve the previous evaluation unchanged;
- surface meaningful progression/Quick Log evidence since that evaluation;
- show previous rating next to the new trainer-selected rating and visible delta;
- allow a trainer explanation for changed or unchanged ratings;
- create a brand-new historical evaluation;
- separately update the active 2–3 development priorities and short-term goal.

The first production database migration is now the next engineering milestone. Production migrations are automated through a Cloud Run job using the runtime service account, Cloud SQL attachment, and Secret Manager database password. The deploy pipeline must apply migrations successfully before deploying the web service.
