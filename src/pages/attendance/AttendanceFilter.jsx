import React, { useEffect, useState } from "react";
import { Card, CardHeader, Col, Row } from "reactstrap";
import { Api } from "../../common/api/Api";
import {
  MonthFormat,
  hr_status_options,
  record_options,
  attendance_type_options,
} from "../../common/constant/Constants";
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
dayjs.extend(customParseFormat);

const AttendanceFilter = () => {
  const [filterKeys, setFilterKeys] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    hr_status: "0",
    record: "0",
    type: "1",
    employee: "0",
  });

  const dispatch = useDispatch();

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);

  const employee_data = GetLocalStorageData("employee");

  useEffect(() => {
    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        const response = res?.data?.data;
        let emp_options = response.map((d) =>
          employee_data.find((e) => e.id === d)
        );
        console.log("Emp Options = ", emp_options);
        setEmployeeOptions([
          { id: "0", label: "All", value: "0" },
          ...emp_options,
        ]);
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  const handleDateRangeChange = (e, monthStr) => {
    console.log("This Month = ", e);
    console.log("This Month Str = ", monthStr);

    setFilterKeys({
      ...filterKeys,
      thisMonth: monthStr,
    });
  };

  const handleHRStatusChange = (e) => {
    console.log("HR STATUS = ", e);
    setFilterKeys({
      ...filterKeys,
      hr_status: e.value,
    });
  };

  const handleRecordChange = (e) => {
    setFilterKeys({
      ...filterKeys,
      record: e.value,
    });
  };

  const handleTypeChange = (e) => {
    setFilterKeys({
      ...filterKeys,
      type: e.value,
      employee: "0",
    });

    if (e.value === "2") {
      setShowEmployeeSelect(true);
    } else {
      setShowEmployeeSelect(false);
    }
  };

  const handleEmployeeChange = (e) => {
    setFilterKeys({
      ...filterKeys,
      employee: e.value,
    });
  };

  const handleFilter = async () => {
    console.log("FILTER CLICKED !!!! === ", filterKeys);

    dispatch(setLoaderVisible(true));

    const attendanceApi = await PostApi(
      "report/get-attendance-report/",
      filterKeys,
      false
    );
    console.log("API RES = ", attendanceApi);
    if (attendanceApi.status && attendanceApi.status === 200) {
      dispatch(
        setIndividualAttendanceReportData(
          attendanceApi?.data?.data?.individual_attendance_report
        )
      );
      if (filterKeys?.type === "2" && filterKeys?.employee !== "0") {
        Api({
          type: "GET",
          url: `leave/get-leave-type-details-for-employee/?employee_id=${filterKeys?.employee}`,
        })
          .then((res) => {
            console.log(res?.data?.data);
            dispatch(setEmployeeLeaveType(res?.data?.data));
          })
          .catch((err) => {
            console.log("Something Went Worng");
          });
      }
      dispatch(
        setTeamAttendanceReportData(
          attendanceApi?.data?.data?.team_attendance_report
        )
      );
      if (filterKeys?.type === "2" && filterKeys?.employee === "0") {
        dispatch(setShowTeamTable(true));
      } else {
        dispatch(setShowTeamTable(false));
      }
    } else {
      toast.error(attendanceApi?.data?.message || attendanceApi?.data?.detail);
    }

    dispatch(setLoaderVisible(false));
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-0 rounded">
          <Row className="g-2">
            <Col xl={2}>
              <div className="form-icon right">
                <DatePicker
                  value={dayjs(filterKeys?.thisMonth, MonthFormat)}
                  format={MonthFormat}
                  picker="month"
                  allowClear={false}
                  className="form-control"
                  placeholder="Select Month"
                  onChange={handleDateRangeChange}
                />
              </div>
            </Col>
            <Col xl={2}>
              <div className="form-icon right">
                <Select
                  name="status_attendance"
                  id="status_attendance"
                  options={hr_status_options || []}
                  placeholder="Select a Status"
                  value={
                    !!filterKeys?.hr_status
                      ? hr_status_options.find(
                          (d) => d.id === filterKeys?.hr_status
                        )
                      : []
                  }
                  onChange={handleHRStatusChange}
                />
              </div>
            </Col>
            <Col xl={2}>
              <div className="form-icon right">
                <Select
                  name="record_attendance"
                  id="record_attendance"
                  options={record_options || []}
                  placeholder="Select a Record"
                  value={
                    !!filterKeys?.record
                      ? record_options.find((d) => d.id === filterKeys?.record)
                      : []
                  }
                  onChange={handleRecordChange}
                />
              </div>
            </Col>
            <Col xl={2}>
              <div className="form-icon right">
                <Select
                  name="type_attendance"
                  id="type_attendance"
                  options={attendance_type_options || []}
                  placeholder="Select a Type"
                  value={
                    !!filterKeys?.type
                      ? attendance_type_options.find(
                          (d) => d.id === filterKeys?.type
                        )
                      : []
                  }
                  onChange={handleTypeChange}
                />
              </div>
            </Col>
            {showEmployeeSelect && (
              <Col xl={2}>
                <div className="form-icon right">
                  <Select
                    name="employee_attendance"
                    id="employee_attendance"
                    options={employeeOptions || []}
                    components={{ Option: EmployeeDisplayInSelect }}
                    placeholder="Select a Employee"
                    value={
                      !!filterKeys?.employee
                        ? employeeOptions.find(
                            (d) => d.id === filterKeys?.employee
                          )
                        : []
                    }
                    onChange={handleEmployeeChange}
                  />
                </div>
              </Col>
            )}

            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <button
                  type="button"
                  onClick={handleFilter}
                  className="btn btn-danger"
                >
                  <i className="ri-equalizer-fill me-1 align-bottom"></i>{" "}
                  Filters
                </button>
              </div>
            </div>
          </Row>
        </CardHeader>
      </Card>
    </React.Fragment>
  );
};

export default AttendanceFilter;
