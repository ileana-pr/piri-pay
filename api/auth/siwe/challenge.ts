import { supabase } from '../../lib/supabase';
import { createNonce } from '../../lib/siwe';

/** GET /api/auth/siwe/challenge — returns nonce for client to sign */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');
  const chainId = url.searchParams.get('chainId') || '8453';

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return Response.json({ error: 'Invalid or missing address' }, { status: 400 });
  }

  const nonce = createNonce();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  if (supabase) {
    const { error } = await supabase.from('siwe_nonces').insert({
      nonce,
      address: address.toLowerCase(),
      chain_id: parseInt(chainId, 10) || 8453,
      expires_at: expiresAt.toISOString(),
    });
    if (error) {
      console.error('SIWE nonce insert error:', error);
      return Response.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
  }

  return Response.json({ nonce });
}
