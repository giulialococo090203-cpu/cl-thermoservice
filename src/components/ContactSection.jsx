import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { PhoneCall, Mail, MapPin, Clock, Navigation } from "lucide-react";

export default function ContactSection() {
  const DEST = useMemo(
    () => ({
      label: "Via Tommaso Calojra, 36 — Palermo (PA)",
      q: "Via Tommaso Calojra 36 Palermo",
      lat: 38.1253, // stima (ok se non hai coordinate precise)
      lng: 13.3610, // stima (ok se non hai coordinate precise)
    }),
    []
  );

  const [pos, setPos] = useState(null); // { lat, lng }
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | loading | ok | denied | error

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
        // 1 = denied, 2 = unavailable, 3 = timeout
        if (err.code === 1) setGeoStatus("denied");
        else setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Link Google Maps: se ho posizione → /dir/?origin=lat,lng&destination=...
  // altrimenti → /dir/?destination=...
  const mapsDirectionsUrl = useMemo(() => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const dest = `&destination=${encodeURIComponent(DEST.q)}`;
    const origin = pos ? `&origin=${pos.lat},${pos.lng}` : "";
    return `${base}${origin}${dest}&travelmode=driving`;
  }, [pos, DEST]);

  // Link “Apri su Maps” semplice (senza indicazioni)
  const mapsPlaceUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      DEST.q
    )}`;
  }, [DEST]);

  const geoText =
    geoStatus === "loading"
      ? "Sto rilevando la tua posizione…"
      : geoStatus === "ok"
      ? "Posizione rilevata: indicazioni personalizzate attive ✅"
      : geoStatus === "denied"
      ? "Posizione non autorizzata: userò indicazioni standard."
      : geoStatus === "error"
      ? "Posizione non disponibile: userò indicazioni standard."
      : "";

  return (
    <section id="contatti" className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">CONTATTI</div>
            <h2 className="h2">Hai bisogno di assistenza?</h2>
            <p className="lead">
              Contattaci per informazioni o per richiedere un intervento.
            </p>
          </div>
        </Reveal>

        <div className="grid2" style={{ marginTop: 26 }}>
          {/* TELEFONO */}
          <Reveal>
            <a
              className="card serviceCard cardHover"
              href="tel:091406911"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="iconBox">
                <PhoneCall size={22} />
              </div>
              <div>
                <div className="serviceTitle">Telefono</div>
                <div style={{ fontWeight: 1000, fontSize: 24 }}>091 406911</div>
              </div>
            </a>
          </Reveal>

          {/* EMAIL */}
          <Reveal>
            <a
              className="card serviceCard cardHover"
              href="mailto:clthermoservice@virgilio.it"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="iconBox">
                <Mail size={22} />
              </div>
              <div>
                <div className="serviceTitle">Email</div>
                <div style={{ fontWeight: 1000, fontSize: 20 }}>
                  clthermoservice@virgilio.it
                </div>
              </div>
            </a>
          </Reveal>

          {/* INDIRIZZO (cliccabile) */}
          <Reveal>
            <a
              className="card serviceCard cardHover"
              href={mapsPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="iconBox">
                <MapPin size={22} />
              </div>
              <div>
                <div className="serviceTitle">Indirizzo</div>
                <div style={{ fontWeight: 950, fontSize: 20 }}>{DEST.label}</div>
                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.7,
                    marginTop: 4,
                    fontWeight: 700,
                  }}
                >
                  Clicca per aprire su Maps →
                </div>
              </div>
            </a>
          </Reveal>

          {/* ORARI */}
          <Reveal>
            <div className="card serviceCard cardHover">
              <div className="iconBox">
                <Clock size={22} />
              </div>
              <div>
                <div className="serviceTitle">Orari</div>
                <div style={{ fontWeight: 950, fontSize: 20 }}>
                  Lun–Ven 8:00–18:00 | Sab 8:00–13:00
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottone indicazioni + stato geolocalizzazione */}
        <Reveal>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a
              className="btnAnim"
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "14px 18px",
                borderRadius: 16,
                background: "#0b1220",
                color: "white",
                fontWeight: 950,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Navigation size={18} />
              Indicazioni
            </a>

            <a
              className="btnAnim"
              href="tel:091406911"
              style={{
                padding: "14px 18px",
                borderRadius: 16,
                background: "#e53935",
                color: "white",
                fontWeight: 950,
                textDecoration: "none",
              }}
            >
              📞 Chiama Adesso
            </a>
          </div>

          {geoText && (
            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontWeight: 800,
                opacity: 0.75,
              }}
            >
              {geoText}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}