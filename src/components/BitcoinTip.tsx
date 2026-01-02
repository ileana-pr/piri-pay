import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import QRCode from 'qrcode';

interface BitcoinTipProps {
  onBack: () => void;
  receivingAddress: string;
}

export default function BitcoinTip({ onBack, receivingAddress }: BitcoinTipProps) {
  const [amount, setAmount] = useState('');
  const [btcQrCode, setBtcQrCode] = useState('');

  // generate bitcoin QR code when amount changes
  const generateBtcQR = useCallback(async () => {
    if (!receivingAddress || !amount) return;
    try {
      const btcUri = `bitcoin:${receivingAddress}?amount=${amount}`;
      const qr = await QRCode.toDataURL(btcUri, { width: 300 });
      setBtcQrCode(qr);
    } catch (error) {
      console.error('Error generating BTC QR:', error);
    }
  }, [receivingAddress, amount]);

  useEffect(() => {
    if (amount && receivingAddress) {
      generateBtcQR();
    }
  }, [amount, receivingAddress, generateBtcQR]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Bitcoin Payment</h2>
            <p className="text-gray-400">Enter amount and scan QR code to send</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Amount (BTC)
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {receivingAddress && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-2">Your payment address is pre-filled</p>
                <p className="font-mono text-xs break-all text-gray-500">{receivingAddress.slice(0, 10)}...{receivingAddress.slice(-8)}</p>
              </div>
            )}

            {btcQrCode && amount && (
              <div className="flex justify-center">
                <img src={btcQrCode} alt="Bitcoin QR Code" className="w-64 h-64 bg-white p-4 rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

