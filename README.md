<div align="center">
  <img src="public/logo/piri.png" alt="Piri" width="120" />
</div>

<div align="center" style="font-family: system-ui, sans-serif; color: #2D0A00; background: #FFFBF2; padding: 0.75rem 1.5rem; border-radius: 0.75rem; margin: 0.5rem 0; border: 2px solid #2D0A00;">
  <strong>🍧 Pick your flavor. Get your money.</strong><br/>
  <span style="opacity: 0.85;">One QR code, every way to pay—unify fiat and crypto in a single link.</span>
</div>

# 🍧 Piri

<div align="center">
  <a href="https://piri.vercel.app" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.6rem 1.5rem; font-size: 1.1rem; font-weight: bold; color: #fff; background: #10B981; border-radius: 0.5rem; text-decoration: none; margin-bottom: 1rem;">▶ Try the live demo</a>
</div>

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)

## 📚 Docs

- [Whitepaper](./docs/whitepaper.md) — Vision and scope
- [Pitch deck](https://docs.google.com/presentation/d/1ylbeO8PD6wxaXjX0lCJFehSjAP4TLQWI/edit?usp=sharing&ouid=114728018986311301124&rtpof=true&sd=true) *(WIP)*

## ✨ What it does

**One profile, one QR—every way you get paid.** Set your payment options once; anyone who scans your QR sees all of them and pays with whatever they already use.

### 💵 Payment options

| 💵 Fiat | 🪙 Crypto |
|---------|-----------|
| Cash App | Ethereum (ETH & ERC-20) |
| Venmo | Base |
| Zelle | Solana (SOL & SPL) |
| | Bitcoin (BTC via QR) |

**📥 Getting paid:** Create a profile, add addresses and handles (ETH, SOL, BTC, Base, Cash App, Venmo, Zelle). The app gives you one QR and one link.

**📤 Paying someone:** Scan their QR → one page with every option they accept. Fiat: tap and land in Cash App, Venmo, or Zelle with details pre-filled. Crypto: connect wallet (MetaMask, Phantom, WalletConnect), choose amount, sign. Works on mobile and deep links into apps.

## 🚀 Quick start

Node.js 18+ and npm or yarn.

```bash
git clone git@github.com:ileana-pr/piri.git
cd piri
npm install
npm run dev
```

**📱 Test on your phone (same WiFi):** `npm run dev:mobile`, then open `http://YOUR_LOCAL_IP:5173` on your phone.

## 🛠️ Tech stack

React 18, TypeScript, Vite, Tailwind. Ethereum/Base: Wagmi + Viem. Solana: @solana/wallet-adapter. Bitcoin: QR + copy. No backend required for the MVP.

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (localhost) |
| `npm run dev:mobile` | Dev server (LAN, for phone testing) |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## 🌐 Env vars

Optional. Add a `.env` in the project root (leave blank if you don’t need them):

```env
VITE_ETH_ADDRESS=
VITE_SOL_ADDRESS=
VITE_BTC_ADDRESS=
VITE_SOLANA_ENDPOINT=https://api.devnet.solana.com
VITE_WALLETCONNECT_PROJECT_ID=
VITE_CASHAPP_HANDLE=
VITE_VENMO_HANDLE=
VITE_ZELLE_HANDLE=
```

## 📝 License

Private and proprietary.

---

**👤 Ileana Perez** — [linktr.ee/adigitaltati](https://linktr.ee/adigitaltati) · 🍧
