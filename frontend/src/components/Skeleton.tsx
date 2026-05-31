/**
 * Skeleton Component
 * 
 * A reusable skeleton loading placeholder with configurable dimensions and shimmer animation.
 * The shimmer animation uses a CSS gradient sweep and respects prefers-reduced-motion.
 * 
 * @example
 * ```tsx
 * <Skeleton width={200} height={40} borderRadius={8} />
 * <Skeleton width="100%" height={20} borderRadius={4} />
 * ```
 */

interface SkeletonProps {
  /** Width of the skeleton (px or %) */
  width?: number | string;
  /** Height of the skeleton (px or %) */
  height?: number | string;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Aria-hidden for accessibility (default: true) */
  ariaHidden?: boolean;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 4,
  className = "",
  style = {},
  ariaHidden = true,
}: SkeletonProps) {
  const normalizedWidth = typeof width === "number" ? `${width}px` : width;
  const normalizedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{
        width: normalizedWidth,
        height: normalizedHeight,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      aria-hidden={ariaHidden}
    />
  );
}

/**
 * CampaignListSkeleton
 * 
 * Skeleton loading state for campaign list/grid views.
 * Displays 3 campaign card placeholders.
 * 
 * @example
 * ```tsx
 * {isLoading && <CampaignListSkeleton />}
 * ```
 */
export function CampaignListSkeleton() {
  return (
    <div className="grid" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={80} height={20} borderRadius={4} />
            <Skeleton width={60} height={20} borderRadius={4} />
          </div>
          <div className="card-body" style={{ gap: 10 }}>
            <Skeleton width="90%" height={18} borderRadius={4} />
            <Skeleton width="70%" height={16} borderRadius={4} />
            <Skeleton width="85%" height={16} borderRadius={4} />
            <Skeleton width="60%" height={16} borderRadius={4} />
          </div>
          <div className="card-footer">
            <Skeleton width="100%" height={40} borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * RewardListSkeleton
 * 
 * Skeleton loading state for reward list views.
 * Displays 4 reward item placeholders.
 * 
 * @example
 * ```tsx
 * {isLoading && <RewardListSkeleton />}
 * ```
 */
export function RewardListSkeleton() {
  return (
    <ul className="reward-list" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="reward-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={14} borderRadius={4} />
          </div>
          <Skeleton width={80} height={32} borderRadius={6} />
        </li>
      ))}
    </ul>
  );
}

/**
 * AnalyticsPageSkeleton
 * 
 * Skeleton loading state for analytics/dashboard pages.
 * Displays stat cards and chart placeholders.
 * 
 * @example
 * ```tsx
 * {isLoading && <AnalyticsPageSkeleton />}
 * ```
 */
export function AnalyticsPageSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Skeleton width="60%" height={36} borderRadius={6} />
            <Skeleton width="80%" height={14} borderRadius={4} />
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {[0, 1].map((i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <Skeleton width="40%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={200} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
