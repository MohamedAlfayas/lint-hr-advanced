import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";
import { task_list_component_name } from "../../../common/constant/Constants";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  toggleRSBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  setTasks,
  editTask,
} from "../../../redux/reducers/ChildReducer/TaskReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Api } from "../../../common/api/Api";
import { PutApi } from "../../../common/api/PutApi";
import Swal from "sweetalert2";

// ─── Fallback columns ──────────────────────────────────────────────
const FALLBACK_COLUMNS = [
  {
    id: 1,
    title: "To Do",
    icon: "ri-checkbox-blank-circle-line",
    color: "secondary",
  },
  { id: 2, title: "In Progress", icon: "ri-loader-4-line", color: "primary" },
  { id: 3, title: "In Review", icon: "ri-eye-line", color: "warning" },
  { id: 4, title: "On Hold", icon: "ri-pause-circle-line", color: "info" },
  { id: 5, title: "Done", icon: "ri-checkbox-circle-line", color: "success" },
];

const STATUS_ICONS = [
  "ri-checkbox-blank-circle-line",
  "ri-loader-4-line",
  "ri-eye-line",
  "ri-pause-circle-line",
  "ri-checkbox-circle-line",
  "ri-git-branch-line",
  "ri-time-line",
  "ri-close-circle-line",
];
const STATUS_COLORS = [
  "secondary",
  "primary",
  "warning",
  "info",
  "success",
  "danger",
  "dark",
  "light",
];

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(end_time) {
  if (!end_time) return false;
  return new Date(end_time) < new Date();
}

function buildColumns(taskStatusList) {
  if (!Array.isArray(taskStatusList) || taskStatusList.length === 0) {
    return FALLBACK_COLUMNS;
  }

  const firstItem = taskStatusList.filter((s) => Number(s.id) === 1);
  const lastItem = taskStatusList.filter((s) => Number(s.id) === 3);
  const middleItems = taskStatusList
    .filter((s) => Number(s.id) !== 1 && Number(s.id) !== 3)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sortedList = [...firstItem, ...middleItems, ...lastItem];

  return sortedList.map((s, idx) => ({
    id: Number(s.id),
    title: s.title || s.name || `Status ${s.id}`,
    icon: STATUS_ICONS[idx % STATUS_ICONS.length],
    color: STATUS_COLORS[idx % STATUS_COLORS.length],
  }));
}

function buildPriorityMap(taskPriorityList) {
  if (!Array.isArray(taskPriorityList) || taskPriorityList.length === 0) {
    return {
      1: { label: "Low", color: "#28a745" },
      2: { label: "Medium", color: "#ffc107" },
      3: { label: "High", color: "#dc3545" },
    };
  }
  return taskPriorityList.reduce((acc, p) => {
    acc[Number(p.id)] = {
      label: p.name || `Priority ${p.id}`,
      color: p.color || "#6c757d",
    };
    return acc;
  }, {});
}

function buildEmployeeMap(employeeList) {
  if (!Array.isArray(employeeList) || employeeList.length === 0) return {};
  return employeeList.reduce((acc, emp) => {
    const firstName = emp.first_name || "";
    const lastName = emp.last_name || "";
    const fullName = `${firstName}`.trim() || `#${emp.id}`;
    const profile = emp.profile_url || "";
    const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase();
    acc[Number(emp.id)] = {
      name: fullName,
      initials: initials || `${emp.id}`,
      profile,
    };
    return acc;
  }, {});
}

// ─── Avatar helpers ────────────────────────────────────────────────
const AVATAR_BG_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];
function avatarBg(id) {
  return AVATAR_BG_COLORS[Number(id) % AVATAR_BG_COLORS.length];
}

// ─── Inline styles ─────────────────────────────────────────────────
const styles = {
  boardWrapper: {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-x",
    paddingBottom: 12,
    position: "relative",
  },

  boardInner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    width: "max-content",
    minWidth: "100%",
    paddingBottom: 8,
  },

  column: {
    width: 350,
    minWidth: 350,
    maxWidth: 350,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },

  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: "10px 10px 0 0",
    border: "1px solid var(--vz-border-color)",
    borderBottom: "none",
    background: "var(--vz-card-bg)",
    minHeight: 52,
  },

  dropZone: (isOver) => ({
    minHeight: 320,
    padding: 8,
    background: isOver
      ? "rgba(var(--vz-primary-rgb),0.05)"
      : "var(--vz-secondary-bg,#f3f3f9)",
    borderRadius: "0 0 10px 10px",
    border: `1px solid ${
      isOver ? "var(--vz-primary)" : "var(--vz-border-color)"
    }`,
    borderTop: "none",
    transition: "all 0.2s ease",
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "calc(100vh - 300px)",
    flex: 1,
  }),

  taskCard: {
    cursor: "grab",
    border: "1px solid var(--vz-border-color)",
    borderRadius: 10,
    marginBottom: 10,
    background: "var(--vz-card-bg)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "all 0.2s ease",
    overflow: "hidden",
  },
};

