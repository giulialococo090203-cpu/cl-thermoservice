import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { PhoneCall, Mail, MapPin, Clock, Navigation, X } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function ContactSection() {
  const DEST = useMemo(
    () => ({
      label: "Via Tommaso Calojra, 36 — Palermo (PA)",
      q: "Via Tommaso Calojra 36 Palermo",
      lat: 38.1253,
      lng: 13.361,
    }),
    []
  );

  const [pos, setPos] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGeoStatus("ok");
      },
      (err) => {
        if (err.code === 1) setGeoStatus("denied");
        else setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const mapsDirectionsUrl = useMemo(() => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const dest = `&destination=${encodeURIComponent(DEST.q)}`;
    const origin = pos ? `&origin=${pos.lat},${pos.lng}` : "";
    return `${base}${origin}${dest}&travelmode=driving`;
  }, [pos, DEST]);

  const mapsPlaceUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DEST.q)}`;
  }, [DEST]);

  const resetEmailForm = () => {
    setNome("");
    setCognome("");
    setTelefono("");
    setEmail("");
    setMessaggio("");
  };

  const submitEmailAndSave = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !telefono.trim() || !messaggio.trim()) {
      alert("Compila almeno Nome, Telefono e Messaggio.");
      return;
    }

    const cleanNome = nome.trim();
    const cleanCognome = cognome.trim();
    const cleanTel = telefono.trim();
    const cleanEmail = email.trim();
    const cleanMsg = messaggio.trim();

    setLoadingEmail(true);

    const { error } = await supabase.from("quotes").insert([
      {
        nome: cleanNome,
        cognome: cleanCognome,
        telefono: cleanTel,
        email: cleanEmail,
        messaggio: `[EMAIL DAL SITO]\n${cleanMsg}`,
      },
    ]);

    setLoadingEmail(false);

    if (error) {
      alert("Errore salvataggio su Supabase: " + error.message);
      return;
    }

    const to = "clthermoservice@virgilio.it";
    const subject = encodeURIComponent("Richiesta informazioni / contatto dal sito");
    const body = encodeURIComponent(
      `Nome: ${cleanNome} ${cleanCognome}\nTelefono: ${cleanTel}\nEmail: ${cleanEmail}\n\nMessaggio:\n${cleanMsg}`
    );

    setOpenEmailModal(false);
    resetEmailForm();

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    alert("✅ Messaggio salvato in Admin e mail aperta per l’invio!");
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.15)",
    fontSize: 16,
    fontWeight: 800,
    outline: "none",
    background: "white",
  };

  return (
    <section id="contatti" className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">CONTATTI</div>
            <h2 className="h2">Hai bisogno di assistenza?</h2>
            <p className="lead">Contattaci per informazioni o per richiedere un intervento.</p>
          </div>
        </Reveal>

        <div className="grid2" style={{ marginTop: 26 }}>
          <Reveal>
            <a
              className="card serviceCard cardHover"
              href="tel:091406911"
              style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}
            >
              <div className="iconBox">
                <PhoneCall size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="serviceTitle">Telefono</div>
                <div style={{ fontWeight: 950, fontSize: "clamp(20px, 4vw, 24px)", lineHeight: 1.15 }}>
                  091 406911
                </div>
              </div>
            </a>
          </Reveal>

          <Reveal>
            <button
              type="button"
              className="card serviceCard cardHover"
              onClick={() => setOpenEmailModal(true)}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                background: "transparent",
                color: "inherit",
                minWidth: 0,
              }}
            >
              <div className="iconBox">
                <Mail size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="serviceTitle">Email</div>
                <div
                  style={{
                    fontWeight: 950,
                    fontSize: "clamp(16px, 3.8vw, 20px)",
                    lineHeight: 1.25,
                    overflowWrap: "anywhere",
                  }}
                >
                  clthermoservice@virgilio.it
                </div>
                <div style={{ marginTop: 4, fontWeight: 700, opacity: 0.7, fontSize: 14, lineHeight: 1.4 }}>
                  Clicca per scrivere (salvata in Admin + apre Mail)
                </div>
              </div>
            </button>
          </Reveal>

          <Reveal>
            <a
              className="card serviceCard cardHover"
              href={mapsPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}
            >
              <div className="iconBox">
                <MapPin size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="serviceTitle">Indirizzo</div>
                <div style={{ fontWeight: 900, fontSize: "clamp(16px, 3.8vw, 20px)", lineHeight: 1.35 }}>
                  {DEST.label}
                </div>
                <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4, fontWeight: 700 }}>
                  Clicca per aprire su Maps →
                </div>
              </div>
            </a>
          </Reveal>

          <Reveal>
            <div className="card serviceCard cardHover">
              <div className="iconBox">
                <Clock size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="serviceTitle">Orari</div>
                <div style={{ fontWeight: 900, fontSize: "clamp(16px, 3.8vw, 20px)", lineHeight: 1.35 }}>
                  Lun–Ven 8:00–18:00 | Sab 8:00–13:00
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div
            className="contactCtaMobile"
            style={{
              marginTop: 36,
              paddingTop: 24,
              borderTop: "1px solid rgba(15,23,42,.08)",
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btnAnim"
              style={{
                padding: "14px 22px",
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,.12)",
                background: "white",
                color: "#0b1220",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Navigation size={18} />
              Indicazioni
            </a>

            <a
              href="tel:091406911"
              className="btnAnim"
              style={{
                padding: "14px 22px",
                borderRadius: 18,
                background: "#0b1220",
                color: "white",
                fontWeight: 900,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <PhoneCall size={18} />
              Chiama
            </a>

            <a
              href="https://wa.me/393662085556"
              target="_blank"
              rel="noopener noreferrer"
              className="btnAnim"
              style={{
                padding: "14px 22px",
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,.12)",
                background: "rgba(255,255,255,.85)",
                color: "#0b1220",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              WhatsApp
            </a>
          </div>
        </Reveal>
      </div>

      {openEmailModal && (
        <div
          onClick={() => setOpenEmailModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,12,24,.45)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 4000,
            padding: 12,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "rgba(255,255,255,.96)",
              borderRadius: 24,
              border: "1px solid rgba(15,23,42,.12)",
              boxShadow: "0 30px 80px rgba(2,6,23,.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                padding: 16,
                borderBottom: "1px solid rgba(15,23,42,.08)",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 950, fontSize: 18 }}>Scrivi un messaggio</div>
              <button
                onClick={() => setOpenEmailModal(false)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "white",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                }}
                aria-label="Chiudi"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEmailAndSave} style={{ padding: 16, display: "grid", gap: 12 }}>
              <div className="contactModalGrid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <input placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
                <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} style={inputStyle} />
              </div>

              <div className="contactModalGrid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <input placeholder="Telefono *" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={inputStyle} />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>

              <textarea
                placeholder="Messaggio *"
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                rows={6}
                style={{ ...inputStyle, fontWeight: 700, resize: "vertical" }}
              />

              <div
                className="contactModalActions"
                style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenEmailModal(false);
                    resetEmailForm();
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={loadingEmail}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    border: "1px solid #0b1224",
                    background: "#0b1224",
                    color: "white",
                    fontWeight: 950,
                    cursor: loadingEmail ? "not-allowed" : "pointer",
                    opacity: loadingEmail ? 0.75 : 1,
                  }}
                >
                  {loadingEmail ? "Invio..." : "Invia (salva + apri Mail)"}
                </button>
              </div>
            </form>

            <style>{`
              @media(max-width: 820px){
                #contatti .contactModalGrid {
                  grid-template-columns: 1fr !important;
                }
              }

              @media(max-width: 640px){
                #contatti .contactCtaMobile{
                  display: grid !important;
                  grid-template-columns: 1fr !important;
                }

                #contatti .contactCtaMobile a{
                  width: 100% !important;
                }

                #contatti .contactModalActions{
                  display: grid !important;
                  grid-template-columns: 1fr !important;
                }

                #contatti .contactModalActions button{
                  width: 100% !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </section>
  );
}