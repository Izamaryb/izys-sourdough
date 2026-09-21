
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
- [x] Production DB is live Postgres — **fixed 2026-09-15**: `DATABASE_URL` in Vercel Production
      was a broken placeholder (`postgres://USER:PASSWORD@localhost...`). Found an existing Neon
      store (`izys-sourdough-db`) that was provisioned but never connected to the project via
      `vercel storage connect`. Connected it (auto-injects `DATABASE_URL` + related Postgres env
      vars) and redeployed. DB already had real seeded product data.
- [x] `ADMIN_SESSION_SECRET` / `PASSWORD_RESET_SECRET` — **added 2026-09-15** (were completely
      missing from Vercel, causing `/api/admin/login` to 500). Generated via `openssl rand -hex 32`
      and added to Production via `vercel env add`.
- [x] `ADMIN_PASSWORD` — added by user directly in Vercel dashboard 2026-09-15.
- [x] Confirm all required env vars are set in Vercel project settings — SMTP/Twilio/email vars
      were already present; `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `PASSWORD_RESET_SECRET`,
      `ADMIN_PASSWORD` are now all set too.
- [~] Sentry DSN configured in production — **deferred**, currently no-ops
- [~] Twilio SMS configured in production (currently no-ops, console-log only) — **deferred**
- [x] `ADMIN_NOTIFICATION_EMAIL` set in Vercel env vars
- [ ] Run through pre-launch verification checklist end-to-end on the deployed site:
  - [x] Products load / `/api/products` works in production (verified 2026-09-15 post-fix)
  - [x] Admin login/session works in production (verified 2026-09-15 post-fix)
  - [x] Guest checkout works — **verified on production 2026-09-17**: placed real order (Classic
        Country Loaf x1, pickup 2026-09-23 5:30 PM, cash), confirmation page rendered correctly
  - [x] Registered-customer checkout / login works — **verified on production 2026-09-17**: created
        account during checkout, signed out/in, sign-in prefilled saved info, second order succeeded
  - [x] Orders save correctly — **verified on production 2026-09-17**
  - [x] Bake session / inventory capacity updates correctly — **verified on production 2026-09-17**:
        `classic-country-loaf` stock 24 → 23 after order
  - [x] Pickup slot reservation + full-slot blocking works — **verified on production 2026-09-17**:
        5:30 PM slot flipped to `orderCount: 1, reserved: true` after order
  - [x] Confirmation emails actually send (real SMTP) — **verified on production 2026-09-17**: test
        order's email address received the confirmation email
  - [x] Admin dashboard loads and CRUD actions work in production — **verified on production
        2026-09-17/18**: order status/payment updates, product edits, bake session capacity edits
        all work. Found and fixed a real bug along the way (see below).
  - [x] Admin login/session works over HTTPS with secure cookies — verified by code review
        2026-09-17, see notes below

## Code review notes (2026-09-17)

- [x] Fixed race condition in `reserveBakeSessionCapacity` (`lib/bakeSessions.ts`) — was a
      read-then-write with no atomic guard, unlike `reservePickupSlot`. Two concurrent orders near
      full bake capacity could both pass the check and overshoot `maxCapacity`. Now uses an atomic
      `updateMany` with a `WHERE reservedUnits <= maxCapacity - units` guard, same pattern as the
      pickup slot reservation.
- [x] Reviewed order creation/cancellation symmetry (`lib/orders.ts`) — cancellation correctly
      releases pickup slot, bake capacity, and restocks products. No issues found.
- [x] Reviewed email fallback behavior (`lib/email.ts`) — gracefully no-ops to console log when
      SMTP unconfigured, never throws/blocks order creation. No issues found.
- [x] Reviewed admin session cookie security (`app/api/admin/login/route.ts`) — `httpOnly: true`,
      `secure: NODE_ENV === 'production'`, `sameSite: 'lax'`. Confirmed correct; satisfies the
      "secure cookies over HTTPS" checklist item by code inspection.

## Production deploy pipeline bug found & fixed (2026-09-17/18)

- **Bug**: `package.json` had no `postinstall`/build step running `prisma generate`. Vercel's build
  reused a stale cached Prisma Client that predated the `Testimonial` model, and (more critically)
  appears to have caused order-cancellation restock (`updateOrderStatus` cancelled branch in
  `lib/orders.ts`) to silently fail to persist `Product.stockQuantity` increases in production,
  even though the same code is logically correct and worked once redeployed with a fresh client.
  Repro: cancel an order in `/admin/orders` → pickup slot and bake capacity released correctly, but
  product stock never restored.
- **Fix**: added `"postinstall": "prisma generate"` and changed `"build"` to
  `"prisma generate && next build"` in `package.json`, guaranteeing the Prisma Client is always
  regenerated from the current `schema.prisma` before every build/deploy.
- **Verified fixed**: after redeploying, order create → cancel cycle on production correctly
  decrements then restores `stockQuantity`, confirmed by the user directly on
  `izys-sourdough.vercel.app` and independently via repeated `/api/products` checks.
- **Also fixed while investigating**: production had never redeployed after the testimonials
  feature was merged (deploy was 2 days stale), so that fix also brought production up to date with
  `main`.

## Known deferred items (see `DEFERRED.md`)

- SMS notifications (Twilio) — intentionally paused, not a blocker
- Sentry error tracking — intentionally paused, not a blocker
- Admin new-order email — **turned on**, requires `ADMIN_NOTIFICATION_EMAIL` set in `.env.local` and Vercel

## Next suggested steps

1. ~~Decide whether Sentry should be turned on before launch~~ — **deferred, revisit post-launch.**
2. ~~Decide whether Twilio / admin-notification email should be turned on~~ — **Twilio deferred,
   admin-notification email turned on** (set `ADMIN_NOTIFICATION_EMAIL` in `.env.local` + Vercel).
3. ~~Verify production env vars are set in the hosting provider~~ — **done 2026-09-15**, see Task 6.
4. Place a real guest test order on **production** (`https://izys-sourdough.vercel.app`) to verify
   checkout, capacity tracking, pickup slot reservation, and email all work against the live Neon DB.
5. Test registered-customer checkout/login and full admin CRUD in production.
6. Update this file as items are completed or new gaps are found.
