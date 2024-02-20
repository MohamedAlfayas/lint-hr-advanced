import { DatePicker } from "antd";
import React, { useEffect } from "react";
import Select from "react-select";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import {
  MonthFormat,
  hr_status_options,
  record_options,
  attendance_type_options,
} from "../../common/constant/Constants";
import AttendanceOverview from "../attendance/AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";

const EmployeeAttendance = (props) => {
  const { profileObj } = props;
  useEffect(() => {
    if (
      thisEmployeeData !== undefined &&
      thisEmployeeData !== null &&
      Object.keys(thisEmployeeData).length > 0
    ) {
      let updated_filter_keys = {
        ...filterKeys,
        employee: profileObj?.id,
      };

      BuildTable(updated_filter_keys);

      setFilterKeys(updated_filter_keys);
    } else {
      navigate("/404");
    }
  }, []);
  return (
    <div>
      <React.Fragment>
        <Card>
          <CardHeader className="border-0 rounded">
            <CardBody>
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
                      Select
                      onChange={handleHRStatusChange}
                      style={{ width: "150px", height: "40px" }}
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
                      style={{ width: "150px", height: "40px" }}
                    />
                  </div>
                </Col>

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
            </CardBody>
          </CardHeader>
          {!showTeamTable && (
            <Col xxl={12}>
              <AttendanceOverview />
            </Col>
          )}
          {!showTeamTable && (
            <Col xxl={12}>
              <AttendanceEmployeeTable />
            </Col>
          )}
        </Card>
      </React.Fragment>
    </div>
  );
};

export default EmployeeAttendance;
