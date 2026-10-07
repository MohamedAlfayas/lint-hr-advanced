import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Progress,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useDispatch, useSelector } from "react-redux";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import getChartColorsArray from "../../../component/common/dynamicColor/ChartsDynamicColor";
// import { setFormObj, toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { project_component_name } from "../../../common/constant/Constants";
import { EDIT_PROJECT_ACCESS_KEY } from "../../../common/constant/RoleConstants";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { PutApi } from "../../../common/api/PutApi";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import {
  editProject,
  setProjects,
} from "../../../redux/reducers/ChildReducer/ProjectsReducer";

const LIST_MAX_HEIGHT = 240; // Project Timeline's inner scroll area
const ACTIVITY_MAX_HEIGHT = 260; // recent activity feed
const RECENT_TASK_LIMIT = 15;
const COMPACT_LIST_MAX_HEIGHT = 130; // Project Progress / Task Status / Members lists — kept short so those 3 cards stay small

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

const ChartSquare = ({ max = 130, children }) => (
  <div
    style={{
      width: "100%",
      maxWidth: max,
      aspectRatio: "1 / 1",
      margin: "0 auto",
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────
// PROJECT PROGRESS DONUT (single value, green ring)
// ─────────────────────────────────────────────
const ProgressRadial = ({ percentage }) => {
  const series = [percentage ?? 0];
  const options = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: "68%" },
        track: { background: "#eef0f4", strokeWidth: "100%" },
        dataLabels: {
          name: {
            show: true,
            offsetY: 24,
            fontSize: "13px",
            fontWeight: 500,
            color: "#878a99",
          },
          value: {
            show: true,
            offsetY: -8,
            fontSize: "26px",
            fontWeight: 700,
            color: "#212529",
            formatter: (val) => `${parseInt(val)}%`,
          },
        },
      },
    },
    fill: { colors: ["#22c55e"] },
    stroke: { lineCap: "round" },
    labels: ["Completed"],
  };

  return (
    <ChartSquare>
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        width="100%"
        height="100%"
      />
    </ChartSquare>
  );
};

// ─────────────────────────────────────────────
// TASK STATUS DONUT (multi-color, center total)
// ─────────────────────────────────────────────
const TaskStatusDonut = ({ series, labels, colors, total }) => {
  const options = {
    labels: labels || [],
    chart: { type: "donut" },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Tasks",
              fontSize: "13px",
              color: "#878a99",
              formatter: () => total,
            },
            value: {
              fontSize: "26px",
              fontWeight: 700,
              color: "#212529",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ["#fff"] },
    colors: colors,
  };

  return (
    <ChartSquare>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        width="100%"
        height="100%"
      />
    </ChartSquare>
  );
};

