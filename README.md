# 💰 Tip Me

> A modern, multi-chain tipping application supporting cryptocurrency and fiat payments

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue)](https://tip-me-ten.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)

## ✨ Features

- 🪙 **Multi-Chain Crypto Support**
  - Ethereum (ETH & ERC-20 tokens)
  - Solana (SOL & SPL tokens)
  - Bitcoin (BTC via QR codes)

- 💵 **Fiat Payment Methods**
  - Cash App
  - Venmo
  - Zelle

- 🔗 **Wallet Integration**
  - MetaMask, WalletConnect, and more for Ethereum
  - Phantom, Solflare for Solana
  - Mobile wallet support via WalletConnect

- 📱 **Mobile Optimized**
  - Responsive design
  - Deep linking for fiat apps
  - QR code generation for Bitcoin

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:ileana-pr/tip-me.git

# Navigate to the project
cd tip-me

# Install dependencies
npm install

# Start development server
npm run dev
```

### Mobile Testing

To test on your mobile device (same WiFi network):

```bash
npm run dev:mobile
```

Then open `http://YOUR_LOCAL_IP:5173` on your phone.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Ethereum**: Wagmi + Viem
- **Solana**: @solana/wallet-adapter
- **Bitcoin**: QR Code generation

## 📚 Documentation

All detailed documentation is available in the [`docs/`](./docs/) folder:

- **[DEPLOY.md](./docs/DEPLOY.md)** - Deployment instructions for Vercel and other platforms
- **[MOBILE_TESTING.md](./docs/MOBILE_TESTING.md)** - Guide for testing on mobile devices

## 🎯 Available Scripts

```bash
npm run dev          # Start dev server (localhost only)
npm run dev:mobile   # Start dev server (network accessible)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Type check with TypeScript
```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_ETH_ADDRESS=your_ethereum_address
VITE_SOL_ADDRESS=your_solana_address
VITE_BTC_ADDRESS=your_bitcoin_address
VITE_SOLANA_ENDPOINT=https://api.devnet.solana.com
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CASHAPP_HANDLE=your_cashapp_handle
VITE_VENMO_HANDLE=your_venmo_handle
VITE_ZELLE_HANDLE=your_zelle_email_or_phone
```

## 📝 License

This project is private and proprietary.

## 👤 Author

**ileana-pr**

---

⭐ If you find this project helpful, consider giving it a star!
