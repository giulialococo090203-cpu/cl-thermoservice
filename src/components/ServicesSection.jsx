import Reveal from "./Reveal";
import { Wrench, Thermometer, ShieldCheck, Droplets, Snowflake, Zap } from "lucide-react";

const services = [
  {
    key: "installazione",
    icon: Zap,
    title: "Installazione caldaie",
    desc: "Installazione di caldaie ad alta efficienza con configurazione corretta e collaudo.",
    highlight: true,
    bullets: ["Sopralluogo e configurazione", "Collaudo e messa in servizio", "Consigli su consumi e uso"],
  },
  {
    key: "riparazione",
    icon: Wrench,
    title: "Riparazione caldaie",
    desc: "Interventi rapidi per guasti e blocchi. Diagnosi immediata e ripristino in sicurezza.",
  },
  {
    key: "manutenzione",
    icon: Thermometer,
    title: "Manutenzione ordinaria",
    desc: "Controlli periodici per efficienza, sicurezza e risparmio energetico.",
  },
  {
    key: "fumi",
    icon: ShieldCheck,
    title: "Controllo fumi",
    desc: "Analisi emissioni e supporto per verifiche previste dalla normativa.",
  },
  {
    key: "idraulica",
    icon: Droplets,
    title: "Impianti idraulici",
    desc: "Installazione e manutenzione di impianti idraulici civili e industriali.",
  },
  {
    key: "clima",
    icon: Snowflake,
    title: "Climatizzazione",
    desc: "Installazione e assistenza su impianti di climatizzazione e condizionamento.",
  },
];

function MiniChip({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,.10)",
        background: "rgba(255,255,255,.85)",
        fontWeight: 750,
        color: "rgba(15,23,42,.78)",
        fontSize: 13,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </span>
  );
}

export default function ServicesSection() {
  const featured = services.find((s) => s.highlight);
  const rest = services.filter((s) => !s.highlight);

  return (
    <section id="servizi" className="section">
      <div className="container">
        {/* Header meno “centrato uguale a tutto” */}
        <Reveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "flex-end",
              flexWrap: "wrap",
              maxWidth: 1120,
              margin: "0 auto",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div className="kicker">SERVIZI</div>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                Soluzioni complete per comfort e sicurezza
              </h2>
              <p className="lead" style={{ marginTop: 0 }}>
                Assistenza, installazione e manutenzione per impianti termici e idraulici. Lavoriamo con metodo,
                puntualità e attenzione ai dettagli.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <MiniChip>Interventi su appuntamento</MiniChip>
              <MiniChip>Trasparenza sui costi</MiniChip>
              <MiniChip>Ricambi e collaudo</MiniChip>
            </div>
          </div>
        </Reveal>

        {/* Layout “premium”: featured grande + griglia compatta */}
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 18 }}>
          {/* Featured */}
          <Reveal>
            <div
              className="card cardHover"
              style={{
                padding: 22,
                borderRadius: 26,
                background:
                  "radial-gradient(900px 320px at 18% 0%, rgba(31,75,143,.12), transparent 60%), rgba(255,255,255,.92)",
                border: "1px solid rgba(15,23,42,.10)",
                boxShadow: "0 18px 60px rgba(15,23,42,.10)",
                minHeight: 260,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="iconBox" style={{ width: 62, height: 62, borderRadius: 20 }}>
                    <featured.icon size={24} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 26,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        marginTop: 2,
                      }}
                    >
                      {featured.title}
                    </div>

                    <div style={{ marginTop: 10, color: "rgba(15,23,42,.74)", fontWeight: 600, lineHeight: 1.65 }}>
                      {featured.desc}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(229,57,53,.18)",
                    background: "rgba(229,57,53,.08)",
                    color: "rgba(15,23,42,.86)",
                    fontWeight: 800,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  Servizio richiesto
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                {featured.bullets.map((b) => (
                  <div
                    key={b}
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(15,23,42,.08)",
                      background: "rgba(255,255,255,.86)",
                      padding: "12px 12px",
                      fontWeight: 700,
                      color: "rgba(15,23,42,.78)",
                      lineHeight: 1.35,
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  className="btnAnim"
                  href="#preventivo"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: "#0b1220",
                    color: "white",
                    fontWeight: 900,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  Richiedi preventivo
                </a>

                <a
                  className="btnAnim"
                  href="#contatti"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.92)",
                    color: "#0b1220",
                    fontWeight: 900,
                    textDecoration: "none",
                    border: "1px solid rgba(15,23,42,.10)",
                  }}
                >
                  Contattaci
                </a>
              </div>
            </div>
          </Reveal>

          {/* Rest */}
          <div style={{ display: "grid", gap: 12 }}>
            {rest.map((s) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.key}>
                  <div
                    className="card serviceCard cardHover"
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      alignItems: "center",
                      background: "rgba(255,255,255,.92)",
                    }}
                  >
                    <div className="iconBox" style={{ width: 54, height: 54, borderRadius: 18 }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em" }}>{s.title}</div>
                      <p style={{ margin: "8px 0 0", color: "rgba(15,23,42,.72)", fontWeight: 600, lineHeight: 1.6 }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <style>{`
          @media (max-width: 980px){
            #servizi > div > div:nth-of-type(2){
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 720px){
            #servizi div[style*="grid-template-columns: 1fr 1fr 1fr"]{
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}