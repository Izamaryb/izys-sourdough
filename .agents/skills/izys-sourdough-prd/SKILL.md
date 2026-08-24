---
name: izys-sourdough-prd
description: Product requirements for Izy's Sourdough, a mobile-first preorder website for a small in-home sourdough bakery. Use this skill when building, reviewing, or modifying features on the site (menu/catalog, cart, checkout, pickup scheduling, payments, notifications, admin) or when questions arise about business rules, design system, or data models. Load only the reference file(s) relevant to the current task instead of the whole PRD.
---

# Izy's Sourdough PRD Skill

This skill splits the original PRD (`app/docs/PRD.md`) into topic-scoped
reference files so only the relevant context needs to be loaded for a given
task. Start here, then open only the reference file(s) needed.

## When to use this skill

Use when implementing or reasoning about any feature of the Izy's Sourdough
site: product catalog, cart, checkout, pickup scheduling, payments,
notifications, admin tools, inventory logic, design system/styling, or the
technical architecture (pages, components, data models).

## Quick summary (always in context)

- **Product**: mobile-first preorder site for a small in-home sourdough bakery.
- **Cadence**: Bake day Tuesday, pickup day Wednesday. Order cutoff 48h before
  pickup.
- **Inventory**: fixed loaves per bake; ordering closes at 0. Pickup slots
  limit people, not loaves.
- **Checkout**: guest-only, manual payments (Venmo/CashApp/Cash).
- **MVP scope**: menu browsing, cart, checkout, pickup scheduling,
  confirmation. No user accounts, subscriptions, or advanced admin yet.

## Reference files (load on demand)

- **`references/business-and-goals.md`** — Product overview, business model,
  business/user goals, target users, brand identity, constraints, future
  features, success metrics. Load when answering "why"/business-rule
  questions or scoping new features against MVP boundaries.
- **`references/features.md`** — Core feature specs: product catalog states,
  cart validation, checkout fields, pickup scheduling logic, payments,
  notifications, admin tools, inventory logic, and the end-to-end user flow.
  Load when implementing or modifying any feature behavior.
- **`references/design-system.md`** — Colors, typography (incl. mobile sizes),
  spacing scale, border radius, component states (buttons, cards, inputs,
  product card states), and landing page structure. Load when writing or
  reviewing UI/styling code.
- **`references/technical.md`** — Tech stack, pages, components, data models
  (Product, Order JSON shapes), core logic (inventory, pickup slots, cutoff),
  mobile requirements, and MVP build scope. Load when scaffolding code,
  defining types, or wiring logic.

## Notes

- The original, unsplit PRD remains at `app/docs/PRD.md` for reference/history.
- Prefer reading only the reference file(s) relevant to the current task
  rather than all four, to minimize context usage.
