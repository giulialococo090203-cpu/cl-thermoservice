import { useEffect, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const TABLE = "brands_content";
const BUCKET = "brands";

const DEFAULT_BRANDS = [
  { name: "Chaffoteaux", logo: "/chaffoteaux.png", url: "" },
  { name: "Bosch", logo: "/bosch.png", url: "" },
  { name: "Toshiba", logo: "/toshiba.png", url: "" },
  { name: "Maxa", logo: "/maxa.png", url: "" },
  { name: "Innova", logo: "/innova.png", url: "" },
  { name: "Cordivari", logo: "/cordivari.png", url: "" },
];

function normalizeBrand(brand) {
  return {
    name: String(brand?.name || "").trim(),
    logo: String(brand?.logo || "").trim(),
    url: String(brand?.url || "").trim(),
  };
}

export default function AdminBrands() {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [rowId, setRowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const okTimerRef = useRef(null);

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
      return {
        ...base,
        background: "#0b1224",
        color: "#fff",
        border: "1px solid #0b1224",
      };
    }

    if (variant === "ghost") {
      return {
        ...base,
        background: "#fff",
        color: "#0b1224",
      };
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

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const { data, error } = await supabaseAdmin
        .from(TABLE)
        .select("id, payload, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data?.id) setRowId(data.id);

      const fromDb = data?.payload?.brands;
      if (Array.isArray(fromDb) && fromDb.length > 0) {
        const normalized = fromDb
          .map(normalizeBrand)
          .filter((b) => b.name && b.logo);

        setBrands(normalized.length ? normalized : DEFAULT_BRANDS);
      } else {
        setBrands(DEFAULT_BRANDS);
      }
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Errore caricamento marchi");
      setBrands(DEFAULT_BRANDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (okTimerRef.current) clearTimeout(okTimerRef.current);
    };
  }, []);

  const updateBrand = (index, field, value) => {
    setBrands((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const addBrand = () => {
    setBrands((prev) => [...prev, { name: "", logo: "", url: "" }]);
  };

  const removeBrand = (index) => {
    setBrands((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadLogo = async (index, file) => {
    if (!file) return;

    try {
      setErr("");
      setUploadingIndex(index);

      const ext = file.name.split(".").pop() || "png";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storagePath = `logos/${safeName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error("Impossibile ottenere URL pubblico logo.");

      updateBrand(index, "logo", publicUrl);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Errore upload logo");
    } finally {
      setUploadingIndex(null);
    }
  };

  const save = async () => {
    setErr("");
    setOk(false);
    setSaving(true);

    try {
      const cleanBrands = brands
        .map(normalizeBrand)
        .filter((b) => b.name && b.logo);

      const payload = { brands: cleanBrands };

      if (rowId) {
        const { error } = await supabaseAdmin
          .from(TABLE)
          .update({
            payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rowId);

        if (error) throw error;
      } else {
        const { data, error } = await supabaseAdmin
          .from(TABLE)
          .insert([
            {
              payload,
              updated_at: new Date().toISOString(),
            },
          ])
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) setRowId(data.id);
      }

      setOk(true);
      okTimerRef.current = setTimeout(() => setOk(false), 1800);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Errore salvataggio marchi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
        Marchi
      </div>
      <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
        Qui puoi modificare i marchi della Hero, caricare direttamente i loghi e inserire il link del sito ufficiale.
      </div>

      {ok && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#065f46",
            fontWeight: 900,
          }}
        >
          ✅ Marchi salvati correttamente
        </div>
      )}

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

      {loading ? (
        <div style={{ marginTop: 14, fontWeight: 900, color: "#0b1224" }}>
          Caricamento…
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {brands.map((b, i) => (
              <div
                key={i}
                className="adminBrandsRow"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.10)",
                  borderRadius: 18,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr 1.3fr 180px 120px",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <input
                  style={inputStyle}
                  value={b.name || ""}
                  onChange={(e) => updateBrand(i, "name", e.target.value)}
                  placeholder="Nome marchio"
                />

                <input
                  style={inputStyle}
                  value={b.logo || ""}
                  onChange={(e) => updateBrand(i, "logo", e.target.value)}
                  placeholder="URL o path logo"
                />

                <input
                  style={inputStyle}
                  value={b.url || ""}
                  onChange={(e) => updateBrand(i, "url", e.target.value)}
                  placeholder="https://sito-ufficiale.it"
                />

                <label
                  style={{
                    ...btn("soft"),
                    textAlign: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploadingIndex === i ? "Upload..." : "Carica immagine"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadLogo(i, e.target.files?.[0])}
                  />
                </label>

                <button
                  style={btn("danger")}
                  type="button"
                  onClick={() => removeBrand(i)}
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btn("soft")} type="button" onClick={addBrand}>
              + Aggiungi marchio
            </button>

            <button style={btn("dark")} type="button" onClick={save} disabled={saving}>
              {saving ? "Salvataggio..." : "Salva"}
            </button>

            <button style={btn("ghost")} type="button" onClick={load} disabled={saving}>
              Ricarica
            </button>
          </div>

          <style>{`
            @media (max-width: 1200px){
              .adminBrandsRow{
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}