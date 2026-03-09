export default function Footer() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new Event("open-cookie-preferences"));
  };

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/favicon.png"
            alt="Thermoservice"
            style={{ width: 54, height: 54, objectFit: "contain" }}
          />

          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Thermoservice
          </div>
        </div>

        <div style={{ marginTop: 14, opacity: 0.75, fontWeight: 700, color: "white", lineHeight: 1.6 }}>
          © {new Date().getFullYear()} CL. Thermoservice S.r.l. – P.IVA 06441430821
          <br />
          Via Tommaso Calojra 36, Palermo – Email: clthermoservice@virgilio.it – Tel: 091406911
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/privacy-policy" style={{ color: "white", fontWeight: 700 }}>
            Privacy Policy
          </a>

          <a href="/cookie-policy" style={{ color: "white", fontWeight: 700 }}>
            Cookie Policy
          </a>

          <button
            type="button"
            onClick={openCookiePreferences}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "inherit",
              fontFamily: "inherit",
            }}
          >
            Gestisci preferenze cookie
          </button>
        </div>
      </div>
    </footer>
  );
}