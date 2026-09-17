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

implementation language/framework;
database;
cloud/hosting platform;
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

Then determine the implementation stack **after** understanding the primary interaction.

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
