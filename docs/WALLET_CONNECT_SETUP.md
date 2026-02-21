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
2. **No USB?** Open the app with `?debug=1` (e.g. `https://fu-payme.vercel.app?debug=1`). A green tab appears at the bottom; tap it to open an on-device console and look for `[Explorer API]`.
3. Or use **remote debugging** (USB + computer): iOS → Safari Develop menu; Android → Chrome `chrome://inspect`.
4. In the console, look for `[Explorer API]` — it logs `status`, `origin`, and `isMobile`.
   - **403**: Add that exact `origin` in Reown Dashboard → Project Domains (updates can take ~15 min).
   - **200** but you see **"failed to fetch remote project configuration"** or **"failed to fetch usage"**: AppKit calls several Reown APIs (explorer, project config, usage). The explorer can return 200 while project config/usage still reject the request on mobile (same allowlist, different endpoint). **Fix:** In [Reown Dashboard](https://dashboard.reown.com/) → your project → **Project Domains** → Configure Domains, add **both** `https://fu-payme.vercel.app` and `fu-payme.vercel.app` (no scheme). Save and wait ~15 min, then try again on mobile.
   - **200** and no config/usage errors but still empty: version mismatch or relay; ensure all `@reown/*` packages share the same version.

### 403 from wallet list (fetchWallets / fetchWalletsByPage)

If the console shows **Uncaught (in promise) … "HTTP status code: 403"** and the stack mentions `fetchWallets` or `fetchWalletsByPage`, the wallet-list request is being rejected. Our probe can still return 200 if it hits a different endpoint or timing. If your domain is already allowlisted for hours, add `https://fu-payme.vercel.app/` (trailing slash) and contact [Reown support](https://discord.gg/reown) (#developers-forum) with: “403 on fetchWallets/fetchWalletsByPage on mobile; origin allowlisted (fu-payme.vercel.app and https://fu-payme.vercel.app) for hours.” The app uses a small **customWallets** fallback so mobile still shows a few wallets when the API returns 403.

### Verify it works

After adding domains, refresh the app. The connect modal should show the full WalletConnect wallet list (or the customWallets fallback if the API still returns 403).
