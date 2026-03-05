import { fmtDateTime } from "../utils/date";

export default function EmployerQuoteFilesSection({
  cardStyle,
  btn,
  files,
  filesLoading,
  filesError,
  onReload,
  onOpenPdf,
}) {
  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Storico PDF preventivi salvati</div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            File nel bucket <b>quote_files</b> + tabella <b>quote_files</b>.
          </div>
        </div>

        <button style={btn("ghost")} onClick={onReload}>
          Aggiorna
        </button>
      </div>

      {filesError && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 900 }}>
          {filesError}
        </div>
      )}

      <div style={{ marginTop: 14, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(15,23,42,0.10)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", background: "#f3f6fb", padding: "12px 10px", fontWeight: 950, color: "#0b1224" }}>
          <div>Creato</div>
          <div>Storage path</div>
          <div></div>
        </div>

        {filesLoading ? (
          <div style={{ padding: 16, fontWeight: 800 }}>Caricamento…</div>
        ) : files.length === 0 ? (
          <div style={{ padding: 16, fontWeight: 800, color: "#64748b" }}>Nessun PDF salvato.</div>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr 220px",
                padding: "12px 10px",
                borderTop: "1px solid rgba(15,23,42,0.08)",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 900 }}>{fmtDateTime(f.created_at)}</div>
              <div style={{ fontWeight: 800, color: "#334155", overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.storage_path}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={btn("dark")} onClick={() => onOpenPdf(f.storage_path)}>
                  Apri/Scarica PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}