import React, { useState, useMemo } from "react";
import { MapShell, MapSkeleton } from "../skeleton/Skeleton";
import { Table } from "../../../shared/ui/table/RsuiteCompatTable";
import { Modal } from "reactstrap";
import { format, parseISO } from "date-fns";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useMapThemeStyles } from "../../../shared/theme/mapStyles";
import { Link } from "react-router-dom";
import "./customStatusTimeline.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const { Cell } = Table;

/* ─── Helpers ─────────────────────────────── */
const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  try {
    return format(parseISO(isoString), "dd MMM yyyy, hh:mm:ss a");
  } catch {
    return isoString;
  }
};

const formatTime = (isoString) => {
  if (!isoString) return "—";
  try {
    return format(parseISO(isoString), "hh:mm:ss a");
  } catch {
    return isoString;
  }
};

const formatDay = (isoString) => {
  if (!isoString) return "";
  try {
    return format(parseISO(isoString), "dd MMM yyyy");
  } catch {
    return "";
  }
};

const prettifyName = (name = "") =>
  name.includes("_")
    ? name
        .split("_")
        .filter(Boolean)
        .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(" ")
    : name;

const TONES = ["primary", "success", "info", "danger", "secondary"];

const toneForStatus = (name = "", index = 0) => {
  const lower = name.toLowerCase();
  if (lower.includes("break")) return "warning";
  return TONES[index % TONES.length];
};

const toneVar = (tone) => ({ "--t": `var(--vz-${tone})` });

/* ─── Location Tag ────────────────────────── */
const LocationTag = ({ location, label, onMapClick, testId: tagTestId }) => {
  const hasCoords =
    location && location.latitude != null && location.longitude != null;
  if (!hasCoords) {
    return (
      <span className="cstl-loc is-empty">
        <i className="ri-map-pin-line" />
        No location
      </span>
    );
  }
  return (
    <button
      data-testid={tagTestId}
      type="button"
      className="cstl-loc"
      onClick={() => onMapClick(location, label)}
      title={`View ${label.toLowerCase()} location on map`}
    >
      <i className="ri-map-pin-2-fill" />
      <span className="text-truncate">
        {location.name ||
          location.accurate_address ||
          `${parseFloat(location.latitude).toFixed(5)}, ${parseFloat(location.longitude).toFixed(5)}`}
      </span>
      <i className="ri-arrow-right-up-line cstl-loc-go" />
    </button>
  );
};

