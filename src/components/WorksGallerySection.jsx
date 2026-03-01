import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function WorksGallerySection() {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    fetchWorks();
  }, []);

  async function fetchWorks() {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setWorks(data || []);
  }

  // se non vuoi che sparisca quando è vuoto, togli questa riga:
  if (!works.length) return null;

  return (
    <section id="lavori" className="section">
      <div className="container">
        <div className="sectionHeader">
          <div className="kicker">LAVORI SVOLTI</div>
          <h2 className="h2">Alcuni dei nostri lavori</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 30,
            marginTop: 30,
          }}
        >
          {works.map((work) => (
            <div
              key={work.id}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.10)",
                background: "#fff",
              }}
            >
              <img
                src={work.image_url}
                alt={work.title || "Lavoro"}
                style={{ width: "100%", height: 220, objectFit: "cover" }}
              />

              <div style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                  {work.title}
                </h3>
                <p style={{ marginTop: 10, opacity: 0.8, fontWeight: 700 }}>
                  {work.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}