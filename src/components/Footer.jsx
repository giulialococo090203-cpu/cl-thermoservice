import Reveal from "./Reveal";

export default function Footer() {
  return (
    <footer style={{ marginTop: 40 }}>
      <Reveal>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto 28px",
            borderRadius: 32,
            padding: "34px 22px",
            background: "#102a56",
            color: "rgba(255,255,255,0.85)",
            boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <img
              src="/favicon.png"
              alt="CL Thermoservice"
              style={{ width: 42, height: 42, borderRadius: 14 }}
            />
            <div style={{ fontSize: 22, fontWeight: 1000, color: "white" }}>
              CL<span style={{ color: "#e53935" }}>.</span> Thermoservice
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 14, fontWeight: 850 }}>
            © {new Date().getFullYear()} CL Thermoservice. Tutti i diritti riservati.
          </div>
        </div>
      </Reveal>
    </footer>
  );
}