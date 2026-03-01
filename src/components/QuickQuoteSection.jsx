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
      {
        nome,
        cognome,
        telefono,
        email,
        messaggio,
      },
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

  return (
    <section id="preventivo" className="section">
      <div className="container softPanel">
        <div className="sectionHeader">
          <div className="kicker">PREVENTIVO</div>
          <h2 className="h2">Richiedi un preventivo</h2>
          <p className="lead">
            Compila il form: la richiesta finisce nel pannello admin.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
            maxWidth: 720,
          }}
        >
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              placeholder="Cognome"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <input
              placeholder="Telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              style={inputStyle}
            />
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
              border: "1px solid #0b1224",
              background: "#0b1224",
              color: "#fff",
              fontWeight: 950,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Invio..." : "Invia richiesta"}
          </button>
        </form>
      </div>
    </section>
  );
}

const inputStyle = {
  padding: "14px 14px",
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.15)",
  fontWeight: 800,
  outline: "none",
};