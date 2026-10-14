import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { Api } from "../../common/api/Api";
import "./ImportForm.scss";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toast } from "react-toastify";
import { toggleISBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { ExportSampleData } from "../../common/js/ExportSampleData";
import { employee_component_name } from "../../common/constant/Constants";
import { employeeCSVHeaders } from "../../common/js/employeeSampleData";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import { testId, itemTestKey } from "../../shared/testing/testId";

defineElement(loadAnimation);

const MAX_ISSUES_SHOWN = 12;

// ── Field-level format checks ───────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const COUNTRY_CODE_RE = /^\+\d{1,4}$/; // +91
const INT_RE = /^\d+$/;
const BOOL_VALUES = new Set(["true", "false", "1", "0", "yes", "no"]);

const isInt = (v) => INT_RE.test(String(v).trim());
const isBool = (v) => BOOL_VALUES.has(String(v).trim().toLowerCase());
const isEmail = (v) => EMAIL_RE.test(String(v).trim());
const isPhone = (v) => /^\d{10}$/.test(String(v).replace(/[\s-]/g, ""));
const isName = (v) => /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(String(v).trim());
const isTextOnly = (v) =>
  /^[A-Za-z][A-Za-z0-9\s.'&/-]*$/.test(String(v).trim());
const isEmpId = (v) => /^[A-Za-z0-9_-]+$/.test(String(v).trim());
const isDate = (v) => {
  const s = String(v).trim();
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
};

// Converts a parsed Excel cell into "YYYY-MM-DD".
// Handles real Date objects (from cellDates:true) and falls back to
// parsing common text formats (m/d/yy, m/d/yyyy) so validation matches
// whatever the sheet actually contains.
const toISODate = (v) => {
  if (v == null || v === "") return v;

  if (v instanceof Date && !isNaN(v.getTime())) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const day = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const s = String(v).trim();
  if (DATE_RE.test(s)) return s; // already ISO

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mm, dd, yy] = m;
    if (yy.length === 2) yy = (Number(yy) < 70 ? "20" : "19") + yy;
    mm = mm.padStart(2, "0");
    dd = dd.padStart(2, "0");
    const iso = `${yy}-${mm}-${dd}`;
    return isNaN(new Date(iso).getTime()) ? s : iso;
  }

  return s; // leave as-is; isDate() will flag it as invalid
};

