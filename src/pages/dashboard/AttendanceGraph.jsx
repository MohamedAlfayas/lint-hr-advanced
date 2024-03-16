import React from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts/core";

import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";
import ReactApexChart from "react-apexcharts";

const AttendanceGraph = () => {
  var dataColors = '["--vz-success", "--vz-warning"]';
  var PopularityChartColors = getChartColorsArray(dataColors);
  var chartBarColors = getChartColorsArray(dataColors);

  const series = [
    {
      name: "Like",
      data: [
        8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8,
        7, 7.2, 6, 8, 7, 0, 0, 8,
      ],
    },
    {
      name: "Share",
      data: [
        8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8,
        7, 7.2, 6, 8, 7, 0, 0, 8,
      ],
    },
  ];

  var option = {
    grid: {
      left: "0%",
      right: "0%",
      bottom: "0%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: {
        lineStyle: {
          color: "#858d98",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#858d98",
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(133, 141, 152, 0.1)",
        },
      },
    },
    textStyle: {
      fontFamily: "Poppins, sans-serif",
    },
    color: chartBarColors,
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.2)",
        },
      },
    ],
  };

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "20%",
        borderRadius: [4, 4],
      },
    },
    dataLabels: {
      enabled: false,
      textAnchor: "top",
    },
    colors: PopularityChartColors,

    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    yaxis: {
      labels: {
        show: false,
        formatter: function (y) {
          return y.toFixed(0) + "%";
        },
      },
    },
    xaxis: {
      categories: [
        "Jan 1",
        "Jan 2",
        "Jan 3",
        "Jan 4",
        "Jan 5",
        "Jan 6",
        "Jan 7",
        "Jan 8",
        "Jan 9",
        "Jan 10",
        "Jan 11",
        "Jan 12",
        "Jan 13",
        "Jan 14",
        "Jan 15",
        "Jan 16",
        "Jan 17",
        "Jan 18",
        "Jan 19",
        "Jan 20",
        "Jan 21",
        "Jan 22",
        "Jan 23",
        "Jan 24",
        "Jan 25",
        "Jan 26",
        "Jan 27",
        "Jan 28",
        "Jan 29",
        "Jan 30",
      ],
      labels: {
        rotate: -90,
      },
    },
  };

  return (
    <React.Fragment>
      <Col xxl={12}>
        <Card className="h-100">
          <CardHeader className="border-0 pb-0">
            <h6 className="card-title mb-0">Employee Attendance Trend</h6>
          </CardHeader>
          <div>
            <ReactEcharts
              style={{ height: "350px" }}
              className="p-3"
              option={option}
            />
          </div>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default AttendanceGraph;
