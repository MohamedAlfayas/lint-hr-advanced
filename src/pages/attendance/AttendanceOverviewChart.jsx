import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";

const SHORT_LABELS = {
  "IN Hour": "IN",
  Pending: "P",
  Holiday: "H",
  Leave: "L",
  Weekend: "WO",
  Absent: "A",
  Break: "BR",
  Permission: "PER",
  "Half Day": "HDL",
};

// Narrow bars when only a few days are shown, so they don't stretch edge to edge.
const columnWidthFor = (count) => {
  if (count <= 2) return "22%";
  if (count <= 4) return "32%";
  if (count <= 7) return "45%";
  return "60%";
};

const AttendanceOverviewChart = ({ dataColors, chartData }) => {
  const isDark = useSelector(
    (state) => state.LayoutReducer?.layoutModeType === "dark",
  );

  const allColors = useMemo(() => getChartColorsArray(dataColors), [dataColors]);

  // Drop series with no values (keeps the legend to what's actually shown);
  // colours are filtered alongside so each series keeps its own colour.
  const { series, colors } = useMemo(() => {
    const src = chartData?.series || [];
    const keep = src
      .map((s, i) => ({ s, color: allColors?.[i] }))
      .filter(({ s }) => (s.data || []).some((v) => Number(v) > 0));
    return {
      series: keep.map(({ s }) => s),
      colors: keep.map(({ color }) => color),
    };
  }, [chartData, allColors]);

  const options = useMemo(() => {
    const muted = isDark ? "#878a99" : "#74788d";
    const grid = isDark ? "rgba(255,255,255,0.08)" : "#eef0f4";
    const rawCategories = chartData?.categories || [];
    const dense = rawCategories.length > 10;
    // dense: ["Sat", "01 Aug"] -> ["01", "Sa"] so a month fits without overlap
    const categories = dense
      ? rawCategories.map((c) =>
          Array.isArray(c) ? [String(c[1] || "").slice(0, 2), String(c[0] || "").slice(0, 2)] : c,
        )
      : rawCategories;
    const fullLabel = (i) => {
      const c = rawCategories[i];
      return Array.isArray(c) ? `${c[0]}, ${c[1]}` : c;
    };

    return {
      chart: {
        stacked: true,
        stackType: "100%",
        toolbar: { show: false },
        fontFamily: "'Poppins', sans-serif",
        foreColor: muted,
        background: "transparent",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 80 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      plotOptions: {
        bar: {
          columnWidth: columnWidthFor(categories.length),
          borderRadius: dense ? 4 : 6,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last",
        },
      },
      stroke: {
        show: true,
        width: dense ? 1 : 2,
        colors: [isDark ? "#212529" : "#ffffff"],
      },
      grid: {
        borderColor: grid,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: -8, left: 8, right: 8, bottom: 0 },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: true,
          style: { colors: muted, fontSize: dense ? "10.5px" : "11.5px", fontWeight: 500 },
        },
      },
      yaxis: { show: false },
      fill: { opacity: 1 },
      states: {
        hover: { filter: { type: "darken", value: 0.9 } },
        active: { filter: { type: "none" } },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        shared: false,
        intersect: true,
        followCursor: false,
        x: { formatter: (_value, { dataPointIndex }) => fullLabel(dataPointIndex) },
        y: {
          formatter: (value) => `${value} Hr`,
        },
      },
      dataLabels: {
        enabled: !dense,
        style: {
          fontSize: "10.5px",
          fontWeight: 700,
          colors: ["#ffffff"],
        },
        dropShadow: { enabled: false },
        formatter: (value, { seriesIndex, w }) =>
          value ? SHORT_LABELS[w.config.series[seriesIndex].name] || "" : "",
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        fontWeight: 500,
        offsetY: 4,
        labels: { colors: muted },
        markers: { width: 9, height: 9, radius: 12, strokeWidth: 0, offsetX: -3 },
        itemMargin: { horizontal: 10, vertical: 4 },
      },
      responsive: [
        {
          breakpoint: 576,
          options: {
            plotOptions: { bar: { columnWidth: "55%" } },
            legend: { fontSize: "11px", itemMargin: { horizontal: 6, vertical: 2 } },
          },
        },
      ],
      colors,
    };
  }, [colors, chartData, isDark]);

  return (
    <ReactApexChart
      dir="ltr"
      className="apex-charts"
      series={series}
      options={options}
      type="bar"
      height={270}
    />
  );
};

export { AttendanceOverviewChart };
