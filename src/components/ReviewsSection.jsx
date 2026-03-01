import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function Stars({ value, onChange, size = 22 }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          aria-label={`Valutazione ${n} stelle`}
          style={{
            width: size,
            height: size,
            border: 0,
            background: "transparent",
            cursor: onChange ? "pointer" : "default",
            padding: 0,
            lineHeight: 1,
            fontSize: size,
            opacity: value >= n ? 1 : 0.25,
            transform: value >= n ? "translateY(-1px)" : "none",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // form
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  async function loadReviews() {
    setLoading(true);
    setLoadErr("");
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, created_at, name, rating, text, reply, reply_by, reply_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setReviews(data || []);
    } catch (e) {
      setLoadErr(e?.message || "Errore nel caricamento recensioni");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Inserisci il nome.");
    if (!text.trim()) return alert("Scrivi la recensione.");
    if (rating < 1 || rating > 5) return alert("Scegli una valutazione da 1 a 5.");

    setSending(true);
    try {
      const payload = {
        name: name.trim(),
        rating,
        text: text.trim(),
      };

      const { error } = await supabase.from("reviews").insert([payload]);
      if (error) throw error;

      // pulizia form + reload lista
      setName("");
      setRating(5);
      setText("");
      await loadReviews();

      alert("Recensione inviata! Grazie 🙏");
    } catch (e2) {
      console.error(e2);
      alert("Errore invio recensione: " + (e2?.message || "riprova"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="recensioni" style={{ padding: "72px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 40, letterSpacing: -0.5 }}>Recensioni</h2>
            <p style={{ margin: "10px 0 0", color: "rgba(12,19,38,0.75)", fontWeight: 650 }}>
              La soddisfazione dei clienti è la nostra priorità.
            </p>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(99,102,241,0.10)",
              border: "1px solid rgba(99,102,241,0.18)",
              fontWeight: 850,
              color: "rgba(12,19,38,0.9)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{avg ? `${avg}/5` : "—/5"}</span>
            <Stars value={Math.round(avg)} size={18} />
            <span style={{ opacity: 0.7 }}>({reviews.length})</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          {/* FORM INSERIMENTO RECENSIONE (CLIENTI) */}
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(15,23,42,0.10)",
              borderRadius: 22,
              padding: 18,
              boxShadow: "0 18px 50px rgba(2,6,23,0.06)",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 20, marginBottom: 10 }}>
              Lascia una recensione
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 12 }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome e Cognome"
                  style={inputStyle}
                />

                <div
                  style={{
                    ...inputStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontWeight: 850, opacity: 0.85 }}>Valutazione</span>
                  <Stars value={rating} onChange={setRating} />
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Scrivi la tua esperienza (es. puntualità, intervento, pulizia, ecc.)"
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: 0,
                    background: "#0b1224",
                    color: "white",
                    fontWeight: 900,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.75 : 1,
                  }}
                >
                  {sending ? "Invio..." : "Invia recensione"}
                </button>

                <button
                  type="button"
                  onClick={loadReviews}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: "1px solid rgba(15,23,42,0.16)",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Aggiorna
                </button>
              </div>
            </form>
          </div>

          {/* LISTA RECENSIONI */}
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(15,23,42,0.10)",
              borderRadius: 22,
              padding: 18,
              boxShadow: "0 18px 50px rgba(2,6,23,0.06)",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 20, marginBottom: 10 }}>
              Cosa dicono i clienti
            </div>

            {loadErr ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.18)",
                  color: "rgba(140,0,0,0.95)",
                  fontWeight: 900,
                }}
              >
                {loadErr}
              </div>
            ) : null}

            {loading ? (
              <div style={{ padding: 10, fontWeight: 800, color: "rgba(12,19,38,0.75)" }}>
                Caricamento recensioni…
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: 10, fontWeight: 800, color: "rgba(12,19,38,0.75)" }}>
                Nessuna recensione ancora. Sii il primo 🙂
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(15,23,42,0.10)",
                      padding: 14,
                      background: "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>
                          {r.name}
                        </div>
                        <div style={{ marginTop: 6, color: "rgba(12,19,38,0.6)", fontWeight: 700, fontSize: 13 }}>
                          {new Date(r.created_at).toLocaleDateString("it-IT")}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Stars value={r.rating} size={18} />
                        <span style={{ fontWeight: 900, color: "rgba(12,19,38,0.75)" }}>
                          {r.rating}/5
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 650, color: "rgba(12,19,38,0.9)" }}>
                      {r.text}
                    </div>

                    {r.reply ? (
                      <div
                        style={{
                          marginTop: 12,
                          borderLeft: "4px solid rgba(99,102,241,0.55)",
                          paddingLeft: 12,
                          background: "rgba(99,102,241,0.06)",
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 950, color: "#0b1224" }}>
                          Risposta {r.reply_by || "CL. Thermoservice"}
                        </div>
                        <div style={{ marginTop: 6, fontWeight: 650, color: "rgba(12,19,38,0.88)" }}>
                          {r.reply}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.15)",
  outline: "none",
  fontWeight: 800,
  fontSize: 16,
  background: "rgba(255,255,255,0.95)",
};