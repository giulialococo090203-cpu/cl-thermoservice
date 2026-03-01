import { MapPin, Clock, Zap, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

export default function CoverageSection() {
  return (
    <section id="zona" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">ZONA DI COPERTURA</div>
          <h2 className="h2">Interventi rapidi a Palermo e provincia</h2>
          <p className="lead">
            Operiamo con tecnici qualificati e disponibilità per urgenze. Ti diciamo subito tempi e costi.
          </p>
        </div>

        <div className="container">
          <div className="grid2">
            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Copertura</div>
                  <p className="serviceDesc">
                    Palermo città e principali zone della provincia. Interventi a domicilio su appuntamento.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Orari</div>
                  <p className="serviceDesc">
                    Lun–Ven 8:00–18:00 · Sab 8:00–13:00. Per urgenze, contattaci: valuteremo la priorità.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Urgenze</div>
                  <p className="serviceDesc">
                    Se la caldaia è ferma o perde acqua, chiama subito: riduciamo i tempi con diagnosi rapida.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Preventivo chiaro</div>
                  <p className="serviceDesc">
                    Prima dell’intervento ti spieghiamo la soluzione e i costi. Trasparenza e garanzia lavori.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}