import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

// === CONFIG ===
const ABOUT_TABLE = "about_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486"; // Thermoservice fisso

const DEFAULT_ABOUT = {
  kicker: "CHI SIAMO",
  title: "Affidabilità e competenza, dal primo intervento",
  lead:
    "Thermoservice è un riferimento per assistenza caldaie e impianti termici. Lavoriamo con procedure chiare, attenzione alla sicurezza e cura dei dettagli: meno sorprese, più controllo e qualità.",

  leftTitle: "Un approccio ordinato e professionale",
  leftBody:
    "Prima ascoltiamo, poi analizziamo e infine interveniamo. Quando possibile, ti spieghiamo le opzioni e i costi in modo semplice: l’obiettivo è risolvere bene al primo colpo.",

  points: [
    "Tecnici qualificati e certificati",
    "Ricambi originali garantiti",
    "Interventi rapidi e puntuali",
    "Impiantistica civile e industriale",
    "Garanzia su tutti i lavori",
    "Progetti su larga scala",
  ],

  statsKicker: "Dati operativi",
  statsValue: "10+",
  statsLabel: "Anni di esperienza sul territorio",
  statsFooter:
    "Ogni intervento segue una checklist: diagnosi, spiegazione, esecuzione e verifica finale.",

  statCards: [
    { icon: "Timer", value: "Interventi rapidi", label: "Gestione urgenze e appuntamenti" },
    { icon: "BadgeCheck", value: "Garanzia lavori", label: "Procedure e ricambi adeguati" },
    { icon: "Shield", value: "Sicurezza", label: "Controlli e conformità impianto" },
  ],
};

const ICON_OPTIONS = [
  { key: "Timer", label: "Timer (orologio)" },
  { key: "BadgeCheck", label: "Badge (certificazione)" },
  { key: "Shield", label: "Scudo (sicurezza)" },
];

