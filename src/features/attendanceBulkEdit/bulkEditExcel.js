import * as XLSX from "xlsx";

export const COL = {
  id: "Record ID",
  date: "Date",
  day: "Day",
  status: "Day Status",
  checkIn: "Check In",
  checkOut: "Check Out",
  worked: "Worked (HH:MM)",
  hours: "Edited Hours (HH:MM)",
  note: "Note",
  editable: "Editable",
};

const HEADERS = Object.values(COL);

const README = [
  ["Attendance Bulk Edit — import guide"],
  [""],
  ["1. Edit only the \"Edited Hours (HH:MM)\" and \"Note\" columns on the Attendance sheet."],
  ["2. Hours use 24h HH:MM, e.g. 08:00 or 7:30 (max 23:59)."],
  ["3. Do not change \"Record ID\" — it links each line to the right day."],
  ["4. Rows marked Editable = No are locked and will be skipped."],
  ["5. Import the file on the same month, review the highlighted rows, then press Save changes."],
];

/**
 * rows: API rows for the month; toLine(row) -> object keyed by COL values.
 * Edited Hours / Note are written as text so Excel keeps "08:00" as typed.
 */
export const exportBulkEditWorkbook = (rows, toLine, fileName) => {
  const lines = rows.map(toLine);
  const sheet = XLSX.utils.json_to_sheet(lines, { header: HEADERS });

  const hoursCol = HEADERS.indexOf(COL.hours);
  for (let r = 1; r <= lines.length; r += 1) {
    const ref = XLSX.utils.encode_cell({ r, c: hoursCol });
    if (sheet[ref]) sheet[ref] = { t: "s", v: String(sheet[ref].v ?? ""), z: "@" };
  }

  sheet["!cols"] = [10, 12, 12, 34, 10, 10, 15, 21, 44, 22].map((wch) => ({ wch }));
  sheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lines.length, c: HEADERS.length - 1 } }) };

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Attendance");
  const guide = XLSX.utils.aoa_to_sheet(README);
  guide["!cols"] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(book, guide, "How to use");
  XLSX.writeFile(book, fileName);
};

/** Excel may turn "08:00" into a day fraction (0.333…); normalise to "HH:MM" text. */
const cellToHHMM = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    const minutes = Math.round((value % 1) * 24 * 60);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  return String(value).trim();
};

/** Resolves to [{ id, date, hours, note }] from the first sheet that has a Record ID column. */
export const readBulkEditWorkbook = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.onload = (e) => {
      try {
        const book = XLSX.read(e.target.result, { type: "array" });
        const sheetName =
          book.SheetNames.find((n) => {
            const head = XLSX.utils.sheet_to_json(book.Sheets[n], { header: 1 })[0] || [];
            return head.includes(COL.id);
          }) || book.SheetNames[0];
        const json = XLSX.utils.sheet_to_json(book.Sheets[sheetName], { defval: "", raw: true });
        if (!json.length || !(COL.id in json[0])) {
          reject(new Error(`This file has no "${COL.id}" column. Export the month first and edit that file.`));
          return;
        }
        resolve(
          json.map((line) => ({
            id: String(line[COL.id]).trim(),
            date: String(line[COL.date] ?? "").trim(),
            hours: cellToHHMM(line[COL.hours]),
            note: String(line[COL.note] ?? "").trim().slice(0, 250),
          })),
        );
      } catch {
        reject(new Error("This doesn't look like a valid Excel or CSV file"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
