import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import getChartColorsArray from "../../../component/common/dynamicColor/ChartsDynamicColor";

// ─────────────────────────────────────────────
// RADIAL SCORE CHART
// ─────────────────────────────────────────────
const GradientCircleRadialbar = ({ dataColors }) => {
  const chartColors = getChartColorsArray(dataColors);

  const series = [75];

  const options = {
    chart: {
      height: 320,
      type: "radialBar",
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,

        hollow: {
          size: "70%",
        },

        track: {
          strokeWidth: "67%",
        },

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

    stroke: {
      lineCap: "round",
    },

    labels: ["Score"],
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
const UsersByDeviceCharts = ({ dataColors, series }) => {
  const chartColors = getChartColorsArray(dataColors);

  const options = {
    labels: ["Todo", "Processing", "Completed"],

    chart: {
      type: "donut",
      height: 220,
    },

    plotOptions: {
      pie: {
        donut: {
          size: "76%",
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },

    stroke: {
      width: 0,
    },

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
const ClientOverview = ({ projectId }) => {
  const [members, setMembers] = useState([]);

  // Dummy chart data
  const chartData = [12, 8, 24];

  // ─────────────────────────────────────────
  // FETCH MEMBERS
  // ─────────────────────────────────────────
  useEffect(() => {
    if (projectId) {
      fetchProjectMembers();
    }
  }, [projectId]);

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

  return (
    <React.Fragment>
      <Row>
        {/* SCORE CARD */}
        <Col xl={4} lg={4}>
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-4">Project Score</h5>

              <GradientCircleRadialbar dataColors='["--vz-info", "--vz-success"]' />
            </CardBody>
          </Card>
        </Col>

        {/* TASK STATUS */}
        <Col xl={4} lg={4}>
          <Card className="h-100">
            <CardBody>
              <UsersByDeviceCharts
                series={chartData}
                dataColors='["--vz-warning", "--vz-info", "--vz-success"]'
              />

              <div className="table-responsive mt-4">
                <table className="table table-borderless table-sm align-middle mb-0">
                  <tbody>
                    {/* TODO */}
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="ri-stop-fill text-warning me-2 fs-16"></i>
                          <span>Todo</span>
                        </div>
                      </td>

                      <td className="text-muted">{chartData[0]} Tasks</td>

                      <td className="text-end">
                        <span className="badge bg-warning-subtle text-warning">
                          Pending
                        </span>
                      </td>
                    </tr>

                    {/* PROCESSING */}
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="ri-stop-fill text-info me-2 fs-16"></i>
                          <span>Processing</span>
                        </div>
                      </td>

                      <td className="text-muted">{chartData[1]} Tasks</td>

                      <td className="text-end">
                        <span className="badge bg-info-subtle text-info">
                          In Progress
                        </span>
                      </td>
                    </tr>

                    {/* COMPLETED */}
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="ri-stop-fill text-success me-2 fs-16"></i>
                          <span>Completed</span>
                        </div>
                      </td>

                      <td className="text-muted">{chartData[2]} Tasks</td>

                      <td className="text-end">
                        <span className="badge bg-success-subtle text-success">
                          Done
                        </span>
                      </td>
                    </tr>
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
                          style={{
                            fontSize: "11px",
                            maxWidth: "60px",
                          }}
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

export default ClientOverview;
