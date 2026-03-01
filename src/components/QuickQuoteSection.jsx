import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function QuickQuoteSection() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("quotes").insert([
      { nome, cognome, telefono, email, messaggio },
    ]);

    setLoading(false);

    if (error) {
      alert(`Errore invio richiesta: ${error.message}`);
      return;
    }

    alert("Richiesta inviata con successo!");
    setNome("");
    setCognome("");
    setTelefono("");
    setEmail("");
    setMessaggio("");
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 700,
    outline: "none",
  };

  return (
    <section id="preventivo" style={{ padding: "78px 0" }}>
      <div style={{ width: "min(1120px, 92vw)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: ".16em",
              fontWeight: 800,
              fontSize: 12,
              color: "rgba(255,255,255,0.70)",
            }}
          >
            PREVENTIVO
          </div>
          <h2
            style={{
              margin: "12px 0 10px",
              fontSize: "clamp(32px, 4vw, 46px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              fontWeight: 900,
              color: "white",
            }}
          >
            Richiedi un preventivo
          </h2>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontWeight: 600, lineHeight: 1.7 }}>
            Compila il form: la richiesta finisce nel pannello admin.
          </p>
        </div>

        <div
          style={{
            marginTop: 22,
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 24px 70px rgba(2,6,23,0.35)",
            padding: 18,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 840, margin: "0 auto" }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputStyle} />
              <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required style={inputStyle} />
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
            </div>

            <textarea
              placeholder="Messaggio"
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              required
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.92)",
                color: "#0b1220",
                fontWeight: 950,
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Invio..." : "Invia richiesta"}
            </button>
          </form>
        </div>

        <style>{`
          @media(max-width: 860px){
            #preventivo form > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}