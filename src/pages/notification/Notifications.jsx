import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import classnames from "classnames";
import SimpleBar from "simplebar-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Api } from "../../common/api/Api";

const DEFAULT_PAGE_SIZE = 20;

// NOTE: the API only exposes `type` on each notification and doesn't accept
// a `?type=` query param, so tab filtering happens client-side against
// whatever page of results is currently loaded. The `type` slugs below
// (mention / reply / reaction / task / project / leave) are guesses based
// on the tab labels in the screenshot and the one example value ("leave")
// in the API doc — confirm these against your backend's actual values and
// adjust the `type:` fields if they differ.
const NOTIFICATION_TABS = [
  { key: "all", label: "All", icon: "ri-notification-3-line", type: null },
  { key: "mention", label: "Mention", icon: "ri-at-line", type: "mention" },
  { key: "reply", label: "Replies", icon: "ri-reply-line", type: "reply" },
  {
    key: "reaction",
    label: "Reaction",
    icon: "ri-emotion-happy-line",
    type: "reaction",
  },
  { key: "task", label: "Task", icon: "ri-task-line", type: "task" },
  {
    key: "project",
    label: "Project",
    icon: "ri-briefcase-4-line",
    type: "project",
  },
  { key: "leave", label: "Leave", icon: "ri-plane-line", type: "leave" },
];

// Icon shown on each notification's avatar circle, per type. Falls back to a
// generic bell icon for anything unrecognised.
const TYPE_ICON = {
  mention: "ri-at-line",
  reply: "ri-reply-fill",
  reaction: "ri-emotion-happy-fill",
  task: "ri-task-fill",
  project: "ri-briefcase-4-fill",
  leave: "ri-plane-fill",
};

const shortTimeAgo = (iso) => {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(parseISO(iso))
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
      .replace(/ months?/, "mo")
      .replace(/ years?/, "y");
  } catch {
    return "";
  }
};

// GET /notification/list/?unread_only=true&page=1&page_size=20
const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetched separately (unread_only=true, large page_size) purely to compute
  // the per-tab unread badge counts shown next to each tab — mirrors the
  // "All 4" / "Reaction 2" badges in the screenshot. Never used to render
  // the visible list itself, only the counts.
  const [unreadAll, setUnreadAll] = useState([]);

  const activeTabDef = useMemo(
    () => NOTIFICATION_TABS.find((t) => t.key === activeTab),
    [activeTab],
  );

  const fetchNotifications = useCallback(async (targetPage, targetPageSize) => {
    setLoading(true);
    try {
      const res = await Api({
        type: "GET",
        url: `notification/list/?page=${targetPage}&page_size=${targetPageSize}`,
      });

      const body = res?.data;
      const list = Array.isArray(body?.data) ? body.data : [];

      setNotifications(list);
      setTotalCount(body?.count ?? list.length);
      setTotalPages(body?.total_pages ?? 1);
    } catch (err) {
      console.log("Notification fetch error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const res = await Api({
        type: "GET",
        url: `notification/list/?unread_only=true&page=1&page_size=500`,
      });
      const body = res?.data;
      const list = Array.isArray(body?.data) ? body.data : [];
      setUnreadAll(list);
    } catch (err) {
      console.log("Notification unread-count fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, pageSize);
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    fetchNotifications(page, pageSize);
  }, [page]);

  const toggleTab = (tabKey) => {
    if (tabKey !== activeTab) {
      setActiveTab(tabKey);
    }
  };

  // "All" shows the currently-loaded page as-is; every other tab filters
  // that same page down to matching `type`. Since there's no server-side
  // type filter, a notification of a type with very few items on the
  // current page may look sparse until you page forward.
  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((n) => n.type === activeTabDef?.type);
  }, [notifications, activeTab, activeTabDef]);

  const unreadCountFor = (type) => {
    if (type === null) return unreadAll.length;
    return unreadAll.filter((n) => n.type === type).length;
  };

  const markAsRead = (notification) => {
    if (notification.is_read) return;

    // Optimistic UI update. The API doc shared doesn't include a
    // "mark as read" endpoint — swap in the real one here once you have it.
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );
    setUnreadAll((prev) => prev.filter((n) => n.id !== notification.id));

    // try {
    //   await Api({
    //     type: "POST",
    //     url: `notification/mark-read/${notification.id}/`,
    //   });
    // } catch (err) {
    //   console.log("Mark-as-read error:", err);
    // }
  };

  return (
    <Card
      className="bg-dark text-light border-0 shadow"
      style={{ width: "440px" }}
    >
      <CardBody className="p-0">
        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="px-3 pt-3 pb-2">
          <Nav
            pills
            className="flex-nowrap gap-1"
            style={{ overflowX: "auto" }}
          >
            {NOTIFICATION_TABS.map((tab) => {
              const count = unreadCountFor(tab.type);
              const isActive = activeTab === tab.key;
              return (
                <NavItem key={tab.key} className="text-nowrap">
                  <NavLink
                    href="#"
                    className={classnames(
                      "d-flex align-items-center gap-1 text-light px-2 py-1",
                      { active: isActive },
                    )}
                    style={{
                      backgroundColor: isActive ? "#2b3752" : "transparent",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTab(tab.key);
                    }}
                  >
                    <i className={tab.icon} />
                    {tab.label}
                    {count > 0 && (
                      <Badge color="danger" pill className="ms-1">
                        {count}
                      </Badge>
                    )}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
        </div>

        <hr className="my-0 border-secondary opacity-25" />

        {/* ── List ─────────────────────────────────────────────────── */}
        <SimpleBar style={{ maxHeight: "480px" }}>
          {loading ? (
            <div className="d-flex justify-content-center py-4">
              <Spinner size="sm" color="light" />
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="text-center text-muted py-5">No notifications</div>
          ) : (
            visibleNotifications.map((n) => (
              <div
                key={n.id}
                className="d-flex px-3 py-3 border-bottom"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: n.is_read ? "transparent" : "#1b2537",
                  cursor: "pointer",
                }}
                onClick={() => markAsRead(n)}
              >
                <div className="flex-shrink-0 me-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "#0ab39c",
                    }}
                  >
                    <i
                      className={`${TYPE_ICON[n.type] || "ri-notification-3-fill"} text-white`}
                    />
                  </div>
                </div>

                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-semibold text-light">{n.title}</div>
                    <small className="text-muted flex-shrink-0 ms-2">
                      {shortTimeAgo(n.created_on)}
                    </small>
                  </div>

                  {n.type && (
                    <div
                      className="small text-capitalize"
                      style={{ color: "#f7b84b" }}
                    >
                      # {n.type}
                    </div>
                  )}

                  {n.message && (
                    <div
                      className="text-muted small mt-1"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {n.message}
                    </div>
                  )}
                </div>

                {!n.is_read && (
                  <div className="flex-shrink-0 ms-2 align-self-center">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#0ab39c",
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </SimpleBar>

        {/* ── Pagination (applies to the "All" tab's underlying fetch) ── */}
        {totalPages > 1 && (
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2 border-top"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Button
              size="sm"
              color="link"
              className="text-light p-0"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <i className="ri-arrow-left-s-line" /> Prev
            </Button>
            <small className="text-muted">
              Page {page} of {totalPages} · {totalCount} total
            </small>
            <Button
              size="sm"
              color="link"
              className="text-light p-0"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <i className="ri-arrow-right-s-line" />
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default Notifications;
