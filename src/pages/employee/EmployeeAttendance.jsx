import { DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import {
  MonthFormat,
  hr_status_options,
  record_options,
} from "../../common/constant/Constants";
import AttendanceOverview from "../attendance/AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";
import { useDispatch, useSelector } from "react-redux";
import {
  setIndividualAttendanceReportData,
  setShowTeamTable,
  setTeamAttendanceReportData,
} from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import dayjs from "dayjs";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
const EmployeeAttendance = ({ profileObj }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let updated_filter_keys = {
      ...filterKeys,
      employee: profileObj?.id,
    };
    BuildTable(updated_filter_keys);
    setFilterKeys(updated_filter_keys);
  }, [profileObj]);

  const [filterKeys, setFilterKeys] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    hr_status: "0",
    record: "0",
    type: "2",
    employee: "0",
  });

  const { showTeamTable } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  const BuildTable = async (payload) => {
    dispatch(setLoaderVisible(true));

    const Api = await PostApi("report/get-attendance-report/", payload, false);
    console.log("API RES = ", Api?.data?.data);
    if (Api.status && Api.status === 200) {
      dispatch(
        setIndividualAttendanceReportData(
          Api?.data?.data?.individual_attendance_report
        )
      );
      dispatch(
        setTeamAttendanceReportData(Api?.data?.data?.team_attendance_report)
      );
      if (filterKeys?.type === "2" && filterKeys?.employee === "0") {
        dispatch(setShowTeamTable(true));
      } else {
        dispatch(setShowTeamTable(false));
      }
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    dispatch(setLoaderVisible(false));
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys({
      ...filterKeys,
      thisMonth: monthStr,
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

  const handleFilter = async () => {
    BuildTable(filterKeys);
  };

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
