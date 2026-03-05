// src/components/admin/AdminReviews.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

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
    return String(iso);
  }
}

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // bozza risposta per riga (id -> string)
  const [drafts, setDrafts] = useState({});

  // modalità modifica per riga (id -> boolean)
  const [editing, setEditing] = useState({});

  // refs textarea per focus (id -> ref)
  const textRefs = useRef({});

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
    padding: 24,
    marginTop: 16,
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
    if (variant === "softDanger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    if (variant === "soft")
      return { ...base, background: "#eef2ff", color: "#111827", border: "1px solid rgba(99,102,241,.25)" };
    return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
  };

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list = Array.isArray(data) ? data : [];
      setRows(list);

      // inizializza bozze con reply_text esistente
      const nextDrafts = {};
      const nextEditing = {};
      for (const r of list) {
        nextDrafts[r.id] = r.reply_text || "";
        // di default: se esiste una risposta, stai in sola lettura; se non esiste, sei già in edit
        nextEditing[r.id] = !r.reply_text;
      }
      setDrafts(nextDrafts);
      setEditing(nextEditing);
    } catch (e) {
      setErr(e?.message || "Errore caricamento recensioni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveReply = async (id) => {
    const text = String(drafts[id] ?? "").trim();

    // puoi anche permettere reply vuota per "cancellare risposta"
    const payload = {
      reply: !!text, // true se testo presente, false se vuoto
      reply_text: text || null,
    };

    try {
      const { error } = await supabase.from("reviews").update(payload).eq("id", id);
      if (error) throw error;

      await load();

      // dopo il salvataggio: torna in sola lettura se la risposta esiste, altrimenti resta edit
      setEditing((p) => ({ ...p, [id]: !!text ? false : true }));

      alert("Risposta salvata!");
    } catch (e) {
      alert("Errore risposta: " + (e?.message || e));
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Eliminare questa recensione?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return alert("Errore eliminazione: " + error.message);
    await load();
  };

  const startEdit = (r) => {
    // carica il testo pubblicato nella bozza e abilita editing
    setDrafts((p) => ({ ...p, [r.id]: r.reply_text || "" }));
    setEditing((p) => ({ ...p, [r.id]: true }));

    // focus textarea
    setTimeout(() => {
      const el = textRefs.current[r.id];
      if (el && typeof el.focus === "function") el.focus();
    }, 0);
  };

  const cancelEdit = (r) => {
    // torna allo stato pubblicato (o vuoto), e chiudi editing se esiste reply
    setDrafts((p) => ({ ...p, [r.id]: r.reply_text || "" }));
    setEditing((p) => ({ ...p, [r.id]: !r.reply_text }));
  };

  const sorted = useMemo(() => rows, [rows]);

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Gestione recensioni</div>
      <div style={{ marginTop: 8, color: "#475569", fontWeight: 800 }}>
        Puoi rispondere come CL. Thermoservice oppure eliminare le recensioni.
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={btn("ghost")} onClick={load}>
          Aggiorna recensioni
        </button>
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

      {loading ? (
        <div style={{ marginTop: 14, fontWeight: 900 }}>Caricamento…</div>
      ) : sorted.length === 0 ? (
        <div style={{ marginTop: 14, fontWeight: 900, color: "#64748b" }}>Nessuna recensione.</div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          {sorted.map((r) => {
            const isEditing = !!editing[r.id];
            const hasReply = !!r.reply_text;

            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 22,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>
                      {r.name || "Anonimo"}{" "}
                      <span style={{ fontWeight: 900, color: "#64748b", fontSize: 14 }}>
                        — {formatDateTime(r.created_at)}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, fontWeight: 800, color: "#0b1224" }}>
                      {"⭐".repeat(Number(r.rating || 0))}
                      <span style={{ marginLeft: 8, color: "#475569" }}>{r.rating || "-"}</span>
                    </div>
                  </div>

                  <button style={btn("softDanger")} onClick={() => deleteReview(r.id)}>
                    Elimina
                  </button>
                </div>

                {r.message ? (
                  <div style={{ marginTop: 12, fontWeight: 800, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {r.message}
                  </div>
                ) : null}

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 950, color: "#0b1224" }}>Risposta</div>

                  {/* Se c'è risposta e NON stai editando: mostra box read-only */}
                  {hasReply && !isEditing ? (
                    <div
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid rgba(15,23,42,0.12)",
                        background: "#f8fafc",
                        fontWeight: 800,
                        color: "#0b1224",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {r.reply_text}
                    </div>
                  ) : (
                    <textarea
                      ref={(el) => {
                        if (el) textRefs.current[r.id] = el;
                      }}
                      value={drafts[r.id] ?? ""}
                      onChange={(e) => setDrafts((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="Scrivi una risposta..."
                      rows={3}
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid rgba(15,23,42,0.15)",
                        fontWeight: 800,
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                  )}

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {/* Se non c'è risposta: sei in edit e puoi salvare */}
                    {(!hasReply || isEditing) && (
                      <button style={btn("dark")} onClick={() => saveReply(r.id)}>
                        Salva risposta
                      </button>
                    )}

                    {/* Bottone richiesto: MODIFICA */}
                    {hasReply && !isEditing && (
                      <button style={btn("soft")} onClick={() => startEdit(r)}>
                        Modifica
                      </button>
                    )}

                    {/* Se stai editando una risposta già pubblicata: annulla */}
                    {hasReply && isEditing && (
                      <button style={btn("ghost")} onClick={() => cancelEdit(r)}>
                        Annulla
                      </button>
                    )}
                  </div>

                  {r.reply_text ? (
                    <div style={{ marginTop: 10, color: "#16a34a", fontWeight: 900 }}>
                      ✅ Risposta pubblicata
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, color: "#64748b", fontWeight: 900 }}>
                      Nessuna risposta pubblicata
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}