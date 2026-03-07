import { useState } from 'react';

/**
 * Chain/app logos as images; use Piri-branded assets (tinted to piri text/fresa).
 * Place in public/logo/: ethereum.svg, base.svg, bitcoin.svg, solana.svg, cashapp.svg, venmo.svg
 * (or .png — we try .svg then .png). Fallback: initial when image missing or fails.
 */
type ChainId = 'ethereum' | 'base' | 'bitcoin' | 'solana' | 'cashapp' | 'venmo';

const LOGO_DIR = '/logo';

const FALLBACK_LETTER: Record<ChainId, string> = {
  ethereum: '⟠',
  base: '⬡',
  bitcoin: '₿',
  solana: '◎',
  cashapp: '$',
  venmo: 'V',
};

interface ChainLogoProps {
  chain: ChainId;
  className?: string;
  size?: number;
}

const defaultSize = 40;

export default function ChainLogo({ chain, className = '', size = defaultSize }: ChainLogoProps) {
  const [tryPng, setTryPng] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ext = tryPng ? '.png' : '.svg';
  const src = `${LOGO_DIR}/${chain}${ext}`;

  const handleError = () => {
    if (!tryPng) setTryPng(true);
    else setImgError(true);
  };

  if (imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-piri ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        aria-hidden
      >
        {FALLBACK_LETTER[chain]}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={handleError}
      aria-hidden
    />
  );
}
