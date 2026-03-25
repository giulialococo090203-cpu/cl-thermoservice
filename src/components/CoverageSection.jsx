import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { MapPin, PhoneCall } from "lucide-react";
import { supabase } from "../supabaseClient";

const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const DEFAULT = {
  kicker: "ZONA COPERTURA",
  title: "Operiamo a Palermo e provincia",
  lead:
    "Interveniamo su appuntamento in diverse aree del territorio, con organizzazione chiara.",

  areas: [
    "Palermo",
    "Bagheria",
    "Monreale",
    "Villabate",
    "Misilmeri",
    "Carini",
    "Capaci",
    "Isola delle Femmine",
  ],

  extra_text: "Se la tua zona non è nell’elenco, contattaci comunque.",

  cards: [],
};

export default function CoverageSection() {
  const [data, setData] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const { data: res, error } = await supabase
      .from("coverage_content")
      .select("payload")
      .eq("company_id", COMPANY_ID)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && res?.payload) {
      setData({
        ...DEFAULT,
        ...res.payload,
        areas: Array.isArray(res.payload.areas) ? res.payload.areas : DEFAULT.areas,
        cards: Array.isArray(res.payload.cards) ? res.payload.cards : DEFAULT.cards,
      });
    } else {
      setData(DEFAULT);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return null;

  return (
    <section id="zona" className="section">
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
          <Reveal>
            <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
              <div className="kicker">{data.kicker}</div>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                {data.title}
              </h2>
              <p className="lead" style={{ marginTop: 0 }}>
                {data.lead}
              </p>
            </div>
          </Reveal>

          <div
            className="coverageMainGrid"
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1.02fr .98fr",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <Reveal>
              <div
                className="card"
                style={{
                  padding: 18,
                  borderRadius: 24,
                  background: "rgba(255,255,255,.88)",
                  border: "1px solid rgba(15,23,42,.08)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontWeight: 950,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    color: "#0b1220",
                  }}
                >
                  Aree servite
                </div>

                <div
                  className="coverageAreasGrid"
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {data.areas.map((area, i) => (
                    <div
                      key={`${area}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 12px",
                        borderRadius: 18,
                        border: "1px solid rgba(15,23,42,.08)",
                        background: "rgba(255,255,255,.94)",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          background: "rgba(31,75,143,.10)",
                          border: "1px solid rgba(31,75,143,.16)",
                          flex: "0 0 auto",
                        }}
                      >
                        <MapPin size={18} />
                      </div>

                      <div
                        style={{
                          fontWeight: 850,
                          color: "rgba(15,23,42,.86)",
                          lineHeight: 1.2,
                          minWidth: 0,
                        }}
                      >
                        {area}
                      </div>
                    </div>
                  ))}
                </div>

                {data.extra_text ? (
                  <div
                    style={{
                      marginTop: 16,
                      color: "rgba(15,23,42,.70)",
                      fontWeight: 650,
                      lineHeight: 1.7,
                    }}
                  >
                    {data.extra_text}
                  </div>
                ) : null}
              </div>
            </Reveal>

            <Reveal>
              <div
                className="coverageInfoPanel"
                style={{
                  borderRadius: 28,
                  padding: 22,
                  color: "white",
                  background:
                    "radial-gradient(700px 360px at 20% 15%, rgba(255,255,255,.12), transparent 60%), linear-gradient(135deg, rgba(155,44,42,.96), rgba(31,75,143,.96))",
                  boxShadow: "0 26px 70px rgba(2,6,23,.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  height: "100%",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.01em" }}>
                  Come lavoriamo sul territorio
                </div>

                {data.cards?.length > 0 ? (
                  <div
                    className="coverageHighlightsGrid"
                    style={{
                      marginTop: 16,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {data.cards.map((item, i) => (
                      <div
                        key={`${item.title}-${i}`}
                        style={{
                          borderRadius: 20,
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.08)",
                          padding: 16,
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 16,
                            display: "grid",
                            placeItems: "center",
                            background: "rgba(255,255,255,0.10)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            flex: "0 0 auto",
                          }}
                        >
                          <MapPin size={22} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 900,
                              fontSize: 18,
                              letterSpacing: "-0.01em",
                              lineHeight: 1.2,
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              opacity: 0.9,
                              fontWeight: 650,
                              lineHeight: 1.55,
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <a
                  href="tel:091406911"
                  className="btnAnim"
                  style={{
                    marginTop: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "14px 18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,.94)",
                    color: "#0b1220",
                    fontWeight: 950,
                    textDecoration: "none",
                    width: "100%",
                  }}
                >
                  <PhoneCall size={18} />
                  Contattaci
                </a>
              </div>
            </Reveal>
          </div>

          <style>{`
            @media (max-width: 980px){
              #zona .coverageMainGrid{
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 720px){
              #zona .coverageAreasGrid{
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 560px){
              #zona .coverageInfoPanel{
                padding: 18px !important;
                border-radius: 22px !important;
              }

              #zona .card{
                border-radius: 22px !important;
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}