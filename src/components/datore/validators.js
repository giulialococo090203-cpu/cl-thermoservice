// src/components/datore/validators.js

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

export function sanitizeText(value, maxLen = 200) {
  const s = String(value ?? "").trim();
  if (!s) return "";
  // evita caratteri strani “invisibili”
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

// Limiti anti “numeric overflow” (adattati al tuo DB)
const LIMITS = {
  qtyMax: 9999,
  unitPriceMax: 999999.99,
  vatMax: 100,
};

export function validateAndCleanItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Inserisci almeno 1 voce." };
  }

  const cleaned = [];

  for (const raw of items) {
    const title = sanitizeText(raw?.title, 80);
    const description = sanitizeText(raw?.description, 160);

    let qty = toNumber(raw?.qty);
    let unit_price = toNumber(raw?.unit_price);
    let vat_rate = toNumber(raw?.vat_rate);

    if (!title) continue;

    if (!Number.isFinite(qty) || qty <= 0) {
      return { ok: false, error: "Quantità non valida (deve essere > 0)." };
    }
    if (!Number.isFinite(unit_price) || unit_price < 0) {
      return { ok: false, error: "Prezzo non valido (deve essere >= 0)." };
    }
    if (!Number.isFinite(vat_rate) || vat_rate < 0) vat_rate = 0;

    // ✅ clamp anti overflow
    qty = clamp(qty, 0.01, LIMITS.qtyMax);
    unit_price = clamp(unit_price, 0, LIMITS.unitPriceMax);
    vat_rate = clamp(vat_rate, 0, LIMITS.vatMax);

    const line_total = round2(qty * unit_price);

    cleaned.push({
      title,
      description: description || null,
      qty,
      unit_price: round2(unit_price),
      vat_rate: Math.round(vat_rate),
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
    (items || []).reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unit_price) || 0), 0)
  );

  const vat = round2(
    (items || []).reduce((acc, it) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.unit_price) || 0;
      const rate = Number(it.vat_rate) || 0;
      return acc + (qty * price * rate) / 100;
    }, 0)
  );

  return {
    subtotal: sub,
    vat,
    total: round2(sub + vat),
  };
}