import React, { useState, useEffect } from "react";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

//import Images
import btc from "../../assets/images/svg/crypto-icons/btc.svg";
import eth from "../../assets/images/svg/crypto-icons/eth.svg";
import ltc from "../../assets/images/svg/crypto-icons/ltc.svg";
import dash from "../../assets/images/svg/crypto-icons/dash.svg";

import { createSelector } from "reselect";
import ReactApexChart from "react-apexcharts";

const AttendanceStatistics = () => {
  const dispatch = useDispatch();

  const [chartData, setchartData] = useState([]);

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
                return "$" + val;
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
                  "$" +
                  w.globals.seriesTotals.reduce(function (a, b) {
                    return a + b;
                  }, 0)
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
          return "$" + value;
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
            <h4 className="card-title mb-0 flex-grow-1">
              Attendance Statistics
            </h4>
          </div>
          <div className="card-body">
            <ReactApexChart
              dir="ltr"
              options={options}
              series={[44, 55, 41, 17]}
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
                      Male : 15 / Female : 10
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">25</h6>
                    <p className="text-success fs-12 mb-0">25% </p>
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
                      Male : 22 / Female : 8
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">30</h6>
                    <p className="text-danger fs-12 mb-0">30%</p>
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
                      Male : 2 / Female : 3
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1">5</h6>
                    <p className="text-success fs-12 mb-0">5%</p>
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
                      Male : 31 / Female : 9
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h6 className="mb-1"> 40</h6>
                    <p className="text-success fs-12 mb-0">40%</p>
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
