// src/components/admin/AdminLinks.jsx
import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

export default function AdminLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", url: "", description: "" });

  const normalizeUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) return `https://${s}`;
    return s;
  };

  const loadLinks = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from("useful_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(Array.isArray(data) ? data : []);

      setEditingId((prev) =>
        prev && !(data || []).some((r) => r.id === prev) ? null : prev
      );
    } catch (e) {
      setErr(e?.message || "Errore caricamento link");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");

    const t = title.trim();
    const u = normalizeUrl(url);
    const d = description.trim();

    if (!t) return setErr("Inserisci un titolo.");
    if (!u) return setErr("Inserisci un URL.");
    if (!/^https?:\/\//i.test(u)) return setErr("URL non valido.");
    if (!d) return setErr("Inserisci una descrizione (a cosa serve).");

    setLoading(true);
    try {
      const { error } = await supabaseAdmin.from("useful_links").insert([
        {
          title: t,
          url: u,
          description: d,
        },
      ]);
      if (error) throw error;

      setTitle("");
      setUrl("");
      setDescription("");
      await loadLinks();
      alert("✅ Link aggiunto!");
    } catch (e2) {
      setErr(e2?.message || "Errore inserimento link");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setErr("");
    setEditingId(row.id);
    setEditDraft({
      title: row.title || "",
      url: row.url || "",
      description: row.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ title: "", url: "", description: "" });
  };

  const saveEdit = async () => {
    setErr("");

    const t = (editDraft.title || "").trim();
    const u = normalizeUrl(editDraft.url);
    const d = (editDraft.description || "").trim();

    if (!t) return setErr("Inserisci un titolo.");
    if (!u) return setErr("Inserisci un URL.");
    if (!/^https?:\/\//i.test(u)) return setErr("URL non valido.");
    if (!d) return setErr("Inserisci una descrizione (a cosa serve).");

    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from("useful_links")
        .update({ title: t, url: u, description: d })
        .eq("id", editingId);

      if (error) throw error;

      await loadLinks();
      setEditingId(null);
      setEditDraft({ title: "", url: "", description: "" });
      alert("✅ Link aggiornato!");
    } catch (e) {
      setErr(e?.message || "Errore aggiornamento link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm("Eliminare questo link?")) return;
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from("useful_links")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (editingId === row.id) cancelEdit();
      await loadLinks();
    } catch (e) {
      setErr(e?.message || "Errore eliminazione link");
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

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.15)",
    fontWeight: 800,
    outline: "none",
    width: "100%",
    background: "#fff",
  };

  const btn = (variant = "dark") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 900,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      opacity: loading ? 0.7 : 1,
      whiteSpace: "nowrap",
    };
    if (variant === "dark") {
      return { ...base, border: "1px solid #0b1224", background: "#0b1224", color: "#fff" };
    }
    if (variant === "ghost") {
      return { ...base, background: "#fff", color: "#0b1224" };
    }
    if (variant === "danger") {
      return { ...base, border: "1px solid #fecaca", background: "#fee2e2", color: "#991b1b" };
    }
    if (variant === "soft") {
      return { ...base, background: "#eef2ff", color: "#111827", border: "1px solid rgba(99,102,241,.25)" };
    }
    return base;
  };

  return (
    <div className="adminLinksRoot" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
      <style>{`
        .adminLinksRoot * {
          box-sizing: border-box;
        }

        .adminLinksFormActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adminLinksRow {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 20px;
          padding: 14px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 12px;
          align-items: start;
          overflow: hidden;
        }

        .adminLinksLeft {
          min-width: 0;
        }

        .adminLinksRight {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .adminLinksRow {
            grid-template-columns: 1fr !important;
          }

          .adminLinksRight {
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 720px) {
          .adminLinksRoot {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .adminLinksFormActions > button,
          .adminLinksRight > button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .adminLinksRoot {
            padding: 12px !important;
          }
        }
      `}</style>

      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Link utili (titolo + url + descrizione)
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

      <form
        onSubmit={handleCreate}
        style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 820 }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo (es. Pagamento Bollino)"
          style={inputStyle}
          disabled={loading}
        />

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (es. https://...)"
          style={inputStyle}
          disabled={loading}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione (a cosa serve questo link)"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
          disabled={loading}
        />

        <div className="adminLinksFormActions">
          <button type="submit" disabled={loading} style={btn("dark")}>
            {loading ? "Salvo..." : "Aggiungi link"}
          </button>

          <button type="button" onClick={loadLinks} style={btn("ghost")} disabled={loading}>
            Aggiorna
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>
        Link pubblicati
      </div>

      {loading && links.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Caricamento…
        </div>
      ) : links.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Nessun link presente.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {links.map((l) => {
            const isEditing = editingId === l.id;

            return (
              <div key={l.id} className="adminLinksRow">
                <div className="adminLinksLeft">
                  {!isEditing ? (
                    <>
                      <div style={{ fontWeight: 950, fontSize: 18, wordBreak: "break-word" }}>
                        {l.title}
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
                        {l.description}
                      </div>

                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 10,
                          fontWeight: 900,
                          color: "#1f4b8f",
                          wordBreak: "break-word",
                        }}
                      >
                        {l.url}
                      </a>
                    </>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      <input
                        value={editDraft.title}
                        onChange={(e) =>
                          setEditDraft((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="Titolo"
                        style={inputStyle}
                        disabled={loading}
                      />
                      <input
                        value={editDraft.url}
                        onChange={(e) =>
                          setEditDraft((p) => ({ ...p, url: e.target.value }))
                        }
                        placeholder="URL"
                        style={inputStyle}
                        disabled={loading}
                      />
                      <textarea
                        value={editDraft.description}
                        onChange={(e) =>
                          setEditDraft((p) => ({ ...p, description: e.target.value }))
                        }
                        placeholder="Descrizione"
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>

                <div className="adminLinksRight">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(l)}
                        style={btn("soft")}
                        disabled={loading}
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(l)}
                        style={btn("danger")}
                        disabled={loading}
                      >
                        Elimina
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={saveEdit}
                        style={btn("dark")}
                        disabled={loading}
                      >
                        Salva
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={btn("ghost")}
                        disabled={loading}
                      >
                        Annulla
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}