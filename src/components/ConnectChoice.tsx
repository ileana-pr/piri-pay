import { useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConnectChoiceProps {
  variant?: 'compact' | 'full';
  isConnecting?: boolean;
}

/** connect wallet (RainbowKit + SIWE) or email (Supabase magic link) */
export default function ConnectChoice({ variant = 'compact', isConnecting }: ConnectChoiceProps) {
  const { openConnectModal: open } = useConnectModal();
  const onWalletConnect = open ?? (() => {});

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const walletButton = (
    <button
        type="button"
        onClick={onWalletConnect}
        disabled={isConnecting}
        className="w-full p-5 rounded-xl border-2 border-piri-cashapp bg-piri-cashapp/10 hover:bg-piri-cashapp/20 flex items-center gap-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-12 h-12 rounded-xl bg-piri-cashapp/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6 text-piri-cashapp" />
        </div>
        <div className="text-left flex-1">
          <p className="font-bold text-piri">Connect wallet</p>
          <p className="text-xs piri-muted">
            {isConnecting ? 'Connecting...' : 'MetaMask, Coinbase, WalletConnect'}
          </p>
        </div>
      </button>
  );

  if (variant === 'compact') {
    return <div className="space-y-4">{walletButton}</div>;
  }

  const fullButtons = (
    <div className="space-y-4">
      {/* email magic link */}
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
            {emailLoading ? 'Sending...' : emailSent ? 'Sent' : 'Email link'}
          </button>
        </div>
        {emailSent && (
          <p className="text-sm text-piri font-semibold">Check your inbox — click the link to sign in</p>
        )}
        {emailError && (
          <p className="text-sm text-red-600 font-semibold">{emailError}</p>
        )}
      </div>
      {walletButton}
    </div>
  );

  // mascot: piri.png; fallback: piri-heart.png (both in public/logo/)
  const LOGO_SRC = '/logo/piri.png';
  const LOGO_FALLBACK = '/logo/piri-heart.png';

  return (
    <div className="piri-page">
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-piri-cashapp bg-piri-cream shadow-lg">
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
              <span className="hidden piri-heading text-3xl font-black text-piri-cashapp" aria-hidden>P</span>
            </div>
          </div>
          <h1 className="piri-heading text-4xl font-black mb-3">Sign in to Piri</h1>
          <p className="text-sm piri-muted font-semibold">connect a wallet to create your tip link</p>
        </div>
        {fullButtons}
        <p className="mt-8 text-center text-xs piri-muted">
          Piri makes it easy to get paid. Add your payment methods to get started.
        </p>
      </div>
    </div>
  );
}
