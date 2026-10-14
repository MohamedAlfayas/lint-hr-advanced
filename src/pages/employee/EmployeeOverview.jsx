import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";
import { Chip } from "@mui/material";
import AppTable from "../../shared/ui/table/AppTable";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { gender_options } from "../../common/constant/Constants";

import Lottie from "react-lottie";
import noDataFound from "../auth/loader/animation/no-data.json"; // adjust path to wherever you place the file

const EmployeeOverview = (props) => {
  const { profileObj, payrollObj, tasksLink, employeeTasks = [] } = props;

  const DepartmentData = GetLocalStorageData("department") || [];
  const RoleData = GetLocalStorageData("role") || [];
  const BranchData = GetLocalStorageData("branch") || [];
  const TaskStatusData = GetLocalStorageData("task_status") || [];

  console.log("employment_type data:", profileObj?.employment_type);

  const allBranches = BranchData.flatMap(
    (org) => org.entity_location_details || [],
  );

  const branchNames = profileObj?.branch_id_list
    ?.map((id) => allBranches.find((b) => b.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const departmentNames = profileObj?.primary_department_id_list
    ?.map(
      (deptId) => DepartmentData.find((dept) => dept.id === deptId)?.name,
    )
    .filter(Boolean)
    .join(", ");

  const designation = profileObj?.role?.id
    ? RoleData.find((d) => d.id === profileObj?.role?.id)?.name
    : "";

  const genderLabel = profileObj?.gender
    ? gender_options.find((d) => d.id === profileObj?.gender)?.label
    : "";
  const WorkScheduleData =
  GetLocalStorageData("work_schedule") || [];

  const workScheduleName =
    WorkScheduleData.find(
      (w) => w.id === profileObj?.work_schedule_id
    )?.name || "";



  const employmentTypeName = profileObj?.employment_type_name


  
  const reportingManagerName =
    profileObj?.reporting_manager_info?.name ||
    profileObj?.reporting_manager_info?.first_name ||
    (profileObj?.reporting_manager_id ? `#${profileObj.reporting_manager_id}` : "-");

  const noDataOptions = {
    loop: true,
    autoplay: true,
    animationData: noDataFound,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const detailRows = [
    { icon: "ri-slideshow-2-line", label: "Employee ID", value: profileObj?.emp_id },
    { icon: "ri-user-2-line", label: "Full Name", value: `${profileObj?.first_name || ""} ${profileObj?.last_name || ""}`.trim() },
    { icon: "ri-genderless-line", label: "Gender", value: genderLabel },
    { icon: "ri-calendar-line", label: "Date of Birth", value: profileObj?.dob },
    { icon: "ri-mail-line", label: "Email", value: profileObj?.email },
    { icon: "ri-phone-line", label: "Mobile", value: profileObj?.contact_number },
    { icon: "ri-briefcase-line", label: "Role", value: designation },
    { icon: "ri-user-star-line", label: "Reporting Manager", value: reportingManagerName },
    { icon: "ri-briefcase-4-line", label: "Employment Type", value: employmentTypeName },
    { icon: "ri-time-line", label: "Work Schedule", value: workScheduleName || "-" },
    { icon: "ri-team-line", label: "Department", value: departmentNames },
    { icon: "ri-building-line", label: "Branch", value: branchNames },
    { icon: "ri-calendar-check-line", label: "Joining Date", value: profileObj?.joining_date },
  ];
  console.log(profileObj);
  const recentTasks = employeeTasks.slice(0, 10);

  // const getTaskStatus = (task) => {
  //   const status = TaskStatusData.find(
  //     (s) => Number(s.id) === Number(task.task_status),
  //   );
  //   return {
  //     name: status?.name || "-",
  //     color: status?.color || "#adb5bd",
  //   };
  // };

  // ── Fixed color palette for known statuses ──────────────────────────────────
  const STATUS_COLOR_MAP = {
    "to do": { bg: "#fff4de", text: "#f6a609", border: "#f6a609" },
    "not started": { bg: "#fdecea", text: "#e63946", border: "#e63946" },
    "in progress": { bg: "#fff4de", text: "#f6a609", border: "#f6a609" },
    "review": { bg: "#e7f1ff", text: "#0d6efd", border: "#0d6efd" },
    "testing": { bg: "#e7f1ff", text: "#0d6efd", border: "#0d6efd" },
    "done": { bg: "#e6f7ee", text: "#16a34a", border: "#16a34a" },
    "completed": { bg: "#e6f7ee", text: "#16a34a", border: "#16a34a" },
  };

  const getTaskStatus = (task) => {
    const status = TaskStatusData.find(
      (s) => Number(s.id) === Number(task.task_status),
    );
    const name = status?.name || "-";
    const key = name.toLowerCase();

    const palette = STATUS_COLOR_MAP[key] || {
      bg: `${status?.color || "#adb5bd"}22`,
      text: status?.color || "#adb5bd",
      border: status?.color || "#adb5bd",
    };

    return { name, ...palette };
  };

  const formatTaskDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const taskColumns = useMemo(
    () => [
      {
        id: "title",
        accessorFn: (task) => task.title || "Untitled Task",
        header: "Title",
        Cell: ({ row }) => (
          <div style={{ maxWidth: "180px" }}>
            <div className="fw-medium text-truncate" title={row.original.title}>
              {row.original.title || "Untitled Task"}
            </div>
            <small className="text-muted text-capitalize">
              {row.original.related_to || "-"}
            </small>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (task) => getTaskStatus(task).name,
        header: "Status",
        Cell: ({ row }) => {
          const statusInfo = getTaskStatus(row.original);
          return (
            <Chip
              size="small"
              variant="outlined"
              label={statusInfo.name}
              sx={{
                bgcolor: `${statusInfo.text}1a`,
                color: statusInfo.text,
                borderColor: statusInfo.border,
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        id: "time",
        accessorFn: (task) => task.start_time || "",
        header: "Time",
        exportValue: (task) =>
          `Start: ${formatTaskDate(task.start_time)} End: ${formatTaskDate(task.end_time)}`,
        Cell: ({ row }) => (
          <>
            <small className="text-muted d-block">
              <span className="fw-medium">Start:</span>{" "}
              {formatTaskDate(row.original.start_time)}
            </small>
            <small className="text-muted d-block">
              <span className="fw-medium">End:</span>{" "}
              {formatTaskDate(row.original.end_time)}
            </small>
          </>
        ),
      },
    ],
    [],
  );

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const SectionHeader = ({ icon, tone, title, action }) => (
    <div className="eo-section-head">
      <div className="d-flex align-items-center gap-2">
        <span className={`eo-head-icon eo-${tone}`}>
          <i className={icon} />
        </span>
        <h6 className="mb-0 fw-semibold">{title}</h6>
      </div>
      {action}
    </div>
  );

  const payrollStats = [
    {
      label: "Latest Net Salary",
      value: payrollObj?.latestNetSalary || "-",
      hint: payrollObj?.latestPayMonth || "-",
      icon: "ri-money-dollar-circle-line",
      tone: "success",
    },
    {
      label: "Last Pay Date",
      value: payrollObj?.lastPayDate || "-",
      hint: payrollObj?.latestPayMonth || "-",
      icon: "ri-calendar-check-line",
      tone: "info",
    },
    {
      label: "Total Payslips",
      value: payrollObj?.totalPayslips ?? 0,
      hint: "This Year",
      icon: "ri-file-list-3-line",
      tone: "warning",
    },
  ];

  return (
    <div className="mb-4 eo-root">
      <Row className="align-items-stretch g-3">
        {/* Left: Employee Details */}
        <Col xxl={5} lg={5} md={12} className="d-flex">
          <Card className="h-100 w-100 mb-0 eo-card">
            <CardBody className="d-flex flex-column">
              <SectionHeader icon="ri-user-line" tone="primary" title="Employee Details" />

              <div className="eo-details">
                {detailRows.map((row) => {
                  const isDate = /Date/.test(row.label);
                  const value = isDate ? formatDate(row.value) : row.value;
                  return (
                    <div key={row.label} className="eo-detail">
                      <span className="eo-detail-icon">
                        <i className={row.icon} />
                      </span>
                      <div className="eo-detail-text">
                        <div className="eo-detail-label">{row.label}</div>
                        <div
                          className={`eo-detail-value${value && value !== "-" ? "" : " is-empty"}`}
                          title={typeof value === "string" ? value : undefined}
                        >
                          {value && value !== "-" ? value : "Not set"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Right: Payroll + Tasks */}
        <Col xxl={7} lg={7} md={12} className="d-flex flex-column gap-3">
          <Card className="mb-0 eo-card">
            <CardBody>
              <SectionHeader
                icon="ri-wallet-3-line"
                tone="success"
                title="Payroll Overview"
                action={
                  <button type="button" className="eo-link" onClick={props.onViewPayslips} data-testid="employee-overview-view-payslips-button">
                    View Payslips <i className="ri-arrow-right-line" />
                  </button>
                }
              />

              <div className="eo-stats">
                {payrollStats.map((stat) => (
                  <div key={stat.label} className={`eo-stat eo-${stat.tone}`}>
                    <span className="eo-stat-icon">
                      <i className={stat.icon} />
                    </span>
                    <div className="min-w-0">
                      <div className="eo-stat-label">{stat.label}</div>
                      <div className="eo-stat-value">{stat.value}</div>
                      <div className="eo-stat-hint">{stat.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="flex-grow-1 mb-0 eo-card">
            <CardBody className="d-flex flex-column">
              <SectionHeader
                icon="ri-task-line"
                tone="purple"
                title="Recent Tasks"
                action={
                  <Link to={tasksLink || "#"} className="eo-link" data-testid="employee-overview-view-all-tasks-link">
                    View All <i className="ri-arrow-right-line" />
                  </Link>
                }
              />

              {recentTasks.length ? (
                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                  <AppTable
                    columns={taskColumns}
                    data={recentTasks}
                    getRowId={(task) => String(task.id)}
                    enablePagination={false}
                    enableRowSelection={false}
                    initialState={{ density: "compact" }}
                  />
                </div>
              ) : (
                <div className="eo-empty">
                  <Lottie options={noDataOptions} height={120} width={120} />
                  <div className="fw-semibold mt-1">No tasks yet</div>
                  <div className="text-muted fs-12">Tasks assigned to this employee will appear here.</div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style>{`
        .eo-card { border-radius: 14px; }
        .eo-section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
        .eo-head-icon {
          width:36px; height:36px; border-radius:10px; font-size:18px;
          display:inline-flex; align-items:center; justify-content:center;
          color:var(--eo-c); background:rgba(var(--eo-rgb), .12);
        }
        .eo-primary { --eo-c:var(--vz-primary); --eo-rgb:var(--vz-primary-rgb); }
        .eo-success { --eo-c:var(--vz-success); --eo-rgb:var(--vz-success-rgb); }
        .eo-info { --eo-c:var(--vz-info); --eo-rgb:var(--vz-info-rgb); }
        .eo-warning { --eo-c:var(--vz-warning); --eo-rgb:var(--vz-warning-rgb); }
        .eo-purple { --eo-c:#7c5cf5; --eo-rgb:124,92,245; }
        .eo-link {
          display:inline-flex; align-items:center; gap:4px; border:0; background:transparent; padding:4px 8px;
          border-radius:8px; font-size:13px; font-weight:600; color:var(--vz-primary); text-decoration:none;
        }
        .eo-link:hover { background:rgba(var(--vz-primary-rgb), .08); color:var(--vz-primary); }
        .eo-link i { transition:transform .15s ease; }
        .eo-link:hover i { transform:translateX(3px); }

        .eo-details { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; }
        @media (max-width: 575.98px) { .eo-details { grid-template-columns:1fr; } }
        .eo-detail {
          display:flex; align-items:center; gap:10px; padding:10px 12px; min-width:0;
          border:1px solid var(--vz-border-color); border-radius:12px; transition:border-color .15s ease, background-color .15s ease;
        }
        .eo-detail:hover { border-color:rgba(var(--vz-primary-rgb), .35); background:rgba(var(--vz-primary-rgb), .03); }
        .eo-detail-icon {
          width:32px; height:32px; flex:0 0 32px; border-radius:9px; font-size:16px;
          display:inline-flex; align-items:center; justify-content:center;
          color:var(--vz-primary); background:rgba(var(--vz-primary-rgb), .1);
        }
        .eo-detail-text { min-width:0; }
        .eo-detail-label { font-size:11px; color:var(--vz-secondary-color); text-transform:uppercase; letter-spacing:.4px; }
        .eo-detail-value {
          font-size:13px; font-weight:600; color:var(--vz-heading-color, var(--vz-body-color));
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .eo-detail-value.is-empty { color:var(--vz-secondary-color); font-weight:400; font-style:italic; }

        .eo-stats { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; }
        @media (max-width: 767.98px) { .eo-stats { grid-template-columns:1fr; } }
        .eo-stat {
          display:flex; align-items:flex-start; gap:12px; padding:14px; border-radius:12px;
          background:rgba(var(--eo-rgb), .08); border:1px solid rgba(var(--eo-rgb), .2);
        }
        .eo-stat-icon {
          width:38px; height:38px; flex:0 0 38px; border-radius:10px; font-size:19px;
          display:inline-flex; align-items:center; justify-content:center;
          color:#fff; background:var(--eo-c); box-shadow:0 4px 10px rgba(var(--eo-rgb), .3);
        }
        .eo-stat-label { font-size:12px; color:var(--vz-secondary-color); }
        .eo-stat-value { font-size:18px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .eo-stat-hint { font-size:11.5px; color:var(--vz-secondary-color); }
        .min-w-0 { min-width:0; }

        .eo-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:16px 0; min-height:200px; }
      `}</style>
    </div>
  );
};

export default EmployeeOverview;
