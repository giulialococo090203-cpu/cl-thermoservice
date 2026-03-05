import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

async function fetchUserRole(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role || null; // "admin" | "employer" | null
}

async function fetchMyCompanyId(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.company_id || null;
}

export function useRoleCompany(userId) {
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setRole(null);
      setCompanyId(null);
      setRoleError("");

      if (!userId) return;

      setRoleLoading(true);
      try {
        const [r, c] = await Promise.all([fetchUserRole(userId), fetchMyCompanyId(userId)]);
        if (!alive) return;

        setRole(r);
        setCompanyId(c || null);

        if (!c) setRoleError("company_id mancante sul profilo. Controlla tabella profiles.");
      } catch (e) {
        if (!alive) return;
        setRoleError(e?.message || "Impossibile verificare permessi/azienda.");
      } finally {
        if (alive) setRoleLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  return { roleLoading, roleError, role, companyId };
}