import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const DEFAULT_BRANDS = [
  { name: "Chaffoteaux", logo: "/chaffoteaux.png", url: "" },
  { name: "Bosch", logo: "/bosch.png", url: "" },
  { name: "Toshiba", logo: "/toshiba.png", url: "" },
  { name: "Maxa", logo: "/maxa.png", url: "" },
  { name: "Innova", logo: "/innova.png", url: "" },
  { name: "Cordivari", logo: "/cordivari.png", url: "" },
];

function normalizeBrand(brand) {
  return {
    name: String(brand?.name || "").trim(),
    logo: String(brand?.logo || "").trim(),
    url: String(brand?.url || "").trim(),
  };
}

function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BrandsSection({ variant = "hero" }) {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);

  useEffect(() => {
    let alive = true;

    const loadBrands = async () => {
      try {
        const { data, error } = await supabase
          .from("brands_content")
          .select("payload, updated_at")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        const dbBrands = data?.payload?.brands;

        if (alive && Array.isArray(dbBrands) && dbBrands.length > 0) {
          const normalized = dbBrands
            .map(normalizeBrand)
            .filter((b) => b.name && b.logo);

          setBrands(normalized.length ? normalized : DEFAULT_BRANDS);
        } else if (alive) {
          setBrands(DEFAULT_BRANDS);
        }
      } catch (e) {
        console.error("Errore caricamento marchi:", e?.message || e);
        if (alive) setBrands(DEFAULT_BRANDS);
      }
    };

    loadBrands();

    return () => {
      alive = false;
    };
  }, []);

  const isHero = variant === "hero";

  const wrapperStyle = isHero
    ? {
        maxWidth: 1180,
        margin: "0 auto",
        padding: 0,
      }
    : {
        maxWidth: 1180,
        margin: "0 auto",
        padding: "64px 18px",
      };

  const panelStyle = isHero
    ? {
        borderRadius: 24,
        padding: "18px 18px 16px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
        backdropFilter: "blur(10px)",
      }
    : null;

  const titleColor = isHero ? "#fff" : "#0b1220";
  const subColor = isHero ? "rgba(255,255,255,0.80)" : "#475569";
  const kickerColor = isHero ? "rgba(255,255,255,0.72)" : "#c62828";

  const gridStyle = {
    marginTop: isHero ? 16 : 34,
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: isHero ? 18 : 24,
    alignItems: "stretch",
  };

  const responsiveGrid = `
    @media (max-width: 1100px) {
      .brandsGrid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 640px) {
      .brandsGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
      }

      .brandsPanelHero {
        padding: 16px 14px 14px !important;
        border-radius: 22px !important;
      }

      .brandsTitleHero {
        font-size: 18px !important;
        line-height: 1.15 !important;
      }

      .brandsSubtitleHero {
        font-size: 15px !important;
        line-height: 1.45 !important;
      }

      .brandsBadgeHero {
        white-space: normal !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
      }

      .brandCardHero {
        min-height: 138px !important;
        padding: 12px 10px !important;
        gap: 8px !important;
      }

      .brandLogoWrapHero {
        height: 44px !important;
      }

      .brandLogoHero {
        max-height: 34px !important;
        max-width: 96px !important;
      }

      .brandNameHero {
        font-size: 13px !important;
        line-height: 1.15 !important;
      }

      .brandsFooterHero {
        margin-top: 14px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
      }
    }

    @media (max-width: 420px) {
      .brandsGrid {
        grid-template-columns: 1fr !important;
      }

      .brandCardHero {
        min-height: 120px !important;
        padding: 10px !important;
      }

      .brandLogoWrapHero {
        height: 40px !important;
      }

      .brandLogoHero {
        max-height: 30px !important;
        max-width: 88px !important;
      }

      .brandNameHero {
        font-size: 12px !important;
      }
    }
  `;

  return (
    <section id="marchi" style={{ width: "100%" }}>
      <style>{responsiveGrid}</style>

      <div style={wrapperStyle}>
        <div
          className={!isHero ? "container softPanel" : "brandsPanelHero"}
          style={panelStyle}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  letterSpacing: "0.18em",
                  fontWeight: 950,
                  fontSize: 12,
                  color: kickerColor,
                  textTransform: "uppercase",
                }}
              >
                MARCHI TRATTATI
              </div>

              <div
                className={isHero ? "brandsTitleHero" : ""}
                style={{
                  marginTop: 8,
                  fontSize: isHero ? 22 : 34,
                  fontWeight: 1000,
                  color: titleColor,
                  lineHeight: 1.1,
                }}
              >
                Collaboriamo con i migliori brand
              </div>

              <div
                className={isHero ? "brandsSubtitleHero" : ""}
                style={{
                  marginTop: 8,
                  color: subColor,
                  fontWeight: 800,
                  maxWidth: 760,
                }}
              >
                Installazione e assistenza su prodotti certificati e di qualità.
              </div>
            </div>

            {isHero ? (
              <div
                className="brandsBadgeHero"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 850,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                Ricambi originali • Supporto certificato
              </div>
            ) : null}
          </div>

          <div className="brandsGrid" style={gridStyle}>
            {brands.map((brand, index) => {
              const safeBrand = normalizeBrand(brand);
              const clickable = isValidUrl(safeBrand.url);
              const Tag = clickable ? "a" : "div";

              return (
                <Tag
                  key={`${safeBrand.name}-${index}`}
                  className={isHero ? "brandCardHero" : ""}
                  href={clickable ? safeBrand.url : undefined}
                  target={clickable ? "_blank" : undefined}
                  rel={clickable ? "noopener noreferrer" : undefined}
                  aria-label={clickable ? `Apri sito ${safeBrand.name}` : undefined}
                  style={{
                    borderRadius: 18,
                    width: "100%",
                    minHeight: isHero ? 168 : 78,
                    padding: isHero ? "16px 12px" : "14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: isHero ? "rgba(255,255,255,0.06)" : "#fff",
                    border: isHero
                      ? "1px solid rgba(255,255,255,0.14)"
                      : "1px solid rgba(15,23,42,0.06)",
                    boxShadow: isHero
                      ? "0 10px 26px rgba(0,0,0,0.18)"
                      : "0 10px 30px rgba(15,23,42,0.05)",
                    transition: "transform .18s ease, box-shadow .18s ease, background .18s ease",
                    cursor: clickable ? "pointer" : "default",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = isHero
                      ? "0 16px 40px rgba(0,0,0,0.26)"
                      : "0 18px 50px rgba(15,23,42,0.10)";
                    if (clickable) {
                      e.currentTarget.style.background = isHero
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(255,255,255,0.98)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isHero
                      ? "0 10px 26px rgba(0,0,0,0.18)"
                      : "0 10px 30px rgba(15,23,42,0.05)";
                    if (clickable) {
                      e.currentTarget.style.background = isHero
                        ? "rgba(255,255,255,0.06)"
                        : "#fff";
                    }
                  }}
                >
                  <div
                    className={isHero ? "brandLogoWrapHero" : ""}
                    style={{
                      width: "100%",
                      height: isHero ? 56 : 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      className={isHero ? "brandLogoHero" : ""}
                      src={safeBrand.logo}
                      alt={safeBrand.name}
                      style={{
                        maxHeight: isHero ? 42 : 44,
                        maxWidth: isHero ? 120 : 128,
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        filter: isHero ? "brightness(1.05) contrast(1.05)" : "none",
                      }}
                    />
                  </div>

                  <div
                    className={isHero ? "brandNameHero" : ""}
                    style={{
                      fontWeight: 950,
                      textAlign: "center",
                      color: isHero ? "rgba(255,255,255,0.92)" : "#0b1220",
                      fontSize: 15,
                      lineHeight: 1.15,
                      wordBreak: "break-word",
                    }}
                  >
                    {safeBrand.name}
                  </div>
                </Tag>
              );
            })}
          </div>

          {isHero ? (
            <div
              className="brandsFooterHero"
              style={{
                marginTop: 16,
                color: "rgba(255,255,255,0.72)",
                fontWeight: 800,
              }}
            >
              Selezioniamo componenti affidabili per garantire durata e assistenza.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}