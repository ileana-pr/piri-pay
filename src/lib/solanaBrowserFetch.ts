import type { ConnectionConfig } from '@solana/web3.js';

/**
 * browser json-rpc: strip solana-client (many rpcs block it on preflight) and prefer
 * text/plain for content-type so strict allow-header lists don’t fail (body stays json).
 * helius and other browser-friendly rpcs tolerate this; helps if you ever swap endpoints.
 */
export const solanaBrowserFetch: NonNullable<ConnectionConfig['fetch']> = (input, init) => {
  if (!init?.headers) return fetch(input, init);
  const { headers: h, agent, ...rest } = init as RequestInit & { agent?: unknown };
  void agent;
  const headers = new Headers(h as HeadersInit);
  headers.delete('solana-client');
  const ct = headers.get('content-type');
  if (ct?.toLowerCase().includes('application/json')) {
    headers.set('Content-Type', 'text/plain;charset=UTF-8');
  }
  return fetch(input, { ...rest, headers } as RequestInit);
};
