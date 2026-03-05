// src/components/datore/pdf/getLogoDataUrl.js
import { supabase } from "../../../supabaseClient.js";

/**
 * Scarica il logo dal bucket Supabase Storage e lo converte in DataURL
 * (utile per inserirlo nel PDF con jsPDF/addImage).
 *
 * Default: assets/logo.png
 * Variante per azienda: company/{companyId}/logo.png
 */
export async function getLogoDataUrl({ companyId } = {}) {
  // ✅ percorso dove hai caricato il logo nel bucket quote_files
  // Se usi sempre un logo unico:
  const path = "assets/logo.png";

  // Se invece vuoi un logo diverso per azienda, usa questa riga e commenta quella sopra:
  // const path = `company/${companyId}/logo.png`;

  const { data, error } = await supabase.storage
    .from("quote_files")
    .createSignedUrl(path, 60);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Signed URL mancante per il logo");

  const res = await fetch(data.signedUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossibile scaricare logo dal bucket (${res.status})`);

  const blob = await res.blob();

  // Converti blob -> dataURL
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Errore lettura logo"));
    r.onloadend = () => resolve(r.result);
    r.readAsDataURL(blob);
  });

  return dataUrl; // "data:image/png;base64,..."
}