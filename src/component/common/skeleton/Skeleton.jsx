import React, { useEffect, useState } from "react";
import "./skeleton.scss";

const WIDTHS = ["72%", "55%", "84%", "64%", "48%", "78%", "60%", "90%"];
const range = (n) => Array.from({ length: n }, (_, i) => i);

export const Skel = ({ w = "100%", h = 12, circle = false, pill = false, className = "", style }) => (
  <span
    aria-hidden="true"
    className={`sk${circle ? " is-circle" : ""}${pill ? " is-pill" : ""} ${className}`.trim()}
    style={{ width: circle ? h : w, height: h, ...style }}
  />
);

const Status = ({ testId, label, className, style, children }) => (
  <div role="status" aria-busy="true" aria-label={label} data-testid={testId} className={className} style={style}>
    {children}
  </div>
);

const MAP_PINS = [
  { top: "28%", left: "34%" },
  { top: "46%", left: "62%" },
  { top: "64%", left: "40%" },
  { top: "38%", left: "78%" },
];

/** Map-shaped placeholder; `overlay` covers its positioned parent. */
export const MapSkeleton = ({ overlay = false, testId = "map-loading-skeleton", label = "Loading map", style }) => (
  <Status testId={testId} label={label} className={`sk-map${overlay ? " is-overlay" : ""}`} style={style}>
    <span className="sk sk-map-base" />
    <span className="sk-map-road is-h" style={{ top: "34%" }} />
    <span className="sk-map-road is-h" style={{ top: "68%" }} />
    <span className="sk-map-road is-v" style={{ left: "28%" }} />
    <span className="sk-map-road is-v" style={{ left: "70%" }} />
    {MAP_PINS.map((p, i) => (
      <span key={i} className="sk-map-pin" style={{ ...p, animationDelay: `${i * 0.18}s` }} />
    ))}
    <span className="sk-map-chip">
      <i className="ri-map-pin-line" />
      {label}…
    </span>
  </Status>
);

/**
 * Wraps a map and keeps a MapSkeleton over it until `ready` (e.g. Google Maps `onTilesLoaded`).
 * Gives up after `timeout` ms so a map that never finishes (bad key, offline) still shows its own error.
 */
export const MapShell = ({ ready, timeout = 8000, className = "", style, testId, label, children }) => {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (ready) return undefined;
    const id = setTimeout(() => setTimedOut(true), timeout);
    return () => clearTimeout(id);
  }, [ready, timeout]);

  return (
    <div className={`sk-map-shell ${className}`.trim()} style={style}>
      {children}
      {!ready && !timedOut && <MapSkeleton overlay testId={testId} label={label} />}
    </div>
  );
};

export const LineSkeleton = ({ lines = 3, testId = "loading-skeleton", label = "Loading" }) => (
  <Status testId={testId} label={label} className="sk-stack">
    {range(lines).map((i) => (
      <Skel key={i} w={i === lines - 1 ? "45%" : WIDTHS[i % WIDTHS.length]} />
    ))}
  </Status>
);

export const ListSkeleton = ({ rows = 4, avatar = true, testId = "loading-skeleton", label = "Loading" }) => (
  <Status testId={testId} label={label} className="sk-list">
    {range(rows).map((i) => (
      <div className="sk-row" key={i}>
        {avatar && <Skel circle h={36} />}
        <div className="sk-stack">
          <Skel w={WIDTHS[i % WIDTHS.length]} h={12} />
          <Skel w={WIDTHS[(i + 3) % WIDTHS.length]} h={10} />
        </div>
        <Skel w={56} h={20} pill />
      </div>
    ))}
  </Status>
);

export const TableSkeletonRows = ({ rows = 6, cols = 5, avatar = true, head = true }) => {
  const style = { "--sk-cols": `${avatar ? "minmax(0,2fr) " : ""}repeat(${avatar ? cols - 1 : cols}, minmax(0,1fr))` };
  return (
    <div className="sk-table" style={style}>
      {head && (
        <div className="sk-table-row is-head">
          {range(cols).map((c) => (
            <Skel key={c} w="50%" h={10} />
          ))}
        </div>
      )}
      {range(rows).map((r) => (
        <div className="sk-table-row" key={r}>
          {range(cols).map((c) =>
            c === 0 && avatar ? (
              <div className="sk-row" key={c}>
                <Skel circle h={32} />
                <div className="sk-stack">
                  <Skel w={WIDTHS[r % WIDTHS.length]} h={11} />
                  <Skel w="40%" h={9} />
                </div>
              </div>
            ) : (
              <Skel key={c} w={WIDTHS[(r + c) % WIDTHS.length]} h={11} />
            ),
          )}
        </div>
      ))}
    </div>
  );
};

