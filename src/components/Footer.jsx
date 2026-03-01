export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <img
            src="/logo.png"
            alt="Thermoservice"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
            }}
          />

          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            Thermoservice
          </div>
        </div>

        <div className="footerCopy">
          © {new Date().getFullYear()} Thermoservice. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}