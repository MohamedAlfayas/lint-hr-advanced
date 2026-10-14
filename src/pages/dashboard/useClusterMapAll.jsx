// src/component/maps/UsersClusterMapAll.jsx
//
// Install once:  npm install framer-motion react-select
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
import { MapSkeleton, PageSkeleton, Skel } from "../../component/common/skeleton/Skeleton";
import {
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Button,
} from "reactstrap";
import Select from "../../shared/ui/TestableSelect";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Api } from "../../common/api/Api";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./LocationWebSocket/WebSocket";
import "../../common/css/lc_style.css";
import "./LocationHistory.scss";
import { useMapThemeStyles } from "../../shared/theme/mapStyles";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { testId, itemTestKey } from "../../shared/testing/testId";
import ModalCloseButton from "../../shared/ui/ModalCloseButton";

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

// Shorter routes need a closer camera for the movement to be visible.
const playbackZoomForKm = (km) => {
  if (km < 0.3) return 20;
  if (km < 1) return 19;
  if (km < 5) return 18;
  return PLAYBACK_FOLLOW_ZOOM;
};

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
// Independent of `dataMode` (GPS/Road/Both/lintAI) below — TAB switches
// which API/dataset drives the right panel list, dataMode only affects
// which coordinate fields (or, for lintAI, which separate route dataset)
// drive the map while on the Location tab.
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

