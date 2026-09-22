import React, { useEffect, useRef, useState } from "react";
import {
  Row, Col, Button, Badge,
  Table, Spinner, Nav, NavItem, NavLink, TabContent, TabPane,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import EmployeePayslip from "./EmployeePayslip";
import EmployeeRegularization from "./EmployeeRegularization";
import RunStatusActions from "./RunStatusActions";
import RunPaymentActions from "./RunPaymentActions";
import StatusBadge from "./StatusBadge";
import { isRunFullySettled, promoteSettledRun } from "./statusHelpers";

const employees = GetLocalStorageData("employee") || [];

const fmtDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmtDays = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const wholeDays = Math.floor(num);
  const hours = Math.round((num - wholeDays) * 9);
  if (hours === 0) return `${wholeDays} day${wholeDays !== 1 ? "s" : ""}`;
  if (wholeDays === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  return `${wholeDays} day${wholeDays !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`;
};

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const DetailRow = ({ label, value, last = false }) => (
  <Row className={`align-items-center py-2 g-0 ${!last ? "border-bottom" : ""}`}>
    <Col xs={5}>
      <span className="text-muted fw-medium" style={{ fontSize: 13 }}>{label}</span>
    </Col>
    <Col xs={7}>
      <span className="text-dark" style={{ fontSize: 13 }}>{value || "—"}</span>
    </Col>
  </Row>
);

// `isOpen` / `toggle` are kept as props for drop-in compatibility with
// existing callers (toggle is used to close/exit the full-screen page).
// `onChanged` is optional — pass the parent list's refetch (e.g. payrollRun.jsx's
// fetchData) so the run list picks up the status change too once a tranche is released.
const PayrollRunDetails = ({ isOpen, toggle, data, onChanged }) => {
  const [activeTab, setActiveTab]       = useState("overview");
  const [payslips, setPayslips]         = useState([]);
  const [loadingSlips, setLoadingSlips] = useState(false);

  // Run status is tracked locally so the badge/actions update immediately
  // after a payment release, without waiting for the parent list to refetch
  // and re-pass `data` (data.status itself never mutates in place here).
  const [runStatus, setRunStatus] = useState(data?.status);
  useEffect(() => { setRunStatus(data?.status); }, [data?.id, data?.status, isOpen]);

  const refreshRunStatus = () => {
    if (!data?.id) return;
    Api({ method: "GET", url: "payroll/payroll-run/" })
      .then((res) => {
        const rows = res?.data?.data || res?.data || [];
        const match = rows.find((r) => String(r.id) === String(data.id));
        if (match) setRunStatus(match.status);
      })
      .catch(() => {});
  };

  // ── Regularization tab state ─────────────────────────────────────────────
  const [selectedRegEmp, setSelectedRegEmp] = useState(null); // react-select option

  // ── Cross-tab refresh ────────────────────────────────────────────────────
  // Incremented whenever a regularization is saved in the Regularization tab.
  // Passed as `refreshKey` to EmployeePayslip so it re-fetches and the
  // Payslips tab immediately reflects the new LOP days / net pay.
  const [payslipRefreshKey, setPayslipRefreshKey] = useState(0);
  const handleRegularizationSaved = () => setPayslipRefreshKey((k) => k + 1);
  const promotedRunId = useRef(null);

  // Reset UI state only when the panel is (re)opened for a run — not on
  // every payslipRefreshKey bump, or a payment release would bounce the
  // user back to the Overview tab mid-review.
  useEffect(() => {
    if (isOpen && data?.id) {
      setActiveTab("overview");
      setSelectedRegEmp(null);
    }
  }, [isOpen, data?.id]);

  useEffect(() => {
    if (isOpen && data?.id) {
      setLoadingSlips(true);
      Api({ method: "GET", url: `payroll/employee-payslip/?payroll_run=${data.id}` })
        .then((res) => {
          const raw = res?.data?.data || [];
          const enriched = raw.map((slip) => {
            const emp = employees.find((e) => String(e.id) === String(slip.employee));
            return {
              ...slip,
              employee_name: emp
                ? `${emp.first_name} ${emp.last_name}`.trim()
                : `Employee #${slip.employee}`,
              emp_id:     slip.employee_emp_id || emp?.emp_id     || "—",
              department: slip.department_name || emp?.department_name || "",
            };
          });
          setPayslips(enriched);
        })
        .catch(() => toast.error("Failed to load payslip breakdown"))
        .finally(() => setLoadingSlips(false));
    }
    // payslipRefreshKey bumps after a regularization save OR a payment
    // release, so the Overview/Bonus aggregates (incl. Paid/Balance) stay
    // in sync with what EmployeePayslip's own table is showing.
  }, [isOpen, data?.id, payslipRefreshKey]);

  // Balance can already be zero while the run is still partially_paid.
  // Paid is hidden as a manual next step, so Close never shows until the
  // run itself is paid.
  useEffect(() => {
    if (!isOpen || !data?.id || loadingSlips) return;
    if (runStatus !== "locked" && runStatus !== "partially_paid") return;
    if (!isRunFullySettled(payslips)) return;
    if (promotedRunId.current === data.id) return;
    promotedRunId.current = data.id;
    promoteSettledRun(data.id, payslips)
      .then((res) => {
        const status = res?.data?.data?.status;
        if (status && status !== "paid") {
          promotedRunId.current = null;
          toast.error(`Run stayed ${status}.`);
          return;
        }
        setRunStatus("paid");
        setPayslipRefreshKey((k) => k + 1);
        toast.success("Payroll run marked paid");
        onChanged && onChanged();
      })
      .catch((err) => {
        promotedRunId.current = null;
        toast.error(err?.response?.data?.error_message || err?.message || "Could not mark the run paid.");
      });
  }, [isOpen, data?.id, loadingSlips, runStatus, payslips, onChanged]);

  // Lock body scroll while the full-screen page is open (same behaviour a
  // Modal would have given us for free).
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prevOverflow; };
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const totalNetPay     = payslips.reduce((s, p) => s + parseFloat(p.net_pay         || 0), 0);
  const totalGross      = payslips.reduce((s, p) => s + parseFloat(p.gross_earnings  || 0), 0);
  const totalDeductions = payslips.reduce((s, p) => s + parseFloat(p.total_deductions|| 0), 0);
  const totalBonus      = payslips.reduce((s, p) => s + parseFloat(p.total_bonus     || 0), 0);
  const totalGratuity   = payslips.reduce((s, p) => s + parseFloat(p.gratuity_provision || 0), 0);
  const totalPF         = payslips.reduce((s, p) => s + parseFloat(p.pf_employee     || 0), 0);
  const totalPaid       = payslips.reduce((s, p) => s + parseFloat(p.paid_amount     || 0), 0);
  const totalBalance    = payslips.reduce((s, p) => s + parseFloat(p.balance_amount  || 0), 0);

  const handlePaymentReleased = () => {
    setPayslipRefreshKey((k) => k + 1); // re-fetch payslips inside EmployeePayslip tab
    refreshRunStatus();
    onChanged && onChanged();
  };

  // ── Build react-select options for Regularization tab ───────────────────
  // Each option shows name + emp_id + department so duplicates are distinguishable
  const employeeOptions = payslips.map((p) => ({
    value:      p.employee,
    label:      p.employee_name,
    emp_id:     p.emp_id,
    department: p.department,
    month:      data.month,
    year:       data.year,
  }));

  const selectedPayslip = selectedRegEmp
    ? payslips.find((p) => String(p.employee) === String(selectedRegEmp.value))
    : null;

  const TABS = ["overview", "payslips", "bonus & gratuity"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1040,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between bg-light border-bottom p-3 flex-shrink-0">
        <div className="d-flex align-items-center">
          <Button color="link" className="text-dark p-0 me-3" onClick={toggle} title="Close">
            <i className="ri-arrow-left-line fs-4"></i>
          </Button>
          <span className="fw-semibold fs-5">
            Payroll Run — {MONTH_NAMES[data.month]} {data.year}
          </span>
          <span className="ms-2">
            <RunStatusActions run={{ ...data, status: runStatus }} onChanged={() => { refreshRunStatus(); onChanged && onChanged(); }} />
          </span>
          <span className="ms-3">
            <RunPaymentActions run={{ ...data, status: runStatus }} payslips={payslips} onReleased={handlePaymentReleased} />
          </span>
        </div>
        <Button close onClick={toggle} aria-label="Close" />
      </div>

      {/* ── Body ── */}
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ minHeight: 0, overflow: "hidden" }}
      >
        {/* ── Tabs ── */}
        <Nav tabs className="px-4 pt-3 bg-light border-bottom flex-shrink-0">
          {TABS.map((tab) => (
            <NavItem key={tab}>
              <NavLink
                className={`px-3 py-2 ${activeTab === tab ? "active fw-semibold" : "text-muted"}`}
                style={{ cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "regularization"
                  ? <><i className="ri-calendar-check-line align-middle me-1"></i>Regularization</>
                  : tab === "bonus & gratuity"
                  ? <><i className="ri-award-line align-middle me-1"></i>Bonus &amp; Gratuity</>
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent
          activeTab={activeTab}
          className="flex-grow-1 d-flex flex-column"
          style={{ minHeight: 0, overflow: "hidden" }}
        >

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <TabPane tabId="overview" className="h-100" style={{ minHeight: 0 }}>
              <SimpleBar style={{ maxHeight: "100%" }} autoHide={false} className="p-4">
                <Row>
                  <Col md={6}>
                    <p className="fw-semibold text-uppercase text-muted mb-2" style={{ fontSize: 11 }}>Run Information</p>
                    <div className="border rounded px-3 bg-white mb-3">
                      <DetailRow label="Month"        value={MONTH_NAMES[data.month]} />
                      <DetailRow label="Year"         value={data.year} />
                      <DetailRow label="Status"       value={<StatusBadge scope="run" code={runStatus} />} />
                      <DetailRow label="Processed At" value={fmtDateTime(data.processed_at)} />
                      <DetailRow label="Approved At"  value={fmtDateTime(data.approved_at)} />
                      <DetailRow label="Paid At"      value={fmtDateTime(data.paid_at)} />
                      <DetailRow label="Remarks"      value={data.remarks      || "—"} last />
                    </div>
                  </Col>
                  <Col md={6}>
                    <p className="fw-semibold text-uppercase text-muted mb-2" style={{ fontSize: 11 }}>Payroll Aggregates</p>
                    <div className="border rounded px-3 bg-white">
                      <DetailRow label="Total Employees"  value={payslips.length} />
                      <DetailRow label="Total Gross"      value={`₹${fmt(totalGross)}`} />
                      <DetailRow label="Total Deductions" value={`₹${fmt(totalDeductions)}`} />
                      <DetailRow label="Total PF (Emp)"   value={`₹${fmt(totalPF)}`} />
                      <DetailRow label="Total Bonus"      value={<span className="text-success fw-semibold">₹{fmt(totalBonus)}</span>} />
                      <DetailRow label="Gratuity Provision" value={<span className="text-muted">₹{fmt(totalGratuity)}</span>} />
                      <DetailRow label="Total Paid"       value={<span className="text-success fw-semibold">₹{fmt(totalPaid)}</span>} />
                      <DetailRow label="Balance Pending"  value={<span className={totalBalance > 0 ? "text-warning fw-semibold" : "text-muted"}>₹{fmt(totalBalance)}</span>} />
                      <DetailRow label="Total Net Pay"    value={<span className="text-success fw-bold fs-6">₹{fmt(totalNetPay)}</span>} last />
                    </div>
                  </Col>
                </Row>
              </SimpleBar>
            </TabPane>
          )}

          {/* ── Payslips ── */}
          {activeTab === "payslips" && (
            <TabPane tabId="payslips" className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
              <div className="p-4 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: "hidden" }}>
                <EmployeePayslip
                  payrollRunId={data?.id}
                  month={data.month}
                  year={data.year}
                  refreshKey={payslipRefreshKey}
                  runStatus={runStatus}
                  onPaymentReleased={handlePaymentReleased}
                />
              </div>
            </TabPane>
          )}

          {/* ── Bonus & Gratuity ── */}
          {activeTab === "bonus & gratuity" && (
            <TabPane tabId="bonus & gratuity" className="h-100" style={{ minHeight: 0 }}>
              {loadingSlips ? (
                <div className="text-center py-5">
                  <Spinner color="primary" size="sm" />
                  <p className="text-muted mt-2" style={{ fontSize: 13 }}>Loading data...</p>
                </div>
              ) : payslips.length === 0 ? (
                <p className="text-center text-muted py-4">No payslips generated for this run.</p>
              ) : (
                <div className="d-flex flex-column h-100 p-4">
                  <SimpleBar autoHide={false} className="mb-4 flex-shrink-0">
                    <Row className="flex-nowrap g-3 mx-0">
                      {[
                        {
                          label: "Total Statutory Bonus",
                          val: payslips.reduce((s, p) => s + parseFloat(p.statutory_bonus || 0), 0),
                          color: "success",
                        },
                        {
                          label: "Total Performance Bonus",
                          val: payslips.reduce((s, p) => s + parseFloat(p.performance_bonus || 0), 0),
                          color: "info",
                        },
                        { label: "Total Bonus Payout", val: totalBonus,    color: "primary" },
                        { label: "Total Gratuity (CTC)", val: totalGratuity, color: "secondary" },
                      ].map((c, i) => (
                        <Col style={{ minWidth: "240px", maxWidth: "280px" }} key={i}>
                          <div className="border rounded p-3 bg-white text-center h-100">
                            <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: 10 }}>
                              {c.label}
                            </p>
                            <h5 className={`mb-0 fw-bold text-${c.color}`}>₹{fmt(c.val)}</h5>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </SimpleBar>

                  <SimpleBar className="border rounded flex-grow-1" style={{ minHeight: 0 }} autoHide={false}>
                    <Table bordered className="align-middle mb-0" style={{ fontSize: 13, minWidth: "1100px" }}>
                      <thead className="table-light text-muted text-uppercase sticky-top" style={{ fontSize: 11, top: 0, zIndex: 1 }}>
                        <tr>
                          <th>Employee</th>
                          <th>Eligible for Statutory</th>
                          <th className="text-success">Statutory Bonus</th>
                          <th className="text-info">Performance Bonus</th>
                          <th className="text-primary">Total Bonus</th>
                          <th>Gratuity Eligible</th>
                          <th>Years of Service</th>
                          <th className="text-secondary">Gratuity Provision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((slip, i) => (
                          <tr key={slip.id || i}>
                            <td>
                              <p className="mb-0 fw-medium">{slip.employee_name}</p>
                              <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                {slip.emp_id}
                                {slip.department && <span className="ms-1">· {slip.department}</span>}
                              </p>
                            </td>
                            <td className="text-center">
                              {slip.is_statutory_bonus_eligible
                                ? <Badge color="success">Yes</Badge>
                                : <Badge color="secondary">No</Badge>}
                            </td>
                            <td className="text-success">₹{fmt(slip.statutory_bonus)}</td>
                            <td className="text-info">₹{fmt(slip.performance_bonus)}</td>
                            <td className="fw-bold text-primary">₹{fmt(slip.total_bonus)}</td>
                            <td className="text-center">
                              {slip.is_gratuity_eligible
                                ? <Badge color="success">Yes</Badge>
                                : <Badge color="warning">Provisioning</Badge>}
                            </td>
                            <td>{slip.gratuity_years_of_service || "—"} yrs</td>
                            <td className="text-muted">₹{fmt(slip.gratuity_provision)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </SimpleBar>
                </div>
              )}
            </TabPane>
          )}

        </TabContent>
      </div>

      {/* ── Footer ── */}
      <div className="d-flex justify-content-end bg-light border-top p-3 flex-shrink-0">
        <Button color="secondary" size="sm" onClick={toggle}>Close</Button>
      </div>
    </div>
  );
};

export default PayrollRunDetails;