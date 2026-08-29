# Hisab 🍱 — Daily Tiffin Ka Hisab, Ab Automatically.

Automated daily tiffin management for bachelors, roommates, PG residents and
friend groups sharing a tiffin provider.

## Structure

```
hisab/
├── server/   Express + TypeScript + MongoDB backend
└── client/   React + TypeScript + Vite + Tailwind frontend
```

## Auth model (kept intentionally simple)

- Login/register return a single JWT `token` in the response body.
- The frontend stores it in `localStorage` (`client/src/lib/authToken.ts`)
  and sends it as a normal `Authorization: Bearer <token>` header on every
  request (`client/src/lib/axios.ts`).
- **No cookies, no refresh token, no expiry.** The token is valid until you
  change `JWT_SECRET` or manually clear localStorage.
- This is deliberately not production-hardened auth — fine for a personal
  project / small trusted group, not something to expose broadly without
  revisiting (e.g. add expiry + refresh, or short-lived tokens, before any
  real public deployment).

## Running locally

### 1. Backend

```bash
cd server
cp .env.example .env   # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run dev             # http://localhost:5000
```

- API base: `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/api/docs`
- Requires a MongoDB instance reachable at `MONGO_URI` (defaults to
  `mongodb://127.0.0.1:27017/hisab` — a local `mongod` works out of the box).

### 2. Frontend

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`.
For a deployed backend, set `VITE_API_URL` in `client/.env.local`:

```
VITE_API_URL=https://your-backend-url.com/api
```

## What's implemented (MVP scope)

- Auth: register / login / logout / session (simple token, see above)
- Multi-group support: create, join by invite code, per-group provider &
  pricing, cutoff time, duration with auto end-date, renew (preserves
  history), close, and soft-delete
- Daily tiffin flow: Full / Half / None selection, cutoff enforcement,
  admin override
- Automatic order summary for the admin to call the provider
- Automatic hisab (billing) calculation, using the price stored on each
  historical record so past bills never change when today's price changes
- Manual payment recording + paid/partial/pending status
- Group-scoped authorization (admin-only vs member actions) on every route
- In-app notifications
- English + Marathi i18n, mobile-first responsive UI, installable PWA shell
- "Group Expense Splitting" shown as a **Coming Soon** card only — no
  backend, per spec

## Data layer on the frontend

`client/src/api/generated/` holds hand-written TanStack Query + Axios hooks,
one folder per resource, all routed through the shared axios instance in
`client/src/lib/axios.ts`.

## Notes

- Historical tiffin/price data is never mutated by later price changes —
  see `priceAtTime` on `DailyTiffinRecord` and `server/src/services/hisab.service.ts`.
- `DailyTiffinRecord` has a compound unique index on
  `(groupId, userId, date)` so a member can never have two records for the
  same day.
- Group deletion is a **soft delete** (`status: "DELETED"`) — history is
  preserved, group just disappears from lists.
