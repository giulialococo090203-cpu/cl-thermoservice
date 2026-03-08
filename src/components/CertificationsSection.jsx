import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, FileCheck2, Wrench, BadgeCheck } from "lucide-react";
import Reveal from "./Reveal";
import { supabase } from "../supabaseClient";

const TABLE = "certifications_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const ICONS = {
  ShieldCheck,
  FileCheck2,
  Wrench,
  BadgeCheck,
};

const DEFAULT_CERTIFICATIONS = {
  kicker: "SICUREZZA & QUALITÀ",
  title: "Tecnici certificati e lavori garantiti",
  lead:
    "Lavoriamo secondo normativa, con attenzione alla sicurezza e alla conformità dell’impianto.",
  cards: [
    {
      icon: "ShieldCheck",
      title: "Sicurezza",
      description:
        "Controlli accurati su componenti, tenute, pressione e funzionamento per ridurre rischi e guasti.",
    },
    {
      icon: "FileCheck2",
      title: "Conformità",
      description:
        "Supporto su controlli previsti e documentazione quando richiesta (es. verifiche, bollini, ecc.).",
    },
    {
      icon: "Wrench",
      title: "Garanzia lavori",
      description:
        "Interventi eseguiti con ricambi adeguati e procedure corrette: più durata, meno problemi.",
    },
    {
      icon: "BadgeCheck",
      title: "Affidabilità",
      description:
        "Puntualità, chiarezza e assistenza anche dopo l’intervento. Obiettivo: clienti soddisfatti.",
    },
  ],
};

export default function CertificationsSection() {
  const [data, setData] = useState(DEFAULT_CERTIFICATIONS);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data: row, error } = await supabase
          .from(TABLE)
          .select("payload, updated_at")
          .eq("company_id", COMPANY_ID)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        const payload = row?.payload;
        const merged =
          payload && typeof payload === "object"
            ? { ...DEFAULT_CERTIFICATIONS, ...payload }
            : DEFAULT_CERTIFICATIONS;

        const safeMerged = {
          ...merged,
          cards:
            Array.isArray(merged.cards) && merged.cards.length
              ? merged.cards
              : DEFAULT_CERTIFICATIONS.cards,
        };

        if (alive) setData(safeMerged);
      } catch (e) {
        console.warn("CertificationsSection: fetch fallito:", e?.message || e);
        if (alive) setData(DEFAULT_CERTIFICATIONS);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(() => {
    return Array.isArray(data.cards) && data.cards.length
      ? data.cards
      : DEFAULT_CERTIFICATIONS.cards;
  }, [data.cards]);

  return (
    <section id="certificazioni" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">{data.kicker || DEFAULT_CERTIFICATIONS.kicker}</div>
          <h2 className="h2">{data.title || DEFAULT_CERTIFICATIONS.title}</h2>
          <p className="lead">{data.lead || DEFAULT_CERTIFICATIONS.lead}</p>
        </div>

        <div className="container">
          <div className="grid2">
            {cards.map((card, idx) => {
              const Icon = ICONS[card?.icon] || ShieldCheck;

              return (
                <Reveal key={`${card?.title || "card"}-${idx}`}>
                  <div className="card serviceCard">
                    <div className="iconBox">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="serviceTitle">{card?.title || "Titolo"}</div>
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