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

/** POST /api/profile/link — attach existing profile to current google/email user */
export async function POST(request: Request) {
  if (!supabase) {
    return Response.json({ error: 'Storage not configured' }, { status: 503 });
  }
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return Response.json({ error: 'Authorization required' }, { status: 401 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  let body: { profileId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const profileId = body.profileId?.trim();
  if (!profileId || profileId.length > 32) {
    return Response.json({ error: 'Invalid profileId' }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id, user_id, owner_address')
    .eq('id', profileId)
    .single();

  if (fetchError || !existing) {
    return Response.json({ error: 'Profile not found' }, { status: 404 });
  }
  if ((existing as { user_id: string | null }).user_id) {
    return Response.json({ error: 'Profile already linked to an account' }, { status: 409 });
  }
  if ((existing as { owner_address: string | null }).owner_address) {
    return Response.json({ error: 'Profile is linked to a wallet. Sign in with that wallet instead.' }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ user_id: user.id })
    .eq('id', profileId);

  if (updateError) {
    console.error('Profile link error:', updateError);
    return Response.json({ error: 'Failed to link profile' }, { status: 500 });
  }
  return Response.json({ id: profileId }, { status: 200 });
}
