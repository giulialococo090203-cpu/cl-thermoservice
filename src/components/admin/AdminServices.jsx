// src/components/admin/AdminServices.jsx
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
} from "lucide-react";

/**
 * ✅ Azienda fissa (CL Thermoservice)
 * Sostituisci con il tuo company_id reale se diverso
 */
const COMPANY_ID = "21cb4d5d-9566-4488-802c-a6b28488e486";

/**
 * ✅ Icone consentite (testo salvato in DB -> componente)
 */
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

// ✅ Tendina icone in ITALIANO (valore = key salvata nel DB)
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
    return crypto.randomUUID(); // uuid vero
  } catch {
    // fallback: NON è uuid perfetto, ma quasi mai serve
    // se il tuo DB richiede uuid stretto, su browser moderni crypto.randomUUID esiste
    return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
  }
}

export default function AdminServices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // create form
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Wrench");
  const [pill, setPill] = useState("");
  const [description, setDescription] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    icon: "Wrench",
    pill: "",
    description: "",
  });

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
    padding: 24,
    marginTop: 16,
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
    if (variant === "dark")
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    if (variant === "ghost") return { ...base, background: "#fff", color: "#0b1224" };
    if (variant === "soft")
      return { ...base, background: "#eef2ff", color: "#111827", border: "1px solid rgba(99,102,241,.25)" };
    if (variant === "danger")
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    return base;
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
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Errore caricamento servizi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSortOrder = useMemo(() => {
    if (!rows.length) return 1;
    const max = Math.max(...rows.map((r) => Number(r.sort_order || 0)));
    return max + 1;
  }, [rows]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");

    const t = title.trim();
    const d = description.trim();
    const p = pill.trim();
    const ic = (icon || "Wrench").trim();

    if (!COMPANY_ID) return setErr("COMPANY_ID mancante nel file AdminServices.jsx.");
    if (!t) return setErr("Inserisci un titolo.");
    if (!d) return setErr("Inserisci una descrizione.");
    if (!ICONS[ic]) return setErr("Icona non valida (sceglila dalla tendina).");

    setLoading(true);
    try {
      // 🔥 Nota: inseriamo id uuid per compatibilità con DB dove id NON ha default
      const payload = {
        id: safeUuid(),
        company_id: COMPANY_ID,
        title: t,
        description: d,
        icon: ic,
        pill: p || null,
        sort_order: nextSortOrder,
        is_active: true,
      };

      const { error } = await supabaseAdmin.from("services").insert([payload]);
      if (error) throw error;

      // reset form
      setTitle("");
      setDescription("");
      setPill("");
      setIcon("Wrench");

      await loadServices();
    } catch (e2) {
      setErr(e2?.message || "Errore inserimento servizio");
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
      pill: row.pill || "",
      icon: row.icon && ICONS[row.icon] ? row.icon : "Wrench",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ title: "", icon: "Wrench", pill: "", description: "" });
  };

  const saveEdit = async () => {
    setErr("");
    if (!editingId) return;

    const t = draft.title.trim();
    const d = draft.description.trim();
    const p = (draft.pill || "").trim();
    const ic = (draft.icon || "Wrench").trim();

    if (!t) return setErr("Titolo obbligatorio.");
    if (!d) return setErr("Descrizione obbligatoria.");
    if (!ICONS[ic]) return setErr("Icona non valida.");

    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from("services")
        .update({
          title: t,
          description: d,
          pill: p || null,
          icon: ic,
        })
        .eq("id", editingId);

      if (error) throw error;

      await loadServices();
      cancelEdit();
    } catch (e) {
      setErr(e?.message || "Errore salvataggio modifica");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm("Eliminare questo servizio?")) return;
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabaseAdmin.from("services").delete().eq("id", row.id);
      if (error) throw error;

      if (editingId === row.id) cancelEdit();
      await loadServices();
    } catch (e) {
      setErr(e?.message || "Errore eliminazione servizio");
    } finally {
      setLoading(false);
    }
  };

  const IconPreview = ICONS[icon] || Wrench;

  const iconLabel = (key) => ICON_OPTIONS_IT.find((o) => o.key === key)?.label || key;

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>Gestione servizi (pubblico)</div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Questi servizi alimentano la sezione “Servizi” del sito.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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

      {/* CREATE */}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 300px 1fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo (es. Riparazione caldaie)"
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
                }}
                title="Anteprima icona"
              >
                <IconPreview size={20} />
              </div>

              <select value={icon} onChange={(e) => setIcon(e.target.value)} style={inputStyle} disabled={loading}>
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
              placeholder="Etichetta (pill) opzionale (es. Servizio richiesto)"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
            disabled={loading}
          />

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
                setPill("");
                setIcon("Wrench");
                setErr("");
              }}
              disabled={loading}
            >
              Pulisci campi
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 18, fontWeight: 950, color: "#0b1224" }}>Servizi ({rows.length})</div>

      {loading && rows.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>Caricamento…</div>
      ) : rows.length === 0 ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#64748b" }}>
          Nessun servizio trovato per questa azienda.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {rows.map((r) => {
            const isEditing = editingId === r.id;
            const RowIcon = ICONS[r.icon] || Wrench;

            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 22,
                  padding: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 340px",
                  gap: 12,
                  alignItems: "start",
                  opacity: r.is_active ? 1 : 0.65,
                }}
              >
                {/* LEFT */}
                <div style={{ display: "flex", gap: 12 }}>
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
                    title={r.icon}
                  >
                    <RowIcon size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    {!isEditing ? (
                      <>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 950, fontSize: 18, color: "#0b1224" }}>{r.title}</div>

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

                        <div style={{ marginTop: 8, fontWeight: 750, color: "#334155", lineHeight: 1.6 }}>
                          {r.description}
                        </div>
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

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                            placeholder="Etichetta (pill) opzionale"
                            style={inputStyle}
                            disabled={loading}
                          />
                        </div>

                        <textarea
                          value={draft.description}
                          onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Descrizione"
                          rows={3}
                          style={{ ...inputStyle, resize: "vertical", fontWeight: 750 }}
                          disabled={loading}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  {!isEditing ? (
                    <>
                      <button type="button" style={btn("soft")} onClick={() => toggleActive(r)} disabled={loading}>
                        {r.is_active ? "Disattiva" : "Attiva"}
                      </button>

                      <button type="button" style={btn("ghost")} onClick={() => startEdit(r)} disabled={loading}>
                        Modifica
                      </button>

                      <button type="button" style={btn("danger")} onClick={() => handleDelete(r)} disabled={loading}>
                        Elimina
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" style={btn("dark")} onClick={saveEdit} disabled={loading}>
                        Salva
                      </button>
                      <button type="button" style={btn("ghost")} onClick={cancelEdit} disabled={loading}>
                        Annulla
                      </button>
                    </>
                  )}
                </div>

                <style>{`
                  @media (max-width: 980px){
                    div[style*="gridTemplateColumns: 1fr 340px"]{
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}