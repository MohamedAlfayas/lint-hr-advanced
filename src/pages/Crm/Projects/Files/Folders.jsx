import React, { useState, useEffect, useRef, useMemo } from "react";
import { CardGridSkeleton } from "../../../../component/common/skeleton/Skeleton";
import Dropzone from "react-dropzone";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AppTable from "../../../../shared/ui/table/AppTable";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Alert,
  Spinner,
} from "reactstrap";

import {
  setFolderData,
  setFolderLoading,
  setFolderActionLoading,
  setFolderError,
  setFolderSuccess,
  clearFolderMessages,
} from "../../../../redux/reducers/ChildReducer/FolderReducer";
import { GetApi } from "../../../../common/api/GetApi";
import { PostApi } from "../../../../common/api/PostApi";
import { testId, itemTestKey } from "../../../../shared/testing/testId";
import ModalCloseButton from "../../../../shared/ui/ModalCloseButton";

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

// Only these extensions get an inline image preview
const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const mapFile = (f) => ({
  id: f.id,
  name: f.original_file_name?.replace(/\.[^/.]+$/, "") || `file_${f.id}`,
  ext: f.original_file_name?.split(".").pop()?.toLowerCase() || "",
  type: "file",
  size: formatBytes(f.file_size),
  file_url: f.file_url,
  folder: f.folder,
  createdAt: formatDate(f.created_on),
});

const mapFolder = (f) => ({
  id: f.id,
  name: f.folder_name,
  type: "folder",
  parent_folder: f.parent_folder,
  createdAt: formatDate(f.created_on),
  children: [
    ...(f.child_folders || []).map(mapFolder),
    ...(f.files || []).map(mapFile),
  ],
});

const mapProjectResponse = (data) => {
  const source = data?.folders !== undefined ? data : (data?.data ?? data);
  return {
    allFolders: (source.folders || []).map(mapFolder),
    rootFiles: (source.root_files || []).map(mapFile),
  };
};

const insertFolderIntoState = (state, newFolder, parentFolderId) => {
  if (parentFolderId === null) {
    return { ...state, allFolders: [...(state.allFolders || []), newFolder] };
  }
  const insertIntoChildren = (folders) =>
    folders.map((f) => {
      if (f.type !== "folder") return f;
      if (f.id === parentFolderId)
        return { ...f, children: [...(f.children || []), newFolder] };
      return { ...f, children: insertIntoChildren(f.children || []) };
    });
  return { ...state, allFolders: insertIntoChildren(state.allFolders || []) };
};

const insertFilesIntoState = (state, newFiles, parentFolderId) => {
  if (parentFolderId === null) {
    return { ...state, rootFiles: [...(state.rootFiles || []), ...newFiles] };
  }
  const insertIntoChildren = (folders) =>
    folders.map((f) => {
      if (f.type !== "folder") return f;
      if (f.id === parentFolderId)
        return { ...f, children: [...(f.children || []), ...newFiles] };
      return { ...f, children: insertIntoChildren(f.children || []) };
    });
  return { ...state, allFolders: insertIntoChildren(state.allFolders || []) };
};

const removeItemsFromState = (state, folderIds, fileIds) => {
  const removeFromList = (list) => {
    let result = list.filter(
      (i) =>
        !(i.type === "folder" && folderIds.includes(i.id)) &&
        !(i.type === "file" && fileIds.includes(i.id)),
    );
    return result.map((i) =>
      i.type === "folder"
        ? { ...i, children: removeFromList(i.children || []) }
        : i,
    );
  };
  return {
    ...state,
    allFolders: removeFromList(state.allFolders || []),
    rootFiles: (state.rootFiles || []).filter((f) => !fileIds.includes(f.id)),
  };
};

// ─── File Icon Map ─────────────────────────────────────────────────────────────

const FILE_ICONS = {
  png: { icon: "ri-image-2-fill", color: "success" },
  jpg: { icon: "ri-image-2-fill", color: "success" },
  jpeg: { icon: "ri-image-2-fill", color: "success" },
  gif: { icon: "ri-image-2-fill", color: "success" },
  webp: { icon: "ri-image-2-fill", color: "success" },
  svg: { icon: "ri-image-2-fill", color: "success" },
  pdf: { icon: "ri-file-pdf-fill", color: "danger" },
  ppt: { icon: "ri-file-ppt-fill", color: "warning" },
  pptx: { icon: "ri-file-ppt-fill", color: "warning" },
  mp3: { icon: "ri-music-2-fill", color: "info" },
  wav: { icon: "ri-music-2-fill", color: "info" },
  ogg: { icon: "ri-music-2-fill", color: "info" },
  mp4: { icon: "ri-movie-fill", color: "primary" },
  webm: { icon: "ri-movie-fill", color: "primary" },
  doc: { icon: "ri-file-word-fill", color: "primary" },
  docx: { icon: "ri-file-word-fill", color: "primary" },
  txt: { icon: "ri-file-text-fill", color: "secondary" },
  zip: { icon: "ri-file-zip-fill", color: "secondary" },
  rar: { icon: "ri-file-zip-fill", color: "secondary" },
  xlsx: { icon: "ri-file-excel-fill", color: "success" },
  xls: { icon: "ri-file-excel-fill", color: "success" },
};

const getFileIcon = (extOrName) => {
  const ext = extOrName?.includes(".") ? extOrName.split(".").pop() : extOrName;
  return (
    FILE_ICONS[ext?.toLowerCase()] || {
      icon: "ri-file-fill",
      color: "secondary",
    }
  );
};

const isImageExt = (ext) => IMAGE_EXTS.includes(ext?.toLowerCase());

// ─── File Preview Modal ────────────────────────────────────────────────────────
// Images  → inline preview
// Others  → icon + Download button only (no iframe / text / audio / video)

