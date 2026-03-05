// src/components/BrandsSection.jsx
export default function BrandsSection({ variant = "page" }) {
  const brands = [
    { name: "Chaffoteaux", logo: "/chaffoteaux.png" },
    { name: "Bosch", logo: "/bosch.png" },
    { name: "Toshiba", logo: "/toshiba.png" },
    { name: "Maxa", logo: "/maxa.png" },
    { name: "Innova", logo: "/innova.png" },
    { name: "Cordivari", logo: "/cordivari.png" },
  ];

  const isHero = variant === "hero";

  // Wrapper: se è "hero" lo rendiamo una fascia integrata e più compatta
  const wrapperStyle = isHero
    ? {
        maxWidth: 1180,
        margin: "0 auto",
        padding: "18px 22px 26px",
      }
    : {
        maxWidth: 1180,
        margin: "0 auto",
        padding: "64px 18px",
      };

  // Panel: in hero è trasparente/glass; in pagina è softPanel classico
  const panelStyle = isHero
    ? {
        borderRadius: 24,
        padding: "18px 18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
        backdropFilter: "blur(10px)",
      }
    : null;

  const titleColor = isHero ? "#fff" : "#0b1220";
  const subColor = isHero ? "rgba(255,255,255,0.80)" : "#475569";
  const kickerColor = isHero ? "rgba(255,255,255,0.72)" : "#c62828";

  // Dimensioni "giuste" (più grandi) per la versione hero
  const cardW = isHero ? 170 : 160;
  const cardH = isHero ? 86 : 78;
  const logoMaxH = isHero ? 46 : 44;
  const logoMaxW = isHero ? 130 : 128;

  const gridStyle = {
    marginTop: isHero ? 14 : 34,
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: isHero ? 18 : 24,
    alignItems: "center",
  };

  // Responsive semplice (mobile/tablet): 2-3 colonne
  const responsiveGrid = `
    @media (max-width: 980px) {
      .brandsGrid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (max-width: 560px) {
      .brandsGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;

  return (
    <section id="marchi" style={{ width: "100%" }}>
      <style>{responsiveGrid}</style>

      <div style={wrapperStyle}>
        <div className={!isHero ? "container softPanel" : undefined} style={panelStyle}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
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
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 850,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Ricambi originali • Supporto certificato
              </div>
            ) : null}
          </div>

          {/* Grid */}
          <div className="brandsGrid" style={gridStyle}>
            {brands.map((brand) => (
              <div
                key={brand.name}
                style={{
                  borderRadius: 18,
                  width: "100%",
                  minHeight: cardH,
                  padding: "14px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  background: isHero ? "rgba(255,255,255,0.06)" : "#fff",
                  border: isHero
                    ? "1px solid rgba(255,255,255,0.14)"
                    : "1px solid rgba(15,23,42,0.06)",
                  boxShadow: isHero ? "0 10px 26px rgba(0,0,0,0.18)" : "0 10px 30px rgba(15,23,42,0.05)",
                  transition: "transform .18s ease, box-shadow .18s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isHero
                    ? "0 16px 40px rgba(0,0,0,0.26)"
                    : "0 18px 50px rgba(15,23,42,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isHero
                    ? "0 10px 26px rgba(0,0,0,0.18)"
                    : "0 10px 30px rgba(15,23,42,0.05)";
                }}
              >
                <div
                  style={{
                    width: cardW,
                    height: isHero ? 52 : 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    style={{
                      maxHeight: logoMaxH,
                      maxWidth: logoMaxW,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      filter: isHero ? "brightness(1.05) contrast(1.05)" : "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontWeight: 950,
                    textAlign: "center",
                    color: isHero ? "rgba(255,255,255,0.92)" : "#0b1220",
                    fontSize: 15,
                    lineHeight: 1.1,
                  }}
                >
                  {brand.name}
                </div>
              </div>
            ))}
          </div>

          {/* Footer micro-copy (solo hero) */}
          {isHero ? (
            <div
              style={{
                marginTop: 14,
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