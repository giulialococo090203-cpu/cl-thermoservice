import { useEffect, useMemo, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const CONFIGURED_LIMIT_GB = 1;
const MONITORED_BUCKETS = ["quote_files", "service_files"];
const AUTO_REFRESH_MS = 20000;

function formatBytes(bytes) {
  const value = Number(bytes || 0);

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(3)} GB`;
}

function getFileSize(row) {
  const candidates = [
    row?.metadata?.size,
    row?.metadata?.fileSize,
    row?.metadata?.file_size,
    row?.metadata?.contentLength,
    row?.metadata?.content_length,
  ];

  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return n;
  }

  return 0;
}

function getCreatedAt(row) {
  return row?.created_at || row?.updated_at || null;
}

function joinPath(base, name) {
  if (!base) return name;
  return `${base}/${name}`;
}

async function listRecursive(bucket, path = "") {
  let all = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(path, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) break;

    for (const row of rows) {
      const name = String(row?.name || "");
      if (!name) continue;

      const fullPath = joinPath(path, name);

      // cartella
      if (!row?.id) {
        const nested = await listRecursive(bucket, fullPath);
        all = all.concat(nested);
      } else {
        all.push({
          ...row,
          bucket,
          fullPath,
        });
      }
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

function groupByBucket(rows) {
  const map = new Map();

  for (const row of rows) {
    const key = row.bucket;
    const size = getFileSize(row);

    if (!map.has(key)) {
      map.set(key, { key, files: 0, bytes: 0 });
    }

    const curr = map.get(key);
    curr.files += 1;
    curr.bytes += size;
  }

  return Array.from(map.values()).sort((a, b) => b.bytes - a.bytes);
}

function groupByTopFolder(rows) {
  const map = new Map();

  for (const row of rows) {
    const fullPath = String(row?.fullPath || row?.name || "");
    const firstChunk = fullPath.split("/")[0] || "root";
    const key = `${row.bucket} / ${firstChunk}`;
    const size = getFileSize(row);

    if (!map.has(key)) {
      map.set(key, { key, files: 0, bytes: 0 });
    }

    const curr = map.get(key);
    curr.files += 1;
    curr.bytes += size;
  }

  return Array.from(map.values()).sort((a, b) => b.bytes - a.bytes);
}

export default function AdminStorageUsage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 20px 60px rgba(2,6,23,0.10)",
    backdropFilter: "blur(10px)",
    padding: 24,
    marginTop: 16,
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
      return {
        ...base,
        background: "#0b1224",
        color: "#fff",
        border: "1px solid #0b1224",
      };
    }

    if (variant === "ghost") {
      return {
        ...base,
        background: "#fff",
        color: "#0b1224",
      };
    }

    return base;
  };

  const loadUsage = async () => {
    setLoading(true);
    setErr("");

    try {
      const all = [];

      for (const bucket of MONITORED_BUCKETS) {
        const files = await listRecursive(bucket, "");
        all.push(...files);
      }

      setRows(all);
      setLastRefreshAt(new Date().toISOString());
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Errore caricamento utilizzo storage.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();

    const intervalId = window.setInterval(() => {
      loadUsage();
    }, AUTO_REFRESH_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadUsage();
      }
    };

    const handleFocus = () => {
      loadUsage();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const da = new Date(getCreatedAt(a) || 0).getTime();
      const db = new Date(getCreatedAt(b) || 0).getTime();
      return db - da;
    });
  }, [rows]);

  const stats = useMemo(() => {
    const totalBytes = rows.reduce((sum, row) => sum + getFileSize(row), 0);
    const totalFiles = rows.length;
    const limitBytes = CONFIGURED_LIMIT_GB * 1024 * 1024 * 1024;
    const pct = limitBytes > 0 ? Math.min((totalBytes / limitBytes) * 100, 100) : 0;
    const remainingBytes = Math.max(limitBytes - totalBytes, 0);

    const dates = rows
      .map((r) => getCreatedAt(r))
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a));

    return {
      totalBytes,
      totalFiles,
      limitBytes,
      pct,
      remainingBytes,
      latestDate: dates[0] || null,
      byBucket: groupByBucket(rows),
      byTopFolder: groupByTopFolder(rows),
    };
  }, [rows]);

  const progressColor =
    stats.pct >= 90 ? "#dc2626" : stats.pct >= 75 ? "#d97706" : "#2563eb";

  const notice =
    stats.pct >= 90
      ? "Spazio quasi pieno: conviene svuotare i file più pesanti."
      : stats.pct >= 75
      ? "Spazio in crescita: tieni monitorato l'archivio."
      : "Situazione sotto controllo.";

  return (
    <div style={cardStyle}>
      <style>{`
        .adminStorageTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adminStorageGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .adminStorageCard {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 20px;
          padding: 16px;
          min-width: 0;
        }

        .adminStorageBar {
          width: 100%;
          height: 14px;
          border-radius: 999px;
          background: #e5e7eb;
          overflow: hidden;
        }

        .adminStorageBarFill {
          height: 100%;
          border-radius: 999px;
          transition: width .25s ease;
        }

        .adminStorageSectionTitle {
          margin-top: 18px;
          font-weight: 950;
          color: #0b1224;
        }

        .adminStorageTable {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }

        .adminStorageRow {
          display: grid;
          grid-template-columns: 1.3fr 120px 160px;
          gap: 10px;
          align-items: center;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 12px 14px;
        }

        .adminStorageFileRow {
          display: grid;
          grid-template-columns: 150px 1fr 140px 170px;
          gap: 10px;
          align-items: center;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 12px 14px;
        }

        @media (max-width: 980px) {
          .adminStorageGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .adminStorageRow,
          .adminStorageFileRow {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .adminStorageGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="adminStorageTop">
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#0b1224" }}>
            Utilizzo storage
          </div>
          <div style={{ marginTop: 6, color: "#475569", fontWeight: 800 }}>
            Monitoraggio bucket: <b>{MONITORED_BUCKETS.join(", ")}</b>
          </div>
          {lastRefreshAt ? (
            <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>
              Ultimo aggiornamento:{" "}
              {new Date(lastRefreshAt).toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          ) : null}
        </div>

        <button type="button" style={btn("ghost")} onClick={loadUsage} disabled={loading}>
          {loading ? "Aggiorno..." : "Aggiorna"}
        </button>
      </div>

      {err && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontWeight: 900,
          }}
        >
          {err}
        </div>
      )}

      <div className="adminStorageGrid">
        <div className="adminStorageCard">
          <div style={{ color: "#64748b", fontWeight: 900 }}>Spazio usato</div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950, color: "#0b1224" }}>
            {formatBytes(stats.totalBytes)}
          </div>
        </div>

        <div className="adminStorageCard">
          <div style={{ color: "#64748b", fontWeight: 900 }}>Limite monitorato</div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950, color: "#0b1224" }}>
            {CONFIGURED_LIMIT_GB} GB
          </div>
        </div>

        <div className="adminStorageCard">
          <div style={{ color: "#64748b", fontWeight: 900 }}>File presenti</div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950, color: "#0b1224" }}>
            {stats.totalFiles}
          </div>
        </div>

        <div className="adminStorageCard">
          <div style={{ color: "#64748b", fontWeight: 900 }}>Spazio residuo</div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950, color: "#0b1224" }}>
            {formatBytes(stats.remainingBytes)}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          background: "#fff",
          border: "1px solid rgba(15,23,42,0.10)",
          borderRadius: 20,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 950, color: "#0b1224" }}>
            Riempimento: {stats.pct.toFixed(2)}%
          </div>
          <div
            style={{
              fontWeight: 900,
              color: stats.pct >= 90 ? "#991b1b" : stats.pct >= 75 ? "#9a3412" : "#065f46",
            }}
          >
            {notice}
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="adminStorageBar">
          <div
            className="adminStorageBarFill"
            style={{
              width: `${stats.pct}%`,
              background: progressColor,
            }}
          />
        </div>

        {stats.latestDate ? (
          <div style={{ marginTop: 10, color: "#475569", fontWeight: 800 }}>
            Ultimo file caricato:{" "}
            {new Date(stats.latestDate).toLocaleString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ) : (
          <div style={{ marginTop: 10, color: "#64748b", fontWeight: 800 }}>
            Nessun file presente nei bucket monitorati.
          </div>
        )}
      </div>

      <div className="adminStorageSectionTitle">Utilizzo per bucket</div>

      {stats.byBucket.length === 0 ? (
        <div style={{ marginTop: 10, color: "#64748b", fontWeight: 800 }}>
          Nessun dato disponibile.
        </div>
      ) : (
        <div className="adminStorageTable">
          {stats.byBucket.map((item) => (
            <div key={item.key} className="adminStorageRow">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 950, color: "#0b1224", wordBreak: "break-word" }}>
                  {item.key}
                </div>
                <div style={{ marginTop: 4, color: "#64748b", fontWeight: 800 }}>
                  Bucket
                </div>
              </div>

              <div style={{ fontWeight: 900, color: "#334155" }}>
                {item.files} file
              </div>

              <div style={{ fontWeight: 950, color: "#0b1224" }}>
                {formatBytes(item.bytes)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="adminStorageSectionTitle">Utilizzo per cartella principale</div>

      {stats.byTopFolder.length === 0 ? (
        <div style={{ marginTop: 10, color: "#64748b", fontWeight: 800 }}>
          Nessun dato disponibile.
        </div>
      ) : (
        <div className="adminStorageTable">
          {stats.byTopFolder.map((item) => (
            <div key={item.key} className="adminStorageRow">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 950, color: "#0b1224", wordBreak: "break-word" }}>
                  {item.key}
                </div>
                <div style={{ marginTop: 4, color: "#64748b", fontWeight: 800 }}>
                  Bucket / cartella
                </div>
              </div>

              <div style={{ fontWeight: 900, color: "#334155" }}>
                {item.files} file
              </div>

              <div style={{ fontWeight: 950, color: "#0b1224" }}>
                {formatBytes(item.bytes)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="adminStorageSectionTitle">File rilevati</div>

      {sortedRows.length === 0 ? (
        <div style={{ marginTop: 10, color: "#64748b", fontWeight: 800 }}>
          Nessun file rilevato.
        </div>
      ) : (
        <div className="adminStorageTable">
          {sortedRows.map((row) => (
            <div key={`${row.bucket}-${row.fullPath}`} className="adminStorageFileRow">
              <div style={{ fontWeight: 900, color: "#334155" }}>
                {row.bucket}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: "#0b1224", wordBreak: "break-word" }}>
                  {row.fullPath}
                </div>
              </div>

              <div style={{ fontWeight: 900, color: "#0b1224" }}>
                {formatBytes(getFileSize(row))}
              </div>

              <div style={{ color: "#475569", fontWeight: 800 }}>
                {getCreatedAt(row)
                  ? new Date(getCreatedAt(row)).toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}