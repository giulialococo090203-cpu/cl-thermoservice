import Reveal from "./Reveal";
import { CheckCircle2, BadgeCheck, Timer, Shield } from "lucide-react";

const points = [
  "Tecnici qualificati e certificati",
  "Ricambi originali garantiti",
  "Interventi rapidi e puntuali",
  "Impiantistica civile e industriale",
  "Garanzia su tutti i lavori",
  "Progetti su larga scala",
];

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
        <div style={{ fontWeight: 950, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</div>
        <div style={{ opacity: 0.82, fontWeight: 650 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AboutSection() {
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
          {/* Header non centrato per variare */}
          <Reveal>
            <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "left" }}>
              <div className="kicker">CHI SIAMO</div>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                Affidabilità e competenza, dal primo intervento
              </h2>
              <p className="lead" style={{ marginTop: 0, maxWidth: 900 }}>
                Thermoservice è un riferimento per assistenza caldaie e impianti termici. Lavoriamo con procedure
                chiare, attenzione alla sicurezza e cura dei dettagli: meno sorprese, più controllo e qualità.
              </p>
            </div>
          </Reveal>

          {/* 2 colonne: testo + punti / stats */}
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
            {/* Colonna sinistra: narrative + points */}
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
                    Un approccio ordinato e professionale
                  </div>
                  <p style={{ margin: "10px 0 0", color: "rgba(15,23,42,.72)", fontWeight: 600, lineHeight: 1.75 }}>
                    Prima ascoltiamo, poi analizziamo e infine interveniamo. Quando possibile, ti spieghiamo le opzioni
                    e i costi in modo semplice: l’obiettivo è risolvere bene al primo colpo.
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

            {/* Colonna destra: stats premium separata */}
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
                  Dati operativi
                </div>

                <div style={{ marginTop: 10, fontSize: 60, fontWeight: 950, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  10+
                </div>
                <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 650 }}>
                  Anni di esperienza sul territorio
                </div>

                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  <Stat icon={Timer} value="Interventi rapidi" label="Gestione urgenze e appuntamenti" />
                  <Stat icon={BadgeCheck} value="Garanzia lavori" label="Procedure e ricambi adeguati" />
                  <Stat icon={Shield} value="Sicurezza" label="Controlli e conformità impianto" />
                </div>

                <div style={{ marginTop: 16, opacity: 0.9, fontWeight: 650, lineHeight: 1.6 }}>
                  Ogni intervento segue una checklist: diagnosi, spiegazione, esecuzione e verifica finale.
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