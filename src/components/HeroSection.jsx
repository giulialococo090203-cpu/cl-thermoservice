import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import BrandsSection from "./BrandsSection";
import { ShieldCheck, Clock, PhoneCall, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const images = useMemo(
    () => ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg", "/hero-5.jpg"],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % images.length);
    }, 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        borderRadius: 32,
        overflow: "hidden",
        margin: "18px auto 0",
        maxWidth: 1180,
        boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {images.map((src, i) => (
          <div
            key={src}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.05)",
              opacity: i === idx ? 1 : 0,
              transition: "opacity 900ms ease, transform 900ms ease",
              transform: i === idx ? "scale(1.02)" : "scale(1.00)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(13,27,59,0.92) 0%, rgba(13,27,59,0.75) 46%, rgba(13,27,59,0.30) 100%)",
        }}
      />

      <div
        className="container hero-main-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1180,
          padding: "76px 22px 120px",
        }}
      >
        <Reveal>
          <div
            className="pill hero-badge-mobile"
            style={{
              marginBottom: 18,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              maxWidth: "100%",
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
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
              fontWeight: 1000,
              maxWidth: 860,
              textWrap: "balance",
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
              maxWidth: 760,
              margin: "0 0 26px",
              fontWeight: 650,
              lineHeight: 1.6,
            }}
          >
            Installazione, manutenzione e riparazione di caldaie e impianti termici.
            Interventi rapidi con tecnici qualificati.
          </p>
        </Reveal>

        <Reveal>
          <div className="hero-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              className="btnAnim hero-cta-btn"
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
                justifyContent: "center",
                gap: 10,
              }}
            >
              <PhoneCall size={18} />
              Chiama ora
            </a>

            <a
              className="btnAnim hero-cta-btn"
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
                justifyContent: "center",
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
            className="hero-hours"
            style={{
              marginTop: 22,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 850,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Clock size={18} />
            Lun–Ven 8–18 | Sab 8–13
          </div>
        </Reveal>
      </div>

      <div
        className="hero-brands-wrap"
        style={{
          position: "relative",
          marginTop: -116,
          padding: "0 18px 22px",
          zIndex: 3,
        }}
      >
        <BrandsSection variant="hero" />
      </div>

      <style>{`
        @media (max-width: 1100px){
          #hero h1{
            font-size: 48px !important;
          }
        }

        @media (max-width: 820px){
          #hero .hero-main-content{
            padding: 60px 18px 98px !important;
          }

          #hero h1{
            font-size: 40px !important;
            max-width: 100% !important;
          }

          #hero .hero-brands-wrap{
            margin-top: -86px !important;
          }
        }

        @media (max-width: 640px){
          #hero{
            border-radius: 24px !important;
            margin-top: 14px !important;
          }

          #hero .hero-main-content{
            padding: 44px 16px 72px !important;
          }

          #hero h1{
            font-size: 32px !important;
            line-height: 1.06 !important;
            margin-bottom: 12px !important;
          }

          #hero p{
            font-size: 15px !important;
            line-height: 1.55 !important;
            max-width: 100% !important;
            margin-bottom: 20px !important;
          }

          #hero .hero-cta-row{
            display: grid !important;
            grid-template-columns: 1fr !important;
            width: 100% !important;
          }

          #hero .hero-cta-btn{
            width: 100% !important;
          }

          #hero .hero-hours{
            font-size: 14px !important;
            line-height: 1.4 !important;
          }

          #hero .hero-brands-wrap{
            margin-top: -56px !important;
            padding: 0 12px 14px !important;
          }

          #hero .hero-badge-mobile{
            font-size: 13px !important;
            line-height: 1.35 !important;
          }
        }

        @media (max-width: 420px){
          #hero h1{
            font-size: 28px !important;
          }

          #hero .hero-main-content{
            padding: 40px 14px 64px !important;
          }

          #hero .hero-brands-wrap{
            margin-top: -42px !important;
            padding: 0 10px 10px !important;
          }
        }
      `}</style>
    </section>
  );
}