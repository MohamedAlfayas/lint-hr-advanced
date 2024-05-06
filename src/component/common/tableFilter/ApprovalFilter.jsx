import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
  Col,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent,
} from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import {
  VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
  MonthFormat,
  leave_approval_component_name,
  attendance_approval_component_name,
} from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
import { setAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import { employeeTypeOptions } from "../../../common/constant/Constants";
import AttendanceApproval from "../../../pages/attendanceApproval/AttendanceApproval";
import LeaveApproval from "../../../pages/leave/LeaveApproval";
import classnames from "classnames";
import {
  setFilteredCurrentValue,
  setFilteredLatestValue,
} from "../../../redux/reducers/ChildReducer/AprrovalFilterReducer";
import { set } from "lodash";
import {
  setApprovalEmployeeTypeFilter,
  setCurrentApprovalComponent,
} from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";

dayjs.extend(customParseFormat);

const ApprovalFilter = ({ formname }) => {
  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer
  );

  const { filteredcurrentvalue } = useSelector(
    (data) => data.ApprovalFilterReducer
  );
  const { filteredlatestvalue } = useSelector(
    (data) => data.ApprovalFilterReducer
  );

  const PendingLeave = leave_approval_data.filter((d) => d.status === 1).length;

  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };
  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer
  );
  const AttendancePending = attendance_approval_data.filter(
    (d) => d.hr_status === 3
  ).length;

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));
  const [showTeamAttendanceApproval, setShowTeamAttendanceApproval] =
    useState(false);
  const [showAllAttendanceApproval, setShowAllAttendanceApproval] =
    useState(false);
  const [showTeamLeaveApproval, setShowTeamLeaveApproval] = useState(false);
  const [showAllLeaveApproval, setShowAllLeaveApproval] = useState(false);

  const inputRef = useRef();
  const location = useLocation();
  const pathname = location.pathname;

  const dispatch = useDispatch();

  const [employeeType, setEmployeeType] = useState(1);
  const [filteredMonth, setFilteredMonth] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`
  );
  const [filteredValue, setFilteredValue] = useState({
    filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    employeeType: 1,
  });

  useEffect(() => {
    if (
      (profile_data.permission_list.includes(
        VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY
      ) &&
        !profile_data.permission_list.includes(
          VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY
        )) ||
      (profile_data.permission_list.includes(
        VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY
      ) &&
        !profile_data.permission_list.includes(
          VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY
        ))
    ) {
      setEmployeeType(0);
    }
  }, []);

  const handleEmployeeTypeChange = (e, name) => {
    setEmployeeType(e.value);
    setFilteredValue({
      ...filteredValue,
      employeeType: e.value,
    });
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
    setFilteredValue({
      ...filteredValue,
      filteredMonth: monthStr,
    });
  };
  const firstEffectExecutedRef = useRef(false);
  useEffect(() => {
    const permissions = {
      [VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY]: setShowAllAttendanceApproval,
      [VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY]: setShowTeamAttendanceApproval,
      [VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY]: setShowAllLeaveApproval,
      [VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY]: setShowTeamLeaveApproval,
    };

    Object.entries(permissions).forEach(([permissionKey, setState]) => {
      if (profile_data.permission_list.includes(permissionKey)) {
        setState(true);
      }
    });
    firstEffectExecutedRef.current = true;
  }, []);

  useEffect(() => {
    if (firstEffectExecutedRef.current) {
      if (
        activeTab === "2" ||
        (!showAllAttendanceApproval &&
          !showTeamAttendanceApproval &&
          activeTab === "1")
      ) {
        dispatch(setCurrentApprovalComponent("leave_approval_component_name"));
      } else if (activeTab === "1") {
        dispatch(
          setCurrentApprovalComponent("attendance_approval_component_name")
        );
      } else {
        setCurrentApprovalComponent("");
      }
    }
  }, [
    activeTab,
    showAllAttendanceApproval,
    showTeamAttendanceApproval,
    firstEffectExecutedRef.current,
  ]);

  let integerEmployeeType;
  const handleLeaveFilter = async (type) => {
    integerEmployeeType = parseInt(type, 10);
    const baseUrl =
      "leave/get-leave-application-for-approval/?thisMonth=" +
      filteredMonth +
      "&employee_type=";
    const url =
      !showAllLeaveApproval && showTeamLeaveApproval
        ? baseUrl + "1"
        : showAllLeaveApproval && !showTeamLeaveApproval
        ? baseUrl + "0"
        : baseUrl + type;
    try {
      const response = await Api({
        type: "GET",
        url: url,
      });
      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setLeaveApproval(response?.data?.data));
      dispatch(setLoaderVisible(false));
    } catch (error) {
      dispatch(setLoaderVisible(false));
    }
  };

  const handleAttendanceFilter = async (type) => {
    const integerEmployeeType = parseInt(type, 10);
    const baseUrl =
      "attendance/get-attendance-data-for-approval/?thisMonth=" +
      filteredMonth +
      "&employee_type=";

    const url =
      !showAllAttendanceApproval && showTeamAttendanceApproval
        ? baseUrl + "1"
        : showAllAttendanceApproval && !showTeamAttendanceApproval
        ? baseUrl + "0"
        : baseUrl + type;

    try {
      const response = await Api({
        type: "GET",
        url: url,
      });
      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setAttendanceApprovalData(response?.data?.data));
      dispatch(setLoaderVisible(false));
    } catch (error) {
      dispatch(setLoaderVisible(false));
      // Handle error
    }
  };

  const FilterData = async (tab) => {
    dispatch(setLoaderVisible(true));
    if (
      tab === "2" ||
      (!showAllAttendanceApproval && !showTeamAttendanceApproval && tab === "1")
    ) {
      if (showAllLeaveApproval || showTeamLeaveApproval) {
        handleLeaveFilter(employeeType);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error("Sometyhing Went Wrong!");
      }
    } else if (tab === "1") {
      if (showAllAttendanceApproval || showTeamAttendanceApproval) {
        handleAttendanceFilter(employeeType);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error("Sometyhing Went Wrong!");
      }
    } else {
      dispatch(setLoaderVisible(false));
      toast.error("Sometyhing Went Wrong!");
    }
  };

  const handleFilter = async () => {
    dispatch(setFilteredCurrentValue(filteredValue));
    FilterData(activeTab);
  };

  return (
    <React.Fragment>
      <div className="page-content" style={{ marginBottom: "-135px" }}>
        <div style={{ zIndex: 1000, position: "relative" }}>
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2">
                {(showAllAttendanceApproval && showTeamAttendanceApproval) ||
                (showAllLeaveApproval && showTeamLeaveApproval) ? (
                  <Col md={3}>
                    <Select
                      id="employee_filter"
                      name="employee_filter"
                      isClearable={false}
                      isMulti={false}
                      options={employeeTypeOptions || []}
                      className="basic-multi-select"
                      placeholder="Select Employee Type"
                      allowClear={false}
                      onChange={handleEmployeeTypeChange}
                      value={
                        employeeTypeOptions.find(
                          (d) => d.id === employeeType
                        ) || employeeTypeOptions[1]
                      }
                    />
                  </Col>
                ) : null}
                <Col md={3}>
                  <div className="form-icon right">
                    <DatePicker
                      value={dayjs(filteredMonth)}
                      format={MonthFormat}
                      picker="month"
                      allowClear={false}
                      className="form-control"
                      placeholder="Select Month"
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </Col>
                <Col md={2}>
                  <div className="col-lg-auto">
                    <div className="hstack gap-2">
                      <button
                        type="button"
                        onClick={handleFilter}
                        className="btn btn-danger"
                      >
                        <i className="ri-equalizer-fill me-1 align-bottom"></i>{" "}
                        Filter
                      </button>
                    </div>
                  </div>
                </Col>
                <div
                  className="col-md-auto ms-auto"
                  style={{ marginLeft: "10px" }}
                >
                  <Row className="g-2">
                    <div className="d-flex justify-content-end">
                      <div className="col-lg-auto me-2">
                        <Nav
                          className="nav-tabs nav-tabs-custom nav-success"
                          role="tablist"
                        >
                          {showAllAttendanceApproval ||
                          showTeamAttendanceApproval ? (
                            <NavItem>
                              <NavLink
                                className={classnames(
                                  { active: activeTab === "1" },
                                  `fw-semibold ${
                                    activeTab === "1"
                                      ? "text-success"
                                      : "text-primary"
                                  }`
                                )}
                                onClick={() => {
                                  toggleTab("1");

                                  if (
                                    filteredcurrentvalue !== filteredlatestvalue
                                  ) {
                                    FilterData("1");
                                    dispatch(
                                      setFilteredLatestValue(
                                        filteredcurrentvalue
                                      )
                                    );
                                  }
                                }}
                                href="#"
                              >
                                Attendance Approval{" "}
                                <Badge
                                  color={
                                    activeTab === "1" ? "success" : "primary"
                                  }
                                  style={{ marginLeft: "5px" }}
                                >
                                  {AttendancePending}
                                </Badge>
                              </NavLink>
                            </NavItem>
                          ) : null}

                          {showAllLeaveApproval || showTeamLeaveApproval ? (
                            <NavItem>
                              {!showAllAttendanceApproval &&
                              !showTeamAttendanceApproval ? (
                                <NavLink
                                  className={classnames(
                                    { active: activeTab === "1" },
                                    `fw-semibold ${"text-success"}`
                                  )}
                                  href="#"
                                >
                                  Leave Approval{" "}
                                  <Badge
                                    color={"success"}
                                    style={{ marginLeft: "5px" }}
                                  >
                                    {PendingLeave}
                                  </Badge>
                                </NavLink>
                              ) : (
                                <NavLink
                                  className={classnames(
                                    { active: activeTab === "2" },
                                    `fw-semibold ${
                                      activeTab === "2"
                                        ? "text-success"
                                        : "text-primary"
                                    }`
                                  )}
                                  onClick={() => {
                                    toggleTab("2");

                                    if (
                                      filteredcurrentvalue !==
                                      filteredlatestvalue
                                    ) {
                                      FilterData("2");
                                      dispatch(
                                        setFilteredLatestValue(
                                          filteredcurrentvalue
                                        )
                                      );
                                    }
                                  }}
                                  href="#"
                                >
                                  Leave Approval{" "}
                                  <Badge
                                    color={
                                      activeTab === "2" ? "success" : "primary"
                                    }
                                    style={{ marginLeft: "5px" }}
                                  >
                                    {PendingLeave}
                                  </Badge>
                                </NavLink>
                              )}
                            </NavItem>
                          ) : null}
                        </Nav>
                      </div>
                    </div>
                  </Row>
                </div>
              </Row>
            </CardHeader>
          </Card>
        </div>
      </div>
      <Col lg={12}>
        <TabContent activeTab={activeTab} className="text-muted">
          {(showAllAttendanceApproval || showTeamAttendanceApproval) && (
            <TabPane
              tabId={
                showAllAttendanceApproval || showTeamAttendanceApproval
                  ? "1"
                  : "0"
              }
            >
              <AttendanceApproval />
            </TabPane>
          )}
          {(showAllLeaveApproval || showTeamLeaveApproval) && (
            <TabPane
              tabId={
                !showAllAttendanceApproval && !showTeamAttendanceApproval
                  ? "1"
                  : "2"
              }
            >
              <LeaveApproval />
            </TabPane>
          )}
        </TabContent>
      </Col>
    </React.Fragment>
  );
};

export default ApprovalFilter;
