import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  InputGroupText,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { Api } from "../../common/api/Api";

import {
  decrementUnreadCount,
  setUnreadCount,
} from "../../redux/reducers/ChildReducer/NotificationReducer";

/* ------------------------------------------------------------------ */
/* API config                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 20;

const ENDPOINTS = {
  list: "/notification/list/",
  markRead: (id) => `/notification/${id}/read/`, // POST  (assumed)
  markAllRead: "/notification/read-all/", // POST  (assumed)
};

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.detail ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const TYPE_LABELS = {
  leave: "Leave",
  task: "Task",
  meeting: "Meeting",
  blocker: "Critical Blocker",
};

const typeLabel = (type) => {
  if (!type) return "General";
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  const s = String(type).replace(/[_-]+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChevronDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const DotsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="2 13 7 18 16 7" />
    <polyline points="12 16 13 17 22 6" />
  </svg>
);
const SparkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6d4cf5"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);
const LayoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

/* Notification-type icons (shared wrapper) */
const Svg = ({ size = 16, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </Svg>
);
const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </Svg>
);
const TaskIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <polyline points="8 12 11 15 16 9" />
  </Svg>
);
const MeetingIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M17 14c2.5 0 4 2 4 5" />
  </Svg>
);
const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 2 20h20L12 3Z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </Svg>
);
const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

/* Icon + colors per notification type. Add keys here for new backend types. */
const TYPE_META = {
  attendance: { Icon: ClockIcon, bg: "#e0f6f2", color: "#0ab39c" },
  reminder: { Icon: ClockIcon, bg: "#e0f6f2", color: "#0ab39c" },
  leave: { Icon: CalendarIcon, bg: "#fff4dc", color: "#f7a41d" },
  task: { Icon: TaskIcon, bg: "#e8ecfb", color: "#405189" },
  meeting: { Icon: MeetingIcon, bg: "#efe9ff", color: "#7c5cf5" },
  blocker: { Icon: AlertIcon, bg: "#fde8e8", color: "#f06548" },
  default: { Icon: BellIcon, bg: "#f0f0f4", color: "#6b6b76" },
};

