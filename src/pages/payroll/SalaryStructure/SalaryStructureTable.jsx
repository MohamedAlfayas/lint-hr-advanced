import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  Input,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import RecurringModal from "../PayrollComponent/Modal/RecurringModal";
import VariableModal from "../PayrollComponent/Modal/VariableModal";
import {
  setSalaryStructures,
  addSalaryStructure,
  editSalaryStructure
} from "../../../redux/reducers/ChildReducer/SalaryStructureReducer";
import { useDispatch } from "react-redux";

// ─── Helper: build a human-readable calculation label ─────────────────────────
function formatCalc(comp) {
  if (!comp) return "";
  if (comp.calculation_type === "fixed") {
    const num = parseFloat(comp.calculation_value || 0);
    return "Rs." + num.toLocaleString("en-IN") + " (Fixed)";
  }
  if (comp.calculation_type === "percentage") {
    const base = comp.calculation_based_on
      ? " of " + comp.calculation_based_on.toUpperCase() : "";
    return parseFloat(comp.calculation_value || 0) + "%" + base;
  }
  return String(comp.calculation_value || "");
}

// ─── Helper: derive a display name for a component row ────────────────────────
function compDisplayName(c, idx, payrollComponents) {
  if (!c) return "Component " + (idx + 1);
  if (c._name) return c._name;
  if (c.payroll_component && payrollComponents?.length) {
    const found = payrollComponents.find((p) => p.id === c.payroll_component);
    if (found) return found.name || found.component_name || ("Component #" + c.payroll_component);
  }
  if (c.payroll_component) return "Component #" + c.payroll_component;
  return "Component " + (idx + 1);
}

// ─── Helper: check if a component is "basic" ──────────────────────────────────
function isBasicComponent(c, payrollComponents) {
  if (!c) return false;
  if (c._is_basic) return true;
  if (c.payroll_component && payrollComponents?.length) {
    const found = payrollComponents.find((p) => p.id === c.payroll_component);
    if (found) return !!found.is_basic;
  }
  return false;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "inline-flex", alignItems: "center", cursor: "pointer",
        width: 44, height: 22, borderRadius: 11,
        background: value ? "#0d6efd" : "#d1d5db",
        padding: "2px 3px", transition: "background 0.2s",
        position: "relative", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transform: value ? "translateX(22px)" : "translateX(0)",
        transition: "transform 0.2s",
      }} />
      <span style={{
        position: "absolute", fontSize: 9, fontWeight: 600, color: "#fff",
        left: value ? 5 : "auto", right: value ? "auto" : 4,
      }}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

