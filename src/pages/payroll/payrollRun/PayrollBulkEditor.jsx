import React, { useEffect, useState, useCallback, useRef } from "react";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";
import {
  Card, CardHeader, CardBody, CardTitle,
  Button, Spinner, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import Swal from "sweetalert2";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import EmployeeRegularization from "./EmployeeRegularization";
import { useDispatch, useSelector } from "react-redux";
import { setSalaryStructures } from "../../../redux/reducers/ChildReducer/SalaryStructureReducer";
import FilterSelect from "../../../shared/ui/FilterSelect";
import "./adjustmentColumnModal.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS  = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);
const MONTHS = MONTH_NAMES.slice(1).map((name, i) => ({ label: name, value: i + 1 }));

// Shared control height so every filter / action element in the toolbar lines up
const CONTROL_HEIGHT = 42;

// ─── Column width tokens (used by <colgroup> to lock table-layout: fixed) ──────
const COL_W = {
  employee: 220,
  attendance: 95,
  lop: 95,
  earning: 130,
  addEarning: 130,
  deduction: 130,
  addDeduct: 130,
  statutoryPfEsi: 100,
  statutoryPt: 90,
  summary: 130,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const isDirty = (orig, val) => String(orig ?? "0") !== String(val ?? "0");

// ─── SweetAlert confirm helper for destructive actions ─────────────────────────

const confirmAction = ({ title, text, confirmText = "Yes, remove it", confirmColor = "var(--vz-danger)" }) =>
  Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    confirmButtonColor: confirmColor,
    reverseButtons: true,
  }).then((result) => result.isConfirmed);

// ─── Style tokens ─────────────────────────────────────────────────────────────

const cellSt = {
  padding: "4px 8px",
  fontSize: 12,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  borderRight: "1px solid var(--vz-border-color)",
  borderBottom: "1px solid var(--vz-border-color)",
};

// NOTE: whiteSpace changed from "nowrap" to "normal" (+ wordBreak) so that
// long header labels wrap within their fixed-width column instead of forcing
// the column wider than its <col> width — required for table-layout: fixed
// to keep every header/body cell in a column perfectly aligned.
const thSt = (extra = {}) => ({
  padding: "6px 8px",
  fontSize: 10.5,
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 2.25,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  verticalAlign: "middle",
  position: "sticky",
  top: 0,
  zIndex: 3,
  background: "var(--vz-tertiary-bg)",
  borderRight: "1px solid var(--vz-border-color)",
  borderBottom: "2px solid var(--vz-border-color)",
  ...extra,
});

const GROUP_COLORS = {
  employee:   { bg: "var(--vz-tertiary-bg)", text: "var(--vz-body-color)", border: "var(--vz-border-color)" },
  attendance: { bg: "rgba(var(--vz-warning-rgb), .1)", text: "var(--vz-warning)", border: "rgba(var(--vz-warning-rgb), .45)" },
  lop:        { bg: "rgba(var(--vz-danger-rgb), .08)", text: "var(--vz-danger)", border: "rgba(var(--vz-danger-rgb), .4)" },
  earning:    { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .4)" },
  addEarning: { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .4)" },
  deduction:  { bg: "rgba(var(--vz-danger-rgb), .08)", text: "var(--vz-danger)", border: "rgba(var(--vz-danger-rgb), .4)" },
  addDeduct:  { bg: "rgba(var(--vz-danger-rgb), .08)", text: "var(--vz-danger)", border: "rgba(var(--vz-danger-rgb), .6)" },
  statutory:  { bg: "rgba(var(--vz-primary-rgb), .08)", text: "var(--vz-primary)", border: "rgba(var(--vz-primary-rgb), .4)" },
  gross:      { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .4)" },
  totalDed:   { bg: "rgba(var(--vz-danger-rgb), .08)", text: "var(--vz-danger)", border: "rgba(var(--vz-danger-rgb), .4)" },
  netpay:     { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .55)" },
};

// ─── Editable cell ────────────────────────────────────────────────────────────

