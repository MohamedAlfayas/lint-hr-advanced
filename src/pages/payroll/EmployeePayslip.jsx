import React, { useEffect, useState } from "react";
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
} from "reactstrap";
import SimpleBar from "simplebar-react";

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

// ---- Dummy employee profile (swap this block out for a real API call later) ----
const EMPLOYEE = {
  name: "Rahul Sharma",
  empId: "EMP12345",
  department: "IT",
  designation: "Software Engineer",
};

// ---- Dummy payslips (swap this block out for a real API call later) ----
const DUMMY_PAYSLIPS = [
  {
    id: 1,
    month: 5,
    year: 2025,
    pay_date: "31 May 2025",
    net_pay: "56,890.00",
    status: "paid",
  },
  {
    id: 2,
    month: 4,
    year: 2025,
    pay_date: "30 Apr 2025",
    net_pay: "56,890.00",
    status: "paid",
  },
  {
    id: 3,
    month: 3,
    year: 2025,
    pay_date: "31 Mar 2025",
    net_pay: "55,760.00",
    status: "paid",
  },
  {
    id: 4,
    month: 2,
    year: 2025,
    pay_date: "28 Feb 2025",
    net_pay: "55,760.00",
    status: "paid",
  },
  {
    id: 5,
    month: 1,
    year: 2025,
    pay_date: "31 Jan 2025",
    net_pay: "54,630.00",
    status: "paid",
  },
  {
    id: 6,
    month: 12,
    year: 2024,
    pay_date: "31 Dec 2024",
    net_pay: "54,630.00",
    status: "paid",
  },
  {
    id: 7,
    month: 11,
    year: 2024,
    pay_date: "30 Nov 2024",
    net_pay: "53,500.00",
    status: "processed",
  },
  {
    id: 8,
    month: 10,
    year: 2024,
    pay_date: "31 Oct 2024",
    net_pay: "53,500.00",
    status: "draft",
  },
];
// ----------------------------------------------------------------------

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

// Builds [{ value, label }] financial-year-style options e.g. "2024 - 2025"
// for the last 5 years. `value` is matched against a payslip's `year` field.
// Swap the math here for real FY logic (Apr–Mar) once wired to a live API.
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const endYear = currentYear - i;
    return { value: endYear, label: `${endYear - 1} - ${endYear}` };
  });
};

const EmployeePayslip = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // Simulates a fetch so loading / empty states still demo correctly.
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setRecords(DUMMY_PAYSLIPS);
      setSelectedYear(DUMMY_PAYSLIPS[0]?.year ?? "");
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = records.filter(
    (row) => !selectedYear || String(row.year) === String(selectedYear),
  );

  // Simulates a download by generating a small placeholder text file in-browser.
  const handleDownload = (row) => {
    setDownloadingId(row.id);
    setTimeout(() => {
      const content = `Payslip\nMonth: ${getMonthName(row.month)} ${row.year}\nPay Date: ${row.pay_date}\nNet Pay: ₹${row.net_pay}\nStatus: ${row.status}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Payslip_${getMonthName(row.month)}_${row.year}.txt`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadingId(null);
    }, 400);
  };

  const yearOptions = getYearOptions();

  return (
    <React.Fragment>
      {/* Page heading */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Payslip</h3>
        <p className="text-muted mb-0">
          View and download your monthly payslips.
        </p>
      </div>

      {/* Employee summary banner */}
      <Card
        className="border-0 mb-4"
        style={{ backgroundColor: "#dff0fa", borderRadius: 14 }}
      >
        <CardBody className="p-4">
          <Row className="align-items-center g-4">
            {/* Employee details */}
            <Col xs={12} md={6} className="d-flex align-items-center gap-3">
              <span className="d-flex align-items-center justify-content-center rounded-circle bg-white flex-shrink-0">
                <i
                  className="ri-file-list-3-line text-primary"
                  style={{ fontSize: 26 }}
                ></i>
              </span>
              <div>
                <h5 className="mb-1 fw-bold">{EMPLOYEE.name}</h5>
                <p className="mb-0 text-muted">
                  Emp ID:{" "}
                  <span className="text-body fw-medium">{EMPLOYEE.empId}</span>
                </p>
                <p className="mb-0 text-muted">
                  Department:{" "}
                  <span className="text-body fw-medium">
                    {EMPLOYEE.department}
                  </span>
                </p>
                <p className="mb-0 text-muted">
                  Designation:{" "}
                  <span className="text-primary fw-medium">
                    {EMPLOYEE.designation}
                  </span>
                </p>
              </div>
            </Col>

            {/* Year filter — desktop */}
            <Col md={4} className="border-start ps-4 d-none d-md-block">
              <Label className="text-muted mb-1">Year</Label>
              <Input
                type="select"
                bsSize="lm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ maxWidth: 180 }}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
            </Col>

            {/* Year filter — stacked version for small screens */}
            <Col xs={12} className="d-md-none">
              <Label className="text-muted mb-1">Year</Label>
              <Input
                type="select"
                bsSize="sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
            </Col>

            {/* Calendar illustration */}
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
                            disabled={downloadingId === row.id}
                            onClick={() => handleDownload(row)}
                          >
                            {downloadingId === row.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <i className="ri-download-2-line align-bottom me-1"></i>
                                Download
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          )}

          {/* Password note */}
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
    </React.Fragment>
  );
};

export default EmployeePayslip;
