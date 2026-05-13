import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Faltan credenciales de Supabase en el archivo .env.local. El sistema funcionará en modo offline/ficticio.");
}

// Exportamos el cliente solo si las credenciales existen, de lo contrario un objeto dummy seguro
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({ 
      from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({ error: null }) }),
      auth: { 
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error("Modo local activo - Usa las credenciales de prueba") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      } 
    } as any);
