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
    const ext = safe.includes(".") ? safe.split(".").pop() : "bin";
    const base = safe.replace(/\.[^/.]+$/, "");
    const uid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    return `${Date.now()}-${uid}-${base}.${ext}`.toLowerCase();
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    setErr("");

    if (!file) return setErr("Seleziona una foto o un video.");
    if (!title.trim()) return setErr("Inserisci un titolo.");
    if (!description.trim()) return setErr("Inserisci una descrizione.");

    setLoading(true);
    try {
      const storagePath = makeFileName(file.name);
      const isVideoFile = file.type.startsWith("video/");

      const { error: upErr } = await supabase.storage
        .from("works")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("works").getPublicUrl(storagePath);

      const media_url = pub?.publicUrl;
      if (!media_url) throw new Error("Impossibile ottenere public URL.");

      const { error: insErr } = await supabase.from("works").insert([
        {
          title: title.trim(),
          description: description.trim(),
          media_url,
          media_type: isVideoFile ? "video" : "image",
          storage_path: storagePath,
          ...(isVideoFile ? {} : { image_url: media_url }),
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
    if (!confirm("Eliminare questo lavoro? (media + record)")) return;
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

  const getUrl = (w) => w.media_url || w.image_url;
  const isVideo = (w) => w.media_type === "video";

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.15)",
    fontWeight: 800,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <div className="adminWorksRoot" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <style>{`
        .adminWorksRoot * {
          box-sizing: border-box;
        }

        .adminWorksActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adminWorksCard {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 20px;
          padding: 14px;
          display: grid;
          grid-template-columns: 120px minmax(0, 1fr) 140px;
          gap: 12px;
          align-items: start;
          overflow: hidden;
        }

        .adminWorksMedia {
          width: 120px;
          height: 90px;
          object-fit: cover;
          border-radius: 14px;
          display: block;
        }

        .adminWorksContent {
          min-width: 0;
        }

        .adminWorksDeleteWrap {
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 820px) {
          .adminWorksRoot {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .adminWorksCard {
            grid-template-columns: 1fr !important;
          }

          .adminWorksMedia {
            width: 100% !important;
            height: 220px !important;
          }

          .adminWorksDeleteWrap {
            justify-content: stretch !important;
          }

          .adminWorksDeleteWrap button {
            width: 100%;
          }

          .adminWorksActions > button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .adminWorksRoot {
            padding: 12px !important;
          }

          .adminWorksMedia {
            height: 180px !important;
          }
        }
      `}</style>

      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Gestione lavori (foto + video)
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
          style={inputStyle}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione lavoro"
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ width: "100%" }}
        />

        <div className="adminWorksActions">
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

      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>
        Lavori pubblicati
      </div>

      {works.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Nessun lavoro presente.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {works.map((w) => (
            <div key={w.id} className="adminWorksCard">
              {isVideo(w) ? (
                <video src={getUrl(w)} className="adminWorksMedia" muted />
              ) : (
                <img src={getUrl(w)} alt={w.title} className="adminWorksMedia" />
              )}

              <div className="adminWorksContent">
                <div style={{ fontWeight: 950, fontSize: 18, wordBreak: "break-word" }}>
                  {w.title}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontWeight: 800,
                    color: "#334155",
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                  }}
                >
                  {w.description}
                </div>
              </div>

              <div className="adminWorksDeleteWrap">
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