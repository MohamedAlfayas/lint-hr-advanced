import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { DetailSkeleton } from "../../../../component/common/skeleton/Skeleton";
import { Modal, ModalBody, ModalFooter, Spinner } from "reactstrap";
import { Api } from "../../../../common/api/Api";
import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";
import { getLabel, getEmployeeName } from "../../Task/Modal/Taskhelpers";
import TaskChecklist from "./TaskCheckList";
import DateTimePicker from "../../../../component/common/dateTimePicker/DateTimePicker";
import {
  toggleRSBView,
  setFormObj,
  setComponentToShow,
} from "../../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setComments } from "../../../../redux/reducers/ChildReducer/CommentReducer";
import { editProject } from "../../../../redux/reducers/ChildReducer/ProjectsReducer";
import { editTask } from "../../../../redux/reducers/ChildReducer/TaskReducer";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import TaskCommentSection from "./TaskCommentSection";
import { EDIT_PROJECT_ACCESS_KEY } from "../../../../common/constant/RoleConstants";
import { testId, itemTestKey } from "../../../../shared/testing/testId";

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_LABELS = {
  assigned_to: "Assigned To",
  task_status: "Status",
  task_priority: "Priority",
  start_time: "Start Time",
  end_time: "End Time",
  title: "Title",
  description: "Description",
  related_to: "Related To",
  project: "Project",
  client: "Client",
  task: "Task",
  collaborators_id_list: "Collaborators",
  points: "Points",
};

const ACTION_META = {
  created: { icon: "ri-add-circle-fill", color: "#22c55e", label: "Created" },
  updated: { icon: "ri-edit-circle-fill", color: "#3b82f6", label: "Updated" },
  deleted: { icon: "ri-close-circle-fill", color: "#ef4444", label: "Deleted" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

const parseIdList = (rawValue) => {
  if (Array.isArray(rawValue)) return rawValue.map((v) => String(v).trim());
  if (rawValue === null || rawValue === undefined || rawValue === "") return [];
  const str = String(rawValue).trim();
  try {
    const parsed = JSON.parse(str.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim());
  } catch {}
  return str
    .replace(/[\[\]'"]/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const matchId = (a, b) => String(a).trim() === String(b).trim();

const getAllEmployees = () => {
  const fromEmployee = GetLocalStorageData("employee") || [];
  const fromEmployees = GetLocalStorageData("employees") || [];
  const map = new Map();
  [...fromEmployee, ...fromEmployees].forEach((e) => {
    if (e?.id !== undefined) map.set(String(e.id).trim(), e);
  });
  return Array.from(map.values());
};

const resolveEmployeeObj = (rawId, allEmployees) => {
  if (rawId === null || rawId === undefined || rawId === "") return null;
  const strId = String(rawId).trim();
  return allEmployees.find((e) => matchId(e.id, strId)) || null;
};

const resolveEmployeeName = (rawId, allEmployees) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const strId = String(rawId).trim();
  const emp = resolveEmployeeObj(strId, allEmployees);
  if (emp)
    return (
      emp.full_name ||
      emp.name ||
      [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
      `#${strId}`
    );
  return lookupEmployeeName(strId) || `#${strId}`;
};

const lookupEmployeeName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "";
  const name = getEmployeeName(Number(rawId));
  return name && name !== "-" ? name : "";
};

const resolveStatusName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const list = GetLocalStorageData("task_status") || [];
  const found = list.find((s) => matchId(s.id, rawId));
  return found ? found.name || String(rawId) : String(rawId);
};

const resolveStatusObj = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return null;
  const list = GetLocalStorageData("task_status") || [];
  return list.find((s) => matchId(s.id, rawId)) || null;
};

const resolvePriorityName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const list = GetLocalStorageData("task_priority") || [];
  const found = list.find((p) => matchId(p.id, rawId));
  return found ? found.name || String(rawId) : String(rawId);
};

const resolvePriorityObj = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return null;
  const list = GetLocalStorageData("task_priority") || [];
  return list.find((p) => matchId(p.id, rawId)) || null;
};

const resolveProjectName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const list = GetLocalStorageData("projects") || [];
  const found = list.find((p) => matchId(p.id, rawId));
  if (found)
    return found.name || found.project_name || found.title || String(rawId);
  return getLabel("projects", Number(rawId), "name") || String(rawId);
};

const resolveClientName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const list = GetLocalStorageData("clients") || [];
  const found = list.find((c) => matchId(c.id, rawId));
  if (found)
    return (
      found.name || found.client_name || found.company_name || String(rawId)
    );
  return getLabel("clients", Number(rawId), "name") || String(rawId);
};

const resolveTaskName = (rawId) => {
  if (rawId === null || rawId === undefined || rawId === "") return "—";
  const str = String(rawId).trim();
  if (str.toLowerCase().startsWith("added task:") || isNaN(Number(str)))
    return str;
  const list =
    GetLocalStorageData("tasks") || GetLocalStorageData("task_list") || [];
  const found = list.find((t) => matchId(t.id, str));
  return found
    ? found.title || found.name || found.task_name || `Task #${str}`
    : `Task #${str}`;
};

const resolveFieldValue = (fieldName, rawValue, allEmployees) => {
  if (rawValue === null || rawValue === undefined || rawValue === "")
    return "—";
  if (fieldName === "collaborators_id_list") {
    const ids = parseIdList(rawValue);
    if (!ids.length) return "—";
    return ids.map((id) => resolveEmployeeName(id, allEmployees)).join(", ");
  }
  if (fieldName === "assigned_to")
    return resolveEmployeeName(rawValue, allEmployees);
  if (fieldName === "task_status") return resolveStatusName(rawValue);
  if (fieldName === "task_priority") return resolvePriorityName(rawValue);
  if (fieldName === "project") return resolveProjectName(rawValue);
  if (fieldName === "client") return resolveClientName(rawValue);
  if (fieldName === "task") return resolveTaskName(rawValue);
  if (fieldName === "start_time" || fieldName === "end_time")
    return fmt(rawValue);
  return String(rawValue);
};

const isPdf = (url = "") =>
  url.toLowerCase().endsWith(".pdf") ||
  url.toLowerCase().includes(".pdf?") ||
  url.toLowerCase().includes("/pdf");

const downloadFile = (url, filename) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || url.split("/").pop() || "file";
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ─── Build employee display name ──────────────────────────────────────────────

const getDisplayName = (emp) =>
  emp
    ? emp.full_name ||
      emp.name ||
      [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
      ""
    : "";

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

const Avatar = ({ emp, size = 28 }) => {
  if (!emp || typeof emp !== "object") return null;
  const displayName = getDisplayName(emp);
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const bg = AVATAR_COLORS[(Number(emp.id) || 0) % AVATAR_COLORS.length];
  const profileUrl = emp.profile_url || emp.profile || emp.avatar || null;
  if (profileUrl) {
    return (
      <img
        src={profileUrl}
        alt={displayName}
        title={displayName}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px #dee2e6",
        }}
      />
    );
  }
  return (
    <span
      title={displayName}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: "2px solid #fff",
        boxShadow: "0 0 0 1px #dee2e6",
      }}
    >
      {initials}
    </span>
  );
};

