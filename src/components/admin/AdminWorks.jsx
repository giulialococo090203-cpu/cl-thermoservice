import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminWorks() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const loadWorks = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (e) {
      setErr(e?.message || "Errore caricamento lavori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const makeFileName = (originalName) => {
    const safe = (originalName || "file").replace(/\s+/g, "-");
    const ext = safe.includes(".") ? safe.split(".").pop() : "jpg";
    const base = safe.replace(/\.[^/.]+$/, "");
    const uid =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now());
    return `${Date.now()}-${uid}-${base}.${ext}`.toLowerCase();
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    setErr("");

    if (!file) return setErr("Seleziona una foto.");
    if (!title.trim()) return setErr("Inserisci un titolo.");
    if (!description.trim()) return setErr("Inserisci una descrizione.");

    setLoading(true);
    try {
      const storagePath = makeFileName(file.name);

      const { error: upErr } = await supabase.storage.from("works").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("works").getPublicUrl(storagePath);
      const image_url = pub?.publicUrl;
      if (!image_url) throw new Error("Impossibile ottenere public URL dell’immagine.");

      const { error: insErr } = await supabase.from("works").insert([
        {
          title: title.trim(),
          description: description.trim(),
          image_url,
          storage_path: storagePath,
        },
      ]);
      if (insErr) throw insErr;

      setTitle("");
      setDescription("");
      setFile(null);

      await loadWorks();
      alert("✅ Lavoro pubblicato!");
    } catch (e2) {
      setErr(e2?.message || "Errore pubblicazione lavoro");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = async (w) => {
    if (!confirm("Eliminare questo lavoro? (foto + record)")) return;
    setErr("");
    setLoading(true);

    try {
      const { error: delErr } = await supabase.from("works").delete().eq("id", w.id);
      if (delErr) throw delErr;

      if (w.storage_path) {
        await supabase.storage.from("works").remove([w.storage_path]);
      }

      await loadWorks();
    } catch (e) {
      setErr(e?.message || "Errore eliminazione lavoro");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Gestione lavori (foto + descrizione)
      </div>

      {err && (
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
          {err}
        </div>
      )}

      <form onSubmit={handleCreateWork} style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 720 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo lavoro"
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.15)",
            fontWeight: 800,
          }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione lavoro"
          rows={4}
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.15)",
            fontWeight: 800,
            resize: "vertical",
          }}
        />

        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              borderRadius: 16,
              padding: "12px 16px",
              fontWeight: 900,
              border: "1px solid #0b1224",
              background: "#0b1224",
              color: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Pubblico..." : "Pubblica lavoro"}
          </button>

          <button
            type="button"
            onClick={loadWorks}
            style={{
              borderRadius: 16,
              padding: "12px 16px",
              fontWeight: 900,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Aggiorna
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>Lavori pubblicati</div>

      {works.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>Nessun lavoro presente.</div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {works.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 20,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "120px 1fr 140px",
                gap: 12,
                alignItems: "start",
              }}
            >
              <img
                src={w.image_url}
                alt={w.title}
                style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 14 }}
              />
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{w.title}</div>
                <div style={{ marginTop: 6, fontWeight: 800, color: "#334155" }}>{w.description}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleDeleteWork(w)}
                  style={{
                    borderRadius: 16,
                    padding: "10px 14px",
                    fontWeight: 900,
                    border: "1px solid #fecaca",
                    background: "#fee2e2",
                    color: "#991b1b",
                    cursor: "pointer",
                    height: 42,
                  }}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}