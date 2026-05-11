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

  const getColumnCount = (tab) => (tab === "1" ? 7 : tab === "3" ? 8 : 6);

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

          status: item.is_on_leave
            ? "Leave"
            : item.is_present
              ? item.is_late
                ? "Late"
                : "On Time"
              : "Not Check In",

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

  // ✅ Recalculate badge counts when filter or data changes
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

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const parsed = moment.utc(isoString);
      if (!parsed.isValid()) return "-";
      return parsed.format("hh:mm A");
    } catch {
      return "-";
    }
  };

  // ✅ Filtered data (no pagination)
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

  // ✅ Status badge helper for halfday / permission
  const getStatusBadge = (status) => {
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

  // ✅ Table headers — all centered except Name (left for readability)
  const renderTableHeaders = () => (
    <tr>
      <th style={{ minWidth: 220 }}>Name</th>
      <th style={{ minWidth: 130, ...thCenter }}>Department</th>
      <th style={{ minWidth: 100, ...thCenter }}>In Time</th>
      <th style={{ minWidth: 100, ...thCenter }}>Out Time</th>
      <th style={{ minWidth: 110, ...thCenter }}>Total Hours</th>
      <th style={{ minWidth: 100, ...thCenter }}>Status</th>
      {activeTab === "1" && (
        <th style={{ minWidth: 90, ...thCenter }}>Location</th>
      )}
      {activeTab === "3" && (
        <th style={{ minWidth: 140, ...thCenter }}>Halfday</th>
      )}
      {activeTab === "3" && (
        <th style={{ minWidth: 140, ...thCenter }}>Permission</th>
      )}
    </tr>
  );

  // ✅ Table rows
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
                height: "250px",
              }}
            >
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#405189,secondary:#0ab39c"
                style={{
                  width: "100px",
                  height: "100px",
                  marginBottom: "12px",
                }}
              ></lord-icon>
              <p
                style={{
                  color: "#405189",
                  fontSize: "18px",
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
        {/* Name — left-aligned intentionally */}
        <td style={{ verticalAlign: "middle" }}>
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
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
                    {row.first_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-0">
                {row.first_name}{" "}
                <span style={{ color: "#a29797", fontSize: "smaller" }}>
                  #{row.emp_id}
                </span>
              </h5>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {row.email}
              </div>
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

        {/* All other cells — centered */}
        <td style={tdCenter}>{row.department || "-"}</td>
        <td style={tdCenter}>{formatTime(row.inTime)}</td>
        <td style={tdCenter}>{formatTime(row.outTime)}</td>
        <td style={tdCenter}>{row.totalHours}</td>

        {/* Status Badge */}
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

        {/* Location — Tab 1 only */}
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

        {/* Halfday — Tab 3 only */}
        {activeTab === "3" && (
          <td style={tdCenter}>
            {row.halfday ? (
              <div className="d-flex flex-column align-items-center gap-1">
                {getStatusBadge(row.halfday.status)}
                <small className="text-muted">{row.halfday.reason}</small>
              </div>
            ) : (
              <span className="text-muted">—</span>
            )}
          </td>
        )}

        {/* Permission — Tab 3 only */}
        {activeTab === "3" && (
          <td style={tdCenter}>
            {row.permission ? (
              <div className="d-flex flex-column align-items-center gap-1">
                {getStatusBadge(row.permission.status)}
                <small className="text-muted">{row.permission.reason}</small>
              </div>
            ) : (
              <span className="text-muted">—</span>
            )}
          </td>
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

              {/* Table with SimpleBar */}
              <SimpleBar style={{ maxHeight: "400px" }}>
                <div className="table-responsive table-card mb-1 mt-2">
                  <table
                    className="table align-middle table-nowrap"
                    style={{ width: "100%" }}
                  >
                    <thead className="table-light text-muted">
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
