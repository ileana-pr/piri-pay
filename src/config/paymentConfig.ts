export interface PaymentMethod {
  id: string;
  type: 'crypto' | 'cashapp' | 'venmo' | 'zelle';
  name: string;
  handle?: string;
  address?: string;
  enabled: boolean;
  network?: string; // ethereum, polygon, solana, bitcoin
  tokenContract?: string; // for ERC20/SPL tokens
  tokenSymbol?: string; // USDC, USDT
  decimals?: number; // token decimals (default 18 for ETH, 6 for USDC, 8 for BTC)
}

// token contract addresses
const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const USDC_SOL = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // SPL token mint
const USDT_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

export const PAYMENT_METHODS: PaymentMethod[] = [
  // crypto - native tokens
  {
    id: 'btc',
    type: 'crypto',
    name: 'Bitcoin',
    address: import.meta.env.VITE_BTC_ADDRESS || '',
    network: 'bitcoin',
    enabled: true,
    decimals: 8,
  },
  {
    id: 'eth',
    type: 'crypto',
    name: 'Ethereum',
    address: import.meta.env.VITE_ETH_ADDRESS || '',
    network: 'ethereum',
    enabled: true,
    decimals: 18,
  },
  {
    id: 'sol',
    type: 'crypto',
    name: 'Solana',
    address: import.meta.env.VITE_SOL_ADDRESS || '',
    network: 'solana',
    enabled: true,
    decimals: 9,
  },
  // stablecoins - ethereum
  {
    id: 'usdc-eth',
    type: 'crypto',
    name: 'USDC (Ethereum)',
    address: import.meta.env.VITE_ETH_ADDRESS || '',
    network: 'ethereum',
    tokenContract: USDC_ETH,
    tokenSymbol: 'USDC',
    enabled: true,
    decimals: 6,
  },
  {
    id: 'usdt-eth',
    type: 'crypto',
    name: 'USDT (Ethereum)',
    address: import.meta.env.VITE_ETH_ADDRESS || '',
    network: 'ethereum',
    tokenContract: USDT_ETH,
    tokenSymbol: 'USDT',
    enabled: true,
    decimals: 6,
  },
  // stablecoins - polygon
  {
    id: 'usdc-polygon',
    type: 'crypto',
    name: 'USDC (Polygon)',
    address: import.meta.env.VITE_ETH_ADDRESS || '', // same address, different network
    network: 'polygon',
    tokenContract: USDC_POLYGON,
    tokenSymbol: 'USDC',
    enabled: true,
    decimals: 6,
  },
  {
    id: 'usdt-polygon',
    type: 'crypto',
    name: 'USDT (Polygon)',
    address: import.meta.env.VITE_ETH_ADDRESS || '',
    network: 'polygon',
    tokenContract: USDT_POLYGON,
    tokenSymbol: 'USDT',
    enabled: true,
    decimals: 6,
  },
  // stablecoins - solana
  {
    id: 'usdc-sol',
    type: 'crypto',
    name: 'USDC (Solana)',
    address: import.meta.env.VITE_SOL_ADDRESS || '',
    network: 'solana',
    tokenContract: USDC_SOL,
    tokenSymbol: 'USDC',
    enabled: true,
    decimals: 6,
  },
  // fiat payment apps
  {
    id: 'cashapp',
    type: 'cashapp',
    name: 'Cash App',
    handle: import.meta.env.VITE_CASHAPP_HANDLE || '',
    enabled: true,
  },
  {
    id: 'venmo',
    type: 'venmo',
    name: 'Venmo',
    handle: import.meta.env.VITE_VENMO_HANDLE || '',
    enabled: true,
  },
  {
    id: 'zelle',
    type: 'zelle',
    name: 'Zelle',
    handle: import.meta.env.VITE_ZELLE_HANDLE || '',
    enabled: true,
  },
];

export const getEnabledMethods = () => PAYMENT_METHODS.filter(m => m.enabled);
