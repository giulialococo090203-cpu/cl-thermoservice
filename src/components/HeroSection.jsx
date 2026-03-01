export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        borderRadius: "24px",
        overflow: "hidden",

        /* ⭐ IMMAGINE SFONDO */
        backgroundImage: "linear-gradient(rgba(10,20,40,0.75), rgba(10,20,40,0.75)), url('/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        color: "white",
        padding: "80px 60px"
      }}
    >
      <div style={{ maxWidth: "700px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: "30px",
            marginBottom: "20px",
            fontWeight: "600"
          }}
        >
          Centro Assistenza Autorizzato
        </div>

        <h1 style={{ fontSize: "64px", marginBottom: "10px", lineHeight: 1.1 }}>
          Assistenza caldaie
        </h1>

        <h1 style={{ fontSize: "64px", color: "#ff3b30", marginBottom: "25px", lineHeight: 1.1 }}>
          rapida e professionale
        </h1>

        <p style={{ fontSize: "20px", marginBottom: "40px", opacity: 0.9 }}>
          Installazione, manutenzione e riparazione di caldaie e impianti termici.
          Interventi rapidi con tecnici qualificati.
        </p>

        <div style={{ display: "flex", gap: "20px" }}>
          <a
            href="tel:091406911"
            style={{
              background: "#ff3b30",
              color: "white",
              padding: "18px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "18px"
            }}
          >
            📞 Chiama Ora
          </a>

          <a
            href="#servizi"
            style={{
              background: "white",
              color: "#111",
              padding: "18px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "18px"
            }}
          >
            Scopri i Servizi
          </a>
        </div>

        <div style={{ marginTop: "30px", opacity: 0.8 }}>
          ⏰ Lun–Ven 8–18 | Sab 8–13
        </div>
      </div>
    </section>
  );
}