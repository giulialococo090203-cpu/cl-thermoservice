// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const MAIL_FROM = Deno.env.get("MAIL_FROM") || "Thermoservice <onboarding@resend.dev>";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Metodo non consentito" }, 405);
  }

  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY mancante nelle secrets di Supabase" }, 500);
  }

  try {
    const payload = await req.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return json({ error: "Body JSON non valido" }, 400);
    }

    const review = payload.review ?? {};
    const recipients = Array.isArray(payload.recipients)
      ? payload.recipients.map((x) => String(x || "").trim()).filter(Boolean)
      : [];

    if (!recipients.length) {
      return json({ error: "Nessun destinatario specificato" }, 400);
    }

    const createdAt = review.created_at
      ? new Date(review.created_at).toLocaleString("it-IT")
      : new Date().toLocaleString("it-IT");

    const name = String(review.name || "Cliente").trim();
    const technician = String(review.technician_name || "").trim();
    const rating = Number(review.rating || 0);
    const message = String(review.message || "").trim();

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0b1220; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Nuova recensione ricevuta</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Valutazione:</strong> ${escapeHtml(rating)}/5</p>
        ${technician ? `<p><strong>Tecnico:</strong> ${escapeHtml(technician)}</p>` : ""}
        <p><strong>Data:</strong> ${escapeHtml(createdAt)}</p>
        <div style="margin-top: 18px; padding: 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <strong>Messaggio recensione:</strong>
          <div style="margin-top: 8px; white-space: pre-wrap;">${escapeHtml(message || "-")}</div>
        </div>
      </div>
    `;

    const text = [
      "Nuova recensione ricevuta",
      `Nome: ${name}`,
      `Valutazione: ${rating}/5`,
      technician ? `Tecnico: ${technician}` : null,
      `Data: ${createdAt}`,
      "",
      "Messaggio:",
      message || "-",
    ]
      .filter(Boolean)
      .join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: recipients,
        subject: `Nuova recensione sito - ${name}`,
        html,
        text,
      }),
    });

    const rawText = await resendResponse.text();
    let resendData = null;

    try {
      resendData = rawText ? JSON.parse(rawText) : null;
    } catch {
      resendData = { raw: rawText };
    }

    if (!resendResponse.ok) {
      return json(
        {
          error: "Errore invio email con Resend",
          status: resendResponse.status,
          details: resendData,
        },
        500
      );
    }

    return json({
      ok: true,
      data: resendData,
    });
  } catch (error) {
    return json(
      {
        error: "Errore interno review-notify",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});