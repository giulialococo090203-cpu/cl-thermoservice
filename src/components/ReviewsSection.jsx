import { useEffect, useMemo, useState } from "react";
import { Star, Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import Reveal from "./Reveal";

// Expected Supabase table: public.reviews
// Columns: id, created_at, name, rating, message (NOT NULL)
// Optional: reply_text, replied_at

function Stars({ value, onChange, size = 18, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      {stars.map((s) => {
        const filled = s <= value;
        return (
          <button
            key={s}
            type="button"
            onClick={() => !readOnly && onChange?.(s)}
            aria-label={`Voto ${s} su 5`}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: readOnly ? "default" : "pointer",
              opacity: filled ? 1 : 0.35,
            }}
          >
            <Star size={size} fill={filled ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewsSection() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [reviews, setReviews] = useState([]);

  // form
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const avg = useMemo(() => {
    if (!reviews?.length) return null;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, created_at, name, rating, message, reply_text, replied_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || "Errore caricamento recensioni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setOkMsg("");
    setErrorMsg("");

    const safeName = name.trim();
    const safeMsg = message.trim();

    if (!safeName) return setErrorMsg("Inserisci il nome.");
    if (!safeMsg) return setErrorMsg("Scrivi un messaggio nella recensione.");

    setSending(true);
    try {
      const payload = {
        name: safeName,
        rating: Number(rating) || 5,
        message: safeMsg,
      };

      const { error } = await supabase.from("reviews").insert([payload]);
      if (error) throw error;

      setOkMsg("Recensione inviata. Grazie.");
      setName("");
      setRating(5);
      setMessage("");
      await load();
    } catch (e) {
      console.error(e);
      setErrorMsg(`Errore invio recensione: ${e?.message || ""}`.trim());
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="recensioni" style={{ padding: "70px 0" }}>
      <div style={{ width: "min(1120px, 92vw)", margin: "0 auto" }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 1000,
                  fontSize: 42,
                  letterSpacing: "-0.03em",
                  color: "#0b1220",
                }}
              >
                Recensioni
              </div>
              <div style={{ marginTop: 8, color: "rgba(15,23,42,.72)", fontWeight: 700 }}>
                Cosa dicono i clienti
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,.10)",
                background: "rgba(255,255,255,.9)",
                boxShadow: "0 10px 26px rgba(15,23,42,.06)",
                minWidth: 220,
              }}
            >
              <div style={{ fontWeight: 950, color: "#0b1220" }}>Media voti</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                <Stars value={Math.round(avg || 0)} readOnly size={18} />
                <div style={{ fontWeight: 1000 }}>{avg ?? "-"}</div>
                <div style={{ opacity: 0.65, fontWeight: 800 }}>({reviews.length})</div>
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 18, marginTop: 22 }}>
          {/* LISTA */}
          <div
            style={{
              borderRadius: 26,
              border: "1px solid rgba(15,23,42,.10)",
              background: "rgba(255,255,255,.92)",
              boxShadow: "0 18px 50px rgba(15,23,42,.08)",
              padding: 18,
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: 14, fontWeight: 800, opacity: 0.7 }}>Caricamento…</div>
            ) : errorMsg ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(239,68,68,.35)",
                  background: "rgba(239,68,68,.08)",
                  fontWeight: 850,
                  color: "#991b1b",
                }}
              >
                {errorMsg}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: 14, fontWeight: 900, opacity: 0.7 }}>
                Nessuna recensione ancora. Lascia la prima.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid rgba(15,23,42,.08)",
                      background: "rgba(255,255,255,.95)",
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 1000, color: "#0b1220" }}>{r.name || "Cliente"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Stars value={Number(r.rating) || 0} readOnly size={16} />
                        <div style={{ fontWeight: 900, opacity: 0.75 }}>
                          {new Date(r.created_at).toLocaleString("it-IT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, fontWeight: 750, color: "rgba(15,23,42,.80)", lineHeight: 1.45 }}>
                      {r.message}
                    </div>

                    {r.reply_text ? (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 16,
                          background: "rgba(15,23,42,.05)",
                          border: "1px solid rgba(15,23,42,.08)",
                        }}
                      >
                        <div style={{ fontWeight: 1000, marginBottom: 6 }}>
                          Risposta di <span style={{ color: "#e53935" }}>CL. Thermoservice</span>
                        </div>
                        <div style={{ fontWeight: 800, opacity: 0.85, lineHeight: 1.45 }}>{r.reply_text}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM */}
          <div
            style={{
              borderRadius: 26,
              border: "1px solid rgba(15,23,42,.10)",
              background: "rgba(255,255,255,.92)",
              boxShadow: "0 18px 50px rgba(15,23,42,.08)",
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: 26, letterSpacing: "-0.02em" }}>Lascia una recensione</div>
            <div style={{ marginTop: 6, opacity: 0.7, fontWeight: 750 }}>
              Aiuta altri clienti a scegliere un servizio affidabile.
            </div>

            <form onSubmit={submit} style={{ marginTop: 14, display: "grid", gap: 12 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
                style={{
                  padding: "14px 14px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,.12)",
                  fontWeight: 850,
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,.12)",
                }}
              >
                <div style={{ fontWeight: 950, opacity: 0.9 }}>Valutazione</div>
                <Stars value={rating} onChange={setRating} />
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrivi la tua esperienza…"
                rows={5}
                style={{
                  padding: "14px 14px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,.12)",
                  fontWeight: 800,
                  outline: "none",
                  resize: "vertical",
                }}
              />

              {errorMsg ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 18,
                    border: "1px solid rgba(239,68,68,.35)",
                    background: "rgba(239,68,68,.08)",
                    fontWeight: 850,
                    color: "#991b1b",
                  }}
                >
                  {errorMsg}
                </div>
              ) : null}

              {okMsg ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 18,
                    border: "1px solid rgba(34,197,94,.35)",
                    background: "rgba(34,197,94,.10)",
                    fontWeight: 850,
                    color: "#065f46",
                  }}
                >
                  {okMsg}
                </div>
              ) : null}

              <button
                className="btnAnim"
                type="submit"
                disabled={sending}
                style={{
                  padding: "14px 16px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,.10)",
                  background: "#0b1220",
                  color: "white",
                  fontWeight: 1000,
                  cursor: sending ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Send size={18} /> {sending ? "Invio…" : "Invia recensione"}
              </button>
            </form>
          </div>
        </div>

        <style>{`
          @media (max-width: 980px){
            #recensioni > div > div{ grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}