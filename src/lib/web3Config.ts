import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [mainnet],
  connectors: projectId
    ? [
        walletConnect({
            projectId,
            metadata: {
              name: 'FU Pay Me',
              description: 'Get paid with crypto',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://fu-pay-me.vercel.app',
              icons: [typeof window !== 'undefined' ? `${window.location.origin}/vite.svg` : 'https://fu-pay-me.vercel.app/vite.svg'],
            },
            qrModalOptions: {
              themeMode: 'dark',
              themeVariables: { '--wcm-z-index': '9999' },
            },
          }),
      ]
    : [],
  transports: {
    [mainnet.id]: http(),
  },
});
