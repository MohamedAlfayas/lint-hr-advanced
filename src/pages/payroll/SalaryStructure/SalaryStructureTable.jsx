import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, Input } from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import RecurringModal from "../PayrollComponent/Modal/RecurringModal";
import VariableModal from "../PayrollComponent/Modal/VariableModal";
import {
  setSalaryStructures,
  addSalaryStructure,
  editSalaryStructure,
} from "../../../redux/reducers/ChildReducer/SalaryStructureReducer";
import { setRecurring } from "../../../redux/reducers/ChildReducer/RecurringReducer";
import { useDispatch, useSelector } from "react-redux";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";

// ─── Stable per-row id (frontend only — never sent to backend) ────────────────
let _uidCounter = 0;
const makeUid = () => `c_${Date.now()}_${_uidCounter++}`;
const withUid = (c) => ({ ...c, _uid: c._uid || makeUid() });

// ─── Helper: build a human-readable calculation label ─────────────────────────
function formatCalc(comp) {
  if (!comp) return "";
  if (comp.calculation_type === "fixed") {
    const num = parseFloat(comp.calculation_value || 0);
    return "Rs." + num.toLocaleString("en-IN") + " (Fixed)";
  }
  if (comp.calculation_type === "percentage") {
    const base = comp.calculation_based_on
      ? " of " + comp.calculation_based_on.toUpperCase()
      : "";
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
    if (found)
      return (
        found.name ||
        found.component_name ||
        "Component #" + c.payroll_component
      );
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

// ─── Helper: check if a component is the balancing component ──────────────────
function isBalancingComponent(c, payrollComponents) {
  if (!c) return false;
  if (c._is_balancing) return true;
  if (c.payroll_component && payrollComponents?.length) {
    const found = payrollComponents.find((p) => p.id === c.payroll_component);
    if (found) return !!found.is_balancing_component;
  }
  return false;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        width: 44,
        height: 22,
        borderRadius: 11,
        background: value ? "#0d6efd" : "#d1d5db",
        padding: "2px 3px",
        transition: "background 0.2s",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transform: value ? "translateX(22px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}
      />
      <span
        style={{
          position: "absolute",
          fontSize: 9,
          fontWeight: 600,
          color: "#fff",
          left: value ? 5 : "auto",
          right: value ? "auto" : 4,
        }}
      >
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
    (o.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="ss-dd-trigger" onClick={() => setOpen((v) => !v)}>
        <span>
          <i className="ri-add-circle-line align-bottom me-1" />
          {label}
        </span>
        <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
      </div>

      {open && (
        <div className="ss-dd-menu">
          <div className="ss-dd-search">
            <Input
              data-testid="salary-structure-list-search-components-input"
              bsSize="sm"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {filtered.length === 0 && <div className="ss-dd-empty">No options found</div>}

          {filtered.map((opt) => (
            <div
              key={opt.id}
              className="ss-dd-option"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
                setSearch("");
              }}
            >
              <span>{opt.name}</span>
              <small>Select</small>
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
        data-testid="salary-structure-list-create-new-component-button"
        color="link"
        className="p-0 text-primary fw-medium text-decoration-none"
        style={{ fontSize: 13.5 }}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="ri-add-circle-line align-bottom me-1" />
        Create New Component
      </Button>

      {open && (
        <div className="ss-dd-menu is-up">
          {[
            {
              value: "recurring",
              icon: "ri-repeat-line",
              label: "Recurring",
              desc: "Monthly fixed/% component",
            },
            {
              value: "variable",
              icon: "ri-line-chart-line",
              label: "Variable",
              desc: "Bonus, incentive, etc.",
            },
          ].map((opt) => (
            <div
              key={opt.value}
              className="ss-dd-option justify-content-start"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              <i className={opt.icon} style={{ fontSize: 16 }} />
              <div>
                <div className="fw-semibold">{opt.label}</div>
                <small>{opt.desc}</small>
              </div>
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

  const payrollComponents =
    useSelector((state) => state.RecurringReducer.recurring_data) || [];

  const [structures, setStructures] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [listSearch, setListSearch] = useState("");

  const fetchPayrollComponents = useCallback(() => {
    Api({ method: "GET", url: "payroll/component/" })
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        if (Array.isArray(data)) dispatch(setRecurring(data));
      })
      .catch(() => {});
  }, [dispatch]);

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
        toast.error(
          err?.response?.data?.message || "Failed to fetch salary structures",
        );
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchPayrollComponents();
    fetchStructures();
  }, [fetchPayrollComponents, fetchStructures]);

  const selectStructure = (s) => {
    if (editMode) return;
    setSelected(s);
  };

  // Build an editable draft, tagging every component with a stable _uid.
  const buildDraft = (source) => {
    const copy = JSON.parse(JSON.stringify(source));
    copy.salary_structure_components = (
      copy.salary_structure_components || []
    ).map(withUid);
    return copy;
  };

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
    setDraft(buildDraft(newItem));
    setEditMode(true);
  };

  const handleEdit = () => {
    setDraft(buildDraft(selected));
    setEditMode(true);
  };

  const handleCancel = () => {
    if (draft?.id === 0) setSelected(structures[0] || null);
    setEditMode(false);
    setDraft(null);
  };

  const handleSave = () => {
    if (!draft) return;

    if (!draft.name || !draft.name.trim()) {
      toast.error("Structure name is required");
      return;
    }

    const rawComponents = (draft.salary_structure_components || []).filter(
      Boolean,
    );

    const unresolved = rawComponents.filter(
      (c) => !c._removed && !c.payroll_component,
    );

    if (unresolved.length > 0) {
      toast.error(
        `Cannot save: "${unresolved[0]._name || "unknown"}" has no payroll component ID.`,
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
            prev.map((s) => (s.id === saved.id ? saved : s)),
          );
        }

        setSelected(saved);
        setEditMode(false);
        setDraft(null);
        toast.success(message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to save salary structure",
        );
      })
      .finally(() => setLoading(false));
  };

  const setDraftField = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  // ── Update a component field by its stable _uid (no index lookups) ─────────
  const setCompField = (uid, key, val) =>
    setDraft((d) => {
      const comps = (d.salary_structure_components || []).map((c) => {
        if (c._uid !== uid) return c;
        const updated = { ...c, [key]: val };
        if (key === "calculation_type") {
          updated.calculation_based_on =
            val === "percentage" ? c.calculation_based_on || "ctc" : null;
        }
        return updated;
      });
      return { ...d, salary_structure_components: comps };
    });

  // ── Remove a component by its stable _uid ──────────────────────────────────
  //    New row (id 0)     → dropped from the array entirely.
  //    Saved row (id > 0) → soft-deleted (_removed) so the backend deactivates it.
  const removeComponent = (uid) =>
    setDraft((d) => {
      const comps = [...(d.salary_structure_components || [])];
      const idx = comps.findIndex((c) => c._uid === uid);
      if (idx === -1) return d;

      if (!comps[idx].id || comps[idx].id === 0) {
        comps.splice(idx, 1);
      } else {
        comps[idx] = { ...comps[idx], _removed: true, is_active: false };
      }
      return { ...d, salary_structure_components: comps };
    });

  // ── Add an existing component from the dropdown ────────────────────────────
  const addComponentFromDropdown = (opt) => {
    const isBasic = !!opt.is_basic;
    const isBalancing = !!opt.is_balancing_component;

    setDraft((d) => ({
      ...d,
      salary_structure_components: [
        ...(d.salary_structure_components || []),
        {
          id: 0,
          _uid: makeUid(),
          _name: opt.name,
          _is_basic: isBasic,
          _is_balancing: isBalancing,
          payroll_component: opt.id,
          calculation_type: isBalancing ? null : opt.calculation_type || "fixed",
          calculation_based_on: isBalancing
            ? null
            : opt.calculation_type === "percentage"
              ? opt.calculation_based_on || "ctc"
              : null,
          calculation_value: isBalancing ? 0 : (opt.calculation_value ?? ""),
        },
      ],
    }));
  };

  const handleNewComponentSaved = (savedComponent) => {
    fetchPayrollComponents();
    const isBasic = !!savedComponent.is_basic;
    const isBalancing = !!savedComponent.is_balancing_component;

    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        salary_structure_components: [
          ...(d.salary_structure_components || []),
          {
            id: 0,
            _uid: makeUid(),
            _name: savedComponent.name || savedComponent.component_name || "",
            _is_basic: isBasic,
            _is_balancing: isBalancing,
            payroll_component: savedComponent.id,
            calculation_type: isBalancing
              ? null
              : savedComponent.calculation_type || "fixed",
            calculation_based_on: isBalancing
              ? null
              : savedComponent.calculation_based_on || null,
            calculation_value: isBalancing
              ? 0
              : (savedComponent.calculation_value ?? ""),
          },
        ],
      };
    });
  };

  const current = editMode ? draft : selected;

  const components = (current?.salary_structure_components || []).filter(
    (c) => c && !c._removed,
  );

  const usedComponentIds = components
    .filter((c) => c && c.payroll_component)
    .map((c) => c.payroll_component);

  const availableOptions = payrollComponents.filter(
    (p) => !usedComponentIds.includes(p.id),
  );

  const filteredStructures = structures.filter((s) =>
    (s.name || "").toLowerCase().includes(listSearch.trim().toLowerCase()),
  );

  const componentCountOf = (s) =>
    (s?.salary_structure_components || []).filter(
      (c) => c && !c._removed && c.is_active !== false,
    ).length;

  const initialsOf = (name = "") =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "S";

  return (
    <div className="ss-wrap">
      {loading && (
        <div className="ss-loading">
          <TableSkeletonBlock rows={6} cols={5} testId="salary-structure-loading-skeleton" label="Loading salary structures" />
        </div>
      )}

      <div className="ss-topbar">
        <div className="ss-topbar-info">
          <span className="ss-count">{structures.length}</span>
          <span>{structures.length === 1 ? "structure" : "structures"} configured</span>
        </div>
        <button
          data-testid="salary-structure-list-create-new-structure-button"
          type="button"
          className="btn btn-success add-btn"
          id="create-btn"
          onClick={handleCreate}
          disabled={editMode}
        >
          <i className="ri-add-line align-bottom me-1"></i>
          Create New Structure
        </button>
      </div>

      <div className="ss-body">
        <aside className="ss-list">
          <div className="ss-list-search">
            <i className="ri-search-line" />
            <input
              data-testid="salary-structure-list-search-structures-input"
              type="text"
              placeholder="Search structures..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />
          </div>

          <div className="ss-list-items">
            {filteredStructures.length === 0 && !loading && (
              <div className="ss-list-empty">
                <i className="ri-file-list-3-line" />
                <span>{listSearch ? "No matching structures" : "No structures found"}</span>
              </div>
            )}

            {editMode && draft?.id === 0 && (
              <div className="ss-item is-active">
                <span className="ss-item-avatar">
                  <i className="ri-add-line" />
                </span>
                <div className="ss-item-text">
                  <div className="ss-item-name">{draft.name || "New structure"}</div>
                  <div className="ss-item-meta">Draft</div>
                </div>
              </div>
            )}

            {filteredStructures.map((s) => {
              const isActive = selected?.id === s.id && !(editMode && draft?.id === 0);
              const count = componentCountOf(s);
              return (
                <div
                  key={s.id}
                  onClick={() => selectStructure(s)}
                  className={`ss-item${isActive ? " is-active" : ""}${editMode && !isActive ? " is-locked" : ""}`}
                >
                  <span className="ss-item-avatar">{initialsOf(s.name)}</span>
                  <div className="ss-item-text">
                    <div className="ss-item-name" title={s.name}>
                      {s.name}
                    </div>
                    <div className="ss-item-meta">
                      <span className={`ss-dot ${s.is_active ? "on" : "off"}`} />
                      {s.is_active ? "Active" : "Inactive"}
                      <span className="ss-sep">•</span>
                      {count} {count === 1 ? "component" : "components"}
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line ss-item-arrow" />
                </div>
              );
            })}
          </div>
        </aside>

        <section className="ss-detail">
          {current ? (
            <div className="ss-card">
              <div className="ss-card-head">
                <div className="d-flex align-items-center gap-3 min-w-0">
                  <span className="ss-head-icon">
                    <i className="ri-node-tree" />
                  </span>
                  <div className="min-w-0">
                    <h5 className="ss-title">
                      {editMode && draft?.id === 0 ? "New Salary Structure" : current.name}
                    </h5>
                    <div className="ss-head-meta">
                      <span className={`ss-chip ${current.is_active === false ? "is-off" : "is-on"}`}>
                        {current.is_active === false ? "Inactive" : "Active"}
                      </span>
                      <span className="ss-chip is-muted">
                        <i className="ri-stack-line" />
                        {components.length} {components.length === 1 ? "component" : "components"}
                      </span>
                      {editMode && <span className="ss-chip is-warn">Editing</span>}
                    </div>
                  </div>
                </div>
                {!editMode && (
                  <button data-testid="salary-structure-list-edit-button" type="button" className="btn btn-soft-primary btn-sm" onClick={handleEdit}>
                    <i className="ri-pencil-line align-bottom me-1" />
                    Edit
                  </button>
                )}
              </div>

              <div className="ss-card-body">
                <div className="ss-fields">
                  <div className="ss-field">
                    <label className="ss-label">Structure Name</label>
                    {editMode ? (
                      <Input
                        data-testid="salary-structure-list-structure-name-input"
                        value={draft.name}
                        onChange={(e) => setDraftField("name", e.target.value)}
                        placeholder="Structure name"
                      />
                    ) : (
                      <div className="ss-value">{current.name}</div>
                    )}
                  </div>
                  <div className="ss-field">
                    <label className="ss-label">Description</label>
                    {editMode ? (
                      <Input
                        data-testid="salary-structure-list-description-textarea"
                        type="textarea"
                        rows={2}
                        placeholder="Enter your description here"
                        value={draft.description || ""}
                        onChange={(e) => setDraftField("description", e.target.value)}
                      />
                    ) : (
                      <div className={`ss-value${current.description ? "" : " is-empty"}`}>
                        {current.description || "No description"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ss-section-title">
                  <i className="ri-wallet-3-line" />
                  Salary Components
                </div>

                <div className="ss-table-wrap">
                  <table className="ss-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Component</th>
                        <th>Calculation</th>
                        {editMode && <th style={{ width: 56, textAlign: "center" }}>Remove</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {components.length === 0 ? (
                        <tr>
                          <td colSpan={editMode ? 3 : 2} className="ss-table-empty">
                            <i className="ri-inbox-line" />
                            {editMode
                              ? "Add components using the dropdown below"
                              : "No components defined"}
                          </td>
                        </tr>
                      ) : (
                        components.map((c, visibleIdx) => {
                          const isBasic = isBasicComponent(c, payrollComponents);
                          const isBalancing = isBalancingComponent(c, payrollComponents);

                          return (
                            <tr key={c._uid}>
                              <td>
                                <div className="ss-comp-name">
                                  <span className="ss-comp-dot" />
                                  {compDisplayName(c, visibleIdx, payrollComponents)}
                                  {isBasic && <span className="ss-tag is-basic">Basic</span>}
                                  {isBalancing && <span className="ss-tag is-balancing">Balancing</span>}
                                </div>
                              </td>

                              <td>
                                {isBalancing ? (
                                  <span className="ss-auto">
                                    <i className="ri-magic-line" />
                                    Auto-calculated — fills the remaining CTC/Gross amount
                                  </span>
                                ) : editMode ? (
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <Input
                                      data-testid={testId("salary-structure-list-calculation-type", itemTestKey(c), "select")}
                                      type="select"
                                      bsSize="sm"
                                      value={c.calculation_type || "fixed"}
                                      onChange={(e) =>
                                        setCompField(c._uid, "calculation_type", e.target.value)
                                      }
                                      style={{ width: "auto" }}
                                    >
                                      <option data-testid={testId("salary-structure-list-calculation-type", itemTestKey(c), "option-fixed")} value="fixed">Fixed (Rs.)</option>
                                      <option data-testid={testId("salary-structure-list-calculation-type", itemTestKey(c), "option-percentage")} value="percentage">Percentage (%)</option>
                                    </Input>

                                    <Input
                                      data-testid={testId("salary-structure-list-value", itemTestKey(c), "input")}
                                      bsSize="sm"
                                      type="number"
                                      min="0"
                                      placeholder="Value"
                                      value={c.calculation_value || ""}
                                      onChange={(e) =>
                                        setCompField(c._uid, "calculation_value", e.target.value)
                                      }
                                      style={{ width: 100 }}
                                    />

                                    {c.calculation_type === "percentage" &&
                                      (isBasic ? (
                                        <span className="ss-calc">of CTC</span>
                                      ) : (
                                        <Input
                                          data-testid={testId("salary-structure-list-calculation-based-on", itemTestKey(c), "select")}
                                          type="select"
                                          bsSize="sm"
                                          value={c.calculation_based_on || "ctc"}
                                          onChange={(e) =>
                                            setCompField(c._uid, "calculation_based_on", e.target.value)
                                          }
                                          style={{ width: "auto" }}
                                        >
                                          <option data-testid={testId("salary-structure-list-calculation-based-on", itemTestKey(c), "option-ctc")} value="ctc">of CTC</option>
                                          <option data-testid={testId("salary-structure-list-calculation-based-on", itemTestKey(c), "option-basic")} value="basic">of Basic</option>
                                        </Input>
                                      ))}
                                  </div>
                                ) : (
                                  <span className={`ss-calc ${c.calculation_type === "percentage" ? "is-pct" : "is-fixed"}`}>
                                    <i
                                      className={
                                        c.calculation_type === "percentage"
                                          ? "ri-percent-line"
                                          : "ri-money-dollar-circle-line"
                                      }
                                    />
                                    {formatCalc(c)}
                                  </span>
                                )}
                              </td>

                              {editMode && (
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    data-testid={testId("salary-structure-list-remove", itemTestKey(c), "button")}
                                    type="button"
                                    className="ss-remove"
                                    onClick={() => removeComponent(c._uid)}
                                    title="Remove"
                                  >
                                    <i className="ri-delete-bin-6-line" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {editMode && (
                  <div className="mt-2" style={{ maxWidth: 420 }}>
                    <AddComponentDropdown
                      label="Add Component"
                      options={availableOptions}
                      onSelect={addComponentFromDropdown}
                    />
                  </div>
                )}
              </div>

              {editMode && (
                <div className="ss-card-foot">
                  <CreateNewComponentMenu
                    onSelect={(type) => {
                      if (type === "recurring") setRecurringModalOpen(true);
                      else setVariableModalOpen(true);
                    }}
                  />
                  <div className="d-flex gap-2">
                    <Button data-testid="salary-structure-list-cancel-button" color="light" size="sm" onClick={handleCancel} disabled={loading}>
                      <i className="ri-close-line align-bottom me-1" />
                      Cancel
                    </Button>
                    <Button data-testid="salary-structure-list-save-structure-button" color="success" size="sm" onClick={handleSave} disabled={loading}>
                      <i className="ri-check-double-line align-bottom me-1" />
                      {loading ? "Saving…" : "Save Structure"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ss-empty">
              <span className="ss-head-icon">
                <i className="ri-node-tree" />
              </span>
              <div className="fw-semibold mt-2">{loading ? "Loading…" : "No structure selected"}</div>
              <div className="ss-muted">Pick a structure on the left or create a new one.</div>
            </div>
          )}
        </section>
      </div>

      <RecurringModal
        isOpen={recurringModalOpen}
        toggle={() => setRecurringModalOpen(false)}
        component={null}
        onSaved={handleNewComponentSaved}
      />

      <VariableModal
        isOpen={variableModalOpen}
        toggle={() => setVariableModalOpen(false)}
        component={null}
        onSaved={handleNewComponentSaved}
      />

      <style>{`
        .ss-wrap { position:relative; display:flex; flex-direction:column; gap:14px; }
        .ss-loading {
          position:absolute; inset:0; z-index:20; padding:16px; overflow:hidden;
          background:var(--vz-card-bg, #fff); border-radius:12px;
        }
        .ss-topbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .ss-topbar-info { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--vz-secondary-color); }
        .ss-count {
          min-width:28px; height:28px; padding:0 8px; border-radius:8px; font-weight:700; font-size:13px;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(var(--vz-primary-rgb), .1); color:var(--vz-primary);
        }
        .ss-body { display:grid; grid-template-columns:280px minmax(0,1fr); gap:16px; align-items:start; }
        @media (max-width: 991.98px) { .ss-body { grid-template-columns:1fr; } }

        .ss-list {
          border:1px solid var(--vz-border-color); border-radius:12px; background:var(--vz-secondary-bg);
          overflow:hidden; position:sticky; top:80px;
        }
        .ss-list-search {
          display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid var(--vz-border-color);
          color:var(--vz-secondary-color);
        }
        .ss-list-search input {
          flex:1; border:0; outline:0; background:transparent; font-size:13px; color:var(--vz-body-color);
        }
        .ss-list-search input::placeholder { color:var(--vz-secondary-color); }
        .ss-list-items { max-height:520px; overflow-y:auto; padding:6px; }
        .ss-list-empty {
          display:flex; flex-direction:column; align-items:center; gap:6px; padding:28px 12px;
          color:var(--vz-secondary-color); font-size:13px;
        }
        .ss-list-empty i { font-size:26px; opacity:.6; }
        .ss-item {
          display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; cursor:pointer;
          transition:background .15s ease; margin-bottom:2px;
        }
        .ss-item:hover { background:var(--vz-tertiary-bg); }
        .ss-item.is-active { background:rgba(var(--vz-primary-rgb), .1); }
        .ss-item.is-locked { opacity:.5; cursor:not-allowed; }
        .ss-item-avatar {
          width:34px; height:34px; flex:0 0 34px; border-radius:9px; font-size:12px; font-weight:700;
          display:inline-flex; align-items:center; justify-content:center;
          background:var(--vz-tertiary-bg); color:var(--vz-secondary-color);
        }
        .ss-item.is-active .ss-item-avatar { background:var(--vz-primary); color:#fff; }
        .ss-item-text { min-width:0; flex:1; }
        .ss-item-name {
          font-size:13.5px; font-weight:600; color:var(--vz-heading-color, var(--vz-body-color));
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .ss-item.is-active .ss-item-name { color:var(--vz-primary); }
        .ss-item-meta { display:flex; align-items:center; gap:5px; font-size:11.5px; color:var(--vz-secondary-color); }
        .ss-sep { opacity:.5; }
        .ss-dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
        .ss-dot.on { background:var(--vz-success); }
        .ss-dot.off { background:var(--vz-secondary-color); }
        .ss-item-arrow { color:var(--vz-secondary-color); opacity:0; transition:opacity .15s; }
        .ss-item:hover .ss-item-arrow, .ss-item.is-active .ss-item-arrow { opacity:1; }

        .ss-card {
          border:1px solid var(--vz-border-color); border-radius:12px; background:var(--vz-secondary-bg);
          box-shadow:0 2px 10px rgba(15,23,42,.04);
        }
        .ss-card-head {
          display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
          padding:16px 20px; border-bottom:1px solid var(--vz-border-color);
        }
        .ss-head-icon {
          width:44px; height:44px; flex:0 0 44px; border-radius:12px; font-size:20px;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(var(--vz-primary-rgb), .1); color:var(--vz-primary);
        }
        .ss-title { margin:0 0 4px; font-size:16px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); }
        .ss-head-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .ss-chip {
          display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px;
          font-size:11.5px; font-weight:600;
        }
        .ss-chip.is-on { background:rgba(var(--vz-success-rgb), .12); color:var(--vz-success); }
        .ss-chip.is-off { background:var(--vz-tertiary-bg); color:var(--vz-secondary-color); }
        .ss-chip.is-muted { background:var(--vz-tertiary-bg); color:var(--vz-secondary-color); }
        .ss-chip.is-warn { background:rgba(var(--vz-warning-rgb), .14); color:var(--vz-warning); }
        .ss-card-body { padding:18px 20px; }
        .ss-fields { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px; margin-bottom:20px; }
        @media (max-width: 767.98px) { .ss-fields { grid-template-columns:1fr; } }
        .ss-field {
          padding:12px 14px; border-radius:10px; background:var(--vz-tertiary-bg);
          border:1px solid var(--vz-border-color);
        }
        .ss-label {
          display:block; margin-bottom:4px; font-size:11px; font-weight:700; letter-spacing:.5px;
          text-transform:uppercase; color:var(--vz-secondary-color);
        }
        .ss-value { font-size:14px; font-weight:500; color:var(--vz-body-color); word-break:break-word; }
        .ss-value.is-empty { font-style:italic; color:var(--vz-secondary-color); font-weight:400; }
        .ss-section-title {
          display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:14px; font-weight:700;
          color:var(--vz-heading-color, var(--vz-body-color));
        }
        .ss-section-title i { color:var(--vz-primary); font-size:17px; }
        .ss-table-wrap { border:1px solid var(--vz-border-color); border-radius:10px; overflow:auto; }
        .ss-table { width:100%; border-collapse:collapse; font-size:13.5px; color:var(--vz-body-color); }
        .ss-table thead th {
          background:var(--vz-tertiary-bg); color:var(--vz-secondary-color); font-size:11.5px; font-weight:700;
          text-transform:uppercase; letter-spacing:.4px; padding:10px 14px; border-bottom:1px solid var(--vz-border-color);
        }
        .ss-table tbody td { padding:11px 14px; border-bottom:1px solid var(--vz-border-color); vertical-align:middle; }
        .ss-table tbody tr:last-child td { border-bottom:0; }
        .ss-table tbody tr:hover td { background:rgba(var(--vz-primary-rgb), .03); }
        .ss-table-empty { text-align:center; color:var(--vz-secondary-color); padding:22px 14px !important; }
        .ss-table-empty i { display:block; font-size:24px; opacity:.6; margin-bottom:4px; }
        .ss-comp-name { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-weight:500; }
        .ss-comp-dot { width:6px; height:6px; border-radius:50%; background:var(--vz-primary); flex-shrink:0; }
        .ss-tag { padding:1px 7px; border-radius:6px; font-size:10.5px; font-weight:600; }
        .ss-tag.is-basic { background:rgba(var(--vz-primary-rgb), .12); color:var(--vz-primary); }
        .ss-tag.is-balancing { background:rgba(var(--vz-info-rgb), .14); color:var(--vz-info); }
        .ss-calc {
          display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:8px;
          font-size:12.5px; font-weight:600; background:var(--vz-tertiary-bg); color:var(--vz-body-color);
        }
        .ss-calc.is-pct { background:rgba(var(--vz-primary-rgb), .08); color:var(--vz-primary); }
        .ss-calc.is-fixed { background:rgba(var(--vz-success-rgb), .1); color:var(--vz-success); }
        .ss-auto { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-style:italic; color:var(--vz-secondary-color); }
        .ss-remove {
          width:30px; height:30px; border:0; border-radius:8px; background:rgba(var(--vz-danger-rgb), .1);
          color:var(--vz-danger); display:inline-flex; align-items:center; justify-content:center; transition:all .15s;
        }
        .ss-remove:hover { background:var(--vz-danger); color:#fff; }
        .ss-card-foot {
          display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
          padding:12px 20px; border-top:1px solid var(--vz-border-color); background:var(--vz-tertiary-bg);
          border-radius:0 0 12px 12px;
        }
        .ss-empty {
          display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 16px;
          border:1px dashed var(--vz-border-color); border-radius:12px; color:var(--vz-body-color);
        }
        .ss-muted { font-size:13px; color:var(--vz-secondary-color); }

        .ss-dd-trigger {
          display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 12px; cursor:pointer;
          border:1px dashed var(--vz-border-color); border-radius:8px; background:var(--vz-secondary-bg);
          font-size:13px; font-weight:500; color:var(--vz-primary); transition:all .15s;
        }
        .ss-dd-trigger:hover { border-color:var(--vz-primary); background:rgba(var(--vz-primary-rgb), .05); }
        .ss-dd-menu {
          position:absolute; left:0; right:0; z-index:1060; margin-top:4px; max-height:260px; overflow-y:auto;
          background:var(--vz-secondary-bg); border:1px solid var(--vz-border-color); border-radius:10px;
          box-shadow:0 10px 24px rgba(15,23,42,.14);
        }
        .ss-dd-menu.is-up { top:auto; bottom:100%; margin:0 0 4px; min-width:220px; right:auto; }
        .ss-dd-search { padding:8px; border-bottom:1px solid var(--vz-border-color); position:sticky; top:0; background:var(--vz-secondary-bg); }
        .ss-dd-option {
          display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px 12px; cursor:pointer;
          font-size:13px; color:var(--vz-body-color);
        }
        .ss-dd-option:hover { background:rgba(var(--vz-primary-rgb), .07); color:var(--vz-primary); }
        .ss-dd-option small { color:var(--vz-secondary-color); font-size:11px; }
        .ss-dd-empty { padding:12px; font-size:13px; color:var(--vz-secondary-color); }
      `}</style>
    </div>
  );
}
