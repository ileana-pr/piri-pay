import { supabase } from '../../lib/supabase';
import { verifySiwe, chainIdToChain } from '../../lib/siwe';
import { getAddress } from 'viem';

const WALLET_EMAIL_DOMAIN = 'wallet.piri';

/** POST /api/auth/siwe/verify — verify signature, create/find user, return session */
export async function POST(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Auth not configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, signature, nonce } = body as {
    message?: string;
    signature?: string;
    nonce?: string;
  };

  if (!message || !signature || !nonce) {
    return Response.json(
      { error: 'Missing message, signature, or nonce' },
      { status: 400 }
    );
  }

  if (typeof signature !== 'string' || !signature.startsWith('0x')) {
    return Response.json({ error: 'Invalid signature format' }, { status: 400 });
  }

  // verify nonce exists and delete (one-time use)
  const { data: nonceRow, error: nonceError } = await supabase
    .from('siwe_nonces')
    .delete()
    .eq('nonce', nonce)
    .gt('expires_at', new Date().toISOString())
    .select('address, chain_id')
    .single();

  if (nonceError || !nonceRow) {
    return Response.json({ error: 'Invalid or expired nonce' }, { status: 400 });
  }

  const url = new URL(request.url);
  const domain = url.hostname === 'localhost' ? 'localhost' : url.hostname;

  const result = await verifySiwe({
    message,
    signature: signature as `0x${string}`,
    nonce,
    domain,
  });

  if (!result) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const address = getAddress(result.address);
  const chain = chainIdToChain(result.chainId);

  // synthetic email for wallet users
  const walletEmail = `${address.toLowerCase()}@${WALLET_EMAIL_DOMAIN}`;

  // find existing owner via wallet_identities
  const { data: existingIdentity } = await supabase
    .from('wallet_identities')
    .select('user_id')
    .eq('chain', chain)
    .eq('address', address.toLowerCase())
    .single();

  let userId: string;

  if (existingIdentity?.user_id) {
    userId = existingIdentity.user_id;
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: walletEmail,
      email_confirm: true,
      user_metadata: { wallet_address: address, chain },
    });
    if (createError) {
      console.error('SIWE create user error:', createError);
      return Response.json({ error: 'Failed to create account' }, { status: 500 });
    }
    userId = newUser.user.id;

    // insert wallet_identity (ownership)
    await supabase.from('wallet_identities').insert({
      user_id: userId,
      chain,
      address: address.toLowerCase(),
    });
  }

  // generate magic link to get session
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: walletEmail,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('SIWE generateLink error:', linkError);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return Response.json({
    token_hash: linkData.properties.hashed_token,
    user_id: userId,
  });
}
