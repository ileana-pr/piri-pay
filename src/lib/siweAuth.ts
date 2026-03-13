import { createSiweMessage } from 'viem/siwe';
import type { Address } from 'viem';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/** fetch nonce from backend */
export async function fetchSiweNonce(address: string, chainId: number): Promise<string> {
  const res = await fetch(
    `${API_BASE}/api/auth/siwe/challenge?address=${encodeURIComponent(address)}&chainId=${chainId}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get challenge');
  }
  const { nonce } = await res.json();
  if (!nonce) throw new Error('No nonce returned');
  return nonce;
}

/** build SIWE message for client to sign */
export function buildSiweMessage(params: {
  address: Address;
  nonce: string;
  chainId: number;
}) {
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const uri = typeof window !== 'undefined' ? window.location.origin : '';
  return createSiweMessage({
    address: params.address,
    chainId: params.chainId,
    domain,
    nonce: params.nonce,
    uri,
    version: '1',
    statement: 'Sign in to Piri',
    issuedAt: new Date(),
    expirationTime: new Date(Date.now() + 5 * 60 * 1000),
  });
}

/** verify signature with backend, returns token_hash for verifyOtp */
export async function verifySiwe(params: {
  message: string;
  signature: `0x${string}`;
  nonce: string;
}): Promise<{ token_hash: string }> {
  const res = await fetch(`${API_BASE}/api/auth/siwe/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Verification failed');
  }
  const data = await res.json();
  if (!data.token_hash) throw new Error('No session returned');
  return data;
}
