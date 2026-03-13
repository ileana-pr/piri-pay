import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from '../lib/supabase';
import { fetchSiweNonce, buildSiweMessage, verifySiwe } from '../lib/siweAuth';
import ChainLogo from './ChainLogo';
import { base } from 'wagmi/chains';

interface WalletSignInStepProps {
  onSuccess: () => void;
  onBack: () => void;
}

/** runs SIWE when user has connected EVM wallet — creates account, then calls onSuccess */
export default function WalletSignInStep({ onSuccess, onBack }: WalletSignInStepProps) {
  const { address, chain } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [error, setError] = useState<string | null>(null);

  const chainId = chain?.id ?? base.id;
  const chainLabel = chain?.id === base.id ? 'Base' : chain?.name ?? 'Ethereum';

  const handleSignIn = async () => {
    if (!address || !supabase) {
      setError('Wallet or auth not configured');
      return;
    }

    setError(null);
    try {
      const nonce = await fetchSiweNonce(address, chainId);
      const message = buildSiweMessage({
        address: address as `0x${string}`,
        nonce,
        chainId,
      });
      const signature = await signMessageAsync({ message });
      const { token_hash } = await verifySiwe({
        message,
        signature: signature as `0x${string}`,
        nonce,
      });
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'magiclink',
      });
      if (otpError) throw otpError;
      onSuccess();
    } catch (e) {
      console.error('SIWE error:', e);
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="piri-page">
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-piri-base bg-piri-base/20 mb-4">
            <ChainLogo chain="base" size={40} />
          </div>
          <h1 className="piri-heading text-2xl font-black mb-2">Sign in with {chainLabel}</h1>
          <p className="text-sm piri-muted font-semibold mb-4">
            Sign a message to create your account — we never ask for funds
          </p>
          <p className="font-mono text-sm bg-piri-cream px-4 py-2 rounded-lg inline-block">{shortAddress}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            disabled={isSigning}
            className="w-full py-4 rounded-xl font-bold piri-btn-primary disabled:opacity-50"
          >
            {isSigning ? 'Signing...' : 'Sign message'}
          </button>
          <button onClick={onBack} className="w-full py-4 rounded-xl font-semibold piri-btn-secondary">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
