import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { supabase } from "../supabaseClient"; // <-- verifica path: se il tuo supabaseClient è in src/supabaseClient

import {
  CheckCircle2,
  BadgeCheck,
  Timer,
  Shield,
} from "lucide-react";

// =====================
// CONFIG
// =====================

// ✅ metti qui la tabella reale (quella con company_id + payload)
const ABOUT_TABLE = "about_content";

// ✅ la tua azienda è sempre CL Thermoservice
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

// icone consentite per i “dati operativi”
const STAT_ICONS = {
  Timer,
  BadgeCheck,
  Shield,
};

// =====================
// DEFAULT (fallback)
// =====================
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

  // cards a destra (con icona)
  statCards: [
    { icon: "Timer", value: "Interventi rapidi", label: "Gestione urgenze e appuntamenti" },
    { icon: "BadgeCheck", value: "Garanzia lavori", label: "Procedure e ricambi adeguati" },
    { icon: "Shield", value: "Sicurezza", label: "Controlli e conformità impianto" },
  ],

  statsFooter:
    "Ogni intervento segue una checklist: diagnosi, spiegazione, esecuzione e verifica finale.",
};

function Stat({ icon: Icon, value, label }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.08)",
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.14)",
          flex: "0 0 auto",
        }}
      >
        <Icon size={20} />
      </div>

      <div>
        <div style={{ fontWeight: 950, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ opacity: 0.82, fontWeight: 650 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AboutSection() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from(ABOUT_TABLE)
          .select("payload, updated_at")
          .eq("company_id", COMPANY_ID)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        const payload = data?.payload || null;

        if (!alive) return;

        if (payload && typeof payload === "object") {
          // merge: payload sovrascrive i default
          setAbout((prev) => ({ ...prev, ...payload }));
        }
      } catch (e) {
        // Se RLS blocca o tabella errata: resta ai default (non pagina bianca)
        console.warn("AboutSection: fetch fallito:", e?.message || e);
      } finally {
        if (alive) setLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const points = useMemo(() => {
    const p = about?.points;
    return Array.isArray(p) && p.length ? p : DEFAULT_ABOUT.points;
  }, [about]);

  const statCards = useMemo(() => {
    const arr = about?.statCards;
    if (!Array.isArray(arr) || !arr.length) return DEFAULT_ABOUT.statCards;

    // normalizza icone
    return arr.map((c) => ({
      icon: STAT_ICONS[c?.icon] ? c.icon : "Timer",
      value: String(c?.value || ""),
      label: String(c?.label || ""),
    }));
  }, [about]);

  return (
    <section id="chi-siamo" className="section">
      <div className="container">
        <div
          className="card"
          style={{
            borderRadius: 28,
            padding: 22,
            background:
              "radial-gradient(1000px 420px at 10% 0%, rgba(31,75,143,.10), transparent 60%), rgba(255,255,255,.55)",
            border: "1px solid rgba(15,23,42,.06)",
          }}
        >
          <Reveal>
            <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "left" }}>
              <div className="kicker">{about.kicker || DEFAULT_ABOUT.kicker}</div>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                {about.title || DEFAULT_ABOUT.title}
              </h2>
              <p className="lead" style={{ marginTop: 0, maxWidth: 900 }}>
                {about.lead || DEFAULT_ABOUT.lead}
              </p>

              {/* opzionale: piccola spia debug (puoi togliere) */}
              {!loaded ? (
                <div style={{ marginTop: 8, color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                  Carico contenuti…
                </div>
              ) : null}
            </div>
          </Reveal>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "1.05fr .95fr",
              gap: 18,
              alignItems: "start",
              maxWidth: 1120,
              marginInline: "auto",
            }}
          >
            {/* SINISTRA */}
            <div>
              <Reveal>
                <div
                  className="card"
                  style={{
                    padding: 18,
                    borderRadius: 24,
                    background: "rgba(255,255,255,.82)",
                    border: "1px solid rgba(15,23,42,.08)",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em" }}>
                    {about.leftTitle || DEFAULT_ABOUT.leftTitle}
                  </div>

                  <p style={{ margin: "10px 0 0", color: "rgba(15,23,42,.72)", fontWeight: 600, lineHeight: 1.75 }}>
                    {about.leftBody || DEFAULT_ABOUT.leftBody}
                  </p>

                  <div
                    style={{
                      marginTop: 16,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {points.map((p) => (
                      <div
                        key={p}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          padding: "12px 12px",
                          borderRadius: 18,
                          border: "1px solid rgba(15,23,42,.08)",
                          background: "rgba(255,255,255,.90)",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 16,
                            display: "grid",
                            placeItems: "center",
                            background: "rgba(31,75,143,.10)",
                            border: "1px solid rgba(31,75,143,.16)",
                            flex: "0 0 auto",
                          }}
                        >
                          <CheckCircle2 size={20} />
                        </div>
                        <div style={{ fontWeight: 750, color: "rgba(15,23,42,.86)", lineHeight: 1.2 }}>{p}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* DESTRA */}
            <Reveal>
              <div
                style={{
                  borderRadius: 28,
                  padding: 22,
                  color: "white",
                  background:
                    "radial-gradient(700px 360px at 20% 15%, rgba(255,255,255,.12), transparent 60%), linear-gradient(135deg, rgba(155,44,42,.96), rgba(31,75,143,.96))",
                  boxShadow: "0 26px 70px rgba(2,6,23,.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 18, opacity: 0.92, letterSpacing: "-0.01em" }}>
                  {about.statsKicker || DEFAULT_ABOUT.statsKicker}
                </div>

                <div style={{ marginTop: 10, fontSize: 60, fontWeight: 950, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {about.statsValue || DEFAULT_ABOUT.statsValue}
                </div>
                <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 650 }}>
                  {about.statsLabel || DEFAULT_ABOUT.statsLabel}
                </div>

                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {statCards.map((c, idx) => {
                    const Icon = STAT_ICONS[c.icon] || Timer;
                    return <Stat key={idx} icon={Icon} value={c.value} label={c.label} />;
                  })}
                </div>

                <div style={{ marginTop: 16, opacity: 0.9, fontWeight: 650, lineHeight: 1.6 }}>
                  {about.statsFooter || DEFAULT_ABOUT.statsFooter}
                </div>
              </div>
            </Reveal>
          </div>

          <style>{`
            @media (max-width: 980px){
              #chi-siamo .card[style*="grid-template-columns"]{
                grid-template-columns: 1fr !important;
              }
              #chi-siamo div[style*="grid-template-columns: 1fr 1fr"]{
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}