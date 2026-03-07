import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

// read endpoint from env, default to mainnet so users can pay right away
// set VITE_SOLANA_ENDPOINT in .env to override (e.g. devnet for testing)
const endpoint = import.meta.env.VITE_SOLANA_ENDPOINT || 'https://api.mainnet-beta.solana.com';

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

