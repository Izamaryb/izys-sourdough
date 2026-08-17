# Task 6 — Deploy

Status legend: ✅ Done · 🟡 Partial · ⬜ Not Started

Goal: deploy the backend and database into a production environment.
Keep deployment simple and reliable for a small bakery — no mobile app,
advanced monitoring, or scaling infrastructure needed.

## Production database — ⬜

Currently SQLite (`prisma/dev.db`) for local dev. Needs migration to a
production-grade database (e.g. Postgres) before deploy.

## Environment variables / secure API config — ⬜

Not started.

## Error logging — ⬜

Not started.

## Database migrations pipeline — 🟡

Prisma migrations exist locally (`prisma/migrations/`). Needs a
production migration step wired into the deploy pipeline (e.g.
`prisma migrate deploy` on release).

## Deployment checklist (pre-launch verification)

Blocked on Tasks 1–5 being complete. Verify before launch:

* Customer checkout works (guest and registered).
* Orders save correctly.
* Bake session / inventory capacity updates correctly.
* Pickup slot reservation and full-slot blocking works.
* Emails send.
* Admin dashboard loads and CRUD actions work.
* Authentication works (login, session persistence, secure cookies in
  production).

## Boundaries

* Do not add: mobile application, advanced monitoring, scaling
  infrastructure.
