import { createSiweMessage } from 'viem/siwe';
import { supabase } from './supabase';
import { logClientError, walletSignInUserMessage } from './userFacingErrors';

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
    `/api/auth/siwe/challenge?address=${encodeURIComponent(address)}&chainId=${chainId}&_=${Date.now()}`,
    { cache: 'no-store' }
  );
  if (!challengeRes.ok) {
    const text = await challengeRes.text();
    let err: unknown = text;
    try {
      err = JSON.parse(text);
    } catch {
      /* not json */
    }
    logClientError('SIWE challenge', challengeRes.status, err);
    throw new Error(walletSignInUserMessage());
  }
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
    body: JSON.stringify({ message, signature }),
  });
  if (!verifyRes.ok) {
    const text = await verifyRes.text();
    let err: unknown = text;
    try {
      err = JSON.parse(text);
    } catch {
      /* not json */
    }
    logClientError('SIWE verify', verifyRes.status, err);
    throw new Error(walletSignInUserMessage());
  }
  const { token_hash } = await verifyRes.json();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'magiclink',
  });
  if (error) {
    logClientError('SIWE verifyOtp', error);
    throw new Error(walletSignInUserMessage());
  }
  return true;
}
