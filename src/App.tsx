import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/web3Config';
import { SolanaWalletProvider } from './lib/solanaConfig.tsx';
import TipPage from './components/TipPage';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          <TipPage />
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
