# BelleFood

BelleFood is a food ordering storefront built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Zustand. The App Router pages live in `app/`, reusable interface components are grouped by feature in `components/`, and shared API and state logic lives in `lib/`.

## Requirements

- Node.js 22.9 or newer
- npm
- Firebase credentials, when using live menu, cart, and checkout features

## Local development

1. Install dependencies with `npm ci`.
2. Configure Firebase credentials for the Node API using `backend/.env.example` as a reference.
3. Start the API from `backend/` with `npm install` and `npm start`; in another terminal start the frontend with `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

The browser calls the same-origin `/api/backend` proxy, which forwards requests to `BACKEND_API_URL`. This keeps browser CORS configuration out of the way and keeps the backend URL on the server. The default backend URL is `http://localhost:8083/api`.

## Available commands

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve a production build

## Project layout

```text
app/                 Routes, root layout, and global styles
components/          UI grouped by page feature
lib/                 API client, shared data, and client-side stores
backend/             Node.js API and Firebase setup
public/              Static images, icons, and videos
Dockerfile           Multi-stage production container
Jenkinsfile          CI pipeline
```

## Production deployment

The Dockerfile builds Next.js in standalone mode and runs the generated server. The Node API lives in `backend/` and stores products, carts, orders, customers, payment records, and delivery records in Firestore.

### Deploying the frontend on Render

The root `render.yaml` defines both the frontend and Node API. Commit and push it to the selected GitHub branch before creating the Render Blueprint. During setup, provide the Firebase project ID, service account email, and private key for the API. The Blueprint connects the frontend to the API automatically. See `backend/README.md` for Firestore setup and sample product seeding.
