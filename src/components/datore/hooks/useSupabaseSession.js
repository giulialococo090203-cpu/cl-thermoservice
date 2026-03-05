import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export function useSupabaseSession() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let sub;

    (async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setAuthLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      sub = listener?.subscription;
    })();

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || "").trim(),
      password,
    });
    if (error) throw error;
    setSession(data.session);
    return data.session;
  };

  return { session, authLoading, login, logout };
}