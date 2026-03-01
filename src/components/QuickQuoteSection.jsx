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
    nome: nome,
    cognome: cognome,
    telefono: telefono,
    email: email,
    messaggio: messaggio,
  },
]);
    if (error) {
      console.error(error);
     alert(`Errore invio richiesta: ${error.message}`);
    } else {
      alert("Richiesta inviata con successo!");
      setNome("");
      setCognome("");
      setTelefono("");
      setEmail("");
      setMessaggio("");
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
        <input placeholder="Cognome" value={cognome} onChange={(e)=>setCognome(e.target.value)} />
        <input placeholder="Telefono" value={telefono} onChange={(e)=>setTelefono(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <textarea placeholder="Messaggio" value={messaggio} onChange={(e)=>setMessaggio(e.target.value)} />
        <button type="submit">Invia richiesta</button>
      </form>
    </section>
  );
}