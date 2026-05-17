# Project Plan — Pivot to Catering-Only

**Project:** Chef Aboud Küche website
**Client:** Chef Aboud (contact: Abdulla)
**Last updated:** 2026-05-17

## Scope change

Per Abdulla's update: restaurant à-la-carte food ordering is removed from the
website. Catering / buffet orders become the only transactional flow. The
ordering experience should follow a standard catering-website pattern (reference:
https://refueat.de/online-bestellung/), but the design must feel noticeably more
premium and luxurious than typical catering sites.

## Current state

### Restaurant ordering exists in 5 places (all to be de-commerced)

| Location | What it does today |
|---|---|
| `src/app/[locale]/menu/page.tsx` -> `MenuExplorer.tsx` | Full menu with add-to-cart + "go to checkout" buttons |
| `src/app/[locale]/menu/[id]/ProductDetailClient.tsx` | Dish detail page with "Add to Cart" |
| `src/components/FeaturedDishes.tsx` | Home-page dishes, each adds to cart |
| `src/components/MenuDropdown.tsx` | Nav dropdown for menu categories |
| `src/app/[locale]/checkout/page.tsx` | Dual-mode: handles restaurant delivery AND catering |

### Catering flow already works (~70% complete)

- `catering/page.tsx` -> `BuffetCalculator.tsx`: 3 predefined buffet packages +
  a custom "build your buffet" station builder -> guest count -> "Book" -> adds
  package to cart -> `/checkout?type=catering`. This is already the
  refueat.de-style flow.
- `catering/[id]/page.tsx`: premium package detail page, but its CTA wrongly
  points to `/reservations` ("Inquire Now") instead of into the order flow.

## The plan

### Phase 1 — Remove restaurant ordering (functional)

1. Nav: keep the `/menu` `MenuDropdown` (client likes it) — it is browse-only
   navigation with no ordering, so it stays as-is.
2. `MenuExplorer`: strip add-to-cart, quantity controls, checkout buttons ->
   display-only menu that showcases the food.
3. `ProductDetailClient`: remove "Add to Cart" -> display-only dish page.
4. `FeaturedDishes` (home): remove add-to-cart; keep as a visual "Signature
   Dishes" showcase.
5. `CartDrawer` / checkout: remove the non-catering branch — cart and checkout
   become catering-only (`type=catering` always).

### Phase 2 — Tighten the catering ordering flow (refueat-style)

Baseline fixes:

1. Fix the `catering/[id]` detail-page CTA -> "Order this package" that loads it
   into the buffet flow / checkout, instead of `/reservations`.
2. Make the BuffetCalculator the clear primary CTA site-wide (home hero, nav
   "Order Now" -> `/catering`).
3. Checkout: keep event date/time/location, guest count, service fee — drop
   delivery/COD restaurant logic.

Refueat-derived additions (reference: refueat.de/online-bestellung/):

4. **Event-config-first step.** Collect date, time slot, and location BEFORE
   food selection (currently collected only at checkout). A short configurator
   at the top of the catering flow.
5. **Delivery vs. pickup choice.** Add a toggle; pickup can carry a small
   discount (refueat uses 5%). Affects the fee breakdown.
6. **Dietary filter.** Vegan / vegetarian / with-meat filter on the buffet
   builder — the menu data already carries dietary tags, so this is mostly UI.
7. **Request-a-quote path.** Add a "Request Quote" option alongside instant
   checkout. Large catering orders (weddings, corporate) typically want a formal
   quote before paying — refueat offers both. This also resolves the
   "Inquire Now" inconsistency on the package detail page.
8. **Transparent fee breakdown.** Cart/summary shows base cost, delivery,
   time-window surcharges, and any extras as separate line items.
9. (Optional, confirm with client) **Add-on extras** — e.g. table cards,
   rental equipment/serving ware — as configurable line items with surcharges.

### Phase 3 — Premium design pass

Catering pages already use a dark-luxury palette (espresso `#0c0803`, gold
`#c17f3b`, cream, serif type, grain texture, Roman-numeral "stations"). To push
past typical catering sites: refine spacing/typography hierarchy, elevate the
package cards, add tasteful motion, ensure the home page leads with the catering
story. Detailed once Phase 1-2 are locked.

## Resolved — menu decision (confirmed by Abdulla)

Abdulla confirmed: the restaurant menu **stays visible as a showcase** so
visitors can browse all dishes. There is **no online ordering** for restaurant
meals — dine-in orders are handled by the waiter at the restaurant. Catering is
the main focus of the website and the only online ordering flow.

This matches the implemented Phase 1 (display-only menu, all add-to-cart
removed, catering-only checkout). No rework needed.

## Open question for Abdulla — PDF / quote feature

Reference site lets customers get their quote as a PDF / by email. Options:
- A. Browser-side PDF download — within current scope.
- B. Quote-request form (mailto) — within current scope.
- C. Fully automated PDF emailed to customer — needs backend + email service,
  additional work beyond the current scope.

Awaiting Abdulla's decision before building (see Phase 2, item 7).
