# Player Path branding decision

## Decision

The multi-tenant software platform is named **Player Path**.

**That's Tuff Performance Training** is not the software/platform brand. It is one training organization (tenant) that uses Player Path.

## Brand architecture

- Platform: **Player Path**
- Organization example: **That's Tuff Performance Training**
- Future organizations: independent trainers, academies, teams, or training businesses using the same platform

A trainer joining Player Path should never feel like they are joining That's Tuff Performance Training.

## Product meaning

The name reflects the core product loop:

current athlete state -> development plan -> training evidence -> progress -> evaluation -> next focus

Player Path should help a coach answer:

1. Where is this athlete now?
2. What are we working on?
3. What evidence have we seen?
4. How are they progressing?
5. What comes next?

## UI/branding implications

- Replace platform-level hard-coded That's Tuff branding with Player Path branding as the V2 workflow is implemented.
- Keep organization-level identity separate so each tenant can display its own business name and, later, logo/colors.
- That's Tuff remains the first organization in production and retains its existing data.
- Platform navigation, login, onboarding, invitations, and account-level surfaces should use Player Path terminology.
- Organization-specific screens may display the active organization name prominently.

## Naming safety

Before a public commercial launch, perform a formal availability review for the Player Path name, including trademark, domain, app-store, and relevant software/company conflicts. Until that review is complete, this is the selected product name for development and internal branding.
