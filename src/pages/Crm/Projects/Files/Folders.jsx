import React, { useState, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
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
} from "reactstrap";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILE_ICONS = {
  png: { icon: "ri-image-2-fill", color: "success" },
  jpg: { icon: "ri-image-2-fill", color: "success" },
  jpeg: { icon: "ri-image-2-fill", color: "success" },
  pdf: { icon: "ri-file-pdf-fill", color: "danger" },
  ppt: { icon: "ri-file-ppt-fill", color: "warning" },
  pptx: { icon: "ri-file-ppt-fill", color: "warning" },
  mp3: { icon: "ri-music-2-fill", color: "info" },
  mp4: { icon: "ri-movie-fill", color: "primary" },
  doc: { icon: "ri-file-word-fill", color: "primary" },
  docx: { icon: "ri-file-word-fill", color: "primary" },
  txt: { icon: "ri-file-text-fill", color: "secondary" },
  zip: { icon: "ri-file-zip-fill", color: "secondary" },
};

const getFileIcon = (ext) =>
  FILE_ICONS[ext?.toLowerCase()] || {
    icon: "ri-file-fill",
    color: "secondary",
  };

let _nextId = 200;
const nextId = () => _nextId++;

const todayStr = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Right-click Context Menu ─────────────────────────────────────────────────

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
        { icon: "ri-download-line", label: "Download", action: "download" },
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

// ─── Move Modal ───────────────────────────────────────────────────────────────

/**
 * Renders a tree of folders the user can pick as the move destination.
 * Excludes the item being moved (if it's a folder) and its subtree.
 */
