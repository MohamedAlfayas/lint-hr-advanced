import React, { useEffect, useMemo, useRef, useState } from "react";
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
  MonthFormat,
  leave_approval_component_name,
  attendance_approval_component_name,
} from "../../../common/constant/Constants";
import {
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";
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
import {
  setApprovalEmployeeTypeFilter,
  setCurrentApprovalComponent,
} from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { setEmployeeTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";

dayjs.extend(customParseFormat);

const ApprovalFilter = ({ formname }) => {
  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer,
  );

  const { filteredcurrentvalue } = useSelector(
    (data) => data.ApprovalFilterReducer,
  );
  const { filteredlatestvalue } = useSelector(
    (data) => data.ApprovalFilterReducer,
  );

  const PendingLeave = leave_approval_data.filter((d) => d.status === 1).length;

  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };
  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer,
  );
  const AttendancePending = attendance_approval_data.filter(
    (d) => d.hr_status === 3,
  ).length;

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));
  const employee_options = useMemo(
    () => GetLocalStorageData("employee") || [],
    [],
  );
  const [selectedEmployees, setSelectedEmployees] = useState([]);
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
      .padStart(2, "0")}`,
  );
  const [filteredValue, setFilteredValue] = useState({
    filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    employeeType: 1,
  });

  const { employee_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );

  const dep_options = useMemo(
    () =>
      (GetLocalStorageData("department") || []).map((d) => ({
        ...d,
        id: Number(d.id),
      })),
    [],
  );

  const handleEmployeeChange = (selected) => {
    setSelectedEmployees(selected || []);
  };

  const handleEmployeeSearch = (option, inputValue) => {
    const search = inputValue.trim();

    if (!search) return true;
    if (/^\d+$/.test(search)) {
      return false;
    }

    return (option.label || option.data?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  };

  useEffect(() => {
    if (
      (profile_data.permission_list.includes(
        VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
      ) &&
        !profile_data.permission_list.includes(
          VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
        )) ||
      (profile_data.permission_list.includes(
        VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
      ) &&
        !profile_data.permission_list.includes(
          VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
        ))
    ) {
      setEmployeeType(0);
    }
  }, []);

  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.value);
    setFilteredValue((prev) => ({
      ...prev,
      employeeType: e.value,
    }));
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
    setFilteredValue((prev) => ({
      ...prev,
      filteredMonth: monthStr,
    }));
  };

  const firstEffectExecutedRef = useRef(false);

  useEffect(() => {
    const permissions = {
      [VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY]:
        setShowAllAttendanceApproval,
      [VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY]: setShowTeamAttendanceApproval,
      [VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY]: setShowAllLeaveApproval,
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
    if (!firstEffectExecutedRef.current) return;

    if (
      !showAllAttendanceApproval &&
      !showTeamAttendanceApproval &&
      !showAllLeaveApproval &&
      !showTeamLeaveApproval
    ) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(setFilteredCurrentValue(filteredValue));
      dispatch(setFilteredLatestValue(filteredValue));

      FilterData(activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    employeeType,
    filteredMonth,
    activeTab,
    selectedEmployees,
    employee_table_filter_keys?.primary_department_id_list,
  ]);

  useEffect(() => {
    if (!firstEffectExecutedRef.current) return;
    if (
      !showAllAttendanceApproval &&
      !showTeamAttendanceApproval &&
      !showAllLeaveApproval &&
      !showTeamLeaveApproval
    ) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(setFilteredCurrentValue(filteredValue));
      dispatch(setFilteredLatestValue(filteredValue));
      FilterData(activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    employeeType,
    filteredMonth,
    activeTab,
    selectedEmployees,
    showAllAttendanceApproval,
    showTeamAttendanceApproval,
    showAllLeaveApproval,
    showTeamLeaveApproval,
  ]);

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
          setCurrentApprovalComponent("attendance_approval_component_name"),
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

  const getDepartmentParam = () => {
    const deptId = employee_table_filter_keys?.primary_department_id_list;

    if (deptId === null || deptId === undefined) return "";

    return `&primary_department_id_list=${Number(deptId)}`;
  };

  const getEmployeeParam = () => {
    if (!selectedEmployees.length) return "";
    const ids = selectedEmployees.map((e) => e.id ?? e.value).join(",");
    return `&employee_id_list=${ids}`;
  };

  const applyDepartmentFilter = (data) => {
    const deptId = employee_table_filter_keys?.primary_department_id_list;

    if (!deptId) return data;

    return data.filter(
      (item) =>
        Number(item.primary_department_id_list || item.department_id) ===
        Number(deptId),
    );
  };

  // ✅ client-side fallback filter (works even if backend ignores employee_id_list)
  const applyEmployeeFilter = (data) => {
    if (!selectedEmployees.length) return data;
    const ids = selectedEmployees.map((e) => Number(e.id ?? e.value));
    return data.filter((item) =>
      ids.includes(
        Number(item.employee_id ?? item.employee?.id ?? item.emp_id),
      ),
    );
  };

  const handleLeaveFilter = async (type) => {
    const integerEmployeeType = parseInt(type, 10);
    const deptParam = getDepartmentParam();
    const empParam = getEmployeeParam();

    const baseUrl =
      "leave/get-leave-application-for-approval/?thisMonth=" +
      filteredMonth +
      "&employee_type=";

    const url =
      !showAllLeaveApproval && showTeamLeaveApproval
        ? baseUrl + "1" + deptParam + empParam
        : showAllLeaveApproval && !showTeamLeaveApproval
          ? baseUrl + "0" + deptParam + empParam
          : baseUrl + type + deptParam + empParam;

    try {
      console.log("Leave API URL:", url);

      const response = await Api({ type: "GET", url });

      let data = response?.data?.data || [];

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setLeaveApproval(data));
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  const handleAttendanceFilter = async (type) => {
    const integerEmployeeType = parseInt(type, 10);
    const deptParam = getDepartmentParam();
    const empParam = getEmployeeParam();

    const baseUrl =
      "attendance/get-attendance-data-for-approval/?thisMonth=" +
      filteredMonth +
      "&employee_type=";

    const url =
      !showAllAttendanceApproval && showTeamAttendanceApproval
        ? baseUrl + "1" + deptParam + empParam
        : showAllAttendanceApproval && !showTeamAttendanceApproval
          ? baseUrl + "0" + deptParam + empParam
          : baseUrl + type + deptParam + empParam;

    try {
      console.log("Attendance API URL:", url);

      const response = await Api({ type: "GET", url });

      let data = response?.data?.data || [];

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setAttendanceApprovalData(data));
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoaderVisible(false));
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

  const handleFilterChange = (e, name) => {
    const val = e ? Number(e.id) : null;

    dispatch(
      setEmployeeTableFilterKeys({
        ...employee_table_filter_keys,
        [name]: val,
      }),
    );
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
                          (d) => d.id === employeeType,
                        ) || employeeTypeOptions[1]
                      }
                      filterOption={handleEmployeeSearch}
                    />
                  </Col>
                ) : null}
                <Col md={3}>
                  <Select
                    id="employee_multiselect"
                    name="employee_multiselect"
                    isClearable={true}
                    isMulti={true}
                    options={employee_options}
                    getOptionLabel={(e) => e.name ?? e.label}
                    getOptionValue={(e) => e.id ?? e.value}
                    className="basic-multi-select"
                    placeholder="Select Employees"
                    onChange={handleEmployeeChange}
                    components={{ Option: EmployeeDisplayInSelect }}
                    value={selectedEmployees}
                    filterOption={handleEmployeeSearch}
                  />
                </Col>
                <Col md={3}>
                  <Select
                    id="department_filter"
                    name="department_filter"
                    isClearable
                    innerRef={inputRef}
                    isMulti={false}
                    options={dep_options || []}
                    className="basic-multi-select"
                    placeholder="Select Department"
                    getOptionLabel={(e) => e.name}
                    getOptionValue={(e) => e.id}
                    value={
                      dep_options?.find(
                        (d) =>
                          Number(d.id) ===
                          Number(
                            employee_table_filter_keys?.primary_department_id_list,
                          ),
                      ) || null
                    }
                    onChange={(e) =>
                      handleFilterChange(e, "primary_department_id_list")
                    }
                    filterOption={handleEmployeeSearch}
                  />
                </Col>
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
                                  }`,
                                )}
                                onClick={() => {
                                  toggleTab("1");
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
                                    `fw-semibold ${"text-success"}`,
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
                                    }`,
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
                                          filteredcurrentvalue,
                                        ),
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
