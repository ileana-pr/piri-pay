import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base } from 'wagmi/chains';
import { http } from 'wagmi';

// required for WalletConnect (mobile + desktop). set in Vercel env and .env.local
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const config = getDefaultConfig({
  appName: 'Piri',
  projectId,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
