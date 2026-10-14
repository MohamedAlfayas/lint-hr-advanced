import React, { useMemo, useState } from "react";
import { Row, Col, Card, CardBody, CardHeader, Badge } from "reactstrap";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReactApexChart from "react-apexcharts";
import ReactEcharts from "echarts-for-react";
import { Link } from "react-router-dom";
import AppTable from "../../shared/ui/table/AppTable";

// ════════════════════════════════════════════════
//  ADMIN DASHBOARD — HR Manager / Super Admin
//  Org-wide: headcount, payroll, hiring, attrition
// ════════════════════════════════════════════════

// ─── KPI CARDS ────────────────────────────────
const kpiCards = [
  {
    label: "Total Employees",
    value: "1,284",
    change: "+4.2%",
    up: true,
    icon: "ri-team-line",
    color: "primary",
  },
  {
    label: "Present Today",
    value: "1,102",
    change: "+1.8%",
    up: true,
    icon: "ri-user-follow-line",
    color: "success",
  },
  {
    label: "Absent Today",
    value: "93",
    change: "-1.2%",
    up: false,
    icon: "ri-user-unfollow-line",
    color: "danger",
  },
  {
    label: "On Leave",
    value: "89",
    change: "+3",
    up: false,
    icon: "ri-rest-time-line",
    color: "warning",
  },
  {
    label: "Late Check-ins",
    value: "47",
    change: "-0.5%",
    up: false,
    icon: "ri-time-line",
    color: "info",
  },
  {
    label: "Working Now",
    value: "856",
    change: "+2.3%",
    up: true,
    icon: "ri-user-location-line",
    color: "success",
  },
];

// ─── HEADCOUNT TREND (Area) ───────────────────
const headcountChart = {
  options: {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: ["#405189", "#0ab39c"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.01 },
    },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "right" },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
    markers: { size: 0 },
  },
  series: [
    {
      name: "Total Headcount",
      data: [
        1180, 1200, 1210, 1220, 1230, 1240, 1255, 1260, 1268, 1272, 1280, 1284,
      ],
    },
    {
      name: "Active",
      data: [
        1050, 1080, 1090, 1100, 1108, 1112, 1120, 1128, 1130, 1138, 1140, 1102,
      ],
    },
  ],
};

// ─── DEPARTMENT HEADCOUNT (ECharts Donut) ─────
const deptDonut = {
  backgroundColor: "transparent",
  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
  legend: {
    orient: "vertical",
    right: "2%",
    top: "center",
    textStyle: { fontSize: 11 },
  },
  series: [
    {
      type: "pie",
      radius: ["42%", "68%"],
      center: ["38%", "50%"],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: "bold" } },
      data: [
        { value: 320, name: "Engineering", itemStyle: { color: "#405189" } },
        { value: 210, name: "Sales", itemStyle: { color: "#0ab39c" } },
        { value: 180, name: "HR & Admin", itemStyle: { color: "#f7b84b" } },
        { value: 145, name: "Finance", itemStyle: { color: "#299cdb" } },
        { value: 120, name: "Operations", itemStyle: { color: "#f06548" } },
        { value: 309, name: "Others", itemStyle: { color: "#845ef7" } },
      ],
    },
  ],
};

// ─── HIRING PIPELINE (Bar) ────────────────────
const hiringChart = {
  options: {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "55%", distributed: false },
    },
    colors: ["#299cdb", "#0ab39c", "#f7b84b", "#f06548"],
    xaxis: {
      categories: [
        "Engineering",
        "Sales",
        "HR",
        "Finance",
        "Operations",
        "Design",
      ],
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    legend: { show: true, position: "top" },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
  },
  series: [
    { name: "Applied", data: [120, 85, 40, 55, 70, 35] },
    { name: "Shortlisted", data: [60, 42, 20, 28, 35, 18] },
    { name: "Interviewed", data: [28, 18, 9, 14, 16, 8] },
    { name: "Hired", data: [12, 7, 3, 5, 6, 4] },
  ],
};

