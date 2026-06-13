import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import getChartColorsArray from "../../../component/common/dynamicColor/ChartsDynamicColor";

// ─────────────────────────────────────────────
// RADIAL SCORE CHART
// ─────────────────────────────────────────────
const GradientCircleRadialbar = ({ dataColors, percentage }) => {
  const chartColors = getChartColorsArray(dataColors);

  const series = [percentage ?? 0];

  const options = {
    chart: {
      height: 320,
      type: "radialBar",
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: { size: "70%" },
        track: { strokeWidth: "67%" },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            color: "#878a99",
            fontSize: "16px",
          },
          value: {
            show: true,
            fontSize: "34px",
            fontWeight: 600,
            formatter: function (val) {
              return `${parseInt(val)}%`;
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: chartColors,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Completed"],
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height={320}
      className="apex-charts"
    />
  );
};

// ─────────────────────────────────────────────
// DONUT TASK CHART
// ─────────────────────────────────────────────
const UsersByDeviceCharts = ({ dataColors, series, labels, colors }) => {
  const chartColors = colors?.length ? colors : getChartColorsArray(dataColors);

  const options = {
    labels: labels || [],
    chart: { type: "donut", height: 220 },
    plotOptions: { pie: { donut: { size: "76%" } } },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    colors: chartColors,
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="donut"
      height={220}
      className="apex-charts"
    />
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const ProjectOverview = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [taskStatusDetails, setTaskStatusDetails] = useState(null);
  const [taskStatusRows, setTaskStatusRows] = useState([]);
  const [donutSeries, setDonutSeries] = useState([]);
  const [donutLabels, setDonutLabels] = useState([]);
  const [donutColors, setDonutColors] = useState([]);

  // ✅ Subscribe to Redux — when TaskListForm / TaskDetailModal dispatches
  // editProject after a task save, this selector fires and the useMemo below
  // picks up the updated task_status_details with zero extra API calls.
  const { project_data } = useSelector((state) => state.ProjectsReducer);

  // ✅ Find this project in Redux store reactively
  const reduxProject = useMemo(
    () => project_data?.find((p) => Number(p.id) === Number(projectId)),
    [project_data, projectId],
  );

  // ─────────────────────────────────────────
  // SHARED: build chart/table data from task_status_details
  // Called both on initial API fetch and when Redux project updates.
  // ─────────────────────────────────────────
  const processTaskStatusDetails = (details) => {
    if (!details) return;

    setTaskStatusDetails(details);

    const taskStatusList = GetLocalStorageData("task_status") || [];
    const statusCounts = details.status_counts || {};

    const rows = [];
    const series = [];
    const labels = [];
    const colors = [];

    Object.entries(statusCounts).forEach(([statusId, count]) => {
      const matched = taskStatusList.find(
        (s) => String(s.id) === String(statusId),
      );

      if (matched) {
        rows.push({
          id: matched.id,
          name: matched.name,
          category: matched.category,
          color: matched.color || "#808080",
          count,
        });
        series.push(count);
        labels.push(matched.name);
        colors.push(matched.color || "#808080");
      } else {
        rows.push({
          id: statusId,
          name: `Status ${statusId}`,
          category: "unknown",
          color: "#808080",
          count,
        });
        series.push(count);
        labels.push(`Status ${statusId}`);
        colors.push("#808080");
      }
    });

    setTaskStatusRows(rows);
    setDonutSeries(series);
    setDonutLabels(labels);
    setDonutColors(colors);
  };

  // ─────────────────────────────────────────
  // INITIAL LOAD — fetch project detail from API once on mount
  // ─────────────────────────────────────────
  useEffect(() => {
    if (projectId) {
      fetchProjectDetail();
      fetchProjectMembers();
    }
  }, [projectId]);

  const fetchProjectDetail = async () => {
    try {
      const response = await GetApi(
        `/projects/get-project-detail/${projectId}`,
      );
      const data = response?.data?.data;

      if (data?.task_status_details) {
        processTaskStatusDetails(data.task_status_details);
      }
    } catch (error) {
      console.log("Error fetching project detail", error);
    }
  };

  // ─────────────────────────────────────────
  // ✅ REACTIVE UPDATE — when Redux project changes (after task save),
  // rebuild chart data immediately without any API call.
  // ─────────────────────────────────────────
  useEffect(() => {
    if (reduxProject?.task_status_details) {
      processTaskStatusDetails(reduxProject.task_status_details);
    }
  }, [reduxProject]);

  // ─────────────────────────────────────────
  // FETCH MEMBERS
  // ─────────────────────────────────────────
  const fetchProjectMembers = async () => {
    try {
      const response = await GetApi("/task/");
      const allTasks = response?.data?.data || [];

      const projectTasks = allTasks.filter(
        (item) =>
          item?.related_to === "project" &&
          Number(item?.project) === Number(projectId),
      );

      const collaboratorIds = [
        ...new Set(
          projectTasks.flatMap((task) => task?.collaborators_id_list || []),
        ),
      ];

      const employeeData = GetLocalStorageData("employee") || [];

      const matchedEmployees = employeeData
        .filter((emp) => collaboratorIds.includes(emp?.id))
        .slice(0, 12);

      setMembers(matchedEmployees);
    } catch (error) {
      console.log("Error fetching members", error);
    }
  };

  // ─────────────────────────────────────────
  // INITIALS
  // ─────────────────────────────────────────
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ─────────────────────────────────────────
  // AVATAR COLORS
  // ─────────────────────────────────────────
  const avatarColors = [
    { bg: "#fce8e6", color: "#dc3545" },
    { bg: "#e8f4fd", color: "#0d6efd" },
    { bg: "#e8f9ef", color: "#198754" },
    { bg: "#fff8e1", color: "#f59e0b" },
    { bg: "#f3e8fd", color: "#6f42c1" },
    { bg: "#fde8f4", color: "#d63384" },
  ];

  // ─────────────────────────────────────────
  // CATEGORY BADGE HELPER
  // ─────────────────────────────────────────
  const getCategoryBadge = (category) => {
    switch (category) {
      case "todo":
        return {
          badgeClass: "bg-warning-subtle text-warning",
          label: "Pending",
        };
      case "in_progress":
        return { badgeClass: "bg-info-subtle text-info", label: "In Progress" };
      case "completed":
        return { badgeClass: "bg-success-subtle text-success", label: "Done" };
      default:
        return {
          badgeClass: "bg-secondary-subtle text-secondary",
          label: category,
        };
    }
  };

  return (
    <React.Fragment>
      <Row>
        {/* SCORE CARD */}
        <Col xl={4} lg={4}>
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-4">Project Completed</h5>
              {/* ✅ taskStatusDetails updates immediately via processTaskStatusDetails
                  called from the reduxProject useEffect — no stale value */}
              <GradientCircleRadialbar
                dataColors='["--vz-info", "--vz-success"]'
                percentage={
                  taskStatusDetails?.project_completed_percentage ?? 0
                }
              />
            </CardBody>
          </Card>
        </Col>

        {/* TASK STATUS */}
        <Col xl={4} lg={4}>
          <Card className="h-100">
            <CardBody>
              {donutSeries.length > 0 && (
                <UsersByDeviceCharts
                  series={donutSeries}
                  labels={donutLabels}
                  colors={donutColors}
                  dataColors='["--vz-warning", "--vz-info", "--vz-success"]'
                />
              )}

              <div className="table-responsive mt-4">
                <table className="table table-borderless table-sm align-middle mb-0">
                  <tbody>
                    {taskStatusRows.map((row) => {
                      const badge = getCategoryBadge(row.category);
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i
                                className="ri-stop-fill me-2 fs-16"
                                style={{ color: row.color }}
                              ></i>
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{row.count} Tasks</td>
                          <td className="text-end">
                            <span className={`badge ${badge.badgeClass}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {taskStatusRows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No task data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* MEMBERS */}
        <Col xl={4} lg={4}>
          <Card className="h-100">
            <CardHeader className="d-flex align-items-center">
              <h4 className="card-title mb-0 flex-grow-1">
                Members
                {members.length > 0 && (
                  <span className="badge bg-light text-dark ms-2">
                    {members.length}
                  </span>
                )}
              </h4>
            </CardHeader>

            <CardBody>
              {members?.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "14px",
                    justifyItems: "center",
                  }}
                >
                  {members.map((member, index) => {
                    const colorSet = avatarColors[index % avatarColors.length];
                    return (
                      <div key={member?.id} className="text-center">
                        {member?.profile_url ? (
                          <img
                            src={member?.profile_url}
                            alt=""
                            className="rounded-circle"
                            style={{
                              width: "44px",
                              height: "44px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "44px",
                              height: "44px",
                              background: colorSet.bg,
                              color: colorSet.color,
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(member?.first_name)}
                          </div>
                        )}
                        <p
                          className="mb-0 mt-2 text-truncate"
                          style={{ fontSize: "11px", maxWidth: "60px" }}
                        >
                          {member?.first_name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  No members found
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectOverview;
