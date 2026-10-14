import React from "react";

/**
 * Segmented pill tabs with coloured dot + count badge.
 * tabs: [{ value, label, count?, tone?: "primary"|"success"|"info"|"warning"|"danger"|"secondary", icon? }]
 * Styles live in assets/scss/approval.scss (.it-tabs).
 */
const PillTabs = ({ tabs, value, onChange, className = "" }) => (
  <div className={`it-tabs-row ${className}`}>
    <div className="it-tabs" role="tablist">
      {tabs.map((t) => {
        const active = String(value) === String(t.value);
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`it-tab tone-${t.tone || "info"} ${active ? "is-active" : ""}`}
            onClick={() => !active && onChange(t.value)}
          >
            {t.icon ? <i className={`${t.icon} it-tab-icon`}></i> : <span className="it-tab-dot"></span>}
            {t.label}
            {t.count != null && <span className="it-tab-count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  </div>
);

export default PillTabs;