// ─── Add Component Dropdown (API-driven) ──────────────────────────────────────
function AddComponentDropdown({ label, options, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    (o.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="d-flex align-items-center justify-content-between px-2 py-2"
        style={{
          border: "1px solid #dee2e6", cursor: "pointer",
          background: "#fff", fontSize: 13.5, color: "#6b7280",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <span style={{ fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          zIndex: 999, background: "#fff", border: "1px solid #dee2e6",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 240, overflowY: "auto",
        }}>
          <div style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
            <Input
              bsSize="sm" placeholder="Search..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus
              style={{ border: "none", borderBottom: "2px solid #0d6efd", borderRadius: 0, boxShadow: "none" }}
            />
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 13, color: "#9ca3af" }}>
              No options found
            </div>
          )}

          {filtered.map((opt) => (
            <div
              key={opt.id}
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ cursor: "pointer", fontSize: 13.5 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
                setSearch("");
              }}
            >
              <span>{opt.name}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Press to select</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create New Component Menu (Recurring / Variable) ─────────────────────────
function CreateNewComponentMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <Button
        color="link"
        className="p-0 text-primary fw-medium"
        style={{ fontSize: 13.5, textDecoration: "none" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ fontSize: 18, lineHeight: 1, marginRight: 4 }}>⊕</span>
        Create New Component
      </Button>

      {open && (
        <div style={{
          position: "absolute", bottom: "100%", left: 0,
          zIndex: 1050, background: "#fff",
          border: "1px solid #dee2e6", borderRadius: 6,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.12)",
          minWidth: 180, marginBottom: 4,
        }}>
          {[
            { value: "recurring", label: "🔁 Recurring", desc: "Monthly fixed/% component" },
            { value: "variable", label: "📈 Variable", desc: "Bonus, incentive, etc." },
          ].map((opt) => (
            <div
              key={opt.value}
              style={{
                padding: "10px 14px", cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              onClick={() => { onSelect(opt.value); setOpen(false); }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1f2937" }}>{opt.label}</div>
              <div style={{ fontSize: 11.5, color: "#6b7280" }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SalaryStructureTable() {
  const dispatch = useDispatch();

  const [structures, setStructures] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payrollComponents, setPayrollComponents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [variableModalOpen, setVariableModalOpen] = useState(false);

  // ── Fetch payroll components ────────────────────────────────────────────────
  const fetchPayrollComponents = useCallback(() => {
    Api({ method: "GET", url: "payroll/component/" })
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        if (Array.isArray(data)) setPayrollComponents(data);
      })
      .catch(() => {});
  }, []);

  // ── Fetch salary structures ─────────────────────────────────────────────────
  const fetchStructures = useCallback(() => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/salary-structure/" })
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        const list = Array.isArray(data) ? data : [];

        setStructures(list);
        dispatch(setSalaryStructures(list));

        setSelected((prev) => {
          if (prev && prev.id !== 0) {
            const refreshed = list.find((s) => s.id === prev.id);
            return refreshed || (list.length > 0 ? list[0] : null);
          }
          return list.length > 0 ? list[0] : null;
        });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch salary structures");
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchPayrollComponents();
    fetchStructures();
  }, [fetchPayrollComponents, fetchStructures]);

  // ── Sidebar select ──────────────────────────────────────────────────────────
  const selectStructure = (s) => {
    if (editMode) return;
    setSelected(s);
  };

  // ── Create new structure ────────────────────────────────────────────────────
  const handleCreate = () => {
    if (editMode) return;
    const newItem = {
      id: 0,
      name: "Custom Salary Structure",
      description: "",
      is_active: true,
      salary_structure_components: [],
    };
    setSelected(newItem);
    setDraft(JSON.parse(JSON.stringify(newItem)));
    setEditMode(true);
  };

  // ── Enter edit mode ─────────────────────────────────────────────────────────
  const handleEdit = () => {
    setDraft(JSON.parse(JSON.stringify(selected)));
    setEditMode(true);
  };

  // ── Cancel edit ─────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (draft?.id === 0) setSelected(structures[0] || null);
    setEditMode(false);
    setDraft(null);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!draft) return;

    if (!draft.name || !draft.name.trim()) {
      toast.error("Structure name is required");
      return;
    }

    const rawComponents = (draft.salary_structure_components || []).filter(Boolean);

    const unresolved = rawComponents.filter(
      (c) => !c._removed && !c.payroll_component
    );

    if (unresolved.length > 0) {
      toast.error(
        `Cannot save: "${unresolved[0]._name || "unknown"}" has no payroll component ID.`
      );
      return;
    }

    setLoading(true);

    const payload = {
      id: draft.id ?? 0,
      name: draft.name.trim(),
      description: draft.description || "",
      salary_structure_components: rawComponents.map((c) => ({
        id: c.id ?? 0,
        payroll_component: c.payroll_component,
        calculation_type: c.calculation_type || "fixed",
        calculation_based_on:
          c.calculation_type === "percentage"
            ? c.calculation_based_on || "ctc"
            : null,
        calculation_value: parseFloat(c.calculation_value) || 0,
        ...(c._removed ? { is_active: false } : {}),
      })),
    };

    Api({
      method: "POST",
      url: "payroll/salary-structure/",
      data: payload,
    })
      .then((res) => {
        const saved = res?.data?.data;

        if (!saved) {
          toast.error("Unexpected response from server.");
          return;
        }

        const message =
          res?.data?.message ||
          (draft.id === 0
            ? "Structure created successfully!"
            : "Structure updated successfully!");

        if (draft.id === 0) {
          dispatch(addSalaryStructure(saved));
          setStructures((prev) => [...prev, saved]);
        } else {
          dispatch(editSalaryStructure(saved));
          setStructures((prev) =>
            prev.map((s) => (s.id === saved.id ? saved : s))
          );
        }

        setSelected(saved);
        setEditMode(false);
        setDraft(null);
        toast.success(message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to save salary structure"
        );
      })
      .finally(() => setLoading(false));
  };

  // ── Draft helpers ───────────────────────────────────────────────────────────
  const setDraftField = (key, val) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const setCompField = (visibleIdx, key, val) =>
    setDraft((d) => {
      const allComps = [...(d.salary_structure_components || [])];
      const visibleComps = allComps.filter((c) => c && !c._removed);
      const actualComp = visibleComps[visibleIdx];
      const actualIdx = allComps.indexOf(actualComp);
      if (actualIdx === -1) return d;

      allComps[actualIdx] = { ...allComps[actualIdx], [key]: val };

      if (key === "calculation_type") {
        if (val === "percentage") {
          allComps[actualIdx].calculation_based_on = "ctc";
        } else {
          allComps[actualIdx].calculation_based_on = null;
        }
      }

      return { ...d, salary_structure_components: allComps };
    });

  const removeComponent = (visibleIdx) =>
    setDraft((d) => {
      const allComps = [...(d.salary_structure_components || [])];
      const visibleComps = allComps.filter((c) => c && !c._removed);
      const actualComp = visibleComps[visibleIdx];
      const actualIdx = allComps.indexOf(actualComp);
      if (actualIdx === -1) return d;

      if (!allComps[actualIdx].id || allComps[actualIdx].id === 0) {
        allComps.splice(actualIdx, 1);
      } else {
        allComps[actualIdx] = { ...allComps[actualIdx], _removed: true, is_active: false };
      }
      return { ...d, salary_structure_components: allComps };
    });

  const addComponentFromDropdown = (opt) => {
    setDraft((d) => ({
      ...d,
      salary_structure_components: [
        ...(d.salary_structure_components || []),
        {
          id: 0,
          _name: opt.name,
          _is_basic: opt.is_basic || false,
          payroll_component: opt.id,
          calculation_type: "fixed",
          calculation_based_on: null,
          calculation_value: "",
        },
      ],
    }));
  };

  const handleNewComponentSaved = (savedComponent) => {
    fetchPayrollComponents();
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        salary_structure_components: [
          ...(d.salary_structure_components || []),
          {
            id: 0,
            _name: savedComponent.name || savedComponent.component_name || "",
            _is_basic: savedComponent.is_basic || false,
            payroll_component: savedComponent.id,
            calculation_type: savedComponent.calculation_type || "fixed",
            calculation_based_on: savedComponent.calculation_based_on || null,
            calculation_value: savedComponent.calculation_value || "",
          },
        ],
      };
    });
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const current = editMode ? draft : selected;

  const components = (current?.salary_structure_components || [])
    .filter((c) => c && !c._removed);

  const usedComponentIds = components
    .filter((c) => c && c.payroll_component)
    .map((c) => c.payroll_component);

  const availableOptions = payrollComponents.filter(
    (p) => !usedComponentIds.includes(p.id)
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* ── TOP HEADER BAR with Create New Structure button ────────────────── */}
      <div
        className="d-flex align-items-center justify-content-end px-4 py-2 bg-white border-bottom"
        style={{ flexShrink: 0 }}
      >
        <button
          type="button"
          className="btn btn-success add-btn"
          id="create-btn"
          style={{ textTransform: "capitalize" }}
          onClick={handleCreate}
          disabled={editMode}
        >
          <i className="ri-add-line align-bottom me-1"></i>
          Create New Structure
        </button>
      </div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────────── */}
      <div
        className="d-flex"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {loading && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(255,255,255,0.65)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div
          className="border-end bg-white"
          style={{
            width: 270,
            minWidth: 270,
            overflowY: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            {structures.length === 0 && !loading && (
              <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
                No structures found
              </div>
            )}

            {structures.map((s) => {
              const isActive = selected?.id === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => selectStructure(s)}
                  className="d-flex align-items-start justify-content-between px-3 py-2"
                  style={{
                    cursor: editMode ? "not-allowed" : "pointer",
                    borderLeft: isActive ? "3px solid #0d6efd" : "3px solid transparent",
                    background: isActive ? "#e8f0fe" : "transparent",
                    opacity: editMode && !isActive ? 0.5 : 1,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-medium" style={{
                      fontSize: 13.5, color: isActive ? "#0d6efd" : "#1f2937",
                      whiteSpace: "nowrap", overflow: "hidden",
                      textOverflow: "ellipsis", maxWidth: 220,
                    }}>
                      {s.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {s.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div
          className="flex-grow-1 p-4"
          style={{ overflowY: "auto", background: "#f4f5f7", minHeight: 0 }}
        >
          {current ? (
            <Card className="border shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="mb-0 fw-semibold">{current.name}</h5>
                </div>

                {/* Tab bar */}
                <div className="border-bottom mb-3">
                  <span className="pb-2 d-inline-block fw-medium" style={{
                    fontSize: 13.5, color: "#0d6efd",
                    borderBottom: "2px solid #0d6efd", cursor: "pointer",
                  }}>
                    Overview
                  </span>
                </div>

                {/* Name */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1 me-3">
                    <div className="fw-semibold mb-1" style={{ fontSize: 13 }}>Name</div>
                    {editMode ? (
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraftField("name", e.target.value)}
                        placeholder="Structure name"
                        style={{
                          borderTop: "none", borderLeft: "none",
                          borderRight: "none", borderRadius: 0,
                          boxShadow: "none", maxWidth: 400,
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: 13.5, color: "#374151",
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: 4, maxWidth: 400,
                      }}>
                        {current.name}
                      </div>
                    )}
                  </div>
                  {!editMode && (
                    <Button
                      color="link" size="sm"
                      className="p-0 text-secondary"
                      onClick={handleEdit} title="Edit"
                    >
                      <i className="ri-pencil-line" style={{ fontSize: 16 }} />
                    </Button>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <div className="fw-semibold mb-1" style={{ fontSize: 13 }}>Description</div>
                  {editMode ? (
                    <Input
                      type="textarea" rows={3}
                      placeholder="Enter your description here"
                      value={draft.description || ""}
                      onChange={(e) => setDraftField("description", e.target.value)}
                    />
                  ) : (
                    <div style={{
                      fontSize: 13.5,
                      color: current.description ? "#374151" : "#9ca3af",
                      fontStyle: current.description ? "normal" : "italic",
                    }}>
                      {current.description || "No description"}
                    </div>
                  )}
                </div>

                <hr />
                <div className="fw-semibold mb-3">Salary Structure</div>

                {/* Components table */}
                <div style={{ maxWidth: 700 }}>
                  <Table bordered size="sm" className="mb-1">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "32%" }}>Component</th>
                        <th>Calculation</th>
                        {editMode && (
                          <th style={{ width: 44, textAlign: "center" }}>Del</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {components.length === 0 ? (
                        <tr>
                          <td
                            colSpan={editMode ? 3 : 2}
                            className="text-center text-muted py-3"
                            style={{ fontSize: 13 }}
                          >
                            {editMode
                              ? "Add components using the dropdown below"
                              : "No components defined"}
                          </td>
                        </tr>
                      ) : (
                        components.map((c, visibleIdx) => {
                          const isBasic = isBasicComponent(c, payrollComponents);

                          return (
                            <tr key={visibleIdx}>
                              <td style={{ fontSize: 13.5, verticalAlign: "middle" }}>
                                {compDisplayName(c, visibleIdx, payrollComponents)}
                              </td>

                              <td style={{ verticalAlign: "middle" }}>
                                {editMode ? (
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <Input
                                      type="select" bsSize="sm"
                                      value={c.calculation_type || "fixed"}
                                      onChange={(e) =>
                                        setCompField(visibleIdx, "calculation_type", e.target.value)
                                      }
                                      style={{ fontSize: 12, width: "auto" }}
                                    >
                                      <option value="fixed">Fixed (Rs.)</option>
                                      <option value="percentage">Percentage (%)</option>
                                    </Input>

                                    <Input
                                      bsSize="sm" type="number" min="0"
                                      placeholder="Value"
                                      value={c.calculation_value || ""}
                                      onChange={(e) =>
                                        setCompField(visibleIdx, "calculation_value", e.target.value)
                                      }
                                      style={{ fontSize: 12, width: 90 }}
                                    />

                                    {c.calculation_type === "percentage" && (
                                      isBasic ? (
                                        <span style={{
                                          fontSize: 12, color: "#374151",
                                          background: "#f3f4f6",
                                          padding: "2px 8px", borderRadius: 4,
                                          border: "1px solid #dee2e6",
                                        }}>
                                          of CTC
                                        </span>
                                      ) : (
                                        <Input
                                          type="select" bsSize="sm"
                                          value={c.calculation_based_on || "ctc"}
                                          onChange={(e) =>
                                            setCompField(visibleIdx, "calculation_based_on", e.target.value)
                                          }
                                          style={{ fontSize: 12, width: "auto" }}
                                        >
                                          <option value="ctc">of CTC</option>
                                          <option value="basic">of Basic</option>
                                        </Input>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: 13 }}>{formatCalc(c)}</span>
                                )}
                              </td>

                              {editMode && (
                                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                  <button
                                    onClick={() => removeComponent(visibleIdx)}
                                    style={{
                                      background: "none", border: "none",
                                      cursor: "pointer", color: "#ef4444",
                                      fontSize: 16, lineHeight: 1, padding: 0,
                                    }}
                                    title="Remove"
                                  >
                                    ✕
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>

                  {editMode && (
                    <AddComponentDropdown
                      label="+ Add Component"
                      options={availableOptions}
                      onSelect={addComponentFromDropdown}
                    />
                  )}
                </div>

                {/* Edit footer */}
                {editMode && (
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <CreateNewComponentMenu
                      onSelect={(type) => {
                        if (type === "recurring") setRecurringModalOpen(true);
                        else setVariableModalOpen(true);
                      }}
                    />

                    <div className="d-flex gap-2">
                      <Button
                        size="sm" className="btn btn-danger"
                        onClick={handleCancel} disabled={loading}
                      >
                        ✕ CANCEL
                      </Button>
                      <Button
                        className="btn-success" size="sm"
                        onClick={handleSave} disabled={loading}
                      >
                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                        {loading ? "Saving…" : "SAVE"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="text-center text-muted mt-5">
              {loading ? "Loading…" : "No structure selected."}
            </div>
          )}
        </div>

        {/* Recurring Modal */}
        <RecurringModal
          isOpen={recurringModalOpen}
          toggle={() => setRecurringModalOpen(false)}
          component={null}
          onSaved={handleNewComponentSaved}
        />

        {/* Variable Modal */}
        <VariableModal
          isOpen={variableModalOpen}
          toggle={() => setVariableModalOpen(false)}
          component={null}
          onSaved={handleNewComponentSaved}
        />
      </div>
    </div>
  );
}