
# Izy's Sourdough — Build Progress Checklist

Status legend: ✅ Done · 🟡 Partial · ⬜ Not Started

> Verified against actual code as of 2026-09-11 (the `.agents/skills/izys-sourdough-backend-plan`
> reference docs were out of date in several places — noted below where corrected).

## Task 1 — Database & Product API — ✅

- [x] `Product` / `Category` models + `GET/POST /api/products`, `GET /api/categories`
- [x] `Customer` model (email, name, phone, `passwordHash`, opt-ins)
- [x] `BakeSession` model (capacity, reserved units, status)
- [x] `Order` / `OrderItem` models
- [x] `Payment` model (cash/venmo/cashApp, status tracked independently)
- [x] `PickupSlot` model with `isEnabled` admin flag
- [x] Prisma datasource is **PostgreSQL** (`prisma/schema.prisma`) — not SQLite as the old docs claimed

## Task 2 — Order Submission API — ✅

- [x] Guest / sign-in / create-account checkout entry paths
      (`app/checkout/auth/page.tsx`, `app/checkout/page.tsx`,
      `app/api/customers/auth/route.ts`) — **docs said ⬜, actually built**
- [x] Order creation logic with stock + bake-session capacity checks (`lib/orders.ts`)
- [x] Order status lifecycle + allowed transitions, cancellation releases capacity/slot/stock
- [x] Payment does not block order confirmation

## Task 3 — Pickup Slot API — ✅

- [x] `PickupSlot` model (date, time, capacity, orderCount)
- [x] Reservation + full-slot blocking (order count, not loaf quantity)
- [x] Admin controls: `PATCH /api/pickup-slots` (create window, adjust capacity, disable slot)

## Task 4 — Notifications — 🟡

- [x] Customer order-confirmation email (`lib/email.ts`, SMTP via Gmail, console fallback)
- [x] Order status-update notification path (SMS only today, no status-change email)
- [~] SMS payload builders wired (`lib/sms.ts`, Twilio) — **deferred**, no Twilio credentials
- [x] Admin new-order email — **turned on**: add `ADMIN_NOTIFICATION_EMAIL=<email>` to
      `.env.local` and Vercel env vars (uses existing SMTP config, no code changes needed)
- [~] Sentry error tracking — SDK installed & initialized, **deferred for now** (not required
      before launch, see `DEFERRED.md`)

## Task 5 — Admin Panel — ✅ (including auth)

- [x] `/admin` dashboard, products, bake-sessions, orders, settings pages exist
- [x] **Admin authentication is implemented** (`middleware.ts`, `lib/adminSession.ts`,
      `/admin/login`) — **docs said "pending auth", actually done**
- [x] Product CRUD, bake session CRUD, order status/payment updates
- [x] Settings page exists (`app/admin/settings/page.tsx`) — verify vacation-mode + payment-method
      toggle behavior still needs a manual check-through
- [x] Customer password reset flow (`app/api/customers/reset-password/route.ts`) — extra, not in
      original plan docs

## Task 6 — Deployment — 🟡

- [x] Project already linked to Vercel (`.vercel/project.json`)
- [x] Production DB is Postgres-ready in schema (confirm the deployed `DATABASE_URL` actually
      points at a live Postgres instance, not local)
- [ ] Confirm all required env vars are set in Vercel project settings (SMTP, ADMIN_PASSWORD,
      ADMIN_SESSION_SECRET, DATABASE_URL, etc.)
- [~] Sentry DSN configured in production — **deferred**, currently no-ops
- [~] Twilio SMS configured in production (currently no-ops, console-log only) — **deferred**
- [x] `ADMIN_NOTIFICATION_EMAIL` set in Vercel env vars
- [ ] Run through pre-launch verification checklist end-to-end on the deployed site:
  - [ ] Guest checkout works
  - [ ] Registered-customer checkout / login works
  - [ ] Orders save correctly
  - [ ] Bake session / inventory capacity updates correctly
  - [ ] Pickup slot reservation + full-slot blocking works
  - [ ] Confirmation emails actually send (real SMTP)
  - [ ] Admin dashboard loads and CRUD actions work in production
  - [ ] Admin login/session works over HTTPS with secure cookies

## Known deferred items (see `DEFERRED.md`)

- SMS notifications (Twilio) — intentionally paused, not a blocker
- Sentry error tracking — intentionally paused, not a blocker
- Admin new-order email — **turned on**, requires `ADMIN_NOTIFICATION_EMAIL` set in `.env.local` and Vercel

## Next suggested steps

1. ~~Decide whether Sentry should be turned on before launch~~ — **deferred, revisit post-launch.**
2. ~~Decide whether Twilio / admin-notification email should be turned on~~ — **Twilio deferred,
   admin-notification email turned on** (set `ADMIN_NOTIFICATION_EMAIL` in `.env.local` + Vercel).
3. Verify production env vars are set in the hosting provider (not just `.env.local`).
4. Do a full manual pass through the pre-launch checklist above on the live/staging deployment.
5. Update this file as items are completed or new gaps are found.
