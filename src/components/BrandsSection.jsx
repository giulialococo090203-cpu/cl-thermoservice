export default function BrandsSection() {
  const brands = [
    { name: "Chaffoteaux", logo: "/chaffoteaux.png" },
    { name: "Bosch", logo: "/bosch.png" },
    { name: "Toshiba", logo: "/toshiba.png" },
    { name: "Maxa", logo: "/maxa.png" },
    { name: "Innova", logo: "/innova.png" },
    { name: "Cordivari", logo: "/cordivari.png" },
  ];

  return (
    <section id="marchi" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">MARCHI TRATTATI</div>
          <h2 className="h2">Collaboriamo con i migliori brand</h2>
          <p className="lead">
            Installazione e assistenza su prodotti certificati e di qualità.
          </p>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand.name}
              style={{
                background: "white",
                borderRadius: 20,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                transition: "all .2s ease",
              }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                style={{
                  maxHeight: 60,
                  maxWidth: 140,
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  fontWeight: 900,
                  color: "#0b1220",
                  textAlign: "center",
                }}
              >
                {brand.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}