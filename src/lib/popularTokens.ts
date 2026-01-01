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
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
      { symbol: 'WETH', name: 'Wrapped Ether', contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
    ],
  },
  polygon: {
    native: [
      { symbol: 'MATIC', name: 'Polygon', contractAddress: 'native', decimals: 18 },
      { symbol: 'POL', name: 'Polygon', contractAddress: 'native', decimals: 18 },
    ],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
      { symbol: 'USDT', name: 'Tether', contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
      { symbol: 'DAI', name: 'Dai Stablecoin', contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18 },
      { symbol: 'WETH', name: 'Wrapped Ether', contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18 },
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

