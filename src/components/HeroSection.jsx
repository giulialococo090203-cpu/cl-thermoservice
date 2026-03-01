import Reveal from "./Reveal";
import { ShieldCheck, Clock, PhoneCall, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "78vh",
        position: "relative",
        borderRadius: 32,
        overflow: "hidden",
        margin: "22px auto 0",
        maxWidth: 1180,
        boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
      }}
    >
      {/* background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.05)",
        }}
      />

      {/* overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(13,27,59,0.92) 0%, rgba(13,27,59,0.75) 46%, rgba(13,27,59,0.30) 100%)",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          padding: "84px 22px",
          maxWidth: 1180,
        }}
      >
        <Reveal>
          <div
            className="pill"
            style={{
              marginBottom: 18,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ShieldCheck size={18} />
            Centro Assistenza Autorizzato
          </div>
        </Reveal>

        <Reveal>
          <h1
            style={{
              color: "white",
              fontSize: 54,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
              fontWeight: 1000,
              maxWidth: 760,
            }}
          >
            Assistenza caldaie
            <br />
            <span style={{ color: "#e53935" }}>rapida e professionale</span>
          </h1>
        </Reveal>

        <Reveal>
          <p
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 18,
              maxWidth: 720,
              margin: "0 0 26px",
              fontWeight: 650,
              lineHeight: 1.6,
            }}
          >
            Installazione, manutenzione e riparazione di caldaie e impianti termici. Interventi rapidi con tecnici qualificati.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <PhoneCall size={18} />
              Chiama ora
            </a>

            <a
              className="btnAnim"
              href="#servizi"
              style={{
                padding: "14px 18px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.92)",
                color: "#0b1220",
                fontWeight: 950,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Scopri i servizi
              <ArrowRight size={18} />
            </a>
          </div>
        </Reveal>

        <Reveal>
          <div
            style={{
              marginTop: 22,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 850,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Clock size={18} />
            Lun–Ven 8–18 | Sab 8–13
          </div>
        </Reveal>
      </div>
    </section>
  );
}