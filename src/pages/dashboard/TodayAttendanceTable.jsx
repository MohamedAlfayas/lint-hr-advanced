import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import classnames from "classnames";
import moment from "moment";
import { Api } from "../../common/api/Api";
import { setTodayAttendance } from "../../redux/reducers/ChildReducer/TodayAttendanceReducer";
import { useDispatch } from "react-redux";
import UsersClusterMap from "./UsersClusterMap";
import Lottie from "react-lottie";
import noLocationFind from "../auth/loader/animation/no-location.json";
import { DatePicker } from "antd";
import { DateFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import UsersClusterMapAll from "./useClusterMapAll";
import SkletonDashboard from "../../component/common/skeleton/SkletonDashboard";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

dayjs.extend(customParseFormat);

// ─── Status badge for check-in status (shown right of name) ───────────────
const getCheckInStatusBadge = (status) => {
  switch (status) {
    case "checked-in":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          ● Checked In
        </span>
      );
    case "checked-out":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          ● Checked Out
        </span>
      );
    case "not-checked-in":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#fef3c7",
            color: "#92400e",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          ● Not Checked In
        </span>
      );
    // ✅ NEW: Break status from API
    case "Break":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#ede9fe",
            color: "#4c1d95",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          ● On Break
        </span>
      );
    default:
      return null;
  }
};

// ─── Status badge for half_day / permission approval ──────────────────────
const getApprovalBadge = (status) => {
  switch (status) {
    case 1:
      return (
        <span className="badge bg-warning-subtle text-warning">Pending</span>
      );
    case 2:
      return (
        <span className="badge bg-success-subtle text-success">Approved</span>
      );
    case 3:
      return (
        <span className="badge bg-danger-subtle text-danger">Rejected</span>
      );
    case 4:
      return (
        <span className="badge bg-danger-subtle text-danger">Cancelled</span>
      );
    default:
      return (
        <span className="badge bg-secondary-subtle text-secondary">
          Unknown
        </span>
      );
  }
};

