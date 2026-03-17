// src/components/datore/sections/EmployerQuoteBuilder.jsx
import { useEffect, useMemo, useState } from "react";
import { buildQuotePdfBlob } from "../pdf";
import {
  computeTotals,
  validateAndCleanItems,
  sanitizeText,
  uid,
  QUOTE_OPTIONAL_CLAUSES,
  getClauseLabels,
  sanitizeSelectedClauses,
} from "../validators";
import {
  insertQuoteHeader,
  insertQuoteItems,
  insertQuoteFileRow,
  uploadPdfToStorage,
} from "../datoreApi";

export default function EmployerQuoteBuilder({
  company,
  companyId,
  userId,
  activeRequest,
  onCloseRequest,
  onCreated,
  onRefreshAfterCreate,
  cardStyle,
  btn,
}) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notesInternal, setNotesInternal] = useState("");
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [manualTotal, setManualTotal] = useState("");

  const [items, setItems] = useState([
    { title: "Intervento", description: "", qty: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    if (!activeRequest) return;

    setCreateError("");
    setCreateOk("");

    const fullName = `${activeRequest?.nome || ""} ${activeRequest?.cognome || ""}`.trim();
    setCustomerName(fullName || "");
    setCustomerEmail(activeRequest?.email || "");
    setCustomerPhone(activeRequest?.telefono || "");
    setCustomerAddress("");
    setNotesInternal(activeRequest?.messaggio || "");
    setSelectedClauses([]);
    setManualTotal("");

    setItems([{ title: "Intervento", description: "", qty: 1, unit_price: 0 }]);
  }, [activeRequest?.id]);

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
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const cleanedForTotals = useMemo(() => {
    const v = validateAndCleanItems(items);
    return v.ok ? v.items : [];
  }, [items]);

  const totals = useMemo(() => computeTotals(cleanedForTotals), [cleanedForTotals]);

  const effectiveTotals = useMemo(() => {
    const parsedManual = Number(String(manualTotal || "").replace(",", ".").trim());
    const hasManualTotal = Number.isFinite(parsedManual) && parsedManual >= 0;

    if (hasManualTotal) {
      return {
        subtotal: parsedManual,
        vat: 0,
        total: parsedManual,
      };
    }

    return totals;
  }, [manualTotal, totals]);

  const createQuoteAndSavePdf = async () => {
    setCreateError("");
    setCreateOk("");

    if (!companyId) return setCreateError("company_id mancante.");
    if (!userId) return setCreateError("Sessione non valida.");

    const custName = sanitizeText(customerName, 120);
    if (!custName) return setCreateError("Inserisci nome cliente.");

    const valid = validateAndCleanItems(items);
    if (!valid.ok) return setCreateError(valid.error);

    const safeNotes = sanitizeText(notesInternal, 1200);
    const safeEmail = sanitizeText(customerEmail, 120);
    const safePhone = sanitizeText(customerPhone, 60);
    const safeAddr = sanitizeText(customerAddress, 180);
    const safeTotals = effectiveTotals;
    const safeClauseKeys = sanitizeSelectedClauses(selectedClauses);
    const safeClauseLabels = getClauseLabels(safeClauseKeys);

    setCreating(true);

    try {
      const headerPayload = {
        company_id: companyId,
        customer_name: custName,
        customer_email: safeEmail || null,
        customer_phone: safePhone || null,
        customer_address: safeAddr || null,
        notes_internal: safeNotes || null,
        status: "draft",
        total: safeTotals.total,
        currency: "EUR",
        created_by: userId,
      };

      const header = await insertQuoteHeader(headerPayload);
      const quoteId = header.id;

      const itemsPayload = valid.items.map((it, idx) => ({
        id: uid(),
        quote_id: quoteId,
        company_id: companyId,
        title: it.title,
        description: it.description,
        qty: it.qty,
        unit_price: it.unit_price,
        vat_rate: 0,
        line_total: it.line_total,
        sort_order: idx + 1,
      }));

      await insertQuoteItems(itemsPayload);

      const pdfBlob = await buildQuotePdfBlob({
        company,
        header,
        items: valid.items,
        totals: safeTotals,
        selectedClauses: safeClauseLabels,
      });

      const { storagePath } = await uploadPdfToStorage({
        companyId,
        quoteId,
        blob: pdfBlob,
      });

      await insertQuoteFileRow({
        quote_id: quoteId,
        company_id: companyId,
        storage_path: storagePath,
      });

      setCreateOk("✅ Preventivo creato e salvato. Ora lo trovi nello storico.");
      onCreated?.(storagePath);

      if (onRefreshAfterCreate) {
        await onRefreshAfterCreate();
      }
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || e);

      if (msg.toLowerCase().includes("numeric field overflow")) {
        setCreateError("Errore: numeri troppo grandi per il database. Riduci quantità o prezzi.");
      } else if (msg.toLowerCase().includes("row-level security")) {
        setCreateError(
          "Errore permessi (RLS): la policy non consente questo inserimento. Controlla le policy su quote_headers / quote_items / quote_files."
        );
      } else {
        setCreateError(msg || "Errore creazione preventivo/PDF.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Generazione preventivo (PDF + salvataggio)
      </div>
      <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
        Puoi creare un preventivo anche senza selezionare una richiesta.
      </div>

      {createError && <div style={dangerBox}>{createError}</div>}
      {createOk && <div style={okBox}>{createOk}</div>}

      <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome cliente" style={inputStyle} />
        <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email cliente" style={inputStyle} />
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Telefono cliente" style={inputStyle} />
        <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Indirizzo cliente" style={inputStyle} />
      </div>

      <textarea
        value={notesInternal}
        onChange={(e) => setNotesInternal(e.target.value)}
        placeholder="Descrizione / note libere"
        rows={4}
        style={{ ...inputStyle, marginTop: 12, resize: "vertical" }}
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
            <input value={it.title} onChange={(e) => updateItem(idx, { title: e.target.value })} placeholder="Titolo" style={miniInput} />
            <input value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Descrizione" style={miniInput} />
            <input value={it.qty} onChange={(e) => updateItem(idx, { qty: e.target.value })} placeholder="Qta" style={miniInput} />
            <input value={it.unit_price} onChange={(e) => updateItem(idx, { unit_price: e.target.value })} placeholder="Prezzo finale (€)" style={miniInput} />

            <button style={{ ...btn("danger"), height: 44 }} onClick={() => removeItem(idx)} type="button" disabled={items.length === 1}>
              Rimuovi
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontWeight: 950, color: "#0b1224" }}>Clausole aggiuntive</div>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {QUOTE_OPTIONAL_CLAUSES.map((clause) => {
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
              <span style={{ fontWeight: 800, color: "#334155", lineHeight: 1.55 }}>
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
          <div style={pill}>Imponibile: € {effectiveTotals.subtotal.toFixed(2)}</div>
          <div style={{ ...pill, fontWeight: 950 }}>Totale: € {effectiveTotals.total.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...btn("dark"), opacity: creating ? 0.7 : 1 }} type="button" onClick={createQuoteAndSavePdf} disabled={creating}>
          {creating ? "Salvo..." : "Crea preventivo + Salva PDF"}
        </button>

        {activeRequest ? (
          <button style={btn("ghost")} type="button" onClick={onCloseRequest} disabled={creating}>
            Chiudi
          </button>
        ) : null}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "16px 18px",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.15)",
  fontSize: 18,
  fontWeight: 800,
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

const dangerBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontWeight: 900,
};

const okBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#065f46",
  fontWeight: 900,
};