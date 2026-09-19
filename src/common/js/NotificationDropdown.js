import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Col,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Row,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Api } from "../api/Api";

dayjs.extend(relativeTime);

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
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [readingIds, setReadingIds] = useState(() => new Set());

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const fetchNotifications = useCallback(
    async ({ silent = false, mergeSeen = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await Api.get("/notification/list/", {
          params: { unread_only: true },
        });
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];

        if (mergeSeen) {
          // Keep rows the user already marked read in this open session, and
          // append any brand-new unread items from the API.
          setNotifications((prev) => {
            const seenLocal = prev.filter((n) => n.is_read);
            const seenIds = new Set(seenLocal.map((n) => n.id));
            const fresh = list.filter((n) => !seenIds.has(n.id));
            return [...fresh, ...seenLocal].sort(
              (a, b) => new Date(b.created_on) - new Date(a.created_on),
            );
          });
        } else {
          setNotifications(list);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
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
          type="button"
          tag="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
          id="page-header-notifications-dropdown"
        >
          <i className="bx bx-bell fs-22"></i>
          {unreadCount > 0 && (
            <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
              {unreadCount > 99 ? "99+" : unreadCount}
              <span className="visually-hidden">unread messages</span>
            </span>
          )}
        </DropdownToggle>

        <DropdownMenu
          className="dropdown-menu-lg dropdown-menu-end p-0"
          aria-labelledby="page-header-notifications-dropdown"
          style={{ width: "360px" }}
        >
          <div className="dropdown-head bg-primary bg-pattern rounded-top">
            <div className="p-3">
              <Row className="align-items-center">
                <Col>
                  <h6 className="m-0 fs-16 fw-semibold text-white">
                    Notifications
                  </h6>
                </Col>
                <div className="col-auto">
                  <span className="badge bg-light-subtle text-body fs-13">
                    {unreadCount} New
                  </span>
                </div>
              </Row>
            </div>
          </div>

          {loading && notifications.length === 0 ? (
            <div className="text-center py-5">
              <Spinner size="sm" color="primary" />
              <p className="text-muted fs-12 mb-0 mt-2">Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="pt-4 pb-3 mx-auto text-center px-3">
              <div className="avatar-md mx-auto mb-2">
                <div className="avatar-title bg-info-subtle text-info fs-24 rounded-circle">
                  <i className="bx bx-bell-off"></i>
                </div>
              </div>
              <h6 className="fs-14 fw-semibold mb-1">No notifications</h6>
              <p className="text-muted fs-12 mb-2">
                You&apos;re all caught up for now.
              </p>
            </div>
          ) : (
            <SimpleBar style={{ maxHeight: "320px" }} className="pe-2">
              {notifications.map((item) => {
                const meta = resolveTypeMeta(item);
                const unread = !item.is_read;
                const titleText = item.title || "Notification";
                const messageText = item.message || item.data?.body || "";
                const tipId = `notif-msg-tip-${item.id}`;

                return (
                  <div
                    key={item.id}
                    className={`text-reset notification-item d-block dropdown-item position-relative${
                      unread ? " unread" : " seen"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => markOneRead(e, item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        markOneRead(e, item);
                      }
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="avatar-xs me-3 flex-shrink-0">
                        <span
                          className={`avatar-title ${meta.className} rounded-circle fs-16`}
                        >
                          <i className={meta.icon}></i>
                        </span>
                      </div>

                      <div className="flex-grow-1 overflow-hidden">
                        <h6
                          className={`mt-0 mb-1 lh-base fs-13 text-truncate${
                            unread ? " fw-semibold" : " fw-medium text-muted"
                          }`}
                          title={titleText}
                        >
                          {titleText}
                        </h6>

                        {messageText ? (
                          <>
                            <p
                              id={tipId}
                              className="mb-1 fs-12 text-muted text-truncate"
                            >
                              {messageText}
                            </p>
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

                        <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span>
                            <i className="mdi mdi-clock-outline align-middle me-1"></i>
                            {formatCreatedOn(item.created_on)}
                          </span>
                        </p>
                      </div>

                      {unread ? (
                        <div className="px-2 fs-15 flex-shrink-0">
                          <span
                            className="d-inline-block rounded-circle bg-primary align-middle"
                            style={{ width: 8, height: 8 }}
                            title="Unread"
                          />
                        </div>
                      ) : (
                        <div className="px-2 fs-15 flex-shrink-0 text-success">
                          <i
                            className="ri-check-double-line"
                            title="Seen"
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </SimpleBar>
          )}

          <div className="p-2 border-top d-grid">
            <button
              type="button"
              className="btn btn-sm btn-soft-success"
              disabled={unreadCount === 0 || markingAll}
              onClick={markAllRead}
            >
              {markingAll ? (
                <>
                  <Spinner size="sm" className="me-1" /> Marking…
                </>
              ) : (
                <>
                  <i className="ri-check-double-line align-middle me-1"></i>
                  {unreadCount > 0 ? "Mark all as read" : "All caught up"}
                </>
              )}
            </button>
          </div>
        </DropdownMenu>
      </Dropdown>

      <style>{`
        .notification-item {
          transition: background-color 0.15s ease, opacity 0.15s ease;
          border-left: 3px solid transparent;
        }
        .notification-item:hover,
        .notification-item:focus {
          background-color: var(--vz-tertiary-bg, #f3f6f9) !important;
          outline: none;
        }
        .notification-item.unread {
          background-color: rgba(64, 81, 137, 0.04);
          border-left-color: var(--vz-primary, #405189);
        }
        .notification-item.unread:hover,
        .notification-item.unread:focus {
          background-color: rgba(64, 81, 137, 0.08) !important;
        }
        .notification-item.seen {
          opacity: 0.72;
          background-color: transparent;
          border-left-color: transparent;
        }
      `}</style>
    </React.Fragment>
  );
};

export default NotificationDropdown;
