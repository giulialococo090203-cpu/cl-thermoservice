// src/components/datore/DatorePanel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

import QuoteArchiveManager from "./QuoteArchiveManager";
import {
  fetchUserRole,
  fetchMyCompanyId,
  fetchCompany,
  listRequests,
  listQuoteFiles,
  insertQuoteHeader,
  insertQuoteItems,
  insertQuoteFileRow,
  uploadPdfToStorage,
  createSignedUrl,
} from "./datoreApi";
import { buildRequestsPdfBlob, buildQuotePdfBlob, fmtDateTime, fmtEuro } from "./pdf";
import {
  computeTotals,
  validateAndCleanItems,
  sanitizeText,
  uid,
  QUOTE_OPTIONAL_CLAUSES,
  getClauseLabels,
  sanitizeSelectedClauses,
} from "./validators";

import RequestsManager from "./RequestsManager";

export default function DatorePanel() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [company, setCompany] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const [liveNotice, setLiveNotice] = useState("");
  const firstRealtimeLoadRef = useRef(true);

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState("");

  const [selectedPaths, setSelectedPaths] = useState([]);
  const [lastCreatedStoragePath, setLastCreatedStoragePath] = useState(null);

  const [activeRequest, setActiveRequest] = useState(null);
  const [manualQuote, setManualQuote] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notesInternal, setNotesInternal] = useState("");
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [manualTotal, setManualTotal] = useState("");

  const [items, setItems] = useState([
    { title: "Intervento", description: "", qty: 1, unit_price: 0 },
  ]);

  const userEmail = session?.user?.email || "";
  const isEmployer = role === "employer";

  const containerRef = useRef(null);
  const filesSectionRef = useRef(null);

  const isMobileBrowser = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

  const openBlobPdfMobileSafe = (blob, fileName = "preventivo.pdf") => {
    const url = URL.createObjectURL(blob);
    const mobile = isMobileBrowser();

    if (mobile) {
      const newTab = window.open(url, "_blank");
      if (!newTab) {
        window.location.href = url;
      }
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const openUrlPdfMobileSafe = async (signedUrl, fallbackFileName = "preventivo.pdf") => {
    if (!signedUrl) throw new Error("Signed URL non disponibile.");

    const mobile = isMobileBrowser();

    if (mobile) {
      const newTab = window.open(signedUrl, "_blank");
      if (!newTab) {
        window.location.href = signedUrl;
      }
      return;
    }

    const res = await fetch(signedUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Download fallito (${res.status}).`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fallbackFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
  };

  const btn = (variant = "dark") => {
    const base = {
      borderRadius: 16,
      padding: "12px 16px",
      fontWeight: 900,
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      whiteSpace: "nowrap",
    };

    if (variant === "dark") {
      return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
    }

    if (variant === "ghost") {
      return { ...base, background: "#fff", color: "#0b1224" };
    }

    if (variant === "soft") {
      return {
        ...base,
        background: "#eef2ff",
        color: "#111827",
        border: "1px solid rgba(99,102,241,.25)",
      };
    }

    if (variant === "danger") {
      return {
        ...base,
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }

    return { ...base, background: "#0b1224", color: "#fff", border: "1px solid #0b1224" };
  };

  useEffect(() => {
    let sub;

    (async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setAuthLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });

      sub = listener?.subscription;
    })();

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setRole(null);
      setCompanyId(null);
      setCompany(null);
      setRoleError("");

      if (!session?.user?.id) return;

      setRoleLoading(true);
      try {
        const r = await fetchUserRole(session.user.id);
        const cId = await fetchMyCompanyId(session.user.id);

        if (!alive) return;

        setRole(r);
        setCompanyId(cId || null);

        if (!cId) {
          setRoleError("company_id mancante sul profilo (tabella profiles).");
          setRoleLoading(false);
          return;
        }

        const c = await fetchCompany(cId);
        if (!alive) return;
        setCompany(c || null);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setRoleError(e?.message || "Impossibile verificare permessi/azienda.");
      } finally {
        if (alive) setRoleLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [session?.user?.id]);

  const loadRequests = async () => {
    if (!companyId) return;
    setRequestsError("");
    setRequestsLoading(true);
    try {
      const rows = await listRequests(companyId);
      setRequests(rows);
    } catch (e) {
      console.error(e);
      setRequestsError(e?.message || "Errore caricamento richieste (quotes).");
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!companyId) return;
    setFilesError("");
    setFilesLoading(true);
    try {
      const rows = await listQuoteFiles(companyId);
      setFiles(rows);
      setSelectedPaths((prev) => prev.filter((p) => rows.some((r) => r.storage_path === p)));
    } catch (e) {
      console.error(e);
      setFilesError(e?.message || "Errore caricamento file preventivi (quote_files).");
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    if (roleLoading || roleError) return;
    if (!isEmployer) return;
    if (!companyId) return;

    loadRequests();
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, roleLoading, roleError, role, companyId]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (roleLoading || roleError) return;
    if (!isEmployer) return;
    if (!companyId) return;

    firstRealtimeLoadRef.current = true;

    const channel = supabase
      .channel(`datore-quotes-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
        },
        async (payload) => {
          const rowCompanyId = payload?.new?.company_id ?? payload?.old?.company_id ?? null;
          if (rowCompanyId !== companyId) return;

          await loadRequests();

          if (firstRealtimeLoadRef.current) {
            firstRealtimeLoadRef.current = false;
            return;
          }

          if (payload.eventType === "INSERT") {
            setLiveNotice("📩 Nuova richiesta ricevuta in tempo reale.");
            setTimeout(() => setLiveNotice(""), 3500);
          }

          if (payload.eventType === "DELETE") {
            setLiveNotice("🗑️ Richiesta eliminata.");
            setTimeout(() => setLiveNotice(""), 2500);
          }

          if (payload.eventType === "UPDATE") {
            setLiveNotice("✏️ Richiesta aggiornata.");
            setTimeout(() => setLiveNotice(""), 2500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, roleLoading, roleError, isEmployer, companyId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || "Login fallito");
        return;
      }

      setSession(data.session);
    } catch (err) {
      setAuthError(String(err?.message || err));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setCompanyId(null);
    setCompany(null);
    setActiveRequest(null);
    setManualQuote(false);
    setSelectedPaths([]);
    setLastCreatedStoragePath(null);
    setLiveNotice("");
  };

  const resetQuoteForm = () => {
    setActiveRequest(null);
    setManualQuote(false);
    setCreateError("");
    setCreateOk("");
    setLastCreatedStoragePath(null);

    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setNotesInternal("");
    setSelectedClauses([]);
    setManualTotal("");
    setItems([{ title: "Intervento", description: "", qty: 1, unit_price: 0 }]);
  };

  const pickRequest = (q) => {
    setManualQuote(false);
    setActiveRequest(q);
    setCreateError("");
    setCreateOk("");
    setLastCreatedStoragePath(null);

    const fullName = `${q?.nome || ""} ${q?.cognome || ""}`.trim();
    setCustomerName(fullName || "");
    setCustomerEmail(q?.email || "");
    setCustomerPhone(q?.telefono || "");
    setCustomerAddress("");
    setNotesInternal(q?.messaggio || "");
    setSelectedClauses([]);
    setManualTotal("");

    setItems([{ title: "Intervento", description: "", qty: 1, unit_price: 0 }]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startManualQuote = () => {
    setActiveRequest(null);
    setManualQuote(true);
    setCreateError("");
    setCreateOk("");
    setLastCreatedStoragePath(null);

    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setNotesInternal("");
    setSelectedClauses([]);
    setManualTotal("");

    setItems([{ title: "Intervento", description: "", qty: 1, unit_price: 0 }]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateItem = (idx, patch) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: "Voce", description: "", qty: 1, unit_price: 0 }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleClause = (key) => {
    setSelectedClauses((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const cleanedForTotals = useMemo(() => {
    const v = validateAndCleanItems(items);
    return v.ok ? v.items : [];
  }, [items]);

  const totals = useMemo(() => computeTotals(cleanedForTotals), [cleanedForTotals]);

  const effectiveTotals = useMemo(() => {
    const parsedManual = Number(String(manualTotal || "").replace(",", ".").trim());
    const hasManualTotal = Number.isFinite(parsedManual) && parsedManual >= 0;

    if (hasManualTotal) {
      return {
        subtotal: parsedManual,
        vat: 0,
        total: parsedManual,
      };
    }

    return totals;
  }, [manualTotal, totals]);

  const handleDownloadRequestsPdf = () => {
    const blob = buildRequestsPdfBlob(requests, `${company?.name || "Azienda"} — Richieste preventivo`);
    openBlobPdfMobileSafe(blob, "richieste-clienti.pdf");
  };

  const openSavedPdf = async (storagePath, openedTab) => {
    const targetTab = openedTab || window.open("about:blank", "_blank");

    if (!targetTab) {
      throw new Error("Il browser ha bloccato l'apertura della nuova scheda.");
    }

    try {
      targetTab.document.body.innerHTML =
        "<p style='font-family:Arial,sans-serif;padding:16px'>Apertura PDF...</p>";

      const signedUrl = await createSignedUrl(storagePath, 300);

      if (!signedUrl) {
        targetTab.close();
        throw new Error("Signed URL non disponibile (controlla createSignedUrl in datoreApi).");
      }

      targetTab.location.replace(signedUrl);
    } catch (err) {
      try {
        targetTab.close();
      } catch {}
      throw err;
    }
  };

  const downloadSavedPdf = async (storagePath) => {
    const signedUrl = await createSignedUrl(storagePath, 300);
    const fileName = storagePath.split("/").pop() || "preventivo.pdf";
    await openUrlPdfMobileSafe(signedUrl, fileName);
  };

  const downloadSelectedPdfs = async () => {
    if (!selectedPaths.length) return;
    try {
      for (let i = 0; i < selectedPaths.length; i++) {
        await downloadSavedPdf(selectedPaths[i]);
        await new Promise((r) => setTimeout(r, 250));
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Errore download PDF.");
    }
  };

  const deleteSelectedPdfs = async () => {
    if (!selectedPaths.length) return;

    const ok = window.confirm(`Eliminare ${selectedPaths.length} PDF selezionati?`);
    if (!ok) return;

    try {
      const { error: storErr } = await supabase.storage.from("quote_files").remove(selectedPaths);
      if (storErr) throw storErr;

      const { error: dbErr } = await supabase
        .from("quote_files")
        .delete()
        .eq("company_id", companyId)
        .in("storage_path", selectedPaths);

      if (dbErr) throw dbErr;

      setSelectedPaths([]);
      setLastCreatedStoragePath(null);

      await loadFiles();
      alert("✅ Eliminati.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Errore eliminazione PDF.");
    }
  };

  const togglePath = (p) => {
    setSelectedPaths((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      return [...prev, p];
    });
  };

  const selectAllFiles = () => {
    setSelectedPaths(files.map((f) => f.storage_path));
  };

  const deselectAllFiles = () => {
    setSelectedPaths([]);
  };

  const createQuoteAndSavePdf = async () => {
    setCreateError("");
    setCreateOk("");

    if (!companyId) return setCreateError("company_id mancante.");
    if (!session?.user?.id) return setCreateError("Sessione non valida.");
    if (!manualQuote && !activeRequest) {
      return setCreateError("Seleziona una richiesta oppure usa “Nuovo preventivo”.");
    }

    const custName = sanitizeText(customerName, 120);
    if (!custName) return setCreateError("Inserisci nome cliente.");

    const valid = validateAndCleanItems(items);
    if (!valid.ok) return setCreateError(valid.error);

    const safeNotes = sanitizeText(notesInternal, 1200);
    const safeEmail = sanitizeText(customerEmail, 120);
    const safePhone = sanitizeText(customerPhone, 60);
    const safeAddr = sanitizeText(customerAddress, 180);
    const safeTotals = effectiveTotals;
    const safeClauseKeys = sanitizeSelectedClauses(selectedClauses);
    const safeClauseLabels = getClauseLabels(safeClauseKeys);

    setCreating(true);

    try {
      const headerPayload = {
        company_id: companyId,
        customer_name: custName,
        customer_email: safeEmail || null,
        customer_phone: safePhone || null,
        customer_address: safeAddr || null,
        notes_internal: safeNotes || null,
        status: "draft",
        total: safeTotals.total,
        currency: "EUR",
        created_by: session.user.id,
      };

      const header = await insertQuoteHeader(headerPayload);
      const quoteId = header.id;

      const itemsPayload = valid.items.map((it, idx) => ({
        id: uid(),
        quote_id: quoteId,
        company_id: companyId,
        title: it.title,
        description: it.description,
        qty: it.qty,
        unit_price: it.unit_price,
        vat_rate: 0,
        line_total: it.line_total,
        sort_order: idx + 1,
      }));

      await insertQuoteItems(itemsPayload);

      const pdfBlob = await buildQuotePdfBlob({
        company,
        header,
        items: valid.items,
        totals: safeTotals,
        selectedClauses: safeClauseLabels,
      });

      // Desktop: scarica subito
      // Mobile: non aprire automaticamente, solo salva nello storico
      if (!isMobileBrowser()) {
        const url = URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "preventivo.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }

      const { storagePath } = await uploadPdfToStorage({
        companyId,
        quoteId,
        blob: pdfBlob,
      });

      await insertQuoteFileRow({
        quote_id: quoteId,
        company_id: companyId,
        storage_path: storagePath,
      });

      setCreateOk(
        isMobileBrowser()
          ? "✅ Preventivo creato e salvato. Per aprirlo usa il doppio tap nello storico qui sotto."
          : "✅ Preventivo creato e salvato. Lo trovi nello storico qui sotto (selezionato)."
      );

      setLastCreatedStoragePath(storagePath);
      setSelectedPaths([storagePath]);

      await loadFiles();
      await loadRequests();

      setTimeout(() => {
        filesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e) {
      console.error(e);

      const msg = String(e?.message || e);

      if (msg.toLowerCase().includes("numeric field overflow")) {
        setCreateError("Errore: numeri troppo grandi per il database. Riduci quantità/prezzo.");
      } else if (msg.toLowerCase().includes("row-level security")) {
        setCreateError(
          "Errore permessi (RLS): la policy non consente questo inserimento. Controlla le policy su quote_headers / quote_items / quote_files."
        );
      } else {
        setCreateError(msg || "Errore creazione preventivo/PDF.");
      }
    } finally {
      setCreating(false);
    }
  };

  const showQuoteForm = manualQuote || !!activeRequest;

  return (
    <div
      ref={containerRef}
      className="datorePanelRoot"
      style={{
        minHeight: "100vh",
        padding: "28px 18px",
        background:
          "radial-gradient(1200px 600px at 15% 5%, rgba(59,130,246,0.10), transparent 55%), radial-gradient(1200px 600px at 85% 0%, rgba(244,63,94,0.10), transparent 55%), #f6f8fb",
      }}
    >
      <style>{`
        @media (max-width: 980px){
          .datoreHeaderTop{
            align-items: flex-start !important;
          }

          .datoreHeaderActions{
            width: 100%;
            justify-content: flex-start !important;
            flex-wrap: wrap;
          }

          .datoreAuthGrid,
          .datoreCustomerGrid{
            grid-template-columns: 1fr !important;
          }

          .datoreTotalsRow{
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .datoreTotalsRight{
            margin-left: 0 !important;
            width: 100%;
            justify-content: stretch !important;
          }

          .datoreTotalsRight > *{
            width: 100%;
          }

          .datoreActionRow{
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .datoreActionRow > button{
            width: 100%;
          }

          .datoreFilesToolbar{
            width: 100%;
          }
        }

        @media (max-width: 860px){
          .datoreItemRow{
            grid-template-columns: 1fr !important;
          }

          .datoreFilesHead{
            display: none !important;
          }

          .datoreFilesDesktopRow{
            display: none !important;
          }

          .datoreFilesMobileRow{
            display: block !important;
          }

          .datoreFilesToolbar{
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }

          .datoreFilesToolbar > button{
            width: 100%;
          }
        }

        @media (min-width: 861px){
          .datoreFilesMobileRow{
            display: none !important;
          }

          .datoreFilesDesktopRow{
            display: grid !important;
          }
        }

        @media (max-width: 640px){
          .datorePanelRoot{
            padding: 16px 10px !important;
          }

          .datoreBigTitle{
            font-size: 32px !important;
          }

          .datoreCard{
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .datoreBadge{
            max-width: 100% !important;
          }
        }

        @media (max-width: 440px){
          .datoreFilesToolbar{
            grid-template-columns: 1fr !important;
          }

          .datoreBigTitle{
            font-size: 28px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="datoreCard" style={{ ...cardStyle, padding: 24 }}>
          <div
            className="datoreHeaderTop"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                className="datoreBigTitle"
                style={{
                  fontSize: 54,
                  fontWeight: 950,
                  color: "#0b1224",
                  lineHeight: 1,
                }}
              >
                Area Datore
              </div>
              <div style={{ marginTop: 10, color: "#475569", fontWeight: 800 }}>
                Accesso riservato (role richiesto: <b>employer</b>)
              </div>
              {company?.name ? (
                <div style={{ marginTop: 10, color: "#0b1224", fontWeight: 900 }}>
                  Azienda: {company.name}
                </div>
              ) : null}
            </div>

            {session && (
              <div className="datoreHeaderActions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="datoreBadge"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    border: "1px solid rgba(99,102,241,0.25)",
                    fontWeight: 900,
                    color: "#111827",
                    maxWidth: 520,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={userEmail}
                >
                  Loggato: {userEmail}
                </span>
                <button style={btn("ghost")} onClick={handleLogout}>
                  Esci
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="datoreCard" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
          {authLoading ? (
            <div style={{ fontWeight: 900, color: "#0b1224" }}>Caricamento…</div>
          ) : !session ? (
            <form onSubmit={handleLogin} className="datoreAuthGrid" style={{ display: "grid", gap: 14, maxWidth: 620 }}>
              {authError && <div style={dangerBox}>Errore login: {authError}</div>}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email datore"
                autoComplete="email"
                style={inputStyle}
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                style={inputStyle}
              />
              <button style={{ ...btn("dark"), padding: "16px 18px", fontSize: 18 }} type="submit">
                Entra
              </button>
            </form>
          ) : roleLoading ? (
            <div style={{ fontWeight: 900, color: "#0b1224" }}>Verifica permessi…</div>
          ) : roleError ? (
            <div style={warnBox}>
              Errore permessi: {roleError}
              <div style={{ marginTop: 10 }}>
                <button style={btn("ghost")} onClick={handleLogout}>
                  Esci
                </button>
              </div>
            </div>
          ) : !isEmployer ? (
            <div style={dangerBox}>
              Accesso negato: questa area è solo per <b>datori</b> (role: employer).
              <div style={{ marginTop: 10 }}>
                <button style={btn("ghost")} onClick={handleLogout}>
                  Esci
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 950, color: "#0b1224" }}>✅ Accesso datore confermato.</div>
          )}
        </div>

        {session && isEmployer && !roleLoading && !roleError && (
          <>
            {liveNotice ? (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 16,
                  background: "#dbeafe",
                  border: "1px solid #bfdbfe",
                  color: "#1e3a8a",
                  fontWeight: 900,
                }}
              >
                {liveNotice}
              </div>
            ) : null}

            <RequestsManager
              companyId={companyId}
              requests={requests}
              loading={requestsLoading}
              error={requestsError}
              onRefresh={loadRequests}
              onPick={pickRequest}
              onStartManualQuote={startManualQuote}
              onDownloadPdf={handleDownloadRequestsPdf}
            />

            <div className="datoreCard" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
                Generazione preventivo (PDF + salvataggio)
              </div>
              <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
                Puoi generare da una richiesta <b>oppure</b> cliccare “Nuovo preventivo”. Il PDF verrà salvato nel bucket{" "}
                <b>quote_files</b>.
              </div>

              {!showQuoteForm ? (
                <div style={hintBox}>
                  Seleziona una richiesta e clicca “Usa richiesta” oppure premi “Nuovo preventivo”.
                </div>
              ) : (
                <>
                  {createError && <div style={dangerBox}>{createError}</div>}
                  {createOk && <div style={okBox}>{createOk}</div>}

                  <div
                    className="datoreCustomerGrid"
                    style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
                  >
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome cliente" style={inputStyle} />
                    <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email cliente" style={inputStyle} />
                    <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Telefono cliente" style={inputStyle} />
                    <input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Indirizzo cliente"
                      style={inputStyle}
                    />
                  </div>

                  <textarea
                    value={notesInternal}
                    onChange={(e) => setNotesInternal(e.target.value)}
                    placeholder="Descrizione / note libere"
                    rows={4}
                    style={{ ...inputStyle, marginTop: 12, resize: "vertical" }}
                  />

                  <div style={{ marginTop: 16, fontWeight: 950, color: "#0b1224" }}>Voci preventivo</div>

                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        className="datoreItemRow"
                        style={{
                          background: "#fff",
                          border: "1px solid rgba(15,23,42,0.10)",
                          borderRadius: 20,
                          padding: 14,
                          display: "grid",
                          gridTemplateColumns: "1.4fr 1.5fr 110px 160px 110px",
                          gap: 10,
                          alignItems: "start",
                        }}
                      >
                        <input value={it.title ?? ""} onChange={(e) => updateItem(idx, { title: e.target.value })} placeholder="Titolo" style={miniInput} />
                        <input
                          value={it.description ?? ""}
                          onChange={(e) => updateItem(idx, { description: e.target.value })}
                          placeholder="Descrizione"
                          style={miniInput}
                        />
                        <input value={String(it.qty ?? "")} onChange={(e) => updateItem(idx, { qty: e.target.value })} placeholder="Qta" style={miniInput} />
                        <input
                          value={String(it.unit_price ?? "")}
                          onChange={(e) => updateItem(idx, { unit_price: e.target.value })}
                          placeholder="Prezzo finale (€)"
                          style={miniInput}
                        />
                        <button
                          style={{ ...btn("danger"), height: 44 }}
                          onClick={() => removeItem(idx)}
                          type="button"
                          disabled={items.length === 1}
                        >
                          Rimuovi
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, fontWeight: 950, color: "#0b1224" }}>Clausole aggiuntive</div>

                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {QUOTE_OPTIONAL_CLAUSES.map((clause) => {
                      const checked = selectedClauses.includes(clause.key);

                      return (
                        <label
                          key={clause.key}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: 14,
                            borderRadius: 18,
                            border: "1px solid rgba(15,23,42,0.10)",
                            background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <input type="checkbox" checked={checked} onChange={() => toggleClause(clause.key)} style={{ marginTop: 3 }} />
                          <span style={{ fontWeight: 800, color: "#334155", lineHeight: 1.55 }}>
                            {clause.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div
                    className="datoreTotalsRow"
                    style={{
                      marginTop: 12,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <button style={btn("ghost")} type="button" onClick={addItem}>
                      + Aggiungi voce
                    </button>

                    <div
                      className="datoreTotalsRight"
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={manualTotal}
                        onChange={(e) => setManualTotal(e.target.value)}
                        placeholder="Totale manuale (€)"
                        style={{ ...miniInput, width: 180 }}
                      />
                      <div style={pill}>Imponibile: € {fmtEuro(effectiveTotals.subtotal)}</div>
                      <div style={{ ...pill, fontWeight: 950 }}>Totale: € {fmtEuro(effectiveTotals.total)}</div>
                    </div>
                  </div>

                  <div
                    className="datoreActionRow"
                    style={{
                      marginTop: 14,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "stretch",
                      width: "100%",
                    }}
                  >
                    <button
                      style={{
                        ...btn("dark"),
                        flex: "1 1 320px",
                        minWidth: 0,
                        maxWidth: "100%",
                        opacity: creating ? 0.7 : 1,
                      }}
                      type="button"
                      onClick={createQuoteAndSavePdf}
                      disabled={creating}
                    >
                      {creating ? "Salvo..." : "Crea preventivo + Salva PDF"}
                    </button>

                    <button
                      style={{ ...btn("ghost"), flex: "0 0 auto", minWidth: 140 }}
                      type="button"
                      onClick={resetQuoteForm}
                      disabled={creating}
                    >
                      Chiudi
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="datoreCard" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
              <QuoteArchiveManager
                companyId={companyId}
                onDone={async () => {
                  setSelectedPaths([]);
                  setLastCreatedStoragePath(null);
                  await loadFiles();
                  await loadRequests();
                }}
              />
            </div>

            <div ref={filesSectionRef} className="datoreCard" style={{ marginTop: 16, ...cardStyle, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
                    Storico PDF preventivi salvati
                  </div>
                  <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
                    Seleziona uno o più PDF → poi scarica/elimina dai pulsanti.
                  </div>
                </div>

                <div className="datoreFilesToolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={btn("ghost")} onClick={loadFiles}>
                    Aggiorna
                  </button>
                  <button style={btn("soft")} type="button" onClick={selectAllFiles} disabled={!files.length}>
                    Seleziona tutti
                  </button>
                  <button style={btn("ghost")} type="button" onClick={deselectAllFiles} disabled={!selectedPaths.length}>
                    Deseleziona
                  </button>
                  <button
                    style={{
                      ...btn("dark"),
                      opacity: selectedPaths.length ? 1 : 0.55,
                      cursor: selectedPaths.length ? "pointer" : "not-allowed",
                    }}
                    onClick={downloadSelectedPdfs}
                    disabled={!selectedPaths.length}
                  >
                    Scarica selezionati ({selectedPaths.length})
                  </button>
                  <button
                    style={{
                      ...btn("danger"),
                      opacity: selectedPaths.length ? 1 : 0.55,
                      cursor: selectedPaths.length ? "pointer" : "not-allowed",
                    }}
                    onClick={deleteSelectedPdfs}
                    disabled={!selectedPaths.length}
                  >
                    Elimina selezionati ({selectedPaths.length})
                  </button>
                </div>
              </div>

              {filesError && <div style={dangerBox}>{filesError}</div>}

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.10)",
                }}
              >
                <div
                  className="datoreFilesHead"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 220px 1fr",
                    background: "#f3f6fb",
                    padding: "12px 10px",
                    fontWeight: 950,
                    color: "#0b1224",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div></div>
                  <div>Creato</div>
                  <div>Storage path</div>
                </div>

                {filesLoading ? (
                  <div style={{ padding: 16, fontWeight: 800 }}>Caricamento…</div>
                ) : files.length === 0 ? (
                  <div style={{ padding: 16, fontWeight: 800, color: "#64748b" }}>Nessun PDF salvato.</div>
                ) : (
                  files.map((f) => {
                    const checked = selectedPaths.includes(f.storage_path);
                    const last = lastCreatedStoragePath === f.storage_path;

                    return (
                      <div key={f.id}>
                        <div
                          className="datoreFilesDesktopRow"
                          onClick={() => togglePath(f.storage_path)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            const newTab = window.open("about:blank", "_blank");

                            openSavedPdf(f.storage_path, newTab).catch((err) => {
                              console.error(err);
                              alert(err?.message || "Errore apertura PDF.");
                            });
                          }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "56px 220px 1fr",
                            padding: "12px 10px",
                            borderTop: "1px solid rgba(15,23,42,0.08)",
                            alignItems: "center",
                            background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                            cursor: "pointer",
                            outline: last ? "2px solid rgba(34,197,94,.45)" : "none",
                            outlineOffset: "-2px",
                            gap: 10,
                          }}
                          title="Clic singolo: seleziona • doppio clic: apri PDF"
                        >
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePath(f.storage_path)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div style={{ fontWeight: 900 }}>
                            {fmtDateTime(f.created_at)}
                            {last ? (
                              <span style={{ marginLeft: 10, color: "#16a34a", fontWeight: 950 }}>
                                NUOVO
                              </span>
                            ) : null}
                          </div>

                          <div
                            style={{
                              fontWeight: 800,
                              color: "#334155",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.storage_path}
                          </div>
                        </div>

                        <div
                          className="datoreFilesMobileRow"
                          style={{
                            borderTop: "1px solid rgba(15,23,42,0.08)",
                            background: checked ? "rgba(99,102,241,0.06)" : "#fff",
                            padding: 12,
                            cursor: "pointer",
                            outline: last ? "2px solid rgba(34,197,94,.45)" : "none",
                            outlineOffset: "-2px",
                          }}
                          onClick={() => togglePath(f.storage_path)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            const newTab = window.open("about:blank", "_blank");

                            openSavedPdf(f.storage_path, newTab).catch((err) => {
                              console.error(err);
                              alert(err?.message || "Errore apertura PDF.");
                            });
                          }}
                        >
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePath(f.storage_path)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: 4 }}
                            />

                            <div style={{ minWidth: 0, flex: 1, display: "grid", gap: 8 }}>
                              <div style={{ fontWeight: 900 }}>
                                {fmtDateTime(f.created_at)}
                                {last ? (
                                  <span style={{ marginLeft: 10, color: "#16a34a", fontWeight: 950 }}>
                                    NUOVO
                                  </span>
                                ) : null}
                              </div>

                              <div
                                style={{
                                  fontWeight: 800,
                                  color: "#334155",
                                  wordBreak: "break-word",
                                  lineHeight: 1.45,
                                }}
                              >
                                {f.storage_path}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "16px 18px",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.15)",
  fontSize: 18,
  fontWeight: 800,
  outline: "none",
  background: "#fff",
};

const miniInput = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.15)",
  fontWeight: 800,
  outline: "none",
  background: "#fff",
};

const pill = {
  padding: "10px 12px",
  borderRadius: 999,
  background: "#eef2ff",
  border: "1px solid rgba(99,102,241,0.25)",
  fontWeight: 900,
  color: "#111827",
};

const dangerBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontWeight: 900,
};

const okBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#065f46",
  fontWeight: 900,
};

const warnBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#ffedd5",
  border: "1px solid #fed7aa",
  color: "#7c2d12",
  fontWeight: 900,
};

const hintBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid rgba(15,23,42,0.10)",
  fontWeight: 900,
  color: "#475569",
};