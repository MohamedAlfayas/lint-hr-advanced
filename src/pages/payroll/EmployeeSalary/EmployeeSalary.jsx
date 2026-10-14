import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
  Table,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { IconButton, Tooltip, Typography } from "@mui/material";
import {
  ApvChip,
  ApvDate,
  ApvEmployee,
  ApvEmpty,
  ApvStatus,
} from "../../../component/common/approval/ApprovalCells";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import AppTable from "../../../shared/ui/table/AppTable";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetApi } from "../../../common/api/GetApi";
import { setSalaryStructures } from "../../../redux/reducers/ChildReducer/SalaryStructureReducer";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

// ─── API helpers ──────────────────────────────────────────────────────────────
async function saveEmployeeSalary(payload) {
  const res = await PostApi("/payroll/employee-salary/", payload);

  if (res?.data?.error_message) {
    throw new Error(res.data.error_message);
  }

  return res.data.data;
}

// Component override is saved to the SAME url as the salary, using PUT.
async function saveComponentOverride(payload) {
  const res = await PutApi("/payroll/employee-salary/", payload);

  if (res?.data?.error_message) {
    throw new Error(res.data.error_message);
  }

  return res.data.data;
}

// ─── Component breakdown table inside modal (inline override editing) ──────────
const ComponentBreakdownTable = ({ components, onSaveOverride }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  if (!components || components.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <FeatherIcon icon="layers" size={32} className="mb-2 opacity-50" />
        <p className="mb-0 fs-13">
          Components will appear here after saving salary details.
        </p>
      </div>
    );
  }

  const earnings = components.filter(
    (c) =>
      c.component_type === "allowance" || c.component_type === "contribution",
  );
  const deductions = components.filter((c) => c.component_type === "deduction");
  const reimbursements = components.filter(
    (c) => c.component_type === "reimbursement",
  );

  const effectiveAmount = (c) =>
    Number(c.is_overridden ? c.override_amount : c.calculated_amount);

  const startEdit = (comp) => {
    setEditingId(comp.id);
    setEditValue(String(effectiveAmount(comp)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (comp) => {
    if (editValue === "" || isNaN(Number(editValue))) return;
    setSavingId(comp.id);
    try {
      await onSaveOverride(comp, Number(editValue));
      setEditingId(null);
      setEditValue("");
    } catch {
      // error is surfaced by the parent modal
    } finally {
      setSavingId(null);
    }
  };

  const SectionRows = ({ items, label }) => {
    if (!items.length) return null;
    return (
      <>
        <tr>
          <td
            colSpan={4}
            className="fw-semibold text-uppercase fs-11 text-muted surface-muted py-2 px-3"
            style={{ letterSpacing: "0.08em" }}
          >
            {label}
          </td>
        </tr>
        {items.map((comp) => {
          const isEditing = editingId === comp.id;
          const isSaving = savingId === comp.id;
          return (
            <tr key={comp.id}>
              <td className="ps-3 py-2">
                <span className="fw-medium fs-13">{comp.component_name}</span>
              </td>

              {/* Monthly Amount — editable when overriding */}
              <td className="text-end py-2">
                {isEditing ? (
                  <Input
                    data-testid={testId("employee-salary-edit-value", itemTestKey(comp), "input")}
                    type="number"
                    bsSize="sm"
                    value={editValue}
                    autoFocus
                    className="text-end"
                    style={{ maxWidth: 130, marginLeft: "auto" }}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(comp);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  <span className="text-success fw-semibold">
                    ₹{" "}
                    {effectiveAmount(comp).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
              </td>

              <td className="text-center py-2">
                {comp.is_overridden ? (
                  <Badge color="warning" className="fs-11">
                    Overridden
                  </Badge>
                ) : (
                  <Badge color="light" className="text-muted fs-11">
                    Computed
                  </Badge>
                )}
              </td>

              {/* Action — Override / Save + Cancel */}
              <td className="text-center py-2">
                {isEditing ? (
                  <div className="d-flex gap-1 justify-content-center">
                    <Button
                      data-testid={testId("employee-salary-component", itemTestKey(comp), "save-button")}
                      size="sm"
                      color="success"
                      className="btn-sm py-1 px-2 fs-11"
                      disabled={isSaving}
                      onClick={() => saveEdit(comp)}
                    >
                      {isSaving ? (
                        <Spinner size="sm" />
                      ) : (
                        <FeatherIcon icon="check" size={12} />
                      )}
                    </Button>
                    <Button
                      data-testid={testId("employee-salary-component", itemTestKey(comp), "cancel-button")}
                      size="sm"
                      color="light"
                      className="btn-sm py-1 px-2 fs-11"
                      disabled={isSaving}
                      onClick={cancelEdit}
                    >
                      <FeatherIcon icon="x" size={12} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    data-testid={testId("employee-salary-component", itemTestKey(comp), "override-button")}
                    size="sm"
                    color="light"
                    className="btn-sm py-1 px-2 fs-11"
                    onClick={() => startEdit(comp)}
                  >
                    <FeatherIcon icon="edit-2" size={12} className="me-1" />
                    Override
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  const totalEarnings = earnings.reduce((s, c) => s + effectiveAmount(c), 0);
  const totalDeductions = deductions.reduce(
    (s, c) => s + effectiveAmount(c),
    0,
  );

  return (
    <div className="table-responsive">
      <Table size="sm" bordered className="mb-0 align-middle">
        <thead className="table-surface">
          <tr>
            <th className="ps-3 fw-semibold fs-12">Component</th>
            <th className="text-end fw-semibold fs-12">Monthly Amount</th>
            <th className="text-center fw-semibold fs-12">Status</th>
            <th className="text-center fw-semibold fs-12">Action</th>
          </tr>
        </thead>
        <tbody>
          <SectionRows items={earnings} label="Earnings" />
          <SectionRows items={deductions} label="Deductions" />
          <SectionRows items={reimbursements} label="Reimbursements" />
        </tbody>
        <tfoot>
          <tr className="table-surface fw-bold">
            <td className="ps-3 fs-13">Net Monthly Pay</td>
            <td className="text-end text-success fs-13">
              ₹{" "}
              {(totalEarnings - totalDeductions).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

// ─── Salary Modal ─────────────────────────────────────────────────────────────
const SalaryModal = ({ isOpen, toggle, employee, structureOptions, companyLeavePolicy, taxPolicy, onSaved }) => {
  const isEdit = !!employee?.salary_id;
  const [leave, setLeave] = useState({
    monthly_credit: "", yearly_credit: "", max_carry_forward: "", pay_remaining: "",
  });
  // Per-employee income-tax declaration. regime "" = follow company default.
  const [tax, setTax] = useState({
    regime: "", invest_80c: "", invest_80ccd_1b: "", invest_80d: "",
    invest_80tta: "", home_loan_interest: "", annual_rent_paid: "", is_metro: false,
  });

  const [form, setForm] = useState({
    based_on: "ctc",
    salary_structure: null,
    ctc_amount: "",
    gross_amount: "",
    effective_date: "",
    remarks: "",
  });
  const [components, setComponents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const basedOnOptions = [
    { value: "ctc", label: "CTC (Cost to Company)" },
    { value: "gross", label: "Gross Salary" },
  ];

  // Escapes the scrollable ModalBody's clipping context so react-select
  // menus float above later content (Leave Policy / Tax Declaration cards)
  // instead of rendering hidden behind them.
  const selectPortalProps = {
    menuPortalTarget: document.body,
    menuPosition: "fixed",
    styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  };

  useEffect(() => {
    if (isOpen && employee) {
      const lo = employee.leave_override || {};
      setLeave({
        monthly_credit: lo.monthly_credit ?? "",
        yearly_credit: lo.yearly_credit ?? "",
        max_carry_forward: lo.max_carry_forward ?? "",
        pay_remaining: lo.pay_remaining == null ? "" : (lo.pay_remaining ? "yes" : "no"),
      });
      const td = employee.tax_declaration || {};
      setTax({
        regime: td.regime ?? "",
        invest_80c: td.invest_80c ?? "", invest_80ccd_1b: td.invest_80ccd_1b ?? "",
        invest_80d: td.invest_80d ?? "", invest_80tta: td.invest_80tta ?? "",
        home_loan_interest: td.home_loan_interest ?? "",
        annual_rent_paid: td.annual_rent_paid ?? "", is_metro: !!td.is_metro,
      });
      setForm({
        based_on: employee.based_on || "ctc",
        salary_structure: employee.salary_structure_id
          ? {
              value: employee.salary_structure_id,
              label: employee.salary_structure_name,
            }
          : null,
        ctc_amount: employee.ctc_amount || "",
        gross_amount: employee.gross_amount || "",
        effective_date: employee.effective_date || "",
        remarks: "",
      });
      setComponents(employee.salary_components || []);
      setError("");
    }
  }, [isOpen, employee]);

  const handleSave = async () => {
    setError("");
    if (!form.salary_structure)
      return setError("Please select a Salary Structure.");
    if (!form.effective_date) return setError("Effective Date is required.");
    if (form.based_on === "ctc" && !form.ctc_amount)
      return setError("CTC Amount is required.");
    if (form.based_on === "gross" && !form.gross_amount)
      return setError("Gross Amount is required.");

    setSaving(true);
    try {
      const payload = {
        employee: employee.id,
        salary_structure: form.salary_structure.value,
        based_on: form.based_on,
        ctc_amount: form.based_on === "ctc" ? form.ctc_amount : null,
        gross_amount: form.based_on === "gross" ? form.gross_amount : null,
        effective_date: form.effective_date,
        remarks: form.remarks,
        leave_policy: {
          monthly_credit: leave.monthly_credit === "" ? null : leave.monthly_credit,
          yearly_credit: leave.yearly_credit === "" ? null : leave.yearly_credit,
          max_carry_forward: leave.max_carry_forward === "" ? null : leave.max_carry_forward,
          pay_remaining: leave.pay_remaining === "" ? null : leave.pay_remaining === "yes",
        },
        tax_declaration: {
          regime: tax.regime === "" ? null : tax.regime,
          invest_80c: tax.invest_80c === "" ? 0 : tax.invest_80c,
          invest_80ccd_1b: tax.invest_80ccd_1b === "" ? 0 : tax.invest_80ccd_1b,
          invest_80d: tax.invest_80d === "" ? 0 : tax.invest_80d,
          invest_80tta: tax.invest_80tta === "" ? 0 : tax.invest_80tta,
          home_loan_interest: tax.home_loan_interest === "" ? 0 : tax.home_loan_interest,
          annual_rent_paid: tax.annual_rent_paid === "" ? 0 : tax.annual_rent_paid,
          is_metro: tax.is_metro,
        },
      };
      const saved = await saveEmployeeSalary(payload);
      // keep the breakdown in sync if the API returns recomputed components
      if (saved?.salary_components) setComponents(saved.salary_components);
      onSaved(saved);
      toggle();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Inline override save — same employee-salary url, PUT method.
  const handleSaveOverride = async (comp, amount) => {
    setError("");
    try {
      const payload = {
        // adjust field names to match your backend contract if needed
        employee: employee.id,
        salary_id: employee.salary_id,
        component_id: comp.id,
        override_amount: amount,
        is_overridden: true,
      };
      const updated = await saveComponentOverride(payload);

      // If backend returns the refreshed component list, use it; otherwise
      // patch the single row locally so the UI updates immediately.
      if (updated?.salary_components) {
        setComponents(updated.salary_components);
      } else {
        setComponents((prev) =>
          prev.map((c) =>
            c.id === comp.id
              ? { ...c, is_overridden: true, override_amount: amount }
              : c,
          ),
        );
      }
    } catch (err) {
      setError(err?.message || "Failed to save override.");
      throw err; // lets the row reset its saving spinner
    }
  };

  return (
    <Modal data-testid="employee-salary-edit-salary-details-dialog" isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
      <ModalHeader close={<ModalCloseButton onClick={toggle} testId="employee-salary-edit-salary-details-close-button" />} toggle={toggle} className="border-bottom pb-3">
        <div>
          <h5 className="mb-0 fw-semibold">
            {isEdit ? "Edit Salary Details" : "Set Salary Details"}
          </h5>
          {employee && (
            <p className="mb-0 fs-12 text-muted mt-1">
              {employee.name} &nbsp;·&nbsp; {employee.emp_id}
            </p>
          )}
        </div>
      </ModalHeader>

      <ModalBody className="p-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
            <FeatherIcon icon="alert-circle" size={15} />
            <span className="fs-13">{error}</span>
          </div>
        )}

        {/* Salary Structure & Based On */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <Label className="form-label fw-medium">
              Salary Structure <span className="text-danger">*</span>
            </Label>
            <Select
              testId="employee-salary-edit-salary-details-select-structure"
              options={structureOptions}
              value={form.salary_structure}
              onChange={(val) =>
                setForm((p) => ({ ...p, salary_structure: val }))
              }
              placeholder="Select structure..."
              classNamePrefix="select2-selection"
              {...selectPortalProps}
            />
          </Col>

          <Col md={6}>
            <Label className="form-label fw-medium">
              Calculate Salary Based On <span className="text-danger">*</span>
            </Label>
            <Select
              testId="employee-salary-edit-salary-details-calculate-salary-based-on"
              options={basedOnOptions}
              value={basedOnOptions.find((o) => o.value === form.based_on)}
              onChange={(val) =>
                setForm((p) => ({ ...p, based_on: val.value }))
              }
              classNamePrefix="select2-selection"
              {...selectPortalProps}
            />
          </Col>

          {form.based_on === "ctc" && (
            <Col md={6}>
              <Label className="form-label fw-medium">
                Annual CTC Amount (₹) <span className="text-danger">*</span>
              </Label>
              <Input
                data-testid="employee-salary-edit-salary-details-e-g-600000-input"
                type="number"
                value={form.ctc_amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ctc_amount: e.target.value }))
                }
                placeholder="e.g. 600000"
              />
              {form.ctc_amount && (
                <div className="form-text text-success">
                  Monthly: ₹{" "}
                  {(Number(form.ctc_amount) / 12).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}
            </Col>
          )}

          {form.based_on === "gross" && (
            <Col md={6}>
              <Label className="form-label fw-medium">
                Monthly Gross Amount (₹) <span className="text-danger">*</span>
              </Label>
              <Input
                data-testid="employee-salary-edit-salary-details-e-g-50000-input"
                type="number"
                value={form.gross_amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gross_amount: e.target.value }))
                }
                placeholder="e.g. 50000"
              />
            </Col>
          )}

          <Col md={6}>
            <Label className="form-label fw-medium">
              Effective Date <span className="text-danger">*</span>
            </Label>
            <Input
              data-testid="employee-salary-edit-salary-details-effective-date-input"
              type="date"
              value={form.effective_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, effective_date: e.target.value }))
              }
            />
          </Col>

          {isEdit && (
            <Col md={12}>
              <Label className="form-label fw-medium">
                Remarks (Revision Note)
              </Label>
              <Input
                data-testid="employee-salary-edit-salary-details-reason-for-salary-revision-textarea"
                type="textarea"
                rows={2}
                value={form.remarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remarks: e.target.value }))
                }
                placeholder="Reason for salary revision..."
              />
            </Col>
          )}
        </Row>

        {companyLeavePolicy && (
          <div className="border rounded overflow-hidden mb-4">
            <div className="surface-muted px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold fs-13 text-body">Leave Policy (per-employee override)</span>
              <span className="fs-11 text-muted">Blank = company default</span>
            </div>
            <div className="p-3">
              <Row className="g-3">
                {companyLeavePolicy.credit_based ? (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Monthly Credit (days)</Label>
                    <Input
                      data-testid="employee-salary-edit-salary-details-monthly-credit-days-input" type="number" step="0.01" min="0" value={leave.monthly_credit}
                      placeholder={`Default: ${companyLeavePolicy.monthly_credit}`}
                      onChange={(e) => setLeave((p) => ({ ...p, monthly_credit: e.target.value }))} />
                  </Col>
                ) : (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Yearly Credit (days)</Label>
                    <Input
                      data-testid="employee-salary-edit-salary-details-yearly-credit-days-input" type="number" step="0.01" min="0" value={leave.yearly_credit}
                      placeholder={`Default: ${companyLeavePolicy.yearly_credit}`}
                      onChange={(e) => setLeave((p) => ({ ...p, yearly_credit: e.target.value }))} />
                  </Col>
                )}
                {companyLeavePolicy.carry_forward && (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Max Carry Forward (days)</Label>
                    <Input
                      data-testid="employee-salary-edit-salary-details-max-carry-forward-days-input" type="number" step="0.01" min="0" value={leave.max_carry_forward}
                      placeholder={`Default: ${companyLeavePolicy.max_carry_forward}`}
                      onChange={(e) => setLeave((p) => ({ ...p, max_carry_forward: e.target.value }))} />
                  </Col>
                )}
                <Col md={6}>
                  <Label className="form-label fw-medium">Remainder</Label>
                  <Select
                    testId="employee-salary-edit-salary-details-remainder"
                    options={[
                      { value: "", label: `Company default (${companyLeavePolicy.pay_remaining ? "Encash" : "Lapse"})` },
                      { value: "yes", label: "Encash" },
                      { value: "no", label: "Lapse" },
                    ]}
                    value={
                      leave.pay_remaining === "" ? { value: "", label: `Company default (${companyLeavePolicy.pay_remaining ? "Encash" : "Lapse"})` }
                      : leave.pay_remaining === "yes" ? { value: "yes", label: "Encash" } : { value: "no", label: "Lapse" }
                    }
                    onChange={(o) => setLeave((p) => ({ ...p, pay_remaining: o.value }))}
                    classNamePrefix="select2-selection"
                    {...selectPortalProps}
                  />
                </Col>
              </Row>
            </div>
          </div>
        )}

        {/* Income Tax Declaration (per-employee) */}
        {taxPolicy && (
          <div className="border rounded overflow-hidden mb-4">
            <div className="surface-muted px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold fs-13 text-body">Income Tax Declaration</span>
              <span className="fs-11 text-muted">Blank regime = company default ({taxPolicy.default_regime})</span>
            </div>
            <div className="p-3">
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Label className="form-label fw-medium">Tax Regime</Label>
                  <Select
                    testId="employee-salary-edit-salary-details-tax-regime"
                    options={[
                      { value: "", label: `Company default (${taxPolicy.default_regime})` },
                      { value: "new", label: "New Regime" },
                      { value: "old", label: "Old Regime" },
                    ]}
                    value={
                      tax.regime === "" ? { value: "", label: `Company default (${taxPolicy.default_regime})` }
                      : tax.regime === "new" ? { value: "new", label: "New Regime" }
                      : { value: "old", label: "Old Regime" }
                    }
                    onChange={(o) => setTax((p) => ({ ...p, regime: o.value }))}
                    classNamePrefix="select2-selection"
                    {...selectPortalProps}
                  />
                </Col>
              </Row>

              {/* Old-regime declarations only matter when the effective regime is old */}
              {(tax.regime === "old" || (tax.regime === "" && taxPolicy.default_regime === "old")) && (
                <>
                  <div className="text-uppercase fw-semibold text-muted mt-4 mb-2" style={{ fontSize: 11, letterSpacing: ".8px" }}>
                    Old-Regime Declarations (annual)
                  </div>
                  <Row className="g-3">
                    {[
                      ["invest_80c", "80C (max ₹1.5L)"],
                      ["invest_80ccd_1b", "80CCD(1B) NPS (max ₹50k)"],
                      ["invest_80d", "80D Health insurance"],
                      ["invest_80tta", "80TTA Savings interest (max ₹10k)"],
                      ["home_loan_interest", "Sec 24 Home-loan interest (max ₹2L)"],
                      ["annual_rent_paid", "Annual rent paid (for HRA)"],
                    ].map(([k, lbl]) => (
                      <Col md={4} key={k}>
                        <Label className="form-label fw-medium">{lbl}</Label>
                        <Input data-testid={testId("employee-salary-tax", k, "input")} type="number" min="0" value={tax[k]}
                          onChange={(e) => setTax((p) => ({ ...p, [k]: e.target.value }))} />
                      </Col>
                    ))}
                    <Col md={4} className="d-flex align-items-center">
                      <div className="form-check form-switch mt-4">
                        <Input
                          data-testid="employee-salary-edit-salary-details-is-metro-checkbox" className="form-check-input" type="checkbox" checked={tax.is_metro}
                          onChange={() => setTax((p) => ({ ...p, is_metro: !p.is_metro }))} />
                        <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>Metro city (HRA 50%)</Label>
                      </div>
                    </Col>
                  </Row>
                  <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                    HRA exemption is computed from the employee's Basic & HRA components + rent above.
                    Declared amounts are capped automatically by the company policy.
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Component Breakdown */}
        <div className="border rounded overflow-hidden">
          <div className="surface-muted px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
            <span className="fw-semibold fs-13 text-body">
              Component Breakdown
            </span>
            <span className="fs-11 text-muted">
              Auto-computed from salary structure
            </span>
          </div>
          <ComponentBreakdownTable
            components={components}
            onSaveOverride={handleSaveOverride}
          />
        </div>

        {components.length > 0 && (
          <div className="mt-3 d-flex align-items-start gap-2 p-3 rounded bg-info-subtle border border-info border-opacity-25">
            <FeatherIcon
              icon="info"
              size={15}
              className="text-info mt-1 flex-shrink-0"
            />
            <p className="mb-0 fs-12 text-muted">
              Component amounts are auto-calculated from the salary structure
              rules. Click <strong>Override</strong> on any component to edit
              its monthly amount inline, then press the green check (or Enter)
              to save.
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="border-top pt-3">
        <Button data-testid="employee-salary-edit-salary-details-cancel-button" color="light" onClick={toggle} disabled={saving}>
          Cancel
        </Button>
        <Button
          data-testid="employee-salary-edit-salary-details-update-salary-button"
          color="success"
          onClick={handleSave}
          disabled={saving}
          className="btn-label"
        >
          {saving ? (
            <Spinner size="sm" className="me-2" />
          ) : (
            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
          )}
          {isEdit ? "Update Salary" : "Save & Compute Components"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const amountLabel = (emp) =>
  emp.based_on === "ctc"
    ? emp.ctc_amount
      ? `₹ ${Number(emp.ctc_amount).toLocaleString("en-IN")} / yr`
      : "—"
    : emp.gross_amount
      ? `₹ ${Number(emp.gross_amount).toLocaleString("en-IN")} / mo`
      : "—";

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeeSalary = () => {
  const dispatch = useDispatch();

  // Read the structure list from Redux. SalaryStructureTable dispatches
  // setSalaryStructures / addSalaryStructure / editSalaryStructure on save,
  // so any new or edited structure flows into this Select immediately.
  const salaryStructures =
    useSelector((state) => state.SalaryStructureReducer.salary_structures) ||
    [];

  const structureOptions = salaryStructures.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null); // react-select option | null
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [companyLeavePolicy, setCompanyLeavePolicy] = useState(null);
  const [taxPolicy, setTaxPolicy] = useState(null);

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetApi("/payroll/employee-salary/");
      const data = res?.data?.data || [];
      setEmployees(Array.isArray(data) ? data : []);

      const res1 = await GetApi("/payroll/salary-structure/");
      const data1 = res1?.data?.data || [];
      dispatch(setSalaryStructures(Array.isArray(data1) ? data1 : []));

      const res2 = await GetApi("/department/get/");
      const data2 = res2?.data?.data || [];
      setDepartments(Array.isArray(data2) ? data2 : []);

      const res3 = await GetApi("/payroll/company-leave-policy/");
      const clp = (res3?.data?.data || [])[0] || null;  // latest version
      setCompanyLeavePolicy(clp);

      const res4 = await GetApi("/payroll/income-tax-policy/");
      const itp = (res4?.data?.data || [])[0] || null;  // latest version
      setTaxPolicy(itp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const openModal = (emp) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const handleSaved = (updatedData) => {
    if (!updatedData) return;
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === updatedData.employee);
      if (idx === -1) return [...prev, updatedData];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updatedData };
      return copy;
    });
    loadData();
  };

  const filtered = employees.filter(
    (e) =>
      !selectedDepartment ||
      String(e.department_id) === String(selectedDepartment.value),
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (emp) => emp.name || "",
        header: "Employee",
        Cell: ({ row }) => (
          <ApvEmployee
            employee={{ first_name: row.original.name, profile_url: row.original.image_url }}
            sub={row.original.emp_id ? `#${row.original.emp_id}` : null}
          />
        ),
      },
      { accessorKey: "emp_id", header: "Emp ID" },
      {
        id: "salary_structure_name",
        accessorFn: (emp) => emp.salary_structure_name || "Not assigned",
        header: "Salary Structure",
        filterVariant: "select",
        Cell: ({ row }) =>
          row.original.salary_structure_name ? (
            <ApvChip icon="ri-stack-line">{row.original.salary_structure_name}</ApvChip>
          ) : (
            <span className="apv-muted">Not assigned</span>
          ),
      },
      {
        id: "based_on",
        accessorFn: (emp) => (emp.salary_structure_name ? emp.based_on?.toUpperCase() || "" : ""),
        header: "Based On",
        filterVariant: "select",
        Cell: ({ row }) =>
          row.original.salary_structure_name ? (
            <ApvStatus
              tone={row.original.based_on === "ctc" ? "success" : "info"}
              label={row.original.based_on?.toUpperCase()}
            />
          ) : (
            <ApvEmpty />
          ),
      },
      {
        id: "amount",
        accessorFn: (emp) =>
          Number((emp.based_on === "ctc" ? emp.ctc_amount : emp.gross_amount) || 0),
        header: "Annual CTC / Monthly Gross",
        filterVariant: "range",
        exportValue: amountLabel,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {amountLabel(row.original)}
          </Typography>
        ),
      },
      {
        accessorKey: "effective_date",
        header: "Effective Date",
        Cell: ({ cell }) => <ApvDate value={cell.getValue()} />,
      },
      {
        id: "status",
        accessorFn: (emp) => (emp.salary_structure_name ? "Active" : "Pending"),
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) =>
          row.original.salary_structure_name ? (
            <ApvStatus tone="success" icon="ri-checkbox-circle-line" label="Active" />
          ) : (
            <ApvStatus tone="warning" icon="ri-time-line" label="Pending" />
          ),
      },
    ],
    [],
  );

  const stats = {
    total: employees.length,
    assigned: employees.filter((e) => e.salary_structure_name).length,
    pending: employees.filter((e) => !e.salary_structure_name).length,
  };

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
          <Button data-testid="employee-salary-exit-full-screen-esc-button" color="light" size="sm" className="border" style={{display: "flex", alignItems: "center"}} onClick={() => setFullscreen(false)}>
            <i className="ri-fullscreen-exit-line me-1"></i>Exit Full Screen (Esc)
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="mb-1 fw-semibold">Employee Salary</h5>
          <p className="text-muted mb-0 fs-13">
            Set CTC or gross salary for each employee and manage component
            breakdowns.
          </p>
        </div>
        {!fullscreen && (
          <Button
            data-testid="employee-salary-full-screen-button"
            color="light"
            className="border"
            onClick={() => setFullscreen(true)}
            title="Full screen view"
            style={{display: "flex", alignItems: "center"}}
          >
            <i className="ri-fullscreen-line me-1"></i>Full Screen
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {[
          {
            label: "Total Employees",
            value: stats.total,
            icon: "users",
            color: "primary",
          },
          {
            label: "Salary Assigned",
            value: stats.assigned,
            icon: "check-circle",
            color: "success",
          },
          {
            label: "Pending Setup",
            value: stats.pending,
            icon: "clock",
            color: "warning",
          },
        ].map((stat) => (
          <Col md={4} key={stat.label}>
            <Card className="shadow-none border mb-0">
              <CardBody className="p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`avatar-sm rounded bg-${stat.color}-subtle d-flex align-items-center justify-content-center flex-shrink-0`}
                  >
                    <FeatherIcon
                      icon={stat.icon}
                      size={18}
                      className={`text-${stat.color}`}
                    />
                  </div>
                  <div>
                    <p className="mb-0 fs-12 text-muted">{stat.label}</p>
                    <h5 className="mb-0 fw-bold">{stat.value}</h5>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <AppTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        onRefresh={loadData}
        exportFileName="employee-salary"
        emptyMessage="No employees found."
        getRowId={(emp) => String(emp.id)}
        muiTableContainerProps={{
          sx: { maxHeight: fullscreen ? "calc(100vh - 320px)" : "calc(100vh - 360px)" },
        }}
        toolbarActions={
          <div style={{ width: 220 }}>
            <Select
              testId="employee-salary-filter-by-department"
              options={departmentOptions}
              value={selectedDepartment}
              onChange={(val) => setSelectedDepartment(val)}
              isClearable
              placeholder="Filter by department..."
              classNamePrefix="select2-selection"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        }
        enableRowActions
        positionActionsColumn="last"
        displayColumnDefOptions={{ "mrt-row-actions": { header: "Actions", size: 90 } }}
        renderRowActions={({ row }) => {
          const hasSalary = !!row.original.salary_structure_name;
          return (
            <Tooltip title={hasSalary ? "Edit" : "Set Salary"}>
              <IconButton
                data-testid="employee-salary-edit-button"
                size="small"
                color={hasSalary ? "primary" : "success"}
                onClick={() => openModal(row.original)}
              >
                {hasSalary ? <EditOutlinedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          );
        }}
      />

      {/* Salary Modal */}
      <SalaryModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        employee={selectedEmployee}
        structureOptions={structureOptions}
        companyLeavePolicy={companyLeavePolicy}
        taxPolicy={taxPolicy}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default EmployeeSalary;
