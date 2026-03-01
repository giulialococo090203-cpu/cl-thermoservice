import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function formatDateTime(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const loadReviews = async () => {
    setReviewsError("");
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setReviewsError(err?.message || "Errore caricamento recensioni");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const deleteReview = async (id) => {
    if (!confirm("Eliminare questa recensione?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return alert("Errore eliminazione: " + error.message);
    await loadReviews();
  };

  const replyReview = async (id, replyText) => {
    const txt = (replyText || "").trim();
    if (!txt) return alert("Scrivi una risposta.");
    const { error } = await supabase
      .from("reviews")
      .update({
        reply: txt,
        reply_by: "CL. Thermoservice",
        reply_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return alert("Errore risposta: " + error.message);
    await loadReviews();
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
  };

  const btn = (variant = "primary") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 800,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
    };
    if (variant === "dark")
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    if (variant === "ghost") return { ...base, background: "#fff", color: "#0b1224" };
    if (variant === "softDanger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
  };

  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Gestione recensioni</div>
      <div style={{ marginTop: 8, color: "#475569", fontWeight: 700 }}>
        Puoi rispondere come CL. Thermoservice oppure eliminare le recensioni.
      </div>

      {reviewsError && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontWeight: 900,
          }}
        >
          {reviewsError}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={btn("ghost")} onClick={loadReviews}>
          Aggiorna recensioni
        </button>
      </div>

      {reviewsLoading ? (
        <div style={{ marginTop: 12, fontWeight: 800 }}>Caricamento…</div>
      ) : reviews.length === 0 ? (
        <div style={{ marginTop: 12, fontWeight: 800, color: "#64748b" }}>Nessuna recensione presente.</div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {reviews.map((r) => (
            <AdminReviewRow
              key={r.id}
              review={r}
              onDelete={() => deleteReview(r.id)}
              onSave={(txt) => replyReview(r.id, txt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminReviewRow({ review, onDelete, onSave }) {
  const [replyText, setReplyText] = useState(review.reply || "");

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.12)",
        borderRadius: 20,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>
            {review.name || "Cliente"}{" "}
            <span style={{ fontSize: 12, fontWeight: 900, color: "#334155", marginLeft: 6 }}>
              ⭐ {review.rating ?? "-"}
            </span>
          </div>
          <div style={{ marginTop: 4, color: "#94a3b8", fontWeight: 800 }}>
            {formatDateTime(review.created_at)} • ID: {review.id}
          </div>
        </div>

        <button type="button" onClick={onDelete} style={{
          borderRadius: 16,
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #fecaca",
          background: "#fee2e2",
          color: "#991b1b",
          cursor: "pointer",
        }}>
          Elimina
        </button>
      </div>

      {review.message && (
        <div style={{ marginTop: 10, fontWeight: 700, color: "#334155", whiteSpace: "pre-wrap" }}>
          {review.message}
        </div>
      )}

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Risposta come CL. Thermoservice"
          rows={3}
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.15)",
            fontWeight: 700,
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onSave(replyText)}
            style={{
              borderRadius: 16,
              padding: "10px 14px",
              fontWeight: 900,
              border: "1px solid #0b1224",
              background: "#0b1224",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Salva risposta
          </button>

          {review.reply ? (
            <div style={{ alignSelf: "center", color: "#64748b", fontWeight: 800 }}>
              Risposto da: <b>{review.reply_by || "CL. Thermoservice"}</b>{" "}
              {review.reply_at ? `(${formatDateTime(review.reply_at)})` : ""}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}