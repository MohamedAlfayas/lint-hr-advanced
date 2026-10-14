// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import {
//   Badge,
//   Card,
//   CardHeader,
//   Col,
//   Row,
//   Nav,
//   NavItem,
//   NavLink,
//   TabPane,
//   TabContent,
// } from "reactstrap";
// import Select from "../../../shared/ui/TestableSelect";
// import { useDispatch, useSelector } from "react-redux";
// import { DatePicker } from "antd";
// import {
//   MonthFormat,
//   leave_approval_component_name,
//   attendance_approval_component_name,
// } from "../../../common/constant/Constants";
// import {
//   VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
//   VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
//   VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
//   VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
// } from "../../../common/constant/RoleConstants";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { setLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
// import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
// import { Api } from "../../../common/api/Api";
// import { setAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
// import { toast } from "react-toastify";
// import { Link, useLocation } from "react-router-dom";
// import { employeeTypeOptions } from "../../../common/constant/Constants";
// import AttendanceApproval from "../../../pages/attendanceApproval/AttendanceApproval";
// import LeaveApproval from "../../../pages/leave/LeaveApproval";
// import classnames from "classnames";
// import {
//   setFilteredCurrentValue,
//   setFilteredLatestValue,
// } from "../../../redux/reducers/ChildReducer/AprrovalFilterReducer";
// import {
//   setApprovalEmployeeTypeFilter,
//   setCurrentApprovalComponent,
// } from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";
// import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
// import { setEmployeeTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
// import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";

// dayjs.extend(customParseFormat);

// const DEFAULT_PAGE_SIZE = 25;

// // Used only for the badge-count fetch, which needs every matching row (not
// // just one page) so the "Pending" badge reflects a true total. Large enough
// // to cover a month's worth of records in one request.
// const BADGE_COUNT_PAGE_SIZE = 5000;

// const ApprovalFilter = ({ formname }) => {
//   const { leave_approval_data } = useSelector(
//     (data) => data.LeaveApprovalReducer,
//   );

//   const { filteredcurrentvalue } = useSelector(
//     (data) => data.ApprovalFilterReducer,
//   );
//   const { filteredlatestvalue } = useSelector(
//     (data) => data.ApprovalFilterReducer,
//   );

//   const [activeTab, setActiveTab] = useState("1");
//   const toggleTab = (tab) => {
//     setActiveTab(tab);
//   };
//   const { attendance_approval_data } = useSelector(
//     (state) => state.AttendanceApprovalReducer,
//   );

//   // ── Badge counts (independent of the paginated table data) ──────────────
//   const [PendingLeave, setPendingLeave] = useState(0);
//   const [AttendancePending, setAttendancePending] = useState(0);

//   const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));
//   const employee_options = useMemo(
//     () => GetLocalStorageData("employee") || [],
//     [],
//   );

//   const leave_type_options = useMemo(
//     () =>
//       (GetLocalStorageData("leave_types") || []).map((lt) => ({
//         value: lt.id,
//         label: lt.name,
//       })),
//     [],
//   );

//   const [selectedLeaveType, setSelectedLeaveType] = useState(null);

//   const handleLeaveTypeFilterChange = (selected) => {
//     setSelectedLeaveType(selected || null);
//   };

//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [showTeamAttendanceApproval, setShowTeamAttendanceApproval] =
//     useState(false);
//   const [showAllAttendanceApproval, setShowAllAttendanceApproval] =
//     useState(false);
//   const [showTeamLeaveApproval, setShowTeamLeaveApproval] = useState(false);
//   const [showAllLeaveApproval, setShowAllLeaveApproval] = useState(false);

//   const inputRef = useRef();
//   const location = useLocation();
//   const pathname = location.pathname;

//   const dispatch = useDispatch();

//   const [employeeType, setEmployeeType] = useState(1);
//   const [filteredMonth, setFilteredMonth] = useState(
//     `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}`,
//   );
//   const [filteredValue, setFilteredValue] = useState({
//     filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}`,
//     employeeType: 1,
//   });

//   // ── Pagination state (shared by Leave & Attendance approval tables) ─────
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
//   const [totalCount, setTotalCount] = useState(0);

//   const skipInitialPaginationFetch = useRef(true);

//   const handlePaginationChange = useCallback((newPage, newPageSize) => {
//     setPage(newPage);
//     setPageSize(newPageSize);
//   }, []);

//   const { employee_table_filter_keys } = useSelector(
//     (state) => state.TableFilterReducer,
//   );

//   const dep_options = useMemo(
//     () =>
//       (GetLocalStorageData("department") || []).map((d) => ({
//         ...d,
//         id: Number(d.id),
//       })),
//     [],
//   );

//   const handleEmployeeChange = (selected) => {
//     setSelectedEmployees(selected || []);
//   };

//   const handleEmployeeSearch = (option, inputValue) => {
//     const search = inputValue.trim();

//     if (!search) return true;
//     if (/^\d+$/.test(search)) {
//       return false;
//     }

//     return (option.label || option.data?.name || "")
//       .toLowerCase()
//       .includes(search.toLowerCase());
//   };

//   // useEffect(() => {
//   //   if (
//   //     (profile_data.permission_list.includes(
//   //       VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
//   //     ) &&
//   //       !profile_data.permission_list.includes(
//   //         VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
//   //       )) ||
//   //     (profile_data.permission_list.includes(
//   //       VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
//   //     ) &&
//   //       !profile_data.permission_list.includes(
//   //         VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
//   //       ))
//   //   ) {
//   //     setEmployeeType(0);
//   //   }
//   // }, []);

//   // const handleEmployeeTypeChange = (e) => {
//   //   setEmployeeType(e.value);
//   //   setFilteredValue((prev) => ({
//   //     ...prev,
//   //     employeeType: e.value,
//   //   }));
//   // };

