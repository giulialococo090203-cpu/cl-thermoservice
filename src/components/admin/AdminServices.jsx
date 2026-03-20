import { useEffect, useMemo, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";
import {
  Wrench,
  Thermometer,
  ShieldCheck,
  Droplets,
  Snowflake,
  Zap,
  Flame,
  Settings,
  Hammer,
  Fan,
  Droplet,
  Gauge,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";
const FILE_BUCKET = "service_files";

const ICONS = {
  Wrench,
  Thermometer,
  ShieldCheck,
  Droplets,
  Snowflake,
  Zap,
  Flame,
  Settings,
  Hammer,
  Fan,
  Droplet,
  Gauge,
};

const ICON_OPTIONS_IT = [
  { key: "Zap", label: "Installazione" },
  { key: "Wrench", label: "Riparazione" },
  { key: "Thermometer", label: "Manutenzione" },
  { key: "ShieldCheck", label: "Controllo fumi / Sicurezza" },
  { key: "Droplets", label: "Impianti idraulici" },
  { key: "Snowflake", label: "Climatizzazione" },
  { key: "Flame", label: "Caldaie / Bruciatori" },
  { key: "Fan", label: "Ventilazione" },
  { key: "Gauge", label: "Pressione / Diagnostica" },
  { key: "Settings", label: "Configurazione / Impostazioni" },
  { key: "Hammer", label: "Lavori / Interventi" },
  { key: "Droplet", label: "Acqua / Perdite" },
].filter((o) => !!ICONS[o.key]);

function safeUuid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `00000000-0000-4000-8000-${Math.random()
      .toString(16)
      .slice(2)
      .padEnd(12, "0")
      .slice(0, 12)}`;
  }
}

