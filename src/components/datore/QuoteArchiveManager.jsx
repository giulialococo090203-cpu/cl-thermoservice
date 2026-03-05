import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "../../supabaseClient";
import { useState } from "react";

export default function QuoteArchiveManager({ companyId, onDone }) {
  const [loading, setLoading] = useState(false);

  const downloadAndCleanQuotes = async () => {
    try {
      if (!companyId) {
        alert("CompanyId mancante (non posso archiviare).");
        return;
      }

      setLoading(true);

      // 1) recupera i record SOLO della company
      const { data: files, error } = await supabase
        .from("quote_files")
        .select("id, quote_id, company_id, storage_path, created_at")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!files?.length) {
        alert("Nessun PDF da archiviare.");
        setLoading(false);
        return;
      }

      const zip = new JSZip();

      // 2) scarica ogni PDF dallo storage usando storage_path
      for (const row of files) {
        const storagePath = row.storage_path; // ✅ campo giusto

        if (!storagePath) continue;

        const { data: blob, error: downloadError } = await supabase.storage
          .from("quote_files") // ✅ bucket
          .download(storagePath);

        if (downloadError) throw downloadError;

        const fileName = storagePath.split("/").pop() || `preventivo-${row.id}.pdf`;
        zip.file(fileName, blob);
      }

      // 3) genera ZIP e scarica
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `archivio_preventivi_${companyId}.zip`);

      // 4) conferma eliminazione
      const confirmDelete = window.confirm(
        "Vuoi eliminare TUTTI i preventivi archiviati (PDF + righe DB) per questa azienda?"
      );
      if (!confirmDelete) {
        setLoading(false);
        return;
      }

      // 5) elimina dallo STORAGE (prima)
      const pathsToRemove = files.map((r) => r.storage_path).filter(Boolean);
      const { error: storErr } = await supabase.storage.from("quote_files").remove(pathsToRemove);
      if (storErr) throw storErr;

      // 6) elimina dal DB (quote_files)
      const { error: qfErr } = await supabase
        .from("quote_files")
        .delete()
        .eq("company_id", companyId);
      if (qfErr) throw qfErr;

      // 7) elimina dal DB (quote_items e quote_headers)
      // NB: nel tuo progetto la tabella si chiama quote_headers (non "quotes")
      const { error: itemsErr } = await supabase
        .from("quote_items")
        .delete()
        .eq("company_id", companyId);
      if (itemsErr) throw itemsErr;

      const { error: headersErr } = await supabase
        .from("quote_headers")
        .delete()
        .eq("company_id", companyId);
      if (headersErr) throw headersErr;

      alert("✅ Archivio scaricato e preventivi eliminati.");

      // refresh UI
      if (typeof onDone === "function") await onDone();

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Errore durante archivio preventivi");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 20,
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 20,
        background: "#fff",
      }}
    >
      <h3 style={{ margin: 0, fontWeight: 950, color: "#0b1224" }}>Archivio Preventivi</h3>

      <p style={{ marginTop: 10, color: "#475569", fontWeight: 800 }}>
        Scarica tutti i PDF in uno ZIP e poi (se confermi) elimina PDF + righe DB per liberare spazio.
      </p>

      <button
        onClick={downloadAndCleanQuotes}
        disabled={loading}
        style={{
          padding: "12px 20px",
          borderRadius: 12,
          background: "#111827",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 900,
        }}
      >
        {loading ? "Elaborazione..." : "Scarica archivio + svuota"}
      </button>
    </div>
  );
}