//   const handleEmployeeTypeChange = (e) => {
//     const val = Number(e.value);
//     setEmployeeType(val);
//     setFilteredValue((prev) => ({ ...prev, employeeType: val }));
//   };

//   const handleDateRangeChange = (e, monthStr) => {
//     setFilteredMonth(monthStr);
//     setFilteredValue((prev) => ({
//       ...prev,
//       filteredMonth: monthStr,
//     }));
//   };

//   const firstEffectExecutedRef = useRef(false);

//   useEffect(() => {
//     if (profile_data?.is_admin === true) {
//       setShowAllAttendanceApproval(true);
//       setShowAllLeaveApproval(true);
//       setShowTeamAttendanceApproval(true);
//       setShowTeamLeaveApproval(true);
//       setEmployeeType(0); // admin starts on "All Employee"
//       firstEffectExecutedRef.current = true;
//       return;
//     }

//     const permissions = {
//       [VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY]: setShowAllAttendanceApproval,
//       [VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY]: setShowTeamAttendanceApproval,
//       [VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY]: setShowAllLeaveApproval,
//       [VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY]: setShowTeamLeaveApproval,
//     };

//     Object.entries(permissions).forEach(([permissionKey, setState]) => {
//       if (profile_data.permission_list.includes(permissionKey)) {
//         setState(true);
//       }
//     });
//     firstEffectExecutedRef.current = true;
//   }, []);

//   // const isLeaveApprovalActive =
//   //   activeTab === "2" ||
//   //   (!showAllAttendanceApproval &&
//   //     !showTeamAttendanceApproval &&
//   //     activeTab === "1");

//   const isLeaveApprovalActive =
//     activeTab === "2" ||
//     (!showAllAttendanceApproval && !showTeamAttendanceApproval && activeTab === "1");

//   // Permission for the tab the user is currently on
//   const canViewAll = isLeaveApprovalActive
//     ? showAllLeaveApproval
//     : showAllAttendanceApproval;
//   const canViewTeam = isLeaveApprovalActive
//     ? showTeamLeaveApproval
//     : showTeamAttendanceApproval;

//   // Show the dropdown for anyone who can see "All"
//   const showEmployeeTypeDropdown = canViewAll || canViewTeam; 

//   const employeeTypeSelectOptions = canViewAll
//     ? employeeTypeOptions
//     : employeeTypeOptions.filter((o) => Number(o.value) === 1);

//   // Keep the selected type valid for the current tab
//   useEffect(() => {
//     if (!firstEffectExecutedRef.current) return;
//     if (canViewAll && !canViewTeam) setEmployeeType(0); // only "All" allowed
//     else if (!canViewAll && canViewTeam) setEmployeeType(1); // only "Team" allowed
//   }, [canViewAll, canViewTeam]);

//   const getDepartmentParam = () => {
//     const deptId = employee_table_filter_keys?.primary_department_id_list;

//     if (deptId === null || deptId === undefined) return "";

//     return `&primary_department_id_list=${Number(deptId)}`;
//   };

//   const getEmployeeParam = () => {
//     if (!selectedEmployees.length) return "";
//     const ids = selectedEmployees.map((e) => e.id ?? e.value).join(",");
//     return `&employee_id_list=${ids}`;
//   };

//   const applyDepartmentFilter = (data) => {
//     const deptId = employee_table_filter_keys?.primary_department_id_list;

//     if (!deptId) return data;

//     return data.filter(
//       (item) =>
//         Number(item.primary_department_id_list || item.department_id) ===
//         Number(deptId),
//     );
//   };

//   const getLeaveTypeParam = () => {
//     if (!selectedLeaveType) return "";
//     return `&leave_type_id=${selectedLeaveType.value}`;
//   };

//   const applyLeaveTypeFilter = (data) => {
//     if (!selectedLeaveType) return data;
//     return data.filter(
//       (item) =>
//         Number(item.leave_type_id ?? item.leave_type?.id) ===
//         Number(selectedLeaveType.value),
//     );
//   };

//   const applyEmployeeFilter = (data) => {
//     if (!selectedEmployees.length) return data;
//     const ids = selectedEmployees.map((e) => Number(e.id ?? e.value));
//     return data.filter((item) =>
//       ids.includes(
//         Number(item.employee_id ?? item.employee?.id ?? item.emp_id),
//       ),
//     );
//   };

//   const extractListAndTotal = (response) => {
//     const body = response?.data;
//     const payload = body?.data;

//     let list = [];
//     let total = 0;

//     if (Array.isArray(payload)) {
//       list = payload;
//       total = body?.count ?? body?.total ?? payload.length;
//     } else if (Array.isArray(payload?.results)) {
//       list = payload.results;
//       total = payload.count ?? payload.total ?? list.length;
//     } else if (Array.isArray(body?.results)) {
//       list = body.results;
//       total = body.count ?? list.length;
//     }

//     return { list, total };
//   };

//   // Shared URL builder for both approval kinds.
//   // employee_type is the single selected value from employeeTypeOptions
//   // (All Employee / My Team Members) — sent as the `employee_type` param.
//   const buildUrl = (kind, targetPage, targetPageSize) => {
//     const deptParam = getDepartmentParam();
//     const empParam = getEmployeeParam();
//     const isLeave = kind === "leave";

//     const baseUrl = isLeave
//       ? "leave/get-leave-application-for-approval/?thisMonth=" +
//         filteredMonth +
//         "&employee_type="
//       : "attendance/get-attendance-data-for-approval/?thisMonth=" +
//         filteredMonth +
//         "&employee_type=";

//     const scopedUrl = baseUrl + employeeType + deptParam + empParam;

