// src/component/maps/UsersClusterMapAll.jsx
//
// Install once:  yarn add framer-motion react-select
//
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
  OverlayView,
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Button,
} from "reactstrap";
import Select from "react-select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Api } from "../../common/api/Api";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./LocationWebSocket/WebSocket";
import "../../common/css/lc_style.css";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const loaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  libraries: ["places"],
  version: "weekly",
};

const indiaCenter = { lat: 22.3511148, lng: 78.6677428 };

// Seconds to animate the entire route (lower = faster) at 1x speed
const PLAYBACK_DURATION_SEC = 50;

// Selectable playback speed multipliers, default is 1x
const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

// Zoom level used while following the moving marker during playback
const PLAYBACK_FOLLOW_ZOOM = 17;

// Zoom level used when a timeline card/marker is clicked to focus on that
// specific point. Kept separate from PLAYBACK_FOLLOW_ZOOM — a short route's
// "Full view" fit can already land above 17, so reusing that value could
// zoom OUT instead of in. This is only ever applied as a floor (see
// handleTimelineClick), never lower than whatever the map is already at.
const TIMELINE_FOCUS_ZOOM = 19;

// Distance below which two consecutive points count as "waiting" (km)
const WAIT_THRESHOLD_KM = 0.05;

// ISO (YYYY-MM-DD) format used throughout for the date filter's internal value
const ISO_DATE_FORMAT = "YYYY-MM-DD";

// How far back the date picker allows selection (from today)
const DATE_RANGE_YEARS_BACK = 1;

// localStorage keys that hold the org's custom-status and custom-form
// master lists. Individual location / form_submission records only carry
// numeric `custom_status` / `custom_form` IDs — the human-readable name
// (and, for statuses, an icon) has to be resolved by matching against
// these cached lists.
const LS_CUSTOM_STATUSES_KEY = "custom_statuses";
const LS_CUSTOM_FORM_KEY = "custom_form";

// ── Timeline panel sizing (responsive instead of a fixed px width) ──
// clamp(min, preferred, max): scales continuously with viewport width
// instead of jumping straight to the max at a fixed breakpoint, so wide
// screens actually get visibly more room instead of stalling at 420px.
const TIMELINE_WIDTH_CLAMP = "clamp(300px, 26vw, 640px)";

// ── Which of the three timeline "views" is showing on the right panel.
// Independent of `dataMode` (GPS/Road/Both) below — TAB switches which
// API/dataset drives the right panel list, dataMode only affects which
// coordinate fields are used for the map route while on the Location tab.
const TIMELINE_TABS = {
  LOCATION: "location",
  ACTIVITY: "activity",
  MOBILE: "mobile",
};

const TIMELINE_TAB_META = {
  [TIMELINE_TABS.LOCATION]: {
    label: "Location Timeline",
    shortLabel: "Location",
    icon: "ri-route-line",
  },
  [TIMELINE_TABS.ACTIVITY]: {
    label: "Activity Timeline",
    shortLabel: "Activity",
    icon: "ri-list-check-2",
  },
  [TIMELINE_TABS.MOBILE]: {
    label: "Mobile Timeline",
    shortLabel: "Mobile",
    icon: "ri-smartphone-line",
  },
};

// ─── Distance helper (km) ───────────────────────────────────────
const haversine = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

// ── Which coordinate source builds the map/timeline. "gps" = raw
// latitude/longitude straight from the device, drawn as a solid blue
// line. "road" = OSRM-snapped formatted_latitude/formatted_longitude
// (falls back to raw if a point has no formatted_* pair yet), drawn as a
// dotted red line. "both" keeps every marker/playback/timeline value on
// the normal GPS path (same as "gps") and additionally overlays the
// dotted red OSRM line on top of it. Surfaced as three tabs above the
// map. ─────────────────────────────────────────────────────────────────
const DATA_MODES = {
  GPS: "gps",
  ROAD: "road",
  BOTH: "both",
};

// ─── Raw GPS coordinates, straight off the device.
// Returns null when the backend sends null/missing/non-numeric coords so
// callers can skip the point on the map instead of plotting (0, 0). ────
const getLat = (loc) => {
  const raw = loc?.latitude;
  if (raw == null || raw === "") return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};

const getLng = (loc) => {
  const raw = loc?.longitude;
  if (raw == null || raw === "") return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};

// ─── OSRM/road-snapped coordinates. Falls back to the raw fields when a
// point hasn't been formatted yet. Returns null (not 0) when neither
// source has a usable value. ───────────────────────────────────────────
const getRoadLat = (loc) => {
  const raw = loc?.formatted_latitude;
  if (raw != null && raw !== "") {
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n !== 0) return n;
  }
  return getLat(loc);
};

const getRoadLng = (loc) => {
  const raw = loc?.formatted_longitude;
  if (raw != null && raw !== "") {
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n !== 0) return n;
  }
  return getLng(loc);
};

const hasValidCoords = (p) =>
  p != null && Number.isFinite(p.lat) && Number.isFinite(p.lng);

// True location-tracking frames (including null lat/lng when location is
// off). Rejects socket acks / control messages that would otherwise create
// today's cache key and block the REST history fetch.
const isLocationTrackingPayload = (data) => {
  if (!data || typeof data !== "object") return false;
  return (
    data.latitude != null ||
    data.longitude != null ||
    data.timestamp != null ||
    data.time != null ||
    data.created_at != null ||
    data.is_location_on != null ||
    data.is_internet_on != null ||
    data.battery_percentage != null ||
    data.form_submission != null ||
    data.custom_status != null ||
    data.accurate_address != null ||
    data.formatted_address != null
  );
};

// `formatted_address` arrives as a Python-dict-repr string (single quotes,
// None/True/False) — not valid JSON — so it can't be JSON.parse'd. Pull the
// `formatted_address` key's value out with a regex instead. Falls back to
// `accurate_address` if `formatted_address` is missing or unparseable.
const extractFormattedAddress = (loc) => {
  const raw = loc?.formatted_address;
  if (typeof raw === "string" && raw.trim()) {
    const match = raw.match(/'formatted_address':\s*'([^']*)'/);
    if (match) return match[1];
  }
  return loc?.accurate_address || "";
};

// Original palette — unchanged (form added for form-submission markers,
// roadLine added for the dotted OSRM/road-snapped route)
const COLORS = {
  start: "#28a745",
  end: "#dc3545",
  waiting: "#f97316",
  travel: "#2563eb",
  route: "#1a73e8",
  moving: "#ff9800",
  form: "#7c3aed",
  roadLine: "#dc2626",
};

// ─── Scrollbar styling for the form-submission modal body (matches the
//     app's other modal — thin, light-blue thumb) ────────────────────
const FORM_MODAL_SCROLL_STYLE_ID = "ucma-form-modal-scroll";
const injectFormModalScrollStyles = () => {
  if (
    typeof document === "undefined" ||
    document.getElementById(FORM_MODAL_SCROLL_STYLE_ID)
  )
    return;
  const tag = document.createElement("style");
  tag.id = FORM_MODAL_SCROLL_STYLE_ID;
  tag.innerHTML = `
    .cst-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .cst-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
    .cst-scroll::-webkit-scrollbar-thumb { background: #c5cff0; border-radius: 10px; }
    .cst-scroll::-webkit-scrollbar-thumb:hover { background: #405189; }
    .cst-scroll { scrollbar-width: thin; scrollbar-color: #c5cff0 #f1f1f1; }
  `;
  document.head.appendChild(tag);
};

// ─── Shared chip / box styles used inside the form-submission modal
//     (same look as the app's activity-timeline modal). ───────────────
const coordPill = {
  background: "#f0f4ff",
  borderRadius: "6px",
  padding: "5px 12px",
  fontSize: "12px",
  color: "#405189",
  fontWeight: 500,
  border: "0.5px solid #c5cff0",
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
};

const timeBox = {
  background: "#f8f9fc",
  borderRadius: "6px",
  padding: "8px 12px",
  border: "0.5px solid #eaecf5",
};
const timeBoxLabel = {
  fontSize: "11px",
  color: "#999",
  marginBottom: "3px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const timeBoxValue = {
  fontSize: "13px",
  color: "#333",
  fontWeight: 500,
};

// ─── Compact select style used inside the timeline filter bar ──
const compactSelectStyle = {
  height: "32px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "12px",
  padding: "0 8px",
  background: "#f8fafc",
  cursor: "pointer",
  width: "100%",
  color: "#1e293b",
};

// ─── Compact date-picker style to match compactSelectStyle look ──
const compactDatePickerStyle = {
  height: "32px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "12px",
  background: "#f8fafc",
  width: "100%",
};

// ─── react-select styles to match the reactstrap look (compact, responsive column) ──
const rsSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "32px",
    height: "32px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
    background: "#f8fafc",
    width: "100%",
    fontSize: "12px",
  }),
  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: "32px" }),
  menu: (base) => ({ ...base, zIndex: 20 }),
};

// ─── Employee option renderer (avatar + name + department) ─────
const EmployeeDisplayInSelect = (props) => {
  const { data, innerRef, innerProps, isSelected, isFocused } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        cursor: "pointer",
        background: isSelected ? "#dbeafe" : isFocused ? "#f1f5f9" : "#fff",
      }}
    >
      {data.profile_url ? (
        <img
          src={data.profile_url}
          alt={data.label}
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: COLORS.travel,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {data.label?.charAt(0)?.toUpperCase()}
        </div>
      )}
      <span style={{ fontSize: "12px", color: "#1e293b" }}>
        {data.label}
        {data.department ? ` — ${data.department}` : ""}
      </span>
    </div>
  );
};

// ─── One-time injected keyframes (structure/animation only, no color/font overrides) ─
const STYLE_ID = "ucma-anim-styles";
const injectStyles = () => {
  let tag = document.getElementById(STYLE_ID);
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_ID;
    document.head.appendChild(tag);
  }
  tag.innerHTML = `
    @keyframes ucma-ring {
      0%   { transform: scale(0.6); opacity: 0.55; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes ucma-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.25; }
    }
    @keyframes ucma-skeleton-pulse {
      0%   { opacity: 0.55; }
      50%  { opacity: 1; }
      100% { opacity: 0.55; }
    }
    .ucma-skeleton {
      background: #e2e8f0;
      border-radius: 6px;
      animation: ucma-skeleton-pulse 1.3s ease-in-out infinite;
    }
    .ucma-scroll::-webkit-scrollbar { width: 5px; }
    .ucma-scroll::-webkit-scrollbar-track { background: transparent; }
    .ucma-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .ucma-liveblink { animation: ucma-blink 1.2s infinite; }
    .ucma-tl-filterbar select:focus,
    .ucma-tl-filterbar input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .ucma-tl-filterbar .ant-picker {
      height: 32px;
      border-radius: 8px;
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    .ucma-tl-filterbar .ant-picker-focused {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .ucma-tl-filterbar .ant-picker input {
      font-size: 12px;
    }
    .ucma-vslider {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
    }
    .ucma-vslider::-webkit-slider-runnable-track {
      background: transparent;
      height: 3px;
    }
    .ucma-vslider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2563eb;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 5px rgba(0,0,0,0.45);
      cursor: pointer;
      margin-top: -6.5px;
    }
    .ucma-vslider::-moz-range-track {
      background: transparent;
      height: 3px;
      border: none;
    }
    .ucma-vslider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2563eb;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 5px rgba(0,0,0,0.45);
      cursor: pointer;
    }
    /* Playback panel: empty space between controls lets clicks fall through
       to whatever is underneath — only the actual controls themselves are
       clickable. */
    .ucma-playback-panel {
      pointer-events: none;
    }
    .ucma-playback-panel > * {
      pointer-events: auto;
    }
    .ucma-mode-tabs {
      pointer-events: auto;
    }
    .ucma-mode-tab {
      border: none;
      background: rgba(255,255,255,0.95);
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
    }
    .ucma-mode-tab.active {
      background: #2563eb;
      color: #fff;
    }
    .ucma-view-tabs {
      display: flex;
      flex-direction: row;
      width: 100%;
      flex-shrink: 0;
      border-bottom: 1px solid #e5e7eb;
      background: #f8fafc;
      padding: 0;
    }
    .ucma-view-tab {
      flex: 1 1 0%;
      min-width: 0;
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      padding: 10px 6px;
      cursor: pointer;
      text-align: center;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
      transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .ucma-view-tab i {
      font-size: 14px;
      flex-shrink: 0;
    }
    .ucma-view-tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ucma-view-tab:hover:not(.active) {
      color: #2563eb;
      background: #eef2ff;
    }
    .ucma-view-tab.active {
      color: #2563eb;
      background: #fff;
      border-bottom-color: #2563eb;
    }
    .ucma-view-tab:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: -2px;
    }
    @media (max-width: 480px), (max-height: 480px) {
      .ucma-playback-panel {
        left: 10px !important;
        top: 64px !important;
        transform: none !important;
        gap: 10px !important;
      }
      .ucma-playback-rail {
        height: 110px !important;
      }
      .ucma-playback-play {
        width: 34px !important;
        height: 34px !important;
        font-size: 14px !important;
      }
      .ucma-playback-reset {
        width: 24px !important;
        height: 24px !important;
        font-size: 11px !important;
      }
      .ucma-playback-speedbtn {
        width: 30px !important;
        font-size: 10px !important;
        padding: 3px 0 !important;
      }
      .ucma-mode-tab {
        font-size: 11px !important;
        padding: 5px 9px !important;
      }
      .ucma-view-tab {
        font-size: 11px !important;
        padding: 8px 4px !important;
        gap: 3px !important;
      }
      .ucma-view-tab i {
        font-size: 13px !important;
      }
    }
    @media (max-width: 380px) {
      .ucma-tl-card {
        padding: 5px 7px !important;
        border-radius: 8px !important;
      }
      .ucma-view-tab span.ucma-view-tab-label {
        display: none;
      }
    }
  `;
};

const todayIsoIN = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// ─── Form-submission helpers ────────────────────────────────────
// `submitted_data` is a flat array of { id, type, label, value, required }.
// Render each value according to its `type`; image fields carry an object
// with a `file_url` instead of a plain scalar.
const formatFormTimestamp = (ts) => {
  if (!ts) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  const time = date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${day}, ${time}`;
};

// ─── Shared IST time/date splitter used by the Activity + Mobile tabs ──
const splitIndianTime = (ts) => {
  if (!ts) return { time: "", date: "" };
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return { time: "", date: "" };
  return {
    time: date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
};

// ─── Resolve a form submission's "submitted vs pending" state.
//     `status` on the record hasn't been guaranteed to be a strict boolean —
//     it can arrive as a boolean, a numeric flag (1/0), or a string
//     ("submitted" / "pending" / "completed" / "true" / etc). Treating it
//     as `formModalData.status ? ... : ...` is what caused the badge to
//     show the wrong color/label whenever the backend sent a string like
//     "pending" (which is truthy in JS) or a numeric 0/1. This normalizes
//     all of those into a single boolean. ─────────────────────────────
const isFormSubmitted = (status) => {
  if (status === true || status === 1) return true;
  if (status === false || status === 0) return false;
  if (typeof status === "string") {
    return ["true", "1", "submitted", "completed", "success"].includes(
      status.trim().toLowerCase(),
    );
  }
  return false;
};

const renderFormFieldValue = (field) => {
  const isEmpty =
    field?.value === null || field?.value === undefined || field?.value === "";

  if (field?.type === "image") {
    const url = field?.value?.file_url;
    if (!url) {
      return <span className="text-muted small">No image</span>;
    }
    return (
      <img
        src={url}
        alt={field.label || "Uploaded"}
        onClick={(e) => {
          e.stopPropagation();
          window.open(url, "_blank", "noopener,noreferrer");
        }}
        className="rounded-3 border img-fluid"
        style={{
          width: "84px",
          height: "84px",
          objectFit: "cover",
          cursor: "pointer",
        }}
      />
    );
  }

  if (field?.type === "file" || field?.value?.file_url) {
    const url = field?.value?.file_url;
    if (!url) {
      return <span className="text-muted small">No file</span>;
    }
    const fileName = field?.value?.file_name || "View file";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="d-inline-flex align-items-center gap-1"
      >
        <i className="ri-external-link-line"></i> {fileName}
      </a>
    );
  }

  if (isEmpty) {
    return <span className="text-muted small">—</span>;
  }

  return <span>{String(field.value)}</span>;
};

// ─── Activity Timeline helpers (check_in / check_out /
//     custom_status_start / custom_status_end). Custom status is now two
//     point events that share a log `id` (not one interval object). ────
const ACTIVITY_TYPE_CONFIG = {
  check_in: {
    label: "Check In",
    icon: "ri-login-circle-line",
    color: COLORS.start,
  },
  check_out: {
    label: "Check Out",
    icon: "ri-logout-circle-line",
    color: COLORS.end,
  },
  custom_status_start: {
    label: "Status Start",
    icon: "ri-play-circle-line",
    color: "#f59e0b",
  },
  custom_status_end: {
    label: "Status End",
    icon: "ri-stop-circle-line",
    color: "#d97706",
  },
  // Legacy interval shape (pre start/end split) — still renderable.
  custom_status: {
    label: "Status",
    icon: "ri-time-line",
    color: "#f59e0b",
  },
};

const getActivityConfig = (type) =>
  ACTIVITY_TYPE_CONFIG[type] || {
    label: type || "Activity",
    icon: "ri-information-line",
    color: COLORS.travel,
  };

const isStatusStartType = (type) =>
  type === "custom_status_start" || type === "custom_status";

const isStatusEndType = (type) => type === "custom_status_end";

const isStatusActivityType = (type) =>
  isStatusStartType(type) || isStatusEndType(type);

// Status pings carry `location: { lat, lng }`; check-in/out use
// latitude/longitude (+ a string `location` address). Support both.
const getActivityLat = (item) => {
  const fromFields = getLat(item);
  if (fromFields != null) return fromFields;
  const loc = item?.location;
  if (loc && typeof loc === "object") {
    const n = parseFloat(loc.lat);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const getActivityLng = (item) => {
  const fromFields = getLng(item);
  if (fromFields != null) return fromFields;
  const loc = item?.location;
  if (loc && typeof loc === "object") {
    const n = parseFloat(loc.lng);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const activityHasCoords = (item) =>
  hasValidCoords({ lat: getActivityLat(item), lng: getActivityLng(item) });

const getActivityAddressLabel = (item) => {
  if (!item) return "";
  if (typeof item.location === "string" && item.location.trim()) {
    return item.location;
  }
  if (typeof item.notes === "string" && item.notes.trim()) return item.notes;
  if (typeof item.start_notes === "string" && item.start_notes.trim()) {
    return item.start_notes;
  }
  if (typeof item.end_notes === "string" && item.end_notes.trim()) {
    return item.end_notes;
  }
  return "";
};

const getActivityChipLabel = (item, cfg) => {
  const statusName = item?.status?.name;
  if (item?.type === "custom_status_start") {
    return statusName ? `${statusName} · Start` : cfg.label;
  }
  if (item?.type === "custom_status_end") {
    return statusName ? `${statusName} · End` : cfg.label;
  }
  if (item?.type === "custom_status") {
    return statusName || cfg.label;
  }
  return cfg.label;
};

// Expand legacy interval `custom_status` rows into start/end pings so the
// zigzag UI always consumes the same point-event shape.
const expandActivityItems = (items) => {
  if (!Array.isArray(items)) return [];
  const out = [];
  items.forEach((item) => {
    if (!item || item.type !== "custom_status") {
      out.push(item);
      return;
    }
    out.push({
      type: "custom_status_start",
      id: item.id,
      timestamp: item.start_time || item.timestamp,
      status: item.status,
      notes: item.start_notes || item.notes || "",
      location: item.start_location || item.location || null,
    });
    if (item.end_time) {
      out.push({
        type: "custom_status_end",
        id: item.id,
        timestamp: item.end_time,
        status: item.status,
        notes: item.end_notes || "",
        location: item.end_location || null,
      });
    }
  });
  return out;
};

const formatSecondsDuration = (secs) => {
  if (secs === null || secs === undefined || Number.isNaN(secs)) return "";
  const total = Math.max(0, Math.round(secs));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// ─── Mobile (device toggle) helpers ─────────────────────────────
// Builds "from → to" segments for both location and internet state out of
// the raw ping list, per the API's documented rule: a "location off"
// segment runs from a ping with location_toggle:"off" until the next ping
// with location_toggle:"on" (or "now"/end-of-day if it never comes back).
// Same logic mirrored for internet_toggle.
const buildToggleSegments = (pings, field) => {
  if (!Array.isArray(pings) || pings.length === 0) return [];
  const segments = [];
  let openSegment = null;

  pings.forEach((p) => {
    const toggle = p?.[field];
    if (toggle == null) return;
    if (toggle === "off") {
      // Close any still-open "off" segment before starting a fresh one
      // (defensive — shouldn't normally happen with well-formed data).
      if (openSegment)
        segments.push({ ...openSegment, to: p.timestamp, ongoing: false });
      openSegment = {
        from: p.timestamp,
        to: null,
        ongoing: true,
        startPing: p,
      };
    } else if (toggle === "on") {
      if (openSegment) {
        segments.push({
          ...openSegment,
          to: p.timestamp,
          ongoing: false,
          endPing: p,
        });
        openSegment = null;
      }
    }
  });

  if (openSegment) segments.push(openSegment);
  return segments;
};

// ─── Pin-shaped marker icon (teardrop + document glyph) for points that
// have a form submission. Built as a data-URI SVG so it renders as a real
// pin instead of a plain circle — Marker's `label` option can't reliably
// center an emoji glyph on a small circle icon, which is why that
// approach looked broken. ─────────────────────────────────────────────
const buildFormMarkerIcon = () => ({
  url:
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 23 15 23s15-11.8 15-23C30 6.7 23.3 0 15 0z" fill="${COLORS.form}"/>
        <circle cx="15" cy="15" r="10.5" fill="#ffffff"/>
        <rect x="10.2" y="9.5" width="9.6" height="11" rx="1.2" fill="none" stroke="${COLORS.form}" stroke-width="1.4"/>
        <line x1="12.3" y1="13" x2="17.7" y2="13" stroke="${COLORS.form}" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="12.3" y1="15.5" x2="17.7" y2="15.5" stroke="${COLORS.form}" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="12.3" y1="18" x2="15.5" y2="18" stroke="${COLORS.form}" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `),
  scaledSize: new window.google.maps.Size(30, 38),
  anchor: new window.google.maps.Point(15, 38),
});

