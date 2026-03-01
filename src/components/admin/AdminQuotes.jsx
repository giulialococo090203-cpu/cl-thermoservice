import { useEffect, useMemo, useState } from "react";
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openPrintableWindow(title, html) {
  const w = window.open("", "_blank"); // più compatibile
  if (!w) {
    alert("Popup bloccato: abilita i popup per generare il PDF.");
    return;
  }

  try {
    w.document.open();
    w.document.write(`<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
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
      window.addEventListener('load', () => {
        setTimeout(() => { try { window.focus(); window.print(); } catch(e) {} }, 300);
      });
    </script>
  </body>
</html>`);
    w.document.close();
  } catch (e) {
    console.error("Errore PDF:", e);
    w.document.body.innerHTML = `
      <div style="font-family:system-ui;padding:24px">
        <h2>Errore generazione PDF</h2>
        <p>Apri la console del browser per dettagli.</p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(
          e?.message || e
        )}</pre>
      </div>
    `;
  }
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedQuoteIds, setSelectedQuoteIds] = useState(new Set());

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
    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredQuotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((r) => {
      const s = `${r.nome || ""} ${r.cognome || ""} ${r.telefono || ""} ${r.email || ""} ${
        r.messaggio || ""
      }`.toLowerCase();
      return s.includes(q);
    });
  }, [quotes, query]);

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
      <div class="muted">Generato: ${escapeHtml(now)} — Totale righe: ${rows.length}</div>
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
                  <td>${escapeHtml(formatDateTime(r.created_at))}</td>
                  <td>${escapeHtml(r.nome)}</td>
                  <td>${escapeHtml(r.cognome)}</td>
                  <td>${escapeHtml(r.telefono)}</td>
                  <td>${escapeHtml(r.email)}</td>
                  <td>${escapeHtml(r.messaggio)}</td>
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

  return (
    <div style={cardStyle}>
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
                    {String(q.nome ?? "")} {String(q.cognome ?? "")}
                  </div>
                  {q.messaggio && (
                    <div style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>
                      {String(q.messaggio)}
                    </div>
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
  );
}