# BelleFood: Node.js and Firebase Backend

## Plan Steps

- [x] 1. Expand `lib/api.ts` with TypeScript types + `getMenu`, `getCart`, `addToCart`, `removeFromCart`, `createOrder`
- [x] 2. `components/menu/Category.tsx` — fetch real products from backend with loading/error states
- [x] 3. `lib/cartStore.ts` — switch to string IDs (backend product IDs)
- [x] 4. `app/product/[slug]/page.tsx` — fetch product by id from backend
- [x] 5. `components/home/SignatureDishes.tsx` — fetch featured dishes from backend
- [x] 6. `components/home/Categories.tsx` — fetch categories from backend menu
- [x] 7. `components/cart/CartItems.tsx` — load/persist cart from backend
- [x] 8. `components/checkout/OrderSummary.tsx` — real items/totals from cart store + submit order
- [x] 9. `components/checkout/CustomerInfo.tsx` — controlled customer fields (name/phone/email)
- [x] 10. `lib/orderStore.ts` + `components/order-confirmation/Order.tsx` — display real placed order
- [x] 11. Backend: implement Order/Customer endpoints (POST /api/orders)
- [x] 12. Test end-to-end (backend + frontend)

## Node Backend

- [x] Replace the planned Spring Boot service with a Node.js API
- [x] Add Firebase Admin and Firestore-backed products, carts, customers, orders, payment records, and deliveries
- [x] Implement product, menu, cart, order-create, and order-lookup API routes used by the frontend
- [x] Calculate order prices on the server from Firestore product records
- [x] Add demo product seeding and Firebase setup notes
- [x] Connect the frontend proxy and cart synchronization to the Node API
- [x] Add frontend and API services to the Render Blueprint
- [ ] Configure Firebase credentials and replace the demo menu with the restaurant's real menu
- [ ] Connect a payment provider before accepting or confirming payments

