# Proteini.mk Administrator Feature Guide

Administrators need `SuperAdmin = 1` and must sign out/in after access changes so a fresh JWT contains the claim.

## Orders — `/admin-orders`

- Search by order number, name, email or phone; filter status/payment; choose sorting and direction.
- Open an order for addresses, items, variants/flavours, delivery, discounts, points, free gifts and voucher issue/redemption detail.
- Only valid next status actions are shown. When marking Shipped, enter the courier tracking number and optional HTTP/HTTPS tracking URL.
- Download the immutable operational order document or export filtered CSV.
- “Refunded” records an operational state; confirm any real payment-provider refund separately.

Email behavior is automatic, not manual: COD confirms immediately after successful order creation; card confirms after verified successful payment. Admin status changes do not resend order confirmation.

## Promotions, gifts, vouchers and delivery — `/admin-promotions`

### Promotion codes

- Create/edit percentage or fixed discounts, minimum amount, maximum discount, dates, global/per-customer limits and active state.
- Used codes are safely archived rather than destroying history. Use the report date filters and CSV export.
- The public checkout intentionally does not display promotion-code entry, per client direction.

### Free gifts

- Choose the product and exact variant, minimum subtotal, dates and active state.
- Confirm stock before activating. Customer and server eligibility are checked again at checkout.

### Gift vouchers

- Voucher products are configured in product admin with Gift voucher enabled and approved minimum/maximum MKD amount.
- Redeemable codes are generated only after the voucher-purchase order is paid.
- Search issued codes/email, inspect initial/remaining balance and status, change expiry, enable/disable, and export CSV.
- Checkout has a separate Gift voucher field. Vouchers support partial redemption; the remaining balance stays on the same code.

### Delivery settings

- Edit flat delivery fee, COD surcharge and free-delivery threshold.
- Enable/disable card and COD methods; at least one must remain enabled.
- Defaults are 165 MKD delivery, 30 MKD COD and free delivery from 3000 MKD.
- Do not enter historical weight-bracket/VAT rules until commercial values are approved and the calculation model is extended.

## Customers/newsletter — `/admin-audience`

- Switch between registered customers and newsletter subscribers.
- Search and page server-side; customer rows include order count, lifetime value and last order.
- Subscriber rows include consent date/source and subscription state. Activate/deactivate as required.
- Export personal data only for an authorized purpose. Customers are never automatically subscribed.

## Homepage goals/sports — `/admin-homepage-sections`

- Create/edit MK/AL titles, slug, product-filter mapping, display order, active state and image.
- Optional destination accepts an internal path or Proteini.mk HTTPS URL only.
- Duplicate slugs and invalid/oversized image uploads are rejected.
- Verify both desktop and mobile after editing.

## Tips — `/admin-tips`

- Create/edit category, MK/AL title/subtitle/content, stable slug, SEO title/description, image, order and active state.
- Formatted HTML is sanitized by the server. Public details appear at `/tips/:slug`.
- Unpublish to hide without deleting historical content.

## Categories — `/admin-categories`

- Manage name, unique slug, parent and order.
- A category cannot be its own parent or a child of its descendants.
- Deletion is blocked while children/products reference it.
- Changing a published slug records the old slug; visitors to the old path are redirected to the current path.

## Products/variants — `/admin-panel`

- Manage catalogue content, translated fields, categories, brand, price/sale, stock and variants.
- Search covers product/brand/category/flavour/packaging/SKU across Macedonian Cyrillic/Latin, Albanian and English variants.
- Voucher products require approved minimum/maximum values. Accurate variant weights should still be entered even though the current shipping rule is flat-fee.

## Troubleshooting

- **Admin access required / 401 / 403:** sign out/in, verify `SuperAdmin`, token expiry and server clock.
- **Unexpected JSON error:** inspect the API HTTP status; it is often authorization or a backend schema mismatch.
- **New screens fail after deployment:** confirm `complete-ecommerce-features-20261014.sql` ran successfully before the new backend/frontend were activated.
- **Voucher rejected:** verify code, remaining balance, active state, valid date and that the cart does not contain a voucher product.
- **Gift unavailable:** verify threshold, dates and exact product/variant stock.
- **Email missing:** distinguish COD order creation from verified card payment, then inspect protected server logs/SMTP without exposing credentials.
- **Old category link:** verify the slug-history migration/table and resolver endpoint.

## Out of scope

Abandoned-cart reminders, Viber, replenishment reminders, marketing campaign schedulers and retry queues are not part of this project. The order and password-reset transactional emails remain.
