import { fmtDateTime } from "../utils/date";
import { downloadRequestsPdf } from "../pdf/requestsPdf";

export default function EmployerRequestsSection({
  cardStyle,
  btn,
  quotes,
  quotesLoading,
  quotesError,
  onReload,
  activeRequest,
  onPickRequest,
}) {
  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Richieste clienti</div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Qui vedi tutte le richieste inviate dal sito (tabella <b>quotes</b>).
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btn("ghost")} onClick={onReload}>Aggiorna</button>
          <button
            style={{
              ...btn("dark"),
              opacity: quotes.length ? 1 : 0.55,
              cursor: quotes.length ? "pointer" : "not-allowed",
            }}
            onClick={() => quotes.length && downloadRequestsPdf(quotes)}
            disabled={!quotes.length}
          >
            Scarica PDF richieste
          </button>
        </div>
      </div>

      {quotesError && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 900 }}>
          {quotesError}
        </div>
      )}

      <div style={{ marginTop: 14, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(15,23,42,0.10)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 240px 180px 1fr 170px", background: "#f3f6fb", padding: "12px 10px", fontWeight: 950, color: "#0b1224" }}>
          <div>Data/Ora</div>
          <div>Cliente</div>
          <div>Telefono</div>
          <div>Messaggio</div>
          <div></div>
        </div>

        {quotesLoading ? (
          <div style={{ padding: 16, fontWeight: 800 }}>Caricamento…</div>
        ) : quotes.length === 0 ? (
          <div style={{ padding: 16, fontWeight: 800, color: "#64748b" }}>Nessuna richiesta presente.</div>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 240px 180px 1fr 170px",
                padding: "12px 10px",
                borderTop: "1px solid rgba(15,23,42,0.08)",
                alignItems: "start",
                background: activeRequest?.id === q.id ? "rgba(99,102,241,0.06)" : "#fff",
              }}
            >
              <div style={{ fontWeight: 900 }}>{fmtDateTime(q.created_at)}</div>

              <div>
                <div style={{ fontWeight: 950, fontSize: 16, color: "#0b1224" }}>
                  {(q.nome || "")} {(q.cognome || "")}
                </div>
                {q.email ? (
                  <div style={{ marginTop: 6, fontWeight: 800, color: "#2563eb" }}>{q.email}</div>
                ) : (
                  <div style={{ marginTop: 6, fontWeight: 800, color: "#64748b" }}>-</div>
                )}
              </div>

              <div style={{ fontWeight: 900 }}>{q.telefono || "-"}</div>

              <div style={{ fontWeight: 800, color: "#334155", whiteSpace: "pre-wrap" }}>
                {q.messaggio || "-"}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={btn("soft")} onClick={() => onPickRequest(q)}>
                  Crea preventivo
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}