import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtDateTime } from "../utils/date";

export function buildRequestsPdfBlob(requests, title = "Richieste preventivo") {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("Richieste preventivo (clienti)", 14, 14);

  const body = (rows || []).map((q) => [
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

  doc.save("richieste-clienti.pdf");
}