// One rule per column. `required` => cell must be non-empty.
// `validate` => format check (only run when the cell is non-empty).
const FIELD_RULES = {
  emp_id: {
    required: true,
    validate: isEmpId,
    msg: "must be alphanumeric (letters, numbers, - or _ only)",
  },
  first_name: {
    required: true,
    validate: isName,
    msg: "must contain letters only (no numbers or symbols)",
  },
  last_name: {
    required: true,
    validate: isName,
    msg: "must contain letters only (no numbers or symbols)",
  },
  email: { required: true, validate: isEmail, msg: "is not a valid email" },
  password: { required: true },
  dob: {
    required: true,
    validate: isDate,
    msg: "must be a valid date (YYYY-MM-DD)",
  },
  joining_date: {
    required: true,
    validate: isDate,
    msg: "must be a valid date (YYYY-MM-DD)",
  },
  country_code: {
    required: true,
    validate: (v) => COUNTRY_CODE_RE.test(String(v).trim()),
    msg: "must look like +91",
  },
  contact_number: {
    required: true,
    validate: isPhone,
    msg: "must be a 10-digit phone number",
  },
  gender: {
    required: true,
    validate: (v) => /^(male|female|other)$/i.test(String(v).trim()),
    msg: "must be Male, Female, or Other",
  },
  branch: {
    required: true,
    validate: isTextOnly,
    msg: "must be text (letters, starting with a letter)",
  },
  primary_department: {
    required: true,
    validate: isTextOnly,
    msg: "must be text (letters, starting with a letter)",
  },
  role: {
    required: true,
    validate: isTextOnly,
    msg: "must be text (letters, starting with a letter)",
  },
  work_schedule: {
    required: true,
    validate: isTextOnly,
    msg: "must be text (letters, starting with a letter)",
  },
  reporting_manager: {
    required: true,
    validate: (v) => {
      const s = String(v).trim();
      return isEmail(s) || isInt(s);
    },
    msg: "must be an email or a numeric id",
  },
  profile_timezone: {
    required: true,
    validate: (v) => /^[A-Za-z]+\/[A-Za-z_]+$/.test(String(v).trim()),
    msg: "must be a valid timezone (e.g. Asia/Kolkata)",
  },
  is_active: { required: true, validate: isBool, msg: "must be TRUE or FALSE" },
  "allow_check_in/out_outside_the_range": {
    required: true,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
  outside_range_notes_required: {
    required: true,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
  "allow_web_check_in/out": {
    required: true,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
  "allow_web_check_in/out": {
    required: false,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
};

const REQUIRED_COLUMNS = Object.keys(FIELD_RULES).filter(
  (k) => FIELD_RULES[k].required,
);

const ImportForm = () => {
  const dispatch = useDispatch();
  const { form_obj, component_to_show } = useSelector(
    (state) => state.RightSideBarReducer,
  );

  const [activeArrowTab, setactiveArrowTab] = useState(4);
  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);

  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [columnCheck, setColumnCheck] = useState({
    checked: false,
    valid: false,
    missing: [],
    extra: [],
  });
  const [rowCount, setRowCount] = useState(0);
  const [rowIssues, setRowIssues] = useState([]);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {}, [form_obj]);

  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {
      const modifiedSteps = [...passedarrowSteps, tab];
      if (tab >= 4 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }

  const resetAll = () => {
    setFile(null);
    setRows([]);
    setColumnCheck({ checked: false, valid: false, missing: [], extra: [] });
    setRowCount(0);
    setRowIssues([]);
    setImportResult(null);
  };

  // ── File handling ─────────────────────────────────────────────
  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!/\.(xlsx|xls|csv)$/i.test(selectedFile.name)) {
      toast.error("Only .xlsx, .xls, or .csv files are supported");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setFile(selectedFile);
    setColumnCheck({ checked: false, valid: false, missing: [], extra: [] });
    setRowIssues([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // raw:true + cellDates:true => date cells come through as real
        // Date objects instead of the sheet's own display format
        // (raw:false + dateNF doesn't reliably override an existing
        // cell format, which is what caused "4/1/99" to slip through).
        const wb = XLSX.read(e.target.result, {
          type: "array",
          cellDates: true,
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          blankrows: false,
          raw: true,
        });

        if (parsed.length > 0) {
          const header = parsed[0].map((h) => String(h).trim());
          const dateCols = ["dob", "joining_date"]
            .map((k) => header.indexOf(k))
            .filter((i) => i > -1);

          for (let i = 1; i < parsed.length; i++) {
            dateCols.forEach((ci) => {
              parsed[i][ci] = toISODate(parsed[i][ci]);
            });
          }
        }

        setRows(parsed);
        const dataRows = parsed
          .slice(1)
          .filter((r) => r.some((c) => c != null && String(c).trim() !== ""));
        setRowCount(dataRows.length);
      } catch (err) {
        setRows([]);
        setRowCount(0);
        toast.error("Could not read the file");
      }
    };
    reader.onerror = () => toast.error("Could not read the file");
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleInputChange = (e) => processFile(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // ── Row-level validation (catch bad data before the API) ──────
  const validateRows = (header) => {
    const idx = {};
    header.forEach((h, i) => (idx[h] = i));

    const dataRows = rows
      .slice(1)
      .filter((r) => r.some((c) => c != null && String(c).trim() !== ""));

    const issues = [];
    const seenEmpId = new Set();
    const seenEmail = new Set();

    dataRows.forEach((r, i) => {
      const rowNo = i + 2; // +1 for 0-index, +1 for header row

      // Per-field required + format checks, driven by FIELD_RULES
      Object.entries(FIELD_RULES).forEach(([col, rule]) => {
        if (!(col in idx)) return; // column not in file (handled by column check)

        const raw = r[idx[col]];
        const empty = raw == null || String(raw).trim() === "";

        if (empty) {
          if (rule.required) {
            issues.push(`Row ${rowNo}: missing "${col}"`);
          }
          return; // don't format-check empty optional cells
        }

        if (rule.validate && !rule.validate(raw)) {
          issues.push(`Row ${rowNo}: "${col}" ${rule.msg} (got "${raw}")`);
        }
      });

      // Duplicate checks
      const empId = r[idx["emp_id"]];
      if (empId != null && String(empId).trim() !== "") {
        const key = String(empId).trim();
        if (seenEmpId.has(key))
          issues.push(`Row ${rowNo}: duplicate emp_id "${key}"`);
        seenEmpId.add(key);
      }

      const email = r[idx["email"]];
      if (email != null && String(email).trim() !== "") {
        const ekey = String(email).trim().toLowerCase();
        if (seenEmail.has(ekey))
          issues.push(`Row ${rowNo}: duplicate email "${email}"`);
        seenEmail.add(ekey);
      }
    });

    return { count: dataRows.length, issues };
  };

  // ── Validate + go to step 2 ───────────────────────────────────
  const validateAndNext = () => {
    if (component_to_show !== employee_component_name) {
      toggleArrowTab(activeArrowTab + 1);
      return;
    }

    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    const header = (rows[0] || []).map((h) => String(h).trim());
    if (header.length === 0) {
      toast.error("The uploaded file has no header row");
      return;
    }

    // 1) column structure check
    const expected = employeeCSVHeaders.map((h) => h.key);
    const missing = expected.filter((c) => !header.includes(c));
    const extra = header.filter((c) => !expected.includes(c));
    const colValid = missing.length === 0;
    setColumnCheck({ checked: true, valid: colValid, missing, extra });

    if (!colValid) {
      toast.error(
        `File columns don't match the template. Missing: ${missing.join(", ")}`,
      );
      return;
    }

    // 2) row data check
    const { count, issues } = validateRows(header);
    setRowCount(count);
    setRowIssues(issues);

    if (count === 0) {
      toast.error("No employee rows found in the file");
      return;
    }
    if (issues.length > 0) {
      toast.error(`Found ${issues.length} issue(s). Please fix the file.`);
      return; // block until clean
    }

    if (extra.length > 0) {
      toast.warn(`Extra columns will be ignored: ${extra.join(", ")}`);
    }

    toast.success(`${count} employee row(s) ready to import`);
    toggleArrowTab(activeArrowTab + 1);
  };

  // ── Bulk import ───────────────────────────────────────────────
  const handleBulkImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    if (component_to_show !== employee_component_name) {
      toast.error("Import is not supported for this module");
      return;
    }
    if (!columnCheck.valid || rowIssues.length > 0) {
      toast.error("Please fix the file before importing");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      dispatch(setLoaderVisible(true));
      const res = await Api.post("/employee/bulk-import-employees/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setLoaderVisible(false));

      // ✅ accept ANY 2xx (200 OR 201 Created), not just 200
      const ok = res?.status >= 200 && res?.status < 300;
      const message =
        res?.data?.message || res?.data?.detail || "Employees imported";

      if (ok) {
        toast.success(message);

        // Save the imported employee data returned by the API to localStorage
        SetLocalStorage("employee", res?.data?.data);

        setImportResult({ ok: true, message, data: res?.data });
        setTimeout(() => {
          resetAll();
          setactiveArrowTab(4);
          dispatch(toggleISBView(false));
        }, 1200);
      } else {
        toast.error(message || "Import failed");
        setImportResult({ ok: false, message });
      }
    } catch (error) {
      dispatch(setLoaderVisible(false));
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong during import";
      toast.error(message);
      setImportResult({ ok: false, message });
    }
  };

  document.title = "WorkSchedule | Lint HR";

  const previewHeaders = rows[0] || [];
  const previewBody = rows.slice(1, 6);

  const isReview = activeArrowTab === 5;
  const fileSize = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`
    : "";
  const columnsOk = columnCheck.checked && columnCheck.valid;
  const hasProblems = (columnCheck.checked && !columnCheck.valid) || rowIssues.length > 0;

  const removeFile = (e) => {
    e.stopPropagation();
    resetAll();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const steps = [
    { id: 4, label: "Upload", sub: "Select & validate file", icon: "ri-upload-cloud-2-line" },
    { id: 5, label: "Review & Import", sub: "Confirm and create", icon: "ri-shield-check-line" },
  ];

  return (
    <div className="imp">
      <div className="imp-steps">
        {steps.map((s, i) => {
          const state =
            activeArrowTab === s.id ? "is-active" : activeArrowTab > s.id ? "is-done" : "";
          return (
            <React.Fragment key={s.id}>
              {i > 0 && (
                <span className={`imp-step-line ${activeArrowTab > steps[i - 1].id ? "is-done" : ""}`} />
              )}
              <button
                data-testid={testId("import-step", itemTestKey(s), "button")}
                type="button"
                className={`imp-step ${state}`}
                disabled={s.id > activeArrowTab}
                onClick={() => toggleArrowTab(s.id)}
              >
                <span className="imp-step-num">
                  {state === "is-done" ? <i className="ri-check-line" /> : <i className={s.icon} />}
                </span>
                <span className="imp-step-text">
                  <small>Step {i + 1}</small>
                  <b>{s.label}</b>
                  <span>{s.sub}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {!isReview && (
        <div className="imp-pane" key="upload">
          {!file && (
            <div className="imp-guide">
              <div className="imp-guide-item">
                <span className="imp-guide-icon tone-primary">
                  <i className="ri-download-2-line" />
                </span>
                <div>
                  <b>Download template</b>
                  <span>Use the sample file format</span>
                </div>
              </div>
              <div className="imp-guide-item">
                <span className="imp-guide-icon tone-warning">
                  <i className="ri-edit-2-line" />
                </span>
                <div>
                  <b>Fill in employees</b>
                  <span>One employee per row</span>
                </div>
              </div>
              <div className="imp-guide-item">
                <span className="imp-guide-icon tone-success">
                  <i className="ri-upload-cloud-2-line" />
                </span>
                <div>
                  <b>Upload &amp; validate</b>
                  <span>We check every row for you</span>
                </div>
              </div>
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            className={`imp-drop ${dragOver ? "is-over" : ""} ${file ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="imp-file">
                <span className="imp-file-icon">
                  <i className="ri-file-excel-2-fill" />
                </span>
                <div className="imp-file-text">
                  <b title={file.name}>{file.name}</b>
                  <span>
                    {fileSize} · {rowCount} {rowCount === 1 ? "row" : "rows"} detected
                  </span>
                </div>
                <span className="imp-file-replace">
                  <i className="ri-refresh-line" />
                  Replace
                </span>
                <button
                  data-testid="import-remove-file-button"
                  type="button"
                  className="imp-file-remove"
                  onClick={removeFile}
                  title="Remove file"
                >
                  <i className="ri-delete-bin-6-line" />
                </button>
              </div>
            ) : (
              <>
                <span className="imp-drop-icon">
                  <span className="imp-drop-ring" />
                  <i className="ri-upload-cloud-2-line" />
                </span>
                <h5 className="imp-drop-title">
                  {dragOver ? "Release to upload" : "Drop your file here or "}
                  {!dragOver && <span>browse</span>}
                </h5>
                <p className="imp-drop-sub">Maximum file size 5 MB</p>
                <div className="imp-drop-formats">
                  <span>.XLSX</span>
                  <span>.XLS</span>
                  <span>.CSV</span>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              data-testid="import-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={handleInputChange}
            />
          </div>

          {previewHeaders.length > 0 && (
            <div className="imp-preview">
              <div className="imp-section-head">
                <span>
                  <i className="ri-eye-line" />
                  Preview
                </span>
                <small>
                  First {previewBody.length} of {rowCount} rows · {previewHeaders.length} columns
                </small>
              </div>
              <div className="imp-preview-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="imp-rownum">#</th>
                      {previewHeaders.map((h, i) => (
                        <th
                          key={i}
                          className={
                            columnCheck.checked && columnCheck.extra.includes(String(h).trim())
                              ? "is-extra"
                              : ""
                          }
                        >
                          {String(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewBody.map((r, ri) => (
                      <tr key={ri}>
                        <td className="imp-rownum">{ri + 2}</td>
                        {previewHeaders.map((_, ci) => (
                          <td key={ci}>{r[ci] != null ? String(r[ci]) : ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {columnCheck.checked && !columnCheck.valid && (
            <div className="imp-alert is-danger">
              <span className="imp-alert-icon">
                <i className="ri-close-circle-line" />
              </span>
              <div>
                <b>Columns don&apos;t match the sample template</b>
                {columnCheck.missing.length > 0 && (
                  <div className="imp-chips">
                    <small>Missing</small>
                    {columnCheck.missing.map((c) => (
                      <span key={c} className="imp-chip is-danger">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {columnCheck.extra.length > 0 && (
                  <div className="imp-chips">
                    <small>Unexpected</small>
                    {columnCheck.extra.map((c) => (
                      <span key={c} className="imp-chip is-warning">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {rowIssues.length > 0 && (
            <div className="imp-alert is-warning">
              <span className="imp-alert-icon">
                <i className="ri-error-warning-line" />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <b>
                  {rowIssues.length} data {rowIssues.length === 1 ? "issue" : "issues"} found — fix
                  and re-upload
                </b>
                <ul className="imp-issues">
                  {rowIssues.slice(0, MAX_ISSUES_SHOWN).map((msg, i) => {
                    const m = msg.match(/^Row (\d+):\s*(.*)$/);
                    return (
                      <li key={i}>
                        {m ? (
                          <>
                            <span className="imp-issue-row">Row {m[1]}</span>
                            {m[2]}
                          </>
                        ) : (
                          msg
                        )}
                      </li>
                    );
                  })}
                </ul>
                {rowIssues.length > MAX_ISSUES_SHOWN && (
                  <small className="imp-more">
                    …and {rowIssues.length - MAX_ISSUES_SHOWN} more
                  </small>
                )}
              </div>
            </div>
          )}

          <div className="imp-actions">
            <button
              data-testid="import-download-template-button"
              type="button"
              className="imp-btn is-ghost"
              onClick={() => ExportSampleData(component_to_show)}
            >
              <i className="ri-download-2-line" />
              Download Template
            </button>
            <button
              data-testid="import-next-button"
              type="button"
              className="imp-btn is-primary"
              onClick={validateAndNext}
              disabled={!file && component_to_show === employee_component_name}
            >
              {hasProblems ? "Re-validate" : "Validate & Continue"}
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        </div>
      )}

      {isReview && (
        <div className="imp-pane" key="review">
          <div className="imp-ready">
            <span className="imp-ready-badge">
              <i className={importResult && !importResult.ok ? "ri-close-line" : "ri-check-line"} />
            </span>
            <h5>
              {importResult?.ok
                ? "Import complete"
                : importResult
                  ? "Import failed"
                  : "Ready to import"}
            </h5>
            <p>
              {importResult
                ? importResult.message
                : `All rows passed validation. Click import to create ${rowCount} ${
                    rowCount === 1 ? "employee" : "employees"
                  }.`}
            </p>
          </div>

          <div className="imp-summary">
            <div className="imp-summary-item tone-primary">
              <i className="ri-file-excel-2-line" />
              <div>
                <small>File</small>
                <b title={file?.name}>{file?.name || "—"}</b>
              </div>
            </div>
            <div className="imp-summary-item tone-success">
              <i className="ri-team-line" />
              <div>
                <small>Employees</small>
                <b>{rowCount}</b>
              </div>
            </div>
            <div className="imp-summary-item tone-info">
              <i className="ri-table-2" />
              <div>
                <small>Columns</small>
                <b>
                  {columnsOk ? "Matched" : "—"}
                  {columnCheck.extra.length > 0 && ` · ${columnCheck.extra.length} ignored`}
                </b>
              </div>
            </div>
            <div className="imp-summary-item tone-warning">
              <i className="ri-shield-check-line" />
              <div>
                <small>Issues</small>
                <b>{rowIssues.length}</b>
              </div>
            </div>
          </div>

          <div className="imp-actions">
            <button
              data-testid="import-back-button"
              type="button"
              className="imp-btn is-ghost"
              onClick={() => toggleArrowTab(activeArrowTab - 1)}
            >
              <i className="ri-arrow-left-line" />
              Back
            </button>
            <button
              data-testid="import-submit-button"
              type="button"
              className="imp-btn is-primary"
              onClick={handleBulkImport}
              disabled={!!importResult?.ok}
            >
              <i className="ri-upload-cloud-2-line" />
              Import {rowCount > 0 ? `${rowCount} ` : ""}
              {rowCount === 1 ? "Employee" : "Employees"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportForm;
