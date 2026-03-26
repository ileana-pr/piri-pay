/** short messages for the UI — full errors go to console.error only */

export function logClientError(context: string, ...data: unknown[]): void {
  console.error(`[piri] ${context}`, ...data);
}

/** profile POST/PUT / GET failures */
export function profileHttpUserMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Please check your payment details and try again.';
    case 401:
      return 'Your session expired. Please sign in again.';
    case 404:
      return "We couldn't find that profile.";
    case 503:
      return "We can't save your profile right now. Please try again in a few minutes.";
    default:
      return 'Something went wrong. Please try again.';
  }
}

// POST /api/profile never returns 404 from our api; 404 here is almost always Vite-only dev (no /api routes)
const PROFILE_SAVE_API_MISSING =
  "Couldn't reach the Piri API. On localhost run npm run dev:full (Vercel CLI) instead of npm run dev — Vite alone doesn't serve /api routes.";

/** create profile (POST) — map HTTP status to UI copy */
export function profilePostUserMessage(status: number): string {
  if (status === 404) return PROFILE_SAVE_API_MISSING;
  return profileHttpUserMessage(status);
}

/** update profile (PUT) — 404 on localhost is usually missing /api; in production means row missing */
export function profilePutUserMessage(status: number): string {
  if (status === 404) {
    return import.meta.env.DEV ? PROFILE_SAVE_API_MISSING : profileHttpUserMessage(404);
  }
  return profileHttpUserMessage(status);
}

/** magic link or oauth */
export function authEmailUserMessage(): string {
  return "We couldn't send that email. Check the address and try again.";
}

export function walletSignInUserMessage(): string {
  return "Couldn't sign in with your wallet. Please try again.";
}

export function tipPageLoadUserMessage(): string {
  return "This page couldn't be loaded. Check the link and try again.";
}

export function tipLinkInvalidUserMessage(): string {
  return "This link doesn't look valid. Ask the person who shared it to send it again.";
}

export function shareImageUserMessage(): string {
  return "Couldn't prepare the image. Please try again.";
}

/** solana RPC / blockhash / fetch failures (incl. 403 from crowded public rpc) */
export function solanaNetworkUserMessage(): string {
  return "Couldn't load Solana network data. Try again in a moment.";
}
