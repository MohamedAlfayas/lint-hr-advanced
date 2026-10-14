import React, { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton, Tooltip } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import { getApiErrorMessage } from "../../../shared/api/axiosBaseQuery";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { floatingLabelTheme } from "../../../shared/theme/theme";
import {
  useGetAdminBulkEditMonthQuery,
  useGetBulkEditMonthQuery,
  useSaveAdminBulkEditMutation,
  useSaveBulkEditMutation,
} from "../api/bulkEditApi";
import NotesDialog from "../components/NotesDialog";
import Select from "../../../shared/ui/TestableSelect";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { COL, exportBulkEditWorkbook, readBulkEditWorkbook } from "../bulkEditExcel";
import "../attendanceBulkEdit.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

// ───────────────────────── helpers ─────────────────────────

const pad = (n) => String(n).padStart(2, "0");

/** seconds -> "HH:MM" ("" for 0) */
const toHHMM = (sec) => (sec > 0 ? `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}` : "");

/** "8", "8:30", "08:30" -> seconds; "" -> null; invalid -> NaN */
const parseHHMM = (value) => {
  const s = (value || "").trim();
  if (!s) return null;
  const m = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(s);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2] || 0);
  if (h > 23 || min > 59) return NaN;
  return h * 3600 + min * 60;
};

const fmtDur = (sec) =>
  sec > 0 ? `${Math.floor(sec / 3600)}h ${pad(Math.floor((sec % 3600) / 60))}m` : "—";

/** "DD-MM-YYYY HH:mm:ss" -> "9:28 AM" */
const fmtClock = (value) => {
  const time = value?.split(" ")[1];
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};

const HR_STATUS = {
  2: { label: "Approved", tone: "success", icon: "ri-checkbox-circle-line" },
  3: { label: "Pending approval", tone: "warning", icon: "ri-timer-2-line" },
  4: { label: "Rejected", tone: "danger", icon: "ri-close-circle-line" },
};

const lockReason = (r) => {
  if (!r.is_editable) {
    if (r.hr_status === 2) return "Approved by HR";
    if (r.hr_status === 4) return "Rejected by HR";
    return "Locked";
  }
  if (r.is_leave_applied) return "Leave applied";
  return null;
};

const dayTags = (r) => {
  const tags = [];
  if (r.is_holiday) tags.push({ tone: "info", icon: "ri-sun-line", label: r.holiday_name || "Holiday" });
  if (r.is_week_off) tags.push({ tone: "secondary", icon: "ri-cup-line", label: "Week off" });
  if (r.is_leave_applied) {
    const la = r.leave_application;
    tags.push({
      tone: "warning",
      icon: "ri-suitcase-line",
      label: la ? `${la.leave_type_name} · ${la.status_text}` : "Leave applied",
      tip: la?.reason ? `Reason: ${la.reason}` : null,
    });
  }
  if (r.is_present) tags.push({ tone: "success", icon: "ri-user-follow-line", label: "Present" });
  if (r.is_present && !r.is_properly_closed)
    tags.push({ tone: "warning", icon: "ri-logout-circle-r-line", label: "No check-out" });
  if (r.is_attendance_not_marked)
    tags.push({ tone: "danger", icon: "ri-error-warning-line", label: "Not marked" });
  if (r.leave_taken_without_approval)
    tags.push({ tone: "danger", icon: "ri-alarm-warning-line", label: "Unapproved absence" });
  return tags;
};

const needsAttention = (r) =>
  r.is_attendance_not_marked || r.leave_taken_without_approval || (r.is_present && !r.is_properly_closed);

const FILTERS = [
  { key: "all", label: "All days", test: () => true },
  { key: "attention", label: "Needs attention", test: needsAttention },
  { key: "editable", label: "Editable", test: (r) => !lockReason(r) },
  { key: "pending", label: "Pending approval", test: (r) => r.hr_status === 3 },
  { key: "locked", label: "Locked", test: (r) => !!lockReason(r) },
];

