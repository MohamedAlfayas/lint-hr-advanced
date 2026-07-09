import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  Col,
  Row,
  Button,
  Input,
  Badge,
  Table,
  Spinner,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import PayrollRunModal from "./payrollRunModal";
import PayrollRunDetails from "./payrollRunDetails";
import RunStatusActions from "./RunStatusActions";

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

// Returns the readable month name whether `month` is a number (1..12) or a string.
const getMonthName = (month) => {
  if (month === null || month === undefined || month === "") return "";
  if (isNaN(month)) return String(month);
  return MONTH_NAMES[parseInt(month, 10)] || String(month);
};

const PayrollRun = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/payroll-run/" })
      .then((res) => {
        // Fallback to layout array if data.data mapping is empty
        setRecords(res?.data?.data || res?.data || []);
      })
      .catch(() => {
        toast.error("Failed to load payroll runs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Card Calculations
  const processedCount = records.filter((x) => x.status === "processed").length;
  const approvedCount = records.filter((x) => x.status === "approved").length;
  const paidCount = records.filter((x) => x.status === "paid").length;

  // Search by month name ("january" / "jan"), raw month value, or year.
  const filteredRecords = records.filter((row) => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return true;

    const monthName = getMonthName(row.month).toLowerCase(); // "january"
    const monthRaw = row.month ? String(row.month).toLowerCase() : ""; // "1"
    const yearStr = row.year ? String(row.year) : "";

    return (
      monthName.includes(searchLower) ||
      monthRaw.includes(searchLower) ||
      yearStr.includes(searchLower)
    );
  });

  const handleViewDetails = (run) => {
    setSelectedRun(run);
    setDetailsOpen(true);
  };

  return (
    <React.Fragment>
      {/* Summary Cards */}
      <Row className="mb-4">
        {[
          { title: "Total Payroll Runs", count: records.length, bg: "info" },
          { title: "Processed", count: processedCount, bg: "primary" },
          { title: "Approved", count: approvedCount, bg: "success" },
          { title: "Paid", count: paidCount, bg: "dark" },
        ].map((card, idx) => (
          <Col p="2" sm={6} md={3} key={idx}>
            <Card className="shadow-none border mb-0">
              <CardBody className="p-3">
                <p
                  className="text-muted text-uppercase fw-semibold mb-1"
                  style={{ fontSize: 11 }}
                >
                  {card.title}
                </p>
                <h4 className={`mb-0 fw-bold text-${card.bg}`}>{card.count}</h4>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Container Layout */}
      <Card className="shadow-none border">
        <CardHeader className="bg-light d-flex justify-content-between align-items-center">
          <div>
            <CardTitle tag="h5" className="mb-0">
              Payroll Run Management
            </CardTitle>
            <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
              Process, verify, and monitor company payouts
            </CardSubtitle>
          </div>
          <Button color="success" size="sm" onClick={() => setModalOpen(true)}>
            <i className="ri-add-line align-bottom me-1"></i> Run Payroll
          </Button>
        </CardHeader>

        <CardBody className="p-4">
          <div className="d-flex mb-3" style={{ maxWidth: "300px" }}>
            <Input
              type="text"
              placeholder="Search by Month or Year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" size="md" />
              <p className="text-muted mt-2" style={{ fontSize: 13 }}>
                Fetching Payroll logs...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5">
              <h6 className="text-muted">
                No payroll run logs match your criteria.
              </h6>
            </div>
          ) : (
            <SimpleBar
              style={{ maxHeight: "calc(100vh - 420px)" }}
              autoHide={false}
            >
              <div className="table-responsive">
                <Table className="align-middle table-nowrap mb-0 border">
                  <thead
                    className="table-light text-muted"
                    style={{
                      fontSize: 12,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <tr>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Processed At</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 13 }}>
                    {filteredRecords.map((row, index) => (
                      <tr key={row.id || index}>
                        <td className="fw-medium">
                          {getMonthName(row.month) || row.month}
                        </td>
                        <td>{row.year}</td>
                        <td><RunStatusActions run={row} onChanged={fetchData} size="sm" /></td>
                        <td>{fmtDateTime(row.processed_at) || "—"}</td>
                        <td className="text-end">
                          <Button
                            color="primary"
                            outline
                            size="sm"
                            className="py-1 px-2 me-1"
                            onClick={() => handleViewDetails(row)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          )}
        </CardBody>
      </Card>

      {/* Shared Component Modals */}
      <PayrollRunModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onSuccess={fetchData}
      />

      <PayrollRunDetails
        isOpen={detailsOpen}
        toggle={() => setDetailsOpen(!detailsOpen)}
        data={selectedRun}
      />
    </React.Fragment>
  );
};

export default PayrollRun;
