import { http, createConfig } from 'wagmi';
import { mainnet, polygon, base, arbitrum, optimism } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = 'demo-project-id';

export const config = createConfig({
  chains: [mainnet, polygon, base, arbitrum, optimism],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});
