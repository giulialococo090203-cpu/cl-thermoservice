import { BadgeCheck } from "lucide-react";
import Reveal from "./Reveal";

const brands = [
  "Vaillant",
  "Ariston",
  "Immergas",
  "Bosch",
  "Chaffoteaux",
  "Junkers",
];

export default function BrandsSection() {
  return (
    <section id="marchi" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div className="kicker">MARCHI TRATTATI</div>
          <h2 className="h2">Ricambi e assistenza sui principali brand</h2>
          <p className="lead">
            Gestiamo manutenzione e riparazioni su caldaie e impianti termici con ricambi compatibili e diagnosi accurata.
          </p>
        </div>

        <div className="brandGrid">
          {brands.map((b) => (
            <Reveal key={b}>
              <div className="brandCard">
                <div className="brandMark"><BadgeCheck size={20} /></div>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>{b}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}