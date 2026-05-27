import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Spinner,
  Button,
  Badge,
} from "reactstrap";
import { Search } from "react-feather";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { GetApi } from "../../../common/api/GetApi";

// ─────────────────────────────────────────────────────────────────────────────
// Scrollbar CSS
// ─────────────────────────────────────────────────────────────────────────────

const scrollbarCSS = `
  .cst-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .cst-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
  .cst-scroll::-webkit-scrollbar-thumb { background: #c5cff0; border-radius: 10px; }
  .cst-scroll::-webkit-scrollbar-thumb:hover { background: #405189; }
  .cst-scroll { scrollbar-width: thin; scrollbar-color: #c5cff0 #f1f1f1; }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("cst-scrollbar-style")
) {
  const style = document.createElement("style");
  style.id = "cst-scrollbar-style";
  style.textContent = scrollbarCSS;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDuration = (seconds = 0) => {
  if (!seconds || seconds <= 0) return "0m 0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
};

const sanitizeIcon = (icon) => {
  if (!icon || typeof icon !== "string") return "📌";
  const trimmed = icon.trim();
  if (!trimmed || trimmed === "?" || /^\?+$/.test(trimmed)) return "📌";
  return trimmed;
};

const getStatusColor = (statusName = "") => {
  const name = statusName.toLowerCase();
  if (name.includes("break")) return "warning";
  if (name.includes("test")) return "info";
  if (name.includes("work") || name.includes("active")) return "success";
  if (name.includes("idle") || name.includes("away")) return "secondary";
  return "primary";
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

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
  gap: "2px",
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

// ─────────────────────────────────────────────────────────────────────────────
// LocationTag
// ─────────────────────────────────────────────────────────────────────────────

const LocationTag = ({ location, label, onMapClick }) => {
  const hasCoords =
    location && location.latitude != null && location.longitude != null;

  if (!location || !hasCoords) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#f5f5f5",
          color: "#aaa",
          border: "0.5px solid #e0e0e0",
          borderRadius: "5px",
          padding: "2px 8px",
          fontSize: "11px",
          fontStyle: "italic",
        }}
      >
        <i className="mdi mdi-map-marker-off-outline" />
        No Location
      </span>
    );
  }

  const displayText = location.accurate_address
    ? location.accurate_address.substring(0, 28) +
      (location.accurate_address.length > 28 ? "…" : "")
    : `${parseFloat(location.latitude).toFixed(5)}, ${parseFloat(location.longitude).toFixed(5)}`;

  return (
    <button
      onClick={() => onMapClick(location, label)}
      title={`View ${label} location on map`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#eaf3ff",
        color: "#1a6fcf",
        border: "0.5px solid #a8cff5",
        borderRadius: "5px",
        padding: "2px 10px",
        fontSize: "11px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#d0e8ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#eaf3ff")}
    >
      <i className="mdi mdi-map-marker" />
      {displayText}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LocationMapModal
// ─────────────────────────────────────────────────────────────────────────────

const LocationMapModal = ({ isOpen, toggle, locationData, label }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: ["places"],
  });

  const [infoOpen, setInfoOpen] = useState(true);

  const lat = locationData ? parseFloat(locationData.latitude) : 0;
  const lng = locationData ? parseFloat(locationData.longitude) : 0;
  const center = { lat, lng };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg" zIndex={1060}>
      <ModalHeader
        toggle={toggle}
        style={{ fontSize: "14px", fontWeight: 600 }}
      >
        <i className="mdi mdi-map-marker me-2 text-danger" />
        {label} Location
        {locationData?.accurate_address && (
          <span
            style={{
              fontSize: "12px",
              color: "#888",
              fontWeight: 400,
              marginLeft: "8px",
            }}
          >
            — {locationData.accurate_address.substring(0, 40)}
            {locationData.accurate_address.length > 40 ? "…" : ""}
          </span>
        )}
      </ModalHeader>
      <ModalBody>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          <div style={coordPill}>
            <i className="mdi mdi-latitude me-1" />
            Lat: <b>{lat.toFixed(6)}</b>
          </div>
          <div style={coordPill}>
            <i className="mdi mdi-longitude me-1" />
            Lng: <b>{lng.toFixed(6)}</b>
          </div>
          {locationData?.accuracy != null && (
            <div
              style={{
                ...coordPill,
                background: "#fff8e1",
                color: "#b07d00",
                borderColor: "#f0d070",
              }}
            >
              <i className="mdi mdi-crosshairs-gps me-1" />
              Accuracy: <b>{locationData.accuracy}m</b>
            </div>
          )}
        </div>

        {locationData?.accurate_address && (
          <div
            style={{
              background: "#f8f9fc",
              border: "0.5px solid #e2e5ee",
              borderRadius: "7px",
              padding: "7px 12px",
              fontSize: "12px",
              color: "#444",
              marginBottom: "14px",
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
            }}
          >
            <i
              className="mdi mdi-map-marker-outline text-danger"
              style={{ marginTop: "1px", flexShrink: 0 }}
            />
            <span style={{ lineHeight: 1.5 }}>
              {locationData.accurate_address}
            </span>
          </div>
        )}

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "340px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            center={center}
            zoom={17}
            options={{ gestureHandling: "greedy" }}
          >
            <Marker
              position={center}
              title={label}
              onClick={() => setInfoOpen(true)}
            />
            {infoOpen && (
              <InfoWindow
                position={center}
                onCloseClick={() => setInfoOpen(false)}
              >
                <div style={{ fontSize: "12px", minWidth: "120px" }}>
                  <b>{label}</b>
                  {locationData?.accurate_address && (
                    <div
                      style={{
                        color: "#555",
                        marginTop: "2px",
                        maxWidth: "200px",
                      }}
                    >
                      {locationData.accurate_address}
                    </div>
                  )}
                  <div style={{ color: "#888", marginTop: "2px" }}>
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div
            style={{
              height: "340px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
            }}
          >
            Loading map…
          </div>
        )}

        <div className="d-flex justify-content-center mt-3">
          <Button
            color="warning"
            onClick={toggle}
            style={{ minWidth: "100px" }}
          >
            Close
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NotesPair — renders start_notes and end_notes as separate labelled blocks
// ─────────────────────────────────────────────────────────────────────────────

const NotesPair = ({ startNotes, endNotes }) => {
  const hasStart = startNotes && String(startNotes).trim() !== "";
  const hasEnd = endNotes && String(endNotes).trim() !== "";

  if (!hasStart && !hasEnd) return null;

  const NoteItem = ({ text, type }) => {
    const isStart = type === "start";
    return (
      <div
        style={{
          background: isStart ? "#f0fbf5" : "#fff5f5",
          border: `0.5px solid ${isStart ? "#b3dfc9" : "#f5c6c6"}`,
          borderLeft: `3px solid ${isStart ? "#28a745" : "#dc3545"}`,
          borderRadius: "5px",
          padding: "7px 10px",
          fontSize: "12px",
          color: isStart ? "#1a4731" : "#5c1a1a",
          lineHeight: "1.5",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <i
            className={`mdi ${isStart ? "mdi-arrow-right-circle-outline" : "mdi-stop-circle-outline"}`}
            style={{ color: isStart ? "#28a745" : "#dc3545", fontSize: "13px" }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: isStart ? "#28a745" : "#dc3545",
            }}
          >
            {isStart ? "Start Notes" : "End Notes"}
          </span>
        </div>
        {/* Note text */}
        <div style={{ wordBreak: "break-word" }}>{String(text)}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        borderTop: "0.5px solid #f0f0f0",
        paddingTop: "8px",
        marginTop: "8px",
      }}
    >
      {/* Section header */}
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
        <i className="mdi mdi-note-text-outline" />
        Notes
      </div>

      {/* Side-by-side when both present, single column otherwise */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {hasStart && <NoteItem text={startNotes} type="start" />}
        {hasEnd && <NoteItem text={endNotes} type="end" />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TimelineModal
// ─────────────────────────────────────────────────────────────────────────────

const TimelineModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [timelineData, setTimelineData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uniqueTabs, setUniqueTabs] = useState(["All"]);
  const [filtered, setFiltered] = useState([]);

  const [mapModal, setMapModal] = useState({
    open: false,
    location: null,
    label: "",
  });
  const openMap = (location, label) =>
    setMapModal({ open: true, location, label });
  const closeMap = () =>
    setMapModal({ open: false, location: null, label: "" });

  useEffect(() => {
    if (show) {
      setSearch("");
      setActiveTab("All");
      fetchTimeline();
    }
  }, [show]);

  useEffect(() => {
    setUniqueTabs(["All", ...new Set(timelineData.map((i) => i.type))]);
  }, [timelineData]);

  useEffect(() => {
    const f = timelineData.filter(
      (item) =>
        (activeTab === "All" || item.type === activeTab) &&
        item.title.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(f);
  }, [timelineData, activeTab, search]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await GetApi("attendance/custom-statuses/timeline/");
      if (res?.status === 200) {
        const raw = res?.data?.data || [];
        const formatted = raw.map((item, index) => {
          const start = new Date(item.start_time);
          const end = item.end_time ? new Date(item.end_time) : null;
          const fmtTime = (d) =>
            d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const fmtDate = (d) =>
            d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

          return {
            id: `${item?.status?.id ?? index}-${index}`,
            type: item?.status?.name || "Unknown",
            title: item?.status?.name || "Unknown",
            icon: sanitizeIcon(item?.status?.icon),
            statusId: item?.status?.id || null,
            startTime: item.start_time || null,
            endTime: item.end_time || null,
            timeDisplay: `${fmtTime(start)} – ${end ? fmtTime(end) : "Now"} | ${fmtDate(start)}`,
            duration: item.duration_in_seconds ?? 0,
            // ── notes: map start_notes and end_notes separately ──
            start_notes: item.start_notes ?? null,
            end_notes: item.end_notes ?? null,
            start_location: item.start_location || null,
            end_location: item.end_location || null,
            is_active: item.is_active ?? false,
          };
        });
        setTimelineData(formatted.reverse());
      } else {
        setTimelineData([]);
      }
    } catch (err) {
      console.error("Timeline error:", err);
      setTimelineData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalDuration = filtered.reduce(
    (sum, item) => sum + (item.duration || 0),
    0,
  );

  return (
    <>
      <Modal isOpen={show} toggle={onClose} size="lg" centered>
        <ModalHeader toggle={onClose}>
          <span style={{ fontSize: "15px", fontWeight: 500 }}>
            Today Activity Timeline
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
          {/* Search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.4,
              }}
            />
            <Input
              placeholder="Search status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "32px",
                background: "#f5f5f5",
                border: "0.5px solid #ddd",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "16px",
            }}
          >
            {uniqueTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "0.5px solid",
                  transition: "all 0.15s",
                  background: activeTab === tab ? "#405189" : "#f5f5f5",
                  color: activeTab === tab ? "#fff" : "#666",
                  borderColor: activeTab === tab ? "#405189" : "#ccc",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Summary strip */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#f0f4ff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  color: "#405189",
                  fontWeight: 500,
                  border: "0.5px solid #c5cff0",
                }}
              >
                <i className="mdi mdi-clock-outline me-1" />
                Total Duration: <b>{formatDuration(totalDuration)}</b>
              </div>
              <div
                style={{
                  background: "#f0faf4",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  color: "#0a7b5e",
                  fontWeight: 500,
                  border: "0.5px solid #b3dfc9",
                }}
              >
                <i className="mdi mdi-format-list-numbered me-1" />
                Total Entries: <b>{filtered.length}</b>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spinner size="sm" />
            </div>
          ) : filtered.length === 0 ? (
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
                className="mdi mdi-timeline-clock-outline"
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "12px",
                }}
              />
              <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>
                {timelineData.length === 0
                  ? "No activity recorded today."
                  : "No results match your search."}
              </p>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: "19px",
                  top: "8px",
                  bottom: "8px",
                  width: "2px",
                  background: "#e4e6ee",
                  zIndex: 0,
                }}
              />

              {filtered.map((item, idx) => {
                const badgeColor = getStatusColor(item.type);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      marginBottom: idx < filtered.length - 1 ? "20px" : "0",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {/* Icon bubble */}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: item.is_active ? "#405189" : "#f4f5f8",
                        border: `2px solid ${item.is_active ? "#405189" : "#dce0ef"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                        boxShadow: "0 0 0 3px #fff",
                      }}
                    >
                      {item.icon?.startsWith("http") ? (
                        <img
                          src={item.icon}
                          alt={item.title}
                          style={{
                            width: 20,
                            height: 20,
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <span role="img" aria-label={item.title}>
                          {item.icon}
                        </span>
                      )}
                    </div>

                    {/* Card */}
                    <div
                      style={{
                        flex: 1,
                        background: "#fff",
                        border: "0.5px solid #e2e5ee",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Top row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              color: "#222",
                            }}
                          >
                            {item.title}
                          </span>
                          <Badge
                            color={badgeColor}
                            pill
                            style={{ fontSize: "11px" }}
                          >
                            {item.is_active ? "Active" : "Completed"}
                          </Badge>
                          {item.statusId && (
                            <Badge
                              color="light"
                              style={{
                                fontSize: "11px",
                                color: "#666",
                                border: "0.5px solid #ddd",
                              }}
                            >
                              ID #{item.statusId}
                            </Badge>
                          )}
                        </div>
                        <div
                          style={{
                            background: "#f0f4ff",
                            color: "#405189",
                            borderRadius: "6px",
                            padding: "3px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "0.5px solid #c5cff0",
                          }}
                        >
                          <i className="mdi mdi-timer-outline me-1" />
                          {formatDuration(item.duration)}
                        </div>
                      </div>

                      {/* Time grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={timeBox}>
                          <div style={timeBoxLabel}>
                            <i className="mdi mdi-arrow-right-circle-outline me-1 text-success" />
                            Start Time
                          </div>
                          <div style={timeBoxValue}>
                            {formatDateTime(item.startTime)}
                          </div>
                        </div>
                        <div style={timeBox}>
                          <div style={timeBoxLabel}>
                            <i className="mdi mdi-arrow-left-circle-outline me-1 text-danger" />
                            End Time
                          </div>
                          <div style={timeBoxValue}>
                            {item.endTime ? (
                              formatDateTime(item.endTime)
                            ) : (
                              <span
                                style={{
                                  color: "#28a745",
                                  fontStyle: "italic",
                                }}
                              >
                                Still Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location row */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          borderTop: "0.5px solid #f0f0f0",
                          paddingTop: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#999",
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                            marginRight: "2px",
                          }}
                        >
                          <i className="mdi mdi-map-marker-outline me-1" />
                          Location:
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#555" }}>
                            Start —
                          </span>
                          <LocationTag
                            location={item.start_location}
                            label="Start"
                            onMapClick={openMap}
                          />
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#555",
                              marginLeft: "4px",
                            }}
                          >
                            End —
                          </span>
                          <LocationTag
                            location={item.end_location}
                            label="End"
                            onMapClick={openMap}
                          />
                        </div>
                      </div>

                      {/* ── Start & End Notes ── */}
                      <NotesPair
                        startNotes={item.start_notes}
                        endNotes={item.end_notes}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Button
              color="warning"
              onClick={onClose}
              style={{ minWidth: "100px" }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
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

export default TimelineModal;
