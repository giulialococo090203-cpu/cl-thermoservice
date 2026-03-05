import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const TABLE = "faq_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const DEFAULT_FAQ = {
  title: "Domande frequenti",
  faqs: [
    {
      q: "A quanto bisogna impostare la pressione dell’impianto?",
      a: "Controlla periodicamente che la pressione dell’impianto a freddo sia compresa tra 1 e 1,5 bar.",
    },
    {
      q: "Ogni quanto deve essere fatta la manutenzione sulla mia caldaia?",
      a: "La manutenzione deve essere fatta ogni anno secondo le prescrizioni del costruttore.",
    },
  ],
  ctaTitle: "Hai una caldaia?",
  ctaText:
    "Registra il tuo impianto di riscaldamento al Catasto Impianti Termici Regionale per non incorrere nelle sanzioni previste.",
  ctaButton: "Contattaci",
};

export default function AdminFaq() {
  const [faq, setFaq] = useState(DEFAULT_FAQ);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const lastSavedRef = useRef(JSON.stringify(DEFAULT_FAQ));

  const faqs = useMemo(() => (Array.isArray(faq.faqs) ? faq.faqs : []), [faq.faqs]);

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
    padding: 24,
    marginTop: 16,
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.15)",
    fontWeight: 800,
    outline: "none",
    background: "#fff",
    width: "100%",
  };

  const btn = (variant = "dark") => {
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
    if (variant === "soft")
      return { ...base, background: "#eef2ff", color: "#111827", border: "1px solid rgba(99,102,241,.25)" };
    if (variant === "danger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    return base;
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

  const warnBox = {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    background: "#ffedd5",
    border: "1px solid #fed7aa",
    color: "#7c2d12",
    fontWeight: 900,
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

  // LOAD: prende SEMPRE l'ultima riga (se per sbaglio hai duplicati)
  const load = async () => {
    setErr("");
    setOk(false);
    setLoading(true);

    try {
      const { data, error } = await supabaseAdmin
        .from(TABLE)
        .select("payload, updated_at")
        .eq("company_id", COMPANY_ID)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const payload = data?.payload;
      if (payload && typeof payload === "object") {
        setFaq({ ...DEFAULT_FAQ, ...payload });
        lastSavedRef.current = JSON.stringify({ ...DEFAULT_FAQ, ...payload });
        setUnsaved(false);
      } else {
        setFaq(DEFAULT_FAQ);
        lastSavedRef.current = JSON.stringify(DEFAULT_FAQ);
        setUnsaved(false);
      }
    } catch (e) {
      setErr(e?.message || "Errore caricamento FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markUnsaved = (next) => {
    setFaq(next);
    const snap = JSON.stringify(next);
    setUnsaved(snap !== lastSavedRef.current);
  };

  const setField = (key, value) => {
    markUnsaved({ ...faq, [key]: value });
  };

  const updateFaq = (i, field, value) => {
    const list = faqs.map((x, idx) => (idx === i ? { ...x, [field]: value } : x));
    markUnsaved({ ...faq, faqs: list });
  };

  const addFaq = () => {
    markUnsaved({
      ...faq,
      faqs: [...faqs, { q: "Nuova domanda", a: "Nuova risposta" }],
    });
  };

  const removeFaq = (i) => {
    markUnsaved({
      ...faq,
      faqs: faqs.filter((_, idx) => idx !== i),
    });
  };

  // SAVE: con error handling + upsert robusto
  const save = async () => {
    setErr("");
    setOk(false);
    setSaving(true);

    try {
      const payload = faq;

      const { error } = await supabaseAdmin
        .from(TABLE)
        .upsert(
          [
            {
              company_id: COMPANY_ID,
              payload,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "company_id" }
        );

      if (error) throw error;

      lastSavedRef.current = JSON.stringify(payload);
      setUnsaved(false);
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } catch (e) {
      setErr(e?.message || "Errore salvataggio FAQ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Sezione FAQ</div>
      <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
        {unsaved ? "● Modifiche non salvate" : "✓ Tutto salvato"}
      </div>

      {ok && <div style={okBox}>✅ Salvato! (visibile sul sito)</div>}
      {err && <div style={dangerBox}>{err}</div>}

      {loading ? (
        <div style={{ marginTop: 14, fontWeight: 900, color: "#0b1224" }}>Caricamento…</div>
      ) : (
        <>
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <input
              style={inputStyle}
              value={faq.title || ""}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Titolo sezione"
            />
          </div>

          <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>FAQ</div>

          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {faqs.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 18,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <input
                  style={inputStyle}
                  value={f.q || ""}
                  onChange={(e) => updateFaq(i, "q", e.target.value)}
                  placeholder="Domanda"
                />

                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontWeight: 750 }}
                  value={f.a || ""}
                  onChange={(e) => updateFaq(i, "a", e.target.value)}
                  placeholder="Risposta"
                />

                <button style={btn("danger")} onClick={() => removeFaq(i)} type="button" disabled={saving}>
                  Elimina
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button style={btn("soft")} onClick={addFaq} type="button" disabled={saving}>
              + Aggiungi FAQ
            </button>
          </div>

          <div style={{ marginTop: 20, fontWeight: 950, color: "#0b1224" }}>Call To Action</div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <input
              style={inputStyle}
              value={faq.ctaTitle || ""}
              onChange={(e) => setField("ctaTitle", e.target.value)}
              placeholder="Titolo CTA"
            />

            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
              value={faq.ctaText || ""}
              onChange={(e) => setField("ctaText", e.target.value)}
              placeholder="Testo CTA"
            />

            <input
              style={inputStyle}
              value={faq.ctaButton || ""}
              onChange={(e) => setField("ctaButton", e.target.value)}
              placeholder="Testo bottone"
            />
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btn("dark")} onClick={save} disabled={!unsaved || saving} type="button">
              {saving ? "Salvataggio..." : "Salva"}
            </button>

            <button style={btn("ghost")} onClick={load} disabled={saving} type="button">
              Ricarica dal DB
            </button>

            {!unsaved && (
              <div style={warnBox}>
                Se premi “Salva” senza modifiche non succede niente (è corretto).
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}