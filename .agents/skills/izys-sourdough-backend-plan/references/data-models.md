# Task 1 — Database Setup + Product API

Status legend: ✅ Done · 🟡 Partial · ⬜ Not Started

## Product — ✅

Fields in `prisma/schema.prisma`: name, description, price, image,
ingredients, allergens, `isActive`, `isFeatured`, inventory status/
quantity, plus `categoryId` (optional FK to `Category`), `isSeasonal`,
`seasonalStartDate`, `seasonalEndDate`.

## Category — ✅

`Category` model: `name`, `slug` (unique), `sortOrder`. `Product.categoryId`
is an optional FK (one-to-many). No hardcoded category enum in code —
seeded via `prisma/seed.ts` (Bread, Muffins, Mini Cakes) and readable via
`GET /api/categories`.

## Customer / Auth — 🟡

Existing: email, first/last name, phone, `marketingOptIn`, `smsOptIn`,
`passwordHash` (nullable, schema-only for now).

Still missing (deferred to Task 2 — order-and-pickup-apis.md):
* Signup/login endpoints that actually hash/verify `passwordHash`.
* Session/token handling for logged-in state.

Must continue to support:
* Guest checkout users (no account).
* Registered customers: login during checkout, view order history, save
  info for reorder.

## BakeSession — ✅ (schema only)

`BakeSession` model added: `bakeDate`, `pickupDate`, `maxCapacity`,
`reservedUnits`, `status` (`BakeSessionStatus`: draft/open/full/closed/
completed). `Order.bakeSessionId` is an optional FK so Task 2 capacity
checks can wire in without another migration. Recurring/extra/skip/vacation
scheduling logic is not built yet (Task 2/5 concern).

## Order / OrderItem — ✅

`Order.status` (`OrderStatus`) now: `confirmed | readyForPickup |
pickedUp | cancelled`. `Order.paymentMethod` column removed in favor of
the `Payment` relation (see below). `Order.bakeSessionId` added (nullable)
for future capacity checks — capacity validation logic itself is Task 2/3.

## Payment — ✅

New `Payment` model (1:1 with `Order`, cascade delete): `method`
(`PaymentMethodType`: cash/venmo/cashApp), `status` (`PaymentStatus`:
notRequired/awaitingPayment/paid/refunded/failed, default
`awaitingPayment`), `amountCents`. `lib/orders.ts` maps the app-facing
kebab-case `PaymentMethod` (`'venmo' | 'cash-app' | 'cash'`) to/from the
Prisma enum via `toPrismaPaymentMethod`/`fromPrismaPaymentMethod`, so
`OrderConfirmation.paymentMethod` is unchanged for the front end.

## PickupSlot — ✅

Added `isEnabled` (default `true`) admin flag. `getPickupSlotsWithAvailability`
treats disabled slots as `reserved: true`; `reservePickupSlot` throws if a
slot is disabled.

## Product API — ✅ (read + admin write)

* `GET /api/products` — active products (`app/api/products/route.ts`).
* `POST /api/products` — admin create (no auth guard yet).
* `GET /api/products/:id` — by slug or id.
* `PATCH /api/products/:id` — admin update (partial).
* `DELETE /api/products/:id` — admin delete.
* `lib/products.ts` adds `getAllProducts`, `createProduct`, `updateProduct`,
  `deleteProduct`, all including the `category` relation.
* `GET /api/categories` / `POST /api/categories` — new, backed by
  `lib/categories.ts`.

Migration `20260806111956_task1_updated_data_models` applied; `npm run
db:seed` re-seeds 3 categories + 3 products with `categoryId` set.

## Boundaries (do not build yet)

* Online payment processing
* Production workflow (beyond capacity tracking)
* Ingredient-level inventory
* Analytics
* Subscription logic
