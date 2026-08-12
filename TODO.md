# BelleFood: Connect Frontend to Spring Boot Backend

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

## Backend Completion Steps (current task)

- [ ] 1. Implement `common` classes: `ApiException`, `ApiExceptionHandler`, `Constants`
- [ ] 2. Implement empty DTOs: `CartRequest/CartResponse`, `ProductRequest/ProductResponse`, `MenuRequest/MenuResponse`
- [ ] 3. Add `getOrderById` to `OrderService` + `GET /api/orders/{id}` endpoint
- [ ] 4. Implement `customer` module: model, DTOs, Firebase `CustomerService`, `CustomerController`
- [ ] 5. Implement `payment` module: model, DTOs, Firebase `PaymentService`, `PaymentController`
- [ ] 6. Implement `delivery` module: model, DTOs, Firebase `DeliveryService`, `DeliveryController`
- [ ] 7. Compile/verify backend builds successfully

