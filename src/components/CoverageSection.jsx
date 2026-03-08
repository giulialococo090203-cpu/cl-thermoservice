import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Zap, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";
import { supabase } from "../supabaseClient";

const TABLE = "coverage_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const ICONS = {
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
};

const DEFAULT_COVERAGE = {
  kicker: "ZONA DI COPERTURA",
  title: "Interventi rapidi a Palermo e provincia",
  lead:
    "Operiamo con tecnici qualificati e disponibilità per urgenze. Ti diciamo subito tempi e costi.",
  cards: [
    {
      icon: "MapPin",
      title: "Copertura",
      description:
        "Palermo città e principali zone della provincia. Interventi a domicilio su appuntamento.",
    },
    {
      icon: "Clock",
      title: "Orari",
      description:
        "Lun–Ven 8:00–18:00 · Sab 8:00–13:00. Per urgenze, contattaci: valuteremo la priorità.",
    },
    {
      icon: "Zap",
      title: "Urgenze",
      description:
        "Se la caldaia è ferma o perde acqua, chiama subito: riduciamo i tempi con diagnosi rapida.",
    },
    {
      icon: "CheckCircle2",
      title: "Preventivo chiaro",
      description:
        "Prima dell’intervento ti spieghiamo la soluzione e i costi. Trasparenza e garanzia lavori.",
    },
  ],
};

export default function CoverageSection() {
  const [coverage, setCoverage] = useState(DEFAULT_COVERAGE);

  useEffect(() => {
    let alive = true;

    const loadCoverage = async () => {
      try {
        const { data, error } = await supabase
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
          cards:
            Array.isArray(merged.cards) && merged.cards.length
              ? merged.cards
              : DEFAULT_COVERAGE.cards,
        };

        if (alive) setCoverage(safeMerged);
      } catch (e) {
        console.warn("CoverageSection: fetch fallito:", e?.message || e);
        if (alive) setCoverage(DEFAULT_COVERAGE);
      }
    };

    loadCoverage();

    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(() => {
    return Array.isArray(coverage.cards) && coverage.cards.length
      ? coverage.cards
      : DEFAULT_COVERAGE.cards;
  }, [coverage.cards]);

  return (
    <section id="zona" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">{coverage.kicker || DEFAULT_COVERAGE.kicker}</div>
          <h2 className="h2">{coverage.title || DEFAULT_COVERAGE.title}</h2>
          <p className="lead">
            {coverage.lead || DEFAULT_COVERAGE.lead}
          </p>
        </div>

        <div className="container">
          <div className="grid2">
            {cards.map((card, idx) => {
              const Icon = ICONS[card?.icon] || MapPin;

              return (
                <Reveal key={`${card?.title || "card"}-${idx}`}>
                  <div className="card serviceCard">
                    <div className="iconBox">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="serviceTitle">
                        {card?.title || "Titolo"}
                      </div>
                      <p className="serviceDesc">
                        {card?.description || "Descrizione"}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}