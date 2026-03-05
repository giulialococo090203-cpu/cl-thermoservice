import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "../supabaseClient";
import Reveal from "./Reveal";

export default function UsefulLinksSection() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("useful_links")
      .select("id, created_at, title, url, description")
      .order("created_at", { ascending: false });

    if (!error) setLinks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (!loading && links.length === 0) return null;

  return (
    <section id="link-utili" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">LINK UTILI</div>
          <h2 className="h2">Collegamenti rapidi a siti utili</h2>
        </div>

        {loading ? (
          <div
            style={{
              marginTop: 18,
              textAlign: "center",
              fontWeight: 800,
              opacity: 0.7,
            }}
          >
            Caricamento…
          </div>
        ) : (
          <div
            className="grid2"
            style={{
              marginTop: 26,
              alignItems: "stretch",
            }}
          >
            {links.map((l) => (
              <Reveal key={l.id}>
                <a
                  className="card cardHover"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="iconBox"
                    style={{
                      width: 52,
                      height: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ExternalLink size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 950,
                        fontSize: 18,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {l.title}
                    </div>

                    {l.description && (
                      <div
                        style={{
                          marginTop: 8,
                          fontWeight: 700,
                          opacity: 0.78,
                          lineHeight: 1.55,
                        }}
                      >
                        {l.description}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 10,
                        fontWeight: 900,
                        color: "#1f4b8f",
                      }}
                    >
                      Apri link →
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}