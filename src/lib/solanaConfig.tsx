import React from 'react';
import type { ConnectionConfig } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { solanaBrowserFetch } from './solanaBrowserFetch';

// read endpoint from env. public rpcs vary on cors; solanaBrowserFetch strips solana-client and uses text/plain to avoid json preflight kills.
// still set VITE_SOLANA_ENDPOINT to helius/quicknode in production for reliability and rate limits.
const endpoint =
  import.meta.env.VITE_SOLANA_ENDPOINT || 'https://solana.leorpc.com/?api_key=FREE';

const connectionConfig: ConnectionConfig = {
  commitment: 'confirmed',
  fetch: solanaBrowserFetch,
};

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // empty array: WalletProvider auto-detects Standard Wallet compatible wallets
  // (Phantom, Backpack, Glow, etc.). 
  const wallets: never[] = [];

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

