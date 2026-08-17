# Technical Implementation

## Tech Stack

* Next.js (App Router)
* Tailwind CSS
* React hooks
* API routes / server actions

## Pages

* `/` (Landing)
* `/menu`
* `/cart`
* `/checkout`
* `/confirmation`

## Components

* Navbar
* HeroSection
* ProductCard
* ProductGrid
* CartItem
* CheckoutForm
* PickupSlotSelector
* OrderSummary
* Button
* InputField

## Data Models

### Product

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "ingredients": ["string"],
  "price": number,
  "inventory": number,
  "image": "string"
}
```

### Order

```json
{
  "id": "string",
  "customerName": "string",
  "email": "string",
  "phone": "string",
  "items": [
    { "productId": "string", "quantity": number }
  ],
  "pickupTime": "string",
  "paymentMethod": "cash | venmo | cashapp",
  "status": "confirmed | canceled"
}
```

## Core Logic

### Inventory

* Deduct inventory on order
* Block checkout if insufficient

### Pickup Slots

* Max 1 orders per slot
* Disable full slots

### Cutoff Logic

* Disable ordering <48 hours before pickup

## Mobile Requirements

* Single column layout
* Large tap targets
* Readable typography (16px+)
* Minimal scrolling friction

## MVP Scope

Build ONLY:

* Menu browsing
* Cart
* Checkout
* Pickup scheduling
* Confirmation

Do NOT build yet:

* user accounts
* subscriptions
* advanced admin panel

## Final Instruction for Windsurf

Use this PRD to build a complete mobile-first Next.js application.

* Follow all design system rules
* Use Tailwind for styling
* Build reusable components
* Prioritize simplicity and clarity
* Ensure all logic (inventory, slots, cutoff) works correctly

Start by scaffolding the project, then build pages and components.
