import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjyxfthywsyvbmqdedez.supabase.co";
const supabaseAnonKey = "sb_publishable_63UxelsVPx_l7nZRuqzM7Q_ypShK3sm";

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "sb-admin-session", // ✅ separa sessione admin
  },
});