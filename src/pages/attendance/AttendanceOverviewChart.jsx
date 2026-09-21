import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";


const AttendanceOverviewChart = ({ dataColors, chartData }) => {
  console.log("DATA",chartData);
  
  const chartColumnStacked100Colors = useMemo(
    () => getChartColorsArray(dataColors),
    [dataColors]
  );

  const options = useMemo(
    () => ({
      chart: {
        stacked: !0,
        stackType: "100%",
        toolbar: {
          show: false,
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

        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
          if (value != 0) {
            let text =
              w.config.series[seriesIndex].name == "IN Hour"
                ? "IN"
                : w.config.series[seriesIndex].name == "Pending"
                ? "P"
                : w.config.series[seriesIndex].name == "Holiday"
                ? "H"
                : w.config.series[seriesIndex].name == "Leave"
                ? "L"
                : w.config.series[seriesIndex].name == "Weekend"
                ? "WO"
                : w.config.series[seriesIndex].name == "Absent"
                ? "A"
                : w.config.series[seriesIndex].name == "Break"
                ? "BR"
                : w.config.series[seriesIndex].name == "Permission"
                ? "PER"
                : w.config.series[seriesIndex].name == "Half Day"
                ? "HDL"
                : "";

            return text;
          }
          return "";
          //return w.config.series[seriesIndex].name + ":  " + value;
        },
      },
      legend: {
        position: "bottom",
        offsetY: 0,
        itemMargin: {
          top: 5,
          horizontal: 5,
          vertical: 0,
        },
      },
      colors: chartColumnStacked100Colors,
    }),
    [chartColumnStacked100Colors, chartData]
  );

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
