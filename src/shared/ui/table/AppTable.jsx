import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, ThemeProvider } from "@mui/material/styles";
import { floatingLabelTheme } from "../../theme/theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { TruncatedCell } from "./cells";
import { TestIdModule, rowBusinessId, testId, useTestIdModule } from "../../testing/testId";

const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_VISIBLE_COLUMNS = 6;
const ALWAYS_VISIBLE_HEADER = /status|action/i;
const STORAGE_PREFIX = "lint_hr_table_columns_";
/** App-wide alignment ("left" | "center" | "right") for headers and cells. */
export const TABLE_HEADER_ALIGN = "left";
export const TABLE_ALIGN = "left";

const columnIdOf = (col) => col.id ?? col.accessorKey;

const leafColumns = (columns = []) =>
  columns.flatMap((col) => (col.columns?.length ? leafColumns(col.columns) : [col]));

/**
 * Hides everything after the first `limit` data columns. Display columns
 * (checkbox / actions), status / action columns and `visibleByDefault: true`
 * stay visible; `visibleByDefault: false` is always hidden by default.
 */
const buildDefaultVisibility = (columns, limit) => {
  const visibility = {};
  let shown = 0;
  leafColumns(columns).forEach((col) => {
    const id = columnIdOf(col);
    if (!id) return;
    if (col.visibleByDefault === false) {
      visibility[id] = false;
      return;
    }
    if (
      col.visibleByDefault === true ||
      col.columnDefType === "display" ||
      ALWAYS_VISIBLE_HEADER.test(typeof col.header === "string" ? col.header : "")
    ) {
      return;
    }
    shown += 1;
    if (shown > limit) visibility[id] = false;
  });
  return visibility;
};

// Text longer than this collapses to one line with an ellipsis + hover tooltip.
const TRUNCATE_AFTER_CHARS = 30;
const TRUNCATE_MIN_WIDTH = 120;

/**
 * Wraps each data column's Cell so long text values are shortened with "…"
 * and shown in full on hover. Only string values are affected, so chips,
 * buttons and avatar cells render untouched. Opt out per column with
 * `truncate: false`.
 */
// Category columns (department, status, type…) have their own dropdown
// filter; matching them in the search box makes "d" return "Digital …" rows.
const CATEGORY_FILTER_VARIANTS = ["select", "multi-select"];

/** Strip per-column filter UI and keep search lean for every table. */
const withPerformanceDefaults = (columns = []) =>
  columns.map((rawCol) => {
    if (rawCol.columns?.length) {
      return { ...rawCol, columns: withPerformanceDefaults(rawCol.columns) };
    }
    const { filterVariant, filterSelectOptions, ...rest } = rawCol;
    const col = {
      ...rest,
      enableColumnFilter: false,
    };
    if (
      rest.enableGlobalFilter === undefined &&
      CATEGORY_FILTER_VARIANTS.includes(filterVariant)
    ) {
      col.enableGlobalFilter = false;
    }
    if (col.columnDefType === "display" || col.truncate === false) return col;
    const RenderCell = col.Cell;
    return {
      ...col,
      Cell: (props) => {
        const content = RenderCell ? RenderCell(props) : props.renderedCellValue;
        const value = props.cell.getValue();
        const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
        if (text.length <= TRUNCATE_AFTER_CHARS) return content;
        return (
          <TruncatedCell
            text={text}
            minWidth={Math.max(props.column.getSize() - 32, TRUNCATE_MIN_WIDTH)}
          >
            {content}
          </TruncatedCell>
        );
      },
    };
  });

const readStoredVisibility = (key) => {
  if (!key) return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key)) || null;
  } catch {
    return null;
  }
};

const EmptyState = ({ message }) => (
  <Stack alignItems="center" spacing={1} sx={{ py: 6, color: "text.secondary" }}>
    <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
    <Typography variant="body2">{message}</Typography>
  </Stack>
);

