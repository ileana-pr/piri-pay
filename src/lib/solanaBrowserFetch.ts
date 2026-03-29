import type { ConnectionConfig } from '@solana/web3.js';

/**
 * web3.js sends solana-client + content-type: application/json on every json-rpc post.
 * - solana-client: often missing from access-control-allow-headers → strip it.
 * - application/json: triggers a cors preflight; some rpcs only allow a short header list
 *   and omit content-type, so preflight fails. text/plain is a "simple" content-type so
 *   the browser may send the post without preflight; the body is still json and rpcs parse it.
 * eth uses the wallet's rpc; solana Connection hits your http url with full browser cors rules.
 */
export const solanaBrowserFetch: NonNullable<ConnectionConfig['fetch']> = (input, init) => {
  if (!init?.headers) return fetch(input, init);
  const { headers: h, agent: _agent, ...rest } = init as RequestInit & { agent?: unknown };
  const headers = new Headers(h as HeadersInit);
  headers.delete('solana-client');
  const ct = headers.get('content-type');
  if (ct?.toLowerCase().includes('application/json')) {
    headers.set('Content-Type', 'text/plain;charset=UTF-8');
  }
  return fetch(input, { ...rest, headers } as RequestInit);
};