const TodayAttendanceTable = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
  );
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [countIn, setCountIn] = useState(0);
  const [countNotCheckIn, setCountNotCheckIn] = useState(0);
  const [countLeave, setCountLeave] = useState(0);
  const [loading, setLoading] = useState(false);

  // shared styles
  const thCenter = { textAlign: "center", verticalAlign: "middle" };
  const tdCenter = { textAlign: "center", verticalAlign: "middle" };

  // ✅ Load departments from localStorage
  useEffect(() => {
    const globalData = localStorage.getItem("lint_hr_globaldata");
    if (globalData) {
      try {
        const parsedData = JSON.parse(globalData);
        const departmentsArray = parsedData.department;
        if (Array.isArray(departmentsArray)) {
          setDepartments(departmentsArray);
        }
      } catch (error) {
        console.error("Failed to parse global data", error);
      }
    }
  }, []);

  // ✅ Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setAttendanceData([]);
        setCountIn(0);
        setCountNotCheckIn(0);
        setCountLeave(0);
        dispatch(setTodayAttendance([]));

        const response = await Api.get(
          `/attendance/get-attendance-status?date=${ConvertISODateFormat(
            ConvertDateFormat(dateFilter),
          )}`,
        );
        const result = response.data;

        if (!Array.isArray(result) || result.length === 0) {
          setAttendanceData([]);
          dispatch(setTodayAttendance([]));
          return;
        }

        const formattedData = result.map((item) => ({
          emp_id: item.employee.emp_id,
          first_name: item.employee.first_name || "-",
          profile_url: item.employee.profile_url || null,
          email: item.employee.email || "-",
          department:
            Array.isArray(item.employee.primary_department_id_list) &&
            item.employee.primary_department_id_list.length > 0
              ? departments.find(
                  (d) => d.id === item.employee.primary_department_id_list[0],
                )?.name || ""
              : "",

          inTime: item.first_check_in_time || null,
          outTime: item.last_check_out_time || null,

          totalHours: (() => {
            const totalSeconds = item.total_time_worked_till_last_checkout || 0;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
          })(),

          // ✅ Status logic:
          // Priority: Leave (is_on_leave OR has half_day OR has permission) > Present > Not Check In
          status: (() => {
            if (item.is_on_leave || item.half_day || item.permission)
              return "Leave";
            if (item.is_present) return item.is_late ? "Late" : "On Time";
            return "Not Check In";
          })(),

          isOnLeave: item.is_on_leave || false,

          // ✅ Raw check-in/out status from API (e.g. "checked-in", "checked-out", "not-checked-in", "Break")
          checkInStatus: item.status || null,

          date: item.date,
          location_history: item.location_history,
          progress:
            item.total_work_duration && item.total_time_worked
              ? Math.min(
                  100,
                  Math.round(
                    (item.total_time_worked / item.total_work_duration) * 100,
                  ),
                )
              : 0,

          halfday: item.half_day
            ? {
                start: item.half_day.start || null,
                end: item.half_day.end || null,
                reason: item.half_day.reason || "-",
                status: item.half_day.status,
              }
            : null,

          permission: item.permission
            ? {
                start: item.permission.start || null,
                end: item.permission.end || null,
                reason: item.permission.reason || "-",
                status: item.permission.status,
              }
            : null,
        }));

        setAttendanceData(formattedData);
        dispatch(setTodayAttendance(result));
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData([]);
        dispatch(setTodayAttendance([]));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [dateFilter, departments, dispatch]);

  // ✅ Recalculate badge counts
  useEffect(() => {
    if (attendanceData.length === 0) {
      setCountIn(0);
      setCountNotCheckIn(0);
      setCountLeave(0);
      return;
    }

    const filtered = attendanceData.filter((item) =>
      departmentFilter === "All" ? true : item.department === departmentFilter,
    );

    setCountIn(
      filtered.filter((i) => i.status === "On Time" || i.status === "Late")
        .length,
    );
    setCountNotCheckIn(
      filtered.filter((i) => i.status === "Not Check In").length,
    );
    setCountLeave(filtered.filter((i) => i.status === "Leave").length);
  }, [attendanceData, departmentFilter]);

  const handleViewLocations = (row) => {
    setSelectedEmployeeId(row.first_name);
    setSelectedLocations(row.location_history || []);
    setIsMapOpen(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    // If already formatted like "10:37 AM", return as-is
    if (typeof timeString === "string" && timeString.includes(" ")) {
      return timeString;
    }
    // Try parsing as ISO
    try {
      const parsed = moment.utc(timeString);
      if (!parsed.isValid()) return "-";
      return parsed.format("hh:mm A");
    } catch {
      return "-";
    }
  };

  // ✅ Filtered data
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      if (activeTab === "1" && !["On Time", "Late"].includes(item.status))
        return false;
      if (activeTab === "2" && item.status !== "Not Check In") return false;
      if (activeTab === "3" && item.status !== "Leave") return false;

      if (departmentFilter !== "All" && item.department !== departmentFilter)
        return false;

      const q = search.toLowerCase();
      return (
        !q ||
        (item.first_name || "").toLowerCase().includes(q) ||
        (item.department || "").toLowerCase().includes(q) ||
        (item.status || "").toLowerCase().includes(q) ||
        (item.totalHours || "").toLowerCase().includes(q)
      );
    });
  }, [attendanceData, activeTab, departmentFilter, search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: noLocationFind,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  // ─── Column definitions per tab ──────────────────────────────────────────
  const getColumnCount = (tab) => {
    if (tab === "1") return 7;
    if (tab === "2") return 6;
    return 5;
  };

  // ─── Table headers ────────────────────────────────────────────────────────
  const renderTableHeaders = () => {
    if (activeTab === "3") {
      return (
        <tr>
          <th style={{ width: "28%" }}>Name</th>
          <th style={{ width: "15%", ...thCenter }}>Department</th>
          <th style={{ width: "15%", ...thCenter }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <i
                className="bx bx-calendar-x"
                style={{ color: "#ef4444", fontSize: "14px" }}
              ></i>
              Leave Type
            </span>
          </th>
          <th style={{ width: "21%", ...thCenter }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <i
                className="bx bx-time-five"
                style={{ color: "#f59e0b", fontSize: "14px" }}
              ></i>
              Half Day
            </span>
          </th>
          <th style={{ width: "21%", ...thCenter }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <i
                className="bx bx-exit"
                style={{ color: "#6366f1", fontSize: "14px" }}
              ></i>
              Permission
            </span>
          </th>
        </tr>
      );
    }

    return (
      <tr>
        <th style={{ width: "30%" }}>Name</th>
        <th style={{ width: "15%", ...thCenter }}>Department</th>
        <th style={{ width: "12%", ...thCenter }}>In Time</th>
        <th style={{ width: "12%", ...thCenter }}>Out Time</th>
        <th style={{ width: "11%", ...thCenter }}>Total Hours</th>
        <th style={{ width: "10%", ...thCenter }}>Status</th>
        {activeTab === "1" && (
          <th style={{ width: "10%", ...thCenter }}>Location</th>
        )}
      </tr>
    );
  };

  // ─── Table rows ───────────────────────────────────────────────────────────
  const renderTableRows = () => {
    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={getColumnCount(activeTab)} style={{ border: "none" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "220px",
              }}
            >
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#405189,secondary:#0ab39c"
                style={{ width: "80px", height: "80px", marginBottom: "12px" }}
              ></lord-icon>
              <p
                style={{
                  color: "#405189",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                No Data Found!
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return filteredData.map((row, idx) => (
      <tr key={idx}>
        {/* ── Name Cell ── */}
        <td style={{ verticalAlign: "middle" }}>
          <div className="d-flex gap-2 align-items-start">
            {/* Avatar */}
            <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
              {row.profile_url ? (
                <img
                  src={row.profile_url}
                  alt=""
                  className="avatar-xs rounded-circle"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="avatar-xs rounded-circle"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#0ab39c",
                  }}
                >
                  <span style={{ color: "white" }}>
                    {(row.first_name || "?").charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Name + badge + email */}
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              {/* Name row with check-in status badge */}
              <div
                className="d-flex align-items-center gap-2 flex-wrap"
                style={{ marginBottom: "2px" }}
              >
                <h5 className="fs-14 mb-0" style={{ whiteSpace: "nowrap" }}>
                  {row.first_name}{" "}
                  <span style={{ color: "#a29797", fontSize: "smaller" }}>
                    #{row.emp_id}
                  </span>
                </h5>
                {/* ✅ Check-in status badge — includes "Break" now */}
                {row.checkInStatus && getCheckInStatusBadge(row.checkInStatus)}
              </div>

              <div
                className="text-muted"
                style={{
                  fontSize: "11px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.email}
              </div>

              {/* Progress bar — Tab 1 only */}
              {activeTab === "1" && (
                <div className="progress progress-sm animated-progess lc-color mt-1">
                  <div
                    className={`progress-bar ${
                      row.status === "On Time"
                        ? "bg-success"
                        : "bg-danger progress-bar-striped"
                    }`}
                    role="progressbar"
                    aria-valuenow={row.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: `${row.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* ── Leave tab layout ── */}
        {activeTab === "3" ? (
          <>
            <td style={tdCenter}>{row.department || "-"}</td>

            {/* Leave Type pill */}
            <td style={tdCenter}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {row.halfday && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i
                      className="bx bx-time-five"
                      style={{ color: "#d97706" }}
                    ></i>
                    Half Day Leave
                  </span>
                )}
                {row.permission && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#f5f3ff",
                      border: "1px solid #c4b5fd",
                      color: "#4c1d95",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i className="bx bx-exit" style={{ color: "#7c3aed" }}></i>
                    Permission
                  </span>
                )}
                {!row.halfday && !row.permission && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i
                      className="bx bx-calendar-x"
                      style={{ color: "#ef4444" }}
                    ></i>
                    Full Day Leave
                  </span>
                )}
              </div>
            </td>

            {/* Half Day details */}
            <td style={tdCenter}>
              {row.halfday ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {getApprovalBadge(row.halfday.status)}
                  {row.halfday.start && (
                    <small style={{ color: "#78716c", fontSize: "10px" }}>
                      {formatTime(row.halfday.start)}
                      {row.halfday.end
                        ? ` – ${formatTime(row.halfday.end)}`
                        : ""}
                    </small>
                  )}
                  <small
                    style={{
                      color: "#57534e",
                      fontSize: "10px",
                      fontStyle: "italic",
                      maxWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.halfday.reason}
                  </small>
                </div>
              ) : (
                <span style={{ color: "#d1d5db", fontSize: "18px" }}>—</span>
              )}
            </td>

            {/* Permission details */}
            <td style={tdCenter}>
              {row.permission ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {getApprovalBadge(row.permission.status)}
                  {row.permission.start && (
                    <small style={{ color: "#78716c", fontSize: "10px" }}>
                      {formatTime(row.permission.start)}
                      {row.permission.end
                        ? ` – ${formatTime(row.permission.end)}`
                        : ""}
                    </small>
                  )}
                  <small
                    style={{
                      color: "#57534e",
                      fontSize: "10px",
                      fontStyle: "italic",
                      maxWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.permission.reason}
                  </small>
                </div>
              ) : (
                <span style={{ color: "#d1d5db", fontSize: "18px" }}>—</span>
              )}
            </td>
          </>
        ) : (
          /* ── Tab 1 & 2 layout ── */
          <>
            <td style={tdCenter}>{row.department || "-"}</td>
            <td style={tdCenter}>{formatTime(row.inTime)}</td>
            <td style={tdCenter}>{formatTime(row.outTime)}</td>
            <td style={tdCenter}>{row.totalHours}</td>

            {/* Attendance status badge */}
            <td style={tdCenter}>
              <span
                className={`badge text-uppercase ${
                  row.status === "On Time"
                    ? "bg-success-subtle text-success"
                    : row.status === "Late"
                      ? "bg-warning-subtle text-warning"
                      : row.status === "Leave"
                        ? "bg-secondary-subtle text-secondary"
                        : "bg-danger-subtle text-danger"
                }`}
              >
                {row.status}
              </span>
            </td>

            {/* Location button — Tab 1 only */}
            {activeTab === "1" && (
              <td style={tdCenter}>
                <Button
                  color="info"
                  size="sm"
                  onClick={() => handleViewLocations(row)}
                >
                  View
                </Button>
              </td>
            )}
          </>
        )}
      </tr>
    ));
  };

  return (
    <Container fluid>
      <Row>
        <Col lg={12}>
          <Card id="attendanceList">
            <CardHeader className="border-0 pb-0">
              <h5 className="card-title mb-0">
                <b>{dateFilter}</b> - Entry Status
              </h5>
            </CardHeader>

            <CardBody>
              {/* Filters */}
              <div className="filter-container p-2 pt-2 pb-0">
                <Row className="mb-3 d-flex align-items-center">
                  <Col md="4" className="ps-1">
                    <Input
                      type="select"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="All">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </Input>
                  </Col>

                  <Col md="4">
                    <DatePicker
                      className="form-control"
                      value={dayjs(dateFilter, DateFormat)}
                      format={DateFormat}
                      allowClear={false}
                      onChange={(e, f) => setDateFilter(f)}
                    />
                  </Col>

                  <Col md="4" className="position-relative">
                    <i
                      className="bx bx-search-alt search-icon position-absolute"
                      style={{
                        top: "50%",
                        left: "20px",
                        transform: "translateY(-50%)",
                      }}
                    ></i>
                    <Input
                      type="text"
                      placeholder="Search employee"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: "25px" }}
                    />
                  </Col>
                </Row>
              </div>

              {/* Tabs */}
              <Nav
                className="nav-tabs nav-tabs-custom nav-success pt-2"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "1" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("1")}
                    href="#"
                  >
                    In <span className="badge bg-success ms-1">{countIn}</span>
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "2" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("2")}
                    href="#"
                  >
                    Not Check In{" "}
                    <span className="badge bg-danger ms-1">
                      {countNotCheckIn}
                    </span>
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "3" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("3")}
                    href="#"
                  >
                    Leave{" "}
                    <span className="badge bg-secondary ms-1">
                      {countLeave}
                    </span>
                  </NavLink>
                </NavItem>
              </Nav>

              <div
                style={{ width: "100%", overflow: "hidden", marginTop: "8px" }}
              >
                <SimpleBar style={{ maxHeight: "420px" }} autoHide={false}>
                  <div style={{ width: "100%" }}>
                    <table
                      className="table align-middle mb-0"
                      style={{
                        width: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead
                        className="table-light text-muted"
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        {renderTableHeaders()}
                      </thead>
                      <tbody>
                        {loading ? (
                          <SkletonDashboard
                            rows={6}
                            columns={getColumnCount(activeTab)}
                            hasAvatar={true}
                          />
                        ) : (
                          renderTableRows()
                        )}
                      </tbody>
                    </table>
                  </div>
                </SimpleBar>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Map Modal */}
        <Modal
          size="lg"
          isOpen={isMapOpen}
          toggle={() => setIsMapOpen(!isMapOpen)}
        >
          <ModalHeader toggle={() => setIsMapOpen(false)}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: "600", fontSize: "18px" }}>
                Employee Location History
              </span>
              <span
                style={{
                  backgroundColor: "#e0f7fa",
                  color: "#00796b",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {selectedEmployeeId}
              </span>
            </div>
          </ModalHeader>

          <ModalBody
            style={{
              height: "75vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {selectedLocations && selectedLocations.length > 1 ? (
              <UsersClusterMapAll locations={selectedLocations} />
            ) : (
              <>
                <Lottie options={defaultOptions} height={250} width={250} />
                <p
                  style={{
                    marginTop: "15px",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#555",
                    textAlign: "center",
                  }}
                >
                  No location history available
                </p>
              </>
            )}
          </ModalBody>
        </Modal>
      </Row>
    </Container>
  );
};

export default TodayAttendanceTable;
