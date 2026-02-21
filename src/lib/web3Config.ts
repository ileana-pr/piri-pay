import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// wallet list comes from RainbowKit package (injected + WalletConnect), not from Reown API — avoids 403 on mobile
export const config = getDefaultConfig({
  appName: 'FU Pay Me',
  projectId,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
