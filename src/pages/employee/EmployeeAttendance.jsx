import { DatePicker } from "antd";
import React, { useEffect, useRef, useState } from "react";
import Select from "../../shared/ui/TestableSelect";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import {
  MonthFormat,
  hr_status_options,
} from "../../common/constant/Constants";
import AttendanceOverview from "../attendance/AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";
import { useDispatch, useSelector } from "react-redux";
import { setIndividualAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
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

  const handleDateRangeChange = (date) => {
    if (!date) return;
    setFilterKeys({
      ...filterKeys,
      thisMonth: date.format(MonthFormat),
    });
  };

  const handleHRStatusChange = (e) => {
    setFilterKeys({
      ...filterKeys,
      hr_status: e.value,
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

  const { attendanceRefreshTick } = useSelector(
    (state) => state.AttendanceReportReducer,
  );
  const lastRefreshTickRef = useRef(attendanceRefreshTick);
  useEffect(() => {
    if (attendanceRefreshTick === lastRefreshTickRef.current) return;
    lastRefreshTickRef.current = attendanceRefreshTick;
    handleFilter();
  }, [attendanceRefreshTick]);

  return (
    <div className="emp-attendance">
      <React.Fragment>
        <Card>
          <CardHeader className="border-0 rounded">
            <CardBody className="pb-2">
              <Row className="g-2 emp-attendance-filters align-items-end">
                <Col xs={12} sm={6} md={4} lg={3} xl={3}>
                  <label className="emp-attendance-label" htmlFor="emp-att-month">
                    Month
                  </label>
                  <DatePicker
                    id="emp-att-month"
                    value={dayjs(filterKeys?.thisMonth, MonthFormat)}
                    format="MMM YYYY"
                    picker="month"
                    allowClear={false}
                    className="emp-attendance-picker w-100"
                    placeholder="Select Month"
                    onChange={handleDateRangeChange}
                    data-testid="employee-attendance-month-input"
                  />
                </Col>
                <Col xs={12} sm={6} md={4} lg={3} xl={3}>
                  <label
                    className="emp-attendance-label"
                    htmlFor="status_attendance"
                  >
                    Status
                  </label>
                  <Select
                    name="status_attendance"
                    id="status_attendance"
                    testId="employee-attendance-status-filter"
                    className="emp-attendance-select"
                    classNamePrefix="emp-att-rs"
                    options={hr_status_options || []}
                    placeholder="Select a Status"
                    value={
                      filterKeys?.hr_status
                        ? hr_status_options.find(
                            (d) => d.id === filterKeys?.hr_status,
                          )
                        : null
                    }
                    onChange={handleHRStatusChange}
                    isSearchable={false}
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 1600 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 38,
                        borderRadius: 10,
                      }),
                    }}
                  />
                </Col>
              </Row>
            </CardBody>
          </CardHeader>

          <div className="px-3 px-md-4">
            <AttendanceOverview />
          </div>

          <div className="px-3 px-md-4 pb-3">
            <AttendanceEmployeeTable />
          </div>
        </Card>

        <style>{`
          .emp-attendance-label{
            display:block;font-size:.66rem;font-weight:600;text-transform:uppercase;
            letter-spacing:.6px;color:var(--vz-secondary-color);margin-bottom:5px;padding-left:2px;
          }
          .emp-attendance-picker.ant-picker{
            width:100%;min-height:38px;border-radius:10px;
            padding-inline:12px 10px;
          }
          .emp-attendance-picker .ant-picker-input{min-width:0}
          .emp-attendance-picker .ant-picker-input > input{
            font-size:.85rem;font-weight:600;min-width:0;
            overflow:visible;text-overflow:clip;
          }
          .emp-attendance-select .emp-att-rs__control{
            min-height:38px;border-radius:10px;border-color:var(--vz-border-color);
            background:var(--vz-secondary-bg);box-shadow:none;cursor:pointer;
          }
          .emp-attendance-select .emp-att-rs__single-value{
            font-size:.85rem;font-weight:500;color:var(--vz-heading-color);
            max-width:100%;overflow:visible;text-overflow:clip;white-space:nowrap;
          }
          .emp-attendance-select .emp-att-rs__indicator-separator{display:none}
          .emp-attendance-select .emp-att-rs__value-container{overflow:visible}
          @media (max-width:575.98px){
            .emp-attendance-filters > [class*="col-"]{flex:0 0 100%;max-width:100%}
          }
        `}</style>
      </React.Fragment>
    </div>
  );
};

export default EmployeeAttendance;
