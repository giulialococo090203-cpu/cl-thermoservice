import { ShieldCheck, FileCheck2, Wrench, BadgeCheck } from "lucide-react";
import Reveal from "./Reveal";

export default function CertificationsSection() {
  return (
    <section id="certificazioni" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">SICUREZZA & QUALITÀ</div>
          <h2 className="h2">Tecnici certificati e lavori garantiti</h2>
          <p className="lead">
            Lavoriamo secondo normativa, con attenzione alla sicurezza e alla conformità dell’impianto.
          </p>
        </div>

        <div className="container">
          <div className="grid2">
            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Sicurezza</div>
                  <p className="serviceDesc">
                    Controlli accurati su componenti, tenute, pressione e funzionamento per ridurre rischi e guasti.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Conformità</div>
                  <p className="serviceDesc">
                    Supporto su controlli previsti e documentazione quando richiesta (es. verifiche, bollini, ecc.).
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <Wrench size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Garanzia lavori</div>
                  <p className="serviceDesc">
                    Interventi eseguiti con ricambi adeguati e procedure corrette: più durata, meno problemi.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="card serviceCard">
                <div className="iconBox">
                  <BadgeCheck size={22} />
                </div>
                <div>
                  <div className="serviceTitle">Affidabilità</div>
                  <p className="serviceDesc">
                    Puntualità, chiarezza e assistenza anche dopo l’intervento. Obiettivo: clienti soddisfatti.
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