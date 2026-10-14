import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Api } from "../api/Api";
import {
  decrementUnreadCount,
  setUnreadCount,
} from "../../redux/reducers/ChildReducer/NotificationReducer";

dayjs.extend(relativeTime);

// Dropdown shows only the latest N notifications; "See all" opens the full page
const PAGE_SIZE = 10;

const TYPE_ICON = {
  general: { icon: "bx bx-bell", className: "bg-primary-subtle text-primary" },
  attendance: {
    icon: "bx bx-time-five",
    className: "bg-success-subtle text-success",
  },
  leave: {
    icon: "bx bx-calendar-event",
    className: "bg-warning-subtle text-warning",
  },
  approval: {
    icon: "bx bx-check-shield",
    className: "bg-info-subtle text-info",
  },
};

const resolveTypeMeta = (item) => {
  const raw = String(item?.type || "general").toLowerCase();
  const haystack =
    `${raw} ${item?.title || ""} ${item?.message || ""}`.toLowerCase();
  if (haystack.includes("leave")) return TYPE_ICON.leave;
  if (haystack.includes("attendance") || haystack.includes("check")) {
    return TYPE_ICON.attendance;
  }
  if (haystack.includes("approv")) return TYPE_ICON.approval;
  return TYPE_ICON[raw] || TYPE_ICON.general;
};

const formatCreatedOn = (ts) => {
  if (!ts) return "";
  const d = dayjs(ts);
  if (!d.isValid()) return "";
  return d.fromNow();
};

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Server-side unread total (shared with the sidebar badge)
  const totalUnread = useSelector(
    (state) => state.NotificationReducer.unread_count,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [readingIds, setReadingIds] = useState(() => new Set());

  // Unread rows currently loaded in the dropdown list (used for button state)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const fetchNotifications = useCallback(
    async ({ silent = false, mergeSeen = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await Api.get("/notification/list/", {
          params: { unread_only: true, page: 1, page_size: PAGE_SIZE },
        });
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];

        // Shared count -> Redux (sidebar badge reads this)
        dispatch(setUnreadCount(res?.data?.count ?? list.length));

        if (mergeSeen) {
          // Keep rows the user already marked read in this open session, and
          // append any brand-new unread items from the API.
          setNotifications((prev) => {
            const seenLocal = prev.filter((n) => n.is_read);
            const seenIds = new Set(seenLocal.map((n) => n.id));
            const fresh = list.filter((n) => !seenIds.has(n.id));
            return [...fresh, ...seenLocal]
              .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
              .slice(0, PAGE_SIZE);
          });
        } else {
          setNotifications(list.slice(0, PAGE_SIZE));
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [dispatch],
  );

  // Auto-refresh badge: poll + tab focus + live FCM pushes (no full page reload).
  useEffect(() => {
    const refreshForBadge = () => {
      if (document.hidden) return;
      if (isOpen) {
        fetchNotifications({ silent: true, mergeSeen: true });
      } else {
        fetchNotifications({ silent: true });
      }
    };

    // Initial + periodic poll (badge updates while the app stays open).
    if (!isOpen) {
      fetchNotifications({ silent: true });
    }
    const timer = setInterval(refreshForBadge, 20000);

    const onFocus = () => refreshForBadge();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshForBadge();
    };
    const onPush = () => refreshForBadge();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("linthr:notification", onPush);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("linthr:notification", onPush);
    };
  }, [fetchNotifications, isOpen]);

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) fetchNotifications();
      return next;
    });
  };

  const handleSeeAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const markOneRead = async (e, item) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!item || item.is_read || readingIds.has(item.id)) return;

    setReadingIds((prev) => new Set(prev).add(item.id));
    // Stay in the list; only switch to "seen" look. Removed on next open.
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );

    try {
      await Api.post(`/notification/${item.id}/read/`);
      dispatch(decrementUnreadCount());
    } catch (err) {
      console.error(`Failed to mark notification ${item.id} read:`, err);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, is_read: false, read_at: null } : n,
        ),
      );
    } finally {
      setReadingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const markAllRead = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    const snapshot = notifications;
    setNotifications((prev) =>
      prev.map((n) =>
        n.is_read
          ? n
          : { ...n, is_read: true, read_at: new Date().toISOString() },
      ),
    );

    try {
      await Api.post("/notification/read-all/");
      dispatch(setUnreadCount(0));
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      setNotifications(snapshot);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isOpen}
        toggle={toggle}
        className="topbar-head-dropdown ms-1 header-item"
      >
        <DropdownToggle
          data-testid="notification-dropdown-notifications-trigger"
          type="button"
          tag="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
          id="page-header-notifications-dropdown"
        >
          <i className="bx bx-bell fs-22"></i>
          {totalUnread > 0 && (
            <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
              {totalUnread > 99 ? "99+" : totalUnread}
              <span className="visually-hidden">unread messages</span>
            </span>
          )}
        </DropdownToggle>

        <DropdownMenu
          className="dropdown-menu-end p-0 nd-menu"
          aria-labelledby="page-header-notifications-dropdown"
        >
          <div className="nd-head">
            <div className="d-flex align-items-center gap-2">
              <h6 className="m-0 fs-15 fw-semibold">Notifications</h6>
              {totalUnread > 0 && (
                <span className="nd-count">
                  {totalUnread > 99 ? "99+" : totalUnread} new
                </span>
              )}
            </div>
            <button
              data-testid="notification-dropdown-mark-all-as-read-button"
              type="button"
              id="nd-mark-all"
              className="nd-icon-btn"
              disabled={unreadCount === 0 || markingAll}
              onClick={markAllRead}
              aria-label="Mark all as read"
            >
              {markingAll ? (
                <Spinner size="sm" />
              ) : (
                <i className="ri-check-double-line"></i>
              )}
            </button>
            <UncontrolledTooltip placement="left" target="nd-mark-all">
              {unreadCount > 0 ? "Mark all as read" : "All caught up"}
            </UncontrolledTooltip>
          </div>

          {loading && notifications.length === 0 ? (
            <div className="nd-list">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nd-item nd-skel-row">
                  <span className="nd-skel nd-skel-icon" />
                  <div className="flex-grow-1">
                    <span className="nd-skel" style={{ width: "60%", height: 10 }} />
                    <span className="nd-skel mt-2" style={{ width: "85%", height: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="nd-empty">
              <div className="nd-empty-icon">
                <i className="bx bx-bell-off"></i>
              </div>
              <h6 className="fs-14 fw-semibold mb-1">You&apos;re all caught up</h6>
              <p className="text-muted fs-12 mb-0">
                New notifications will show up here.
              </p>
            </div>
          ) : (
            <SimpleBar style={{ maxHeight: "340px" }}>
              <div className="nd-list">
                {notifications.map((item) => {
                  const meta = resolveTypeMeta(item);
                  const unread = !item.is_read;
                  const titleText = item.title || "Notification";
                  const messageText = item.message || item.data?.body || "";
                  const tipId = `notif-msg-tip-${item.id}`;

                  return (
                    <div
                      key={item.id}
                      className={`nd-item${unread ? " is-unread" : " is-seen"}`}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => markOneRead(e, item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          markOneRead(e, item);
                        }
                      }}
                    >
                      <span className={`nd-type ${meta.className}`}>
                        <i className={meta.icon}></i>
                      </span>

                      <div className="flex-grow-1 overflow-hidden">
                        <div className="nd-title text-truncate" title={titleText}>
                          {titleText}
                        </div>
                        {messageText ? (
                          <>
                            <div id={tipId} className="nd-msg text-truncate">
                              {messageText}
                            </div>
                            <UncontrolledTooltip
                              placement="left"
                              target={tipId}
                              delay={{ show: 250, hide: 0 }}
                              autohide
                              style={{
                                maxWidth: "260px",
                                textAlign: "left",
                                whiteSpace: "normal",
                              }}
                            >
                              {messageText}
                            </UncontrolledTooltip>
                          </>
                        ) : null}
                        <div className="nd-time">
                          <i className="ri-time-line"></i>
                          {formatCreatedOn(item.created_on)}
                        </div>
                      </div>

                      {unread ? (
                        <span className="nd-dot" title="Unread" />
                      ) : (
                        <i className="ri-check-double-line nd-seen" title="Seen"></i>
                      )}
                    </div>
                  );
                })}
              </div>
            </SimpleBar>
          )}

          <button data-testid="notification-dropdown-view-all-notifications-button" type="button" className="nd-footer" onClick={handleSeeAll}>
            View all notifications
            <i className="ri-arrow-right-line"></i>
          </button>
        </DropdownMenu>
      </Dropdown>

      <style>{`
        .nd-menu {
          width: 370px;
          border-radius: 14px !important;
          overflow: hidden;
          border: 1px solid var(--vz-border-color) !important;
          box-shadow: 0 12px 32px rgba(30, 41, 59, 0.14) !important;
        }
        [data-bs-theme="dark"] .nd-menu { box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important; }
        .nd-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid var(--vz-border-color);
        }
        .nd-count {
          font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
          color: var(--vz-primary); background: rgba(var(--vz-primary-rgb), 0.12);
        }
        .nd-icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--vz-border-color);
          background: transparent; color: var(--vz-success); font-size: 16px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color .15s ease;
        }
        .nd-icon-btn:hover:not(:disabled) { background: rgba(var(--vz-success-rgb), 0.1); }
        .nd-icon-btn:disabled { color: var(--vz-secondary-color); opacity: .6; }

        .nd-list { padding: 6px; }
        .nd-item {
          display: flex; align-items: flex-start; gap: 12px; padding: 10px;
          border-radius: 10px; cursor: pointer; position: relative;
          transition: background-color .15s ease, opacity .15s ease;
        }
        .nd-item + .nd-item { margin-top: 2px; }
        .nd-item:hover, .nd-item:focus { background: var(--vz-tertiary-bg); outline: none; }
        .nd-item.is-unread { background: rgba(var(--vz-primary-rgb), 0.05); }
        .nd-item.is-unread:hover, .nd-item.is-unread:focus { background: rgba(var(--vz-primary-rgb), 0.1); }
        .nd-item.is-seen { opacity: .7; }
        .nd-type {
          flex: 0 0 36px; width: 36px; height: 36px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .nd-title { font-size: 13px; font-weight: 600; color: var(--vz-heading-color, var(--vz-body-color)); }
        .nd-item.is-seen .nd-title { font-weight: 500; }
        .nd-msg { font-size: 12px; color: var(--vz-secondary-color); margin-top: 2px; }
        .nd-time {
          display: flex; align-items: center; gap: 4px; margin-top: 6px;
          font-size: 11px; color: var(--vz-secondary-color);
        }
        .nd-dot {
          flex-shrink: 0; width: 8px; height: 8px; margin-top: 6px; border-radius: 50%;
          background: var(--vz-primary); box-shadow: 0 0 0 3px rgba(var(--vz-primary-rgb), 0.18);
        }
        .nd-seen { flex-shrink: 0; color: var(--vz-success); font-size: 15px; }

        .nd-empty { text-align: center; padding: 32px 24px 28px; }
        .nd-empty-icon {
          width: 64px; height: 64px; margin: 0 auto 12px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 28px;
          color: var(--vz-primary);
          background: radial-gradient(circle, rgba(var(--vz-primary-rgb), 0.16) 0%, rgba(var(--vz-primary-rgb), 0.06) 70%);
        }

        .nd-footer {
          width: 100%; border: 0; border-top: 1px solid var(--vz-border-color);
          background: transparent; padding: 12px; font-size: 13px; font-weight: 600;
          color: var(--vz-primary); display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background-color .15s ease;
        }
        .nd-footer:hover { background: rgba(var(--vz-primary-rgb), 0.06); }
        .nd-footer i { transition: transform .15s ease; }
        .nd-footer:hover i { transform: translateX(3px); }

        .nd-skel-row { pointer-events: none; }
        .nd-skel {
          display: block; height: 10px; border-radius: 4px;
          background: linear-gradient(90deg, var(--vz-tertiary-bg) 25%, var(--vz-border-color) 37%, var(--vz-tertiary-bg) 63%);
          background-size: 400% 100%; animation: nd-shimmer 1.4s ease infinite;
        }
        .nd-skel-icon { flex: 0 0 36px; width: 36px; height: 36px; border-radius: 10px; }
        @keyframes nd-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
      `}</style>
    </React.Fragment>
  );
};

export default NotificationDropdown;
