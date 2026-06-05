import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";
import Dropzone from "react-dropzone";
import { GetApi } from "../../../../common/api/GetApi";
import { PostApi } from "../../../../common/api/PostApi";
import {
  addRootFiles,
  removeRootFile,
  setFolderActionLoading,
  setFolderError,
  setFolderSuccess,
  clearFolderMessages,
} from "../../../../redux/reducers/ChildReducer/FolderReducer";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "zip",
  "rar",
  "xls",
  "xlsx",
  "txt",
  "doc",
  "docx",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const map = {
    png: { icon: "ri-image-2-fill", iconClass: "success" },
    jpg: { icon: "ri-image-2-fill", iconClass: "success" },
    jpeg: { icon: "ri-image-2-fill", iconClass: "success" },
    webp: { icon: "ri-image-2-fill", iconClass: "success" },
    gif: { icon: "ri-image-2-fill", iconClass: "success" },
    pdf: { icon: "ri-file-pdf-fill", iconClass: "danger" },
    doc: { icon: "ri-file-word-fill", iconClass: "primary" },
    docx: { icon: "ri-file-word-fill", iconClass: "primary" },
    xlsx: { icon: "ri-file-excel-fill", iconClass: "success" },
    xls: { icon: "ri-file-excel-fill", iconClass: "success" },
    zip: { icon: "ri-file-zip-fill", iconClass: "warning" },
    rar: { icon: "ri-file-zip-fill", iconClass: "warning" },
    txt: { icon: "ri-file-text-fill", iconClass: "secondary" },
  };
  return map[ext] || { icon: "ri-file-fill", iconClass: "info" };
};

const getViewerType = (ext) => {
  const e = ext?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(e)) return "image";
  if (["mp4", "webm", "mov"].includes(e)) return "video";
  if (["mp3", "wav", "aac", "flac"].includes(e)) return "audio";
  if (e === "pdf") return "pdf";
  if (
    [
      "txt",
      "md",
      "csv",
      "json",
      "xml",
      "html",
      "js",
      "ts",
      "jsx",
      "tsx",
      "css",
    ].includes(e)
  )
    return "text";
  return "unsupported";
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  return mb < 0.01 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── File Viewer Modal ────────────────────────────────────────────────────────

