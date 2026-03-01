import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function QuickQuoteSection() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("quotes").insert([
      {
        nome,
        cognome,
        telefono,
        email,
        messaggio,
      },
    ]);

    if (error) {
      console.error(error);
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
    <section id="preventivo" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, marginBottom: 16 }}>Richiedi un preventivo</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} />
          <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <textarea placeholder="Messaggio" value={messaggio} onChange={(e) => setMessaggio(e.target.value)} />

          <button type="submit">Invia richiesta</button>
        </form>
      </div>
    </section>
  );
}