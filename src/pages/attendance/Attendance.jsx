import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from "reactstrap";

import { MetaTitle } from "../../common/data/MetaTitle";
import Select from "react-select";
import TimeTracking from "./TimeTracking";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";
import {
  hr_status_options,
  record_options,
  type_options,
} from "../../common/constant/Constants";
import AttendanceTeamTable from "../../component/common/table/AttendanceTeamTable";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { Api } from "../../common/api/Api";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
dayjs.extend(customParseFormat);

const monthFormat = "YYYY-MM";

const AttendanceDashboard = () => {
  document.title = `Attendance Overview | ${MetaTitle}`;

  const dispatch = useDispatch();

  const [filterKeys, setFilterKeys] = useState({
    date_range: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    hr_status: "0",
    record: "0",
    type: "1",
    employee: "0",
  });

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showTeamTable, setShowTeamTable] = useState(false);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);

  const employee_data = GetLocalStorageData("employee");

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    Api({
      type: "GET",
      url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setAttendanceReportData(res?.data?.data));
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });

    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        console.log("EMP ID LIST = ", res?.data?.data);
        const response = res?.data?.data;
        setEmployeeOptions(
          response.map((d) => employee_data.find((e) => e.id === d))
        );
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
      date_range: monthStr,
    });
  };

  const handleHRStatusChange = (e) => {
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
      employee: 0,
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

  const handleFilter = () => {
    console.log("FILTER CLICKED !!!! === ", filterKeys);
    if (filterKeys?.type === "2" && filterKeys?.employee === "0") {
      setShowTeamTable(true);
    } else {
      setShowTeamTable(false);
    }
  };

  const EmployeeDisplayOption = ({ innerProps, label, data }) => (
    <div {...innerProps}>
      {data?.profile_url ? (
        <div className="flex-shrink-0">
          <img
            src={data.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          className="avatar-xs rounded-circle"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#0ab39c",
          }}
          data-bs-toggle="tooltip"
          title={data.fname}
        >
          <span className="first_letter" style={{ color: "white" }}>
            {data.fname.charAt(0)}
          </span>
        </div>
      )}

      {label}
    </div>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Filter Card Start */}
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2">
                <Col xl={2}>
                  <div className="form-icon right">
                    <DatePicker
                      defaultValue={dayjs(filterKeys?.date_range, monthFormat)}
                      format={monthFormat}
                      picker="month"
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
                          ? record_options.find(
                              (d) => d.id === filterKeys?.record
                            )
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
                      options={type_options || []}
                      placeholder="Select a Type"
                      value={
                        !!filterKeys?.type
                          ? type_options.find((d) => d.id === filterKeys?.type)
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
                        components={{ Option: EmployeeDisplayOption }}
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
          {/* Filter Card End */}

          <Row className="project-wrapper">
            <Col xxl={3} xl={3} sm={3}>
              <TimeTracking />
            </Col>
            <Col xxl={9} xl={9} sm={9}>
              <AttendanceOverview />
            </Col>
            {!showTeamTable && (
              <Col xxl={12}>
                <AttendanceEmployeeTable />
              </Col>
            )}
            {showTeamTable && (
              <Col xxl={12}>
                <AttendanceTeamTable />
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AttendanceDashboard;
