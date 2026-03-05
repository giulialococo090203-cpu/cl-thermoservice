import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function WorksGallerySection() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchWorks();
  }, []);

  async function fetchWorks() {
    setLoading(true);

    const { data, error } = await supabase
      .from("works")
      .select("id, created_at, title, description, image_url, media_url, media_type")
      .order("created_at", { ascending: false });

    if (!error) setWorks(data || []);
    setLoading(false);
  }

  const activeWork = useMemo(() => works[activeIndex] || null, [works, activeIndex]);

  const getUrl = (w) => w.media_url || w.image_url;
  const isVideo = (w) => w.media_type === "video";

  const openModal = (idx) => {
    setActiveIndex(idx);
    setOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setOpen(false);
    document.body.style.overflow = "auto";
  };

  const goPrev = () => {
    setActiveIndex((i) => (i - 1 + works.length) % works.length);
  };

  const goNext = () => {
    setActiveIndex((i) => (i + 1) % works.length);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, works.length]);

  if (!works.length && !loading) return null;

  return (
    <section id="lavori" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div className="kicker">LAVORI</div>
          <h2 className="h2">Alcuni dei nostri lavori</h2>
        </div>

        {loading ? (
          <div style={{ marginTop: 20, fontWeight: 800 }}>Caricamento lavori…</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 20,
              marginTop: 30,
            }}
          >
            {works.map((work, idx) => (
              <button
                key={work.id}
                onClick={() => openModal(idx)}
                style={{
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  boxShadow: "0 14px 40px rgba(15,23,42,0.10)",
                }}
              >
                {isVideo(work) ? (
                  <div style={{ position: "relative" }}>
                    <video
                      src={getUrl(work)}
                      preload="metadata"
                      muted
                      playsInline
                      crossOrigin="anonymous"
                      controls={false}
                      poster={getUrl(work)}
                      style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        background: "rgba(0,0,0,0.55)",
                        color: "white",
                      }}
                    >
                      Video
                    </div>
                  </div>
                ) : (
                  <img
                    src={getUrl(work)}
                    alt={work.title}
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}

                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{work.title}</div>
                  <div style={{ marginTop: 8, opacity: 0.8 }}>{work.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {open && activeWork && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "grid",
            placeItems: "center",
            zIndex: 5000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1000px, 95vw)",
              background: "#fff",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 14,
                borderBottom: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ fontWeight: 900 }}>{activeWork.title}</div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={goPrev} style={iconBtn}><ChevronLeft size={18} /></button>
                <button onClick={goNext} style={iconBtn}><ChevronRight size={18} /></button>
                <button onClick={closeModal} style={iconBtn}><X size={18} /></button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr" }}>
              <div style={{ background: "#000" }}>
                {isVideo(activeWork) ? (
                  <video
                    key={activeWork.id}
                    src={getUrl(activeWork)}
                    autoPlay
                    muted
                    playsInline
                    controls
                    style={{
                      width: "100%",
                      height: "min(65vh, 600px)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={getUrl(activeWork)}
                    alt={activeWork.title}
                    style={{
                      width: "100%",
                      height: "min(65vh, 600px)",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{activeWork.title}</div>
                <div style={{ marginTop: 14, lineHeight: 1.6 }}>
                  {activeWork.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};