import { useState, useEffect } from 'react';
import TipPage from './TipPage';
import { UserProfile } from './ProfileCreation';
import { fetchProfile } from '../lib/profileApi';
import { logClientError, tipLinkInvalidUserMessage, tipPageLoadUserMessage } from '../lib/userFacingErrors';

interface TipPageLoaderProps {
  segment: string;
}

// tip URLs are /tip/:id only (nanoid from api)
function isTipProfileId(segment: string): boolean {
  return segment.length >= 8 && segment.length <= 32 && /^[a-zA-Z0-9_-]+$/.test(segment) && !segment.startsWith('%');
}

export default function TipPageLoader({ segment }: TipPageLoaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTipProfileId(segment)) {
      setError(tipLinkInvalidUserMessage());
      setLoading(false);
      return;
    }
    fetchProfile(segment)
      .then(setProfile)
      .catch((e) => {
        logClientError('TipPageLoader fetchProfile', e);
        setError(e instanceof Error ? e.message : tipPageLoadUserMessage());
      })
      .finally(() => setLoading(false));
  }, [segment]);

  if (loading) {
    return (
      <div className="piri-page min-h-screen flex items-center justify-center">
        <p className="text-piri font-semibold">Loading...</p>
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="piri-page min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 font-semibold">{error || "We couldn't open this payment page."}</p>
        <a href="/" className="piri-link text-sm">Go home</a>
      </div>
    );
  }
  return <TipPage profile={profile} />;
}
