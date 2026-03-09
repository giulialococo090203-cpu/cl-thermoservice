import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "thermoservice_cookie_preferences_v1";

const defaultPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readStoredPreferences() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      savedAt: parsed.savedAt || null,
    };
  } catch {
    return null;
  }
}

function saveStoredPreferences(preferences) {
  const payload = {
    necessary: true,
    analytics: !!preferences.analytics,
    marketing: !!preferences.marketing,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("cookie-preferences-updated", { detail: payload }));
}

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const stored = readStoredPreferences();

    if (stored) {
      setPreferences({
        necessary: true,
        analytics: stored.analytics,
        marketing: stored.marketing,
      });
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    const openPreferences = () => {
      const stored = readStoredPreferences();

      if (stored) {
        setPreferences({
          necessary: true,
          analytics: stored.analytics,
          marketing: stored.marketing,
        });
      }

      setShowPreferences(true);
      setShowBanner(false);
    };

    window.addEventListener("open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("open-cookie-preferences", openPreferences);
  }, []);

  const acceptAll = () => {
    const next = {
      necessary: true,
      analytics: true,
      marketing: true,
    };

    setPreferences(next);
    saveStoredPreferences(next);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const rejectOptional = () => {
    const next = {
      necessary: true,
      analytics: false,
      marketing: false,
    };

    setPreferences(next);
    saveStoredPreferences(next);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveCustomPreferences = () => {
    saveStoredPreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const overlayStyle = useMemo(
    () => ({
      position: "fixed",
      inset: 0,
      background: "rgba(2,6,23,0.45)",
      backdropFilter: "blur(6px)",
      zIndex: 5000,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 16,
    }),
    []
  );

  const panelStyle = useMemo(
    () => ({
      width: "min(980px, 100%)",
      borderRadius: 24,
      background: "#ffffff",
      color: "#0f172a",
      boxShadow: "0 24px 80px rgba(2,6,23,0.28)",
      border: "1px solid rgba(15,23,42,0.08)",
      padding: 22,
    }),
    []
  );

  const primaryButtonStyle = {
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    minHeight: 50,
  };

  const secondaryButtonStyle = {
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #0f172a",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 900,
    cursor: "pointer",
    minHeight: 50,
  };

  const neutralButtonStyle = {
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 900,
    cursor: "pointer",
    minHeight: 50,
  };

  if (!mounted) return null;

  return (
    <>
      {showBanner && (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="cookie-banner-title">
          <div style={panelStyle}>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "1.4fr 1fr",
                alignItems: "start",
              }}
            >
              <div>
                <h2
                  id="cookie-banner-title"
                  style={{
                    margin: 0,
                    fontSize: "clamp(22px, 3vw, 30px)",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Gestione dei cookie
                </h2>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#334155",
                    lineHeight: 1.7,
                    fontSize: 15,
                  }}
                >
                  Utilizziamo cookie tecnici necessari al funzionamento del sito. I cookie non necessari
                  saranno attivati solo con il tuo consenso. Puoi accettare, rifiutare oppure personalizzare
                  la scelta e modificarla in qualunque momento dal footer.
                </p>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    fontSize: 14,
                  }}
                >
                  <a href="/privacy-policy" style={{ color: "#0f172a", fontWeight: 800 }}>
                    Privacy Policy
                  </a>
                  <a href="/cookie-policy" style={{ color: "#0f172a", fontWeight: 800 }}>
                    Cookie Policy
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                }}
              >
                <button type="button" onClick={rejectOptional} style={secondaryButtonStyle}>
                  Rifiuta non necessari
                </button>

                <button type="button" onClick={() => setShowPreferences(true)} style={neutralButtonStyle}>
                  Personalizza
                </button>

                <button type="button" onClick={acceptAll} style={primaryButtonStyle}>
                  Accetta tutti
                </button>
              </div>
            </div>

            <style>{`
              @media (max-width: 820px) {
                [role="dialog"] > div > div {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}

      {showPreferences && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 5100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
        >
          <div
            style={{
              width: "min(760px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 24,
              background: "#ffffff",
              color: "#0f172a",
              boxShadow: "0 24px 80px rgba(2,6,23,0.28)",
              border: "1px solid rgba(15,23,42,0.08)",
              padding: 22,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
              <h2
                id="cookie-preferences-title"
                style={{
                  margin: 0,
                  fontSize: "clamp(22px, 3vw, 30px)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                Preferenze cookie
              </h2>

              <button
                type="button"
                onClick={() => {
                  const stored = readStoredPreferences();
                  setShowPreferences(false);
                  if (!stored) setShowBanner(true);
                }}
                style={{
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "#fff",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Chiudi
              </button>
            </div>

            <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.7 }}>
              Puoi scegliere quali categorie attivare. I cookie necessari restano sempre attivi perché servono
              al funzionamento del sito.
            </p>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <PreferenceRow
                title="Cookie necessari"
                description="Sempre attivi. Servono al funzionamento del sito e al salvataggio della tua scelta."
                checked={true}
                disabled
                onChange={() => {}}
              />

              <PreferenceRow
                title="Cookie statistici"
                description="Da attivare solo se in futuro userai strumenti di analisi del traffico non esenti."
                checked={preferences.analytics}
                onChange={() =>
                  setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))
                }
              />

              <PreferenceRow
                title="Cookie marketing"
                description="Da attivare solo se in futuro userai strumenti pubblicitari o di tracciamento."
                checked={preferences.marketing}
                onChange={() =>
                  setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 22,
              }}
            >
              <button type="button" onClick={rejectOptional} style={secondaryButtonStyle}>
                Rifiuta non necessari
              </button>

              <button type="button" onClick={saveCustomPreferences} style={neutralButtonStyle}>
                Salva preferenze
              </button>

              <button type="button" onClick={acceptAll} style={primaryButtonStyle}>
                Accetta tutti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PreferenceRow({ title, description, checked, onChange, disabled = false }) {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 20,
        padding: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        background: "#ffffff",
      }}
    >
      <div>
        <div style={{ fontWeight: 900, fontSize: 17 }}>{title}</div>
        <div style={{ marginTop: 6, color: "#475569", lineHeight: 1.6, fontSize: 14 }}>
          {description}
        </div>
      </div>

      <label
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          flex: "0 0 auto",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        <span
          style={{
            width: 56,
            height: 32,
            borderRadius: 999,
            background: checked ? "#0f172a" : "#cbd5e1",
            position: "relative",
            transition: "all .2s ease",
            display: "inline-block",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 4,
              left: checked ? 28 : 4,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#ffffff",
              transition: "all .2s ease",
              boxShadow: "0 2px 8px rgba(15,23,42,0.20)",
            }}
          />
        </span>
      </label>
    </div>
  );
}