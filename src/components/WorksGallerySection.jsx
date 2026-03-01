import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Reveal from "./Reveal";

export default function WorksGallerySection() {
  const [works, setWorks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorks();
  }, []);

  async function fetchWorks() {
    setError("");
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setWorks(data || []);
  }

  if (error) {
    return (
      <section id="lavori" className="section">
        <div className="container">
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 900,
            }}
          >
            Errore caricamento lavori: {error}
          </div>
        </div>
      </section>
    );
  }

  if (!works.length) return null;

  return (
    <section id="lavori" className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">LAVORI SVOLTI</div>
            <h2 className="h2">Alcuni dei nostri lavori</h2>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
            marginTop: 26,
          }}
        >
          {works.map((w) => (
            <Reveal key={w.id}>
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(2,6,23,0.10)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "#fff",
                }}
              >
                <img
                  src={w.image_url}
                  alt={w.title}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 1000, fontSize: 18 }}>
                    {w.title}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: "#334155",
                      fontWeight: 750,
                    }}
                  >
                    {w.description}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}