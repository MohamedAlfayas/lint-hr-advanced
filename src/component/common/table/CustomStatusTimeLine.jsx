import React, { useState, useMemo } from "react";
import { Table } from "rsuite";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Button,
  Input,
} from "reactstrap";
import { format, parseISO } from "date-fns";
import { Search } from "react-feather";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Link } from "react-router-dom";

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

const getStatusColor = (statusName = "") => {
  const name = statusName.toLowerCase();
  if (name.includes("break")) return "warning";
  if (name.includes("test")) return "info";
  if (name.includes("work") || name.includes("active")) return "success";
  if (name.includes("idle") || name.includes("away")) return "secondary";
  return "primary";
};

/* ─── Scrollbar styles (injected once) ───── */
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

/* ─── Shared style objects ────────────────── */
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
const timeBoxValue = { fontSize: "13px", color: "#333", fontWeight: 500 };

/* ─── Location Tag ────────────────────────── */
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
      {location.name ||
        `${parseFloat(location.latitude).toFixed(5)}, ${parseFloat(location.longitude).toFixed(5)}`}
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
        {locationData?.name && (
          <span
            style={{
              fontSize: "12px",
              color: "#888",
              fontWeight: 400,
              marginLeft: "8px",
            }}
          >
            — {locationData.name}
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
              title={locationData?.name || label}
              onClick={() => setInfoOpen(true)}
            />
            {infoOpen && (
              <InfoWindow
                position={center}
                onCloseClick={() => setInfoOpen(false)}
              >
                <div style={{ fontSize: "12px", minWidth: "120px" }}>
                  <b>{label}</b>
                  {locationData?.name && (
                    <div style={{ color: "#555" }}>{locationData.name}</div>
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

/* ─── Notes Block ─────────────────────────── */
const NotesBlock = ({ notes }) => {
  if (!notes || (Array.isArray(notes) && notes.length === 0)) return null;
  const noteList = Array.isArray(notes) ? notes : [notes];
  return (
    <div
      style={{
        borderTop: "0.5px solid #f0f0f0",
        paddingTop: "8px",
        marginTop: "8px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <i className="mdi mdi-note-text-outline" />
        Notes
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {noteList.map((note, i) => {
          const isObj = typeof note === "object" && note !== null;
          const text = isObj
            ? note.text || note.note || note.content || JSON.stringify(note)
            : String(note);
          const author = isObj ? note.author || note.created_by || null : null;
          const time = isObj ? note.created_at || note.timestamp || null : null;
          return (
            <div
              key={i}
              style={{
                background: "#fffbf0",
                border: "0.5px solid #f5e6c0",
                borderLeft: "3px solid #f0b429",
                borderRadius: "5px",
                padding: "7px 10px",
                fontSize: "12px",
                color: "#4a3f00",
                lineHeight: "1.5",
              }}
            >
              <div>{text}</div>
              {(author || time) && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  {author && (
                    <span style={{ fontSize: "10px", color: "#888" }}>
                      <i className="mdi mdi-account-outline me-1" />
                      {author}
                    </span>
                  )}
                  {time && (
                    <span style={{ fontSize: "10px", color: "#888" }}>
                      <i className="mdi mdi-clock-outline me-1" />
                      {formatDateTime(time)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Timeline Modal ──────────────────────── */
const CustomStatusTimelineModal = ({ isOpen, toggle, rowData }) => {
  const timeline = rowData?.custom_status_timeline || [];
  const dateLabel = rowData?.date
    ? format(new Date(rowData.date), "dd MMM, yyyy")
    : "";

  /* ── Filter & Search state ── */
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  /* Build unique tabs: "All" + one tab per unique status id */
  const uniqueTabs = useMemo(() => {
    const seen = new Map(); // id → name
    timeline.forEach((item) => {
      const id = item.status?.id;
      const name = item.status?.name || "Unknown";
      if (id != null && !seen.has(id)) seen.set(id, name);
    });
    const tabs = [{ key: "All", label: "All" }];
    seen.forEach((name, id) =>
      tabs.push({ key: String(id), label: `${name} #${id}` }),
    );
    return tabs;
  }, [timeline]);

  /* Filtered list */
  const filtered = useMemo(() => {
    return timeline.filter((item) => {
      const matchTab =
        activeTab === "All" || String(item.status?.id) === activeTab;
      const matchSearch =
        !search ||
        (item.status?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(item.status?.id || "").includes(search);
      return matchTab && matchSearch;
    });
  }, [timeline, activeTab, search]);

  const totalDuration = filtered.reduce(
    (sum, item) => sum + (item.duration_in_seconds || 0),
    0,
  );

  /* Map sub-modal */
  const [mapModal, setMapModal] = useState({
    open: false,
    location: null,
    label: "",
  });
  const openMap = (location, label) =>
    setMapModal({ open: true, location, label });
  const closeMap = () =>
    setMapModal({ open: false, location: null, label: "" });

  /* Reset filters when modal closes */
  const handleToggle = () => {
    setSearch("");
    setActiveTab("All");
    toggle();
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={handleToggle} centered size="lg">
        <ModalHeader toggle={handleToggle}>
          <span style={{ fontSize: "15px", fontWeight: 500 }}>
            Custom Status Timeline
          </span>
          {dateLabel && (
            <span
              style={{
                fontSize: "12px",
                color: "#888",
                marginLeft: "10px",
                fontWeight: 400,
              }}
            >
              {dateLabel}
            </span>
          )}
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
          {timeline.length === 0 ? (
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
                No custom status timeline entries found.
              </p>
            </div>
          ) : (
            <>
              {/* ── Search ── */}
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
                  placeholder="Search by status name or ID…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveTab("All");
                  }}
                  style={{
                    paddingLeft: "32px",
                    background: "#f5f5f5",
                    border: "0.5px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* ── Tabs (status id wise) — shown only when >1 unique status ── */}
              {uniqueTabs.length > 2 && (
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
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSearch("");
                      }}
                      style={{
                        padding: "4px 14px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: "0.5px solid",
                        transition: "all 0.15s",
                        background:
                          activeTab === tab.key ? "#405189" : "#f5f5f5",
                        color: activeTab === tab.key ? "#fff" : "#666",
                        borderColor: activeTab === tab.key ? "#405189" : "#ccc",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Summary strip ── */}
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
                  {activeTab === "All" && !search ? "Total" : "Filtered"}{" "}
                  Entries: <b>{filtered.length}</b>
                </div>
              </div>

              {/* ── No results ── */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <i
                    className="mdi mdi-magnify-close"
                    style={{
                      fontSize: "36px",
                      color: "#ccc",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  />
                  <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
                    No results match your search.
                  </p>
                </div>
              ) : (
                /* ── Timeline list ── */
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
                    const statusName = item.status?.name || "Unknown";
                    const statusIcon = item.status?.icon || "😐";
                    const badgeColor = getStatusColor(statusName);
                    const isActive = item.is_active;
                    const notes =
                      item.notes ?? item.note ?? item.remarks ?? null;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                          marginBottom:
                            idx < filtered.length - 1 ? "20px" : "0",
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
                            background: isActive ? "#405189" : "#f4f5f8",
                            border: `2px solid ${isActive ? "#405189" : "#dce0ef"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            flexShrink: 0,
                            boxShadow: "0 0 0 3px #fff",
                          }}
                        >
                          <span role="img" aria-label={statusName}>
                            {statusIcon}
                          </span>
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
                                {statusName}
                              </span>
                              <Badge
                                color={badgeColor}
                                pill
                                style={{ fontSize: "11px" }}
                              >
                                {isActive ? "Active" : "Completed"}
                              </Badge>
                              {item.status?.id && (
                                <Badge
                                  color="light"
                                  style={{
                                    fontSize: "11px",
                                    color: "#666",
                                    border: "0.5px solid #ddd",
                                  }}
                                >
                                  ID #{item.status.id}
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
                              {formatDuration(item.duration_in_seconds)}
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
                                {formatDateTime(item.start_time)}
                              </div>
                            </div>
                            <div style={timeBox}>
                              <div style={timeBoxLabel}>
                                <i className="mdi mdi-arrow-left-circle-outline me-1 text-danger" />
                                End Time
                              </div>
                              <div style={timeBoxValue}>
                                {item.end_time ? (
                                  formatDateTime(item.end_time)
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

                          {/* Notes */}
                          <NotesBlock notes={notes} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Button
              color="warning"
              onClick={handleToggle}
              style={{ minWidth: "100px" }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Map sub-modal */}
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
          <Link to="#" className="link-opacity-75 ms-1" onClick={toggle}>
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

export { CustomStatusTimelineModal, CustomStatusTimeline, LocationMapModal };
export default CustomStatusTimeline;
