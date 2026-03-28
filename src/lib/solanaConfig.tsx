import React from 'react';
import type { ConnectionConfig } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { solanaBrowserFetch } from './solanaBrowserFetch';

// read endpoint from env. ankr/drpc free tiers often block chain methods; leo FREE works if cors allows minimal headers (we strip solana-client in browser).
// use helius/quicknode in production (set VITE_SOLANA_ENDPOINT).
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

