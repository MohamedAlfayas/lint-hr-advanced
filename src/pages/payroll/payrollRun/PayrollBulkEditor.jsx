import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card, CardHeader, CardBody, CardTitle,
  Button, Spinner, Badge, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Row, Col, Label,
} from "reactstrap";
import Swal from "sweetalert2";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import EmployeeRegularization from "./EmployeeRegularization";
import { useSelector } from "react-redux";

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

const confirmAction = ({ title, text, confirmText = "Yes, remove it", confirmColor = "#dc3545" }) =>
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
  borderRight: "1px solid #e9ecef",
  borderBottom: "1px solid #e9ecef",
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
  background: "#f8f9fa",
  borderRight: "1px solid #dee2e6",
  borderBottom: "2px solid #dee2e6",
  ...extra,
});

const GROUP_COLORS = {
  employee:   { bg: "#f0f4f8", text: "#334155", border: "#cbd5e1" },
  attendance: { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
  lop:        { bg: "#fff1f2", text: "#be123c", border: "#fda4af" },
  earning:    { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  addEarning: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
  deduction:  { bg: "#fff5f5", text: "#c53030", border: "#fca5a5" },
  addDeduct:  { bg: "#fff0f0", text: "#9b1c1c", border: "#f87171" },
  statutory:  { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
  gross:      { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  totalDed:   { bg: "#fff5f5", text: "#c53030", border: "#fca5a5" },
  netpay:     { bg: "#ecfdf5", text: "#065f46", border: "#34d399" },
};

// ─── Editable cell ────────────────────────────────────────────────────────────

const EditCell = ({ value, origValue, onChange, readOnly = false, danger = false }) => {
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
    ? "#fffbeb"
    : editing
    ? "#f0f9ff"
    : "transparent";

  return (
    <td
      onClick={open}
      style={{
        ...cellSt,
        background: bg,
        cursor: readOnly ? "default" : "text",
        textAlign: "right",
      }}
    >
      {editing ? (
        <input
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
        <span style={{ color: danger ? "#c53030" : "inherit", fontSize: 12 }}>
          {fmt(value)}
          {dirty && (
            <span style={{
              display: "inline-block", width: 5, height: 5, borderRadius: "50%",
              background: "#f59e0b", marginLeft: 4, verticalAlign: "middle",
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
  const [adjForm,    setAdjForm]    = useState({ label: "", type: "earning", reason: "" });
  const [adjPanelOpen, setAdjPanelOpen] = useState(false);

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
  }, []);

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
    setAdjCols((prev) => [...prev, { key, label, type: adjForm.type, reason: adjForm.reason }]);
    // Pre-fill 0 for all employees
    setEdits((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => { next[eid] = { ...next[eid], [key]: 0 }; });
      return next;
    });
    setOrigEdits((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => { next[eid] = { ...next[eid], [key]: 0 }; });
      return next;
    });
    setAdjForm({ label: "", type: "earning", reason: "" });
    toast.success(`Column "${label}" added to the sheet.`);
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

    if (fail > 0) toast.warning(`Saved with ${fail} error(s). Refreshing...`);
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
              background: "#fff", padding: "16px 20px",
              overflowY: "auto",
            }
          : undefined
      }
    >
      {fullscreen && (
        <div
          className="d-flex align-items-center justify-content-between mb-2 pb-2"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            <i className="ri-fullscreen-line me-2"></i>Full Screen Edit Mode
          </span>
          <Button color="light" size="sm" className="border" onClick={() => setFullscreen(false)}>
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
            {/* Month */}
            <div style={{ position: "relative", minWidth: 170, height: CONTROL_HEIGHT }}>
              <i className="ri-calendar-line" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 15, pointerEvents: "none", zIndex: 1,
              }}></i>
              <Input
                type="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  height: CONTROL_HEIGHT, fontSize: 13.5, color: "#475569", fontWeight: 500,
                  borderRadius: 8, border: "1px solid #e2e8f0", paddingLeft: 38, paddingRight: 32,
                  boxShadow: "none", background: "#fff", appearance: "none", WebkitAppearance: "none",
                }}
              >
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Input>
              <i className="ri-arrow-down-s-line" style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 16, pointerEvents: "none",
              }}></i>
            </div>

            {/* Year */}
            <div style={{ position: "relative", minWidth: 130, height: CONTROL_HEIGHT }}>
              <i className="ri-calendar-2-line" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 15, pointerEvents: "none", zIndex: 1,
              }}></i>
              <Input
                type="select" value={year} onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  height: CONTROL_HEIGHT, fontSize: 13.5, color: "#475569", fontWeight: 500,
                  borderRadius: 8, border: "1px solid #e2e8f0", paddingLeft: 38, paddingRight: 32,
                  boxShadow: "none", background: "#fff", appearance: "none", WebkitAppearance: "none",
                }}
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Input>
              <i className="ri-arrow-down-s-line" style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 16, pointerEvents: "none",
              }}></i>
            </div>

            {/* Salary Structure */}
            <div style={{ position: "relative", minWidth: 240, flex: "1 1 240px", maxWidth: 320, height: CONTROL_HEIGHT }}>
              <i className="ri-stack-line" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 15, pointerEvents: "none", zIndex: 1,
              }}></i>
              <Input
                type="select" value={selectedStructId}
                onChange={(e) => setSelectedStructId(e.target.value)}
                style={{
                  height: CONTROL_HEIGHT, fontSize: 13.5, color: "#475569", fontWeight: 500,
                  borderRadius: 8, border: "1px solid #e2e8f0", paddingLeft: 38, paddingRight: 32,
                  boxShadow: "none", background: "#fff", appearance: "none", WebkitAppearance: "none",
                }}
              >
                <option value="all">Select Salary Structure</option>
                {structures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Input>
              <i className="ri-arrow-down-s-line" style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 16, pointerEvents: "none",
              }}></i>
            </div>

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
                <span className="d-flex align-items-center" style={{ fontSize: 12, color: "#d97706", fontWeight: 700, height: CONTROL_HEIGHT }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", marginRight: 5 }} />
                  {dirtyEmpIds.length} unsaved
                </span>
              )}
              <Button
                color="success" onClick={handleSave} disabled={saving || !dirtyEmpIds.length}
                style={{ minWidth: 140, height: CONTROL_HEIGHT, fontSize: 13.5 }}
              >
                {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : <><i className="ri-save-line me-1"></i>Save All Changes</>}
              </Button>
              <Button
                color="light" className="border" onClick={load} disabled={loading} title="Refresh"
                style={{ height: CONTROL_HEIGHT, width: CONTROL_HEIGHT, padding: 0 }}
              >
                <i className="ri-refresh-line"></i>
              </Button>
              <Button
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

      {/* ── Adjustment column panel ── */}
      <Card className="shadow-none border mb-3" style={{ borderLeft: "3px solid #6366f1 !important" }}>
        <CardHeader
          className="py-2 px-3 d-flex align-items-center justify-content-between"
          style={{ cursor: "pointer", background: "#f5f3ff", borderBottom: adjPanelOpen ? "1px solid #e0e7ff" : "none" }}
          onClick={() => setAdjPanelOpen((p) => !p)}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="ri-add-circle-line" style={{ fontSize: 16, color: "#6366f1" }}></i>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#4338ca" }}>Add Adjustment Column</span>
            {adjCols.length > 0 && (
              <Badge color="primary" pill style={{ fontSize: 10 }}>{adjCols.length} active</Badge>
            )}
          </div>
          <i className={`ri-arrow-${adjPanelOpen ? "up" : "down"}-s-line`} style={{ color: "#6366f1", fontSize: 16 }}></i>
        </CardHeader>

        {adjPanelOpen && (
          <CardBody className="py-3 px-3">
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>
              Adding a column here creates a new <strong>Additional Earnings</strong> or <strong>Additional Deductions</strong> column
              visible for every employee. Enter the amount per-employee in the grid. Only employees where you enter a non-zero value will have that adjustment saved.
            </p>

            {/* Active adjustment columns */}
            {adjCols.length > 0 && (
              <div className="mb-3 d-flex flex-wrap gap-2">
                {adjCols.map((col) => (
                  <div key={col.key} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
                    borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: col.type === "earning" ? "#f0fdf4" : "#fff5f5",
                    border: `1px solid ${col.type === "earning" ? "#86efac" : "#fca5a5"}`,
                    color: col.type === "earning" ? "#166534" : "#c53030",
                  }}>
                    <i className={`ri-${col.type === "earning" ? "arrow-up" : "arrow-down"}-line`}></i>
                    {col.label}
                    <button
                      onClick={() => handleRemoveAdjCol(col)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 2, color: "#999", fontSize: 13, lineHeight: 1 }}
                      title="Remove column"
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* New column form */}
            <Row className="g-2 align-items-end">
              <Col sm={4}>
                <Label style={{ fontSize: 12, fontWeight: 600 }}>Column Label</Label>
                <Input bsSize="sm" value={adjForm.label}
                  onChange={(e) => setAdjForm({ ...adjForm, label: e.target.value })}
                  placeholder="e.g. Festival Bonus, Advance Recovery" />
              </Col>
              <Col sm={2}>
                <Label style={{ fontSize: 12, fontWeight: 600 }}>Type</Label>
                <Input type="select" bsSize="sm" value={adjForm.type}
                  onChange={(e) => setAdjForm({ ...adjForm, type: e.target.value })}>
                  <option value="earning">Earning (+)</option>
                  <option value="deduction">Deduction (−)</option>
                </Input>
              </Col>
              <Col sm={4}>
                <Label style={{ fontSize: 12, fontWeight: 600 }}>Reason / Note (optional)</Label>
                <Input bsSize="sm" value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  placeholder="e.g. Diwali bonus payout" />
              </Col>
              <Col sm={2}>
                <Button color="primary" size="sm" className="w-100" onClick={handleAddAdjCol}>
                  <i className="ri-add-line me-1"></i>Add Column
                </Button>
              </Col>
            </Row>
          </CardBody>
        )}
      </Card>

      {/* ── Grid ── */}
      <Card className="shadow-none border">
        <CardHeader className="bg-light py-2 px-3 d-flex align-items-center justify-content-between">
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
            <div className="text-center py-5">
              <Spinner color="success" />
              <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>Loading payroll data...</p>
            </div>
          ) : selectedStructId === "all" ? (
            <div className="text-center py-5">
              <i className="ri-filter-line" style={{ fontSize: 36, color: "#ccc" }}></i>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: 13 }}>Select a salary structure to load the edit sheet.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-file-list-3-line" style={{ fontSize: 36, color: "#ccc" }}></i>
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
                          <button onClick={() => handleRemoveAdjCol(col)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0 }}
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
                          <button onClick={() => handleRemoveAdjCol(col)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 12, padding: 0, lineHeight: 1, flexShrink: 0 }}
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
                    const rowBg = rowDirty ? "#fffef5" : ri % 2 === 0 ? "#fff" : "#fafafa";

                    return (
                      <tr key={eid} style={{ background: rowBg, borderBottom: "1px solid #f0f0f0" }}>
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
                              background: "#e8f5e9", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#2e7d32",
                            }}>
                              {(empName[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{empName}</div>
                              <div style={{ fontSize: 10, color: "#999" }}>{empCode || "—"}</div>
                            </div>
                            {rowDirty && (
                              <span style={{
                                marginLeft: "auto", fontSize: 9, fontWeight: 800, color: "#d97706",
                                background: "#fffbeb", border: "1px solid #fde68a",
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
                          <td key={i} style={{ ...cellSt, textAlign: "right", background: "#fffdf5", color: "#92400e" }}>
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
                            ...cellSt, textAlign: "right", color: "#be123c",
                            background: "#fff1f2", cursor: "pointer",
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
                            value={e[`name_${col.name}`] ?? 0}
                            origValue={o[`name_${col.name}`] ?? 0}
                            onChange={(v) => setCell(eid, `name_${col.name}`, v)}
                          />
                        ))}

                        {/* Additional earnings — per employee */}
                        {addEarnCols.map((col) => (
                          <EditCell
                            key={col.key}
                            value={e[col.key] ?? 0}
                            origValue={o[col.key] ?? 0}
                            onChange={(v) => setCell(eid, col.key, v)}
                          />
                        ))}

                        {/* Deduction components */}
                        {dedCols.map((col) => (
                          <EditCell
                            key={col.id}
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
                          <td key={i} style={{ ...cellSt, textAlign: "right", color: "#1d4ed8", background: "#f0f6ff" }}>
                            ₹{fmt(val)}
                          </td>
                        ))}

                        {/* Summary */}
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 700, color: "#166534", background: "#f8fdf8" }}>
                          ₹{fmt(row._isPayslip ? row.gross_earnings   : 0)}
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 700, color: "#c53030", background: "#fff8f8" }}>
                          ₹{fmt(row._isPayslip ? row.total_deductions : 0)}
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 800, fontSize: 13,
                          color: safeNum(row._isPayslip ? row.net_pay : 0) < 0 ? "#c53030" : "#065f46",
                          background: "#f0fdf8" }}>
                          ₹{fmt(row._isPayslip ? row.net_pay          : 0)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* ── TOTALS ROW ── */}
                  {rows.length > 1 && (
                    <tr style={{ background: "#e8ecf0", borderTop: "2px solid #c1c9d2", fontWeight: 700 }}>
                      <td style={{ ...cellSt, position: "sticky", left: 0, zIndex: 2, background: "#dde3ea", fontSize: 11, fontWeight: 800, color: "#334155", boxShadow: "2px 0 4px -2px rgba(0,0,0,0.08)" }}>
                        TOTALS ({rows.length})
                      </td>
                      {/* Attendance totals */}
                      {[
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.total_days_in_month  : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.payable_days         : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.present_days         : 0), 0),
                        rows.reduce((a, r) => a + safeNum(r._isPayslip ? r.approved_leave_days  : 0), 0),
                      ].map((v, i) => (
                        <td key={i} style={{ ...cellSt, textAlign: "right", background: "#fffbeb", color: "#92400e" }}>{fmt(v)}</td>
                      ))}
                      <td style={{ ...cellSt, textAlign: "right", background: "#fff0f2", color: "#be123c" }}>{fmt(totals.lop_days || 0)}</td>

                      {earnCols.map((col) => (
                        <td key={col.id} style={{ ...cellSt, textAlign: "right", background: "#f0fdf4", color: "#166534" }}>₹{fmt(totals[`name_${col.name}`] || 0)}</td>
                      ))}
                      {addEarnCols.map((col) => (
                        <td key={col.key} style={{ ...cellSt, textAlign: "right", background: "#ecfdf5", color: "#065f46", fontWeight: 800 }}>₹{fmt(totals[col.key] || 0)}</td>
                      ))}
                      {dedCols.map((col) => (
                        <td key={col.id} style={{ ...cellSt, textAlign: "right", background: "#fff5f5", color: "#c53030" }}>₹{fmt(totals[`name_${col.name}`] || 0)}</td>
                      ))}
                      {addDedCols.map((col) => (
                        <td key={col.key} style={{ ...cellSt, textAlign: "right", background: "#fff0f0", color: "#9b1c1c", fontWeight: 800 }}>₹{fmt(totals[col.key] || 0)}</td>
                      ))}
                      <td style={{ ...cellSt, textAlign: "right", background: "#eff6ff", color: "#1d4ed8" }}>₹{fmt(totals.pf_emp  || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "#eff6ff", color: "#1d4ed8" }}>₹{fmt(totals.esi_emp || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "#eff6ff", color: "#1d4ed8" }}>₹{fmt(totals.pt     || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "#f0fdf4", color: "#166534", fontWeight: 800 }}>₹{fmt(totals.gross        || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "#fff5f5", color: "#c53030", fontWeight: 800 }}>₹{fmt(totals.total_deduct || 0)}</td>
                      <td style={{ ...cellSt, textAlign: "right", background: "#ecfdf5", color: "#065f46", fontWeight: 800, fontSize: 13 }}>₹{fmt(totals.net_pay      || 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Legend (moved below the grid) ── */}
      <div className="d-flex flex-wrap align-items-center gap-4 mt-2 mb-2 px-1" style={{ fontSize: 11, color: "#888" }}>
        {[
          { bg: "#fffbeb", border: "#fcd34d", label: "Attendance" },
          { bg: "#f0fdf4", border: "#86efac", label: "Earnings" },
          { bg: "#ecfdf5", border: "#6ee7b7", label: "Add. Earnings" },
          { bg: "#fff5f5", border: "#fca5a5", label: "Deductions" },
          { bg: "#fff0f0", border: "#f87171", label: "Add. Deductions" },
          { bg: "#eff6ff", border: "#93c5fd", label: "Statutory (read-only)" },
        ].map((l) => (
          <span key={l.label} className="d-flex align-items-center gap-1">
            <span style={{ display: "inline-block", width: 10, height: 10, background: l.bg, border: `1px solid ${l.border}`, borderRadius: 2 }} />
            {l.label}
          </span>
        ))}
        <span className="ms-auto" style={{ color: "#aaa" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", marginRight: 4 }} />
          Amber dot = unsaved edit · Click salary/adjustment cells to edit · Click LOP to open Attendance &amp; Regularization
        </span>
      </div>

      {/* ── Regularization modal — reuses the existing EmployeeRegularization
          component as-is. It saves immediately per change (its own internal
          API calls), so closing this modal and reloading the grid picks up
          the new lop_days / net_pay automatically. ── */}
      {regModal && (
        <Modal isOpen toggle={() => setRegModal(null)} size="xl" centered scrollable>
          <ModalHeader toggle={() => setRegModal(null)} className="bg-light p-3">
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
          <ModalFooter className="bg-light p-3">
            <Button color="secondary" outline size="sm" onClick={() => setRegModal(null)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default PayrollBulkEditor;