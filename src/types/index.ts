export type MethodType = 'crypto' | 'cashapp' | 'venmo' | 'zelle' | 'paypal';

export interface PaymentConfig {
  id: string;
  user_id: string;
  method_type: MethodType;
  method_name: string;
  address_or_username: string;
  is_active: boolean;
  network?: string;
  created_at: string;
  updated_at: string;
}

export interface TipLog {
  id: string;
  recipient_user_id: string;
  method_type: MethodType;
  amount?: string;
  status: 'initiated' | 'completed' | 'failed';
  created_at: string;
}
