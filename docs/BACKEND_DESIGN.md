# Piri Backend Design — Replace Privy, Add Accounts, Track "Who Sent What"

## 1. Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PIRI (Payer Flow — No Account Required)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Scan QR → /tip/:slug → Load profile from API → Choose method → Pay         │
│  • Connect wallet (RainbowKit/MetaMask/Phantom) — client-side only           │
│  • Optional: create account later (attach past events)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PIRI (Payee Flow — Account Required)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Sign up (email/Google) → Create profile → Edit payment methods → Stable URL │
│  • Auth: Supabase Auth (email magic link, Google OAuth)                      │
│  • Connect/paste own addresses — no auto-wallet creation                      │
│  • View history: on-chain + fiat intent                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Supabase (Postgres + Auth)                                                  │
│  ├── API routes (Vercel/serverless or Supabase Edge)                         │
│  ├── Cron: sync on-chain txs (optional)                                      │
│  └── Indexers: Etherscan, Basescan, Helius (free tier)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API / DB    │────▶│  Indexers    │
│              │     │  Supabase    │     │  Etherscan   │
│  • Connect   │     │     Auth     │     │  Basescan    │
│  • Pay       │     │  profiles   │     │  Helius      │
│  • Track     │     │  events     │     │  (optional)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Database Schema

### Tables

```sql
-- users: accounts for payees (and optionally payers who create accounts)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  -- auth: Supabase Auth handles this; we store id from auth.users
  auth_provider text, -- 'email' | 'google'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- profiles: payment methods per user; one per payee
create table public.profiles (
  id text primary key, -- nanoid or short slug
  user_id uuid not null references public.users(id) on delete cascade,
  -- crypto
  ethereum_address text,
  base_address text,
  bitcoin_address text,
  solana_address text,
  -- fiat
  cash_app_cashtag text,
  venmo_username text,
  zelle_contact text,
  paypal_username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- payment_events: crypto + fiat intent
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  -- type
  type text not null, -- 'crypto_incoming' | 'fiat_click'
  method text, -- 'ethereum' | 'base' | 'solana' | 'bitcoin' | 'venmo' | 'cashapp' | 'paypal' | 'zelle'
  -- crypto fields
  chain text, -- 'ethereum' | 'base' | 'solana' | 'bitcoin'
  from_address text,
  to_address text,
  tx_hash text,
  amount text, -- decimal string
  token_symbol text, -- 'ETH' | 'USDC' | 'SOL' | etc.
  token_address text,
  -- fiat fields (intent only)
  amount_typed text, -- optional amount user typed
  -- metadata
  created_at timestamptz default now(),
  -- dedup: crypto tx hash
  unique(tx_hash) where tx_hash is not null
);

create index idx_payment_events_profile_id on public.payment_events(profile_id);
create index idx_payment_events_created_at on public.payment_events(created_at desc);
create index idx_payment_events_type on public.payment_events(type);
```

### Supabase Auth Integration

- Use `auth.users` as the source of truth for identity.
- `public.users` can mirror `auth.users` or use a trigger to sync.
- Simpler: `profiles.user_id` references `auth.users.id` directly; skip `public.users` if you prefer.
- RLS: `profiles` — select public for tip page; update/delete only by profile owner.

### Migration from Current `profiles`

- Current `profiles` has `id` (nanoid) but no `user_id`.
- Add `user_id` column (nullable initially).
- Migrate: create users for existing profiles; backfill `user_id`.
- Require auth for new profile creation.

---

## 3. External Services

| Service | Purpose | Cost / Limits |
|---------|---------|---------------|
| **Supabase** | Postgres, Auth, Edge Functions | Free: 500MB DB, 50K MAU, 2M invocations/mo |
| **Vercel** | Hosting, API routes | Free tier sufficient |
| **Etherscan API** | ETH mainnet history | Free: 5 req/s, 100K req/day |
| **Basescan API** | Base history | Free: 5 req/s |
| **Helius** | Solana history | Free: 100K req/day |
| **Blockstream** | Bitcoin history | Free API |

### Indexer Strategy (Cost-Conscious)

- **On-demand (A):** Fetch when user opens history. Simple, no cron. Risk: rate limits on many users.
- **Cron sync (B):** Background job every 5–15 min. Poll indexers for each saved address. More control, predictable load.
- **Recommendation:** Start with **on-demand** for MVP; add cron if needed.
- **Caching:** Use Supabase `payment_events` as cache; avoid re-fetching same tx.

---

## 4. API Endpoints

### Auth (Supabase Auth)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `POST /api/auth/signup` | POST | — | Supabase `signUp` or magic link |
| `POST /api/auth/login` | POST | — | Supabase `signInWithOtp` / `signInWithOAuth` |
| `GET /api/auth/callback` | GET | — | OAuth callback |

### User & Profile

| Endpoint | Method | Auth | Input | Output |
|----------|--------|------|-------|--------|
| `GET /api/me` | GET | Bearer | — | `{ id, email, profile }` |
| `GET /api/profile/:slug` | GET | — | slug | `{ id, ethereumAddress, ... }` (public) |
| `PUT /api/me/profile` | PUT | Bearer | profile body | `{ id }` |
| `POST /api/me/profile` | POST | Bearer | profile body | `{ id }` (create) |

