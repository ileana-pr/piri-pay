import { useState, useEffect, useMemo } from 'react';
import { PaymentMethod, getEnabledMethods } from '../config/paymentConfig';
import { Wallet, DollarSign, QrCode } from 'lucide-react';
import CryptoSelector from './CryptoSelector';
import EthereumTip from './EthereumTip';
import SolanaTip from './SolanaTip';
import BitcoinTip from './BitcoinTip';
import FiatTip from './FiatTip';
import QRCode from 'qrcode';

type Blockchain = 'ethereum' | 'solana' | 'bitcoin';


export default function TipPage() {
  const paymentMethods = getEnabledMethods();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Get receiving addresses from env
  const receivingAddresses = useMemo(() => ({
    ethereum: import.meta.env.VITE_ETH_ADDRESS || '',
    solana: import.meta.env.VITE_SOL_ADDRESS || '',
    bitcoin: import.meta.env.VITE_BTC_ADDRESS || '',
  }), []);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = window.location.href;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, []);

  // get fiat methods only
  const fiatMethods = paymentMethods.filter(m => m.type !== 'crypto');

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'crypto':
        return <Wallet className="w-8 h-8" />;
      default:
        return <DollarSign className="w-8 h-8" />;
    }
  };


  // Show blockchain selector
  if (showCrypto && !selectedBlockchain) {
    return (
      <CryptoSelector
        onSelect={(blockchain) => setSelectedBlockchain(blockchain)}
        onBack={() => setShowCrypto(false)}
      />
    );
  }

  // Show Ethereum tip component
  if (selectedBlockchain === 'ethereum') {
    return (
      <EthereumTip
        onBack={() => setSelectedBlockchain(null)}
        receivingAddress={receivingAddresses.ethereum}
      />
    );
  }

  // Show Solana tip component
  if (selectedBlockchain === 'solana') {
    return (
      <SolanaTip
        onBack={() => setSelectedBlockchain(null)}
        receivingAddress={receivingAddresses.solana}
      />
    );
  }

  // Show Bitcoin tip component
  if (selectedBlockchain === 'bitcoin') {
    return (
      <BitcoinTip
        onBack={() => setSelectedBlockchain(null)}
        receivingAddress={receivingAddresses.bitcoin}
      />
    );
  }

  // Show fiat payment method
  if (selectedMethod) {
    return (
      <FiatTip method={selectedMethod} onBack={() => setSelectedMethod(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Send a Tip
          </h1>
          <p className="text-xl text-gray-300">
            Choose your preferred payment method
          </p>

          {!showQR && (
            <button
              onClick={() => setShowQR(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <QrCode className="w-5 h-5" />
              Show QR Code
            </button>
          )}

          {showQR && qrDataUrl && (
            <div className="mt-6 flex flex-col items-center">
              <div className="p-6 bg-white rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                <p className="text-sm text-gray-600 mt-3">
                  Scan to open this page
                </p>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Hide QR Code
              </button>
            </div>
          )}
        </div>

        {/* all payment methods in uniform grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* crypto payment */}
          <button
            onClick={() => setShowCrypto(true)}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br p-[2px] hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            }}
          >
            <div className="bg-slate-900 rounded-2xl p-8 h-full flex flex-col items-center justify-center space-y-4 min-h-[200px]">
              <div className="text-white">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">Crypto (Any Token)</h3>
              <p className="text-gray-400 text-sm text-center">Pay with any token on Ethereum, Solana, or Bitcoin</p>
            </div>
          </button>

          {/* fiat payment methods */}
          {fiatMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br p-[2px] hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50"
                style={{
                  background: `linear-gradient(135deg, ${
                    method.type === 'crypto'
                      ? '#3b82f6, #06b6d4'
                      : method.type === 'cashapp'
                      ? '#10b981, #059669'
                      : method.type === 'venmo'
                      ? '#0ea5e9, #3b82f6'
                      : method.type === 'zelle'
                      ? '#8b5cf6, #a855f7'
                      : '#2563eb, #0ea5e9'
                  })`,
                }}
              >
                <div className="bg-slate-900 rounded-2xl p-8 h-full flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                  <div className="text-white">
                    {getMethodIcon(method.type)}
                  </div>
                  <h3 className="text-2xl font-bold">
                    {method.name}
                  </h3>
                  <p className="text-gray-400 text-sm">Tap to continue</p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