const typeMeta = (type) =>
  TYPE_META[String(type || "").toLowerCase()] || TYPE_META.default;

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const styles = `
.ntf-page { background:#fff; min-height:100vh; padding:20px 24px; color:#1f1f1f; font-size:13px; }
.ntf-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.ntf-title { font-size:16px; font-weight:600; margin:0; }
.ntf-header-actions { display:flex; align-items:center; gap:10px; }
.ntf-icon-btn { width:30px; height:30px; padding:0; display:inline-flex; align-items:center; justify-content:center; border:1px solid #e3e3e8; background:#fff; border-radius:6px; color:#444; }
.ntf-icon-btn:hover { background:#f5f5f8; }
.ntf-icon-btn.is-accent { background:#f1edff; border-color:#e2dbff; }
.ntf-divider { width:1px; height:22px; background:#e3e3e8; }
.ntf-avatar { width:32px; height:32px; border-radius:50%; background:#f28c4b; color:#fff; font-weight:600; font-size:13px; display:inline-flex; align-items:center; justify-content:center; }
.ntf-user-toggle { background:transparent !important; border:0 !important; box-shadow:none !important; padding:0 !important; display:inline-flex; align-items:center; gap:6px; color:#555 !important; }

.ntf-tabs { border-bottom:1px solid #ececf1; margin-bottom:14px; }
.ntf-tabs .nav-link { padding:6px 0; margin-right:18px; font-size:12px; font-weight:500; color:#8a8a94; border:0; border-bottom:2px solid transparent; border-radius:0; background:transparent; cursor:pointer; }
.ntf-tabs .nav-link.active { color:#1f1f1f; font-weight:600; border-bottom-color:#7c5cf5; background:transparent; }

.ntf-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
.ntf-search { max-width:260px; width:100%; }
.ntf-search .input-group-text { background:#fff; border:1px solid #e3e3e8; border-right:0; color:#8a8a94; padding:0 8px 0 10px; border-radius:6px 0 0 6px; }
.ntf-search .form-control { border:1px solid #e3e3e8; border-left:0; font-size:12px; height:30px; box-shadow:none; border-radius:0 6px 6px 0; }
.ntf-search .form-control::placeholder { color:#9a9aa5; }
.ntf-toolbar-right { display:flex; align-items:center; gap:8px; }
.ntf-outline-btn { background:#fff !important; border:1px solid #e3e3e8 !important; color:#1f1f1f !important; font-size:12px; font-weight:500; height:30px; padding:0 12px !important; border-radius:6px !important; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:none !important; }
.ntf-outline-btn:hover { background:#f7f7fa !important; }
.ntf-outline-btn:disabled { opacity:.5; }

.ntf-list { list-style:none; margin:0; padding:0; }

/* Row */
.ntf-row { position:relative; display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid #f0f0f4; transition:background-color .15s ease, opacity .15s ease; }
.ntf-row:last-child { border-bottom:0; }
.ntf-row:hover { background:#f4f5f9; }
.ntf-row.is-unread { background:rgba(64,81,137,.04); cursor:pointer; }
.ntf-row.is-unread:hover, .ntf-row.is-unread:focus { background:rgba(64,81,137,.09); outline:none; }
.ntf-row.is-seen { opacity:.72; background:transparent; }
.ntf-row.is-seen .ntf-row-title { font-weight:500; color:#8a8a94; }

.ntf-icon { flex:0 0 40px; width:40px; height:40px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; }
.ntf-icon-skel { flex:0 0 40px; width:40px; height:40px; border-radius:50%; }
.ntf-body { flex:1; min-width:0; }
.ntf-row-title { font-size:13px; font-weight:600; color:#1f1f1f; margin:0 0 3px; }
.ntf-row-desc { font-size:12px; color:#8a8a94; margin:0 0 6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ntf-time { display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:500; letter-spacing:.3px; text-transform:uppercase; color:#7b7b86; }

/* Right side: unread dot, swaps to the menu on hover */
.ntf-side { position:relative; flex:0 0 32px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; }
.ntf-dot { width:8px; height:8px; border-radius:50%; background:#405189; transition:opacity .15s ease; }
.ntf-side .dropdown { position:absolute; top:0; right:0; bottom:0; left:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .15s ease; }
.ntf-row:hover .ntf-side .dropdown, .ntf-side .dropdown.show, .ntf-side .dropdown:focus-within { opacity:1; }
.ntf-row:hover .ntf-dot, .ntf-side:focus-within .ntf-dot, .ntf-side:has(.dropdown.show) .ntf-dot { opacity:0; }

.ntf-check { display:inline-flex; color:#0ab39c; padding:2px 6px; }
.ntf-more-toggle { background:transparent !important; border:0 !important; box-shadow:none !important; color:#555 !important; padding:2px 6px !important; }
.ntf-more-toggle:hover { color:#000 !important; }
.ntf-empty { text-align:center; padding:56px 0; color:#8a8a94; font-size:13px; }
.ntf-end { text-align:center; padding:16px 0 8px; font-size:11px; color:#9a9aa5; }

.ntf-skel { display:block; border-radius:4px; background:linear-gradient(90deg,#efeff3 25%,#f8f8fb 37%,#efeff3 63%); background-size:400% 100%; animation:ntf-shimmer 1.4s ease infinite; }
.ntf-skel-row { pointer-events:none; }
.ntf-skel-row:hover { background:transparent; }
@keyframes ntf-shimmer { 0% { background-position:100% 50%; } 100% { background-position:0 50%; } }
@media (prefers-reduced-motion: reduce) { .ntf-skel { animation:none; } }

@media (max-width: 768px) {
  .ntf-page { padding:16px 12px; }
  .ntf-toolbar { flex-direction:column; align-items:stretch; }
  .ntf-search { max-width:100%; }
  .ntf-toolbar-right { justify-content:space-between; }
}
`;

/* ------------------------------------------------------------------ */
/* Skeleton row                                                        */
/* ------------------------------------------------------------------ */
const SkeletonRow = ({ index = 0 }) => {
  const titleW = [58, 46, 64, 52][index % 4];
  const descW = [78, 68, 84, 72][index % 4];
  return (
    <li className="ntf-row ntf-skel-row" aria-hidden="true">
      <span className="ntf-skel ntf-icon-skel" />
      <div className="ntf-body">
        <span
          className="ntf-skel"
          style={{ height: 11, width: `${titleW}%`, marginBottom: 8 }}
        />
        <span
          className="ntf-skel"
          style={{ height: 9, width: `${descW}%`, marginBottom: 8 }}
        />
        <span className="ntf-skel" style={{ height: 8, width: 70 }} />
      </div>
    </li>
  );
};