export const TableSkeletonBlock = ({ testId = "loading-skeleton", label = "Loading", ...rest }) => (
  <Status testId={testId} label={label}>
    <TableSkeletonRows {...rest} />
  </Status>
);

export const StatCardsSkeleton = ({ count = 4 }) => (
  <div className="sk-page-stats">
    {range(count).map((i) => (
      <div className="sk-card sk-row" key={i}>
        <Skel circle h={42} />
        <div className="sk-stack">
          <Skel w="55%" h={10} />
          <Skel w="35%" h={18} />
        </div>
      </div>
    ))}
  </div>
);

export const CardGridSkeleton = ({ count = 6, min = 220, testId = "loading-skeleton", label = "Loading" }) => (
  <Status testId={testId} label={label} className="sk-grid" style={{ "--sk-min": `${min}px` }}>
    {range(count).map((i) => (
      <div className="sk-card sk-stack" key={i}>
        <div className="sk-row">
          <Skel circle h={34} />
          <Skel w={WIDTHS[i % WIDTHS.length]} h={12} />
        </div>
        <Skel w="90%" />
        <Skel w="65%" />
        <Skel w="40%" h={22} pill />
      </div>
    ))}
  </Status>
);

export const KanbanSkeleton = ({ columns = 4, cards = 3, testId = "loading-skeleton", label = "Loading" }) => (
  <Status testId={testId} label={label} className="sk-kanban">
    {range(columns).map((c) => (
      <div className="sk-kanban-col" key={c}>
        <div className="sk-row" style={{ justifyContent: "space-between" }}>
          <Skel w="45%" h={14} />
          <Skel w={28} h={18} pill />
        </div>
        {range(cards - (c % 2)).map((i) => (
          <div className="sk-card sk-stack" key={i}>
            <Skel w={WIDTHS[(c + i) % WIDTHS.length]} h={12} />
            <Skel w="90%" h={10} />
            <div className="sk-row" style={{ justifyContent: "space-between", marginTop: 4 }}>
              <Skel w={64} h={18} pill />
              <Skel circle h={24} />
            </div>
          </div>
        ))}
      </div>
    ))}
  </Status>
);

export const DetailSkeleton = ({ sections = 2, testId = "loading-skeleton", label = "Loading" }) => (
  <Status testId={testId} label={label} className="sk-stack" style={{ gap: 18 }}>
    <div className="sk-row">
      <Skel circle h={48} />
      <div className="sk-stack">
        <Skel w="40%" h={16} />
        <Skel w="25%" h={10} />
      </div>
    </div>
    {range(sections).map((s) => (
      <div className="sk-card sk-stack" key={s}>
        <Skel w="30%" h={14} />
        {range(4).map((i) => (
          <div className="sk-row" key={i}>
            <Skel w="35%" h={10} />
            <Skel w={WIDTHS[(s + i) % WIDTHS.length]} h={10} />
          </div>
        ))}
      </div>
    ))}
  </Status>
);

export const PageSkeleton = ({ stats = true, rows = 8, testId = "page-loading-skeleton", label = "Loading page" }) => (
  <Status testId={testId} label={label} className="sk-page">
    <div className="sk-page-head">
      <div className="sk-stack" style={{ flex: "0 1 320px" }}>
        <Skel w="70%" h={20} />
        <Skel w="45%" h={10} />
      </div>
      <div className="sk-row">
        <Skel w={110} h={34} />
        <Skel w={90} h={34} />
      </div>
    </div>
    {stats && <StatCardsSkeleton />}
    <div className="sk-card">
      <div className="sk-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Skel w={220} h={32} />
        <Skel w={120} h={32} />
      </div>
      <TableSkeletonRows rows={rows} cols={6} />
    </div>
  </Status>
);

export const AuthSkeleton = () => (
  <Status testId="auth-loading-skeleton" label="Loading" className="sk-auth">
    <div className="sk-card">
      <Skel w={120} h={24} />
      <Skel w="70%" h={18} />
      <Skel w="50%" h={10} />
      <Skel h={40} style={{ marginTop: 10 }} />
      <Skel h={40} />
      <Skel h={42} pill style={{ marginTop: 6 }} />
    </div>
  </Status>
);

export default PageSkeleton;