const FolderTree = ({
  folders,
  excludeId,
  selectedId,
  onSelect,
  depth = 0,
}) => (
  <>
    {folders
      .filter((f) => f.type === "folder" && f.id !== excludeId)
      .map((f) => (
        <React.Fragment key={f.id}>
          <div
            className={`d-flex align-items-center gap-2 py-1 px-2 rounded cursor-pointer ${
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
              excludeId={excludeId}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </React.Fragment>
      ))}
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Folders = () => {
  const [allFolders, setAllFolders] = useState([
    {
      id: 1,
      name: "Project Files",
      type: "folder",
      createdBy: "You",
      createdAt: "22 May 2026",
      children: [],
    },
    {
      id: 2,
      name: "Images",
      type: "folder",
      createdBy: "You",
      createdAt: "20 May 2026",
      children: [],
    },
    {
      id: 3,
      name: "Documents",
      type: "folder",
      createdBy: "You",
      createdAt: "18 May 2026",
      children: [],
    },
    {
      id: 4,
      name: "Videos",
      type: "folder",
      createdBy: "You",
      createdAt: "15 May 2026",
      children: [],
    },
  ]);

  const [rootFiles, setRootFiles] = useState([
    {
      id: 101,
      name: "Website Design",
      ext: "png",
      type: "file",
      size: "2.4 MB",
      createdAt: "22 May 2026",
    },
    {
      id: 102,
      name: "Company Report",
      ext: "pdf",
      type: "file",
      size: "1.1 MB",
      createdAt: "20 May 2026",
    },
    {
      id: 103,
      name: "Presentation",
      ext: "pptx",
      type: "file",
      size: "4.2 MB",
      createdAt: "18 May 2026",
    },
    {
      id: 104,
      name: "Music Track",
      ext: "mp3",
      type: "file",
      size: "6.5 MB",
      createdAt: "15 May 2026",
    },
  ]);

  const [pathStack, setPathStack] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState("All");

  // Modals
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFileModal, setNewFileModal] = useState(false);
  const [renameModal, setRenameModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [moveModal, setMoveModal] = useState(null); // item being moved
  const [moveTarget, setMoveTarget] = useState(null); // destination folder id (null = root)

  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileExt, setNewFileExt] = useState("png");
  const [renameName, setRenameName] = useState("");

  const [ctxMenu, setCtxMenu] = useState(null);

  // ── Deep tree helpers ─────────────────────────────────────────────────────

  const getFolderByPath = (folders, path) => {
    if (!path.length) return null;
    let cur = folders.find((f) => f.id === path[0]);
    for (let i = 1; i < path.length; i++) {
      if (!cur) return null;
      cur = (cur.children || []).find((f) => f.id === path[i]);
    }
    return cur;
  };

  const updateDeep = (folders, path, updater) => {
    if (!path.length) return updater(folders);
    return folders.map((f) =>
      f.id === path[0]
        ? {
            ...f,
            children: updateDeep(f.children || [], path.slice(1), updater),
          }
        : f,
    );
  };

  /** Remove an item (by id) anywhere in the tree */
  const removeDeep = (folders, id) =>
    folders
      .filter((f) => f.id !== id)
      .map((f) => ({ ...f, children: removeDeep(f.children || [], id) }));

  /** Insert an item into the folder with folderId (null = root) */
  const insertDeep = (folders, folderId, item) => {
    if (folderId === null) return [...folders, item];
    return folders.map((f) => {
      if (f.id === folderId)
        return { ...f, children: [...(f.children || []), item] };
      return { ...f, children: insertDeep(f.children || [], folderId, item) };
    });
  };

  const deleteDeep = (folders, path, id) => {
    if (!path.length) return folders.filter((f) => f.id !== id);
    return folders.map((f) =>
      f.id === path[0]
        ? { ...f, children: deleteDeep(f.children || [], path.slice(1), id) }
        : f,
    );
  };

  const renameDeep = (folders, path, id, name) => {
    if (!path.length)
      return folders.map((f) => (f.id === id ? { ...f, name } : f));
    return folders.map((f) =>
      f.id === path[0]
        ? {
            ...f,
            children: renameDeep(f.children || [], path.slice(1), id, name),
          }
        : f,
    );
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

  // ── Current view items ────────────────────────────────────────────────────

  const currentItems = () => {
    let items;
    if (!pathStack.length) {
      items = [...allFolders, ...rootFiles];
    } else {
      const folder = getFolderByPath(allFolders, pathStack);
      items = folder ? folder.children || [] : [];
    }

    if (filterType !== "All") {
      items = items.filter((i) => {
        if (filterType === "Folders") return i.type === "folder";
        const map = {
          Video: ["mp4", "avi"],
          Images: ["png", "jpg", "jpeg"],
          Music: ["mp3"],
          Documents: ["pdf", "doc", "docx", "ppt", "pptx", "txt"],
        };
        return map[filterType]?.includes(i.ext?.toLowerCase());
      });
    }

    if (searchQuery) {
      items = items.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return items;
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const item = {
      id: nextId(),
      name: newFolderName.trim(),
      type: "folder",
      createdBy: "You",
      createdAt: todayStr(),
      children: [],
    };
    if (!pathStack.length) {
      setAllFolders((p) => [...p, item]);
    } else {
      setAllFolders((p) => updateDeep(p, pathStack, (ch) => [...ch, item]));
    }
    setNewFolderName("");
    setNewFolderModal(false);
  };

  const createFile = () => {
    if (!newFileName.trim()) return;
    const item = {
      id: nextId(),
      name: newFileName.trim(),
      ext: newFileExt,
      type: "file",
      size: "0 KB",
      createdAt: todayStr(),
    };
    if (!pathStack.length) {
      setRootFiles((p) => [...p, item]);
    } else {
      setAllFolders((p) => updateDeep(p, pathStack, (ch) => [...ch, item]));
    }
    setNewFileName("");
    setNewFileExt("png");
    setNewFileModal(false);
  };

  const deleteItem = (item) => {
    if (!pathStack.length) {
      if (item.type === "folder")
        setAllFolders((p) => p.filter((f) => f.id !== item.id));
      else setRootFiles((p) => p.filter((f) => f.id !== item.id));
    } else {
      if (item.type === "folder") {
        setAllFolders((p) => deleteDeep(p, pathStack, item.id));
      } else {
        setAllFolders((p) => deleteDeep(p, pathStack, item.id));
        // also try rootFiles just in case
        setRootFiles((p) => p.filter((f) => f.id !== item.id));
      }
    }
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  const doRename = () => {
    if (!renameName.trim() || !renameModal) return;
    const { id, type } = renameModal;
    if (!pathStack.length) {
      if (type === "folder")
        setAllFolders((p) =>
          p.map((f) => (f.id === id ? { ...f, name: renameName } : f)),
        );
      else
        setRootFiles((p) =>
          p.map((f) => (f.id === id ? { ...f, name: renameName } : f)),
        );
    } else {
      setAllFolders((p) => renameDeep(p, pathStack, id, renameName));
    }
    setRenameModal(null);
    setRenameName("");
  };

  // ── Move ──────────────────────────────────────────────────────────────────

  /**
   * Strategy:
   *  1. Remove the item from wherever it currently lives (folders tree OR rootFiles).
   *  2. Insert it at the chosen destination.
   */
  const doMove = () => {
    if (!moveModal) return;
    const item = moveModal;

    if (item.type === "folder") {
      // Remove from folders tree
      setAllFolders((prev) => {
        const withoutItem = removeDeep(prev, item.id);
        if (moveTarget === null) {
          // Move to root – just add back at root level
          return [...withoutItem, item];
        }
        return insertDeep(withoutItem, moveTarget, item);
      });
    } else {
      // It's a file
      // Remove from root or from inside a folder
      let itemCopy = item;
      setRootFiles((prev) => prev.filter((f) => f.id !== item.id));
      setAllFolders((prev) => {
        const withoutItem = removeDeep(prev, item.id);
        if (moveTarget === null) {
          // Moving to root – handled via rootFiles, don't touch allFolders
          setRootFiles((rf) =>
            rf.find((f) => f.id === item.id) ? rf : [...rf, itemCopy],
          );
          return withoutItem;
        }
        return insertDeep(withoutItem, moveTarget, itemCopy);
      });
    }

    setMoveModal(null);
    setMoveTarget(null);
    setSelectedItem(null);
  };

  // ── Context menu actions ──────────────────────────────────────────────────

  const handleContextAction = (action, item) => {
    if (action === "explore" && item.type === "folder") {
      setPathStack((p) => [...p, item.id]);
      setSelectedItem(null);
    } else if (action === "favorite") {
      setFavorites((p) =>
        p.find((f) => f.id === item.id)
          ? p.filter((f) => f.id !== item.id)
          : [...p, item],
      );
    } else if (action === "rename") {
      setRenameName(item.name);
      setRenameModal(item);
    } else if (action === "move") {
      setMoveTarget(null);
      setMoveModal(item);
    } else if (action === "delete") {
      deleteItem(item);
    } else if (action === "info") {
      setInfoModal(item);
    }
  };

  const onRightClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, item });
  };

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const items = currentItems();

  return (
    <React.Fragment>
      <div className="file-manager-content w-100 p-3 py-0">
        <div className="mx-n3 pt-4 px-4 file-manager-content-scroll overflow-x-hidden overflow-y-auto">
          {/* ── Toolbar ── */}
          <Row className="justify-content-between g-2 mb-3">
            <Col>
              <div className="d-flex align-items-center gap-2">
                <div className="flex-shrink-0 d-block d-lg-none">
                  <button
                    type="button"
                    className="btn btn-soft-success btn-icon btn-sm fs-16"
                  >
                    <i className="ri-menu-2-fill align-bottom"></i>
                  </button>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span
                    className="text-muted cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setPathStack([]);
                      setSelectedItem(null);
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
                  type="select"
                  className="form-select"
                  style={{ width: "auto" }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option>All</option>
                  <option>Folders</option>
                  <option>Video</option>
                  <option>Images</option>
                  <option>Music</option>
                  <option>Documents</option>
                </Input>
                <button
                  className="btn btn-soft-success text-nowrap flex-shrink-0"
                  onClick={() => setNewFolderModal(true)}
                >
                  <i className="ri-folder-add-line align-bottom me-1"></i> New
                  Folder
                </button>
                <button
                  className="btn btn-success text-nowrap flex-shrink-0"
                  onClick={() => setNewFileModal(true)}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Files
                </button>
              </div>
            </Col>
          </Row>

          {/* ── Empty state ── */}
          {items.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="ri-folder-open-line display-4 d-block mb-2"></i>
              {searchQuery ? "No results found." : "This folder is empty."}
            </div>
          )}

          {/* ── Folder Cards ── */}
          {items.some((i) => i.type === "folder") && (
            <div className="mb-4">
              <h6 className="text-muted text-uppercase fs-11 mb-3">Folders</h6>
              <Row className="g-3">
                {items
                  .filter((i) => i.type === "folder")
                  .map((item) => {
                    const isFav = favorites.find((f) => f.id === item.id);
                    return (
                      <Col xxl={3} md={4} sm={6} key={item.id}>
                        <Card
                          className={`bg-light shadow-none h-100 mb-0${selectedItem?.id === item.id ? " border border-success" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedItem(item)}
                          onDoubleClick={() => {
                            setPathStack((p) => [...p, item.id]);
                            setSelectedItem(null);
                          }}
                          onContextMenu={(e) => onRightClick(e, item)}
                        >
                          <CardBody>
                            <div className="d-flex justify-content-between mb-1">
                              <div className="ms-auto">
                                <UncontrolledDropdown
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DropdownToggle
                                    tag="button"
                                    className="btn btn-ghost-primary btn-icon btn-sm"
                                  >
                                    <i className="ri-more-2-fill fs-16 align-bottom" />
                                  </DropdownToggle>

                                  <DropdownMenu end>
                                    <DropdownItem
                                      onClick={() => {
                                        setPathStack((p) => [...p, item.id]);
                                        setSelectedItem(null);
                                      }}
                                    >
                                      <i className="ri-compass-3-line me-2"></i>
                                      Explore
                                    </DropdownItem>

                                    <DropdownItem
                                      onClick={() =>
                                        setFavorites((p) =>
                                          p.find((f) => f.id === item.id)
                                            ? p.filter((f) => f.id !== item.id)
                                            : [...p, item],
                                        )
                                      }
                                    >
                                      <i
                                        className={`${
                                          isFav
                                            ? "ri-star-fill text-warning"
                                            : "ri-star-line"
                                        } me-2`}
                                      ></i>
                                      {isFav
                                        ? "Unfavorite"
                                        : "Add to Favorites"}
                                    </DropdownItem>

                                    <DropdownItem
                                      onClick={() => {
                                        setRenameName(item.name);
                                        setRenameModal(item);
                                      }}
                                    >
                                      <i className="ri-pencil-line me-2"></i>
                                      Rename
                                    </DropdownItem>

                                    <DropdownItem
                                      onClick={() => {
                                        setMoveTarget(null);
                                        setMoveModal(item);
                                      }}
                                    >
                                      <i className="ri-arrow-right-line me-2"></i>
                                      Move
                                    </DropdownItem>

                                    <DropdownItem divider />

                                    <DropdownItem
                                      className="text-danger"
                                      onClick={() => deleteItem(item)}
                                    >
                                      <i className="ri-delete-bin-line me-2"></i>
                                      Delete
                                    </DropdownItem>

                                    <DropdownItem
                                      onClick={() => setInfoModal(item)}
                                    >
                                      <i className="ri-information-line me-2"></i>
                                      Info
                                    </DropdownItem>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </div>
                              {isFav && (
                                <i className="ri-star-fill text-warning fs-14 mt-1"></i>
                              )}
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

          {/* ── File List ── */}
          {items.some((i) => i.type === "file") && (
            <div className="mb-4">
              <h6 className="text-muted text-uppercase fs-11 mb-3">Files</h6>
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Date</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((i) => i.type === "file")
                      .map((item) => {
                        const { icon, color } = getFileIcon(item.ext);
                        const isFav = favorites.find((f) => f.id === item.id);
                        return (
                          <tr
                            key={item.id}
                            className={
                              selectedItem?.id === item.id
                                ? "table-success"
                                : ""
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedItem(item)}
                            onContextMenu={(e) => onRightClick(e, item)}
                          >
                            <td>
                              <div
                                className={`avatar-xs d-flex align-items-center justify-content-center rounded bg-${color}-subtle`}
                              >
                                <i
                                  className={`${icon} text-${color} fs-18`}
                                ></i>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-medium">{item.name}</span>
                                {isFav && (
                                  <i className="ri-star-fill text-warning fs-12"></i>
                                )}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${color}-subtle text-${color}`}
                              >
                                {item.ext?.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted">{item.size}</span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {item.createdAt}
                              </span>
                            </td>
                            <td>
                              <UncontrolledDropdown
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownToggle
                                  tag="button"
                                  className="btn btn-ghost-secondary btn-icon btn-sm"
                                >
                                  <i className="ri-more-2-fill fs-16 align-bottom" />
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end">
                                  <DropdownItem>
                                    <i className="ri-download-line me-2"></i>
                                    Download
                                  </DropdownItem>
                                  <DropdownItem
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
                                    onClick={() => {
                                      setRenameName(item.name);
                                      setRenameModal(item);
                                    }}
                                  >
                                    <i className="ri-pencil-line me-2"></i>
                                    Rename
                                  </DropdownItem>
                                  <DropdownItem
                                    onClick={() => {
                                      setMoveTarget(null);
                                      setMoveModal(item);
                                    }}
                                  >
                                    <i className="ri-arrow-right-line me-2"></i>
                                    Move
                                  </DropdownItem>
                                  <DropdownItem divider />
                                  <DropdownItem
                                    className="text-danger"
                                    onClick={() => deleteItem(item)}
                                  >
                                    <i className="ri-delete-bin-line me-2"></i>
                                    Delete
                                  </DropdownItem>
                                  <DropdownItem
                                    onClick={() => setInfoModal(item)}
                                  >
                                    <i className="ri-information-line me-2"></i>
                                    Info
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right-click Context Menu ── */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          item={ctxMenu.item}
          onClose={() => setCtxMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {/* ── New Folder Modal ── */}
      <Modal
        isOpen={newFolderModal}
        toggle={() => setNewFolderModal(false)}
        centered
      >
        <ModalHeader toggle={() => setNewFolderModal(false)}>
          New Folder
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Folder Name</Label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              placeholder="Enter folder name"
              autoFocus
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setNewFolderModal(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={createFolder}>
            <i className="ri-folder-add-line me-1"></i> Create
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Add File Modal ── */}
      <Modal
        isOpen={newFileModal}
        toggle={() => setNewFileModal(false)}
        centered
        className="zoomIn"
      >
        <ModalHeader
          toggle={() => setNewFileModal(false)}
          className="p-3 bg-success-subtle"
        >
          Add File
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createFile();
            }}
          >
            <div className="mb-3">
              <Label className="form-label">File Name</Label>
              <Input
                type="text"
                placeholder="Enter file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <Label className="form-label">
                Upload File <span className="text-muted fs-12">(optional)</span>
              </Label>
              <Dropzone
                onDrop={(acceptedFiles) => {
                  if (acceptedFiles.length > 0) {
                    const file = acceptedFiles[0];
                    setNewFileName(file.name.replace(/\.[^/.]+$/, ""));
                    setNewFileExt(file.name.split(".").pop().toLowerCase());
                  }
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div className="dropzone dz-clickable border rounded p-4 text-center">
                    <div className="dz-message needsclick" {...getRootProps()}>
                      <input {...getInputProps()} />
                      <div className="mb-2">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                      {newFileName && (
                        <p className="mt-2 text-success mb-0">
                          <i className="ri-check-line me-1"></i>
                          Selected: {newFileName}.{newFileExt}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Dropzone>
            </div>

            <div className="hstack gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-ghost-success"
                onClick={() => setNewFileModal(false)}
              >
                <i className="ri-close-line align-bottom me-1"></i>Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="ri-add-line align-bottom me-1"></i>Add File
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* ── Rename Modal ── */}
      <Modal
        isOpen={!!renameModal}
        toggle={() => setRenameModal(null)}
        centered
      >
        <ModalHeader toggle={() => setRenameModal(null)}>
          Rename {renameModal?.type === "folder" ? "Folder" : "File"}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>New Name</Label>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doRename()}
              autoFocus
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setRenameModal(null)}>
            Cancel
          </Button>
          <Button color="success" onClick={doRename}>
            <i className="ri-pencil-line me-1"></i> Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Move Modal ── */}
      <Modal isOpen={!!moveModal} toggle={() => setMoveModal(null)} centered>
        <ModalHeader toggle={() => setMoveModal(null)}>
          <i className="ri-arrow-right-line me-2 text-success"></i>
          Move "{moveModal?.name}"
        </ModalHeader>
        <ModalBody>
          <p className="text-muted fs-13 mb-3">
            Select a destination folder. Choose <strong>Root</strong> to move to
            the top level.
          </p>

          {/* Root option */}
          <div
            className={`d-flex align-items-center gap-2 py-2 px-2 rounded mb-1 ${
              moveTarget === null
                ? "bg-success bg-opacity-10 text-success fw-medium"
                : "text-body"
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setMoveTarget(null)}
          >
            <i className="ri-home-4-line fs-15 text-success" />
            <span style={{ fontSize: 14 }}>Root (Home)</span>
            {moveTarget === null && (
              <i className="ri-check-line ms-auto text-success" />
            )}
          </div>

          {/* Folder tree */}
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
                excludeId={moveModal?.type === "folder" ? moveModal?.id : null}
                selectedId={moveTarget}
                onSelect={setMoveTarget}
              />
            )}
          </div>

          {moveTarget !== null && (
            <div className="alert alert-success mt-3 py-2 mb-0 d-flex align-items-center gap-2">
              <i className="ri-folder-2-fill text-success"></i>
              <span className="fs-13">
                Moving to: <strong>{getBreadcrumbName(moveTarget)}</strong>
              </span>
            </div>
          )}
          {moveTarget === null && (
            <div className="alert alert-info mt-3 py-2 mb-0 d-flex align-items-center gap-2">
              <i className="ri-home-4-line text-info"></i>
              <span className="fs-13">
                Moving to: <strong>Root</strong>
              </span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="light"
            onClick={() => {
              setMoveModal(null);
              setMoveTarget(null);
            }}
          >
            Cancel
          </Button>
          <Button color="success" onClick={doMove}>
            <i className="ri-arrow-right-line me-1"></i> Move Here
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Info Modal ── */}
      <Modal isOpen={!!infoModal} toggle={() => setInfoModal(null)} centered>
        <ModalHeader toggle={() => setInfoModal(null)}>
          <i className="ri-information-line me-2 text-success"></i>
          {infoModal?.type === "folder" ? "Folder" : "File"} Info
        </ModalHeader>
        <ModalBody>
          {infoModal && (
            <div className="table-responsive">
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
                  {infoModal.createdBy && (
                    <tr>
                      <th className="text-muted fw-normal">Created by</th>
                      <td className="text-success">{infoModal.createdBy}</td>
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
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setInfoModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Folders;
