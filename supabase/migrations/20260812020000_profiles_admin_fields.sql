-- Migration: Add plan, status, and instagram_handle columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Pro',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo',
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Garantir valores default em registros existentes
UPDATE public.profiles SET status = 'Ativo' WHERE status IS NULL;
UPDATE public.profiles SET plan = 'Pro' WHERE plan IS NULL;
