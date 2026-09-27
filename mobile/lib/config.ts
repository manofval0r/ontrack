/** Shared mobile config — mirrors web/.env.example + mobile backend instance. */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://ontrack-api-mobile.onrender.com';
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://destcakvqdzhkzemdugo.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_kT5JCbb2BFocdW23HIJYfw_jk879gsk';
