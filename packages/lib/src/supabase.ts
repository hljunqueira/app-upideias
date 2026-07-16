import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  'https://supabase.184-107-141-97.sslip.io';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgzNTMxODkyLCJleHAiOjE5NDEyMTE4OTJ9.62vJORX5x0B2z-qOvFDVSzFY36X0makrphuqOGtWkIU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
