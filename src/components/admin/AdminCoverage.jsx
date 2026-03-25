import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const TABLE = "coverage_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const DEFAULT_COVERAGE = {
  kicker: "ZONA COPERTURA",
  title: "Operiamo a Palermo e provincia",
  lead:
    "Interveniamo su appuntamento in diverse aree del territorio, con organizzazione chiara.",

  areas: [
    "Palermo",
    "Bagheria",
    "Monreale",
    "Villabate",
    "Misilmeri",
    "Carini",
    "Capaci",
    "Isola delle Femmine",
  ],

  extra_text: "Se la tua zona non è nell’elenco, contattaci comunque.",

  cards: [],
};

export default function AdminCoverage() {
  const [coverage, setCoverage] = useState(DEFAULT_COVERAGE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const lastSavedRef = useRef(JSON.stringify(DEFAULT_COVERAGE));

  const areas = useMemo(
    () => (Array.isArray(coverage.areas) ? coverage.areas : []),
    [coverage.areas]
  );

  const cards = useMemo(
    () => (Array.isArray(coverage.cards) ? coverage.cards : []),
    [coverage.cards]
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
    minWidth: 0,
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

  const markUnsaved = (next) => {
    setCoverage(next);
    setUnsaved(JSON.stringify(next) !== lastSavedRef.current);
  };

  const setField = (key, value) => {
    markUnsaved({ ...coverage, [key]: value });
  };

  const updateArea = (idx, value) => {
    const next = areas.map((item, i) => (i === idx ? value : item));
    markUnsaved({ ...coverage, areas: next });
  };

  const addArea = () => {
    markUnsaved({
      ...coverage,
      areas: [...areas, "Nuova zona"],
    });
  };

  const removeArea = (idx) => {
    markUnsaved({
      ...coverage,
      areas: areas.filter((_, i) => i !== idx),
    });
  };

  const updateCard = (idx, patch) => {
    const next = cards.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    markUnsaved({ ...coverage, cards: next });
  };

  const addCard = () => {
    markUnsaved({
      ...coverage,
      cards: [
        ...cards,
        {
          title: "Nuova card",
          description: "Nuova descrizione",
        },
      ],
    });
  };

  const removeCard = (idx) => {
    markUnsaved({
      ...coverage,
      cards: cards.filter((_, i) => i !== idx),
    });
  };

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
      const merged =
        payload && typeof payload === "object"
          ? { ...DEFAULT_COVERAGE, ...payload }
          : DEFAULT_COVERAGE;

      const safeMerged = {
        ...merged,
        areas:
          Array.isArray(merged.areas) && merged.areas.length
            ? merged.areas
            : DEFAULT_COVERAGE.areas,
        cards:
          Array.isArray(merged.cards)
            ? merged.cards
            : DEFAULT_COVERAGE.cards,
      };

      setCoverage(safeMerged);
      lastSavedRef.current = JSON.stringify(safeMerged);
      setUnsaved(false);
    } catch (e) {
      setErr(e?.message || "Errore caricamento sezione copertura");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setErr("");
    setOk(false);
    setSaving(true);

    try {
      const payload = coverage;

      const { error } = await supabaseAdmin.from(TABLE).upsert(
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
      setErr(e?.message || "Errore salvataggio sezione copertura");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adminCoverageRoot" style={cardStyle}>
      <style>{`
        .adminCoverageRoot,
        .adminCoverageRoot * {
          box-sizing: border-box;
        }

        .adminCoverageTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCoverageTopActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCoverageSectionHead {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminCoverageList {
          margin-top: 12px;
          display: grid;
          gap: 12px;
        }

        .adminCoverageItemBox {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 12px;
          display: grid;
          gap: 10px;
          overflow: hidden;
        }

        .adminCoverageAreaRow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 140px;
          gap: 10px;
          align-items: center;
        }

        .adminCoverageCardRow {
          display: grid;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .adminCoverageRoot {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .adminCoverageTop {
            align-items: stretch !important;
          }

          .adminCoverageTopActions {
            width: 100%;
            align-items: stretch !important;
          }

          .adminCoverageTopActions > * {
            width: 100%;
          }

          .adminCoverageSectionHead {
            align-items: stretch !important;
          }

          .adminCoverageSectionHead > * {
            width: 100%;
          }

          .adminCoverageAreaRow {
            grid-template-columns: 1fr !important;
          }

          .adminCoverageAreaRow > * {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .adminCoverageRoot {
            padding: 12px !important;
          }
        }
      `}</style>

      <div className="adminCoverageTop">
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
            Sezione “Zona di copertura”
          </div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Gestisci titolo, testo, zone, testo extra e card.
          </div>
        </div>

        <div className="adminCoverageTopActions">
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
                value={coverage.kicker || ""}
                onChange={(e) => setField("kicker", e.target.value)}
                placeholder="Kicker"
              />

              <input
                style={inputStyle}
                value={coverage.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Titolo"
              />

              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                value={coverage.lead || ""}
                onChange={(e) => setField("lead", e.target.value)}
                placeholder="Testo introduttivo"
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
            <div className="adminCoverageSectionHead">
              <div style={{ fontWeight: 950, color: "#0b1224" }}>Zone servite</div>
              <button style={btn("soft")} type="button" onClick={addArea} disabled={saving}>
                + Aggiungi zona
              </button>
            </div>

            <div className="adminCoverageList">
              {areas.map((area, idx) => (
                <div key={idx} className="adminCoverageItemBox">
                  <div className="adminCoverageAreaRow">
                    <input
                      style={inputStyle}
                      value={area || ""}
                      onChange={(e) => updateArea(idx, e.target.value)}
                      placeholder="Nome zona"
                    />

                    <button
                      style={btn("danger")}
                      type="button"
                      onClick={() => removeArea(idx)}
                      disabled={saving}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontWeight: 750 }}
                value={coverage.extra_text || ""}
                onChange={(e) => setField("extra_text", e.target.value)}
                placeholder="Casella di testo facoltativa"
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
            <div className="adminCoverageSectionHead">
              <div style={{ fontWeight: 950, color: "#0b1224" }}>Card informative</div>
              <button style={btn("soft")} type="button" onClick={addCard} disabled={saving}>
                + Aggiungi card
              </button>
            </div>

            <div className="adminCoverageList">
              {cards.map((card, idx) => (
                <div key={idx} className="adminCoverageItemBox">
                  <div className="adminCoverageCardRow">
                    <input
                      style={inputStyle}
                      value={card.title || ""}
                      onChange={(e) => updateCard(idx, { title: e.target.value })}
                      placeholder="Titolo card"
                    />

                    <textarea
                      style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontWeight: 750 }}
                      value={card.description || ""}
                      onChange={(e) => updateCard(idx, { description: e.target.value })}
                      placeholder="Descrizione card"
                    />

                    <button
                      style={btn("danger")}
                      type="button"
                      onClick={() => removeCard(idx)}
                      disabled={saving}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}