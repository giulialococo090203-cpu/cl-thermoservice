import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Reveal from "./Reveal";

const TABLE = "faq_content";
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

const DEFAULT_FAQ = {
  title: "Domande frequenti",
  faqs: [],
  ctaTitle: "",
  ctaText: "",
  ctaButton: "",
};

export default function FaqSection() {
  const [faq, setFaq] = useState(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select("payload, updated_at")
          .eq("company_id", COMPANY_ID)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (alive && data?.payload && typeof data.payload === "object") {
          setFaq({ ...DEFAULT_FAQ, ...data.payload });
        }
      } catch (e) {
        console.log("FAQ load error:", e?.message || e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!faq) return null;

  const list = Array.isArray(faq.faqs) ? faq.faqs : [];

  return (
    <section id="faq" className="section">
      <div className="container">
        <div
          className="card"
          style={{
            borderRadius: 28,
            padding: 22,
            background:
              "radial-gradient(1000px 420px at 10% 0%, rgba(31,75,143,.10), transparent 60%), rgba(255,255,255,.55)",
            border: "1px solid rgba(15,23,42,.06)",
          }}
        >
          <Reveal>
            <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                {faq.title}
              </h2>
              <p className="lead" style={{ marginTop: 0 }}>
                Risposte rapide alle domande più comuni.
              </p>
            </div>
          </Reveal>

          <div style={{ maxWidth: 980, margin: "18px auto 0", display: "grid", gap: 12 }}>
            {list.map((f, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 22,
                    background: "rgba(255,255,255,.90)",
                    border: "1px solid rgba(15,23,42,.10)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      fontWeight: 950,
                      color: "rgba(15,23,42,.92)",
                      fontSize: 16,
                    }}
                  >
                    <span>{f.q}</span>
                    <span style={{ opacity: 0.55, fontWeight: 900 }}>{isOpen ? "—" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 16px 16px",
                        color: "rgba(15,23,42,.72)",
                        fontWeight: 650,
                        lineHeight: 1.75,
                      }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(faq.ctaTitle || faq.ctaText || faq.ctaButton) && (
            <Reveal>
              <div
                style={{
                  marginTop: 18,
                  borderRadius: 26,
                  padding: 18,
                  background:
                    "radial-gradient(700px 360px at 20% 15%, rgba(255,255,255,.12), transparent 60%), linear-gradient(135deg, rgba(155,44,42,.96), rgba(31,75,143,.96))",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 26px 70px rgba(2,6,23,.18)",
                  maxWidth: 980,
                  marginInline: "auto",
                  textAlign: "center",
                }}
              >
                {faq.ctaTitle ? (
                  <div style={{ fontSize: 22, fontWeight: 950 }}>{faq.ctaTitle}</div>
                ) : null}

                {faq.ctaText ? (
                  <div style={{ marginTop: 8, opacity: 0.92, fontWeight: 650, lineHeight: 1.6 }}>
                    {faq.ctaText}
                  </div>
                ) : null}

                {faq.ctaButton ? (
                  <button
                    type="button"
                    style={{
                      marginTop: 14,
                      borderRadius: 16,
                      padding: "12px 16px",
                      fontWeight: 950,
                      border: "1px solid rgba(255,255,255,.22)",
                      background: "rgba(255,255,255,.14)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const el = document.getElementById("contatti");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {faq.ctaButton}
                  </button>
                ) : null}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}