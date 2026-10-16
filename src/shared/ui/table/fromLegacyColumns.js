import React from "react";

/** Flattens a React node to plain text so JSX cells can be sorted, filtered and exported. */
export const nodeToText = (node) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(" ");
  // Cell components can expose `toText(props)` since their text isn't in `children`.
  if (React.isValidElement(node) && typeof node.type?.toText === "function") {
    return String(node.type.toText(node.props) ?? "");
  }
  if (React.isValidElement(node)) return nodeToText(node.props?.children);
  return "";
};

const toText = (value) =>
  nodeToText(value).replace(/\s+/g, " ").trim();

const legacyCellProps = (row, value) => ({
  row: { original: row.original, index: row.index, id: row.id, values: row.original },
  value,
  cell: { value },
});

/**
 * Converts react-table v7 column definitions (`Header`, `accessor`, `Cell`,
 * `id`) to Material React Table columns, so legacy screens can render with
 * `AppTable` without rewriting their column code.
 *
 * - String accessors map to `accessorKey`.
 * - Function accessors returning JSX render that JSX, while sorting /
 *   filtering / export use its text content.
 * - Columns without an accessor (checkbox, actions) become display columns.
 */
export const fromLegacyColumns = (columns = []) =>
  columns.filter(Boolean).map((col, index) => {
    const { Header, accessor, Cell, id, disableSortBy, width, minWidth, truncate } = col;
    const headerText = typeof Header === "string" ? Header : "";
    const isActionColumn = !accessor && /^action$/i.test(headerText.trim());
    const columnId =
      id ||
      (typeof accessor === "string" ? accessor : isActionColumn ? "action" : `col_${index}`);

    const base = {
      id: columnId,
      header: headerText || (columnId.startsWith("col_") || columnId === "#" ? "" : columnId),
      ...(typeof Header !== "string" && Header != null && {
        Header: () => (typeof Header === "function" ? <Header /> : Header),
      }),
      ...(width && { size: Number(width) || undefined }),
      ...(minWidth && { minSize: Number(minWidth) || undefined }),
      ...(truncate === false && { truncate: false }),
    };

    if (!accessor) {
      return {
        ...base,
        // Unnamed columns (checkbox, row number) stay display-only; named ones
        // (e.g. "Action") remain data columns so they can be hidden.
        ...(base.header
          ? { accessorFn: () => undefined, enableGlobalFilter: false }
          : { columnDefType: "display" }),
        enableSorting: false,
        enableColumnFilter: false,
        enableColumnActions: false,
        enableExport: false,
        ...(isActionColumn && { enableHiding: false }),
        size: base.size || (columnId === "#" ? 48 : undefined),
        Cell: ({ row }) => (Cell ? Cell(legacyCellProps(row, undefined)) : null),
      };
    }

    if (typeof accessor === "string") {
      return {
        ...base,
        accessorKey: accessor,
        enableSorting: !disableSortBy,
        enableColumnFilter: false,
        ...(Cell && {
          Cell: ({ row, cell }) => Cell(legacyCellProps(row, cell.getValue())),
        }),
      };
    }

    return {
      ...base,
      accessorFn: (original) => {
        const out = accessor(original);
        return React.isValidElement(out) || Array.isArray(out) ? toText(out) : out;
      },
      enableSorting: !disableSortBy,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const raw = accessor(row.original);
        return Cell ? Cell(legacyCellProps(row, raw)) : raw;
      },
    };
  });
