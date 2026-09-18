# That's Tuff Player Development

This repository is the durable source of truth for the That's Tuff Player Development product and its engineering handoff.

## Current stage

The product/domain model is still being validated with Shandon. A minimal Cloud Run health service and CI/CD pipeline now exist only to prove the deployment infrastructure. They are not the player-development application itself.

## Infrastructure direction

Chosen infrastructure:
- Source control: GitHub
- CI/CD: GitHub Actions
- Container registry: Google Artifact Registry
- Application hosting: Google Cloud Run
- Database: Cloud SQL for PostgreSQL 16
- Secrets: Google Secret Manager
- GitHub-to-Google authentication: Workload Identity Federation

Google Cloud project: `thats-tuff-player-development`
Region: `us-central1`

## Deployment

Pushes to `main` that change the deployable app/container workflow automatically:
1. authenticate to Google Cloud through Workload Identity Federation;
2. build the container;
3. push it to Artifact Registry;
4. deploy it to Cloud Run;
5. attach the Cloud SQL instance;
6. expose the database password to the runtime through Secret Manager.

The Cloud Run service runs as:
`player-development-runtime@thats-tuff-player-development.iam.gserviceaccount.com`

The deployed service is private by default.

## Minimal infrastructure app

`app.py` currently provides only:
- `/` — deployment status response
- `/health` — health response

This placeholder exists to validate CI/CD and hosting. Do not treat it as the production player-development application.

## Product direction

The application will support long-term player development, meaningful benchmark evidence, periodic evaluations, goals, achievements, trainer-private notes, parent access, camp history, and approved recruiting/player profiles.

Read `AGENTS.md` and `docs/HANDOFF.md` before making substantive product or engineering changes.

## Important privacy boundary

The product handles youth-athlete information. Parent authorization, trainer-private notes, shareable-profile privacy, and media/profile consent must be explicitly designed and tested before production use with real athlete data.
