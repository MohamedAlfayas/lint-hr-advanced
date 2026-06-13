import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, ModalBody, ModalFooter, Spinner } from "reactstrap";
import { Api } from "../../../../common/api/Api";
import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";
import { getLabel, getEmployeeName } from "../../Task/Modal/Taskhelpers";
import TaskChecklist from "./TaskCheckList";
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
  return getEmployeeName(Number(strId)) || `#${strId}`;
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
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* ── Selected chips + open trigger ── */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          minHeight: 38,
          border: "1px solid #ced4da",
          borderRadius: 6,
          padding: "4px 8px",
          cursor: "pointer",
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
        }}
      >
        {selectedEmps.length === 0 ? (
          <span style={{ fontSize: "0.82rem", color: "#adb5bd" }}>
            Select collaborators…
          </span>
        ) : (
          selectedEmps.map((emp) => (
            <span
              key={emp.id}
              className="badge bg-light text-dark border d-inline-flex align-items-center gap-1"
              style={{
                fontSize: "0.75rem",
                padding: "3px 7px",
                fontWeight: 400,
              }}
            >
              <Avatar emp={emp} size={16} />
              {getDisplayName(emp) || `#${emp.id}`}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(emp.id);
                }}
                style={{ cursor: "pointer", marginLeft: 2, color: "#6c757d" }}
              >
                ×
              </span>
            </span>
          ))
        )}
        <i
          className={`ri-arrow-${open ? "up" : "down"}-s-line ms-auto`}
          style={{ color: "#6c757d", fontSize: "0.9rem", flexShrink: 0 }}
        />
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: 8,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Search input ── */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #f1f3f5",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i
              className="ri-search-line"
              style={{ color: "#9ca3af", fontSize: "0.9rem", flexShrink: 0 }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name or employee ID…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.82rem",
                background: "transparent",
                color: "#374151",
              }}
            />
            {searching && (
              <Spinner
                size="sm"
                style={{ width: 14, height: 14, borderWidth: 2, flexShrink: 0 }}
              />
            )}
            {searchText && !searching && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchText("");
                  setSearchResults([]);
                  searchRef.current?.focus();
                }}
                style={{
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "0.85rem",
                }}
              >
                <i className="ri-close-line" />
              </span>
            )}
          </div>

          {/* ── Employee list ── */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {!searching && displayList.length === 0 ? (
              <div
                className="px-3 py-2 text-muted"
                style={{ fontSize: "0.82rem" }}
              >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(emp.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 12px",
                      cursor: "pointer",
                      background: checked ? "#eff6ff" : "transparent",
                      fontSize: "0.83rem",
                      transition: "background .1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!checked)
                        e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = checked
                        ? "#eff6ff"
                        : "transparent";
                    }}
                  >
                    <Avatar emp={emp} size={26} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: checked ? 600 : 400,
                          color: "#374151",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {name}
                      </div>
                      {empId && (
                        <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                          {empId}
                        </div>
                      )}
                    </div>
                    {checked && (
                      <i
                        className="ri-check-line text-primary"
                        style={{ flexShrink: 0 }}
                      />
                    )}
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
  const statusList = useMemo(
    () => GetLocalStorageData("task_status") || [],
    [],
  );
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      scrollable
      centered
      className="task-detail-modal"
    >
      {/* ── Header ── */}
      <div
        className="modal-header border-bottom"
        style={{ background: "linear-gradient(135deg,#f8fafc,#e8f4fd)" }}
      >
        <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap">
          <i className="ri-task-line text-primary fs-5" />
          <span className="fw-bold" style={{ fontSize: "0.95rem" }}>
            {task ? `Task info #${task.id}` : "Task Detail"}
          </span>
          {task && (
            <span
              className="text-muted"
              style={{ fontSize: "0.85rem", fontWeight: 400 }}
            >
              — {task.title}
            </span>
          )}
          {statusObj && (
            <span
              className="badge ms-1"
              style={{
                background: statusObj.color + "22",
                color: statusObj.color,
                border: `1px solid ${statusObj.color}44`,
                fontSize: "0.7rem",
              }}
            >
              {statusObj.name}
            </span>
          )}
          {isSavingAny && (
            <span
              className="badge ms-1"
              style={{
                background: "#eff6ff",
                color: "#3b82f6",
                border: "1px solid #bfdbfe",
                fontSize: "0.68rem",
              }}
            >
              <Spinner
                size="sm"
                style={{
                  width: 9,
                  height: 9,
                  borderWidth: 1.5,
                  marginRight: 4,
                }}
              />
              Auto-saving…
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={toggle}
          aria-label="Close"
        />
      </div>

      {/* ── Body ── */}
      <ModalBody className="p-0">
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" size="sm" className="me-2" />
            <span className="text-muted">Loading task details…</span>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-danger m-3">
            <i className="ri-error-warning-line me-2" />
            {error}
          </div>
        )}

        {!loading && !error && task && (
          <>
            {/* ── Two-column info ── */}
            <div className="row g-0 border-bottom">
              {/* ── Left col ── */}
              <div
                className="col-12 col-lg-6 p-4"
                style={{ borderRight: "1px solid #e9ecef" }}
              >
                {/* Assignee card */}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded border">
                  {assigneeEmp ? (
                    <Avatar emp={assigneeEmp} size={44} />
                  ) : (
                    <InitialsAvatar
                      name={assigneeName}
                      id={Number(task.assigned_to) || 0}
                      size={44}
                    />
                  )}
                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                      {assigneeName}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.73rem" }}>
                      Assigned To
                    </div>
                  </div>
                  {statusObj && (
                    <span
                      className="badge"
                      style={{
                        background: statusObj.color,
                        color: "#fff",
                        fontSize: "0.72rem",
                        padding: "5px 10px",
                      }}
                    >
                      {statusObj.name}
                    </span>
                  )}
                </div>

                <InfoRow label="Task ID">
                  <span className="text-muted">#{task.id}</span>
                </InfoRow>
                <InfoRow label="Related To">
                  <span className="text-capitalize">
                    {task.related_to || "—"}
                  </span>
                </InfoRow>
                {task.related_to === "project" && task.project && (
                  <InfoRow label="Project">
                    <i className="ri-projector-line me-1 text-primary" />
                    {projectName || resolveProjectName(task.project)}
                  </InfoRow>
                )}
                {task.related_to === "client" && task.client && (
                  <InfoRow label="Client">
                    <i className="ri-building-line me-1 text-info" />
                    {clientName || resolveClientName(task.client)}
                  </InfoRow>
                )}

                {/* ── Collaborators (editable, auto-save, with search) ── */}
                <div className="mb-3">
                  <label
                    className="text-muted fw-semibold d-block mb-1"
                    style={{ fontSize: "0.78rem" }}
                  >
                    Collaborators
                    <FieldSaveIndicator
                      saving={fieldSaving.collaborators_id_list}
                      saved={fieldSaved.collaborators_id_list}
                    />
                  </label>
                  <CollaboratorMultiSelect
                    selectedIds={editFields.collaborators_id_list}
                    allEmployees={allEmployees}
                    onChange={(ids) =>
                      updateEditField("collaborators_id_list", ids)
                    }
                  />
                </div>

                {task.description && (
                  <div className="mt-3">
                    <div
                      className="text-muted fw-semibold mb-1"
                      style={{ fontSize: "0.78rem" }}
                    >
                      Description
                    </div>
                    <p
                      className="mb-0 text-secondary"
                      style={{
                        fontSize: "0.85rem",
                        background: "#f8fafc",
                        borderRadius: 6,
                        padding: "10px 14px",
                        borderLeft: "3px solid #3b82f6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {task.description}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Right col ── */}
              <div
                className="col-12 col-lg-6 p-4"
                style={{ background: "#f8fafc" }}
              >
                <div className="row g-3">
                  {/* ── Priority (auto-save) ── */}
                  <div className="col-6">
                    <label
                      className="text-muted fw-semibold d-flex align-items-center mb-1"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        gap: 4,
                      }}
                    >
                      Priority
                      <FieldSaveIndicator
                        saving={fieldSaving.task_priority}
                        saved={fieldSaved.task_priority}
                      />
                    </label>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: priorityObj
                          ? `1.5px solid ${priorityObj.color}55`
                          : "1.5px solid #dee2e6",
                        background: priorityObj
                          ? `${priorityObj.color}08`
                          : "#fff",
                        transition: "border-color .2s, background .2s",
                      }}
                    >
                      {priorityObj && (
                        <span
                          style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: priorityObj.color,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        />
                      )}
                      <select
                        className="form-select form-select-sm border-0 bg-transparent"
                        value={editFields.task_priority || ""}
                        onChange={(e) =>
                          updateEditField(
                            "task_priority",
                            e.target.value || null,
                          )
                        }
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          paddingLeft: priorityObj ? 26 : 10,
                          color: priorityObj ? priorityObj.color : "#495057",
                          boxShadow: "none",
                        }}
                      >
                        <option value="">— Select —</option>
                        {priorityList.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ── Status (auto-save) ── */}
                  <div className="col-6">
                    <label
                      className="text-muted fw-semibold d-flex align-items-center mb-1"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        gap: 4,
                      }}
                    >
                      Status
                      <FieldSaveIndicator
                        saving={fieldSaving.task_status}
                        saved={fieldSaved.task_status}
                      />
                    </label>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: statusObj
                          ? `1.5px solid ${statusObj.color}55`
                          : "1.5px solid #dee2e6",
                        background: statusObj ? `${statusObj.color}08` : "#fff",
                        transition: "border-color .2s, background .2s",
                      }}
                    >
                      {statusObj && (
                        <span
                          style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: statusObj.color,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        />
                      )}
                      <select
                        className="form-select form-select-sm border-0 bg-transparent"
                        value={editFields.task_status || ""}
                        onChange={(e) =>
                          updateEditField("task_status", e.target.value || null)
                        }
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          paddingLeft: statusObj ? 26 : 10,
                          color: statusObj ? statusObj.color : "#495057",
                          boxShadow: "none",
                        }}
                      >
                        <option value="">— Select —</option>
                        {statusList.map((s) => (
                          <option key={s.id} value={String(s.id)}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ── Start Time (auto-save, debounced) ── */}
                  <div className="col-6">
                    <label
                      className="text-muted fw-semibold d-flex align-items-center mb-1"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        gap: 4,
                      }}
                    >
                      Start Time
                      <FieldSaveIndicator
                        saving={fieldSaving.start_time}
                        saved={fieldSaved.start_time}
                      />
                    </label>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1.5px solid #dee2e6",
                        background: "#fff",
                      }}
                    >
                      <i
                        className="ri-calendar-event-line"
                        style={{
                          position: "absolute",
                          left: 9,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b7280",
                          fontSize: "0.85rem",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />
                      <input
                        type="datetime-local"
                        className="form-control form-control-sm border-0 bg-transparent"
                        value={editFields.start_time}
                        onChange={(e) =>
                          updateEditField("start_time", e.target.value, 800)
                        }
                        style={{
                          fontSize: "0.82rem",
                          paddingLeft: 28,
                          boxShadow: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* ── End Time (auto-save, debounced) ── */}
                  <div className="col-6">
                    <label
                      className="text-muted fw-semibold d-flex align-items-center mb-1"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        gap: 4,
                      }}
                    >
                      End Time
                      <FieldSaveIndicator
                        saving={fieldSaving.end_time}
                        saved={fieldSaved.end_time}
                      />
                    </label>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1.5px solid #dee2e6",
                        background: "#fff",
                      }}
                    >
                      <i
                        className="ri-calendar-check-line"
                        style={{
                          position: "absolute",
                          left: 9,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b7280",
                          fontSize: "0.85rem",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />
                      <input
                        type="datetime-local"
                        className="form-control form-control-sm border-0 bg-transparent"
                        value={editFields.end_time}
                        onChange={(e) =>
                          updateEditField("end_time", e.target.value, 800)
                        }
                        style={{
                          fontSize: "0.82rem",
                          paddingLeft: 28,
                          boxShadow: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Static read-only fields ── */}
                  {[
                    { label: "Created On", val: fmt(task.created_on) },
                    { label: "Updated On", val: fmt(task.updated_on) },
                  ].map(({ label, val }) => (
                    <div className="col-6" key={label}>
                      <div
                        className="text-muted fw-semibold mb-1"
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          padding: "6px 10px",
                          background: "#fff",
                          border: "1.5px solid #e9ecef",
                          borderRadius: 8,
                          color: "#374151",
                        }}
                      >
                        {val || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Auto-save info note ── */}
                <div
                  className="mt-3 d-flex align-items-center gap-1"
                  style={{ fontSize: "0.7rem", color: "#9ca3af" }}
                >
                  <i className="ri-save-3-line" />
                  Changes are saved automatically
                </div>
              </div>
            </div>

            {/* Checklist */}
            <TaskChecklist
              taskId={taskId}
              checklistData={task?.task_checklists || []}
            />

            {/* Comments */}
            <TaskCommentSection taskId={taskId} allEmployees={allEmployees} />

            {/* Activity Log */}
            <div className="p-4 border-top">
              <h6
                className="fw-bold mb-3 d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: ".6px",
                  color: "#6c757d",
                }}
              >
                <i className="ri-history-line text-primary" />
                Activity Log
              </h6>

              {activities.length === 0 ? (
                <div
                  className="text-center py-4 text-muted"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="ri-inbox-line fs-4 d-block mb-1" />
                  No activity recorded yet.
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 15,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: "#e2e8f0",
                      zIndex: 0,
                    }}
                  />
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
                      : getEmployeeName(activity.activity_by) ||
                        `User #${activity.activity_by}`;

                    return (
                      <div
                        key={activity.id}
                        className="d-flex gap-3 mb-4"
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        <div
                          className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-white"
                          style={{
                            width: 32,
                            height: 32,
                            border: `2px solid ${meta.color}`,
                          }}
                        >
                          <i
                            className={meta.icon}
                            style={{ color: meta.color, fontSize: "0.9rem" }}
                          />
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <span
                              className="fw-semibold"
                              style={{ fontSize: "0.83rem" }}
                            >
                              {actorName}
                            </span>
                            <span
                              className="badge"
                              style={{
                                background: meta.color + "22",
                                color: meta.color,
                                fontSize: "0.68rem",
                                padding: "2px 8px",
                              }}
                            >
                              {meta.label}
                            </span>
                            <span
                              className="text-muted ms-auto"
                              style={{
                                fontSize: "0.73rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmt(activity.created_on)}
                            </span>
                          </div>
                          {activity.logs?.length > 0 && (
                            <div
                              className="rounded mt-1"
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.8rem",
                                overflow: "hidden",
                              }}
                            >
                              {activity.logs.map((log, li) => {
                                const fieldLabel =
                                  FIELD_LABELS[log.field_name] ||
                                  log.field_name;
                                const isLast = li === activity.logs.length - 1;
                                const rowStyle = {
                                  padding: "7px 12px",
                                  borderBottom: isLast
                                    ? "none"
                                    : "1px solid #e9ecef",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                };
                                if (activity.action === "created") {
                                  return (
                                    <div key={log.id ?? li} style={rowStyle}>
                                      <span
                                        className="text-muted fw-medium"
                                        style={{
                                          minWidth: 130,
                                          fontSize: "0.78rem",
                                        }}
                                      >
                                        {fieldLabel}
                                      </span>
                                      <span className="text-secondary">
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
                                  <div key={log.id ?? li} style={rowStyle}>
                                    <span
                                      className="text-muted fw-medium"
                                      style={{
                                        minWidth: 130,
                                        fontSize: "0.78rem",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {fieldLabel}
                                    </span>
                                    <span className="text-danger text-decoration-line-through">
                                      {resolveFieldValue(
                                        log.field_name,
                                        log.old_value,
                                        allEmployees,
                                      )}
                                    </span>
                                    <i className="ri-arrow-right-line text-muted" />
                                    <span className="text-success fw-medium">
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
          </>
        )}
      </ModalBody>

      {/* ── Footer ── */}
      {!loading && !error && task && (
        <ModalFooter className="d-flex justify-content-between border-top py-2">
          <div className="d-flex gap-2">
            <button
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
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleEditTask}
              disabled={isSavingAny}
            >
              <i className="ri-edit-line me-1" />
              Edit Task
            </button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
