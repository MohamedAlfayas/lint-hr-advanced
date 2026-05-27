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
import { PostApi } from "../../../../common/api/PostApi";
import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";
import { getLabel, getEmployeeName } from "../../Task/Modal/Taskhelpers";
import TaskChecklist from "./TaskCheckList";
import {
  toggleRSBView,
  setFormObj,
  setComponentToShow,
} from "../../../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  setComments,
  addComment,
  deleteComment,
} from "../../../../redux/reducers/ChildReducer/CommentReducer";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
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

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

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

const getDisplayName = (emp) =>
  emp
    ? emp.full_name ||
      emp.name ||
      [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
      ""
    : "";

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
            letterSpacing: "0.5px",
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
                    transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.07)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(239,68,68,.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
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
                    transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.07)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(59,130,246,.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
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

// ─── TaskCommentSection ───────────────────────────────────────────────────────

const TaskCommentSection = ({ taskId, allEmployees = [] }) => {
  const dispatch = useDispatch();

  // ✅ Read comments from Redux store
  const reduxComments = useSelector(
    (state) => state.CommentReducer.comment_data,
  );

  const [commentText, setCommentText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const sortedComments = useMemo(
    () =>
      [...reduxComments].sort(
        (a, b) => new Date(b.created_on) - new Date(a.created_on),
      ),
    [reduxComments],
  );

  const handleFileChange = (e) => {
    setFileError("");
    const newFiles = Array.from(e.target.files || []);
    const valid = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(
          `"${file.name}" is not allowed. Only images (JPEG, PNG, GIF, WebP) and PDF.`,
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(
          `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
        );
        continue;
      }
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      valid.push({ file, previewUrl, name: file.name });
    }
    setSelectedFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      if (copy[index].previewUrl) URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const previewAttachments = useMemo(
    () =>
      selectedFiles.map((f) => ({
        previewUrl: f.previewUrl || "",
        attachment_url: f.previewUrl || `pdf::${f.name}`,
        name: f.name,
      })),
    [selectedFiles],
  );

  // =========================
  // ADD COMMENT
  // =========================
  const handleSubmit = async () => {
    if (!commentText.trim() && selectedFiles.length === 0) return;
    setSubmitting(true);
    setFileError("");
    try {
      const formData = new FormData();
      formData.append("task", String(taskId));
      formData.append("comment", commentText.trim());
      selectedFiles.forEach(({ file }) => formData.append("attachments", file));

      const response = await Api.post("/task/add-task-comment/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newComment = response?.data?.data;

      if (newComment) {
        // ✅ Push only the new comment into Redux store
        dispatch(addComment(newComment));
      }

      selectedFiles.forEach(({ previewUrl }) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      });

      setCommentText("");
      setSelectedFiles([]);
      toast.success(response?.data?.message || "Comment Added");
    } catch (err) {
      console.error("Add comment error:", err);
      setFileError("Failed to post comment. Please try again.");
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================
  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeletingId(commentId);

    try {
      const payload = {
        id: commentId,
        task: taskId,
      };

      const response = await PostApi("/task/delete-task-comment/", payload);

      // Remove comment from Redux store
      dispatch(deleteComment(commentId));

      Swal.fire({
        title: "Deleted!",
        text: response?.data?.message || "Comment deleted successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete comment error:", error);

      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to delete comment",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 border-top">
      {/* Section header */}
      <h6
        className="fw-bold mb-3 d-flex align-items-center gap-2"
        style={{
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: ".6px",
          color: "#6c757d",
        }}
      >
        <i className="ri-chat-3-line text-primary" />
        Comments
        {sortedComments.length > 0 && (
          <span
            className="badge bg-primary ms-1"
            style={{ fontSize: "0.65rem", padding: "2px 7px" }}
          >
            {sortedComments.length}
          </span>
        )}
      </h6>

      {/* Composer */}
      <div
        className="mb-4 rounded"
        style={{
          border: "1px solid #e2e8f0",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <textarea
          className="form-control border-0"
          rows={3}
          placeholder="Write a comment…"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ resize: "none", fontSize: "0.875rem", boxShadow: "none" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />

        {selectedFiles.length > 0 && (
          <div
            className="px-3 py-2"
            style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}
          >
            <AttachmentGrid
              attachments={previewAttachments}
              isPreview
              onRemoveIndex={removeFile}
            />
          </div>
        )}

        {fileError && (
          <div
            className="px-3 py-1 text-danger"
            style={{ fontSize: "0.75rem", background: "#fff5f5" }}
          >
            <i className="ri-error-warning-line me-1" />
            {fileError}
          </div>
        )}

        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}
        >
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => fileInputRef.current?.click()}
              title="Attach images or PDF (max 5 MB each)"
              style={{ fontSize: "0.78rem", padding: "3px 10px" }}
            >
              <i className="ri-attachment-2 me-1" />
              Attach
            </button>
            <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              Images &amp; PDF · max 5 MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={
              submitting || (!commentText.trim() && selectedFiles.length === 0)
            }
            style={{ fontSize: "0.78rem", padding: "4px 14px" }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-1" />
                Posting…
              </>
            ) : (
              <>
                <i className="ri-send-plane-line me-1" />
                Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comment list */}
      {sortedComments.length === 0 ? (
        <div
          className="text-center py-4 text-muted"
          style={{ fontSize: "0.85rem" }}
        >
          <i className="ri-chat-smile-3-line fs-4 d-block mb-1" />
          No comments yet. Be the first!
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {sortedComments.map((c) => {
            const authorEmp = resolveEmployeeObj(c.created_by, allEmployees);
            const authorName = authorEmp
              ? getDisplayName(authorEmp) || `User #${c.created_by}`
              : getEmployeeName(c.created_by) || `User #${c.created_by}`;

            return (
              <div key={c.id} className="d-flex gap-3">
                <div className="flex-shrink-0" style={{ paddingTop: 2 }}>
                  {authorEmp ? (
                    <Avatar emp={authorEmp} size={32} />
                  ) : (
                    <InitialsAvatar
                      name={authorName}
                      id={Number(c.created_by) || 0}
                      size={32}
                    />
                  )}
                </div>

                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div
                    className="rounded p-3"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Header */}
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "0.83rem" }}
                      >
                        {authorName}
                      </span>
                      <span
                        className="text-muted ms-auto"
                        style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}
                      >
                        {fmt(c.created_on)}
                      </span>

                      {/* ✅ Delete comment button */}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-danger ms-1"
                        title="Delete comment"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={deletingId === c.id}
                        style={{ fontSize: "0.8rem", lineHeight: 1 }}
                      >
                        {deletingId === c.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <i className="ri-delete-bin-line" />
                        )}
                      </button>
                    </div>

                    {/* Text */}
                    {c.comment && (
                      <p
                        className="mb-0 text-secondary"
                        style={{
                          fontSize: "0.85rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {c.comment}
                      </p>
                    )}

                    {/* Attachments */}
                    {c.task_comment_attachments?.length > 0 && (
                      <AttachmentGrid
                        attachments={c.task_comment_attachments}
                        isPreview={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allEmployees = useMemo(() => getAllEmployees(), []);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    setTask(null);
    try {
      const res = await Api.get(`/task/get-task-detail/${taskId}`);
      const taskData = res?.data?.data || null;
      setTask(taskData);

      // ✅ Seed Redux comment store from API response
      if (taskData?.comments) {
        reduxDispatch(setComments(taskData.comments));
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
    () => (task ? resolveStatusObj(task.task_status) : null),
    [task],
  );

  const priorityObj = useMemo(
    () => (task ? resolvePriorityObj(task.task_priority) : null),
    [task],
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

  const collaboratorNames = useMemo(() => {
    if (!task?.collaborators_id_list) return [];
    return parseIdList(task.collaborators_id_list).map((strId) => {
      const emp = resolveEmployeeObj(strId, allEmployees);
      const name = emp
        ? getDisplayName(emp) || `#${strId}`
        : resolveEmployeeName(strId, allEmployees);
      return { id: strId, name, emp };
    });
  }, [task, allEmployees]);

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

  const handleCloseTask = async () => {
    if (!window.confirm("Mark this task as closed?")) return;
    setClosing(true);
    try {
      await Api.put(`/task/${taskId}/`, { status: false });
      onTaskClosed?.();
      toggle();
    } catch (err) {
      console.error("Close task error:", err);
    } finally {
      setClosing(false);
    }
  };

  const handleDeleteTask = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this task? This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await Api.delete(`/task/${taskId}/`);
      onTaskDeleted?.();
      toggle();
    } catch (err) {
      console.error("Delete task error:", err);
    } finally {
      setDeleting(false);
    }
  };

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
      {/* Header */}
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
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={toggle}
          aria-label="Close"
        />
      </div>

      {/* Body */}
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
            {/* Two-column info */}
            <div className="row g-0 border-bottom">
              {/* Left */}
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

                <InfoRow label="Collaborators">
                  {collaboratorNames.length === 0 ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {collaboratorNames.map(({ id, name, emp }) => (
                        <span
                          key={id}
                          className="badge bg-light text-dark border d-inline-flex align-items-center gap-1"
                          style={{
                            fontWeight: 400,
                            fontSize: "0.78rem",
                            padding: "4px 8px",
                          }}
                        >
                          {emp ? (
                            <Avatar emp={emp} size={18} />
                          ) : (
                            <InitialsAvatar
                              name={name}
                              id={Number(id) || 0}
                              size={18}
                            />
                          )}
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </InfoRow>

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

              {/* Right */}
              <div
                className="col-12 col-lg-6 p-4"
                style={{ background: "#f8fafc" }}
              >
                <div className="row g-3">
                  {[
                    {
                      label: "Priority",
                      obj: priorityObj,
                      fallbackFn: resolvePriorityName,
                      raw: task.task_priority,
                    },
                    {
                      label: "Status",
                      obj: statusObj,
                      fallbackFn: resolveStatusName,
                      raw: task.task_status,
                    },
                  ].map(({ label, obj, fallbackFn, raw }) => (
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
                      {obj ? (
                        <span
                          className="badge"
                          style={{
                            background: obj.color,
                            color: "#fff",
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                          }}
                        >
                          {obj.name}
                        </span>
                      ) : raw ? (
                        <span
                          className="badge bg-secondary"
                          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                        >
                          {fallbackFn(raw)}
                        </span>
                      ) : (
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  ))}

                  {[
                    { label: "Start Time", val: fmt(task.start_time) },
                    { label: "End Time", val: fmt(task.end_time) },
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
                      <div style={{ fontSize: "0.85rem" }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <TaskChecklist
              taskId={taskId}
              checklistData={task?.task_checklists || []}
            />

            {/* Comments — ✅ no longer passes comments prop; reads from Redux */}
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

      {/* Footer */}
      {!loading && !error && task && (
        <ModalFooter className="d-flex justify-content-between border-top py-2">
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleCloseTask}
              disabled={closing || deleting}
            >
              {closing ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <i className="ri-checkbox-circle-line me-1" />
              )}
              Close Task
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleDeleteTask}
              disabled={closing || deleting}
            >
              {deleting ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <i className="ri-delete-bin-line me-1" />
              )}
              Delete Task
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleEditTask}
          >
            <i className="ri-edit-line me-1" />
            Edit Task
          </button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
