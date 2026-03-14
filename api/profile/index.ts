import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

interface StoredProfile {
  ethereumAddress?: string;
  baseAddress?: string;
  bitcoinAddress?: string;
  solanaAddress?: string;
  cashAppCashtag?: string;
  venmoUsername?: string;
  zelleContact?: string;
  paypalUsername?: string;
}

function validateProfile(body: unknown): body is StoredProfile {
  if (!body || typeof body !== 'object') return false;
  const p = body as Record<string, unknown>;
  const allowed = [
    'ethereumAddress',
    'baseAddress',
    'bitcoinAddress',
    'solanaAddress',
    'cashAppCashtag',
    'venmoUsername',
    'zelleContact',
    'paypalUsername',
  ];
  for (const key of Object.keys(p)) {
    if (!allowed.includes(key) || typeof p[key] !== 'string') return false;
  }
  const vals = [
    p.ethereumAddress,
    p.baseAddress,
    p.bitcoinAddress,
    p.solanaAddress,
    p.cashAppCashtag,
    p.venmoUsername,
    p.zelleContact,
    p.paypalUsername,
  ];
  return vals.some((v) => typeof v === 'string' && String(v).trim().length > 0);
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

function toRow(profile: StoredProfile): Record<string, string | null> {
  const row: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(profile)) {
    const col = camelToSnake[k];
    if (col) row[col] = (typeof v === 'string' && v.trim()) ? v.trim() : null;
  }
  return row;
}

export async function POST(request: Request) {
  if (!supabase) {
    return Response.json(
      {
        error:
          'Storage not configured. Add Supabase project and set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!validateProfile(body)) {
    return Response.json(
      {
        error:
          'Invalid profile. Must have at least one payment method (ethereumAddress, baseAddress, solanaAddress, etc.).',
      },
      { status: 400 }
    );
  }

  const id = nanoid(10);
  const profile = body as StoredProfile;
  const row = { id, ...toRow(profile) };

  const { error } = await supabase.from('profiles').insert(row);

  if (error) {
    console.error('Supabase insert error:', error);
    return Response.json({ error: 'Failed to save profile' }, { status: 500 });
  }

  return Response.json({ id }, { status: 201 });
}
