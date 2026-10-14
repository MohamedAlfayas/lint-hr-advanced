import React, { useEffect, useMemo, useState } from "react";
import {
  Col,
  Row,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { EDIT_PROJECT_ACCESS_KEY } from "../../../common/constant/RoleConstants";
import { ApvColorTag, ApvEmployee } from "../../../component/common/approval/ApprovalCells";
import { TestableAsyncSelect as AsyncSelect } from "../../../shared/ui/TestableSelect";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { PutApi } from "../../../common/api/PutApi";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import {
  editProject,
  setProjects,
} from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

const ACTIVITY_MAX_HEIGHT = 300;
const RECENT_TASK_LIMIT = 15;
const COMPACT_LIST_MAX_HEIGHT = 168;

const displayValue = (val, fallback = "-") => {
  if (val == null) return fallback;
  if (typeof val === "string" || typeof val === "number") return val;
  if (typeof val === "object") return val.name ?? val.title ?? val.label ?? fallback;
  return fallback;
};

const buildEmployeeOption = (emp) => ({
  ...emp,
  value: emp.id,
  label:
    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
    emp.label ||
    emp.name ||
    `Employee ${emp.id}`,
});

const toId = (v) => (v && typeof v === "object" ? v.id : v);

// Chart text, track and slice-border colours are themed in ProjectDetail.scss (.pdx-chart).
const ProgressRadial = ({ percentage }) => {
  const options = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: "66%" },
        track: { strokeWidth: "100%" },
        dataLabels: {
          name: { show: true, offsetY: 22, fontSize: "12px", fontWeight: 500 },
          value: {
            show: true,
            offsetY: -10,
            fontSize: "24px",
            fontWeight: 700,
            formatter: (val) => `${parseInt(val)}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: ["#0ab39c"],
        stops: [0, 100],
      },
    },
    colors: ["#3ecf8e"],
    stroke: { lineCap: "round" },
    labels: ["Completed"],
  };

  return (
    <div className="pdx-chart">
      <ReactApexChart
        options={options}
        series={[percentage ?? 0]}
        type="radialBar"
        width="100%"
        height="100%"
      />
    </div>
  );
};

const TaskStatusDonut = ({ series, labels, colors, total }) => {
  const options = {
    labels: labels || [],
    chart: { type: "donut" },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { fontSize: "12px", offsetY: 18 },
            value: { fontSize: "24px", fontWeight: 700, offsetY: -12 },
            total: {
              show: true,
              label: "Tasks",
              fontSize: "12px",
              formatter: () => total,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 3 },
    colors,
  };

  return (
    <div className="pdx-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        width="100%"
        height="100%"
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, tone, total }) => {
  const pct = total ? Math.round((value / total) * 100) : null;
  return (
    <div className={`pdx-stat is-${tone}`}>
      <span className="pdx-stat-icon">
        <i className={icon}></i>
      </span>
      <div className="pdx-stat-body">
        <span className="pdx-stat-label">{label}</span>
        <b className="pdx-stat-value">{value}</b>
      </div>
      {pct != null && <span className="pdx-stat-pct">{pct}%</span>}
      <span className="pdx-stat-bar">
        <span style={{ width: `${pct ?? 100}%` }} />
      </span>
    </div>
  );
};

const Panel = ({ icon, tone = "primary", title, sub, action, className = "", children }) => (
  <div className={`pdx-panel ${className}`}>
    <div className="pdx-panel-head">
      <span className={`pdx-panel-icon is-${tone}`}>
        <i className={icon}></i>
      </span>
      <div className="pdx-panel-title">
        <h6>{title}</h6>
        {sub && <small>{sub}</small>}
      </div>
      {action && <div className="ms-auto">{action}</div>}
    </div>
    <div className="pdx-panel-body">{children}</div>
  </div>
);

const LegendRow = ({ color, label, value, total }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="pdx-legend-row" style={{ "--c": color }}>
      <span className="pdx-legend-dot" />
      <span className="pdx-legend-label" title={label}>
        {label}
      </span>
      <b>{value}</b>
      <span className="pdx-legend-pct">{pct}%</span>
      <span className="pdx-legend-bar">
        <span style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
};

const EmptyState = ({ icon, text, children }) => (
  <div className="pdx-empty">
    <span>
      <i className={icon}></i>
    </span>
    <p>{text}</p>
    {children}
  </div>
);

const timeAgo = (ts) => {
  if (!ts) return "-";
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dayjs(ts).format("DD MMM YYYY");
};

const fmtDate = (value) => {
  const d = dayjs(value);
  return value && d.isValid() ? d.format("DD MMM YYYY") : "Not set";
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const ProjectOverview = ({ projectId }) => {
  const dispatch = useDispatch();

  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [detailMemberDetails, setDetailMemberDetails] = useState([]);
  const [taskStatusDetails, setTaskStatusDetails] = useState(null);
  const [taskStatusRows, setTaskStatusRows] = useState([]);
  const [donutSeries, setDonutSeries] = useState([]);
  const [donutLabels, setDonutLabels] = useState([]);
  const [donutColors, setDonutColors] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMembers, setNewMembers] = useState([]);
  const [savingMembers, setSavingMembers] = useState(false);

  // ✅ Subscribe to Redux — when TaskListForm / TaskDetailModal dispatches
  // editProject after a task save, this selector fires and the useMemo
  // below picks up the updated task_status_details with zero extra API calls.
  const { project_data } = useSelector((state) => state.ProjectsReducer);
  const { tasks: task_data } = useSelector((state) => state.TaskReducer);

  const reduxProject = useMemo(
    () => project_data?.find((p) => Number(p.id) === Number(projectId)),
    [project_data, projectId],
  );

  const canEditProject = useMemo(() => {
    const profile = JSON.parse(localStorage.getItem("lint_hr_profile_data") || "{}");
    return (
      profile?.is_admin === true ||
      (profile?.permission_list || []).includes(EDIT_PROJECT_ACCESS_KEY)
    );
  }, []);


  // Redux first; fall back to localStorage if the page was opened directly / refreshed
  const currentProject = useMemo(
    () =>
      reduxProject ||
      (GetLocalStorageData("projects") || []).find(
        (p) => Number(p.id) === Number(projectId),
      ),
    [reduxProject, projectId],
  );

  // Project Members come from the project's member_details. The project list
  // (redux / localStorage) is preferred; the project-detail API response is
  // the fallback when the list entry doesn't carry member_details.
  const memberDetails = useMemo(() => {
    if (Array.isArray(currentProject?.member_details)) {
      return currentProject.member_details;
    }
    return detailMemberDetails;
  }, [currentProject, detailMemberDetails]);

  // Sent back as members_id_list on save. Falls back to members_id_list only
  // when member_details is missing, so saving never wipes existing members.
  const existingMemberIds = useMemo(() => {
    if (memberDetails.length) {
      return memberDetails.map((m) => Number(m?.id)).filter((id) => !Number.isNaN(id));
    }
    return (currentProject?.members_id_list || []).map(Number);
  }, [memberDetails, currentProject]);

  const members = useMemo(() => {
    // Task count = assigned tasks + collaborator tasks, so a member who is
    // both assignee and collaborator on the same task is counted for each role.
    const isValidId = (id) => id !== undefined && id !== null && id !== "";
    const taskCountByEmp = {};
    const increment = (id) => {
      taskCountByEmp[id] = (taskCountByEmp[id] || 0) + 1;
    };

    projectTasks.forEach((task) => {
      const assigneeId = toId(task?.assigned_to);
      if (isValidId(assigneeId)) increment(Number(assigneeId));

      new Set(
        (task?.collaborators_id_list || []).filter(isValidId).map(Number),
      ).forEach(increment);
    });

    return memberDetails
      .filter((m) => m && m.id !== undefined && m.id !== null)
      .map((m) => ({ ...m, taskCount: taskCountByEmp[Number(m.id)] || 0 }));
  }, [memberDetails, projectTasks]);

  const defaultMemberOptions = () =>
    (GetLocalStorageData("employee") || [])
      .filter((e) => !existingMemberIds.includes(Number(e.id)))
      .map(buildEmployeeOption);

  const loadMemberOptions = async (inputValue) => {
    if (!inputValue || !inputValue.trim()) return defaultMemberOptions();
    try {
      const response = await Api.get(
        `/employee/get-data-on-search/?search=${encodeURIComponent(inputValue.trim())}`,
      );
      return (response?.data?.data || [])
        .filter((e) => !existingMemberIds.includes(Number(e.id)))
        .map(buildEmployeeOption);
    } catch (err) {
      const q = inputValue.toLowerCase();
      return defaultMemberOptions().filter((e) => e.label.toLowerCase().includes(q));
    }
  };

  const openAddMember = () => {
    setNewMembers([]);
    setShowAddMember(true);
  };

  const handleSaveMembers = async () => {
    if (!currentProject || newMembers.length === 0) return;
    setSavingMembers(true);
    try {
      const payload = {
        id: currentProject.id,
        title: currentProject.title,
        type: toId(currentProject.type),
        client: toId(currentProject.client),
        description: currentProject.description || "",
        start_date: currentProject.start_date,
        deadline: currentProject.deadline,
        price: currentProject.price,
        status: currentProject.status,
        members_id_list: [
          ...new Set([...existingMemberIds, ...newMembers.map((m) => Number(m.id))]),
        ],
      };

      const response = await PutApi("projects/", payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const updated = response?.data?.data;
        if (updated) {
          const oldProjects = GetLocalStorageData("projects") || [];
          const exists = oldProjects.some((p) => Number(p.id) === Number(updated.id));
          const updatedProjects = exists
            ? oldProjects.map((p) => (Number(p.id) === Number(updated.id) ? updated : p))
            : [...oldProjects, updated];
          SetLocalStorage("projects", updatedProjects, 1);

          dispatch(reduxProject ? editProject(updated) : setProjects(updatedProjects));
        }
        fetchProjectDetail();
        toast.success(response?.data?.message || "Members added");
        setShowAddMember(false);
        setNewMembers([]);
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("API Error");
    }
    setSavingMembers(false);
  };

  // ─────────────────────────────────────────
  // SHARED: build chart/table data from task_status_details
  // ─────────────────────────────────────────
  const processTaskStatusDetails = (details) => {
    if (!details) return;
    // setTaskStatusDetails(details);
    setTaskStatusDetails((prev) => ({ ...(prev || {}), ...details }));

    const taskStatusList = GetLocalStorageData("task_status") || [];
    const statusCounts = details.status_counts || {};

    const rows = [];
    const series = [];
    const labels = [];
    const colors = [];

    Object.entries(statusCounts).forEach(([statusId, count]) => {
      const matched = taskStatusList.find((s) => String(s.id) === String(statusId));

      const row = matched
        ? {
            id: matched.id,
            name: matched.name,
            category: matched.category,
            color: matched.color || "#808080",
            count,
          }
        : {
            id: statusId,
            name: `Status ${statusId}`,
            category: "unknown",
            color: "#808080",
            count,
          };

      rows.push(row);
      series.push(count);
      labels.push(row.name);
      colors.push(row.color);
    });

    setTaskStatusRows(rows);
    setDonutSeries(series);
    setDonutLabels(labels);
    setDonutColors(colors);
  };

  useEffect(() => {
    if (projectId) fetchProjectDetail();
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchProjectTasks();
  }, [projectId, task_data]);

  const fetchProjectDetail = async () => {
    try {
      const response = await GetApi(`/projects/get-project-detail/${projectId}`);
      const data = response?.data?.data;
      if (!data) return;

      // ASSUMED field names — adjust to match your real API response
      setProject({
        name: data?.name ?? data?.project_name ?? "Untitled Project",
        client: data?.client_name ?? data?.client ?? "-",
        manager: data?.manager_name ?? data?.project_manager_name ?? "-",
        status: data?.status ?? "in_progress",
        priority: data?.priority ?? "Medium",
        createdAt: data?.created_at ?? data?.start_date,
        // Your API returns the due date as `deadline` (see projects[]),
        // not `due_date`/`end_date` — that mismatch is why it was blank.
        dueDate: data?.deadline ?? data?.due_date ?? data?.end_date,
        logoUrl: data?.logo_url ?? null,
        activities: data?.recent_activities ?? [],
      });

      if (data?.task_status_details) {
        processTaskStatusDetails(data.task_status_details);
      }

      setDetailMemberDetails(Array.isArray(data?.member_details) ? data.member_details : []);
    } catch (error) {
      console.log("Error fetching project detail", error);
    }
  };

  // ✅ REACTIVE UPDATE — Redux project change after task save, no API call
  useEffect(() => {
    if (reduxProject?.task_status_details) {
      processTaskStatusDetails(reduxProject.task_status_details);
    }
  }, [reduxProject]);

  const fetchProjectTasks = async () => {
    try {
      const response = await GetApi("/task/");
      const allTasks = response?.data?.data || [];

      const tasksOfProject = allTasks.filter(
        (item) => item?.related_to === "project" && Number(item?.project) === Number(projectId),
      );
      setProjectTasks(tasksOfProject);
    } catch (error) {
      console.log("Error fetching project tasks", error);
    }
  };

  const stats = useMemo(() => {
    const total = taskStatusRows.reduce((sum, r) => sum + r.count, 0);
    const completed = taskStatusRows
      .filter((r) => r.category === "done")
      .reduce((s, r) => s + r.count, 0);
    const inProgress = taskStatusRows
      .filter((r) => r.category === "in_progress")
      .reduce((s, r) => s + r.count, 0);
    const pending = taskStatusRows
      .filter((r) => r.category === "todo")
      .reduce((s, r) => s + r.count, 0);
    const overdue =
      taskStatusDetails?.overdue_task_count ??
      taskStatusDetails?.overdue_count ??
      0;
    return { total, completed, inProgress, pending, overdue };
  }, [taskStatusRows, taskStatusDetails]);

  const legendItems = [
    { label: "Completed", value: stats.completed, color: "var(--vz-success)" },
    { label: "In Progress", value: stats.inProgress, color: "var(--vz-info)" },
    { label: "To Do", value: stats.pending, color: "var(--vz-warning)" },
    { label: "Overdue", value: stats.overdue, color: "var(--vz-danger)" },
  ];

  const getTaskTime = (t) =>
    new Date(t?.updated_on ?? t?.created_on ?? 0).getTime() || 0;

  const recentTasks = useMemo(() => {
    const statuses = GetLocalStorageData("task_status") || [];
    const employees = GetLocalStorageData("employee") || [];

    return [...projectTasks]
      .sort((a, b) => getTaskTime(b) - getTaskTime(a) || Number(b.id) - Number(a.id))
      .slice(0, RECENT_TASK_LIMIT)
      .map((t) => {
        const status = statuses.find((s) => Number(s.id) === Number(t.task_status));
        const emp = employees.find((e) => Number(e.id) === Number(t.assigned_to));
        return {
          id: t.id,
          title: t.title,
          statusName: status?.name || "-",
          statusColor: status?.color || "#878a99",
          assignee: emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : "Unassigned",
          time: getTaskTime(t),
        };
      });
  }, [projectTasks]);

  const percentComplete = Math.round(taskStatusDetails?.project_completed_percentage ?? 0);

  const timeline = useMemo(() => {
    const start = dayjs(currentProject?.start_date ?? project?.createdAt ?? currentProject?.created_on);
    const due = dayjs(currentProject?.deadline ?? project?.dueDate);
    const today = dayjs().startOf("day");
    const hasRange = start.isValid() && due.isValid() && due.isAfter(start);
    const timePct = hasRange
      ? Math.min(100, Math.max(0, Math.round((today.diff(start, "day") / due.diff(start, "day")) * 100)))
      : null;
    const daysLeft = due.isValid() ? due.startOf("day").diff(today, "day") : null;
    return { start, due, timePct, daysLeft };
  }, [currentProject, project]);

  const health = (() => {
    if (stats.total && percentComplete >= 100) {
      return { tone: "success", icon: "ri-checkbox-circle-line", text: "All tasks completed" };
    }
    if (timeline.daysLeft != null && timeline.daysLeft < 0) {
      return { tone: "danger", icon: "ri-alarm-warning-line", text: `Past due by ${-timeline.daysLeft} day${timeline.daysLeft === -1 ? "" : "s"}` };
    }
    if (timeline.timePct != null && timeline.timePct - percentComplete > 15) {
      return { tone: "warning", icon: "ri-error-warning-line", text: "Behind schedule" };
    }
    return { tone: "success", icon: "ri-thumb-up-line", text: "On track" };
  })();

  const daysLeftLabel =
    timeline.daysLeft == null
      ? "No due date"
      : timeline.daysLeft < 0
        ? `${-timeline.daysLeft}d overdue`
        : timeline.daysLeft === 0
          ? "Due today"
          : `${timeline.daysLeft}d left`;

  return (
    <div className="pdx-overview">
      <Row className="g-3 mb-3">
        <Col xxl xl={4} md={6} xs={12}>
          <StatCard icon="ri-list-check-2" label="Total Tasks" value={stats.total} tone="primary" />
        </Col>
        <Col xxl xl={4} md={6} xs={12}>
          <StatCard icon="ri-checkbox-circle-line" label="Completed" value={stats.completed} total={stats.total} tone="success" />
        </Col>
        <Col xxl xl={4} md={6} xs={12}>
          <StatCard icon="ri-loader-4-line" label="In Progress" value={stats.inProgress} total={stats.total} tone="info" />
        </Col>
        <Col xxl xl={6} md={6} xs={12}>
          <StatCard icon="ri-todo-line" label="To Do" value={stats.pending} total={stats.total} tone="warning" />
        </Col>
        <Col xxl xl={6} md={12} xs={12}>
          <StatCard icon="ri-alarm-warning-line" label="Overdue" value={stats.overdue} total={stats.total} tone="danger" />
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xl={4} lg={6} xs={12}>
          <Panel
            icon="ri-pie-chart-2-line"
            tone="success"
            title="Project Progress"
            sub={`${stats.completed} of ${stats.total} tasks completed`}
          >
            <div className="pdx-split">
              <ProgressRadial percentage={percentComplete} />
              <div className="pdx-legend">
                {legendItems.map((item) => (
                  <LegendRow key={item.label} {...item} total={stats.total} />
                ))}
              </div>
            </div>
          </Panel>
        </Col>

        <Col xl={4} lg={6} xs={12}>
          <Panel
            icon="ri-donut-chart-line"
            tone="info"
            title="Task Status"
            sub={`${taskStatusRows.length} status${taskStatusRows.length === 1 ? "" : "es"} in use`}
          >
            {donutSeries.length > 0 ? (
              <div className="pdx-split">
                <TaskStatusDonut series={donutSeries} labels={donutLabels} colors={donutColors} total={stats.total} />
                <SimpleBar className="pdx-legend" style={{ maxHeight: COMPACT_LIST_MAX_HEIGHT }}>
                  {taskStatusRows.map((row) => (
                    <LegendRow key={row.id} color={row.color} label={row.name} value={row.count} total={stats.total} />
                  ))}
                </SimpleBar>
              </div>
            ) : (
              <EmptyState icon="ri-donut-chart-line" text="No tasks in this project yet" />
            )}
          </Panel>
        </Col>

        <Col xl={4} xs={12}>
          <Panel
            icon="ri-team-line"
            tone="primary"
            title="Project Members"
            sub={`${members.length} member${members.length === 1 ? "" : "s"}`}
            action={
              canEditProject && (
                <button data-testid="project-overview-add-button" type="button" className="btn btn-soft-primary btn-sm" onClick={openAddMember}>
                  <i className="ri-user-add-line me-1"></i>Add
                </button>
              )
            }
          >
            {members.length > 0 ? (
              <SimpleBar style={{ maxHeight: COMPACT_LIST_MAX_HEIGHT + 24 }}>
                <div className="pdx-members">
                  {members.map((member) => {
                    const designation = displayValue(member?.designation);
                    return (
                      <div key={member.id} className="pdx-member">
                        <ApvEmployee
                          employee={{
                            ...member,
                            first_name: member.first_name || member.name,
                          }}
                          sub={designation !== "-" ? designation : displayValue(member?.role, "Member")}
                        />
                        <span className="pdx-member-tasks" title={`${member.taskCount} tasks`}>
                          <i className="ri-task-line"></i>
                          {member.taskCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SimpleBar>
            ) : (
              <EmptyState icon="ri-group-line" text="No members assigned yet">
                {canEditProject && (
                  <Button data-testid="project-overview-add-member-button" type="button" size="sm" color="primary" onClick={openAddMember}>
                    <i className="ri-user-add-line me-1"></i>Add Member
                  </Button>
                )}
              </EmptyState>
            )}
          </Panel>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6} xs={12}>
          <Panel
            icon="ri-calendar-2-line"
            tone="warning"
            title="Project Timeline"
            action={
              <span className={`apv-status is-${health.tone}`}>
                <i className={health.icon}></i>
                {health.text}
              </span>
            }
          >
            <div className="pdx-track">
              <div className="pdx-track-line">
                <span style={{ width: `${timeline.timePct ?? 0}%` }} />
              </div>
              <div className="pdx-track-node is-start">
                <span className="pdx-track-dot is-done">
                  <i className="ri-play-fill"></i>
                </span>
                <b>{fmtDate(timeline.start)}</b>
                <small>Start</small>
              </div>
              {timeline.timePct != null && (
                <div className="pdx-track-today" style={{ left: `${timeline.timePct}%`, "--p": timeline.timePct / 100 }}>
                  <span>Today</span>
                </div>
              )}
              <div className="pdx-track-node is-end">
                <span className={`pdx-track-dot${percentComplete >= 100 ? " is-done" : ""}`}>
                  <i className="ri-flag-fill"></i>
                </span>
                <b>{fmtDate(timeline.due)}</b>
                <small>Due</small>
              </div>
            </div>

            <div className="pdx-metrics">
              <div className="pdx-metric">
                <small>Time elapsed</small>
                <b>{timeline.timePct != null ? `${timeline.timePct}%` : "—"}</b>
                <span className="apv-progress is-warning">
                  <span style={{ width: `${timeline.timePct ?? 0}%` }} />
                </span>
              </div>
              <div className="pdx-metric">
                <small>Tasks done</small>
                <b>{percentComplete}%</b>
                <span className="apv-progress is-success">
                  <span style={{ width: `${percentComplete}%` }} />
                </span>
              </div>
              <div className={`pdx-metric${timeline.daysLeft != null && timeline.daysLeft < 0 ? " is-danger" : ""}`}>
                <small>Deadline</small>
                <b>{daysLeftLabel}</b>
                <span className="pdx-metric-note">
                  {stats.overdue > 0 ? (
                    <span className="text-danger">
                      <i className="ri-error-warning-line me-1"></i>
                      {stats.overdue} overdue task{stats.overdue === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span>No overdue tasks</span>
                  )}
                </span>
              </div>
            </div>
          </Panel>
        </Col>

        <Col lg={6} xs={12}>
          <Panel
            icon="ri-history-line"
            tone="secondary"
            title="Recent Activity"
            sub={recentTasks.length ? `Last ${recentTasks.length} updated tasks` : undefined}
          >
            {recentTasks.length > 0 ? (
              <SimpleBar style={{ maxHeight: ACTIVITY_MAX_HEIGHT }}>
                <div className="pdx-feed">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="pdx-feed-item" style={{ "--c": task.statusColor }}>
                      <span className="pdx-feed-dot">
                        <i className="ri-task-line"></i>
                      </span>
                      <div className="pdx-feed-body">
                        <div className="pdx-feed-top">
                          <b title={task.title}>{task.title}</b>
                          <small title={task.time ? dayjs(task.time).format("DD MMM YYYY, hh:mm A") : undefined}>
                            {timeAgo(task.time)}
                          </small>
                        </div>
                        <div className="pdx-feed-meta">
                          <ApvColorTag color={task.statusColor} label={task.statusName} />
                          <span>
                            <i className="ri-user-3-line"></i>
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SimpleBar>
            ) : (
              <EmptyState icon="ri-history-line" text="No recent activity yet" />
            )}
          </Panel>
        </Col>
      </Row>

      <Modal data-testid="project-overview-add-members-dialog" isOpen={showAddMember} toggle={() => setShowAddMember(false)} centered>
        <ModalHeader close={<ModalCloseButton onClick={() => setShowAddMember(false)} testId="project-overview-add-members-close-button" />} toggle={() => setShowAddMember(false)}>Add Members</ModalHeader>
        <ModalBody>
          <label className="form-label">Members</label>
          <AsyncSelect
            testId="project-overview-add-members-search-members"
            key={existingMemberIds.join(",")}
            isMulti
            isClearable
            cacheOptions
            defaultOptions={defaultMemberOptions()}
            loadOptions={loadMemberOptions}
            components={{ Option: EmployeeDisplayInSelect }}
            classNamePrefix="lc-select"
            placeholder="Search members..."
            noOptionsMessage={({ inputValue }) =>
              inputValue ? "No employees found" : "Type to search"
            }
            loadingMessage={() => "Searching..."}
            value={newMembers}
            onChange={(selected) => setNewMembers(selected || [])}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
          />
          <div className="form-text">Select or search employees to add to this project.</div>
        </ModalBody>
        <ModalFooter>
          <Button data-testid="project-overview-add-members-cancel-button" color="light" onClick={() => setShowAddMember(false)}>Cancel</Button>
          <Button data-testid="project-overview-add-members-add-button" color="success" onClick={handleSaveMembers} disabled={savingMembers || newMembers.length === 0}>
            {savingMembers ? "Saving..." : "Add"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectOverview;
