// popular token configurations
export interface TokenConfig {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
  logo?: string;
}

export const POPULAR_TOKENS: Record<string, Record<string, TokenConfig[]>> = {
  ethereum: {
    native: [
      { symbol: 'ETH', name: 'Ethereum', contractAddress: 'native', decimals: 18 },
    ],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
      { symbol: 'USDT', name: 'Tether', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
      { symbol: 'DAI', name: 'Dai Stablecoin', contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    ],
  },
  base: {
    native: [
      { symbol: 'ETH', name: 'Ethereum', contractAddress: 'native', decimals: 18 },
    ],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    ],
  },
  bsc: {
    native: [
      { symbol: 'BNB', name: 'BNB', contractAddress: 'native', decimals: 18 },
    ],
    tokens: [
      { symbol: 'USDT', name: 'Tether', contractAddress: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
      { symbol: 'BUSD', name: 'Binance USD', contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
      { symbol: 'USDC', name: 'USD Coin', contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    ],
  },
  solana: {
    native: [
      { symbol: 'SOL', name: 'Solana', contractAddress: 'native', decimals: 9 },
    ],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      { symbol: 'USDT', name: 'Tether', contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    ],
  },
};

