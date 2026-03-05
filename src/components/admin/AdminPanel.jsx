// src/components/admin/AdminPanel.jsx
import { useEffect, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

import AdminQuotes from "./AdminQuotes";
import AdminServices from "./AdminServices";
import AdminAbout from "./AdminAbout";
import AdminFaq from "./AdminFaq"; // ✅ AGGIUNTO
import AdminReviews from "./AdminReviews";
import AdminWorks from "./AdminWorks";
import AdminLinks from "./AdminLinks";

async function fetchUserRole(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role || null;
}

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [role, setRole] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userEmail = session?.user?.email || "";
  const isAdmin = role === "admin";

  useEffect(() => {
    let sub;

    (async () => {
      setAuthLoading(true);
      const { data } = await supabaseAdmin.auth.getSession();
      setSession(data?.session ?? null);
      setAuthLoading(false);

      const { data: listener } = supabaseAdmin.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      sub = listener?.subscription;
    })();

    return () => sub?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setRole(null);
      setRoleError("");
      return;
    }

    (async () => {
      setRoleLoading(true);
      setRoleError("");
      try {
        const r = await fetchUserRole(session.user.id);
        setRole(r);
        if (!r) setRoleError("Ruolo non trovato per questo utente.");
      } catch (e) {
        console.error(e);
        setRole(null);
        setRoleError(e?.message || "Impossibile leggere il ruolo (policy/RLS?).");
      } finally {
        setRoleLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return setAuthError(error.message || "Login fallito");
    setSession(data.session);
  };

  const handleLogout = async () => {
    await supabaseAdmin.auth.signOut();
    setSession(null);
    setRole(null);
  };

  const containerRef = useRef(null);

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
  };

  const btn = (variant = "primary") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 900,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
    if (variant === "dark")
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    if (variant === "ghost") return { ...base, background: "#fff", color: "#0b1224" };
    if (variant === "soft")
      return {
        ...base,
        background: "#eef2ff",
        color: "#111827",
        border: "1px solid rgba(99,102,241,.25)",
      };
    if (variant === "softDanger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
  };

  const dangerBox = {
    padding: 14,
    borderRadius: 16,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontWeight: 900,
  };

  const warnBox = {
    padding: 14,
    borderRadius: 16,
    background: "#ffedd5",
    border: "1px solid #fed7aa",
    color: "#7c2d12",
    fontWeight: 900,
  };

  const inputStyle = {
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.15)",
    fontSize: 18,
    fontWeight: 800,
    outline: "none",
    background: "#fff",
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        padding: "28px 18px",
        background:
          "radial-gradient(1200px 600px at 15% 5%, rgba(59,130,246,0.10), transparent 55%), radial-gradient(1200px 600px at 85% 0%, rgba(244,63,94,0.10), transparent 55%), #f6f8fb",
      }}
    >
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 44, fontWeight: 950, color: "#0b1224", lineHeight: 1 }}>
                Dashboard Admin
              </div>
              <div style={{ marginTop: 10, color: "#475569", fontWeight: 800 }}>
                Accesso riservato (role: <b>admin</b>)
              </div>
            </div>

            {session && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    border: "1px solid rgba(99,102,241,0.25)",
                    fontWeight: 900,
                    color: "#111827",
                    maxWidth: 520,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={userEmail}
                >
                  Loggato: {userEmail}
                </span>
                <button style={btn("ghost")} onClick={handleLogout}>
                  Esci
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AUTH */}
        <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
          {authLoading ? (
            <div style={{ fontWeight: 900, color: "#0b1224" }}>Caricamento…</div>
          ) : !session ? (
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 14, maxWidth: 620 }}>
              {authError && <div style={dangerBox}>{authError}</div>}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email admin"
                autoComplete="email"
                style={inputStyle}
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                style={inputStyle}
              />
              <button style={{ ...btn("dark"), padding: "16px 18px", fontSize: 18 }} type="submit">
                Entra
              </button>
            </form>
          ) : roleLoading ? (
            <div style={{ fontWeight: 900, color: "#0b1224" }}>Verifica permessi…</div>
          ) : roleError ? (
            <div style={warnBox}>Errore permessi: {roleError}</div>
          ) : !isAdmin ? (
            <div style={dangerBox}>
              Accesso negato: questo pannello è solo per <b>admin</b>.
            </div>
          ) : (
            <div style={{ fontWeight: 950, color: "#0b1224" }}>✅ Accesso admin confermato.</div>
          )}
        </div>

        {/* SEZIONI */}
        {session && isAdmin && (
          <>
            <AdminQuotes />
            <AdminServices />
            <AdminAbout />
            <AdminFaq /> {/* ✅ AGGIUNTO */}
            <AdminReviews />
            <AdminWorks />
            <AdminLinks />
          </>
        )}
      </div>
    </div>
  );
}