const empName = (e) => `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.name || `Employee ${e.id}`;

const EmployeeOption = ({ data }) => (
  <span className="abe-emp-opt">
    {data.profile_url ? (
      <img src={data.profile_url} alt="" />
    ) : (
      <span className="abe-emp-initial">{data.label.charAt(0).toUpperCase()}</span>
    )}
    <span className="abe-emp-opt-text">
      <b>{data.label}</b>
      {data.emp_id && <small>{data.emp_id}</small>}
    </span>
  </span>
);

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    borderRadius: 10,
    borderColor: s.isFocused ? "var(--vz-success)" : "var(--vz-border-color)",
    boxShadow: s.isFocused ? "0 0 0 3px rgba(var(--vz-success-rgb), 0.15)" : "none",
    backgroundColor: "var(--vz-secondary-bg)",
    "&:hover": { borderColor: "var(--vz-success)" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 1060 }),
};

// ───────────────────────── page ─────────────────────────

/** `admin`: pick any employee; saves go to the admin endpoint and are approved immediately. */
const AttendanceBulkEditPage = ({ admin = false }) => {
  const pageTitle = admin ? "Update Bulk Attendance" : "Attendance Bulk Edit";
  document.title = `${pageTitle} | ${MetaTitle || "Lint HR"}`;

  const [month, setMonth] = useState(dayjs().startOf("month"));
  const monthKey = month.format("YYYY-MM");

  const [departmentId, setDepartmentId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const departmentOptions = useMemo(
    () => (GetLocalStorageData("department") || []).map((d) => ({ value: d.id, label: d.name })),
    [],
  );
  const allEmployees = useMemo(() => (admin ? GetLocalStorageData("employee") || [] : []), [admin]);
  const employeeOptions = useMemo(
    () =>
      allEmployees
        .filter((e) => !departmentId || (e.primary_department_id_list || []).includes(departmentId))
        .map((e) => ({ value: e.id, label: empName(e), emp_id: e.emp_id, profile_url: e.profile_url }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allEmployees, departmentId],
  );
  const selectedEmployee = allEmployees.find((e) => e.id === employeeId) || null;
  const needsEmployee = admin && !employeeId;

  const [filter, setFilter] = useState("all");
  // id -> { hours: "HH:MM", note: "" }
  const [drafts, setDrafts] = useState({});
  const [selected, setSelected] = useState(() => new Set());
  const [bulkHours, setBulkHours] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const [commonNotes, setCommonNotes] = useState("");
  const [notesRowId, setNotesRowId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importInputRef = useRef(null);

  const selfQuery = useGetBulkEditMonthQuery(monthKey, { skip: admin });
  const adminQuery = useGetAdminBulkEditMonthQuery({ employeeId, month: monthKey }, { skip: needsEmployee || !admin });
  const { data: rows = [], isLoading, isFetching, isError, error, refetch } = admin ? adminQuery : selfQuery;
  const [saveSelf, { isLoading: savingSelf }] = useSaveBulkEditMutation();
  const [saveAdmin, { isLoading: savingAdmin }] = useSaveAdminBulkEditMutation();
  const saving = savingSelf || savingAdmin;

  // Drafts belong to one employee's month.
  useEffect(() => {
    setDrafts({});
    setSelected(new Set());
    setFilter("all");
    setImportResult(null);
  }, [monthKey, employeeId]);

  const changeDepartment = (opt) => {
    const id = opt?.value ?? null;
    setDepartmentId(id);
    const emp = allEmployees.find((e) => e.id === employeeId);
    if (id && emp && !(emp.primary_department_id_list || []).includes(id)) setEmployeeId(null);
  };

  const changeEmployee = (opt) => {
    if (opt?.value === employeeId) return;
    if (changes.length && !window.confirm("You have unsaved changes for this employee. Discard them?")) return;
    setEmployeeId(opt?.value ?? null);
  };

  const todayKey = dayjs().format("YYYY-MM-DD");

  const draftOf = (r) => drafts[r.id] ?? { hours: toHHMM(r.edited_checked_in_hr_in_seconds), note: "" };

  const changes = useMemo(
    () =>
      rows
        .filter((r) => !lockReason(r) && drafts[r.id])
        .map((r) => {
          const d = drafts[r.id];
          const seconds = parseHHMM(d.hours);
          const hoursChanged =
            seconds !== null && !Number.isNaN(seconds) && seconds !== (r.edited_checked_in_hr_in_seconds || 0);
          return {
            row: r,
            seconds,
            invalid: Number.isNaN(seconds),
            note: d.note.trim(),
            dirty: hoursChanged || Number.isNaN(seconds) || !!d.note.trim(),
          };
        })
        .filter((c) => c.dirty),
    [rows, drafts],
  );
  const changedIds = useMemo(() => new Set(changes.map((c) => c.row.id)), [changes]);

  const stats = useMemo(
    () => ({
      present: rows.filter((r) => r.is_present).length,
      attention: rows.filter(needsAttention).length,
      leave: rows.filter((r) => r.is_leave_applied).length,
      off: rows.filter((r) => r.is_holiday || r.is_week_off).length,
      pending: rows.filter((r) => r.hr_status === 3).length,
      locked: rows.filter((r) => !!lockReason(r)).length,
      paid: rows.reduce((s, r) => s + (r.final_paid_hr_in_seconds || 0), 0),
    }),
    [rows],
  );

  const visibleRows = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) || FILTERS[0];
    return rows.filter(f.test);
  }, [rows, filter]);

  const lastNotesRowRef = useRef(null);
  const openNotesRow = notesRowId ? rows.find((r) => r.id === notesRowId) : null;
  if (openNotesRow) lastNotesRowRef.current = openNotesRow;
  // Keeps the content in place while the dialog fades out.
  const notesRow = openNotesRow || lastNotesRowRef.current;

  const editableVisible = visibleRows.filter((r) => !lockReason(r));
  const allVisibleSelected =
    editableVisible.length > 0 && editableVisible.every((r) => selected.has(r.id));

  // ── draft / selection handlers ──
  const setDraft = (r, patch) =>
    setDrafts((prev) => ({ ...prev, [r.id]: { ...draftOf(r), ...prev[r.id], ...patch } }));

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      editableVisible.forEach((r) => (allVisibleSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const applyBulk = () => {
    const hasHours = bulkHours.trim() !== "";
    const note = bulkNote.trim();
    if (!hasHours && !note) {
      toast.error("Enter hours, a reason, or both");
      return;
    }
    const seconds = hasHours ? parseHHMM(bulkHours) : null;
    if (hasHours && (seconds === null || Number.isNaN(seconds))) {
      toast.error("Enter hours as HH:MM, for example 08:00");
      return;
    }
    const targets = rows.filter((r) => selected.has(r.id) && !lockReason(r));
    if (!targets.length) {
      toast.info("Select at least one editable day first");
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      targets.forEach((r) => {
        next[r.id] = {
          ...draftOf(r),
          ...prev[r.id],
          ...(hasHours && { hours: toHHMM(seconds) }),
          ...(note && { note }),
        };
      });
      return next;
    });
    const what = [hasHours && `${toHHMM(seconds)} hr`, note && "reason"].filter(Boolean).join(" and ");
    toast.success(`Applied ${what} to ${targets.length} day(s)`);
  };

  const discard = () => {
    setDrafts({});
    setCommonNotes("");
    setBulkNote("");
    setImportResult(null);
  };

  // ── Excel export / import ──
  const exportExcel = () => {
    if (!rows.length) {
      toast.info("No attendance records to export for this month");
      return;
    }
    exportBulkEditWorkbook(
      rows,
      (r) => {
        const d = draftOf(r);
        const lock = lockReason(r);
        return {
          [COL.id]: r.id,
          [COL.date]: dayjs(r.date).format("DD-MM-YYYY"),
          [COL.day]: r.day || dayjs(r.date).format("dddd"),
          [COL.status]: dayTags(r).map((t) => t.label).join(", "),
          [COL.checkIn]: fmtClock(r.first_check_in) || "",
          [COL.checkOut]: fmtClock(r.last_check_out) || "",
          [COL.worked]: toHHMM(r.checked_in_hr_in_seconds),
          [COL.hours]: d.hours,
          [COL.note]: d.note,
          [COL.editable]: lock ? `No (${lock})` : "Yes",
        };
      },
      `attendance-bulk-edit-${admin && selectedEmployee ? `${selectedEmployee.emp_id || selectedEmployee.id}-` : ""}${monthKey}.xlsx`,
    );
    toast.success(`Exported ${rows.length} day(s). Edit hours and notes, then import the file.`);
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const lines = await readBulkEditWorkbook(file);
      const byId = new Map(rows.map((r) => [String(r.id), r]));
      const next = {};
      const result = { fileName: file.name, updated: 0, unchanged: 0, locked: 0, invalid: 0, unknown: 0 };

      lines.forEach((line) => {
        const r = byId.get(line.id);
        if (!r) {
          if (line.id) result.unknown += 1;
          return;
        }
        const seconds = parseHHMM(line.hours);
        const hours = seconds !== null && !Number.isNaN(seconds) ? toHHMM(seconds) || "00:00" : line.hours;
        const current = draftOf(r);
        const currentSeconds = parseHHMM(current.hours);
        const sameHours = hours === current.hours || (seconds !== null && seconds === currentSeconds);
        if (sameHours && line.note === current.note) {
          result.unchanged += 1;
          return;
        }
        if (lockReason(r)) {
          result.locked += 1;
          return;
        }
        if (Number.isNaN(seconds)) result.invalid += 1;
        next[r.id] = { hours: sameHours ? current.hours : hours, note: line.note };
        result.updated += 1;
      });

      if (lines.length && result.unknown === lines.length) {
        toast.error(`None of the rows belong to ${month.format("MMMM YYYY")}. Switch to the exported month and try again.`);
        return;
      }

      setDrafts((prev) => ({ ...prev, ...next }));
      setFilter("all");
      setImportResult(result);
      if (!result.updated) toast.info("No changes found in the file");
      else if (result.invalid) toast.warning(`Imported ${result.updated} day(s). Fix the highlighted hours before saving.`);
      else toast.success(`Imported ${result.updated} day(s). Review them, then press Save changes.`);
    } catch (err) {
      toast.error(err.message || "Could not import the file");
    } finally {
      setImporting(false);
    }
  };

  const save = async () => {
    if (changes.some((c) => c.invalid)) {
      toast.error("Fix the highlighted hours (use HH:MM, max 23:59)");
      return;
    }
    if (!commonNotes.trim() && changes.some((c) => !c.note)) {
      toast.error("Add a note on each changed day, or fill in the common note");
      return;
    }
    try {
      const body = {
        this_month: monthKey,
        common_notes: commonNotes.trim(),
        records: changes.map((c) => ({
          id: c.row.id,
          edited_checked_in_hr_in_seconds:
            c.seconds === null ? c.row.edited_checked_in_hr_in_seconds || 0 : c.seconds,
          notes: c.note,
        })),
      };
      const res = admin
        ? await saveAdmin({ employee_id: employeeId, ...body }).unwrap()
        : await saveSelf(body).unwrap();
      toast.success(res?.message || (admin ? "Attendance edited and approved successfully" : "Attendance edited successfully"));
      setImportResult(null);
      setDrafts({});
      setSelected(new Set());
      setCommonNotes("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save attendance changes"));
    }
  };

  // ── render pieces ──
  const statCards = [
    { tone: "success", icon: "ri-user-follow-line", label: "Present", value: stats.present },
    { tone: "danger", icon: "ri-error-warning-line", label: "Needs attention", value: stats.attention },
    { tone: "warning", icon: "ri-suitcase-line", label: "Leave days", value: stats.leave },
    { tone: "info", icon: "ri-sun-line", label: "Holidays & week offs", value: stats.off },
    { tone: "primary", icon: "ri-timer-2-line", label: "Pending approval", value: stats.pending },
    { tone: "secondary", icon: "ri-time-line", label: "Paid hours", value: fmtDur(stats.paid) },
  ];

  const filterCount = (f) => rows.filter(f.test).length;

  const renderRow = (r) => {
    const lock = lockReason(r);
    const d = draftOf(r);
    const parsed = parseHHMM(d.hours);
    const invalid = Number.isNaN(parsed);
    const changed = changedIds.has(r.id);
    const status = HR_STATUS[r.hr_status];
    const inTime = fmtClock(r.first_check_in);
    const outTime = fmtClock(r.last_check_out);
    const dt = dayjs(r.date);
    const isToday = r.date === todayKey;
    const offDay = r.is_holiday || r.is_week_off;

    return (
      <div
        key={r.id}
        className={[
          "abe-row",
          lock && "is-locked",
          changed && "is-changed",
          selected.has(r.id) && "is-selected",
          offDay && "is-off",
          isToday && "is-today",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="abe-c-check">
          {lock ? (
            <Tooltip title={lock}>
              <span className="abe-lock">
                <i className="ri-lock-line"></i>
              </span>
            </Tooltip>
          ) : (
            <input
              data-testid={testId("attendance-bulk-edit-row", r.date, "checkbox")}
              type="checkbox"
              className="form-check-input"
              checked={selected.has(r.id)}
              onChange={() => toggleRow(r.id)}
              aria-label={`Select ${r.date}`}
            />
          )}
        </div>

        <div className="abe-c-date">
          <span className="abe-date-tile">
            <span>{dt.format("DD")}</span>
            <small>{dt.format("MMM")}</small>
          </span>
          <span className="abe-date-text">
            <b>{r.day || dt.format("dddd")}</b>
            {isToday ? <em className="abe-today">Today</em> : <small>{dt.format("DD MMM YYYY")}</small>}
          </span>
        </div>

        <div className="abe-c-tags">
          {dayTags(r).map((t) => (
            <Tooltip key={t.label} title={t.tip || ""} disableHoverListener={!t.tip}>
              <span className={`abe-tag is-${t.tone}`}>
                <i className={t.icon}></i>
                {t.label}
              </span>
            </Tooltip>
          ))}
          {lock && (
            <span className="abe-tag is-lock">
              <i className="ri-lock-line"></i>
              {lock}
            </span>
          )}
        </div>

        <div className="abe-c-times">
          <span className={inTime ? "" : "is-empty"}>
            <i className="ri-login-circle-line"></i>
            {inTime || "—"}
          </span>
          <span className={outTime ? "" : "is-empty"}>
            <i className="ri-logout-circle-r-line"></i>
            {outTime || (r.is_present ? "Missing" : "—")}
          </span>
        </div>

        <div className="abe-c-worked">
          <span className="abe-label">Worked</span>
          <b>{fmtDur(r.checked_in_hr_in_seconds)}</b>
        </div>

        <div className="abe-c-edit">
          <span className="abe-label">Edited hours</span>
          <div className={`abe-hours ${invalid ? "is-invalid" : ""} ${lock ? "is-disabled" : ""}`}>
            <i className="ri-time-line"></i>
            <input
              data-testid="attendance-bulk-edit-hours-input"
              type="text"
              inputMode="numeric"
              placeholder={toHHMM(r.checked_in_hr_in_seconds) || "00:00"}
              value={d.hours}
              disabled={!!lock}
              onChange={(e) => setDraft(r, { hours: e.target.value.replace(/[^\d:]/g, "").slice(0, 5) })}
              onBlur={() => {
                const s = parseHHMM(d.hours);
                if (s !== null && !Number.isNaN(s)) setDraft(r, { hours: toHHMM(s) || "00:00" });
              }}
            />
            {!lock && r.maximum_full_day_work_duration > 0 && (
              <Tooltip title={`Full day (${toHHMM(r.maximum_full_day_work_duration)})`}>
                <button
                  type="button"
                  data-testid={testId("attendance-bulk-edit-row", r.date, "fill-full-day-button")}
                  className="abe-full"
                  onClick={() => setDraft(r, { hours: toHHMM(r.maximum_full_day_work_duration) })}
                >
                  <i className="ri-flashlight-line"></i>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="abe-c-note">
          <span className="abe-label">Note</span>
          <input
            data-testid="attendance-bulk-edit-note-input"
            type="text"
            className="abe-note"
            placeholder={lock ? "" : commonNotes.trim() ? "Uses common note" : "Reason for change"}
            value={d.note}
            disabled={!!lock}
            maxLength={250}
            onChange={(e) => setDraft(r, { note: e.target.value })}
          />
          {r.notes?.length > 0 && (
            <Tooltip title={`View ${r.notes.length === 1 ? "1 note" : `${r.notes.length} notes`}`}>
              <button
                data-testid={testId("attendance-bulk-edit-row", r.date, "notes-button")}
                type="button"
                className="abe-notes-count"
                onClick={() => setNotesRowId(r.id)}
              >
                <i className="ri-chat-3-line"></i>
                {r.notes.length}
              </button>
            </Tooltip>
          )}
        </div>

        <div className="abe-c-final">
          <span className="abe-label">Paid</span>
          <b>{fmtDur(r.final_paid_hr_in_seconds)}</b>
          {r.final_ot_hr_in_seconds > 0 && <small>+{fmtDur(r.final_ot_hr_in_seconds)} OT</small>}
        </div>

        <div className="abe-c-status">
          {changed ? (
            <span className="abe-status is-primary">
              <i className="ri-edit-box-line"></i>
              Unsaved
            </span>
          ) : status ? (
            <span className={`abe-status is-${status.tone}`}>
              <i className={status.icon}></i>
              {status.label}
            </span>
          ) : r.is_record_edited ? (
            <span className="abe-status is-info">
              <i className="ri-edit-box-line"></i>
              Edited
            </span>
          ) : (
            <span className="abe-muted">—</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="container-fluid abe">
        {/* ── Header ── */}
        <div className="abe-hero">
          <div className="abe-hero-title">
            <span className="abe-hero-icon">
              <i className={admin ? "ri-shield-user-line" : "ri-edit-box-line"}></i>
            </span>
            <div>
              <h4>
                {pageTitle}
                {admin && <span className="abe-admin-badge">Admin</span>}
              </h4>
              <p>
                {admin
                  ? "Correct an employee's attendance for the month. Changes are approved immediately."
                  : "Correct several days at once. Changes go to HR for approval."}
              </p>
            </div>
          </div>

          <div className="abe-hero-actions">
          <div className="abe-io">
            <Tooltip title="Download this month as Excel to edit hours and notes offline">
              <span>
                <button
                  data-testid="attendance-bulk-edit-export-button"
                  type="button"
                  className="abe-io-btn"
                  onClick={exportExcel}
                  disabled={isLoading || !rows.length}
                >
                  <i className="ri-download-2-line"></i>
                  <span>Export</span>
                </button>
              </span>
            </Tooltip>
            <Tooltip title="Upload the edited Excel file to fill in the changes">
              <span>
                <button
                  data-testid="attendance-bulk-edit-import-button"
                  type="button"
                  className="abe-io-btn is-primary"
                  onClick={() => importInputRef.current?.click()}
                  disabled={isLoading || importing || !rows.length}
                >
                  <i className={importing ? "ri-loader-4-line is-spinning" : "ri-upload-2-line"}></i>
                  <span>{importing ? "Importing…" : "Import"}</span>
                </button>
              </span>
            </Tooltip>
            <input
              ref={importInputRef}
              data-testid="attendance-bulk-edit-import-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={importExcel}
            />
          </div>

          <div className="abe-month">
            <button
              data-testid="attendance-bulk-edit-previous-month-button"
              type="button"
              className="abe-icon-btn"
              onClick={() => setMonth((m) => m.subtract(1, "month"))}
              title="Previous month"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <ThemeProvider theme={floatingLabelTheme}>
              <DatePicker
                views={["year", "month"]}
                openTo="month"
                label="Month"
                value={month}
                maxDate={dayjs().endOf("month")}
                onChange={(v) => v?.isValid() && setMonth(v.startOf("month"))}
                format="MMMM YYYY"
                slotProps={{ textField: { size: "small", sx: { width: 190 } } }}
              />
            </ThemeProvider>
            <button
              data-testid="attendance-bulk-edit-next-month-button"
              type="button"
              className="abe-icon-btn"
              onClick={() => setMonth((m) => m.add(1, "month"))}
              disabled={!month.isBefore(dayjs().startOf("month"))}
              title="Next month"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
            <Tooltip title="Reload">
              <span>
                <button
                  data-testid="attendance-bulk-edit-refresh-button"
                  type="button"
                  className={`abe-icon-btn ${isFetching ? "is-spinning" : ""}`}
                  onClick={refetch}
                  disabled={isFetching || needsEmployee}
                >
                  <i className="ri-refresh-line"></i>
                </button>
              </span>
            </Tooltip>
          </div>
          </div>
        </div>

        {admin && (
          <div className="abe-admin-filter">
            <div className="abe-admin-field">
              <label htmlFor="attendance-bulk-edit-department">
                <i className="ri-building-line"></i>
                Department
              </label>
              <Select
                inputId="attendance-bulk-edit-department"
                testId="attendance-bulk-edit-department"
                classNamePrefix="abe-select"
                options={departmentOptions}
                value={departmentOptions.find((o) => o.value === departmentId) || null}
                onChange={changeDepartment}
                placeholder="All departments"
                isClearable
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>
            <div className="abe-admin-field is-wide">
              <label htmlFor="attendance-bulk-edit-employee">
                <i className="ri-user-3-line"></i>
                Employee <em>*</em>
              </label>
              <Select
                inputId="attendance-bulk-edit-employee"
                testId="attendance-bulk-edit-employee"
                classNamePrefix="abe-select"
                options={employeeOptions}
                value={employeeOptions.find((o) => o.value === employeeId) || null}
                onChange={changeEmployee}
                formatOptionLabel={(o) => <EmployeeOption data={o} />}
                filterOption={(o, q) =>
                  !q || `${o.data.label} ${o.data.emp_id || ""}`.toLowerCase().includes(q.toLowerCase())
                }
                placeholder={employeeOptions.length ? "Search by name or ID" : "No employees in this department"}
                noOptionsMessage={() => "No matching employees"}
                isClearable
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>
            {selectedEmployee && (
              <div className="abe-admin-chip" data-testid="attendance-bulk-edit-selected-employee">
                <i className="ri-checkbox-circle-fill"></i>
                Editing <b>{empName(selectedEmployee)}</b>
                <span>{month.format("MMM YYYY")}</span>
              </div>
            )}
          </div>
        )}

        <div className="abe-stats">
          {statCards.map((s) => (
            <div key={s.label} className={`abe-stat is-${s.tone}`}>
              <span className="abe-stat-icon">
                <i className={s.icon}></i>
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="abe-stat-value">{needsEmployee ? "—" : isLoading ? "…" : s.value}</div>
                <div className="abe-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel ── */}
        <section className="abe-panel">
          <div className="abe-toolbar">
            <div className="abe-chips">
              {FILTERS.map((f) => (
                <button
                  data-testid={testId("attendance-bulk-edit", itemTestKey(f), "button")}
                  key={f.key}
                  type="button"
                  className={`abe-chip ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span>{filterCount(f)}</span>
                </button>
              ))}
            </div>

            <div className="abe-bulk">
              <label className="abe-select-all">
                <input
                  data-testid="attendance-bulk-edit-all-visible-selected-checkbox"
                  type="checkbox"
                  className="form-check-input"
                  checked={allVisibleSelected}
                  disabled={!editableVisible.length}
                  onChange={toggleAllVisible}
                />
                Select editable
                {selected.size > 0 && <b>{selected.size}</b>}
              </label>
              <div className="abe-bulk-set">
                <i className="ri-time-line"></i>
                <input
                  data-testid="attendance-bulk-edit-08-00-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="08:00"
                  value={bulkHours}
                  onChange={(e) => setBulkHours(e.target.value.replace(/[^\d:]/g, "").slice(0, 5))}
                  onKeyDown={(e) => e.key === "Enter" && applyBulk()}
                />
                <span className="abe-bulk-divider" />
                <i className="ri-sticky-note-line"></i>
                <input
                  data-testid="attendance-bulk-edit-common-reason-input"
                  type="text"
                  className="abe-bulk-note"
                  placeholder="Common reason"
                  value={bulkNote}
                  maxLength={250}
                  onChange={(e) => setBulkNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyBulk()}
                />
                <button data-testid="attendance-bulk-edit-apply-button" type="button" onClick={applyBulk} disabled={!selected.size}>
                  Apply
                </button>
              </div>
            </div>
          </div>

          {importResult && (
            <div className={`abe-import ${importResult.invalid ? "is-warning" : importResult.updated ? "is-success" : ""}`}>
              <span className="abe-import-icon">
                <i className={importResult.invalid ? "ri-error-warning-line" : "ri-file-excel-2-line"}></i>
              </span>
              <div className="abe-import-text">
                <b>
                  {importResult.updated
                    ? `${importResult.updated} day(s) updated from ${importResult.fileName}`
                    : `No changes found in ${importResult.fileName}`}
                </b>
                <small>
                  {[
                    importResult.unchanged > 0 && `${importResult.unchanged} unchanged`,
                    importResult.locked > 0 && `${importResult.locked} locked day(s) skipped`,
                    importResult.invalid > 0 && `${importResult.invalid} with invalid hours (highlighted)`,
                    importResult.unknown > 0 && `${importResult.unknown} row(s) not in this month`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Review the rows marked Unsaved"}
                  {importResult.updated > 0 && " — review and press Save changes."}
                </small>
              </div>
              <button
                data-testid="attendance-bulk-edit-import-result-close-button"
                type="button"
                className="abe-import-close"
                onClick={() => setImportResult(null)}
                aria-label="Dismiss"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}

          {isError && (
            <div className="abe-error">
              <i className="ri-error-warning-line"></i>
              <span>{getApiErrorMessage(error, "Could not load attendance for this month")}</span>
              <button data-testid="attendance-bulk-edit-retry-button" type="button" onClick={refetch}>
                Retry
              </button>
            </div>
          )}

          <div className="abe-head">
            <span />
            <span>Date</span>
            <span>Day status</span>
            <span>Check in / out</span>
            <span>Worked</span>
            <span>Edited hours</span>
            <span>Note</span>
            <span>Paid</span>
            <span>Status</span>
          </div>

          <div className={`abe-list ${isFetching && !isLoading ? "is-fetching" : ""}`}>
            {needsEmployee ? (
              <div className="abe-empty">
                <span className="abe-empty-icon">
                  <i className="ri-user-search-line"></i>
                </span>
                <h6>Select an employee</h6>
                <p>Pick a department and employee above to load their attendance for {month.format("MMMM YYYY")}.</p>
              </div>
            ) : isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="abe-row is-skeleton">
                  <Skeleton variant="rounded" height={44} sx={{ borderRadius: "10px", flex: 1 }} />
                </div>
              ))
            ) : visibleRows.length === 0 ? (
              <div className="abe-empty">
                <span className="abe-empty-icon">
                  <i className="ri-calendar-2-line"></i>
                </span>
                <h6>{rows.length ? "No days match this filter" : "No attendance records for this month"}</h6>
                <p>{rows.length ? "Pick another filter above." : "Try a different month."}</p>
              </div>
            ) : (
              visibleRows.map(renderRow)
            )}
          </div>
        </section>

        {/* ── Save bar ── */}
        {changes.length > 0 && (
          <div className="abe-savebar">
            <div className="abe-savebar-count">
              <span>{changes.length}</span>
              <div>
                <b>{changes.length === 1 ? "1 day changed" : `${changes.length} days changed`}</b>
                <small>
                  {admin
                    ? `Approved immediately for ${selectedEmployee ? empName(selectedEmployee) : "this employee"}`
                    : "Will be sent to HR for approval"}
                </small>
              </div>
            </div>
            <div className="abe-savebar-note">
              <i className="ri-sticky-note-line"></i>
              <input
                data-testid="attendance-bulk-edit-common-note-for-days-input"
                type="text"
                placeholder="Common note for days without their own note"
                value={commonNotes}
                maxLength={250}
                onChange={(e) => setCommonNotes(e.target.value)}
              />
            </div>
            <div className="abe-savebar-actions">
              <button data-testid="attendance-bulk-edit-discard-button" type="button" className="abe-btn-ghost" onClick={discard} disabled={saving}>
                <i className="ri-arrow-go-back-line"></i>
                Discard
              </button>
              <button data-testid="attendance-bulk-edit-save-changes-button" type="button" className="abe-btn-primary" onClick={save} disabled={saving}>
                <i className={admin ? "ri-checkbox-circle-line" : "ri-save-3-line"}></i>
                {saving ? "Saving…" : admin ? "Save & approve" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      <NotesDialog
        open={!!openNotesRow}
        onClose={() => setNotesRowId(null)}
        date={notesRow?.date}
        notes={notesRow?.notes}
        summary={
          notesRow
            ? [
                { label: "Worked", value: fmtDur(notesRow.checked_in_hr_in_seconds), icon: "ri-time-line", tone: "info" },
                { label: "Paid", value: fmtDur(notesRow.final_paid_hr_in_seconds), icon: "ri-wallet-3-line", tone: "success" },
                ...(HR_STATUS[notesRow.hr_status]
                  ? [
                      {
                        label: "Status",
                        value: HR_STATUS[notesRow.hr_status].label,
                        icon: HR_STATUS[notesRow.hr_status].icon,
                        tone: HR_STATUS[notesRow.hr_status].tone,
                      },
                    ]
                  : []),
              ]
            : []
        }
      />
    </div>
  );
};

export default AttendanceBulkEditPage;