/* ─── Map Modal ───────────────────────────── */
const LocationMapModal = ({ isOpen, toggle, locationData, label }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: ["places"],
  });
  const [infoOpen, setInfoOpen] = useState(true);
  const [tilesReady, setTilesReady] = useState(false);
  const mapStyles = useMapThemeStyles();
  const lat = locationData ? parseFloat(locationData.latitude) : 0;
  const lng = locationData ? parseFloat(locationData.longitude) : 0;
  const center = { lat, lng };
  const placeName = locationData?.name || locationData?.accurate_address;

  return (
    <Modal
      data-testid="status-timeline-location-dialog"
      isOpen={isOpen}
      toggle={toggle}
      centered
      size="lg"
      zIndex={1060}
      contentClassName="cstl-content"
    >
      <div className="cstl-head">
        <span className="cstl-head-icon">
          <i className="ri-map-pin-2-line" />
        </span>
        <div className="flex-grow-1 min-w-0">
          <h5 className="cstl-title">{label} location</h5>
          {placeName && <div className="cstl-sub text-truncate">{placeName}</div>}
        </div>
        <button data-testid="status-timeline-location-close-button" type="button" className="cstl-close" onClick={toggle} aria-label="Close">
          <i className="ri-close-line" />
        </button>
      </div>

      <div className="cstl-body">
        <div className="cstl-coords">
          <span className="cstl-coord">
            <i className="ri-compass-3-line" />
            Lat <b>{lat.toFixed(6)}</b>
          </span>
          <span className="cstl-coord">
            <i className="ri-compass-3-line" />
            Lng <b>{lng.toFixed(6)}</b>
          </span>
          {locationData?.accuracy != null && (
            <span className="cstl-coord is-warn">
              <i className="ri-focus-3-line" />
              Accuracy <b>{locationData.accuracy}m</b>
            </span>
          )}
        </div>

        <div className="cstl-map">
          {isLoaded ? (
            <MapShell ready={tilesReady}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={center}
              zoom={17}
              onTilesLoaded={() => setTilesReady(true)}
              options={{ gestureHandling: "greedy", styles: mapStyles }}
            >
              <Marker
                position={center}
                title={placeName || label}
                onClick={() => setInfoOpen(true)}
              />
              {infoOpen && (
                <InfoWindow position={center} onCloseClick={() => setInfoOpen(false)}>
                  <div style={{ fontSize: "12px", minWidth: "120px", color: "#333" }}>
                    <b>{label}</b>
                    {placeName && <div style={{ maxWidth: 200 }}>{placeName}</div>}
                    <div style={{ color: "#888", marginTop: "2px" }}>
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
            </MapShell>
          ) : (
            <MapSkeleton style={{ minHeight: 220 }} />
          )}
        </div>
      </div>
    </Modal>
  );
};

/* ─── Start / End Notes Block ─────────────── */
// Falls back to the old single `notes` field for older API responses.
const NotesBlock = ({ startNotes, endNotes, legacyNotes }) => {
  const entries = [];

  if (startNotes && String(startNotes).trim()) {
    entries.push({ type: "start", text: String(startNotes).trim(), label: "Start note", icon: "ri-play-circle-line" });
  }
  if (endNotes && String(endNotes).trim()) {
    entries.push({ type: "end", text: String(endNotes).trim(), label: "End note", icon: "ri-stop-circle-line" });
  }

  if (entries.length === 0 && legacyNotes) {
    const noteList = Array.isArray(legacyNotes) ? legacyNotes : [legacyNotes];
    noteList.filter(Boolean).forEach((note, i) => {
      const isObj = typeof note === "object" && note !== null;
      entries.push({
        type: "legacy",
        key: i,
        text: isObj
          ? note.text || note.note || note.content || JSON.stringify(note)
          : String(note),
        author: isObj ? note.author || note.created_by || null : null,
        time: isObj ? note.created_at || note.timestamp || null : null,
        label: "Note",
        icon: "ri-sticky-note-line",
      });
    });
  }

  if (entries.length === 0) return null;

  return (
    <div className={`cstl-notes ${entries.length > 1 ? "is-pair" : ""}`}>
      {entries.map((entry) => (
        <div key={entry.key ?? entry.type} className={`cstl-note is-${entry.type}`}>
          <span className="cstl-note-label">
            <i className={entry.icon} />
            {entry.label}
          </span>
          <div className="cstl-note-text">{entry.text}</div>
          {(entry.author || entry.time) && (
            <div className="cstl-note-meta">
              {entry.author && (
                <span>
                  <i className="ri-user-line" />
                  {entry.author}
                </span>
              )}
              {entry.time && (
                <span>
                  <i className="ri-time-line" />
                  {formatDateTime(entry.time)}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Timeline Modal ──────────────────────── */
const CustomStatusTimelineModal = ({ isOpen, toggle, rowData }) => {
  const timeline = useMemo(
    () => rowData?.custom_status_timeline || [],
    [rowData],
  );
  const dateLabel = rowData?.date
    ? format(new Date(rowData.date), "EEEE, dd MMM yyyy")
    : "";

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const statusMeta = useMemo(() => {
    const map = new Map();
    timeline.forEach((item) => {
      const id = item.status?.id;
      const name = item.status?.name || "Unknown";
      if (id != null && !map.has(String(id))) {
        map.set(String(id), {
          id,
          name,
          icon: item.status?.icon,
          tone: toneForStatus(name, map.size),
          count: 0,
        });
      }
      if (id != null) map.get(String(id)).count += 1;
    });
    return map;
  }, [timeline]);

  const toneByName = useMemo(() => {
    const byName = {};
    statusMeta.forEach((meta) => {
      byName[meta.name] = meta.tone;
    });
    return byName;
  }, [statusMeta]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timeline.filter((item) => {
      const matchTab =
        activeTab === "All" || String(item.status?.id) === activeTab;
      const matchSearch =
        !q ||
        (item.status?.name || "").toLowerCase().includes(q) ||
        String(item.status?.id || "").includes(q);
      return matchTab && matchSearch;
    });
  }, [timeline, activeTab, search]);

  const totalDuration = filtered.reduce(
    (sum, item) => sum + (item.duration_in_seconds || 0),
    0,
  );
  const longest = filtered.reduce(
    (max, item) => Math.max(max, item.duration_in_seconds || 0),
    0,
  );
  const activeCount = filtered.filter((item) => item.is_active).length;

  const summary = useMemo(() => {
    const raw = rowData?.custom_status_duration_summary || {};
    const rows = Object.entries(raw).map(([name, seconds]) => ({
      name,
      label: prettifyName(name),
      seconds: Number(seconds) || 0,
      tone: toneByName[name] || (name.toLowerCase().includes("break") ? "warning" : "secondary"),
    }));
    const total = rows
      .filter((r) => !r.name.startsWith("total_"))
      .reduce((sum, r) => sum + r.seconds, 0);
    return { rows, total };
  }, [rowData, toneByName]);

  const [mapModal, setMapModal] = useState({
    open: false,
    location: null,
    label: "",
  });
  const openMap = (location, label) =>
    setMapModal({ open: true, location, label });
  const closeMap = () =>
    setMapModal({ open: false, location: null, label: "" });

  const handleToggle = () => {
    setSearch("");
    setActiveTab("All");
    toggle();
  };

  const isFiltered = activeTab !== "All" || search.trim() !== "";

  const stats = [
    { key: "total", icon: "ri-timer-line", tone: "success", label: "Total time", value: formatDuration(totalDuration) },
    { key: "entries", icon: "ri-list-check-2", tone: "primary", label: isFiltered ? "Filtered entries" : "Entries", value: filtered.length },
    { key: "longest", icon: "ri-trophy-line", tone: "warning", label: "Longest session", value: formatDuration(longest) },
    { key: "active", icon: "ri-pulse-line", tone: activeCount ? "danger" : "secondary", label: "Active now", value: activeCount },
  ];

  return (
    <>
      <Modal
        data-testid="status-timeline-dialog"
        isOpen={isOpen}
        toggle={handleToggle}
        centered
        size="lg"
        contentClassName="cstl-content"
      >
        <div className="cstl-head">
          <span className="cstl-head-icon">
            <i className="ri-time-line" />
          </span>
          <div className="flex-grow-1 min-w-0">
            <h5 className="cstl-title">Custom Status Timeline</h5>
            <div className="cstl-sub">
              {dateLabel && (
                <span>
                  <i className="ri-calendar-line" />
                  {dateLabel}
                </span>
              )}
              {timeline.length > 0 && (
                <span>
                  <i className="ri-stack-line" />
                  {statusMeta.size} {statusMeta.size === 1 ? "status" : "statuses"}
                </span>
              )}
            </div>
          </div>
          <button data-testid="status-timeline-close-button" type="button" className="cstl-close" onClick={handleToggle} aria-label="Close">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="cstl-body cstl-scroll">
          {timeline.length === 0 ? (
            <div className="cstl-empty">
              <span className="cstl-empty-icon">
                <i className="ri-history-line" />
              </span>
              <div className="cstl-empty-title">No timeline entries</div>
              <div className="cstl-empty-sub">No custom statuses were used on this day.</div>
            </div>
          ) : (
            <>
              <div className="cstl-stats">
                {stats.map((s) => (
                  <div key={s.key} className="cstl-stat" style={toneVar(s.tone)}>
                    <span className="cstl-stat-icon">
                      <i className={s.icon} />
                    </span>
                    <div className="min-w-0">
                      <div className="cstl-stat-value">{s.value}</div>
                      <div className="cstl-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {summary.rows.length > 0 && (
                <div className="cstl-dist">
                  <div className="cstl-section-label">
                    <i className="ri-bar-chart-horizontal-line" />
                    Time distribution
                  </div>
                  {summary.total > 0 && (
                    <div className="cstl-dist-bar">
                      {summary.rows
                        .filter((r) => r.seconds > 0 && !r.name.startsWith("total_"))
                        .map((r) => (
                          <span
                            key={r.name}
                            style={{ ...toneVar(r.tone), width: `${(r.seconds / summary.total) * 100}%` }}
                            title={`${r.label}: ${formatDuration(r.seconds)}`}
                          />
                        ))}
                    </div>
                  )}
                  <div className="cstl-legend">
                    {summary.rows.map((r) => (
                      <span
                        key={r.name}
                        className={`cstl-legend-item ${r.seconds ? "" : "is-zero"}`}
                        style={toneVar(r.tone)}
                      >
                        <span className="cstl-legend-dot" />
                        <span className="cstl-legend-name">{r.label}</span>
                        <b>{formatDuration(r.seconds)}</b>
                        {summary.total > 0 && r.seconds > 0 && !r.name.startsWith("total_") && (
                          <span className="cstl-legend-pct">
                            {Math.round((r.seconds / summary.total) * 100)}%
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="cstl-toolbar">
                <div className="cstl-search">
                  <i className="ri-search-line" />
                  <input
                    data-testid="status-timeline-search-input"
                    type="text"
                    placeholder="Search by status name or ID…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setActiveTab("All");
                    }}
                  />
                  {search && (
                    <button data-testid="status-timeline-clear-search-button" type="button" onClick={() => setSearch("")} aria-label="Clear search">
                      <i className="ri-close-circle-fill" />
                    </button>
                  )}
                </div>
                {statusMeta.size > 1 && (
                  <div className="cstl-tabs">
                    <button
                      data-testid="status-timeline-all-button"
                      type="button"
                      className={`cstl-tab ${activeTab === "All" ? "is-active" : ""}`}
                      style={toneVar("success")}
                      onClick={() => {
                        setActiveTab("All");
                        setSearch("");
                      }}
                    >
                      All
                      <span className="cstl-tab-count">{timeline.length}</span>
                    </button>
                    {[...statusMeta.entries()].map(([key, meta]) => (
                      <button
                        key={key}
                        data-testid={testId("status-timeline-tab", key)}
                        type="button"
                        className={`cstl-tab ${activeTab === key ? "is-active" : ""}`}
                        style={toneVar(meta.tone)}
                        onClick={() => {
                          setActiveTab(key);
                          setSearch("");
                        }}
                      >
                        {meta.icon && <span className="cstl-tab-emoji">{meta.icon}</span>}
                        {meta.name}
                        <span className="cstl-tab-count">{meta.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="cstl-empty is-small">
                  <span className="cstl-empty-icon">
                    <i className="ri-search-eye-line" />
                  </span>
                  <div className="cstl-empty-title">No matching entries</div>
                  <div className="cstl-empty-sub">Try a different search or filter.</div>
                </div>
              ) : (
                <div className="cstl-list">
                  {filtered.map((item, idx) => {
                    const statusName = item.status?.name || "Unknown";
                    const statusIcon = item.status?.icon || "😐";
                    const tone =
                      statusMeta.get(String(item.status?.id))?.tone ||
                      toneForStatus(statusName, idx);
                    const isActive = item.is_active;
                    const startNotes = item.start_notes ?? null;
                    const endNotes = item.end_notes ?? null;
                    const legacyNotes =
                      !startNotes && !endNotes
                        ? (item.notes ?? item.note ?? item.remarks ?? null)
                        : null;
                    const startDay = formatDay(item.start_time);
                    const endDay = formatDay(item.end_time);

                    return (
                      <div
                        key={idx}
                        className={`cstl-item ${isActive ? "is-active" : ""}`}
                        style={toneVar(tone)}
                      >
                        <div className="cstl-rail">
                          <span className="cstl-bubble">
                            <span role="img" aria-label={statusName}>
                              {statusIcon}
                            </span>
                          </span>
                        </div>

                        <div className="cstl-card">
                          <div className="cstl-card-top">
                            <div className="cstl-card-title-wrap">
                              <span className="cstl-card-title">{statusName}</span>
                              <span className={`cstl-state ${isActive ? "is-live" : ""}`}>
                                {isActive ? (
                                  <>
                                    <span className="cstl-live-dot" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-check-line" />
                                    Completed
                                  </>
                                )}
                              </span>
                              {item.status?.id && (
                                <span className="cstl-id">#{item.status.id}</span>
                              )}
                            </div>
                            <span className="cstl-seq">Entry {idx + 1}</span>
                          </div>

                          <div className="cstl-span">
                            <div className="cstl-point is-start">
                              <span className="cstl-point-label">
                                <i className="ri-play-circle-fill" />
                                Start
                              </span>
                              <span className="cstl-point-time">{formatTime(item.start_time)}</span>
                              {startDay && <span className="cstl-point-day">{startDay}</span>}
                            </div>

                            <div className="cstl-span-mid">
                              <span className="cstl-span-line" />
                              <span className="cstl-duration">
                                <i className="ri-timer-flash-line" />
                                {formatDuration(item.duration_in_seconds)}
                              </span>
                              <span className="cstl-span-line" />
                            </div>

                            <div className="cstl-point is-end">
                              <span className="cstl-point-label">
                                <i className="ri-stop-circle-fill" />
                                End
                              </span>
                              {item.end_time ? (
                                <>
                                  <span className="cstl-point-time">{formatTime(item.end_time)}</span>
                                  {endDay && <span className="cstl-point-day">{endDay}</span>}
                                </>
                              ) : (
                                <span className="cstl-point-time is-live">Still active</span>
                              )}
                            </div>
                          </div>

                          <div className="cstl-locs">
                            <div className="cstl-loc-row">
                              <span className="cstl-loc-label">
                                <i className="ri-map-pin-line" />
                                Start
                              </span>
                              <LocationTag location={item.start_location} label="Start" onMapClick={openMap} testId={testId("status-timeline", itemTestKey(item), "start-location-button")} />
                            </div>
                            <div className="cstl-loc-row">
                              <span className="cstl-loc-label">
                                <i className="ri-map-pin-line" />
                                End
                              </span>
                              <LocationTag location={item.end_location} label="End" onMapClick={openMap} testId={testId("status-timeline", itemTestKey(item), "end-location-button")} />
                            </div>
                          </div>

                          <NotesBlock
                            startNotes={startNotes}
                            endNotes={endNotes}
                            legacyNotes={legacyNotes}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <LocationMapModal
        isOpen={mapModal.open}
        toggle={closeMap}
        locationData={mapModal.location}
        label={mapModal.label}
      />
    </>
  );
};

/* ─── Table Cell ──────────────────────────── */
const CustomStatusTimeline = ({ rowData, dataKey, ...props }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggle = () => setModalOpen((prev) => !prev);

  const timeline = rowData?.custom_status_timeline || [];
  const count = timeline.length;

  if (rowData?.is_present === false) {
    return <Cell {...props}>{null}</Cell>;
  }

  return (
    <Cell {...props}>
      <div>
        {count > 0 ? (
          <Link data-testid="status-timeline-custom-status-link" to="#" className="link-opacity-75 ms-1" onClick={toggle}>
            {count} Custom Status
          </Link>
        ) : (
          "-"
        )}
      </div>

      <CustomStatusTimelineModal
        isOpen={modalOpen}
        toggle={toggle}
        rowData={rowData}
      />
    </Cell>
  );
};

export {
  CustomStatusTimelineModal,
  CustomStatusTimeline,
  LocationMapModal,
  LocationTag,
  NotesBlock,
  formatDuration,
  formatTime,
  formatDay,
  prettifyName,
  toneForStatus,
  toneVar,
};
export default CustomStatusTimeline;
