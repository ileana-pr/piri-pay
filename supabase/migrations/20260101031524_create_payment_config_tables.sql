/*
  # Payment Configuration Schema

  ## Overview
  Creates tables to store payment method configurations for the tipping app.
  
  ## New Tables
  
  ### `payment_configs`
  Stores configuration for different payment methods (crypto wallets, cash app usernames)
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `method_type` (text) - Type of payment (crypto, cashapp, venmo, zelle, paypal)
  - `method_name` (text) - Display name for the method
  - `address_or_username` (text) - Wallet address or username
  - `is_active` (boolean) - Whether this method is enabled
  - `network` (text, optional) - For crypto: ethereum, polygon, etc.
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `tip_logs`
  Optional logging of tip attempts/completions
  - `id` (uuid, primary key) - Unique identifier
  - `recipient_user_id` (uuid) - Who received the tip
  - `method_type` (text) - Payment method used
  - `amount` (text, optional) - Amount if provided
  - `status` (text) - initiated, completed, failed
  - `created_at` (timestamptz) - When tip was initiated

  ## Security
  - Enable RLS on all tables
  - Users can read their own payment configs
  - Users can insert/update their own payment configs
  - Anyone can read active payment configs (for public tipping page)
  - Tip logs are readable by the recipient
*/

-- Create payment_configs table
CREATE TABLE IF NOT EXISTS payment_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type text NOT NULL CHECK (method_type IN ('crypto', 'cashapp', 'venmo', 'zelle', 'paypal')),
  method_name text NOT NULL,
  address_or_username text NOT NULL,
  is_active boolean DEFAULT true,
  network text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tip_logs table
CREATE TABLE IF NOT EXISTS tip_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type text NOT NULL,
  amount text,
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_logs ENABLE ROW LEVEL SECURITY;

-- Payment configs policies
CREATE POLICY "Users can read their own payment configs"
  ON payment_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active payment configs"
  ON payment_configs FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Users can insert their own payment configs"
  ON payment_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment configs"
  ON payment_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment configs"
  ON payment_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tip logs policies
CREATE POLICY "Users can read their own tip logs"
  ON tip_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Anyone can insert tip logs"
  ON tip_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_configs_user_id ON payment_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_configs_active ON payment_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_tip_logs_recipient ON tip_logs(recipient_user_id);