/**
 * App-wide data table (Material React Table).
 *
 * Fast defaults: global search + sorting + pagination. Per-column filters,
 * faceted values, column drag/reorder/resize, density and fullscreen are off
 * (pass any MRT option to re-enable). Row checkboxes stay off unless
 * `enableRowSelection` is passed.
 *
 * Extra props:
 * - `isLoading` / `isFetching`: skeleton on first load, progress bar on refetch
 * - `onRefresh`: shows a refresh button
 * - `exportFileName`: accepted for compatibility; export is disabled app-wide
 * - `toolbarActions`: node rendered on the left of the top toolbar
 * - `toolbarEndActions`: node rendered at the right end, after the toolbar icons
 * - `emptyMessage`
 * - `serverPagination`: `{ pageIndex, pageSize, rowCount, onChange }` for
 *   server-side paging
 * - `defaultVisibleColumns`: how many data columns show before the rest are
 *   hidden (still selectable from the Show/Hide columns menu)
 * - `storageKey`: remembers the user's column choice per table
 * - `testIdModule`: data-testid prefix (`<module>-table`, `<module>-search-input`,
 *   `<module>-row-<business id>`); defaults to the surrounding `TestIdModule`
 * - `getRowTestId(record)`: business id for a row's data-testid; defaults to
 *   emp_id / code / uuid / id
 */
