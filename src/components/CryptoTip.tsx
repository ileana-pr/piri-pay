import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { PaymentMethod } from '../config/paymentConfig';
import { ArrowLeft, Wallet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface CryptoTipProps {
  method: PaymentMethod;
  onBack: () => void;
}

export default function CryptoTip({ method, onBack }: CryptoTipProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: hash, sendTransaction, isPending: isSending, error: sendError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSendTip = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!method.address) {
      alert('No wallet address configured');
      return;
    }

    try {
      sendTransaction({
        to: method.address as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error sending tip:', error);
    }
  };

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5', '1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{method.name}</h2>
            <p className="text-gray-400">
              Send crypto tip via Web3 wallet
            </p>
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-center text-gray-300 mb-6">
                Connect your wallet to send a tip
              </p>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={!connector.ready}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <button
                  onClick={() => disconnect()}
                  className="text-sm text-red-400 hover:text-red-300 mt-2"
                >
                  Disconnect
                </button>
              </div>

              {!isSuccess ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                      Enter Amount ({method.id === 'eth' ? 'ETH' : method.id === 'sol' ? 'SOL' : 'Crypto'})
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-3">Quick amounts</p>
                    <div className="grid grid-cols-5 gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setAmount(amt)}
                          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sendError && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        {sendError.message || 'Transaction failed'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendTip}
                    disabled={!amount || isSending || isConfirming}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSending || isConfirming ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isSending ? 'Sending...' : 'Confirming...'}
                      </>
                    ) : (
                      'Send Tip'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400">
                    Tip Sent Successfully!
                  </h3>
                  <p className="text-gray-400">
                    Thank you for your generous tip!
                  </p>
                  {hash && (
                    <p className="text-sm text-gray-500 font-mono break-all">
                      Transaction: {hash}
                    </p>
                  )}
                  <button
                    onClick={onBack}
                    className="mt-6 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                  >
                    Send Another Tip
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sending to: {method.address}</p>
        </div>
      </div>
    </div>
  );
}
