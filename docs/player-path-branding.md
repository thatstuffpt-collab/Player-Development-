# Platform branding status

## Current decision

The public platform name is intentionally **deferred**.

`Player Path` was explored as a candidate because it matches the product's athlete-development journey, but preliminary availability screening found enough existing sports-related usage that it should **not** be treated as the final public brand without a later legal/availability review.

For development, product architecture, and multi-tenant work, the app should remain **brand-neutral** at the platform level so the final name, logo, colors, and theme can be swapped in later without changing core product behavior.

## Brand architecture

- Platform: **working / neutral product brand until final naming decision**
- Organization example: **That's Tuff Performance Training**
- Future organizations: independent trainers, academies, teams, or training businesses using the same platform

A trainer joining the platform should never feel like they are joining That's Tuff Performance Training.

## Product meaning to preserve regardless of final name

The platform is built around this development loop:

current athlete state -> development plan -> training evidence -> progress -> evaluation -> next focus

The product should help a coach answer:

1. Where is this athlete now?
2. What are we working on?
3. What evidence have we seen?
4. How are they progressing?
5. What comes next?

## UI / architecture implications

- Do not hard-code the eventual platform name, logo, or color system into core workflow logic.
- Keep organization-level identity separate so each tenant can display its own business name and, later, logo/colors.
- That's Tuff remains the first organization in production and retains its existing data.
- Platform navigation, login, onboarding, invitations, and account-level surfaces should use replaceable platform branding.
- Organization-specific screens may display the active organization name prominently.
- Theme and logo assets should be treated as presentation configuration, not domain data or authorization logic.

## Naming work

Brand naming is on the back burner while core product development continues.

Before public launch, resume naming work and complete:
- trademark screening;
- domain availability review;
- app-store/company conflict review;
- final logo and visual system;
- replacement of temporary platform branding.
