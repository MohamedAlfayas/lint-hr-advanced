import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner,
  Button, Modal, ModalHeader, ModalBody, Row, Col, Badge
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

const employees = GetLocalStorageData("employee") || [];

const transformPayslip = (item) => {
  const earnings = {};
  const deductions = {};

  (item.components || []).forEach((comp) => {
    if (comp.component_type === "allowance" || comp.component_type === "reimbursement") {
      earnings[comp.component_name] = comp.final_amount;
    } else if (comp.component_type === "deduction") {
      deductions[comp.component_name] = comp.final_amount;
    }
  });

  // ✅ Add LOP deduction as a line item
  const lopDays = parseFloat(item.lop_days || 0);
  const grossEarnings = parseFloat(item.gross_earnings || 0);
  const totalEarningsBeforeLop = (item.components || [])
    .filter(c => c.component_type === "allowance" || c.component_type === "reimbursement")
    .reduce((sum, c) => sum + parseFloat(c.calculated_amount || 0), 0);
  const lopDeductedTotal = totalEarningsBeforeLop - grossEarnings;

  // ✅ After — always uses the same key → single column
  if (lopDays > 0 && lopDeductedTotal > 0) {
    deductions["LOP Deduction"] = lopDeductedTotal.toFixed(2);
  }

  // ✅ Add statutory deductions
  if (parseFloat(item.pf_employee) > 0) deductions["PF (Employee)"] = item.pf_employee;
  if (parseFloat(item.esi_employee) > 0) deductions["ESI (Employee)"] = item.esi_employee;
  if (parseFloat(item.pt_amount) > 0) deductions["Professional Tax"] = item.pt_amount;

  // ✅ Add OT in earnings
  if (parseFloat(item.ot_amount) > 0) {
    earnings["Overtime"] = item.ot_amount;
  }

  const empDetails = employees.find((e) => String(e.id) === String(item.employee));

  return {
    ...item,
    earnings,
    deductions,
    employee_name: empDetails
      ? `${empDetails.first_name} ${empDetails.last_name}`.trim()
      : `Employee #${item.employee}`,
    emp_id: empDetails?.emp_id || "—",
    profile_url: empDetails?.profile_url || null,
  };
};
const EmployeePayslip = ({ payrollRunId = 12 }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const [loading, setLoading] = useState(false);
  const [payslipData, setPayslipData] = useState([]);
  const [dynamicEarnings, setDynamicEarnings] = useState([]);
  const [dynamicDeductions, setDynamicDeductions] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Api({ method: "GET", url: `payroll/employee-payslip/?payroll_run=${payrollRunId}` })
      .then((res) => {
        const raw = res?.data?.data || [];
        const transformed = raw.map(transformPayslip);
        setPayslipData(transformed);

        const earningKeys = new Set();
        const deductionKeys = new Set();
        transformed.forEach((item) => {
          Object.keys(item.earnings || {}).forEach(k => earningKeys.add(k));
          Object.keys(item.deductions || {}).forEach(k => deductionKeys.add(k));
        });

        setDynamicEarnings(Array.from(earningKeys));
        setDynamicDeductions(Array.from(deductionKeys));
      })
      .catch(() => toast.error("Failed to load payslip data."))
      .finally(() => setLoading(false));
  }, [payrollRunId]);

  const handleOpenPayslipModal = (slip) => {
    setSelectedSlip(slip);
    setModalOpen(true);
  };

  const fmt = (val) =>
    Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  console.log("selectedPaySlip", selectedSlip)

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="success" />
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>Loading payslips...</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Card className="shadow-none border">
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">Employee Payslip Registry</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table className="table-bordered align-middle table-nowrap mb-0" style={{ fontSize: 13 }}>
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: 11 }}>
                <tr>
                  <th>Employee</th>
                  <th>Payable Days</th>
                  <th>LOP Days</th>
                  {dynamicEarnings.map((earn) => <th key={earn}>{earn}</th>)}
                  {dynamicDeductions.map((ded) => (
                    <th key={ded} className="text-danger">{ded}</th>
                  ))}
                  <th className="table-success text-dark">Net Pay</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslipData.length === 0 ? (
                  <tr>
                    <td colSpan={6 + dynamicEarnings.length + dynamicDeductions.length}
                      className="text-center py-4 text-muted">
                      No payslip data found.
                    </td>
                  </tr>
                ) : (
                  payslipData.map((row, index) => {
                    const netPay = parseFloat(row.net_pay || 0);
                    return (
                      <tr key={row.id || index}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            {row.profile_url ? (
                              <img src={row.profile_url} alt={row.employee_name}
                                className="rounded-circle" width={28} height={28}
                                style={{ objectFit: "cover" }} />
                            ) : (
                              <div className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                                style={{ width: 28, height: 28, fontSize: 11, fontWeight: 600, color: "#0ab39c" }}>
                                {(row.employee_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="mb-0 fw-medium" style={{ fontSize: 13 }}>{row.employee_name}</p>
                              <p className="mb-0 text-muted" style={{ fontSize: 11 }}>{row.emp_id}</p>
                            </div>
                          </div>
                        </td>
                        <td>{row.payable_days}</td>
                        <td>
                          {parseFloat(row.lop_days) > 0 ? (
                            <Badge color="danger" className="fs-11">{row.lop_days}</Badge>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
                        {dynamicEarnings.map((earn) => (
                          <td key={earn}>₹{fmt(row.earnings?.[earn])}</td>
                        ))}
                        {dynamicDeductions.map((ded) => (
                          <td key={ded} className="text-danger">₹{fmt(row.deductions?.[ded])}</td>
                        ))}
                        <td className={`fw-bold ${netPay < 0 ? "text-danger" : "text-success"}`}>
                          ₹{fmt(row.net_pay)}
                        </td>
                        <td className="text-center">
                          <Badge color={row.status === "draft" ? "warning" : "success"} className="fs-11">
                            {row.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button color="light" size="sm" className="border py-1 px-2"
                            onClick={() => handleOpenPayslipModal(row)}>
                            <i className="ri-printer-line align-middle me-1"></i>Open Slip
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Payslip Modal */}
      {selectedSlip && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
          <ModalHeader toggle={() => setModalOpen(false)} className="bg-light p-3">
            Payslip — {selectedSlip.employee_name || "Employee"} ({selectedSlip.emp_id || selectedSlip.employee})
          </ModalHeader>
          <ModalBody className="p-4">
            <div className="p-3 border rounded bg-white">

              {/* Header */}
              <div className="text-center mb-3">
                <h5 className="fw-bold text-uppercase mb-1">Salary Slip</h5>
                <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                  Payroll Run #{selectedSlip.payroll_run}
                </p>
              </div>
              <hr />

              {/* Employee Info */}
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Employee ID:</strong> {selectedSlip.emp_id || selectedSlip.employee}</p>
                  <p className="mb-1"><strong>Name:</strong> {selectedSlip.employee_name || "—"}</p>
                  <p className="mb-0"><strong>Structure:</strong> {selectedSlip.salary_structure_name || `ID: ${selectedSlip.salary_structure}`}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Based On:</strong> {selectedSlip.based_on?.toUpperCase()}</p>
                  <p className="mb-1"><strong>CTC:</strong> ₹{fmt(selectedSlip.ctc_amount)}</p>
                  <p className="mb-0"><strong>Effective Date:</strong> {selectedSlip.effective_date || "—"}</p>
                </Col>
              </Row>

              {/* Attendance Summary */}
              <div className="p-2 bg-light rounded mb-3 d-flex gap-4 flex-wrap" style={{ fontSize: 12 }}>
                <span><strong>Total Days:</strong> {selectedSlip.total_days_in_month}</span>
                <span><strong>Payable Days:</strong> {selectedSlip.payable_days}</span>
                <span><strong>Present:</strong> {selectedSlip.present_days}</span>
                <span><strong>Leave:</strong> {selectedSlip.approved_leave_days}</span>
                <span className={parseFloat(selectedSlip.lop_days) > 0 ? "text-danger fw-bold" : ""}>
                  <strong>LOP:</strong> {selectedSlip.lop_days}
                </span>
                <span><strong>Week Off:</strong> {selectedSlip.week_off_days}</span>
                <span><strong>Holidays:</strong> {selectedSlip.holiday_days}</span>
              </div>

              {/* Earnings & Deductions */}
              <Row>
                <Col md={6}>
                  <p className="text-uppercase fw-bold text-success mb-2" style={{ fontSize: 11 }}>
                    Earnings
                  </p>
                  <Table size="sm" bordered className="mb-0">
                    <tbody>
                      {Object.entries(selectedSlip.earnings || {}).map(([key, val]) => (
                        <tr key={key}>
                          <td style={{ fontSize: 12 }}>{key}</td>
                          <td className="text-end" style={{ fontSize: 12 }}>₹{fmt(val)}</td>
                        </tr>
                      ))}
                      <tr className="table-success fw-bold">
                        <td style={{ fontSize: 12 }}>Gross Earnings</td>
                        <td className="text-end" style={{ fontSize: 12 }}>₹{fmt(selectedSlip.gross_earnings)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <p className="text-uppercase fw-bold text-danger mb-2" style={{ fontSize: 11 }}>
                    Deductions
                  </p>
                  <Table size="sm" bordered className="mb-0">
                    <tbody>
                      {Object.entries(selectedSlip.deductions || {}).map(([key, val]) => (
                        <tr key={key}>
                          <td style={{ fontSize: 12 }}>{key}</td>
                          <td className="text-end text-danger" style={{ fontSize: 12 }}>₹{fmt(val)}</td>
                        </tr>
                      ))}
                      <tr className="table-danger fw-bold">
                        <td style={{ fontSize: 12 }}>Total Deductions</td>
                        <td className="text-end text-danger" style={{ fontSize: 12 }}>₹{fmt(selectedSlip.total_deductions)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Net Pay */}
              <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: 12 }}>Net Take-Home Pay</h6>
                <h5 className={`mb-0 fw-bold ${parseFloat(selectedSlip.net_pay) < 0 ? "text-danger" : "text-success"}`}>
                  ₹{fmt(selectedSlip.net_pay)}
                </h5>
              </div>

              {/* LOP Warning — only show when LOP > 0 */}
              {parseFloat(selectedSlip.lop_days) > 0 && (
                <div className="mt-2 p-2 rounded border border-warning border-opacity-25 bg-warning-subtle d-flex gap-2 align-items-start">
                  <i className="ri-error-warning-line text-warning mt-1"></i>
                  <p className="mb-0 text-warning-emphasis" style={{ fontSize: 12 }}>
                    <strong>{selectedSlip.lop_days} LOP days</strong> were deducted this month.
                    {parseFloat(selectedSlip.pf_employee) > 0 && (
                      <> Statutory deductions (PF: ₹{fmt(selectedSlip.pf_employee)}) still apply.</>
                    )}
                  </p>
                </div>
              )}

            </div>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default EmployeePayslip;