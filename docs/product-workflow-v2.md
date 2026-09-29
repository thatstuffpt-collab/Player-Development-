# Product Workflow V2 — Universal Trainer Experience

## Why this change

The current application has the right basketball-development foundation, but the trainer experience has grown feature-by-feature. As more capabilities are added, the product should feel simpler rather than expose every feature as a separate destination.

The product should organize work around what a trainer is trying to do in the moment:

1. run today's training;
2. manage an athlete's development;
3. reuse coaching content;
4. manage the training organization.

This document defines the next product direction before expanding onboarding and multi-tenant access.

## Product principle

**The app should work like a coaching operating system, not a collection of forms.**

Normal gym use should prioritize speed and context. Deeper planning, evaluation, and history should remain available without getting in the way of live training.

The core development loop remains:

```text
Athlete goal
-> development plan
-> training sessions
-> meaningful evidence
-> evaluation / reevaluation
-> updated plan
-> visible progress
```

Trainer judgment remains authoritative. The app should help the trainer remember, organize, compare, and act — not make basketball decisions for them.

## Primary trainer navigation

### 1. Today
The operational home screen.

Today should answer:
- Who am I training today?
- What session is next?
- Is there an unfinished session to continue?
- Which athlete needs a follow-up, evaluation, or plan update?
- What is the fastest path to start working?

Primary actions:
- Start / continue session
- Add athlete
- Quick evaluation
- Create practice plan

### 2. Athletes
The athlete-development workspace.

The athlete list should support search, status, active focus, and quick start.

Each athlete should have a stable workspace with four primary views:

#### Overview
- identity / basketball context
- current development focus
- active goals
- next-session focus
- last meaningful result
- recent coach reminders
- primary actions: Start Session, Evaluate, Assign Work

#### Plan
- big-picture goal
- active development goals
- current priorities
- assigned work
- current coach tags
- next-session focus

#### Results
- basketball benchmark trends
- shooting / ball-handling / finishing evidence
- athletic testing
- first / latest / best values
- meaningful comparisons only

#### History
- sessions
- Quick Logs
- evaluations and reevaluations
- achievements
- development-focus changes
- chronological development timeline

Trainer-private notes remain available in the athlete workspace but clearly separated from parent-visible information.

### 3. Library
Reusable coaching content.

The current Drill Library should grow into a broader Library rather than remain a drill-only destination.

Library should eventually contain:
- drills
- workout templates
- practice-plan templates
- evaluation templates
- athletic tests
- saved session structures

A trainer should be able to reuse library content from a live session without leaving the session workflow.

### 4. Organization
Business / staff administration.

Organization is not part of live coaching and should stay out of the athlete workflow.

Organization should contain:
- organization name and branding
- staff / trainers
- roles and permissions
- invitations
- locations later
- organization settings
- subscription / billing later

## Evaluation is an action, not a permanent primary destination

Evaluation remains important, but it is normally performed **for an athlete**. It should be launched from Today, an athlete profile, or a dedicated evaluation shortcut when needed.

The existing Evaluation Center can remain available during transition, but Evaluate should not permanently compete with Today and Athletes as a top-level mental model.

External / camp evaluations remain a separate workflow because they may involve athletes who are not recurring clients.

## Session workflow

A training session should have three clear stages.

### Before training — Prepare
- athlete identity
- current development focus
- last takeaway
- readiness / body check when relevant
- today's goal
- practice plan

The app should offer a sensible starting plan from the athlete's next-session focus and recent work, while keeping trainer control.

### During training — Coach
This is the mobile-first mode.

The screen should prioritize:
- current section / drill
- quick access to the next drill
- Quick Log
- meaningful measurement entry
- coach reminder / observation

No deep profile editing or unrelated administrative content should compete for screen space.

### After training — Wrap up
- main takeaway
- needs more work
- next-session focus
- meaningful results saved
- optional goal status update

The wrap-up should take roughly one minute when the session was already logged well.

## Universal account / organization direction

The long-term app should not assume one human belongs to exactly one training business.

Examples:
- a trainer may work for two organizations;
- a parent may have athletes connected to different organizations;
- an owner may also train athletes;
- a trainer may later open their own organization without needing another login.

Therefore the preferred account model is:

```text
User identity
  -> Organization membership(s)
      -> role within each organization

Organization
  -> athletes
  -> training data
  -> staff
  -> reusable content / settings
```

Organization roles should eventually distinguish at least:
- Owner
- Admin
- Trainer

Guardian access should be based on explicit athlete relationships, not treated as a trainer-organization role.

Before broad self-service onboarding, migrate away from the current single-tenant-per-user assumption or introduce a compatibility layer that supports multiple memberships safely.

## Onboarding direction

### New organization owner
1. Sign in / create identity.
2. Create organization.
3. Become Owner of that organization.
4. Set organization name / optional branding.
5. Add first athlete or invite staff.

### Invited trainer
1. Receive invite by email address.
2. Sign in.
3. Existing invitation binds to the identity.
4. Trainer lands in the correct organization.

### User with multiple organizations
After sign-in, restore the last-used organization when safe and provide a clear organization switcher.

## Product-wide usability rules

- Mobile live-training actions must be reachable with minimal scrolling.
- A trainer should not need to know database or software terminology.
- Avoid duplicate data entry.
- Do not make a user pick from giant menus when context already narrows the answer.
- Preserve history instead of overwriting development evidence.
- Separate planning data, measured results, formal evaluations, and private notes.
- Default dashboards to action and context, not vanity statistics.
- Keep advanced functions discoverable without crowding normal training.
- Tenant / organization authorization must be enforced server-side.
- The interface should be brandable per organization instead of hard-coded around That's Tuff long-term.

## Implementation sequence

1. **Account and organization architecture**
   - define organization membership model;
   - preserve the existing That's Tuff tenant and users;
   - support safe staff invitations and a second isolated organization;
   - add organization switching only when multiple memberships exist.

2. **Trainer information architecture**
   - Today
   - Athletes
   - Library
   - Organization
   - move evaluation into contextual actions while retaining transition links.

3. **Athlete workspace refactor**
   - Overview
   - Plan
   - Results
   - History
   - keep live Session as a focused separate mode.

4. **Today dashboard improvements**
   - scheduled / upcoming sessions when calendar data exists;
   - continue unfinished session;
   - needs-attention queue;
   - quick start actions.

5. **True multi-tenant acceptance test**
   - create second organization;
   - add second owner/trainer;
   - create athletes in both organizations;
   - prove cross-organization data cannot be read or changed;
   - verify trainer invite / login flow.

6. **Parent experience**
   - build only after the trainer workflow and authorization model are stable.

## Success test

A new basketball trainer who has never seen That's Tuff should be able to open the app and understand:

- Today is where I work;
- Athletes is where I manage development;
- Library is where I reuse coaching material;
- Organization is where I manage my business/team;
- Start Session is how I enter live-training mode;
- Evaluate is something I do for an athlete, not a separate system I have to learn.

If the product requires a walkthrough just to understand where normal daily work lives, the information architecture is not finished.