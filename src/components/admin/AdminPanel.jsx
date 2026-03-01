import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

import AdminQuotes from "./AdminQuotes";
import AdminReviews from "./AdminReviews";
import AdminWorks from "./AdminWorks";

const ADMIN_EMAILS = [
  "admin@clthermoservice.it",
  "clthermoservice@virgilio.it",
  "test@a.it",
];

export default function AdminPanel() {
  // AUTH
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userEmail = session?.user?.email || "";
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());

  useEffect(() => {
    let sub;

    (async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) console.warn(error);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthError(error.message || "Login fallito");
        return;
      }
      setSession(data.session);
    } catch (err) {
      setAuthError(String(err?.message || err));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // UI
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
      fontWeight: 800,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
    };
    if (variant === "dark")
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    if (variant === "ghost") return { ...base, background: "#fff", color: "#0b1224" };
    if (variant === "softDanger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
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
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 44, fontWeight: 950, color: "#0b1224", lineHeight: 1 }}>
                Dashboard Admin
              </div>
              <div style={{ marginTop: 10, color: "#475569", fontWeight: 700 }}>
                Login riservato (Supabase Auth).
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
                    fontWeight: 800,
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
            <div style={{ fontWeight: 800, color: "#0b1224" }}>Caricamento…</div>
          ) : !session ? (
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 14, maxWidth: 620 }}>
              {authError && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontWeight: 900,
                  }}
                >
                  Errore login: {authError}
                </div>
              )}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email admin"
                autoComplete="email"
                style={{
                  padding: "16px 18px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.15)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                style={{
                  padding: "16px 18px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.15)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              />
              <button style={{ ...btn("dark"), padding: "16px 18px", fontSize: 18 }} type="submit">
                Entra
              </button>
            </form>
          ) : !isAdmin ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#ffedd5",
                border: "1px solid #fed7aa",
                color: "#7c2d12",
                fontWeight: 900,
              }}
            >
              Sei loggato come <b>{userEmail}</b> ma non sei nella lista admin.
              <div style={{ marginTop: 10 }}>
                <button style={btn("ghost")} onClick={handleLogout}>
                  Esci
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 900, color: "#0b1224" }}>✅ Accesso admin confermato.</div>
          )}
        </div>

        {/* ADMIN CONTENT */}
        {session && isAdmin && (
          <>
            <AdminQuotes />
            <AdminReviews />
            <AdminWorks />
          </>
        )}
      </div>
    </div>
  );
}