// ─────────────────────────────────────────────
// SMALL STAT CARD (Total / Completed / In Progress / Pending / Overdue)
// ─────────────────────────────────────────────
const StatCard = ({ icon, label, value, tone }) => {
  const tones = {
    primary: { bg: "#eaf1ff", color: "#431ee7" },
    success: { bg: "#e8f9ef", color: "#22c55e" },
    info: { bg: "#e8f4fd", color: "#0d6efd" },
    warning: { bg: "#fff6e5", color: "#f59e0b" },
    danger: { bg: "#fdeceb", color: "#dc3545" },
  };
  const c = tones[tone] || tones.primary;

  return (
    <Card className="h-100 mb-0">
      <CardBody className="d-flex align-items-center gap-3 flex-wrap">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          style={{ width: 44, height: 44, background: c.bg, color: c.color, fontSize: 35 }}
        >
          <i className={icon}></i>
        </div>
        <div>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>{label}</p>
          <h4 className="mb-0">{value}</h4>
        </div>
      </CardBody>
    </Card>
  );
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
  const [activeTab, setActiveTab] = useState("overview");
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
  // EDIT PROJECT — opens the RightSideBar form pre-filled with the raw
  // project entity from redux (matches what ProjectForm expects: id,
  // title, type, client, description, start_date, deadline, price,
  // status). Do NOT pass the local `project` state here — that's a
  // display-only object transformed for this page's cards/timeline.
  // ─────────────────────────────────────────
  const handleEditProject = () => {
    // Redux first; fall back to localStorage if the page was opened directly / refreshed
    const projectToEdit =
      reduxProject ||
      (GetLocalStorageData("projects") || []).find(
        (p) => Number(p.id) === Number(projectId),
      );

    if (!projectToEdit) return;

    dispatch(setFormTitle(project_component_name));
    dispatch(setFormObj(projectToEdit));
    dispatch(setFormWidthPercentage("30%"));   // same width_per Projects.jsx passes
    dispatch(setComponentToShow(project_component_name));
    dispatch(toggleRSBView(true));
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

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    { bg: "#fce8e6", color: "#dc3545" },
    { bg: "#e8f4fd", color: "#0d6efd" },
    { bg: "#e8f9ef", color: "#198754" },
    { bg: "#fff8e1", color: "#f59e0b" },
    { bg: "#f3e8fd", color: "#6f42c1" },
    { bg: "#fde8f4", color: "#d63384" },
  ];

  
  const stats = useMemo(() => {
    const total = taskStatusRows.reduce((sum, r) => sum + r.count, 0);
    const completed = taskStatusRows
      .filter((r) => r.category === "done") // ← fixed: was "completed"
      .reduce((s, r) => s + r.count, 0);
    const inProgress = taskStatusRows
      .filter((r) => r.category === "in_progress")
      .reduce((s, r) => s + r.count, 0);
    const pending = taskStatusRows
      .filter((r) => r.category === "todo")
      .reduce((s, r) => s + r.count, 0);
    const overdue =
      taskStatusDetails?.overdue_task_count ??
      taskStatusDetails?.overdue_count ??   // keeps working if the API ever renames it
      0;
      return { total, completed, inProgress, pending, overdue };
  }, [taskStatusRows, taskStatusDetails]);

  const legendItems = [
    { label: "Completed", value: stats.completed, color: "#22c55e" },
    { label: "In Progress", value: stats.inProgress, color: "#0d6efd" },
    { label: "To Do", value: stats.pending, color: "#f59e0b" },
    { label: "Overdue", value: stats.overdue, color: "#dc3545" },
  ];

  const statusBadge = (status) => {
    const map = {
      in_progress: { text: "In Progress", cls: "bg-success-subtle text-success" },
      completed: { text: "Completed", cls: "bg-primary-subtle text-primary" },
      on_hold: { text: "On Hold", cls: "bg-warning-subtle text-warning" },
    };
    return map[status] || map.in_progress;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const getTaskTime = (t) =>
    new Date(t?.updated_on ?? t?.created_on ?? 0).getTime() || 0;
    // new Date(t?.created_at ?? t?.created_on ?? t?.updated_at ?? t?.start_time ?? 0).getTime() || 0;
    

  const formatDateTime = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${date}, ${time}`;
  };

  const recentTasks = useMemo(() => {
    const statuses = GetLocalStorageData("task_status") || [];
    const employees = GetLocalStorageData("employee") || [];

    return [...projectTasks]
      .sort((a, b) => getTaskTime(b) - getTaskTime(a) || Number(b.id) - Number(a.id)) // newest first
      .slice(0, RECENT_TASK_LIMIT) // 15 max – a new task pushes the oldest one out
      .map((t) => {
        const status = statuses.find((s) => Number(s.id) === Number(t.task_status));
        const emp = employees.find((e) => Number(e.id) === Number(t.assigned_to));
        return {
          id: t.id,
          title: t.title,
          statusName: status?.name || "-",
          statusColor: status?.color || "#808080",
          assignee: emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : "Unassigned",
          time: getTaskTime(t),
        };
      });
  }, [projectTasks]);

  const badge = statusBadge(project?.status);
  const percentComplete = taskStatusDetails?.project_completed_percentage ?? 0;

  return (
    <div className="pb-4 mb-2">
      {/* ───── EDIT PROJECT BUTTON — Overview-only, lives here so it never
              renders on the Task List or Files tabs ───── */}
      {canEditProject && (
        <div className="d-flex justify-content-end mb-3">
          <Button type="button" color="primary" size="sm" onClick={handleEditProject}>
            <i className="ri-edit-line align-middle me-1"></i>
            Edit Project
          </Button>
        </div>
      )}

      {/* ───── STAT CARDS ─────
              xxl: 5 across, xl/lg: 3 across (wraps to 2 rows), md: 2 across, xs: 1 across */}
      <Row className="g-3 mb-3">
        <Col xxl xl={4} lg={4} md={6} xs={12}><StatCard icon="ri-list-check-2" label="Total Tasks" value={stats.total} tone="primary" /></Col>
        <Col xxl xl={4} lg={4} md={6} xs={12}><StatCard icon="ri-checkbox-circle-fill" label="Completed" value={stats.completed} tone="success" /></Col>
        <Col xxl xl={4} lg={4} md={6} xs={12}><StatCard icon="ri-time-line" label="In Progress" value={stats.inProgress} tone="info" /></Col>
        <Col xxl xl={4} lg={4} md={6} xs={12}><StatCard icon="ri-todo-line" label="To Do" value={stats.pending} tone="warning" /></Col>
        <Col xxl xl={4} lg={4} md={6} xs={12}><StatCard icon="ri-alarm-warning-line" label="Overdue" value={stats.overdue} tone="danger" /></Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xl={4} lg={6} md={12}>
          <Card className="h-100">
            <CardBody className="py-3">
              <h5 className="mb-2" style={{ fontSize: 15 }}>Project Progress</h5>
              <Row className="align-items-center g-2">
                <Col sm={5} xs={12}>
                  <ProgressRadial percentage={percentComplete} />
                </Col>
                <Col sm={7} xs={12}>
                  <p className="text-muted mb-1" style={{ fontSize: 12 }}>
                    {stats.completed} of {stats.total} tasks completed
                  </p>
                  <Progress value={percentComplete} color="success" className="mb-2" style={{ height: 5 }} />
                  <SimpleBar style={{ maxHeight: COMPACT_LIST_MAX_HEIGHT }}>
                    <div className="pe-2">
                      {legendItems.map((item) => (
                        <div key={item.label} className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: 12 }}>
                          <span className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, background: item.color }}></span>
                            {item.label}
                          </span>
                          <span className="fw-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </SimpleBar>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4} lg={6} md={12}>
          <Card className="h-100">
            <CardBody className="py-3">
              <h5 className="mb-2" style={{ fontSize: 15 }}>Task Status</h5>
              <Row className="align-items-center g-2">
                <Col sm={5} xs={12}>
                  {donutSeries.length > 0 ? (
                    <TaskStatusDonut series={donutSeries} labels={donutLabels} colors={donutColors} total={stats.total} />
                  ) : (
                    <div className="text-center text-muted py-4">No data</div>
                  )}
                </Col>
                <Col sm={7} xs={12}>
                  <SimpleBar style={{ maxHeight: COMPACT_LIST_MAX_HEIGHT }}>
                    <div className="pe-2">
                      {taskStatusRows.map((row) => (
                        <div key={row.id} className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: 12 }}>
                          <span className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, background: row.color }}></span>
                            {row.name}
                          </span>
                          <span className="fw-semibold">{row.count}</span>
                        </div>
                      ))}
                      {taskStatusRows.length === 0 && <div className="text-muted">No task data available</div>}
                    </div>
                  </SimpleBar>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4} lg={12} md={12}>
          <Card className="h-100">
            <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
              <h5 className="mb-0" style={{ fontSize: 15 }}><i className="ri-team-line me-2"></i>Project Members</h5>
              {canEditProject && (
                <Button type="button" size="sm" color="primary" onClick={openAddMember}>
                  <i className="ri-add-line me-1"></i>Add Member
                </Button>
              )}
            </CardHeader>
            <CardBody className="py-2">
              <SimpleBar style={{ maxHeight: COMPACT_LIST_MAX_HEIGHT }}>
                <div className="pe-2">
                  {members.length > 0 ? (
                    members.map((member, index) => {
                      const colorSet = avatarColors[index % avatarColors.length];
                      return (
                        <div key={member?.id} className="d-flex align-items-center justify-content-between py-1 flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            {member?.profile_url ? (
                              <img src={member.profile_url} alt="" className="rounded-circle" style={{ width: 34, height: 34, objectFit: "cover" }} />
                            ) : (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 34, height: 34, background: colorSet.bg, color: colorSet.color, fontWeight: 600, fontSize: 12 }}
                              >
                                {getInitials(member?.first_name || member?.name)}
                              </div>
                            )}
                            <div>
                              <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>
                                {`${member?.first_name || ""} ${member?.last_name || ""}`.trim() || member?.name || "-"}
                              </p>
                              <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                {displayValue(member?.designation) !== "-" ? displayValue(member?.designation) : displayValue(member?.role, "Member")}
                              </p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-muted" style={{ fontSize: 11 }}>{member.taskCount} Tasks</span>
                            <i className="ri-more-2-fill text-muted" style={{ cursor: "pointer" }}></i>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted py-4">No members found</div>
                  )}
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={6} xs={12}>
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-3" style={{ fontSize: 15 }}><i className="ri-calendar-2-line me-2"></i>Project Timeline</h5>

              <div className="position-relative px-1 mb-3" style={{ height: 62 }}>
                <div
                  className="position-absolute rounded-pill"
                  style={{ top: 9, left: "9%", right: "9%", height: 4, background: "#eef0f4", zIndex: 0 }}
                >
                  <div
                    className="rounded-pill"
                    style={{
                      width: `${Math.min(Math.max(percentComplete, 0), 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #22c55e, #16a34a)",
                      transition: "width .4s ease",
                    }}
                  ></div>
                </div>

                <div className="d-flex align-items-start justify-content-between position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column align-items-center" style={{ width: 76 }}>
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 20, height: 20, background: "#22c55e", color: "#fff", fontSize: 12 }}
                    >
                      <i className="ri-check-line"></i>
                    </span>
                    <span className="mt-2 fw-semibold text-truncate" style={{ fontSize: 12, maxWidth: 76 }}>{formatDate(project?.createdAt)}</span>
                    <span className="text-muted" style={{ fontSize: 11 }}>Start Date</span>
                  </div>

                  <div className="d-flex flex-column align-items-center" style={{ width: 90 }}>
                    <span
                      className="rounded-circle d-inline-block flex-shrink-0"
                      style={{ width: 20, height: 20, background: "#0d6efd", border: "3px solid #fff", boxShadow: "0 0 0 3px rgba(13,110,253,0.25)" }}
                    ></span>
                    <span className="mt-2 fw-semibold text-primary" style={{ fontSize: 12 }}>Today · {percentComplete}%</span>
                    <span className="text-muted text-truncate" style={{ fontSize: 11, maxWidth: 90 }}>{badge.text}</span>
                  </div>

                  <div className="d-flex flex-column align-items-center" style={{ width: 76 }}>
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={
                        percentComplete >= 100
                          ? { width: 20, height: 20, background: "#22c55e", color: "#fff", fontSize: 12 }
                          : { width: 20, height: 20, background: "#fff", border: "3px solid #ced4da" }
                      }
                    >
                      {percentComplete >= 100 && <i className="ri-check-line"></i>}
                    </span>
                    <span className="mt-2 fw-semibold text-truncate" style={{ fontSize: 12, maxWidth: 76 }}>{formatDate(project?.dueDate)}</span>
                    <span className="text-muted" style={{ fontSize: 11 }}>Due Date</span>
                  </div>
                </div>
              </div>

              <SimpleBar style={{ maxHeight: LIST_MAX_HEIGHT }}>
                <div className="pe-2">
                  <div className="d-flex align-items-center justify-content-between p-2 rounded flex-wrap gap-2" style={{ background: "#f8f9fa" }}>
                    <span className="text-success" style={{ fontSize: 13 }}>
                      <i className="ri-checkbox-circle-fill me-1"></i>{percentComplete}% completed
                    </span>
                    {stats.overdue > 0 && (
                      <span className="text-danger" style={{ fontSize: 13 }}>
                        <i className="ri-error-warning-fill me-1"></i>{stats.overdue} overdue
                      </span>
                    )}
                  </div>
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
        </Col>

        <Col lg={6} xs={12} className="recent-activity-col">
          <style>{`
            .recent-activity-col { position: relative; }
            @media (min-width: 992px) {
              .recent-activity-col > .card { position: absolute; inset: 0; }
            }
          `}</style>

          <Card className="h-100 d-flex flex-column mb-0">
            <CardHeader className="d-flex align-items-center justify-content-between flex-shrink-0">
              <h5 className="mb-0"><i className="ri-history-line me-2"></i>Recent Activity</h5>
            </CardHeader>

            <CardBody className="flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
              <SimpleBar style={{ height: "100%", maxHeight: ACTIVITY_MAX_HEIGHT }}>
                <div className="pe-2">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div key={task.id} className="d-flex align-items-start gap-2 mb-3">
                        <span
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 30, height: 30, background: "#f3f6f9", color: task.statusColor }}
                        >
                          <i className="ri-task-line" style={{ fontSize: 14 }}></i>
                        </span>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: 13 }} title={task.title}>
                            {task.title}
                          </p>
                          <p className="mb-0 text-muted d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: 12 }}>
                            <span className="d-inline-flex align-items-center gap-1">
                              <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, background: task.statusColor }}></span>
                              {task.statusName}
                            </span>
                            <span>· {task.assignee}</span>
                          </p>
                        </div>

                        <span className="text-muted flex-shrink-0" style={{ fontSize: 11 }}>
                          {formatDateTime(task.time)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No recent tasks yet</div>
                  )}
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal isOpen={showAddMember} toggle={() => setShowAddMember(false)} centered>
        <ModalHeader toggle={() => setShowAddMember(false)}>Add Members</ModalHeader>
        <ModalBody>
          <label className="form-label">Members</label>
          <AsyncSelect
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
          <Button color="light" onClick={() => setShowAddMember(false)}>Cancel</Button>
          <Button color="success" onClick={handleSaveMembers} disabled={savingMembers || newMembers.length === 0}>
            {savingMembers ? "Saving..." : "Add"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectOverview;