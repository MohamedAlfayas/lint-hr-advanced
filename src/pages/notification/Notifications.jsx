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
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Spinner,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { Api } from "../../common/api/Api";

import {
  decrementUnreadCount,
  setUnreadCount,
} from "../../redux/reducers/ChildReducer/NotificationReducer";
import { testId, itemTestKey } from "../../shared/testing/testId";

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

const dayGroup = (iso) => {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "Earlier";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d >= today) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= yesterday) return "Yesterday";
  return "Earlier";
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
  attendance: { Icon: ClockIcon, bg: "rgba(10,179,156,.13)", color: "#0ab39c" },
  reminder: { Icon: ClockIcon, bg: "rgba(10,179,156,.13)", color: "#0ab39c" },
  leave: { Icon: CalendarIcon, bg: "rgba(247,164,29,.15)", color: "#f7a41d" },
  task: { Icon: TaskIcon, bg: "rgba(64,81,137,.12)", color: "#6a7cc4" },
  meeting: { Icon: MeetingIcon, bg: "rgba(124,92,245,.13)", color: "#7c5cf5" },
  blocker: { Icon: AlertIcon, bg: "rgba(240,101,72,.13)", color: "#f06548" },
  default: { Icon: BellIcon, bg: "rgba(135,138,153,.15)", color: "#878a99" },
};

const typeMeta = (type) =>
  TYPE_META[String(type || "").toLowerCase()] || TYPE_META.default;