const InitialsAvatar = ({ name = "", id = 0, size = 28 }) => {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const bg = AVATAR_COLORS[id % AVATAR_COLORS.length];
  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: "2px solid #fff",
        boxShadow: "0 0 0 1px #dee2e6",
      }}
    >
      {initials}
    </span>
  );
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, children }) => (
  <div className="d-flex align-items-start mb-2">
    <span
      className="text-muted fw-semibold flex-shrink-0"
      style={{ minWidth: 130, fontSize: "0.78rem", paddingTop: 2 }}
    >
      {label}
    </span>
    <span style={{ fontSize: "0.85rem" }}>{children ?? "—"}</span>
  </div>
);

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const Lightbox = ({ items, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex || 0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % items.length);
      if (e.key === "ArrowLeft")
        setCurrent((c) => (c - 1 + items.length) % items.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  if (!items.length) return null;
  const item = items[current];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        data-testid="task-detail-close-button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 22,
          background: "rgba(255,255,255,0.15)",
          border: "none",
          color: "#fff",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 22,
          zIndex: 2,
        }}
      >
        <i className="ri-close-line" />
      </button>
      {items.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            fontSize: "0.82rem",
            background: "rgba(0,0,0,0.45)",
            borderRadius: 20,
            padding: "3px 14px",
          }}
        >
          {current + 1} / {items.length}
        </div>
      )}
      {items.length > 1 && (
        <button
          data-testid="task-detail-back-button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((c) => (c - 1 + items.length) % items.length);
          }}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 46,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 24,
            zIndex: 2,
          }}
        >
          <i className="ri-arrow-left-s-line" />
        </button>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "88vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img
          key={item.url}
          src={item.url}
          alt={item.name}
          style={{
            maxWidth: "88vw",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 8,
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        />
        {item.name && (
          <span
            style={{
              color: "#d1d5db",
              fontSize: "0.78rem",
              textAlign: "center",
            }}
          >
            {item.name}
          </span>
        )}
      </div>
      {items.length > 1 && (
        <button
          data-testid="task-detail-next-button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((c) => (c + 1) % items.length);
          }}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 46,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 24,
            zIndex: 2,
          }}
        >
          <i className="ri-arrow-right-s-line" />
        </button>
      )}
      {items.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            padding: "6px 12px",
            background: "rgba(0,0,0,0.45)",
            borderRadius: 12,
            maxWidth: "90vw",
            overflowX: "auto",
          }}
        >
          {items.map((it, i) => (
            <img
              key={i}
              src={it.url}
              alt={it.name}
              onClick={() => setCurrent(i)}
              style={{
                width: 48,
                height: 38,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "pointer",
                flexShrink: 0,
                border:
                  i === current ? "2px solid #3b82f6" : "2px solid transparent",
                opacity: i === current ? 1 : 0.55,
                transition: "opacity .15s, border-color .15s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── AttachmentGrid ───────────────────────────────────────────────────────────

const AttachmentGrid = ({
  attachments = [],
  isPreview = false,
  onRemoveIndex,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const imageItems = useMemo(
    () =>
      attachments
        .map((a, origIdx) => ({
          url: isPreview ? a.previewUrl : a.attachment_url,
          name: isPreview ? a.name : (a.attachment_url || "").split("/").pop(),
          origIdx,
        }))
        .filter((a) => !isPdf(a.url || "")),
    [attachments, isPreview],
  );

  const origToLightbox = useMemo(() => {
    const m = {};
    imageItems.forEach((item, li) => {
      m[item.origIdx] = li;
    });
    return m;
  }, [imageItems]);

  if (!attachments.length) return null;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mt-2">
        {attachments.map((att, idx) => {
          const url = isPreview ? att.previewUrl : att.attachment_url;
          const name = isPreview
            ? att.name
            : (att.attachment_url || "").split("/").pop();
          const pdf = isPdf(url || "");
          return (
            <div
              key={idx}
              style={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                width: 72,
                flexShrink: 0,
              }}
            >
              {pdf ? (
                <div
                  title={`Download ${name}`}
                  onClick={() => downloadFile(url, name)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: "#fff3f3",
                    border: "1px solid #fca5a5",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="ri-file-download-line"
                    style={{ fontSize: 26, color: "#ef4444" }}
                  />
                  <span
                    style={{
                      fontSize: "0.58rem",
                      color: "#ef4444",
                      marginTop: 2,
                    }}
                  >
                    PDF
                  </span>
                </div>
              ) : (
                <div
                  title="Click to view"
                  onClick={() => setLightboxIndex(origToLightbox[idx] ?? 0)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={url}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              {isPreview && onRemoveIndex && (
                <button
                  data-testid={testId("task-detail-close", itemTestKey(att), "button")}
                  type="button"
                  onClick={() => onRemoveIndex(idx)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 11,
                  }}
                >
                  <i className="ri-close-line" />
                </button>
              )}
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "#6b7280",
                  marginTop: 3,
                  maxWidth: 68,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {name || (pdf ? "file.pdf" : "image")}
              </span>
            </div>
          );
        })}
      </div>
      {lightboxIndex !== null && imageItems.length > 0 && (
        <Lightbox
          items={imageItems}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

// ─── CollaboratorMultiSelect ──────────────────────────────────────────────────
// Shows localStorage employees by default.
// On typing, debounces 400ms then hits /employee/get-data-on-search/?search=
// Merges API results with localStorage so selected chips never disappear.

const CollaboratorMultiSelect = ({ selectedIds, allEmployees, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const containerRef = useRef(null);
  const searchDebounce = useRef(null);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearchText("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Focus search input when dropdown opens ────────────────────────────────
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Search: debounce 400ms, fall back to localStorage filter ─────────────
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!searchText.trim()) {
      // Empty search → show all localStorage employees
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await Api.get(
          `/employee/get-data-on-search/?search=${encodeURIComponent(searchText.trim())}`,
        );
        const apiResults = res?.data?.data || [];
        // Normalise API shape to match localStorage shape
        const normalised = apiResults.map((e) => ({
          ...e,
          id: e.id ?? e.value,
        }));
        setSearchResults(normalised);
      } catch {
        // Fallback: filter localStorage on network error
        const q = searchText.toLowerCase();
        const filtered = allEmployees.filter((e) => {
          const name = getDisplayName(e).toLowerCase();
          const empId = (e.emp_id || "").toLowerCase();
          return name.includes(q) || empId.includes(q);
        });
        setSearchResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchDebounce.current);
  }, [searchText, allEmployees]);

  // ── Displayed list: search results OR full localStorage list ─────────────
  const displayList = searchText.trim() ? searchResults : allEmployees;

  // ── Toggle a collaborator in/out ──────────────────────────────────────────
  const toggle = (id) => {
    const strId = String(id);
    const exists = selectedIds.includes(strId);
    onChange(
      exists ? selectedIds.filter((x) => x !== strId) : [...selectedIds, strId],
    );
  };

  // ── Resolve selected chips — merge localStorage + any API-fetched objects ─
  // so chips always show name+avatar even for API-only results
  const selectedEmps = selectedIds
    .map((id) => {
      // Check localStorage first
      const fromLocal = resolveEmployeeObj(id, allEmployees);
      if (fromLocal) return fromLocal;
      // Check current search results (API data)
      return searchResults.find((e) => matchId(e.id, id)) || null;
    })
    .filter(Boolean);

  return (
    <div ref={containerRef} className={`tdm-ms${open ? " is-open" : ""}`}>
      {/* ── Selected chips + open trigger ── */}
      <div className="tdm-ms-trigger" onClick={() => setOpen((v) => !v)}>
        <i className="ri-user-add-line tdm-ms-lead" />
        {selectedEmps.length === 0 ? (
          <span className="tdm-ms-placeholder">Select collaborators…</span>
        ) : (
          selectedEmps.map((emp) => (
            <span key={emp.id} className="tdm-ms-chip">
              <Avatar emp={emp} size={18} />
              <span className="text-truncate">{getDisplayName(emp) || `#${emp.id}`}</span>
              <button
                data-testid={testId("task-detail-remove", itemTestKey(emp), "button")}
                type="button"
                className="tdm-ms-chip-x"
                aria-label="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(emp.id);
                }}
              >
                <i className="ri-close-line" />
              </button>
            </span>
          ))
        )}
        <i className="ri-arrow-down-s-line tdm-ms-caret" />
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="tdm-ms-menu">
          {/* ── Search input ── */}
          <div className="tdm-ms-search">
            <i className="ri-search-line" />
            <input
              data-testid="task-detail-search-by-name-or-input"
              ref={searchRef}
              type="text"
              placeholder="Search by name or employee ID…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searching && (
              <Spinner
                size="sm"
                style={{ width: 14, height: 14, borderWidth: 2, flexShrink: 0 }}
              />
            )}
            {searchText && !searching && (
              <button
                data-testid="task-detail-clear-search-button"
                type="button"
                className="tdm-ms-clear"
                aria-label="Clear search"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchText("");
                  setSearchResults([]);
                  searchRef.current?.focus();
                }}
              >
                <i className="ri-close-line" />
              </button>
            )}
          </div>

          {/* ── Employee list ── */}
          <div className="tdm-ms-list">
            {!searching && displayList.length === 0 ? (
              <div className="tdm-ms-empty">
                <i className="ri-user-search-line" />
                {searchText ? "No employees found" : "No employees available"}
              </div>
            ) : (
              displayList.map((emp) => {
                const checked = selectedIds.includes(String(emp.id));
                const name = getDisplayName(emp) || `#${emp.id}`;
                const empId = emp.emp_id || "";
                return (
                  <div
                    key={emp.id}
                    className={`tdm-ms-option${checked ? " is-selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(emp.id);
                    }}
                  >
                    <Avatar emp={emp} size={28} />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="tdm-ms-name">{name}</div>
                      {empId && <div className="tdm-ms-sub">{empId}</div>}
                    </div>
                    <span className="tdm-ms-check">
                      <i className="ri-check-line" />
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Property Select (themed dropdown for priority / status) ─────────────────

const PropertySelect = ({ value, options, onChange, placeholder = "Select…", icon, testId: baseId }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => matchId(o.id, value));

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id) => {
    setOpen(false);
    if (!matchId(id ?? "", value ?? "")) onChange(id);
  };

  return (
    <div ref={ref} className={`tdm-ps${open ? " is-open" : ""}`}>
      <button
        type="button"
        data-testid={testId(baseId, "trigger")}
        className="tdm-ps-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span
            className="tdm-ps-badge"
            style={{
              "--c": selected.color || "var(--vz-secondary-color)",
            }}
          >
            <span className="tdm-dot" />
            {selected.name}
          </span>
        ) : (
          <span className="tdm-ps-placeholder">
            {icon && <i className={icon} />}
            {placeholder}
          </span>
        )}
        <i className="ri-arrow-down-s-line tdm-ps-caret" />
      </button>

      {open && (
        <div className="tdm-ps-menu" role="listbox">
          {options.length === 0 && (
            <div className="tdm-ms-empty">No options available</div>
          )}
          {options.map((o) => {
            const isSel = matchId(o.id, value);
            return (
              <button
                data-testid={testId(baseId, "option", itemTestKey(o))}
                type="button"
                key={o.id}
                role="option"
                aria-selected={isSel}
                className={`tdm-ps-option${isSel ? " is-selected" : ""}`}
                style={{ "--c": o.color || "var(--vz-secondary-color)" }}
                onClick={() => pick(String(o.id))}
              >
                <span className="tdm-ps-swatch" />
                <span className="flex-grow-1 text-truncate">{o.name}</span>
                {isSel && <i className="ri-check-line tdm-ps-tick" />}
              </button>
            );
          })}
          {selected && (
            <>
              <div className="tdm-ps-sep" />
              <button
                data-testid={testId(baseId, "clear-button")}
                type="button"
                className="tdm-ps-option is-clear"
                onClick={() => pick(null)}
              >
                <i className="ri-close-circle-line" />
                Clear selection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AutoSave Field Wrapper (shows saving indicator per field) ────────────────

const FieldSaveIndicator = ({ saving, saved }) => {
  if (!saving && !saved) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: "0.65rem",
        fontWeight: 600,
        marginLeft: 6,
        padding: "1px 7px",
        borderRadius: 20,
        background: saving ? "#eff6ff" : "#f0fdf4",
        color: saving ? "#3b82f6" : "#16a34a",
        border: `1px solid ${saving ? "#bfdbfe" : "#bbf7d0"}`,
        transition: "all .2s",
      }}
    >
      {saving ? (
        <>
          <Spinner
            size="sm"
            style={{ width: 9, height: 9, borderWidth: 1.5 }}
          />{" "}
          Saving
        </>
      ) : (
        <>
          <i className="ri-check-line" style={{ fontSize: 10 }} /> Saved
        </>
      )}
    </span>
  );
};

// ─── TaskDetailModal (main) ───────────────────────────────────────────────────

const TaskDetailModal = ({
  isOpen,
  toggle,
  taskId,
  dispatch,
  task_list_component_name,
  onTaskClosed,
  onTaskDeleted,
}) => {
  const reduxDispatch = useDispatch();

  // ── Read the live task list so we can merge updates back into it ───────────
  const { tasks } = useSelector((state) => state.TaskReducer);
  const checklistItems = useSelector(
    (state) => state.CheckListReducer?.checklist_data || [],
  );
  // Keep a ref to the latest list so autoSaveField (a stable useCallback)
  // never closes over a stale copy.
  const tasksRef = useRef([]);
  useEffect(() => {
    tasksRef.current = Array.isArray(tasks) ? tasks : [];
  }, [tasks]);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Inline edit state ─────────────────────────────────────────────────────
  const [editFields, setEditFields] = useState({
    task_status: null,
    task_priority: null,
    collaborators_id_list: [],
    start_time: "",
    end_time: "",
  });

  // Per-field saving/saved indicators
  const [fieldSaving, setFieldSaving] = useState({});
  const [fieldSaved, setFieldSaved] = useState({});
  const savedTimers = useRef({});

  const allEmployees = useMemo(() => getAllEmployees(), []);
  // const statusList = useMemo(
  //   () => GetLocalStorageData("task_status") || [],
  //   [],
  // );
  const statusList = useMemo(() => {
  const all = GetLocalStorageData("task_status") || [];
    return all.filter(
      (s) =>
        s.status !== false ||
        String(s.id) === String(editFields.task_status),
    );
  }, [editFields.task_status]);
  const priorityList = useMemo(
    () => GetLocalStorageData("task_priority") || [],
    [],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    setTask(null);
    setFieldSaving({});
    setFieldSaved({});
    try {
      const res = await Api.get(`/task/get-task-detail/${taskId}`);
      const taskData = res?.data?.data || null;
      setTask(taskData);

      if (taskData?.comments) {
        reduxDispatch(setComments(taskData.comments));
      }

      if (taskData) {
        setEditFields({
          task_status: taskData.task_status
            ? String(taskData.task_status)
            : null,
          task_priority: taskData.task_priority
            ? String(taskData.task_priority)
            : null,
          collaborators_id_list: parseIdList(taskData.collaborators_id_list),
          start_time: toDatetimeLocal(taskData.start_time),
          end_time: toDatetimeLocal(taskData.end_time),
        });
      }
    } catch (err) {
      console.error("Task Detail Fetch Error:", err);
      setError("Failed to load task details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [taskId, reduxDispatch]);

  useEffect(() => {
    if (isOpen) fetchTask();
  }, [isOpen, fetchTask]);

  // ── Auto-save on field change ─────────────────────────────────────────────

  const autoSaveField = useCallback(
    async (fieldKey, newEditFields) => {
      if (!task) return;

      setFieldSaving((prev) => ({ ...prev, [fieldKey]: true }));
      setFieldSaved((prev) => ({ ...prev, [fieldKey]: false }));

      if (savedTimers.current[fieldKey]) {
        clearTimeout(savedTimers.current[fieldKey]);
      }

      try {
        const payload = {
          id: task.id,
          title: task.title,
          description: task.description,
          related_to: task.related_to,
          project: task.project || null,
          client: task.client || null,
          points: task.points || "",
          assigned_to: task.assigned_to || null,
          collaborators_id_list:
            newEditFields.collaborators_id_list.map(Number),
          task_status: newEditFields.task_status
            ? Number(newEditFields.task_status)
            : null,
          task_priority: newEditFields.task_priority
            ? Number(newEditFields.task_priority)
            : null,
          start_time: newEditFields.start_time
            ? new Date(newEditFields.start_time).toISOString()
            : null,
          end_time: newEditFields.end_time
            ? new Date(newEditFields.end_time).toISOString()
            : null,
        };

        const response = await Api.put("/task/", payload);
        const responseData = response?.data?.data;

        // ✅ Update local task state with fresh task_data
        const updatedTask = responseData?.task_data || responseData;
        if (updatedTask && updatedTask.id !== undefined) {
          setTask((prev) => ({ ...prev, ...updatedTask }));

          // ✅ Immediately sync the task list (Tasks.jsx reads
          // state.TaskReducer.tasks). Merge onto the existing list row so
          // list-only fields (e.g. collaborator_details) aren't lost when the
          // PUT response is partial.
          const existing = tasksRef.current.find(
            (t) => String(t.id) === String(updatedTask.id),
          );
          reduxDispatch(editTask({ ...(existing || {}), ...updatedTask }));
        }

        // ✅ Immediately sync project progress in Redux
        // API returns updated task_status_details inside project_data on every task save
        const projectData = responseData?.project_data;
        if (projectData) {
          reduxDispatch(editProject(projectData));
        }

        setFieldSaving((prev) => ({ ...prev, [fieldKey]: false }));
        setFieldSaved((prev) => ({ ...prev, [fieldKey]: true }));

        savedTimers.current[fieldKey] = setTimeout(() => {
          setFieldSaved((prev) => ({ ...prev, [fieldKey]: false }));
        }, 2000);
      } catch (err) {
        console.error("Auto-save error:", err);
        toast.error(err?.response?.data?.message || "Failed to save changes.");
        setFieldSaving((prev) => ({ ...prev, [fieldKey]: false }));
      }
    },
    [task, reduxDispatch],
  );

  // Debounce timers for datetime fields
  const debounceTimers = useRef({});

  const updateEditField = useCallback(
    (key, value, debounceMs = 0) => {
      setEditFields((prev) => {
        const next = { ...prev, [key]: value };

        if (debounceMs > 0) {
          if (debounceTimers.current[key])
            clearTimeout(debounceTimers.current[key]);
          debounceTimers.current[key] = setTimeout(() => {
            autoSaveField(key, next);
          }, debounceMs);
        } else {
          autoSaveField(key, next);
        }

        return next;
      });
    },
    [autoSaveField],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
      Object.values(savedTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const assigneeEmp = useMemo(
    () =>
      task?.assigned_to
        ? resolveEmployeeObj(task.assigned_to, allEmployees)
        : null,
    [task, allEmployees],
  );

  const assigneeName = useMemo(() => {
    if (!task?.assigned_to) return "—";
    if (assigneeEmp)
      return getDisplayName(assigneeEmp) || `#${task.assigned_to}`;
    return resolveEmployeeName(task.assigned_to, allEmployees);
  }, [task, assigneeEmp, allEmployees]);

  const statusObj = useMemo(
    () =>
      editFields.task_status ? resolveStatusObj(editFields.task_status) : null,
    [editFields.task_status],
  );

  const priorityObj = useMemo(
    () =>
      editFields.task_priority
        ? resolvePriorityObj(editFields.task_priority)
        : null,
    [editFields.task_priority],
  );

  const projectName = useMemo(
    () =>
      task?.related_to === "project" && task.project
        ? resolveProjectName(task.project)
        : null,
    [task],
  );

  const clientName = useMemo(
    () =>
      task?.related_to === "client" && task.client
        ? resolveClientName(task.client)
        : null,
    [task],
  );

  const activities = useMemo(
    () =>
      task
        ? [...(task.activities || [])].sort(
            (a, b) => new Date(b.created_on) - new Date(a.created_on),
          )
        : [],
    [task],
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleEditTask = () => {
    if (!task || !dispatch) return;
    dispatch(
      setFormObj({
        id: task.id,
        title: task.title || "",
        description: task.description || "",
        related_to: task.related_to || "project",
        project: task.project || null,
        client: task.client || null,
        points: task.points || "",
        assigned_to: task.assigned_to || null,
        collaborators_id_list: task.collaborators_id_list || [],
        task_status: task.task_status || null,
        task_priority: task.task_priority || null,
        start_time: task.start_time || "",
        end_time: task.end_time || "",
      }),
    );
    dispatch(setComponentToShow(task_list_component_name));
    dispatch(toggleRSBView(true));
    toggle();
  };

  const handleDeleteTask = async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    setDeleting(true);
    try {
      const response = await Api.delete("/task/", { data: { id } });
      await Swal.fire({
        title: "Deleted!",
        text: response?.data?.message || "Task Deleted Successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      onTaskDeleted?.();
      toggle();
    } catch (err) {
      console.error("Delete task error:", err);
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Failed to delete task.",
        icon: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const isSavingAny = Object.values(fieldSaving).some(Boolean);

  const canEditProject = useMemo(() => {
    const profile = JSON.parse(localStorage.getItem("lint_hr_profile_data") || "{}");
    return (
      profile?.is_admin === true ||
      (profile?.permission_list || []).includes(EDIT_PROJECT_ACCESS_KEY)
    );
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const hasAssignee = !!task?.assigned_to;
  const checklistDone = checklistItems.filter((i) => i.checked).length;
  const checklistPct = checklistItems.length
    ? Math.round((checklistDone / checklistItems.length) * 100)
    : 0;
  const collaboratorCount = (editFields.collaborators_id_list || []).length;
  const dueInfo = (() => {
    if (!editFields.end_time) return { label: "No due date", tone: "secondary" };
    const end = new Date(editFields.end_time);
    if (Number.isNaN(end.getTime())) return { label: "No due date", tone: "secondary" };
    const days = Math.ceil((end - new Date()) / 86400000);
    if (days < 0) return { label: `Overdue by ${-days} day${days === -1 ? "" : "s"}`, tone: "danger" };
    if (days === 0) return { label: "Due today", tone: "warning" };
    if (days <= 2) return { label: `Due in ${days} day${days === 1 ? "" : "s"}`, tone: "warning" };
    return { label: `Due in ${days} days`, tone: "success" };
  })();
  const durationLabel = (() => {
    if (!editFields.start_time || !editFields.end_time) return "—";
    const ms = new Date(editFields.end_time) - new Date(editFields.start_time);
    if (!(ms > 0)) return "—";
    const h = Math.round(ms / 3600000);
    if (h < 24) return `${h || "<1"} hr${h === 1 ? "" : "s"}`;
    const d = Math.round(h / 24);
    return `${d} day${d === 1 ? "" : "s"}`;
  })();
  const accent = statusObj?.color || "var(--vz-primary)";
  const statusTint = (color) =>
    color ? { background: `${color}1f`, color, borderColor: `${color}55` } : undefined;

  return (
    <Modal
      data-testid="task-detail-task-detail-dialog"
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      scrollable
      centered
      className="task-detail-modal"
      contentClassName="tdm-content"
    >
      {/* ── Header ── */}
      <div className="tdm-header" style={{ "--tdm-accent": accent }}>
        <span className="tdm-header-icon">
          <i className="ri-task-line" />
        </span>
        <div className="tdm-header-text">
          <div className="tdm-header-top">
            {task && <span className="tdm-id">#{task.id}</span>}
            {statusObj && (
              <span className="tdm-chip" style={statusTint(statusObj.color)}>
                <span className="tdm-dot" style={{ background: statusObj.color }} />
                {statusObj.name}
              </span>
            )}
            {priorityObj && (
              <span className="tdm-chip" style={statusTint(priorityObj.color)}>
                <i className="ri-flag-2-line" />
                {priorityObj.name}
              </span>
            )}
            {isSavingAny && (
              <span className="tdm-chip is-saving">
                <Spinner size="sm" style={{ width: 9, height: 9, borderWidth: 1.5 }} />
                Auto-saving…
              </span>
            )}
          </div>
          <h5 className="tdm-title" title={task?.title}>
            {task ? task.title : "Task Detail"}
          </h5>
          {task && (
            <div className="tdm-header-meta">
              <span>
                <i className="ri-user-3-line" />
                {hasAssignee ? assigneeName : "Unassigned"}
              </span>
              <span className={`text-${dueInfo.tone}`}>
                <i className="ri-calendar-event-line" />
                {dueInfo.label}
              </span>
              {checklistItems.length > 0 && (
                <span>
                  <i className="ri-checkbox-multiple-line" />
                  {checklistDone}/{checklistItems.length} done
                </span>
              )}
            </div>
          )}
        </div>
        <button data-testid="task-detail-task-detail-close-button" type="button" className="tdm-close" onClick={toggle} aria-label="Close">
          <i className="ri-close-line" />
        </button>
      </div>

      {/* ── Body ── */}
      <ModalBody className="p-0 tdm-body">
        {loading && (
          <div className="p-4">
            <DetailSkeleton sections={2} testId="task-detail-loading-skeleton" label="Loading task details" />
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-danger m-3">
            <i className="ri-error-warning-line me-2" />
            {error}
          </div>
        )}

        {!loading && !error && task && (
          <div className="tdm-stack">
            <div className="tdm-stats">
              <div className={`tdm-stat is-${dueInfo.tone}`}>
                <span className="tdm-stat-icon"><i className="ri-calendar-event-line" /></span>
                <div className="min-w-0">
                  <div className="tdm-stat-label">Due</div>
                  <div className="tdm-stat-value">{dueInfo.label}</div>
                </div>
              </div>
              <div className="tdm-stat is-info">
                <span className="tdm-stat-icon"><i className="ri-timer-line" /></span>
                <div className="min-w-0">
                  <div className="tdm-stat-label">Duration</div>
                  <div className="tdm-stat-value">{durationLabel}</div>
                </div>
              </div>
              <div className="tdm-stat is-success">
                <span
                  className="tdm-ring"
                  style={{ "--pct": checklistPct }}
                  aria-label={`${checklistPct}% complete`}
                >
                  <span>{checklistPct}%</span>
                </span>
                <div className="min-w-0">
                  <div className="tdm-stat-label">Checklist</div>
                  <div className="tdm-stat-value">
                    {checklistItems.length
                      ? `${checklistDone} of ${checklistItems.length} done`
                      : "No items"}
                  </div>
                </div>
              </div>
              <div className="tdm-stat is-primary">
                <span className="tdm-stat-icon"><i className="ri-team-line" /></span>
                <div className="min-w-0">
                  <div className="tdm-stat-label">Collaborators</div>
                  <div className="tdm-stat-value">
                    {collaboratorCount ? `${collaboratorCount} member${collaboratorCount === 1 ? "" : "s"}` : "None"}
                  </div>
                </div>
              </div>
            </div>

            <div className="tdm-grid tdm-card">
              {/* ── Left: overview ── */}
              <div className="tdm-main">
                <div className="tdm-assignee">
                  {hasAssignee ? (
                    assigneeEmp ? (
                      <Avatar emp={assigneeEmp} size={46} />
                    ) : (
                      <InitialsAvatar name={assigneeName} id={Number(task.assigned_to) || 0} size={46} />
                    )
                  ) : (
                    <span className="tdm-assignee-empty">
                      <i className="ri-user-unfollow-line" />
                    </span>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <div className="tdm-label">Assigned To</div>
                    <div className={`tdm-assignee-name${hasAssignee ? "" : " is-empty"}`}>
                      {hasAssignee ? assigneeName : "Unassigned"}
                    </div>
                  </div>
                  {statusObj && (
                    <span className="tdm-chip is-solid" style={{ background: statusObj.color }}>
                      {statusObj.name}
                    </span>
                  )}
                </div>

                <div className="tdm-facts">
                  <div className="tdm-fact">
                    <span className="tdm-fact-icon"><i className="ri-hashtag" /></span>
                    <div>
                      <div className="tdm-label">Task ID</div>
                      <div className="tdm-value">#{task.id}</div>
                    </div>
                  </div>
                  <div className="tdm-fact">
                    <span className="tdm-fact-icon"><i className="ri-links-line" /></span>
                    <div>
                      <div className="tdm-label">Related To</div>
                      <div className="tdm-value text-capitalize">{task.related_to || "—"}</div>
                    </div>
                  </div>
                  {task.related_to === "project" && task.project && (
                    <div className="tdm-fact is-wide">
                      <span className="tdm-fact-icon is-primary"><i className="ri-folder-2-line" /></span>
                      <div className="min-w-0">
                        <div className="tdm-label">Project</div>
                        <div className="tdm-value text-truncate">
                          {projectName || resolveProjectName(task.project)}
                        </div>
                      </div>
                    </div>
                  )}
                  {task.related_to === "client" && task.client && (
                    <div className="tdm-fact is-wide">
                      <span className="tdm-fact-icon is-info"><i className="ri-building-line" /></span>
                      <div className="min-w-0">
                        <div className="tdm-label">Client</div>
                        <div className="tdm-value text-truncate">
                          {clientName || resolveClientName(task.client)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="tdm-field">
                  <label className="tdm-label d-flex align-items-center gap-1">
                    <i className="ri-team-line" />
                    Collaborators
                    <FieldSaveIndicator
                      saving={fieldSaving.collaborators_id_list}
                      saved={fieldSaved.collaborators_id_list}
                    />
                  </label>
                  <CollaboratorMultiSelect
                    selectedIds={editFields.collaborators_id_list}
                    allEmployees={allEmployees}
                    onChange={(ids) => updateEditField("collaborators_id_list", ids)}
                  />
                </div>

                {task.description && (
                  <div className="tdm-field">
                    <label className="tdm-label d-flex align-items-center gap-1">
                      <i className="ri-file-text-line" />
                      Description
                    </label>
                    <p className="tdm-description">{task.description}</p>
                  </div>
                )}
              </div>

              {/* ── Right: properties ── */}
              <div className="tdm-side">
                <div className="tdm-side-title">
                  <i className="ri-equalizer-line" />
                  Properties
                </div>

                <div className="tdm-props">
                  <div className="tdm-prop">
                    <label className="tdm-label d-flex align-items-center gap-1">
                      <i className="ri-flag-2-line" />
                      Priority
                      <FieldSaveIndicator saving={fieldSaving.task_priority} saved={fieldSaved.task_priority} />
                    </label>
                    <PropertySelect
                      value={editFields.task_priority}
                      options={priorityList}
                      placeholder="Set priority"
                      testId="task-detail-priority"
                      icon="ri-flag-2-line"
                      onChange={(v) => updateEditField("task_priority", v)}
                    />
                  </div>

                  <div className="tdm-prop">
                    <label className="tdm-label d-flex align-items-center gap-1">
                      <i className="ri-checkbox-circle-line" />
                      Status
                      <FieldSaveIndicator saving={fieldSaving.task_status} saved={fieldSaved.task_status} />
                    </label>
                    <PropertySelect
                      value={editFields.task_status}
                      options={statusList}
                      placeholder="Set status"
                      testId="task-detail-status"
                      icon="ri-checkbox-circle-line"
                      onChange={(v) => updateEditField("task_status", v)}
                    />
                  </div>

                  <div className="tdm-prop">
                    <label className="tdm-label d-flex align-items-center gap-1">
                      <i className="ri-play-circle-line" />
                      Start Time
                      <FieldSaveIndicator saving={fieldSaving.start_time} saved={fieldSaved.start_time} />
                    </label>
                    <DateTimePicker
                      className="tdm-dtp"
                      value={editFields.start_time}
                      placeholder="Set start time"
                      testId="task-detail-start-time"
                      icon="ri-play-circle-line"
                      onChange={(v) => updateEditField("start_time", v)}
                    />
                  </div>

                  <div className="tdm-prop">
                    <label className="tdm-label d-flex align-items-center gap-1">
                      <i className="ri-stop-circle-line" />
                      End Time
                      <FieldSaveIndicator saving={fieldSaving.end_time} saved={fieldSaved.end_time} />
                    </label>
                    <DateTimePicker
                      className="tdm-dtp"
                      value={editFields.end_time}
                      placeholder="Set end time"
                      testId="task-detail-end-time"
                      icon="ri-stop-circle-line"
                      onChange={(v) => updateEditField("end_time", v)}
                    />
                  </div>
                </div>

                <div className="tdm-meta">
                  <div className="tdm-meta-item">
                    <i className="ri-calendar-line" />
                    <div>
                      <div className="tdm-label">Created</div>
                      <div className="tdm-value">{fmt(task.created_on) || "—"}</div>
                    </div>
                  </div>
                  <div className="tdm-meta-item">
                    <i className="ri-refresh-line" />
                    <div>
                      <div className="tdm-label">Last Updated</div>
                      <div className="tdm-value">{fmt(task.updated_on) || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="tdm-autosave">
                  <i className="ri-cloud-line" />
                  Changes are saved automatically
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="tdm-card tdm-embed">
              <TaskChecklist
                taskId={taskId}
                checklistData={task?.task_checklists || []}
              />
            </div>

            {/* Comments */}
            <div className="tdm-card tdm-embed">
              <TaskCommentSection taskId={taskId} allEmployees={allEmployees} />
            </div>

            {/* Activity Log */}
            <div className="tdm-section tdm-card">
              <div className="tdm-section-title">
                <i className="ri-history-line" />
                Activity Log
                {activities.length > 0 && (
                  <span className="tdm-count">{activities.length}</span>
                )}
              </div>

              {activities.length === 0 ? (
                <div className="tdm-empty">
                  <i className="ri-inbox-line" />
                  No activity recorded yet.
                </div>
              ) : (
                <div className="tdm-timeline">
                  {activities.map((activity) => {
                    const meta =
                      ACTION_META[activity.action] || ACTION_META.updated;
                    const actorEmp = resolveEmployeeObj(
                      activity.activity_by,
                      allEmployees,
                    );
                    const actorName = actorEmp
                      ? getDisplayName(actorEmp) ||
                        `User #${activity.activity_by}`
                      : lookupEmployeeName(activity.activity_by) ||
                        (activity.activity_by
                          ? `User #${activity.activity_by}`
                          : "System");

                    return (
                      <div key={activity.id} className="tdm-tl-item">
                        <span
                          className="tdm-tl-dot"
                          style={{
                            color: meta.color,
                            background: `${meta.color}1f`,
                            borderColor: meta.color,
                          }}
                        >
                          <i className={meta.icon} />
                        </span>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="tdm-tl-head">
                            <span className="tdm-tl-actor">{actorName}</span>
                            <span
                              className="tdm-chip"
                              style={{
                                background: `${meta.color}1f`,
                                color: meta.color,
                                borderColor: `${meta.color}55`,
                              }}
                            >
                              {meta.label}
                            </span>
                            <span className="tdm-tl-time">
                              <i className="ri-time-line" />
                              {fmt(activity.created_on)}
                            </span>
                          </div>
                          {activity.logs?.length > 0 && (
                            <div className="tdm-tl-logs">
                              {activity.logs.map((log, li) => {
                                const fieldLabel =
                                  FIELD_LABELS[log.field_name] ||
                                  log.field_name;
                                if (activity.action === "created") {
                                  return (
                                    <div key={log.id ?? li} className="tdm-tl-log">
                                      <span className="tdm-tl-field">{fieldLabel}</span>
                                      <span className="tdm-tl-new">
                                        {resolveFieldValue(
                                          log.field_name,
                                          log.new_value,
                                          allEmployees,
                                        )}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={log.id ?? li} className="tdm-tl-log">
                                    <span className="tdm-tl-field">{fieldLabel}</span>
                                    <span className="tdm-tl-old">
                                      {resolveFieldValue(
                                        log.field_name,
                                        log.old_value,
                                        allEmployees,
                                      )}
                                    </span>
                                    <i className="ri-arrow-right-line tdm-tl-arrow" />
                                    <span className="tdm-tl-new">
                                      {resolveFieldValue(
                                        log.field_name,
                                        log.new_value,
                                        allEmployees,
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      {/* ── Footer ── */}
      {!loading && !error && task && (
        <ModalFooter className="d-flex justify-content-between border-top py-2">
          <div className="d-flex gap-2">
            {canEditProject && (
              <button
                data-testid="task-detail-task-detail-delete-task-button"
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteTask(taskId)}
                disabled={deleting || isSavingAny}
              >
                {deleting ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <i className="ri-delete-bin-line me-1" />
                )}
                Delete Task
              </button>
            )}
          </div>
          <div className="d-flex gap-2 align-items-center">
            {isSavingAny && (
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                <Spinner
                  size="sm"
                  style={{ width: 10, height: 10, borderWidth: 1.5 }}
                  className="me-1"
                />
                Saving changes…
              </span>
            )}
            {canEditProject && (
              <button
                data-testid="task-detail-task-detail-edit-task-button"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleEditTask}
                disabled={isSavingAny}
              >
                <i className="ri-edit-line me-1" />
                Edit Task
              </button>
            )}
          </div>
        </ModalFooter>
      )}
      <style>{`
        .task-detail-modal .tdm-content{border:0;border-radius:16px;overflow:hidden;background:var(--vz-secondary-bg);box-shadow:0 24px 60px -20px rgba(0,0,0,.35)}
        .task-detail-modal .tdm-header{position:relative;display:flex;align-items:center;gap:14px;padding:20px 22px 16px;border-bottom:1px solid var(--vz-border-color);
          background:linear-gradient(135deg,rgba(var(--vz-primary-rgb),.12),rgba(var(--vz-info-rgb),.06) 60%,transparent)}
        .task-detail-modal .tdm-header-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:21px;color:#fff;
          background:linear-gradient(135deg,var(--vz-primary),rgba(var(--vz-primary-rgb),.7));box-shadow:0 6px 16px -6px rgba(var(--vz-primary-rgb),.7)}
        .task-detail-modal .tdm-header-text{flex:1;min-width:0}
        .task-detail-modal .tdm-header-top{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:4px}
        .task-detail-modal .tdm-title{margin:0;font-size:1.08rem;font-weight:600;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .task-detail-modal .tdm-id{font-size:.72rem;font-weight:600;padding:2px 8px;border-radius:6px;color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.12)}
        .task-detail-modal .tdm-chip{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;font-weight:600;padding:2px 9px;border-radius:999px;
          border:1px solid transparent;line-height:1.5;white-space:nowrap;color:var(--vz-secondary-color);background:rgba(var(--vz-secondary-rgb),.12)}
        .task-detail-modal .tdm-chip i{font-size:12px;line-height:1}
        .task-detail-modal .tdm-chip.is-solid{color:#fff;border:0}
        .task-detail-modal .tdm-chip.is-saving{color:var(--vz-warning);background:rgba(var(--vz-warning-rgb),.12);border-color:rgba(var(--vz-warning-rgb),.35)}
        .task-detail-modal .tdm-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block}
        .task-detail-modal .tdm-close{width:34px;height:34px;flex-shrink:0;border-radius:10px;border:1px solid var(--vz-border-color);display:grid;place-items:center;
          background:var(--vz-secondary-bg);color:var(--vz-secondary-color);font-size:18px;transition:all .15s}
        .task-detail-modal .tdm-close:hover{color:var(--vz-danger);border-color:rgba(var(--vz-danger-rgb),.4);background:rgba(var(--vz-danger-rgb),.08)}

        .task-detail-modal .tdm-header::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:var(--tdm-accent)}
        .task-detail-modal .tdm-header-meta{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:4px;font-size:.76rem;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-header-meta span{display:inline-flex;align-items:center;gap:5px}
        .task-detail-modal .tdm-header-meta i{font-size:13px;line-height:1}

        .task-detail-modal .tdm-stack{display:flex;flex-direction:column;gap:16px;padding:18px}
        .task-detail-modal .tdm-card{background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);border-radius:14px;overflow:hidden;
          box-shadow:0 1px 2px rgba(0,0,0,.04),0 6px 18px -12px rgba(0,0,0,.18)}
        .task-detail-modal .tdm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        @media (max-width:991.98px){.task-detail-modal .tdm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        .task-detail-modal .tdm-stat{--tone:var(--vz-secondary-rgb);position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;overflow:hidden;
          background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color)}
        .task-detail-modal .tdm-stat::after{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:rgb(var(--tone))}
        .task-detail-modal .tdm-stat.is-primary{--tone:var(--vz-primary-rgb)}
        .task-detail-modal .tdm-stat.is-info{--tone:var(--vz-info-rgb)}
        .task-detail-modal .tdm-stat.is-success{--tone:var(--vz-success-rgb)}
        .task-detail-modal .tdm-stat.is-warning{--tone:var(--vz-warning-rgb)}
        .task-detail-modal .tdm-stat.is-danger{--tone:var(--vz-danger-rgb)}
        .task-detail-modal .tdm-stat-icon{width:38px;height:38px;flex-shrink:0;border-radius:11px;display:grid;place-items:center;font-size:18px;
          color:rgb(var(--tone));background:rgba(var(--tone),.13)}
        .task-detail-modal .tdm-stat-label{font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.55px;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-stat-value{font-size:.86rem;font-weight:600;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .task-detail-modal .tdm-stat.is-danger .tdm-stat-value,.task-detail-modal .tdm-stat.is-warning .tdm-stat-value{color:rgb(var(--tone))}
        .task-detail-modal .tdm-ring{width:38px;height:38px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;
          background:conic-gradient(rgb(var(--tone)) calc(var(--pct) * 1%),rgba(var(--tone),.15) 0)}
        .task-detail-modal .tdm-ring span{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:.6rem;font-weight:700;
          color:rgb(var(--tone));background:var(--vz-secondary-bg)}
        .task-detail-modal .tdm-body{background:var(--vz-tertiary-bg)}
        .task-detail-modal .tdm-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}
        @media (max-width:991.98px){.task-detail-modal .tdm-grid{grid-template-columns:1fr}}
        .task-detail-modal .tdm-main{padding:22px;display:flex;flex-direction:column;gap:18px;min-width:0}
        .task-detail-modal .tdm-side{padding:22px;background:rgba(var(--vz-primary-rgb),.035);border-left:1px solid var(--vz-border-color);display:flex;flex-direction:column;gap:16px;min-width:0}
        @media (max-width:991.98px){.task-detail-modal .tdm-side{border-left:0;border-top:1px solid var(--vz-border-color)}}

        .task-detail-modal .tdm-label{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.55px;color:var(--vz-secondary-color);margin-bottom:4px}
        .task-detail-modal .tdm-label i{font-size:13px;line-height:1}
        .task-detail-modal .tdm-value{font-size:.86rem;font-weight:500;color:var(--vz-heading-color)}

        .task-detail-modal .tdm-assignee{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;border:1px solid var(--vz-border-color);
          background:linear-gradient(135deg,rgba(var(--vz-primary-rgb),.08),rgba(var(--vz-primary-rgb),.02))}
        .task-detail-modal .tdm-assignee .tdm-label{margin-bottom:2px}
        .task-detail-modal .tdm-assignee-name{font-size:.98rem;font-weight:600;color:var(--vz-heading-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .task-detail-modal .tdm-assignee-name.is-empty{color:var(--vz-secondary-color);font-style:italic;font-weight:500}
        .task-detail-modal .tdm-assignee-empty{width:46px;height:46px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:20px;
          color:var(--vz-secondary-color);background:rgba(var(--vz-secondary-rgb),.12);border:1px dashed rgba(var(--vz-secondary-rgb),.45)}

        .task-detail-modal .tdm-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .task-detail-modal .tdm-fact{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);min-width:0}
        .task-detail-modal .tdm-fact.is-wide{grid-column:1 / -1}
        .task-detail-modal .tdm-fact .tdm-label{margin-bottom:1px}
        .task-detail-modal .tdm-fact-icon{width:34px;height:34px;flex-shrink:0;border-radius:10px;display:grid;place-items:center;font-size:16px;
          color:var(--vz-secondary-color);background:rgba(var(--vz-secondary-rgb),.12)}
        .task-detail-modal .tdm-fact-icon.is-primary{color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.12)}
        .task-detail-modal .tdm-fact-icon.is-info{color:var(--vz-info);background:rgba(var(--vz-info-rgb),.12)}

        .task-detail-modal .tdm-field .tdm-label{margin-bottom:6px}
        .task-detail-modal .tdm-description{margin:0;padding:12px 14px;border-radius:12px;font-size:.85rem;line-height:1.6;white-space:pre-wrap;
          color:var(--vz-body-color);background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color)}

        .task-detail-modal .tdm-side-title{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--vz-heading-color)}
        .task-detail-modal .tdm-side-title i{color:var(--vz-primary);font-size:15px}
        .task-detail-modal .tdm-props{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
        .task-detail-modal .tdm-control{position:relative;display:flex;align-items:center}
        .task-detail-modal .tdm-control .tdm-dot{position:absolute;left:13px;z-index:1;pointer-events:none;box-shadow:0 0 0 3px rgba(var(--vz-secondary-rgb),.12)}
        .task-detail-modal .tdm-control-icon{position:absolute;left:12px;z-index:1;font-size:15px;line-height:1;color:var(--vz-secondary-color);pointer-events:none;transition:color .15s}
        .task-detail-modal .tdm-control .form-select,
        .task-detail-modal .tdm-control .form-control{height:40px;border-radius:10px;font-size:.84rem;font-weight:500;padding-left:12px;
          background-color:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);color:var(--vz-heading-color);
          box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s,box-shadow .15s,background-color .15s}
        .task-detail-modal .tdm-control .tdm-dot ~ .form-select{padding-left:30px}
        .task-detail-modal .tdm-control.has-icon .form-control{padding-left:36px;padding-right:10px}
        .task-detail-modal .tdm-dtp{min-height:40px;font-size:.84rem}
        .task-detail-modal .tdm-control .form-select:hover,
        .task-detail-modal .tdm-control .form-control:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
        .task-detail-modal .tdm-control .form-select:focus,
        .task-detail-modal .tdm-control .form-control:focus{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15);outline:0}
        .task-detail-modal .tdm-control:focus-within .tdm-control-icon{color:var(--vz-primary)}
        .task-detail-modal .tdm-control input[type="datetime-local"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.55;padding:4px;border-radius:6px;transition:opacity .15s,background-color .15s}
        .task-detail-modal .tdm-control input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover{opacity:1;background-color:rgba(var(--vz-primary-rgb),.12)}
        .task-detail-modal .tdm-control input[type="datetime-local"]::-webkit-datetime-edit{color:var(--vz-heading-color)}
        .task-detail-modal .tdm-control input[type="datetime-local"]:not(:valid)::-webkit-datetime-edit,
        .task-detail-modal .tdm-control input[type="datetime-local"][value=""]::-webkit-datetime-edit{color:var(--vz-secondary-color);font-weight:400}
        [data-bs-theme="dark"] .task-detail-modal .tdm-control input[type="datetime-local"]{color-scheme:dark}

        .task-detail-modal .tdm-ps{position:relative}
        .task-detail-modal .tdm-ps-trigger{width:100%;height:40px;display:flex;align-items:center;gap:8px;padding:0 34px 0 8px;position:relative;text-align:left;
          border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:0 1px 2px rgba(0,0,0,.04);
          color:var(--vz-heading-color);transition:border-color .15s,box-shadow .15s}
        .task-detail-modal .tdm-ps-trigger:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
        .task-detail-modal .tdm-ps.is-open .tdm-ps-trigger,.task-detail-modal .tdm-ps-trigger:focus-visible{outline:0;border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .task-detail-modal .tdm-ps-badge{display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:4px 11px 4px 9px;border-radius:999px;
          font-size:.8rem;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 35%,transparent);
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .task-detail-modal .tdm-ps-badge .tdm-dot{background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 22%,transparent)}
        .task-detail-modal .tdm-ps-placeholder{display:inline-flex;align-items:center;gap:7px;padding-left:4px;font-size:.84rem;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ps-caret{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--vz-secondary-color);transition:transform .2s,color .15s}
        .task-detail-modal .tdm-ps.is-open .tdm-ps-caret{transform:translateY(-50%) rotate(180deg);color:var(--vz-primary)}
        .task-detail-modal .tdm-ps-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;min-width:180px;z-index:1060;padding:6px;max-height:260px;overflow-y:auto;
          border-radius:12px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:0 16px 40px -12px rgba(0,0,0,.3);animation:tdmPop .14s ease-out}
        .task-detail-modal .tdm-ps-option{width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border:0;border-radius:8px;background:transparent;text-align:left;
          font-size:.83rem;font-weight:500;color:var(--vz-heading-color);transition:background-color .12s}
        .task-detail-modal .tdm-ps-option:hover{background:color-mix(in srgb,var(--c,var(--vz-primary)) 10%,transparent)}
        .task-detail-modal .tdm-ps-option.is-selected{background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);font-weight:600}
        .task-detail-modal .tdm-ps-swatch{width:10px;height:10px;flex-shrink:0;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 20%,transparent)}
        .task-detail-modal .tdm-ps-tick{font-size:16px;line-height:1}
        .task-detail-modal .tdm-ps-sep{height:1px;margin:5px 4px;background:var(--vz-border-color)}
        .task-detail-modal .tdm-ps-option.is-clear{color:var(--vz-secondary-color);font-weight:500}
        .task-detail-modal .tdm-ps-option.is-clear:hover{color:var(--vz-danger);background:rgba(var(--vz-danger-rgb),.08)}
        .task-detail-modal .tdm-ps-option.is-clear i{font-size:15px}
        .task-detail-modal .tdm-grid.tdm-card{overflow:visible}
        .task-detail-modal .tdm-grid.tdm-card .tdm-side{border-radius:0 14px 14px 0}
        @media (max-width:991.98px){.task-detail-modal .tdm-grid.tdm-card .tdm-side{border-radius:0 0 14px 14px}}

        .task-detail-modal .tdm-ms{position:relative}
        .task-detail-modal .tdm-ms-trigger{min-height:42px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 36px 6px 36px;position:relative;cursor:pointer;
          border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s,box-shadow .15s}
        .task-detail-modal .tdm-ms-trigger:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
        .task-detail-modal .tdm-ms.is-open .tdm-ms-trigger{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .task-detail-modal .tdm-ms-lead{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ms.is-open .tdm-ms-lead{color:var(--vz-primary)}
        .task-detail-modal .tdm-ms-caret{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--vz-secondary-color);transition:transform .2s}
        .task-detail-modal .tdm-ms.is-open .tdm-ms-caret{transform:translateY(-50%) rotate(180deg);color:var(--vz-primary)}
        .task-detail-modal .tdm-ms-placeholder{font-size:.84rem;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ms-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:3px 4px 3px 4px;border-radius:999px;font-size:.78rem;font-weight:500;
          color:var(--vz-heading-color);background:rgba(var(--vz-primary-rgb),.08);border:1px solid rgba(var(--vz-primary-rgb),.2)}
        .task-detail-modal .tdm-ms-chip-x{width:18px;height:18px;flex-shrink:0;display:grid;place-items:center;padding:0;border:0;border-radius:50%;font-size:12px;
          background:transparent;color:var(--vz-secondary-color);transition:all .15s}
        .task-detail-modal .tdm-ms-chip-x:hover{background:rgba(var(--vz-danger-rgb),.15);color:var(--vz-danger)}
        .task-detail-modal .tdm-ms-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:1060;display:flex;flex-direction:column;overflow:hidden;
          border-radius:12px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:0 16px 40px -12px rgba(0,0,0,.3);animation:tdmPop .14s ease-out}
        @keyframes tdmPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .task-detail-modal .tdm-ms-search{display:flex;align-items:center;gap:8px;margin:8px;padding:0 10px;height:36px;border-radius:8px;
          background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color)}
        .task-detail-modal .tdm-ms-search:focus-within{border-color:var(--vz-primary)}
        .task-detail-modal .tdm-ms-search > i{color:var(--vz-secondary-color);font-size:15px}
        .task-detail-modal .tdm-ms-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:.82rem;color:var(--vz-body-color)}
        .task-detail-modal .tdm-ms-search input::placeholder{color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ms-clear{border:0;padding:0;background:transparent;color:var(--vz-secondary-color);font-size:15px;line-height:1}
        .task-detail-modal .tdm-ms-clear:hover{color:var(--vz-danger)}
        .task-detail-modal .tdm-ms-list{max-height:230px;overflow-y:auto;padding:0 6px 6px}
        .task-detail-modal .tdm-ms-empty{display:flex;align-items:center;justify-content:center;gap:6px;padding:16px;font-size:.82rem;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ms-option{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:.83rem;transition:background-color .12s}
        .task-detail-modal .tdm-ms-option:hover{background:rgba(var(--vz-primary-rgb),.06)}
        .task-detail-modal .tdm-ms-option.is-selected{background:rgba(var(--vz-primary-rgb),.1)}
        .task-detail-modal .tdm-ms-name{color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .task-detail-modal .tdm-ms-option.is-selected .tdm-ms-name{font-weight:600}
        .task-detail-modal .tdm-ms-sub{font-size:.72rem;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-ms-check{width:20px;height:20px;flex-shrink:0;border-radius:6px;display:grid;place-items:center;font-size:13px;color:transparent;
          border:1.5px solid rgba(var(--vz-secondary-rgb),.4);transition:all .12s}
        .task-detail-modal .tdm-ms-option.is-selected .tdm-ms-check{color:#fff;background:var(--vz-primary);border-color:var(--vz-primary)}

        .task-detail-modal .tdm-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding-top:14px;border-top:1px dashed var(--vz-border-color)}
        .task-detail-modal .tdm-meta-item{display:flex;align-items:flex-start;gap:9px;min-width:0}
        .task-detail-modal .tdm-meta-item > i{font-size:15px;color:var(--vz-secondary-color);margin-top:1px}
        .task-detail-modal .tdm-meta-item .tdm-label{margin-bottom:1px}
        .task-detail-modal .tdm-meta-item .tdm-value{font-size:.8rem}
        .task-detail-modal .tdm-autosave{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;margin-top:auto;font-size:.72rem;font-weight:500;
          padding:4px 10px;border-radius:999px;color:var(--vz-success);background:rgba(var(--vz-success-rgb),.1)}

        .task-detail-modal .tdm-embed > .p-4{padding:18px 20px !important;border:0 !important;background:transparent !important}
        .task-detail-modal .tdm-embed > .p-4 h6{color:var(--vz-heading-color) !important;font-size:.8rem !important}
        .task-detail-modal .tdm-body .btn{display:inline-flex;align-items:center;gap:4px}
        .task-detail-modal .tdm-body .btn i,.task-detail-modal .modal-footer .btn i{line-height:1}

        .task-detail-modal .tdm-section{padding:20px 22px}
        .task-detail-modal .tdm-section-title{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--vz-heading-color)}
        .task-detail-modal .tdm-section-title > i{color:var(--vz-primary);font-size:15px}
        .task-detail-modal .tdm-count{font-size:.68rem;padding:1px 8px;border-radius:999px;color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.12)}
        .task-detail-modal .tdm-empty{text-align:center;padding:22px;border-radius:12px;font-size:.85rem;color:var(--vz-secondary-color);border:1px dashed var(--vz-border-color)}
        .task-detail-modal .tdm-empty i{display:block;font-size:22px;margin-bottom:4px}

        .task-detail-modal .tdm-timeline{position:relative}
        .task-detail-modal .tdm-timeline::before{content:"";position:absolute;left:15px;top:8px;bottom:8px;width:2px;background:var(--vz-border-color)}
        .task-detail-modal .tdm-tl-item{position:relative;display:flex;gap:14px;padding-bottom:18px}
        .task-detail-modal .tdm-tl-item:last-child{padding-bottom:0}
        .task-detail-modal .tdm-tl-dot{position:relative;z-index:1;width:32px;height:32px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;font-size:14px;
          border:2px solid;box-shadow:0 0 0 4px var(--vz-secondary-bg)}
        .task-detail-modal .tdm-tl-head{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-height:32px;margin-bottom:4px}
        .task-detail-modal .tdm-tl-actor{font-size:.84rem;font-weight:600;color:var(--vz-heading-color)}
        .task-detail-modal .tdm-tl-time{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:.72rem;color:var(--vz-secondary-color);white-space:nowrap}
        .task-detail-modal .tdm-tl-logs{border-radius:10px;overflow:hidden;border:1px solid var(--vz-border-color);background:var(--vz-tertiary-bg);font-size:.8rem}
        .task-detail-modal .tdm-tl-log{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px}
        .task-detail-modal .tdm-tl-log + .tdm-tl-log{border-top:1px solid var(--vz-border-color)}
        .task-detail-modal .tdm-tl-field{min-width:130px;flex-shrink:0;font-size:.76rem;font-weight:500;color:var(--vz-secondary-color)}
        .task-detail-modal .tdm-tl-old{padding:1px 8px;border-radius:6px;color:var(--vz-danger);background:rgba(var(--vz-danger-rgb),.08);text-decoration:line-through}
        .task-detail-modal .tdm-tl-new{padding:1px 8px;border-radius:6px;font-weight:500;color:var(--vz-success);background:rgba(var(--vz-success-rgb),.1)}
        .task-detail-modal .tdm-tl-arrow{color:var(--vz-secondary-color)}

        .task-detail-modal .modal-footer{padding:12px 22px !important;background:var(--vz-tertiary-bg);border-top:1px solid var(--vz-border-color)}
        .task-detail-modal .modal-footer .btn{display:inline-flex;align-items:center;gap:4px;border-radius:8px}
      `}</style>
    </Modal>
  );
};

export default TaskDetailModal;
