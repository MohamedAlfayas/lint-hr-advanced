import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";
import SimpleBar from "simplebar-react";
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
    // { icon: "ri-briefcase-line", label: "Designation", value: designation },
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

  return (
    <div>
      <Row className="align-items-stretch">
        {/* Left: Employee Details */}
        <Col xxl={5} lg={5} md={12} className="d-flex">
          <Card className="h-100 w-100 d-flex flex-column">
            <CardBody className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#e7ecff",
                  }}
                >
                  <i
                    className="ri-user-line"
                    style={{ fontSize: "20px", color: "#0e1d8e" }}
                  ></i>
                </div>
                <h5 className="card-title mb-0 ms-3">Employee Details</h5>
              </div>

              <SimpleBar className="flex-grow-1" style={{ minHeight: 0 }}>
                <div className="table-responsive">
                  <table className="table table-borderless mb-0">
                    <tbody>
                      {detailRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="ps-0" style={{ width: "40px",verticalAlign: "middle" }}>
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#e7ecff",
                              }}
                            >
                              <i
                                className={row.icon}
                                style={{ fontSize: "15px", color: "#0e1d8e" }}
                              ></i>
                            </div>
                          </td>
                          <th
                            className="fw-medium text-body"
                            style={{ width: "160px",verticalAlign: "middle" }}
                          >
                            {row.label}
                          </th>
                          <td className="text-muted" style={{ verticalAlign: "middle" }}>:</td>
                          <td className="text-muted" style={{ verticalAlign: "middle" }}>{row.value || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
        </Col>

        {/* Right: Payroll + Tasks */}
        <Col xxl={7} lg={7} md={12} className="d-flex flex-column">
          {/* Payroll Overview */}
          <Card>
            <CardBody>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#d6f5ef",
                  }}
                >
                  <i
                    className="ri-wallet-3-line"
                    style={{ fontSize: "20px", color: "#057465" }}
                  ></i>
                </div>
                <h5 className="card-title mb-0 ms-3">Payroll Overview</h5>
              </div>

              <Row className="g-3">
                <Col md={4} xs={12}>
                  <div className="p-3 rounded bg-success-subtle h-100">
                    <p className="text-muted mb-1">Latest Net Salary</p>
                    <h4 className="text-success mb-1">
                      {payrollObj?.latestNetSalary || "-"}
                    </h4>
                    <small className="text-muted">
                      {payrollObj?.latestPayMonth || "-"}
                    </small>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  <div className="p-3 rounded bg-info-subtle h-100">
                    <p className="text-muted mb-1">Last Pay Date</p>
                    <h4 className="mb-1">{payrollObj?.lastPayDate || "-"}</h4>
                    <small className="text-muted">
                      {payrollObj?.latestPayMonth || "-"}
                    </small>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  <div className="p-3 rounded bg-warning-subtle h-100 text-center">
                    <p className="text-muted mb-1">Total Payslips</p>
                    <h4 className="text-danger mb-1">
                      {payrollObj?.totalPayslips ?? 0}
                    </h4>
                    <small className="text-muted">This Year</small>
                  </div>
                </Col>
              </Row>

              <div
                onClick={props.onViewPayslips}
                role="button"
                className="d-flex align-items-center justify-content-between mt-4 p-3 rounded border text-decoration-none"
                style={{ cursor: "pointer" }}
              >
                <span className="fw-medium text-primary">View Payslips</span>
                <i className="ri-arrow-right-line text-primary"></i>
              </div>
            </CardBody>
          </Card>

          {/* Recent CRM Tasks */}
         
        <Card className="flex-grow-1 d-flex flex-column mb-0">
          <CardBody className="d-flex flex-column flex-grow-1">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#e7ecff",
                  }}
                >
                  <i
                    className="ri-task-line"
                    style={{ fontSize: "20px", color: "#540570" }}
                  ></i>
                </div>
                <h5 className="card-title mb-0 ms-3">Recent Tasks</h5>
              </div>
            </div>

            <SimpleBar style={{ height: "260px" }} className="pe-1">
              {recentTasks.length ? (
                <div className="table-responsive">
                  <table className="table table-borderless table-nowrap align-middle mb-0">
                    <thead className="text-muted" style={{ fontSize: "12px" }}>
                      <tr>
                        <th className="ps-0">Title</th>
                        <th>Status</th>
                        <th className="text-end pe-0">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => {
                        const statusInfo = getTaskStatus(task);
                        return (
                          <tr key={task.id} className="border-bottom">
                            <td className="ps-0" style={{ maxWidth: "180px" }}>
                              <div
                                className="fw-medium text-truncate"
                                title={task.title}
                              >
                                {task.title || "Untitled Task"}
                              </div>
                              <small className="text-muted text-capitalize">
                                {task.related_to || "-"}
                              </small>
                            </td>
                            <td>
                              {/* <span
                                className="badge"
                                style={{
                                  backgroundColor: `${statusInfo.color}22`,
                                  color: statusInfo.color,
                                  border: `1px solid ${statusInfo.color}`,
                                }}
                              >
                                {statusInfo.name}
                              </span> */}
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: statusInfo.bg,
                                  color: statusInfo.text,
                                  border: `1px solid ${statusInfo.border}`,
                                  fontWeight: 500,
                                }}
                              >
                                {statusInfo.name}
                              </span>

                            </td>
                            <td className="text-end pe-0">
                              <small className="text-muted d-block">
                                <span className="fw-medium">Start:</span>{" "}
                                {task.start_time
                                  ? new Date(task.start_time).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </small>
                              <small className="text-muted d-block">
                                <span className="fw-medium">End:</span>{" "}
                                {task.end_time
                                  ? new Date(task.end_time).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "260px" }}
                >
                  <Lottie options={noDataOptions} height={160} width={160} />
                  {/* <p className="text-muted text-center mb-0">
                    No tasks assigned yet.
                  </p> */}
                </div>
              )}
            </SimpleBar>

            <Link
              to={tasksLink || "#"}
              className="d-flex align-items-center justify-content-between mt-3 p-3 rounded border text-decoration-none"
            >
              <span className="fw-medium text-primary">View All Tasks</span>
              <i className="ri-arrow-right-line text-primary"></i>
            </Link>
          </CardBody>
        </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeOverview;