import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, Input, Spinner } from "reactstrap";
import { Search } from "react-feather";
import { GetApi } from "../../../common/api/GetApi";

const formatDuration = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const TimelineModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [timelineData, setTimelineData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) fetchTimeline();
  }, [show]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await GetApi("attendance/custom-statuses/timeline/");
      if (res?.status === 200) {
        const formatted = (res?.data?.timeline || []).map((item, index) => {
          const start = new Date(item.start_time);
          const end = item.end_time ? new Date(item.end_time) : null;

          const fmtTime = (d) =>
            d.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

          const fmtDate = (d) =>
            d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

          return {
            id: index + 1,
            type: item?.status?.name || "Unknown",
            title: item?.status?.name || "Unknown",
            icon: item?.status?.icon || "📌", // ✅ FIXED
            time: `${fmtTime(start)} – ${end ? fmtTime(end) : "Now"} | ${fmtDate(start)}`,
            duration: item.duration_in_seconds,
            is_active: item.is_active,
          };
        });

        setTimelineData(formatted);
      } else {
        setTimelineData([]);
      }
    } catch (err) {
      console.log("Timeline error:", err);
      setTimelineData([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueTabs = useMemo(
    () => ["All", ...new Set(timelineData.map((i) => i.type))],
    [timelineData],
  );

  const filtered = timelineData.filter(
    (item) =>
      (activeTab === "All" || item.type === activeTab) &&
      item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal isOpen={show} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>
        <small
          style={{
            display: "block",
            fontSize: 15,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 2,
          }}
        >
          Today Activity timeline
        </small>
      </ModalHeader>

      <ModalBody className="tl-body">
        {/* Search */}
        <div className="tl-search-wrap">
          <Search size={14} className="tl-search-icon" />
          <Input
            placeholder="Search status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tl-search-input"
          />
        </div>

        {/* Tabs */}
        <div className="tl-tabs">
          {uniqueTabs.map((tab) => (
            <button
              key={tab}
              className={`tl-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="tl-list">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <div key={item.id} className="tl-item">
                  <div className="tl-icon-col">
                    <div className="tl-icon">
                      {/* ✅ SUPPORT emoji OR image */}
                      {item.icon?.startsWith("http") ? (
                        <img
                          src={item.icon}
                          alt=""
                          style={{ width: 18, height: 18 }}
                        />
                      ) : (
                        item.icon
                      )}
                    </div>

                    {idx < filtered.length - 1 && <div className="tl-line" />}
                  </div>

                  <div className="tl-content">
                    <div className="tl-row">
                      <span className="tl-title">{item.title}</span>

                      {item.is_active ? (
                        <span className="tl-badge active">● Active</span>
                      ) : (
                        <span className="tl-badge done">Done</span>
                      )}
                    </div>

                    <small className="tl-time">{item.time}</small>

                    <small className="tl-duration">
                      Duration: <strong>{formatDuration(item.duration)}</strong>
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="tl-empty">No results found.</p>
            )}
          </div>
        )}
      </ModalBody>

      <style>{`
        .tl-body { padding: 1.25rem 1.5rem 1.5rem; }

        .tl-search-wrap { position: relative; margin-bottom: 12px; }
        .tl-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: 0.4; }
        .tl-search-input { padding-left: 32px !important; background: #f5f5f5; border: 0.5px solid #ddd; border-radius: 8px; }

        .tl-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .tl-tab { padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 500; cursor: pointer; border: 0.5px solid #ccc; background: #f5f5f5; color: #666; transition: all 0.15s; }
        .tl-tab.active { background: #185FA5; color: #E6F1FB; border-color: #185FA5; }

        .tl-list { max-height: 340px; overflow-y: auto; }
        .tl-list::-webkit-scrollbar { width: 4px; }
        .tl-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        .tl-item { display: flex; gap: 14px; padding: 10px 0; border-bottom: 0.5px solid #f0f0f0; }
        .tl-item:last-child { border-bottom: none; }

        .tl-icon-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; padding-top: 4px; }

        .tl-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          background: #f5f5f5;
        }

        .tl-line { width: 1.5px; flex: 1; min-height: 12px; background: #eee; margin-top: 4px; }

        .tl-content { flex: 1; min-width: 0; }
        .tl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
        .tl-title { font-size: 14px; font-weight: 500; color: #111; }

        .tl-badge { padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 500; }
        .tl-badge.active { background: #EAF3DE; color: #3B6D11; }
        .tl-badge.done { background: #f3f3f3; color: #888; }

        .tl-time, .tl-duration { display: block; font-size: 12px; color: #888; margin-bottom: 1px; }
        .tl-empty { font-size: 13px; color: #aaa; margin-top: 1rem; }
      `}</style>
    </Modal>
  );
};

export default TimelineModal;
