import Reveal from "./Reveal";
import { Wrench, Thermometer, ShieldCheck, Droplets, Snowflake, Zap } from "lucide-react";

const services = [
  {
    icon: <Wrench size={22} />,
    title: "Riparazione Caldaie",
    desc: "Interventi rapidi per guasti e blocchi. Diagnosi immediata e ripristino in sicurezza.",
  },
  {
    icon: <Thermometer size={22} />,
    title: "Manutenzione Ordinaria",
    desc: "Controlli periodici per efficienza, sicurezza e risparmio energetico.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Controllo Fumi",
    desc: "Analisi emissioni e supporto per verifiche previste dalla normativa.",
  },
  {
    icon: <Droplets size={22} />,
    title: "Impianti Idraulici",
    desc: "Installazione e manutenzione di impianti idraulici civili e industriali.",
  },
  {
    icon: <Zap size={22} />,
    title: "Installazione Caldaie",
    desc: "Installazione di caldaie a condensazione ad alta efficienza con configurazione corretta.",
  },
  {
    icon: <Snowflake size={22} />,
    title: "Climatizzazione",
    desc: "Installazione e assistenza su impianti di climatizzazione e condizionamento.",
  },
];

export default function ServicesSection() {
  return (
    <section id="servizi" className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">I NOSTRI SERVIZI</div>
            <h2 className="h2">Soluzioni complete per il tuo comfort</h2>
            <p className="lead">
              Offriamo una gamma completa di servizi per impianti termici e idraulici,
              con professionalità e puntualità.
            </p>
          </div>
        </Reveal>

        <div className="grid2" style={{ marginTop: 26 }}>
          {services.map((s) => (
            <Reveal key={s.title}>
              <div className="card serviceCard cardHover">
                <div className="iconBox">{s.icon}</div>
                <div>
                  <div className="serviceTitle">{s.title}</div>
                  <p className="serviceDesc">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}