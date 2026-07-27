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
import { Input } from "reactstrap";
import Select from "react-select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Api } from "../../common/api/Api";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./LocationWebSocket/WebSocket";
import "../../common/css/lc_style.css";

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

// Distance below which two consecutive points count as "waiting" (km)
const WAIT_THRESHOLD_KM = 0.05;

// ISO (YYYY-MM-DD) format used throughout for the date filter's internal value
const ISO_DATE_FORMAT = "YYYY-MM-DD";

// ── Timeline panel sizing (responsive instead of a fixed px width) ──
// clamp(min, preferred, max): scales continuously with viewport width
// instead of jumping straight to the max at a fixed breakpoint, so wide
// screens actually get visibly more room instead of stalling at 420px.
const TIMELINE_WIDTH_CLAMP = "clamp(300px, 26vw, 640px)";

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

// Original palette — unchanged
const COLORS = {
  start: "#28a745",
  end: "#dc3545",
  waiting: "#f97316",
  travel: "#2563eb",
  route: "#1a73e8",
  moving: "#ff9800",
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
       to whatever is underneath (e.g. the native Map/Satellite toggle) —
       only the actual controls themselves are clickable. */
    .ucma-playback-panel {
      pointer-events: none;
    }
    .ucma-playback-panel > * {
      pointer-events: auto;
    }
    @media (max-width: 480px), (max-height: 480px) {
      .ucma-playback-panel {
        left: 10px !important;
        top: 64px !important;
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
  }, []);

  // ─── Reset filters whenever a new employee list is handed in (modal reopened) ──
  useEffect(() => {
    setDeptFilter("All");
    setSelectedEmpId(initialEmpId ?? null);
    setLocationCache({});
  }, [employees, initialEmpId]);

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

  // ─── Default the date filter whenever the selected employee changes:
  //     prefer `initialDate` (the row the user clicked "View" on), falling
  //     back to today. The user can still pick any other date from the
  //     picker afterwards — every date is fetched on demand, so there's no
  //     need to pre-know which dates have data. ──────────────────────────
  useEffect(() => {
    if (!selectedEmpId) {
      setDateFilter("");
      return;
    }
    setDateFilter(initialDate || todayIsoIN());
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
      ? {
          lat: parseFloat(liveLocation.latitude) || 0,
          lng: parseFloat(liveLocation.longitude) || 0,
        }
      : null;

  // ─── Build path + timeline data (from the active employee's route) ────
  useEffect(() => {
    if (Array.isArray(activeLocations) && activeLocations.length > 0) {
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

        let cleanedAddress = "";
        if (loc?.accurate_address) {
          const parts = loc.accurate_address.split(",");
          if (parts.length > 1 && parts[0].trim().match(/^[A-Z0-9+]+$/)) {
            cleanedAddress = parts.slice(1).join(",").trim();
          } else {
            cleanedAddress = loc.accurate_address.trim();
          }
        }

        return {
          index: index + 1,
          name: activeEmployee?.first_name || "",
          lat: parseFloat(loc?.latitude) || 0,
          lng: parseFloat(loc?.longitude) || 0,
          address: cleanedAddress,
          timestamp: indianTime,
          date: indianDate,
          battery: loc?.battery_percentage,
          outside: loc?.is_outside_range,
          profile_url: activeEmployee?.profile_url,
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
  }, [activeLocations, activeEmployee]);

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

  // ─── Timeline / marker click → pan + open info window + expand ─
  const handleTimelineClick = (p, i) => {
    setIsPlaying(false);
    setActiveIndex(i);
    setExpandedIndex((cur) => (cur === i ? null : i));
    setSelectedMarker({ lat: p.lat, lng: p.lng, count: 1, users: [p] });
    if (mapRef.current) {
      mapRef.current.panTo({ lat: p.lat, lng: p.lng });
      mapRef.current.setZoom(16);
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

  // ─── Date picker helpers ────────────────────────────────────────
  const datePickerValue = dateFilter
    ? dayjs(dateFilter, ISO_DATE_FORMAT)
    : null;

  const handleDatePickerChange = (date) => {
    // Use the dayjs object and re-format to ISO ourselves — the second
    // arg antd gives us is formatted per the display `format` prop
    // ("DD MMM YYYY"), which is NOT what dateFilter uses internally
    // (ISO "YYYY-MM-DD"). Storing the display string here was producing
    // "Invalid Date" (shown as NaN) and breaking the fetch/cache key.
    // null when cleared → falls back to no date selected.
    setDateFilter(date ? date.format(ISO_DATE_FORMAT) : "");
  };

  // Only future dates are blocked. Past dates that happen to have no
  // location history for this employee are still selectable — they just
  // render an empty timeline/"no data" state instead of being dead ends.
  const disabledDate = (current) => {
    if (!current) return false;
    return current.format(ISO_DATE_FORMAT) > todayIsoIN();
  };

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
            options={{
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: true,
              rotateControl: true,
            }}
          >
            {/* Faint full-route track, always visible underneath */}
            {path.length > 1 && (
              <Polyline
                path={path}
                options={{
                  strokeColor: COLORS.route,
                  strokeOpacity: 0.22,
                  strokeWeight: 4,
                }}
              />
            )}

            {/* Travelled / full route line with continuous marching-ant arrows */}
            {path.length > 1 && (
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
                  onClick={() => handleTimelineClick(path[0], 0)}
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
                  handleTimelineClick(path[path.length - 1], path.length - 1)
                }
              />
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
                          address: liveLocation?.accurate_address || "",
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

          {/* ── Map overlay controls, top-left: Refresh + Full view ──
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
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                title="Fit whole route in view"
              >
                Full view
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

          {/* ── Playback controls — vertical panel, left side of the map:
              vertical duration/progress line on top, play/resume button,
              reset, then the speed limit buttons (0.5x/1x/1.5x/2x) stacked
              below, all in one column. ── */}
          {path.length > 1 && (
            <div
              className="ucma-playback-panel"
              style={{
                position: "absolute",
                left: "20px",
                top: "68px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                zIndex: 5,
                // no card background — each control floats on its own
              }}
            >
              {/* Vertical duration line with per-stop tick marks —
                  a slim glowing rail so it stays visible over any map color,
                  no boxed background around it. */}
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
                {/* Rotated range input — custom thumb via .ucma-vslider (see injected CSS),
                    track itself stays transparent so only our own rail shows. */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={progress}
                  onChange={handleScrub}
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

              {/* Play / Resume toggle — floats directly on the map, own shadow */}
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

              {/* Reset */}
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

              {/* Speed selector — 0.5x / 1x / 1.5x / 2x, stacked chips, default 1x */}
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

        {/* ── TIMELINE (right) — now a responsive % width (clamped) instead of a
            fixed 340px, so it scales with the actual screen width. Filters
            right-aligned above it, then zigzag spine. ── */}
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
          {/* ── Filters: Department / Employee / Date — directly above the timeline ── */}
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

            {/* Date filter — real calendar picker. Any past date (or today)
                is selectable; picking a date with no history for this
                employee simply renders an empty timeline instead of being
                blocked, and triggers an on-demand fetch for that date. */}
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

          {/* Header — Full view / Refresh removed from here, now live as map overlay controls */}
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

          {/* Zigzag timeline: central spine, alternating left/right cards. */}
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
              {/* Base spine (grey) — spans full content height */}
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
              {/* Progress spine (blue fill up to active point) */}
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
                    {typeof p.battery === "number" && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        🔋 {p.battery}%
                      </div>
                    )}
                    {p.outside && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "3px",
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
                    {/* left slot */}
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

                    {/* spine dot */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <motion.div
                        onClick={() => handleTimelineClick(p, i)}
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

                    {/* right slot */}
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
    </div>
  );
};

export default UsersClusterMapAll;
