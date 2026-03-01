import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminLoginModal({ open, onClose, onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr("Credenziali non valide.");
      return;
    }

    onLoggedIn?.(data.session);
    onClose?.();
  };

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Accesso Admin</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Chiudi">
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin} className="modalForm">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.it"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {err ? <div className="errorBox">{err}</div> : null}

          <button className="btnPrimary" type="submit" disabled={loading}>
            {loading ? "Accesso..." : "Entra"}
          </button>

          <p className="hint">
            Solo per amministratore. Se non sei admin, chiudi questa finestra.
          </p>
        </form>
      </div>
    </div>
  );
}