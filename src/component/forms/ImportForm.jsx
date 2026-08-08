import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  Col,
  Form,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { Api } from "../../common/api/Api";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toast } from "react-toastify";
import { toggleISBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { ExportSampleData } from "../../common/js/ExportSampleData";
import { employee_component_name } from "../../common/constant/Constants";
import { employeeCSVHeaders } from "../../common/js/employeeSampleData";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

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
const isPhone = (v) => /^\d{7,15}$/.test(String(v).replace(/[\s-]/g, ""));
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
  emp_id: { required: true },
  first_name: { required: true },
  last_name: { required: true },
  email: {
    required: true,
    validate: isEmail,
    msg: "is not a valid email",
  },
  password: { required: false },
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
    required: false,
    validate: (v) => COUNTRY_CODE_RE.test(String(v).trim()),
    msg: "must look like +91",
  },
  contact_number: {
    required: false,
    validate: isPhone,
    msg: "must be a phone number (7–15 digits)",
  },
  gender: {
    required: false,
    validate: (v) => /^(male|female|other)$/i.test(String(v).trim()),
    msg: "must be Male, Female, or Other",
  },
  branch: { required: false },
  primary_department: { required: false },
  role: { required: false },
  work_schedule: { required: false },
  reporting_manager: {
    required: false,
    validate: (v) => {
      const s = String(v).trim();
      return isEmail(s) || isInt(s);
    },
    msg: "must be an email or a numeric id",
  },
  profile_timezone: { required: false },
  is_active: {
    required: false,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
  "allow_check_in/out_outside_the_range": {
    required: false,
    validate: isBool,
    msg: "must be TRUE or FALSE",
  },
  outside_range_notes_required: {
    required: false,
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

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form onSubmit={(e) => e.preventDefault()} className="form-steps">
            <div className="step-arrow-nav mb-4">
              <Nav
                className="nav-pills custom-nav nav-justified"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeArrowTab === 4,
                      done: activeArrowTab <= 6 && activeArrowTab > 3,
                    })}
                    onClick={() => toggleArrowTab(4)}
                  >
                    1) Upload
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeArrowTab === 5,
                      done: activeArrowTab <= 6 && activeArrowTab > 4,
                    })}
                    onClick={() => toggleArrowTab(5)}
                  >
                    2) Review &amp; Import
                  </NavLink>
                </NavItem>
              </Nav>
            </div>

            <TabContent activeTab={activeArrowTab}>
              {/* ── STEP 1: upload + preview ── */}
              <TabPane tabId={4}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? "#0ab39c" : "#ccc"}`,
                    borderRadius: 8,
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragOver ? "#f0fdfa" : "transparent",
                  }}
                >
                  <i
                    className="ri-upload-cloud-2-line"
                    style={{ fontSize: 48, color: "#0ab39c" }}
                  ></i>
                  <h5 className="mt-2">Drop or upload your file here</h5>
                  <p className="text-muted mb-0">
                    (.XLSX, .XLS, and .CSV formats supported; max file size 5MB)
                  </p>
                  {file?.name && (
                    <p className="text-success mt-2 mb-0">
                      <i className="ri-file-excel-2-line me-1"></i>
                      {file.name} — {rowCount} row(s)
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: "none" }}
                    onChange={handleInputChange}
                  />
                </div>

                {previewHeaders.length > 0 && (
                  <div
                    className="table-responsive mt-3"
                    style={{ maxHeight: 260, overflow: "auto" }}
                  >
                    <table className="table table-bordered table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          {previewHeaders.map((h, i) => (
                            <th key={i} className="text-nowrap">
                              {String(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewBody.map((r, ri) => (
                          <tr key={ri}>
                            {previewHeaders.map((_, ci) => (
                              <td key={ci} className="text-nowrap">
                                {r[ci] != null ? String(r[ci]) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {columnCheck.checked && !columnCheck.valid && (
                  <div className="alert alert-danger mt-3 mb-0">
                    <strong>Columns don't match the sample template.</strong>
                    {columnCheck.missing.length > 0 && (
                      <div>Missing: {columnCheck.missing.join(", ")}</div>
                    )}
                    {columnCheck.extra.length > 0 && (
                      <div>Unexpected: {columnCheck.extra.join(", ")}</div>
                    )}
                  </div>
                )}

                {rowIssues.length > 0 && (
                  <div className="alert alert-warning mt-3 mb-0">
                    <strong>
                      {rowIssues.length} data issue(s) — fix these and
                      re-upload:
                    </strong>
                    <ul className="mb-0 mt-1">
                      {rowIssues.slice(0, MAX_ISSUES_SHOWN).map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                    {rowIssues.length > MAX_ISSUES_SHOWN && (
                      <div className="mt-1">
                        …and {rowIssues.length - MAX_ISSUES_SHOWN} more.
                      </div>
                    )}
                  </div>
                )}

                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => ExportSampleData(component_to_show)}
                  >
                    <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                    Sample Export
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab"
                    onClick={validateAndNext}
                  >
                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                    NEXT STEP
                  </button>
                </div>
              </TabPane>

              {/* ── STEP 2: review + import ── */}
              <TabPane tabId={5}>
                <div className="alert alert-success mt-2">
                  <i className="ri-checkbox-circle-line align-bottom me-1"></i>
                  {rowCount} employee row(s) validated from
                  {file?.name ? ` "${file.name}"` : " your file"}. Click Import
                  to create them.
                </div>

                {importResult && (
                  <div
                    className={`alert ${
                      importResult.ok ? "alert-success" : "alert-danger"
                    }`}
                  >
                    {importResult.message}
                  </div>
                )}

                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-info btn-label previestab"
                    onClick={() => toggleArrowTab(activeArrowTab - 1)}
                  >
                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab"
                    onClick={handleBulkImport}
                  >
                    <i className="ri-check-line label-icon align-middle fs-16 ms-2"></i>
                    Import {rowCount > 0 ? `${rowCount} ` : ""}Employees
                  </button>
                </div>
              </TabPane>
            </TabContent>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ImportForm;
