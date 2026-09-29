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

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

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

const isImage = (fileName) =>
  IMAGE_EXTENSIONS.includes(fileName?.split(".").pop()?.toLowerCase());

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

const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Shape Converters ─────────────────────────────────────────────────────────

// Raw API → unified Folders.jsx Redux shape
// Folders.jsx renders item.name / item.ext / item.size / item.createdAt
const toFoldersShape = (f) => ({
  id: f.id,
  name: f.original_file_name?.replace(/\.[^/.]+$/, "") || `file_${f.id}`,
  ext: f.original_file_name?.split(".").pop()?.toLowerCase() || "",
  type: "file",
  size: formatBytes(f.file_size),
  file_url: f.file_url ?? null,
  file_size: f.file_size ?? null,
  folder: f.folder ?? null,
  created_on: f.created_on ?? null,
  createdAt: f.created_on
    ? new Date(f.created_on).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "",
});

// Folders.jsx Redux shape → FilesList display shape (original_file_name, etc.)
const normaliseFile = (f) => {
  if (f.original_file_name) return f; // already raw API shape
  return {
    id: f.id,
    original_file_name: f.ext ? `${f.name}.${f.ext}` : f.name,
    file_url: f.file_url ?? null,
    file_size: f.file_size ?? null,
    created_on: f.created_on ?? f.createdAt ?? null,
  };
};

// ─── File Viewer Modal ────────────────────────────────────────────────────────

const FileViewerModal = ({ file, onClose }) => {
  const ext = file?.original_file_name?.split(".").pop()?.toLowerCase();
  const baseName = file?.original_file_name?.replace(/\.[^/.]+$/, "") ?? "";
  const { icon, iconClass } = file ? getFileIcon(file.original_file_name) : {};
  const fileIsImage = file ? isImage(file.original_file_name) : false;

  if (!file) return null;

  return (
    <Modal
      isOpen={!!file}
      toggle={onClose}
      centered
      size="xl"
      className="zoomIn"
    >
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

      <ModalBody className="p-0" style={{ minHeight: 340 }}>
        {fileIsImage ? (
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
        ) : (
          <div className="text-center py-5">
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${iconClass}-subtle mb-3`}
              style={{ width: 90, height: 90 }}
            >
              <i className={`${icon} text-${iconClass} display-4`} />
            </div>
            <h6 className="fw-semibold mb-1">
              {baseName}.{ext}
            </h6>
            <p className="text-muted fs-13 mb-4">
              Preview is not available for{" "}
              <strong>.{ext?.toUpperCase()}</strong> files.
              <br />
              Download the file to view it.
            </p>
            {file.file_url && (
              <a
                href={file.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-success"
              >
                <i className="ri-download-2-line me-2" />
                Download File
              </a>
            )}
          </div>
        )}
      </ModalBody>

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
        .ctx-row:hover        { background: #f1f5f9; }
        .ctx-row-danger       { color: #ef4444; }
        .ctx-row-danger:hover { background: #fef2f2 !important; }
        .ctx-divider          { border-top: 1px solid #f1f5f9; margin: 4px 0; }
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

const FilesList = ({ projectId, folderId, canAddFiles = true  }) => {
  const dispatch = useDispatch();

  // ── Redux ─────────────────────────────────────────────────────────────────
  const rootFiles = useSelector((s) => s.FolderReducer.folder_data.rootFiles);
  const actionLoading = useSelector(
    (s) => s.FolderReducer.folder_action_loading,
  );
  const successMsg = useSelector((s) => s.FolderReducer.folder_success);
  const errorMsg = useSelector((s) => s.FolderReducer.folder_error);

  // Derive display list — normalise Folders shape → FilesList shape
  const fileList = (rootFiles || []).map(normaliseFile);

  // ── Local UI state ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dropError, setDropError] = useState("");
  const [viewerFile, setViewerFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  // ── Seed Redux from API only when rootFiles is empty ──────────────────────
  // (Folders.jsx already populates this on its own mount; skip if so)
  useEffect(() => {
    if ((rootFiles || []).length === 0) {
      setLoading(true);
      GetApi(`/projects/get-files/${projectId}`)
        .then((res) => {
          if (res?.status === 200 && res?.data?.data) {
            dispatch(addRootFiles(res.data.data.map(toFoldersShape)));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

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

  const handleContextAction = useCallback((action, item) => {
    ({
      view: () => setViewerFile(item),
      download: () => item.file_url && window.open(item.file_url, "_blank"),
      delete: () => setDeleteConfirm({ item }),
    })[action]?.();
  }, []);

  // ── Add File Modal ────────────────────────────────────────────────────────
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
        // Convert to Folders.jsx shape before dispatching so both
        // components render the new files immediately from Redux
        dispatch(addRootFiles(uploaded.map(toFoldersShape)));
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
        dispatch(removeRootFile(deleteConfirm.item.id));
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
      <ContextMenu
        menu={ctxMenu}
        onAction={handleContextAction}
        onClose={closeCtxMenu}
      />

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

      {/* ── Files Card ── */}
      <Card>
        <CardBody>
          <div className="d-flex align-items-center mb-3">
            <h5 className="flex-grow-1 fs-16 mb-0">Recent Files</h5>
                       {canAddFiles && (
              <button className="btn btn-success" onClick={openAddModal}>
                <i className="ri-add-line align-bottom me-1" />
                Add File
              </button>
            )}
          </div>

          <div
            className="table-responsive"
            style={{ maxHeight: 420, overflowY: "auto" }}
          >
            {loading ? (
              <div className="text-center py-4 text-muted">
                <Spinner size="sm" className="me-2" />
                Loading…
              </div>
            ) : (
              <table className="table align-middle table-nowrap mb-0">
                <thead
                  className="table-active"
                  style={{ position: "sticky", top: 0, zIndex: 1 }}
                >
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

          {!loading && (
            <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
              <span className="text-muted fs-13">
                <i className="ri-file-list-3-line me-1" />
                {fileList.length === 0
                  ? "No files"
                  : `${fileList.length} file${fileList.length > 1 ? "s" : ""} total`}
              </span>
              {fileList.length > 0 && (
                <span className="text-muted fs-12">
                  <i className="ri-mouse-line me-1" />
                  Right-click a file for options
                </span>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── File Viewer Modal ── */}
      <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />

      {/* ── Add File Modal ── */}
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

          {dropError && (
            <div className="alert alert-warning py-2 mb-3">
              <i className="ri-error-warning-line me-2" />
              {dropError}
            </div>
          )}
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

      {/* ── Delete Confirm Modal ── */}
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
