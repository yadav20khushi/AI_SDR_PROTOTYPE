import { useState } from "react";

const API_BASE = "http://localhost:8000";

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ScoreBar({ score }) {
  const max = 45;
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color =
    score >= 25 ? "#1D9E75" : score >= 15 ? "#EF9F27" : "#B4B2A9";
  return (
    <div style={{ width: 64, height: 4, background: "#E5E5E5", borderRadius: 2, marginTop: 4 }}>
      <div style={{ width: `${pct}%`, height: 4, borderRadius: 2, background: color, transition: "width 0.5s ease" }} />
    </div>
  );
}

function LeadCard({ lead, index }) {
  const [copied, setCopied] = useState(false);
  const tags = lead.reason
    ? lead.reason.split("|").map((s) => s.trim()).filter(Boolean)
    : [];

  const copy = () => {
    navigator.clipboard.writeText(lead.message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        background: "var(--bg-card, #ffffff)",
        border: "0.5px solid var(--border, rgba(0,0,0,0.12))",
        borderRadius: 12,
        padding: "1.25rem",
        animation: `fadeIn 0.2s ease both`,
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#E6F1FB", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#185FA5", flexShrink: 0,
            }}
          >
            {getInitials(lead.name)}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{lead.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              {lead.role} · {lead.company}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{lead.score}</span>
          <span style={{ fontSize: 11, color: "#888", marginTop: 2 }}>score</span>
          <ScoreBar score={lead.score} />
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 999,
                border: "0.5px solid rgba(0,0,0,0.12)", color: "#666",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Message */}
      <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ fontSize: 14, lineHeight: 1.65 }}>{lead.message}</div>
        {lead.why && (
          <div
            style={{
              fontSize: 12, color: "#888", marginTop: 8,
              paddingTop: 8, borderTop: "0.5px solid rgba(0,0,0,0.1)",
            }}
          >
            Why it works: {lead.why}
          </div>
        )}
      </div>

      <button
        onClick={copy}
        style={{
          marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 12, color: "#666", background: "none",
          border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8,
          padding: "4px 10px", cursor: "pointer",
        }}
      >
        {copied ? "Copied!" : "Copy message"}
      </button>
    </div>
  );
}

const FILTERS = [
  { label: "All", key: "all" },
  { label: "High intent (25+)", key: "high" },
  { label: "Mid (15–24)", key: "mid" },
  { label: "Low (<15)", key: "low" },
];

export default function SDRDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [hasRun, setHasRun] = useState(false);

  const runOutbound = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/run-outbound`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setHasRun(true);
    } catch (err) {
      setError(`Could not connect to backend: ${err.message}. Make sure your FastAPI server is running on localhost:8000.`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter((r) => {
    if (filter === "high") return r.score >= 25;
    if (filter === "mid") return r.score >= 15 && r.score < 25;
    if (filter === "low") return r.score < 15;
    return true;
  });

  const avg =
    results.length
      ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
      : null;
  const highCount = results.filter((r) => r.score >= 25).length;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        body { background: #f5f5f3; font-family: system-ui, sans-serif; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>AI SDR Dashboard</h1>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            Outbound lead intelligence — scored, analyzed, and ready to send
          </p>
        </div>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total leads", value: results.length || "—" },
              { label: "Avg score", value: avg ?? "—" },
              { label: "High intent", value: hasRun ? highCount : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(0,0,0,0.05)", borderRadius: 8, padding: "0.75rem 1rem", minWidth: 90 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          <button
            onClick={runOutbound}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0 20px", height: 40, borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff",
              fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%", background: "#1D9E75",
                animation: loading ? "pulse 1s infinite" : "none",
              }}
            />
            {loading ? "Running..." : "Run outbound"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Filters */}
        {hasRun && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {FILTERS.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "5px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                  border: filter === key ? "0.5px solid rgba(0,0,0,0.4)" : "0.5px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  fontWeight: filter === key ? 500 : 400,
                  color: filter === key ? "#111" : "#666",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Lead list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#888", fontSize: 14 }}>
              Analyzing leads...
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((lead, i) => <LeadCard key={i} lead={lead} index={i} />)
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", color: "#aaa", fontSize: 14 }}>
              {hasRun ? "No leads match this filter" : "Click Run outbound to fetch and score your leads"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}