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

// ─── Raw GPS coordinates, straight off the device ──────────────────────
const getLat = (loc) => parseFloat(loc?.latitude) || 0;
const getLng = (loc) => parseFloat(loc?.longitude) || 0;

// ─── OSRM/road-snapped coordinates. Falls back to the raw fields when a
// point hasn't been formatted yet, so a point never drops off the map
// just because it's missing formatted_*. ────────────────────────────────
const getRoadLat = (loc) => {
  const formatted = parseFloat(loc?.formatted_latitude);
  return Number.isFinite(formatted) && formatted !== 0
    ? formatted
    : getLat(loc);
};
const getRoadLng = (loc) => {
  const formatted = parseFloat(loc?.formatted_longitude);
  return Number.isFinite(formatted) && formatted !== 0
    ? formatted
    : getLng(loc);
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
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
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
    }
    @media (max-width: 380px) {
      .ucma-tl-card {
        padding: 5px 7px !important;
        border-radius: 8px !important;
      }
    }
  `;
  document.head.appendChild(tag);
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

  // ── Which coordinate source is currently driving the map/timeline:
  //    raw GPS ("gps"), OSRM-snapped ("road"), or both overlaid together
  //    ("both"). Three tabs on the map let the user flip between them;
  //    switching re-derives `path` below from the same cached
  //    `activeLocations`, no extra fetch required. ───────────────────────
  const [dataMode, setDataMode] = useState(DATA_MODES.GPS);

  // ── Employee / department / date filter state ──
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmpId);
  const [dateFilter, setDateFilter] = useState(""); // "" = none picked yet, else "YYYY-MM-DD"

  // Per-employee, per-date location history fetched on demand from
  // GET /attendance/get-location-tracking-data/{emp_id}?date=YYYY-MM-DD
  // Cached by "empId::date" so switching back to a previously viewed
  // employee/date combo doesn't re-fetch.
  const [locationCache, setLocationCache] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);

  // ── Live tracking (websocket) ──
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLive, setIsLive] = useState(false);

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
    setDateFilter("");
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
          setLocationCache((prev) => ({
            ...prev,
            [key]: Array.isArray(data) ? data : [],
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching location history for employee ${selectedEmpId} on ${dateFilter}:`,
          error,
        );
        if (!cancelled) {
          setLocationCache((prev) => ({ ...prev, [key]: [] }));
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

  // ─── Location history for the active employee + selected date ─────
  const activeLocations = useMemo(() => {
    if (!selectedEmpId || !dateFilter) return [];
    const key = `${selectedEmpId}::${dateFilter}`;
    return locationCache[key] || [];
  }, [selectedEmpId, dateFilter, locationCache]);

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
      return;
    }

    setLiveLocation(null);
    setIsLive(false);

    connectWebSocket(selectedEmpId, {
      onOpen: () => {
        setIsLive(true);
        const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
        setLocationCache((prev) => {
          if (!(todayKey in prev)) return prev;
          const next = { ...prev };
          delete next[todayKey];
          return next;
        });
      },
      onMessage: (data) => {
        if (!data || data.latitude == null || data.longitude == null) return;
        const normalized = normalizeLiveLocation(data);
        setLiveLocation(normalized);

        // Only fold live points into TODAY's history — a different date
        // being viewed shouldn't get contaminated with live data.
        const todayKey = `${selectedEmpId}::${todayIsoIN()}`;
        setLocationCache((prev) => {
          const existing = prev[todayKey] || [];
          return { ...prev, [todayKey]: [...existing, normalized] };
        });
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
  const isViewingToday = dateFilter === todayIsoIN();
  const liveMarkerPos =
    isViewingToday && liveLocation
      ? dataMode === DATA_MODES.ROAD
        ? { lat: getRoadLat(liveLocation), lng: getRoadLng(liveLocation) }
        : { lat: getLat(liveLocation), lng: getLng(liveLocation) }
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
  }, [activeLocations, activeEmployee, findCustomStatus, findCustomForm, dataMode]);

  // ─── Secondary OSRM road-snapped line, shown ONLY in "Both" mode
  //     alongside the primary (normal) path/markers/playback. Built
  //     directly from activeLocations rather than from `path`, since
  //     `path` itself stays on normal-GPS coordinates even while dataMode
  //     is BOTH — this is purely a visual overlay drawn on top. ─────────
  const secondaryRoadLinePath = useMemo(() => {
    if (dataMode !== DATA_MODES.BOTH) return [];
    if (!Array.isArray(activeLocations) || activeLocations.length === 0)
      return [];
    return activeLocations.map((loc) => ({
      lat: getRoadLat(loc),
      lng: getRoadLng(loc),
    }));
  }, [activeLocations, dataMode]);

  // ─── Trip summary: duration + total distance ──────────────────
  const summary = useMemo(() => {
    if (path.length === 0) return { duration: "-", distance: "0 Km", km: 0 };

    let km = 0;
    for (let i = 1; i < path.length; i++) km += haversine(path[i - 1], path[i]);

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
  }, [path, activeLocations]);

  // ─── Classify each timeline point ─────────────────────────────
  const pointType = useCallback(
    (i) => {
      if (i === 0) return "start";
      if (i === path.length - 1) return "end";
      const moved = haversine(path[i - 1], path[i]); // km
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
    if (mapRef.current && path.length > 0) fitToPath(mapRef.current, path);
  }, [path, fitToPath]);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (path.length > 0) fitToPath(map, path);
    },
    [path, fitToPath],
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
        if (path.length > 0) fitToPath(mapRef.current, path);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [path, fitToPath]);

  // ─── Interpolate position + label from a 0..1 progress value ──
  const computeFromProgress = useCallback(
    (t) => {
      if (path.length === 0) return null;
      if (path.length === 1) {
        return {
          pos: { lat: path[0].lat, lng: path[0].lng },
          label: path[0].timestamp,
          nearIndex: 0,
        };
      }

      const segCount = path.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const a = path[segIndex];
      const b = path[segIndex + 1];

      const lat = a.lat + (b.lat - a.lat) * segT;
      const lng = a.lng + (b.lng - a.lng) * segT;
      const nearIndex = segT < 0.5 ? segIndex : segIndex + 1;

      return {
        pos: { lat, lng },
        label: path[nearIndex].timestamp,
        nearIndex,
      };
    },
    [path],
  );

  // ─── Build the polyline coords drawn so far (start → current) ─
  const getDrawnPath = useCallback(
    (t) => {
      if (path.length < 2) return [];
      const segCount = path.length - 1;
      const scaled = Math.min(Math.max(t, 0), 1) * segCount;
      const segIndex = Math.min(Math.floor(scaled), segCount - 1);
      const segT = scaled - segIndex;

      const drawn = path.slice(0, segIndex + 1).map((p) => ({
        lat: p.lat,
        lng: p.lng,
      }));

      const a = path[segIndex];
      const b = path[segIndex + 1];
      drawn.push({
        lat: a.lat + (b.lat - a.lat) * segT,
        lng: a.lng + (b.lng - a.lng) * segT,
      });
      return drawn;
    },
    [path],
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
    if (path.length < 2) return;
    const id = setInterval(() => {
      setAntOffset((o) => (o + 4) % 140);
    }, 60);
    return () => clearInterval(id);
  }, [path.length]);

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
    if (path.length < 2) return;
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
    if (mapRef.current && path.length) fitToPath(mapRef.current, path);
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
    if (mapRef.current) fitToPath(mapRef.current, path);
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
    if (mapRef.current) fitToPath(mapRef.current, path);
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
    isPlaying || progress > 0 ? getDrawnPath(progress) : path;

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
            center={path.length ? path[0] : indiaCenter}
            onLoad={onMapLoad}
            options={mapOptions}
          >
            {/* Faint full-route track, always visible underneath
                (Normal / Both — the Road-only dotted line below replaces
                this entirely rather than layering under it) */}
            {path.length > 1 && dataMode !== DATA_MODES.ROAD && (
              <Polyline
                path={path}
                options={{
                  strokeColor: COLORS.route,
                  strokeOpacity: 0.22,
                  strokeWeight: 4,
                }}
              />
            )}

            {/* Travelled / full route line with continuous marching-ant
                arrows (Normal / Both) */}
            {path.length > 1 && dataMode !== DATA_MODES.ROAD && (
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
                mode — `path` itself is already on road coordinates here) */}
            {path.length > 1 && dataMode === DATA_MODES.ROAD && (
              <Polyline
                path={path}
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

            {/* Start marker (green) with radar ping ring */}
            {path.length > 0 && (
              <>
                <OverlayView
                  position={path[0]}
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
                  position={path[0]}
                  zIndex={10}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: COLORS.start,
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: "#ffffff",
                  }}
                  onClick={() => handleMarkerClick(path[0], 0)}
                />
              </>
            )}

            {/* End marker (red) */}
            {path.length > 1 && (
              <Marker
                position={path[path.length - 1]}
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
                  handleMarkerClick(path[path.length - 1], path.length - 1)
                }
              />
            )}

            {/* Form-submission markers — every point (except start/end, which
                already carry their own marker above) that has a filled form
                gets its own document-pin marker. Clicking it pans/zooms in
                AND opens the form details modal (handleMarkerClick does both). */}
            {path.map(
              (p, i) =>
                p.formSubmission &&
                i !== 0 &&
                i !== path.length - 1 && (
                  <Marker
                    key={`form-marker-${i}`}
                    position={{ lat: p.lat, lng: p.lng }}
                    zIndex={11}
                    icon={buildFormMarkerIcon()}
                    onClick={() => handleMarkerClick(p, i)}
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
              both overlaid together) build the path shown below.
              Centered horizontally so it doesn't collide with either the
              start of the map or the Refresh/Full-view controls. ────────── */}
          {path.length > 0 && (
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
            {path.length > 1 && (isPlaying || progress > 0) && (
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

          {/* ── Playback controls — vertical panel, left side of the map. ── */}
          {path.length > 1 && (
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
                {path.length > 1 &&
                  path.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        bottom: `${(i / (path.length - 1)) * 100}%`,
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
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {/* ── Filters ── */}
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

          {/* Header */}
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
              Timeline ({path.length})
              {isLive && isViewingToday && (
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
              {loadingLocations && (
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

          {/* Trip summary */}
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
                style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}
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
                style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}
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
                style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}
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

          {/* Zigzag timeline */}
          <div
            className="ucma-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "14px 6px",
            }}
          >
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
                      justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
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
                        <span style={{ fontSize: "10px", color: "#64748b" }}>
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
                      gridTemplateColumns: "minmax(0,1fr) 32px minmax(0,1fr)",
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
                        {cfg.icon ? <i className={cfg.icon}></i> : cfg.letter}
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