/** exact `VITE_SOLANA_ENDPOINT` value from env — must be a valid http(s) rpc url */
export function getSolanaRpcEndpoint(): string | undefined {
  const raw = import.meta.env.VITE_SOLANA_ENDPOINT;
  if (raw == null || typeof raw !== 'string' || raw === '') return undefined;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
  } catch {
    return undefined;
  }
  return raw;
}
