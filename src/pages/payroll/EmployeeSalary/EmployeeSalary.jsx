import React, { useState, useEffect, useCallback } from "react";
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
import Select from "react-select";
import SimpleBar from "simplebar-react";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetApi } from "../../../common/api/GetApi";
import { setSalaryStructures } from "../../../redux/reducers/ChildReducer/SalaryStructureReducer";

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
            className="fw-semibold text-uppercase fs-11 text-muted bg-light py-2 px-3"
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
        <thead className="table-light">
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
          <tr className="table-light fw-bold">
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
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
      <ModalHeader toggle={toggle} className="border-bottom pb-3">
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
              options={structureOptions}
              value={form.salary_structure}
              onChange={(val) =>
                setForm((p) => ({ ...p, salary_structure: val }))
              }
              placeholder="Select structure..."
              classNamePrefix="select2-selection"
            />
          </Col>

          <Col md={6}>
            <Label className="form-label fw-medium">
              Calculate Salary Based On <span className="text-danger">*</span>
            </Label>
            <Select
              options={basedOnOptions}
              value={basedOnOptions.find((o) => o.value === form.based_on)}
              onChange={(val) =>
                setForm((p) => ({ ...p, based_on: val.value }))
              }
              classNamePrefix="select2-selection"
            />
          </Col>

          {form.based_on === "ctc" && (
            <Col md={6}>
              <Label className="form-label fw-medium">
                Annual CTC Amount (₹) <span className="text-danger">*</span>
              </Label>
              <Input
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
            <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold fs-13 text-dark">Leave Policy (per-employee override)</span>
              <span className="fs-11 text-muted">Blank = company default</span>
            </div>
            <div className="p-3">
              <Row className="g-3">
                {companyLeavePolicy.credit_based ? (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Monthly Credit (days)</Label>
                    <Input type="number" step="0.01" min="0" value={leave.monthly_credit}
                      placeholder={`Default: ${companyLeavePolicy.monthly_credit}`}
                      onChange={(e) => setLeave((p) => ({ ...p, monthly_credit: e.target.value }))} />
                  </Col>
                ) : (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Yearly Credit (days)</Label>
                    <Input type="number" step="0.01" min="0" value={leave.yearly_credit}
                      placeholder={`Default: ${companyLeavePolicy.yearly_credit}`}
                      onChange={(e) => setLeave((p) => ({ ...p, yearly_credit: e.target.value }))} />
                  </Col>
                )}
                {companyLeavePolicy.carry_forward && (
                  <Col md={6}>
                    <Label className="form-label fw-medium">Max Carry Forward (days)</Label>
                    <Input type="number" step="0.01" min="0" value={leave.max_carry_forward}
                      placeholder={`Default: ${companyLeavePolicy.max_carry_forward}`}
                      onChange={(e) => setLeave((p) => ({ ...p, max_carry_forward: e.target.value }))} />
                  </Col>
                )}
                <Col md={6}>
                  <Label className="form-label fw-medium">Remainder</Label>
                  <Select
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
                  />
                </Col>
              </Row>
            </div>
          </div>
        )}

        {/* Income Tax Declaration (per-employee) */}
        {taxPolicy && (
          <div className="border rounded overflow-hidden mb-4">
            <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold fs-13 text-dark">Income Tax Declaration</span>
              <span className="fs-11 text-muted">Blank regime = company default ({taxPolicy.default_regime})</span>
            </div>
            <div className="p-3">
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Label className="form-label fw-medium">Tax Regime</Label>
                  <Select
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
                        <Input type="number" min="0" value={tax[k]}
                          onChange={(e) => setTax((p) => ({ ...p, [k]: e.target.value }))} />
                      </Col>
                    ))}
                    <Col md={4} className="d-flex align-items-center">
                      <div className="form-check form-switch mt-4">
                        <Input className="form-check-input" type="checkbox" checked={tax.is_metro}
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
          <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
            <span className="fw-semibold fs-13 text-dark">
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
        <Button color="light" onClick={toggle} disabled={saving}>
          Cancel
        </Button>
        <Button
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
  const [search, setSearch] = useState("");
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

  const filtered = employees.filter((e) => {
    const matchesSearch =
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.emp_id?.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      !selectedDepartment ||
      String(e.department_id) === String(selectedDepartment.value);

    return matchesSearch && matchesDepartment;
  });

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
          <Button color="light" size="sm" className="border" style={{display: "flex", alignItems: "center"}} onClick={() => setFullscreen(false)}>
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

      {/* Table Card */}
      <Card className="shadow-none border">
        <CardBody className="p-0">
          {/* Search + Department filter — placed right next to each other,
              minimal gap, no extra Row/Col width allocated beyond what each
              control needs. */}
          <div className="p-3 border-bottom d-flex align-items-center gap-2 flex-wrap">
            <div className="search-box" style={{ width: 260 }}>
              <Input
                type="search"
                className="form-control search"
                placeholder="Search employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
            <div style={{ width: 220 }}>
              <Select
                options={departmentOptions}
                value={selectedDepartment}
                onChange={(val) => setSelectedDepartment(val)}
                isClearable
                placeholder="Filter by department..."
                classNamePrefix="select2-selection"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="success" />
              <p className="mt-2 text-muted fs-13">
                Loading employee salaries...
              </p>
            </div>
          ) : (
            <SimpleBar
              style={{ maxHeight: fullscreen ? "calc(100vh - 320px)" : "calc(100vh - 360px)" }}
              autoHide={false}
            >
              <div className="table-responsive">
                <Table className="table-hover table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 fw-semibold fs-12">Employee</th>
                      <th className="fw-semibold fs-12">Salary Structure</th>
                      <th className="fw-semibold fs-12">Based On</th>
                      <th className="fw-semibold fs-12">
                        Annual CTC / Monthly Gross
                      </th>
                      <th className="fw-semibold fs-12">Effective Date</th>
                      <th className="fw-semibold fs-12">Status</th>
                      <th className="text-center fw-semibold fs-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <FeatherIcon
                            icon="inbox"
                            size={36}
                            className="mb-2 opacity-40"
                          />
                          <p className="mb-0">No employees found.</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((emp) => {
                        const hasSalary = !!emp.salary_structure_name;
                        const amount =
                          emp.based_on === "ctc"
                            ? emp.ctc_amount
                              ? `₹ ${Number(emp.ctc_amount).toLocaleString("en-IN")} / yr`
                              : "—"
                            : emp.gross_amount
                              ? `₹ ${Number(emp.gross_amount).toLocaleString("en-IN")} / mo`
                              : "—";

                        return (
                          <tr key={emp.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="avatar-xs rounded-circle bg-success-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{ width: 32, height: 32 }}
                                >
                                  {emp.image_url ? (
                                    <img
                                      src={emp.image_url}
                                      alt={emp.name}
                                      className="rounded-circle"
                                      width={32}
                                      height={32}
                                      style={{ objectFit: "cover" }}
                                    />
                                  ) : (
                                    <span className="text-success fw-bold fs-12">
                                      {(emp.name || "?")[0].toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="mb-0 fw-medium fs-13">
                                    {emp.name}
                                  </p>
                                  <p className="mb-0 text-muted fs-11">
                                    {emp.emp_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="fs-13">
                              {emp.salary_structure_name || (
                                <span className="text-muted">Not assigned</span>
                              )}
                            </td>
                            <td>
                              {hasSalary ? (
                                <Badge
                                  color={
                                    emp.based_on === "ctc" ? "primary" : "info"
                                  }
                                  className="fs-11"
                                >
                                  {emp.based_on?.toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-muted fs-13">—</span>
                              )}
                            </td>
                            <td className="fw-medium fs-13">{amount}</td>
                            <td className="fs-13 text-muted">
                              {emp.effective_date || "—"}
                            </td>
                            <td>
                              {hasSalary ? (
                                <Badge
                                  color="success-subtle"
                                  className="text-success fs-11 border border-success border-opacity-25"
                                >
                                  <FeatherIcon
                                    icon="check"
                                    size={10}
                                    className="me-1"
                                  />
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  color="warning-subtle"
                                  className="text-warning fs-11 border border-warning border-opacity-25"
                                >
                                  <FeatherIcon
                                    icon="clock"
                                    size={10}
                                    className="me-1"
                                  />
                                  Pending
                                </Badge>
                              )}
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                color={hasSalary ? "light" : "success"}
                                className="btn-sm"
                                onClick={() => openModal(emp)}
                              >
                                <FeatherIcon
                                  icon={hasSalary ? "edit-2" : "plus"}
                                  size={13}
                                  className="me-1"
                                />
                                {hasSalary ? "Edit" : "Set Salary"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          )}
        </CardBody>
      </Card>

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