import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  Button,
  Input,
  Label,
  Badge,
  Table,
  Spinner,
  Alert,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { GetApi } from "../../common/api/GetApi";
import MyPayslipDetailModal from "./MyPayslipDetailModal";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Returns the readable month name whether `month` is a number (1..12) or a string.
const getMonthName = (month) => {
  if (month === null || month === undefined || month === "") return "";
  if (isNaN(month)) return String(month);
  return MONTH_NAMES[parseInt(month, 10)] || String(month);
};

const getStatusColor = (status) => {
  switch (String(status).toLowerCase()) {
    case "draft":
      return "warning";
    case "processed":
      return "primary";
    case "approved":
    case "paid":
      return "success";
    default:
      return "secondary";
  }
};

// Builds calendar-year options (e.g. "2024", "2025") from the years actually
// present in the fetched records — no fixed 5-year range, no FY math, no dupes.
const getYearOptions = (records) => {
  const years = [...new Set(records.map((r) => Number(r.year)))]
    .filter((y) => !Number.isNaN(y))
    .sort((a, b) => b - a);
  return years.map((y) => ({ value: y, label: String(y) }));
};

const EmployeePayslip = ({ withTopPadding = true, employeeId = null }) => {
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // ── Payslip detail modal state ──────────────────────────────────────────
  // MyPayslipDetailModal is self-fetching: we only need to pass it the
  // payslip id, it loads full detail + handles its own PDF download.
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = employeeId
        ? `payroll/employee-payslip-list-id/${employeeId}`
        : "payroll/employee-payslip-list";
      const res = await GetApi(url);
      const data = res?.data ?? res;

      const fetchedRecords = data?.data?.payslips ?? [];
      setEmployee(data?.data?.employee ?? null);
      setRecords(fetchedRecords);

      const years = getYearOptions(fetchedRecords);
      const currentYear = new Date().getFullYear();
      const hasCurrentYear = years.some((y) => y.value === currentYear);
      setSelectedYear(hasCurrentYear ? currentYear : (years[0]?.value ?? ""));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load payslips. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRecords = records.filter(
    (row) => !selectedYear || Number(row.year) === Number(selectedYear),
  );

  const handleOpenSlip = (row) => {
    setSelectedPayslipId(row.id);
    setModalOpen(true);
  };

  const handleCloseSlip = () => {
    setModalOpen(false);
    setSelectedPayslipId(null);
  };

  const yearOptions = getYearOptions(records);

  return (
    <React.Fragment>
      {error && (
        <Alert color="danger" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Employee summary banner */}
      <div style={{ paddingTop: withTopPadding ? "70px" : "0px" }}>
        <Card
          className="border-0 mb-4"
          style={{ backgroundColor: "#dff0fa", borderRadius: 10 }}
        >
          <CardBody className="p-4">
            <Row className="align-items-center g-4">
              <Col xs={12} md={6} className="d-flex align-items-center gap-3">
                <span className="d-flex align-items-center justify-content-center rounded-circle bg-white flex-shrink-0">
                  <i
                    className="ri-file-list-3-line text-primary"
                    style={{ fontSize: 26 }}
                  ></i>
                </span>
                <div>
                  <h5 className="mb-1 fw-bold">
                    {employee?.name ?? (loading ? "Loading..." : "—")}
                  </h5>
                  <p className="mb-0 text-muted">
                    Emp ID:{" "}
                    <span className="text-body fw-medium">
                      {employee?.emp_id ?? "—"}
                    </span>
                  </p>
                  <p className="mb-0 text-muted">
                    Designation:{" "}
                    <span className="text-primary fw-medium">
                      {employee?.designation ?? "—"}
                    </span>
                  </p>
                </div>
              </Col>

              <Col md={4} className="border-start ps-4 d-none d-md-block">
                <Label className="text-muted mb-1">Year</Label>
                <Input
                  type="select"
                  bsSize="lm"
                  value={selectedYear}
                  disabled={yearOptions.length === 0}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ maxWidth: 180 }}
                >
                  {yearOptions.length === 0 && <option value="">—</option>}
                  {yearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col xs={12} className="d-md-none">
                <Label className="text-muted mb-1">Year</Label>
                <Input
                  type="select"
                  bsSize="sm"
                  value={selectedYear}
                  disabled={yearOptions.length === 0}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {yearOptions.length === 0 && <option value="">—</option>}
                  {yearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col md={2} className="d-none d-lg-flex justify-content-end">
                <span
                  className="d-flex align-items-center justify-content-center rounded-4"
                  style={{
                    width: 64,
                    height: 64,
                    background: "linear-gradient(135deg, #7db8ff, #5d8eff)",
                    boxShadow: "0 8px 20px rgba(93, 142, 255, 0.18)",
                  }}
                >
                  <i
                    className="ri-calendar-2-fill text-white"
                    style={{ fontSize: "22px" }}
                  ></i>
                </span>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
      {/* Payslip history */}
      <Card className="border shadow-none">
        <CardBody className="p-4">
          <CardTitle tag="h5" className="fw-bold mb-3">
            Payslip History
          </CardTitle>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" size="md" />
              <p className="text-muted mt-2">Fetching your payslips...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5">
              <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted mb-3">
                <i className="ri-file-search-line"></i>
              </span>
              <h6 className="text-muted mb-1">No payslips found</h6>
              <p className="text-muted mb-0">Try a different year.</p>
            </div>
          ) : (
            <SimpleBar
              style={{ maxHeight: "calc(100vh - 420px)" }}
              autoHide={false}
            >
              <div className="table-responsive">
                <Table className="align-middle table-nowrap mb-0">
                  <thead className="text-muted">
                    <tr>
                      <th>Month & Year</th>
                      <th>Pay Date</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-medium">
                          {getMonthName(row.month)} {row.year}
                        </td>
                        <td className="text-muted">{row.pay_date}</td>
                        <td className="fw-semibold">
                          {row.net_pay ? `₹ ${row.net_pay}` : "—"}
                        </td>
                        <td>
                          <Badge
                            color={`soft-${getStatusColor(row.status)}`}
                            className={`text-${getStatusColor(row.status)}`}
                            pill
                          >
                            {row.status.charAt(0).toUpperCase() +
                              row.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            color="primary"
                            outline
                            size="sm"
                            className="py-1 px-3"
                            onClick={() => handleOpenSlip(row)}
                          >
                            <i className="ri-eye-line align-bottom me-1"></i>
                            Open Slip
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          )}

          <div
            className="d-flex align-items-start gap-2 p-3 mt-3 rounded"
            style={{ backgroundColor: "#dff0fa" }}
          >
            <i className="ri-information-line text-primary mt-1"></i>
            <div>
              <p className="mb-0 text-primary fw-semibold">
                Payslips are password protected.
              </p>
              <p className="mb-0 text-muted">
                Password format: Date of Birth (DDMMYYYY)
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Payslip detail modal — fetches its own data from payroll/employee-payslip/?id=
          and generates the styled PDF client-side via @react-pdf/renderer.
          This replaces the previous broken inline axios download call. */}
      <MyPayslipDetailModal
        payslipId={selectedPayslipId}
        isOpen={modalOpen}
        onClose={handleCloseSlip}
      />
    </React.Fragment>
  );
};

export default EmployeePayslip;
