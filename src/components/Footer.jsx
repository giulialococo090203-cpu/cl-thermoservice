export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <img
            src="/favicon.png"
            alt="Thermoservice"
            style={{
              width: 54,
              height: 54,
              objectFit: "contain",
            }}
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

        <div
          style={{
            marginTop: 14,
            opacity: 0.75,
            fontWeight: 700,
            color: "white",
          }}
        >
          © {new Date().getFullYear()} Thermoservice. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}