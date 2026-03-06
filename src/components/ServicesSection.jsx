import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { supabase } from "../supabaseClient";
import {
  Wrench,
  Thermometer,
  ShieldCheck,
  Droplets,
  Snowflake,
  Zap,
  Flame,
  Settings,
  Hammer,
  Fan,
  Droplet,
  Gauge,
} from "lucide-react";

const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const ICONS = {
  Wrench,
  Thermometer,
  ShieldCheck,
  Droplets,
  Snowflake,
  Zap,
  Flame,
  Settings,
  Hammer,
  Fan,
  Droplet,
  Gauge,
};

const FALLBACK = [
  {
    id: "fallback-1",
    title: "Installazione caldaie",
    description:
      "Installazione di caldaie ad alta efficienza con configurazione corretta e collaudo.",
    icon: "Zap",
    pill: "Servizio richiesto",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "fallback-2",
    title: "Riparazione caldaie",
    description:
      "Interventi rapidi per guasti e blocchi. Diagnosi immediata e ripristino in sicurezza.",
    icon: "Wrench",
    pill: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "fallback-3",
    title: "Manutenzione ordinaria",
    description: "Controlli periodici per efficienza, sicurezza e risparmio energetico.",
    icon: "Thermometer",
    pill: null,
    sort_order: 3,
    is_active: true,
  },
  {
    id: "fallback-4",
    title: "Controllo fumi",
    description:
      "Analisi emissioni e supporto per verifiche previste dalla normativa.",
    icon: "ShieldCheck",
    pill: null,
    sort_order: 4,
    is_active: true,
  },
  {
    id: "fallback-5",
    title: "Impianti idraulici",
    description:
      "Installazione e manutenzione di impianti idraulici civili e industriali.",
    icon: "Droplets",
    pill: null,
    sort_order: 5,
    is_active: true,
  },
  {
    id: "fallback-6",
    title: "Climatizzazione",
    description:
      "Installazione e assistenza su impianti di climatizzazione e condizionamento.",
    icon: "Snowflake",
    pill: null,
    sort_order: 6,
    is_active: true,
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

function parseBulletsFromText(text) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim())
    .filter(Boolean);

  const clean = lines.filter((l) => !l.startsWith("- ")).join("\n").trim();

  return { clean, bullets };
}

export default function ServicesSection() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id,title,description,icon,pill,sort_order,is_active")
        .eq("company_id", COMPANY_ID)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const list = Array.isArray(data) ? data : [];
      setRows(list.length ? list : FALLBACK);
    } catch (e) {
      setErr(e?.message || "Impossibile caricare i servizi.");
      setRows(FALLBACK);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const featured = useMemo(() => {
    if (!rows.length) return null;
    return rows[0];
  }, [rows]);

  const rest = useMemo(() => rows.slice(1), [rows]);

  const chips = useMemo(() => {
    const fromDb = rows.map((r) => (r.pill || "").trim()).filter(Boolean);
    const uniq = Array.from(new Set(fromDb));
    const picked = uniq.slice(0, 3);
    if (picked.length) return picked;
    return ["Interventi su appuntamento", "Trasparenza sui costi", "Ricambi e collaudo"];
  }, [rows]);

  if (!featured) return null;

  const FeaturedIcon = ICONS[featured.icon] || Zap;
  const featuredParsed = parseBulletsFromText(featured.description);

  return (
    <section id="servizi" className="section">
      <div className="container">
        <Reveal>
          <div
            className="servicesHeaderTop"
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

              {err ? (
                <div style={{ marginTop: 10, fontWeight: 800, color: "#b91c1c" }}>
                  {err}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {chips.map((c) => (
                <MiniChip key={c}>{c}</MiniChip>
              ))}
            </div>
          </div>
        </Reveal>

        <div
          className="servicesMainGrid"
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "1.05fr .95fr",
            gap: 18,
          }}
        >
          {/* Featured */}
          <Reveal>
            <div
              className="card cardHover servicesFeaturedCard"
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
              <div
                className="servicesFeaturedTop"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
                  <div className="iconBox" style={{ width: 62, height: 62, borderRadius: 20 }}>
                    <FeaturedIcon size={24} />
                  </div>

                  <div style={{ minWidth: 0 }}>
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

                    <div
                      style={{
                        marginTop: 10,
                        color: "rgba(15,23,42,.74)",
                        fontWeight: 600,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {featuredParsed.clean}
                    </div>
                  </div>
                </div>

                {featured.pill ? (
                  <div
                    className="servicesFeaturedPill"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(229,57,53,.18)",
                      background: "rgba(229,57,53,.08)",
                      color: "rgba(15,23,42,.86)",
                      fontWeight: 800,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      flex: "0 0 auto",
                    }}
                  >
                    {featured.pill}
                  </div>
                ) : null}
              </div>

              {featuredParsed.bullets.length ? (
                <div
                  className="servicesBulletsGrid"
                  style={{
                    marginTop: 18,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {featuredParsed.bullets.slice(0, 6).map((b) => (
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
              ) : null}

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
          <div className="servicesRestGrid" style={{ display: "grid", gap: 12 }}>
            {rest.map((s) => {
              const Icon = ICONS[s.icon] || Wrench;
              const parsed = parseBulletsFromText(s.description);

              return (
                <Reveal key={s.id}>
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
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em" }}>
                        {s.title}
                      </div>
                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "rgba(15,23,42,.72)",
                          fontWeight: 600,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {parsed.clean}
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
            #servizi .servicesMainGrid{
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 720px){
            #servizi .servicesBulletsGrid{
              grid-template-columns: 1fr !important;
            }

            #servizi .servicesFeaturedTop{
              flex-direction: column !important;
            }

            #servizi .servicesFeaturedPill{
              white-space: normal !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}