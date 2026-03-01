import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjyxfthywsyvbmqdedez.supabase.co";
const supabaseAnonKey = "sb_publishable_63UxelsVPx_l7nZRuqzM7Q_ypShK3sm"; // <-- incolla quella di Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});