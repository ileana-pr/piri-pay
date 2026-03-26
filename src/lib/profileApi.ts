import type { UserProfile } from '../components/ProfileCreation';
import { supabase } from './supabase';
import { logClientError, profileHttpUserMessage } from './userFacingErrors';

const API = '/api/profile';

/** create profile, returns id. links to supabase user when session exists (google/email), or ownerAddress when wallet-only. */
export async function createProfile(profile: Omit<UserProfile, 'id'> & { ownerAddress?: string }): Promise<{ id: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(API, {
    method: 'POST',
    headers,
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    logClientError('createProfile', res.status, err);
    throw new Error(profileHttpUserMessage(res.status));
  }
  return res.json();
}

/** update existing profile by id */
export async function updateProfile(id: string, profile: Omit<UserProfile, 'id'>): Promise<void> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    logClientError('updateProfile', res.status, err);
    throw new Error(profileHttpUserMessage(res.status));
  }
}

/** fetch profile by supabase session (for returning google/email users) */
export async function fetchProfileBySession(): Promise<UserProfile | null> {
  const { data: { session } } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  if (!session?.access_token) return null;
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    logClientError('fetchProfileBySession', res.status, err);
    throw new Error(profileHttpUserMessage(res.status));
  }
  const data = await res.json();
  return {
    id: data.id,
    ethereumAddress: data.ethereumAddress ?? '',
    baseAddress: data.baseAddress,
    bitcoinAddress: data.bitcoinAddress,
    solanaAddress: data.solanaAddress ?? '',
    cashAppCashtag: data.cashAppCashtag,
    venmoUsername: data.venmoUsername,
    zelleContact: data.zelleContact,
    paypalUsername: data.paypalUsername,
  };
}

/** fetch profile by ethereum address (for returning wallet users) */
export async function fetchProfileByAddress(address: string): Promise<UserProfile | null> {
  const res = await fetch(`${API}?address=${encodeURIComponent(address)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    logClientError('fetchProfileByAddress', res.status, err);
    throw new Error(profileHttpUserMessage(res.status));
  }
  const data = await res.json();
  return {
    id: data.id,
    ethereumAddress: data.ethereumAddress ?? '',
    baseAddress: data.baseAddress,
    bitcoinAddress: data.bitcoinAddress,
    solanaAddress: data.solanaAddress ?? '',
    cashAppCashtag: data.cashAppCashtag,
    venmoUsername: data.venmoUsername,
    zelleContact: data.zelleContact,
    paypalUsername: data.paypalUsername,
  };
}

/** fetch profile by id (for tip page) */
export async function fetchProfile(id: string): Promise<UserProfile> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("This tip page couldn't be found.");
    const err = await res.json().catch(() => ({ error: res.statusText }));
    logClientError('fetchProfile', res.status, err);
    throw new Error(profileHttpUserMessage(res.status));
  }
  const data = await res.json();
  return {
    id,
    ethereumAddress: data.ethereumAddress ?? '',
    baseAddress: data.baseAddress,
    bitcoinAddress: data.bitcoinAddress,
    solanaAddress: data.solanaAddress ?? '',
    cashAppCashtag: data.cashAppCashtag,
    venmoUsername: data.venmoUsername,
    zelleContact: data.zelleContact,
    paypalUsername: data.paypalUsername,
  };
}