//     const leaveTypeParam = isLeave ? getLeaveTypeParam() : "";

//     return (
//       scopedUrl +
//       leaveTypeParam +
//       `&page=${targetPage}` +
//       `&page_size=${targetPageSize}`
//     );
//   };

//   const handleLeaveFilter = async (
//     type,
//     targetPage = page,
//     targetPageSize = pageSize,
//   ) => {
//     const integerEmployeeType = parseInt(type, 10);
//     const url = buildUrl("leave", targetPage, targetPageSize);

//     try {
//       console.log("Leave API URL:", url);

//       const response = await Api({ type: "GET", url });

//       let { list: data, total } = extractListAndTotal(response);

//       data = applyDepartmentFilter(data);
//       data = applyEmployeeFilter(data);
//       data = applyLeaveTypeFilter(data);

//       dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
//       dispatch(setLeaveApproval(data));
//       setTotalCount(total);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       dispatch(setLoaderVisible(false));
//     }
//   };

//   const handleAttendanceFilter = async (
//     type,
//     targetPage = page,
//     targetPageSize = pageSize,
//   ) => {
//     const integerEmployeeType = parseInt(type, 10);
//     const url = buildUrl("attendance", targetPage, targetPageSize);

//     try {
//       const response = await Api({ type: "GET", url });

//       let { list: data, total } = extractListAndTotal(response);

//       data = applyDepartmentFilter(data);
//       data = applyEmployeeFilter(data);

//       dispatch(setApprovalEmployeeTypeFilter(integerEmployeeType));
//       dispatch(setAttendanceApprovalData(data));
//       setTotalCount(total);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       dispatch(setLoaderVisible(false));
//     }
//   };

//   const refreshLeavePendingBadge = async () => {
//     if (!(showAllLeaveApproval || showTeamLeaveApproval)) return;

//     try {
//       const url = buildUrl("leave", 1, BADGE_COUNT_PAGE_SIZE);
//       const response = await Api({ type: "GET", url });

//       let { list } = extractListAndTotal(response);
//       list = applyDepartmentFilter(list);
//       list = applyEmployeeFilter(list);
//       list = applyLeaveTypeFilter(list);

//       const pendingCount = list.filter(
//         (d) =>
//           (d.status === 1 || d.status === 4) &&
//           d.leave_cancellation_details?.status !== 2,
//       ).length;

//       setPendingLeave(pendingCount);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const refreshAttendancePendingBadge = async () => {
//     if (!(showAllAttendanceApproval || showTeamAttendanceApproval)) return;

//     try {
//       const url = buildUrl("attendance", 1, BADGE_COUNT_PAGE_SIZE);
//       const response = await Api({ type: "GET", url });

//       let { list } = extractListAndTotal(response);
//       list = applyDepartmentFilter(list);
//       list = applyEmployeeFilter(list);

//       const pendingCount = list.filter((d) => d.hr_status === 3).length;

//       setAttendancePending(pendingCount);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const refreshBadgeCounts = () => {
//     refreshLeavePendingBadge();
//     refreshAttendancePendingBadge();
//   };

//   const FilterData = async (
//     tab,
//     targetPage = page,
//     targetPageSize = pageSize,
//   ) => {
//     dispatch(setLoaderVisible(true));

//     if (
//       tab === "2" ||
//       (!showAllAttendanceApproval && !showTeamAttendanceApproval && tab === "1")
//     ) {
//       if (showAllLeaveApproval || showTeamLeaveApproval) {
//         handleLeaveFilter(employeeType, targetPage, targetPageSize);
//       } else {
//         dispatch(setLoaderVisible(false));
//         toast.error("Something Went Wrong!");
//       }
//     } else if (tab === "1") {
//       if (showAllAttendanceApproval || showTeamAttendanceApproval) {
//         handleAttendanceFilter(employeeType, targetPage, targetPageSize);
//       } else {
//         dispatch(setLoaderVisible(false));
//         toast.error("Something Went Wrong!");
//       }
//     } else {
//       dispatch(setLoaderVisible(false));
//       toast.error("Something Went Wrong!");
//     }
//   };

//   useEffect(() => {
//     if (!firstEffectExecutedRef.current) return;

//     if (
//       !showAllAttendanceApproval &&
//       !showTeamAttendanceApproval &&
//       !showAllLeaveApproval &&
//       !showTeamLeaveApproval
//     ) {
//       return;
//     }

//     const timer = setTimeout(() => {
//       dispatch(setFilteredCurrentValue(filteredValue));
//       dispatch(setFilteredLatestValue(filteredValue));

