import type { AppKitNetwork } from '@reown/appkit-common';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// one-time probe so we can see why wallet list might be empty (e.g. on mobile): check console for "Explorer API"
if (typeof window !== 'undefined' && projectId) {
  const origin = window.location.origin;
  const url = `https://explorer-api.walletconnect.com/v3/wallets?projectId=${projectId}&entries=5&page=1`;
  fetch(url)
    .then((r) => r.text().then((text) => ({ status: r.status, text })))
    .then(({ status, text }) => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let walletCount = null;
      if (status === 200) {
        try {
          const data = JSON.parse(text);
          walletCount = data?.listings?.length ?? data?.data?.length ?? null;
        } catch {
          walletCount = 'parse failed';
        }
      }
      console.log('[Explorer API]', { status, origin, isMobile, walletCount });
      if (status === 403) console.warn('[Explorer API] 403 = origin not allowlisted. Add', origin, 'at dashboard.reown.com → Project Domains');
    })
    .catch((err) => console.warn('[Explorer API] request failed', err));
}

const metadata = {
  name: 'FU Pay Me',
  description: 'Get paid with crypto',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://fu-payme.vercel.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/vite.svg` : 'https://fu-payme.vercel.app/vite.svg'],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet as AppKitNetwork];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// full wallet list from Reown explorer; allowlist every origin (desktop + mobile) at dashboard.reown.com → Project Domains
if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    enableCoinbase: false,
    debug: true,
    features: {
      analytics: false,
      swaps: false,
      onramp: false,
      email: false,
      socials: [],
    },
  });
}

export const config = wagmiAdapter.wagmiConfig;
