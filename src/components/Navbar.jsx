import { useEffect, useState } from "react";
import { Menu, X, PhoneCall } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // blocca scroll pagina quando menu mobile è aperto
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className="navAnim"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          padding: "14px 34px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 8px 26px rgba(15,23,42,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        {/* LOGO */}
        <a
          href="#hero"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/favicon.png"
            alt="CL Thermoservice"
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              boxShadow: "0 10px 22px rgba(15,23,42,0.10)",
            }}
          />
          <div
            style={{
              fontWeight: 1000,
              fontSize: 26,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Thermoservice
          </div>
        </a>

        {/* MENU DESKTOP */}
        <nav
          className="navLinks"
          style={{ display: "flex", gap: 22, alignItems: "center" }}
        >
          <a href="#servizi">Servizi</a>
          <a href="#zona">Zona</a>
          <a href="#marchi">Marchi</a>
          <a href="#certificazioni">Certificazioni</a>
          <a href="#lavori">Lavori</a>
          <a href="#recensioni">Recensioni</a>
          <a href="#preventivo">Preventivo</a>
          <a href="#contatti">Contatti</a>
        </nav>

        {/* CTA + Mobile button */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            className="btnAnim"
            href="tel:091406911"
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              background: "#e53935",
              color: "white",
              fontWeight: 950,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <PhoneCall size={18} /> Chiama
          </a>

          <button
            onClick={() => setOpen(true)}
            aria-label="Apri menu"
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.92)",
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Responsive: nascondi desktop menu su mobile */}
        <style>{`
          @media(max-width: 980px){
            .navLinks{ display:none !important; }
            header button[aria-label="Apri menu"]{ display:flex !important; }
          }
        `}</style>
      </header>

      {/* MOBILE MENU */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,12,24,.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(360px, 92vw)",
              height: "100dvh",
              maxHeight: "100dvh",
              background: "rgba(255,255,255,.94)",
              borderLeft: "1px solid rgba(15,23,42,.10)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* top */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="/favicon.png"
                  alt="CL Thermoservice"
                  style={{ width: 40, height: 40, borderRadius: 12 }}
                />
                <div style={{ fontWeight: 1000 }}>Thermoservice</div>
              </div>

              <button
                onClick={close}
                aria-label="Chiudi menu"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* area scrollabile */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflowY: "auto",
                paddingRight: 4,
                flex: "1 1 auto",
              }}
            >
              {[
                ["#servizi", "Servizi"],
                ["#zona", "Zona copertura"],
                ["#marchi", "Marchi"],
                ["#certificazioni", "Certificazioni"],
                ["#lavori", "Lavori"],
                ["#recensioni", "Recensioni"],
                ["#preventivo", "Preventivo"],
                ["#contatti", "Contatti"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={close}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,.08)",
                    background: "rgba(255,255,255,.90)",
                    fontWeight: 950,
                    textDecoration: "none",
                    color: "#0b1220",
                    flex: "0 0 auto",
                  }}
                >
                  {label}
                </a>
              ))}

              {/* CTA */}
              <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
                <a
                  href="tel:091406911"
                  onClick={close}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 16,
                    background: "#e53935",
                    color: "white",
                    fontWeight: 1000,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <PhoneCall size={18} /> Chiama adesso
                </a>

                <a
                  href="mailto:clthermoservice@virgilio.it"
                  onClick={close}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,.10)",
                    background: "white",
                    fontWeight: 1000,
                    textDecoration: "none",
                    textAlign: "center",
                    color: "#0b1220",
                  }}
                >
                  Scrivi una mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}