import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Row, Col, Button, Badge, Table, Spinner, Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import EmployeePayslip from "./EmployeePayslip";

const employees = GetLocalStorageData("employee") || [];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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

const getStatusColor = (status) => {
  switch (String(status).toLowerCase()) {
    case "draft": return "warning";
    case "processed": return "primary";
    case "approved": return "success";
    case "paid": return "dark";
    default: return "secondary";
  }
};

const PayrollRunDetails = ({ isOpen, toggle, data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [payslips, setPayslips] = useState([]);
  const [loadingSlips, setLoadingSlips] = useState(false);

  useEffect(() => {
    if (isOpen && data?.id) {
      setActiveTab("overview");
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
              emp_id: emp?.emp_id || "—",
            };
          });
          setPayslips(enriched);
        })
        .catch(() => toast.error("Failed to load payslip breakdown"))
        .finally(() => setLoadingSlips(false));
    }
  }, [isOpen, data?.id]);

  if (!data) return null;

  const totalNetPay = payslips.reduce((s, p) => s + parseFloat(p.net_pay || 0), 0);
  const totalGross = payslips.reduce((s, p) => s + parseFloat(p.gross_earnings || 0), 0);
  const totalDeductions = payslips.reduce((s, p) => s + parseFloat(p.total_deductions || 0), 0);
  const totalBonus = payslips.reduce((s, p) => s + parseFloat(p.total_bonus || 0), 0);
  const totalGratuity = payslips.reduce((s, p) => s + parseFloat(p.gratuity_provision || 0), 0);
  const totalPF = payslips.reduce((s, p) => s + parseFloat(p.pf_employee || 0), 0);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle} className="bg-light p-3">
        Payroll Run — {MONTH_NAMES[data.month]} {data.year}
        <Badge color={getStatusColor(data.status)} className="ms-2" style={{ fontSize: 11 }}>
          {data.status}
        </Badge>
      </ModalHeader>

      <ModalBody className="p-0 d-flex flex-column" style={{ maxHeight: "80vh" }}>
        {/* Navigation Tabs (Sticky Top) */}
        <Nav tabs className="px-4 pt-3 bg-light border-bottom sticky-top" style={{ zIndex: 10 }}>
          {["overview", "payslips", "bonus & gratuity"].map((tab) => (
            <NavItem key={tab}>
              <NavLink
                className={`px-3 py-2 ${activeTab === tab ? "active fw-semibold" : "text-muted"}`}
                style={{ cursor: "pointer", fontSize: 13 }}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        {/* Forced standard uniform layout viewports across all views.
          Setting explicit height along with auto overflow structures locks every element 
          into identical modal container boundaries.
        */}
        <TabContent 
          activeTab={activeTab} 
          className="p-4 flex-grow-1" 
          style={{ 
            height: "65vh", 
            overflowY: "auto", 
            overflowX: "auto" 
          }}
        >

          {/* ── Tab 1: Overview ─────────────────────────────────────────── */}
          <TabPane tabId="overview" className="h-100">
            <Row>
              <Col md={6}>
                <p className="fw-semibold text-uppercase text-muted mb-2" style={{ fontSize: 11 }}>
                  Run Information
                </p>
                <div className="border rounded px-3 bg-white mb-3">
                  <DetailRow label="Month" value={MONTH_NAMES[data.month]} />
                  <DetailRow label="Year" value={data.year} />
                  <DetailRow label="Status" value={<Badge color={getStatusColor(data.status)}>{data.status}</Badge>} />
                  <DetailRow label="Processed At" value={data.processed_at || "—"} />
                  <DetailRow label="Approved At" value={data.approved_at || "—"} />
                  <DetailRow label="Paid At" value={data.paid_at || "—"} />
                  <DetailRow label="Remarks" value={data.remarks || "—"} last />
                </div>
              </Col>
              <Col md={6}>
                <p className="fw-semibold text-uppercase text-muted mb-2" style={{ fontSize: 11 }}>
                  Payroll Aggregates
                </p>
                <div className="border rounded px-3 bg-white">
                  <DetailRow label="Total Employees" value={payslips.length} />
                  <DetailRow label="Total Gross" value={`₹${fmt(totalGross)}`} />
                  <DetailRow label="Total Deductions" value={`₹${fmt(totalDeductions)}`} />
                  <DetailRow label="Total PF (Emp)" value={`₹${fmt(totalPF)}`} />
                  <DetailRow label="Total Bonus" value={<span className="text-success fw-semibold">₹{fmt(totalBonus)}</span>} />
                  <DetailRow label="Gratuity Provision" value={<span className="text-muted">₹{fmt(totalGratuity)}</span>} />
                  <DetailRow label="Total Net Pay" value={<span className="text-success fw-bold fs-6">₹{fmt(totalNetPay)}</span>} last />
                </div>
              </Col>
            </Row>
          </TabPane>

          {/* ── Tab 2: Payslips ─────────────────────────────────────────── */}
          <TabPane tabId="payslips">
            <EmployeePayslip payrollRunId={data?.id} />
          </TabPane>

          {/* ── Tab 3: Bonus & Gratuity ──────────────────────────────────── */}
          <TabPane tabId="bonus & gratuity">
            {loadingSlips ? (
              <div className="text-center py-5">
                <Spinner color="primary" size="sm" />
                <p className="text-muted mt-2" style={{ fontSize: 13 }}>Loading data...</p>
              </div>
            ) : payslips.length === 0 ? (
              <p className="text-center text-muted py-4">No payslips generated for this run.</p>
            ) : (
              <>
                {/* Summary Cards Line */}
                <div style={{ minWidth: "max-content", width: "100%" }}>
                  <Row className="mb-4 flex-nowrap g-3 mx-0">
                    {[
                      { label: "Total Statutory Bonus", val: payslips.reduce((s, p) => s + parseFloat(p.statutory_bonus || 0), 0), color: "success" },
                      { label: "Total Performance Bonus", val: payslips.reduce((s, p) => s + parseFloat(p.performance_bonus || 0), 0), color: "info" },
                      { label: "Total Bonus Payout", val: totalBonus, color: "primary" },
                      { label: "Total Gratuity (CTC)", val: totalGratuity, color: "secondary" },
                    ].map((c, i) => (
                      <Col style={{ minWidth: "240px", maxWidth: "280px" }} key={i}>
                        <div className="border rounded p-3 bg-white text-center h-100">
                          <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: 10 }}>{c.label}</p>
                          <h5 className={`mb-0 fw-bold text-${c.color}`}>₹{fmt(c.val)}</h5>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Main Data Layout Grid */}
                <div className="table-responsive border rounded" style={{ overflowX: "auto" }}>
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
                            <p className="mb-0 text-muted" style={{ fontSize: 11 }}>{slip.emp_id}</p>
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
                </div>
              </>
            )}
          </TabPane>

        </TabContent>
      </ModalBody>

      <ModalFooter className="bg-light p-3">
        <Button color="secondary" size="sm" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default PayrollRunDetails;