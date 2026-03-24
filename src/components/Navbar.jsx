import { useEffect, useMemo, useState } from "react";
import { Menu, X, PhoneCall, Mail, MessageCircle, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);

  const links = useMemo(
    () => [
      ["#servizi", "Servizi"],
      ["#zona", "Zona copertura"],
      ["#marchi", "Marchi"],
      ["#certificazioni", "Certificazioni"],
      ["#lavori", "Lavori"],
      ["#recensioni", "Recensioni"],
      ["#link-utili", "Link utili"],
      ["#preventivo", "Preventivo"],
      ["#contatti", "Contatti"],
    ],
    []
  );

  const PHONE_1_RAW = "091406911";
  const PHONE_2_RAW = "0916763328";
  const PHONE_1_LABEL = "091 406911";
  const PHONE_2_LABEL = "091 6763328";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenPhoneMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenPhoneMenu(false);
    };

    if (openPhoneMenu) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [openPhoneMenu]);

  const close = () => {
    setOpen(false);
    setOpenPhoneMenu(false);
  };

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
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 26px rgba(15,23,42,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <a
          href="#hero"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <img
            src={logo}
            alt="Thermoservice"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              boxShadow: "0 10px 22px rgba(15,23,42,0.10)",
              flex: "0 0 auto",
              objectFit: "contain",
              background: "white",
            }}
          />
          <div
            style={{
              fontWeight: 1000,
              fontSize: 24,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Thermoservice
          </div>
        </a>

        <nav className="navLinks" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flex: "0 0 auto" }}>
          <div
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btnAnim navCallBtn"
              onClick={() => setOpenPhoneMenu((prev) => !prev)}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                background: "#e53935",
                color: "white",
                fontWeight: 950,
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <PhoneCall size={18} />
              <span className="navCallText">Chiama</span>
              <ChevronDown
                size={16}
                style={{
                  transform: openPhoneMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .18s ease",
                }}
              />
            </button>

            {openPhoneMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  minWidth: 220,
                  background: "rgba(255,255,255,.98)",
                  border: "1px solid rgba(15,23,42,.10)",
                  borderRadius: 18,
                  boxShadow: "0 20px 50px rgba(15,23,42,.16)",
                  padding: 10,
                  display: "grid",
                  gap: 8,
                  zIndex: 1200,
                }}
              >
                <a
                  href={`tel:${PHONE_1_RAW}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#fff",
                    color: "#0b1220",
                    fontWeight: 900,
                    textDecoration: "none",
                    border: "1px solid rgba(15,23,42,.08)",
                  }}
                >
                  {PHONE_1_LABEL}
                </a>

                <a
                  href={`tel:${PHONE_2_RAW}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#fff",
                    color: "#0b1220",
                    fontWeight: 900,
                    textDecoration: "none",
                    border: "1px solid rgba(15,23,42,.08)",
                  }}
                >
                  {PHONE_2_LABEL}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Apri menu"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.92)",
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        <style>{`
          @media(max-width: 980px){
            .navLinks{ display:none !important; }
            header button[aria-label="Apri menu"]{ display:flex !important; }
          }

          @media(max-width: 640px){
            .navCallText{ display:none; }
            .navCallBtn{
              min-width: 44px !important;
              height: 44px !important;
              padding: 0 10px !important;
              justify-content: center !important;
              border-radius: 14px !important;
            }
          }

          @media(max-width: 480px){
            header.navAnim{
              padding: 10px 12px !important;
            }
          }
        `}</style>
      </header>

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
              padding: 16,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-18px 0 60px rgba(2,6,23,.25)",
              animation: "slideIn 220ms ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <img
                  src={logo}
                  alt="Thermoservice"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    boxShadow: "0 10px 20px rgba(15,23,42,.10)",
                    flex: "0 0 auto",
                    objectFit: "contain",
                    background: "white",
                  }}
                />
                <div
                  style={{
                    fontWeight: 1000,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Thermoservice
                </div>
              </div>

              <button
                onClick={close}
                aria-label="Chiudi menu"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
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

            <div
              style={{
                marginTop: 14,
                height: 1,
                background: "rgba(15,23,42,.08)",
              }}
            />

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
                    minWidth: 0,
                  }}
                >
                  <span style={{ minWidth: 0 }}>{label}</span>
                  <span style={{ opacity: 0.55, fontWeight: 900, flex: "0 0 auto" }}>→</span>
                </a>
              ))}
            </div>

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
                    href={`tel:${PHONE_1_RAW}`}
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
                    <PhoneCall size={18} /> Chiama {PHONE_1_LABEL}
                  </a>

                  <a
                    href={`tel:${PHONE_2_RAW}`}
                    onClick={close}
                    style={{
                      padding: "14px 14px",
                      borderRadius: 16,
                      background: "#0b1224",
                      color: "white",
                      fontWeight: 1000,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <PhoneCall size={18} /> Chiama {PHONE_2_LABEL}
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