import React, { useEffect, useMemo, useState } from "react";
import { Dialog, MenuItem, Pagination, Skeleton, TextField, Tooltip } from "@mui/material";
import { toast } from "react-toastify";

import AppTable from "../../../shared/ui/table/AppTable";
import { useConfirm } from "../../../shared/ui/ConfirmDialog";
import { getApiErrorMessage } from "../../../shared/api/axiosBaseQuery";
import { MetaTitle } from "../../../common/data/MetaTitle";
import {
  MAX_BULK_DELETE,
  useDeleteFaceProfilesMutation,
  useGetFaceProfilesQuery,
} from "../api/faceProfilesApi";
import "../faceProfiles.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const PAGE_SIZES = [10, 20, 40, 60, 100];
const SEARCH_DEBOUNCE_MS = 400;

const fullName = (p) => [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
const initials = (p) =>
  `${p.first_name?.[0] || ""}${p.last_name?.[0] || ""}`.toUpperCase() || "?";

/** Image with an icon fallback for null / broken URLs. */
const FaceImage = ({ src, alt, className, fallbackIcon = "ri-user-smile-line" }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (!src || broken) {
    return (
      <span className={`${className} fp-img-fallback`}>
        <i className={fallbackIcon}></i>
      </span>
    );
  }
  return (
    <img src={src} alt={alt} className={className} loading="lazy" onError={() => setBroken(true)} />
  );
};

const Avatar = ({ profile, size = "sm" }) =>
  profile.profile_url ? (
    <FaceImage
      src={profile.profile_url}
      alt=""
      className={`fp-avatar is-${size}`}
      fallbackIcon="ri-user-3-line"
    />
  ) : (
    <span className={`fp-avatar is-${size} fp-avatar-text`}>{initials(profile)}</span>
  );

const StatusChip = ({ active }) => (
  <span className={`fp-status ${active ? "is-active" : "is-inactive"}`}>
    <span className="fp-status-dot" />
    {active ? "Active" : "Inactive"}
  </span>
);

const FaceProfilesPage = () => {
  document.title = `Face Profiles | ${MetaTitle || "Lint HR"}`;

  const [confirm, confirmDialog] = useConfirm();

  const [view, setView] = useState("grid");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // employee_id -> profile, kept across pages so selections survive paging.
  const [selected, setSelected] = useState(() => new Map());
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setPage(1), [search]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetFaceProfilesQuery({
    search,
    page,
    pageSize,
  });
  const [deleteFaceProfiles] = useDeleteFaceProfilesMutation();

  const rows = useMemo(() => data?.data ?? [], [data]);
  const count = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 0;

  // Deleting the last items of the last page leaves us past the end.
  useEffect(() => {
    if (!isFetching && data && rows.length === 0 && page > 1 && totalPages < page) {
      setPage(Math.max(totalPages, 1));
    }
  }, [isFetching, data, rows.length, page, totalPages]);

  const isForbidden = isError && error?.status === 403;
  const rangeStart = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, count);

  // ── Selection ──
  const pageIds = rows.map((r) => r.employee_id);
  const pageSelectedCount = pageIds.filter((id) => selected.has(id)).length;
  const allPageSelected = rows.length > 0 && pageSelectedCount === rows.length;

  const toggleOne = (profile) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(profile.employee_id)) next.delete(profile.employee_id);
      else next.set(profile.employee_id, profile);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (allPageSelected) rows.forEach((r) => next.delete(r.employee_id));
      else rows.forEach((r) => next.set(r.employee_id, r));
      return next;
    });

  const clearSelection = () => setSelected(new Map());

  const rowSelection = useMemo(
    () => Object.fromEntries([...selected.keys()].map((id) => [String(id), true])),
    [selected],
  );

  const handleRowSelectionChange = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    setSelected((prev) => {
      const map = new Map(prev);
      rows.forEach((r) => {
        if (next[String(r.employee_id)]) map.set(r.employee_id, r);
        else map.delete(r.employee_id);
      });
      return map;
    });
  };

  // ── Delete ──
  const runDelete = async (ids) => {
    const deleted = [];
    const notFound = [];
    setDeleting(true);
    try {
      for (let i = 0; i < ids.length; i += MAX_BULK_DELETE) {
        const res = await deleteFaceProfiles(ids.slice(i, i + MAX_BULK_DELETE)).unwrap();
        deleted.push(...(res?.data?.deleted_employee_ids ?? []));
        notFound.push(...(res?.data?.not_found_employee_ids ?? []));
      }
      toast.success(
        deleted.length
          ? `${deleted.length} face profile(s) deleted. Employees were asked to register again.`
          : "No face profiles were deleted.",
      );
      if (notFound.length) {
        toast.info(`${notFound.length} employee(s) had no face profile and were skipped.`);
      }
    } catch (err) {
      const partial = deleted.length ? ` (${deleted.length} deleted before the error)` : "";
      toast.error(`${getApiErrorMessage(err, "Failed to delete face profiles")}${partial}`);
    } finally {
      const done = new Set([...deleted, ...notFound]);
      setSelected((prev) => {
        const next = new Map(prev);
        done.forEach((id) => next.delete(id));
        return next;
      });
      setDeleting(false);
    }
  };

  const confirmDelete = async (profiles) => {
    const single = profiles.length === 1;
    const ok = await confirm({
      title: single ? "Remove face profile?" : `Remove ${profiles.length} face profiles?`,
      message: single
        ? `${fullName(profiles[0])} will need to register their face again before using face check-in. They will get a push notification.`
        : `These employees will need to register their face again before using face check-in. Each of them will get a push notification.`,
      confirmLabel: single ? "Remove" : `Remove ${profiles.length}`,
    });
    if (!ok) return;
    setPreview(null);
    await runDelete(profiles.map((p) => p.employee_id));
  };

  // ── Table view ──
  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Employee",
        size: 240,
        accessorFn: (r) => fullName(r),
        Cell: ({ row }) => (
          <div className="fp-cell-emp">
            <Avatar profile={row.original} />
            <div className="fp-cell-text">
              <span className="fp-cell-name">{fullName(row.original)}</span>
              <span className="fp-cell-sub">{row.original.emp_id || "—"}</span>
            </div>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email", size: 220 },
      {
        id: "face",
        header: "Face image",
        size: 120,
        accessorFn: (r) => r.face_image_url,
        Cell: ({ row }) => (
          <button
            data-testid={testId("face-profiles-row", itemTestKey(row.original), "view-face-image-button")}
            type="button"
            className="fp-thumb-btn"
            onClick={() => setPreview(row.original)}
            title="View face image"
          >
            <FaceImage src={row.original.face_image_url} alt="" className="fp-thumb" />
          </button>
        ),
      },
      {
        id: "status",
        header: "Status",
        size: 110,
        accessorFn: (r) => (r.is_active ? "Active" : "Inactive"),
        Cell: ({ row }) => <StatusChip active={row.original.is_active} />,
      },
    ],
    [],
  );

  const statCards = [
    {
      tone: "primary",
      icon: "ri-scan-2-line",
      label: search ? "Matching profiles" : "Registered faces",
      value: count,
    },
    { tone: "info", icon: "ri-user-3-line", label: "On this page", value: rows.length },
    { tone: "danger", icon: "ri-checkbox-multiple-line", label: "Selected", value: selected.size },
  ];

  const renderGridSkeleton = () => (
    <div className="fp-grid">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="fp-card is-skeleton">
          <Skeleton variant="rounded" height={170} sx={{ borderRadius: "12px" }} />
          <Skeleton width="70%" sx={{ mt: 1.5 }} />
          <Skeleton width="45%" />
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="fp-empty">
      <span className="fp-empty-icon">
        <i className="ri-user-smile-line"></i>
      </span>
      <h6>{search ? "No matching face profiles" : "No face profiles yet"}</h6>
      <p>
        {search
          ? "Try a different name, employee ID, email or phone number."
          : "Employees appear here after they register their face in the mobile app."}
      </p>
    </div>
  );

  const renderGrid = () => (
    <div className="fp-grid">
      {rows.map((p) => {
        const isSel = selected.has(p.employee_id);
        return (
          <article key={p.employee_id} className={`fp-card ${isSel ? "is-selected" : ""}`}>
            <div className="fp-card-media">
              <button
                data-testid={testId("face-profiles-view-face-image", itemTestKey(p), "button")}
                type="button"
                className="fp-media-btn"
                onClick={() => setPreview(p)}
                title="View face image"
              >
                <FaceImage src={p.face_image_url} alt={fullName(p)} className="fp-face" />
                <span className="fp-media-hover" aria-label="View">
                  <span className="fp-media-eye">
                    <i className="ri-eye-line"></i>
                  </span>
                </span>
              </button>

              <label className="fp-check" title={isSel ? "Deselect" : "Select"}>
                <input data-testid={testId("face-profiles-is-sel", itemTestKey(p), "checkbox")} type="checkbox" checked={isSel} onChange={() => toggleOne(p)} />
                <span></span>
              </label>

              <Tooltip title="Remove face profile">
                <button
                  data-testid={testId("face-profiles-delete", itemTestKey(p), "button")}
                  type="button"
                  className="fp-card-del"
                  onClick={() => confirmDelete([p])}
                  disabled={deleting}
                >
                  <i className="ri-delete-bin-6-line"></i>
                </button>
              </Tooltip>

              <span className="fp-card-avatar">
                <Avatar profile={p} size="md" />
              </span>
            </div>

            <div className="fp-card-body">
              <div className="fp-card-name" title={fullName(p)}>
                {fullName(p)}
              </div>
              <div className="fp-card-row">
                <span className="fp-empid">{p.emp_id || "—"}</span>
                <StatusChip active={p.is_active} />
              </div>
              <div className="fp-card-mail" title={p.email || ""}>
                <i className="ri-mail-line"></i>
                {p.email || "No email"}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  return (
    <div className="page-content">
      <div className="container-fluid fp">
        {/* ── Header ── */}
        <div className="fp-hero">
          <div className="fp-hero-title">
            <span className="fp-hero-icon">
              <i className="ri-user-smile-line"></i>
            </span>
            <div>
              <h4>Face Profiles</h4>
              <p>Employees registered for face check-in. Remove a profile to make them register again.</p>
            </div>
          </div>
          <div className="fp-stats">
            {statCards.map((s) => (
              <div key={s.label} className={`fp-stat is-${s.tone}`}>
                <span className="fp-stat-icon">
                  <i className={s.icon}></i>
                </span>
                <div>
                  <div className="fp-stat-value">{s.value}</div>
                  <div className="fp-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isForbidden ? (
          <div className="fp-panel fp-empty">
            <span className="fp-empty-icon is-danger">
              <i className="ri-lock-2-line"></i>
            </span>
            <h6>Admins only</h6>
            <p>You need an admin role to view or manage face profiles.</p>
          </div>
        ) : (
          <section className="fp-panel">
            {/* ── Toolbar ── */}
            <div className="fp-toolbar">
              <div className="fp-search">
                <i className="ri-search-line"></i>
                <input
                  data-testid="face-profiles-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search name, employee ID, email or phone…"
                />
                {searchInput && (
                  <button type="button" onClick={() => setSearchInput("")} title="Clear" data-testid="face-profiles-clear-search-button">
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>

              <div className="fp-toolbar-end">
                {view === "grid" && rows.length > 0 && (
                  <label className="fp-select-page">
                    <input
                      data-testid="face-profiles-all-page-selected-checkbox"
                      type="checkbox"
                      checked={allPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = pageSelectedCount > 0 && !allPageSelected;
                      }}
                      onChange={togglePage}
                    />
                    Select page
                  </label>
                )}

                <div className="fp-views">
                  <button
                    data-testid="face-profiles-grid-button"
                    type="button"
                    className={view === "grid" ? "active" : ""}
                    onClick={() => setView("grid")}
                  >
                    <i className="ri-layout-grid-line"></i> Grid
                  </button>
                  <button
                    data-testid="face-profiles-table-button"
                    type="button"
                    className={view === "table" ? "active" : ""}
                    onClick={() => setView("table")}
                  >
                    <i className="ri-list-check"></i> Table
                  </button>
                </div>

                <Tooltip title="Refresh">
                  <span>
                    <button
                      data-testid="face-profiles-refresh-button"
                      type="button"
                      className={`fp-icon-btn ${isFetching ? "is-spinning" : ""}`}
                      onClick={refetch}
                      disabled={isFetching}
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>

            {/* ── Bulk action bar ── */}
            {selected.size > 0 && (
              <div className="fp-bulk">
                <span className="fp-bulk-count">{selected.size}</span>
                <span className="fp-bulk-text">
                  selected
                  {selected.size > pageSelectedCount && (
                    <em> · {selected.size - pageSelectedCount} on other pages</em>
                  )}
                </span>
                <button type="button" className="fp-bulk-clear" onClick={clearSelection} data-testid="face-profiles-bulk-clear-button">
                  Clear
                </button>
                <button
                  data-testid="face-profiles-remove-selected-button"
                  type="button"
                  className="fp-bulk-del"
                  onClick={() => confirmDelete([...selected.values()])}
                  disabled={deleting}
                >
                  <i className="ri-delete-bin-6-line"></i>
                  {deleting ? "Removing…" : "Remove selected"}
                </button>
              </div>
            )}

            {isError && (
              <div className="fp-error">
                <i className="ri-error-warning-line"></i>
                <span>{getApiErrorMessage(error, "Could not load face profiles")}</span>
                <button data-testid="face-profiles-retry-button" type="button" onClick={refetch}>
                  Retry
                </button>
              </div>
            )}

            {/* ── Content ── */}
            <div className={`fp-content ${isFetching && !isLoading ? "is-fetching" : ""}`}>
              {view === "grid" ? (
                isLoading ? (
                  renderGridSkeleton()
                ) : rows.length === 0 ? (
                  renderEmpty()
                ) : (
                  renderGrid()
                )
              ) : (
                <AppTable
                  columns={columns}
                  data={rows}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  emptyMessage={search ? "No matching face profiles" : "No face profiles yet"}
                  getRowId={(r) => String(r.employee_id)}
                  enableRowSelection
                  onRowSelectionChange={handleRowSelectionChange}
                  state={{ rowSelection }}
                  enablePagination={false}
                  enableBottomToolbar={false}
                  enableTopToolbar={false}
                  enableSorting={false}
                  enableColumnFilters={false}
                  enableGlobalFilter={false}
                  enableColumnDragging={false}
                  muiTablePaperProps={{ elevation: 0, sx: { border: 0, borderRadius: 0 } }}
                  enableRowActions
                  positionActionsColumn="last"
                  displayColumnDefOptions={{ "mrt-row-actions": { header: "Actions", size: 90 } }}
                  renderRowActions={({ row }) => (
                    <div className="fp-row-actions">
                      <Tooltip title="View face image">
                        <button data-testid="face-profiles-view-button" type="button" className="fp-icon-btn is-sm" onClick={() => setPreview(row.original)}>
                          <i className="ri-eye-line"></i>
                        </button>
                      </Tooltip>
                      <Tooltip title="Remove face profile">
                        <button
                          data-testid="face-profiles-delete-button"
                          type="button"
                          className="fp-icon-btn is-sm is-danger"
                          onClick={() => confirmDelete([row.original])}
                          disabled={deleting}
                        >
                          <i className="ri-delete-bin-6-line"></i>
                        </button>
                      </Tooltip>
                    </div>
                  )}
                />
              )}
            </div>

            {/* ── Footer / pagination ── */}
            {count > 0 && (
              <div className="fp-footer">
                <span className="fp-range">
                  Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> of <b>{count}</b>
                </span>
                <div className="fp-footer-end">
                  <TextField
                    select
                    size="small"
                    label="Per page"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    sx={{ width: 110 }}
                  >
                    {PAGE_SIZES.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </TextField>
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={Math.min(page, totalPages)}
                      onChange={(_, p) => setPage(p)}
                      shape="rounded"
                      color="primary"
                      siblingCount={1}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Preview ── */}
      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "fp-preview-paper" }}
      >
        {preview && (
          <div className="fp-preview">
            <div className="fp-preview-head">
              <Avatar profile={preview} size="md" />
              <div className="fp-preview-title">
                <h5>{fullName(preview)}</h5>
                <span>
                  {preview.emp_id || "—"} · {preview.email || "No email"}
                </span>
              </div>
              <button data-testid="face-profiles-close-button" type="button" className="fp-icon-btn" onClick={() => setPreview(null)} title="Close">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="fp-preview-body">
              <figure>
                <FaceImage src={preview.face_image_url} alt="Face profile" className="fp-preview-img" />
                <figcaption>
                  <i className="ri-scan-2-line"></i> Registered face
                </figcaption>
              </figure>
              <figure>
                <FaceImage
                  src={preview.profile_url}
                  alt="Profile"
                  className="fp-preview-img"
                  fallbackIcon="ri-image-line"
                />
                <figcaption>
                  <i className="ri-user-3-line"></i> Profile picture
                </figcaption>
              </figure>
            </div>

            <div className="fp-preview-foot">
              <StatusChip active={preview.is_active} />
              <span className="fp-preview-note">
                <i className="ri-information-line"></i>
                Removing sends the employee a push notification to register again.
              </span>
              <button
                data-testid="face-profiles-remove-button"
                type="button"
                className="fp-bulk-del"
                onClick={() => confirmDelete([preview])}
                disabled={deleting}
              >
                <i className="ri-delete-bin-6-line"></i> Remove
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {confirmDialog}
    </div>
  );
};

export default FaceProfilesPage;