// Clockwise degrees from north, from point a toward point b.
// FORWARD_CLOSED_ARROW points north at rotation 0, so this is the marker rotation.
const bearingDeg = (a, b) => {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
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
  // "lintAI" = a dedicated, continuous road-following route fetched from a
  // separate backend endpoint (GET /location/employee-route/<employee_id>/
  // ?date=YYYY-MM-DD), NOT derived from the per-ping formatted_latitude/
  // formatted_longitude fields the way ROAD/BOTH are. Unlike the other three
  // modes (which just re-derive `path` from data already in memory), this
  // API call is only ever made when the user explicitly selects this tab —
  // see the lintAI fetch effect below. There is no cache for it: every time
  // the tab is (re)selected, or the employee/date changes while it's
  // selected, it fetches fresh.
  LINTAI: "lintAI",
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

// ─── Device info from `meta`:
//     { device_id, device_brand, device_model }. `meta` may arrive as an
//     object or a JSON string — handle both. Returns empty strings when
//     missing so callers can simply check truthiness. ──────────────────
const getDeviceInfo = (loc) => {
  let meta = loc?.meta;
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = null;
    }
  }
  return {
    brand: (meta && meta.device_brand) || "",
    model: (meta && meta.device_model) || "",
  };
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
  // Continuous solid line color for the lintAI OSRM-matched route — kept
  // visually distinct from the dotted roadLine (Road/Both) overlay.
  lintAILine: "#0d9488",
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
    .cst-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
    .cst-scroll::-webkit-scrollbar-thumb { background: var(--vz-border-color); border-radius: 10px; }
    .cst-scroll::-webkit-scrollbar-thumb:hover { background: var(--vz-primary); }
    .cst-scroll { scrollbar-width: thin; scrollbar-color: var(--vz-border-color) transparent; }
  `;
  document.head.appendChild(tag);
};

// ─── Shared chip / box styles used inside the form-submission modal
//     (same look as the app's activity-timeline modal). ───────────────
const coordPill = {
  background: "rgba(var(--vz-primary-rgb), 0.08)",
  borderRadius: "8px",
  padding: "5px 12px",
  fontSize: "12px",
  color: "var(--vz-primary)",
  fontWeight: 500,
  border: "1px solid rgba(var(--vz-primary-rgb), 0.25)",
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
};

const timeBox = {
  background: "var(--vz-tertiary-bg)",
  borderRadius: "10px",
  padding: "10px 12px",
  border: "1px solid var(--vz-border-color)",
};
const timeBoxLabel = {
  fontSize: "11px",
  color: "var(--vz-secondary-color)",
  marginBottom: "3px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const timeBoxValue = {
  fontSize: "13px",
  color: "var(--vz-heading-color)",
  fontWeight: 500,
};

// ─── react-select styles for the employee filter — theme variables only so
//     the control and its menu follow light/dark mode ──
const rsSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    height: "38px",
    borderRadius: "10px",
    borderColor: state.isFocused
      ? "var(--vz-primary)"
      : "var(--vz-border-color)",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(var(--vz-primary-rgb), 0.15)"
      : "none",
    background: "var(--vz-body-bg)",
    width: "100%",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    "&:hover": {
      borderColor: state.isFocused
        ? "var(--vz-primary)"
        : "rgba(var(--vz-primary-rgb), 0.45)",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 8px 0 34px" }),
  singleValue: (base) => ({ ...base, color: "var(--vz-body-color)" }),
  placeholder: (base) => ({ ...base, color: "var(--vz-secondary-color)" }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "var(--vz-body-color)",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: "0 10px",
    color: state.isFocused ? "var(--vz-primary)" : "var(--vz-secondary-color)",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
    transition: "transform 0.2s",
  }),
  indicatorsContainer: (base) => ({ ...base, height: "36px" }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
    marginTop: "6px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "var(--vz-secondary-bg)",
    border: "1px solid var(--vz-border-color)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
  }),
  menuList: (base) => ({ ...base, padding: "4px", maxHeight: "280px" }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: "12px",
    color: "var(--vz-secondary-color)",
  }),
};

// ─── Employee option renderer (avatar + name + department) ─────
const EmployeeDisplayInSelect = (props) => {
  const { data, innerRef, innerProps, isSelected, isFocused } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`ucx-opt${isSelected ? " is-selected" : ""}${isFocused ? " is-focused" : ""}`}
    >
      {data.profile_url ? (
        <img src={data.profile_url} alt={data.label} className="ucx-opt-avatar" />
      ) : (
        <span className="ucx-opt-avatar">
          {data.label?.charAt(0)?.toUpperCase()}
        </span>
      )}
      <span className="ucx-opt-text">
        <span className="ucx-opt-name d-block">{data.label}</span>
        {data.department && (
          <span className="ucx-opt-dept d-block">{data.department}</span>
        )}
      </span>
      {isSelected && <i className="ri-check-line ucx-opt-check"></i>}
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
    .ucma-liveblink { animation: ucma-blink 1.2s infinite; }
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
      background: var(--vz-primary);
      border: 2px solid var(--vz-secondary-bg);
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
      background: var(--vz-primary);
      border: 2px solid var(--vz-secondary-bg);
      box-shadow: 0 1px 5px rgba(0,0,0,0.45);
      cursor: pointer;
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
        data-testid="cluster-map-url-link"
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
  const [tilesReady, setTilesReady] = useState(false);
  // Stop the tile skeleton even if tiles never finish (bad key / offline).
  useEffect(() => {
    const id = setTimeout(() => setTilesReady(true), 8000);
    return () => clearTimeout(id);
  }, []);
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
  // NO CACHE — every employee or date switch fetches fresh. This trades a
  // network round-trip for correctness over the previous cache-based
  // optimization (a stale cached copy could otherwise hide new pings).
  const [activeLocations, setActiveLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Per-employee, per-date Activity Timeline, from
  // GET /attendance/get-attendance-activity-timeline/{emp_id}?date=YYYY-MM-DD
  // Cached the same way, fetched lazily only once the
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

  // ── lintAI: dedicated OSRM road-matched route (continuous line), fetched
  //     ONLY when the user selects the "lintAI" tab — see the fetch effect
  //     near the other data-fetch effects below. Separate from `path`,
  //     which stays on the raw/road per-ping GPS data used everywhere else.
  //     No cache here either: reselecting the tab, or changing employee/
  //     date while it's selected, always re-fetches. ─────────────────────
  const [matchedRouteCoords, setMatchedRouteCoords] = useState([]); // [{lat,lng}, ...]
  const [matchedRouteMeta, setMatchedRouteMeta] = useState({
    distanceMeters: null,
    durationSeconds: null,
  });
  const [loadingMatchedRoute, setLoadingMatchedRoute] = useState(false);

  // Tracks the current date filter without forcing the websocket-connect
  // effect (which only depends on [selectedEmpId]) to re-run on every date
  // change. Read inside the live onMessage/onRouteUpdate handlers below.
  const dateFilterRef = useRef(dateFilter);
  useEffect(() => {
    dateFilterRef.current = dateFilter;
  }, [dateFilter]);

  const liveAppendRef = useRef(false); 
  const skipNextFitRef = useRef(false);

  // Same pattern for dataMode: read inside the websocket's onRouteUpdate
  // handler (declared further below) so a live lintAI push is only ever
  // applied while that tab is actually selected, without forcing the
  // websocket-connect effect to reconnect every time the tab changes.
  const dataModeRef = useRef(DATA_MODES.GPS);

  // ── Which coordinate source is currently driving the map/timeline:
  //    raw GPS ("gps"), OSRM-snapped ("road"), or both overlaid together
  //    ("both"). Three tabs on the map let the user flip between them;
  //    switching re-derives `path` below from the same cached
  //    `activeLocations`, no extra fetch required. ───────────────────────
  const [dataMode, setDataMode] = useState(DATA_MODES.GPS);
  useEffect(() => {
    dataModeRef.current = dataMode;
  }, [dataMode]);

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

  const [movingHeading, setMovingHeading] = useState(0);
  const [checkpoint, setCheckpoint] = useState(null);
  const [tripDoneVisible, setTripDoneVisible] = useState(false);
  const [liveFlash, setLiveFlash] = useState(null);
  const zoomAnimRef = useRef(null);

  // One zoom level per step so the camera glides in/out instead of jumping.
  const smoothZoomTo = useCallback((target) => {
    const map = mapRef.current;
    if (!map) return;
    clearInterval(zoomAnimRef.current);
    zoomAnimRef.current = setInterval(() => {
      const z = Math.round(map.getZoom() || 0);
      if (z === target) {
        clearInterval(zoomAnimRef.current);
        return;
      }
      map.setZoom(z + (z < target ? 1 : -1));
    }, 160);
  }, []);

  useEffect(() => () => clearInterval(zoomAnimRef.current), []);

  // Always-on "marching ants" flow along the route, independent of playback.
  // Animated directly on the Google polylines — a React state tick here would
  // re-render the whole map + timeline ~16 times a second.
  const antOffsetRef = useRef(0);
  const antLinesRef = useRef(new Set());
  const registerAntLine = useCallback((line) => {
    antLinesRef.current.add(line);
  }, []);
  const unregisterAntLine = useCallback((line) => {
    antLinesRef.current.delete(line);
  }, []);

  // 0..1 draw-in of the route each time a new route loads; 1 = fully drawn.
  const [introT, setIntroT] = useState(1);
  const introRafRef = useRef(null);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startProgressRef = useRef(0);

  const timelineScrollRef = useRef(null);
  const pendingFocusLatestRef = useRef(false);
  const [focusLatestToken, setFocusLatestToken] = useState(0);

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
  //     render — playback re-renders this component every animation frame,
  //     which re-renders this component constantly. If `options` were an
  //     inline object literal, react-google-maps/api would call
  //     map.setOptions(...) on every one of those re-renders, which was
  //     fighting the native Map/Satellite control's own internal click
  //     handling and made it look like satellite toggle didn't apply
  //     immediately. Memoizing keeps the object referentially stable so
  //     setOptions is only called when something here actually changes. ──
  const mapStyles = useMapThemeStyles();
  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      fullscreenControl: false,
      // Map / Satellite is our own toggle (switchMapType) so it reacts instantly.
      mapTypeControl: false,
      // 45° aerial imagery at zoom 18+ is far heavier than flat satellite tiles.
      tilt: 0,
      rotateControl: false,
      styles: mapStyles,
    }),
    [mapStyles],
  );

  const [mapType, setMapType] = useState("roadmap");
  const [mapTilesLoading, setMapTilesLoading] = useState(false);

  const switchMapType = (type) => {
    const map = mapRef.current;
    if (!map || type === mapType) return;
    setMapType(type);
    setMapTilesLoading(true);
    window.google.maps.event.addListenerOnce(map, "tilesloaded", () =>
      setMapTilesLoading(false),
    );
    // Cached tiles may never fire "tilesloaded".
    setTimeout(() => setMapTilesLoading(false), 4000);
    map.setMapTypeId(type);
  };

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
    setActiveLocations([]);
    setActivityCache({});
    setMobileCache({});
    setDateFilter("");
    setActiveTab(TIMELINE_TABS.LOCATION);
    setDataMode(DATA_MODES.GPS);
    setMatchedRouteCoords([]);
    setMatchedRouteMeta({ distanceMeters: null, durationSeconds: null });
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

  // ─── Fetch the selected employee + date's location history.
  //     NO CACHE — hits the API every time selectedEmpId or dateFilter
  //     changes, so switching back to a previously-viewed combo still shows
  //     current data instead of a stale cached copy. ───────────────────────
  useEffect(() => {
    if (!selectedEmpId || !dateFilter) {
      setActiveLocations([]);
      return;
    }

    let cancelled = false;

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await Api.get(
          `/attendance/get-location-tracking-data/${selectedEmpId}?date=${dateFilter}`,
        );
        const data = response?.data?.data;
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          pendingFocusLatestRef.current = list.length > 0;
          setActiveLocations(list);
        }
      } catch (error) {
        console.error(
          `Error fetching location history for employee ${selectedEmpId} on ${dateFilter}:`,
          error,
        );
        if (!cancelled) {
          setActiveLocations([]);
        }
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    };

    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [selectedEmpId, dateFilter]);

  // ─── Fetch the selected employee + date's lintAI (OSRM road-matched)
  //     route. Unlike every other fetch here, this one is gated on
  //     `dataMode === DATA_MODES.LINTAI` — it only ever calls the API when
  //     the user has actually selected the lintAI tab. Switching to any
  //     other tab does not fetch it, and switching back to lintAI (or
  //     changing employee/date while it's selected) always re-fetches, with
  //     no cache. A 404 (no matched route for that employee/date yet) is
  //     treated as "no route", not an error worth surfacing. ─────────────
  useEffect(() => {
    if (dataMode !== DATA_MODES.LINTAI || !selectedEmpId || !dateFilter) {
      return;
    }

    let cancelled = false;

    const fetchMatchedRoute = async () => {
      try {
        setLoadingMatchedRoute(true);
        const response = await Api.get(
          `/location/employee-route/${selectedEmpId}/?date=${dateFilter}`,
        );
        const data = response?.data;
        if (!cancelled) {
          const route = Array.isArray(data?.route) ? data.route : [];
          setMatchedRouteCoords(route.map(([lng, lat]) => ({ lat, lng })));
          setMatchedRouteMeta({
            distanceMeters: data?.distance_meters ?? null,
            durationSeconds: data?.duration_seconds ?? null,
          });
        }
      } catch (error) {
        // 404 = no matched route segment for this employee/date yet
        if (!cancelled) {
          setMatchedRouteCoords([]);
          setMatchedRouteMeta({ distanceMeters: null, durationSeconds: null });
        }
      } finally {
        if (!cancelled) setLoadingMatchedRoute(false);
      }
    };

    fetchMatchedRoute();
    return () => {
      cancelled = true;
    };
  }, [dataMode, selectedEmpId, dateFilter]);

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
  //     employee the modal was opened for). Reconnects only when the
  //     employee changes, not on date changes — the date filter is read via
  //     `dateFilterRef` inside the handlers so live events only get applied
  //     when the person is actually viewing today. No cache to manage here
  //     any more: a live ping is simply appended straight onto
  //     `activeLocations` when today is on screen. ─────────────────────────
  useEffect(() => {
    if (!selectedEmpId) {
      disconnectWebSocket();
      setIsLive(false);
      setLiveLocation(null);
      return;
    }

    setLiveLocation(null);
    setIsLive(false);

    connectWebSocket(selectedEmpId, {
      onOpen: () => {
        setIsLive(true);
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
        if (dateFilterRef.current === todayIsoIN()) {
            liveAppendRef.current = true;  
          setActiveLocations((prev) => [...prev, normalized]);
        }
      },
      // ── lintAI live updates: only applied when the lintAI tab is the one
      //    currently selected AND today is on screen. Selecting a different
      //    tab means these pushes are simply ignored — they never trigger
      //    an API call or state update on their own. ───────────────────────
      onRouteUpdate: (data) => {
        if (!data?.route) return;
        if (dataModeRef.current !== DATA_MODES.LINTAI) return;
        if (dateFilterRef.current !== todayIsoIN()) return;

        const coords = data.route.map(([lng, lat]) => ({ lat, lng }));
        // The socket sends only the new leg, in travel order. Append it
        // onto the day's line from EmployeeRouteSegment.
        setMatchedRouteCoords((prev) => {
          if (!prev.length) return coords;
          const last = prev[prev.length - 1];
          const first = coords[0];
          const incoming =
            first &&
            Math.abs(first.lat - last.lat) < 1e-5 &&
            Math.abs(first.lng - last.lng) < 1e-5
              ? coords.slice(1)
              : coords;
          return incoming.length ? [...prev, ...incoming] : prev;
        });
        setMatchedRouteMeta((prev) => ({
          distanceMeters:
            data?.distance_meters == null
              ? prev.distanceMeters
              : (Number(prev.distanceMeters) || 0) + Number(data.distance_meters),
          durationSeconds:
            data?.duration_seconds == null
              ? prev.durationSeconds
              : (Number(prev.durationSeconds) || 0) + Number(data.duration_seconds),
        }));
      },
      onClose: () => setIsLive(false),
      onError: () => setIsLive(false),
    });

    return () => {
      disconnectWebSocket();
      setIsLive(false);
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


   // ─── Live follow: map pan + timeline scroll ───
  useEffect(() => {
    if (!isLive || !liveMarkerPos || !mapRef.current) return;
    if (activeTab !== TIMELINE_TABS.LOCATION) return;
    if (dataMode === DATA_MODES.LINTAI || isPlaying) return;

    const map = mapRef.current;
    map.panTo(liveMarkerPos);
    if ((map.getZoom() || 0) < PLAYBACK_FOLLOW_ZOOM) {
      smoothZoomTo(PLAYBACK_FOLLOW_ZOOM);
    }
    setLiveFlash({
      ...liveMarkerPos,
      key: `${liveMarkerPos.lat},${liveMarkerPos.lng},${liveLocation?.timestamp || ""}`,
    });

    const t = setTimeout(() => {
      const el = timelineScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 150);
    const flashTimer = setTimeout(() => setLiveFlash(null), 2600);
    return () => {
      clearTimeout(t);
      clearTimeout(flashTimer);
    };
  }, [liveLocation, isLive]);


  // ─── Build path + timeline data (from the active employee's route).
  //     Re-runs on `dataMode` too, so flipping the GPS/Road/Both tab
  //     re-derives the same cached `activeLocations` through the other
  //     coordinate getter instead of re-fetching. "Both" keeps `path` on
  //     normal GPS coordinates (same getters as "gps") — the OSRM overlay
  //     for "both" is built separately below (secondaryRoadLinePath) so
  //     every marker / timeline card / playback value stays anchored to
  //     one consistent set of points. ─────────────────────────────────
    useEffect(() => {
    let focusLatestIndex = null;
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

        // Device brand / model from `meta`
        const deviceInfo = getDeviceInfo(loc);

        return {
          index: index + 1,
          name: activeEmployee?.first_name || "",
          lat: resolveLat(loc),
          lng: resolveLng(loc),
          address: cleanedAddress,
          timestamp: indianTime,
          date: indianDate,
          battery: loc?.battery_percentage,
          deviceBrand: deviceInfo.brand,
          deviceModel: deviceInfo.model,
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
      if (liveAppendRef.current) {
      liveAppendRef.current = false;
      skipNextFitRef.current = true;
      setActiveIndex(processed.length - 1);
      const latest = [...processed].reverse().find(hasValidCoords);
      if (latest) {
        setSelectedMarker({
          lat: latest.lat,
          lng: latest.lng,
          count: 1,
          users: [latest],
        });
      }
      return;                                   
    }

      if (pendingFocusLatestRef.current) {
        pendingFocusLatestRef.current = false;
        focusLatestIndex = processed.length - 1; // latest record
      }
    } else {
      setPath([]);
    }
    setActiveIndex(focusLatestIndex);
    if (focusLatestIndex !== null) setFocusLatestToken((t) => t + 1);
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

  // Playback follows the lintAI road line while that tab is selected.
  // Other tabs keep the GPS / road ping path.
  const playbackPath = useMemo(() => {
    if (dataMode === DATA_MODES.LINTAI) return matchedRouteCoords;
    return mapPath;
  }, [dataMode, matchedRouteCoords, mapPath]);

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
      if (skipNextFitRef.current) {              
      skipNextFitRef.current = false;
      return;
    }
    if (mapRef.current && mapPath.length > 0)
      fitToPath(mapRef.current, mapPath);
  }, [mapPath, fitToPath]);


   // ─── On a fresh load, land on the LATEST record: scroll the timeline to
  //     the bottom, open its info window and pan the map to it. ─────────
  useEffect(() => {
    if (!focusLatestToken) return;
    if (activeTab !== TIMELINE_TABS.LOCATION) return;
    if (dataMode === DATA_MODES.LINTAI) return;
    if (path.length === 0) return;

    // Timeline: scroll to the last card
    const scrollTimer = setTimeout(() => {
      const el = timelineScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 150);

    // Map: latest record that actually has coordinates
    const lastWithCoords = [...path].reverse().find(hasValidCoords);
    let mapTimer;
    if (lastWithCoords) {
      setSelectedMarker({
        lat: lastWithCoords.lat,
        lng: lastWithCoords.lng,
        count: 1,
        users: [lastWithCoords],
      });
      mapTimer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: lastWithCoords.lat,
            lng: lastWithCoords.lng,
          });
          mapRef.current.setZoom(17);
        }
      }, 200);
    }

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(mapTimer);
    };
  
  }, [focusLatestToken]);

  // ─── lintAI: re-fit to the matched route's own geometry once it arrives
  //     (it can run further along roads than the raw pings, so fitting to
  //     mapPath alone could clip it). Only acts while that tab is selected. ──
  useEffect(() => {
    if (
      dataMode === DATA_MODES.LINTAI &&
      mapRef.current &&
      matchedRouteCoords.length > 0
    ) {
      fitToPath(mapRef.current, matchedRouteCoords);
    }
  }, [dataMode, matchedRouteCoords, fitToPath]);

  // Heading of the lintAI line: last segment of the ordered route.
  const lintAIHeading = useMemo(() => {
    if (matchedRouteCoords.length < 2) return null;
    const from = matchedRouteCoords[matchedRouteCoords.length - 2];
    const to = matchedRouteCoords[matchedRouteCoords.length - 1];
    return { position: to, rotation: bearingDeg(from, to) };
  }, [matchedRouteCoords]);

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
  // Uses playbackPath so lintAI walks the matched route and the other
  // tabs walk the GPS / road pings. nearIndex is the timeline index
  // (`pathIndex`); lintAI points have none, so the timeline stays put.
  const computeFromProgress = useCallback(
    (t) => {
      if (playbackPath.length === 0) return null;
      if (playbackPath.length === 1) {
        return {
          pos: { lat: playbackPath[0].lat, lng: playbackPath[0].lng },
          label: playbackPath[0].timestamp || "",
          nearIndex: playbackPath[0].pathIndex ?? null,
        };
      }

      const segCount = playbackPath.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const a = playbackPath[segIndex];
      const b = playbackPath[segIndex + 1];

      const lat = a.lat + (b.lat - a.lat) * segT;
      const lng = a.lng + (b.lng - a.lng) * segT;
      const near = segT < 0.5 ? a : b;
      const moved = a.lat !== b.lat || a.lng !== b.lng;

      return {
        pos: { lat, lng },
        label: near.timestamp || "",
        nearIndex: near.pathIndex ?? null,
        heading: moved ? bearingDeg(a, b) : null,
      };
    },
    [playbackPath],
  );

  // ─── Build the polyline coords drawn so far (start → current) ─
  const getDrawnPath = useCallback(
    (t) => {
      if (playbackPath.length < 2) return [];
      const segCount = playbackPath.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const drawn = playbackPath.slice(0, segIndex + 1).map((p) => ({
        lat: p.lat,
        lng: p.lng,
      }));

      const a = playbackPath[segIndex];
      const b = playbackPath[segIndex + 1];
      drawn.push({
        lat: a.lat + (b.lat - a.lat) * segT,
        lng: a.lng + (b.lng - a.lng) * segT,
      });
      return drawn;
    },
    [playbackPath],
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
        if (r.heading != null) setMovingHeading(r.heading);
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
        setTripDoneVisible(true);
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
    if (playbackPath.length < 2 && mapPath.length < 2) return;
    const id = setInterval(() => {
      antOffsetRef.current = (antOffsetRef.current + 4) % 140;
      const offset = `${antOffsetRef.current}px`;
      antLinesRef.current.forEach((line) => {
        const icons = line.get("icons");
        if (icons && icons.length) {
          line.set("icons", icons.map((ic) => ({ ...ic, offset })));
        }
      });
    }, 60);
    return () => clearInterval(id);
  }, [playbackPath.length, mapPath.length]);

  // ─── Draw the route in from start to end whenever a new route loads.
  //     Keyed on the first point so live pings appended later don't replay it. ──
  const introKey =
    playbackPath.length > 1
      ? `${dataMode}|${playbackPath[0].lat},${playbackPath[0].lng}`
      : "";
  useEffect(() => {
    if (!introKey) {
      setIntroT(1);
      return undefined;
    }
    const durationMs = 1600;
    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / durationMs, 1);
      setIntroT(1 - Math.pow(1 - t, 3));
      if (t < 1) introRafRef.current = requestAnimationFrame(tick);
    };
    setIntroT(0);
    introRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(introRafRef.current);
  }, [introKey]);

  // ─── Zoom in once, right when playback starts (not on every frame —
  //     calling setZoom repeatedly mid-pan is what caused the "stuck"
  //     stutter). Playback stopping/finishing doesn't zoom back out on
  //     its own; "Full view" / reset handle that. ────────────────────
  useEffect(() => {
    if (!isPlaying || !mapRef.current) return;
    setTripDoneVisible(false);
    const start = computeFromProgress(progress >= 1 ? 0 : progress);
    if (start) mapRef.current.panTo(start.pos);
    const routeKm =
      dataMode === DATA_MODES.LINTAI && matchedRouteMeta.distanceMeters != null
        ? Number(matchedRouteMeta.distanceMeters) / 1000
        : summary.km;
    smoothZoomTo(playbackZoomForKm(routeKm));
  }, [isPlaying]);

  // ─── Trip finished: celebrate briefly, then glide back out to the whole route ──
  useEffect(() => {
    if (!tripDoneVisible) return undefined;
    const fitTimer = setTimeout(() => {
      clearInterval(zoomAnimRef.current);
      const pts =
        dataMode === DATA_MODES.LINTAI && matchedRouteCoords.length > 0
          ? matchedRouteCoords
          : mapPath;
      if (mapRef.current && pts.length) fitToPath(mapRef.current, pts);
    }, 900);
    const hideTimer = setTimeout(() => setTripDoneVisible(false), 3500);
    return () => {
      clearTimeout(fitTimer);
      clearTimeout(hideTimer);
    };
  }, [tripDoneVisible]);

  // ─── Checkpoint reached during playback: ripple + info card on the map,
  //     and bring the matching timeline card into view. ──
  useEffect(() => {
    if (!isPlaying || activeIndex == null) return undefined;
    const p = path[activeIndex];
    if (!p || !hasValidCoords(p)) return undefined;
    setCheckpoint({ ...p, key: activeIndex });
    const card = timelineScrollRef.current?.querySelector(".ucx-card.is-active");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => setCheckpoint(null), 2200);
    return () => clearTimeout(t);
  }, [activeIndex, isPlaying]);

  useEffect(() => {
    if (!isPlaying) setCheckpoint(null);
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
    if (playbackPath.length < 2) return;
    setSelectedMarker(null);
    if (progress >= 1) {
      setProgress(0);
      applyProgress(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    clearInterval(zoomAnimRef.current);
    setTripDoneVisible(false);
    setIsPlaying(false);
    setProgress(0);
    applyProgress(0);
    const fitPts =
      dataMode === DATA_MODES.LINTAI && matchedRouteCoords.length > 0
        ? matchedRouteCoords
        : mapPath;
    if (mapRef.current && fitPts.length) fitToPath(mapRef.current, fitPts);
  };

  // ─── Refresh → reset everything to initial full view ──────────
  const handleRefresh = () => {
    clearInterval(zoomAnimRef.current);
    setTripDoneVisible(false);
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
    setCurrentLabel("");
    setActiveIndex(null);
    setExpandedIndex(null);
    setSelectedMarker(null);
    if (mapRef.current) {
      const pts =
        dataMode === DATA_MODES.LINTAI && matchedRouteCoords.length > 0
          ? matchedRouteCoords
          : mapPath;
      fitToPath(mapRef.current, pts);
    }
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
    clearInterval(zoomAnimRef.current);
    setTripDoneVisible(false);
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
    clearInterval(zoomAnimRef.current);
    setTripDoneVisible(false);
    setIsPlaying(false);
    setProgress(0);
    setMovingPos(null);
    setActiveIndex(null);
    setExpandedIndex(null);
    setSelectedMarker(null);
    if (mapRef.current) {
      const pts =
        dataMode === DATA_MODES.LINTAI && matchedRouteCoords.length > 0
          ? matchedRouteCoords
          : mapPath;
      fitToPath(mapRef.current, pts);
    }
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
  

  // Coming back to the Location tab → land on the LATEST record again
    if (tabKey === TIMELINE_TABS.LOCATION && path.length > 0) {
      setActiveIndex(path.length - 1);
      setFocusLatestToken((t) => t + 1);
    } else {
      setActiveIndex(null);
    }
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

  const firstLat = mapPath[0]?.lat;
  const firstLng = mapPath[0]?.lng;
  const mapCenter = useMemo(
    () =>
      firstLat != null && firstLng != null
        ? { lat: firstLat, lng: firstLng }
        : indiaCenter,
    [firstLat, firstLng],
  );

  const handleDatePickerChange = (date) => {
    // Use the dayjs object and re-format to ISO ourselves — the second
    // arg antd gives us is formatted per the display `format` prop
    // ("DD MMM YYYY"), which is NOT what dateFilter uses internally
    // (ISO "YYYY-MM-DD").
    setDateFilter(date ? date.format(ISO_DATE_FORMAT) : "");
  };

  if (!isLoaded) return <PageSkeleton stats={false} testId="cluster-map-loading-skeleton" label="Loading map" />;

  const isEndpoint = (i) => i === 0 || i === path.length - 1;

  const isScrubbing = isPlaying || progress > 0;
  const isDrawingIn = !isScrubbing && introT < 1;
  const drawnLinePath = isScrubbing
    ? getDrawnPath(progress)
    : isDrawingIn
      ? getDrawnPath(introT)
      : mapPath;
  const drawnLintAIPath = isScrubbing
    ? getDrawnPath(progress)
    : isDrawingIn
      ? getDrawnPath(introT)
      : matchedRouteCoords;
  const routeStartLabel = mapPath[0]?.timestamp || "";
  const routeEndLabel = mapPath[mapPath.length - 1]?.timestamp || "";
  const stopPoints = mapPath.filter((p, i) => {
    if (i === 0 || i === mapPath.length - 1 || p.formSubmission) return false;
    if (pointType(p.pathIndex) !== "waiting") return false;
    const prev = mapPath[i - 1];
    return !prev || pointType(prev.pathIndex) !== "waiting";
  });
  const dashIcon = (color, opacity) => ({
    icon: { path: "M 0,-1 0,1", strokeOpacity: opacity, strokeColor: color, scale: 3 },
    offset: "0",
    repeat: "14px",
  });

  const typeConfig = {
    start: { color: COLORS.start, icon: "ri-flag-fill", letter: null, label: "Start" },
    end: { color: COLORS.end, icon: "ri-flag-2-fill", letter: null, label: "End" },
    waiting: { color: COLORS.waiting, icon: null, letter: "W", label: "Stop" },
    travel: { color: COLORS.travel, icon: "ri-car-fill", letter: null, label: "Moving" },
  };

  const renderZigzagSkeleton = () => (
    <div className="ucx-skel-list">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
          }}
        >
          <div className="ucx-skel-card">
            <div
              className="ucma-skeleton"
              style={{ width: "60%", height: "10px", marginBottom: "6px" }}
            />
            <div
              className="ucma-skeleton"
              style={{ width: "40%", height: "8px", marginBottom: "8px" }}
            />
            <div className="ucma-skeleton" style={{ width: "90%", height: "8px" }} />
          </div>
        </div>
      ))}
    </div>
  );

  // How far along the vertical spine the progress fill should reach.
  const spineProgressPct =
    activeIndex != null && path.length > 1
      ? (activeIndex / (path.length - 1)) * 100
      : 0;

  const playbackKm =
    dataMode === DATA_MODES.LINTAI && matchedRouteMeta.distanceMeters != null
      ? Number(matchedRouteMeta.distanceMeters) / 1000
      : summary.km;
  const distanceCovered = (playbackKm * progress).toFixed(1);

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
    <div className="ucx-root">
      <div
        className="ucx-layout"
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          width: "100%",
          flexWrap: "nowrap",
        }}
      >
        {/* ── MAP (left, full height, grows/shrinks with the window) ── */}
        <div
          className="ucx-map-area"
          style={{ flex: "1 1 0%", minWidth: 0, position: "relative" }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
           center={mapCenter}
            onLoad={onMapLoad}
            onTilesLoaded={() => setTilesReady(true)}
            options={mapOptions}
          >
            {/* Faint full-route track, always visible underneath
                (Normal / Both — the Road-only dotted line and the lintAI
                continuous line below replace this entirely rather than
                layering under it) */}
            {mapPath.length > 1 &&
              dataMode !== DATA_MODES.ROAD &&
              dataMode !== DATA_MODES.LINTAI && (
                <Polyline
                  path={mapPath}
                  options={{
                    strokeOpacity: 0,
                    icons: [dashIcon(COLORS.route, isScrubbing || isDrawingIn ? 0.45 : 0.18)],
                  }}
                />
              )}
            {mapPath.length > 1 &&
              dataMode !== DATA_MODES.ROAD &&
              dataMode !== DATA_MODES.LINTAI && (
                <Polyline
                  path={drawnLinePath}
                  options={{
                    strokeColor: COLORS.route,
                    strokeOpacity: 0.16,
                    strokeWeight: 14,
                  }}
                />
              )}

            {/* Travelled / full route line with continuous marching-ant
                arrows (Normal / Both) */}
            {mapPath.length > 1 &&
              dataMode !== DATA_MODES.ROAD &&
              dataMode !== DATA_MODES.LINTAI && (
              <Polyline
                path={drawnLinePath}
                onLoad={registerAntLine}
                onUnmount={unregisterAntLine}
                options={{
                  strokeColor: COLORS.route,
                  strokeOpacity: 1,
                  strokeWeight: 5,
                  icons: [
                    {
                      icon: {
                        path: window.google.maps.SymbolPath
                          .FORWARD_CLOSED_ARROW,
                        scale: 3,
                        strokeColor: "#ffffff",
                        strokeWeight: 1,
                        fillColor: COLORS.route,
                        fillOpacity: 1,
                      },
                      offset: `${antOffsetRef.current}px`,
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

            {/* lintAI: road-matched line from EmployeeRouteSegment.
                While the player runs, the solid stroke grows along that
                line; the faint stroke stays the full route underneath. */}
            {matchedRouteCoords.length > 1 &&
              dataMode === DATA_MODES.LINTAI && (
                <>
                  {(isScrubbing || isDrawingIn) && (
                    <Polyline
                      path={matchedRouteCoords}
                      options={{
                        strokeOpacity: 0,
                        icons: [dashIcon(COLORS.lintAILine, 0.45)],
                      }}
                    />
                  )}
                  <Polyline
                    path={drawnLintAIPath}
                    options={{
                      strokeColor: COLORS.lintAILine,
                      strokeOpacity: 0.16,
                      strokeWeight: 14,
                    }}
                  />
                  <Polyline
                    path={drawnLintAIPath}
                    onLoad={registerAntLine}
                    onUnmount={unregisterAntLine}
                    options={{
                      strokeColor: COLORS.lintAILine,
                      strokeOpacity: 1,
                      strokeWeight: 5,
                      icons: [
                        {
                          icon: {
                            path: window.google.maps.SymbolPath
                              .FORWARD_CLOSED_ARROW,
                            scale: 3.5,
                            strokeColor: "#ffffff",
                            strokeWeight: 1,
                            fillColor: COLORS.lintAILine,
                            fillOpacity: 1,
                          },
                          offset: `${antOffsetRef.current}px`,
                          repeat: "120px",
                        },
                      ],
                    }}
                  />
                </>
              )}
            {matchedRouteCoords.length > 0 &&
              dataMode === DATA_MODES.LINTAI && (
                <Marker
                  position={matchedRouteCoords[0]}
                  zIndex={10}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: COLORS.start,
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: "#ffffff",
                  }}
                />
              )}
            {lintAIHeading && dataMode === DATA_MODES.LINTAI && (
              <Marker
                position={lintAIHeading.position}
                zIndex={30}
                icon={{
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                  rotation: lintAIHeading.rotation,
                  fillColor: "#0f766e",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
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

            {/* Start marker (green) with radar ping ring — first valid coords.
                Hidden on lintAI; that tab's start is the matched route. */}
            {mapPath.length > 0 && dataMode !== DATA_MODES.LINTAI && (
              <OverlayView
                position={mapPath[0]}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <button
                  data-testid="cluster-map-start-pin-button"
                  type="button"
                  className={`ucx-pin is-start${isScrubbing ? " is-compact" : ""}`}
                  onClick={() =>
                    handleMarkerClick(mapPath[0], mapPath[0].pathIndex)
                  }
                >
                  <span className="ucx-pin-ring" />
                  <span className="ucx-pin-dot">
                    <i className="ri-flag-fill"></i>
                  </span>
                  <span className="ucx-pin-label">
                    Start{routeStartLabel ? ` · ${routeStartLabel}` : ""}
                  </span>
                </button>
              </OverlayView>
            )}

            {/* End marker (red) — last valid coords */}
            {mapPath.length > 1 && dataMode !== DATA_MODES.LINTAI && !isDrawingIn && (
              <OverlayView
                position={mapPath[mapPath.length - 1]}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <button
                  data-testid="cluster-map-end-pin-button"
                  type="button"
                  className={`ucx-pin is-end${isScrubbing ? " is-compact" : ""}`}
                  onClick={() =>
                    handleMarkerClick(
                      mapPath[mapPath.length - 1],
                      mapPath[mapPath.length - 1].pathIndex,
                    )
                  }
                >
                  <span className="ucx-pin-dot">
                    <i className="ri-flag-2-fill"></i>
                  </span>
                  <span className="ucx-pin-label">
                    End{routeEndLabel ? ` · ${routeEndLabel}` : ""}
                  </span>
                </button>
              </OverlayView>
            )}

            {/* Stops — first ping of each stationary stretch */}
            {dataMode !== DATA_MODES.LINTAI &&
              !isDrawingIn &&
              stopPoints.map((p) => (
                <Marker
                  key={`stop-marker-${p.pathIndex}`}
                  position={{ lat: p.lat, lng: p.lng }}
                  zIndex={9}
                  title={p.timestamp ? `Stop · ${p.timestamp}` : "Stop"}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: COLORS.waiting,
                    fillOpacity: 1,
                    strokeWeight: 2.5,
                    strokeColor: "#ffffff",
                  }}
                  onClick={() => handleMarkerClick(p, p.pathIndex)}
                />
              ))}

            {/* Form-submission markers — every point (except start/end, which
                already carry their own marker above) that has a filled form
                gets its own document-pin marker. Clicking it pans/zooms in
                AND opens the form details modal (handleMarkerClick does both).
                Points with null lat/lng are timeline-only and skipped here. */}
            {dataMode !== DATA_MODES.LINTAI &&
              mapPath.map(
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
              <OverlayView
                position={movingPos}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className={`ucx-runner${isPlaying ? " is-playing" : ""}`}>
                  <span className="ucx-runner-pulse" />
                  <span
                    className="ucx-runner-heading"
                    style={{ transform: `rotate(${movingHeading}deg)` }}
                  >
                    <span className="ucx-runner-arrow" />
                  </span>
                  <span className="ucx-runner-avatar">
                    {(activeEmployee?.first_name || "?").charAt(0).toUpperCase()}
                    {activeEmployee?.profile_url && (
                      <img
                        src={activeEmployee.profile_url}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </span>
                </div>
              </OverlayView>
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
                <div className="ucx-moving-chip-anchor">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="ucx-moving-chip"
                  >
                    <i className="ri-time-line"></i>
                    {currentLabel}
                  </motion.div>
                </div>
              </OverlayView>
            )}

            {/* Checkpoint reached during playback */}
            {checkpoint && (
              <OverlayView
                key={`checkpoint-${checkpoint.key}`}
                position={{ lat: checkpoint.lat, lng: checkpoint.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="ucx-checkpoint">
                  <span className="ucx-checkpoint-ripple" />
                  <span className="ucx-checkpoint-ripple is-delayed" />
                  <span className="ucx-checkpoint-dot" />
                  <div className="ucx-checkpoint-card">
                    <div className="ucx-checkpoint-time">
                      <i className="ri-map-pin-time-line"></i>
                      {checkpoint.timestamp || "Location"}
                    </div>
                    {checkpoint.address && (
                      <div className="ucx-checkpoint-address">{checkpoint.address}</div>
                    )}
                  </div>
                </div>
              </OverlayView>
            )}

            {/* Live location just updated */}
            {liveFlash && (
              <OverlayView
                key={`live-flash-${liveFlash.key}`}
                position={{ lat: liveFlash.lat, lng: liveFlash.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="ucx-checkpoint is-live">
                  <span className="ucx-checkpoint-ripple" />
                  <span className="ucx-checkpoint-ripple is-delayed" />
                  <div className="ucx-checkpoint-card">
                    <div className="ucx-checkpoint-time">
                      <span className="ucx-live-dot" />
                      Location updated
                    </div>
                  </div>
                </div>
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
                      padding: "10px 12px 0",
                    }}
                  >
                    <h6 className="lc-infowindow-title" style={{ margin: 0 }}>
                      <i
                        className="ri-map-pin-2-fill"
                        style={{ color: "var(--vz-danger)" }}
                      ></i>
                      {selectedMarker.count} Record
                      {selectedMarker.count > 1 ? "s" : ""}
                    </h6>
                    <button
                      data-testid="cluster-map-close-button"
                      type="button"
                      onClick={handleCloseClick}
                      title="Close"
                      className="ucx-iw-close"
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
                              <div className="ucx-iw-status">
                                <span>{user.customStatusInfo.icon}</span>
                                <span>{user.customStatusInfo.name}</span>
                              </div>
                            )}
                            {user.formSubmission && (
                              <button
                                data-testid={testId("cluster-map-form-details", itemTestKey(user), "button")}
                                type="button"
                                onClick={(e) => openFormModal(user, e)}
                                className="ucx-iw-form"
                              >
                                <span className="ucx-iw-form-icon">
                                  <i className="ri-file-list-3-line"></i>
                                </span>
                                <span className="ucx-iw-form-title">
                                  Form details
                                </span>
                                {user.customFormInfo?.name && (
                                  <span className="ucx-iw-form-name">
                                    {user.customFormInfo.name}
                                  </span>
                                )}
                                <i className="ri-arrow-right-s-line"></i>
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
          {!tilesReady && <MapSkeleton overlay testId="cluster-map-tiles-loading-skeleton" />}

          {/* ── Loading state: employee/date selected, request in flight ── */}
          {activeEmployee && dateFilter && loadingLocations && (
            <div className="ucx-map-overlay is-loading">
              <div className="ucx-map-card ucx-glass" role="status" aria-label="Loading route" data-testid="cluster-map-route-loading-skeleton" style={{ minWidth: 240 }}>
                <Skel circle h={44} style={{ margin: "0 auto 12px" }} />
                <Skel w="70%" h={14} style={{ margin: "0 auto 8px" }} />
                <Skel w="50%" h={10} style={{ margin: "0 auto" }} />
              </div>
            </div>
          )}

          {/* ── Empty state: employee selected, date picked, but no data for it ── */}
          {activeEmployee &&
            dateFilter &&
            path.length === 0 &&
            !loadingLocations && (
              <div className="ucx-map-overlay">
                <div className="ucx-map-card ucx-glass">
                  <span className="ucx-map-card-icon">
                    <i className="ri-map-pin-line"></i>
                  </span>
                  <div className="ucx-map-card-title">
                    No location data for this date
                  </div>
                  <div className="ucx-map-card-sub">
                    Try another date from the calendar
                  </div>
                </div>
              </div>
            )}

          {/* ── Map overlay controls, top-center: Normal / Road / Both / lintAI.
              Switches which coordinate fields build the path shown below.
              Only meaningful for the Location Timeline tab. ── */}
          {path.length > 0 && activeTab === TIMELINE_TABS.LOCATION && (
            <div className="ucma-mode-tabs ucx-map-seg ucx-glass">
              <button
                data-testid="cluster-map-normal-button"
                type="button"
                className={`ucma-mode-tab${dataMode === DATA_MODES.GPS ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.GPS)}
                title="Raw GPS coordinates"
              >
                Normal
              </button>
              <button
                data-testid="cluster-map-road-button"
                type="button"
                className={`ucma-mode-tab${dataMode === DATA_MODES.ROAD ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.ROAD)}
                title="OSRM road-snapped coordinates"
              >
                Road
              </button>
              <button
                data-testid="cluster-map-both-button"
                type="button"
                className={`ucma-mode-tab${dataMode === DATA_MODES.BOTH ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.BOTH)}
                title="Show both GPS and road-snapped routes"
              >
                Both
              </button>
              <button
                data-testid="cluster-map-lint-ai-button"
                type="button"
                className={`ucma-mode-tab${dataMode === DATA_MODES.LINTAI ? " active" : ""}`}
                onClick={() => setDataMode(DATA_MODES.LINTAI)}
                title="lintAI — continuous OSRM road-matched route (fetched only when this tab is selected)"
              >
                lintAI{loadingMatchedRoute && dataMode === DATA_MODES.LINTAI
                  ? "…"
                  : ""}
              </button>
            </div>
          )}

          {/* lintAI: "no matched route yet" hint, shown only when that tab
              is selected, nothing is loading, and the API returned none. */}
          {path.length > 0 &&
            activeTab === TIMELINE_TABS.LOCATION &&
            dataMode === DATA_MODES.LINTAI &&
            !loadingMatchedRoute &&
            matchedRouteCoords.length === 0 && (
              <div className="ucx-map-note ucx-glass">
                <i className="ri-information-line"></i>
                No lintAI route available for this date
              </div>
            )}

          {/* ── Map / Satellite toggle, top-left ── */}
          <div className="ucx-maptype ucx-glass">
            <button
              data-testid="cluster-map-map-view-button"
              type="button"
              className={`ucx-maptype-btn${mapType === "roadmap" ? " active" : ""}`}
              onClick={() => switchMapType("roadmap")}
            >
              <i
                className={
                  mapTilesLoading && mapType === "roadmap"
                    ? "ri-loader-4-line is-spin"
                    : "ri-map-2-line"
                }
              ></i>
              Map
            </button>
            <button
              data-testid="cluster-map-satellite-view-button"
              type="button"
              className={`ucx-maptype-btn${mapType === "hybrid" ? " active" : ""}`}
              onClick={() => switchMapType("hybrid")}
            >
              <i
                className={
                  mapTilesLoading && mapType === "hybrid"
                    ? "ri-loader-4-line is-spin"
                    : "ri-earth-line"
                }
              ></i>
              Satellite
            </button>
          </div>

          {/* ── Map overlay controls, top-right: Refresh + Full view ── */}
          {path.length > 0 && (
            <div className="ucx-map-tools">
              <button
                data-testid="cluster-map-refresh-button"
                type="button"
                onClick={handleRefresh}
                className="ucx-map-btn ucx-glass"
                title="Refresh"
              >
                <i className="ri-refresh-line"></i>
              </button>
              <button
                data-testid="cluster-map-full-view-button"
                type="button"
                onClick={resetView}
                className="ucx-map-btn ucx-glass"
                title="Full view"
              >
                <i className="ri-focus-3-line"></i>
              </button>
            </div>
          )}

          {/* ── Live distance-covered readout, top-right, while playing/scrubbed ── */}
          <AnimatePresence>
            {activeTab === TIMELINE_TABS.LOCATION &&
              playbackPath.length > 1 &&
              (isPlaying || progress > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="ucx-map-chip ucx-glass"
                >
                  <span className="ucx-map-chip-icon">
                    {isPlaying ? (
                      <span
                        className="ucma-liveblink"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--vz-danger)",
                          display: "inline-block",
                        }}
                      />
                    ) : (
                      <i className="ri-route-line"></i>
                    )}
                  </span>
                  <span>
                    {distanceCovered}{" "}
                    <span className="ucx-map-chip-total">
                      /{" "}
                      {dataMode === DATA_MODES.LINTAI &&
                      matchedRouteMeta.distanceMeters != null
                        ? `${(Number(matchedRouteMeta.distanceMeters) / 1000).toFixed(1)} Km`
                        : summary.distance}
                    </span>
                  </span>
                </motion.div>
              )}
          </AnimatePresence>

          {/* ── Trip complete banner, shown briefly when playback reaches the end ── */}
          <AnimatePresence>
            {tripDoneVisible && (
              <motion.div
                key="ucx-trip-done"
                initial={{ opacity: 0, y: -12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="ucx-trip-done ucx-glass"
              >
                <span className="ucx-trip-done-icon">
                  <i className="ri-checkbox-circle-fill"></i>
                </span>
                <div>
                  <div className="ucx-trip-done-title">Trip complete</div>
                  <div className="ucx-trip-done-sub">
                    {summary.distance} · {summary.duration}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Playback controls — vertical panel, left side of the map.
              Only meaningful for the Location Timeline tab. ── */}
          {activeTab === TIMELINE_TABS.LOCATION && playbackPath.length > 1 && (
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
                gap: "14px",
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
                }}
              >
                <div className="ucx-pb-track" />
                <motion.div
                  className="ucx-pb-fill"
                  animate={{ height: `${progress * 100}%` }}
                  transition={{ duration: isPlaying ? 0 : 0.15 }}
                />
                {dataMode !== DATA_MODES.LINTAI &&
                  mapPath.map((_, i) => (
                    <span
                      key={i}
                      className="ucx-pb-tick"
                      style={{
                        bottom: `${(i / (mapPath.length - 1)) * 100}%`,
                      }}
                    />
                  ))}
                <input
                  data-testid="cluster-map-progress-input"
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
                data-testid="cluster-map-play-button"
                type="button"
                onClick={togglePlay}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.06 }}
                className="ucma-playback-play ucx-pb-play"
                title={isPlaying ? "Pause" : progress > 0 ? "Resume" : "Play"}
              >
                <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i>
              </motion.button>

              <button
                data-testid="cluster-map-reset-button"
                type="button"
                onClick={handleReset}
                className="ucma-playback-reset ucx-pb-reset ucx-glass"
                title="Reset"
              >
                <i className="ri-restart-line"></i>
              </button>

              <div className="ucx-pb-speeds ucx-glass">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    data-testid={testId("cluster-map-x", itemTestKey(s), "button")}
                    key={s}
                    type="button"
                    onClick={() => setPlaybackSpeed(s)}
                    className={`ucma-playback-speedbtn${playbackSpeed === s ? " active" : ""}`}
                    title={`${s}x speed`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                data-testid="cluster-map-speed-cycle-button"
                type="button"
                className="ucx-pb-speed-cycle ucx-glass"
                title="Change speed"
                onClick={() =>
                  setPlaybackSpeed(
                    SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(playbackSpeed) + 1) % SPEED_OPTIONS.length],
                  )
                }
              >
                {playbackSpeed}x
              </button>
            </div>
          )}
        </div>

        {/* ── TIMELINE (right) ── */}
        <aside
          className="ucx-panel"
          style={{
            flex: `0 0 ${TIMELINE_WIDTH_CLAMP}`,
            width: TIMELINE_WIDTH_CLAMP,
          }}
        >
          {/* ── Filters (shared across all 3 tabs) ── */}
          <div className="ucx-filters">
            <div className="ucx-field is-full" title="Employee">
              <div className="ucx-control">
                <i className="ri-user-3-line ucx-control-icon"></i>
                <Select
                  testId="cluster-map-ucma-employee-select"
                  inputId="ucma_employee_select"
                  aria-label="Employee"
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

            <div className="ucx-field" title="Department">
              <div className="ucx-control">
                <i className="ri-building-line ucx-control-icon"></i>
                <Input
                  data-testid="cluster-map-department-select"
                  id="ucma_dept_select"
                  aria-label="Department"
                  type="select"
                  className="ucx-select"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option data-testid="cluster-map-ucma-dept-select-option-all" value="All">All Depts</option>
                  {departmentOptions.map((d) => (
                    <option data-testid={testId("cluster-map-ucma-dept-select-option", itemTestKey(d))} key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Input>
              </div>
            </div>

            <div className="ucx-field is-date" title="Date">
              <div className="ucx-control">
                <i className="ri-calendar-event-line ucx-control-icon"></i>
                <DatePicker
                  aria-label="Date"
                  value={datePickerValue}
                  format="DD MMM YYYY"
                  allowClear={false}
                  placeholder="Select date"
                  disabled={!activeEmployee}
                  disabledDate={disabledDate}
                  onChange={handleDatePickerChange}
                  suffixIcon={<i className="ri-arrow-down-s-line"></i>}
                  popupClassName="ucma-date-popup"
                />
              </div>
            </div>
          </div>

          {/* ── View tabs: Location / Activity / Mobile Timeline. These control
              ONLY what the panel below renders — the employee/date filters
              and the map itself stay shared across all three. ── */}
          <div className="ucx-tabs" role="tablist">
            {Object.values(TIMELINE_TABS).map((tabKey) => (
              <button
                data-testid={testId("cluster-map", itemTestKey(tabKey), "button")}
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={activeTab === tabKey}
                className={`ucx-tab${activeTab === tabKey ? " active" : ""}`}
                onClick={() => handleTimelineTabChange(tabKey)}
                title={TIMELINE_TAB_META[tabKey].label}
              >
                {activeTab === tabKey && (
                  <motion.span
                    layoutId="ucx-tab-pill"
                    className="ucx-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <i className={TIMELINE_TAB_META[tabKey].icon}></i>
                <span className="ucx-tab-label">
                  {TIMELINE_TAB_META[tabKey].shortLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Header — label + count switch with the active tab */}
          <div className="ucx-head">
            <div className="ucx-head-title">
              <span className="ucx-head-icon">
                <i className={TIMELINE_TAB_META[activeTab].icon}></i>
              </span>
              {TIMELINE_TAB_META[activeTab].label}
              <span className="ucx-count">{panelCount}</span>
              {activeTab === TIMELINE_TABS.LOCATION &&
                isLive &&
                isViewingToday && (
                  <span className="ucx-live">
                    <span className="ucx-live-dot" />
                    LIVE
                  </span>
                )}
            </div>
            {panelLoading && (
              <span role="status" aria-label="Loading" data-testid="cluster-map-panel-loading-skeleton">
                <Skel w={64} h={20} pill />
              </span>
            )}
          </div>

          {/* Trip summary — Location tab only */}
          {activeTab === TIMELINE_TABS.LOCATION && (
            <div className="ucx-stats">
              <div className="ucx-stat tone-danger">
                <span className="ucx-stat-icon">
                  <i className="ri-time-line"></i>
                </span>
                <div className="ucx-stat-value">{summary.duration}</div>
                <div className="ucx-stat-label">Duration</div>
              </div>
              <div className="ucx-stat tone-success">
                <span className="ucx-stat-icon">
                  <i className="ri-route-line"></i>
                </span>
                <div className="ucx-stat-value">{summary.distance}</div>
                <div className="ucx-stat-label">Distance</div>
              </div>
              <div className="ucx-stat">
                <span className="ucx-stat-icon">
                  <i className="ri-map-pin-2-line"></i>
                </span>
                <div className="ucx-stat-value">{path.length || "-"}</div>
                <div className="ucx-stat-label">Locations</div>
              </div>
            </div>
          )}

          {/* Mobile tab summary — on/off segment counts */}
          {activeTab === TIMELINE_TABS.MOBILE && !loadingMobile && (
            <div className="ucx-stats is-2">
              <div className="ucx-stat tone-danger">
                <span className="ucx-stat-icon">
                  <i className="ri-map-pin-2-line"></i>
                </span>
                <div className="ucx-stat-value">
                  {locationToggleSegments.length}
                </div>
                <div className="ucx-stat-label">Location-off spells</div>
              </div>
              <div className="ucx-stat tone-warning">
                <span className="ucx-stat-icon">
                  <i className="ri-wifi-off-line"></i>
                </span>
                <div className="ucx-stat-value">
                  {internetToggleSegments.length}
                </div>
                <div className="ucx-stat-label">Internet-off spells</div>
              </div>
            </div>
          )}

          {/* ── Body — switches per active tab ── */}
          <div className="ucx-body" ref={timelineScrollRef}>
            {/* ══════════════ LOCATION TIMELINE (zigzag) ══════════════ */}
            {activeTab === TIMELINE_TABS.LOCATION && (
              <>
                {loadingLocations && renderZigzagSkeleton()}

                {path.length === 0 && !loadingLocations && (
                  <div className="ucx-empty">
                    <span className="ucx-empty-icon">
                      <i className="ri-map-pin-line"></i>
                    </span>
                    <div className="ucx-empty-title">No location history</div>
                    <div className="ucx-empty-sub">
                      Nothing was recorded for this date
                    </div>
                  </div>
                )}

                <div
                  className="ucx-zz"
                  style={{ display: loadingLocations ? "none" : "block" }}
                >
                  {path.length > 0 && <div className="ucx-spine" />}
                  {path.length > 0 && (
                    <motion.div
                      className="ucx-spine-fill"
                      animate={{ height: `${spineProgressPct}%` }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  )}

                  {path.map((p, i) => {
                    const type = pointType(i);
                    const cfg = typeConfig[type];
                    const big = isEndpoint(i);
                    const isActive = activeIndex === i;
                    const isExpanded = expandedIndex === i;
                    const onLeft = i % 2 === 0;
                    const side = onLeft ? "is-left" : "is-right";
                    const hasForm =
                      !!p.formSubmission &&
                      Array.isArray(p.formSubmission.submitted_data) &&
                      p.formSubmission.submitted_data.length > 0;
                    const deviceLabel = [p.deviceBrand, p.deviceModel]
                      .filter(Boolean)
                      .join(" ");
                    const lowBattery =
                      typeof p.battery === "number" && p.battery <= 20;

                    const card = (
                      <motion.div
                        onClick={() => handleTimelineClick(p, i)}
                        animate={{ scale: isActive ? 1.03 : 1 }}
                        transition={{ duration: 0.18 }}
                        className={`ucx-card ${side} is-typed${isActive ? " is-active" : ""}`}
                        style={{ "--c": cfg.color }}
                      >
                        <div className="ucx-card-top">
                          <span className="ucx-time">{p.timestamp}</span>
                          <span
                            className="ucx-type"
                            style={{ "--c": cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="ucx-date">{p.date}</div>

                        <div className="ucx-addr">
                          <i className="ri-map-pin-line"></i>
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: isExpanded ? 6 : 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.address || "—"}
                          </span>
                        </div>

                        <div className="ucx-meta">
                          <span
                            className={`ucx-chip is-icon ${p.locationOn ? "is-ok" : "is-bad"}`}
                            title={p.locationOn ? "Location on" : "Location off"}
                          >
                            <i
                              className={
                                p.locationOn
                                  ? "ri-map-pin-2-fill"
                                  : "ri-map-pin-2-line"
                              }
                            ></i>
                          </span>
                          <span
                            className={`ucx-chip is-icon ${p.internetOn ? "is-ok" : "is-bad"}`}
                            title={p.internetOn ? "Internet on" : "Internet off"}
                          >
                            <i
                              className={
                                p.internetOn ? "ri-wifi-fill" : "ri-wifi-off-line"
                              }
                            ></i>
                          </span>
                          {typeof p.battery === "number" && (
                            <span
                              className={`ucx-chip${lowBattery ? " is-bad" : ""}`}
                              title="Battery"
                            >
                              <i
                                className={
                                  lowBattery
                                    ? "ri-battery-low-line"
                                    : "ri-battery-2-line"
                                }
                              ></i>
                              {p.battery}%
                            </span>
                          )}
                          {p.outside && (
                            <span className="ucx-chip is-bad">
                              <i className="ri-error-warning-line"></i>
                              Outside range
                            </span>
                          )}
                          {p.customStatusInfo && (
                            <span className="ucx-chip">
                              <span>{p.customStatusInfo.icon}</span>
                              <span className="ucx-chip-text">
                                {p.customStatusInfo.name}
                              </span>
                            </span>
                          )}
                        </div>

                        {deviceLabel && (
                          <div className="ucx-device" title={deviceLabel}>
                            <i className="ri-smartphone-line"></i>
                            <span>{deviceLabel}</span>
                          </div>
                        )}

                        {hasForm && (
                          <button
                            data-testid={testId("cluster-map-form-details", itemTestKey(p), "button")}
                            type="button"
                            className="ucx-form-btn"
                            onClick={(e) => openFormModal(p, e)}
                            title="View form submission details"
                          >
                            <i className="ri-file-list-3-line"></i>
                            <span>{p.customFormInfo?.name || "Form details"}</span>
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
                        className="ucx-zz-row"
                      >
                        <div className="ucx-zz-side is-left">
                          {onLeft && card}
                        </div>

                        <div className="ucx-zz-mid">
                          <motion.div
                            onClick={() => handleMarkerClick(p, i)}
                            animate={{
                              scale: isActive ? 1.15 : 1,
                              boxShadow: isActive
                                ? `0 0 0 5px ${cfg.color}33`
                                : `0 0 0 ${big ? 2 : 0}px ${cfg.color}`,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`ucx-node${big ? " is-big" : ""}${isActive ? " is-active" : ""}`}
                            style={{ "--c": cfg.color }}
                            title={cfg.label}
                          >
                            {cfg.icon ? (
                              <i className={cfg.icon}></i>
                            ) : (
                              cfg.letter
                            )}
                          </motion.div>
                        </div>

                        <div className="ucx-zz-side is-right">
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
                {loadingActivity && renderZigzagSkeleton()}

                {activityRows.length === 0 && !loadingActivity && (
                  <div className="ucx-empty">
                    <span className="ucx-empty-icon">
                      <i className="ri-list-check-2"></i>
                    </span>
                    <div className="ucx-empty-title">No activity</div>
                    <div className="ucx-empty-sub">
                      No activity timeline for this date
                    </div>
                  </div>
                )}

                <div
                  className="ucx-zz"
                  style={{ display: loadingActivity ? "none" : "block" }}
                >
                  {activityRows.length > 0 && <div className="ucx-spine" />}

                  {activityRows.map((item, idx) => {
                    const cfg = item._config;
                    const rowKey = `activity-${item.type}-${item.id ?? idx}`;
                    const isActive = expandedIndex === rowKey;
                    const onLeft = idx % 2 === 0;
                    const side = onLeft ? "is-left" : "is-right";
                    const title = item._chipLabel || cfg.label;
                    const address = item._subtitle || "—";
                    const statusEmoji = item._statusIcon;

                    const card = (
                      <motion.div
                        onClick={() => handleSideRowClick(item, rowKey)}
                        animate={{ scale: isActive ? 1.03 : 1 }}
                        transition={{ duration: 0.18 }}
                        className={`ucx-card ${side}${isActive ? " is-active" : ""}${item._hasCoords ? "" : " is-static"}`}
                      >
                        <div className="ucx-card-top">
                          <span className="ucx-time">{item._time || title}</span>
                          {item._isOngoing && (
                            <span className="ucx-chip is-warn">
                              <i className="ri-pulse-line"></i>
                              Ongoing
                            </span>
                          )}
                        </div>
                        <div className="ucx-date">{item._date}</div>

                        <div className="ucx-meta">
                          <span
                            className="ucx-chip is-custom"
                            style={{ "--c": cfg.color }}
                          >
                            {statusEmoji ? (
                              <span style={{ fontSize: "11px", lineHeight: 1 }}>
                                {statusEmoji}
                              </span>
                            ) : (
                              <i className={cfg.icon}></i>
                            )}
                            <span className="ucx-chip-text">{title}</span>
                          </span>
                        </div>

                        <div className="ucx-addr">
                          <i className="ri-map-pin-line"></i>
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: isActive ? 6 : 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {address}
                          </span>
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
                        className="ucx-zz-row"
                      >
                        <div className="ucx-zz-side is-left">
                          {onLeft && card}
                        </div>

                        <div className="ucx-zz-mid">
                          <motion.div
                            onClick={() => handleSideRowClick(item, rowKey)}
                            animate={{
                              scale: isActive ? 1.15 : 1,
                              boxShadow: isActive
                                ? `0 0 0 5px ${cfg.color}33`
                                : `0 0 0 2px ${cfg.color}`,
                            }}
                            transition={{ duration: 0.2 }}
                            className="ucx-node is-big"
                            style={{
                              "--c": cfg.color,
                              cursor: item._hasCoords ? "pointer" : "default",
                            }}
                            title={title}
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

                        <div className="ucx-zz-side is-right">
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
                  <div className="ucx-skel-list" style={{ gap: "12px" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="ucx-skel-card is-wide">
                        <div
                          className="ucma-skeleton"
                          style={{ width: "50%", height: "10px", marginBottom: "6px" }}
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
                  <div className="ucx-empty">
                    <span className="ucx-empty-icon">
                      <i className="ri-smartphone-line"></i>
                    </span>
                    <div className="ucx-empty-title">No device events</div>
                    <div className="ucx-empty-sub">
                      No location or internet toggles for this date
                    </div>
                  </div>
                )}

                {!loadingMobile && mobileRows.length > 0 && (
                  <div className="ucx-mt">
                    <div className="ucx-mt-spine" />
                    <div className="ucx-mt-list">
                      {mobileRows.map((p) => {
                        const rowKey = `mobile-${p.id}`;
                        const isActive = expandedIndex === rowKey;
                        const hasCoords = activityHasCoords(p);
                        const locOff = p.location_toggle === "off";
                        const netOff = p.internet_toggle === "off";
                        const dotColor =
                          locOff || netOff ? "#dc2626" : COLORS.start;
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
                            className="ucx-mt-row"
                          >
                            <div
                              className="ucx-mt-dot"
                              style={{ "--c": dotColor }}
                            >
                              <i className={dotIcon}></i>
                            </div>

                            <motion.div
                              onClick={() => handleSideRowClick(p, rowKey)}
                              animate={{ scale: isActive ? 1.02 : 1 }}
                              transition={{ duration: 0.18 }}
                              className={`ucx-card is-right is-wide${isActive ? " is-active" : ""}${hasCoords ? "" : " is-static"}`}
                            >
                              <div className="ucx-card-top">
                                <span className="ucx-time">{p._time}</span>
                                <span className="ucx-date">{p._date}</span>
                              </div>

                              {p.accurate_address && (
                                <div className="ucx-addr">
                                  <i className="ri-map-pin-line"></i>
                                  <span>{p.accurate_address}</span>
                                </div>
                              )}

                              <div className="ucx-meta">
                                {p.location_toggle && (
                                  <span
                                    className={`ucx-chip ${p.location_toggle === "on" ? "is-ok" : "is-bad"}`}
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
                                    className={`ucx-chip ${p.internet_toggle === "on" ? "is-ok" : "is-bad"}`}
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
        </aside>
      </div>

      {/* ── Form submission details modal ── */}
      <Modal data-testid="cluster-map-form-submission-details-dialog" isOpen={formModalOpen} toggle={closeFormModal} centered size="lg">
        <ModalHeader close={<ModalCloseButton onClick={closeFormModal} testId="cluster-map-form-submission-details-close-button" />} toggle={closeFormModal}>
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
                      background: "rgba(var(--vz-warning-rgb), 0.12)",
                      color: "var(--vz-warning)",
                      borderColor: "rgba(var(--vz-warning-rgb), 0.35)",
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
                  color: "var(--vz-secondary-color)",
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
                      background: "var(--vz-secondary-bg)",
                      border: "1px solid var(--vz-border-color)",
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
                        color: "var(--vz-secondary-color)",
                        marginBottom: "4px",
                      }}
                    >
                      {field.label}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--vz-body-color)" }}>
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
                  color: "var(--vz-secondary-color)",
                  marginBottom: "12px",
                }}
              />
              <p style={{ color: "var(--vz-secondary-color)", fontSize: "15px", margin: 0 }}>
                No form submission data.
              </p>
            </div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Button
              data-testid="cluster-map-form-submission-details-footer-close-button"
              color="light"
              className="modal-dismiss-btn"
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
