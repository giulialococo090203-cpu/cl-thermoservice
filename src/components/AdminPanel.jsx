import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const ADMIN_EMAILS = [
  "admin@clthermoservice.it",
  "clthermoservice@virgilio.it",
  "test@a.it",
];

function formatDateTime(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function openPrintableWindow(title, html) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) return;

  w.document.open();
  w.document.write(`<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; }
      h1 { margin: 0 0 6px; font-size: 18px; }
      .muted { color: #555; font-size: 12px; margin-bottom: 18px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
      th { background: #f4f6f8; text-align: left; }
      @media print { body { padding: 0; } .no-print { display: none !important; } }
    </style>
  </head>
  <body>
    ${html}
    <script>
      setTimeout(() => { window.focus(); window.print(); }, 250);
    </script>
  </body>
</html>`);
  w.document.close();
}

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

  // QUOTES
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedQuoteIds, setSelectedQuoteIds] = useState(new Set());

  const loadQuotes = async () => {
    setQuotesError("");
    setQuotesLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
      setSelectedQuoteIds(new Set());
    } catch (err) {
      setQuotesError(err?.message || "Errore caricamento richieste");
    } finally {
      setQuotesLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadQuotes();
  }, [isAdmin]);

  const filteredQuotes = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((r) => {
      const s = `${r.nome || ""} ${r.cognome || ""} ${r.telefono || ""} ${r.email || ""} ${
        r.messaggio || ""
      }`.toLowerCase();
      return s.includes(q);
    });
  })();

  const toggleQuoteSelection = (id) => {
    setSelectedQuoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisibleQuotes = () => setSelectedQuoteIds(new Set(filteredQuotes.map((q) => q.id)));
  const deselectAllQuotes = () => setSelectedQuoteIds(new Set());

  const deleteOneQuote = async (id) => {
    if (!confirm("Eliminare questa richiesta?")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) return alert("Errore eliminazione: " + error.message);
    await loadQuotes();
  };

  const deleteSelectedQuotes = async () => {
    if (selectedQuoteIds.size === 0) return;
    if (!confirm(`Eliminare ${selectedQuoteIds.size} richieste selezionate?`)) return;
    const ids = Array.from(selectedQuoteIds);
    const { error } = await supabase.from("quotes").delete().in("id", ids);
    if (error) return alert("Errore eliminazione: " + error.message);
    await loadQuotes();
  };

  const clearQuotesDB = async () => {
    if (!confirm("ATTENZIONE: vuoi cancellare TUTTE le richieste dal database?")) return;
    const { error } = await supabase.from("quotes").delete().neq("id", -1);
    if (error) return alert("Errore pulizia: " + error.message);
    await loadQuotes();
  };

  const exportQuotesToPDF = (onlySelected) => {
    const rows = onlySelected
      ? filteredQuotes.filter((q) => selectedQuoteIds.has(q.id))
      : filteredQuotes;

    const now = new Date().toLocaleString("it-IT");
    const html = `
      <h1>Storico richieste preventivo</h1>
      <div class="muted">Generato: ${now} — Totale righe: ${rows.length}</div>
      <table>
        <thead>
          <tr>
            <th>Data/Ora</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Messaggio</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${formatDateTime(r.created_at)}</td>
              <td>${(r.nome || "").replaceAll("<", "&lt;")}</td>
              <td>${(r.cognome || "").replaceAll("<", "&lt;")}</td>
              <td>${(r.telefono || "").replaceAll("<", "&lt;")}</td>
              <td>${(r.email || "").replaceAll("<", "&lt;")}</td>
              <td>${(r.messaggio || "").replaceAll("<", "&lt;")}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div class="no-print muted" style="margin-top: 14px;">
        Nella finestra di stampa seleziona “Salva come PDF”.
      </div>
    `;
    openPrintableWindow(
      onlySelected ? "PDF richieste (selezionate)" : "PDF richieste (tutte)",
      html
    );
  };

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const loadReviews = async () => {
    setReviewsError("");
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setReviewsError(err?.message || "Errore caricamento recensioni");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadReviews();
  }, [isAdmin]);

  const deleteReview = async (id) => {
    if (!confirm("Eliminare questa recensione?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return alert("Errore eliminazione: " + error.message);
    await loadReviews();
  };

  const replyReview = async (id, replyText) => {
    const txt = (replyText || "").trim();
    if (!txt) return alert("Scrivi una risposta.");
    const { error } = await supabase
      .from("reviews")
      .update({
        reply: txt,
        reply_by: "CL. Thermoservice",
        reply_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return alert("Errore risposta: " + error.message);
    await loadReviews();
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
            {/* QUOTES */}
            <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
                Storico richieste preventivo
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, alignItems: "center" }}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca (nome, telefono, email, messaggio...)"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,0.15)",
                    fontWeight: 800,
                    minWidth: 260,
                    flex: "1 1 260px",
                  }}
                />
                <button style={btn("ghost")} onClick={selectAllVisibleQuotes}>
                  Seleziona tutti
                </button>
                <button style={btn("ghost")} onClick={deselectAllQuotes}>
                  Deseleziona
                </button>
                <button style={btn("dark")} onClick={() => exportQuotesToPDF(false)}>
                  PDF Tutte
                </button>
                <button
                  style={{
                    ...btn("dark"),
                    opacity: selectedQuoteIds.size ? 1 : 0.55,
                    cursor: selectedQuoteIds.size ? "pointer" : "not-allowed",
                  }}
                  onClick={() => selectedQuoteIds.size && exportQuotesToPDF(true)}
                >
                  PDF Selez.
                </button>
                <button style={btn("ghost")} onClick={loadQuotes}>
                  Aggiorna
                </button>
                <button
                  style={{
                    ...btn("softDanger"),
                    opacity: selectedQuoteIds.size ? 1 : 0.55,
                    cursor: selectedQuoteIds.size ? "pointer" : "not-allowed",
                  }}
                  onClick={deleteSelectedQuotes}
                >
                  Elimina selez.
                </button>
                <button style={btn("softDanger")} onClick={clearQuotesDB}>
                  Pulisci DB
                </button>
              </div>

              {quotesError && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 16,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontWeight: 900,
                  }}
                >
                  {quotesError}
                </div>
              )}

              <div style={{ marginTop: 14, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(15,23,42,0.10)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 160px 240px 170px 240px 150px",
                    background: "#f3f6fb",
                    padding: "12px 10px",
                    fontWeight: 950,
                    color: "#0b1224",
                  }}
                >
                  <div></div>
                  <div>Data/Ora</div>
                  <div>Cliente</div>
                  <div>Telefono</div>
                  <div>Email</div>
                  <div></div>
                </div>

                {quotesLoading ? (
                  <div style={{ padding: 16, fontWeight: 800 }}>Caricamento…</div>
                ) : filteredQuotes.length === 0 ? (
                  <div style={{ padding: 16, fontWeight: 800, color: "#64748b" }}>Nessuna richiesta presente.</div>
                ) : (
                  filteredQuotes.map((q) => {
                    const checked = selectedQuoteIds.has(q.id);
                    return (
                      <div
                        key={q.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 160px 240px 170px 240px 150px",
                          padding: "12px 10px",
                          borderTop: "1px solid rgba(15,23,42,0.08)",
                          alignItems: "start",
                          background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                        }}
                      >
                        <div>
                          <input type="checkbox" checked={checked} onChange={() => toggleQuoteSelection(q.id)} />
                        </div>

                        <div style={{ fontWeight: 900 }}>{formatDateTime(q.created_at)}</div>

                        <div>
                          <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224", lineHeight: 1.1 }}>
                            {(q.nome || "").toString()} {(q.cognome || "").toString()}
                          </div>
                          {q.messaggio && (
                            <div style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>{q.messaggio}</div>
                          )}
                        </div>

                        <div style={{ fontWeight: 900 }}>{q.telefono || "-"}</div>

                        <div style={{ fontWeight: 900 }}>
                          {q.email ? (
                            <a href={`mailto:${q.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                              {q.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button style={btn("ghost")} onClick={() => deleteOneQuote(q.id)}>
                            Elimina
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* REVIEWS */}
            <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Gestione recensioni</div>
              <div style={{ marginTop: 8, color: "#475569", fontWeight: 700 }}>
                Puoi rispondere come CL. Thermoservice oppure eliminare le recensioni.
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={btn("ghost")} onClick={loadReviews}>
                  Aggiorna recensioni
                </button>
              </div>

              {reviewsLoading ? (
                <div style={{ marginTop: 12, fontWeight: 800 }}>Caricamento…</div>
              ) : reviews.length === 0 ? (
                <div style={{ marginTop: 12, fontWeight: 800, color: "#64748b" }}>Nessuna recensione presente.</div>
              ) : (
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        background: "#fff",
                        border: "1px solid rgba(15,23,42,0.12)",
                        borderRadius: 20,
                        padding: 14,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>
                            {r.name || "Cliente"}{" "}
                            <span style={{ fontSize: 12, fontWeight: 900, color: "#334155", marginLeft: 6 }}>
                              ⭐ {r.rating ?? "-"}
                            </span>
                          </div>
                          <div style={{ marginTop: 4, color: "#94a3b8", fontWeight: 800 }}>
                            {formatDateTime(r.created_at)} • ID: {r.id}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteReview(r.id)}
                          style={{
                            borderRadius: 16,
                            padding: "10px 14px",
                            fontWeight: 900,
                            border: "1px solid #fecaca",
                            background: "#fee2e2",
                            color: "#991b1b",
                            cursor: "pointer",
                          }}
                        >
                          Elimina
                        </button>
                      </div>

                      {r.message && <div style={{ marginTop: 10, fontWeight: 700, color: "#334155" }}>{r.message}</div>}

                      <div style={{ marginTop: 10 }}>
                        <textarea
                          defaultValue={r.reply || ""}
                          placeholder="Risposta come CL. Thermoservice"
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 16,
                            border: "1px solid rgba(15,23,42,0.15)",
                            fontWeight: 700,
                            resize: "vertical",
                          }}
                          onBlur={(e) => replyReview(r.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WORKS */}
            <AdminWorksManager />
          </>
        )}
      </div>
    </div>
  );
}

function AdminWorksManager() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const loadWorks = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (e) {
      setErr(e?.message || "Errore caricamento lavori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const makeFileName = (originalName) => {
    const safe = (originalName || "file").replace(/\s+/g, "-");
    const ext = safe.includes(".") ? safe.split(".").pop() : "jpg";
    const base = safe.replace(/\.[^/.]+$/, "");
    const uid =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now());
    return `${Date.now()}-${uid}-${base}.${ext}`.toLowerCase();
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    setErr("");

    if (!file) return setErr("Seleziona una foto.");
    if (!title.trim()) return setErr("Inserisci un titolo.");
    if (!description.trim()) return setErr("Inserisci una descrizione.");

    setLoading(true);
    try {
      const storagePath = makeFileName(file.name);

      const { error: upErr } = await supabase.storage.from("works").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("works").getPublicUrl(storagePath);
      const image_url = pub?.publicUrl;
      if (!image_url) throw new Error("Impossibile ottenere public URL dell’immagine.");

      const { error: insErr } = await supabase.from("works").insert([
        {
          title: title.trim(),
          description: description.trim(),
          image_url,
          storage_path: storagePath,
        },
      ]);
      if (insErr) throw insErr;

      setTitle("");
      setDescription("");
      setFile(null);

      await loadWorks();
      alert("✅ Lavoro pubblicato!");
    } catch (e2) {
      setErr(e2?.message || "Errore pubblicazione lavoro");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = async (w) => {
    if (!confirm("Eliminare questo lavoro? (foto + record)")) return;
    setErr("");
    setLoading(true);

    try {
      const { error: delErr } = await supabase.from("works").delete().eq("id", w.id);
      if (delErr) throw delErr;

      if (w.storage_path) {
        await supabase.storage.from("works").remove([w.storage_path]);
      }

      await loadWorks();
    } catch (e) {
      setErr(e?.message || "Errore eliminazione lavoro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.85)",
        borderRadius: 28,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
        backdropFilter: "blur(10px)",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Gestione lavori (foto + descrizione)
      </div>

      {err && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontWeight: 900,
          }}
        >
          {err}
        </div>
      )}

      <form onSubmit={handleCreateWork} style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 720 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo lavoro"
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.15)",
            fontWeight: 800,
          }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione lavoro"
          rows={4}
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.15)",
            fontWeight: 800,
            resize: "vertical",
          }}
        />

        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              borderRadius: 16,
              padding: "12px 16px",
              fontWeight: 900,
              border: "1px solid #0b1224",
              background: "#0b1224",
              color: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Pubblico..." : "Pubblica lavoro"}
          </button>

          <button
            type="button"
            onClick={loadWorks}
            style={{
              borderRadius: 16,
              padding: "12px 16px",
              fontWeight: 900,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Aggiorna
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>Lavori pubblicati</div>

      {works.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>Nessun lavoro presente.</div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {works.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 20,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "120px 1fr 140px",
                gap: 12,
                alignItems: "start",
              }}
            >
              <img
                src={w.image_url}
                alt={w.title}
                style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 14 }}
              />
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{w.title}</div>
                <div style={{ marginTop: 6, fontWeight: 800, color: "#334155" }}>{w.description}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleDeleteWork(w)}
                  style={{
                    borderRadius: 16,
                    padding: "10px 14px",
                    fontWeight: 900,
                    border: "1px solid #fecaca",
                    background: "#fee2e2",
                    color: "#991b1b",
                    cursor: "pointer",
                    height: 42,
                  }}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}