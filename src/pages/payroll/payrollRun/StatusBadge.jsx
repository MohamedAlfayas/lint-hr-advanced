import React, { useEffect, useState } from "react";
import { fetchStatusMaster, colorFor } from "./statusHelpers";

const TONES = ["primary", "secondary", "success", "danger", "warning", "info", "dark", "light"];

export const STATUS_ICONS = {
  draft: "ri-draft-line",
  processing: "ri-loader-4-line",
  computed: "ri-calculator-line",
  pending_approval: "ri-time-line",
  approved: "ri-checkbox-circle-line",
  rejected: "ri-close-circle-line",
  locked: "ri-lock-line",
  paid: "ri-bank-card-line",
  partially_paid: "ri-hand-coin-line",
  closed: "ri-archive-line",
  on_hold: "ri-pause-circle-line",
  cancelled: "ri-forbid-line",
  pending: "ri-time-line",
  under_review: "ri-search-eye-line",
  finalized: "ri-shield-check-line",
  excluded: "ri-indeterminate-circle-line",
};

/** Bootstrap tone name -> class; anything else (e.g. a hex from the status master) -> inline colour. */
export const toneProps = (color) =>
  TONES.includes(color)
    ? { className: `tone-${color}` }
    : { className: "tone-custom", style: { "--t": color } };

const StatusBadge = ({ scope, code, size = "fs-12" }) => {
  const [label, setLabel] = useState(code);
  const [color, setColor] = useState(colorFor(code));

  useEffect(() => {
    setLabel(code);
    setColor(colorFor(code));
    let active = true;
    fetchStatusMaster(scope).then((rows) => {
      if (!active) return;
      const row = rows.find((r) => r.code === code);
      if (!row) return;
      setLabel(row.label || code);
      setColor(row.color || colorFor(code));
    });
    return () => { active = false; };
  }, [scope, code]);

  const tone = toneProps(color);
  return (
    <span className={`psb ${tone.className} ${size}`} style={tone.style}>
      <i className={STATUS_ICONS[code] || "ri-checkbox-blank-circle-line"}></i>
      {String(label || "").replace(/_/g, " ")}
    </span>
  );
};

export default StatusBadge;
