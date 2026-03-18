import siteLogo from "../assets/logo.png";

export default function Footer() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new Event("open-cookie-preferences"));
  };

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <img
            src={siteLogo}
            alt="Thermoservice"
            style={{
              width: 52,
              height: 52,
              objectFit: "contain",
              background: "white",
              borderRadius: 12,
              padding: 4,
            }}
          />

          <div
            style={{
              fontSize: "clamp(24px, 6vw, 30px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "white",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Thermoservice
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            opacity: 0.82,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.7,
            textAlign: "center",
            maxWidth: 760,
            fontSize: 15,
          }}
        >
          © {new Date().getFullYear()} CL. Thermoservice S.r.l. – P.IVA 06441430821
          <br />
          Via Tommaso Calojra 36, Palermo
          <br />
          Email: clthermoservice@virgilio.it – Tel: 091406911
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <a
            href="/privacy-policy"
            style={{
              color: "white",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            Privacy Policy
          </a>

          <a
            href="/cookie-policy"
            style={{
              color: "white",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
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