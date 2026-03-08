import { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Copy, Check, Pencil } from 'lucide-react';
import QRCode from 'qrcode';
import { UserProfile } from './ProfileCreation';
import { encodeProfileForUrl } from '../lib/profileUrl';

interface ProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
  onEdit?: () => void;
}

export default function ProfileView({ profile, onBack, onEdit }: ProfileViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const getProfileUrl = () =>
    `${window.location.origin}/tip/${encodeProfileForUrl(profile)}`;

  useEffect(() => {
    const url = `${window.location.origin}/tip/${encodeProfileForUrl(profile)}`;
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: '#2D0A00', light: '#ffffff' },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    generateQR();
  }, [profile]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="piri-page">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 font-semibold text-piri transition-opacity hover:opacity-70">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-2 font-semibold text-sm text-piri transition-opacity hover:opacity-70">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="piri-heading text-4xl font-black mb-2">Your Piri</h1>
          <p className="text-sm font-semibold piri-muted">one link for every flavor — share the QR to get paid</p>
        </div>

        <div className="rounded-2xl p-8 mb-6 border-2 bg-piri-cream border-piri-cashapp">
          <div className="flex flex-col items-center">
            {qrDataUrl && (
              <div className="p-6 bg-white rounded-2xl shadow-lg mb-6 border-2 border-piri">
                <img src={qrDataUrl} alt="Scan to pay with Piri" className="w-64 h-64" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 piri-muted">
              <QrCode className="w-5 h-5" />
              <span className="text-sm font-semibold">scan to pay — crypto or any payment app</span>
            </div>
            <button
              onClick={() => copyToClipboard(getProfileUrl(), 'url')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm piri-btn-primary"
            >
              {copied === 'url' ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-semibold piri-muted">
            Made with <span aria-label="love">🍧</span> for{' '}
            <a href="https://x.com/homebasedotlove" target="_blank" rel="noopener noreferrer" className="piri-link">Home Base</a>
            {' · ETH Denver 2026 · '}
            <a href="https://x.com/adigitaltati" target="_blank" rel="noopener noreferrer" className="piri-link">@adigitaltati</a>
          </p>
        </div>
      </div>
    </div>
  );
}
