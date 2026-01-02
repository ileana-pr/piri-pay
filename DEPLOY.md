# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts to link your GitHub repo.

3. **Or deploy via Web**:
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your `tip-me` repository
   - Vercel will auto-detect Vite settings
   - Add environment variables from your `.env` file:
     - `VITE_ETH_ADDRESS`
     - `VITE_SOL_ADDRESS`
     - `VITE_BTC_ADDRESS`
     - `VITE_SOLANA_ENDPOINT` (optional)
     - `VITE_WALLETCONNECT_PROJECT_ID` (optional)
     - `VITE_CASHAPP_HANDLE` (optional)
     - `VITE_VENMO_HANDLE` (optional)
     - `VITE_ZELLE_HANDLE` (optional)
   - Click "Deploy"

4. **Your app will be live at**: `https://your-project.vercel.app`

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

3. **Or deploy via Web**:
   - Go to https://app.netlify.com
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Update vite.config.ts base**:
   ```ts
   base: '/tip-me/', // Your repo name
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## Environment Variables

Make sure to add all your `.env` variables to your hosting platform:

- `VITE_ETH_ADDRESS` - Your Ethereum receiving address
- `VITE_SOL_ADDRESS` - Your Solana receiving address  
- `VITE_BTC_ADDRESS` - Your Bitcoin receiving address
- `VITE_SOLANA_ENDPOINT` - Solana RPC endpoint (optional, defaults to devnet)
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (optional)
- `VITE_CASHAPP_HANDLE` - Cash App handle (optional)
- `VITE_VENMO_HANDLE` - Venmo handle (optional)
- `VITE_ZELLE_HANDLE` - Zelle email/phone (optional)

## Testing on Mobile

Once deployed, you can:
1. Open the deployed URL on your mobile device
2. Test fiat payment deep links (Cash App, Venmo, Zelle)
3. Test wallet connections (MetaMask mobile, Phantom mobile, etc.)
4. Test QR code scanning for Bitcoin payments

