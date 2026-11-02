---
paths:
  - "src/features/editor/**"
  - "src/features/templates/**"
  - "src/features/products/**"
  - "src/features/business-info/**"
  - "src/components/**"
---

# Zero-transaction rules (customer websites)

WebBlock websites are showcase/contact sites. They NEVER take orders or payments.

- No cart, checkout, order, booking, "Buy now", quantity selectors or payment forms.
- No WhatsApp links or buttons.
- Call-to-action wording: "Contact us", "Call us", "Email us", "Get directions" — never order/buy wording.
- Allowed CTA targets only:
  - `tel:+855…` (phone)
  - `mailto:…` (email)
  - Google Maps directions: `https://www.google.com/maps/dir/?api=1&destination=<encodeURIComponent(address)>`
  - External `https://` URL, rendered with `target="_blank" rel="noopener noreferrer"`
- CTA hrefs come from validated block props (zod), never from query params.
- No `<form>` on a website block that posts to the site's own API.
- Product cards show name, price, image, category — no stock, no add-to-cart.

Platform subscription billing (14-day trial, Plus/Pro/Ultra paid by KHQR through WeBill365) is a different thing:
it lives only in `features/billing` and only displays the QR and status returned by the API.
The backend talks to WeBill; the frontend never calls WeBill directly.