const UsersClusterMapAll = ({
  employees = [],
  initialEmpId = null,
  initialDate = null, // "YYYY-MM-DD" in Asia/Kolkata — the date to default the filter to
  departments = [],
  onSelectEmployee,
}) => {
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const mapRef = useRef(null);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [path, setPath] = useState([]);

  // ── Which right-panel timeline view is showing: Location / Activity /
  //     Mobile. Location is the default per-load view. Switching tabs
  //     never touches the employee/date filters — those stay shared. ──
  const [activeTab, setActiveTab] = useState(TIMELINE_TABS.LOCATION);

  // ── Employee / department / date filter state (shared by all 3 tabs) ──
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmpId);
  const [dateFilter, setDateFilter] = useState(""); // "" = none picked yet, else "YYYY-MM-DD"

  // Per-employee, per-date location history fetched on demand from
  // GET /attendance/get-location-tracking-data/{emp_id}?date=YYYY-MM-DD
  // Cached by "empId::date" so switching back to a previously viewed
  // employee/date combo doesn't re-fetch.
  const [locationCache, setLocationCache] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Per-employee, per-date Activity Timeline, from
  // GET /attendance/get-attendance-activity-timeline/{emp_id}?date=YYYY-MM-DD
  // Cached the same way as locationCache, fetched lazily only once the
  // Activity tab is actually opened.
  const [activityCache, setActivityCache] = useState({});
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Per-employee, per-date Mobile (device toggle) Timeline, from
  // GET /attendance/get-device-toggle-data/{emp_id}?date=YYYY-MM-DD
  // Cached / fetched lazily the same way.
  const [mobileCache, setMobileCache] = useState({});
  const [loadingMobile, setLoadingMobile] = useState(false);

  // ── Live tracking (websocket) ──
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLive, setIsLive] = useState(false);
  // Live points that arrive before today's REST history is cached. Folding
  // them into an empty cache key would make `if (locationCache[key]) return`
  // skip the API fetch and leave the map/timeline empty.
  const pendingLiveRef = useRef([]);

  // ── Which coordinate source is currently driving the map/timeline:
  //    raw GPS ("gps"), OSRM-snapped ("road"), or both overlaid together
  //    ("both"). Three tabs on the map let the user flip between them;
  //    switching re-derives `path` below from the same cached
  //    `activeLocations`, no extra fetch required. ───────────────────────
  const [dataMode, setDataMode] = useState(DATA_MODES.GPS);

  // ── Form submission details modal ──
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalData, setFormModalData] = useState(null); // the form_submission object
  const [formModalMeta, setFormModalMeta] = useState(null); // { timestamp, address } of the point it came from

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 along whole route
  const [movingPos, setMovingPos] = useState(null);
  const [currentLabel, setCurrentLabel] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5x / 1x / 1.5x / 2x, default 1x

  // Always-on "marching ants" flow along the route, independent of playback
  const [antOffset, setAntOffset] = useState(0);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startProgressRef = useRef(0);

  useEffect(() => {
    injectStyles();
    injectFormModalScrollStyles();
  }, []);

  // ─── Custom-status / custom-form master lists, cached in localStorage.
  //     Read once on mount — individual location records only carry the
  //     numeric IDs (`custom_status`, `custom_form`), so every point/form
  //     submission resolves its display name (and, for statuses, an icon)
  //     against these lists rather than showing the raw ID. ──────────────
  const customStatusList = useMemo(
    () => GetLocalStorageData(LS_CUSTOM_STATUSES_KEY),
    [],
  );

  const customFormList = useMemo(
    () => GetLocalStorageData(LS_CUSTOM_FORM_KEY),
    [],
  );

  const findCustomStatus = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return null;
      return customStatusList.find((s) => String(s.id) === String(id)) || null;
    },
    [customStatusList],
  );

  const findCustomForm = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return null;
      return customFormList.find((f) => String(f.id) === String(id)) || null;
    },
    [customFormList],
  );

  // ─── Stable map options object. This must NOT be recreated on every
  //     render — the marching-ants effect ticks `antOffset` every 60ms,
  //     which re-renders this component constantly. If `options` were an
  //     inline object literal, react-google-maps/api would call
  //     map.setOptions(...) on every one of those re-renders, which was
  //     fighting the native Map/Satellite control's own internal click
  //     handling and made it look like satellite toggle didn't apply
  //     immediately. Memoizing keeps the object referentially stable so
  //     setOptions is only called when something here actually changes. ──
  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: true,
      rotateControl: true,
    }),
    [],
  );

  // ─── Stable signature for the employees list. `employees` is a prop and
  //     may arrive as a brand-new array reference on every parent re-render
  //     even when its contents are identical (e.g. parent state unrelated
  //     to this component changed). Keying the reset effect below directly
  //     on `employees` meant ANY such re-render wiped dateFilter back to ""
  //     — which is why a manually-picked date would silently revert. Keying
  //     on this id-based signature instead means the reset only fires when
  //     the actual set of employees changes (i.e. a genuine "modal
  //     reopened with a different roster" case). ─────────────────────────
  const employeesSignature = useMemo(
    () => employees.map((e) => e.employee_id).join(","),
    [employees],
  );

  // ─── Reset filters whenever the employee roster actually changes (modal
  //     reopened). dateFilter is also reset to "" here so the default-date
  //     effect below picks a fresh starting date for the new session —
  //     this is the ONLY place dateFilter gets force-reset. ──────────────
  useEffect(() => {
    setDeptFilter("All");
    setSelectedEmpId(initialEmpId ?? null);
    setLocationCache({});
    setActivityCache({});
    setMobileCache({});
    setDateFilter("");
    setActiveTab(TIMELINE_TABS.LOCATION);
  }, [employeesSignature, initialEmpId]);

  // ─── Department options ────────────────────────────────────────
  const departmentOptions = useMemo(() => {
    if (departments && departments.length) {
      return [...new Set(departments)].filter(Boolean);
    }
    return [...new Set(employees.map((e) => e.department).filter(Boolean))];
  }, [departments, employees]);

  // ─── Employees filtered by department ──────────────────────────
  const filteredEmployees = useMemo(() => {
    if (deptFilter === "All") return employees;
    return employees.filter((e) => e.department === deptFilter);
  }, [employees, deptFilter]);

  // ─── react-select options for the employee dropdown ───────────
  const employeeSelectOptions = useMemo(
    () =>
      filteredEmployees.map((emp) => ({
        value: emp.employee_id,
        label: emp.first_name,
        department: emp.department,
        profile_url: emp.profile_url,
      })),
    [filteredEmployees],
  );

  const selectedEmployeeOption = useMemo(
    () => employeeSelectOptions.find((o) => o.value === selectedEmpId) || null,
    [employeeSelectOptions, selectedEmpId],
  );

  // ─── Keep selectedEmpId valid whenever the department filter narrows the list ──
  useEffect(() => {
    if (
      filteredEmployees.length &&
      !filteredEmployees.some((e) => e.employee_id === selectedEmpId)
    ) {
      setSelectedEmpId(filteredEmployees[0].employee_id);
    }
    if (filteredEmployees.length === 0) {
      setSelectedEmpId(null);
    }
  }, [deptFilter, filteredEmployees]);

  const activeEmployee = useMemo(
    () =>
      filteredEmployees.find((e) => e.employee_id === selectedEmpId) || null,
    [filteredEmployees, selectedEmpId],
  );

  useEffect(() => {
    if (onSelectEmployee) onSelectEmployee(activeEmployee);
  }, [activeEmployee]);

  // ─── Default the date filter ONLY when nothing is picked yet.
  //     Previously this ran `setDateFilter(initialDate || todayIsoIN())`
  //     unconditionally on every selectedEmpId change, which stomped over
  //     whatever date the user had manually selected the instant they
  //     switched employees. Using a functional update that keeps `prev`
  //     when it's already set fixes that — the user's chosen date now
  //     survives an employee switch. It still defaults to `initialDate`
  //     (or today) the first time an employee is selected after a reset. ──
  useEffect(() => {
    if (!selectedEmpId) {
      setDateFilter("");
      return;
    }
    setDateFilter((prev) => prev || initialDate || todayIsoIN());
  }, [selectedEmpId, initialDate]);

  // ─── Fetch the selected employee + date's location history on demand ──
  useEffect(() => {
    if (!selectedEmpId || !dateFilter) return;

    const key = `${selectedEmpId}::${dateFilter}`;
    if (locationCache[key]) return; // already fetched (even if empty)

    let cancelled = false;

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await Api.get(
          `/attendance/get-location-tracking-data/${selectedEmpId}?date=${dateFilter}`,
        );
        const data = response?.data?.data;
        if (!cancelled) {
          const base = Array.isArray(data) ? data : [];
          const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
          const pending =
            key === todayKey ? pendingLiveRef.current.splice(0) : [];
          setLocationCache((prev) => ({
            ...prev,
            [key]: pending.length ? [...base, ...pending] : base,
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching location history for employee ${selectedEmpId} on ${dateFilter}:`,
          error,
        );
        if (!cancelled) {
          const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
          const pending =
            key === todayKey ? pendingLiveRef.current.splice(0) : [];
          setLocationCache((prev) => ({
            ...prev,
            [key]: pending,
          }));
        }
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    };

    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [selectedEmpId, dateFilter, locationCache]);

  // ─── Fetch Activity Timeline whenever the Activity tab is active
  //     (including every time the user switches onto it) and whenever
  //     employee/date changes while that tab is open. ───────────────────
  useEffect(() => {
    if (activeTab !== TIMELINE_TABS.ACTIVITY) return;
    if (!selectedEmpId || !dateFilter) return;

    const key = `${selectedEmpId}::${dateFilter}`;
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        setLoadingActivity(true);
        const response = await Api.get(
          `/attendance/get-attendance-activity-timeline/${selectedEmpId}?date=${dateFilter}`,
        );
        const data = response?.data?.data;
        if (!cancelled) {
          setActivityCache((prev) => ({
            ...prev,
            [key]: Array.isArray(data) ? data : [],
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching activity timeline for employee ${selectedEmpId} on ${dateFilter}:`,
          error,
        );
        if (!cancelled) {
          setActivityCache((prev) => ({ ...prev, [key]: [] }));
        }
      } finally {
        if (!cancelled) setLoadingActivity(false);
      }
    };

    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedEmpId, dateFilter]);

  // ─── Fetch Mobile (device toggle) Timeline whenever the Mobile tab
  //     is active — same “fetch on tab switch” pattern as Activity. ─────
  useEffect(() => {
    if (activeTab !== TIMELINE_TABS.MOBILE) return;
    if (!selectedEmpId || !dateFilter) return;

    const key = `${selectedEmpId}::${dateFilter}`;
    let cancelled = false;

    const fetchMobile = async () => {
      try {
        setLoadingMobile(true);
        const response = await Api.get(
          `/attendance/get-device-toggle-data/${selectedEmpId}?date=${dateFilter}`,
        );
        const data = response?.data?.data;
        if (!cancelled) {
          setMobileCache((prev) => ({
            ...prev,
            [key]: Array.isArray(data) ? data : [],
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching mobile timeline for employee ${selectedEmpId} on ${dateFilter}:`,
          error,
        );
        if (!cancelled) {
          setMobileCache((prev) => ({ ...prev, [key]: [] }));
        }
      } finally {
        if (!cancelled) setLoadingMobile(false);
      }
    };

    fetchMobile();
    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedEmpId, dateFilter]);

  // ─── Location history for the active employee + selected date ─────
  const activeLocations = useMemo(() => {
    if (!selectedEmpId || !dateFilter) return [];
    const key = `${selectedEmpId}::${dateFilter}`;
    return locationCache[key] || [];
  }, [selectedEmpId, dateFilter, locationCache]);

  // ─── Activity Timeline rows for the active employee + selected date ──
  const activeActivity = useMemo(() => {
    if (!selectedEmpId || !dateFilter) return [];
    const key = `${selectedEmpId}::${dateFilter}`;
    return activityCache[key] || [];
  }, [selectedEmpId, dateFilter, activityCache]);

  // ─── Mobile (device toggle) pings for the active employee + selected date ──
  const activeMobilePings = useMemo(() => {
    if (!selectedEmpId || !dateFilter) return [];
    const key = `${selectedEmpId}::${dateFilter}`;
    return mobileCache[key] || [];
  }, [selectedEmpId, dateFilter, mobileCache]);

  // ─── Processed Activity Timeline rows — expand legacy intervals into
  //     start/end pings, sort chronologically, pair shared ids for
  //     duration / "ongoing", and annotate display fields. ─────────────
  const activityRows = useMemo(() => {
    if (!Array.isArray(activeActivity)) return [];
    const expanded = expandActivityItems(activeActivity);
    const sorted = [...expanded].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    const startById = new Map();
    const endIds = new Set();
    sorted.forEach((item) => {
      if (item?.type === "custom_status_start" && item.id != null) {
        startById.set(item.id, item);
      }
      if (item?.type === "custom_status_end" && item.id != null) {
        endIds.add(item.id);
      }
    });

    return sorted.map((item, idx) => {
      const { time, date } = splitIndianTime(item.timestamp);
      const cfg = getActivityConfig(item.type);
      let durationSecs = null;
      let isOngoing = false;

      if (item.type === "custom_status_end" && item.id != null) {
        const start = startById.get(item.id);
        if (start?.timestamp && item.timestamp) {
          const ms =
            new Date(item.timestamp).getTime() -
            new Date(start.timestamp).getTime();
          if (Number.isFinite(ms) && ms >= 0) {
            durationSecs = Math.round(ms / 1000);
          }
        }
      } else if (item.type === "custom_status_start" && item.id != null) {
        isOngoing = !endIds.has(item.id);
      } else if (
        item.type === "custom_status" &&
        item.duration_in_seconds != null
      ) {
        durationSecs = item.duration_in_seconds;
        isOngoing = item.is_active === true;
      }

      return {
        ...item,
        _index: idx,
        _time: time,
        _date: date,
        _config: cfg,
        _hasCoords: activityHasCoords(item),
        _chipLabel: getActivityChipLabel(item, cfg),
        _subtitle:
          getActivityAddressLabel(item) || (isOngoing ? "Ongoing" : ""),
        _durationSecs: durationSecs,
        _isOngoing: isOngoing,
        _statusIcon: item.status?.icon || null,
      };
    });
  }, [activeActivity]);

  // ─── Processed Mobile Timeline — raw pings (chronological) plus the
  //     derived on/off segments for both location and internet state. ──
  const mobileRows = useMemo(() => {
    if (!Array.isArray(activeMobilePings)) return [];
    return [...activeMobilePings]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((p, idx) => {
        const { time, date } = splitIndianTime(p.timestamp);
        return { ...p, _index: idx, _time: time, _date: date };
      });
  }, [activeMobilePings]);

  const locationToggleSegments = useMemo(
    () => buildToggleSegments(mobileRows, "location_toggle"),
    [mobileRows],
  );
  const internetToggleSegments = useMemo(
    () => buildToggleSegments(mobileRows, "internet_toggle"),
    [mobileRows],
  );

  // Websocket payloads aren't guaranteed to use the same field name as the
  // REST API for the time — try the common variants, and fall back to the
  // moment it was received client-side so the point is never time-less.
  const normalizeLiveLocation = (raw) => {
    if (!raw) return raw;
    const timestamp =
      raw.timestamp ||
      raw.time ||
      raw.created_at ||
      raw.updated_at ||
      raw.ts ||
      new Date().toISOString();
    return { ...raw, timestamp };
  };

  // ─── Live tracking: connect to the watch socket for whichever employee
  //     is currently selected (follows dropdown changes, not just the
  //     employee the modal was opened for). On a successful connection we
  //     also drop today's cached API data so the fetch effect above pulls
  //     a fresh copy — the socket alone isn't treated as the source of
  //     truth for the initial state. Every subsequent message is folded
  //     into today's cache so the map + timeline update live, the same
  //     way a fresh API fetch would render them. ─────────────────────────
  useEffect(() => {
    if (!selectedEmpId) {
      disconnectWebSocket();
      setIsLive(false);
      setLiveLocation(null);
      pendingLiveRef.current = [];
      return;
    }

    setLiveLocation(null);
    setIsLive(false);
    pendingLiveRef.current = [];

    connectWebSocket(selectedEmpId, {
      onOpen: () => {
        setIsLive(true);
        pendingLiveRef.current = [];
        const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
        setLocationCache((prev) => {
          if (!(todayKey in prev)) return prev;
          const next = { ...prev };
          delete next[todayKey];
          return next;
        });
      },
      onMessage: (data) => {
        // Ignore watch acks / non-tracking frames. Accept null lat/lng when
        // the payload is still a real location event (e.g. location off).
        if (!isLocationTrackingPayload(data)) return;

        const normalized = normalizeLiveLocation(data);
        if (
          hasValidCoords({
            lat: getLat(normalized),
            lng: getLng(normalized),
          })
        ) {
          setLiveLocation(normalized);
        }

        // Only fold live points into TODAY's history — a different date
        // being viewed shouldn't get contaminated with live data.
        const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
        setLocationCache((prev) => {
          // Don't create today's key from WS alone — that skips REST fetch.
          if (!(todayKey in prev)) {
            pendingLiveRef.current = [...pendingLiveRef.current, normalized];
            return prev;
          }
          return { ...prev, [todayKey]: [...prev[todayKey], normalized] };
        });
      },
      onClose: () => setIsLive(false),
      onError: () => setIsLive(false),
    });

    return () => {
      disconnectWebSocket();
      setIsLive(false);
      pendingLiveRef.current = [];
    };
  }, [selectedEmpId]);

  // Live marker only makes sense while looking at today's route.
  // ROAD mode snaps the live pin to OSRM coords; GPS / Both stay on raw GPS.
  const isViewingToday = dateFilter === todayIsoIN();
  const resolveLiveLat = dataMode === DATA_MODES.ROAD ? getRoadLat : getLat;
  const resolveLiveLng = dataMode === DATA_MODES.ROAD ? getRoadLng : getLng;
  const liveMarkerPos =
    isViewingToday &&
    liveLocation &&
    hasValidCoords({
      lat: resolveLiveLat(liveLocation),
      lng: resolveLiveLng(liveLocation),
    })
      ? {
          lat: resolveLiveLat(liveLocation),
          lng: resolveLiveLng(liveLocation),
        }
      : null;

  // ─── Build path + timeline data (from the active employee's route).
  //     Re-runs on `dataMode` too, so flipping the GPS/Road/Both tab
  //     re-derives the same cached `activeLocations` through the other
  //     coordinate getter instead of re-fetching. "Both" keeps `path` on
  //     normal GPS coordinates (same getters as "gps") — the OSRM overlay
  //     for "both" is built separately below (secondaryRoadLinePath) so
  //     every marker / timeline card / playback value stays anchored to
  //     one consistent set of points. ─────────────────────────────────
  useEffect(() => {
    if (Array.isArray(activeLocations) && activeLocations.length > 0) {
      const resolveLat = dataMode === DATA_MODES.ROAD ? getRoadLat : getLat;
      const resolveLng = dataMode === DATA_MODES.ROAD ? getRoadLng : getLng;

      const processed = activeLocations.map((loc, index) => {
        let indianTime = "";
        let indianDate = "";
        if (loc?.timestamp) {
          const date = new Date(loc.timestamp);
          indianTime = date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
          });
          indianDate = date.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }

        const addressSource = extractFormattedAddress(loc);
        let cleanedAddress = "";
        if (addressSource) {
          const parts = addressSource.split(",");
          if (parts.length > 1 && parts[0].trim().match(/^[A-Z0-9+]+$/)) {
            cleanedAddress = parts.slice(1).join(",").trim();
          } else {
            cleanedAddress = addressSource.trim();
          }
        }

        // form_submission carries { id, form_version, submitted_data: [...],
        // timestamp, status, created_on, employee, custom_status, custom_form }.
        // Not every point has one — only stops where the employee filled a
        // custom form (e.g. checkout/early-leave reason) will.
        const formSubmission =
          loc?.form_submission &&
          Array.isArray(loc.form_submission.submitted_data)
            ? loc.form_submission
            : null;

        // Custom-status / custom-form IDs can live either directly on the
        // location record or inside its form_submission — check both,
        // preferring the form_submission's copy since that's the one tied
        // to the actual reason/status the employee picked at that stop.
        const rawCustomStatusId =
          formSubmission?.custom_status ?? loc?.custom_status ?? null;
        const rawCustomFormId =
          formSubmission?.custom_form ?? loc?.custom_form ?? null;

        const customStatusInfo = findCustomStatus(rawCustomStatusId);
        const customFormInfo = findCustomForm(rawCustomFormId);

        return {
          index: index + 1,
          name: activeEmployee?.first_name || "",
          lat: resolveLat(loc),
          lng: resolveLng(loc),
          address: cleanedAddress,
          timestamp: indianTime,
          date: indianDate,
          battery: loc?.battery_percentage,
          outside: loc?.is_outside_range,
          locationOn: loc?.is_location_on,
          internetOn: loc?.is_internet_on,
          profile_url: activeEmployee?.profile_url,
          formSubmission,
          customStatusInfo, // resolved { id, name, icon, is_break, ... } or null
          customFormInfo, // resolved { id, name, schema, ... } or null
        };
      });
      setPath(processed);
    } else {
      setPath([]);
    }
    setActiveIndex(null);
    setExpandedIndex(null);
    setSelectedMarker(null);
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
  }, [
    activeLocations,
    activeEmployee,
    findCustomStatus,
    findCustomForm,
    dataMode,
  ]);

  // Map/route only — timeline keeps the full `path` (including null lat/lng).
  const mapPath = useMemo(
    () =>
      path.map((p, pathIndex) => ({ ...p, pathIndex })).filter(hasValidCoords),
    [path],
  );

  // ─── Secondary OSRM road-snapped line, shown ONLY in "Both" mode
  //     alongside the primary (normal) path/markers/playback. Built
  //     directly from activeLocations rather than from `path`, since
  //     `path` itself stays on normal-GPS coordinates even while dataMode
  //     is BOTH — this is purely a visual overlay drawn on top.
  //     Null/invalid road coords are filtered out (same as mapPath). ────
  const secondaryRoadLinePath = useMemo(() => {
    if (dataMode !== DATA_MODES.BOTH) return [];
    if (!Array.isArray(activeLocations) || activeLocations.length === 0)
      return [];
    return activeLocations
      .map((loc) => ({
        lat: getRoadLat(loc),
        lng: getRoadLng(loc),
      }))
      .filter(hasValidCoords);
  }, [activeLocations, dataMode]);

  // ─── Trip summary: duration + total distance ──────────────────
  const summary = useMemo(() => {
    if (path.length === 0) return { duration: "-", distance: "0 Km", km: 0 };

    let km = 0;
    for (let i = 1; i < mapPath.length; i++)
      km += haversine(mapPath[i - 1], mapPath[i]);

    let duration = "-";
    const firstTs = activeLocations[0]?.timestamp;
    const lastTs = activeLocations[activeLocations.length - 1]?.timestamp;
    if (firstTs && lastTs) {
      const diffMs = new Date(lastTs) - new Date(firstTs);
      if (diffMs > 0) {
        const mins = Math.floor(diffMs / 60000);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        duration = `${h}h ${m}m`;
      }
    }

    return { duration, distance: `${km.toFixed(1)} Km`, km };
  }, [path, mapPath, activeLocations]);

  // ─── Classify each timeline point ─────────────────────────────
  const pointType = useCallback(
    (i) => {
      if (i === 0) return "start";
      if (i === path.length - 1) return "end";
      const prev = path[i - 1];
      const cur = path[i];
      // No coords → still show in timeline, but don't invent a travel/wait
      // classification from (0,0) or NaN distance.
      if (!hasValidCoords(prev) || !hasValidCoords(cur)) return "travel";
      const moved = haversine(prev, cur); // km
      return moved < WAIT_THRESHOLD_KM ? "waiting" : "travel";
    },
    [path],
  );

  // ─── Fit map to all points (full view) ────────────────────────
  const fitToPath = useCallback((map, pts) => {
    if (!map || !pts.length || !window.google) return;
    if (pts.length === 1) {
      map.setCenter({ lat: pts[0].lat, lng: pts[0].lng });
      map.setZoom(15);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    pts.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 90, left: 60 });
  }, []);

  useEffect(() => {
    if (mapRef.current && mapPath.length > 0)
      fitToPath(mapRef.current, mapPath);
  }, [mapPath, fitToPath]);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (mapPath.length > 0) fitToPath(map, mapPath);
    },
    [mapPath, fitToPath],
  );

  // ─── Re-fit / re-trigger the map whenever the browser (or the modal
  //     wrapping this component) dispatches a "resize" event. Google Maps
  //     only measures its container size at creation time — if that
  //     container was still 0×0 or mid-animation (e.g. a reactstrap Modal
  //     still fading in) when the map first mounted, the tiles never
  //     recover on their own. `google.maps.event.trigger(map, "resize")`
  //     forces Google to re-measure, and re-running fitToPath keeps the
  //     route centered afterwards — same effect as clicking "Full view". ──
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && window.google) {
        window.google.maps.event.trigger(mapRef.current, "resize");
        if (mapPath.length > 0) fitToPath(mapRef.current, mapPath);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mapPath, fitToPath]);

  // ─── Interpolate position + label from a 0..1 progress value ──
  // Uses mapPath (valid coords only) so playback never jumps to (0,0).
  // nearIndex is the original timeline index (`pathIndex`).
  const computeFromProgress = useCallback(
    (t) => {
      if (mapPath.length === 0) return null;
      if (mapPath.length === 1) {
        return {
          pos: { lat: mapPath[0].lat, lng: mapPath[0].lng },
          label: mapPath[0].timestamp,
          nearIndex: mapPath[0].pathIndex,
        };
      }

      const segCount = mapPath.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const a = mapPath[segIndex];
      const b = mapPath[segIndex + 1];

      const lat = a.lat + (b.lat - a.lat) * segT;
      const lng = a.lng + (b.lng - a.lng) * segT;
      const near = segT < 0.5 ? a : b;

      return {
        pos: { lat, lng },
        label: near.timestamp,
        nearIndex: near.pathIndex,
      };
    },
    [mapPath],
  );

  // ─── Build the polyline coords drawn so far (start → current) ─
  const getDrawnPath = useCallback(
    (t) => {
      if (mapPath.length < 2) return [];
      const segCount = mapPath.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const drawn = mapPath.slice(0, segIndex + 1).map((p) => ({
        lat: p.lat,
        lng: p.lng,
      }));

      const a = mapPath[segIndex];
      const b = mapPath[segIndex + 1];
      drawn.push({
        lat: a.lat + (b.lat - a.lat) * segT,
        lng: a.lng + (b.lng - a.lng) * segT,
      });
      return drawn;
    },
    [mapPath],
  );

  // ─── Animation loop (playback) ─────────────────────────────────
  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const applyProgress = useCallback(
    (t) => {
      const r = computeFromProgress(t);
      if (r) {
        setMovingPos(r.pos);
        setCurrentLabel(r.label);
        setActiveIndex(r.nearIndex);
      }
    },
    [computeFromProgress],
  );

  useEffect(() => {
    if (!isPlaying) {
      stopRaf();
      return;
    }

    startTimeRef.current = null;
    startProgressRef.current = progress >= 1 ? 0 : progress;

    // Higher playbackSpeed = faster animation = shorter effective duration
    const effectiveDurationSec = PLAYBACK_DURATION_SEC / playbackSpeed;

    const tick = (now) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000;
      const delta = elapsed / effectiveDurationSec;
      let next = startProgressRef.current + delta;

      if (next >= 1) {
        next = 1;
        setProgress(1);
        applyProgress(1);
        setIsPlaying(false);
        stopRaf();
        return;
      }

      setProgress(next);
      applyProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return stopRaf;
  }, [isPlaying, playbackSpeed]);

  // ─── Always-on marching-ants flow along the route line ─────────
  useEffect(() => {
    if (mapPath.length < 2) return;
    const id = setInterval(() => {
      setAntOffset((o) => (o + 4) % 140);
    }, 60);
    return () => clearInterval(id);
  }, [mapPath.length]);

  // ─── Zoom in once, right when playback starts (not on every frame —
  //     calling setZoom repeatedly mid-pan is what caused the "stuck"
  //     stutter). Playback stopping/finishing doesn't zoom back out on
  //     its own; "Full view" / reset handle that. ────────────────────
  useEffect(() => {
    if (isPlaying && mapRef.current) {
      mapRef.current.setZoom(PLAYBACK_FOLLOW_ZOOM);
    }
  }, [isPlaying]);

  // ─── While playing, keep the map centered on the moving marker for a
  //     "close-up, following" travel view. Uses setCenter (immediate,
  //     no built-in animation) instead of panTo — panTo starts its own
  //     ~500ms animated pan on every call, and since movingPos updates
  //     every animation frame (~60/sec) those pans stacked up and fought
  //     each other, which is what made the view look stuck/jerky. ────
  useEffect(() => {
    if (isPlaying && movingPos && mapRef.current) {
      mapRef.current.setCenter(movingPos);
    }
  }, [movingPos, isPlaying]);

  const handleScrub = (e) => {
    const t = parseFloat(e.target.value);
    setProgress(t);
    applyProgress(t);
  };

  // ─── Pause playback the instant the user grabs the duration rail,
  //     whether via mouse or touch, so scrubbing never fights the
  //     animation loop for control of `progress`. ─────────────────
  const pauseForScrub = () => {
    if (isPlaying) setIsPlaying(false);
  };

  const togglePlay = () => {
    if (mapPath.length < 2) return;
    setSelectedMarker(null);
    if (progress >= 1) {
      setProgress(0);
      applyProgress(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    applyProgress(0);
    if (mapRef.current && mapPath.length) fitToPath(mapRef.current, mapPath);
  };

  // ─── Refresh → reset everything to initial full view ──────────
  const handleRefresh = () => {
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
    setCurrentLabel("");
    setActiveIndex(null);
    setExpandedIndex(null);
    setSelectedMarker(null);
    if (mapRef.current) fitToPath(mapRef.current, mapPath);
  };

  // ─── Close the InfoWindow (default 'x' + our own custom close icon) ──
  const handleCloseClick = () => {
    setSelectedMarker(null);
  };

  // ─── Form submission modal open/close ──────────────────────────
  const openFormModal = (point, e) => {
    if (e) e.stopPropagation();
    if (!point?.formSubmission) return;
    setFormModalData(point.formSubmission);
    setFormModalMeta({
      timestamp: point.timestamp,
      date: point.date,
      address: point.address,
      customStatusInfo: point.customStatusInfo,
      customFormInfo: point.customFormInfo,
    });
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setFormModalData(null);
    setFormModalMeta(null);
  };

  // ─── Timeline / marker click → pan + zoom in on that point's location,
  //     open its info window, and expand its card. Also stops any running
  //     playback and clears scrub progress so the zoomed-in view isn't
  //     immediately overridden by the playback effects. Map type (road /
  //     satellite) is left untouched here — that's controlled solely by
  //     the native Map/Satellite control now, independent of timeline
  //     clicks. ─────────────────────────────────────────────────────────
  const handleTimelineClick = (p, i) => {
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
    setActiveIndex(i);
    setExpandedIndex((cur) => (cur === i ? null : i));
    // Null lat/lng stay in the timeline but have nothing to focus on the map.
    if (!hasValidCoords(p)) {
      setSelectedMarker(null);
      return;
    }
    setSelectedMarker({ lat: p.lat, lng: p.lng, count: 1, users: [p] });
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 0;
      mapRef.current.panTo({ lat: p.lat, lng: p.lng });
      mapRef.current.setZoom(Math.max(currentZoom, TIMELINE_FOCUS_ZOOM));
    }
  };

  // ─── Marker click on the map (start / end dots). Does everything
  //     handleTimelineClick does (pan/zoom/select), AND — per request —
  //     opens the form-submission modal directly if that point has one,
  //     instead of requiring a separate "Form details" click inside the
  //     InfoWindow. ─────────────────────────────────────────────────────
  const handleMarkerClick = (p, i) => {
    handleTimelineClick(p, i);
    if (p?.formSubmission) {
      openFormModal(p);
    }
  };

  // "Full view" — fits the whole route back in frame. Lives as a map
  // overlay control now (moved out of the timeline panel header).
  const resetView = () => {
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
    setActiveIndex(null);
    setExpandedIndex(null);
    setSelectedMarker(null);
    if (mapRef.current) fitToPath(mapRef.current, mapPath);
  };

  // ─── Activity / Mobile row click → same "pan + zoom on the map" idea as
  //     handleTimelineClick, but these rows aren't part of `path`, so
  //     there's no timeline index to set — just focus the map on that
  //     ping's coordinates (when it has any) and select it for the
  //     InfoWindow. ─────────────────────────────────────────────────────
  const handleSideRowClick = (row, key) => {
    setExpandedIndex((cur) => (cur === key ? null : key));
    const lat = getActivityLat(row) ?? getLat(row);
    const lng = getActivityLng(row) ?? getLng(row);
    if (!hasValidCoords({ lat, lng })) return;
    const address =
      (typeof row.accurate_address === "string" && row.accurate_address) ||
      getActivityAddressLabel(row) ||
      "";
    setSelectedMarker({
      lat,
      lng,
      count: 1,
      users: [
        {
          name: activeEmployee?.first_name || "",
          profile_url: activeEmployee?.profile_url,
          timestamp: row._time || "",
          address,
        },
      ],
    });
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 0;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(Math.max(currentZoom, TIMELINE_FOCUS_ZOOM));
    }
  };

  // Clear selection/highlight state when flipping Location / Activity / Mobile
  // so the previous tab's active card doesn't bleed into the next view.
  const handleTimelineTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);
    setExpandedIndex(null);
    setActiveIndex(null);
    setSelectedMarker(null);
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
  };

  // ─── Date picker helpers (must stay above the `!isLoaded` early return —
  //     hooks can't be conditionally skipped) ──────────────────────────
  const todayDayjs = useMemo(() => dayjs(todayIsoIN(), ISO_DATE_FORMAT), []);
  const minYear = todayDayjs.year() - DATE_RANGE_YEARS_BACK;

  const disabledDate = useCallback(
    (current) => {
      if (!current) return false;
      if (current.year() < minYear) return true;
      return current.isAfter(todayDayjs, "day");
    },
    [minYear, todayDayjs],
  );

  const datePickerValue = useMemo(
    () => (dateFilter ? dayjs(dateFilter, ISO_DATE_FORMAT) : null),
    [dateFilter],
  );

  const handleDatePickerChange = (date) => {
    // Use the dayjs object and re-format to ISO ourselves — the second
    // arg antd gives us is formatted per the display `format` prop
    // ("DD MMM YYYY"), which is NOT what dateFilter uses internally
    // (ISO "YYYY-MM-DD").
    setDateFilter(date ? date.format(ISO_DATE_FORMAT) : "");
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  const isEndpoint = (i) => i === 0 || i === path.length - 1;

  const drawnLinePath =
    isPlaying || progress > 0 ? getDrawnPath(progress) : mapPath;

  const typeConfig = {
    start: { color: COLORS.start, icon: "ri-flag-fill", letter: null },
    end: { color: COLORS.end, icon: "ri-flag-2-fill", letter: null },
    waiting: { color: COLORS.waiting, icon: null, letter: "W" },
    travel: { color: COLORS.travel, icon: "ri-car-fill", letter: null },
  };

  // How far along the vertical spine the progress fill should reach.
  const spineProgressPct =
    activeIndex != null && path.length > 1
      ? (activeIndex / (path.length - 1)) * 100
      : 0;

  const distanceCovered = (summary.km * progress).toFixed(1);

  // ── Right-panel header count + loading flag, per active tab ──
  const panelCount =
    activeTab === TIMELINE_TABS.LOCATION
      ? path.length
      : activeTab === TIMELINE_TABS.ACTIVITY
        ? activityRows.length
        : mobileRows.length;

  const panelLoading =
    activeTab === TIMELINE_TABS.LOCATION
      ? loadingLocations
      : activeTab === TIMELINE_TABS.ACTIVITY
        ? loadingActivity
        : loadingMobile;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          width: "100%",
          flexWrap: "nowrap",
        }}
      >
        {/* ── MAP (left, full height, grows/shrinks with the window) ── */}
        <div style={{ flex: "1 1 0%", minWidth: 0, position: "relative" }}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapPath.length ? mapPath[0] : indiaCenter}
            onLoad={onMapLoad}
            options={mapOptions}
          >
            {/* Faint full-route track, always visible underneath
                (Normal / Both — the Road-only dotted line below replaces
                this entirely rather than layering under it) */}
            {mapPath.length > 1 && dataMode !== DATA_MODES.ROAD && (
              <Polyline
                path={mapPath}
                options={{
                  strokeColor: COLORS.route,
                  strokeOpacity: 0.22,
                  strokeWeight: 4,
                }}
              />
            )}

            {/* Travelled / full route line with continuous marching-ant
                arrows (Normal / Both) */}
            {mapPath.length > 1 && dataMode !== DATA_MODES.ROAD && (
              <Polyline
                path={drawnLinePath}
                options={{
                  strokeColor: COLORS.route,
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                  icons: [
                    {
                      icon: {
                        path: window.google.maps.SymbolPath
                          .FORWARD_CLOSED_ARROW,
                        scale: 4,
                        strokeColor: "#ffffff",
                        strokeWeight: 1,
                        fillColor: COLORS.route,
                        fillOpacity: 1,
                      },
                      offset: `${antOffset}px`,
                      repeat: "140px",
                    },
                  ],
                }}
              />
            )}

            {/* OSRM road-snapped route as a dotted red line (Road-only
                mode — `mapPath` itself is already on road coordinates here) */}
            {mapPath.length > 1 && dataMode === DATA_MODES.ROAD && (
              <Polyline
                path={mapPath}
                options={{
                  strokeOpacity: 0,
                  icons: [
                    {
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 2.5,
                        fillColor: COLORS.roadLine,
                        fillOpacity: 1,
                        strokeWeight: 0,
                      },
                      offset: "0",
                      repeat: "10px",
                    },
                  ],
                }}
              />
            )}

            {/* OSRM road-snapped overlay, dotted red (Both mode — drawn
                on top of the normal blue line above, using the raw
                activeLocations-derived secondaryRoadLinePath since `path`
                stays on normal GPS coordinates while dataMode is BOTH) */}
            {secondaryRoadLinePath.length > 1 &&
              dataMode === DATA_MODES.BOTH && (
                <Polyline
                  path={secondaryRoadLinePath}
                  options={{
                    strokeOpacity: 0,
                    icons: [
                      {
                        icon: {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 2.5,
                          fillColor: COLORS.roadLine,
                          fillOpacity: 1,
                          strokeWeight: 0,
                        },
                        offset: "0",
                        repeat: "10px",
                      },
                    ],
                  }}
                />
              )}

            {/* Start marker (green) with radar ping ring — first valid coords */}
            {mapPath.length > 0 && (
              <>
                <OverlayView
                  position={mapPath[0]}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: COLORS.start,
                      opacity: 0.5,
                      transform: "translate(-50%, -50%)",
                      animation: "ucma-ring 1.8s ease-out infinite",
                    }}
                  />
                </OverlayView>
                <Marker
                  position={mapPath[0]}
                  zIndex={10}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: COLORS.start,
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: "#ffffff",
                  }}
                  onClick={() =>
                    handleMarkerClick(mapPath[0], mapPath[0].pathIndex)
                  }
                />
              </>
            )}

            {/* End marker (red) — last valid coords */}
            {mapPath.length > 1 && (
              <Marker
                position={mapPath[mapPath.length - 1]}
                zIndex={10}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 9,
                  fillColor: COLORS.end,
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: "#ffffff",
                }}
                onClick={() =>
                  handleMarkerClick(
                    mapPath[mapPath.length - 1],
                    mapPath[mapPath.length - 1].pathIndex,
                  )
                }
              />
            )}

            {/* Form-submission markers — every point (except start/end, which
                already carry their own marker above) that has a filled form
                gets its own document-pin marker. Clicking it pans/zooms in
                AND opens the form details modal (handleMarkerClick does both).
                Points with null lat/lng are timeline-only and skipped here. */}
            {mapPath.map(
              (p) =>
                p.formSubmission &&
                p.pathIndex !== mapPath[0].pathIndex &&
                p.pathIndex !== mapPath[mapPath.length - 1].pathIndex && (
                  <Marker
                    key={`form-marker-${p.pathIndex}`}
                    position={{ lat: p.lat, lng: p.lng }}
                    zIndex={11}
                    icon={buildFormMarkerIcon()}
                    onClick={() => handleMarkerClick(p, p.pathIndex)}
                  />
                ),
            )}

            {/* Animated moving marker */}
            {movingPos && (
              <Marker
                position={movingPos}
                zIndex={9999}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: COLORS.moving,
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: "#ffffff",
                }}
              />
            )}

            {/* Live marker — driven by the websocket, independent of playback */}
            {liveMarkerPos && (
              <>
                <OverlayView
                  position={liveMarkerPos}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      opacity: 0.5,
                      transform: "translate(-50%, -50%)",
                      animation: "ucma-ring 1.6s ease-out infinite",
                    }}
                  />
                </OverlayView>
                <Marker
                  position={liveMarkerPos}
                  zIndex={10000}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#22c55e",
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: "#ffffff",
                  }}
                  onClick={() =>
                    setSelectedMarker({
                      lat: liveMarkerPos.lat,
                      lng: liveMarkerPos.lng,
                      count: 1,
                      users: [
                        {
                          name: activeEmployee?.first_name || "",
                          profile_url: activeEmployee?.profile_url,
                          timestamp: liveLocation?.timestamp
                            ? new Date(
                                liveLocation.timestamp,
                              ).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour12: true,
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "",
                          address: extractFormattedAddress(liveLocation),
                        },
                      ],
                    })
                  }
                />
              </>
            )}

            {/* Floating timestamp chip above moving marker */}
            {movingPos && currentLabel && (
              <OverlayView
                position={movingPos}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    transform: "translate(-50%, -170%)",
                    background: "#ffffff",
                    color: "#000000",
                    padding: "3px 10px",
                    borderRadius: "14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    border: `1px solid ${COLORS.travel}`,
                  }}
                >
                  {currentLabel}
                </motion.div>
              </OverlayView>
            )}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={handleCloseClick}
              >
                <div className="lc-infowindow-card lc-infowindow-compact">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <h6 className="lc-infowindow-title" style={{ margin: 0 }}>
                      📍 {selectedMarker.count} Record
                      {selectedMarker.count > 1 ? "s" : ""}
                    </h6>
                    <button
                      onClick={handleCloseClick}
                      title="Close"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "16px",
                        lineHeight: 1,
                        color: "#64748b",
                        padding: "2px",
                        flexShrink: 0,
                      }}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                  <ul className="lc-infowindow-list">
                    {selectedMarker.users.map((user, i) => (
                      <li key={i} className="lc-infowindow-item">
                        <div className="lc-infowindow-user">
                          {user.profile_url ? (
                            <img
                              src={user.profile_url}
                              alt={user.name}
                              className="lc-infowindow-avatar"
                            />
                          ) : (
                            <div className="lc-infowindow-avatar-placeholder">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="lc-infowindow-details">
                            <strong className="lc-infowindow-name">
                              {user.name}
                            </strong>
                            <div className="lc-infowindow-time">
                              <i className="ri-time-line"></i> {user.timestamp}
                            </div>
                            <div className="lc-infowindow-address">
                              <i className="ri-map-pin-2-fill"></i>{" "}
                              {user.address}
                            </div>
                            {user.customStatusInfo && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "11px",
                                  color: "#334155",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "#f1f5f9",
                                  borderRadius: "10px",
                                  padding: "2px 8px",
                                }}
                              >
                                <span>{user.customStatusInfo.icon}</span>
                                <span>{user.customStatusInfo.name}</span>
                              </div>
                            )}
                            {user.formSubmission && (
                              <button
                                type="button"
                                onClick={(e) => openFormModal(user, e)}
                                style={{
                                  width: "100%",
                                  minHeight: "36px",
                                  marginTop: "8px",
                                  padding: "5px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "7px",
                                  border: "1px solid #2563eb",
                                  borderRadius: "7px",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  textAlign: "left",
                                  boxSizing: "border-box",
                                }}
                              >
                                {/* Icon */}
                                <span
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    borderRadius: "5px",
                                    background: "#2563eb",
                                    color: "#fff",
                                    fontSize: "14px",
                                  }}
                                >
                                  <i className="ri-file-list-3-line"></i>
                                </span>

                                {/* Title */}
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#1d4ed8",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Form details
                                </span>

                                {/* Divider */}
                                {user.customFormInfo?.name && (
                                  <span
                                    style={{
                                      width: "1px",
                                      height: "16px",
                                      background: "#93c5fd",
                                      margin: "0 2px",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}

                                {/* Form name */}
                                {user.customFormInfo?.name && (
                                  <span
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontSize: "10px",
                                      fontWeight: 500,
                                      color: "#64748b",
                                    }}
                                  >
                                    {user.customFormInfo.name}
                                  </span>
                                )}

                                {/* Arrow */}
                                <i
                                  className="ri-arrow-right-s-line"
                                  style={{
                                    fontSize: "18px",
                                    color: "#2563eb",
                                    marginLeft: "auto",
                                    flexShrink: 0,
                                  }}
                                ></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* ── Loading state: employee/date selected, request in flight ── */}
          {activeEmployee && dateFilter && loadingLocations && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 4,
                background: "rgba(255,255,255,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  className="ucma-skeleton"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                  }}
                />
                <div
                  className="ucma-skeleton"
                  style={{ width: "140px", height: "14px" }}
                />
              </div>
            </div>
          )}

          {/* ── Empty state: employee selected, date picked, but no data for it ── */}
          {activeEmployee &&
            dateFilter &&
            path.length === 0 &&
            !loadingLocations && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 4,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    padding: "14px 20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    No location data for this date
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Try another date from the calendar
                  </div>
                </div>
              </div>
            )}

          {/* ── Map overlay controls, top-center: GPS / Road / Both tabs ──
              Switches which coordinate fields (`latitude`/`longitude` vs
              OSRM-snapped `formatted_latitude`/`formatted_longitude`, or
              both overlaid together) build the path shown below. Only
              meaningful for the Location Timeline tab. Centered
              horizontally so it doesn't collide with the Refresh/Full-view
              controls on the right. ────────────────────────────────────── */}
          {path.length > 0 && activeTab === TIMELINE_TABS.LOCATION && (
            <div
              className="ucma-mode-tabs"
              style={{
                position: "absolute",
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 5,
              }}
            >
              <button
                className={`ucma-mode-tab${dataMode === DATA_MODES.GPS ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.GPS)}
                title="Raw GPS coordinates"
              >
                Normal
              </button>
              <button
                className={`ucma-mode-tab${dataMode === DATA_MODES.ROAD ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.ROAD)}
                title="OSRM road-snapped coordinates"
              >
                Road
              </button>
              <button
                className={`ucma-mode-tab${dataMode === DATA_MODES.BOTH ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.BOTH)}
                title="Show both GPS and road-snapped routes"
              >
                Both
              </button>
            </div>
          )}

          {/* ── Map overlay controls, top-right: Refresh + Full view ──
              Moved out of the timeline panel so they sit on the map itself. ── */}
          {path.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                display: "flex",
                gap: "6px",
                zIndex: 5,
              }}
            >
              <button
                onClick={handleRefresh}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#334155",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Refresh"
              >
                <i className="ri-refresh-line"></i>
              </button>
              <button
                onClick={resetView}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#334155",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Full view"
              >
                <i className="ri-focus-3-line"></i>
              </button>
            </div>
          )}

          {/* ── Live distance-covered readout, top-right, while playing/scrubbed ── */}
          <AnimatePresence>
            {activeTab === TIMELINE_TABS.LOCATION &&
              mapPath.length > 1 &&
              (isPlaying || progress > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    position: "absolute",
                    top: "56px",
                    right: "12px",
                    background: "rgba(255,255,255,0.95)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 5,
                  }}
                >
                  {isPlaying && (
                    <span
                      className="ucma-liveblink"
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: COLORS.end,
                        display: "inline-block",
                      }}
                    />
                  )}
                  <span>
                    {distanceCovered} / {summary.distance}
                  </span>
                </motion.div>
              )}
          </AnimatePresence>

          {/* ── Playback controls — vertical panel, left side of the map.
              Only meaningful for the Location Timeline tab (playback
              animates the GPS/road route). ─────────────────────────── */}
          {activeTab === TIMELINE_TABS.LOCATION && mapPath.length > 1 && (
            <div
              className="ucma-playback-panel"
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                zIndex: 5,
              }}
            >
              <div
                className="ucma-playback-rail"
                style={{
                  position: "relative",
                  height: "150px",
                  width: "20px",
                  display: "flex",
                  justifyContent: "center",
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.85)",
                  }}
                />
                <motion.div
                  animate={{ height: `${progress * 100}%` }}
                  transition={{ duration: isPlaying ? 0 : 0.15 }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "4px",
                    borderRadius: "4px",
                    background: COLORS.travel,
                  }}
                />
                {mapPath.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      bottom: `${(i / (mapPath.length - 1)) * 100}%`,
                      width: "10px",
                      height: "2px",
                      background: "#ffffff",
                      transform: "translateY(1px)",
                      pointerEvents: "none",
                    }}
                  />
                ))}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={progress}
                  onChange={handleScrub}
                  onMouseDown={pauseForScrub}
                  onTouchStart={pauseForScrub}
                  className="ucma-vslider"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "150px",
                    height: "20px",
                    transform: "translate(-50%, -50%) rotate(-90deg)",
                    cursor: "pointer",
                  }}
                />
              </div>

              <motion.button
                onClick={togglePlay}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.06 }}
                className="ucma-playback-play"
                style={{
                  flexShrink: 0,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: COLORS.travel,
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(37,99,235,0.5)",
                }}
                title={isPlaying ? "Pause" : progress > 0 ? "Resume" : "Play"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </motion.button>

              <button
                onClick={handleReset}
                className="ucma-playback-reset"
                style={{
                  flexShrink: 0,
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#374151",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
                title="Reset"
              >
                ⟲
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className="ucma-playback-speedbtn"
                    style={{
                      border: "none",
                      borderRadius: "10px",
                      padding: "4px 0",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      width: "36px",
                      background:
                        playbackSpeed === s
                          ? COLORS.travel
                          : "rgba(255,255,255,0.95)",
                      color: playbackSpeed === s ? "#fff" : "#374151",
                      boxShadow:
                        playbackSpeed === s
                          ? "0 2px 8px rgba(37,99,235,0.5)"
                          : "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                    title={`${s}x speed`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── TIMELINE (right) ── */}
        <div
          style={{
            flex: `0 0 ${TIMELINE_WIDTH_CLAMP}`,
            width: TIMELINE_WIDTH_CLAMP,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {/* ── Filters (shared across all 3 tabs) ── */}
          <div
            className="ucma-tl-filterbar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "12px 14px",
              borderBottom: "1px solid #e5e7eb",
              background: "#fafbfc",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "flex-end",
              }}
            >
              <i
                className="ri-building-line"
                style={{ color: "#64748b", fontSize: "14px", flexShrink: 0 }}
              ></i>
              <Input
                type="select"
                bsSize="sm"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={compactSelectStyle}
              >
                <option value="All">All Departments</option>
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Input>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "flex-end",
              }}
            >
              <i
                className="ri-user-line"
                style={{ color: "#64748b", fontSize: "14px", flexShrink: 0 }}
              ></i>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Select
                  id="ucma_employee_select"
                  name="ucma_employee_select"
                  isMulti={false}
                  isClearable={false}
                  isDisabled={employeeSelectOptions.length === 0}
                  value={selectedEmployeeOption}
                  onChange={(opt) => setSelectedEmpId(opt ? opt.value : null)}
                  options={employeeSelectOptions}
                  components={{ Option: EmployeeDisplayInSelect }}
                  placeholder="No employees"
                  className="basic-single-select"
                  classNamePrefix="lc-select"
                  styles={rsSelectStyles}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "flex-end",
              }}
            >
              <i
                className="ri-calendar-line"
                style={{ color: "#64748b", fontSize: "14px", flexShrink: 0 }}
              ></i>
              <div style={{ flex: 1, minWidth: 0 }}>
                <DatePicker
                  value={datePickerValue}
                  format="DD MMM YYYY"
                  allowClear={false}
                  placeholder="Select date"
                  disabled={!activeEmployee}
                  disabledDate={disabledDate}
                  onChange={handleDatePickerChange}
                  style={compactDatePickerStyle}
                  popupClassName="ucma-date-popup"
                />
              </div>
            </div>
          </div>

          {/* ── View tabs: Location / Activity / Mobile Timeline — a single
              row, placed right under the filters. These control ONLY what
              the panel below renders — the employee/date filters and the
              map itself stay shared across all three. Location is the
              default tab on load. ─────────────────────────────────────── */}
          <div className="ucma-view-tabs" role="tablist">
            {Object.values(TIMELINE_TABS).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={activeTab === tabKey}
                className={`ucma-view-tab${activeTab === tabKey ? " active" : ""}`}
                onClick={() => handleTimelineTabChange(tabKey)}
                title={TIMELINE_TAB_META[tabKey].label}
              >
                <i className={TIMELINE_TAB_META[tabKey].icon}></i>
                <span className="ucma-view-tab-label">
                  {TIMELINE_TAB_META[tabKey].shortLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Header — label + count switch with the active tab */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "14px" }}>
              {TIMELINE_TAB_META[activeTab].label} ({panelCount})
              {activeTab === TIMELINE_TABS.LOCATION &&
                isLive &&
                isViewingToday && (
                  <span
                    style={{
                      marginLeft: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#16a34a",
                      background: "#dcfce7",
                      borderRadius: "10px",
                      padding: "2px 8px",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      className="ucma-liveblink"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                      }}
                    />
                    LIVE
                  </span>
                )}
              {panelLoading && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#64748b",
                  }}
                >
                  Loading…
                </span>
              )}
            </span>
          </div>

          {/* Trip summary — Location tab only */}
          {activeTab === TIMELINE_TABS.LOCATION && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "14px 10px",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "center",
              }}
            >
              <div>
                <i
                  className="ri-time-line"
                  style={{ color: "#ef4444", fontSize: "20px" }}
                ></i>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    marginTop: "2px",
                  }}
                >
                  {summary.duration}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    letterSpacing: "0.5px",
                  }}
                >
                  DURATION
                </div>
              </div>

              <div>
                <i
                  className="ri-dashboard-3-line"
                  style={{ color: "#10b981", fontSize: "20px" }}
                ></i>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    marginTop: "2px",
                  }}
                >
                  {summary.distance}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    letterSpacing: "0.5px",
                  }}
                >
                  DISTANCE
                </div>
              </div>

              <div>
                <i
                  className="ri-map-pin-2-line"
                  style={{ color: "#3b82f6", fontSize: "20px" }}
                ></i>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    marginTop: "2px",
                  }}
                >
                  {path.length || "-"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    letterSpacing: "0.5px",
                  }}
                >
                  LOCATIONS
                </div>
              </div>
            </div>
          )}

          {/* Mobile tab summary — on/off segment counts */}
          {activeTab === TIMELINE_TABS.MOBILE && !loadingMobile && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "14px 10px",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "center",
              }}
            >
              <div>
                <i
                  className="ri-map-pin-2-line"
                  style={{ color: "#ee1e1e", fontSize: "20px" }}
                ></i>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    marginTop: "2px",
                  }}
                >
                  {locationToggleSegments.length}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    letterSpacing: "0.5px",
                  }}
                >
                  LOCATION-OFF SPELLS
                </div>
              </div>
              <div>
                <i
                  className="ri-wifi-off-line"
                  style={{ color: "#ee1e1e", fontSize: "20px" }}
                ></i>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    marginTop: "2px",
                  }}
                >
                  {internetToggleSegments.length}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    letterSpacing: "0.5px",
                  }}
                >
                  INTERNET-OFF SPELLS
                </div>
              </div>
            </div>
          )}

          {/* ── Body — switches per active tab ── */}
          <div
            className="ucma-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "14px 6px",
            }}
          >
            {/* ══════════════ LOCATION TIMELINE (zigzag) ══════════════ */}
            {activeTab === TIMELINE_TABS.LOCATION && (
              <>
                {loadingLocations && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      padding: "4px 10px",
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent:
                            i % 2 === 0 ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: "70%",
                            maxWidth: "200px",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            border: "1px solid #eef0f3",
                            background: "#f8fafc",
                          }}
                        >
                          <div
                            className="ucma-skeleton"
                            style={{
                              width: "60%",
                              height: "10px",
                              marginBottom: "6px",
                            }}
                          />
                          <div
                            className="ucma-skeleton"
                            style={{
                              width: "40%",
                              height: "8px",
                              marginBottom: "8px",
                            }}
                          />
                          <div
                            className="ucma-skeleton"
                            style={{ width: "90%", height: "8px" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {path.length === 0 && !loadingLocations && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "12px",
                      padding: "24px 12px",
                    }}
                  >
                    No location history for this date
                  </div>
                )}
                <div
                  style={{
                    position: "relative",
                    display: loadingLocations ? "none" : "block",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "50%",
                      width: "2px",
                      background: "#e5e7eb",
                      transform: "translateX(-1px)",
                    }}
                  />
                  <motion.div
                    animate={{ height: `${spineProgressPct}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      width: "2px",
                      background: COLORS.travel,
                      transform: "translateX(-1px)",
                    }}
                  />

                  {path.map((p, i) => {
                    const type = pointType(i);
                    const cfg = typeConfig[type];
                    const big = isEndpoint(i);
                    const isActive = activeIndex === i;
                    const isExpanded = expandedIndex === i;
                    const onLeft = i % 2 === 0;
                    const hasForm =
                      !!p.formSubmission &&
                      Array.isArray(p.formSubmission.submitted_data) &&
                      p.formSubmission.submitted_data.length > 0;

                    const card = (
                      <motion.div
                        onClick={() => handleTimelineClick(p, i)}
                        animate={{ scale: isActive ? 1.04 : 1 }}
                        transition={{ duration: 0.18 }}
                        className="ucma-tl-card"
                        style={{
                          cursor: "pointer",
                          width: "100%",
                          maxWidth: "220px",
                          textAlign: onLeft ? "right" : "left",
                          background: isActive ? "#eff6ff" : "#f8fafc",
                          border: `1px solid ${isActive ? COLORS.travel : "#eef0f3"}`,
                          borderRadius: "10px",
                          padding: "6px 10px",
                          boxShadow: isActive
                            ? `0 3px 10px ${cfg.color}33`
                            : "none",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 700 }}>
                          {p.timestamp}
                        </div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {p.date}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#475569",
                            marginTop: "2px",
                            display: "-webkit-box",
                            WebkitLineClamp: isExpanded ? 6 : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.address || "—"}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "3px",
                            justifyContent: onLeft ? "flex-end" : "flex-start",
                          }}
                        >
                          <i
                            className={
                              p.locationOn
                                ? "ri-map-pin-2-fill"
                                : "ri-map-pin-2-line"
                            }
                            title={
                              p.locationOn ? "Location on" : "Location off"
                            }
                            style={{
                              fontSize: "12px",
                              color: p.locationOn ? "#16a34a" : "#ee1e1e",
                            }}
                          />
                          <i
                            className={
                              p.internetOn ? "ri-wifi-fill" : "ri-wifi-off-line"
                            }
                            title={
                              p.internetOn ? "Internet on" : "Internet off"
                            }
                            style={{
                              fontSize: "12px",
                              color: p.internetOn ? "#16a34a" : "#ee1e1e",
                            }}
                          />
                        </div>

                        {p.customStatusInfo && (
                          <div
                            style={{
                              marginTop: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "10px",
                              fontWeight: 600,
                              color: "#334155",
                              background: "#e2e8f0",
                              borderRadius: "10px",
                              padding: "2px 8px",
                            }}
                          >
                            <span>{p.customStatusInfo.icon}</span>
                            <span>{p.customStatusInfo.name}</span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                            justifyContent: onLeft ? "flex-end" : "flex-start",
                          }}
                        >
                          {typeof p.battery === "number" && (
                            <span
                              style={{ fontSize: "10px", color: "#64748b" }}
                            >
                              🔋 {p.battery}%
                            </span>
                          )}
                          {p.outside && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                                color: "#b91c1c",
                                background: "#fee2e2",
                                borderRadius: "10px",
                                padding: "1px 7px",
                              }}
                            >
                              Outside range
                            </span>
                          )}
                        </div>
                        {hasForm && (
                          <button
                            onClick={(e) => openFormModal(p, e)}
                            style={{
                              marginTop: "6px",
                              border: "1px solid #2563eb",
                              background: "#eff6ff",
                              color: "#2563eb",
                              borderRadius: "6px",
                              padding: "3px 9px",
                              fontSize: "10.5px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="View form submission details"
                          >
                            <i className="ri-file-list-3-line"></i>{" "}
                            {p.customFormInfo?.name || "Form details"}
                          </button>
                        )}
                      </motion.div>
                    );

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -20px 0px" }}
                        transition={{ duration: 0.25 }}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0,1fr) 32px minmax(0,1fr)",
                          alignItems: "start",
                          minHeight: "64px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            paddingRight: "8px",
                            minWidth: 0,
                          }}
                        >
                          {onLeft && card}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          <motion.div
                            onClick={() => handleMarkerClick(p, i)}
                            animate={{
                              scale: isActive ? 1.15 : 1,
                              boxShadow: isActive
                                ? `0 0 0 4px ${cfg.color}33`
                                : "0 0 0 0 transparent",
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                              width: big ? "26px" : "20px",
                              height: big ? "26px" : "20px",
                              borderRadius: "50%",
                              background: "#fff",
                              border: `2px solid ${cfg.color}`,
                              color: cfg.color,
                              fontSize: big ? "12px" : "10px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              marginTop: "2px",
                            }}
                          >
                            {cfg.icon ? (
                              <i className={cfg.icon}></i>
                            ) : (
                              cfg.letter
                            )}
                          </motion.div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            paddingLeft: "8px",
                            minWidth: 0,
                          }}
                        >
                          {!onLeft && card}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ══════════════ ACTIVITY TIMELINE (zigzag, same as Location) ══════════════ */}
            {activeTab === TIMELINE_TABS.ACTIVITY && (
              <>
                {loadingActivity && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      padding: "4px 10px",
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent:
                            i % 2 === 0 ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: "70%",
                            maxWidth: "200px",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            border: "1px solid #eef0f3",
                            background: "#f8fafc",
                          }}
                        >
                          <div
                            className="ucma-skeleton"
                            style={{
                              width: "60%",
                              height: "10px",
                              marginBottom: "6px",
                            }}
                          />
                          <div
                            className="ucma-skeleton"
                            style={{
                              width: "40%",
                              height: "8px",
                              marginBottom: "8px",
                            }}
                          />
                          <div
                            className="ucma-skeleton"
                            style={{ width: "90%", height: "8px" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activityRows.length === 0 && !loadingActivity && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "12px",
                      padding: "24px 12px",
                    }}
                  >
                    No activity timeline for this date
                  </div>
                )}

                <div
                  style={{
                    position: "relative",
                    display: loadingActivity ? "none" : "block",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "50%",
                      width: "2px",
                      background: "#e5e7eb",
                      transform: "translateX(-1px)",
                    }}
                  />

                  {activityRows.map((item, idx) => {
                    const cfg = item._config;
                    const rowKey = `activity-${item.type}-${item.id ?? idx}`;
                    const isActive = expandedIndex === rowKey;
                    const onLeft = idx % 2 === 0;
                    const title = item._chipLabel || cfg.label;
                    const address = item._subtitle || "—";
                    const statusEmoji = item._statusIcon;

                    const card = (
                      <motion.div
                        onClick={() => handleSideRowClick(item, rowKey)}
                        animate={{ scale: isActive ? 1.04 : 1 }}
                        transition={{ duration: 0.18 }}
                        className="ucma-tl-card"
                        style={{
                          cursor: item._hasCoords ? "pointer" : "default",
                          width: "100%",
                          maxWidth: "220px",
                          textAlign: onLeft ? "right" : "left",
                          background: isActive ? "#eff6ff" : "#f8fafc",
                          border: `1px solid ${isActive ? COLORS.travel : "#eef0f3"}`,
                          borderRadius: "10px",
                          padding: "6px 10px",
                          boxShadow: isActive
                            ? `0 3px 10px ${cfg.color}33`
                            : "none",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 700 }}>
                          {item._time || title}
                        </div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {item._date}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#475569",
                            marginTop: "2px",
                            display: "-webkit-box",
                            WebkitLineClamp: isActive ? 6 : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {address}
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "#334155",
                            background: "#e2e8f0",
                            borderRadius: "10px",
                            padding: "2px 8px",
                          }}
                        >
                          {statusEmoji ? (
                            <span style={{ fontSize: "11px", lineHeight: 1 }}>
                              {statusEmoji}
                            </span>
                          ) : (
                            <i
                              className={cfg.icon}
                              style={{ color: cfg.color, fontSize: "11px" }}
                            ></i>
                          )}
                          <span>{title}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                            justifyContent: onLeft ? "flex-end" : "flex-start",
                          }}
                        >
                          {item._isOngoing && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                                color: "#b45309",
                                background: "#fef3c7",
                                borderRadius: "10px",
                                padding: "1px 7px",
                              }}
                            >
                              Ongoing
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );

                    return (
                      <motion.div
                        key={rowKey}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -20px 0px" }}
                        transition={{ duration: 0.25 }}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0,1fr) 32px minmax(0,1fr)",
                          alignItems: "start",
                          minHeight: "64px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            paddingRight: "8px",
                            minWidth: 0,
                          }}
                        >
                          {onLeft && card}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          <motion.div
                            onClick={() => handleSideRowClick(item, rowKey)}
                            animate={{
                              scale: isActive ? 1.15 : 1,
                              boxShadow: isActive
                                ? `0 0 0 4px ${cfg.color}33`
                                : "0 0 0 0 transparent",
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              background: "#fff",
                              border: `2px solid ${cfg.color}`,
                              color: cfg.color,
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: item._hasCoords ? "pointer" : "default",
                              marginTop: "2px",
                            }}
                          >
                            {statusEmoji ? (
                              <span style={{ fontSize: "12px", lineHeight: 1 }}>
                                {statusEmoji}
                              </span>
                            ) : (
                              <i className={cfg.icon}></i>
                            )}
                          </motion.div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            paddingLeft: "8px",
                            minWidth: 0,
                          }}
                        >
                          {!onLeft && card}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ══════════════ MOBILE (DEVICE TOGGLE) TIMELINE ══════════════ */}
            {activeTab === TIMELINE_TABS.MOBILE && (
              <>
                {loadingMobile && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "4px 10px",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: "10px",
                          padding: "10px 12px",
                          border: "1px solid #eef0f3",
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          className="ucma-skeleton"
                          style={{
                            width: "50%",
                            height: "10px",
                            marginBottom: "6px",
                          }}
                        />
                        <div
                          className="ucma-skeleton"
                          style={{ width: "80%", height: "8px" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {!loadingMobile && mobileRows.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "12px",
                      padding: "24px 12px",
                    }}
                  >
                    No toggle events for this date
                  </div>
                )}

                {!loadingMobile && mobileRows.length > 0 && (
                  <div
                    className="ucma-tl-timeline"
                    style={{ padding: "2px 10px 2px 4px" }}
                  >
                    <div className="ucma-tl-spine" />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      {mobileRows.map((p) => {
                        const rowKey = `mobile-${p.id}`;
                        const isActive = expandedIndex === rowKey;
                        const hasCoords = activityHasCoords(p);
                        const locOff = p.location_toggle === "off";
                        const netOff = p.internet_toggle === "off";
                        const dotColor =
                          locOff || netOff ? "#dc2626" : COLORS.travel;
                        const dotIcon =
                          locOff && netOff
                            ? "ri-signal-wifi-off-line"
                            : locOff
                              ? "ri-map-pin-2-line"
                              : netOff
                                ? "ri-wifi-off-line"
                                : "ri-smartphone-line";
                        return (
                          <motion.div
                            key={rowKey}
                            initial={{ opacity: 0, y: 6 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{
                              once: true,
                              margin: "0px 0px -20px 0px",
                            }}
                            transition={{ duration: 0.2 }}
                            className="ucma-tl-row"
                          >
                            <div
                              className="ucma-tl-dot"
                              style={{ color: dotColor, marginTop: "2px" }}
                            >
                              <i className={dotIcon}></i>
                            </div>

                            <motion.div
                              onClick={() => handleSideRowClick(p, rowKey)}
                              animate={{ scale: isActive ? 1.02 : 1 }}
                              transition={{ duration: 0.18 }}
                              className="ucma-tl-card"
                              style={{
                                flex: 1,
                                minWidth: 0,
                                cursor: hasCoords ? "pointer" : "default",
                                borderRadius: "10px",
                                padding: "8px 10px",
                                background: isActive ? "#eff6ff" : "#f8fafc",
                                border: `1px solid ${isActive ? COLORS.travel : "#eef0f3"}`,
                                boxShadow: isActive
                                  ? `0 3px 10px ${dotColor}33`
                                  : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                    }}
                                  >
                                    {p._time}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "#94a3b8",
                                    }}
                                  >
                                    {p._date}
                                  </div>
                                </div>
                                {typeof p.battery_percentage === "number" && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#64748b",
                                    }}
                                  >
                                    🔋 {p.battery_percentage}%
                                  </span>
                                )}
                              </div>

                              {p.accurate_address && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#475569",
                                    marginTop: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i
                                    className="ri-map-pin-2-fill"
                                    style={{ color: "#3b82f6" }}
                                  ></i>
                                  {p.accurate_address}
                                </div>
                              )}

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  marginTop: "6px",
                                }}
                              >
                                {p.location_toggle && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      borderRadius: "10px",
                                      padding: "2px 8px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      color:
                                        p.location_toggle === "on"
                                          ? "#16a34a"
                                          : "#b91c1c",
                                      background:
                                        p.location_toggle === "on"
                                          ? "#dcfce7"
                                          : "#fee2e2",
                                    }}
                                  >
                                    <i
                                      className={
                                        p.location_toggle === "on"
                                          ? "ri-map-pin-2-fill"
                                          : "ri-map-pin-2-line"
                                      }
                                    ></i>
                                    Location {p.location_toggle}
                                  </span>
                                )}
                                {p.internet_toggle && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      borderRadius: "10px",
                                      padding: "2px 8px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      color:
                                        p.internet_toggle === "on"
                                          ? "#16a34a"
                                          : "#b91c1c",
                                      background:
                                        p.internet_toggle === "on"
                                          ? "#dcfce7"
                                          : "#fee2e2",
                                    }}
                                  >
                                    <i
                                      className={
                                        p.internet_toggle === "on"
                                          ? "ri-wifi-fill"
                                          : "ri-wifi-off-line"
                                      }
                                    ></i>
                                    Internet {p.internet_toggle}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Form submission details modal ── */}
      <Modal isOpen={formModalOpen} toggle={closeFormModal} centered size="lg">
        <ModalHeader toggle={closeFormModal}>
          <span style={{ fontSize: "15px", fontWeight: 500 }}>
            <i className="mdi mdi-file-document-outline me-2 text-primary"></i>
            {formModalMeta?.customFormInfo?.name || "Form Submission Details"}
          </span>
        </ModalHeader>

        <ModalBody
          className="cst-scroll"
          style={{
            maxHeight: "72vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "18px",
          }}
        >
          {formModalData ? (
            <>
              {/* Status + meta chips — badge now uses isFormSubmitted() so
                  string/numeric status values ("pending", 0, "submitted", 1,
                  true/false) all resolve to the correct color + label
                  instead of relying on raw truthiness. */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {formModalData?.status !== undefined &&
                  formModalData?.status !== null && (
                    <Badge
                      color={
                        isFormSubmitted(formModalData.status)
                          ? "success"
                          : "secondary"
                      }
                      pill
                      style={{ fontSize: "11px", padding: "10px 12px" }}
                    >
                      {isFormSubmitted(formModalData.status)
                        ? "Submitted"
                        : "Pending"}
                    </Badge>
                  )}
                {formModalMeta?.customStatusInfo && (
                  <div
                    style={{
                      ...coordPill,
                      background: "#fff8e1",
                      color: "#b07d00",
                      borderColor: "#f0d070",
                    }}
                  >
                    <span>{formModalMeta.customStatusInfo.icon}</span>
                    {formModalMeta.customStatusInfo.name}
                  </div>
                )}
              </div>

              {/* Form name / status */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <div style={timeBox}>
                  <div style={timeBoxLabel}>
                    <i className="mdi mdi-form-select me-1" />
                    Form Name
                  </div>
                  <div style={timeBoxValue}>
                    {formModalMeta?.customFormInfo?.name || "—"}
                  </div>
                </div>
                <div style={timeBox}>
                  <div style={timeBoxLabel}>
                    <i className="mdi mdi-checkbox-marked-circle-outline me-1" />
                    Form Status
                  </div>
                  <div style={timeBoxValue}>
                    {formModalMeta?.customStatusInfo ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span>{formModalMeta.customStatusInfo.icon}</span>
                        <span>{formModalMeta.customStatusInfo.name}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* Time / location grid */}
              {(formModalMeta?.timestamp || formModalMeta?.address) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: formModalMeta?.address
                      ? "1fr 1fr"
                      : "1fr",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {formModalMeta?.timestamp && (
                    <div style={timeBox}>
                      <div style={timeBoxLabel}>
                        <i className="mdi mdi-clock-outline me-1" />
                        Submitted At
                      </div>
                      <div style={timeBoxValue}>
                        {formModalMeta.timestamp}
                        {formModalMeta?.date ? `, ${formModalMeta.date}` : ""}
                      </div>
                    </div>
                  )}
                  {formModalMeta?.address && (
                    <div style={timeBox}>
                      <div style={timeBoxLabel}>
                        <i className="mdi mdi-map-marker-outline me-1" />
                        Location
                      </div>
                      <div style={timeBoxValue}>{formModalMeta.address}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Submitted fields */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <i className="mdi mdi-form-select" />
                Submitted Fields
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "8px",
                }}
              >
                {formModalData.submitted_data.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      background: "#fff",
                      border: "0.5px solid #e2e5ee",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        color: "#999",
                        marginBottom: "4px",
                      }}
                    >
                      {field.label}
                    </div>
                    <div style={{ fontSize: "13px", color: "#333" }}>
                      {renderFormFieldValue(field)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
              <i
                className="mdi mdi-file-remove-outline"
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "12px",
                }}
              />
              <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>
                No form submission data.
              </p>
            </div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Button
              color="warning"
              onClick={closeFormModal}
              style={{ minWidth: "100px" }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default UsersClusterMapAll;
