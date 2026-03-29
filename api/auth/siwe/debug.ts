/**
 * GET /api/auth/siwe/debug — verify challenge/verify share same supabase
 * call this, then connect wallet — helps diagnose nonce lookup failures
 */
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

export async function GET() {
  if (!supabase) {
    return Response.json({
      ok: false,
      error: 'Supabase not configured',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
  }

  const testNonce = generateSiweNonce();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: insertErr } = await supabase.from('siwe_nonces').insert({
    nonce: testNonce,
    address: '0x0000000000000000000000000000000000000000',
    chain_id: 1,
    expires_at: expiresAt,
  });

  if (insertErr) {
    return Response.json({
      ok: false,
      step: 'insert',
      error: insertErr.message,
      hint: 'Table siwe_nonces may not exist — run: npm run supabase:db',
    });
  }

  const { data: row, error: selectErr } = await supabase
    .from('siwe_nonces')
    .select('nonce, expires_at')
    .eq('nonce', testNonce)
    .maybeSingle();

  await supabase.from('siwe_nonces').delete().eq('nonce', testNonce);

  if (selectErr || !row) {
    return Response.json({
      ok: false,
      step: 'select',
      error: selectErr?.message ?? 'Row not found after insert',
      hint: 'RLS may be blocking SELECT. Run: npm run supabase:db (applies migration to allow select)',
    });
  }

  // test auth admin (createUser/generateLink require this)
  const testEmail = `siwe-test-${Date.now()}@wallet.piri`;
  const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    email_confirm: true,
    user_metadata: { test: true },
  });
  if (authErr) {
    const trimmed = supabaseKey?.trim() ?? '';
    const keyFormat =
      trimmed.startsWith('sb_secret_') ? 'sb_secret_ (secret)' :
      trimmed.startsWith('sb_publishable_') ? 'sb_publishable_ (publishable)' :
      trimmed.startsWith('eyJ') ? 'eyJ (JWT)' : 'unknown';
    const hasWhitespace = supabaseKey !== trimmed || (supabaseKey?.length ?? 0) !== trimmed.length;
    return Response.json({
      ok: true,
      dbOk: true,
      authAdminOk: false,
      authError: authErr.message,
      keyFormat,
      keyLength: trimmed.length,
      hasWhitespace,
      firstChars: trimmed.slice(0, 4) + '...' /* safe to show — JWT header is public */,
      hint:
        hasWhitespace
          ? 'Key has leading/trailing whitespace or quotes — trim SUPABASE_SERVICE_ROLE_KEY in .env.local'
          : keyFormat === 'sb_publishable_ (publishable)'
            ? 'You have the PUBLISHABLE key. Auth admin needs the SECRET key (sb_secret_...). Dashboard → Settings → API → secret key'
            : keyFormat === 'sb_secret_ (secret)'
              ? 'Secret key format — if auth still fails, try JWT from: npx supabase status -o env (local)'
              : keyFormat === 'unknown'
                ? 'Key should start with eyJ (JWT) or sb_secret_. Check .env.local'
                : 'Auth admin failed — ensure SUPABASE_SERVICE_ROLE_KEY is the service_role/secret key, not anon/publishable',
    });
  }
  if (newUser?.user?.id) {
    await supabase.auth.admin.deleteUser(newUser.user.id);
  }

  return Response.json({
    ok: true,
    dbOk: true,
    authAdminOk: true,
    message: 'Supabase DB + Auth admin both work',
    noncePrefix: testNonce.slice(0, 12) + '...',
  });
}
