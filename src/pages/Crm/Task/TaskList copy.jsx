import React, { useEffect, useMemo, useState, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch, useSelector } from "react-redux";
import { setTasks } from "../../../redux/reducers/ChildReducer/TaskReducer";
import { Api } from "../../../common/api/Api";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { task_list_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  setTaskListFilterKeys,
  resetLeaveTypeTableFilterKeys,
  resetTaskListFilterKeys,
} from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import InfoTable from "../../../component/common/table/InfoTable";
import TaskDetailModal from "./Modal/TaskDetailModal";
import {
  getLabel,
  getEmployeeName,
  getEmployeeProfile,
} from "../Task/Modal/Taskhelpers";

// ─────────────────────────────────────────────────────────────────────────────
const Tasks = ({ projectId = null }) => {
  const dispatch = useDispatch();

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [detailModal, setDetailModal] = useState({ open: false, taskId: null });

  // ── Redux ───────────────────────────────────────────────────────────────────
  // FIX: reducer now uses `tasks` (was `task_data`)
  const { tasks: task_data } = useSelector((state) => state.TaskReducer);

  const { task_list_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );

  const displayedTasks = useMemo(() => {
    if (!Array.isArray(task_data)) return [];

    let filtered = [...task_data];

    // Project Page Filter
    if (projectId !== null && projectId !== undefined) {
      filtered = filtered.filter(
        (task) => String(task?.project || "") === String(projectId),
      );
    }

    // Project
    if (
      task_list_filter_keys?.project_id !== null &&
      task_list_filter_keys?.project_id !== 0
    ) {
      filtered = filtered.filter(
        (task) =>
          Number(task?.project || 0) ===
          Number(task_list_filter_keys.project_id),
      );
    }

    // Client
    if (
      task_list_filter_keys?.client_id !== null &&
      task_list_filter_keys?.client_id !== 0
    ) {
      filtered = filtered.filter(
        (task) =>
          Number(task?.client || 0) === Number(task_list_filter_keys.client_id),
      );
    }

    // Assigned To
    if (
      task_list_filter_keys?.assigned_to !== null &&
      task_list_filter_keys?.assigned_to !== 0
    ) {
      filtered = filtered.filter(
        (task) =>
          Number(task?.assigned_to || 0) ===
          Number(task_list_filter_keys.assigned_to),
      );
    }

    // Collaborators
    if (
      Array.isArray(task_list_filter_keys?.collaborator_id) &&
      task_list_filter_keys.collaborator_id.length > 0
    ) {
      filtered = filtered.filter((task) => {
        const collaborators = Array.isArray(task?.collaborators_id_list)
          ? task.collaborators_id_list
          : [];
        return task_list_filter_keys.collaborator_id.some((id) =>
          collaborators.includes(id),
        );
      });
    }

    // Task Status
    if (
      task_list_filter_keys?.task_status !== null &&
      task_list_filter_keys?.task_status !== 0
    ) {
      filtered = filtered.filter(
        (task) =>
          Number(task?.task_status || 0) ===
          Number(task_list_filter_keys.task_status),
      );
    }

    // Task Priority
    if (
      task_list_filter_keys?.task_priority !== null &&
      task_list_filter_keys?.task_priority !== 0
    ) {
      filtered = filtered.filter(
        (task) =>
          Number(task?.task_priority || 0) ===
          Number(task_list_filter_keys.task_priority),
      );
    }

    return filtered;
  }, [task_data, projectId, task_list_filter_keys]);

  // ── Fetch all tasks on mount ────────────────────────────────────────────────
  useEffect(() => {
    getAllTasks();
    dispatch(resetTaskListFilterKeys());
  }, []);

  const getAllTasks = async () => {
    try {
      const response = await Api.get("/task/");
      dispatch(setTasks(response?.data?.data || []));
    } catch (error) {
      console.log("Task Fetch Error :", error);
    }
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const openTaskDetail = useCallback((taskId) => {
    setDetailModal({ open: true, taskId });
  }, []);

  const closeTaskDetail = useCallback(() => {
    setDetailModal({ open: false, taskId: null });
  }, []);

  // ── Table columns ───────────────────────────────────────────────────────────
  const additionalColumn = useMemo(
    () => [
      {
        Header: "Title",
        id: "title",
        filterable: false,
        accessor: (obj) => {
          const plainDescription =
            obj.description?.replace(/<[^>]*>/g, "") || "";

          const statuses = GetLocalStorageData("task_status") || [];

          const statusObj = statuses.find(
            (s) => Number(s.id) === Number(obj.task_status),
          );

          const statusName = (statusObj?.name || "").toLowerCase();

          let progress = 0;
          let progressColor = "bg-danger";

          if (statusName.includes("not started")) {
            progress = 0;
            progressColor = "bg-danger";
          } else if (statusName.includes("in progress")) {
            progress = 50;
            progressColor = "bg-warning";
          } else if (
            statusName.includes("review") ||
            statusName.includes("testing")
          ) {
            progress = 80;
            progressColor = "bg-info";
          } else if (
            statusName.includes("completed") ||
            statusName.includes("complete") ||
            statusName.includes("done")
          ) {
            progress = 100;
            progressColor = "bg-success";
          }

          return (
            <div>
              <b
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => openTaskDetail(obj.id)}
              >
                {obj.title}
              </b>

              {plainDescription && (
                <div
                  title={plainDescription}
                  style={{
                    fontSize: "13px",
                    color: "#6c757d",
                    marginTop: "4px",
                  }}
                >
                  {plainDescription.length > 60
                    ? `${plainDescription.substring(0, 60)}...`
                    : plainDescription}
                </div>
              )}

              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#6c757d",
                    }}
                  >
                    {statusObj?.name || "Not Started"}
                  </small>

                  <small
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#495057",
                    }}
                  >
                    {progress}%
                  </small>
                </div>

                <div
                  className="progress"
                  style={{
                    height: "8px",
                    borderRadius: "20px",
                    backgroundColor: "#e9ecef",
                  }}
                >
                  <div
                    className={`progress-bar ${progressColor}`}
                    role="progressbar"
                    style={{
                      width: `${progress}%`,
                      borderRadius: "20px",
                      transition: "all .4s ease",
                    }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            </div>
          );
        },
      },

      {
        Header: "Related To",
        id: "related_to",
        filterable: false,
        accessor: (obj) => (
          <span className="text-capitalize">{obj.related_to || "-"}</span>
        ),
      },

      {
        Header: "Project / Client",
        id: "project_client",
        filterable: false,
        accessor: (obj) => {
          if (obj.related_to === "project" && obj.project) {
            return (
              <span>
                <i className="ri-projector-line me-1 text-primary" />
                {getLabel("projects", obj.project, "title")}
              </span>
            );
          }
          if (obj.related_to === "client" && obj.client) {
            return (
              <span>
                <i className="ri-building-line me-1 text-info" />
                {getLabel("clients", obj.client, "name")}
              </span>
            );
          }
          return "-";
        },
      },

      {
        Header: "Assigned To",
        id: "assigned_to",
        filterable: false,
        accessor: (obj) => {
          const employee = getEmployeeProfile(obj.assigned_to);
          const avatarSize = window.innerWidth < 768 ? 24 : 32;
          return (
            <div className="d-flex align-items-center">
              <div
                data-bs-toggle="tooltip"
                title={employee.name}
                style={{ flexShrink: 0 }}
              >
                {employee.profile_url ? (
                  <img
                    src={employee.profile_url}
                    alt={employee.name}
                    style={{
                      width: `${avatarSize}px`,
                      height: `${avatarSize}px`,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #fff",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: `${avatarSize}px`,
                      height: `${avatarSize}px`,
                      borderRadius: "50%",
                      background: "#0ab39c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: avatarSize * 0.4,
                      border: "2px solid #fff",
                    }}
                  >
                    {employee.initial}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },

      {
        Header: "Collaborators",
        id: "collaborators",
        filterable: false,
        accessor: (obj) => {
          const collaboratorIds = obj?.collaborators_id_list || [];
          const collaborators = collaboratorIds
            .map((id) => getEmployeeProfile(id))
            .slice(0, 2);
          const extraCount =
            collaboratorIds.length > 2 ? collaboratorIds.length - 2 : 0;
          const avatarSize = window.innerWidth < 768 ? 24 : 34;
          return (
            <div className="d-flex align-items-center">
              {collaborators.map((emp, index) => (
                <div
                  key={index}
                  data-bs-toggle="tooltip"
                  title={emp.name}
                  style={{
                    marginLeft: index !== 0 ? `-${avatarSize / 3}px` : "0",
                    zIndex: 10 - index,
                    flexShrink: 0,
                  }}
                >
                  {emp.profile_url ? (
                    <img
                      src={emp.profile_url}
                      alt={emp.name}
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #fff",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        borderRadius: "50%",
                        background: "#0ab39c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: avatarSize * 0.4,
                        border: "2px solid #fff",
                      }}
                    >
                      {emp.initial}
                    </div>
                  )}
                </div>
              ))}
              {extraCount > 0 && (
                <div
                  style={{
                    width: `${avatarSize}px`,
                    height: `${avatarSize}px`,
                    borderRadius: "50%",
                    background: "#0ab39c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: avatarSize * 0.35,
                    marginLeft: `-${avatarSize / 3}px`,
                    border: "2px solid #fff",
                    flexShrink: 0,
                  }}
                >
                  +{extraCount}
                </div>
              )}
            </div>
          );
        },
      },

      {
        Header: "Priority",
        id: "task_priority",
        filterable: false,
        accessor: (obj) => {
          const priorities = GetLocalStorageData("task_priority") || [];
          const priority = priorities.find((p) => p.id === obj.task_priority);
          if (!priority) return "-";
          return (
            <span
              className="badge"
              style={{
                backgroundColor: priority.color || "#ccc",
                color: "#333",
              }}
            >
              {priority.name}
            </span>
          );
        },
      },

      {
        Header: "Status",
        id: "task_status",
        filterable: false,
        accessor: (obj) => {
          const statuses = GetLocalStorageData("task_status") || [];
          const status = statuses.find((s) => s.id === obj.task_status);
          if (!status) return "-";
          return (
            <span
              className="badge"
              style={{ backgroundColor: status.color || "#ccc", color: "#333" }}
            >
              {status.name}
            </span>
          );
        },
      },

      {
        Header: "Start Time",
        id: "start_time",
        filterable: false,
        accessor: (obj) =>
          obj.start_time ? new Date(obj.start_time).toLocaleString() : "-",
      },

      {
        Header: "End Time",
        id: "end_time",
        filterable: false,
        accessor: (obj) =>
          obj.end_time ? new Date(obj.end_time).toLocaleString() : "-",
      },

      {
        Header: "Active",
        id: "status",
        filterable: false,
        accessor: (obj) => {
          const label = obj.status ? "Active" : "Inactive";
          const cls = obj.status ? "success" : "warning";
          return (
            <span
              className={`badge text-uppercase bg-${cls}-subtle text-${cls}`}
            >
              {label}
            </span>
          );
        },
      },
    ],
    [openTaskDetail],
  );

  // ── Initial form object ─────────────────────────────────────────────────────
  const initialFormObj = useMemo(
    () => ({
      id: 0,
      title: "",
      description: "",
      related_to: "project",
      project: null,
      client: null,
      points: "",
      assigned_to: null,
      collaborators_id_list: [],
      task_status: null,
      task_priority: null,
      start_time: "",
      end_time: "",
    }),
    [],
  );

  // ── Filter options ──────────────────────────────────────────────────────────
  const filterKey = "status";

  const filterOptions = useMemo(
    () => [
      {
        option: true,
        label: "Active",
        count: displayedTasks?.filter((e) => e[filterKey] === true).length || 0,
      },
      {
        option: false,
        label: "Inactive",
        count:
          displayedTasks?.filter((e) => e[filterKey] === false).length || 0,
      },
    ],
    [displayedTasks],
  );

  document.title = `Tasks | ${MetaTitle}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={displayedTasks}
        formname={task_list_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
        table_class={"Lc_leave_apply_table me-n3 ms-n3"}
      />

      <TaskDetailModal
        isOpen={detailModal.open}
        toggle={closeTaskDetail}
        taskId={detailModal.taskId}
        dispatch={dispatch}
        task_list_component_name={task_list_component_name}
        onTaskClosed={getAllTasks}
        onTaskDeleted={getAllTasks}
      />
    </React.Fragment>
  );
};

export default Tasks;
