import React, { useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Api } from "../../../../common/api/Api";
import { PostApi } from "../../../../common/api/PostApi";
import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";
import { getEmployeeName } from "../../Task/Modal/Taskhelpers";
import {
  addComment,
  deleteComment,
} from "../../../../redux/reducers/ChildReducer/CommentReducer";
import { testId, itemTestKey } from "../../../../shared/testing/testId";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

// Comment validation rules
const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 0;

const COMMENT_ALLOWED_CHAR_REGEX = /^[A-Za-z0-9\s.,!?'"\-_()&:;/@]*$/;
const COMMENT_INVALID_CHAR_REGEX = /[^A-Za-z0-9\s.,!?'"\-_()&:;/@]/g;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

const matchId = (a, b) => String(a).trim() === String(b).trim();

const resolveEmployeeObj = (rawId, allEmployees) => {
  if (rawId === null || rawId === undefined || rawId === "") return null;
  const strId = String(rawId).trim();
  return allEmployees.find((e) => matchId(e.id, strId)) || null;
};

const getDisplayName = (emp) =>
  emp
    ? emp.full_name ||
      emp.name ||
      [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
      ""
    : "";

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

const stripHtmlToText = (html) => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch {
    return html.replace(/<[^>]*>/g, "");
  }
};

// ─── Whitespace normalization ──────────────────────────────────────────────
// Rules:
//  - &nbsp; / \u00A0 counts as regular whitespace
//  - any run of whitespace (spaces, tabs, newlines, nbsp) collapses to ONE space
//  - leading/trailing whitespace is stripped entirely
// Used both to validate/measure the comment and to sanitize what gets saved.

const normalizeWhitespace = (text = "") =>
  text
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Block-level tags that a rich text editor creates on Enter. A block of one
// of these tags that has no real text in it (just &nbsp;/<br>/whitespace) is
// "blank space" the same way a run of spaces is — it exists only because the
// user pressed Enter one time too many.
const BLANK_BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
]);

// Removes paragraphs/divs that contain no real text (only <br>, &nbsp;, or
// whitespace) — i.e. blank lines left behind by pressing Enter repeatedly,
// whether at the start, end, or between two real paragraphs.
const stripBlankBlocks = (root) => {
  Array.from(root.children || []).forEach((child) => {
    if (BLANK_BLOCK_TAGS.has(child.tagName)) {
      const text = normalizeWhitespace(child.textContent || "");
      if (text === "") {
        child.remove();
        return;
      }
    }
    if (child.children && child.children.length) {
      stripBlankBlocks(child);
    }
  });
};

// Strips leading/trailing <br> inside a block (blank space at the edges of a
// line) and collapses any interior run of 2+ consecutive <br> (from
// Shift+Enter mashing) down to a single <br>.
const collapseBrRuns = (root) => {
  const walk = (node) => {
    if (!node.childNodes || !node.childNodes.length) return;
    const kids = Array.from(node.childNodes);

    while (kids.length && kids[0].nodeName === "BR") {
      kids[0].remove();
      kids.shift();
    }
    while (kids.length && kids[kids.length - 1].nodeName === "BR") {
      kids[kids.length - 1].remove();
      kids.pop();
    }

    let prevWasBr = false;
    kids.forEach((k) => {
      if (k.nodeName === "BR") {
        if (prevWasBr) {
          k.remove();
        } else {
          prevWasBr = true;
        }
      } else {
        prevWasBr = false;
        walk(k);
      }
    });
  };
  walk(root);
};

