import { useEffect, useMemo, useState } from "react";
import { Star, Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import Reveal from "./Reveal";

function Stars({ value, onChange, size = 18, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
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
              flex: "0 0 auto",
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

  const [name, setName] = useState("");
  const [technicianName, setTechnicianName] = useState("");
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
        .select("id, created_at, name, technician_name, rating, message, reply_text, replied_at")
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
  }, []);

  const sendReviewNotification = async (payload) => {
    try {
      const { error } = await supabase.functions.invoke("review-notify", {
        body: payload,
      });

      if (error) {
        console.error("Errore invio notifica recensione:", error);
      }
    } catch (e) {
      console.error("Errore chiamata review-notify:", e);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setOkMsg("");
    setErrorMsg("");

    const safeName = name.trim();
    const safeTech = technicianName.trim();
    const safeMsg = message.trim();
    const safeRating = Number(rating) || 5;

    if (!safeName) return setErrorMsg("Inserisci il nome.");
    if (!safeMsg) return setErrorMsg("Scrivi un messaggio nella recensione.");

    setSending(true);
    try {
      const payload = {
        name: safeName,
        technician_name: safeTech || null,
        rating: safeRating,
        message: safeMsg,
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert([payload])
        .select("id, created_at, name, technician_name, rating, message")
        .single();

      if (error) throw error;

      await sendReviewNotification({
        review: {
          id: data?.id || null,
          created_at: data?.created_at || new Date().toISOString(),
          name: data?.name || safeName,
          technician_name: data?.technician_name || safeTech || null,
          rating: data?.rating || safeRating,
          message: data?.message || safeMsg,
        },
        recipients: [
          "giulialococo090203@gmail.com",
          "clthermoservice@virgilio.it",
        ],
      });

      setOkMsg("Recensione inviata. Grazie.");
      setName("");
      setTechnicianName("");
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
            className="reviewsTop"
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
                  fontSize: "clamp(30px, 5vw, 42px)",
                  letterSpacing: "-0.03em",
                  color: "#0b1220",
                  lineHeight: 1.08,
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
                width: "min(100%, 260px)",
              }}
            >
              <div style={{ fontWeight: 950, color: "#0b1220" }}>Media voti</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                <Stars value={Math.round(avg || 0)} readOnly size={18} />
                <div style={{ fontWeight: 1000 }}>{avg ?? "-"}</div>
                <div style={{ opacity: 0.65, fontWeight: 800 }}>({reviews.length})</div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="reviewsMainGrid" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 18, marginTop: 22 }}>
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
                    <div
                      className="reviewCardTop"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 1000, color: "#0b1220", minWidth: 0 }}>
                        {r.name || "Cliente"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <Stars value={Number(r.rating) || 0} readOnly size={16} />
                        <div style={{ fontWeight: 900, opacity: 0.75, fontSize: 13 }}>
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

                    {r.technician_name ? (
                      <div style={{ marginTop: 6, fontWeight: 850, color: "rgba(15,23,42,.72)" }}>
                        Tecnico: <span style={{ fontWeight: 950, color: "#0b1220" }}>{r.technician_name}</span>
                      </div>
                    ) : null}

                    <div style={{ marginTop: 8, fontWeight: 750, color: "rgba(15,23,42,.80)", lineHeight: 1.55 }}>
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
                        <div style={{ fontWeight: 800, opacity: 0.85, lineHeight: 1.5 }}>{r.reply_text}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              borderRadius: 26,
              border: "1px solid rgba(15,23,42,.10)",
              background: "rgba(255,255,255,.92)",
              boxShadow: "0 18px 50px rgba(15,23,42,.08)",
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: "clamp(22px, 4vw, 26px)", letterSpacing: "-0.02em" }}>
              Lascia una recensione
            </div>
            <div style={{ marginTop: 6, opacity: 0.7, fontWeight: 750, lineHeight: 1.5 }}>
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
                  width: "100%",
                }}
              />

              <input
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Tecnico che ha effettuato il lavoro (opzionale)"
                style={{
                  padding: "14px 14px",
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,.12)",
                  fontWeight: 800,
                  outline: "none",
                  width: "100%",
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
                  flexWrap: "wrap",
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
                  width: "100%",
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
                  width: "100%",
                }}
              >
                <Send size={18} /> {sending ? "Invio…" : "Invia recensione"}
              </button>
            </form>
          </div>
        </div>

        <style>{`
          @media (max-width: 980px){
            #recensioni .reviewsMainGrid{
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 640px){
            #recensioni{
              padding: 54px 0 !important;
            }

            #recensioni .reviewCardTop{
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}