/* Falls back to keywords in the title when the backend type is missing/unknown. */
const resolveType = (n) => {
  const type = String(n?.type || "").toLowerCase();
  if (TYPE_META[type] && type !== "default") return type;
  const title = String(n?.title || "").toLowerCase();
  const match = Object.keys(TYPE_META).find(
    (key) => key !== "default" && title.includes(key),
  );
  return match || type || "general";
};

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const styles = `
.ntf-page {
  --ntf-bg:var(--vz-secondary-bg); --ntf-text:var(--vz-heading-color, var(--vz-body-color)); --ntf-muted:var(--vz-secondary-color);
  --ntf-border:var(--vz-border-color); --ntf-hover:rgba(var(--vz-primary-rgb), .04);
  --ntf-skel-a:#efeff3; --ntf-skel-b:#f8f8fb;
  color:var(--ntf-text); font-size:13px;
}
[data-bs-theme="dark"] .ntf-page { --ntf-skel-a:#2a2f34; --ntf-skel-b:#32383e; }

.ntf-card { background:var(--ntf-bg); border:1px solid var(--ntf-border); border-radius:16px; box-shadow:0 2px 10px rgba(15,23,42,.04); overflow:hidden; }

/* Header */
.ntf-hero {
  display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:20px 22px;
  background:var(--app-head-tint), var(--vz-secondary-bg);
  border-bottom:1px solid var(--ntf-border);
}
.ntf-hero-left { display:flex; align-items:center; gap:14px; min-width:0; }
.ntf-hero-icon {
  position:relative; width:46px; height:46px; flex:0 0 46px; border-radius:13px;
  display:inline-flex; align-items:center; justify-content:center; color:#fff;
  background:linear-gradient(135deg, var(--vz-success), color-mix(in srgb, var(--vz-success) 55%, var(--vz-info)));
  box-shadow:0 6px 16px color-mix(in srgb, var(--vz-success) 32%, transparent);
}
.ntf-hero-badge {
  position:absolute; top:-6px; right:-6px; min-width:20px; height:20px; padding:0 5px; border-radius:999px;
  background:var(--vz-danger); color:#fff; font-size:11px; font-weight:700; line-height:20px; text-align:center;
  border:2px solid var(--ntf-bg);
}
.ntf-title { font-size:18px; font-weight:700; margin:0; color:var(--ntf-text); }
.ntf-subtitle { font-size:12.5px; color:var(--ntf-muted); margin-top:2px; }
.ntf-primary-btn {
  display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border-radius:10px;
  border:1px solid transparent; background:var(--vz-success); color:#fff; font-size:13px; font-weight:600;
  box-shadow:0 6px 14px color-mix(in srgb, var(--vz-success) 30%, transparent); transition:all .15s ease;
}
.ntf-primary-btn:hover:not(:disabled) { transform:translateY(-1px); color:#fff; background:color-mix(in srgb, var(--vz-success) 88%, #000); }
.ntf-primary-btn:disabled { opacity:.5; box-shadow:none; cursor:not-allowed; }

/* Toolbar */
.ntf-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 22px; border-bottom:1px solid var(--ntf-border); }
.ntf-seg { display:inline-flex; padding:4px; gap:4px; border-radius:12px; background:var(--vz-tertiary-bg, var(--vz-light)); }
.ntf-seg-btn {
  display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 14px; border:0; border-radius:9px;
  background:transparent; color:var(--ntf-muted); font-size:13px; font-weight:500; transition:all .15s ease;
}
.ntf-seg-btn:hover { color:var(--ntf-text); }
.ntf-seg-btn.is-active { background:var(--ntf-bg); color:var(--vz-primary); font-weight:600; box-shadow:0 1px 4px rgba(15,23,42,.1); }
.ntf-seg-count { min-width:20px; height:18px; padding:0 6px; border-radius:999px; font-size:11px; font-weight:700; line-height:18px; text-align:center; background:rgba(var(--vz-primary-rgb), .12); color:var(--vz-primary); }
.ntf-toolbar-right { display:flex; align-items:center; gap:8px; flex:1; justify-content:flex-end; }
.ntf-search { position:relative; max-width:300px; width:100%; }
.ntf-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--ntf-muted); display:inline-flex; }
.ntf-search .form-control {
  height:36px; padding-left:34px; border-radius:10px; font-size:13px;
  background:var(--vz-tertiary-bg, var(--vz-light)); border:1px solid var(--ntf-border); color:var(--ntf-text);
}
.ntf-search .form-control:focus { border-color:rgba(var(--vz-primary-rgb), .5); box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb), .12); }
.ntf-outline-btn {
  background:var(--ntf-bg) !important; border:1px solid var(--ntf-border) !important; color:var(--ntf-text) !important;
  font-size:13px; font-weight:500; height:36px; padding:0 12px !important; border-radius:10px !important;
  display:inline-flex; align-items:center; gap:6px; box-shadow:none !important; white-space:nowrap;
}
.ntf-outline-btn:hover { border-color:rgba(var(--vz-primary-rgb), .5) !important; color:var(--vz-primary) !important; }

/* List */
.ntf-content { padding:8px 22px 18px; }
.ntf-group-label { display:flex; align-items:center; gap:10px; margin:14px 0 8px; font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; color:var(--ntf-muted); }
.ntf-group-label::after { content:""; flex:1; height:1px; background:var(--ntf-border); }
.ntf-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }

.ntf-row {
  position:relative; display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px;
  border:1px solid var(--ntf-border); background:var(--ntf-bg); transition:border-color .15s ease, background-color .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.ntf-row:hover { border-color:rgba(var(--vz-primary-rgb), .3); box-shadow:0 4px 14px rgba(15,23,42,.06); }
.ntf-row.is-unread { cursor:pointer; background:rgba(var(--vz-primary-rgb), .045); border-color:rgba(var(--vz-primary-rgb), .18); }
.ntf-row.is-unread::before { content:""; position:absolute; left:-1px; top:12px; bottom:12px; width:3px; border-radius:0 3px 3px 0; background:var(--vz-primary); }
.ntf-row.is-unread:focus { outline:none; box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb), .15); }
.ntf-row.is-seen { opacity:.7; }
.ntf-row.is-seen .ntf-row-title { font-weight:500; color:var(--ntf-muted); }

.ntf-icon { flex:0 0 42px; width:42px; height:42px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; }
.ntf-icon-skel { flex:0 0 42px; width:42px; height:42px; border-radius:12px; }
.ntf-body { flex:1; min-width:0; }
.ntf-row-head { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:3px; }
.ntf-row-title { font-size:14px; font-weight:600; color:var(--ntf-text); margin:0; }
.ntf-type { padding:1px 8px; border-radius:999px; font-size:10.5px; font-weight:600; letter-spacing:.2px; }
.ntf-row-desc { font-size:13px; color:var(--ntf-muted); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ntf-time { flex:0 0 auto; display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:var(--ntf-muted); white-space:nowrap; }

.ntf-side { position:relative; flex:0 0 32px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; }
.ntf-dot { width:9px; height:9px; border-radius:50%; background:var(--vz-primary); box-shadow:0 0 0 4px rgba(var(--vz-primary-rgb), .15); transition:opacity .15s ease; }
.ntf-side .dropdown { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .15s ease; }
.ntf-row:hover .ntf-side .dropdown, .ntf-side .dropdown.show, .ntf-side .dropdown:focus-within { opacity:1; }
.ntf-row:hover .ntf-dot, .ntf-side:focus-within .ntf-dot, .ntf-side:has(.dropdown.show) .ntf-dot { opacity:0; }
.ntf-check { display:inline-flex; color:var(--vz-success); padding:2px 6px; }
.ntf-more-toggle { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:transparent !important; border:0 !important; border-radius:8px !important; box-shadow:none !important; color:var(--ntf-muted) !important; padding:0 !important; }
.ntf-more-toggle:hover { background:rgba(var(--vz-primary-rgb), .08) !important; color:var(--vz-primary) !important; }

.ntf-empty { display:flex; flex-direction:column; align-items:center; text-align:center; padding:56px 16px; }
.ntf-empty-icon { width:72px; height:72px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:14px; color:var(--vz-success); background:rgba(var(--vz-success-rgb), .12); }
.ntf-empty-title { font-size:16px; font-weight:600; color:var(--ntf-text); }
.ntf-empty-sub { font-size:13px; color:var(--ntf-muted); margin-top:4px; }
.ntf-end { text-align:center; padding:16px 0 4px; font-size:12px; color:var(--ntf-muted); }

.ntf-skel { display:block; border-radius:4px; background:linear-gradient(90deg,var(--ntf-skel-a) 25%,var(--ntf-skel-b) 37%,var(--ntf-skel-a) 63%); background-size:400% 100%; animation:ntf-shimmer 1.4s ease infinite; }
.ntf-skel-row { pointer-events:none; }
@keyframes ntf-shimmer { 0% { background-position:100% 50%; } 100% { background-position:0 50%; } }
@media (prefers-reduced-motion: reduce) { .ntf-skel { animation:none; } }

@media (max-width: 768px) {
  .ntf-hero, .ntf-toolbar { padding:14px; }
  .ntf-content { padding:4px 14px 14px; }
  .ntf-toolbar-right { flex-basis:100%; }
  .ntf-search { max-width:100%; }
  .ntf-time { display:none; }
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
        data-testid={testId("notifications-row", notification.id, "more-actions-trigger")}
        tag="button"
        type="button"
        className="btn ntf-more-toggle"
        aria-label="More actions"
      >
        <DotsIcon />
      </DropdownToggle>
      <DropdownMenu end container="body">
        <DropdownItem data-testid={testId("notifications-row", notification.id, "mark-as-read-option")} onClick={() => onMarkRead(notification.id)}>
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

  const emptyState = query
    ? {
        icon: <SearchIcon />,
        title: "No results",
        sub: "No notifications match your search.",
      }
    : activeTab === "unread"
      ? {
          icon: <CheckIcon />,
          title: "You\u2019re all caught up",
          sub: "New notifications will show up here.",
        }
      : {
          icon: <BellIcon size={28} />,
          title: "Nothing here yet",
          sub: "Notifications you have read will appear here.",
        };

  const groups = useMemo(() => {
    const out = [];
    visible.forEach((n) => {
      const label = dayGroup(n.created_on);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    });
    return out;
  }, [visible]);

  const unreadCount = activeTab === "unread" ? count : null;
  const hasUnread = items.some((n) => !n.is_read);

  return (
    <div className="page-content">
    <Container fluid>
    <div className="ntf-page">
      <style>{styles}</style>

      <div className="ntf-card">
        {/* Header */}
        <div className="ntf-hero">
          <div className="ntf-hero-left">
            <span className="ntf-hero-icon">
              <BellIcon size={22} />
              {unreadCount > 0 && (
                <span className="ntf-hero-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <h1 className="ntf-title">Notifications</h1>
              <div className="ntf-subtitle">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                  : "Stay updated with your latest activity"}
              </div>
            </div>
          </div>

          <button
            data-testid="notifications-mark-all-as-read-button"
            type="button"
            className="ntf-primary-btn"
            onClick={handleMarkAllRead}
            disabled={markingAll || loading || !hasUnread}
          >
            {markingAll ? <Spinner size="sm" /> : <CheckIcon />}
            Mark all as read
          </button>
        </div>

        {/* Toolbar */}
        <div className="ntf-toolbar">
          <div className="ntf-seg" role="tablist">
            {[
              { id: "unread", label: "Unread" },
              { id: "read", label: "Read" },
            ].map((tab) => (
              <button
                data-testid={testId("notifications", itemTestKey(tab), "button")}
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`ntf-seg-btn ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === "unread" && unreadCount > 0 && (
                  <span className="ntf-seg-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="ntf-toolbar-right">
            <div className="ntf-search">
              <span className="ntf-search-icon">
                <SearchIcon />
              </span>
              <Input
                data-testid="notifications-search-notifications-input"
                type="text"
                placeholder="Search notifications"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search notifications"
              />
            </div>

            <Dropdown isOpen={sortOpen} toggle={() => setSortOpen((v) => !v)}>
              <DropdownToggle
                tag="button"
                type="button"
                data-testid="notifications-sort-trigger"
                className="btn ntf-outline-btn"
              >
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <ChevronDown />
              </DropdownToggle>
              <DropdownMenu end>
                {SORT_OPTIONS.map((opt) => (
                  <DropdownItem
                    data-testid={testId("notifications-sort-option", opt.value)}
                    key={opt.value}
                    active={sort === opt.value}
                    onClick={() => setSort(opt.value)}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="ntf-content">
          {/* Error */}
          {error && (
            <Alert
              color="danger"
              className="py-2 mt-3 d-flex align-items-center justify-content-between"
              toggle={() => setError("")}
            >
              <span>{error}</span>
              {items.length === 0 && (
                <Button
                  data-testid="notifications-retry-button"
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
            <div className="mt-3">
              <SkeletonList count={6} />
            </div>
          ) : visible.length === 0 ? (
            !error && (
              <div className="ntf-empty">
                <span className="ntf-empty-icon">{emptyState.icon}</span>
                <div className="ntf-empty-title">{emptyState.title}</div>
                <div className="ntf-empty-sub">{emptyState.sub}</div>
              </div>
            )
          ) : (
            <>
              {groups.map((group) => (
                <section key={group.label}>
                  <div className="ntf-group-label">{group.label}</div>
                  <ul className="ntf-list">
                    {group.items.map((n) => {
                      const { Icon, bg, color } = typeMeta(resolveType(n));
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
                            title={typeLabel(resolveType(n))}
                          >
                            <Icon size={19} />
                          </span>

                          <div className="ntf-body">
                            <div className="ntf-row-head">
                              <p className="ntf-row-title">{n.title}</p>
                              <span
                                className="ntf-type"
                                style={{ background: bg, color }}
                              >
                                {typeLabel(resolveType(n))}
                              </span>
                            </div>
                            <p className="ntf-row-desc" title={n.message}>
                              {n.message}
                            </p>
                          </div>

                          <span
                            className="ntf-time"
                            title={
                              n.created_on
                                ? new Date(n.created_on).toLocaleString()
                                : ""
                            }
                          >
                            <ClockIcon size={12} />
                            {formatTime(n.created_on)}
                          </span>

                          <div
                            className="ntf-side"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {!n.is_read && (
                              <span className="ntf-dot" aria-label="Unread" />
                            )}
                            <RowMenu
                              notification={n}
                              onMarkRead={handleMarkRead}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              {loadingMore && (
                <ul className="ntf-list mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={`sk-${i}`} index={i} />
                  ))}
                </ul>
              )}
            </>
          )}

          {/* Infinite scroll sentinel + end state */}
          {!loading && hasMore && (
            <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
          )}
          {!loading && !hasMore && items.length > 0 && totalPages > 1 && (
            <div className="ntf-end">You&rsquo;ve reached the end</div>
          )}
        </div>
      </div>
    </div>
    </Container>
    </div>
  );
};

export default Notifications;