function sanitizeFileName(name) {
  return String(name || "file")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

function normalizeDbFiles(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((f) => ({
      name: String(f?.name || f?.file_name || "File"),
      url: String(f?.url || f?.publicUrl || f?.file_url || ""),
      path: String(f?.path || f?.storage_path || ""),
    }))
    .filter((f) => f.name || f.url || f.path);
}

export default function AdminServices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Wrench");
  const [pill, setPill] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [createFiles, setCreateFiles] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    icon: "Wrench",
    pill: "",
    description: "",
    long_description: "",
    files: [],
  });
  const [editFiles, setEditFiles] = useState([]);

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
    padding: 24,
    marginTop: 16,
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.15)",
    fontWeight: 800,
    outline: "none",
    background: "#fff",
    width: "100%",
  };

  const btn = (variant = "dark") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 900,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
    if (variant === "dark") {
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    }
    if (variant === "ghost") {
      return { ...base, background: "#fff", color: "#0b1224" };
    }
    if (variant === "soft") {
      return {
        ...base,
        background: "#eef2ff",
        color: "#111827",
        border: "1px solid rgba(99,102,241,.25)",
      };
    }
    if (variant === "danger") {
      return {
        ...base,
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }
    return base;
  };

  const nextSortOrder = useMemo(() => {
    if (!rows.length) return 1;
    return Math.max(...rows.map((r) => Number(r.sort_order || 0))) + 1;
  }, [rows]);

  const showOk = (text) => {
    setOk(text);
    setTimeout(() => setOk(""), 1800);
  };

  const loadServices = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from("services")
        .select("*")
        .eq("company_id", COMPANY_ID)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      const normalized = Array.isArray(data)
        ? data.map((row) => ({
            ...row,
            files: normalizeDbFiles(row.files),
          }))
        : [];

      setRows(normalized);
    } catch (e) {
      setErr(e?.message || "Errore caricamento servizi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const uploadFilesToBucket = async (serviceId, fileList) => {
    const uploaded = [];

    for (const file of fileList) {
      const cleanName = sanitizeFileName(file.name);
      const path = `${COMPANY_ID}/${serviceId}/${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(FILE_BUCKET)
        .upload(path, file, {
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseAdmin.storage
        .from(FILE_BUCKET)
        .getPublicUrl(path);

      uploaded.push({
        name: file.name,
        url: publicData?.publicUrl || "",
        path,
      });
    }

    return uploaded;
  };

  const removeStoredFile = async (fileObj) => {
    if (!fileObj?.path) return;
    const { error } = await supabaseAdmin.storage.from(FILE_BUCKET).remove([fileObj.path]);
    if (error) throw error;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const t = title.trim();
    const d = description.trim();
    const ld = longDescription.trim();
    const p = pill.trim();
    const ic = (icon || "Wrench").trim();

    if (!t) return setErr("Inserisci un titolo.");
    if (!d) return setErr("Inserisci una descrizione breve.");
    if (!ICONS[ic]) return setErr("Icona non valida.");

    setLoading(true);
    try {
      const serviceId = safeUuid();

      const uploadedFiles = createFiles.length
        ? await uploadFilesToBucket(serviceId, createFiles)
        : [];

      const payload = {
        id: serviceId,
        company_id: COMPANY_ID,
        title: t,
        description: d,
        long_description: ld || null,
        icon: ic,
        pill: p || null,
        files: uploadedFiles,
        sort_order: nextSortOrder,
        is_active: true,
      };

      const { error } = await supabaseAdmin.from("services").insert([payload]);
      if (error) throw error;

      setTitle("");
      setDescription("");
      setLongDescription("");
      setPill("");
      setIcon("Wrench");
      setCreateFiles([]);

      await loadServices();
      showOk("Servizio aggiunto");
    } catch (e) {
      setErr(e?.message || "Errore inserimento servizio");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (row) => {
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from("services")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);

      if (error) throw error;
      await loadServices();
      showOk("Stato aggiornato");
    } catch (e) {
      setErr(e?.message || "Errore aggiornamento stato");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setErr("");
    setEditingId(row.id);
    setDraft({
      title: row.title || "",
      description: row.description || "",
      long_description: row.long_description || "",
      pill: row.pill || "",
      icon: row.icon && ICONS[row.icon] ? row.icon : "Wrench",
      files: normalizeDbFiles(row.files),
    });
    setEditFiles([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({
      title: "",
      icon: "Wrench",
      pill: "",
      description: "",
      long_description: "",
      files: [],
    });
    setEditFiles([]);
  };

  const removeDraftFile = async (idx) => {
    const fileObj = draft.files[idx];
    try {
      if (fileObj?.path) {
        await removeStoredFile(fileObj);
      }
      setDraft((prev) => ({
        ...prev,
        files: prev.files.filter((_, i) => i !== idx),
      }));
    } catch (e) {
      setErr(e?.message || "Errore eliminazione file");
    }
  };

  const saveEdit = async () => {
    setErr("");
    setOk("");
    if (!editingId) return;

    const t = draft.title.trim();
    const d = draft.description.trim();
    const ld = (draft.long_description || "").trim();
    const p = (draft.pill || "").trim();
    const ic = (draft.icon || "Wrench").trim();

    if (!t) return setErr("Titolo obbligatorio.");
    if (!d) return setErr("Descrizione breve obbligatoria.");
    if (!ICONS[ic]) return setErr("Icona non valida.");

    setLoading(true);
    try {
      const uploadedFiles = editFiles.length
        ? await uploadFilesToBucket(editingId, editFiles)
        : [];

      const nextFiles = [
        ...(Array.isArray(draft.files) ? normalizeDbFiles(draft.files) : []),
        ...uploadedFiles,
      ];

      const { error } = await supabaseAdmin
        .from("services")
        .update({
          title: t,
          description: d,
          long_description: ld || null,
          pill: p || null,
          icon: ic,
          files: nextFiles,
        })
        .eq("id", editingId);

      if (error) throw error;

      await loadServices();
      cancelEdit();
      showOk("Servizio aggiornato");
    } catch (e) {
      setErr(e?.message || "Errore salvataggio modifica");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Eliminare questo servizio?")) return;
    setErr("");
    setLoading(true);
    try {
      const files = normalizeDbFiles(row.files);
      const paths = files.map((f) => f?.path).filter(Boolean);

      if (paths.length) {
        const { error: storageError } = await supabaseAdmin.storage.from(FILE_BUCKET).remove(paths);
        if (storageError) throw storageError;
      }

      const { error } = await supabaseAdmin.from("services").delete().eq("id", row.id);
      if (error) throw error;

      if (editingId === row.id) cancelEdit();
      await loadServices();
      showOk("Servizio eliminato");
    } catch (e) {
      setErr(e?.message || "Errore eliminazione servizio");
    } finally {
      setLoading(false);
    }
  };

  const IconPreview = ICONS[icon] || Wrench;
  const iconLabel = (key) => ICON_OPTIONS_IT.find((o) => o.key === key)?.label || key;

  return (
    <div className="adminServicesRoot" style={cardStyle}>
      <style>{`
        .adminServicesTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminServicesTopActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminServicesCreateHead {
          display: grid;
          grid-template-columns: 1.2fr 300px 1fr;
          gap: 12px;
          align-items: center;
        }

        .adminServicesListRow {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 12px;
          align-items: start;
        }

        .adminServicesRowMain {
          display: flex;
          gap: 12px;
        }

        .adminServicesEditTop {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .adminServicesActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adminServicesFileRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.10);
          background: #fff;
        }

        @media (max-width: 980px) {
          .adminServicesCreateHead,
          .adminServicesListRow,
          .adminServicesEditTop {
            grid-template-columns: 1fr !important;
          }

          .adminServicesActions {
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 720px) {
          .adminServicesRoot {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .adminServicesTop {
            align-items: flex-start !important;
          }

          .adminServicesTopActions {
            width: 100%;
            align-items: stretch !important;
          }

          .adminServicesTopActions > * {
            width: 100%;
          }

          .adminServicesRowMain {
            flex-direction: column !important;
          }

          .adminServicesFileRow {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .adminServicesActions > button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .adminServicesRoot {
            padding: 12px !important;
          }
        }
      `}</style>

      <div className="adminServicesTop">
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
            Gestione servizi (pubblico)
          </div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Ogni servizio può avere testo esteso e file scaricabili.
          </div>
        </div>

        <div className="adminServicesTopActions">
          <span
            style={{
              padding: "10px 12px",
              borderRadius: 999,
              background: "#eef2ff",
              border: "1px solid rgba(99,102,241,0.25)",
              fontWeight: 900,
              color: "#111827",
            }}
            title={COMPANY_ID}
          >
            Azienda: CL Thermoservice
          </span>

          <button style={btn("ghost")} type="button" onClick={loadServices} disabled={loading}>
            Aggiorna
          </button>
        </div>
      </div>

      {(ok || err) && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: err ? "#fee2e2" : "#dcfce7",
            border: err ? "1px solid #fecaca" : "1px solid #bbf7d0",
            color: err ? "#991b1b" : "#065f46",
            fontWeight: 900,
          }}
        >
          {err || ok}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          background: "rgba(255,255,255,.9)",
          border: "1px solid rgba(15,23,42,0.10)",
          borderRadius: 22,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 950, color: "#0b1224" }}>Aggiungi servizio</div>

        <form onSubmit={handleCreate} style={{ marginTop: 12, display: "grid", gap: 12 }}>
          <div className="adminServicesCreateHead">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo"
              style={inputStyle}
              disabled={loading}
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.12)",
                  display: "grid",
                  placeItems: "center",
                  background: "#f8fafc",
                  flex: "0 0 auto",
                }}
              >
                <IconPreview size={20} />
              </div>

              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                style={inputStyle}
                disabled={loading}
              >
                {ICON_OPTIONS_IT.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              value={pill}
              onChange={(e) => setPill(e.target.value)}
              placeholder="Etichetta opzionale"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione breve visibile nel banner"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
            disabled={loading}
          />

          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            placeholder="Testo completo che l'utente leggerà quando apre il servizio"
            rows={5}
            style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
            disabled={loading}
          />

          <div>
            <div style={{ fontWeight: 900, color: "#0b1224", marginBottom: 8 }}>
              File del servizio
            </div>

            <label
              style={{
                ...btn("soft"),
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Upload size={18} />
              Carica file
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => setCreateFiles(Array.from(e.target.files || []))}
              />
            </label>

            {createFiles.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {createFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(15,23,42,.10)",
                      background: "#fff",
                      fontWeight: 800,
                      wordBreak: "break-word",
                    }}
                  >
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={btn("dark")} disabled={loading}>
              {loading ? "Salvo..." : "Aggiungi servizio"}
            </button>

            <button
              type="button"
              style={btn("ghost")}
              onClick={() => {
                setTitle("");
                setDescription("");
                setLongDescription("");
                setPill("");
                setIcon("Wrench");
                setCreateFiles([]);
                setErr("");
                setOk("");
              }}
              disabled={loading}
            >
              Pulisci campi
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>
        Servizi ({rows.length})
      </div>

      {loading && rows.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Caricamento…
        </div>
      ) : rows.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Nessun servizio trovato per questa azienda.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {rows.map((r) => {
            const isEditing = editingId === r.id;
            const RowIcon = ICONS[r.icon] || Wrench;
            const files = normalizeDbFiles(r.files);

            return (
              <div
                key={r.id}
                className="adminServicesListRow"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 22,
                  padding: 16,
                  opacity: r.is_active ? 1 : 0.65,
                }}
              >
                <div className="adminServicesRowMain">
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 18,
                      background: "rgba(31,75,143,.08)",
                      border: "1px solid rgba(31,75,143,.18)",
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <RowIcon size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!isEditing ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>
                            {r.title}
                          </div>

                          {r.pill ? (
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: "1px solid rgba(229,57,53,.18)",
                                background: "rgba(229,57,53,.08)",
                                fontWeight: 850,
                                fontSize: 12,
                              }}
                            >
                              {r.pill}
                            </span>
                          ) : null}

                          <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>
                            Icona: {iconLabel(r.icon)} • sort: {r.sort_order ?? "-"}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontWeight: 750,
                            color: "#334155",
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                          }}
                        >
                          {r.description}
                        </div>

                        {r.long_description ? (
                          <div style={{ marginTop: 8, color: "#475569", fontWeight: 700 }}>
                            Testo completo presente
                          </div>
                        ) : null}

                        {files.length > 0 && (
                          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                            {files.map((f, idx) => (
                              <a
                                key={`${f.name}-${idx}`}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontWeight: 800,
                                  color: "#1d4ed8",
                                  textDecoration: "none",
                                  wordBreak: "break-word",
                                }}
                              >
                                <FileText size={16} />
                                {f.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        <input
                          value={draft.title}
                          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                          placeholder="Titolo"
                          style={inputStyle}
                          disabled={loading}
                        />

                        <div className="adminServicesEditTop">
                          <select
                            value={draft.icon}
                            onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))}
                            style={inputStyle}
                            disabled={loading}
                          >
                            {ICON_OPTIONS_IT.map((o) => (
                              <option key={o.key} value={o.key}>
                                {o.label}
                              </option>
                            ))}
                          </select>

                          <input
                            value={draft.pill}
                            onChange={(e) => setDraft((p) => ({ ...p, pill: e.target.value }))}
                            placeholder="Etichetta opzionale"
                            style={inputStyle}
                            disabled={loading}
                          />
                        </div>

                        <textarea
                          value={draft.description}
                          onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Descrizione breve"
                          rows={3}
                          style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
                          disabled={loading}
                        />

                        <textarea
                          value={draft.long_description}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, long_description: e.target.value }))
                          }
                          placeholder="Testo completo"
                          rows={5}
                          style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
                          disabled={loading}
                        />

                        <div>
                          <div style={{ fontWeight: 900, color: "#0b1224", marginBottom: 8 }}>
                            File attuali
                          </div>

                          {draft.files.length ? (
                            <div style={{ display: "grid", gap: 8 }}>
                              {draft.files.map((f, idx) => (
                                <div
                                  key={`${f.name}-${idx}`}
                                  className="adminServicesFileRow"
                                >
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 8,
                                      fontWeight: 800,
                                      color: "#1d4ed8",
                                      textDecoration: "none",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    <FileText size={16} />
                                    {f.name}
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => removeDraftFile(idx)}
                                    style={{
                                      ...btn("danger"),
                                      padding: "8px 10px",
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: "#64748b", fontWeight: 800 }}>Nessun file</div>
                          )}
                        </div>

                        <div>
                          <label
                            style={{
                              ...btn("soft"),
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Upload size={18} />
                            Aggiungi file
                            <input
                              type="file"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) => setEditFiles(Array.from(e.target.files || []))}
                            />
                          </label>

                          {editFiles.length > 0 && (
                            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                              {editFiles.map((f, idx) => (
                                <div
                                  key={`${f.name}-${idx}`}
                                  style={{
                                    padding: "10px 12px",
                                    borderRadius: 14,
                                    border: "1px solid rgba(15,23,42,.10)",
                                    background: "#fff",
                                    fontWeight: 800,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {f.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="adminServicesActions">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        style={btn("soft")}
                        onClick={() => toggleActive(r)}
                        disabled={loading}
                      >
                        {r.is_active ? "Disattiva" : "Attiva"}
                      </button>

                      <button
                        type="button"
                        style={btn("ghost")}
                        onClick={() => startEdit(r)}
                        disabled={loading}
                      >
                        Modifica
                      </button>

                      <button
                        type="button"
                        style={btn("danger")}
                        onClick={() => handleDelete(r)}
                        disabled={loading}
                      >
                        Elimina
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={btn("dark")}
                        onClick={saveEdit}
                        disabled={loading}
                      >
                        Salva
                      </button>
                      <button
                        type="button"
                        style={btn("ghost")}
                        onClick={cancelEdit}
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