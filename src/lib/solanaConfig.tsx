import React from 'react';
import type { ConnectionConfig } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { solanaBrowserFetch } from './solanaBrowserFetch';
import { getSolanaRpcEndpoint } from './solanaEndpoint';

const endpoint = getSolanaRpcEndpoint();

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

