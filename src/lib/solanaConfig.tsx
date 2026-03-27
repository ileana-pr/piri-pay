import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

// read endpoint from env. ankr/drpc free tiers block chain methods (-32052 / paid-only); leo FREE key works for getLatestBlockhash.
// use helius/quicknode in production (set VITE_SOLANA_ENDPOINT).
const endpoint =
  import.meta.env.VITE_SOLANA_ENDPOINT || 'https://solana.leorpc.com/?api_key=FREE';

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // empty array: WalletProvider auto-detects Standard Wallet compatible wallets
  // (Phantom, Backpack, Glow, etc.). 
  const wallets: never[] = [];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

