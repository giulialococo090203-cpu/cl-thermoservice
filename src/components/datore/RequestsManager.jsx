import { useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function RequestsManager({
  companyId,
  requests,
  loading,
  error,
  onRefresh,
  onPick,
  onStartManualQuote,
  onDownloadPdf,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const allIds = useMemo(() => (requests || []).map((r) => r.id), [requests]);
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;

  const toggleId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => setSelectedIds(allIds);
  const deselectAll = () => setSelectedIds([]);

  const deleteSelected = async () => {
    if (!companyId) return alert("CompanyId mancante.");
    if (!selectedIds.length) return;

    const ok = window.confirm(`Eliminare ${selectedIds.length} richieste selezionate?`);
    if (!ok) return;

    // ✅ QUI: delete vera + controllo errori
    const { data, error: delErr } = await supabase
      .from("quotes")
      .delete()
      .eq("company_id", companyId)     // evita di cancellare roba di altre aziende
      .in("id", selectedIds)           // elimina solo quelle selezionate
      .select("id");                   // fa tornare qualcosa (utile per debug)

    if (delErr) {
      console.error("DELETE quotes error:", delErr);
      alert(`Errore eliminazione: ${delErr.message}`);
      return;
    }

    console.log("Deleted rows:", data);
    setSelectedIds([]);
    await onRefresh?.();
    alert("✅ Richieste eliminate.");
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Richieste clienti</div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Tabella <b>quotes</b> (solo della tua azienda).
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onRefresh}>Aggiorna</button>
          <button onClick={onDownloadPdf} disabled={!requests?.length}>Scarica PDF richieste</button>
          <button onClick={onStartManualQuote} type="button">Nuovo preventivo</button>

          {/* ✅ NUOVI */}
          <button onClick={selectAll} disabled={!requests?.length}>Seleziona tutte</button>
          <button onClick={deselectAll} disabled={!selectedIds.length}>Deseleziona</button>
          <button onClick={deleteSelected} disabled={!selectedIds.length} style={{ background: "#fee2e2" }}>
            Elimina selezionate ({selectedIds.length})
          </button>
        </div>
      </div>

      {error ? <div style={{ marginTop: 10, color: "crimson" }}>{error}</div> : null}

      <div style={{ marginTop: 14, border: "1px solid rgba(15,23,42,0.10)", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px 180px 240px 180px 1fr 170px", background: "#f3f6fb", padding: "12px 10px", fontWeight: 950 }}>
          <div></div>
          <div>Data/Ora</div>
          <div>Cliente</div>
          <div>Telefono</div>
          <div>Messaggio</div>
          <div></div>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Caricamento…</div>
        ) : (requests?.length ?? 0) === 0 ? (
          <div style={{ padding: 16, color: "#64748b" }}>Nessuna richiesta presente.</div>
        ) : (
          requests.map((q) => {
            const checked = selectedIds.includes(q.id);
            return (
              <div
                key={q.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 180px 240px 180px 1fr 170px",
                  padding: "12px 10px",
                  borderTop: "1px solid rgba(15,23,42,0.08)",
                  background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                  alignItems: "start",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleId(q.id)} />
                </div>

                <div style={{ fontWeight: 900 }}>{new Date(q.created_at).toLocaleString()}</div>

                <div>
                  <div style={{ fontWeight: 950 }}>{(q.nome || "")} {(q.cognome || "")}</div>
                  {q.email ? <div style={{ marginTop: 6, fontWeight: 800, color: "#2563eb" }}>{q.email}</div> : <div style={{ marginTop: 6, color: "#64748b" }}>-</div>}
                </div>

                <div style={{ fontWeight: 900 }}>{q.telefono || "-"}</div>
                <div style={{ fontWeight: 800, color: "#334155", whiteSpace: "pre-wrap" }}>{q.messaggio || "-"}</div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => onPick?.(q)}>Usa richiesta</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}