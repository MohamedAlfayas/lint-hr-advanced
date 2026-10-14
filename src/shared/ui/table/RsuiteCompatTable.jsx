import React from "react";
import { Box } from "@mui/material";
import AppTable, { TABLE_ALIGN, TABLE_HEADER_ALIGN } from "./AppTable";
import { nodeToText } from "./fromLegacyColumns";

/**
 * Drop-in replacement for rsuite's `Table` (Table / Column / ColumnGroup /
 * HeaderCell / Cell) that renders with the MUI `AppTable`.
 *
 * Screens keep their JSX column declarations and custom cell components;
 * only `import { Table } from "rsuite"` changes to this module. Custom cells
 * receive the same `rowData`, `rowIndex` and `dataKey` props as with rsuite.
 */

// Row striping / spacing now come from the MUI table, so per-cell
// backgrounds, paddings and heights set for rsuite are dropped.
const LAYOUT_STYLE_KEYS = ["background", "backgroundColor", "padding", "height", "lineHeight"];

const Cell = ({
  rowData,
  rowIndex,
  dataKey,
  children,
  style,
  className,
  // rsuite-only props that must not reach the DOM
  fullText,
  wordWrap,
  ...rest
}) => {
  const content =
    typeof children === "function"
      ? children(rowData, rowIndex)
      : children !== undefined
        ? children
        : rowData?.[dataKey];

  const cleanStyle = { ...style };
  LAYOUT_STYLE_KEYS.forEach((k) => delete cleanStyle[k]);

  return (
    <Box className={className} style={cleanStyle} sx={{ minWidth: 0, width: "100%" }}>
      {content ?? ""}
    </Box>
  );
};

const HeaderCell = ({ children }) => <>{children}</>;
const Column = () => null;
const ColumnGroup = () => null;

const flatten = (children) =>
  React.Children.toArray(children).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flatten(child.props.children)
      : [child],
  );

const parseColumn = (el, id, pinning) => {
  const { width, minWidth, flexGrow, fixed, align, defaultHidden, enableHiding } = el.props;
  const [headerEl, cellEl] = flatten(el.props.children).filter(React.isValidElement);
  const headerNode = headerEl?.props?.children;
  const dataKey = cellEl?.props?.dataKey;
  const isPlainDataCell = cellEl?.type === Cell && !cellEl.props.children;

  if (fixed === "right") pinning.right.push(id);
  else if (fixed) pinning.left.push(id);

  return {
    id,
    header: nodeToText(headerNode).trim() || id,
    Header: () => headerNode,
    size: width || minWidth || 150,
    ...(minWidth && { minSize: Math.min(minWidth, width || minWidth) }),
    grow: !!flexGrow && !width,
    // Custom cells stay data columns (not "display"): MRT makes display
    // columns non-hideable and greys them out in the Show/Hide menu.
    ...(isPlainDataCell && dataKey
      ? { accessorKey: dataKey, enableSorting: true }
      : {
          accessorFn: (row) => (dataKey ? row?.[dataKey] : undefined),
          enableSorting: false,
          enableExport: false,
          enableGlobalFilter: false,
        }),
    enableColumnFilter: false,
    ...(defaultHidden && { visibleByDefault: false }),
    ...(enableHiding === false && { enableHiding: false }),
    muiTableHeadCellProps: { align: align || TABLE_HEADER_ALIGN },
    muiTableBodyCellProps: { align: align || TABLE_ALIGN },
    Cell: ({ row }) =>
      cellEl
        ? React.cloneElement(cellEl, {
            rowData: row.original,
            rowIndex: row.index,
            index: row.index,
          })
        : null,
  };
};

const parseColumns = (children, pinning, prefix = "c", usedIds = new Set()) =>
  flatten(children)
    .filter(React.isValidElement)
    .map((el, i) => {
      // Prefer the React key, then the header text, so ids stay stable when
      // conditional columns appear (saved column visibility relies on them).
      const headerText = nodeToText(
        el.type === ColumnGroup
          ? el.props.header
          : flatten(el.props.children).find(React.isValidElement)?.props?.children,
      )
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");
      const suffix =
        el.key != null ? String(el.key).replace(/^\.\$?/, "") : headerText || String(i);
      let id = `${prefix}_${suffix}`;
      if (usedIds.has(id)) id = `${id}_${i}`;
      usedIds.add(id);
      if (el.type === ColumnGroup) {
        return {
          id,
          header: nodeToText(el.props.header).trim() || id,
          Header: () => el.props.header,
          muiTableHeadCellProps: { align: "center" },
          columns: parseColumns(el.props.children, pinning, id, usedIds),
        };
      }
      if (el.type === Column) return parseColumn(el, id, pinning);
      return null;
    })
    .filter(Boolean);

/**
 * `variant="app"` renders with the standard AppTable look (comfortable rows,
 * tinted header, hover, no striping). Column choice and paging stay with the
 * screen, so built-in hiding / pagination are off unless `pageSize` is set.
 */
const Table = ({
  data,
  loading,
  height,
  autoHeight,
  children,
  variant = "compact",
  pageSize,
  toolbarActions,
  columnMenu = false,
  storageKey,
  onRefresh,
}) => {
  const pinning = { left: [], right: [] };
  const columns = parseColumns(children, pinning);

  if (variant === "app") {
    return (
      <AppTable
        columns={columns}
        data={data || []}
        isLoading={!!loading}
        toolbarActions={toolbarActions}
        onRefresh={onRefresh}
        defaultVisibleColumns={Infinity}
        storageKey={storageKey}
        enableHiding={columnMenu}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableColumnOrdering={false}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableTopToolbar={columnMenu || !!toolbarActions || !!onRefresh}
        enablePagination={!!pageSize}
        enableBottomToolbar={!!pageSize}
        initialState={pageSize ? { pagination: { pageIndex: 0, pageSize } } : undefined}
        state={{ columnPinning: pinning }}
        muiTableContainerProps={{
          sx: {
            maxHeight: autoHeight ? "none" : height || "65vh",
            maxWidth: "100%",
            overflowX: "auto",
          },
        }}
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            width: "100%",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
          },
        }}
      />
    );
  }

  return (
    <AppTable
      columns={columns}
      data={data || []}
      isLoading={!!loading}
      layoutMode="grid"
      enableTopToolbar={false}
      enableBottomToolbar={false}
      enablePagination={false}
      enableColumnFilters={false}
      enableColumnOrdering={false}
      enableColumnActions={false}
      enableRowSelection={false}
      enableColumnResizing={false}
      initialState={{ density: "compact" }}
      state={{ columnPinning: pinning }}
      muiTableContainerProps={{
        sx: { maxHeight: autoHeight ? "none" : height || "65vh" },
      }}
      muiTablePaperProps={{
        elevation: 0,
        sx: { border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden", mb: 3 },
      }}
      muiTableBodyRowProps={({ row }) => ({
        hover: true,
        sx: (t) => ({
          bgcolor: row.index % 2 ? t.palette.action.hover : "transparent",
        }),
      })}
    />
  );
};

Table.Column = Column;
Table.ColumnGroup = ColumnGroup;
Table.HeaderCell = HeaderCell;
Table.Cell = Cell;

export { Table, Column, ColumnGroup, HeaderCell, Cell };
export default Table;
