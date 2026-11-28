# BelleFood Node API

This Node.js service replaces the planned Spring Boot API. It uses Firebase Admin and Cloud Firestore, and exposes the API consumed by the Next.js frontend.

## Local setup

Use Node.js 22.9 or newer.

1. Create or select a Firebase project and enable Cloud Firestore. To upload product images, also create a Cloud Storage for Firebase bucket.
2. Create a Firebase service account with Firestore access and grant it permission to create objects in the Storage bucket. Keep its key private.
3. Copy `.env.example` to `.env` and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. For the private key, preserve line breaks or store them as `\\n`; the server converts escaped newlines. You can instead set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full service-account JSON string.
4. Set a private `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` for dashboard access. The dashboard signs in with the email and password; the backend stores the login as a short-lived HttpOnly session cookie.
5. Set `CUSTOMER_SESSION_SECRET` to a long random secret for customer sessions. If omitted, the API derives a separate customer session key from `ADMIN_SESSION_SECRET`.
6. Enable the Email/Password provider in Firebase Authentication. Set `FIREBASE_WEB_API_KEY` to the Web API key shown in Firebase Console under Project settings > General. Firebase Authentication sends password reset emails using its configured Password reset email template.
7. Run `npm install` and `npm start` from this directory. The API listens on port 8083 by default.
8. To load editable sample products, run `npm run seed`. The seed script merges these demo products into Firestore's `products` collection.

Set `FIREBASE_STORAGE_BUCKET` to the bucket name shown in Firebase Storage (omit the `gs://` prefix). Admins can upload JPEG, PNG, and WebP product photos up to 5 MB; files are stored in the bucket and their download URLs are saved on the product record. Cloud Storage for Firebase currently requires the Blaze pay-as-you-go plan; usage may incur charges.

Set the frontend `BACKEND_API_URL` to `http://localhost:8083/api`. Routes are also available without the `/api` prefix for the Render service URL.

## Firestore collections

- `products/{productId}`: `name`, `description`, `price` (NGN number), `imageUrl`, `category`, `rating`, and `available`.
- `carts/{anonymousCartId}`: server-managed cart item array. The API issues an HttpOnly cookie to associate a browser with its cart.
- `orders/{orderId}`: customer details, server-priced items, totals, status, and delivery details.
- `customers/{sha256(email-or-phone)}`: latest customer contact details.
- `customerAccounts/{sha256(email)}`: customer profile, account status, cash-on-delivery permission, and registration time. New passwords are managed by Firebase Authentication. Legacy Firestore password hashes are removed when an account migrates to Firebase Auth.
- `payments/{orderId}`: payment method and `pending` status.
- `deliveries/{orderId}`: delivery address and `pending` status.

The API calculates prices from Firestore product records, so order totals sent by a browser are ignored. Creating an order records a pending payment; it does not charge a card or confirm a bank transfer. Connect a payment provider before treating orders as paid.
