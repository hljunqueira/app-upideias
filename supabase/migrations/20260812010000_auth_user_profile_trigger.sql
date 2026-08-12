-- Migration: P2.2 - Hardened Automatic Profile Trigger for Supabase Auth Users
-- Version: 20260812010000
-- Description: Automatically creates or updates a public.profiles row when a new user signs up in auth.users, with SET search_path = '' hardening.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  extracted_name text;
BEGIN
  -- Extrai o nome das metadados do Google ou fallback seguro para a primeira parte do e-mail
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'Usuário UP'
  );

  INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    extracted_name,
    NEW.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
