// src/components/datore/pdf/requestsPdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtDateTime } from "../utils/date";

export function buildRequestsPdfBlob(requests, title = "Richieste preventivo") {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(title || "Richieste preventivo (clienti)", 14, 14);

  const rows = Array.isArray(requests) ? requests : [];

  const body = rows.map((q) => [
    fmtDateTime(q.created_at),
    q.nome || "",
    q.cognome || "",
    q.telefono || "",
    q.email || "",
    String(q.messaggio || "").slice(0, 200),
  ]);

  autoTable(doc, {
    startY: 20,
    head: [["Data/Ora", "Nome", "Cognome", "Telefono", "Email", "Messaggio"]],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [11, 18, 36] },
  });

  // 🔥 FIX: restituisce blob invece di fare save diretto
  return doc.output("blob");
}