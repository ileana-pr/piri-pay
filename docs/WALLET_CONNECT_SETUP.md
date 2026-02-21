# WalletConnect / Reown AppKit Setup

## Blank wallet cards (0 wallets, empty modal)

If the connect modal shows **0 wallets** or **blank cards**, the Reown API is likely returning 403 because your domain is not verified.

### Fix: Add your domain to Reown Dashboard

1. Go to [dashboard.reown.com](https://dashboard.reown.com/)
2. Select your project (or create one)
3. Open **Project Domains** (or **Configure Domains**)
4. Add these domains:
   - `https://fu-payme.vercel.app` (production)
   - `https://localhost:5173` (local dev, if needed)
   - Any other deploy preview URLs you use (e.g. `*.vercel.app` if supported)

5. Save and wait a few minutes for changes to propagate

### Why this happens

The wallet list comes from Reown’s Explorer API. Requests from origins that aren’t in your project’s **Project Domains** allowlist are rejected (403). No allowlist → no wallet data → empty modal.

Same URL can still behave differently on mobile if the browser sends a different `Origin` (e.g. some in-app browsers or redirects), or if the request fails for network/CORS. Allowlist the exact origin you use (e.g. `https://fu-payme.vercel.app` with no trailing slash).

### If it works on desktop but not on mobile

1. On your phone, open the app and tap “Connect wallet” so the modal loads.
2. Use **remote debugging** to see the console:
   - **iOS**: Safari on Mac → Develop → [your iPhone] → your page.
   - **Android**: Chrome on desktop → `chrome://inspect` → your device/tab.
3. In the console, look for `[Explorer API]` — it logs `status`, `origin`, and `isMobile`.
   - **403**: Add that exact `origin` in Reown Dashboard → Project Domains (updates can take ~15 min).
   - **200** but still empty: possible version mismatch or relay/network issue; ensure all `@reown/*` packages share the same version.

### Verify it works

After adding domains, refresh the app. The connect modal should show the full WalletConnect wallet list.
