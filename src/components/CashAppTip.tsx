import React, { useState } from 'react';
import { PaymentMethod } from '../config/paymentConfig';
import { ArrowLeft, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

interface CashAppTipProps {
  method: PaymentMethod;
  onBack: () => void;
}

export default function CashAppTip({ method, onBack }: CashAppTipProps) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');

  const getAppColor = () => {
    switch (method.type) {
      case 'cashapp':
        return 'from-green-500 to-emerald-600';
      case 'venmo':
        return 'from-sky-400 to-blue-500';
      case 'zelle':
        return 'from-violet-500 to-purple-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const getDeepLink = () => {
    if (!method.handle) return null;

    const handle = method.handle;
    const amt = amount || '';

    switch (method.type) {
      case 'cashapp':
        return `https://cash.app/$${handle}${amt ? `/${amt}` : ''}`;
      case 'venmo':
        return `https://venmo.com/${handle}${amt ? `?txn=pay&amount=${amt}` : ''}`;
      case 'zelle':
        return null;
      default:
        return null;
    }
  };

  const handleCopyAndOpen = async () => {
    if (!method.handle) {
      alert('No handle configured for this payment method');
      return;
    }

    try {
      await navigator.clipboard.writeText(method.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      const deepLink = getDeepLink();
      if (deepLink) {
        setTimeout(() => {
          window.open(deepLink, '_blank');
        }, 300);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            <div
              className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getAppColor()} rounded-2xl mb-4`}
            >
              <span className="text-2xl font-bold">
                {method.name[0].toUpperCase()}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {method.name}
            </h2>
            <p className="text-gray-400">Send a tip via {method.name}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
              <p className="text-sm text-gray-400 mb-2">
                {method.type === 'cashapp' ? 'Cash Tag' : method.type === 'zelle' ? 'Email/Phone' : 'Username'}
              </p>
              <p className="text-2xl font-bold font-mono break-all">
                {method.type === 'cashapp' && method.handle && !method.handle.startsWith('$')
                  ? `$${method.handle}`
                  : method.handle}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Amount (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter an amount or leave blank to decide in the app
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-400">ℹ️</span>
                How it works
              </h3>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>
                  Click the button below to copy the{' '}
                  {method.type === 'cashapp' ? 'Cash Tag' : method.type === 'zelle' ? 'email/phone' : 'username'}
                </li>
                {getDeepLink() ? (
                  <>
                    <li>The {method.name} app will open automatically</li>
                    <li>Complete the payment in the app</li>
                  </>
                ) : (
                  <>
                    <li>Open your {method.name} app manually</li>
                    <li>Paste the {method.type === 'zelle' ? 'email/phone' : 'username'} and send your tip</li>
                  </>
                )}
              </ol>
            </div>

            <button
              onClick={handleCopyAndOpen}
              className={`w-full py-4 px-6 bg-gradient-to-r ${getAppColor()} hover:opacity-90 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Copied!
                </>
              ) : getDeepLink() ? (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Copy & Open {method.name}
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy {method.type === 'cashapp' ? 'Cash Tag' : method.type === 'zelle' ? 'Email/Phone' : 'Username'}
                </>
              )}
            </button>

            {method.type === 'zelle' && (
              <div className="text-center text-sm text-gray-400">
                <p>
                  Zelle doesn't support direct app links. After copying, open
                  your banking app and send via Zelle.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Try a different method
          </button>
        </div>
      </div>
    </div>
  );
}
