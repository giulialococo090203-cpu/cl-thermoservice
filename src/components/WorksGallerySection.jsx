import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function WorksGallerySection() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchWorks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchWorks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setWorks(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const activeWork = useMemo(() => works[activeIndex] || null, [works, activeIndex]);

  const openModal = (idx) => {
    setActiveIndex(idx);
    setOpen(true);
    // blocco scroll body
    const prev = document.body.style.overflow;
    document.body.dataset.prevOverflow = prev || "";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setOpen(false);
    // ripristino scroll body
    const prev = document.body.dataset.prevOverflow || "";
    document.body.style.overflow = prev;
    delete document.body.dataset.prevOverflow;
  };

  const goPrev = () => {
    if (!works.length) return;
    setActiveIndex((i) => (i - 1 + works.length) % works.length);
  };

  const goNext = () => {
    if (!works.length) return;
    setActiveIndex((i) => (i + 1) % works.length);
  };

  // ESC + frecce
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, works.length]);

  // se vuoi che non sparisca quando vuoto, togli questa riga:
  if (!works.length && !loading) return null;

  return (
    <section id="lavori" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div className="kicker">LAVORI</div>
          <h2 className="h2">Alcuni dei nostri lavori</h2>
        </div>

        {loading ? (
          <div
            style={{
              marginTop: 18,
              borderRadius: 22,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.70)",
              padding: 18,
              fontWeight: 800,
              color: "rgba(15,23,42,0.70)",
              textAlign: "center",
            }}
          >
            Caricamento lavori…
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 18,
              marginTop: 26,
            }}
          >
            {works.map((work, idx) => (
              <button
                key={work.id}
                type="button"
                onClick={() => openModal(idx)}
                style={{
                  textAlign: "left",
                  padding: 0,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 22,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 14px 40px rgba(15,23,42,0.10)",
                  transition: "transform 160ms ease, box-shadow 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 18px 50px rgba(15,23,42,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "0 14px 40px rgba(15,23,42,0.10)";
                }}
                aria-label={`Apri lavoro: ${work.title || "Lavoro"}`}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={work.image_url}
                    alt={work.title || "Lavoro"}
                    style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.30) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em" }}>
                    {work.title || "Lavoro"}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 650,
                      color: "rgba(15,23,42,0.75)",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {work.description || ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && activeWork && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dettaglio lavoro"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(6,12,24,0.55)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 94vw)",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 40px 120px rgba(2,6,23,0.40)",
              overflow: "hidden",
              transform: "translateY(0px)",
              animation: "worksModalIn 220ms ease both",
            }}
          >
            {/* top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: 14,
                borderBottom: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>
                {activeWork.title || "Lavoro"}
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Precedente"
                  style={iconBtnStyle}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Successivo"
                  style={iconBtnStyle}
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Chiudi"
                  style={iconBtnStyle}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 0.75fr",
                gap: 0,
              }}
            >
              <div style={{ background: "#0b1220" }}>
                <img
                  src={activeWork.image_url}
                  alt={activeWork.title || "Lavoro"}
                  style={{
                    width: "100%",
                    height: "min(64vh, 560px)",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 950, fontSize: 20, letterSpacing: "-0.02em" }}>
                  {activeWork.title || "Lavoro"}
                </div>

                {activeWork.created_at ? (
                  <div style={{ marginTop: 6, fontWeight: 700, color: "rgba(15,23,42,0.60)", fontSize: 13 }}>
                    {new Date(activeWork.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                ) : null}

                {activeWork.description ? (
                  <div
                    style={{
                      marginTop: 12,
                      fontWeight: 650,
                      color: "rgba(15,23,42,0.80)",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {activeWork.description}
                  </div>
                ) : null}

                <div style={{ marginTop: 16, borderTop: "1px solid rgba(15,23,42,0.08)", paddingTop: 14 }}>
                  <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.70)", fontSize: 13 }}>
                    Navigazione
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 700, color: "rgba(15,23,42,0.70)", fontSize: 13, lineHeight: 1.6 }}>
                    Usa <b>←</b> / <b>→</b> per cambiare lavoro, <b>ESC</b> per chiudere.
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes worksModalIn {
                from { opacity: 0; transform: translateY(10px) scale(0.99); }
                to { opacity: 1; transform: translateY(0px) scale(1); }
              }
              @media (max-width: 900px){
                .worksModalGridFix { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>

          <style>{`
            /* fix responsive grid inline */
            @media (max-width: 900px){
              [role="dialog"] > div > div:nth-child(2){
                grid-template-columns: 1fr !important;
              }
              [role="dialog"] img{
                height: min(52vh, 420px) !important;
              }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}

const iconBtnStyle = {
  width: 42,
  height: 42,
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};