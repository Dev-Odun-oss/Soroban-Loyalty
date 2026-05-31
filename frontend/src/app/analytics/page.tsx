"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api, AnalyticsData } from "@/lib/api";
import { ExperimentStatsPanel } from "@/components/ExperimentStatsPanel";

import { StatCardsSkeleton, BarChartSkeleton, LineChartSkeleton } from "@/components/ChartSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

const DATE_RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = () => {
    setLoading(true);
    setError(null);
    api
      .getAnalytics(days)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Analytics</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`btn ${days === r.value ? "btn-primary" : "btn-secondary"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadAnalytics} />}

      <div style={{ opacity: loading ? 1 : 0, transition: "opacity 0.2s", position: loading ? "static" : "absolute", pointerEvents: "none", display: loading ? "block" : "none" }}
           aria-hidden={!loading}>
        <StatCardsSkeleton />
        <h2 className="section-title">Claims per Campaign</h2>
        <BarChartSkeleton />
        <h2 className="section-title" style={{ marginTop: 40 }}>Claims Over Time</h2>
        <LineChartSkeleton />
      </div>

      {!loading && data ? (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{data.totalClaims.toLocaleString()}</div>
              <div className="stat-label">Total Claims</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totalLYT.toLocaleString()}</div>
              <div className="stat-label">LYT Distributed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.redemptionRate}%</div>
              <div className="stat-label">Redemption Rate</div>
            </div>
          </div>

          {/* Bar chart: claims per campaign */}
          <h2 className="section-title">Claims per Campaign</h2>
          {data.claimsPerCampaign.length > 0 ? (
            <>
              <div style={{ width: "100%", height: 280 }} aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.claimsPerCampaign} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8 }}
                      labelStyle={{ color: "var(--text-primary)" }}
                    />
                    <Bar dataKey="claims" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Accessible data table fallback */}
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  View data table
                </summary>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <th style={{ textAlign: "left", padding: "6px 12px" }}>Campaign</th>
                      <th style={{ textAlign: "right", padding: "6px 12px" }}>Claims</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.claimsPerCampaign.map((row) => (
                      <tr key={row.name} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 12px" }}>{row.name}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{row.claims}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <EmptyState
              illustration="campaigns"
              title="No campaign data"
              description="No claim data for this period."
              cta={{ label: "Create a campaign", href: "/merchant" }}
            />
          )}

          {/* Line chart: claims over time */}
          <h2 className="section-title" style={{ marginTop: 40 }}>Claims Over Time</h2>
          {data.claimsOverTime.length > 0 ? (
            <>
              <div style={{ width: "100%", height: 280 }} aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.claimsOverTime} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8 }}
                      labelStyle={{ color: "var(--text-primary)" }}
                    />
                    <Line type="monotone" dataKey="claims" stroke="var(--accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  View data table
                </summary>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <th style={{ textAlign: "left", padding: "6px 12px" }}>Date</th>
                      <th style={{ textAlign: "right", padding: "6px 12px" }}>Claims</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.claimsOverTime.map((row) => (
                      <tr key={row.date} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 12px" }}>{row.date}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{row.claims}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <EmptyState
              illustration="transactions"
              title="No time-series data"
              description="No time-series data for this period."
            />
          )}
        </>
      ) : null}

      {/* A/B Experiment Results */}
      <h2 className="section-title" style={{ marginTop: 40 }}>A/B Experiment Results</h2>
      <ExperimentStatsPanel />
    </div>
  );
}