const AppTable = ({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  onRefresh,
  exportFileName: _exportFileName,
  toolbarActions,
  toolbarEndActions,
  emptyMessage = "No records found",
  serverPagination,
  initialState,
  state,
  defaultVisibleColumns = DEFAULT_VISIBLE_COLUMNS,
  storageKey,
  testIdModule,
  getRowTestId = rowBusinessId,
  muiTableBodyRowProps: callerRowProps,
  ...options
}) => {
  const inheritedModule = useTestIdModule();
  const moduleName = testIdModule || inheritedModule;
  const columnIdsKey = useMemo(
    () => leafColumns(columns).map(columnIdOf).join("|"),
    [columns],
  );
  const defaultVisibility = useMemo(
    () => ({
      ...buildDefaultVisibility(columns, defaultVisibleColumns),
      ...initialState?.columnVisibility,
    }),
    // Only recompute when the set of columns changes, not on every render.
    [columnIdsKey, defaultVisibleColumns],
  );
  const resolveVisibility = () => {
    const stored = readStoredVisibility(storageKey);
    if (!stored) return defaultVisibility;
    const leaves = leafColumns(columns);
    const dataCols = leaves.filter((col) => {
      const header = typeof col.header === "string" ? col.header : "";
      return (
        col.columnDefType !== "display" &&
        !ALWAYS_VISIBLE_HEADER.test(header)
      );
    });
    // Ignore corrupted storage that would hide every data column (e.g. after an
    // Action-only first paint on Employees revisit).
    const anyDataVisible = dataCols.some((col) => {
      const id = columnIdOf(col);
      return id && stored[id] !== false;
    });
    if (dataCols.length > 0 && !anyDataVisible) {
      return defaultVisibility;
    }
    const visibility = { ...stored };
    leaves.forEach((col) => {
      if (col.enableHiding === false) delete visibility[columnIdOf(col)];
    });
    return visibility;
  };

  const [columnVisibility, setColumnVisibility] = useState(resolveVisibility);

  useEffect(() => {
    setColumnVisibility(resolveVisibility());
  }, [defaultVisibility, storageKey]);

  const handleColumnVisibilityChange = (updater) => {
    setColumnVisibility((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (storageKey) {
        localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(next));
      }
      return next;
    });
  };

  const tableColumns = useMemo(() => withPerformanceDefaults(columns), [columns]);

  const table = useMaterialReactTable({
    columns: tableColumns,
    data: data ?? [],
    enableRowSelection: false,
    enableColumnFilters: false,
    enableFilters: true,
    enableFacetedValues: false,
    enableColumnFilterModes: false,
    enableColumnOrdering: false,
    enableColumnResizing: false,
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableStickyHeader: true,
    columnFilterDisplayMode: "popover",
    positionGlobalFilter: "left",
    // Search matches from the start of a cell value; fuzzy matching returns
    // loose hits and re-sorts rows by rank.
    globalFilterFn: "startsWith",
    enableGlobalFilterRankedResults: false,
    enableFilterMatchHighlighting: false,
    paginationDisplayMode: "pages",
    layoutMode: "semantic",

    // MRT defaults to the grey page background; tables read better on white.
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper,
      draggingBorderColor: theme.palette.primary.main,
      matchHighlightColor: alpha(theme.palette.warning.main, 0.3),
      menuBackgroundColor: theme.palette.background.paper,
      pinnedRowBackgroundColor: alpha(theme.palette.primary.main, 0.06),
      selectedRowBackgroundColor: alpha(theme.palette.primary.main, 0.08),
    }),

    initialState: {
      showGlobalFilter: true,
      showColumnFilters: false,
      density: "comfortable",
      pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
      columnPinning: { right: ["mrt-row-actions"] },
      ...initialState,
    },

    ...(serverPagination && {
      manualPagination: true,
      rowCount: serverPagination.rowCount,
      onPaginationChange: (updater) => {
        const current = {
          pageIndex: serverPagination.pageIndex,
          pageSize: serverPagination.pageSize,
        };
        serverPagination.onChange(
          typeof updater === "function" ? updater(current) : updater,
        );
      },
    }),

    // Callers rebuild `data` on every render, so auto-reset would jump back to
    // page 1 on any unrelated re-render (e.g. opening a modal).
    autoResetPageIndex: false,

    onColumnVisibilityChange: handleColumnVisibilityChange,

    state: {
      columnVisibility,
      isLoading,
      showSkeletons: isLoading,
      showLoadingOverlay: false,
      showProgressBars: isFetching && !isLoading,
      ...(serverPagination && {
        pagination: {
          pageIndex: serverPagination.pageIndex,
          pageSize: serverPagination.pageSize,
        },
      }),
      ...state,
    },

    muiSearchTextFieldProps: {
      placeholder: "Search…",
      size: "small",
      variant: "outlined",
      className: "app-table-search",
      inputProps: { "data-testid": testId(moduleName, "search", "input") },
      // MRT replaces the TextField `sx` with its own, so style the input root.
      InputProps: {
        sx: (theme) => ({
          minWidth: 220,
          borderRadius: "8px",
          bgcolor: "background.paper",
          "&.Mui-focused": { boxShadow: "none" },
          // Labelled toolbar fields draw their top border through the label
          // notch; without a label the outline would sit 5px higher.
          "& .MuiOutlinedInput-notchedOutline": { top: 0 },
          "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.success.main, 0.55),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.success.main,
            borderWidth: 1,
          },
          "& > .MuiSvgIcon-root": { fontSize: 19, color: "text.secondary" },
          "&.Mui-focused > .MuiSvgIcon-root": { color: "success.main" },
          "& .MuiInputBase-input::placeholder": { color: "var(--vz-body-color)", opacity: 0.8 },
        }),
      },
    },
    muiFilterTextFieldProps: {
      size: "small",
      variant: "outlined",
      sx: (theme) => ({
        minWidth: 220,
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          fontSize: 13.5,
          bgcolor: "var(--vz-secondary-bg)",
          "&.Mui-focused": {
            bgcolor: "var(--vz-secondary-bg)",
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--vz-border-color)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1 },
        },
        "& .MuiFormHelperText-root": { mx: 0.5, fontSize: 11.5 },
      }),
    },
    muiPaginationProps: {
      rowsPerPageOptions: PAGE_SIZES,
      shape: "rounded",
      variant: "outlined",
      showRowsPerPage: true,
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        width: "100%",
        maxWidth: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      },
    },
    muiTableContainerProps: { sx: { maxHeight: "65vh", maxWidth: "100%", overflowX: "auto" } },
    muiTableProps: { "data-testid": testId(moduleName, "table") },
    muiTableHeadCellProps: {
      align: TABLE_HEADER_ALIGN,
      sx: (theme) => ({
        // Opaque so rows don't show through the sticky header.
        bgcolor: theme.palette.mode === "dark" ? "#2a2f34" : "#f7f8fb",
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 600,
        fontSize: 12.5,
        textTransform: "uppercase",
        letterSpacing: 0.3,
        color: "text.secondary",
        whiteSpace: "nowrap",
        py: 1.25,
        "& .Mui-TableHeadCell-ResizeHandle-Divider": {
          borderColor: theme.palette.divider,
          opacity: 0,
          transition: "opacity .15s ease",
        },
        "thead:hover & .Mui-TableHeadCell-ResizeHandle-Divider": { opacity: 1 },
        // The last cell's divider sits on the paper's rounded edge and breaks the corner.
        "&:last-of-type .Mui-TableHeadCell-ResizeHandle-Divider": { display: "none" },
      }),
    },
    muiTableBodyCellProps: {
      align: TABLE_ALIGN,
      sx: {
        fontSize: 13,
        py: 1,
        verticalAlign: "middle",
        borderColor: "divider",
        // Custom cells are often flex rows (avatar + name, chips), which
        // text-align alone does not center.
        "&.MuiTableCell-alignCenter > *": { justifyContent: "center", alignItems: "center" },
      },
    },
    muiTableBodyRowProps: (rowArgs) => {
      const businessId = getRowTestId(rowArgs.row.original);
      const rowTestId = businessId !== "" && businessId != null && {
        "data-testid": testId(moduleName, "row", businessId),
      };
      if (callerRowProps) {
        const extra =
          typeof callerRowProps === "function" ? callerRowProps(rowArgs) : callerRowProps;
        return { ...rowTestId, ...extra };
      }
      return {
        hover: true,
        ...rowTestId,
        sx: (theme) => ({
          "&:last-of-type td": { borderBottom: 0 },
          // Pinned cells keep MRT's opaque hover colour so scrolled cells don't show through.
          "&:hover td:not([data-pinned='true'])": {
            bgcolor: alpha(theme.palette.primary.main, 0.035),
          },
        }),
      };
    },
    muiTopToolbarProps: {
      className: "app-table-toolbar",
      sx: {
        px: 2,
        py: 1.5,
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
        background: (theme) =>
          `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)}, transparent)`,
      },
    },

    muiBottomToolbarProps: { className: "app-table-bottombar" },

    renderEmptyRowsFallback: () => <EmptyState message={emptyMessage} />,

    renderBottomToolbarCustomActions: ({ table: t }) => {
      const total = serverPagination
        ? serverPagination.rowCount ?? 0
        : t.getPrePaginationRowModel().rows.length;
      const { pageIndex, pageSize } = t.getState().pagination;
      const paginated = t.options.enablePagination !== false;
      const start = total === 0 ? 0 : paginated ? pageIndex * pageSize + 1 : 1;
      const end = paginated ? Math.min((pageIndex + 1) * pageSize, total) : total;
      return (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 1, alignSelf: "center" }}>
          Showing {start}–{end} of {total} {total === 1 ? "entry" : "entries"}
        </Typography>
      );
    },

    renderTopToolbarCustomActions: () => (
      <Box
        className="app-table-actions"
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}
      >
        <ThemeProvider theme={floatingLabelTheme}>{toolbarActions}</ThemeProvider>
      </Box>
    ),

    ...((onRefresh || toolbarEndActions) && {
      renderToolbarInternalActions: ({ table: t }) => {
        const o = t.options;
        return (
          <>
            {o.enableFilters && o.enableGlobalFilter && !o.initialState?.showGlobalFilter && (
              <MRT_ToggleGlobalFilterButton table={t} />
            )}
            {o.enableFilters && o.enableColumnFilters && o.columnFilterDisplayMode !== "popover" && (
              <MRT_ToggleFiltersButton table={t} />
            )}
            {(o.enableHiding || o.enableColumnOrdering || o.enableColumnPinning) && (
              <MRT_ShowHideColumnsButton table={t} />
            )}
            {o.enableDensityToggle && <MRT_ToggleDensePaddingButton table={t} />}
            {o.enableFullScreenToggle && <MRT_ToggleFullScreenButton table={t} />}
            {onRefresh && (
              <Tooltip title="Refresh">
                <span>
                  <IconButton
                    onClick={onRefresh}
                    disabled={isFetching}
                    data-testid={testId(moduleName, "refresh", "button")}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {toolbarEndActions && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: 1 }}>
                {toolbarEndActions}
              </Box>
            )}
          </>
        );
      },
    }),

    ...options,
  });

  const tableState = table.getState();
  const filterKey = JSON.stringify([tableState.globalFilter ?? "", tableState.columnFilters ?? []]);
  const rowCount = table.getFilteredRowModel().rows.length;
  const lastFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    if (serverPagination) return;
    if (lastFilterKeyRef.current !== filterKey) {
      lastFilterKeyRef.current = filterKey;
      table.setPageIndex(0);
      return;
    }
    const { pageIndex, pageSize } = table.getState().pagination;
    const lastPage = Math.max(0, Math.ceil(rowCount / pageSize) - 1);
    if (pageIndex > lastPage) table.setPageIndex(lastPage);
  }, [filterKey, rowCount]);

  return (
    <TestIdModule name={moduleName}>
      <MaterialReactTable table={table} />
    </TestIdModule>
  );
};

export default React.memo(AppTable);
