import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { GetApi } from "../../common/api/GetApi";
import AppTable from "../../shared/ui/table/AppTable";
import MyPayslipDetailModal from "./MyPayslipDetailModal";
import { testId, itemTestKey } from "../../shared/testing/testId";

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
    case "closed":
      return "info";
    default:
      return "default";
  }
};

// Builds calendar-year options from the records
const getYearOptions = (records) => {
  const years = [...new Set(records.map((r) => Number(r.year)))]
    .filter((y) => !Number.isNaN(y))
    .sort((a, b) => b - a);
  return years.map((y) => ({ value: y, label: String(y) }));
};

const formatMoney = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const StatCard = ({ icon, label, value, color }) => (
  <Box
    sx={(theme) => ({
      flex: 1,
      minWidth: 180,
      p: 2,
      borderRadius: 2.5,
      border: 1,
      borderColor: "divider",
      bgcolor: "background.paper",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      "& .stat-icon": {
        bgcolor: alpha(theme.palette[color].main, 0.12),
        color: `${color}.main`,
      },
    })}
  >
    <Avatar variant="rounded" className="stat-icon" sx={{ width: 44, height: 44, borderRadius: 2 }}>
      {icon}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" fontWeight={700} noWrap>
        {value}
      </Typography>
    </Box>
  </Box>
);

const EmployeePayslip = ({ withTopPadding = true, employeeId = null }) => {
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // ── Payslip detail modal state ──────────────────────────────────────────
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

  // Filters records by year AND restricts display strictly to "paid" or "closed" status
  const filteredRecords = useMemo(
    () =>
      records.filter((row) => {
        const matchesYear =
          !selectedYear || Number(row.year) === Number(selectedYear);
        const isValidStatus = ["paid", "closed"].includes(
          String(row.status).toLowerCase(),
        );
        return matchesYear && isValidStatus;
      }),
    [records, selectedYear],
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
  const totalNet = filteredRecords.reduce((sum, r) => sum + Number(r.net_pay || 0), 0);
  const latest = filteredRecords.reduce(
    (acc, r) =>
      !acc || Number(r.month) > Number(acc.month) ? r : acc,
    null,
  );
  const initial = (employee?.name || "?").trim().charAt(0).toUpperCase();

  const columns = useMemo(
    () => [
      {
        id: "period",
        header: "Month & Year",
        accessorFn: (row) => `${getMonthName(row.month)} ${row.year}`,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              sx={(theme) => ({
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              })}
            >
              <ReceiptLongOutlinedIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" fontWeight={600}>
              {getMonthName(row.original.month)} {row.original.year}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "pay_date",
        header: "Pay Date",
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        id: "net_pay",
        header: "Net Pay",
        accessorFn: (row) => Number(row.net_pay || 0),
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={700}>
            {row.original.net_pay ? formatMoney(row.original.net_pay) : "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => {
          const status = cell.getValue();
          return (
            <Chip
              size="small"
              variant="outlined"
              color={getStatusColor(status)}
              label={status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Button
            data-testid={testId("my-payslip-row", itemTestKey(row.original), "open-slip-button")}
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            sx={{ whiteSpace: "nowrap" }}
            onClick={() => handleOpenSlip(row.original)}
          >
            Open Slip
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <Box sx={{ pt: withTopPadding ? "70px" : 0, pb: withTopPadding ? "72px" : 0 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employee summary */}
        <Card
          sx={{
            mb: 2.5,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid var(--vz-border-color)",
            background: "var(--app-head-tint), var(--vz-secondary-bg)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, var(--vz-success), color-mix(in srgb, var(--vz-success) 55%, var(--vz-info)))",
                    boxShadow: "0 6px 16px color-mix(in srgb, var(--vz-success) 32%, transparent)",
                  }}
                >
                  {initial}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} noWrap>
                    {employee?.name ?? (loading ? "Loading..." : "—")}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={<BadgeOutlinedIcon />}
                      label={`Emp ID: ${employee?.emp_id ?? "—"}`}
                      sx={{ bgcolor: "background.paper" }}
                    />
                    <Chip
                      size="small"
                      icon={<WorkOutlineOutlinedIcon />}
                      label={employee?.designation ?? "—"}
                      color="primary"
                      variant="outlined"
                      sx={{ bgcolor: "background.paper" }}
                    />
                  </Stack>
                </Box>
              </Stack>

              <TextField
                select
                label="Year"
                size="small"
                value={selectedYear}
                disabled={yearOptions.length === 0}
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{ width: { xs: "100%", md: 180 } }}
              >
                {yearOptions.length === 0 && <MenuItem value="">—</MenuItem>}
                {yearOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Year summary */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2.5 }}>
          <StatCard
            icon={<AccountBalanceWalletOutlinedIcon />}
            label={`Total net pay${selectedYear ? ` (${selectedYear})` : ""}`}
            value={formatMoney(totalNet)}
            color="success"
          />
          <StatCard
            icon={<ReceiptLongOutlinedIcon />}
            label="Payslips"
            value={filteredRecords.length}
            color="primary"
          />
          <StatCard
            icon={<EventAvailableOutlinedIcon />}
            label="Latest payslip"
            value={latest ? `${getMonthName(latest.month)} ${latest.year}` : "—"}
            color="info"
          />
        </Stack>

        {/* Payslip history */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, fontSize: 16 }}>
              Payslip History
            </Typography>

            <AppTable
              columns={columns}
              data={filteredRecords}
              isLoading={loading}
              onRefresh={fetchData}
              emptyMessage="No paid or closed payslips found for this year"
              enableRowSelection={false}
              enableColumnFilters={false}
              enableColumnActions={false}
              enableColumnOrdering={false}
              enableColumnResizing={false}
              enableColumnPinning={false}
            />

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={(theme) => ({
                mt: 2,
                p: 1.75,
                borderRadius: 2,
                border: 1,
                borderColor: alpha(theme.palette.info.main, 0.3),
                bgcolor: alpha(theme.palette.info.main, 0.08),
              })}
            >
              <InfoOutlinedIcon fontSize="small" color="info" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" fontWeight={600} color="info.main">
                  View and download your payslips
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click &ldquo;Open Slip&rdquo; to see the full earnings and deductions breakdown and download a copy. For any
                  discrepancy, please contact your HR team.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <MyPayslipDetailModal
        payslipId={selectedPayslipId}
        isOpen={modalOpen}
        onClose={handleCloseSlip}
      />
    </React.Fragment>
  );
};

export default EmployeePayslip;
