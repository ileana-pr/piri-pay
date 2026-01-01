import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentConfig } from '../types';

interface PaymentContextType {
  paymentConfigs: PaymentConfig[];
  loading: boolean;
  fetchConfigs: () => Promise<void>;
  addConfig: (config: Omit<PaymentConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateConfig: (id: string, updates: Partial<PaymentConfig>) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPaymentConfigs(data || []);
    } catch (error) {
      console.error('Error fetching payment configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async (config: Omit<PaymentConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const { error } = await supabase
      .from('payment_configs')
      .insert([{ ...config, user_id: 'demo-user' }]);

    if (error) throw error;
    await fetchConfigs();
  };

  const updateConfig = async (id: string, updates: Partial<PaymentConfig>) => {
    const { error } = await supabase
      .from('payment_configs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await fetchConfigs();
  };

  const deleteConfig = async (id: string) => {
    const { error } = await supabase
      .from('payment_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchConfigs();
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        paymentConfigs,
        loading,
        fetchConfigs,
        addConfig,
        updateConfig,
        deleteConfig,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