### Events & History

| Endpoint | Method | Auth | Input | Output |
|----------|--------|------|-------|--------|
| `POST /api/events` | POST | — or Bearer | `{ type, method, ... }` | `{ id }` |
| `GET /api/me/history` | GET | Bearer | `?chain=&from=&to=` | `{ events: [...] }` |
| `GET /api/me/history/sync` | GET | Bearer | — | Triggers on-chain fetch; returns updated events |

### Event Tracking

- **Crypto:** Frontend calls `POST /api/events` after successful tx (with tx_hash, chain, amount, etc.).
- **Fiat:** Frontend calls `POST /api/events` when user clicks "Open in Venmo" (type: `fiat_click`, method: `venmo`).
- **On-chain sync:** Backend can fetch from indexers and upsert into `payment_events` for completeness.

---

## 5. Auth & Accounts Choice

| Option | Pros | Cons |
|--------|------|------|
| **Supabase Auth** | Free, built-in, magic link + OAuth | Tied to Supabase |
| **Clerk** | Polished UX | Free tier limits |
| **NextAuth** | Flexible | Self-hosted, more setup |
| **DIY email+password** | Full control | Security burden |

**Recommendation:** **Supabase Auth** — already using Supabase; no extra cost; good free tier.

---

## 6. Privy Migration Plan

### Files to Remove or Refactor

| File | Action |
|------|--------|
| `src/lib/privyConfig.ts` | Delete |
| `src/lib/wagmiConfigPrivy.ts` | Delete |
| `src/components/PrivyReadyGate.tsx` | Delete |
| `src/components/ConnectChoice.tsx` | Remove Privy logic; keep only "Connect wallet" |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove PrivyProvider, PrivyWagmiProvider; use only WagmiProvider from wagmi, rainbowConfig |
| `src/components/SignInPage.tsx` | Supabase Auth UI (magic link, Google, wallet) |
| `src/components/ConnectChoice.tsx` | Simplify to single "Connect wallet" button (RainbowKit) |
| `BaseTip.tsx`, `EthereumTip.tsx`, `TipPage.tsx`, `TipPageLoader.tsx` | Remove `hasPrivy` prop; use only openConnectModal |

### Package Removals

```bash
npm uninstall @privy-io/react-auth @privy-io/wagmi
```

### Wallet Flow After Migration

- **Payers:** Connect via RainbowKit (MetaMask, WalletConnect, etc.) — no account.
- **Payees:** Sign up with Supabase Auth; create profile; connect/paste addresses; no Privy wallet creation.

---

## 7. Sprint 1 Implementation Plan

### Step 1: Backend + DB + Auth (2–3 days)

1. Create `users` table (or rely on `auth.users`).
2. Add `user_id` to `profiles`; migration for existing rows.
3. Enable Supabase Auth.
4. Add signup/login endpoints (or use Supabase client directly).
5. RLS: `profiles` — public read by id; insert/update only by owner.

### Step 2: Profiles + Tip URL (1–2 days)

1. `POST /api/me/profile` — create profile for authenticated user.
2. `PUT /api/me/profile` — update profile.
3. `GET /api/profile/:slug` — public; keep existing behavior.
4. Ensure slug/id is stable; frontend uses `/tip/:id` or `/tip/:slug`.

### Step 3: Event Tracking (1–2 days)

1. Create `payment_events` table.
2. `POST /api/events` — accept crypto or fiat events.
3. Frontend: call after successful tx; call on fiat button click.
4. Optional: validate tx_hash via indexer before storing.

### Step 4: History Endpoint (1–2 days)

1. `GET /api/me/history` — return events for user's profile(s).
2. Optional: `GET /api/me/history/sync` — fetch from indexers, upsert.
3. Implement indexer clients (Etherscan, Basescan, Helius).
4. Add filters: chain, date range.

### Step 5: Remove Privy (1 day)

1. Remove Privy packages.
2. Remove PrivyProvider, PrivyWagmiProvider, privyConfig, wagmiConfigPrivy.
3. SignInPage handles Supabase Auth (email, Google, wallet).
4. Simplify ConnectChoice to wallet-only.
5. Update App.tsx to single provider tree.
6. Remove `hasPrivy` from all components.

---

## 8. Security & Cost Notes

- **Auth:** Supabase Auth handles session; use JWT for API auth.
- **RLS:** Enforce `profiles.user_id = auth.uid()` for update/delete.
- **Indexers:** Free tiers are generous; avoid polling too aggressively.
- **Secrets:** Never expose `VITE_PRIVY_APP_SECRET` or similar in frontend.

---

## 9. Summary

| Area | Decision |
|------|----------|
| Auth | Supabase Auth (email magic link, Google) |
| DB | Supabase Postgres |
| Profiles | Link to `user_id`; stable slug/id |
| Events | `payment_events` table; crypto + fiat_click |
| Indexers | On-demand first; Etherscan, Basescan, Helius |
| Privy | Remove; use RainbowKit + Supabase Auth |