// ─── AvatarCircle ──────────────────────────────────────────────────
function AvatarCircle({ id, employeeMap, size = 22, fontSize = 9 }) {
  const numId = Number(id);
  const emp = employeeMap[numId];
  const display = emp ? emp.initials : String(id);
  const title = emp ? emp.name : `User #${id}`;

  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 600,
        border: "2px solid var(--vz-card-bg)",
        background: avatarBg(numId),
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {emp?.profile ? (
        <img
          src={emp.profile}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        display
      )}
    </div>
  );
}

// ─── TaskCard ──────────────────────────────────────────────────────
function TaskCard({
  task,
  priorityMap,
  employeeMap,
  onDragStart,
  onEdit,
  onDelete,
}) {
  const priority = priorityMap[Number(task.task_priority)] || {
    label: "Normal",
    color: "#6c757d",
  };
  const overdue = isOverdue(task.end_time);
  const collabs = task.collaborators_id_list || [];
  // ✅ only relevant for client-related tasks
  const showFieldVisitBadge =
    task.related_to === "client" && !!task.requires_field_visit;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      style={styles.taskCard}
    >
      <div style={{ padding: "10px 12px" }}>
        {/* Priority + menu */}
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex flex-wrap gap-1">
            <span
              className="badge fs-11 d-inline-flex align-items-center gap-1"
              style={{
                background: priority.color + "22",
                color: priority.color,
                border: `1px solid ${priority.color}44`,
                fontWeight: 600,
              }}
            >
              <i className="ri-flag-2-line"></i>
              {priority.label}
            </span>

            {/* Field Visit badge */}
            {showFieldVisitBadge && (
              <span
                className="badge fs-11 d-inline-flex align-items-center gap-1 badge-soft-info"
                title="Requires Field Visit"
              >
                <i className="ri-map-pin-line"></i>
                Field Visit
              </span>
            )}
          </div>

          <UncontrolledDropdown>
            <DropdownToggle
              tag="button"
              className="btn btn-ghost-secondary btn-icon btn-sm"
              style={{ lineHeight: 1 }}
            >
              <i className="ri-more-2-fill fs-16"></i>
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem onClick={() => onEdit(task)}>
                <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>
                Edit
              </DropdownItem>
              <DropdownItem
                className="text-danger"
                onClick={() => onDelete(task.id)}
              >
                <i className="ri-delete-bin-2-line align-bottom me-2"></i>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>

        {/* Title */}
        <h6
          className="fs-13 mb-1 fw-semibold"
          style={{ lineHeight: 1.4 }}
          title={task.title}
        >
          {task.title}
        </h6>

        {/* Description */}
        {task.description && (
          <p
            className="text-muted fs-12 mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {task.description}
          </p>
        )}

        {/* Tags */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {task.related_to && (
            <span className="badge badge-soft-info fs-10">
              <i className="ri-links-line align-bottom me-1"></i>
              {task.related_to}
            </span>
          )}
          {task.points && (
            <span className="badge badge-soft-warning fs-10">
              <i className="ri-star-line align-bottom me-1"></i>
              {task.points} pts
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="d-flex align-items-center gap-2 mb-2 fs-11 text-muted">
          <i className="ri-calendar-event-line"></i>
          <span className={overdue ? "text-danger fw-semibold" : ""}>
            {formatDate(task.start_time)} → {formatDate(task.end_time)}
            {overdue && (
              <i className="ri-alarm-warning-line ms-1 text-danger"></i>
            )}
          </span>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
          <div
            className="d-flex align-items-center"
            style={{ flexWrap: "nowrap", gap: 0 }}
          >
            {collabs.slice(0, 3).map((cid) => (
              <span
                key={cid}
                title={employeeMap[Number(cid)]?.name || `User #${cid}`}
                style={{ marginRight: -5, display: "inline-flex" }}
              >
                <AvatarCircle id={cid} employeeMap={employeeMap} />
              </span>
            ))}
            {collabs.length > 3 && (
              <span style={{ marginRight: -5, display: "inline-flex" }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    border: "2px solid var(--vz-card-bg)",
                    background: "#6c757d",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  +{collabs.length - 3}
                </div>
              </span>
            )}
            {collabs.length > 0 && (
              <span className="fs-11 text-muted" style={{ marginLeft: 10 }}>
                {employeeMap[Number(collabs[0])]?.name || `#${collabs[0]}`}
                {collabs.length > 1 && (
                  <span className="text-muted"> +{collabs.length - 1}</span>
                )}
              </span>
            )}
          </div>

          {task.assigned_to && (
            <div
              className="d-flex align-items-center gap-1 text-muted fs-11"
              style={{ flexShrink: 0, marginLeft: 6 }}
            >
              <AvatarCircle
                id={task.assigned_to}
                employeeMap={employeeMap}
                size={20}
                fontSize={8}
              />
              <span
                style={{
                  maxWidth: 70,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {employeeMap[Number(task.assigned_to)]?.name ||
                  `#${task.assigned_to}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KanbanColumn ──────────────────────────────────────────────────
function KanbanColumn({
  column,
  tasks,
  priorityMap,
  employeeMap,
  onDragStart,
  onDrop,
  onDragOver,
  onEdit,
  onDelete,
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div style={styles.column}>
      <div style={styles.columnHeader}>
        <div className="d-flex align-items-center gap-2">
          <span className={`text-${column.color} fs-15`}>
            <i className={column.icon}></i>
          </span>
          <h6 className="mb-0 fw-semibold fs-13">{column.title}</h6>
          <span
            className={`badge badge-soft-${column.color} fs-10 ms-1`}
            style={{ minWidth: 22, textAlign: "center" }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
          onDragOver(e);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          onDrop(e, column.id);
        }}
        style={styles.dropZone(isOver)}
      >
        {tasks.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center text-muted"
            style={{ minHeight: 100, opacity: 0.45 }}
          >
            <i className="ri-inbox-line fs-24 mb-1"></i>
            <span className="fs-12">No tasks</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              priorityMap={priorityMap}
              employeeMap={employeeMap}
              onDragStart={onDragStart}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
const TaskKanban = ({ searchQuery = "" }) => {
  const dispatch = useDispatch();

  const tasks = useSelector(
    (state) =>
      state.TaskReducer?.tasks ?? state.Task?.tasks ?? state.task?.tasks ?? [],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const draggedTask = useRef(null);
  const boardScrollRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, scrollLeft: 0 });

  // ── Build lookup maps from localStorage ──────────────────────────
  const taskStatusList = (GetLocalStorageData("task_status") || []).filter(
    (s) => s.status === true,
  );
  const taskPriorityList = GetLocalStorageData("task_priority") || [];
  const employeeList = GetLocalStorageData("employee") || [];

  const columns = buildColumns(taskStatusList);
  const priorityMap = buildPriorityMap(taskPriorityList);
  const employeeMap = buildEmployeeMap(employeeList);

  // ── Fetch tasks on mount ──────────────────────────────────────────
  useEffect(() => {
    const getAllTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.get("/task/");
        // ✅ FIX: API returns { data: [...] } — a flat array, not { external, internal }
        const fetchedTasks = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        dispatch(setTasks(fetchedTasks));
      } catch (err) {
        console.error("Task Fetch Error:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getAllTasks();
  }, [dispatch]);

  // ── Filtering ─────────────────────────────────────────────────────
  const activeTasks = tasks.filter((t) => t.status === true);

  const filteredTasks = activeTasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  function getTasksForColumn(columnId) {
    return filteredTasks.filter(
      (t) => Number(t.task_status) === Number(columnId),
    );
  }

  // ── Drag & drop ───────────────────────────────────────────────────
  function handleDragStart(e, task) {
    draggedTask.current = task;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // ── Click & drag to scroll (outside cards) ────────────────────────
  function handlePanMouseDown(e) {
    if (e.target.closest("[draggable='true']")) return;
    if (e.button !== 0) return;
    const rect = boardScrollRef.current.getBoundingClientRect();
    const clickedOnScrollbar =
      e.clientY > rect.bottom - 17 &&
      boardScrollRef.current.scrollWidth > boardScrollRef.current.clientWidth;
    if (clickedOnScrollbar) return;
    isPanning.current = true;
    panStart.current = {
      x: e.pageX,
      scrollLeft: boardScrollRef.current.scrollLeft,
    };
    boardScrollRef.current.style.cursor = "grabbing";
  }

  function handlePanMouseMove(e) {
    if (!isPanning.current) return;
    e.preventDefault();
    const dx = e.pageX - panStart.current.x;
    boardScrollRef.current.scrollLeft = panStart.current.scrollLeft - dx;
  }

  function handlePanMouseUp() {
    isPanning.current = false;
    if (boardScrollRef.current) {
      boardScrollRef.current.style.cursor = "default";
    }
  }

  async function handleDrop(e, targetColumnId) {
    e.preventDefault();
    const task = draggedTask.current;
    draggedTask.current = null;

    if (!task || Number(task.task_status) === Number(targetColumnId)) return;

    const optimisticTask = { ...task, task_status: Number(targetColumnId) };
    dispatch(editTask(optimisticTask));

    const payload = {
      id: task.id,
      task_status: Number(targetColumnId),
    };

    setUpdatingIds((prev) => new Set(prev).add(task.id));
    try {
      const response = await PutApi(`task/`, payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const serverData = response?.data?.data;
        if (serverData) {
          dispatch(editTask(serverData));
        }
      } else {
        dispatch(editTask(task));
        console.error("Status update failed:", response);
      }
    } catch (err) {
      dispatch(editTask(task));
      console.error("Status update error:", err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  // ── Delete handler ────────────────────────────────────────────────
  async function handleDelete(taskId) {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "You won't be able to revert this task.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await Api.delete("/task/", {
        data: { id: taskId },
      });

      if (response?.status === 200 || response?.status === 201) {
        dispatch(setTasks(tasks.filter((item) => item.id !== taskId)));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response?.data?.message || "Task Deleted Successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: response?.data?.message || "Failed to delete task",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error?.response?.data?.message || "Failed to delete task",
      });
    }
  }

  // ── Edit handler ──────────────────────────────────────────────────
  function handleEdit(task) {
    dispatch(setFormObj(task));
    dispatch(setFormTitle("Edit Task"));
    dispatch(setComponentToShow(task_list_component_name));
    dispatch(toggleRSBView(true));
  }

  // ── Add handler ───────────────────────────────────────────────────
  function handleAddTask() {
    dispatch(setFormObj({}));
    dispatch(setFormTitle("Add Task"));
    dispatch(setComponentToShow(task_list_component_name));
    dispatch(toggleRSBView(true));
  }

  // ── Stats ─────────────────────────────────────────────────────────
  const totalTasks = activeTasks.length;
  const doneColumnId = columns[columns.length - 1]?.id;
  const doneTasks = activeTasks.filter(
    (t) => Number(t.task_status) === Number(doneColumnId),
  ).length;
  const overdueTasks = activeTasks.filter(
    (t) =>
      isOverdue(t.end_time) && Number(t.task_status) !== Number(doneColumnId),
  ).length;
  const progressPct =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Top Bar */}
      <Card className="mb-3">
        <CardBody className="pb-0">
          <Row className="g-2 align-items-center">
            <Col xs="auto">
              <Button color="primary" size="sm" onClick={handleAddTask}>
                <i className="ri-add-line align-bottom me-1"></i>Add Task
              </Button>
            </Col>
            <Col xs={12} sm="auto" className="ms-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-1 text-muted fs-13">
                  <i className="ri-task-line fs-15 text-primary"></i>
                  <span className="fw-medium text-dark">{totalTasks}</span>
                  <span>Total</span>
                </div>
                <div className="d-flex align-items-center gap-1 text-muted fs-13">
                  <i className="ri-checkbox-circle-line fs-15 text-success"></i>
                  <span className="fw-medium text-dark">{doneTasks}</span>
                  <span>Done</span>
                </div>
                {overdueTasks > 0 && (
                  <div className="d-flex align-items-center gap-1 text-muted fs-13">
                    <i className="ri-alarm-warning-line fs-15 text-danger"></i>
                    <span className="fw-medium text-danger">
                      {overdueTasks}
                    </span>
                    <span>Overdue</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {totalTasks > 0 && (
            <div className="mt-3 pb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted fs-12">Overall progress</span>
                <span className="fs-12 fw-medium text-success">
                  {progressPct}%
                </span>
              </div>
              <div className="progress" style={{ height: 4 }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${progressPct}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Error */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 mb-3"
          role="alert"
        >
          <i className="ri-error-warning-line fs-16"></i>
          <span>{error}</span>
          <Button
            color="link"
            size="sm"
            className="ms-auto p-0 text-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted mt-2 fs-14">Loading tasks…</p>
        </div>
      ) : (
        <div
          className="kanban-scroll-wrapper"
          style={styles.boardWrapper}
          ref={boardScrollRef}
          onMouseDown={handlePanMouseDown}
          onMouseMove={handlePanMouseMove}
          onMouseUp={handlePanMouseUp}
          onMouseLeave={handlePanMouseUp}
        >
          <div style={styles.boardInner}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={getTasksForColumn(col.id)}
                priorityMap={priorityMap}
                employeeMap={employeeMap}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskKanban;
