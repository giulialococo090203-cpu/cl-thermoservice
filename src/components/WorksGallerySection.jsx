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

    if (!error) setWorks(data);
  }

  if (!works.length) return null;

  return (
    <section style={{ padding: "80px 20px" }}>
      <h2 style={{ textAlign: "center", fontSize: 32 }}>
        I nostri lavori
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 30,
          marginTop: 40,
        }}
      >
        {works.map((work) => (
          <div
            key={work.id}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={work.image_url}
              style={{ width: "100%", height: 220, objectFit: "cover" }}
            />

            <div style={{ padding: 20 }}>
              <h3>{work.title}</h3>
              <p>{work.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}