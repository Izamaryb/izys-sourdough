# Task 4 — Email Confirmation

Status legend: ✅ Done · 🟡 Partial · ⬜ Not Started

## Customer email — ✅

Sent from `lib/orders.ts` via `sendOrderConfirmation` (`lib/notifications.ts`)
immediately after successful order creation. `lib/email.ts` uses `nodemailer`
with SMTP config from env vars (`SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/
`SMTP_USER`/`SMTP_PASSWORD`/`EMAIL_FROM`/`EMAIL_FROM_NAME`); falls back to
console logging if SMTP isn't configured, so it never throws and never blocks
order creation. Includes customer name, order number, items + quantities,
subtotal, pickup date/time/location/instructions, and payment method (HTML +
plain-text). `sendOrderStatusUpdate` also fires on status changes but only
triggers SMS today, not a status-change email.

## SMS preparation — ✅

`lib/sms.ts` builds `SmsMessage` payloads (`buildOrderConfirmationSms`,
`buildOrderStatusUpdateSms`) gated on `Customer.smsOptIn` /
`OrderConfirmation.smsOptIn`, and `lib/notifications.ts` calls `sendSms` at
the right points. `sendSms` uses the `twilio` SDK with config from
`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`; falls back to
console logging if unconfigured, and never throws (failures don't block
order creation/status updates).

## Admin notification — 🟡

`sendAdminNotification` (`lib/notifications.ts`) fires on every new order but
is still console-log only. Real integrations (admin email, push
notifications, Home Assistant webhook) are optional/future — plan
originally scoped this as placeholder-only.

## Boundaries (do not build yet)

* Marketing emails
* Newsletter system
* Automated promotions

---

# Task 5 — Basic Admin Panel

`/admin` routes exist and cover dashboard, products, bake sessions, orders,
and settings (see below) — this task is ✅ Done, pending auth (routes are
currently unauthenticated).

## Dashboard homepage

* **Today's Orders**: order number, customer, products, pickup time,
  status.
* **Production Summary**: per-product totals and grand total units
  (e.g. Classic: 20, Jalapeño: 10, Total: 30 units) — sourced from
  `BakeSession` + `OrderItem` aggregation.
* **Pickup Schedule**: customers, pickup times, order status.
* **Customer Metrics**: new customers, repeat customers (more accurate
  once registered accounts exist, per `references/data-models.md`).
* **Best Sellers**: product sales ranking.

## Admin CRUD features

* **Products**: add, edit, disable (soft-delete via `isActive`).
* **Bake Sessions**: create sessions, modify capacity, close sessions.
* **Orders**: view orders, update order status, update payment status.
* **Settings**: vacation mode (blocks bake session creation/pickup
  slots for a date range), accepted payment methods toggle.

## Boundaries (do not build yet)

* Full analytics dashboard
* Ingredient inventory
* Production workflow (beyond capacity tracking)
* Employee accounts
