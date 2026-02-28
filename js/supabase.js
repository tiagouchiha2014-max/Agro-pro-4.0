// js/supabase.js
export const SUPABASE_URL  = "COLE_SUA_SUPABASE_URL_AQUI";
export const SUPABASE_ANON = "COLE_SUA_SUPABASE_ANON_KEY_AQUI";

export const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function signIn(email, password) {
  return sb.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return sb.auth.signOut();
}