// ─── MONTHLY PAYROLL (Line + Column) ─────────
const payrollChart = {
  options: {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: { width: [0, 3], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 4 } },
    colors: ["#405189", "#f06548"],
    fill: { opacity: [0.85, 1] },
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    xaxis: {
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px" },
        formatter: (v) => "₹" + (v / 100000).toFixed(1) + "L",
      },
    },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "right" },
    dataLabels: { enabled: false },
    tooltip: { theme: "light", shared: true, intersect: false },
  },
  series: [
    {
      name: "Gross Payroll",
      type: "column",
      data: [
        3800000, 3820000, 3850000, 3900000, 3920000, 3950000, 3980000, 4010000,
        4050000, 4100000, 4150000, 4260000,
      ],
    },
    {
      name: "Attrition Cost",
      type: "line",
      data: [
        120000, 95000, 140000, 180000, 110000, 130000, 160000, 200000, 90000,
        175000, 210000, 155000,
      ],
    },
  ],
};

// ─── ATTENDANCE WEEKLY (Stacked Bar) ─────────
const attendanceChart = {
  options: {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "40%" },
    },
    colors: ["#0ab39c", "#f06548"],
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "11px" } },
    },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
  },
  series: [
    {
      name: "Present",
      data: [1090, 1102, 1095, 1108, 1102],
    },
    {
      name: "Absent",
      data: [149, 144, 139, 134, 143],
    },
  ],
};

// ─── WORK HOURS DISTRIBUTION (ECharts Bar) ───
const workHoursOption = {
  tooltip: {},
  xAxis: {
    type: "category",
    data: ["<4 hrs", "4-8 hrs", "8+ hrs"],
  },
  yAxis: { type: "value" },
  series: [
    {
      data: [50, 800, 400],
      type: "bar",
      itemStyle: { borderRadius: [6, 6, 0, 0], color: "#405189" },
    },
  ],
};

// ─── HEADCOUNT GROWTH (ECharts Line) ─────────
const growthOption = {
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: ["Jan", "Feb", "Mar", "Apr", "May"],
  },
  yAxis: { type: "value" },
  series: [
    {
      data: [900, 1000, 1100, 1200, 1284],
      type: "line",
      smooth: true,
      lineStyle: { color: "#0ab39c" },
      itemStyle: { color: "#0ab39c" },
    },
  ],
};

// ─── GENDER DISTRIBUTION (ECharts Donut) ─────
const genderOption = {
  tooltip: { trigger: "item" },
  legend: { bottom: "0%", left: "center" },
  series: [
    {
      type: "pie",
      radius: ["50%", "70%"],
      data: [
        { value: 700, name: "Male", itemStyle: { color: "#405189" } },
        { value: 500, name: "Female", itemStyle: { color: "#f06548" } },
        { value: 84, name: "Others", itemStyle: { color: "#0ab39c" } },
      ],
    },
  ],
};

// ─── RECENT JOINERS ───────────────────────────
const recentJoiners = [
  {
    name: "Arjun Sharma",
    dept: "Engineering",
    role: "Sr. Developer",
    status: "Active",
    joined: "Apr 22, 2025",
    av: "AS",
    color: "primary",
  },
  {
    name: "Priya Nair",
    dept: "HR & Admin",
    role: "HR Manager",
    status: "Active",
    joined: "Apr 18, 2025",
    av: "PN",
    color: "success",
  },
  {
    name: "Rohit Verma",
    dept: "Sales",
    role: "Sales Lead",
    status: "On Leave",
    joined: "Mar 30, 2025",
    av: "RV",
    color: "warning",
  },
  {
    name: "Sneha Pillai",
    dept: "Finance",
    role: "Sr. Accountant",
    status: "Remote",
    joined: "Mar 15, 2025",
    av: "SP",
    color: "info",
  },
  {
    name: "Kiran Das",
    dept: "Operations",
    role: "Ops Analyst",
    status: "Active",
    joined: "Feb 28, 2025",
    av: "KD",
    color: "secondary",
  },
  {
    name: "Meena Iyer",
    dept: "Design",
    role: "UI/UX Designer",
    status: "Active",
    joined: "Feb 10, 2025",
    av: "MI",
    color: "danger",
  },
];

const statusColor = {
  Active: "success",
  "On Leave": "warning",
  Remote: "info",
  Inactive: "error",
};

// ─── PENDING APPROVALS ────────────────────────
const pendingApprovals = [
  {
    emp: "Rohit Verma",
    type: "Annual Leave",
    days: 5,
    dept: "Sales",
    since: "Apr 28",
  },
  {
    emp: "Sneha Pillai",
    type: "WFH Request",
    days: 2,
    dept: "Finance",
    since: "Apr 29",
  },
  {
    emp: "Arun Kumar",
    type: "Comp Off",
    days: 1,
    dept: "Engineering",
    since: "Apr 30",
  },
  {
    emp: "Divya Menon",
    type: "Medical Leave",
    days: 3,
    dept: "HR",
    since: "Apr 27",
  },
];

