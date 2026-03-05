// src/components/datore/pdf.js
export { buildQuotePdfBlob } from "./pdf/quotePdf";
export { buildRequestsPdfBlob } from "./pdf/requestsPdf";

// helper semplice per data/ora
export function fmtDateTime(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

// ✅ helper: formato € italiano (1.234.567,89)
export function fmtEuro(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}