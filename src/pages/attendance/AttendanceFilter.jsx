import React, { useEffect, useState } from "react";
import { Card, CardHeader, Col, Row } from "reactstrap";
import { Api } from "../../common/api/Api";
import {
  MonthFormat,
  hr_status_options,
  record_options,
  attendance_type_options,
} from "../../common/constant/Constants";
import {
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
  VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { DatePicker } from "antd";
import Select from "react-select";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { useDispatch } from "react-redux";
import {
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

  const employee_data = GetLocalStorageData("employee");
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  // 🔹 Permission-based filter
  useEffect(() => {
    console.log("permission_list:", profile_data?.permission_list);

    console.log(
      "VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY:",
      VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY
    );

    console.log(
      "Has Permission:",
      profile_data?.permission_list?.includes(
        VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY
      )
    );
    // if (
    //   profile_data.permission_list.includes(
    //     VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
    //   )
    // ) {
    //   setAttendanceViewFilter(attendance_type_options);
    // } else if (
    //   profile_data.permission_list.includes(VIEW_TEAM_ATTENDANCE_ACCESS_KEY)
    // ) {
    //   setAttendanceViewFilter(
    //     attendance_type_options.filter((d) => d.id !== "3"),
    //   );
    // } else {
    //   setAttendanceViewFilter(
    //     attendance_type_options.filter((d) => d.id === "1"),
    //   );
    // }

    const permissions = profile_data?.permission_list || [];

    let allowedIds = ["1"];

    if (permissions.includes(VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY)) {
      allowedIds = ["1", "2", "3"];
    } else if (permissions.includes(VIEW_TEAM_EMPLOYEE_ACCESS_KEY)) {
      allowedIds = ["1", "2"];
    }
    console.log("attendance_type_options =", attendance_type_options);
    console.log("allowedIds =", allowedIds);
    setAttendanceViewFilter(
      attendance_type_options.filter((d) => allowedIds.includes(d.id))
    );

  }, []);

  // 🔹 Load employees
  useEffect(() => {
    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        const response = res?.data?.data;

        let emp_options = response.map((d) =>
          employee_data.find((e) => e.id === d),
        );

        setEmployeeOptions([
          { id: "0", label: "All", value: "0" },
          ...emp_options,
        ]);
      })
      .catch(() => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  // 🔹 Handlers
  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({ ...prev, thisMonth: monthStr }));
  };

  const handleHRStatusChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, hr_status: e.value }));
  };

  const handleRecordChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, record: e.value }));
  };

  const handleTypeChange = (e) => {
    setFilterKeys((prev) => ({
      ...prev,
      type: e.value,
      employee: "0",
    }));

    setShowEmployeeSelect(e.value === "2");
  };

  const handleEmployeeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, employee: e.value }));
  };

  // 🔹 API Call
  const handleFilter = async () => {
    dispatch(setLoaderVisible(true));

    const attendanceApi = await PostApi(
      "report/get-attendance-report/v2/",
      filterKeys,
      false,
    );

    if (attendanceApi?.status === 200) {
      const data = attendanceApi?.data?.data;

      dispatch(
        setIndividualAttendanceReportData(data?.individual_attendance_report),
      );

      BuildAttendanceReportChart(data?.individual_attendance_report, dispatch);

      // Leave API
      if (filterKeys?.type === "1") {
        Api({
          type: "GET",
          url: `leave/get-leave-type-details-for-employee/?employee_id=${profile_data.id}`,
        }).then((res) => {
          dispatch(setEmployeeLeaveType(res?.data?.data));
        });
      }

      if (filterKeys?.type === "2" && filterKeys?.employee !== "0") {
        Api({
          type: "GET",
          url: `leave/get-leave-type-details-for-employee/?employee_id=${filterKeys.employee}`,
        }).then((res) => {
          dispatch(setEmployeeLeaveType(res?.data?.data));
        });
      }

      dispatch(setTeamAttendanceReportData(data?.team_attendance_report));

      dispatch(
        setShowTeamTable(
          (filterKeys?.type === "2" && filterKeys?.employee === "0") ||
            filterKeys?.type === "3",
        ),
      );

      setTimeout(() => dispatch(setLoaderVisible(false)), 500);
    } else {
      toast.error(attendanceApi?.data?.message || attendanceApi?.data?.detail);
      setTimeout(() => dispatch(setLoaderVisible(false)), 500);
    }
  };

  // 🔹 Auto filter with debounce
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    const delay = setTimeout(() => {
      handleFilter();
    }, 500);

    return () => clearTimeout(delay);
  }, [filterKeys]);

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

          {/* <Col xl={2}>
            <Select
              options={record_options}
              placeholder="Select Record"
              value={record_options.find((d) => d.id === filterKeys.record)}
              onChange={handleRecordChange}
            />
          </Col> */}

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