export default function AdminAbout() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  // ✅ payload completo
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  // ✅ spia modifiche non salvate
  const [unsaved, setUnsaved] = useState(false);

  // snapshot ultimo salvataggio
  const lastSavedRef = useRef(JSON.stringify(DEFAULT_ABOUT));

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

  // ---------- LOAD
  const loadAbout = async () => {
    setErr("");
    setOk(false);
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from(ABOUT_TABLE)
        .select("payload, updated_at")
        .eq("company_id", COMPANY_ID)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const payload = data?.payload;
      const merged = payload && typeof payload === "object" ? { ...DEFAULT_ABOUT, ...payload } : DEFAULT_ABOUT;

      setAbout(merged);
      lastSavedRef.current = JSON.stringify(merged);
      setUnsaved(false);
    } catch (e) {
      setErr(e?.message || "Errore caricamento contenuti About");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- SAVE (manuale)
  const saveAbout = async () => {
    setErr("");
    setOk(false);
    setSaving(true);

    try {
      const payload = about;

      const { error } = await supabaseAdmin.from(ABOUT_TABLE).upsert(
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
      setErr(e?.message || "Errore salvataggio contenuti About");
    } finally {
      setSaving(false);
    }
  };

  // ---------- CHANGE (senza autosave)
  const markUnsavedIfNeeded = (next) => {
    const snap = JSON.stringify(next);
    setUnsaved(snap !== lastSavedRef.current);
  };

  const setField = (key, value) => {
    setAbout((prev) => {
      const next = { ...prev, [key]: value };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const points = useMemo(() => (Array.isArray(about.points) ? about.points : []), [about.points]);
  const statCards = useMemo(() => (Array.isArray(about.statCards) ? about.statCards : []), [about.statCards]);

  const addPoint = () => {
    setAbout((prev) => {
      const next = { ...prev, points: [...points, "Nuovo punto"] };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const updatePoint = (idx, value) => {
    setAbout((prev) => {
      const nextPoints = points.map((p, i) => (i === idx ? value : p));
      const next = { ...prev, points: nextPoints };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const removePoint = (idx) => {
    setAbout((prev) => {
      const nextPoints = points.filter((_, i) => i !== idx);
      const next = { ...prev, points: nextPoints };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const addStatCard = () => {
    setAbout((prev) => {
      const next = {
        ...prev,
        statCards: [...statCards, { icon: "Timer", value: "Nuova voce", label: "Descrizione voce" }],
      };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const updateStatCard = (idx, patch) => {
    setAbout((prev) => {
      const nextCards = statCards.map((c, i) => (i === idx ? { ...c, ...patch } : c));
      const next = { ...prev, statCards: nextCards };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  const removeStatCard = (idx) => {
    setAbout((prev) => {
      const nextCards = statCards.filter((_, i) => i !== idx);
      const next = { ...prev, statCards: nextCards };
      markUnsavedIfNeeded(next);
      return next;
    });
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Sezione “Chi siamo” (About)</div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Modifichi qui → poi premi <b>Salva</b> per pubblicare.
          </div>
        </div>

        {/* spia + bottoni */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              fontWeight: 950,
              border: "1px solid rgba(15,23,42,0.12)",
              background: unsaved ? "#fff7ed" : "#ecfdf5",
              color: unsaved ? "#9a3412" : "#065f46",
            }}
          >
            {unsaved ? "● Modifiche non salvate" : "✓ Tutto salvato"}
          </div>

          <button style={btn("dark")} type="button" onClick={saveAbout} disabled={saving || !unsaved}>
            {saving ? "Salvataggio…" : "Salva"}
          </button>

          <button style={btn("ghost")} type="button" onClick={loadAbout} disabled={saving}>
            Ricarica dal DB
          </button>
        </div>
      </div>

      {ok && (
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
          ✅ Salvato!
        </div>
      )}

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
        <div style={{ marginTop: 14, fontWeight: 900, color: "#0b1224" }}>Caricamento…</div>
      ) : (
        <>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* SINISTRA */}
            <div
              style={{
                background: "rgba(255,255,255,.9)",
                border: "1px solid rgba(15,23,42,0.10)",
                borderRadius: 22,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 950, color: "#0b1224" }}>Testi principali</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <input
                  style={inputStyle}
                  value={about.kicker || ""}
                  onChange={(e) => setField("kicker", e.target.value)}
                  placeholder="Kicker (es. CHI SIAMO)"
                />
                <input
                  style={inputStyle}
                  value={about.title || ""}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Titolo"
                />
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                  value={about.lead || ""}
                  onChange={(e) => setField("lead", e.target.value)}
                  placeholder="Testo introduttivo"
                />
              </div>

              <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>Colonna sinistra</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <input
                  style={inputStyle}
                  value={about.leftTitle || ""}
                  onChange={(e) => setField("leftTitle", e.target.value)}
                  placeholder="Titolo box sinistro"
                />
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                  value={about.leftBody || ""}
                  onChange={(e) => setField("leftBody", e.target.value)}
                  placeholder="Testo box sinistro"
                />
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950, color: "#0b1224" }}>Riquadri (punti)</div>
                <button style={btn("soft")} type="button" onClick={addPoint} disabled={saving}>
                  + Aggiungi riquadro
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {points.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px",
                      gap: 10,
                      alignItems: "center",
                      background: "#fff",
                      border: "1px solid rgba(15,23,42,0.10)",
                      borderRadius: 18,
                      padding: 10,
                    }}
                  >
                    <input
                      style={inputStyle}
                      value={p}
                      onChange={(e) => updatePoint(idx, e.target.value)}
                      placeholder="Testo riquadro"
                    />
                    <button style={btn("danger")} type="button" onClick={() => removePoint(idx)} disabled={saving}>
                      Elimina
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* DESTRA */}
            <div
              style={{
                background: "rgba(255,255,255,.9)",
                border: "1px solid rgba(15,23,42,0.10)",
                borderRadius: 22,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 950, color: "#0b1224" }}>Box destro (Dati operativi)</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <input
                  style={inputStyle}
                  value={about.statsKicker || ""}
                  onChange={(e) => setField("statsKicker", e.target.value)}
                  placeholder="Titolo box (es. Dati operativi)"
                />

                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
                  <input
                    style={inputStyle}
                    value={about.statsValue || ""}
                    onChange={(e) => setField("statsValue", e.target.value)}
                    placeholder="Valore (es. 10+)"
                  />
                  <input
                    style={inputStyle}
                    value={about.statsLabel || ""}
                    onChange={(e) => setField("statsLabel", e.target.value)}
                    placeholder="Etichetta (es. Anni di esperienza...)"
                  />
                </div>

                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                  value={about.statsFooter || ""}
                  onChange={(e) => setField("statsFooter", e.target.value)}
                  placeholder="Testo finale box"
                />
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950, color: "#0b1224" }}>Voci box destro</div>
                <button style={btn("soft")} type="button" onClick={addStatCard} disabled={saving}>
                  + Aggiungi voce
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                {statCards.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(15,23,42,0.10)",
                      borderRadius: 18,
                      padding: 10,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
                      <input
                        style={inputStyle}
                        value={c?.value || ""}
                        onChange={(e) => updateStatCard(idx, { value: e.target.value })}
                        placeholder="Titolo voce (es. Interventi rapidi)"
                      />

                      <button style={btn("danger")} type="button" onClick={() => removeStatCard(idx)} disabled={saving}>
                        Elimina
                      </button>
                    </div>

                    <input
                      style={inputStyle}
                      value={c?.label || ""}
                      onChange={(e) => updateStatCard(idx, { label: e.target.value })}
                      placeholder="Descrizione voce"
                    />

                    <select
                      style={inputStyle}
                      value={c?.icon || "Timer"}
                      onChange={(e) => updateStatCard(idx, { icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 980px){
              div[style*="grid-template-columns: 1.1fr .9fr"]{
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}