import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
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

const DEFAULT_PAGE_SIZE = 25;

// Used only for the badge-count fetch, which needs every matching row (not
// just one page) so the "Pending" badge reflects a true total. Large enough
// to cover a month's worth of records in one request.
const BADGE_COUNT_PAGE_SIZE = 5000;

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

  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };
  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer,
  );

  // ── Badge counts (independent of the paginated table data) ──────────────
  const [PendingLeave, setPendingLeave] = useState(0);
  const [AttendancePending, setAttendancePending] = useState(0);

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));
  const employee_options = useMemo(
    () => GetLocalStorageData("employee") || [],
    [],
  );

  const leave_type_options = useMemo(
    () =>
      (GetLocalStorageData("leave_types") || []).map((lt) => ({
        value: lt.id,
        label: lt.name,
      })),
    [],
  );

  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  const handleLeaveTypeFilterChange = (selected) => {
    setSelectedLeaveType(selected || null);
  };

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

  // ── Pagination state (shared by Leave & Attendance approval tables) ─────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  const skipInitialPaginationFetch = useRef(true);

  const handlePaginationChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

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
    if (profile_data?.is_admin === true) {
      setShowAllAttendanceApproval(true);
      setShowAllLeaveApproval(true);
      firstEffectExecutedRef.current = true;
      return;
    }
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

  const isLeaveApprovalActive =
    activeTab === "2" ||
    (!showAllAttendanceApproval &&
      !showTeamAttendanceApproval &&
      activeTab === "1");

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

  const getLeaveTypeParam = () => {
    if (!selectedLeaveType) return "";
    return `&leave_type_id=${selectedLeaveType.value}`;
  };

  const applyLeaveTypeFilter = (data) => {
    if (!selectedLeaveType) return data;
    return data.filter(
      (item) =>
        Number(item.leave_type_id ?? item.leave_type?.id) ===
        Number(selectedLeaveType.value),
    );
  };

  const applyEmployeeFilter = (data) => {
    if (!selectedEmployees.length) return data;
    const ids = selectedEmployees.map((e) => Number(e.id ?? e.value));
    return data.filter((item) =>
      ids.includes(
        Number(item.employee_id ?? item.employee?.id ?? item.emp_id),
      ),
    );
  };

  const extractListAndTotal = (response) => {
    const body = response?.data;
    const payload = body?.data;

    let list = [];
    let total = 0;

    if (Array.isArray(payload)) {
      list = payload;
      total = body?.count ?? body?.total ?? payload.length;
    } else if (Array.isArray(payload?.results)) {
      list = payload.results;
      total = payload.count ?? payload.total ?? list.length;
    } else if (Array.isArray(body?.results)) {
      list = body.results;
      total = body.count ?? list.length;
    }

    return { list, total };
  };

  // Shared URL builder for both approval kinds.
  // employee_type is the single selected value from employeeTypeOptions
  // (All Employee / My Team Members) — sent as the `employee_type` param.
  const buildUrl = (kind, targetPage, targetPageSize) => {
    const deptParam = getDepartmentParam();
    const empParam = getEmployeeParam();
    const isLeave = kind === "leave";

    const baseUrl = isLeave
      ? "leave/get-leave-application-for-approval/?thisMonth=" +
        filteredMonth +
        "&employee_type="
      : "attendance/get-attendance-data-for-approval/?thisMonth=" +
        filteredMonth +
        "&employee_type=";

    const scopedUrl = baseUrl + employeeType + deptParam + empParam;

    const leaveTypeParam = isLeave ? getLeaveTypeParam() : "";

    return (
      scopedUrl +
      leaveTypeParam +
      `&page=${targetPage}` +
      `&page_size=${targetPageSize}`
    );
  };

  const handleLeaveFilter = async (
    type,
    targetPage = page,
    targetPageSize = pageSize,
  ) => {
    const integerEmployeeType = parseInt(type, 10);
    const url = buildUrl("leave", targetPage, targetPageSize);

    try {
      console.log("Leave API URL:", url);

      const response = await Api({ type: "GET", url });

      let { list: data, total } = extractListAndTotal(response);

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);
      data = applyLeaveTypeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setLeaveApproval(data));
      setTotalCount(total);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  const handleAttendanceFilter = async (
    type,
    targetPage = page,
    targetPageSize = pageSize,
  ) => {
    const integerEmployeeType = parseInt(type, 10);
    const url = buildUrl("attendance", targetPage, targetPageSize);

    try {
      const response = await Api({ type: "GET", url });

      let { list: data, total } = extractListAndTotal(response);

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
      dispatch(setAttendanceApprovalData(data));
      setTotalCount(total);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  const refreshLeavePendingBadge = async () => {
    if (!(showAllLeaveApproval || showTeamLeaveApproval)) return;

    try {
      const url = buildUrl("leave", 1, BADGE_COUNT_PAGE_SIZE);
      const response = await Api({ type: "GET", url });

      let { list } = extractListAndTotal(response);
      list = applyDepartmentFilter(list);
      list = applyEmployeeFilter(list);
      list = applyLeaveTypeFilter(list);

      const pendingCount = list.filter(
        (d) =>
          (d.status === 1 || d.status === 4) &&
          d.leave_cancellation_details?.status !== 2,
      ).length;

      setPendingLeave(pendingCount);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshAttendancePendingBadge = async () => {
    if (!(showAllAttendanceApproval || showTeamAttendanceApproval)) return;

    try {
      const url = buildUrl("attendance", 1, BADGE_COUNT_PAGE_SIZE);
      const response = await Api({ type: "GET", url });

      let { list } = extractListAndTotal(response);
      list = applyDepartmentFilter(list);
      list = applyEmployeeFilter(list);

      const pendingCount = list.filter((d) => d.hr_status === 3).length;

      setAttendancePending(pendingCount);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshBadgeCounts = () => {
    refreshLeavePendingBadge();
    refreshAttendancePendingBadge();
  };

  const FilterData = async (
    tab,
    targetPage = page,
    targetPageSize = pageSize,
  ) => {
    dispatch(setLoaderVisible(true));

    if (
      tab === "2" ||
      (!showAllAttendanceApproval && !showTeamAttendanceApproval && tab === "1")
    ) {
      if (showAllLeaveApproval || showTeamLeaveApproval) {
        handleLeaveFilter(employeeType, targetPage, targetPageSize);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error("Something Went Wrong!");
      }
    } else if (tab === "1") {
      if (showAllAttendanceApproval || showTeamAttendanceApproval) {
        handleAttendanceFilter(employeeType, targetPage, targetPageSize);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error("Something Went Wrong!");
      }
    } else {
      dispatch(setLoaderVisible(false));
      toast.error("Something Went Wrong!");
    }
  };

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

      skipInitialPaginationFetch.current = true;
      setPage(1);
      FilterData(activeTab, 1, pageSize);
      refreshBadgeCounts();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    employeeType,
    filteredMonth,
    activeTab,
    selectedEmployees,
    selectedLeaveType,
    employee_table_filter_keys?.primary_department_id_list,
    showAllAttendanceApproval,
    showTeamAttendanceApproval,
    showAllLeaveApproval,
    showTeamLeaveApproval,
  ]);

  useEffect(() => {
    if (!firstEffectExecutedRef.current) return;
    if (skipInitialPaginationFetch.current) {
      skipInitialPaginationFetch.current = false;
      return;
    }
    FilterData(activeTab, page, pageSize);
  }, [page, pageSize]);

  useEffect(() => {
    if (firstEffectExecutedRef.current) {
      if (
        activeTab === "2" ||
        (!showAllAttendanceApproval &&
          !showTeamAttendanceApproval &&
          activeTab === "1")
      ) {
        dispatch(setCurrentApprovalComponent(leave_approval_component_name));
      } else if (activeTab === "1") {
        dispatch(
          setCurrentApprovalComponent(attendance_approval_component_name),
        );
      } else {
        dispatch(setCurrentApprovalComponent(""));
      }
    }
  }, [activeTab, showAllAttendanceApproval, showTeamAttendanceApproval]);

  const handleFilter = async () => {
    dispatch(setFilteredCurrentValue(filteredValue));
    skipInitialPaginationFetch.current = true;
    setPage(1);
    FilterData(activeTab, 1, pageSize);
    refreshBadgeCounts();
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

  const serverPagination = useMemo(
    () => ({
      page,
      pageSize,
      totalCount,
      onChange: handlePaginationChange,
    }),
    [page, pageSize, totalCount, handlePaginationChange],
  );

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

                {isLeaveApprovalActive &&
                  (showAllLeaveApproval || showTeamLeaveApproval) && (
                    <Col md={3}>
                      <Select
                        id="leave_type_filter"
                        name="leave_type_filter"
                        isClearable
                        isMulti={false}
                        options={leave_type_options}
                        className="basic-multi-select"
                        placeholder="Select Leave Type"
                        value={selectedLeaveType}
                        onChange={handleLeaveTypeFilterChange}
                        filterOption={(option, inputValue) =>
                          option.label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                        }
                      />
                    </Col>
                  )}

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
                                      skipInitialPaginationFetch.current = true;
                                      setPage(1);
                                      FilterData("2", 1, pageSize);
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
              <AttendanceApproval serverPagination={serverPagination} />
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
              <LeaveApproval
                PendingLeave={PendingLeave}
                AttendancePending={AttendancePending}
                serverPagination={serverPagination}
              />
            </TabPane>
          )}
        </TabContent>
      </Col>
    </React.Fragment>
  );
};

export default ApprovalFilter;
