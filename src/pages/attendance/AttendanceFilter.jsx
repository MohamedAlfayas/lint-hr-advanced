import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, Col, Row } from "reactstrap";
import { Api } from "../../common/api/Api";
import {
  MonthFormat,
  hr_status_options,
  attendance_type_options,
} from "../../common/constant/Constants";
import {
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { DatePicker } from "antd";
import Select from "react-select";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { useDispatch, useSelector } from "react-redux";
import {
  setAttendancePagination,
  setIndividualAttendanceReportData,
  setShowTeamTable,
  setTeamAttendanceReportData,
} from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { toast } from "react-toastify";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";

dayjs.extend(customParseFormat);

const AttendanceFilter = () => {
  const dispatch = useDispatch();

  // page / page_size live in Redux so the table's pager can control them
  const { attendance_pagination } = useSelector(
    (state) => state.AttendanceReportReducer,
  );
  const page = attendance_pagination?.page ?? 1;
  const page_size = attendance_pagination?.page_size ?? 20;

  const [filterKeys, setFilterKeys] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    hr_status: "0",
    record: "0",
    type: "1",
    employee: "0",
  });

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);
  const [attendanceViewFilter, setAttendanceViewFilter] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const requestIdRef = useRef(0);
  const prevFilterKeysRef = useRef(filterKeys);

  const employee_data = GetLocalStorageData("employee");
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  // 🔹 Permission-based filter
  useEffect(() => {
    const permissions = profile_data?.permission_list || [];

    let allowedIds = ["1"];
    if (permissions.includes(VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY)) {
      allowedIds = ["1", "2", "3"];
    } else if (permissions.includes(VIEW_TEAM_ATTENDANCE_ACCESS_KEY)) {
      allowedIds = ["1", "2"];
    }

    setAttendanceViewFilter(
      attendance_type_options.filter((d) => allowedIds.includes(d.id)),
    );
  }, []);

  // 🔹 Load employees
  useEffect(() => {
    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        const response = res?.data?.data || [];

        const emp_options = response
          .map((d) => employee_data.find((e) => e.id === d))
          .filter(Boolean);

        setEmployeeOptions([
          { id: "0", label: "All", value: "0" },
          ...emp_options,
        ]);
      })
      .catch(() => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  // 🔹 Handlers – any filter change resets to page 1
  const resetPage = () => dispatch(setAttendancePagination({ page: 1 }));

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({ ...prev, thisMonth: monthStr }));
    resetPage();
  };

  const handleHRStatusChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, hr_status: e.value }));
    resetPage();
  };

  const handleTypeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, type: e.value, employee: "0" }));
    setShowEmployeeSelect(e.value === "2");
    resetPage();
  };

  const handleEmployeeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, employee: e.value }));
    resetPage();
  };

  // 🔹 API Call
  const handleFilter = async (keys, currentPage, currentPageSize) => {
    const requestId = ++requestIdRef.current;
    dispatch(setLoaderVisible(true));

    try {
      const attendanceApi = await PostApi(
        "report/get-attendance-report/v3/",
        { ...keys, page: currentPage, page_size: currentPageSize },
        false,
      );

      // A newer request has started – ignore this response
      if (requestId !== requestIdRef.current) return;

      if (attendanceApi?.status === 200) {
        const body = attendanceApi?.data;
        const data = body?.data;
        const total_pages = body?.total_pages ?? 0;

        // Only count / total_pages are written back (page & page_size are
        // controlled by the UI) so this can never trigger a refetch loop.
        dispatch(
          setAttendancePagination({
            count: body?.count ?? 0,
            total_pages,
          }),
        );

        // Current page became empty -> step back
        if (
          (data?.team_attendance_report || []).length === 0 &&
          (data?.individual_attendance_report || []).length === 0 &&
          currentPage > 1
        ) {
          dispatch(
            setAttendancePagination({
              page: Math.max(1, Math.min(currentPage - 1, total_pages || 1)),
            }),
          );
          return;
        }

        dispatch(
          setIndividualAttendanceReportData(data?.individual_attendance_report),
        );

        BuildAttendanceReportChart(
          data?.individual_attendance_report,
          dispatch,
        );

        // Leave API
        if (keys.type === "1") {
          Api({
            type: "GET",
            url: `leave/get-leave-type-details-for-employee/?employee_id=${profile_data?.id}`,
          }).then((res) => {
            dispatch(setEmployeeLeaveType(res?.data?.data));
          });
        }

        if (keys.type === "2" && keys.employee !== "0") {
          Api({
            type: "GET",
            url: `leave/get-leave-type-details-for-employee/?employee_id=${keys.employee}`,
          }).then((res) => {
            dispatch(setEmployeeLeaveType(res?.data?.data));
          });
        }

        dispatch(setTeamAttendanceReportData(data?.team_attendance_report));

        dispatch(
          setShowTeamTable(
            (keys.type === "2" && keys.employee === "0") || keys.type === "3",
          ),
        );
      } else {
        toast.error(
          attendanceApi?.data?.message ||
            attendanceApi?.data?.detail ||
            "Failed to load attendance report",
        );
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        toast.error("Failed to load attendance report");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setTimeout(() => dispatch(setLoaderVisible(false)), 500);
      }
    }
  };

  // 🔹 Auto filter: debounce filter changes, fetch immediately on page / page size
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      prevFilterKeysRef.current = filterKeys;
      return;
    }

    const onlyPagingChanged = prevFilterKeysRef.current === filterKeys;
    prevFilterKeysRef.current = filterKeys;

    const delay = setTimeout(
      () => handleFilter(filterKeys, page, page_size),
      onlyPagingChanged ? 0 : 500,
    );

    return () => clearTimeout(delay);
  }, [filterKeys, page, page_size]);

  return (
    <Card>
      <CardHeader className="border-0 rounded">
        <Row className="g-2">
          <Col xl={2}>
            <DatePicker
              value={dayjs(filterKeys.thisMonth, MonthFormat)}
              format={MonthFormat}
              picker="month"
              allowClear={false}
              className="form-control"
              onChange={handleDateRangeChange}
            />
          </Col>

          <Col xl={2}>
            <Select
              options={hr_status_options}
              placeholder="Select Status"
              value={hr_status_options.find(
                (d) => d.id === filterKeys.hr_status,
              )}
              onChange={handleHRStatusChange}
            />
          </Col>

          <Col xl={2}>
            <Select
              options={attendanceViewFilter}
              placeholder="Select Type"
              value={attendanceViewFilter.find((d) => d.id === filterKeys.type)}
              onChange={handleTypeChange}
            />
          </Col>

          {showEmployeeSelect && (
            <Col xl={2}>
              <Select
                options={employeeOptions}
                components={{ Option: EmployeeDisplayInSelect }}
                placeholder="Select Employee"
                value={employeeOptions.find(
                  (d) => d.id === filterKeys.employee,
                )}
                onChange={handleEmployeeChange}
              />
            </Col>
          )}
        </Row>
      </CardHeader>
    </Card>
  );
};

export default AttendanceFilter;
