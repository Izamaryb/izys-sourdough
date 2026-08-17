# Task 2 — Order Submission API (Inventory Deduction)

Status legend: ✅ Done · 🟡 Partial · ⬜ Not Started

## Checkout entry paths — ⬜

Customer can: continue as guest, sign in, or create an account. Not yet
built — depends on auth fields on `Customer`
(`references/data-models.md`).

## Order creation logic — ✅

Implemented in `lib/orders.ts`:
- Validates products are active and have sufficient stock.
- Finds the open `BakeSession` for the selected pickup date.
- Calculates total production units from item quantities.
- Checks remaining `BakeSession` capacity and reserves units by incrementing
  `reservedUnits`.
- Reserves the `PickupSlot` and creates the `Order` linked to the customer,
  bake session, payment, and order items.
- Deducts product inventory and updates `inventoryStatus`.
- Sends a confirmation event via `lib/notifications.ts` (placeholder logger
  until email/SMS integrations are built).

Example: Bake capacity 40 units, order of 5 loaves → remaining 35 units.

## Order status — ✅

`OrderStatus` enum (`prisma/schema.prisma`): `confirmed | readyForPickup |
pickedUp | cancelled`. Initial status on creation: `confirmed`.

`lib/orders.ts` exports `updateOrderStatus(id, nextStatus)` which enforces
allowed transitions (`confirmed` → `readyForPickup`/`cancelled`;
`readyForPickup` → `pickedUp`/`cancelled`; `pickedUp`/`cancelled` are
terminal) via `ALLOWED_STATUS_TRANSITIONS` and throws
`InvalidOrderStatusTransitionError` otherwise. Cancelling an order releases
the reserved `PickupSlot` (`releasePickupSlot`), releases `BakeSession`
capacity (`releaseBakeSessionCapacity` in `lib/bakeSessions.ts`), and
restocks each `Product`. `PATCH /api/orders/[id]` (`app/api/orders/[id]/
route.ts`) exposes this: body `{ status }`, returns `409` on invalid
transition, `404` if order not found, `400` on invalid status value.
Status changes fire `sendOrderStatusUpdate` (`lib/notifications.ts`,
currently log-only like `sendOrderConfirmation`).

Still needed: admin UI to call this endpoint (see
`references/notifications-and-admin.md`).

## Payment rules — ✅

Orders confirm immediately; payment does not block order creation.
Example: Order status `Confirmed`, Payment status `Awaiting Payment` is a
valid combination.

## Boundaries (do not build yet)

* Payment processing
* Refund automation
* Subscription orders
* Production workflow (beyond capacity tracking)

---

# Task 3 — Pickup Slot API (Capacity Tracking)

## Pickup slot model — ✅

`PickupSlot` already has: date, start time, (end time implied), max
order count (`capacity`), current order count (`orderCount`).

## Reservation rules — ✅

On order submission: check slot availability, reserve slot, increment
`orderCount`. If full, prevent checkout. Confirmed: slots are limited by
**order count**, not loaf quantity (an order of 5 loaves still counts as
1 against the slot).

## Admin controls — ✅

`upsertPickupSlotConfig(date, time, { capacity, isEnabled })` in
`lib/pickupSlots.ts` creates a `PickupSlot` row if one doesn't exist for a
date/time, or updates its `capacity`/`isEnabled` fields otherwise. Exposed
via `PATCH /api/pickup-slots` (`app/api/pickup-slots/route.ts`), body
`{ date, time, capacity?, isEnabled? }`:
* **Create pickup windows** — upserting a date/time not yet in the table
  creates it with the given (or default) capacity/enabled state.
* **Adjust maximum orders per slot** — pass `capacity`; rejected with `409`
  if lower than the slot's current `orderCount`.
* **Disable specific slots** — pass `isEnabled: false`; disabled slots are
  excluded from customer selection in `getPickupSlotsWithAvailability`
  (already enforced — see Reservation rules above).

No admin auth/UI wraps this endpoint yet — that's `references/
notifications-and-admin.md` Task 5.

## Boundaries

* Do not limit pickup slots based on loaf quantity — only order count.