//       skipInitialPaginationFetch.current = true;
//       setPage(1);
//       FilterData(activeTab, 1, pageSize);
//       refreshBadgeCounts();
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [
//     employeeType,
//     filteredMonth,
//     activeTab,
//     selectedEmployees,
//     selectedLeaveType,
//     employee_table_filter_keys?.primary_department_id_list,
//     showAllAttendanceApproval,
//     showTeamAttendanceApproval,
//     showAllLeaveApproval,
//     showTeamLeaveApproval,
//   ]);

//   useEffect(() => {
//     if (!firstEffectExecutedRef.current) return;
//     if (skipInitialPaginationFetch.current) {
//       skipInitialPaginationFetch.current = false;
//       return;
//     }
//     FilterData(activeTab, page, pageSize);
//   }, [page, pageSize]);

//   useEffect(() => {
//     if (firstEffectExecutedRef.current) {
//       if (
//         activeTab === "2" ||
//         (!showAllAttendanceApproval &&
//           !showTeamAttendanceApproval &&
//           activeTab === "1")
//       ) {
//         dispatch(setCurrentApprovalComponent(leave_approval_component_name));
//       } else if (activeTab === "1") {
//         dispatch(
//           setCurrentApprovalComponent(attendance_approval_component_name),
//         );
//       } else {
//         dispatch(setCurrentApprovalComponent(""));
//       }
//     }
//   }, [activeTab, showAllAttendanceApproval, showTeamAttendanceApproval]);

//   const handleFilter = async () => {
//     dispatch(setFilteredCurrentValue(filteredValue));
//     skipInitialPaginationFetch.current = true;
//     setPage(1);
//     FilterData(activeTab, 1, pageSize);
//     refreshBadgeCounts();
//   };

//   const handleFilterChange = (e, name) => {
//     const val = e ? Number(e.id) : null;

//     dispatch(
//       setEmployeeTableFilterKeys({
//         ...employee_table_filter_keys,
//         [name]: val,
//       }),
//     );
//   };

//   const serverPagination = useMemo(
//     () => ({
//       page,
//       pageSize,
//       totalCount,
//       onChange: handlePaginationChange,
//     }),
//     [page, pageSize, totalCount, handlePaginationChange],
//   );

//   return (
//     <React.Fragment>
//       <div className="page-content" style={{ marginBottom: "-135px" }}>
//         <div style={{ zIndex: 1000, position: "relative" }}>
//           <Card>
//             <CardHeader className="border-0 rounded">
//               <Row className="g-2">
//                 {/* {(showAllAttendanceApproval && showTeamAttendanceApproval) ||
//                 (showAllLeaveApproval && showTeamLeaveApproval) ? ( */}
//                 {showEmployeeTypeDropdown ? (
//                   <Col md={3}>
//                     <Select
//                       id="employee_filter"
//                       name="employee_filter"
//                       isClearable={false}
//                       isMulti={false}
//                       // options={employeeTypeOptions || []}
//                       options={employeeTypeSelectOptions}
//                       className="basic-multi-select"
//                       placeholder="Select Employee Type"
//                       allowClear={false}
//                       onChange={handleEmployeeTypeChange}
//                       // value={
//                       //   employeeTypeOptions.find(
//                       //     (d) => d.id === employeeType,
//                       //   ) || employeeTypeOptions[1]
//                       // }
//                       filterOption={handleEmployeeSearch}
//                       value={
//                         employeeTypeSelectOptions.find(
//                           (d) => Number(d.value) === Number(employeeType),
//                         ) || employeeTypeSelectOptions[0]
//                       }
//                     />
//                   </Col>
//                 ) : null}
//                 <Col md={3}>
//                   <Select
//                     id="employee_multiselect"
//                     name="employee_multiselect"
//                     isClearable={true}
//                     isMulti={true}
//                     options={employee_options}
//                     getOptionLabel={(e) => e.name ?? e.label}
//                     getOptionValue={(e) => e.id ?? e.value}
//                     className="basic-multi-select"
//                     placeholder="Select Employees"
//                     onChange={handleEmployeeChange}
//                     components={{ Option: EmployeeDisplayInSelect }}
//                     value={selectedEmployees}
//                     filterOption={handleEmployeeSearch}
//                   />
//                 </Col>
//                 <Col md={3}>
//                   <Select
//                     id="department_filter"
//                     name="department_filter"
//                     isClearable
//                     innerRef={inputRef}
//                     isMulti={false}
//                     options={dep_options || []}
//                     className="basic-multi-select"
//                     placeholder="Select Department"
//                     getOptionLabel={(e) => e.name}
//                     getOptionValue={(e) => e.id}
//                     value={
//                       dep_options?.find(
//                         (d) =>
//                           Number(d.id) ===
//                           Number(
//                             employee_table_filter_keys?.primary_department_id_list,
//                           ),
//                       ) || null
//                     }
//                     onChange={(e) =>
//                       handleFilterChange(e, "primary_department_id_list")
//                     }
//                     filterOption={handleEmployeeSearch}
//                   />
//                 </Col>

//                 {isLeaveApprovalActive &&
//                   (showAllLeaveApproval || showTeamLeaveApproval) && (
//                     <Col md={3}>
//                       <Select
//                         id="leave_type_filter"
//                         name="leave_type_filter"
//                         isClearable
//                         isMulti={false}
//                         options={leave_type_options}
//                         className="basic-multi-select"
//                         placeholder="Select Leave Type"
//                         value={selectedLeaveType}
//                         onChange={handleLeaveTypeFilterChange}
//                         filterOption={(option, inputValue) =>
//                           option.label
//                             .toLowerCase()
//                             .includes(inputValue.toLowerCase())
//                         }
//                       />
//                     </Col>
//                   )}

//                 <Col md={3}>
//                   <div className="form-icon right">
//                     <DatePicker
//                       value={dayjs(filteredMonth)}
//                       format={MonthFormat}
//                       picker="month"
//                       allowClear={false}
//                       className="form-control"
//                       placeholder="Select Month"
//                       onChange={handleDateRangeChange}
//                     />
//                   </div>
//                 </Col>
//                 <div
//                   className="col-md-auto ms-auto"
//                   style={{ marginLeft: "10px" }}
//                 >
//                   <Row className="g-2">
//                     <div className="d-flex justify-content-end">
//                       <div className="col-lg-auto me-2">
//                         <Nav
//                           className="nav-tabs nav-tabs-custom nav-success"
//                           role="tablist"
//                         >
//                           {showAllAttendanceApproval ||
//                           showTeamAttendanceApproval ? (
//                             <NavItem>
//                               <NavLink
//                                 className={classnames(
//                                   { active: activeTab === "1" },
//                                   `fw-semibold ${
//                                     activeTab === "1"
//                                       ? "text-success"
//                                       : "text-primary"
//                                   }`,
//                                 )}
//                                 onClick={() => {
//                                   toggleTab("1");
//                                 }}
//                                 href="#"
//                               >
//                                 Attendance Approval{" "}
//                                 <Badge
//                                   color={
//                                     activeTab === "1" ? "success" : "primary"
//                                   }
//                                   style={{ marginLeft: "5px" }}
//                                 >
//                                   {AttendancePending}
//                                 </Badge>
//                               </NavLink>
//                             </NavItem>
//                           ) : null}

//                           {showAllLeaveApproval || showTeamLeaveApproval ? (
//                             <NavItem>
//                               {!showAllAttendanceApproval &&
//                               !showTeamAttendanceApproval ? (
//                                 <NavLink
//                                   className={classnames(
//                                     { active: activeTab === "1" },
//                                     `fw-semibold ${"text-success"}`,
//                                   )}
//                                   href="#"
//                                 >
//                                   Leave Approval{" "}
//                                   <Badge
//                                     color={"success"}
//                                     style={{ marginLeft: "5px" }}
//                                   >
//                                     {PendingLeave}
//                                   </Badge>
//                                 </NavLink>
//                               ) : (
//                                 <NavLink
//                                   className={classnames(
//                                     { active: activeTab === "2" },
//                                     `fw-semibold ${
//                                       activeTab === "2"
//                                         ? "text-success"
//                                         : "text-primary"
//                                     }`,
//                                   )}
//                                   onClick={() => {
//                                     toggleTab("2");
//                                     if (
//                                       filteredcurrentvalue !==
//                                       filteredlatestvalue
//                                     ) {
//                                       skipInitialPaginationFetch.current = true;
//                                       setPage(1);
//                                       FilterData("2", 1, pageSize);
//                                       dispatch(
//                                         setFilteredLatestValue(
//                                           filteredcurrentvalue,
//                                         ),
//                                       );
//                                     }
//                                   }}
//                                   href="#"
//                                 >
//                                   Leave Approval{" "}
//                                   <Badge
//                                     color={
//                                       activeTab === "2" ? "success" : "primary"
//                                     }
//                                     style={{ marginLeft: "5px" }}
//                                   >
//                                     {PendingLeave}
//                                   </Badge>
//                                 </NavLink>
//                               )}
//                             </NavItem>
//                           ) : null}
//                         </Nav>
//                       </div>
//                     </div>
//                   </Row>
//                 </div>
//               </Row>
//             </CardHeader>
//           </Card>
//         </div>
//       </div>
//       <Col lg={12}>
//         <TabContent activeTab={activeTab} className="text-muted">
//           {(showAllAttendanceApproval || showTeamAttendanceApproval) && (
//             <TabPane
//               tabId={
//                 showAllAttendanceApproval || showTeamAttendanceApproval
//                   ? "1"
//                   : "0"
//               }
//             >
//               <AttendanceApproval serverPagination={serverPagination} />
//             </TabPane>
//           )}
//           {(showAllLeaveApproval || showTeamLeaveApproval) && (
//             <TabPane
//               tabId={
//                 !showAllAttendanceApproval && !showTeamAttendanceApproval
//                   ? "1"
//                   : "2"
//               }
//             >
//               <LeaveApproval
//                 PendingLeave={PendingLeave}
//                 AttendancePending={AttendancePending}
//                 serverPagination={serverPagination}
//               />
//             </TabPane>
//           )}
//         </TabContent>
//       </Col>
//     </React.Fragment>
//   );
// };

// export default ApprovalFilter;

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Badge,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import {
  MonthFormat,
  leave_approval_component_name,
  attendance_approval_component_name,
} from "../../../common/constant/Constants";
import {
  VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { Api } from "../../../common/api/Api";
import { setAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
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

const DEFAULT_PAGE_SIZE = 10;

// Backend caps page_size at 100, so the badge count has to walk the pages
// instead of asking for one huge page.
const BADGE_COUNT_PAGE_SIZE = 100;
const BADGE_COUNT_MAX_PAGES = 50;

// Order matters: the first option the user is allowed to use becomes the default.
const SCOPE_OPTIONS = [
  { value: "all", label: "All Employee" },
  { value: "hierarchy", label: "My Hierarchy" },
  { value: "team", label: "My Team Members" },
];

const ApprovalFilter = ({ formname }) => {
  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer,
  );
  const { filteredcurrentvalue } = useSelector(
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

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};
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
  const [tableLoading, setTableLoading] = useState(true);
  // Only the latest table request may update the table (filters can change mid-flight).
  const requestIdRef = useRef(0);

  const inputRef = useRef();
  const location = useLocation();
  const pathname = location.pathname;

  const dispatch = useDispatch();

  // ── Permissions per module and per scope ────────────────────────────────
  // Admin (and superuser) can use every scope; everyone else needs the
  // matching access key.
  const permissions = useMemo(() => {
    const isAdmin = profile_data?.is_admin === true;
    const list = profile_data?.permission_list || [];
    const has = (key) => isAdmin || list.includes(key);

    return {
      attendance: {
        all: has(VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY),
        hierarchy: has(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY),
        team: has(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY),
      },
      leave: {
        all: has(VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY),
        hierarchy: has(VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY),
        team: has(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY),
      },
    };
  }, []);

  const showAttendanceApproval = Object.values(permissions.attendance).some(
    Boolean,
  );
  const showLeaveApproval = Object.values(permissions.leave).some(Boolean);

  const isLeaveApprovalActive =
    activeTab === "2" || (!showAttendanceApproval && activeTab === "1");

  // Scopes the user may use on the tab they are currently looking at
  const scopeOptions = useMemo(() => {
    const perms = isLeaveApprovalActive
      ? permissions.leave
      : permissions.attendance;
    return SCOPE_OPTIONS.filter((o) => perms[o.value]);
  }, [isLeaveApprovalActive, permissions]);

  const showScopeDropdown = scopeOptions.length > 0;

  // ── Filters ─────────────────────────────────────────────────────────────
  const [scope, setScope] = useState("all");
  // If the chosen scope isn't allowed on this tab, fall back to the first
  // allowed one (e.g. user has "all" for attendance but only "team" for leave).
  const effectiveScope =
    scopeOptions.find((o) => o.value === scope)?.value ??
    scopeOptions[0]?.value ??
    "";

  const [filteredMonth, setFilteredMonth] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  );
  const [filteredValue, setFilteredValue] = useState({
    filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    scope: "all",
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

  const handleScopeChange = (e) => {
    const val = e.value;
    setScope(val);
    setFilteredValue((prev) => ({ ...prev, scope: val }));
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
    setFilteredValue((prev) => ({
      ...prev,
      filteredMonth: monthStr,
    }));
  };

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
  // `scope` (team | hierarchy | all) replaces the legacy `employee_type`.
  const buildUrl = (kind, targetPage, targetPageSize) => {
    const isLeave = kind === "leave";

    const endpoint = isLeave
      ? "leave/get-leave-application-for-approval/"
      : "attendance/get-attendance-data-for-approval/";

    const leaveTypeParam = isLeave ? getLeaveTypeParam() : "";

    return (
      `${endpoint}?thisMonth=${filteredMonth}` +
      `&scope=${effectiveScope}` +
      getDepartmentParam() +
      getEmployeeParam() +
      leaveTypeParam +
      `&page=${targetPage}` +
      `&page_size=${targetPageSize}`
    );
  };

  const handleLeaveFilter = async (
    targetPage = page,
    targetPageSize = pageSize,
    requestId = requestIdRef.current,
  ) => {
    const url = buildUrl("leave", targetPage, targetPageSize);

    try {
      const response = await Api({ type: "GET", url });
      if (requestId !== requestIdRef.current) return;

      let { list: data, total } = extractListAndTotal(response);

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);
      data = applyLeaveTypeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(effectiveScope));
      dispatch(setLeaveApproval(data));
      setTotalCount(total);
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === requestIdRef.current) setTableLoading(false);
    }
  };

  const handleAttendanceFilter = async (
    targetPage = page,
    targetPageSize = pageSize,
    requestId = requestIdRef.current,
  ) => {
    const url = buildUrl("attendance", targetPage, targetPageSize);

    try {
      const response = await Api({ type: "GET", url });
      if (requestId !== requestIdRef.current) return;

      let { list: data, total } = extractListAndTotal(response);

      data = applyDepartmentFilter(data);
      data = applyEmployeeFilter(data);

      dispatch(setApprovalEmployeeTypeFilter(effectiveScope));
      dispatch(setAttendanceApprovalData(data));
      setTotalCount(total);
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === requestIdRef.current) setTableLoading(false);
    }
  };

  // Walks every page (backend max page_size is 100) so the badge is a true total.
  const fetchAllPages = async (kind) => {
    const all = [];
    let pageNo = 1;
    let totalPages = 1;

    do {
      const response = await Api({
        type: "GET",
        url: buildUrl(kind, pageNo, BADGE_COUNT_PAGE_SIZE),
      });
      const { list } = extractListAndTotal(response);
      all.push(...list);

      const body = response?.data;
      totalPages = body?.total_pages ?? body?.data?.total_pages ?? 1;
      pageNo += 1;
    } while (pageNo <= totalPages && pageNo <= BADGE_COUNT_MAX_PAGES);

    return all;
  };

  const refreshLeavePendingBadge = async () => {
    if (!showLeaveApproval) return;

    try {
      let list = await fetchAllPages("leave");
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
    if (!showAttendanceApproval) return;

    try {
      let list = await fetchAllPages("attendance");
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
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setTableLoading(true);

    if (tab === "2" || (!showAttendanceApproval && tab === "1")) {
      if (showLeaveApproval) {
        handleLeaveFilter(targetPage, targetPageSize, requestId);
      } else {
        setTableLoading(false);
        toast.error("Something Went Wrong!");
      }
    } else if (tab === "1") {
      if (showAttendanceApproval) {
        handleAttendanceFilter(targetPage, targetPageSize, requestId);
      } else {
        setTableLoading(false);
        toast.error("Something Went Wrong!");
      }
    } else {
      setTableLoading(false);
      toast.error("Something Went Wrong!");
    }
  };

  useEffect(() => {
    if (!showAttendanceApproval && !showLeaveApproval) return;
    if (!effectiveScope) return;

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
    effectiveScope,
    filteredMonth,
    activeTab,
    selectedEmployees,
    selectedLeaveType,
    employee_table_filter_keys?.primary_department_id_list,
    showAttendanceApproval,
    showLeaveApproval,
  ]);

  useEffect(() => {
    if (skipInitialPaginationFetch.current) {
      skipInitialPaginationFetch.current = false;
      return;
    }
    if (!effectiveScope) return;
    FilterData(activeTab, page, pageSize);
  }, [page, pageSize]);

  useEffect(() => {
    if (isLeaveApprovalActive) {
      dispatch(setCurrentApprovalComponent(leave_approval_component_name));
    } else if (activeTab === "1") {
      dispatch(setCurrentApprovalComponent(attendance_approval_component_name));
    } else {
      dispatch(setCurrentApprovalComponent(""));
    }
  }, [activeTab, showAttendanceApproval]);

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

  const shiftMonth = (delta) => {
    const base = dayjs(filteredMonth);
    const next = (base.isValid() ? base : dayjs()).add(delta, "month");
    handleDateRangeChange(null, next.format(MonthFormat));
  };

  const apfSelectProps = {
    className: "apf-select",
    classNamePrefix: "apf-rs",
    menuPortalTarget: document.body,
    styles: { menuPortal: (base) => ({ ...base, zIndex: 1600 }) },
  };

  return (
    <React.Fragment>
      <div className="page-content" style={{ marginBottom: "-135px" }}>
        <div className="apf-wrap">
          <div className="apf-card">
            <div className="apf-fields">
              {showScopeDropdown ? (
                <div className="apf-field">
                  <label className="apf-label" htmlFor="scope_filter">
                    <i className="ri-group-line" /> Employee Type
                  </label>
                  <Select
                    testId="approval-filter-scope-filter"
                    {...apfSelectProps}
                    inputId="scope_filter"
                    name="scope_filter"
                    isClearable={false}
                    isMulti={false}
                    isSearchable={false}
                    options={scopeOptions}
                    placeholder="Select Employee Type"
                    onChange={handleScopeChange}
                    value={
                      scopeOptions.find((o) => o.value === effectiveScope) ||
                      scopeOptions[0]
                    }
                  />
                </div>
              ) : null}

              <div className="apf-field apf-field-wide">
                <label className="apf-label" htmlFor="employee_multiselect">
                  <i className="ri-user-search-line" /> Employees
                </label>
                <Select
                  testId="approval-filter-employee-multiselect"
                  {...apfSelectProps}
                  inputId="employee_multiselect"
                  name="employee_multiselect"
                  isClearable={true}
                  isMulti={true}
                  options={employee_options}
                  getOptionLabel={(e) => e.name ?? e.label}
                  getOptionValue={(e) => e.id ?? e.value}
                  placeholder="Search employees…"
                  onChange={handleEmployeeChange}
                  components={{ Option: EmployeeDisplayInSelect }}
                  value={selectedEmployees}
                  filterOption={handleEmployeeSearch}
                />
              </div>

              <div className="apf-field">
                <label className="apf-label" htmlFor="department_filter">
                  <i className="ri-building-line" /> Department
                </label>
                <Select
                  testId="approval-filter-department-filter"
                  {...apfSelectProps}
                  inputId="department_filter"
                  name="department_filter"
                  isClearable
                  innerRef={inputRef}
                  isMulti={false}
                  options={dep_options || []}
                  placeholder="All Departments"
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
              </div>

              {isLeaveApprovalActive && showLeaveApproval && (
                <div className="apf-field">
                  <label className="apf-label" htmlFor="leave_type_filter">
                    <i className="ri-file-list-3-line" /> Leave Type
                  </label>
                  <Select
                    testId="approval-filter-leave-type-filter"
                    {...apfSelectProps}
                    inputId="leave_type_filter"
                    name="leave_type_filter"
                    isClearable
                    isMulti={false}
                    options={leave_type_options}
                    placeholder="All Leave Types"
                    value={selectedLeaveType}
                    onChange={handleLeaveTypeFilterChange}
                    filterOption={(option, inputValue) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
                  />
                </div>
              )}
              <div className="apf-field apf-field-month">
                <span className="apf-label">
                  <i className="ri-calendar-2-line" /> Month
                </span>
                <div className="apf-month">
                  <button
                    data-testid="approval-filter-previous-month-button"
                    type="button"
                    className="apf-month-btn"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                  >
                    <i className="ri-arrow-left-s-line" />
                  </button>
                  <div className="apf-month-picker">
                    <i className="ri-calendar-2-line" />
                    <DatePicker
                      value={dayjs(filteredMonth)}
                      format="MMM YYYY"
                      picker="month"
                      allowClear={false}
                      bordered={false}
                      suffixIcon={null}
                      inputReadOnly
                      placeholder="Select Month"
                      onChange={(d) => d && handleDateRangeChange(null, d.format(MonthFormat))}
                    />
                  </div>
                  <button
                    data-testid="approval-filter-next-month-button"
                    type="button"
                    className="apf-month-btn"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                  >
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>
              </div>
              <div className="apf-tabs-end">
                <Nav
                  className="nav-tabs nav-tabs-custom nav-success apf-nav"
                  role="tablist"
                >
                  {showAttendanceApproval ? (
                    <NavItem>
                      <NavLink
                        data-testid="approval-filter-attendance-approval-link"
                        className={classnames(
                          { active: activeTab === "1" },
                          `fw-semibold ${
                            activeTab === "1" ? "text-success" : "text-primary"
                          }`,
                        )}
                        onClick={() => {
                          toggleTab("1");
                        }}
                        href="#"
                      >
                        Attendance Approval{" "}
                        <Badge
                          color={activeTab === "1" ? "success" : "primary"}
                          style={{ marginLeft: "5px" }}
                        >
                          {AttendancePending}
                        </Badge>
                      </NavLink>
                    </NavItem>
                  ) : null}
  
                  {showLeaveApproval ? (
                    <NavItem>
                      {!showAttendanceApproval ? (
                        <NavLink
                          data-testid="approval-filter-leave-approval-link"
                          className={classnames(
                            { active: activeTab === "1" },
                            "fw-semibold text-success",
                          )}
                          href="#"
                        >
                          Leave Approval{" "}
                          <Badge color={"success"} style={{ marginLeft: "5px" }}>
                            {PendingLeave}
                          </Badge>
                        </NavLink>
                      ) : (
                        <NavLink
                          data-testid="approval-filter-leave-approval-link"
                          className={classnames(
                            { active: activeTab === "2" },
                            `fw-semibold ${
                              activeTab === "2" ? "text-success" : "text-primary"
                            }`,
                          )}
                          onClick={() => {
                            toggleTab("2");
                          }}
                          href="#"
                        >
                          Leave Approval{" "}
                          <Badge
                            color={activeTab === "2" ? "success" : "primary"}
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
          </div>

          <style>{`
            .apf-wrap{position:relative;z-index:1000;margin-bottom:1.25rem}
            .apf-card{border-radius:14px;background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);
              box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 22px -16px rgba(0,0,0,.25)}
            .apf-tabs-end{margin-left:auto;align-self:flex-end}
            .apf-tabs-end .apf-nav{border-bottom:0;flex-wrap:nowrap}
            .apf-tabs-end .apf-nav .nav-link{white-space:nowrap;padding-top:9px;padding-bottom:9px}

            .apf-month{display:flex;align-items:center;height:38px;border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);overflow:hidden;transition:border-color .15s,box-shadow .15s}
            .apf-month:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
            .apf-month:focus-within{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
            .apf-month-btn{width:34px;height:100%;display:grid;place-items:center;border:0;background:transparent;color:var(--vz-secondary-color);font-size:18px;transition:all .15s}
            .apf-month-btn:hover{color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.08)}
            .apf-month-picker{display:flex;align-items:center;gap:2px;height:100%;padding-left:10px;border-left:1px solid var(--vz-border-color);border-right:1px solid var(--vz-border-color)}
            .apf-month-picker > i{color:var(--vz-primary);font-size:15px}
            .apf-month-picker .ant-picker{width:104px;padding:0 6px;cursor:pointer}
            .apf-month-picker .ant-picker input{font-size:.85rem;font-weight:600;color:var(--vz-heading-color) !important;cursor:pointer}

            .apf-fields{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 14px;padding:14px 16px}
            .apf-field{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1 1 190px;max-width:260px}
            .apf-field-wide{flex:1.4 1 260px;max-width:380px}
            .apf-field-month{flex:0 0 auto}
            .apf-label{display:inline-flex;align-items:center;gap:5px;margin:0;padding-left:2px;font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--vz-secondary-color)}
            .apf-label i{font-size:13px;line-height:1}

            .apf-select .apf-rs__control{min-height:40px;border-radius:10px;border-color:var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:0 1px 2px rgba(0,0,0,.04);cursor:pointer;transition:border-color .15s,box-shadow .15s}
            .apf-select .apf-rs__control:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
            .apf-select .apf-rs__control--is-focused{border-color:var(--vz-primary) !important;box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
            .apf-select .apf-rs__value-container{padding:2px 10px}
            .apf-select .apf-rs__single-value,.apf-select .apf-rs__input-container{font-size:.85rem;font-weight:500;color:var(--vz-heading-color)}
            .apf-select .apf-rs__placeholder{font-size:.85rem;color:var(--vz-secondary-color)}
            .apf-select .apf-rs__indicator-separator{display:none}
            .apf-select .apf-rs__indicator{color:var(--vz-secondary-color);padding:0 8px}
            .apf-select .apf-rs__clear-indicator:hover{color:var(--vz-danger)}
            .apf-select .apf-rs__dropdown-indicator{transition:transform .2s}
            .apf-select .apf-rs__control--menu-is-open .apf-rs__dropdown-indicator{transform:rotate(180deg);color:var(--vz-primary)}
            .apf-select .apf-rs__control .apf-rs__multi-value.apf-rs__multi-value{min-width:0;border-radius:999px;background:rgba(var(--vz-primary-rgb),.1);border:1px solid rgba(var(--vz-primary-rgb),.22);color:var(--vz-primary);margin:2px 3px 2px 0}
            .apf-select .apf-rs__control .apf-rs__multi-value .apf-rs__multi-value__label.apf-rs__multi-value__label{font-size:.76rem;font-weight:600;color:var(--vz-primary);padding:2px 4px 2px 9px}
            .apf-select .apf-rs__control .apf-rs__multi-value .apf-rs__multi-value__remove.apf-rs__multi-value__remove{border-radius:999px;color:color-mix(in srgb,var(--vz-primary) 70%,transparent);margin-right:2px}
            .apf-select .apf-rs__control .apf-rs__multi-value .apf-rs__multi-value__remove.apf-rs__multi-value__remove:hover{background:rgba(var(--vz-danger-rgb),.15);color:var(--vz-danger)}
            .apf-rs__menu{border-radius:12px !important;overflow:hidden;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg) !important;
              box-shadow:0 16px 40px -12px rgba(0,0,0,.3) !important;margin-top:6px !important}
            .apf-rs__menu-list{padding:6px !important}
            .apf-rs__option{border-radius:8px;font-size:.84rem;cursor:pointer !important;color:var(--vz-heading-color) !important}
            .apf-rs__option--is-focused{background:rgba(var(--vz-primary-rgb),.08) !important}
            .apf-rs__option--is-selected{background:rgba(var(--vz-primary-rgb),.14) !important;color:var(--vz-primary) !important;font-weight:600}
            .apf-rs__menu-notice{font-size:.82rem;color:var(--vz-secondary-color) !important}

            @media (max-width:575.98px){
              .apf-tabs-end{margin-left:0;width:100%}.apf-field{max-width:none}
              .apf-month{width:100%;justify-content:space-between}
            }
          `}</style>
        </div>
      </div>
      <Col lg={12}>
        <TabContent activeTab={activeTab} className="text-muted">
          {showAttendanceApproval && (
            <TabPane tabId="1">
              <AttendanceApproval serverPagination={serverPagination} loading={tableLoading && !!effectiveScope} />
            </TabPane>
          )}
          {showLeaveApproval && (
            <TabPane tabId={!showAttendanceApproval ? "1" : "2"}>
              <LeaveApproval
                PendingLeave={PendingLeave}
                AttendancePending={AttendancePending}
                serverPagination={serverPagination}
                loading={tableLoading && !!effectiveScope}
              />
            </TabPane>
          )}
        </TabContent>
      </Col>
    </React.Fragment>
  );
};

export default ApprovalFilter;