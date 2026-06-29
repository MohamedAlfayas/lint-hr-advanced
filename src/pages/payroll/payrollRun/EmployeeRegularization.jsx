import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner, Badge,
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label,
  Collapse, Nav, NavItem, NavLink, TabContent, TabPane,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const fmtDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const fmtDays = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const wholeDays = Math.floor(num);
  const hours = Math.round((num - wholeDays) * 8); // 1 day = 8 hrs
  if (hours === 0) return `${wholeDays} day${wholeDays !== 1 ? "s" : ""}`;
  if (wholeDays === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  return `${wholeDays} day${wholeDays !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`;
};

const STATUS_BADGE = {
  present:     "success",
  leave:       "info",
  lop:         "danger",
  partial_lop: "warning",
};

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const secondsToHrs = (s) => (s ? (s / 3600).toFixed(1) : "0.0");

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Statutory rows (PF/ESI/PT/LOP) are derived server-side — never editable here.
const isStatutory = (d) =>
  d.component_type === "statutory_deduction" || d.component_type === "lop_deduction";

// A row is editable (Model A override) only when it maps to a real PayrollComponent.
const isEditableComponent = (c) =>
  Boolean(c.payroll_component) && !c.is_manual && !c.is_reimbursement && !isStatutory(c);

// ───────────────────────────────────────────────────────────────────────────
// TAB 1 — Attendance edit (day table + regularize modal)
// ───────────────────────────────────────────────────────────────────────────
const AttendanceEditTab = ({ days, period, employeeName, onRegularize }) => {
  const [editDay, setEditDay] = useState(null);
  const [status, setStatus]   = useState("paid");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving]   = useState(false);

  const openEdit = (day) => {
    setEditDay(day);
    setStatus(day.regularized_status || "paid");
    setRemarks(day.remarks || "");
  };
  const closeEdit = () => setEditDay(null);

  const handleSave = () => {
    setSaving(true);
    onRegularize(
      { date: editDay.date, original_status: editDay.computed_status, regularized_status: status, remarks },
      () => { setSaving(false); closeEdit(); },
      () => setSaving(false),
    );
  };

  return (
    <React.Fragment>
      <Card className="shadow-none border">
        <CardHeader className="bg-light">
          <CardTitle tag="h6" className="mb-0">
            {employeeName ? `Attendance — ${employeeName}` : "Attendance"}
          </CardTitle>
          {period && (
            <p className="text-muted mb-0 mt-1" style={{ fontSize: 12 }}>
              Attendance Period: {period.start} to {period.end}
            </p>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive" style={{ maxHeight: "58vh", overflow: "auto" }}>
            <Table className="table-bordered align-middle mb-0" style={{ fontSize: 13 }}>
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: 11 }}>
                <tr>
                  <th>Date</th><th>Worked Hrs</th><th>Leave Hrs</th><th>Week Off</th>
                  <th>Holiday</th><th>Computed Status</th><th>Regularized</th><th>Remarks</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {days.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-muted py-4">No records found.</td></tr>
                ) : days.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{secondsToHrs(d.worked_seconds)}</td>
                    <td>{secondsToHrs(d.leave_seconds)}</td>
                    <td>{d.is_week_off ? <Badge color="secondary">Yes</Badge> : "—"}</td>
                    <td>{d.is_holiday ? <Badge color="secondary">Yes</Badge> : "—"}</td>
                    <td><Badge color={STATUS_BADGE[d.computed_status] || "secondary"}>{d.computed_status}</Badge></td>
                    <td>
                      {d.regularized_status ? (
                        <Badge color={d.regularized_status === "paid" ? "success" : "danger"}>{d.regularized_status}</Badge>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="text-muted" style={{ maxWidth: 160 }}>{d.remarks || "—"}</td>
                    <td className="text-end">
                      <Button color="light" size="sm" className="border py-1 px-2" onClick={() => openEdit(d)}>
                        <i className="ri-edit-line align-middle me-1"></i>Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {editDay && (
        <Modal isOpen toggle={closeEdit} centered>
          <ModalHeader toggle={closeEdit} className="bg-light p-3">Regularize {editDay.date}</ModalHeader>
          <ModalBody className="p-4">
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>
              System computed status:{" "}
              <Badge color={STATUS_BADGE[editDay.computed_status] || "secondary"}>{editDay.computed_status}</Badge>
            </p>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Set As</Label>
              <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="paid">Paid (no LOP)</option>
                <option value="unpaid">Unpaid / LOP</option>
              </Input>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label style={{ fontSize: 13 }}>Remarks</Label>
              <Input type="textarea" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for regularization..." />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-light p-3">
            <Button color="secondary" outline size="sm" onClick={closeEdit} disabled={saving}>Cancel</Button>
            <Button color="success" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : null}Save
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// TAB 2 — Projected payslip edit (Model A overrides + Model B adjustments)
// ───────────────────────────────────────────────────────────────────────────
const ProjectedPayslipTab = ({ payslip, loading, employeeId, month, year, onChanged }) => {
  const [showEmployer, setShowEmployer] = useState(false);
  const [showCtc, setShowCtc]           = useState(false);

  // Model A: component override modal
  const [compEdit, setCompEdit]     = useState(null);
  const [compAmount, setCompAmount] = useState("");
  const [compReason, setCompReason] = useState("");
  const [compSaving, setCompSaving] = useState(false);

  // Model B: manual adjustments
  const [adjustments, setAdjustments] = useState([]);
  const [loadingAdj, setLoadingAdj]   = useState(false);
  const [adjEdit, setAdjEdit]         = useState(null);
  const [adjSaving, setAdjSaving]     = useState(false);

  const fetchAdjustments = () => {
    if (!employeeId || !month || !year) return;
    setLoadingAdj(true);
    Api({ method: "GET", url: `payroll/payslip-adjustment/?employee_id=${employeeId}&month=${month}&year=${year}` })
      .then((res) => setAdjustments(res?.data?.data || []))
      .catch(() => setAdjustments([]))
      .finally(() => setLoadingAdj(false));
  };

  useEffect(() => {
    fetchAdjustments();
  }, [employeeId, month, year]);

  const openCompEdit = (c) => {
    setCompEdit({ name: c.component_name, payroll_component: c.payroll_component, current: c.final_amount });
    setCompAmount(c.override_amount != null ? c.override_amount : c.final_amount);
    setCompReason("");
  };
  const closeCompEdit = () => setCompEdit(null);

  const saveCompOverride = () => {
    if (compAmount === "" || Number(compAmount) < 0) { toast.warning("Enter a valid amount."); return; }
    setCompSaving(true);
    Api({
      method: "POST",
      url: "payroll/payslip-component-override-monthly/",
      data: { employee_id: employeeId, month, year, payroll_component: compEdit.payroll_component, override_amount: compAmount, reason: compReason },
    })
      .then(() => { toast.success("Component overridden for this month."); closeCompEdit(); onChanged && onChanged(); })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to override component."))
      .finally(() => setCompSaving(false));
  };

  const revertCompOverride = (c) => {
    Api({
      method: "DELETE",
      url: "payroll/payslip-component-override-monthly/",
      data: { employee_id: employeeId, month, year, payroll_component: c.payroll_component },
    })
      .then(() => { toast.success("Reverted to calculated."); onChanged && onChanged(); })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to revert."));
  };

  const openAdjNew  = () => setAdjEdit({ label: "", adjustment_type: "earning", amount: "", reason: "" });
  const openAdjEdit = (a) => setAdjEdit({ ...a });
  const closeAdj    = () => setAdjEdit(null);

  const saveAdjustment = () => {
    if (!adjEdit.label?.trim() || adjEdit.amount === "" || Number(adjEdit.amount) < 0) {
      toast.warning("Enter a label and a valid amount."); return;
    }
    setAdjSaving(true);
    const isEdit = Boolean(adjEdit.id);
    Api({
      method: isEdit ? "PUT" : "POST",
      url: "payroll/payslip-adjustment/",
      data: isEdit
        ? { id: adjEdit.id, label: adjEdit.label, adjustment_type: adjEdit.adjustment_type, amount: adjEdit.amount, reason: adjEdit.reason }
        : { employee: employeeId, month, year, label: adjEdit.label, adjustment_type: adjEdit.adjustment_type, amount: adjEdit.amount, reason: adjEdit.reason },
    })
      .then(() => {
        toast.success(isEdit ? "Adjustment updated." : "Adjustment added.");
        closeAdj(); fetchAdjustments(); onChanged && onChanged();
      })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to save adjustment."))
      .finally(() => setAdjSaving(false));
  };

  const deleteAdjustment = (a) => {
    Api({ method: "DELETE", url: "payroll/payslip-adjustment/", data: { id: a.id } })
      .then(() => { toast.success("Adjustment removed."); fetchAdjustments(); onChanged && onChanged(); })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to remove."));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="success" size="sm" />
        <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>Recalculating projection...</p>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="ri-file-list-3-line" style={{ fontSize: 32, opacity: 0.3 }}></i>
        <p className="mt-2 mb-0" style={{ fontSize: 12 }}>No projection yet. Regularize a day or add an edit to generate it.</p>
      </div>
    );
  }

  const earnings   = (payslip.earnings   || []).filter((c) => !c.is_manual);
  const deductions = (payslip.deductions || []).filter((c) => !c.is_manual);
  const emp        = payslip.employer_contributions || { items: [] };
  const ctc        = payslip.ctc_breakdown || null;
  const netPay     = parseFloat(payslip.net_pay || 0);

  const renderEditCell = (c, danger) => {
    const editable = isEditableComponent(c);
    const overridden = c.override_amount != null;
    return (
      <td className={`text-end ${danger ? "text-danger" : ""}`} style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>
        &#8377;{fmt(c.final_amount)}
        {editable && (
          <>
            <Button color="link" className="p-0 ms-2" style={{ fontSize: 12 }} title="Override this month" onClick={() => openCompEdit(c)}>
              <i className="ri-edit-line"></i>
            </Button>
            {overridden && (
              <Button color="link" className="p-0 ms-1 text-muted" style={{ fontSize: 12 }} title="Revert to calculated" onClick={() => revertCompOverride(c)}>
                <i className="ri-arrow-go-back-line"></i>
              </Button>
            )}
          </>
        )}
      </td>
    );
  };

  return (
    <React.Fragment>
      <Card className="shadow-none border">
        <CardHeader className="bg-light py-2 d-flex align-items-center justify-content-between">
          <CardTitle tag="h6" className="mb-0">Projected Payslip</CardTitle>
          <Badge color="warning" className="fs-11">Estimated</Badge>
        </CardHeader>

        <CardBody className="p-3" style={{ maxHeight: "58vh", overflowY: "auto" }}>
          <p className="text-muted mb-3" style={{ fontSize: 10.5 }}>
            <i className="ri-information-line me-1"></i>
            Projected from current attendance, regularization &amp; edits. PF / ESI / PT are
            recomputed from the component base and finalised at the payroll run.
          </p>

          {/* Net pay */}
          <div className="p-3 rounded mb-3" style={{ background: "#f6fdf9", border: "1px solid #c3e8dc" }}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: 10 }}>Net Take-Home</span>
              <h5 className={`mb-0 fw-bold ${netPay < 0 ? "text-danger" : "text-success"}`}>&#8377;{fmt(payslip.net_pay)}</h5>
            </div>
            {payslip.net_pay_in_words && (
              <p className="mb-0 text-muted mt-1" style={{ fontSize: 9.5 }}>{payslip.net_pay_in_words}</p>
            )}
          </div>

          {/* Attendance chips */}
          <div className="d-flex flex-wrap gap-2 mb-3" style={{ fontSize: 11 }}>
            <span className="px-2 py-1 rounded bg-light border">Payable: <strong>{payslip.payable_days}</strong></span>
            <span className="px-2 py-1 rounded bg-light border">Present: <strong>{payslip.present_days}</strong></span>
            <span className="px-2 py-1 rounded bg-light border">Leave: <strong>{payslip.approved_leave_days}</strong></span>
            <span className={`px-2 py-1 rounded border ${parseFloat(payslip.lop_days) > 0 ? "bg-danger-subtle text-danger fw-bold" : "bg-light"}`}>
              LOP: <strong>{fmtDays(payslip.lop_days)}</strong>
            </span>
          </div>

          {/* Earnings */}
          <p className="text-uppercase fw-bold text-success mb-1" style={{ fontSize: 10 }}>Earnings</p>
          <Table size="sm" bordered className="mb-3">
            <tbody>
              {earnings.length === 0 ? (
                <tr><td className="text-muted text-center" style={{ fontSize: 11 }}>No earnings</td></tr>
              ) : earnings.map((c, i) => (
                <tr key={`${c.component_name}-${i}`}>
                  <td style={{ fontSize: 11.5 }}>
                    {c.component_name}
                    {c.is_reimbursement && <Badge color="light" className="text-muted border ms-1 fs-11">reimb</Badge>}
                    {c.override_amount != null && <Badge color="warning" className="ms-1 fs-11">edited</Badge>}
                  </td>
                  {renderEditCell(c, false)}
                </tr>
              ))}
              <tr className="table-success fw-bold">
                <td style={{ fontSize: 11.5 }}>Gross Earnings</td>
                <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(payslip.gross_earnings)}</td>
              </tr>
            </tbody>
          </Table>

          {/* Deductions */}
          <p className="text-uppercase fw-bold text-danger mb-1" style={{ fontSize: 10 }}>Deductions</p>
          <Table size="sm" bordered className="mb-3">
            <tbody>
              {deductions.length === 0 ? (
                <tr><td className="text-muted text-center" style={{ fontSize: 11 }}>No deductions</td></tr>
              ) : deductions.map((c, i) => (
                <tr key={`${c.component_name}-${i}`}>
                  <td style={{ fontSize: 11.5 }}>
                    {c.component_name}
                    {isStatutory(c) && <Badge color="light" className="text-muted border ms-1 fs-11">statutory</Badge>}
                    {c.override_amount != null && <Badge color="warning" className="ms-1 fs-11">edited</Badge>}
                  </td>
                  {renderEditCell(c, true)}
                </tr>
              ))}
              <tr className="table-danger fw-bold">
                <td style={{ fontSize: 11.5 }}>Total Deductions</td>
                <td className="text-end text-danger" style={{ fontSize: 11.5 }}>&#8377;{fmt(payslip.total_deductions)}</td>
              </tr>
            </tbody>
          </Table>

          {/* Manual adjustments (Model B) */}
          <div className="d-flex align-items-center justify-content-between mb-1">
            <p className="text-uppercase fw-bold text-primary mb-0" style={{ fontSize: 10 }}>Manual Adjustments</p>
            <Button color="primary" outline size="sm" className="py-0 px-2" style={{ fontSize: 11 }} onClick={openAdjNew}>
              <i className="ri-add-line align-middle me-1"></i>Add
            </Button>
          </div>
          <Table size="sm" bordered className="mb-3">
            <tbody>
              {loadingAdj ? (
                <tr><td className="text-center text-muted py-2" style={{ fontSize: 11 }}><Spinner size="sm" /></td></tr>
              ) : adjustments.length === 0 ? (
                <tr><td className="text-muted text-center" style={{ fontSize: 11 }}>None</td></tr>
              ) : adjustments.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 11.5 }}>
                    {a.label}
                    <Badge color={a.adjustment_type === "earning" ? "success" : "danger"} className="ms-1 fs-11">
                      {a.adjustment_type === "earning" ? "+" : "−"}
                    </Badge>
                    {a.reason && <span className="text-muted d-block" style={{ fontSize: 10 }}>{a.reason}</span>}
                  </td>
                  <td className="text-end" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>
                    <span className={a.adjustment_type === "earning" ? "text-success" : "text-danger"}>&#8377;{fmt(a.amount)}</span>
                    <Button color="link" className="p-0 ms-2" style={{ fontSize: 12 }} title="Edit" onClick={() => openAdjEdit(a)}>
                      <i className="ri-edit-line"></i>
                    </Button>
                    <Button color="link" className="p-0 ms-1 text-danger" style={{ fontSize: 12 }} title="Delete" onClick={() => deleteAdjustment(a)}>
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Employer contributions */}
          {emp.items && emp.items.length > 0 && (
            <>
              <Button color="light" size="sm" className="border w-100 d-flex justify-content-between align-items-center mb-2"
                onClick={() => setShowEmployer((s) => !s)} style={{ fontSize: 11 }}>
                <span className="fw-semibold text-muted text-uppercase">Employer Contributions</span>
                <i className={`ri-arrow-${showEmployer ? "up" : "down"}-s-line`}></i>
              </Button>
              <Collapse isOpen={showEmployer}>
                <Table size="sm" bordered className="mb-3">
                  <tbody>
                    {emp.items.map((it, i) => (
                      <tr key={`${it.name}-${i}`}>
                        <td style={{ fontSize: 11.5 }}>
                          {it.name}
                          {it.ctc_embedded && <Badge color="light" className="text-muted border ms-1 fs-11">in CTC</Badge>}
                        </td>
                        <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(it.amount)}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold table-light">
                      <td style={{ fontSize: 11.5 }}>Total Employer Cost</td>
                      <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(emp.total_employer_cost)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Collapse>
            </>
          )}

          {/* CTC breakdown */}
          {ctc && (
            <>
              <Button color="light" size="sm" className="border w-100 d-flex justify-content-between align-items-center mb-2"
                onClick={() => setShowCtc((s) => !s)} style={{ fontSize: 11 }}>
                <span className="fw-semibold text-muted text-uppercase">CTC Breakdown</span>
                <i className={`ri-arrow-${showCtc ? "up" : "down"}-s-line`}></i>
              </Button>
              <Collapse isOpen={showCtc}>
                <Table size="sm" bordered className="mb-0">
                  <tbody>
                    {[
                      ["Monthly Gross", ctc.monthly_gross],
                      ["Employer PF", ctc.employer_pf_in_ctc],
                      ["EDLI", ctc.edli_in_ctc],
                      ["PF Admin", ctc.pf_admin_in_ctc],
                      ["Employer ESI", ctc.esi_employer_in_ctc],
                      ["Gratuity", ctc.gratuity_in_ctc],
                      ["Bonus", ctc.bonus_in_ctc],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td style={{ fontSize: 11.5 }}>{label}</td>
                        <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(val)}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold table-light">
                      <td style={{ fontSize: 11.5 }}>Monthly CTC</td>
                      <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(ctc.monthly_ctc_computed)}</td>
                    </tr>
                    <tr className="fw-bold table-info">
                      <td style={{ fontSize: 11.5 }}>Annual CTC</td>
                      <td className="text-end" style={{ fontSize: 11.5 }}>&#8377;{fmt(ctc.annual_ctc)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Collapse>
            </>
          )}
        </CardBody>
      </Card>

      {/* Component override modal (Model A) */}
      {compEdit && (
        <Modal isOpen toggle={closeCompEdit} centered>
          <ModalHeader toggle={closeCompEdit} className="bg-light p-3">Override — {compEdit.name}</ModalHeader>
          <ModalBody className="p-4">
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>
              Applies to <strong>{MONTH_NAMES[Number(month)]} {year}</strong> only. PF / ESI / net
              recompute from this value. Current: &#8377;{fmt(compEdit.current)}.
            </p>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>New Amount (₹)</Label>
              <Input type="number" min="0" value={compAmount} onChange={(e) => setCompAmount(e.target.value)} />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label style={{ fontSize: 13 }}>Reason</Label>
              <Input type="textarea" rows="2" value={compReason} onChange={(e) => setCompReason(e.target.value)}
                placeholder="Reason for this month's override..." />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-light p-3">
            <Button color="secondary" outline size="sm" onClick={closeCompEdit} disabled={compSaving}>Cancel</Button>
            <Button color="success" size="sm" onClick={saveCompOverride} disabled={compSaving}>
              {compSaving ? <Spinner size="sm" className="me-1" /> : null}Save
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Adjustment modal (Model B) */}
      {adjEdit && (
        <Modal isOpen toggle={closeAdj} centered>
          <ModalHeader toggle={closeAdj} className="bg-light p-3">
            {adjEdit.id ? "Edit Adjustment" : "Add Manual Adjustment"}
          </ModalHeader>
          <ModalBody className="p-4">
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Label</Label>
              <Input value={adjEdit.label} onChange={(e) => setAdjEdit({ ...adjEdit, label: e.target.value })}
                placeholder="e.g. Special Incentive, Advance Recovery" />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Type</Label>
              <Input type="select" value={adjEdit.adjustment_type}
                onChange={(e) => setAdjEdit({ ...adjEdit, adjustment_type: e.target.value })}>
                <option value="earning">Earning (+)</option>
                <option value="deduction">Deduction (−)</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Amount (₹)</Label>
              <Input type="number" min="0" value={adjEdit.amount}
                onChange={(e) => setAdjEdit({ ...adjEdit, amount: e.target.value })} />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label style={{ fontSize: 13 }}>Reason</Label>
              <Input type="textarea" rows="2" value={adjEdit.reason || ""}
                onChange={(e) => setAdjEdit({ ...adjEdit, reason: e.target.value })}
                placeholder="Why this adjustment..." />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-light p-3">
            <Button color="secondary" outline size="sm" onClick={closeAdj} disabled={adjSaving}>Cancel</Button>
            <Button color="success" size="sm" onClick={saveAdjustment} disabled={adjSaving}>
              {adjSaving ? <Spinner size="sm" className="me-1" /> : null}Save
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Container — owns shared state + the two tabs
// ───────────────────────────────────────────────────────────────────────────
const EmployeeRegularization = ({ employeeId, employeeName, month, year, onSaved, payrollRunId }) => {
  const [activeTab, setActiveTab] = useState("attendance");

  const [loading, setLoading] = useState(false);
  const [days, setDays]       = useState([]);
  const [period, setPeriod]   = useState(null);

  const [payslip, setPayslip]               = useState(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  const fetchData = () => {
    if (!employeeId || !month || !year) return;
    setLoading(true);
    Api({ method: "GET", url: `payroll/regularization/?employee_id=${employeeId}&month=${month}&year=${year}` })
      .then((res) => {
        setDays(res?.data?.data?.days || []);
        setPeriod(res?.data?.data?.attendance_period || null);
      })
      .catch(() => toast.error("Failed to load attendance & leave records."))
      .finally(() => setLoading(false));
  };

  const fetchPayslip = () => {
    if (!employeeId) return;
    setLoadingPayslip(true);
    const url = payrollRunId
      ? `payroll/employee-payslip/?payroll_run=${payrollRunId}&employee_id=${employeeId}`
      : `payroll/employee-payslip/?employee_id=${employeeId}`;
    Api({ method: "GET", url })
      .then((res) => {
        const arr = res?.data?.data || [];
        let slip = arr[0] || null;
        if (!payrollRunId && arr.length) {
          const target = `${MONTH_NAMES[Number(month)]} ${year}`;
          slip = arr.find((s) => s.pay_period === target) || null;
        }
        setPayslip(slip);
      })
      .catch(() => setPayslip(null))
      .finally(() => setLoadingPayslip(false));
  };

  useEffect(() => {
    fetchData();
    fetchPayslip();
  }, [employeeId, month, year, payrollRunId]);

  // Save a regularization (called from the Attendance tab).
  const handleRegularize = (payload, onDone, onFail) => {
    Api({
      method: "POST",
      url: "payroll/regularization/",
      data: { employee_id: employeeId, month, year, ...payload },
    })
      .then(() => {
        toast.success("Regularization saved.");
        fetchData();
        fetchPayslip();
        if (typeof onSaved === "function") onSaved();
        onDone && onDone();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error_message || "Failed to save regularization.");
        onFail && onFail();
      });
  };

  // Fired by the payslip tab after an override / adjustment change.
  const handlePanelChanged = () => {
    fetchPayslip();
    fetchData();
    if (typeof onSaved === "function") onSaved();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>Loading attendance & leave records...</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink
            className={`px-3 py-2 ${activeTab === "attendance" ? "active fw-semibold" : "text-muted"}`}
            style={{ cursor: "pointer", fontSize: 13 }}
            onClick={() => setActiveTab("attendance")}
          >
            <i className="ri-calendar-check-line align-middle me-1"></i>Attendance Edit
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`px-3 py-2 ${activeTab === "payslip" ? "active fw-semibold" : "text-muted"}`}
            style={{ cursor: "pointer", fontSize: 13 }}
            onClick={() => setActiveTab("payslip")}
          >
            <i className="ri-file-edit-line align-middle me-1"></i>Projected Payslip Edit
            {payslip && parseFloat(payslip.lop_days) > 0 && (
              <Badge color="danger" className="ms-2 fs-11">{fmtDays(payslip.lop_days)} LOP</Badge>
            )}
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="attendance">
          <AttendanceEditTab
            days={days}
            period={period}
            employeeName={employeeName}
            onRegularize={handleRegularize}
          />
        </TabPane>

        <TabPane tabId="payslip">
          <ProjectedPayslipTab
            payslip={payslip}
            loading={loadingPayslip}
            employeeId={employeeId}
            month={month}
            year={year}
            onChanged={handlePanelChanged}
          />
        </TabPane>
      </TabContent>
    </React.Fragment>
  );
};

export default EmployeeRegularization;