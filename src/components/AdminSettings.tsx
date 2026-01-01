import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { MethodType } from '../types';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const { paymentConfigs, loading, addConfig, deleteConfig } = usePayment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    method_type: 'crypto' as MethodType,
    method_name: '',
    address_or_username: '',
    network: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await addConfig({
        ...formData,
        is_active: true,
        network: formData.method_type === 'crypto' ? formData.network : undefined,
      });

      setFormData({
        method_type: 'crypto',
        method_name: '',
        address_or_username: '',
        network: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Failed to add payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await deleteConfig(id);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method. Please try again.');
    }
  };

  const methodTypes: { value: MethodType; label: string }[] = [
    { value: 'crypto', label: 'Crypto Wallet' },
    { value: 'cashapp', label: 'Cash App' },
    { value: 'venmo', label: 'Venmo' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'paypal', label: 'PayPal' },
  ];

  const networks = ['Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tips
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-gray-400">
            Manage your payment methods and tip settings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Payment Methods</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Method
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleSubmit}
                  className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 mb-6"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    Add New Payment Method
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Payment Type
                      </label>
                      <select
                        value={formData.method_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            method_type: e.target.value as MethodType,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {methodTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.method_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            method_name: e.target.value,
                          })
                        }
                        placeholder="e.g., My Ethereum Wallet"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {formData.method_type === 'crypto'
                          ? 'Wallet Address'
                          : formData.method_type === 'cashapp'
                          ? 'Cash Tag (without $)'
                          : 'Username'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address_or_username}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address_or_username: e.target.value,
                          })
                        }
                        placeholder={
                          formData.method_type === 'crypto'
                            ? '0x...'
                            : formData.method_type === 'cashapp'
                            ? 'username'
                            : '@username'
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                      />
                    </div>

                    {formData.method_type === 'crypto' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Network
                        </label>
                        <select
                          value={formData.network}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              network: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">Select Network</option>
                          {networks.map((network) => (
                            <option key={network} value={network}>
                              {network}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Method
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-4">
              {paymentConfigs.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50 text-center">
                  <p className="text-gray-400">
                    No payment methods configured yet.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Click "Add Method" to get started.
                  </p>
                </div>
              ) : (
                paymentConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 flex items-center justify-between hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {config.method_name}
                      </h3>
                      <p className="text-gray-400 text-sm capitalize mb-2">
                        {config.method_type}
                        {config.network && ` • ${config.network}`}
                      </p>
                      <p className="text-gray-500 text-sm font-mono break-all">
                        {config.address_or_username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