// Collapses whitespace runs inside the actual HTML (so a comment saved to the
// backend never contains double spaces, leading-only-space content, or a
// stack of blank lines from pressing Enter repeatedly), while preserving
// tags/formatting (bold, italic, lists, links, etc.).
const normalizeHtmlWhitespace = (html) => {
  if (!html) return html;

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");

    const collapseNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = node.nodeValue.replace(/[\s\u00A0]+/g, " ");
      } else if (node.childNodes && node.childNodes.length) {
        node.childNodes.forEach(collapseNode);
      }
    };
    doc.body.childNodes.forEach(collapseNode);

    // Remove blank paragraphs/divs left by repeated Enter presses (leading,
    // trailing, or between two real paragraphs), then clean up any leftover
    // <br> runs inside the paragraphs that remain.
    stripBlankBlocks(doc.body);
    collapseBrRuns(doc.body);

    const collectTextNodes = (root) => {
      const nodes = [];
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          nodes.push(node);
        } else if (node.childNodes && node.childNodes.length) {
          node.childNodes.forEach(walk);
        }
      };
      walk(root);
      return nodes;
    };

    const textNodes = collectTextNodes(doc.body);
    if (textNodes.length) {
      textNodes[0].nodeValue = textNodes[0].nodeValue.replace(/^ /, "");
      const last = textNodes[textNodes.length - 1];
      last.nodeValue = last.nodeValue.replace(/ $/, "");
    }

    return doc.body.innerHTML;
  } catch {
    // Fallback for non-DOM environments: collapse whitespace/&nbsp; runs,
    // drop empty paragraphs, and collapse runs of <br> in the raw HTML string.
    return html
      .replace(/(?:&nbsp;|[\s\u00A0]){2,}/g, " ")
      .replace(/<(p|div)[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "")
      .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
      .trim();
  }
};

