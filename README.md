# BelleFood

BelleFood is a food ordering storefront built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Zustand. The App Router pages live in `app/`, reusable interface components are grouped by feature in `components/`, and shared API and state logic lives in `lib/`.

## Requirements

- Node.js 22 or newer
- npm
- The BelleFood API (Spring Boot), when using live menu, cart, and checkout features

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to the project root as `.env.local` and set `BACKEND_API_URL` to your API base URL. For a local backend, use `http://localhost:8083/api`.
3. Start the frontend with `npm run dev` and open [http://localhost:3000](http://localhost:3000).

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
public/              Static images, icons, and videos
Dockerfile           Multi-stage production container
Jenkinsfile          CI pipeline
```

## Production deployment

The Dockerfile builds Next.js in standalone mode and runs the generated server. Set `BACKEND_API_URL` in the runtime environment of the container to point to the reachable backend service (for example, `http://backend:8083/api` on a Docker network).

### Deploying the frontend on Render

The root `render.yaml` defines the frontend as a Docker web service. Commit and push `render.yaml` to the selected GitHub branch before creating the Render Blueprint; Render cannot read an unpushed local file. In the Blueprint setup flow, set `BACKEND_API_URL` to the public base URL of your deployed BelleFood API, including `/api` (for example, `https://your-backend.onrender.com/api`). The backend must be deployed and reachable separately; this repository contains only the frontend and its `/api/backend` proxy.
