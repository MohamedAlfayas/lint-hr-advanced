import React from "react";

/**
 * TableSkeleton
 * Props:
 *  - rows     : number of skeleton rows to render (default 4)
 *  - columns  : total number of <td> columns (default 6)
 *  - hasAvatar: if true, first column renders an avatar + two lines shimmer
 */
const SkletonDashboard = ({ rows = 4, columns = 6, hasAvatar = true }) => {
  const shimmer = {
    background: "linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "4px",
    display: "inline-block",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => {
            // ── First column: avatar circle + two text lines ──────────────
            if (colIdx === 0 && hasAvatar) {
              return (
                <td key={colIdx} style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Avatar circle */}
                    <div
                      style={{
                        ...shimmer,
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                    {/* Name + email lines */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                      <div style={{ ...shimmer, height: "12px", width: "120px" }} />
                      <div style={{ ...shimmer, height: "10px", width: "160px" }} />
                    </div>
                  </div>
                </td>
              );
            }

            // ── All other columns: single shimmer bar ─────────────────────
            return (
              <td key={colIdx} style={{ padding: "12px 8px" }}>
                <div
                  style={{
                    ...shimmer,
                    height: "12px",
                    width: colIdx === columns - 1 ? "60px" : "80px",
                  }}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export default SkletonDashboard;