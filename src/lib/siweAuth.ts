import { createSiweMessage } from 'viem/siwe';
import { supabase } from './supabase';

/** run SIWE flow: get challenge, sign, verify, get session. returns true on success. */
export async function signInWithSiwe(
  address: string,
  chainId: number,
  signMessage: (args: { message: string }) => Promise<`0x${string}`>
): Promise<boolean> {
  if (!supabase) return false;

  const domain = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'localhost'
    : (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
  const uri = typeof window !== 'undefined' ? window.location.origin : '';

  const challengeRes = await fetch(
    `/api/auth/siwe/challenge?address=${encodeURIComponent(address)}&chainId=${chainId}`
  );
  if (!challengeRes.ok) throw new Error('Failed to get challenge');
  const { nonce } = await challengeRes.json();

  const message = createSiweMessage({
    address: address as `0x${string}`,
    chainId,
    domain,
    nonce,
    uri,
    version: '1',
    statement: 'Sign in to Piri',
  });

  const signature = await signMessage({ message });

  const verifyRes = await fetch('/api/auth/siwe/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature, nonce }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error || 'Verification failed');
  }
  const { token_hash } = await verifyRes.json();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'magiclink',
  });
  if (error) throw new Error(error.message);
  return true;
}