// ─── COMPONENT ────────────────────────────────
export default function AdminDashboard() {
  const [activePeriod, setActivePeriod] = useState("1Y");

  const recentJoinerColumns = useMemo(
    () => [
      {
        id: "index",
        accessorFn: (e) => recentJoiners.indexOf(e) + 1,
        header: "#",
        size: 50,
        Cell: ({ row }) => (
          <span className="fw-medium text-muted">
            {String(row.index + 1).padStart(2, "0")}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Employee",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-xs flex-shrink-0">
              <span
                className={`avatar-title bg-${row.original.color}-subtle text-${row.original.color} rounded-circle fw-bold`}
              >
                {row.original.av}
              </span>
            </div>
            <p className="mb-0 fw-semibold">{row.original.name}</p>
          </div>
        ),
      },
      { accessorKey: "dept", header: "Department" },
      { accessorKey: "role", header: "Role" },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => (
          <Chip
            size="small"
            variant="outlined"
            color={statusColor[cell.getValue()] || "default"}
            label={cell.getValue()}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      { accessorKey: "joined", header: "Joined" },
    ],
    [],
  );

  return (
    <div>
      {/* ── PAGE TITLE ── */}

      {/* ── KPI CARDS ── */}
      <Row>
        {kpiCards.map((k, i) => (
          <Col key={i} xl={2} md={4} sm={6}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="fw-medium text-muted mb-0 fs-13">{k.label}</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value">{k.value}</span>
                    </h2>
                    <p className="mt-4 mb-0 text-muted fs-12">
                      <span
                        className={`badge bg-${k.up ? "success" : "danger"}-subtle text-${k.up ? "success" : "danger"} me-1`}
                      >
                        <i
                          className={`ri-arrow-${k.up ? "up" : "down"}-line align-middle`}
                        ></i>
                        {k.change}
                      </span>
                      vs last month
                    </p>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span
                      className={`avatar-title bg-${k.color}-subtle rounded fs-3`}
                    >
                      <i className={`${k.icon} text-${k.color}`}></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── WEEKLY ATTENDANCE + HIRING PIPELINE ── */}
      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader className="border-0">
              <h4 className="card-title mb-0">Weekly Attendance</h4>
            </CardHeader>
            <CardBody>
              <ReactApexChart
                options={attendanceChart.options}
                series={attendanceChart.series}
                type="bar"
                height={300}
              />
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <Card>
            <CardHeader className="border-0">
              <h5>Work Hours Distribution</h5>
            </CardHeader>
            <CardBody>
              <ReactEcharts option={workHoursOption} style={{ height: 300 }} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── GENDER + RECENT JOINERS + PENDING APPROVALS ── */}
      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader className="border-0">
              <h4 className="card-title mb-0">Gender Distribution</h4>
            </CardHeader>
            <CardBody>
              <ReactEcharts option={genderOption} style={{ height: 280 }} />
            </CardBody>
          </Card>
        </Col>

        {/* Recent Joiners Table */}
        <Col xl={6}>
          <Card>
            <CardHeader className="border-0 d-flex align-items-center">
              <h4 className="card-title mb-0 flex-grow-1">Recent Joiners</h4>
              <button data-testid="admin-dashboard-view-all-button" className="btn btn-soft-info btn-sm">
                View All{" "}
                <i className="ri-arrow-right-line align-middle ms-1"></i>
              </button>
            </CardHeader>
            <CardBody className="pt-0">
              <AppTable
                columns={recentJoinerColumns}
                data={recentJoiners}
                enablePagination={false}
                enableRowSelection={false}
                initialState={{ density: "compact" }}
                enableRowActions
                positionActionsColumn="last"
                displayColumnDefOptions={{
                  "mrt-row-actions": { header: "Action", size: 120 },
                }}
                renderRowActions={() => (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="View">
                      <IconButton data-testid="admin-dashboard-view-button" size="small" color="primary">
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton data-testid="admin-dashboard-edit-button" size="small" color="success">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton data-testid="admin-dashboard-delete-outline-button" size="small" color="error">
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
