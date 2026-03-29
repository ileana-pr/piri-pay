/** requires `VITE_SOLANA_ENDPOINT` (Helius, etc.) — set in Vercel and `.env.local` */
export function getSolanaRpcEndpoint(): string {
  const url = import.meta.env.VITE_SOLANA_ENDPOINT?.trim();
  if (!url) {
    throw new Error('VITE_SOLANA_ENDPOINT is not set. Add it to .env.local and Vercel.');
  }
  return url;
}
