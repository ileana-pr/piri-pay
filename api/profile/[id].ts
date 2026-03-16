import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

// inlined validation (avoids ../lib/profileSchema import resolution issues)
const ALLOWED_KEYS = [
  'ethereumAddress', 'baseAddress', 'bitcoinAddress', 'solanaAddress',
  'cashAppCashtag', 'venmoUsername', 'zelleContact', 'paypalUsername',
];
function hasAtLeastOneMethod(p: Record<string, unknown>): boolean {
  return ALLOWED_KEYS.some((k) => typeof p[k] === 'string' && (p[k] as string).trim().length > 0);
}
function validateProfile(body: unknown): body is Record<string, unknown> {
  if (!body || typeof body !== 'object') return false;
  const p = body as Record<string, unknown>;
  for (const key of Object.keys(p)) {
    if (!ALLOWED_KEYS.includes(key) || typeof p[key] !== 'string') return false;
  }
  return hasAtLeastOneMethod(p);
}

const snakeToCamel: Record<string, string> = {
  ethereum_address: 'ethereumAddress',
  base_address: 'baseAddress',
  bitcoin_address: 'bitcoinAddress',
  solana_address: 'solanaAddress',
  cash_app_cashtag: 'cashAppCashtag',
  venmo_username: 'venmoUsername',
  zelle_contact: 'zelleContact',
  paypal_username: 'paypalUsername',
};

function toProfile(row: Record<string, unknown>): Record<string, string | undefined> {
  const profile: Record<string, string | undefined> = {};
  const skip = ['id', 'created_at', 'updated_at', 'user_id', 'owner_address', 'email'];
  for (const [k, v] of Object.entries(row)) {
    if (skip.includes(k)) continue;
    const key = snakeToCamel[k] ?? k;
    profile[key] = typeof v === 'string' ? v : undefined;
  }
  return profile;
}

export async function GET(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const path = new URL(request.url).pathname;
  const id = path.replace(/^\/api\/profile\//, '').split('/')[0];
  if (!id || id.length > 32) {
    return Response.json({ error: 'Invalid profile id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    console.error('Supabase get error:', error);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }

  const profile = toProfile(data as Record<string, unknown>);
  return Response.json(profile, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

const camelToSnake: Record<string, string> = {
  ethereumAddress: 'ethereum_address',
  baseAddress: 'base_address',
  bitcoinAddress: 'bitcoin_address',
  solanaAddress: 'solana_address',
  cashAppCashtag: 'cash_app_cashtag',
  venmoUsername: 'venmo_username',
  zelleContact: 'zelle_contact',
  paypalUsername: 'paypal_username',
};

function toRow(profile: Record<string, unknown>): Record<string, string | null> {
  const row: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(profile)) {
    if (k === 'id') continue;
    const col = camelToSnake[k];
    if (col) row[col] = typeof v === 'string' && v.trim() ? v.trim() : null;
  }
  return row;
}

export async function PUT(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const path = new URL(request.url).pathname;
  const id = path.replace(/^\/api\/profile\//, '').split('/')[0];
  if (!id || id.length > 32) {
    return Response.json({ error: 'Invalid profile id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!validateProfile(body)) {
    return Response.json(
      { error: 'Invalid profile. Must have at least one payment method.' },
      { status: 400 }
    );
  }

  const profile = body as Record<string, unknown>;
  const row = toRow(profile);

  const { error } = await supabase.from('profiles').update(row).eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    console.error('Supabase update error:', error);
    return Response.json(
      {
        error: 'Failed to update profile',
        details: error.message,
        hint: "If RLS error, ensure 'profiles allow update' policy exists (run migration).",
      },
      { status: 500 }
    );
  }

  return Response.json({ id }, { status: 200 });
}
