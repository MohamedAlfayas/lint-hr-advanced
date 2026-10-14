import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  Row,
  Button,
} from "reactstrap";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AppTable from "../../../shared/ui/table/AppTable";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import PayrollRunModal from "./payrollRunModal";
import PayrollRunDetails from "./payrollRunDetails";
import RunStatusActions from "./RunStatusActions";
import { ApvChip, ApvDate } from "../../../component/common/approval/ApprovalCells";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchData = useCallback(() => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Card Calculations
  const processingCount = records.filter((x) => x.status === "processing").length;
  const approvedCount = records.filter((x) => x.status === "approved").length;
  const partiallyPaidCount = records.filter((x) => x.status === "partially_paid").length;
  const paidCount = records.filter((x) => x.status === "paid").length;

  const handleViewDetails = (run) => {
    setSelectedRun(run);
    setDetailsOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        id: "month",
        accessorFn: (row) => getMonthName(row.month) || String(row.month ?? ""),
        header: "Month",
        filterVariant: "select",
        sortingFn: (a, b) => Number(a.original.month) - Number(b.original.month),
        Cell: ({ cell }) => <ApvChip icon="ri-calendar-2-line">{cell.getValue()}</ApvChip>,
      },
      {
        id: "year",
        accessorFn: (row) => (row.year != null ? String(row.year) : ""),
        header: "Year",
        filterVariant: "select",
      },
      {
        id: "status",
        accessorFn: (row) => row.status || "",
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => (
          <RunStatusActions
            run={row.original}
            onChanged={(nextStatus) => {
              if (typeof nextStatus === "string") {
                setRecords((prev) => prev.map((item) => (
                  String(item.id) === String(row.original.id) ? { ...item, status: nextStatus } : item
                )));
                setSelectedRun((prev) => (
                  prev && String(prev.id) === String(row.original.id) ? { ...prev, status: nextStatus } : prev
                ));
              }
              fetchData();
            }}
            size="sm"
          />
        ),
      },
      {
        id: "processed_at",
        accessorFn: (row) => row.processed_at || "",
        header: "Processed At",
        exportValue: (row) => fmtDateTime(row.processed_at),
        Cell: ({ row }) => <ApvDate value={row.original.processed_at} withTime />,
      },
    ],
    [fetchData]
  );

  return (
    <React.Fragment>
      {/* Summary Cards */}
      <Row className="mb-4 g-3 row-cols-2 row-cols-md-3 row-cols-xl-5">
        {[
          { title: "Total Payroll Runs", count: records.length, bg: "info" },
          { title: "Processed", count: processingCount, bg: "primary" },
          { title: "Approved", count: approvedCount, bg: "success" },
          { title: "Partially Paid", count: partiallyPaidCount, bg: "warning" },
          { title: "Paid", count: paidCount, bg: "dark" },
        ].map((card) => (
          <div className="col" key={card.title}>
            <Card className="shadow-none border mb-0 h-100">
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
          </div>
        ))}
      </Row>

      {/* Main Container Layout */}
      <Card className="shadow-none border">
        <CardHeader className="surface-muted d-flex justify-content-between align-items-center">
          <div>
            <CardTitle tag="h5" className="mb-0">
              Payroll Run Management
            </CardTitle>
            <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
              Process, verify, and monitor company payouts
            </CardSubtitle>
          </div>
          <Button data-testid="payroll-run-run-payroll-button" color="success" size="sm" onClick={() => setModalOpen(true)}>
            <i className="ri-add-line align-bottom me-1"></i> Run Payroll
          </Button>
        </CardHeader>

        <CardBody className="p-4">
          <AppTable
            columns={columns}
            data={records}
            isLoading={loading}
            onRefresh={fetchData}
            exportFileName="payroll-runs"
            emptyMessage="No payroll run logs match your criteria."
            enableRowActions
            positionActionsColumn="last"
            displayColumnDefOptions={{ "mrt-row-actions": { header: "Actions", size: 90 } }}
            renderRowActions={({ row }) => (
              <Tooltip title="View Details">
                <IconButton data-testid="payroll-run-view-button" size="small" color="primary" onClick={() => handleViewDetails(row.original)}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          />
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
        onChanged={fetchData}
      />
    </React.Fragment>
  );
};

export default PayrollRun;