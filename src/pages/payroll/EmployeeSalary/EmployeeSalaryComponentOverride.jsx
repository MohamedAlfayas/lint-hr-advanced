import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  Badge,
  Spinner,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = "/api/payroll";

async function fetchEmployeeSalaries() {
  const res = await fetch(`${API_BASE}/employee-salary/`);
  const json = await res.json();
  return json.data || [];
}

async function saveOverride(payload) {
  const res = await fetch(`${API_BASE}/employee-salary-component-override/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_message || "Override failed");
  return json.data;
}

// ─── Override Modal ───────────────────────────────────────────────────────────
const OverrideModal = ({ isOpen, toggle, component, employeeName, onSaved }) => {
  const [overrideAmount, setOverrideAmount] = useState("");
  const [isOverridden, setIsOverridden] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && component) {
      setOverrideAmount(
        component.override_amount || component.calculated_amount || ""
      );
      setIsOverridden(component.is_overridden ?? true);
      setError("");
    }
  }, [isOpen, component]);

  const handleSave = async () => {
    setError("");
    if (isOverridden && (!overrideAmount || Number(overrideAmount) < 0)) {
      return setError("Please enter a valid override amount.");
    }

    setSaving(true);
    try {
      const saved = await saveOverride({
        id: component.id,
        override_amount: isOverridden ? overrideAmount : null,
        is_overridden: isOverridden,
      });
      onSaved(saved);
      toggle();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const diff =
    overrideAmount && component?.calculated_amount
      ? Number(overrideAmount) - Number(component.calculated_amount)
      : null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle} className="border-bottom pb-3">
        <div>
          <h5 className="mb-0 fw-semibold">Override Component Amount</h5>
          {employeeName && (
            <p className="mb-0 fs-12 text-muted mt-1">{employeeName}</p>
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

        {component && (
          <>
            {/* Component Info */}
            <div className="rounded border p-3 mb-4 bg-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold fs-14">{component.component_name}</span>
                <Badge
                  color={
                    component.component_type === "allowance"
                      ? "success"
                      : component.component_type === "deduction"
                      ? "danger"
                      : "info"
                  }
                  className="text-capitalize fs-11"
                >
                  {component.component_type}
                </Badge>
              </div>
              <div className="d-flex gap-4">
                <div>
                  <p className="mb-0 fs-11 text-muted">Calculated Amount</p>
                  <p className="mb-0 fw-bold text-success fs-15">
                    ₹{" "}
                    {Number(component.calculated_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {component.is_overridden && component.override_amount && (
                  <div>
                    <p className="mb-0 fs-11 text-muted">Current Override</p>
                    <p className="mb-0 fw-bold text-warning fs-15">
                      ₹{" "}
                      {Number(component.override_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle override on/off */}
            <div className="form-check form-switch form-switch-success mb-3 ps-0">
              <div className="d-flex align-items-center gap-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="overrideSwitch"
                  style={{ width: "2.5em", height: "1.25em", cursor: "pointer" }}
                  checked={isOverridden}
                  onChange={(e) => setIsOverridden(e.target.checked)}
                />
                <Label
                  className="form-check-label fw-medium mb-0"
                  htmlFor="overrideSwitch"
                  style={{ cursor: "pointer" }}
                >
                  {isOverridden
                    ? "Override is active — using custom amount"
                    : "Override is off — using calculated amount"}
                </Label>
              </div>
            </div>

            {isOverridden && (
              <>
                <div className="mb-3">
                  <Label className="form-label fw-medium">
                    Override Amount (₹ / month){" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={overrideAmount}
                    onChange={(e) => setOverrideAmount(e.target.value)}
                    placeholder="Enter custom monthly amount"
                    min={0}
                  />
                  {diff !== null && (
                    <div
                      className={`form-text fw-medium ${
                        diff > 0
                          ? "text-success"
                          : diff < 0
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    >
                      {diff > 0
                        ? `▲ ₹ ${diff.toLocaleString("en-IN", { minimumFractionDigits: 2 })} more than calculated`
                        : diff < 0
                        ? `▼ ₹ ${Math.abs(diff).toLocaleString("en-IN", { minimumFractionDigits: 2 })} less than calculated`
                        : "Same as calculated amount"}
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-start gap-2 p-3 rounded bg-warning-subtle border border-warning border-opacity-25">
                  <FeatherIcon
                    icon="alert-triangle"
                    size={14}
                    className="text-warning mt-1 flex-shrink-0"
                  />
                  <p className="mb-0 fs-12 text-muted">
                    This override applies only to this employee. The salary
                    structure remains unchanged for other employees. The payroll
                    engine will use this custom amount instead of the computed
                    one.
                  </p>
                </div>
              </>
            )}

            {!isOverridden && component.is_overridden && (
              <div className="d-flex align-items-start gap-2 p-3 rounded bg-info-subtle border border-info border-opacity-25">
                <FeatherIcon
                  icon="info"
                  size={14}
                  className="text-info mt-1 flex-shrink-0"
                />
                <p className="mb-0 fs-12 text-muted">
                  Turning off the override will revert this component back to
                  the auto-calculated amount of ₹{" "}
                  {Number(component.calculated_amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  per month.
                </p>
              </div>
            )}
          </>
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
          {isOverridden ? "Save Override" : "Revert to Calculated"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Component type badge color ───────────────────────────────────────────────
const typeBadge = {
  allowance: { color: "success", label: "Earning" },
  deduction: { color: "danger", label: "Deduction" },
  reimbursement: { color: "info", label: "Reimbursement" },
  contribution: { color: "primary", label: "Contribution" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeeSalaryComponentOverride = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [overrideModal, setOverrideModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEmployeeSalaries();
      // Only show employees who have salary set up
      const withSalary = data.filter((e) => e.salary_components?.length > 0);
      setEmployees(withSalary);
      setEmployeeOptions(
        withSalary.map((e) => ({
          value: e.id,
          label: `${e.name} (${e.emp_id})`,
          data: e,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentEmployee = selectedEmployee
    ? employees.find((e) => e.id === selectedEmployee.value)
    : null;

  const components = currentEmployee?.salary_components || [];

  const filteredComponents =
    filterType === "all"
      ? components
      : filterType === "overridden"
      ? components.filter((c) => c.is_overridden)
      : components.filter((c) => c.component_type === filterType);

  const overriddenCount = components.filter((c) => c.is_overridden).length;

  const openOverride = (comp) => {
    setSelectedComponent(comp);
    setOverrideModal(true);
  };

  const handleOverrideSaved = (updated) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== currentEmployee.id) return emp;
        return {
          ...emp,
          salary_components: emp.salary_components.map((c) =>
            c.id === updated.id ? { ...c, ...updated } : c
          ),
        };
      })
    );
  };

  const typeFilterOptions = [
    { value: "all", label: "All Components" },
    { value: "overridden", label: "Overridden Only" },
    { value: "allowance", label: "Earnings" },
    { value: "deduction", label: "Deductions" },
    { value: "reimbursement", label: "Reimbursements" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="mb-1 fw-semibold">Component Override</h5>
          <p className="text-muted mb-0 fs-13">
            Set custom monthly amounts for individual salary components per
            employee.
          </p>
        </div>
      </div>

      {/* Employee selector */}
      <Card className="shadow-none border mb-4">
        <CardBody className="p-3">
          <Row className="align-items-end g-3">
            <Col md={5}>
              <Label className="form-label fw-medium mb-1">
                Select Employee
              </Label>
              <Select
                options={employeeOptions}
                value={selectedEmployee}
                onChange={(val) => {
                  setSelectedEmployee(val);
                  setFilterType("all");
                }}
                placeholder={
                  loading ? "Loading employees..." : "Search and select employee..."
                }
                isLoading={loading}
                classNamePrefix="select2-selection"
                isClearable
              />
              <div className="form-text">
                Only employees with salary configured are listed.
              </div>
            </Col>

            {currentEmployee && (
              <>
                <Col md={3}>
                  <Label className="form-label fw-medium mb-1">
                    Filter Components
                  </Label>
                  <Select
                    options={typeFilterOptions}
                    value={typeFilterOptions.find((o) => o.value === filterType)}
                    onChange={(val) => setFilterType(val.value)}
                    classNamePrefix="select2-selection"
                  />
                </Col>

                <Col md={4}>
                  <div className="d-flex gap-3">
                    <div className="rounded border p-2 px-3 flex-fill text-center">
                      <p className="mb-0 fs-11 text-muted">Total Components</p>
                      <h5 className="mb-0 fw-bold">{components.length}</h5>
                    </div>
                    <div className="rounded border p-2 px-3 flex-fill text-center">
                      <p className="mb-0 fs-11 text-muted">Overridden</p>
                      <h5
                        className={`mb-0 fw-bold ${
                          overriddenCount > 0 ? "text-warning" : "text-muted"
                        }`}
                      >
                        {overriddenCount}
                      </h5>
                    </div>
                    <div className="rounded border p-2 px-3 flex-fill text-center">
                      <p className="mb-0 fs-11 text-muted">Computed</p>
                      <h5 className="mb-0 fw-bold text-success">
                        {components.length - overriddenCount}
                      </h5>
                    </div>
                  </div>
                </Col>
              </>
            )}
          </Row>
        </CardBody>
      </Card>

      {/* Employee summary strip */}
      {currentEmployee && (
        <div className="d-flex align-items-center gap-3 p-3 rounded border mb-4 bg-light">
          <div
            className="avatar-sm rounded-circle bg-success-subtle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            {currentEmployee.image_url ? (
              <img
                src={currentEmployee.image_url}
                alt={currentEmployee.name}
                className="rounded-circle"
                width={40}
                height={40}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span className="text-success fw-bold fs-14">
                {(currentEmployee.name || "?")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-grow-1">
            <p className="mb-0 fw-semibold fs-14">{currentEmployee.name}</p>
            <p className="mb-0 fs-12 text-muted">
              {currentEmployee.emp_id}
              {currentEmployee.role?.name && ` · ${currentEmployee.role.name}`}
            </p>
          </div>
          <div className="text-end">
            <p className="mb-0 fs-11 text-muted">
              {currentEmployee.based_on === "ctc" ? "Annual CTC" : "Monthly Gross"}
            </p>
            <p className="mb-0 fw-semibold fs-14 text-success">
              ₹{" "}
              {Number(
                currentEmployee.based_on === "ctc"
                  ? currentEmployee.ctc_amount
                  : currentEmployee.gross_amount
              ).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-end">
            <p className="mb-0 fs-11 text-muted">Structure</p>
            <p className="mb-0 fw-semibold fs-13">
              {currentEmployee.salary_structure_name || "—"}
            </p>
          </div>
          <div className="text-end">
            <p className="mb-0 fs-11 text-muted">Effective</p>
            <p className="mb-0 fw-semibold fs-13">
              {currentEmployee.effective_date || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Components Table */}
      {!currentEmployee ? (
        <Card className="shadow-none border">
          <CardBody>
            <div className="text-center py-5 text-muted">
              <FeatherIcon icon="user" size={40} className="mb-3 opacity-30" />
              <h6 className="fw-medium">Select an Employee</h6>
              <p className="fs-13 mb-0">
                Choose an employee above to view and manage their component
                overrides.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="shadow-none border">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table className="table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 fw-semibold fs-12">Component</th>
                    <th className="fw-semibold fs-12">Type</th>
                    <th className="text-end fw-semibold fs-12">
                      Calculated Amount
                    </th>
                    <th className="text-end fw-semibold fs-12">
                      Override Amount
                    </th>
                    <th className="text-center fw-semibold fs-12">Status</th>
                    <th className="text-end fw-semibold fs-12 pe-4">
                      Effective Amount
                    </th>
                    <th className="text-center fw-semibold fs-12">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComponents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <FeatherIcon
                          icon="inbox"
                          size={32}
                          className="mb-2 opacity-40"
                        />
                        <p className="mb-0 fs-13">No components found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredComponents.map((comp) => {
                      const badge = typeBadge[comp.component_type] || {
                        color: "secondary",
                        label: comp.component_type,
                      };
                      const effective = comp.is_overridden
                        ? comp.override_amount
                        : comp.calculated_amount;

                      return (
                        <tr key={comp.id}>
                          <td className="ps-4">
                            <p className="mb-0 fw-medium fs-13">
                              {comp.component_name}
                            </p>
                          </td>
                          <td>
                            <Badge
                              color={`${badge.color}-subtle`}
                              className={`text-${badge.color} fs-11 border border-${badge.color} border-opacity-25`}
                            >
                              {badge.label}
                            </Badge>
                          </td>
                          <td className="text-end fs-13 text-muted">
                            ₹{" "}
                            {Number(comp.calculated_amount).toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                          <td className="text-end fs-13">
                            {comp.override_amount ? (
                              <span className="text-warning fw-medium">
                                ₹{" "}
                                {Number(comp.override_amount).toLocaleString(
                                  "en-IN",
                                  { minimumFractionDigits: 2 }
                                )}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="text-center">
                            {comp.is_overridden ? (
                              <Badge
                                color="warning-subtle"
                                className="text-warning fs-11 border border-warning border-opacity-25"
                              >
                                <FeatherIcon
                                  icon="edit-2"
                                  size={9}
                                  className="me-1"
                                />
                                Overridden
                              </Badge>
                            ) : (
                              <Badge
                                color="light"
                                className="text-muted fs-11"
                              >
                                Computed
                              </Badge>
                            )}
                          </td>
                          <td className="text-end pe-4">
                            <span
                              className={`fw-semibold fs-13 ${
                                comp.is_overridden
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              ₹{" "}
                              {Number(effective).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                color="light"
                                className="btn-sm py-1 px-2"
                                onClick={() => openOverride(comp)}
                                title="Override amount"
                              >
                                <FeatherIcon icon="edit-2" size={12} className="me-1" />
                                Override
                              </Button>
                              {comp.is_overridden && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="btn-sm py-1 px-2 text-danger"
                                  title="Revert to calculated"
                                  onClick={() =>
                                    openOverride({ ...comp, _revertMode: true })
                                  }
                                >
                                  <FeatherIcon icon="rotate-ccw" size={12} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* Summary footer */}
                {filteredComponents.length > 0 && (
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={5} className="ps-4 fw-semibold fs-13">
                        Total Monthly Pay
                      </td>
                      <td className="text-end pe-4 fw-bold text-success fs-13">
                        ₹{" "}
                        {filteredComponents
                          .reduce((sum, c) => {
                            const amt = Number(
                              c.is_overridden
                                ? c.override_amount
                                : c.calculated_amount
                            );
                            return c.component_type === "deduction"
                              ? sum - amt
                              : sum + amt;
                          }, 0)
                          .toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Override Modal */}
      <OverrideModal
        isOpen={overrideModal}
        toggle={() => setOverrideModal(false)}
        component={selectedComponent}
        employeeName={currentEmployee?.name}
        onSaved={handleOverrideSaved}
      />
    </div>
  );
};

export default EmployeeSalaryComponentOverride;