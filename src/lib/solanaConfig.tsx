import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

// read endpoint from env. api.mainnet-beta.solana.com often returns 403 from browsers (rate/cors);
// ankr’s public rpc is a better default; use Helius/quicknode in production.
const endpoint =
  import.meta.env.VITE_SOLANA_ENDPOINT || 'https://rpc.ankr.com/solana';

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

