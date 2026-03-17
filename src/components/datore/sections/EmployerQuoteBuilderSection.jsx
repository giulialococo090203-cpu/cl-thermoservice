export default function EmployerQuoteBuilderSection({
  cardStyle,
  btn,
  activeRequest,
  createError,
  createOk,
  creating,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  notesInternal,
  setNotesInternal,
  items,
  setItems,
  totals,
  selectedClauses,
  setSelectedClauses,
  optionalClauses,
  manualTotal,
  setManualTotal,
  onCreate,
  onClose,
}) {
  const updateItem = (idx, patch) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: "Voce", description: "", qty: 1, unit_price: 0 }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleClause = (key) => {
    setSelectedClauses((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Generazione preventivo (PDF + salvataggio)
      </div>
      <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
        Seleziona una richiesta sopra e compila i dati. Il PDF verrà salvato nel bucket <b>quote_files</b>.
      </div>

      {!activeRequest ? (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid rgba(15,23,42,0.10)",
            fontWeight: 900,
            color: "#475569",
          }}
        >
          Seleziona una richiesta e clicca “Crea preventivo”.
        </div>
      ) : (
        <>
          {createError && (
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
              {createError}
            </div>
          )}

          {createOk && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 16,
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                color: "#065f46",
                fontWeight: 900,
              }}
            >
              {createOk}
            </div>
          )}

          <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome cliente"
              style={inputStyle}
            />
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Email cliente"
              style={inputStyle}
            />
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Telefono cliente"
              style={inputStyle}
            />
            <input
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Indirizzo cliente"
              style={inputStyle}
            />
          </div>

          <textarea
            value={notesInternal}
            onChange={(e) => setNotesInternal(e.target.value)}
            placeholder="Descrizione / note libere"
            rows={4}
            style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical", marginTop: 12 }}
          />

          <div style={{ marginTop: 16, fontWeight: 950, color: "#0b1224" }}>Voci preventivo</div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 20,
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1.5fr 110px 160px 110px",
                  gap: 10,
                  alignItems: "start",
                }}
              >
                <input
                  value={it.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="Titolo"
                  style={miniInput}
                />
                <input
                  value={it.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  placeholder="Descrizione"
                  style={miniInput}
                />
                <input
                  value={it.qty}
                  onChange={(e) => updateItem(idx, { qty: e.target.value })}
                  placeholder="Qta"
                  style={miniInput}
                />
                <input
                  value={it.unit_price}
                  onChange={(e) => updateItem(idx, { unit_price: e.target.value })}
                  placeholder="Prezzo finale (€)"
                  style={miniInput}
                />

                <button
                  style={{ ...btn("danger"), height: 44 }}
                  onClick={() => removeItem(idx)}
                  type="button"
                  disabled={items.length === 1}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, fontWeight: 950, color: "#0b1224" }}>
            Clausole aggiuntive
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {(optionalClauses || []).map((clause) => {
              const checked = selectedClauses.includes(clause.key);

              return (
                <label
                  key={clause.key}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: 14,
                    borderRadius: 18,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleClause(clause.key)}
                    style={{ marginTop: 3 }}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      color: "#334155",
                      lineHeight: 1.55,
                    }}
                  >
                    {clause.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button style={btn("ghost")} type="button" onClick={addItem}>
              + Aggiungi voce
            </button>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                value={manualTotal}
                onChange={(e) => setManualTotal(e.target.value)}
                placeholder="Totale manuale (€)"
                style={{ ...miniInput, width: 180 }}
              />
              <div style={pill}>Imponibile: € {totals.subtotal.toFixed(2)}</div>
              <div style={{ ...pill, fontWeight: 950 }}>Totale: € {totals.total.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{ ...btn("dark"), opacity: creating ? 0.7 : 1 }}
              type="button"
              onClick={onCreate}
              disabled={creating}
            >
              {creating ? "Salvo..." : "Crea preventivo + Salva PDF"}
            </button>

            <button style={btn("ghost")} type="button" onClick={onClose} disabled={creating}>
              Chiudi
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "14px 14px",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.15)",
  fontWeight: 850,
  outline: "none",
  background: "#fff",
};

const miniInput = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.15)",
  fontWeight: 800,
  outline: "none",
  background: "#fff",
};

const pill = {
  padding: "10px 12px",
  borderRadius: 999,
  background: "#eef2ff",
  border: "1px solid rgba(99,102,241,0.25)",
  fontWeight: 900,
  color: "#111827",
};