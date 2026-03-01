import Reveal from "./Reveal";
import { CheckCircle2 } from "lucide-react";

const points = [
  "Tecnici qualificati e certificati",
  "Ricambi originali garantiti",
  "Interventi rapidi e puntuali",
  "Impiantistica civile e industriale",
  "Garanzia su tutti i lavori",
  "Progetti su larga scala",
];

export default function AboutSection() {
  return (
    <section id="chi-siamo" className="section">
      <div className="container softPanel">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">CHI SIAMO</div>
            <h2 className="h2">Affidabilità e competenza dal primo intervento</h2>
            <p className="lead">
              CL Thermoservice è il tuo punto di riferimento per l'assistenza caldaie e impianti termici.
              Con anni di esperienza nel settore, garantiamo interventi professionali e tempestivi.
            </p>
          </div>
        </Reveal>

        <div className="container" style={{ paddingTop: 10 }}>
          <div className="grid2">
            {points.map((p) => (
              <Reveal key={p}>
                <div
                  className="card cardHover"
                  style={{
                    padding: 18,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(229,57,53,0.10)",
                      border: "1px solid rgba(229,57,53,0.18)",
                    }}
                  >
                    <CheckCircle2 size={22} />
                  </div>
                  <div style={{ fontWeight: 950 }}>{p}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div
              style={{
                marginTop: 24,
                borderRadius: 28,
                padding: "34px 28px",
                color: "white",
                background:
                  "linear-gradient(135deg, #9b2c2a 0%, #1f4b8f 100%)",
                boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 1000, lineHeight: 1 }}>
                10+
              </div>
              <div style={{ opacity: 0.9, fontWeight: 900, marginTop: 6 }}>
                Anni di esperienza
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 22,
                  flexWrap: "wrap",
                  opacity: 0.95,
                  fontWeight: 850,
                }}
              >
                <div>
                  <div style={{ fontSize: 30, fontWeight: 1000 }}>500+</div>
                  <div>Clienti soddisfatti</div>
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 1000 }}>1000+</div>
                  <div>Interventi effettuati</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}