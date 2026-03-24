import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const TABLE = "certifications_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const DEFAULT_CERTIFICATIONS = {
  kicker: "SICUREZZA & QUALITÀ",
  title: "Tecnici certificati e lavori garantiti",
  lead:
    "Lavoriamo secondo normativa, con attenzione alla sicurezza e alla conformità dell’impianto.",
  cards: [
    {
      icon: "ShieldCheck",
      title: "Sicurezza",
      description:
        "Controlli accurati su componenti, tenute, pressione e funzionamento per ridurre rischi e guasti.",
    },
    {
      icon: "FileCheck2",
      title: "Conformità",
      description:
        "Supporto su controlli previsti e documentazione quando richiesta (es. verifiche, bollini, ecc.).",
    },
    {
      icon: "Wrench",
      title: "Garanzia lavori",
      description:
        "Interventi eseguiti con ricambi adeguati e procedure corrette: più durata, meno problemi.",
    },
    {
      icon: "BadgeCheck",
      title: "Affidabilità",
      description:
        "Puntualità, chiarezza e assistenza anche dopo l’intervento. Obiettivo: clienti soddisfatti.",
    },
  ],
};

const ICON_OPTIONS = [
  { key: "ShieldCheck", label: "Scudo sicurezza" },
  { key: "FileCheck2", label: "Documento conformità" },
  { key: "Wrench", label: "Chiave lavori" },
  { key: "BadgeCheck", label: "Badge affidabilità" },
];

export default function AdminCertifications() {
  const [data, setData] = useState(DEFAULT_CERTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const lastSavedRef = useRef(JSON.stringify(DEFAULT_CERTIFICATIONS));

  const cards = useMemo(
    () => (Array.isArray(data.cards) ? data.cards : []),
    [data.cards]
  );

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
    boxSizing: "border-box",
  };

  const btn = (variant = "dark") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 900,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      whiteSpace: "nowrap",
      minWidth: 0,
    };
    if (variant === "dark") {
      return {
        ...base,
        background: "#0b1224",
        color: "#fff",
        border: "1px solid #0b1224",
      };
    }
    if (variant === "ghost") {
      return { ...base, background: "#fff", color: "#0b1224" };
    }
    if (variant === "soft") {
      return {
        ...base,
        background: "#eef2ff",
        color: "#111827",
        border: "1px solid rgba(99,102,241,.25)",
      };
    }
    if (variant === "danger") {
      return {
        ...base,
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }
    return base;
  };

  const load = async () => {
    setErr("");
    setOk(false);
    setLoading(true);

    try {
      const { data: row, error } = await supabaseAdmin
        .from(TABLE)
        .select("payload, updated_at")
        .eq("company_id", COMPANY_ID)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const payload = row?.payload;
      const merged =
        payload && typeof payload === "object"
          ? { ...DEFAULT_CERTIFICATIONS, ...payload }
          : DEFAULT_CERTIFICATIONS;

      const safeMerged = {
        ...merged,
        cards:
          Array.isArray(merged.cards) && merged.cards.length
            ? merged.cards
            : DEFAULT_CERTIFICATIONS.cards,
      };

      setData(safeMerged);
      lastSavedRef.current = JSON.stringify(safeMerged);
      setUnsaved(false);
    } catch (e) {
      setErr(e?.message || "Errore caricamento sezione certificazioni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markUnsaved = (next) => {
    setData(next);
    setUnsaved(JSON.stringify(next) !== lastSavedRef.current);
  };

  const setField = (key, value) => {
    markUnsaved({ ...data, [key]: value });
  };

  const updateCard = (idx, patch) => {
    const nextCards = cards.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    markUnsaved({ ...data, cards: nextCards });
  };

  const addCard = () => {
    markUnsaved({
      ...data,
      cards: [
        ...cards,
        {
          icon: "ShieldCheck",
          title: "Nuova card",
          description: "Nuova descrizione",
        },
      ],
    });
  };

  const removeCard = (idx) => {
    markUnsaved({
      ...data,
      cards: cards.filter((_, i) => i !== idx),
    });
  };

  const save = async () => {
    setErr("");
    setOk(false);
    setSaving(true);

    try {
      const { error } = await supabaseAdmin.from(TABLE).upsert(
        [
          {
            company_id: COMPANY_ID,
            payload: data,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "company_id" }
      );

      if (error) throw error;

      lastSavedRef.current = JSON.stringify(data);
      setUnsaved(false);
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } catch (e) {
      setErr(e?.message || "Errore salvataggio sezione certificazioni");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adminCertRoot" style={cardStyle}>
      <style>{`
        .adminCertRoot,
        .adminCertRoot * {
          box-sizing: border-box;
        }

        .adminCertTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCertTopActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCertSectionHead {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCertCardsGrid {
          margin-top: 12px;
          display: grid;
          gap: 12px;
        }

        .adminCertCardBox {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 12px;
          display: grid;
          gap: 10px;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .adminCertRoot {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .adminCertTop {
            align-items: stretch !important;
          }

          .adminCertTopActions {
            width: 100%;
            align-items: stretch !important;
          }

          .adminCertTopActions > * {
            width: 100%;
          }

          .adminCertSectionHead {
            align-items: stretch !important;
          }

          .adminCertSectionHead > * {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .adminCertRoot {
            padding: 12px !important;
          }
        }
      `}</style>

      <div className="adminCertTop">
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
            Sezione “Sicurezza & Qualità”
          </div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Modifica i testi pubblici della sezione certificazioni.
          </div>
        </div>

        <div className="adminCertTopActions">
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

          <button style={btn("dark")} type="button" onClick={save} disabled={saving || !unsaved}>
            {saving ? "Salvataggio..." : "Salva"}
          </button>

          <button style={btn("ghost")} type="button" onClick={load} disabled={saving}>
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
        <div style={{ marginTop: 14, fontWeight: 900, color: "#0b1224" }}>
          Caricamento…
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 16,
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
                value={data.kicker || ""}
                onChange={(e) => setField("kicker", e.target.value)}
                placeholder="Kicker"
              />
              <input
                style={inputStyle}
                value={data.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Titolo"
              />
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                value={data.lead || ""}
                onChange={(e) => setField("lead", e.target.value)}
                placeholder="Sottotitolo / descrizione"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: "rgba(255,255,255,.9)",
              border: "1px solid rgba(15,23,42,0.10)",
              borderRadius: 22,
              padding: 16,
            }}
          >
            <div className="adminCertSectionHead">
              <div style={{ fontWeight: 950, color: "#0b1224" }}>Card sezione</div>
              <button style={btn("soft")} type="button" onClick={addCard} disabled={saving}>
                + Aggiungi card
              </button>
            </div>

            <div className="adminCertCardsGrid">
              {cards.map((card, idx) => (
                <div key={idx} className="adminCertCardBox">
                  <div style={{ display: "grid", gap: 10 }}>
                    <input
                      style={inputStyle}
                      value={card.title || ""}
                      onChange={(e) => updateCard(idx, { title: e.target.value })}
                      placeholder="Titolo card"
                    />

                    <select
                      style={inputStyle}
                      value={card.icon || "ShieldCheck"}
                      onChange={(e) => updateCard(idx, { icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <button
                      style={{ ...btn("danger"), width: "100%" }}
                      type="button"
                      onClick={() => removeCard(idx)}
                      disabled={saving}
                    >
                      Elimina
                    </button>
                  </div>

                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: 90,
                      resize: "vertical",
                      fontWeight: 750,
                    }}
                    value={card.description || ""}
                    onChange={(e) => updateCard(idx, { description: e.target.value })}
                    placeholder="Descrizione card"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}