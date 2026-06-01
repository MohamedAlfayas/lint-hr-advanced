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
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";
import { toast } from "react-toastify";
const EmployeeAttendance = ({ profileObj, filterKeys, setFilterKeys }) => {
  const dispatch = useDispatch();

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const BuildTable = async (payload) => {
    dispatch(setLoaderVisible(true));

    const Api = await PostApi(
      "report/get-attendance-report/v2/",
      payload,
      false,
    );
    if (Api.status && Api.status === 200) {
      dispatch(
        setIndividualAttendanceReportData(
          Api?.data?.data?.individual_attendance_report,
        ),
      );
      BuildAttendanceReportChart(
        Api?.data?.data?.individual_attendance_report,
        dispatch,
      );
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

  const handleFilter = async () => {
    const final_filter_keys = { ...filterKeys, employee: profileObj?.id };
    BuildTable(final_filter_keys);
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
                              (d) => d.id === filterKeys?.hr_status,
                            )
                          : []
                      }
                      Select
                      onChange={handleHRStatusChange}
                      style={{ width: "150px", height: "40px" }}
                    />
                  </div>
                </Col>
                {/* <Col xl={2}>
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
                </Col> */}

                {/* <div className="col-lg-auto">
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
                </div> */}
              </Row>
            </CardBody>
          </CardHeader>

          <Col xxl={12}>
            <AttendanceOverview />
          </Col>

          <Col xxl={12}>
            <AttendanceEmployeeTable />
          </Col>
        </Card>
      </React.Fragment>
    </div>
  );
};

export default EmployeeAttendance;
