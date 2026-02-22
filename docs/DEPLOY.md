# Deployment Guide

How we deploy our app.

## Quick Deploy Options

### Option 1: Vercel (recommended)

1. **Install Vercel CLI** (optional; we can also use the web UI):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   We follow the prompts to link our GitHub repo.

3. **Or deploy via web**:
   - Go to https://vercel.com
   - Sign in with GitHub
   - New Project → import our `tip-me` repo
   - Vercel auto-detects Vite; we add env vars from our `.env`:
     - `VITE_ETH_ADDRESS`
     - `VITE_SOL_ADDRESS`
     - `VITE_BTC_ADDRESS`
     - `VITE_SOLANA_ENDPOINT` (optional)
     - `VITE_WALLETCONNECT_PROJECT_ID` (optional)
     - `VITE_CASHAPP_HANDLE` (optional)
     - `VITE_VENMO_HANDLE` (optional)
     - `VITE_ZELLE_HANDLE` (optional)
   - Deploy

4. **Our app is live at**: `https://our-project.vercel.app` (or the project name we chose)

### Option 2: Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via CLI**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Or deploy via web**:
   - Go to https://app.netlify.com, sign in with GitHub
   - New site from Git → select our repo
   - Build command: `npm run build`, Publish directory: `dist`
   - Add the same env vars as for Vercel
   - Deploy site

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Set base in vite.config.ts** (e.g. our repo name):
   ```ts
   base: '/tip-me/',
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## Environment Variables

We add all our `.env` variables to the hosting platform:

- `VITE_ETH_ADDRESS` – Ethereum receiving address
- `VITE_SOL_ADDRESS` – Solana receiving address
- `VITE_BTC_ADDRESS` – Bitcoin receiving address
- `VITE_SOLANA_ENDPOINT` – Solana RPC (optional, defaults to devnet)
- `VITE_WALLETCONNECT_PROJECT_ID` – WalletConnect project ID (optional)
- `VITE_CASHAPP_HANDLE` – Cash App handle (optional)
- `VITE_VENMO_HANDLE` – Venmo handle (optional)
- `VITE_ZELLE_HANDLE` – Zelle email/phone (optional)

## Testing on mobile

After we deploy, we:
1. Open the deployed URL on a phone
2. Test fiat deep links (Cash App, Venmo, Zelle)
3. Test wallet connections (MetaMask mobile, Phantom, etc.)
4. Test QR scanning for Bitcoin