const validateCommentText = (html) => {
  const rawText = stripHtmlToText(html);
  const text = normalizeWhitespace(rawText);
  const length = text.length;

  if (length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      length,
      error: `Maximum ${MAX_COMMENT_LENGTH} characters allowed (${length}/${MAX_COMMENT_LENGTH}).`,
    };
  }

  if (!COMMENT_ALLOWED_CHAR_REGEX.test(text)) {
    const invalidChars = Array.from(
      new Set(text.match(COMMENT_INVALID_CHAR_REGEX) || []),
    );
    return {
      valid: false,
      length,
      error: `Invalid character${invalidChars.length > 1 ? "s" : ""}: ${invalidChars
        .map((c) => (c === "\\" ? "\\\\" : c))
        .join(" ")}.`,
    };
  }

  return { valid: true, length, error: "" };
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
          border: "2px solid var(--vz-secondary-bg)",
          boxShadow: "0 0 0 1px var(--vz-border-color)",
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
        border: "2px solid var(--vz-secondary-bg)",
        boxShadow: "0 0 0 1px var(--vz-border-color)",
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
        border: "2px solid var(--vz-secondary-bg)",
        boxShadow: "0 0 0 1px var(--vz-border-color)",
      }}
    >
      {initials}
    </span>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const Lightbox = ({ items, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex || 0);

  React.useEffect(() => {
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
        data-testid="task-comment-close-button"
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
          data-testid="task-comment-back-button"
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
              color: "var(--vz-secondary-color)",
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
          data-testid="task-comment-next-button"
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
        .filter((a) => !(isPdf(a.url || "") || isPdf(a.name || ""))),
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
          const pdf = isPdf(url || "") || isPdf(name || "");

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
                  title={isPreview ? `View ${name}` : `Download ${name}`}
                  onClick={() =>
                    isPreview
                      ? window.open(url, "_blank", "noopener,noreferrer")
                      : downloadFile(url, name)
                  }
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: "rgba(var(--vz-danger-rgb), .08)",
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
                    border: "1px solid var(--vz-border-color)",
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
                  data-testid={testId("task-comment-close", itemTestKey(att), "button")}
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
                  color: "var(--vz-secondary-color)",
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

  const reduxComments = useSelector(
    (state) => state.CommentReducer.comment_data,
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [commentError, setCommentError] = useState("");
  const [commentLength, setCommentLength] = useState(0);

  const fileInputRef = useRef(null);
  const editor = useRef(null);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Write a comment or note about this task...",
      height: 220,
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "blockquote",
        "|",
        "undo",
        "redo",
      ],
    }),
    [],
  );

  const sortedComments = useMemo(
    () =>
      [...reduxComments].sort(
        (a, b) => new Date(b.created_on) - new Date(a.created_on),
      ),
    [reduxComments],
  );

  // Content is "empty" if, after collapsing all whitespace/&nbsp; runs and
  // trimming, there is no visible text left (e.g. only spaces were typed).
  const isCommentEmpty = (html) => {
    if (!html) return true;
    return normalizeWhitespace(stripHtmlToText(html)) === "";
  };

  const canSave = !savingComment && !commentError && commentLength > 0;

  const previewAttachments = useMemo(
    () =>
      selectedFiles.map((f) => ({
        previewUrl: f.previewUrl || "",
        attachment_url: f.previewUrl || "",
        name: f.name,
      })),
    [selectedFiles],
  );

  // ─── File handling ──────────────────────────────────────────────────────────

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
      const previewUrl = URL.createObjectURL(file);
      valid.push({ file, previewUrl, name: file.name });
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const handleEditorChange = (newContent) => {
    setComment(newContent);
    // Length/validation is always computed on the NORMALIZED text, so:
    //  - leading-only spaces never count as content (length stays 0)
    //  - "hi   b" is measured/validated as "hi b" (single space)
    const { length, error } = validateCommentText(newContent);
    setCommentLength(length);
    setCommentError(error);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      if (copy[index].previewUrl) URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  // ─── Clear / Cancel ─────────────────────────────────────────────────────────

  const handleClear = () => {
    setComment("");
    setSelectedFiles([]);
    setFileError("");
    setCommentError("");
    setCommentLength(0);
    if (editor.current) {
      editor.current.value = "";
    }
  };

  const handleCancel = () => {
    handleClear();
    setEditorOpen(false);
  };

  // ─── Save comment ────────────────────────────────────────────────────────────

  const handleSaveComment = async () => {
    const latestComment = editor.current?.value ?? comment;

    const { valid, error } = validateCommentText(latestComment);
    if (!valid) {
      setCommentError(error);
      toast.error(error);
      return;
    }
    if (isCommentEmpty(latestComment) && selectedFiles.length === 0) return;

    setSavingComment(true);
    setFileError("");

    try {
      const formData = new FormData();
      formData.append("task", String(taskId));

      // Normalize whitespace in the HTML itself before it ever reaches the
      // backend: collapses any run of spaces/&nbsp; to one space and strips
      // leading/trailing whitespace, while keeping formatting tags intact.
      const normalizedComment = normalizeHtmlWhitespace(latestComment);
      const commentToSend = isCommentEmpty(normalizedComment)
        ? " "
        : normalizedComment;
      formData.append("comment", commentToSend);

      selectedFiles.forEach(({ file }) => formData.append("attachments", file));

      const response = await Api.post("/task/add-task-comment/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newComment = response?.data?.data;
      if (newComment) {
        dispatch(addComment(newComment));
      }

      selectedFiles.forEach(({ previewUrl }) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      });

      handleClear();
      setEditorOpen(false);
      toast.success(response?.data?.message || "Comment Added");
    } catch (error) {
      console.error("Add comment error:", error);
      const backendMsg =
        error?.response?.data?.error_message ||
        error?.response?.data?.message ||
        "Failed to post comment. Please try again.";
      setFileError(backendMsg);
      toast.error(backendMsg);
    } finally {
      setSavingComment(false);
    }
  };

  // ─── Delete comment ──────────────────────────────────────────────────────────

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "var(--vz-secondary-color)",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeletingId(commentId);

    try {
      const response = await PostApi("/task/delete-task-comment/", {
        id: commentId,
        task: taskId,
      });

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 border-bottom">
      {/* Section header */}
      <h6
        className="fw-bold mb-3 d-flex align-items-center gap-2"
        style={{
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: ".6px",
          color: "var(--vz-secondary-color)",
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

      {/* ── COMPOSER ── */}

      {/* Closed state */}
      {!editorOpen && (
        <div
          onClick={() => setEditorOpen(true)}
          style={{
            border: "1px solid var(--vz-border-color)",
            borderRadius: "8px",
            padding: "12px 15px",
            background: "var(--vz-tertiary-bg)",
            cursor: "pointer",
            color: "var(--vz-secondary-color)",
            fontSize: "0.9rem",
          }}
        >
          <i className="ri-edit-2-line me-2" />
          Write a comment or note about this task...
        </div>
      )}

      {/* Open state */}
      {editorOpen && (
        <div
          className="mb-4 rounded"
          style={{
            border: "1px solid var(--vz-border-color)",
            background: "var(--vz-secondary-bg)",
            overflow: "hidden",
          }}
        >
          <JoditEditor
            ref={editor}
            value={comment}
            config={editorConfig}
            onChange={handleEditorChange}
          />

          <div
            className="d-flex align-items-center justify-content-between px-3 py-1"
            style={{
              borderTop: "1px solid var(--vz-border-color)",
              background: commentError ? "rgba(var(--vz-danger-rgb), .08)" : "var(--vz-tertiary-bg)",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                color: "#ef4444",
                flex: 1,
                paddingRight: 10,
              }}
            >
              {commentError && (
                <>
                  <i className="ri-error-warning-line me-1" />
                  {commentError}
                </>
              )}
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: commentLength > MAX_COMMENT_LENGTH ? 700 : 400,
                color:
                  commentLength > MAX_COMMENT_LENGTH
                    ? "#ef4444"
                    : commentLength > MAX_COMMENT_LENGTH * 0.9
                      ? "#f59e0b"
                      : "var(--vz-secondary-color)",
                whiteSpace: "nowrap",
              }}
            >
              {commentLength}/{MAX_COMMENT_LENGTH}
            </span>
          </div>

          {/* File previews */}
          {selectedFiles.length > 0 && (
            <div
              className="px-3 py-2"
              style={{ borderTop: "1px solid var(--vz-border-color)", background: "var(--vz-tertiary-bg)" }}
            >
              <AttachmentGrid
                attachments={previewAttachments}
                isPreview
                onRemoveIndex={removeFile}
              />
            </div>
          )}

          {/* File error */}
          {fileError && (
            <div
              className="px-3 py-1 text-danger"
              style={{ fontSize: "0.75rem", background: "rgba(var(--vz-danger-rgb), .08)" }}
            >
              <i className="ri-error-warning-line me-1" />
              {fileError}
            </div>
          )}

          {/* Toolbar row */}
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2 flex-wrap gap-2"
            style={{ borderTop: "1px solid var(--vz-border-color)", background: "var(--vz-tertiary-bg)" }}
          >
            {/* Left: attach */}
            <div className="d-flex align-items-center gap-2">
              <input
                ref={fileInputRef}
                data-testid="task-comment-attachment-file-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                data-testid="task-comment-attach-button"
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => fileInputRef.current?.click()}
                title="Attach images or PDF (max 5 MB each)"
                style={{ fontSize: "0.78rem", padding: "3px 10px" }}
              >
                <i className="ri-attachment-2 me-1" />
                Attach
              </button>
              <span style={{ fontSize: "0.7rem", color: "var(--vz-secondary-color)" }}>
                Images &amp; PDF · max 2 MB
              </span>
            </div>

            {/* Right: action buttons */}
            <div className="d-flex gap-2">
              <button
                data-testid="task-comment-cancel-button"
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                data-testid="task-comment-clear-button"
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleClear}
                disabled={commentLength === 0 && selectedFiles.length === 0}
              >
                Clear
              </button>

              <button
                data-testid="task-comment-send-button"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveComment}
                disabled={!canSave}
                style={{ fontSize: "0.78rem", padding: "4px 14px" }}
              >
                {savingComment ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line me-1" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMENT LIST ── */}
      {sortedComments.length === 0 ? (
        <div
          className="text-center py-4 text-muted"
          style={{ fontSize: "0.85rem" }}
        >
          <i className="ri-chat-smile-3-line fs-4 d-block mb-1" />
          No comments yet. Be the first!
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mt-3">
          {sortedComments.map((c) => {
            const authorEmp = resolveEmployeeObj(c.created_by, allEmployees);
            const authorName = authorEmp
              ? getDisplayName(authorEmp) || `User #${c.created_by}`
              : resolveEmployeeName(c.created_by, allEmployees) ||
                `User #${c.created_by}`;

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
                      background: "var(--vz-tertiary-bg)",
                      border: "1px solid var(--vz-border-color)",
                    }}
                  >
                    {/* Comment header */}
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

                      {/* Delete button */}
                      <button
                        data-testid={testId("task-comment-delete-comment", itemTestKey(c), "button")}
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

                    {/* Comment text — HTML from Jodit */}
                    {c.comment && (
                      <div
                        className="text-secondary"
                        style={{ fontSize: "0.85rem", wordBreak: "break-word" }}
                        dangerouslySetInnerHTML={{ __html: c.comment }}
                      />
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

// Named exports for unit testing the whitespace-handling logic in isolation.
export {
  stripHtmlToText,
  normalizeWhitespace,
  normalizeHtmlWhitespace,
  validateCommentText,
};

export default TaskCommentSection;
