# AGENTS.md

## Project operating standard

This repository follows the InnoTechByte Engineering Playbook.

Company source of truth:
https://github.com/InnoTechByte/engineering-playbook
especially docs/ai-operable-project-standard.md
docs/repository-baseline-standard.md
docs/documentation-architecture-standard.md
docs/deterministic-vs-agentic-workflow-standard.md
docs/identity-secrets-standard.md
docs/black-box-audit-standard.md

This project is intentionally designed so a fresh human or AI engineering session can continue from repository state without access to the conversation that originally defined it.

## Source-of-truth order

1. explicit current human instruction;
2. this AGENTS.md;
3. README.md product scope, roadmap, and verified state;
4. code contracts and automated tests once code exists;
5. supporting project docs;
6. InnoTechByte Engineering Playbook.

When a new conversation or AI session starts, do not reconstruct product discovery from memory if repository documentation already answers it.

## Agent control declaration
text
Repository trust: TRUSTED
Default engineering-agent permission: L2
Production deployment: approval required
Production operations: approval required unless explicitly runbook-authorized
MCP status: ready
Runtime agent status: not used
Agentic exposure level: Level 0

Do not silently increase authority because a connected credential or tool allows it.

## Current project stage

The repository is moving from product/domain-definition into MVP implementation.

The application stack is now explicitly selected: Next.js + TypeScript + Prisma + PostgreSQL, deployed to Google Cloud Run with Cloud SQL. A minimal infrastructure health app may exist while the real application foundation is bootstrapped.

Use README.md as the active MVP roadmap and completion checklist. Continue from the first eligible incomplete roadmap item unless Shandon explicitly reprioritizes. Product/UX decisions that remain open must still be validated with Shandon rather than invented.

## Product-owner interaction rule

Shandon is the basketball-domain owner.

When a product decision is unclear:
1. ask the question in basketball/training language first;
2. capture Shandon's real workflow and terminology;
3. translate that into software/domain structure;
4. write durable decisions back into the repository.

Avoid forcing technical vocabulary on the product owner before understanding the coaching behavior being modeled.

Examples:

Prefer:
 When a player comes in for a normal session, what result is important enough that you would want to save it?

Instead of:
 What event-sourcing granularity do you want?

Prefer:
 What should a parent be able to see that only you should see?

Instead of:
 Define the RBAC matrix.

The engineering artifact may use professional terminology after the real-world behavior is understood.

## Cross-ChatGPT handoff rule

This project may move between Brent's ChatGPT environment and Shandon's ChatGPT environment.

A fresh session must:
1. read README.md;
2. read this file;
3. read docs/HANDOFF.md;
4. inspect the current repository state;
5. continue from the first eligible incomplete roadmap item.

Do **not** ask Shandon to retell the full project unless repository information is contradictory or materially incomplete.

When ending a meaningful work session:
update README status/checklists to match evidence;
update docs/HANDOFF.md if the immediate continuation point changed materially;
document important product decisions made during the session;
leave the repo sufficient for a new AI session to resume.

Chat history is helpful context, not the project database.

## Default engineering loop

Once implementation begins:

1. Read README/AGENTS and relevant project docs.
2. Identify the next eligible incomplete roadmap item.
3. Inspect relevant code/tests/docs.
4. Work on a branch for non-trivial changes.
5. Implement the smallest complete production-quality increment.
6. Add/update tests where practical.
7. Run relevant verification.
8. Diagnose ordinary test/CI failures without handing them back to the human.
9. Update roadmap/status only to match verified evidence.
10. Update architecture/security/deployment docs when materially affected.
11. Continue until a genuine human decision or protected boundary is reached.

## Git expectations

Use clear, scoped commits.
Use branches/PRs for non-trivial implementation changes once active development begins.
Keep documentation changes in the same change set as the behavior/architecture they describe.
Never mark roadmap work complete because files merely exist.
Preserve historical data and backward compatibility where practical once real users/data exist.

## Deterministic vs. AI/agentic rule

Use deterministic software when the path is known.

Known deterministic responsibilities include:
authentication;
authorization;
parent/trainer visibility;
private-note enforcement;
data validation;
rating range validation;
historical record preservation;
tenant/user ownership boundaries if multi-tenant behavior is introduced;
benchmark calculations/comparisons where formulas are defined.

Use model reasoning only where semantic interpretation or uncertainty provides real product value.

Current product requirement:
text
Runtime AI required: no
Runtime agent required: no

Do not add AI-generated ratings, automatic coaching decisions, or agent behavior without a defined user problem and explicit product decision.

Trainer judgment remains authoritative for formal player ratings unless requirements later change.

## Architecture direction

Keep business/domain logic independent from delivery interfaces.

Preferred shape:
text
domain/application capabilities
        |
        +-- trainer web UI
        +-- parent web UI
        +-- shareable coach profile
        +-- REST/API later if useful
        +-- MCP later if useful
Do not force REST or MCP into the MVP if no real consumer needs them. Keep the domain model reusable enough that they can be added later without duplicating rules.

## Data/history invariants

These are important even before a database is chosen:

Historical evaluations must not be overwritten by later evaluations.
Historical benchmark/progress results must remain attributable to a date/session/context.
Rating labels may be configurable later, but the original meaning of stored historical ratings must remain reconstructable.
Trainer-private notes must not be exposed to parents or shareable-profile viewers.
UI hiding is not authorization.
Camp history should remain connected if a participant later becomes a recurring client.
Progress visualizations must derive from preserved historical data rather than mutable "current" fields alone.

## Youth/minor privacy boundary

This product handles youth-athlete information.

Before production use with real minors:
define the exact share-link/privacy model;
minimize public personal information;
define parent/guardian access and ownership;
define media/highlight consent expectations;
define who may publish/unpublish a shareable profile;
verify authorization negative paths with tests;
avoid exposing private contact or sensitive information by default.

Do not treat a public recruiting profile and a parent-authenticated profile as the same authorization surface.

Product/legal policy decisions that require Shandon/Brent judgment should be surfaced precisely rather than invented by the engineering agent.

## Identity and secrets

Once implementation begins:
never commit real secrets or production environment files;
use .env.example for names/placeholders only;
prefer managed/short-lived identity where practical;
separate deploy/runtime identities if cloud deployment is introduced;
keep production authority narrower than development authority.

## Testing expectations

Once code exists, tests should cover domain rules, not just page rendering.

High-priority negative-path tests include:
parent cannot read trainer-private note;
unauthenticated visitor cannot read parent-authenticated data;
shareable profile exposes only approved fields;
one guardian cannot access an unrelated player's protected record;
historical evaluation remains unchanged after later evaluation;
invalid rating outside allowed scale is rejected;
template changes do not silently rewrite completed historical evaluations.

## Human stop conditions

Pause for genuine decisions such as:
implementation stack when not yet selected;
product/privacy policy for minors;
public-vs-private share-link behavior;
payment/billing purchases;
production credentials unavailable through approved mechanisms;
destructive production actions;
production sign-off;
genuine human visual/product acceptance.

Finish safe prerequisites before asking for human action.

## Documentation discipline

README is the product/roadmap front door.

Use supporting docs for detail rather than turning README into a dumping ground.

When a meaningful decision is made, record:
what was decided;
why it matters;
any constraint/invariant;
roadmap impact;
what remains open.

If a reusable lesson applies across InnoTechByte projects rather than only this application, update or propose an update to the Engineering Playbook instead of duplicating company-wide policy here.