const EditCell = ({ value, origValue, onChange, readOnly = false, danger = false, testId: cellTestId }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState("");
  const ref = useRef(null);
  const dirty = !readOnly && isDirty(origValue, value);

  const open = () => {
    if (readOnly) return;
    setLocal(String(safeNum(value)));
    setEditing(true);
    setTimeout(() => ref.current?.select(), 0);
  };

  const commit = () => {
    let n = parseFloat(local);
    if (isNaN(n) || n < 0) n = safeNum(origValue);
    onChange(n);
    setEditing(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter")  commit();
    if (e.key === "Escape") setEditing(false);
  };

  const bg = readOnly
    ? "transparent"
    : dirty
    ? "rgba(var(--vz-warning-rgb), .1)"
    : editing
    ? "rgba(var(--vz-primary-rgb), .07)"
    : "transparent";

  return (
    <td
      onClick={open}
      data-testid={testId(cellTestId, "cell")}
      style={{
        ...cellSt,
        background: bg,
        cursor: readOnly ? "default" : "text",
        textAlign: "right",
      }}
    >
      {editing ? (
        <input
          data-testid={testId(cellTestId, "input")}
          ref={ref}
          type="number"
          min="0"
          step="0.01"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          style={{
            width: "100%", border: "none", outline: "none",
            background: "transparent", fontSize: 12,
            textAlign: "right", padding: 0,
          }}
        />
      ) : (
        <span style={{ color: danger ? "var(--vz-danger)" : "inherit", fontSize: 12 }}>
          {fmt(value)}
          {dirty && (
            <span style={{
              display: "inline-block", width: 5, height: 5, borderRadius: "50%",
              background: "var(--vz-warning)", marginLeft: 4, verticalAlign: "middle",
            }} />
          )}
        </span>
      )}
    </td>
  );
};

// ─── Group header cell ────────────────────────────────────────────────────────

const GroupTh = ({ label, span, colorKey, borderLeft = false }) => {
  const c = GROUP_COLORS[colorKey];
  return (
    <th
      colSpan={span}
      style={{
        ...thSt({
          background: c.bg,
          color: c.text,
          textAlign: "center",
          borderLeft: borderLeft ? `3px solid ${c.border}` : `1px solid ${c.border}`,
          borderTop: `2px solid ${c.border}`,
          zIndex: 3,
          top: 0,
        }),
      }}
    >
      {label}
    </th>
  );
};

// ─── Sub header cell ──────────────────────────────────────────────────────────

const SubTh = ({ label, colorKey, borderLeft = false, right = true }) => {
  const c = GROUP_COLORS[colorKey];
  return (
    <th
      style={{
        ...thSt({
          background: c.bg,
          color: c.text,
          top: 36,
          textAlign: right ? "right" : "left",
          borderLeft: borderLeft ? `2px solid ${c.border}` : undefined,
        }),
      }}
    >
      {label}
    </th>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const PayrollBulkEditor = () => {
  const dispatch = useDispatch();
  // ── Filters
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year,  setYear]  = useState(CURRENT_YEAR);
  const [selectedStructId, setSelectedStructId] = useState("all");

  // ── Data
  const structures = useSelector((state) => state.SalaryStructureReducer.salary_structures) || [];
  const [payrollRun,   setPayrollRun]   = useState(null);
  const [rows,         setRows]         = useState([]);   // payslip rows for selected structure
  const [structCols,   setStructCols]   = useState([]);   // [{id,name,type}] from selected structure
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);

  // ── Per-cell edits  { empId: { name_{compName}: val, adj_{key}: val } } — LOP is edited via Regularization modal, not tracked here
  const [edits,     setEdits]     = useState({});
  const [origEdits, setOrigEdits] = useState({});

  // ── Master payroll component list (id -> {name, type}) — needed because
  // SalaryStructureComponentSerializer only returns the payroll_component id,
  // not its name/type.
  const [componentLookup, setComponentLookup] = useState({});
  // { key: string, label: string, type: "earning"|"deduction", reason: string }
  const [adjCols,    setAdjCols]    = useState([]);
  const [adjForm, setAdjForm] = useState({ label: "", type: "earning", reason: "", defaultAmount: "", applyTo: "all" });
  const [adjModalOpen, setAdjModalOpen] = useState(false);

  // ── Existing payslip adjustments fetched from API (to pre-fill cells)
  const [existingAdjs, setExistingAdjs] = useState({}); // { empId: [{id, label, adjustment_type, amount}] }

  // ── Regularization modal — { employeeId, employeeName } | null
  const [regModal, setRegModal] = useState(null);
  

  // ─── Load salary structures + master component list once ───────────────────
  useEffect(() => {
    Api({ method: "GET", url: "payroll/component/" })
      .then((r) => {
        const lookup = {};
        (r?.data?.data || []).forEach((pc) => {
          lookup[pc.id] = { name: pc.name, type: pc.component_type };
        });
        setComponentLookup(lookup);
      })
      .catch(() => {});

    Api({ method: "GET", url: "payroll/salary-structure/" })
      .then((r) => {
        const data = r?.data?.data || r?.data || [];
        if (Array.isArray(data)) dispatch(setSalaryStructures(data));
      })
      .catch(() => {});
  }, [dispatch]);

  // ─── Derive component columns from selected structure ────────────────────────
  useEffect(() => {
    if (!selectedStructId || selectedStructId === "all") {
      setStructCols([]);
      return;
    }
    const struct = structures.find((s) => String(s.id) === String(selectedStructId));
    if (!struct) { setStructCols([]); return; }

    // Resolve name/type from the master component lookup (always reliable),
    // falling back to whatever the structure serializer provided directly.
    const components = (struct.salary_structure_components || []).map((ssc) => {
      const looked = componentLookup[ssc.payroll_component] || {};
      return {
        id:   ssc.payroll_component,
        name: looked.name || ssc.payroll_component_name || ssc.component_name || `Component #${ssc.payroll_component}`,
        type: looked.type || ssc.component_type || "allowance",
      };
    });
    setStructCols(components);
  }, [selectedStructId, structures, componentLookup]);

  // ─── Load payroll run + payslips + existing adjustments ─────────────────────
  const load = useCallback(() => {
    if (!selectedStructId || selectedStructId === "all") return;
    setLoading(true);
    setRows([]);
    setEdits({});
    setOrigEdits({});
    setExistingAdjs({});

    Api({ method: "GET", url: "payroll/payroll-run/" })
      .then((r) => {
        const run = (r?.data?.data || []).find(
          (x) => x.month === month && x.year === year
        );
        setPayrollRun(run || null);
        if (run) return fetchPayslips(run.id);
        return fetchSalaries();
      })
      .catch(() => { setLoading(false); toast.error("Failed to load."); });
  }, [month, year, selectedStructId]);

  useEffect(() => { load(); }, [load]);

  // ── Fullscreen UX: Escape to exit, lock page scroll while active ───────────
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === "Escape") setFullscreen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  const fetchPayslips = (runId) =>
    Api({ method: "GET", url: `payroll/employee-payslip/?payroll_run=${runId}` })
      .then((r) => {
        const data = (r?.data?.data || []).filter(
          (p) => String(p.salary_structure) === String(selectedStructId)
        );
        buildEdits(data, true);
        fetchAdjustments(data.map((p) => p.employee));
      })
      .catch(() => toast.error("Failed to load payslips."))
      .finally(() => setLoading(false));

  const fetchSalaries = () =>
    Api({ method: "GET", url: "payroll/employee-salary/" })
      .then((r) => {
        const data = (r?.data?.data || []).filter(
          (s) => String(s.salary_structure_id) === String(selectedStructId)
        );
        buildEdits(data, false);
        fetchAdjustments(data.map((s) => s.id));
      })
      .catch(() => toast.error("Failed to load salaries."))
      .finally(() => setLoading(false));

  const fetchAdjustments = (empIds) => {
    if (!empIds.length) return;
    const map = {};
    const promises = empIds.map((eid) =>
      Api({
        method: "GET",
        url: `payroll/payslip-adjustment/?employee_id=${eid}&month=${month}&year=${year}`,
      })
        .then((r) => { map[eid] = r?.data?.data || []; })
        .catch(() => { map[eid] = []; })
    );
    Promise.all(promises).then(() => {
      setExistingAdjs(map);

      // Merge existing adjustments into edits & inject adjCols for ones not yet present
      setEdits((prev) => {
        const next = { ...prev };
        const newCols = [];

        Object.entries(map).forEach(([eid, adjs]) => {
          if (!next[eid]) next[eid] = {};
          adjs.forEach((a) => {
            const key = `adj_${a.label}_${a.adjustment_type}`;
            next[eid][key] = safeNum(a.amount);

            // Register column if not already present
            const alreadyCol = adjCols.some((c) => c.key === key);
            const alreadyNew = newCols.some((c) => c.key === key);
            if (!alreadyCol && !alreadyNew) {
              newCols.push({ key, label: a.label, type: a.adjustment_type, reason: "" });
            }
          });
        });

        if (newCols.length) {
          setAdjCols((prev) => {
            const keys = new Set(prev.map((c) => c.key));
            return [...prev, ...newCols.filter((c) => !keys.has(c.key))];
          });
        }
        return next;
      });

      setOrigEdits((prev) => {
        const next = { ...prev };
        Object.entries(map).forEach(([eid, adjs]) => {
          if (!next[eid]) next[eid] = {};
          adjs.forEach((a) => {
            const key = `adj_${a.label}_${a.adjustment_type}`;
            next[eid][key] = safeNum(a.amount);
          });
        });
        return next;
      });
    });
  };

  const buildEdits = (data, isPayslip) => {
    const newEdits = {};
    const newOrig  = {};

    data.forEach((item) => {
      const empId = isPayslip ? item.employee : item.id;
      const compMap = {};

      if (isPayslip) {
        [...(item.earnings || []), ...(item.deductions || [])].forEach((c) => {
          if (!c.component_name) return;
          // Payslip component rows don't expose payroll_component id (only
          // component_name/component_type), so key by name — matched against
          // the structure's component names when rendering columns below.
          compMap[`name_${c.component_name}`] = safeNum(c.final_amount ?? c.effective_amount);
        });
      } else {
        (item.salary_components || []).forEach((c) => {
          if (c.payroll_component)
            compMap[`comp_${c.payroll_component}`] = safeNum(c.effective_amount ?? c.calculated_amount);
          if (c.component_name)
            compMap[`name_${c.component_name}`] = safeNum(c.effective_amount ?? c.calculated_amount);
        });
      }

      newEdits[empId] = { ...compMap };
      newOrig[empId]  = { ...compMap };
    });

    setRows(data.map((item) => ({ ...item, _isPayslip: isPayslip })));
    setEdits(newEdits);
    setOrigEdits(newOrig);
  };

  // ─── Cell helpers ────────────────────────────────────────────────────────────
  const setCell = (empId, key, val) =>
    setEdits((prev) => ({
      ...prev,
      [empId]: { ...(prev[empId] || {}), [key]: val },
    }));

  // ─── Add adjustment column ────────────────────────────────────────────────
  const handleAddAdjCol = () => {
    const label = adjForm.label.trim();
    if (!label) { toast.warning("Enter a label."); return; }
    const key = `adj_${label}_${adjForm.type}`;
    if (adjCols.find((c) => c.key === key)) {
      toast.warning("An adjustment with this label and type already exists.");
      return;
    }
    const defaultAmt = safeNum(adjForm.defaultAmount);
    const applyToAll = adjForm.applyTo === "all";
    const selectedIds = adjForm.selectedStructures || [];

    setAdjCols((prev) => [...prev, {
      key, label, type: adjForm.type, reason: adjForm.reason,
      defaultAmount: safeNum(adjForm.defaultAmount),
      structureIds: adjForm.applyTo === "all" ? null : adjForm.selectedStructures,
    }]);

    setEdits((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        const eid = row._isPayslip ? row.employee : row.id;
        const rowStructId = row._isPayslip ? row.salary_structure : row.salary_structure_id;
        const applies = applyToAll || selectedIds.includes(String(rowStructId));
        next[eid] = { ...next[eid], [key]: applies ? defaultAmt : 0 };
      });
      return next;
    });

    setOrigEdits((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        const eid = row._isPayslip ? row.employee : row.id;
        next[eid] = { ...next[eid], [key]: 0 };
      });
      return next;
    });

    setAdjForm({ label: "", type: "earning", reason: "", defaultAmount: "", applyTo: "all", selectedStructures: [] });
    toast.success(`Column "${label}" added to the sheet.`);
  };

  // Wraps handleAddAdjCol for the modal's primary button: validates first so
  // the modal only closes on a successful add (duplicate labels stay open
  // with the warning toast still visible).
  const handleAddAdjColAndClose = () => {
    const label = adjForm.label.trim();
    if (!label) { toast.warning("Enter a label."); return; }
    const key = `adj_${label}_${adjForm.type}`;
    if (adjCols.find((c) => c.key === key)) {
      toast.warning("An adjustment with this label and type already exists.");
      return;
    }
    handleAddAdjCol();
    setAdjModalOpen(false);
  };

  const removeAdjCol = async (col) => {
    // Delete any already-saved adjustment rows for this label/type across all employees
    const deletePromises = Object.entries(existingAdjs).flatMap(([eid, adjs]) => {
      const match = adjs.find((a) => a.label === col.label && a.adjustment_type === col.type);
      if (!match) return [];
      return [
        Api({
          method: "DELETE",
          url: "payroll/payslip-adjustment/",
          data: { id: match.id },
        }).catch(() => {
          toast.error(`Failed to delete "${col.label}" for employee ${eid}`);
        }),
      ];
    });

    await Promise.all(deletePromises);

    setAdjCols((prev) => prev.filter((c) => c.key !== col.key));
    setEdits((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => { delete next[eid][col.key]; });
      return next;
    });
    setOrigEdits((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => { delete next[eid][col.key]; });
      return next;
    });
    setExistingAdjs((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => {
        next[eid] = next[eid].filter((a) => !(a.label === col.label && a.adjustment_type === col.type));
      });
      return next;
    });
  };

  // Asks for confirmation (SweetAlert) before removing an adjustment column
  const handleRemoveAdjCol = (col) => {
    confirmAction({
      title: "Remove this column?",
      text: `"${col.label}" will be permanently deleted for every employee who has it saved.`,
      confirmText: "Yes, remove",
    }).then((confirmed) => {
      if (confirmed) removeAdjCol(col);
    });
  };
  // ─── Dirty detection ─────────────────────────────────────────────────────────
  const dirtyEmpIds = Object.keys(edits).filter((eid) => {
    const e = edits[eid] || {};
    const o = origEdits[eid] || {};
    return Object.keys(e).some((k) => isDirty(o[k], e[k]));
  });

  // ─── Bulk save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dirtyEmpIds.length) { toast.info("Nothing to save."); return; }
    setSaving(true);
    let ok = 0, fail = 0;

    try {
      for (const eid of dirtyEmpIds) {
        const e = edits[eid]     || {};
        const o = origEdits[eid] || {};

        // Component overrides
        for (const [k, val] of Object.entries(e)) {
          if (!k.startsWith("name_") || !isDirty(o[k], val)) continue;
          const compName = k.replace("name_", "");
          const matchedCol = structCols.find((c) => c.name === compName);
          if (!matchedCol || !matchedCol.id) {
            console.warn(`No payroll_component id found for "${compName}" — skipping save for this cell.`);
            continue;
          }
          const pcId = matchedCol.id;
          try {
            await Api({
              method: "POST",
              url: "payroll/payslip-component-override-monthly/",
              data: { employee_id: eid, month, year, payroll_component: pcId, override_amount: val, reason: "Bulk edit" },
            });
            ok++;
          } catch { fail++; }
        }

        // Adjustment columns
        for (const col of adjCols) {
          const val = e[col.key];
          if (!isDirty(o[col.key], val)) continue;
          const empAdjs  = existingAdjs[eid] || [];
          const existing = empAdjs.find(
            (a) => a.label === col.label && a.adjustment_type === col.type
          );
          try {
            if (existing) {
              await Api({
                method: "PUT",
                url: "payroll/payslip-adjustment/",
                data: { id: existing.id, label: col.label, adjustment_type: col.type, amount: val, reason: col.reason },
              });
            } else {
              await Api({
                method: "POST",
                url: "payroll/payslip-adjustment/",
                data: { employee: eid, month, year, label: col.label, adjustment_type: col.type, amount: val, reason: col.reason },
              });
            }
            ok++;
          } catch { fail++; }
        }

        // (LOP is no longer part of bulk save — it's edited via the
        // Regularization modal, which saves itself immediately per change.)
      }
    } catch (err) {
      fail++;
      console.error("Bulk save error:", err);
    } finally {
      setSaving(false);
    }

    if (fail > 0) toast.error(`Failed with ${fail} error(s). Refreshing...`);
    else toast.success(`Saved ${dirtyEmpIds.length} employee(s). Refreshing...`);
    setTimeout(() => load(), 600);
  };

  // ─── Derived column sets ──────────────────────────────────────────────────────
  const earnCols    = structCols.filter((c) => c.type === "allowance");
  const dedCols     = structCols.filter((c) => c.type === "deduction");
  const addEarnCols = adjCols.filter((c) => c.type === "earning");
  const addDedCols  = adjCols.filter((c) => c.type === "deduction");

  // ─── Totals ───────────────────────────────────────────────────────────────────
  const totals = rows.reduce((acc, row) => {
    const eid = row._isPayslip ? row.employee : row.id;
    const e   = edits[eid] || {};
    structCols.forEach((col) => { acc[`name_${col.name}`] = (acc[`name_${col.name}`] || 0) + safeNum(e[`name_${col.name}`]); });
    adjCols.forEach((col)    => { acc[col.key]          = (acc[col.key]          || 0) + safeNum(e[col.key]); });
    acc.lop_days     = (acc.lop_days     || 0) + safeNum(row._isPayslip ? row.lop_days : 0);
    acc.gross        = (acc.gross        || 0) + safeNum(row._isPayslip ? row.gross_earnings    : 0);
    acc.total_deduct = (acc.total_deduct || 0) + safeNum(row._isPayslip ? row.total_deductions  : 0);
    acc.net_pay      = (acc.net_pay      || 0) + safeNum(row._isPayslip ? row.net_pay           : 0);
    acc.pf_emp       = (acc.pf_emp       || 0) + safeNum(row._isPayslip ? row.pf_employee       : 0);
    acc.esi_emp      = (acc.esi_emp      || 0) + safeNum(row._isPayslip ? row.esi_employee      : 0);
    acc.pt           = (acc.pt           || 0) + safeNum(row._isPayslip ? row.pt_amount         : 0);
    return acc;
  }, {});

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={
        fullscreen
          ? {
              position: "fixed", inset: 0, zIndex: 1050,
              background: "var(--vz-secondary-bg)", padding: "16px 20px",
              overflowY: "auto",
            }
          : undefined
      }
    >
      {fullscreen && (
        <div
          className="d-flex align-items-center justify-content-between mb-2 pb-2"
          style={{ borderBottom: "1px solid var(--vz-border-color)" }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--vz-body-color)" }}>
            <i className="ri-fullscreen-line me-2"></i>Full Screen Edit Mode
          </span>
          <Button data-testid="payroll-bulk-edit-exit-full-screen-esc-button" color="light" size="sm" className="border" onClick={() => setFullscreen(false)}>
            <i className="ri-fullscreen-exit-line me-1"></i>Exit Full Screen (Esc)
          </Button>
        </div>
      )}
      {/* ── Toolbar ──
          Every filter / action control shares CONTROL_HEIGHT and sits on the
          same flex row with align-items-stretch so the left (filters) and
          right (status + actions) groups line up perfectly regardless of
          which element (select vs button vs badge) it is. */}
      <Card className="shadow-none border mb-3">
        <CardBody className="py-3 px-3">
          <div className="d-flex flex-wrap align-items-stretch gap-2" style={{ minHeight: CONTROL_HEIGHT }}>
            <FilterSelect
              icon="ri-calendar-line"
              caption="Month"
              value={month}
              onChange={(v) => setMonth(Number(v))}
              options={MONTHS}
              columns={3}
              markValue={year === CURRENT_YEAR ? CURRENT_MONTH : null}
              style={{ minWidth: 170, height: CONTROL_HEIGHT }}
            />
            <FilterSelect
              icon="ri-calendar-2-line"
              caption="Year"
              value={year}
              onChange={(v) => setYear(Number(v))}
              options={YEARS.map((y) => ({ value: y, label: String(y) }))}
              columns={YEARS.length > 3 ? 3 : YEARS.length}
              markValue={CURRENT_YEAR}
              style={{ minWidth: 130, height: CONTROL_HEIGHT }}
            />
            <FilterSelect
              icon="ri-stack-line"
              caption="Salary structure"
              value={selectedStructId}
              onChange={(v) => setSelectedStructId(String(v))}
              options={[
                { value: "all", label: "All structures", icon: "ri-apps-2-line" },
                ...structures.map((s) => ({ value: String(s.id), label: s.name, icon: "ri-file-list-3-line" })),
              ]}
              searchable={structures.length > 6}
              placeholder="Select salary structure"
              style={{ minWidth: 240, flex: "1 1 240px", maxWidth: 320, height: CONTROL_HEIGHT }}
            />

            <div className="ms-auto d-flex align-items-stretch gap-3" style={{ height: CONTROL_HEIGHT }}>
              {payrollRun ? (
                <Badge
                  color={payrollRun.status === "paid" ? "success" : payrollRun.status === "approved" ? "info" : "warning"}
                  className="fs-12 px-2 d-flex align-items-center"
                  style={{ height: CONTROL_HEIGHT }}
                >
                  Payroll Run: {payrollRun.status}
                </Badge>
              ) : (
                <Badge color="secondary" className="fs-12 px-2 d-flex align-items-center" style={{ height: CONTROL_HEIGHT }}>
                  No payroll run yet
                </Badge>
              )}
              {dirtyEmpIds.length > 0 && (
                <span className="d-flex align-items-center" style={{ fontSize: 12, color: "var(--vz-warning)", fontWeight: 700, height: CONTROL_HEIGHT }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--vz-warning)", marginRight: 5 }} />
                  {dirtyEmpIds.length} unsaved
                </span>
              )}
              <Button
                data-testid="payroll-bulk-edit-save-button"
                color="success" onClick={handleSave} disabled={saving || !dirtyEmpIds.length}
                style={{ minWidth: 140, height: CONTROL_HEIGHT, fontSize: 13.5 }}
              >
                {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : <><i className="ri-save-line me-1"></i>Save All Changes</>}
              </Button>
              <Button
                data-testid="payroll-bulk-edit-refresh-button"
                color="light" className="border" onClick={load} disabled={loading} title="Refresh"
                style={{ height: CONTROL_HEIGHT, width: CONTROL_HEIGHT, padding: 0 }}
              >
                <i className="ri-refresh-line"></i>
              </Button>
              <Button
                data-testid="payroll-bulk-edit-fullscreen-button"
                color="light" className="border"
                onClick={() => setFullscreen((f) => !f)}
                title={fullscreen ? "Exit full screen" : "Full screen view"}
                style={{ height: CONTROL_HEIGHT, width: CONTROL_HEIGHT, padding: 0 }}
              >
                <i className={fullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Adjustment columns bar — compact strip showing active columns as
          chips (removable inline) plus a button that opens the add-adjustment
          modal. Replaces the old always-expandable panel so the grid below
          doesn't get pushed down while the form is in use. ── */}
      <Card className="shadow-none border mb-3" style={{ borderLeft: "3px solid var(--vz-primary)" }}>
        <CardBody
          className="d-flex align-items-center justify-content-between flex-wrap gap-3"
          style={{ padding: "12px 18px" }}
        >
          <div className="d-flex align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--vz-primary)", lineHeight: 1.2 }}>Adjustment Columns</div>
                <div style={{ fontSize: 10.5, color: "rgba(var(--vz-primary-rgb), .6)" }}>One-off earnings / deductions for this run</div>
              </div>
            </div>

            {adjCols.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {adjCols.map((col) => {
                  const isEarn = col.type === "earning";
                  const palette = isEarn ? GROUP_COLORS.earning : GROUP_COLORS.deduction;
                  return (
                    <div key={col.key} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "4px 6px 4px 10px", borderRadius: 8,
                      background: "var(--vz-secondary-bg)",
                      border: `1px solid ${palette.border}`,
                    }}>
                      <i className={`ri-arrow-${isEarn ? "up" : "down"}-line`} style={{ fontSize: 11, color: palette.text }}></i>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--vz-body-color)" }}>{col.label}</span>
                      <button
                        data-testid={testId("payroll-bulk-edit-chip", itemTestKey(col), "remove-button")}
                        onClick={() => handleRemoveAdjCol(col)}
                        style={{
                          background: "var(--vz-tertiary-bg)", border: "1px solid var(--vz-border-color)", borderRadius: 5,
                          cursor: "pointer", width: 17, height: 17, display: "flex",
                          alignItems: "center", justifyContent: "center", color: "var(--vz-secondary-color)",
                          fontSize: 11, lineHeight: 1, flexShrink: 0,
                        }}
                        title="Remove column"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            data-testid="payroll-bulk-edit-add-adjustment-button"
            color="primary" size="sm"
            onClick={() => setAdjModalOpen(true)}
            style={{ borderRadius: 7, fontWeight: 600, padding: "7px 16px", boxShadow: "0 2px 6px rgba(99,102,241,0.25)", flexShrink: 0 }}
          >
            <i className="ri-add-line me-1"></i>Add Adjustment
          </Button>
        </CardBody>
      </Card>

      {/* ── Add Adjustment modal ── */}
      <Modal data-testid="payroll-bulk-edit-add-adjustment-column-dialog" isOpen={adjModalOpen} toggle={() => setAdjModalOpen(false)} centered size="lg" className="adm-modal" contentClassName="adm-content">
        <div className={`adm-hero is-${adjForm.type}`}>
          <span className="adm-hero-icon"><i className="ri-layout-column-line"></i></span>
          <div className="adm-hero-text">
            <h5>Add Adjustment Column</h5>
            <p>
              Adds an <b className="t-earning">Earnings</b> or <b className="t-deduction">Deductions</b> column for every employee in the grid. Only non-zero cells are saved.
            </p>
          </div>
          <button data-testid="payroll-bulk-edit-add-adjustment-column-close-button" type="button" className="adm-close" onClick={() => setAdjModalOpen(false)} aria-label="Close">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="adm-body">
          <div className="adm-field">
            <label className="adm-label">Column type</label>
            <div className="adm-types" role="radiogroup">
              {[
                { value: "earning", icon: "ri-arrow-up-circle-line", title: "Earning", sub: "Adds to gross pay" },
                { value: "deduction", icon: "ri-arrow-down-circle-line", title: "Deduction", sub: "Reduces net pay" },
              ].map((t) => (
                <button
                  data-testid={testId("payroll-bulk-edit-add-adjustment-column-confirm", itemTestKey(t), "button")}
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={adjForm.type === t.value}
                  className={`adm-type is-${t.value} ${adjForm.type === t.value ? "is-active" : ""}`}
                  onClick={() => setAdjForm({ ...adjForm, type: t.value })}
                >
                  <span className="adm-type-icon"><i className={t.icon}></i></span>
                  <span className="adm-type-text">
                    <b>{t.title}</b>
                    <small>{t.sub}</small>
                  </span>
                  <i className="ri-checkbox-circle-fill adm-type-check"></i>
                </button>
              ))}
            </div>
          </div>

          <div className="adm-grid">
            <div className="adm-field">
              <label className="adm-label" htmlFor="adm-label-input">Column label <span className="adm-req">*</span></label>
              <div className="adm-input">
                <i className="ri-text"></i>
                <input
                  data-testid="payroll-bulk-edit-add-adjustment-column-label-input"
                  id="adm-label-input"
                  value={adjForm.label}
                  onChange={(e) => setAdjForm({ ...adjForm, label: e.target.value })}
                  placeholder="e.g. Festival Bonus"
                  maxLength={40}
                  autoFocus
                />
              </div>
            </div>
            <div className="adm-field">
              <label className="adm-label" htmlFor="adm-amount-input">Default amount</label>
              <div className="adm-input">
                <span className="adm-prefix">₹</span>
                <input
                  data-testid="payroll-bulk-edit-add-adjustment-column-amount-input"
                  id="adm-amount-input"
                  type="number"
                  min="0"
                  value={adjForm.defaultAmount}
                  onChange={(e) => setAdjForm({ ...adjForm, defaultAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="adm-field">
            <div className="adm-label-row">
              <label className="adm-label">Apply to</label>
              <div className="adm-seg">
                {[
                  { value: "all", icon: "ri-apps-2-line", label: "All structures" },
                  { value: "specific", icon: "ri-filter-3-line", label: "Specific" },
                ].map((o) => (
                  <button
                    data-testid={testId("payroll-bulk-edit-add-adjustment-column", itemTestKey(o), "button")}
                    key={o.value}
                    type="button"
                    className={adjForm.applyTo === o.value ? "is-active" : ""}
                    onClick={() => setAdjForm({ ...adjForm, applyTo: o.value, selectedStructures: [] })}
                  >
                    <i className={o.icon}></i>{o.label}
                  </button>
                ))}
              </div>
            </div>
            {adjForm.applyTo === "specific" && (
              <div className="adm-structs">
                {structures.length === 0 && <span className="adm-empty">No salary structures found</span>}
                {structures.map((s) => {
                  const id = String(s.id);
                  const on = (adjForm.selectedStructures || []).includes(id);
                  return (
                    <button
                      data-testid={testId("payroll-bulk-edit-add-adjustment-column-confirm", itemTestKey(s), "button")}
                      key={s.id}
                      type="button"
                      className={`adm-struct ${on ? "is-active" : ""}`}
                      onClick={() => setAdjForm({
                        ...adjForm,
                        selectedStructures: on
                          ? adjForm.selectedStructures.filter((x) => x !== id)
                          : [...(adjForm.selectedStructures || []), id],
                      })}
                    >
                      <i className={on ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"}></i>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-reason-input">Reason <em>optional</em></label>
            <div className="adm-input">
              <i className="ri-history-line"></i>
              <input
                data-testid="payroll-bulk-edit-add-adjustment-column-reason-input"
                id="adm-reason-input"
                value={adjForm.reason}
                onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                placeholder="Shown on the audit trail"
              />
            </div>
          </div>

          <div className={`adm-preview is-${adjForm.type}`}>
            <span className="adm-preview-tag">Preview</span>
            <div className="adm-preview-col">
              <span className="adm-preview-head">
                <i className={adjForm.type === "earning" ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                {adjForm.label.trim() || "Column label"}
              </span>
              <span className="adm-preview-cell">
                {adjForm.type === "deduction" ? "− " : "+ "}₹{Number(adjForm.defaultAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="adm-preview-meta">
              {adjForm.applyTo === "all"
                ? "Applies to all salary structures"
                : `Applies to ${(adjForm.selectedStructures || []).length} selected structure${(adjForm.selectedStructures || []).length === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        <div className="adm-footer">
          <button data-testid="payroll-bulk-edit-add-adjustment-column-cancel-button" type="button" className="it-btn is-soft" onClick={() => setAdjModalOpen(false)}>Cancel</button>
          <button
            data-testid="payroll-bulk-edit-add-adjustment-column-add-column-button"
            type="button"
            className="it-btn is-primary"
            onClick={handleAddAdjColAndClose}
            disabled={!adjForm.label.trim() || (adjForm.applyTo === "specific" && !(adjForm.selectedStructures || []).length)}
          >
            <i className="ri-add-line"></i>Add Column
          </button>
        </div>
      </Modal>

      {/* ── Grid ── */}
      <Card className="shadow-none border">
        <CardHeader className="surface-muted py-2 px-3 d-flex align-items-center justify-content-between">
          <CardTitle tag="h6" className="mb-0" style={{ fontSize: 14 }}>
            {MONTH_NAMES[month]} {year} — Payroll Edit Sheet
            {selectedStructId !== "all" && (
              <Badge color="secondary" className="ms-2 fs-11">
                {structures.find((s) => String(s.id) === String(selectedStructId))?.name}
              </Badge>
            )}
          </CardTitle>
          <span className="text-muted" style={{ fontSize: 12 }}>{rows.length} employee{rows.length !== 1 ? "s" : ""}</span>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="p-3">
              <TableSkeletonBlock rows={8} cols={7} testId="payroll-bulk-editor-loading-skeleton" label="Loading payroll data" />
            </div>
          ) : selectedStructId === "all" ? (
            <div className="text-center py-5">
              <i className="ri-filter-line" style={{ fontSize: 36, color: "var(--vz-secondary-color)" }}></i>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: 13 }}>Select a salary structure to load the edit sheet.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-file-list-3-line" style={{ fontSize: 36, color: "var(--vz-secondary-color)" }}></i>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: 13 }}>
                No employees found for this structure in {MONTH_NAMES[month]} {year}.
                {!payrollRun && " Run payroll first to see computed values."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: fullscreen ? "calc(100vh - 280px)" : "72vh" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: 12, tableLayout: "fixed" }}>
                {/* ── COLGROUP — locks every column to a fixed width shared
                     by both header rows and every body row. This is what
                     keeps headers aligned to their data columns regardless
                     of scroll position, in both normal and fullscreen mode. ── */}
                <colgroup>
                  <col style={{ width: COL_W.employee }} />{/* Employee */}
                  <col style={{ width: COL_W.attendance }} />{/* Total Days */}
                  <col style={{ width: COL_W.attendance }} />{/* Payable Days */}
                  <col style={{ width: COL_W.attendance }} />{/* Present */}
                  <col style={{ width: COL_W.attendance }} />{/* Leaves */}
                  <col style={{ width: COL_W.lop }} />{/* LOP Days */}
                  {earnCols.map((col)    => <col key={`ce_${col.id}`}   style={{ width: COL_W.earning }} />)}
                  {addEarnCols.map((col) => <col key={`cae_${col.key}`} style={{ width: COL_W.addEarning }} />)}
                  {dedCols.map((col)     => <col key={`cd_${col.id}`}   style={{ width: COL_W.deduction }} />)}
                  {addDedCols.map((col)  => <col key={`cad_${col.key}`} style={{ width: COL_W.addDeduct }} />)}
                  <col style={{ width: COL_W.statutoryPfEsi }} />{/* Emp PF */}
                  <col style={{ width: COL_W.statutoryPfEsi }} />{/* Emp ESI */}
                  <col style={{ width: COL_W.statutoryPt }} />{/* PT */}
                  <col style={{ width: COL_W.summary }} />{/* Gross */}
                  <col style={{ width: COL_W.summary }} />{/* Total Deductions */}
                  <col style={{ width: COL_W.summary }} />{/* Net Pay */}
                </colgroup>

                {/* ── GROUP HEADER ROW ── */}
                <thead>
                  <tr>
                    {/* Employee — frozen */}
                    <th rowSpan={2} style={thSt({ position: "sticky", top: 0, left: 0, zIndex: 6, background: GROUP_COLORS.employee.bg, color: GROUP_COLORS.employee.text, verticalAlign: "middle" })}>
                      Employee
                    </th>

                    {/* Attendance group */}
                    <GroupTh label="📅 Attendance" span={4} colorKey="attendance" borderLeft />
                    <GroupTh label="LOP" span={1} colorKey="lop" />

                    {/* Earnings group */}
                    {earnCols.length > 0 && <GroupTh label="▲ Earnings" span={earnCols.length} colorKey="earning" borderLeft />}

                    {/* Additional earnings */}
                    {addEarnCols.length > 0 && <GroupTh label="▲ Additional Earnings" span={addEarnCols.length} colorKey="addEarning" borderLeft />}

                    {/* Deductions group */}
                    {dedCols.length > 0 && <GroupTh label="▼ Deductions" span={dedCols.length} colorKey="deduction" borderLeft />}

                    {/* Additional deductions */}
                    {addDedCols.length > 0 && <GroupTh label="▼ Additional Deductions" span={addDedCols.length} colorKey="addDeduct" borderLeft />}

                    {/* Statutory */}
                    <GroupTh label="🔒 Statutory" span={3} colorKey="statutory" borderLeft />

                    {/* Summary */}
                    <GroupTh label="Gross" span={1} colorKey="gross" borderLeft />
                    <GroupTh label="Total Deductions" span={1} colorKey="totalDed" borderLeft />
                    <GroupTh label="Net Pay" span={1} colorKey="netpay" borderLeft />
                  </tr>

                  {/* ── SUB HEADER ROW ── */}
                  <tr>
                    {/* Attendance sub */}
                    <SubTh label="Total Days" colorKey="attendance" borderLeft />
                    <SubTh label="Payable Days" colorKey="attendance" />
                    <SubTh label="Present" colorKey="attendance" />
                    <SubTh label="Leaves" colorKey="attendance" />
                    <SubTh label="LOP Days" colorKey="lop" />

                    {/* Earning component cols */}
                    {earnCols.map((col, i) => (
                      <SubTh key={col.id} label={col.name} colorKey="earning" borderLeft={i === 0} />
                    ))}

                    {/* Additional earning cols */}
                    {addEarnCols.map((col, i) => (
                      <th key={col.key} style={thSt({
                        background: GROUP_COLORS.addEarning.bg,
                        color: GROUP_COLORS.addEarning.text,
                        top: 36, textAlign: "right",
                        borderLeft: i === 0 ? `2px solid ${GROUP_COLORS.addEarning.border}` : undefined,
                      })}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          {col.label}
                          <button data-testid={testId("payroll-bulk-edit-earning-column", itemTestKey(col), "remove-button")} onClick={() => handleRemoveAdjCol(col)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vz-secondary-color)", fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0 }}
                            title="Remove column">×</button>
                        </div>
                      </th>
                    ))}

                    {/* Deduction component cols */}
                    {dedCols.map((col, i) => (
                      <SubTh key={col.id} label={col.name} colorKey="deduction" borderLeft={i === 0} />
                    ))}

                    {/* Additional deduction cols */}
                    {addDedCols.map((col, i) => (
                      <th key={col.key} style={thSt({
                        background: GROUP_COLORS.addDeduct.bg,
                        color: GROUP_COLORS.addDeduct.text,
                        top: 36, textAlign: "right",
                        borderLeft: i === 0 ? `2px solid ${GROUP_COLORS.addDeduct.border}` : undefined,
                      })}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          {col.label}
                          <button data-testid={testId("payroll-bulk-edit-deduction-column", itemTestKey(col), "remove-button")} onClick={() => handleRemoveAdjCol(col)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vz-secondary-color)", fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0 }}
                            title="Remove column">×</button>
                        </div>
                      </th>
                    ))}

                    {/* Statutory sub */}
                    <SubTh label="Emp PF"  colorKey="statutory" borderLeft />
                    <SubTh label="Emp ESI" colorKey="statutory" />
                    <SubTh label="PT"      colorKey="statutory" />

                    {/* Summary sub */}
                    <SubTh label="Gross Earnings"    colorKey="gross"    borderLeft />
                    <SubTh label="Total Deductions"  colorKey="totalDed" borderLeft />
                    <SubTh label="Net Pay"           colorKey="netpay"   borderLeft />
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, ri) => {
                    const eid = row._isPayslip ? row.employee : row.id;
                    const empName = row._isPayslip
                      ? (row.employee_name || `Employee #${eid}`)
                      : (row.name || `Employee #${eid}`);
                    const empCode = row._isPayslip ? row.employee_emp_id : row.emp_id;
                    const e = edits[eid]    || {};
                    const o = origEdits[eid] || {};
                    const rowDirty = Object.keys(e).some((k) => isDirty(o[k], e[k]));
                    const rowBg = rowDirty ? "rgba(var(--vz-warning-rgb), .06)" : ri % 2 === 0 ? "var(--vz-secondary-bg)" : "var(--vz-tertiary-bg)";

                    return (
                      <tr key={eid} style={{ background: rowBg, borderBottom: "1px solid var(--vz-tertiary-bg)" }}>
                        {/* Frozen employee col */}
                        <td style={{
                          ...cellSt,
                          position: "sticky", left: 0, zIndex: 2,
                          background: rowBg,
                          boxShadow: "2px 0 4px -2px rgba(0,0,0,0.08)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                              background: "rgba(var(--vz-success-rgb), .1)", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--vz-success)",
                            }}>
                              {(empName[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{empName}</div>
                              <div style={{ fontSize: 10, color: "var(--vz-secondary-color)" }}>{empCode || "—"}</div>
                            </div>
                            {rowDirty && (
                              <span style={{
                                marginLeft: "auto", fontSize: 9, fontWeight: 800, color: "var(--vz-warning)",
                                background: "rgba(var(--vz-warning-rgb), .1)", border: "1px solid rgba(var(--vz-warning-rgb), .4)",
                                borderRadius: 3, padding: "1px 5px", textTransform: "uppercase",
                              }}>edited</span>
                            )}
                          </div>
                        </td>

                        {/* Attendance — read-only display cells */}
                        {[
                          row._isPayslip ? row.total_days_in_month  : "—",
                          row._isPayslip ? row.payable_days         : "—",
                          row._isPayslip ? row.present_days         : "—",
                          row._isPayslip ? row.approved_leave_days  : "—",
                        ].map((val, i) => (
                          <td key={i} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-warning-rgb), .07)", color: "var(--vz-warning)" }}>
                            {val}
                          </td>
                        ))}

                        {/* LOP — click to open the real Regularization modal
                            (per-day attendance editor), the actual source of
                            truth for LOP. Editing here recomputes the payslip
                            automatically, same as the standalone screen. */}
                        <td
                          onClick={() => setRegModal({
                            employeeId: eid,
                            employeeName: empName,
                          })}
                          style={{
                            ...cellSt, textAlign: "right", color: "var(--vz-danger)",
                            background: "rgba(var(--vz-danger-rgb), .08)", cursor: "pointer",
                          }}
                          title="Click to edit attendance / LOP for this employee"
                        >
                          {fmt(row._isPayslip ? row.lop_days : 0)}
                          <i className="ri-pencil-line ms-1" style={{ fontSize: 10, opacity: 0.6 }}></i>
                        </td>

                        {/* Earning components */}
                        {earnCols.map((col) => (
                          <EditCell
                            key={col.id}
                            testId={testId("payroll-bulk-edit-row", itemTestKey(row), col.name)}
                            value={e[`name_${col.name}`] ?? 0}
                            origValue={o[`name_${col.name}`] ?? 0}
                            onChange={(v) => setCell(eid, `name_${col.name}`, v)}
                          />
                        ))}

                        {/* Additional earnings — per employee */}
                        {addEarnCols.map((col) => (
                          <EditCell
                            key={col.key}
                            testId={testId("payroll-bulk-edit-row", itemTestKey(row), col.key)}
                            value={e[col.key] ?? 0}
                            origValue={o[col.key] ?? 0}
                            onChange={(v) => setCell(eid, col.key, v)}
                          />
                        ))}

                        {/* Deduction components */}
                        {dedCols.map((col) => (
                          <EditCell
                            key={col.id}
                            testId={testId("payroll-bulk-edit-row", itemTestKey(row), col.name)}
                            value={e[`name_${col.name}`] ?? 0}
                            origValue={o[`name_${col.name}`] ?? 0}
                            onChange={(v) => setCell(eid, `name_${col.name}`, v)}
                            danger
                          />
                        ))}

                        {/* Additional deductions — per employee */}
                        {addDedCols.map((col) => (
                          <EditCell
                            key={col.key}
                            testId={testId("payroll-bulk-edit-row", itemTestKey(row), col.key)}
                            value={e[col.key] ?? 0}
                            origValue={o[col.key] ?? 0}
                            onChange={(v) => setCell(eid, col.key, v)}
                            danger
                          />
                        ))}

                        {/* Statutory — read-only */}
                        {[
                          row._isPayslip ? row.pf_employee  : 0,
                          row._isPayslip ? row.esi_employee : 0,
                          row._isPayslip ? row.pt_amount    : 0,
                        ].map((val, i) => (
                          <td key={i} style={{ ...cellSt, textAlign: "right", color: "var(--vz-primary)", background: "rgba(var(--vz-primary-rgb), .07)" }}>
                            ₹{fmt(val)}
                          </td>
                        ))}

                        {/* Summary */}
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 700, color: "var(--vz-success)", background: "rgba(var(--vz-success-rgb), .06)" }}>
                          ₹{fmt(row._isPayslip ? row.gross_earnings   : 0)}
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 700, color: "var(--vz-danger)", background: "rgba(var(--vz-danger-rgb), .06)" }}>
                          ₹{fmt(row._isPayslip ? row.total_deductions : 0)}
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 800, fontSize: 13,
                          color: safeNum(row._isPayslip ? row.net_pay : 0) < 0 ? "var(--vz-danger)" : "var(--vz-success)",
                          background: "rgba(var(--vz-success-rgb), .08)" }}>
                          ₹{fmt(row._isPayslip ? row.net_pay          : 0)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* ── TOTALS ROW ── */}
                  {rows.length > 1 && (
                    <tr style={{ background: "var(--vz-tertiary-bg)", borderTop: "2px solid var(--vz-border-color)", fontWeight: 700 }}>
                      <td style={{ ...cellSt, position: "sticky", left: 0, zIndex: 2, background: "var(--vz-border-color)", fontSize: 11, fontWeight: 800, color: "var(--vz-body-color)", boxShadow: "2px 0 4px -2px rgba(0,0,0,0.08)" }}>
                        TOTALS ({rows.length})
                      </td>
                      {/* Attendance totals */}
                      {[
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.total_days_in_month  : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.payable_days         : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.present_days         : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.approved_leave_days  : 0), 0),
                      ].map((v, i) => (
                        <td key={i} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-warning-rgb), .1)", color: "var(--vz-warning)" }}>{fmt(v)}</td>
                      ))}
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-danger-rgb), .08)", color: "var(--vz-danger)" }}>{fmt(totals.lop_days || 0)}</td>

                      {earnCols.map((col) => (
                        <td key={col.id} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-success-rgb), .1)", color: "var(--vz-success)" }}>₹{fmt(totals[`name_${col.name}`] || 0)}</td>
                      ))}
                      {addEarnCols.map((col) => (
                        <td key={col.key} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-success-rgb), .1)", color: "var(--vz-success)", fontWeight: 800 }}>₹{fmt(totals[col.key] || 0)}</td>
                      ))}
                      {dedCols.map((col) => (
                        <td key={col.id} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-danger-rgb), .08)", color: "var(--vz-danger)" }}>₹{fmt(totals[`name_${col.name}`] || 0)}</td>
                      ))}
                      {addDedCols.map((col) => (
                        <td key={col.key} style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-danger-rgb), .08)", color: "var(--vz-danger)", fontWeight: 800 }}>₹{fmt(totals[col.key] || 0)}</td>
                      ))}
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-primary-rgb), .08)", color: "var(--vz-primary)" }}>₹{fmt(totals.pf_emp  || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-primary-rgb), .08)", color: "var(--vz-primary)" }}>₹{fmt(totals.esi_emp || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-primary-rgb), .08)", color: "var(--vz-primary)" }}>₹{fmt(totals.pt     || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-success-rgb), .1)", color: "var(--vz-success)", fontWeight: 800 }}>₹{fmt(totals.gross        || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-danger-rgb), .08)", color: "var(--vz-danger)", fontWeight: 800 }}>₹{fmt(totals.total_deduct || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "rgba(var(--vz-success-rgb), .1)", color: "var(--vz-success)", fontWeight: 800, fontSize: 13 }}>₹{fmt(totals.net_pay      || 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Legend (moved below the grid) ── */}
      <div className="d-flex flex-wrap align-items-center gap-4 mt-2 mb-2 px-1" style={{ fontSize: 11, color: "var(--vz-secondary-color)" }}>
        {[
          { bg: "rgba(var(--vz-warning-rgb), .1)", border: "rgba(var(--vz-warning-rgb), .45)", label: "Attendance" },
          { bg: "rgba(var(--vz-success-rgb), .1)", border: "rgba(var(--vz-success-rgb), .4)", label: "Earnings" },
          { bg: "rgba(var(--vz-success-rgb), .1)", border: "rgba(var(--vz-success-rgb), .4)", label: "Add. Earnings" },
          { bg: "rgba(var(--vz-danger-rgb), .08)", border: "rgba(var(--vz-danger-rgb), .4)", label: "Deductions" },
          { bg: "rgba(var(--vz-danger-rgb), .08)", border: "rgba(var(--vz-danger-rgb), .6)", label: "Add. Deductions" },
          { bg: "rgba(var(--vz-primary-rgb), .08)", border: "rgba(var(--vz-primary-rgb), .4)", label: "Statutory (read-only)" },
        ].map((l) => (
          <span key={l.label} className="d-flex align-items-center gap-1">
            <span style={{ display: "inline-block", width: 10, height: 10, background: l.bg, border: `1px solid ${l.border}`, borderRadius: 2 }} />
            {l.label}
          </span>
        ))}
        <span className="ms-auto" style={{ color: "var(--vz-secondary-color)" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--vz-warning)", marginRight: 4 }} />
          Amber dot = unsaved edit · Click salary/adjustment cells to edit · Click LOP to open Attendance &amp; Regularization
        </span>
      </div>

      {/* ── Regularization modal — reuses the existing EmployeeRegularization
          component as-is. It saves immediately per change (its own internal
          API calls), so closing this modal and reloading the grid picks up
          the new lop_days / net_pay automatically. ── */}
      {regModal && (
        <Modal data-testid="payroll-bulk-edit-attendance-lop-dialog" isOpen toggle={() => setRegModal(null)} size="xl" centered scrollable>
          <ModalHeader close={<ModalCloseButton onClick={() => setRegModal(null)} testId="payroll-bulk-edit-attendance-lop-close-button" />} toggle={() => setRegModal(null)} className="surface-muted p-3">
            Attendance &amp; LOP — {regModal.employeeName}
            <span className="text-muted ms-2" style={{ fontSize: 12, fontWeight: 400 }}>
              {MONTH_NAMES[month]} {year}
            </span>
          </ModalHeader>
          <ModalBody className="p-3" style={{ maxHeight: "75vh", overflowY: "auto" }}>
            <EmployeeRegularization
              employeeId={regModal.employeeId}
              employeeName={regModal.employeeName}
              month={month}
              year={year}
              payrollRunId={payrollRun?.id}
              onSaved={() => load()}
            />
          </ModalBody>
          <ModalFooter className="surface-muted p-3">
            <Button data-testid="payroll-bulk-edit-attendance-lop-footer-close-button" color="secondary" outline size="sm" onClick={() => setRegModal(null)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default PayrollBulkEditor;
