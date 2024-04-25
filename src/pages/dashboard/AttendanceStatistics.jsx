import React, { useState, useEffect } from "react";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

import ReactApexChart from "react-apexcharts";
import Select from "react-select";
import {
  VIEW_ALL_ATTENDANCE_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  employeeTypeOptions,
} from "../../common/constant/Constants";
import {
  setAllMembersTodaysAttendanceAsCurrent,
  setTeamTodaysAttendanceAsCurrent,
} from "../../redux/reducers/ChildReducer/TeamTodaysAttendanceReducer";
import { Api } from "../../common/api/Api";
import { setDashboardAttendanceStasticsType } from "../../redux/reducers/ChildReducer/DashboardAttendanceStasticsReducer";
import { setTeamAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const AttendanceStatistics = () => {
  const dispatch = useDispatch();

  const [chartData, setchartData] = useState([]);

  const [checkedInData, setCheckedInData] = useState([]);
  const [notCheckedInData, setNotCheckedInData] = useState([]);
  const [onLeaveData, setOnLeaveData] = useState([]);
  const [checkedOutData, setCheckedOutData] = useState([]);
  const [employeeType, setEmployeeType] = useState(1);

  const [checkedInPer, setCheckedInPer] = useState(0);
  const [notCheckedInPer, setNotCheckedInPer] = useState(0);
  const [onLeavePer, setOnLeavePer] = useState(0);
  const [checkedOutPer, setCheckedOutPer] = useState(0);

  const { dashboard_attendance_stastics_type } = useSelector(
    (state) => state.DashboardAttendanceStasticsReducer
  );

  const onAttStasticsTypeChange = (pType, val) => {
    dispatch(setDashboardAttendanceStasticsType(pType));

    val === 0
      ? dispatch(setAllMembersTodaysAttendanceAsCurrent())
      : dispatch(setTeamTodaysAttendanceAsCurrent());
  };

  const { currently_displaying_todays_attendance } = useSelector(
    (state) => state.TeamTodaysAttendanceReducer
  );

  const [showTeamAttendance, setShowTeamAttendance] = useState(false);
  const [showAllAttendance, setShowAllAttendance] = useState(false);

  useEffect(() => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data")
    );
    if (
      profile_data.permission_list.includes(VIEW_TEAM_ATTENDANCE_ACCESS_KEY) &&
      profile_data.permission_list.includes(VIEW_ALL_ATTENDANCE_ACCESS_KEY)
    ) {
      setShowAllAttendance(true);
      setShowTeamAttendance(true);
    }
  }, []);

  useEffect(() => {
    let ch_in_data = [];
    let not_ch_in_data = [];
    let ol_data = [];
    let ch_out_data = [];

    if (
      !!currently_displaying_todays_attendance &&
      currently_displaying_todays_attendance?.length
    ) {
      currently_displaying_todays_attendance.map((d) => {
        if (d.is_present === true) {
          if (d.currently_checked_in) {
            ch_in_data.push(d);
          } else {
            ch_out_data.push(d);
          }
        } else if (d.is_leave_approved === true) {
          ol_data.push(d);
        } else {
          not_ch_in_data.push(d);
        }
      });

      setCheckedInData(ch_in_data);
      setNotCheckedInData(not_ch_in_data);
      setOnLeaveData(ol_data);
      setCheckedOutData(ch_out_data);

      setCheckedInPer(
        Math.round(
          (parseInt(ch_in_data?.length) /
            parseInt(currently_displaying_todays_attendance.length)) *
            100
        )
      );

      setNotCheckedInPer(
        Math.round(
          (parseInt(not_ch_in_data?.length) /
            parseInt(currently_displaying_todays_attendance.length)) *
            100
        )
      );

      setOnLeavePer(
        Math.round(
          (parseInt(ol_data?.length) /
            parseInt(currently_displaying_todays_attendance.length)) *
            100
        )
      );

      setCheckedOutPer(
        Math.round(
          (parseInt(ch_out_data?.length) /
            parseInt(currently_displaying_todays_attendance.length)) *
            100
        )
      );
    }
  }, [currently_displaying_todays_attendance]);

  const getChartColorsArray = (colors) => {
    colors = JSON.parse(colors);
    return colors.map(function (value) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(
          newValue
        );

        if (color.indexOf("#") !== -1) color = color.replace(" ", "");
        if (color) return color;
        else return newValue;
      } else {
        var val = value.split(",");
        if (val.length === 2) {
          var rgbaColor = getComputedStyle(
            document.documentElement
          ).getPropertyValue(val[0]);
          rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  };

  var donutchartportfolioColors = getChartColorsArray(
    '["--vz-success", "--vz-danger", "--vz-info", "--vz-warning"]'
  );

  const defaultOption = employeeTypeOptions.find((option) => option.id === 1);
  var options = {
    labels: ["Checked In", "Not Checked In", "On Leave", "Checked Out"],
    chart: {
      type: "donut",
      height: 224,
    },

    plotOptions: {
      pie: {
        size: 100,
        offsetX: 0,
        offsetY: 0,
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "18px",
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: "20px",
              color: "#343a40",
              fontWeight: 500,
              offsetY: 5,
              formatter: function (val) {
                return val + "%";
              },
            },
            total: {
              show: true,
              fontSize: "13px",
              label: "Total Employee",
              color: "#9599ad",
              fontWeight: 500,
              formatter: function (w) {
                return (
                  w.globals.seriesTotals.reduce(function (a, b) {
                    return a + b;
                  }, 0) + "%"
                );
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
    },
    stroke: {
      lineCap: "round",
      width: 2,
    },
    colors: donutchartportfolioColors,
  };

  return (
    <React.Fragment>
      <Col xxl={12} xl={12} sm={12}>
        <div className="card card-height-100">
          <div className="card-header border-0 align-items-center d-flex">
            <Col xxxl={6} xl={6} sm={6} className="d-flex align-items-center">
              <h4 className="card-title mb-0 flex-grow-1">
                Attendance Statistics
              </h4>
            </Col>
            <Col
              xxxl={6}
              xl={6}
              sm={6}
              className="d-flex align-items-center justify-content-end"
            >
              <div className="flex-shrink-0">
                {showAllAttendance && showTeamAttendance ? (
                  <UncontrolledDropdown className="card-header-dropdown">
                    <DropdownToggle
                      tag="a"
                      className="text-reset dropdown-btn"
                      role="button"
                    >
                      <span className="fw-semibold fs-12">
                        {dashboard_attendance_stastics_type}
                      </span>
                      <span className="text-muted">
                        <i className="mdi mdi-chevron-down ms-1"></i>
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      {showAllAttendance && (
                        <DropdownItem
                          onClick={() => {
                            onAttStasticsTypeChange("All", 0);
                          }}
                        >
                          All
                        </DropdownItem>
                      )}

                      {showTeamAttendance && (
                        <DropdownItem
                          onClick={() => {
                            onAttStasticsTypeChange("My Team", 1);
                          }}
                        >
                          My Team
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : null}
              </div>
            </Col>
          </div>
          {/* <div style={{ marginLeft: "10px", width: "50%" }}>
            {" "}
            <Select
              id="emp_type"
              name="Employee Type"
              isMulti={false}
              options={employeeTypeOptions || []}
              className="basic-multi-select"
              value={
                employeeTypeOptions.find((d) => d.id === employeeType) ||
                employeeTypeOptions[1]
              }
              onChange={handleEmployeeTypeChange}
            />
          </div> */}

          <div className="card-body">
            <ReactApexChart
              dir="ltr"
              options={options}
              series={[
                checkedInPer,
                notCheckedInPer,
                onLeavePer,
                checkedOutPer,
              ]}
              type="donut"
              height="224"
              className="apex-charts"
            />

            <ul className="list-group list-group-flush border-dashed mb-0 mt-3 pt-2">
              <li className="list-group-item px-0">
                <div className="d-flex">
                  <div className="flex-shrink-0 avatar-xs">
                    <span className="avatar-title bg-success p-1 rounded-circle">
                      <i
                        className=" img-fluid mdi mdi-progress-check align-middle fs-4"
                        style={{ marginTop: "2px" }}
                      ></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-1">Checked In</h6>
                    <p className="fs-12 mb-0 text-muted">
                      <i className="mdi mdi-circle fs-10 align-middle text-primary me-1"></i>
                      Male :{" "}
                      {checkedInData.filter((d) => d.gender === 1).length} /
                      Female :{" "}
                      {checkedInData.filter((d) => d.gender === 2).length}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">{checkedInData?.length}</h6>
                    <p className="text-success fs-12 mb-0">{checkedInPer}%</p>
                  </div>
                </div>
              </li>
              <li className="list-group-item px-0">
                <div className="d-flex">
                  <div className="flex-shrink-0 avatar-xs">
                    <span className="avatar-title bg-danger p-1 rounded-circle">
                      <i
                        className=" img-fluid mdi mdi-progress-alert fs-4 align-middle"
                        style={{ marginTop: "2px" }}
                      ></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-1">Not Checked In</h6>
                    <p className="fs-12 mb-0 text-muted">
                      <i className="mdi mdi-circle fs-10 align-middle text-info me-1"></i>
                      Male :{" "}
                      {notCheckedInData.filter((d) => d.gender === 1).length} /
                      Female :{" "}
                      {notCheckedInData.filter((d) => d.gender === 2).length}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">{notCheckedInData?.length}</h6>
                    <p className="text-danger fs-12 mb-0">{notCheckedInPer}%</p>
                  </div>
                </div>
              </li>
              <li className="list-group-item px-0">
                <div className="d-flex">
                  <div className="flex-shrink-0 avatar-xs">
                    <span className="avatar-title bg-info p-1 rounded-circle">
                      <i
                        className=" img-fluid mdi mdi-umbrella-beach-outline fs-4 align-middle"
                        style={{ marginTop: "2px" }}
                      ></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-1">On Leave</h6>
                    <p className="fs-12 mb-0 text-muted">
                      <i className="mdi mdi-circle fs-10 align-middle text-warning me-1"></i>
                      Male : {onLeaveData.filter((d) => d.gender === 1).length}{" "}
                      / Female :{" "}
                      {onLeaveData.filter((d) => d.gender === 2).length}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">{onLeaveData?.length}</h6>
                    <p className="text-success fs-12 mb-0">{onLeavePer}%</p>
                  </div>
                </div>
              </li>
              <li className="list-group-item px-0 pb-0">
                <div className="d-flex">
                  <div className="flex-shrink-0 avatar-xs">
                    <span className="avatar-title bg-warning p-1 rounded-circle">
                      <i
                        className=" img-fluid mdi mdi-progress-close fs-4 align-middle"
                        style={{ marginTop: "2px" }}
                      ></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-1">Checked Out</h6>
                    <p className="fs-12 mb-0 text-muted">
                      <i className="mdi mdi-circle fs-10 align-middle text-success me-1"></i>
                      Male :{" "}
                      {checkedOutData.filter((d) => d.gender === 1).length} /
                      Female :{" "}
                      {checkedOutData.filter((d) => d.gender === 2).length}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">{checkedOutData?.length}</h6>
                    <p className="text-success fs-12 mb-0">{checkedOutPer}%</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Col>
    </React.Fragment>
  );
};

export default AttendanceStatistics;
