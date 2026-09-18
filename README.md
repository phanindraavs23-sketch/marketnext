# MarketRank + Supabase

Standalone leaderboard website using Supabase Auth + Postgres.

## 1. Create Supabase project
Create a project at Supabase, then open SQL Editor and run `supabase.sql`.

## 2. Configure the frontend
Open `config.js` and replace:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Use the project's public anon/publishable key only. Never expose a service-role/secret key in the browser.

## 3. Enable email authentication
Supabase Dashboard → Authentication → Providers → Email.
For quick local testing you can disable email confirmation; for production, keep confirmation enabled and configure your email provider.

## 4. Run
For local testing, serve this folder with any static server. Do not open index.html via file:// if your browser blocks requests.

## 5. Payments
The "Go to Market" button is intentionally a placeholder. Production payment flow should be:
1. Create a pending contribution server-side.
2. Create Razorpay/Stripe checkout.
3. Verify the payment in a trusted Supabase Edge Function/webhook.
4. Mark contribution_events.status = 'paid'.
5. Recalculate the user's total.
6. Realtime-update the leaderboard.

Do not trust an amount sent directly from the browser as proof of payment.

## Suggested production additions
- Supabase Realtime for live ranking changes
- Edge Function for payment verification
- Admin moderation dashboard
- Rate limiting / bot protection
- Profile verification
- Audit log
- Terms, privacy policy and refund policy


## Supabase setup for login-free India listings
1. Open Supabase SQL Editor and run `supabase.sql`.
2. In `config.js`, set `SUPABASE_URL` and the Supabase **Publishable key** (`sb_publishable_...`).
3. Do not put a Supabase Secret/service_role key in the browser.
4. Refresh `categories.html`; categories should load from Supabase.
5. Entries are login-free and receive a generated UUID. Country is constrained to India, with required state and city.
