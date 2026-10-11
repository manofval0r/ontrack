/** Shared mobile config — mirrors web/.env.example + mobile backend instance. */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://ontrack-api-mobile.onrender.com';
export const SUPABASE_URL: string = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
if (!SUPABASE_URL) throw new Error('EXPO_PUBLIC_SUPABASE_URL is required');
export const SUPABASE_ANON_KEY: string = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
if (!SUPABASE_ANON_KEY) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');