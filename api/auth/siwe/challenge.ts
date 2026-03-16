import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateSiweNonce } from 'viem/siwe';

config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

/** GET /api/auth/siwe/challenge — returns nonce for client to sign (SIWE standard) */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const address = url.searchParams.get('address');
    const chainId = url.searchParams.get('chainId') || '8453';

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return Response.json({ error: 'Invalid or missing address' }, { status: 400 });
    }

    const nonce = generateSiweNonce();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (!supabase) {
      return Response.json(
        { error: 'Auth not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.' },
        { status: 503 }
      );
    }

    const { error } = await supabase.from('siwe_nonces').insert({
      nonce,
      address: address.toLowerCase(),
      chain_id: parseInt(chainId, 10) || 8453,
      expires_at: expiresAt.toISOString(),
    });
    if (!error) console.log('[SIWE] challenge stored nonce:', nonce.slice(0, 12) + '...');
    if (error) {
      console.error('[SIWE] nonce insert error:', error);
      return Response.json(
        { error: 'Failed to create challenge', details: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { nonce },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('SIWE challenge handler error:', err);
    return Response.json(
      {
        error: 'Challenge handler failed',
        details: msg,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
      },
      { status: 500 }
    );
  }
}
