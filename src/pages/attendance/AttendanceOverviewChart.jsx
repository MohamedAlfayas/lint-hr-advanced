import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";

const AttendanceOverviewChart = ({ dataColors, chartData }) => {
  var chartColumnStacked100Colors = getChartColorsArray(dataColors);
  console.log("Series = ", chartData?.series);
  // const series = [
  //   {
  //     name: "IN Hour",
  //     data: [
  //       8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8,
  //       7, 7.2, 6, 8, 7, 0, 0, 8,
  //     ],
  //   },
  //   {
  //     name: "Balance Hour",
  //     data: [
  //       0, 0, 0.8, 2, 0, 1, 0, 0, 1, 0.8, 2, 0, 1, 0, 0, 1, 0.8, 2, 0, 1, 0, 0,
  //       1, 0.8, 2, 0, 1, 0, 0, 0,
  //     ],
  //   },
  //   {
  //     name: "Holiday",
  //     data: [
  //       0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0,
  //       0, 0, 0, 8, 0, 0,
  //     ],
  //   },
  //   {
  //     name: "Leave",
  //     data: [
  //       0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //       0, 0, 0, 0, 8, 0,
  //     ],
  //   },
  //   {
  //     name: "Weekend",
  //     data: [
  //       0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //       0, 0, 0, 0, 8, 0,
  //     ],
  //   },
  // ];

  const options = {
    chart: {
      stacked: !0,
      stackType: "100%",
      toolbar: {
        show: !1,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: true,
      followCursor: false,

      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          return value + " Hr";
        },
      },
    },
    dataLabels: {
      enabled: true,
      //offsetX: 0,

      formatter: function (value, { seriesIndex, dataPointIndex, w }) {
        // console.log(value);
        // console.log(dataPointIndex);
        // console.log(seriesIndex);
        // console.log(w.config.series[seriesIndex]);
        if (value != 0) {
          let text =
            w.config.series[seriesIndex].name == "IN Hour"
              ? "IN"
              : w.config.series[seriesIndex].name == "Balance Hour"
              ? "B"
              : w.config.series[seriesIndex].name == "Holiday"
              ? "H"
              : w.config.series[seriesIndex].name == "Leave"
              ? "L"
              : w.config.series[seriesIndex].name == "Weekend"
              ? "WF"
              : "";

          return text;
        }
        return "";
        //return w.config.series[seriesIndex].name + ":  " + value;
      },
    },
    legend: {
      position: "bottom",
      offsetY: -15,
      itemMargin: {
        horizontal: 5,
        vertical: 0,
      },
    },
    colors: chartColumnStacked100Colors,
  };

  return (
    <ReactApexChart
      dir="ltr"
      className="apex-charts"
      series={chartData.series}
      options={options}
      type="bar"
      height={250}
    />
  );
};

export { AttendanceOverviewChart };
