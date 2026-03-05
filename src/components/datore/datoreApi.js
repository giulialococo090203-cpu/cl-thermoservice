// src/components/datore/datoreApi.js
import { supabase } from "../../supabaseClient";

export async function fetchUserRole(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role || null;
}

export async function fetchMyCompanyId(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.company_id || null;
}

export async function fetchCompany(companyId) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (error) throw error;
  return data || null;
}

// Richieste sito (quotes)
export async function listRequests(companyId) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Storico PDF (tabella quote_files)
export async function listQuoteFiles(companyId) {
  const { data, error } = await supabase
    .from("quote_files")
    .select("id, quote_id, company_id, storage_path, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function insertQuoteHeader(payload) {
  const { data, error } = await supabase
    .from("quote_headers")
    .insert([payload])
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function insertQuoteItems(itemsPayload) {
  const { error } = await supabase.from("quote_items").insert(itemsPayload);
  if (error) throw error;
  return true;
}

export async function insertQuoteFileRow(payload) {
  const { error } = await supabase.from("quote_files").insert([payload]);
  if (error) throw error;
  return true;
}

// Upload PDF su bucket "quote_files"
export async function uploadPdfToStorage({ companyId, quoteId, blob }) {
  const fileName = `preventivo-${quoteId}.pdf`;
  const storagePath = `company/${companyId}/${fileName}`;

  const { error } = await supabase.storage
    .from("quote_files")
    .upload(storagePath, blob, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "3600",
    });

  if (error) throw error;
  return { storagePath };
}

export async function createSignedUrl(storagePath, expiresInSeconds = 120) {
  const { data, error } = await supabase.storage
    .from("quote_files")
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) throw error;
  return data?.signedUrl || null;
}

// ✅ elimina richieste (quotes) per company + lista id
export async function deleteRequests(companyId, ids) {
  if (!companyId) throw new Error("companyId mancante");
  if (!Array.isArray(ids) || ids.length === 0) return;

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("company_id", companyId)
    .in("id", ids);

  if (error) throw error;
}