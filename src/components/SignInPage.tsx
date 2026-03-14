import { useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Mail, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

/** get-started / sign-in page — email, wallet, google. after auth → profile creation */
export default function SignInPage() {
  const { openConnectModal: open } = useConnectModal();
  const onWalletConnect = open ?? (() => {});

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignIn = async () => {
    const trimmed = email.trim();
    if (!trimmed || !supabase) {
      setEmailError(supabase ? 'Enter your email' : 'Auth not configured');
      return;
    }
    setEmailError(null);
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Failed to send link');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
    } catch (e) {
      console.error('Google sign-in error:', e);
    } finally {
      setGoogleLoading(false);
    }
  };

  const LOGO_SRC = '/logo/piri.png';
  const LOGO_FALLBACK = '/logo/logo-heart-trans-1000px.png';

  return (
    <div className="piri-page">
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-piri-cashapp bg-piri-cream shadow-lg">
              <img
                src={LOGO_SRC}
                alt="Piri"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.dataset.fallbackUsed === '1') {
                    img.style.display = 'none';
                    const next = img.nextElementSibling;
                    if (next) (next as HTMLElement).classList.remove('hidden');
                  } else {
                    img.dataset.fallbackUsed = '1';
                    img.src = LOGO_FALLBACK;
                  }
                }}
              />
              <span className="hidden piri-heading text-4xl font-black text-piri-cashapp" aria-hidden>P</span>
            </div>
          </div>
          <h1 className="piri-heading text-5xl font-black mb-3">Piri</h1>
          <p className="text-xl font-bold mb-1 text-piri">Pick your flavors. Get paid.</p>
          <p className="text-sm piri-muted mb-5">We make it easy to send and receive money <br /> Add your payment methods to get started. </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          {/* sign up with email */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailSent || !supabase}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-piri/30 bg-piri-cream font-medium placeholder:piri-muted focus:outline-none focus:border-piri disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleEmailSignIn}
                disabled={emailLoading || emailSent || !supabase}
                className="px-5 py-3 rounded-xl border-2 border-piri bg-piri/10 hover:bg-piri/20 font-bold text-piri shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {emailLoading ? 'Sending...' : emailSent ? 'Sent' : 'Email'}
              </button>
            </div>
            {emailSent && (
              <p className="text-sm text-piri font-semibold">Check your inbox — click the link to continue</p>
            )}
            {emailError && (
              <p className="text-sm text-red-600 font-semibold">{emailError}</p>
            )}
          </div>

          {/* sign up with wallet */}
          <button
            type="button"
            onClick={onWalletConnect}
            className="w-full p-5 rounded-xl border-2 border-piri-cashapp bg-piri-cashapp/10 hover:bg-piri-cashapp/20 flex items-center gap-4 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-piri-cashapp/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-piri-cashapp" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-piri">Sign up with wallet</p>
              <p className="text-xs piri-muted">MetaMask, Coinbase, WalletConnect</p>
            </div>
          </button>

          {/* sign in with google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!supabase || googleLoading}
            className="w-full p-5 rounded-xl border-2 border-piri/30 bg-piri-cream hover:bg-piri/10 flex items-center gap-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="text-left flex-1">
              <p className="font-bold text-piri">{googleLoading ? 'Redirecting...' : 'Sign in with Google'}</p>
              <p className="text-xs piri-muted">Use your Google account</p>
            </div>
          </button>
        </div>
        {/* how it works */}
        <div className="mt-8 text-center">
          <a
            href="/getting-started"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border-2 border-piri-cashapp bg-piri-cashapp/15 text-piri-cashapp hover:bg-piri-cashapp/25 transition-colors"
          >
            How Piri Pay works
          </a>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs piri-muted">
            
          </p>
          <p className="text-xs piri-muted mt-4">
            Made with <span aria-label="love">🍧</span> for{' '}
            <a href="https://x.com/homebasedotlove" target="_blank" rel="noopener noreferrer" className="piri-link">Home Base</a>
            {' · ETH Denver 2026'}
          </p>
        </div>
      </div>
    </div>
  );
}