const SkeletonList = ({ count = 8 }) => (
  <ul className="ntf-list" role="status" aria-label="Loading notifications">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonRow key={i} index={i} />
    ))}
  </ul>
);

/* ------------------------------------------------------------------ */
/* Row menu                                                            */
/* ------------------------------------------------------------------ */
const RowMenu = ({ notification, onMarkRead }) => {
  const [open, setOpen] = useState(false);
  if (notification.is_read)
    return (
      <span className="ntf-check" title="Seen">
        <CheckIcon />
      </span>
    );
  return (
    <Dropdown isOpen={open} toggle={() => setOpen((v) => !v)}>
      <DropdownToggle
        tag="button"
        type="button"
        className="btn ntf-more-toggle"
        aria-label="More actions"
      >
        <DotsIcon />
      </DropdownToggle>
      <DropdownMenu end container="body">
        <DropdownItem onClick={() => onMarkRead(notification.id)}>
          Mark as read
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const Notifications = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("unread");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const abortRef = useRef(null);

  const fetchPage = useCallback(
    async (pageNum, { append = false } = {}) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");

      try {
        const params = { page: pageNum, page_size: PAGE_SIZE };
        if (activeTab === "unread") params.unread_only = "true";

        const response = await Api.get(ENDPOINTS.list, {
          params,
          signal: controller.signal,
        });
        const payload = response?.data || {};
        let rows = Array.isArray(payload.data) ? payload.data : [];
        // Read tab: API has no read-only filter, so keep read items client-side
        if (activeTab === "read") rows = rows.filter((n) => n.is_read);

        setItems((prev) => {
          if (!append) return rows;
          const seen = new Set(prev.map((n) => n.id));
          return [...prev, ...rows.filter((n) => !seen.has(n.id))];
        });
        setPage(payload.page ?? pageNum);
        setTotalPages(payload.total_pages ?? 0);
        setCount(payload.count ?? 0);
        if (activeTab === "unread")
          dispatch(setUnreadCount(payload.count ?? 0));
      } catch (err) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        )
          return;
        setError(getErrorMessage(err, "Failed to load notifications."));
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [activeTab, dispatch],
  );

  // Reset + load first page whenever the tab changes
  useEffect(() => {
    setItems([]);
    setPage(0);
    setTotalPages(0);
    setCount(0);
    fetchPage(1);
    return () => abortRef.current && abortRef.current.abort();
  }, [fetchPage]);

  const hasMore = page < totalPages;

  const sentinelRef = useRef(null);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore)
      fetchPage(page + 1, { append: true });
  }, [loadingMore, loading, hasMore, page, fetchPage]);

  // Infinite scroll: load next page when the bottom sentinel comes into view.
  // The observer is re-created after every page load, so if the sentinel is
  // still visible (short list / few results after filtering) it loads again.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore || error) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, error, handleLoadMore, items.length]);

  // Rows already being marked (prevents double clicks)
  const readingRef = useRef(new Set());

  // Click on a row (or menu item) marks ONLY that notification as read.
  // The row stays in the list with a "seen" look; it disappears on next load.
  const handleMarkRead = async (id) => {
    const target = items.find((n) => n.id === id);
    if (!target || target.is_read || readingRef.current.has(id)) return;

    readingRef.current.add(id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );

    try {
      await Api.post(ENDPOINTS.markRead(id));
      dispatch(decrementUnreadCount());
    } catch (err) {
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: false, read_at: null } : n,
        ),
      );
      setError(getErrorMessage(err, "Failed to mark as read."));
    } finally {
      readingRef.current.delete(id);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    const snapshot = items;
    setMarkingAll(true);
    setError("");
    setItems((prev) =>
      prev.map((n) =>
        n.is_read
          ? n
          : { ...n, is_read: true, read_at: new Date().toISOString() },
      ),
    );

    try {
      await Api.post(ENDPOINTS.markAllRead);
      dispatch(setUnreadCount(0));
    } catch (err) {
      setItems(snapshot);
      setError(getErrorMessage(err, "Failed to mark all as read."));
    } finally {
      setMarkingAll(false);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(q) ||
            (n.message || "").toLowerCase().includes(q) ||
            typeLabel(n.type).toLowerCase().includes(q),
        )
      : items;
    return [...filtered].sort((a, b) => {
      const diff = new Date(b.created_on) - new Date(a.created_on);
      return sort === "newest" ? diff : -diff;
    });
  }, [items, query, sort]);

  const emptyText = query
    ? "No notifications match your search."
    : activeTab === "unread"
      ? "You\u2019re all caught up."
      : "No read notifications yet.";

  return (
    <div className="ntf-page">
      <style>{styles}</style>

      {/* Header */}
      <div className="ntf-header">
        <h1 className="ntf-title">Notifications</h1>
        <div className="ntf-header-actions">
          <Button
            type="button"
            className="ntf-icon-btn is-accent"
            aria-label="AI assistant"
          >
            <SparkIcon />
          </Button>
          <Button
            type="button"
            className="ntf-icon-btn"
            aria-label="Toggle layout"
          >
            <LayoutIcon />
          </Button>
          <span className="ntf-divider" />
          <Dropdown isOpen={userOpen} toggle={() => setUserOpen((v) => !v)}>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn ntf-user-toggle"
              aria-label="User menu"
            >
              <span className="ntf-avatar">J</span>
              <ChevronDown />
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem>Profile</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Sign out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Tabs */}
      <Nav className="ntf-tabs" tabs>
        <NavItem>
          <NavLink
            className={activeTab === "unread" ? "active" : ""}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "read" ? "active" : ""}
            onClick={() => setActiveTab("read")}
          >
            Read
          </NavLink>
        </NavItem>
      </Nav>

      {/* Toolbar */}
      <div className="ntf-toolbar">
        <InputGroup className="ntf-search">
          <InputGroupText>
            <SearchIcon />
          </InputGroupText>
          <Input
            type="text"
            placeholder="Search for notification"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search for notification"
          />
        </InputGroup>

        <div className="ntf-toolbar-right">
          <Dropdown isOpen={sortOpen} toggle={() => setSortOpen((v) => !v)}>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn ntf-outline-btn"
            >
              Date and time <ChevronDown />
            </DropdownToggle>
            <DropdownMenu end>
              {SORT_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  active={sort === opt.value}
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Button
            type="button"
            className="ntf-outline-btn"
            onClick={handleMarkAllRead}
            disabled={markingAll || loading || !items.some((n) => !n.is_read)}
          >
            {markingAll ? <Spinner size="sm" /> : "Mark all as read"}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert
          color="danger"
          className="py-2 d-flex align-items-center justify-content-between"
          toggle={() => setError("")}
        >
          <span>{error}</span>
          {items.length === 0 && (
            <Button
              size="sm"
              color="danger"
              outline
              className="ms-3"
              onClick={() => fetchPage(1)}
            >
              Retry
            </Button>
          )}
        </Alert>
      )}

      {/* List */}
      {loading ? (
        <SkeletonList count={8} />
      ) : visible.length === 0 ? (
        !error && <div className="ntf-empty">{emptyText}</div>
      ) : (
        <ul className="ntf-list">
          {visible.map((n) => {
            const { Icon, bg, color } = typeMeta(n.type);
            return (
              <li
                key={n.id}
                className={`ntf-row ${
                  n.is_read
                    ? activeTab === "unread"
                      ? "is-seen"
                      : ""
                    : "is-unread"
                }`}
                role={n.is_read ? undefined : "button"}
                tabIndex={n.is_read ? undefined : 0}
                onClick={() => handleMarkRead(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMarkRead(n.id);
                  }
                }}
              >
                <span
                  className="ntf-icon"
                  style={{ background: bg, color }}
                  title={typeLabel(n.type)}
                >
                  <Icon size={18} />
                </span>

                <div className="ntf-body">
                  <p className="ntf-row-title">{n.title}</p>
                  <p className="ntf-row-desc">{n.message}</p>
                  <span
                    className="ntf-time"
                    title={
                      n.created_on
                        ? new Date(n.created_on).toLocaleString()
                        : ""
                    }
                  >
                    <ClockIcon size={11} />
                    {formatTime(n.created_on)}
                  </span>
                </div>

                <div
                  className="ntf-side"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {!n.is_read && (
                    <span className="ntf-dot" aria-label="Unread" />
                  )}
                  <RowMenu notification={n} onMarkRead={handleMarkRead} />
                </div>
              </li>
            );
          })}
          {loadingMore &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={`sk-${i}`} index={i} />
            ))}
        </ul>
      )}

      {/* Infinite scroll sentinel + end state */}
      {!loading && hasMore && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}
      {!loading && !hasMore && items.length > 0 && totalPages > 1 && (
        <div className="ntf-end">You&rsquo;ve reached the end</div>
      )}
    </div>
  );
};

export default Notifications;
