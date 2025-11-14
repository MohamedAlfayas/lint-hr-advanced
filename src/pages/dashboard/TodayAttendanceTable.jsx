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
dayjs.extend(customParseFormat);

const TodayaAttendanceTable = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0].split("-").reverse().join("-")
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [countIn, setCountIn] = useState(0);
  const [countNotCheckIn, setCountNotCheckIn] = useState(0);
  const [countLeave, setCountLeave] = useState(0);

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
        // Reset previous data and badge counts before loading
        setAttendanceData([]);
        setCountIn(0);
        setCountNotCheckIn(0);
        setCountLeave(0);
        dispatch(setTodayAttendance([]));

        const response = await Api.get(
          `/attendance/get-attendance-status?date=${ConvertISODateFormat(
            ConvertDateFormat(dateFilter)
          )}`
        );
        const result = response.data;
        
       
        

        // ✅ Handle empty response safely
        if (!Array.isArray(result) || result.length === 0) {
          setAttendanceData([]);
          setCountIn(0);
          setCountNotCheckIn(0);
          setCountLeave(0);
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
          (d) => d.id === item.employee.primary_department_id_list[0]
        )?.name || ""
      : "",

  inTime: item.first_check_in_time || "-",
  outTime: item.last_check_out_time || "-",

  totalHours: (() => {
    const totalSeconds = item.total_time_worked_till_last_checkout || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  })(),

  // ✅ FIXED STATUS LOGIC
  status: item.is_leave_approved
    ? "Leave"
    : item.is_present
    ? "On Time"
    : "Late",

  date: item.date,
  location_history: item.location_history,
  progress:
    item.total_work_duration && item.total_time_worked
      ? Math.min(
          100,
          Math.round(
            (item.total_time_worked / item.total_work_duration) * 100
          )
        )
      : 0,
}));


        setAttendanceData(formattedData);
        dispatch(setTodayAttendance(result));
       
        

        // ✅ Calculate badge counts safely
        const inCount = formattedData.filter(
          (i) => i.status === "On Time"
        ).length;
     
        
        const notCheckInCount = formattedData.filter(
          (i) => i.status === "Late"
        ).length;
        const leaveCount = formattedData.filter(
          (i) => i.status === "Leave"
        ).length;


        setCountIn(inCount);
        setCountNotCheckIn(notCheckInCount);
        setCountLeave(leaveCount);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        // Reset everything on error
        setAttendanceData([]);
        setCountIn(0);
        setCountNotCheckIn(0);
        setCountLeave(0);
        dispatch(setTodayAttendance([]));
      }
    };

    fetchAttendance();
  }, [dateFilter, departments, dispatch]);

  useEffect(() => {
  if (attendanceData.length === 0) {
    setCountIn(0);
    setCountNotCheckIn(0);
    setCountLeave(0);
    return;
  }

  const filtered = attendanceData.filter((item) => {
    if (departmentFilter === "All") return true;
    return item.department === departmentFilter;
  });

  const inCount = filtered.filter((i) => i.status === "On Time").length;
  const notCheckInCount = filtered.filter((i) => i.status === "Late").length;
  const leaveCount = filtered.filter((i) => i.status === "Leave").length || 0;

  console.log("l-count",leaveCount);
  

  setCountIn(inCount);
  setCountNotCheckIn(notCheckInCount);
  setCountLeave(leaveCount);
}, [attendanceData, departmentFilter]);

  const handleViewLocations = (row) => {
   
    
    setSelectedEmployeeId(row.first_name);
    setSelectedLocations(row.location_history || []);
    setIsMapOpen(true);
  };

  // ✅ Filtered data
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      
      
      if (activeTab === "1" && item.status !== "On Time") return false;
      if (activeTab === "2" && item.status !== "Late") return false;
      if (activeTab === "3" && item.status !== "Leave") return false;

      if (departmentFilter !== "All" && item.department !== departmentFilter)
        return false;

      const lowerSearch = search.toLowerCase();
      return (
        (item.first_name || "").toLowerCase().includes(lowerSearch) ||
        (item.department || "").toLowerCase().includes(lowerSearch) ||
        (item.status || "").toLowerCase().includes(lowerSearch) ||
        (item.inTime || "").toLowerCase().includes(lowerSearch) ||
        (item.outTime || "").toLowerCase().includes(lowerSearch) ||
        (item.totalHours || "").toLowerCase().includes(lowerSearch)
      );
    });
  }, [attendanceData, activeTab, departmentFilter, search]);

  // ✅ Pagination
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: noLocationFind,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
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
                      onChange={(e) => {
                        setDepartmentFilter(e.target.value);
                        setCurrentPage(1);
                      }}
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
                      onChange={(e, f) => {
                        setDateFilter(f);
                        setCurrentPage(1);
                      }}
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
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
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
                      "fw-semibold"
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
                      "fw-semibold"
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
                      "fw-semibold"
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

              {/* Table */}
              <div
                className="table-responsive table-card mb-1 mt-2"
                style={{ minHeight: "350px" }}
              >
                <table
                  className="table align-middle table-nowrap"
                  style={{ width: "100%" }}
                >
                  <thead className="table-light text-muted">
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>In Time</th>
                      <th>Out Time</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                      {activeTab === "1" && <th>Location</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <tr key={idx}>
                          <td>
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
                                <h5 className="fs-14 mb-1">
                                  {row.first_name}{" "}
                                  <span
                                    style={{
                                      color: "#a29797",
                                      fontSize: "smaller",
                                    }}
                                  >
                                    #{row.emp_id}
                                  </span>
                                </h5>
                                <div>{row.email}</div>
                                {activeTab === "1" && (
                                  <div className="progress progress-sm animated-progess lc-color">
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
                          <td>{row.department}</td>
                          <td>{row.inTime}</td>
                          <td>{row.outTime}</td>
                          <td>{row.totalHours}</td>
                          <td>
                            <span
                              className={`badge text-uppercase ${
                                row.status === "On Time"
                                  ? "bg-success-subtle text-success"
                                  : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          {activeTab === "1" && (
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                onClick={() => handleViewLocations(row)}
                              >
                                View
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ border: "none" }}>
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
                                marginTop: "20px",
                                width: "150px",
                                height: "80px",
                                marginBottom: "20px",
                              }}
                            ></lord-icon>
                            <p
                              style={{
                                width: "300px",
                                color: "#405189",
                                fontSize: "20px",
                                textAlign: "center",
                              }}
                            >
                              No Data Found!
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-end align-items-center">
  <div className="d-flex align-items-center gap-2">
    <span className="text-muted">Page {currentPage} of {totalPages || 1}</span>

    <Button
      color="primary"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="ms-2"
    >
      Previous
    </Button>

    <Button
      color="primary"
      size="sm"
      disabled={currentPage === totalPages || totalPages === 0}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="ms-2"
    >
      Next
    </Button>
  </div>
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

export default TodayaAttendanceTable;
