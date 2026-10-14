import * as XLSX from "xlsx";

/**
 * Exports MRT rows using the currently visible, non-display columns.
 * A column can define `exportValue: (row) => string` when its rendered cell
 * differs from the raw value (badges, avatars, formatted dates...).
 */
export const exportRows = (table, rows, fileName = "export", bookType = "xlsx") => {
  const columns = table
    .getVisibleLeafColumns()
    .filter(
      (c) =>
        !c.id.startsWith("mrt-") &&
        c.columnDef.columnDefType !== "display" &&
        c.columnDef.enableExport !== false,
    );

  const data = rows.map((row) =>
    Object.fromEntries(
      columns.map((c) => {
        const header =
          typeof c.columnDef.header === "string" ? c.columnDef.header : c.id;
        const value = c.columnDef.exportValue
          ? c.columnDef.exportValue(row.original)
          : row.getValue(c.id);
        return [header, value ?? ""];
      }),
    ),
  );

  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Data");
  XLSX.writeFile(book, `${fileName}.${bookType}`, { bookType });
};
