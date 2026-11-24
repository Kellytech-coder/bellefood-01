# BelleFood Node API

This Node.js service replaces the planned Spring Boot API. It uses Firebase Admin and Cloud Firestore, and exposes the API consumed by the Next.js frontend.

## Local setup

Use Node.js 22.9 or newer.

1. Create or select a Firebase project and enable Cloud Firestore.
2. Create a Firebase service account with Firestore access. Keep its key private.
3. Copy `.env.example` to `.env` and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. For the private key, preserve line breaks or store them as `\\n`; the server converts escaped newlines. You can instead set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full service-account JSON string.
4. Set a private `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` for dashboard access. The dashboard signs in with the email and password; the backend stores the login as a short-lived HttpOnly session cookie.
5. Run `npm install` and `npm start` from this directory. The API listens on port 8083 by default.
6. To load editable sample products, run `npm run seed`. The seed script merges these demo products into Firestore's `products` collection.

Set the frontend `BACKEND_API_URL` to `http://localhost:8083/api`. Routes are also available without the `/api` prefix for the Render service URL.

## Firestore collections

- `products/{productId}`: `name`, `description`, `price` (NGN number), `imageUrl`, `category`, `rating`, and `available`.
- `carts/{anonymousCartId}`: server-managed cart item array. The API issues an HttpOnly cookie to associate a browser with its cart.
- `orders/{orderId}`: customer details, server-priced items, totals, status, and delivery details.
- `customers/{sha256(email-or-phone)}`: latest customer contact details.
- `payments/{orderId}`: payment method and `pending` status.
- `deliveries/{orderId}`: delivery address and `pending` status.

The API calculates prices from Firestore product records, so order totals sent by a browser are ignored. Creating an order records a pending payment; it does not charge a card or confirm a bank transfer. Connect a payment provider before treating orders as paid.