const FileViewerModal = ({ file, onClose }) => {
  const { icon, color } = file ? getFileIcon(file.ext) : {};
  const fileIsImage = file ? isImageExt(file.ext) : false;

  if (!file) return null;

  return (
    <Modal
      data-testid="project-files-file-dialog"
      isOpen={!!file}
      toggle={onClose}
      centered
      size="xl"
      className="file-viewer-modal"
    >
      {/* Header */}
      <ModalHeader
        close={<ModalCloseButton onClick={onClose} testId="project-files-file-close-button" />}
        toggle={onClose}
        className="border-bottom"
        style={{ paddingBottom: 20 }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className={`avatar-xs d-flex align-items-center justify-content-center rounded bg-${color}-subtle flex-shrink-0`}
          >
            <i className={`${icon} text-${color} fs-16`}></i>
          </div>
          <span className="fw-semibold fs-15 d-block lh-sm">
            {file.name}.{file.ext}
          </span>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-0" style={{ minHeight: 340 }}>
        {fileIsImage ? (
          /* ── IMAGE PREVIEW ── */
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ minHeight: 400, padding: 16 }}
          >
            <img
              src={file.file_url}
              alt={file.name}
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
              <i className="ri-image-2-line display-4 d-block mb-2"></i>
              <p>Could not load image.</p>
            </div>
          </div>
        ) : (
          /* ── NON-IMAGE: download only ── */
          <div className="text-center py-5">
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-subtle mb-3`}
              style={{ width: 90, height: 90 }}
            >
              <i className={`${icon} text-${color} display-4`}></i>
            </div>
            <h6 className="fw-semibold mb-1">
              {file.name}.{file.ext}
            </h6>
            <p className="text-muted fs-13 mb-4">
              Preview is not available for{" "}
              <strong>.{file.ext?.toUpperCase()}</strong> files.
              <br />
              Download the file to view it.
            </p>
            {file.file_url && (
              <a
                data-testid="project-files-file-download-file-link"
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

      {/* Footer */}
      <ModalFooter className="border-top gap-2" style={{ paddingTop: 20 }}>
        {file.file_url && (
          <a
            data-testid="project-files-file-download-link"
            href={file.file_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-success btn-sm"
          >
            <i className="ri-download-line me-1"></i>Download
          </a>
        )}
        <Button data-testid="project-files-file-footer-close-button" color="light" size="sm" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Right-click Context Menu ──────────────────────────────────────────────────

const ContextMenu = ({ x, y, item, onClose, onAction }) => {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isFolder = item?.type === "folder";
  const menuItems = isFolder
    ? [
        { icon: "ri-compass-3-line", label: "Explore", action: "explore" },
        { icon: "ri-star-line", label: "Add to Favorites", action: "favorite" },
        { icon: "ri-pencil-line", label: "Rename", action: "rename" },
        { icon: "ri-arrow-right-line", label: "Move", action: "move" },
        { divider: true },
        {
          icon: "ri-delete-bin-line",
          label: "Delete",
          action: "delete",
          danger: true,
        },
        { icon: "ri-information-line", label: "Info", action: "info" },
      ]
    : [
        { icon: "ri-eye-line", label: "View", action: "view" },
        { icon: "ri-download-line", label: "Download", action: "download" },
        { icon: "ri-star-line", label: "Add to Favorites", action: "favorite" },
        { icon: "ri-arrow-right-line", label: "Move", action: "move" },
        { divider: true },
        {
          icon: "ri-delete-bin-line",
          label: "Delete",
          action: "delete",
          danger: true,
        },
        { icon: "ri-information-line", label: "Info", action: "info" },
      ];

  return (
    <div
      ref={ref}
      className="dropdown-menu show shadow"
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 9999,
        minWidth: 180,
      }}
    >
      {menuItems.map((m, i) =>
        m.divider ? (
          <div key={i} className="dropdown-divider" />
        ) : (
          <button
            data-testid={testId("project-files", itemTestKey(m), "button")}
            key={i}
            className={`dropdown-item d-flex align-items-center gap-2${m.danger ? " text-danger" : ""}`}
            onClick={() => {
              onAction(m.action, item);
              onClose();
            }}
          >
            <i className={`${m.icon} fs-14`} />
            {m.label}
          </button>
        ),
      )}
    </div>
  );
};

// ─── Folder Tree (Move Modal) ──────────────────────────────────────────────────

const FolderTree = ({
  folders,
  excludeIds = [],
  selectedId,
  onSelect,
  depth = 0,
}) => (
  <>
    {folders
      .filter((f) => f.type === "folder" && !excludeIds.includes(f.id))
      .map((f) => (
        <React.Fragment key={f.id}>
          <div
            className={`d-flex align-items-center gap-2 py-1 px-2 rounded ${
              selectedId === f.id
                ? "bg-success bg-opacity-10 text-success fw-medium"
                : "text-body"
            }`}
            style={{ paddingLeft: 12 + depth * 20, cursor: "pointer" }}
            onClick={() => onSelect(f.id)}
          >
            <i className="ri-folder-2-fill text-warning fs-14" />
            <span style={{ fontSize: 14 }}>{f.name}</span>
            {selectedId === f.id && (
              <i className="ri-check-line ms-auto text-success" />
            )}
          </div>
          {(f.children || []).some((c) => c.type === "folder") && (
            <FolderTree
              folders={f.children}
              excludeIds={excludeIds}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </React.Fragment>
      ))}
  </>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const Folders = ({ projectId, canAddFiles = true  }) => {
  const dispatch = useDispatch();

  // ── Redux state ───────────────────────────────────────────────────────────────
  const { allFolders, rootFiles } = useSelector(
    (s) => s.FolderReducer.folder_data,
  );
  const loading = useSelector((s) => s.FolderReducer.folder_loading);
  const actionLoading = useSelector(
    (s) => s.FolderReducer.folder_action_loading,
  );
  const errorMsg = useSelector((s) => s.FolderReducer.folder_error);
  const successMsg = useSelector((s) => s.FolderReducer.folder_success);

  // ── Local UI state ────────────────────────────────────────────────────────────
  const [pathStack, setPathStack] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [selected, setSelected] = useState(new Set());

  // Modals
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFileModal, setNewFileModal] = useState(false);
  const [renameModal, setRenameModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [viewerFile, setViewerFile] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form values
  const [newFolderName, setNewFolderName] = useState("");
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [dropError, setDropError] = useState("");
  const [renameName, setRenameName] = useState("");

  const [ctxMenu, setCtxMenu] = useState(null);

  // ── Bootstrap ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProjectDetail();
  }, []);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => dispatch(clearFolderMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    setSelected(new Set());
  }, [pathStack]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const currentFolderId = pathStack.length
    ? pathStack[pathStack.length - 1]
    : null;
  const itemKey = (item) => `${item.type}-${item.id}`;

  const closeAddModal = () => {
    setNewFileModal(false);
    setDroppedFiles([]);
    setDropError("");
  };

  const handleDrop = (acceptedFiles) => {
    setDropError("");
    const invalid = acceptedFiles.filter(
      (f) =>
        !ALLOWED_EXTENSIONS.includes(f.name.split(".").pop()?.toLowerCase()),
    );
    if (invalid.length) {
      setDropError(
        `Some files were skipped (unsupported type): ${invalid.map((f) => f.name).join(", ")}`,
      );
    }
    const valid = acceptedFiles.filter((f) =>
      ALLOWED_EXTENSIONS.includes(f.name.split(".").pop()?.toLowerCase()),
    );
    setDroppedFiles((prev) => [...prev, ...valid]);
  };

  const removeQueued = (index) =>
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));

  // ── API ───────────────────────────────────────────────────────────────────────

  const fetchProjectDetail = async () => {
    dispatch(setFolderLoading(true));
    try {
      const res = await GetApi(`projects/get-project-detail/${projectId}`);
      if (res?.status === 200) {
        dispatch(setFolderData(mapProjectResponse(res.data?.data ?? res.data)));
      } else {
        dispatch(
          setFolderError(res?.data?.message || "Failed to load project files"),
        );
      }
    } catch {
      dispatch(setFolderError("Failed to load project files"));
    } finally {
      dispatch(setFolderLoading(false));
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    dispatch(setFolderActionLoading(true));
    try {
      const res = await PostApi("projects/create-folder/", {
        project: projectId,
        parent_folder: currentFolderId,
        folder_name: newFolderName.trim(),
      });
      if (res?.status === 200 || res?.status === 201) {
        const created = res.data?.data;
        const newFolder = {
          id: created?.id,
          name: created?.folder_name || newFolderName.trim(),
          type: "folder",
          parent_folder: created?.parent_folder ?? currentFolderId,
          createdAt: formatDate(created?.created_on),
          children: [],
        };
        dispatch(
          setFolderData(
            insertFolderIntoState(
              { allFolders, rootFiles },
              newFolder,
              currentFolderId,
            ),
          ),
        );
        dispatch(
          setFolderSuccess(res.data?.message || "Folder Created Successfully"),
        );
        setNewFolderName("");
        setNewFolderModal(false);
      } else {
        dispatch(
          setFolderError(res?.data?.message || "Failed to create folder"),
        );
      }
    } catch {
      dispatch(setFolderError("Failed to create folder"));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !renameModal) return;
    dispatch(setFolderActionLoading(true));
    try {
      const res = await PostApi("projects/rename-folder/", {
        folder: renameModal.id,
        project: projectId,
        folder_name: renameName.trim(),
      });
      if (res?.status === 200 || res?.status === 201) {
        dispatch(setFolderSuccess(res.data?.message || "Renamed Successfully"));
        await fetchProjectDetail();
        setRenameModal(null);
        setRenameName("");
      } else {
        dispatch(setFolderError(res?.data?.message || "Failed to rename"));
      }
    } catch {
      dispatch(setFolderError("Failed to rename"));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  const handleAddFiles = async () => {
    if (!droppedFiles.length) return;
    dispatch(setFolderActionLoading(true));
    try {
      const formData = new FormData();
      formData.append("project", projectId);
      if (currentFolderId !== null) formData.append("folder", currentFolderId);
      droppedFiles.forEach((f) => formData.append("files", f));

      const res = await PostApi("projects/add-file/", formData);

      if (res?.status === 200 || res?.status === 201) {
        const uploaded = (res.data?.data ?? []).map(mapFile);
        dispatch(
          setFolderData(
            insertFilesIntoState(
              { allFolders, rootFiles },
              uploaded,
              currentFolderId,
            ),
          ),
        );
        dispatch(
          setFolderSuccess(res.data?.message || "Files Uploaded Successfully"),
        );
        closeAddModal();
      } else {
        dispatch(
          setFolderError(res?.data?.message || "Failed to upload files"),
        );
      }
    } catch {
      dispatch(setFolderError("Failed to upload files"));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  const handleMove = async () => {
    if (!moveModal) return;
    dispatch(setFolderActionLoading(true));
    try {
      const folderIds = moveModal.isBulk
        ? moveModal.items.filter((i) => i.type === "folder").map((i) => i.id)
        : moveModal.items[0].type === "folder"
          ? [moveModal.items[0].id]
          : [];
      const fileIds = moveModal.isBulk
        ? moveModal.items.filter((i) => i.type === "file").map((i) => i.id)
        : moveModal.items[0].type === "file"
          ? [moveModal.items[0].id]
          : [];

      const res = await PostApi("projects/move-items/", {
        folder_ids: folderIds,
        file_ids: fileIds,
        target_parent_folder: moveTarget,
      });
      if (res?.status === 200 || res?.status === 201) {
        dispatch(
          setFolderSuccess(res.data?.message || "Items moved successfully"),
        );
        dispatch(setFolderData(mapProjectResponse(res.data?.data ?? res.data)));
        setMoveModal(null);
        setMoveTarget(null);
        setSelectedItem(null);
        setSelected(new Set());
      } else {
        dispatch(setFolderError(res?.data?.message || "Failed to move items"));
      }
    } catch {
      dispatch(setFolderError("Failed to move items"));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    dispatch(setFolderActionLoading(true));
    try {
      const folderIds = deleteConfirm.isBulk
        ? deleteConfirm.items
            .filter((i) => i.type === "folder")
            .map((i) => i.id)
        : deleteConfirm.items[0].type === "folder"
          ? [deleteConfirm.items[0].id]
          : [];
      const fileIds = deleteConfirm.isBulk
        ? deleteConfirm.items.filter((i) => i.type === "file").map((i) => i.id)
        : deleteConfirm.items[0].type === "file"
          ? [deleteConfirm.items[0].id]
          : [];

      const res = await PostApi("projects/delete-items/", {
        folder_ids: folderIds,
        file_ids: fileIds,
        project: projectId,
      });
      if (res?.status === 200 || res?.status === 201) {
        dispatch(
          setFolderSuccess(res.data?.message || "Items deleted successfully"),
        );
        dispatch(
          setFolderData(
            removeItemsFromState({ allFolders, rootFiles }, folderIds, fileIds),
          ),
        );
        if (selectedItem && folderIds.concat(fileIds).includes(selectedItem.id))
          setSelectedItem(null);
        setDeleteConfirm(null);
        setSelected(new Set());
      } else {
        dispatch(
          setFolderError(res?.data?.message || "Failed to delete items"),
        );
      }
    } catch {
      dispatch(setFolderError("Failed to delete items"));
    } finally {
      dispatch(setFolderActionLoading(false));
    }
  };

  // ── Tree Helpers ──────────────────────────────────────────────────────────────

  const getFolderByPath = (folders, path) => {
    if (!path.length) return null;
    let cur = folders.find((f) => f.id === path[0]);
    for (let i = 1; i < path.length; i++) {
      if (!cur) return null;
      cur = (cur.children || []).find((f) => f.id === path[i]);
    }
    return cur;
  };

  const getBreadcrumbName = (id) => {
    const find = (folders) => {
      for (const f of folders) {
        if (f.id === id) return f.name;
        const r = find(f.children || []);
        if (r) return r;
      }
    };
    return find(allFolders);
  };

  const currentItems = () => {
    let items = !pathStack.length
      ? [...allFolders, ...rootFiles]
      : getFolderByPath(allFolders, pathStack)?.children || [];

    if (filterType !== "All") {
      const extMap = {
        Folders: null,
        Video: ["mp4", "avi", "webm", "mov"],
        Images: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
        Music: ["mp3", "wav", "ogg", "aac"],
        Documents: ["pdf", "doc", "docx", "ppt", "pptx", "txt", "xlsx", "xls"],
      };
      items = items.filter((i) =>
        filterType === "Folders"
          ? i.type === "folder"
          : extMap[filterType]?.includes(i.ext?.toLowerCase()),
      );
    }

    if (searchQuery)
      items = items.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return items;
  };

  // ── Bulk selection ────────────────────────────────────────────────────────────

  const toggleSelect = (item, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      const k = itemKey(item);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const getSelectedItems = (items) =>
    items.filter((i) => selected.has(itemKey(i)));

  // ── Context Menu Actions ──────────────────────────────────────────────────────

  const handleContextAction = (action, item) => {
    ({
      explore: () => {
        setPathStack((p) => [...p, item.id]);
        setSelectedItem(null);
      },
      favorite: () =>
        setFavorites((p) =>
          p.find((f) => f.id === item.id)
            ? p.filter((f) => f.id !== item.id)
            : [...p, item],
        ),
      rename: () => {
        if (item.type !== "folder") return;
        setRenameName(item.name);
        setRenameModal(item);
      },
      move: () => {
        setMoveTarget(null);
        setMoveModal({ items: [item], isBulk: false });
      },
      delete: () => setDeleteConfirm({ items: [item], isBulk: false }),
      info: () => setInfoModal(item),
      view: () => setViewerFile(item),
      download: () => item.file_url && window.open(item.file_url, "_blank"),
    })[action]?.();
  };

  const onRightClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, item });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const items = currentItems();
  const folderItems = items.filter((i) => i.type === "folder");
  const fileItems = items.filter((i) => i.type === "file");
  const selItems = getSelectedItems(items);
  const hasSelection = selected.size > 0;

  const fileRowSelection = Object.fromEntries(
    fileItems
      .filter((f) => selected.has(itemKey(f)))
      .map((f) => [itemKey(f), true]),
  );

  const handleFileRowSelectionChange = (updater) => {
    const next =
      typeof updater === "function" ? updater(fileRowSelection) : updater;
    setSelected((prev) => {
      const s = new Set(prev);
      fileItems.forEach((f) =>
        next[itemKey(f)] ? s.add(itemKey(f)) : s.delete(itemKey(f)),
      );
      return s;
    });
  };

  const fileColumns = useMemo(
    () => [
      {
        id: "icon",
        header: "",
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
        enableColumnActions: false,
        Cell: ({ row }) => {
          const { icon, color } = getFileIcon(row.original.ext);
          return (
            <div
              className={`avatar-xs d-flex align-items-center justify-content-center rounded bg-${color}-subtle`}
            >
              <i className={`${icon} text-${color} fs-18`}></i>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 240,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              {row.original.name}
            </Typography>
            {favorites.find((f) => f.id === row.original.id) && (
              <i className="ri-star-fill text-warning fs-12"></i>
            )}
          </Stack>
        ),
      },
      {
        id: "type",
        accessorFn: (r) => r.ext?.toUpperCase() ?? "",
        header: "Type",
        filterVariant: "select",
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="outlined"
            color={
              getFileIcon(row.original.ext).color === "danger"
                ? "error"
                : getFileIcon(row.original.ext).color
            }
            label={row.original.ext?.toUpperCase()}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        accessorKey: "size",
        header: "Size",
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue()}
          </Typography>
        ),
      },
    ],
    [favorites],
  );

  return (
    <React.Fragment>
      <div className="file-manager-content w-100 p-3 py-0">
        {/* ── Flash Messages ── */}
        {successMsg && (
          <Alert color="success" className="mt-2 py-2">
            <i className="ri-check-line me-2"></i>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert color="danger" className="mt-2 py-2">
            <i className="ri-error-warning-line me-2"></i>
            {typeof errorMsg === "string" ? errorMsg : "Something went wrong"}
          </Alert>
        )}

        <div className="mx-n3 pt-4 px-4 file-manager-content-scroll overflow-x-hidden overflow-y-auto">
          {/* ── Toolbar ── */}
          <Row className="justify-content-between g-2 mb-3">
            <Col>
              <div className="d-flex align-items-center gap-2">
                <div className="flex-shrink-0 d-block d-lg-none">
                  <button
                    data-testid="project-files-menu-button"
                    type="button"
                    className="btn btn-soft-success btn-icon btn-sm fs-16"
                  >
                    <i className="ri-menu-2-fill align-bottom"></i>
                  </button>
                </div>

                {/* Breadcrumb */}
                <div className="d-flex align-items-center gap-1">
                  <span
                    className="text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setPathStack([]);
                      setSelectedItem(null);
                      setSelected(new Set());
                    }}
                  >
                    <i className="ri-home-4-line fs-16 align-bottom"></i>
                  </span>
                  {pathStack.map((id, i) => (
                    <React.Fragment key={id}>
                      <i className="ri-arrow-right-s-line text-muted"></i>
                      <span
                        className={`fw-medium ${i === pathStack.length - 1 ? "" : "text-muted"}`}
                        style={{ cursor: "pointer", fontSize: 14 }}
                        onClick={() => {
                          setPathStack((p) => p.slice(0, i + 1));
                          setSelectedItem(null);
                          setSelected(new Set());
                        }}
                      >
                        {getBreadcrumbName(id)}
                      </span>
                    </React.Fragment>
                  ))}
                  {!pathStack.length && (
                    <h5 className="fs-16 mb-0 ms-1">Folders</h5>
                  )}
                </div>
              </div>
            </Col>

            <Col className="col-auto">
              <div className="d-flex gap-2 align-items-center">
                <div className="search-box">
                  <Input
                    data-testid="project-files-search-input"
                    type="text"
                    className="form-control search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ minWidth: 160 }}
                  />
                  <i className="ri-search-line search-icon"></i>
                </div>

                <Input
                  data-testid="project-files-filter-type-select"
                  type="select"
                  className="form-select"
                  style={{ width: "auto" }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option data-testid="project-files-filter-type-option-all">All</option>
                  <option data-testid="project-files-filter-type-option-folders">Folders</option>
                  <option data-testid="project-files-filter-type-option-video">Video</option>
                  <option data-testid="project-files-filter-type-option-images">Images</option>
                  <option data-testid="project-files-filter-type-option-music">Music</option>
                  <option data-testid="project-files-filter-type-option-documents">Documents</option>
                </Input>

                <button
                  data-testid="project-files-refresh-button"
                  className="btn btn-soft-secondary btn-icon"
                  title="Refresh"
                  disabled={loading}
                  onClick={fetchProjectDetail}
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <i className="ri-refresh-line"></i>
                  )}
                </button>

                        {canAddFiles && (
                  <>
                    <button
                      data-testid="project-files-new-folder-button"
                      className="btn btn-soft-success text-nowrap flex-shrink-0"
                      onClick={() => setNewFolderModal(true)}
                    >
                      <i className="ri-folder-add-line align-bottom me-1"></i>
                      New Folder
                    </button>
                    <button
                      data-testid="project-files-add-files-button"
                      className="btn btn-success text-nowrap flex-shrink-0"
                      onClick={() => setNewFileModal(true)}
                    >
                      <i className="ri-add-line align-bottom me-1"></i>Add
                      Files
                    </button>
                  </>
                )}
              </div>
            </Col>
          </Row>

          {/* ── Bulk Action Bar ── */}
          {hasSelection && (
            <div
              className="d-flex align-items-center gap-3 px-3 py-2 mb-3 rounded border border-success bg-success bg-opacity-10"
              style={{ flexWrap: "wrap" }}
            >
              <span className="fw-medium text-success fs-14">
                <i className="ri-checkbox-multiple-line me-1"></i>
                {selected.size} item{selected.size > 1 ? "s" : ""} selected
              </span>
              <div className="d-flex gap-2 ms-auto">
                <button
                  data-testid="project-files-move-selected-button"
                  className="btn btn-sm btn-soft-primary d-flex align-items-center gap-1"
                  onClick={() => {
                    setMoveTarget(null);
                    setMoveModal({ items: selItems, isBulk: true });
                  }}
                >
                  <i className="ri-arrow-right-line"></i>Move Selected
                </button>
                <button
                  data-testid="project-files-delete-selected-button"
                  className="btn btn-sm btn-soft-danger d-flex align-items-center gap-1"
                  onClick={() =>
                    setDeleteConfirm({ items: selItems, isBulk: true })
                  }
                >
                  <i className="ri-delete-bin-line"></i>Delete Selected
                </button>
                <button
                  data-testid="project-files-clear-selection-button"
                  className="btn btn-sm btn-ghost-secondary"
                  onClick={() => setSelected(new Set())}
                  title="Clear selection"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <CardGridSkeleton count={8} min={180} testId="files-loading-skeleton" label="Loading files" />
          )}

          {/* ── Empty State ── */}
          {!loading && items.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="ri-folder-open-line display-4 d-block mb-2"></i>
              {searchQuery ? "No results found." : "This folder is empty."}
            </div>
          )}

          {/* ── Folder Cards ── */}
          {!loading && folderItems.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3 gap-2">
                <h6 className="text-muted text-uppercase fs-11 mb-0">
                  Folders
                </h6>
                <div className="form-check mb-0 ms-2">
                  <input
                    data-testid="project-files-select-all-folders-checkbox"
                    type="checkbox"
                    className="form-check-input"
                    id="selectAllFolders"
                    checked={
                      folderItems.length > 0 &&
                      folderItems.every((f) => selected.has(itemKey(f)))
                    }
                    onChange={() => {
                      const allSelected = folderItems.every((f) =>
                        selected.has(itemKey(f)),
                      );
                      setSelected((prev) => {
                        const next = new Set(prev);
                        folderItems.forEach((f) =>
                          allSelected
                            ? next.delete(itemKey(f))
                            : next.add(itemKey(f)),
                        );
                        return next;
                      });
                    }}
                    title="Select all folders"
                  />
                  <label
                    className="form-check-label text-muted fs-12"
                    htmlFor="selectAllFolders"
                  >
                    Select all
                  </label>
                </div>
              </div>

              <Row className="g-3">
                {folderItems.map((item) => {
                  const isFav = favorites.find((f) => f.id === item.id);
                  const isSelected = selected.has(itemKey(item));
                  return (
                    <Col xxl={3} md={4} sm={6} key={item.id}>
                      <Card
                        className={`bg-light shadow-none h-100 mb-0${
                          isSelected || selectedItem?.id === item.id
                            ? " border border-success"
                            : ""
                        }`}
                        style={{ cursor: "pointer", position: "relative" }}
                        onClick={() => setSelectedItem(item)}
                        onDoubleClick={() => {
                          setPathStack((p) => [...p, item.id]);
                          setSelectedItem(null);
                          setSelected(new Set());
                        }}
                        onContextMenu={(e) => onRightClick(e, item)}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 10,
                            zIndex: 2,
                          }}
                          onClick={(e) => toggleSelect(item, e)}
                        >
                          <input
                            data-testid={testId("project-files-is-selected", itemTestKey(item), "checkbox")}
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                        </div>

                        <CardBody>
                          <div className="d-flex justify-content-between mb-1">
                            {isFav && (
                              <i className="ri-star-fill text-warning fs-14 mt-1"></i>
                            )}
                            <div className="ms-auto">
                              <UncontrolledDropdown
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownToggle
                                  data-testid={testId("project-files-more", itemTestKey(item), "trigger")}
                                  tag="button"
                                  className="btn btn-ghost-primary btn-icon btn-sm"
                                >
                                  <i className="ri-more-2-fill fs-16 align-bottom" />
                                </DropdownToggle>
                                <DropdownMenu end>
                                  <DropdownItem
                                    data-testid={testId("project-files-explore", itemTestKey(item), "option")}
                                    onClick={() => {
                                      setPathStack((p) => [...p, item.id]);
                                      setSelectedItem(null);
                                    }}
                                  >
                                    <i className="ri-compass-3-line me-2"></i>
                                    Explore
                                  </DropdownItem>
                                  <DropdownItem
                                    data-testid={testId("project-files-unfavorite", itemTestKey(item), "option")}
                                    onClick={() =>
                                      setFavorites((p) =>
                                        p.find((f) => f.id === item.id)
                                          ? p.filter((f) => f.id !== item.id)
                                          : [...p, item],
                                      )
                                    }
                                  >
                                    <i
                                      className={`${isFav ? "ri-star-fill text-warning" : "ri-star-line"} me-2`}
                                    ></i>
                                    {isFav ? "Unfavorite" : "Add to Favorites"}
                                  </DropdownItem>
                                  <DropdownItem
                                    data-testid={testId("project-files-rename", itemTestKey(item), "option")}
                                    onClick={() => {
                                      setRenameName(item.name);
                                      setRenameModal(item);
                                    }}
                                  >
                                    <i className="ri-pencil-line me-2"></i>
                                    Rename
                                  </DropdownItem>
                                  <DropdownItem
                                    data-testid={testId("project-files-move", itemTestKey(item), "option")}
                                    onClick={() => {
                                      setMoveTarget(null);
                                      setMoveModal({
                                        items: [item],
                                        isBulk: false,
                                      });
                                    }}
                                  >
                                    <i className="ri-arrow-right-line me-2"></i>
                                    Move
                                  </DropdownItem>
                                  <DropdownItem divider />
                                  <DropdownItem
                                    data-testid={testId("project-files-delete", itemTestKey(item), "option")}
                                    className="text-danger"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        items: [item],
                                        isBulk: false,
                                      })
                                    }
                                  >
                                    <i className="ri-delete-bin-line me-2"></i>
                                    Delete
                                  </DropdownItem>
                                  <DropdownItem
                                    data-testid={testId("project-files-info", itemTestKey(item), "option")}
                                    onClick={() => setInfoModal(item)}
                                  >
                                    <i className="ri-information-line me-2"></i>
                                    Info
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="mb-2">
                              <i className="ri-folder-2-fill text-warning display-5"></i>
                            </div>
                            <h6 className="fs-15 mb-0">{item.name}</h6>
                            <p className="text-muted fs-12 mb-0 mt-1">
                              {(item.children || []).length} items
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {/* ── File Table ── */}
          {!loading && fileItems.length > 0 && (
            <div className="mb-4">
              <h6 className="text-muted text-uppercase fs-11 mb-3">Files</h6>
              <AppTable
                columns={fileColumns}
                data={fileItems}
                enableRowSelection
                selectAllMode="all"
                getRowId={itemKey}
                state={{ rowSelection: fileRowSelection }}
                onRowSelectionChange={handleFileRowSelectionChange}
                enableRowActions
                positionActionsColumn="last"
                displayColumnDefOptions={{
                  "mrt-row-actions": { header: "Actions", size: 100 },
                }}
                renderRowActions={({ row }) => {
                  const item = row.original;
                  return (
                    <Box
                      sx={{ display: "flex", gap: 0.5 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isImageExt(item.ext) && (
                        <Tooltip title="View image">
                          <IconButton
                            data-testid="project-files-view-button"
                            size="small"
                            color="success"
                            onClick={() => setViewerFile(item)}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.file_url && (
                        <Tooltip title="Download">
                          <IconButton
                            data-testid="project-files-download-button"
                            size="small"
                            color="primary"
                            component="a"
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileDownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  );
                }}
                muiTableBodyRowProps={({ row }) => ({
                  hover: true,
                  onClick: () => setSelectedItem(row.original),
                  onDoubleClick: () => setViewerFile(row.original),
                  onContextMenu: (e) => onRightClick(e, row.original),
                  sx: (theme) => ({
                    cursor: "pointer",
                    "&:last-of-type td": { borderBottom: 0 },
                    ...(selectedItem?.id === row.original.id &&
                      !row.getIsSelected() && {
                        "& > td": {
                          backgroundColor: alpha(theme.palette.success.main, 0.12),
                        },
                      }),
                  }),
                })}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Context Menu ── */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          item={ctxMenu.item}
          onClose={() => setCtxMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {/* ── File Viewer Modal ── */}
      <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />

      {/* ── New Folder Modal ── */}
      <Modal
        data-testid="project-files-new-folder-dialog"
        isOpen={newFolderModal}
        toggle={() => setNewFolderModal(false)}
        centered
      >
        <ModalHeader close={<ModalCloseButton onClick={() => setNewFolderModal(false)} testId="project-files-new-folder-close-button" />} toggle={() => setNewFolderModal(false)}>
          New Folder
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Folder Name</Label>
            <Input
              data-testid="project-files-new-folder-enter-folder-name-input"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              placeholder="Enter folder name"
              autoFocus
            />
          </FormGroup>
          {currentFolderId && (
            <p className="text-muted fs-12 mb-0">
              <i className="ri-folder-2-fill text-warning me-1"></i>
              Creating inside:{" "}
              <strong>{getBreadcrumbName(currentFolderId)}</strong>
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button data-testid="project-files-new-folder-cancel-button" color="light" onClick={() => setNewFolderModal(false)}>
            Cancel
          </Button>
          <Button
            data-testid="project-files-new-folder-add-button"
            color="success"
            onClick={handleCreateFolder}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Creating…
              </>
            ) : (
              <>
                <i className="ri-folder-add-line me-1"></i>Create
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Add Files Modal ── */}
      <Modal
        data-testid="project-files-add-files-dialog"
        isOpen={newFileModal}
        toggle={closeAddModal}
        centered
        size="md"
        className="zoomIn"
      >
        <ModalHeader close={<ModalCloseButton onClick={closeAddModal} testId="project-files-add-files-close-button" />} toggle={closeAddModal} className="p-3 bg-success-subtle">
          Add Files
          {currentFolderId && (
            <span className="text-muted fs-12 ms-2 fw-normal">
              → <i className="ri-folder-2-fill text-warning me-1"></i>
              {getBreadcrumbName(currentFolderId)}
            </span>
          )}
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
                    <input data-testid="project-files-add-files-upload-files-input" {...getInputProps()} />
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

          {droppedFiles.length > 0 && (
            <div className="mb-3">
              <Label className="form-label">
                Selected Files ({droppedFiles.length})
              </Label>
              <ul className="list-group list-group-flush">
                {droppedFiles.map((f, i) => {
                  const { icon, color } = getFileIcon(f.name);
                  return (
                    <li
                      key={i}
                      className="list-group-item d-flex align-items-center justify-content-between px-0 py-1"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`${icon} text-${color} fs-17`} />
                        <span
                          className="text-truncate"
                          style={{ maxWidth: 260 }}
                        >
                          {f.name}
                        </span>
                        <span className="text-muted small">
                          ({formatBytes(f.size)})
                        </span>
                      </div>
                      <button
                        data-testid={testId("project-files-add-files-close", itemTestKey(f), "button")}
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
              data-testid="project-files-add-files-footer-close-button"
              type="button"
              className="btn btn-ghost-success"
              onClick={closeAddModal}
              disabled={actionLoading}
            >
              <i className="ri-close-line align-bottom me-1" />
              Close
            </button>
            <button
              data-testid="project-files-add-files-upload-button"
              type="button"
              className="btn btn-primary"
              onClick={handleAddFiles}
              disabled={actionLoading || droppedFiles.length === 0}
            >
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />
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

      {/* ── Rename Folder Modal ── */}
      <Modal
        data-testid="project-files-rename-folder-dialog"
        isOpen={!!renameModal}
        toggle={() => setRenameModal(null)}
        centered
      >
        <ModalHeader close={<ModalCloseButton onClick={() => setRenameModal(null)} testId="project-files-rename-folder-close-button" />} toggle={() => setRenameModal(null)}>
          Rename Folder
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>New Folder Name</Label>
            <Input
              data-testid="project-files-rename-folder-new-folder-name-input"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button data-testid="project-files-rename-folder-cancel-button" color="light" onClick={() => setRenameModal(null)}>
            Cancel
          </Button>
          <Button
            data-testid="project-files-rename-folder-edit-button"
            color="success"
            onClick={handleRename}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Saving…
              </>
            ) : (
              <>
                <i className="ri-pencil-line me-1"></i>Save
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Move Modal ── */}
      <Modal
        data-testid="project-files-move-dialog"
        isOpen={!!moveModal}
        toggle={() => {
          setMoveModal(null);
          setMoveTarget(null);
        }}
        centered
      >
        <ModalHeader
          close={<ModalCloseButton onClick={() => {
            setMoveModal(null);
            setMoveTarget(null);
          }} testId="project-files-move-close-button" />}
          toggle={() => {
            setMoveModal(null);
            setMoveTarget(null);
          }}
        >
          <i className="ri-arrow-right-line me-2 text-success"></i>
          {moveModal?.isBulk
            ? `Move ${moveModal.items.length} item${moveModal.items.length > 1 ? "s" : ""}`
            : `Move "${moveModal?.items[0]?.name}"`}
        </ModalHeader>
        <ModalBody>
          {moveModal?.isBulk && (
            <div className="mb-3 p-2 bg-light rounded border">
              <p className="text-muted fs-12 mb-1 fw-medium">Selected items:</p>
              <div className="d-flex flex-wrap gap-1">
                {moveModal.items.map((item) => (
                  <span
                    key={itemKey(item)}
                    className={`badge ${item.type === "folder" ? "bg-warning-subtle text-warning" : "bg-primary-subtle text-primary"}`}
                  >
                    <i
                      className={`${item.type === "folder" ? "ri-folder-2-fill" : "ri-file-fill"} me-1`}
                    ></i>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-muted fs-13 mb-3">
            Select a destination folder. Choose <strong>Root</strong> to move to
            the top level.
          </p>

          <div
            className={`d-flex align-items-center gap-2 py-2 px-2 rounded mb-1 ${moveTarget === null ? "bg-success bg-opacity-10 text-success fw-medium" : "text-body"}`}
            style={{ cursor: "pointer" }}
            onClick={() => setMoveTarget(null)}
          >
            <i className="ri-home-4-line fs-15 text-success" />
            <span style={{ fontSize: 14 }}>Root (Home)</span>
            {moveTarget === null && (
              <i className="ri-check-line ms-auto text-success" />
            )}
          </div>

          <div
            className="border rounded p-2"
            style={{ maxHeight: 260, overflowY: "auto" }}
          >
            {allFolders.filter((f) => f.type === "folder").length === 0 ? (
              <p className="text-muted fs-13 mb-0 text-center py-3">
                No folders available.
              </p>
            ) : (
              <FolderTree
                folders={allFolders}
                excludeIds={
                  moveModal?.isBulk
                    ? moveModal.items
                        .filter((i) => i.type === "folder")
                        .map((i) => i.id)
                    : moveModal?.items[0]?.type === "folder"
                      ? [moveModal.items[0].id]
                      : []
                }
                selectedId={moveTarget}
                onSelect={setMoveTarget}
              />
            )}
          </div>

          <div
            className={`alert alert-${moveTarget !== null ? "success" : "info"} mt-3 py-2 mb-0 d-flex align-items-center gap-2`}
          >
            <i
              className={
                moveTarget !== null
                  ? "ri-folder-2-fill text-success"
                  : "ri-home-4-line text-info"
              }
            ></i>
            <span className="fs-13">
              Moving to:{" "}
              <strong>
                {moveTarget !== null ? getBreadcrumbName(moveTarget) : "Root"}
              </strong>
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            data-testid="project-files-move-cancel-button"
            color="light"
            onClick={() => {
              setMoveModal(null);
              setMoveTarget(null);
            }}
          >
            Cancel
          </Button>
          <Button data-testid="project-files-move-next-button" color="success" onClick={handleMove} disabled={actionLoading}>
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Moving…
              </>
            ) : (
              <>
                <i className="ri-arrow-right-line me-1"></i>Move Here
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        data-testid="project-files-confirm-delete-dialog"
        isOpen={!!deleteConfirm}
        toggle={() => setDeleteConfirm(null)}
        centered
        size={deleteConfirm?.isBulk ? "md" : "sm"}
      >
        <ModalHeader close={<ModalCloseButton onClick={() => setDeleteConfirm(null)} testId="project-files-confirm-delete-close-button" />} toggle={() => setDeleteConfirm(null)}>
          <i className="ri-delete-bin-line me-2 text-danger"></i>Confirm Delete
        </ModalHeader>
        <ModalBody>
          {deleteConfirm?.isBulk ? (
            <>
              <p className="mb-2">
                Are you sure you want to delete{" "}
                <strong>
                  {deleteConfirm.items.length} item
                  {deleteConfirm.items.length > 1 ? "s" : ""}
                </strong>
                ?
              </p>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {deleteConfirm.items.map((item) => (
                  <span
                    key={itemKey(item)}
                    className={`badge ${item.type === "folder" ? "bg-warning-subtle text-warning" : "bg-primary-subtle text-primary"}`}
                  >
                    <i
                      className={`${item.type === "folder" ? "ri-folder-2-fill" : "ri-file-fill"} me-1`}
                    ></i>
                    {item.name}
                  </span>
                ))}
              </div>
              {deleteConfirm.items.some((i) => i.type === "folder") && (
                <p className="text-danger fs-12 mb-0">
                  <i className="ri-error-warning-line me-1"></i>
                  All contents inside selected folders will also be deleted.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mb-1">
                Are you sure you want to delete{" "}
                <strong>"{deleteConfirm?.items[0]?.name}"</strong>?
              </p>
              {deleteConfirm?.items[0]?.type === "folder" && (
                <p className="text-danger fs-12 mb-0">
                  <i className="ri-error-warning-line me-1"></i>
                  All contents inside this folder will also be deleted.
                </p>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button data-testid="project-files-confirm-delete-cancel-button" color="light" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            data-testid="project-files-confirm-delete-confirm-button"
            color="danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Deleting…
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line me-1"></i>Delete
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Info Modal ── */}
      <Modal data-testid="project-files-info-dialog" isOpen={!!infoModal} toggle={() => setInfoModal(null)} centered>
        <ModalHeader close={<ModalCloseButton onClick={() => setInfoModal(null)} testId="project-files-info-close-button" />} toggle={() => setInfoModal(null)}>
          <i className="ri-information-line me-2 text-success"></i>
          {infoModal?.type === "folder" ? "Folder" : "File"} Info
        </ModalHeader>
        <ModalBody>
          {infoModal && (
            <table className="table table-borderless table-sm mb-0">
              <tbody>
                <tr>
                  <th className="text-muted fw-normal" style={{ width: 100 }}>
                    Name
                  </th>
                  <td className="fw-medium">{infoModal.name}</td>
                </tr>
                <tr>
                  <th className="text-muted fw-normal">Type</th>
                  <td>
                    {infoModal.type === "folder"
                      ? "Folder"
                      : `${infoModal.ext?.toUpperCase()} File`}
                  </td>
                </tr>
                {infoModal.size && (
                  <tr>
                    <th className="text-muted fw-normal">Size</th>
                    <td>{infoModal.size}</td>
                  </tr>
                )}
                {infoModal.file_url && (
                  <tr>
                    <th className="text-muted fw-normal">URL</th>
                    <td>
                      <a
                        data-testid="project-files-info-file-url-link"
                        href={infoModal.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-success text-truncate d-block"
                        style={{ maxWidth: 220 }}
                      >
                        {infoModal.file_url}
                      </a>
                    </td>
                  </tr>
                )}
                {infoModal.createdAt && (
                  <tr>
                    <th className="text-muted fw-normal">Date</th>
                    <td>{infoModal.createdAt}</td>
                  </tr>
                )}
                {infoModal.type === "folder" && (
                  <tr>
                    <th className="text-muted fw-normal">Items</th>
                    <td>{(infoModal.children || []).length} items</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button data-testid="project-files-info-footer-close-button" color="light" onClick={() => setInfoModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Folders;
