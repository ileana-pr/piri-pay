export interface PaymentMethod {
  id: string;
  type: 'crypto' | 'cashapp' | 'venmo' | 'zelle' | 'paypal';
  name: string;
  handle?: string;
  address?: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'eth',
    type: 'crypto',
    name: 'Ethereum (ETH)',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    enabled: true,
  },
  {
    id: 'sol',
    type: 'crypto',
    name: 'Solana (SOL)',
    address: 'YourSolanaAddressHere',
    enabled: true,
  },
  {
    id: 'cashapp',
    type: 'cashapp',
    name: 'Cash App',
    handle: 'yourcashtag',
    enabled: true,
  },
  {
    id: 'venmo',
    type: 'venmo',
    name: 'Venmo',
    handle: 'yourvenmo',
    enabled: true,
  },
  {
    id: 'zelle',
    type: 'zelle',
    name: 'Zelle',
    handle: 'your@email.com',
    enabled: true,
  },
  {
    id: 'paypal',
    type: 'paypal',
    name: 'PayPal',
    handle: 'yourpaypal',
    enabled: true,
  },
];

export const getEnabledMethods = () => PAYMENT_METHODS.filter(m => m.enabled);
