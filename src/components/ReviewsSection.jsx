import { useEffect, useState } from "react";
import Reveal from "./Reveal";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem("reviews");
    if (saved) setReviews(JSON.parse(saved));
  }, []);

  const saveReviews = (data) => {
    setReviews(data);
    localStorage.setItem("reviews", JSON.stringify(data));
  };

  const addReview = (e) => {
    e.preventDefault();
    if (!name || !text) return;

    const newReviews = [
      {
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        name,
        text,
        rating,
        reply: "", // risposta azienda (solo admin)
        createdAt: new Date().toISOString(),
      },
      ...reviews,
    ];

    saveReviews(newReviews);
    setName("");
    setText("");
    setRating(5);
  };

  const stars = (n) => "⭐".repeat(n);

  return (
    <section id="recensioni" className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <div className="kicker">RECENSIONI</div>
            <h2 className="h2">Cosa dicono i nostri clienti</h2>
            <p className="lead">
              Le risposte ufficiali sono pubblicate da CL Thermoservice.
            </p>
          </div>
        </Reveal>

        {/* FORM RECENSIONE */}
        <Reveal>
          <form
            onSubmit={addReview}
            className="card"
            style={{ padding: 20, marginTop: 20, borderRadius: 20 }}
          >
            <h3 style={{ marginTop: 0 }}>Lascia una recensione</h3>

            <input
              className="input"
              placeholder="Il tuo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <textarea
              className="textarea"
              placeholder="Scrivi la tua esperienza..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              style={{ marginTop: 10 }}
            />

            <div style={{ marginTop: 10, fontWeight: 800 }}>
              Valutazione:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ marginLeft: 10 }}
              >
                <option value={5}>⭐⭐⭐⭐⭐</option>
                <option value={4}>⭐⭐⭐⭐</option>
                <option value={3}>⭐⭐⭐</option>
                <option value={2}>⭐⭐</option>
                <option value={1}>⭐</option>
              </select>
            </div>

            <button
              className="btnAnim"
              style={{
                marginTop: 14,
                padding: "12px 18px",
                borderRadius: 12,
                background: "#e53935",
                color: "white",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
              }}
            >
              Invia recensione
            </button>
          </form>
        </Reveal>

        {/* LISTA */}
        <div style={{ marginTop: 30 }}>
          {reviews.map((r) => (
            <Reveal key={r.id}>
              <div
                className="card"
                style={{
                  padding: 20,
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontWeight: 900 }}>{r.name}</div>
                <div>{stars(r.rating)}</div>
                <p style={{ marginTop: 8 }}>{r.text}</p>

                {r.reply && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: "#f1f5f9",
                      fontWeight: 800,
                    }}
                  >
                    <span style={{ fontWeight: 1000 }}>Risposta CL Thermoservice:</span>{" "}
                    {r.reply}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}