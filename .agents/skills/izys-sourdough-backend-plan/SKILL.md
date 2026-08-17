---
name: izys-sourdough-backend-plan
description: Backend build plan for Izy's Sourdough covering database models, order/pickup APIs, notifications, admin panel, and deployment. Use this skill when implementing, reviewing, or planning any backend/API/database work (Prisma schema, API routes, auth, bake sessions, payments, admin tools, email/SMS, deploy). Load only the reference file(s) relevant to the current task instead of the whole plan.
---

# Izy's Sourdough Backend Plan Skill

This skill splits the full backend build plan into topic-scoped reference
files so only the relevant context needs to be loaded for a given task.
Start here, then open only the reference file(s) needed.

## When to use this skill

Use when implementing, reviewing, or scoping any backend work for Izy's
Sourdough: Prisma schema/data models, product/order/pickup-slot APIs,
authentication, bake session capacity logic, payments, email/SMS
notifications, the admin panel, or production deployment.

## Quick summary (always in context)

- **Stack**: Next.js API routes + Prisma (SQLite in dev, needs production DB
  before deploy).
- **Auth**: confirmed in scope for v1 — `Customer` supports both guest
  checkout and registered accounts with login/order history.
- **Capacity model**: two independent constraints — `BakeSession` limits
  production units (loaves), `PickupSlot` limits people per time window.
  Orders count as 1 against a pickup slot regardless of loaf quantity.
- **Payments**: manual only at launch (Cash/Venmo/CashApp), tracked via a
  dedicated `Payment` status separate from `Order` status; structured for
  future Stripe/Apple Pay/Google Pay.
- **Order does not block on payment**: orders confirm immediately;
  payment status is tracked independently.

## Reference files (load on demand)

- **`references/data-models.md`** — Task 1: Prisma schema plan for
  `Product`/`Category`, `Customer` (+ auth), `BakeSession`, `Order`/
  `OrderItem`, `Payment`, `PickupSlot`. Includes current build status per
  model. Load when touching `prisma/schema.prisma` or planning migrations.
- **`references/order-and-pickup-apis.md`** — Task 2 & 3: order submission
  flow (guest/login/create-account, capacity validation, order status
  lifecycle) and pickup slot API (reservation, admin controls). Load when
  working in `app/api/orders/` or `app/api/pickup-slots/`.
- **`references/notifications-and-admin.md`** — Task 4 & 5: customer/admin
  email notifications, SMS opt-in structure, and the admin dashboard scope
  (today's orders, production summary, customer metrics, best sellers,
  product/session/order CRUD, settings). Load when building `/admin` or
  notification services.
- **`references/deployment.md`** — Task 6: production database migration,
  env vars, error logging, migration pipeline, and the pre-launch
  verification checklist. Load when preparing to deploy.

## Notes

- This plan builds on top of the front-end (already complete) and the
  original PRD skill (`izys-sourdough-prd`) — refer to that skill for
  business rules/design system while implementing backend logic.
- Status markers used throughout: ✅ Done · 🟡 Partial · ⬜ Not Started.
- Prefer reading only the reference file(s) relevant to the current task
  rather than all four, to minimize context usage.
