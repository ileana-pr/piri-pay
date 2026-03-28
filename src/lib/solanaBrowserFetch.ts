import type { ConnectionConfig } from '@solana/web3.js';

/**
 * web3.js adds a solana-client header on every json-rpc post. many public rpcs
 * don't list it in access-control-allow-headers, so the browser blocks preflight.
 * eth tips use the wallet's rpc; solana's Connection must use a public http url — same-origin/cors rules apply.
 */
export const solanaBrowserFetch: NonNullable<ConnectionConfig['fetch']> = (input, init) => {
  if (!init?.headers) return fetch(input, init);
  const { headers: h, agent: _agent, ...rest } = init as RequestInit & { agent?: unknown };
  const headers = new Headers(h as HeadersInit);
  headers.delete('solana-client');
  return fetch(input, { ...rest, headers } as RequestInit);
};
