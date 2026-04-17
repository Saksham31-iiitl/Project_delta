# NearbyStay client

Vite + React on port **3000**. Proxies `/api` → `http://localhost:5000`.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build

## Env

Copy `.env.example` to `.env`. Set `VITE_GOOGLE_MAPS_API_KEY` and `VITE_RAZORPAY_KEY_ID` when using those features.

**Demo without backend:** `npm run dev` loads [`.env.development`](.env.development) with `VITE_MOCK_API=true` (sample listings, hub `MOCK24`, bookings, admin queue). Any OTP works on login. Set `VITE_MOCK_API=false` to talk to the real API.

Server must set `CLIENT_ORIGIN=http://localhost:3000` for CORS.

## Smoke checklist

1. Login with phone OTP
2. Search loads listings (Mongo + active listings near coordinates)
3. Open `/e/:inviteCode` for a hub
4. Listing detail + booking flow (Razorpay optional if key missing)
5. Guest dashboard bookings; host confirm/decline; admin pending queue (admin user)
6. Host: `/host/listings/new` → create listing (under_review until admin approves)
