import React from 'react';
import type { ConnectionConfig } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { getSolanaRpcEndpoint } from './solanaEndpoint';

const connectionConfig: ConnectionConfig = {
  commitment: 'confirmed',
};

function SolanaConfigMissing() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-piri-cream text-piri">
      <div className="max-w-md rounded-2xl border-2 border-piri/20 bg-piri-elevated p-8 shadow-lg">
        <h1 className="piri-heading text-xl font-black mb-3">solana rpc url</h1>
        <p className="text-sm text-piri-muted">
          set <code className="font-mono text-piri">VITE_SOLANA_ENDPOINT</code> to the exact https rpc url from your
          provider (including <code className="font-mono">?api-key=…</code>), redeploy on vercel, and restart local dev
          after changing <code className="font-mono">.env.local</code>.
        </p>
      </div>
    </div>
  );
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets: never[] = [];
  const endpoint = getSolanaRpcEndpoint();

  if (!endpoint) {
    return <SolanaConfigMissing />;
  }

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