const FileViewerModal = ({ file, onClose }) => {
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState(false);

  const ext = file?.original_file_name?.split(".").pop()?.toLowerCase();
  const baseName = file?.original_file_name?.replace(/\.[^/.]+$/, "") ?? "";
  const viewerType = file ? getViewerType(ext) : null;
  const { icon, iconClass } = file ? getFileIcon(file.original_file_name) : {};

  // Fetch plain-text content when needed
  useEffect(() => {
    if (file && viewerType === "text" && file.file_url) {
      setTextLoading(true);
      setTextContent(null);
      setTextError(false);
      fetch(file.file_url)
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.text();
        })
        .then((t) => setTextContent(t))
        .catch(() => setTextError(true))
        .finally(() => setTextLoading(false));
    }
  }, [file, viewerType]);

  if (!file) return null;

  return (
    <Modal
      isOpen={!!file}
      toggle={onClose}
      centered
      size="xl"
      className="zoomIn"
    >
      {/* ── Header ── */}
      <ModalHeader toggle={onClose} className="border-bottom pb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className={`avatar-xs d-flex align-items-center justify-content-center rounded bg-${iconClass}-subtle flex-shrink-0`}
          >
            <i className={`${icon} text-${iconClass} fs-16`} />
          </div>
          <span className="fw-semibold fs-15 lh-sm">
            {baseName}.{ext}
          </span>
        </div>
      </ModalHeader>

      {/* ── Body ── */}
      <ModalBody className="p-0" style={{ minHeight: 340 }}>
        {/* IMAGE */}
        {viewerType === "image" && (
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ minHeight: 400, padding: 16 }}
          >
            <img
              src={file.file_url}
              alt={baseName}
              style={{
                maxWidth: "100%",
                maxHeight: 560,
                objectFit: "contain",
                borderRadius: 6,
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div
              style={{ display: "none" }}
              className="text-center text-muted py-5"
            >
              <i className="ri-image-2-line display-4 d-block mb-2" />
              <p>Could not load image.</p>
            </div>
          </div>
        )}

        {/* VIDEO */}
        {viewerType === "video" && (
          <div
            className="d-flex align-items-center justify-content-center bg-dark"
            style={{ minHeight: 400 }}
          >
            <video
              controls
              autoPlay={false}
              style={{ maxWidth: "100%", maxHeight: 560, outline: "none" }}
            >
              <source src={file.file_url} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* AUDIO */}
        {viewerType === "audio" && (
          <div
            className="d-flex flex-column align-items-center justify-content-center gap-4 py-5"
            style={{ minHeight: 260 }}
          >
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle bg-${iconClass}-subtle`}
              style={{ width: 100, height: 100 }}
            >
              <i className={`ri-music-2-fill text-${iconClass} display-4`} />
            </div>
            <div className="text-center">
              <h6 className="fw-semibold mb-1">{baseName}</h6>
              <span className="badge bg-info-subtle text-info">
                {ext?.toUpperCase()}
              </span>
            </div>
            <audio
              controls
              autoPlay={false}
              style={{ width: "100%", maxWidth: 480 }}
            >
              <source src={file.file_url} />
            </audio>
          </div>
        )}

        {/* PDF — full-height iframe */}
        {viewerType === "pdf" && (
          <div style={{ height: 620 }}>
            <iframe
              src={`${file.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
              title={`${baseName}.pdf`}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
            />
          </div>
        )}

        {/* TEXT */}
        {viewerType === "text" && (
          <div style={{ minHeight: 340 }}>
            {textLoading && (
              <div className="d-flex align-items-center justify-content-center py-5">
                <Spinner color="success" className="me-2" />
                <span className="text-muted">Loading file…</span>
              </div>
            )}
            {textError && (
              <div className="text-center py-5 text-danger">
                <i className="ri-error-warning-line display-4 d-block mb-2" />
                <p>Could not load file content.</p>
              </div>
            )}
            {!textLoading && !textError && textContent !== null && (
              <pre
                className="mb-0 p-4"
                style={{
                  maxHeight: 560,
                  overflowY: "auto",
                  fontSize: 13,
                  lineHeight: 1.7,
                  background: "#f8f9fa",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "'Fira Mono', 'Courier New', monospace",
                }}
              >
                {textContent}
              </pre>
            )}
          </div>
        )}

        {/* UNSUPPORTED */}
        {viewerType === "unsupported" && (
          <div className="text-center py-5">
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${iconClass}-subtle mb-3`}
              style={{ width: 80, height: 80 }}
            >
              <i className={`${icon} text-${iconClass} display-5`} />
            </div>
            <h6 className="fw-semibold mb-1">
              {baseName}.{ext}
            </h6>
            <p className="text-muted fs-13 mb-3">
              Preview is not available for <strong>.{ext}</strong> files.
            </p>
            {file.file_url && (
              <a
                href={file.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-success btn-sm"
              >
                <i className="ri-download-line me-1" />
                Download to view
              </a>
            )}
          </div>
        )}
      </ModalBody>

      {/* ── Footer ── */}
      <ModalFooter className="border-top gap-2 pt-3">
        {file.file_url && (
          <a
            href={file.file_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-success btn-sm"
          >
            <i className="ri-download-line me-1" />
            Download
          </a>
        )}
        <Button color="light" size="sm" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Right-click Context Menu ─────────────────────────────────────────────────

const ContextMenu = ({ menu, onAction, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!menu.visible) return null;

  const wrapStyle = {
    position: "fixed",
    top: menu.y,
    left: menu.x,
    zIndex: 9999,
    minWidth: 168,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: "4px 0",
    animation: "ctxFadeIn .12s ease",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    userSelect: "none",
    transition: "background .1s",
  };

  return (
    <>
      <style>{`
        @keyframes ctxFadeIn {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1);   }
        }
        .ctx-row:hover            { background: #f1f5f9; }
        .ctx-row-danger           { color: #ef4444; }
        .ctx-row-danger:hover     { background: #fef2f2 !important; }
        .ctx-divider              { border-top: 1px solid #f1f5f9; margin: 4px 0; }
      `}</style>
      <div ref={menuRef} style={wrapStyle}>
        <div
          className="ctx-row"
          style={rowStyle}
          onMouseDown={() => {
            onAction("view", menu.item);
            onClose();
          }}
        >
          <i className="ri-eye-line fs-15 text-primary" /> View
        </div>
        <div
          className="ctx-row"
          style={rowStyle}
          onMouseDown={() => {
            onAction("download", menu.item);
            onClose();
          }}
        >
          <i className="ri-download-line fs-15 text-success" /> Download
        </div>
        <div className="ctx-divider" />
        <div
          className="ctx-row ctx-row-danger"
          style={rowStyle}
          onMouseDown={() => {
            onAction("delete", menu.item);
            onClose();
          }}
        >
          <i className="ri-delete-bin-line fs-15" /> Delete
        </div>
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FilesList = ({ projectId, folderId }) => {
  const dispatch = useDispatch();

  // ── Redux state ───────────────────────────────────────────────────────────
  const actionLoading = useSelector(
    (s) => s.FolderReducer.folder_action_loading,
  );
  const successMsg = useSelector((s) => s.FolderReducer.folder_success);
  const errorMsg = useSelector((s) => s.FolderReducer.folder_error);

  // ── Local state ───────────────────────────────────────────────────────────
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add-file modal
  const [addModal, setAddModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dropError, setDropError] = useState(""); // dropzone-only validation error

  // File viewer modal
  const [viewerFile, setViewerFile] = useState(null);

  // Delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Right-click context menu
  const [ctxMenu, setCtxMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  // ── Auto-clear flash messages after 4 s ───────────────────────────────────
  useEffect(() => {
    if (!successMsg && !errorMsg) return;
    const t = setTimeout(() => dispatch(clearFolderMessages()), 4000);
    return () => clearTimeout(t);
  }, [successMsg, errorMsg, dispatch]);

  // ── Fetch files ───────────────────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const res = await GetApi(`/projects/get-files/${projectId}`);
    if (res?.status === 200 && res?.data?.data) setFileList(res.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ── Right-click ───────────────────────────────────────────────────────────
  const handleRowContextMenu = useCallback((e, item) => {
    e.preventDefault();
    const menuW = 168,
      menuH = 130;
    const x =
      e.clientX + menuW > window.innerWidth ? e.clientX - menuW : e.clientX;
    const y =
      e.clientY + menuH > window.innerHeight ? e.clientY - menuH : e.clientY;
    setCtxMenu({ visible: true, x, y, item });
  }, []);

  const closeCtxMenu = useCallback(
    () => setCtxMenu((p) => ({ ...p, visible: false })),
    [],
  );

  // ── Context action dispatcher ─────────────────────────────────────────────
  const handleContextAction = useCallback((action, item) => {
    ({
      view: () => setViewerFile(item),
      download: () => item.file_url && window.open(item.file_url, "_blank"),
      delete: () => setDeleteConfirm({ item }),
    })[action]?.();
  }, []);

  // ── Add File ──────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setUploadedFiles([]);
    setDropError("");
    dispatch(clearFolderMessages());
    setAddModal(true);
  };

  const closeAddModal = () => {
    if (actionLoading) return;
    setAddModal(false);
    setUploadedFiles([]);
    setDropError("");
  };

  const handleDrop = (files) => {
    const valid = files.filter((f) =>
      ALLOWED_EXTENSIONS.includes(f.name.split(".").pop()?.toLowerCase()),
    );
    const invalid = files.length - valid.length;
    setDropError(
      invalid > 0
        ? `${invalid} file(s) rejected — unsupported type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
        : "",
    );
    setUploadedFiles((prev) => [...prev, ...valid]);
  };

  const removeQueued = (i) =>
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setDropError("Please select at least one file.");
      return;
    }

    dispatch(setFolderActionLoading(true));
    dispatch(clearFolderMessages());
    setDropError("");

    try {
      const form = new FormData();
      form.append("project", String(projectId));
      if (folderId) form.append("folder", String(folderId));
      uploadedFiles.forEach((f) => form.append("files", f));

      const res = await PostApi("/projects/add-file/", form, true);

      if (res?.status === 200 || res?.status === 201) {
        const uploaded = res?.data?.data ?? [];

        // ── update local list ──
        setFileList((prev) => [...prev, ...uploaded]);

        // ── update Redux rootFiles (for components that read from store) ──
        dispatch(addRootFiles(uploaded));

        // ── flash success ──
        dispatch(
          setFolderSuccess(
            `${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded successfully.`,
          ),
        );

        closeAddModal();
      } else {
        dispatch(setFolderError("Upload failed. Please try again."));
      }
    } catch {
      dispatch(setFolderError("An error occurred during upload."));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  // ── Delete File ───────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    dispatch(setFolderActionLoading(true));
    dispatch(clearFolderMessages());

    try {
      const res = await PostApi("/projects/delete-items/", {
        folder_ids: [],
        file_ids: [deleteConfirm.item.id],
        project: projectId,
      });

      if (res?.status === 200 || res?.status === 201) {
        // ── update local list ──
        setFileList((prev) =>
          prev.filter((f) => f.id !== deleteConfirm.item.id),
        );

        // ── update Redux rootFiles ──
        dispatch(removeRootFile(deleteConfirm.item.id));

        // ── flash success ──
        dispatch(
          setFolderSuccess(
            `"${deleteConfirm.item.original_file_name}" deleted successfully.`,
          ),
        );

        setDeleteConfirm(null);
      } else {
        dispatch(setFolderError("Delete failed. Please try again."));
      }
    } catch {
      dispatch(setFolderError("An error occurred while deleting."));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  const cancelDelete = () => {
    if (actionLoading) return;
    setDeleteConfirm(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      {/* ── Right-click Context Menu ──────────────────────────────────── */}
      <ContextMenu
        menu={ctxMenu}
        onAction={handleContextAction}
        onClose={closeCtxMenu}
      />

      {/* ── Flash Messages ────────────────────────────────────────────── */}
      {successMsg && (
        <Alert color="success" className="mt-2 py-2 d-flex align-items-center">
          <i className="ri-check-line me-2 fs-15" />
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert color="danger" className="mt-2 py-2 d-flex align-items-center">
          <i className="ri-error-warning-line me-2 fs-15" />
          {typeof errorMsg === "string" ? errorMsg : "Something went wrong"}
        </Alert>
      )}

      {/* ── Files Card ──────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          {/* Header */}
          <div className="d-flex align-items-center mb-3">
            <h5 className="flex-grow-1 fs-16 mb-0">Recent Files</h5>
            <div className="flex-shrink-0">
              <button className="btn btn-success" onClick={openAddModal}>
                <i className="ri-add-line align-bottom me-1" />
                Add File
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-4 text-muted">
                <Spinner size="sm" className="me-2" />
                Loading…
              </div>
            ) : (
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-active">
                  <tr>
                    <th>Name</th>
                    <th>File Type</th>
                    <th>File Size</th>
                    <th>Recent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fileList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No files found.
                      </td>
                    </tr>
                  ) : (
                    fileList.map((item) => {
                      const { icon, iconClass } = getFileIcon(
                        item.original_file_name,
                      );
                      return (
                        <tr
                          key={item.id}
                          onContextMenu={(e) => handleRowContextMenu(e, item)}
                          style={{ cursor: "context-menu" }}
                        >
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 fs-17 me-2">
                                <i className={`${icon} text-${iconClass}`} />
                              </div>
                              <div
                                className="flex-grow-1 text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleContextAction("view", item)
                                }
                              >
                                {item.original_file_name}
                              </div>
                            </div>
                          </td>
                          <td>
                            {item.original_file_name
                              ?.split(".")
                              .pop()
                              ?.toUpperCase()}{" "}
                            File
                          </td>
                          <td>{formatFileSize(item.file_size)}</td>
                          <td>{formatDate(item.created_on)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Hint */}
          {fileList.length > 0 && (
            <p className="text-muted fs-12 mt-2 mb-0">
              <i className="ri-mouse-line me-1" />
              Right-click a file for options
            </p>
          )}

          {/* Pagination */}
          <div className="align-items-center mt-3 row g-3 text-center text-sm-start">
            <div className="col-sm">
              <div className="text-muted">
                Showing <span className="fw-semibold">{fileList.length}</span>{" "}
                of <span className="fw-semibold">{fileList.length}</span>{" "}
                Results
              </div>
            </div>
            <div className="col-sm-auto">
              <ul className="pagination pagination-separated pagination-sm justify-content-center justify-content-sm-start mb-0">
                <li className="page-item disabled">
                  <Link to="#" className="page-link">
                    ←
                  </Link>
                </li>
                <li className="page-item active">
                  <Link to="#" className="page-link">
                    1
                  </Link>
                </li>
                <li className="page-item disabled">
                  <Link to="#" className="page-link">
                    →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── File Viewer Modal ─────────────────────────────────────────── */}
      <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />

      {/* ── Add File Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={addModal}
        toggle={closeAddModal}
        centered
        size="md"
        className="zoomIn"
      >
        <ModalHeader toggle={closeAddModal} className="p-3 bg-success-subtle">
          Add Files
        </ModalHeader>
        <ModalBody>
          {/* Dropzone */}
          <div className="mb-3">
            <Label className="form-label">
              Upload Files{" "}
              <small className="text-muted">
                ({ALLOWED_EXTENSIONS.join(", ")})
              </small>
            </Label>
            <Dropzone onDrop={handleDrop} multiple>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                  className={`dropzone dz-clickable border rounded p-4 text-center ${
                    isDragActive ? "border-success bg-success-subtle" : ""
                  }`}
                >
                  <div className="dz-message needsclick" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className="mb-3">
                      <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                    </div>
                    <h5>Drop files here or click to upload</h5>
                    <p className="text-muted small mb-0">
                      Multiple files supported
                    </p>
                  </div>
                </div>
              )}
            </Dropzone>
          </div>

          {/* Queued list */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3">
              <Label className="form-label">
                Selected Files ({uploadedFiles.length})
              </Label>
              <ul className="list-group list-group-flush">
                {uploadedFiles.map((f, i) => {
                  const { icon, iconClass } = getFileIcon(f.name);
                  return (
                    <li
                      key={i}
                      className="list-group-item d-flex align-items-center justify-content-between px-0 py-1"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`${icon} text-${iconClass} fs-17`} />
                        <span
                          className="text-truncate"
                          style={{ maxWidth: 260 }}
                        >
                          {f.name}
                        </span>
                        <span className="text-muted small">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost-danger p-0 px-1"
                        onClick={() => removeQueued(i)}
                        disabled={actionLoading}
                      >
                        <i className="ri-close-line" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Dropzone validation error (local only) */}
          {dropError && (
            <div className="alert alert-warning py-2 mb-3">
              <i className="ri-error-warning-line me-2" />
              {dropError}
            </div>
          )}

          {/* Redux flash messages inside modal too */}
          {successMsg && (
            <Alert color="success" className="py-2">
              <i className="ri-check-line me-2" />
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert color="danger" className="py-2">
              <i className="ri-error-warning-line me-2" />
              {typeof errorMsg === "string" ? errorMsg : "Something went wrong"}
            </Alert>
          )}

          <div className="hstack gap-2 justify-content-end mt-1">
            <button
              type="button"
              className="btn btn-ghost-success"
              onClick={closeAddModal}
              disabled={actionLoading}
            >
              <i className="ri-close-line align-bottom me-1" />
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddSubmit}
              disabled={actionLoading || uploadedFiles.length === 0}
            >
              {actionLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Uploading…
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line align-bottom me-1" />
                  Upload
                </>
              )}
            </button>
          </div>
        </ModalBody>
      </Modal>

      {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteConfirm}
        toggle={cancelDelete}
        centered
        size="sm"
        className="zoomIn"
      >
        <ModalHeader toggle={cancelDelete} className="p-3 bg-danger-subtle">
          Delete File
        </ModalHeader>
        <ModalBody>
          <div className="text-center mb-4">
            <i className="ri-delete-bin-line display-4 text-danger" />
            <h5 className="mt-3">Are you sure?</h5>
            <p className="text-muted mb-0">
              You are about to delete{" "}
              <strong>{deleteConfirm?.item?.original_file_name}</strong>. This
              action cannot be undone.
            </p>
          </div>
          <div className="hstack gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-ghost-danger"
              onClick={cancelDelete}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Deleting…
                </>
              ) : (
                "Yes, Delete"
              )}
            </button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default FilesList;
