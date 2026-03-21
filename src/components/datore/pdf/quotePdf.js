// src/components/datore/pdf/quotePdf.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoDataUrl } from "./getLogoDataUrl";

// A4 in punti: 595 x 842 (pt)
const A4_W = 595.28;
const A4_H = 841.89;

const euro = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

const safe = (s) => String(s ?? "").trim();

const formatDate = (isoOrDate) => {
  try {
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatQuoteNumber = (quoteId) => {
  const x = String(quoteId || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-10);
  return x ? `Q-${x.toUpperCase()}` : `Q-${Date.now()}`;
};

export async function buildQuotePdfBlob({
  company,
  header,
  items,
  totals,
  selectedClauses = [],
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });

  const TEAL = { r: 0, g: 148, b: 170 };
  const DARK = { r: 11, g: 18, b: 36 };
  const MUTED = { r: 71, g: 85, b: 105 };

  const margin = 42;
  const pageW = A4_W;
  const pageH = A4_H;
  const contentW = pageW - margin * 2;

  // Tabella: larghezza fissa e centrata davvero
  const tableW = 430;
  const tableLeft = (pageW - tableW) / 2;
  const tableRight = tableLeft;

  const companyName = safe(company?.name || "Azienda");
  const companyLine1 = safe(company?.address || "");
  const companyLine2 = [
    safe(company?.zip || ""),
    safe(company?.city || ""),
    safe(company?.province || ""),
  ]
    .filter(Boolean)
    .join(" ");
  const companyVat = safe(company?.vat || company?.piva || "");
  const companyEmail = safe(company?.email || "");
  const companyPhone = safe(company?.phone || company?.telefono || "");

  const customerName = safe(header?.customer_name || "");
  const customerEmail = safe(header?.customer_email || "");
  const customerPhone = safe(header?.customer_phone || "");
  const customerAddress = safe(header?.customer_address || "");

  const quoteNumber = safe(
    header?.number || header?.quote_number || formatQuoteNumber(header?.id)
  );
  const quoteDate = formatDate(header?.created_at || new Date());

  let logoDataUrl = null;
  try {
    logoDataUrl = await getLogoDataUrl();
  } catch {
    logoDataUrl = null;
  }

  const topY = margin;
  const logoBoxW = 110;
  const logoBoxH = 70;

  if (logoDataUrl) {
    try {
      doc.addImage(
        logoDataUrl,
        "PNG",
        margin,
        topY,
        logoBoxW,
        logoBoxH,
        undefined,
        "FAST"
      );
    } catch {
      // ignore
    }
  } else {
    doc.setDrawColor(210);
    doc.roundedRect(margin, topY, logoBoxW, logoBoxH, 10, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LOGO", margin + 34, topY + 40);
  }

  const companyX = margin + logoBoxW + 14;
  let y = topY + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(companyName, companyX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);

  y += 16;
  if (companyLine1) doc.text(companyLine1, companyX, y);
  y += 14;
  if (companyLine2) doc.text(companyLine2, companyX, y);
  y += 14;

  const rightInfo = [
    companyPhone ? `Tel: ${companyPhone}` : "",
    companyEmail ? `Email: ${companyEmail}` : "",
    companyVat ? `P.IVA: ${companyVat}` : "",
  ].filter(Boolean);

  rightInfo.forEach((line) => {
    doc.text(line, companyX, y);
    y += 14;
  });

  const titleX = pageW - margin;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEAL.r, TEAL.g, TEAL.b);
  doc.setFontSize(22);
  doc.text("PREVENTIVO", titleX, topY + 24, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFont("helvetica", "bold");
  doc.text("numero", titleX - 120, topY + 46, { align: "left" });
  doc.text("data", titleX - 120, topY + 62, { align: "left" });

  doc.setFont("helvetica", "normal");
  doc.text(quoteNumber, titleX, topY + 46, { align: "right" });
  doc.text(quoteDate, titleX, topY + 62, { align: "right" });

  const headerBottomY = topY + logoBoxH + 18;
  doc.setFillColor(TEAL.r, TEAL.g, TEAL.b);
  doc.rect(margin, headerBottomY, contentW, 10, "F");

  const clientBoxY = headerBottomY + 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Spett.le", margin, clientBoxY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(customerName || "-", margin, clientBoxY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);

  const custLines = [
    customerAddress,
    customerPhone ? `Tel: ${customerPhone}` : "",
    customerEmail ? `Email: ${customerEmail}` : "",
  ].filter(Boolean);

  let cy = clientBoxY + 34;
  custLines.forEach((line) => {
    doc.text(line, margin, cy);
    cy += 14;
  });

  const subjectX = pageW - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("oggetto", subjectX - 200, clientBoxY, { align: "left" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);

  const subject = safe(header?.subject || header?.oggetto || "");
  const subjectText =
    subject || safe(header?.notes_internal || "") || "Preventivo lavori / intervento";
  const subjectWrapped = doc.splitTextToSize(subjectText, 200);
  doc.text(subjectWrapped, subjectX, clientBoxY + 18, { align: "right" });

  const afterClientY = Math.max(cy, clientBoxY + 48) + 10;
  doc.setDrawColor(230);
  doc.line(margin, afterClientY, pageW - margin, afterClientY);

  const tableStartY = afterClientY + 18;

  const body = (Array.isArray(items) ? items : []).map((it) => {
    const title = safe(it.title);
    const desc = safe(it.description);
    const label = [title, desc].filter(Boolean).join("\n");
    const qty = Number(it.qty || 0);
    const unit = Number(it.unit_price || 0);
    const lineTotal = Number(it.line_total ?? qty * unit);

    return [
      label || "-",
      qty ? qty.toLocaleString("it-IT") : "0",
      euro(unit),
      euro(lineTotal),
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [["Descrizione", "Q.tà", "Prezzo", "Totale"]],
    body,
    theme: "grid",
    tableWidth: tableW,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 5,
      valign: "top",
      overflow: "linebreak",
      lineColor: [210, 214, 220],
      lineWidth: 0.6,
      textColor: [40, 40, 40],
    },
    headStyles: {
      fillColor: [TEAL.r, TEAL.g, TEAL.b],
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 230 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 80, halign: "right" },
      3: { cellWidth: 80, halign: "right" },
    },
    margin: { left: tableLeft, right: tableRight },
  });

  let cursorY = doc.lastAutoTable?.finalY || tableStartY + 40;

  if (Array.isArray(selectedClauses) && selectedClauses.length > 0) {
    cursorY += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text("Clausole aggiuntive", margin, cursorY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);

    let clauseY = cursorY + 16;

    selectedClauses.forEach((clause) => {
      const wrapped = doc.splitTextToSize(`• ${safe(clause)}`, contentW);
      doc.text(wrapped, margin, clauseY);
      clauseY += wrapped.length * 12 + 6;
    });

    cursorY = clauseY;
  }

  const totalsBoxW = 220;
  const totalsBoxX = pageW - margin - totalsBoxW;
  const totalsBoxY = cursorY + 18;

  const subtotal = Number(totals?.subtotal || 0);
  const total = Number(totals?.total || 0);

  doc.setDrawColor(230);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsBoxX, totalsBoxY, totalsBoxW, 58, 12, 12, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);

  const row1Y = totalsBoxY + 22;
  const row2Y = totalsBoxY + 44;

  doc.text("Imponibile", totalsBoxX + 14, row1Y);
  doc.text(euro(subtotal), totalsBoxX + totalsBoxW - 14, row1Y, { align: "right" });

  doc.text("Totale Documento", totalsBoxX + 14, row2Y);
  doc.text(euro(total), totalsBoxX + totalsBoxW - 14, row2Y, { align: "right" });

  const footerY = totalsBoxY + 88;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Note", margin, footerY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFontSize(10);

  const notes = safe(header?.notes_internal || "");
  const notesWrapped = doc.splitTextToSize(notes || "—", contentW);
  doc.text(notesWrapped, margin, footerY + 16);

  doc.setFillColor(TEAL.r, TEAL.g, TEAL.b);
  doc.rect(margin, pageH - margin - 14, contentW, 14, "F");

  return doc.output("blob");
}