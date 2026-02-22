# WalletConnect / Reown Setup (RainbowKit)

RainbowKit works on mobile the same as desktop: connect, pay, switch chains. Mobile users connect via WalletConnect (scan QR or open in wallet). We don’t need special code—only the right **project ID** and **domain allowlist** so the wallet list and icons load.

## Mobile = desktop: what we need

1. **Project ID**  
   We get a free [Project ID from Reown (WalletConnect) Cloud](https://cloud.walletconnect.com/) and set **`VITE_WALLETCONNECT_PROJECT_ID`** in:
   - **Vercel**: Project → Settings → Environment Variables (Production and Preview if we use them)
   - **Local**: `.env.local` with `VITE_WALLETCONNECT_PROJECT_ID=our_project_id`  
   We rebuild/redeploy after adding it. Without it, WalletConnect and the explorer wallet list don’t load (blank or empty modal).

2. **Domain allowlist**  
   In [Reown Dashboard](https://dashboard.reown.com/) → our project → **Domain** (or **Project Domains**) we add the **exact origin** our app is served from:
   - Production: `https://fu-payme.vercel.app` (no path, no trailing slash)
   - Optional: `fu-payme.vercel.app` (no scheme)  
   The browser sends the [Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin) header; Reown rejects origins not on the list (403 → blank tiles). On mobile, opening our link in Chrome or Safari sends the same origin as desktop. In-app browsers can send a different or empty origin—we get best results when users open the tip link in the device’s main browser.

3. **No custom wallet list**  
   We use RainbowKit’s default config (no `wallets` override) so the full wallet list and WalletConnect flow come from the Explorer API. Connect and pay on mobile works like desktop once the project ID and domain are set.

References: [RainbowKit Installation](https://rainbowkit.com/en-US/docs/installation) (projectId), [Reown Relay – Allowlist](https://docs.reown.com/cloud/relay#allowlist).

---

## Blank wallet cards (0 wallets, empty modal)

If our connect modal shows **0 wallets** or **blank cards**, the Reown API is likely returning 403 because our domain isn’t verified.

### Fix: Add our domain in Reown Dashboard

1. Go to [dashboard.reown.com](https://dashboard.reown.com/)
2. Select our project (or create one)
3. Open **Project Domains** (or **Configure Domains**)
4. Add:
   - `https://fu-payme.vercel.app` (production)
   - `https://localhost:5173` (local dev, if we need it)
   - Any other deploy preview URLs we use (e.g. `*.vercel.app` if supported)
5. Save and wait a few minutes for propagation

### Why this happens

The wallet list comes from Reown’s Explorer API. Origins not in our project’s **Project Domains** allowlist get 403. No allowlist → no wallet data → empty modal.

The same URL can behave differently on mobile if the browser sends a different `Origin` (e.g. in-app browsers or redirects) or if the request fails (network/CORS). We allowlist the exact origin we use (e.g. `https://fu-payme.vercel.app` with no trailing slash).

### If it works on desktop but not on mobile

1. On the phone, open our app and tap “Connect wallet” so the modal loads.
2. **No USB?** Open the app with `?debug=1` (e.g. `https://fu-payme.vercel.app?debug=1`). A green tab appears; tap it for the on-device console and look for `[Explorer API]`.
3. Or use **remote debugging** (USB + computer): iOS → Safari Develop; Android → Chrome `chrome://inspect`.
4. In the console, check `[Explorer API]` for `status`, `origin`, `isMobile`:
   - **403**: We add that exact `origin` in Reown Dashboard → Project Domains (updates can take ~15 min).
   - **200** but **"failed to fetch remote project configuration"** or **"failed to fetch usage"**: AppKit hits several Reown APIs; explorer can be 200 while project config/usage reject on mobile. **Fix:** In Reown Dashboard → our project → Project Domains, add both `https://fu-payme.vercel.app` and `fu-payme.vercel.app` (no scheme). Save, wait ~15 min, try again on mobile.
   - **200** and no config/usage errors but still empty: we check for version mismatch or relay; all `@reown/*` packages should share the same version.

### 403 from wallet list (fetchWallets / fetchWalletsByPage)

If the console shows **Uncaught (in promise) … "HTTP status code: 403"** and the stack mentions `fetchWallets` or `fetchWalletsByPage`, the wallet-list request is rejected. If our domain has been allowlisted for hours, we try adding `https://fu-payme.vercel.app/` (trailing slash) and contact [Reown support](https://discord.gg/reown) (#developers-forum) with: “403 on fetchWallets/fetchWalletsByPage on mobile; origin allowlisted (fu-payme.vercel.app and https://fu-payme.vercel.app) for hours.”

### Verify it works

After we set the project ID (and redeploy) and add domains, we refresh the app. The connect modal should show the full wallet list and WalletConnect flow on desktop and mobile.
