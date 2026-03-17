// src/components/datore/validators.js

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

export function sanitizeText(value, maxLen = 200) {
  const s = String(value ?? "").trim();
  if (!s) return "";
  const cleaned = s.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLen);
}

function toNumber(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function clamp(n, min, max) {
  if (!Number.isFinite(n)) return n;
  return Math.min(max, Math.max(min, n));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

const LIMITS = {
  qtyMax: 9999,
  unitPriceMax: 999999.99,
};

export function validateAndCleanItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Inserisci almeno 1 voce." };
  }

  const cleaned = [];

  for (const raw of items) {
    const title = sanitizeText(raw?.title, 120);
    const description = sanitizeText(raw?.description, 220);

    let qty = toNumber(raw?.qty);
    let unit_price = toNumber(raw?.unit_price);

    if (!title) continue;

    if (!Number.isFinite(qty) || qty <= 0) {
      return { ok: false, error: "Quantità non valida (deve essere > 0)." };
    }

    if (!Number.isFinite(unit_price) || unit_price < 0) {
      return { ok: false, error: "Prezzo non valido (deve essere >= 0)." };
    }

    qty = clamp(qty, 0.01, LIMITS.qtyMax);
    unit_price = clamp(unit_price, 0, LIMITS.unitPriceMax);

    const line_total = round2(qty * unit_price);

    cleaned.push({
      title,
      description: description || null,
      qty,
      unit_price: round2(unit_price),
      vat_rate: 0,
      line_total,
    });
  }

  if (cleaned.length === 0) {
    return { ok: false, error: "Inserisci almeno 1 voce valida (titolo + quantità)." };
  }

  return { ok: true, items: cleaned };
}

export function computeTotals(items) {
  const sub = round2(
    (items || []).reduce((acc, it) => {
      return acc + ((Number(it.qty) || 0) * (Number(it.unit_price) || 0));
    }, 0)
  );

  return {
    subtotal: sub,
    vat: 0,
    total: sub,
  };
}

export const QUOTE_OPTIONAL_CLAUSES = [
  {
    key: "warranty_renewal",
    label:
      "Estensione di garanzia subordinata al rinnovo annuale del contratto di manutenzione, condizione necessaria per il mantenimento della validità della stessa.",
  },
  {
    key: "disposal_by_customer",
    label:
      "Smaltimento della caldaia a carico dell’utente, comprensivo di tutte le operazioni di rimozione, trasporto e conferimento presso centri autorizzati, nel rispetto della normativa vigente.",
  },
  {
    key: "disposal_included",
    label:
      "Smaltimento della caldaia incluso nel servizio, comprensivo delle operazioni di rimozione, trasporto e conferimento presso centri autorizzati, in conformità alle normative vigenti in materia di rifiuti.",
  },
];

export function sanitizeSelectedClauses(selected) {
  const allowed = new Set(QUOTE_OPTIONAL_CLAUSES.map((c) => c.key));

  if (!Array.isArray(selected)) return [];

  return selected.filter((key) => allowed.has(key));
}

export function getClauseLabels(selected) {
  const safeKeys = sanitizeSelectedClauses(selected);
  const map = new Map(QUOTE_OPTIONAL_CLAUSES.map((c) => [c.key, c.label]));
  return safeKeys.map((key) => map.get(key)).filter(Boolean);
}