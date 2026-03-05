import { useEffect, useMemo, useState } from "react";
import { Menu, X, PhoneCall, Mail, MessageCircle } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      ["#servizi", "Servizi"],
      ["#zona", "Zona copertura"],
      ["#marchi", "Marchi"],
      ["#certificazioni", "Certificazioni"],
      ["#lavori", "Lavori"],
      ["#recensioni", "Recensioni"],
      ["#link-utili", "Link utili"], // ✅ NUOVO
      ["#preventivo", "Preventivo"],
      ["#contatti", "Contatti"],
    ],
    []
  );

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

  const WHATSAPP_NUMBER = "3662085556";
  const whatsappUrl = `https://wa.me/39${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Ciao! Vorrei informazioni su un intervento."
  )}`;

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
            alt="Thermoservice"
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
        <nav className="navLinks" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
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
            background: "rgba(6,12,24,.55)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(380px, 92vw)",
              height: "100dvh",
              maxHeight: "100dvh",
              background:
                "radial-gradient(900px 340px at 10% 0%, rgba(31,75,143,.10), transparent 60%), rgba(255,255,255,.96)",
              borderLeft: "1px solid rgba(15,23,42,.10)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-18px 0 60px rgba(2,6,23,.25)",
              animation: "slideIn 220ms ease both",
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
                  alt="Thermoservice"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    boxShadow: "0 10px 20px rgba(15,23,42,.10)",
                  }}
                />
                <div style={{ fontWeight: 1000, letterSpacing: "-0.02em" }}>Thermoservice</div>
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

            {/* divider */}
            <div
              style={{
                marginTop: 14,
                height: 1,
                background: "rgba(15,23,42,.08)",
              }}
            />

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
              {links.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={close}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 18,
                    border: "1px solid rgba(15,23,42,.08)",
                    background: "rgba(255,255,255,.92)",
                    fontWeight: 900,
                    textDecoration: "none",
                    color: "#0b1220",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ opacity: 0.55, fontWeight: 900 }}>→</span>
                </a>
              ))}
            </div>

            {/* CTA bottom fixed */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 20,
                  border: "1px solid rgba(15,23,42,.10)",
                  background: "rgba(255,255,255,.92)",
                  boxShadow: "0 14px 30px rgba(15,23,42,.10)",
                }}
              >
                <div style={{ fontWeight: 950, color: "#0b1220", letterSpacing: "-0.01em" }}>
                  Contatto rapido
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
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
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    style={{
                      padding: "14px 14px",
                      borderRadius: 16,
                      background: "rgba(37, 211, 102, .12)",
                      border: "1px solid rgba(37, 211, 102, .28)",
                      color: "#0b1220",
                      fontWeight: 1000,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <MessageCircle size={18} /> WhatsApp
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
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <Mail size={18} /> Email
                  </a>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes slideIn {
                from { transform: translateX(14px); opacity: .0; }
                to   { transform: translateX(0); opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}