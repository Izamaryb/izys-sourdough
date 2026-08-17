# Core Features

## User Flow

Landing → Menu → Cart → Checkout → Pickup Slot → Payment → Confirmation →
Reminder → Pickup

## 1. Product Catalog

Each product includes:

* Name
* Image
* Description
* Ingredients
* Allergen info
* Price
* Inventory count

### Product States

**Available**

* Add-to-cart enabled

**Low Stock**

* Label: "Only X left"

**Sold Out**

* Image blurred (60% opacity)
* Overlay: "SOLD OUT"
* Add-to-cart disabled

## 2. Cart

* Add multiple loaves
* Adjust quantity
* View total

### Validation

* Check inventory on add
* Re-check at checkout

## 3. Checkout (Guest Only)

Required fields:

* Name
* Email
* Phone
* Pickup slot

## 4. Pickup Scheduling

* Day: Wednesday
* Slots: every 15 minutes
* Capacity: 2 customers per slot

### Logic

* 1 order = 1 slot
* Disable slot when full

## 5. Payments (MVP)

* Venmo / CashApp (manual instructions)
* Cash at pickup
* Refunds handled manually

## 6. Notifications

* Order confirmation (email, optional SMS)
* Pickup reminder

## 7. Admin (Basic)

* Manage products
* Set inventory
* View orders by pickup time
* View totals
* Manage blackout dates
* Generate baking list

Placeholders:

* Email platform: TBD
* CSV export: TBD

## Inventory Logic

* Total loaves per bake: fixed (e.g., 10)
* Inventory decreases per loaf ordered
* When inventory = 0 → ordering closes
