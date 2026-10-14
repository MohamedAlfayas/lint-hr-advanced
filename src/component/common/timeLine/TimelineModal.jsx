import React, { useState, useEffect, useMemo } from "react";
import { ListSkeleton } from "../skeleton/Skeleton";
import { Modal } from "reactstrap";
import { GetApi } from "../../../common/api/GetApi";
import {
  LocationMapModal,
  LocationTag,
  NotesBlock,
  formatDuration,
  formatTime,
  formatDay,
  prettifyName,
  toneForStatus,
  toneVar,
} from "../table/CustomStatusTimeLine";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const sanitizeIcon = (icon) => {
  if (!icon || typeof icon !== "string") return "📌";
  const trimmed = icon.trim();
  if (!trimmed || /^\?+$/.test(trimmed)) return "📌";
  return trimmed;
};

const StatusIcon = ({ icon, title }) =>
  icon?.startsWith("http") ? (
    <img src={icon} alt={title} className="cstl-bubble-img" />
  ) : (
    <span role="img" aria-label={title}>
      {icon}
    </span>
  );

const TimelineModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [timelineData, setTimelineData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [durationSummary, setDurationSummary] = useState({});

  const [mapModal, setMapModal] = useState({
    open: false,
    location: null,
    label: "",
  });
  const openMap = (location, label) =>
    setMapModal({ open: true, location, label });
  const closeMap = () =>
    setMapModal({ open: false, location: null, label: "" });

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await GetApi("attendance/custom-statuses/timeline/v2/");
      if (res?.status === 200) {
        const raw = res?.data?.data || [];
        setTimelineData(
          raw.map((item, index) => ({
            id: index + 1,
            type: item?.status?.name || "Unknown",
            title: item?.status?.name || "Unknown",
            icon: sanitizeIcon(item?.status?.icon),
            statusId: item?.status?.id,
            startTime: item?.start_time,
            endTime: item?.end_time,
            duration: item?.duration_in_seconds || 0,
            start_notes: item?.start_notes,
            end_notes: item?.end_notes,
            start_location: item?.start_location,
            end_location: item?.end_location,
            is_active: item?.is_active || false,
          })),
        );
        setDurationSummary(res?.data?.custom_status_duration_summary || {});
      }
    } catch (err) {
      console.error("Timeline API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setSearch("");
      setActiveTab("All");
      fetchTimeline();
    }
  }, [show]);

  const statusMeta = useMemo(() => {
    const map = new Map();
    timelineData.forEach((item) => {
      if (!map.has(item.type)) {
        map.set(item.type, {
          name: item.type,
          icon: item.icon,
          tone: toneForStatus(item.type, map.size),
          count: 0,
        });
      }
      map.get(item.type).count += 1;
    });
    return map;
  }, [timelineData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timelineData.filter(
      (item) =>
        (activeTab === "All" || item.type === activeTab) &&
        (!q || item.title.toLowerCase().includes(q)),
    );
  }, [timelineData, activeTab, search]);

  const totalDuration = filtered.reduce((sum, item) => sum + (item.duration || 0), 0);
  const longest = filtered.reduce((max, item) => Math.max(max, item.duration || 0), 0);
  const activeItem = timelineData.find((item) => item.is_active);

  const summary = useMemo(() => {
    const rows = Object.entries(durationSummary).map(([name, seconds]) => ({
      name,
      label: prettifyName(name),
      seconds: Number(seconds) || 0,
      tone:
        statusMeta.get(name)?.tone ||
        (name.toLowerCase().includes("break") ? "warning" : "secondary"),
    }));
    const total = rows
      .filter((r) => !r.name.startsWith("total_"))
      .reduce((sum, r) => sum + r.seconds, 0);
    return { rows, total };
  }, [durationSummary, statusMeta]);

  const isFiltered = activeTab !== "All" || search.trim() !== "";

  const stats = [
    { key: "total", icon: "ri-timer-line", tone: "success", label: "Total time", value: formatDuration(totalDuration) },
    { key: "entries", icon: "ri-list-check-2", tone: "primary", label: isFiltered ? "Filtered entries" : "Entries", value: filtered.length },
    { key: "longest", icon: "ri-trophy-line", tone: "warning", label: "Longest session", value: formatDuration(longest) },
    {
      key: "active",
      icon: "ri-pulse-line",
      tone: activeItem ? "danger" : "secondary",
      label: "Current status",
      value: activeItem ? activeItem.title : "None",
    },
  ];

  return (
    <>
      <Modal
        data-testid="timeline-today-s-activity-dialog"
        isOpen={show}
        toggle={onClose}
        size="lg"
        centered
        contentClassName="cstl-content"
      >
        <div className="cstl-head">
          <span className="cstl-head-icon">
            <i className="ri-time-line" />
          </span>
          <div className="flex-grow-1 min-w-0">
            <h5 className="cstl-title">Today's Activity</h5>
            <div className="cstl-sub">
              <span>
                <i className="ri-calendar-line" />
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {activeItem && (
                <span className="cstl-sub-live">
                  <span className="cstl-live-dot" />
                  {activeItem.title} in progress
                </span>
              )}
            </div>
          </div>
          <button data-testid="timeline-today-s-activity-close-button" type="button" className="cstl-close" onClick={onClose} aria-label="Close">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="cstl-body cstl-scroll">
          {loading ? (
            <div className="p-3">
              <ListSkeleton rows={5} testId="status-timeline-loading-skeleton" label="Loading activity" />
            </div>
          ) : timelineData.length === 0 ? (
            <div className="cstl-empty">
              <span className="cstl-empty-icon">
                <i className="ri-history-line" />
              </span>
              <div className="cstl-empty-title">No activity yet</div>
              <div className="cstl-empty-sub">Statuses you start today will appear here.</div>
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
                    data-testid="timeline-today-s-activity-search-status-input"
                    type="text"
                    placeholder="Search status…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button data-testid="timeline-today-s-activity-clear-search-button" type="button" onClick={() => setSearch("")} aria-label="Clear search">
                      <i className="ri-close-circle-fill" />
                    </button>
                  )}
                </div>
                {statusMeta.size > 1 && (
                  <div className="cstl-tabs">
                    <button
                      data-testid="timeline-today-s-activity-all-button"
                      type="button"
                      className={`cstl-tab ${activeTab === "All" ? "is-active" : ""}`}
                      style={toneVar("success")}
                      onClick={() => setActiveTab("All")}
                    >
                      All
                      <span className="cstl-tab-count">{timelineData.length}</span>
                    </button>
                    {[...statusMeta.values()].map((meta) => (
                      <button
                        data-testid={testId("timeline-today-s-activity", itemTestKey(meta), "button")}
                        key={meta.name}
                        type="button"
                        className={`cstl-tab ${activeTab === meta.name ? "is-active" : ""}`}
                        style={toneVar(meta.tone)}
                        onClick={() => setActiveTab(meta.name)}
                      >
                        {meta.icon && !meta.icon.startsWith("http") && (
                          <span className="cstl-tab-emoji">{meta.icon}</span>
                        )}
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
                  <div className="cstl-empty-title">No matching activity</div>
                  <div className="cstl-empty-sub">Try a different search or filter.</div>
                </div>
              ) : (
                <div className="cstl-list">
                  {filtered.map((item, idx) => {
                    const tone = statusMeta.get(item.type)?.tone || toneForStatus(item.type, idx);
                    const startDay = formatDay(item.startTime);
                    const endDay = formatDay(item.endTime);

                    return (
                      <div
                        key={item.id}
                        className={`cstl-item ${item.is_active ? "is-active" : ""}`}
                        style={toneVar(tone)}
                      >
                        <div className="cstl-rail">
                          <span className="cstl-bubble">
                            <StatusIcon icon={item.icon} title={item.title} />
                          </span>
                        </div>

                        <div className="cstl-card">
                          <div className="cstl-card-top">
                            <div className="cstl-card-title-wrap">
                              <span className="cstl-card-title">{item.title}</span>
                              <span className={`cstl-state ${item.is_active ? "is-live" : ""}`}>
                                {item.is_active ? (
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
                            </div>
                            <span className="cstl-seq">Entry {idx + 1}</span>
                          </div>

                          <div className="cstl-span">
                            <div className="cstl-point is-start">
                              <span className="cstl-point-label">
                                <i className="ri-play-circle-fill" />
                                Start
                              </span>
                              <span className="cstl-point-time">{formatTime(item.startTime)}</span>
                              {startDay && <span className="cstl-point-day">{startDay}</span>}
                            </div>

                            <div className="cstl-span-mid">
                              <span className="cstl-span-line" />
                              <span className="cstl-duration">
                                <i className="ri-timer-flash-line" />
                                {formatDuration(item.duration)}
                              </span>
                              <span className="cstl-span-line" />
                            </div>

                            <div className="cstl-point is-end">
                              <span className="cstl-point-label">
                                <i className="ri-stop-circle-fill" />
                                End
                              </span>
                              {item.endTime ? (
                                <>
                                  <span className="cstl-point-time">{formatTime(item.endTime)}</span>
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
                              <LocationTag location={item.start_location} label="Start" onMapClick={openMap} />
                            </div>
                            <div className="cstl-loc-row">
                              <span className="cstl-loc-label">
                                <i className="ri-map-pin-line" />
                                End
                              </span>
                              <LocationTag location={item.end_location} label="End" onMapClick={openMap} />
                            </div>
                          </div>

                          <NotesBlock startNotes={item.start_notes} endNotes={item.end_notes} />
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

export default TimelineModal;
