// src/components/datore/pdf/index.js
export { buildQuotePdfBlob } from "./quotePdf";
export { buildRequestsPdfBlob } from "./requestsPdf";

// se ti serve altrove
export const fmtDateTime = (iso) => {
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
};

export const fmtEuro = (value) => {
  const num = Number(value ?? 0);

  if (!Number.isFinite(num)) return "0,00";

  return num.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};