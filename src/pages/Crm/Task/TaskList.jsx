import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import "react-toastify/dist/ReactToastify.css";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";
import { useDispatch, useSelector } from "react-redux";
import { setTasks } from "../../../redux/reducers/ChildReducer/TaskReducer";
import { Api } from "../../../common/api/Api";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { task_list_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { resetTaskListFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import InfoTable from "../../../component/common/table/InfoTable";
import TaskDetailModal from "./Modal/TaskDetailModal";
import { getLabel } from "../Task/Modal/Taskhelpers";
import {
  ApvActive,
  ApvChip,
  ApvColorTag,
  ApvEmployee,
  ApvEmpty,
  ApvPeople,
  ApvStatus,
  ApvTitle,
} from "../../../component/common/approval/ApprovalCells";
import {
  hasPageCache,
  writePageCache,
} from "../../../common/js/pageLoadCache";

const DEFAULT_PAGE_SIZE = 25;

// ─── Helper: find the task array in any API response shape ───────────────────
// Handles: [..] | {data:[..]} | {results:[..]} | {data:{results:[..]}} | ...
const pickList = (node, depth = 0) => {
  if (Array.isArray(node)) return node;
  if (!node || typeof node !== "object" || depth > 3) return null;
  for (const key of ["results", "data", "items", "tasks"]) {
    const found = pickList(node[key], depth + 1);
    if (found) return found;
  }
  return null;
};

// ─── Helper: newest first (created time if available, else id) ───────────────
const getCreatedTs = (task) => {
  const raw = task?.created_time || task?.created_at || task?.created_on;
  if (!raw) return null;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? null : ts;
};

const sortNewestFirst = (a, b) => {
  const ta = getCreatedTs(a);
  const tb = getCreatedTs(b);
  if (ta !== null && tb !== null && ta !== tb) return tb - ta;
  return Number(b?.id || 0) - Number(a?.id || 0);
};

const employeeById = (id) =>
  id == null
    ? null
    : (GetLocalStorageData("employee") || []).find((e) => String(e.id) === String(id)) || null;

// ─────────────────────────────────────────────────────────────────────────────
const Tasks = ({ projectId = null, clientId = null, searchQuery = "" }) => {
  const dispatch = useDispatch();

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [detailModal, setDetailModal] = useState({ open: false, taskId: null });

  // ── Pagination state ────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  // ── Loading + stale-response guard ──────────────────────────────────────────
  const requestIdRef = useRef(0);
  const tasksRef = useRef([]);

  const handlePaginationChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  // ── Redux ───────────────────────────────────────────────────────────────────
  const { tasks: task_data } = useSelector((state) => state.TaskReducer);
  const { task_list_filter_keys, task_date_range } = useSelector(
    (state) => state.TableFilterReducer,
  );

  tasksRef.current = Array.isArray(task_data) ? task_data : [];
  const [isLoading, setIsLoading] = useState(
    () => !hasPageCache("tasks:visited"),
  );

  // Date range filter (server-side) — YYYY-MM-DD, kept outside
  // task_list_filter_keys so InfoTable can't match it against row fields.
  const startDate = task_date_range?.start_date || null;
  const endDate = task_date_range?.end_date || null;

  const displayedTasks = useMemo(() => {
    if (!Array.isArray(task_data)) return [];

    let filtered = [...task_data];

    if (projectId !== null && projectId !== undefined) {
      filtered = filtered.filter(
        (task) => String(task?.project || "") === String(projectId),
      );
    }

    if (clientId !== null && clientId !== undefined) {
      filtered = filtered.filter(
        (task) => String(task?.client || "") === String(clientId),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(q) ||
          task.description
            ?.replace(/<[^>]*>/g, "")
            .toLowerCase()
            .includes(q),
      );
    }

    // ── Apply select-filter panel (TaskListFilter) ─────────────────────────
    // NOTE: start_date / end_date are applied by the API (see getAllTasks)
    const f = task_list_filter_keys || {};

    if (f.assigned_to) {
      filtered = filtered.filter(
        (task) => Number(task.assigned_to) === Number(f.assigned_to),
      );
    }

    if (Array.isArray(f.collaborator_id) && f.collaborator_id.length > 0) {
      const collabIds = f.collaborator_id.map(Number);
      filtered = filtered.filter((task) =>
        (task.collaborators_id_list || []).some((id) =>
          collabIds.includes(Number(id)),
        ),
      );
    }

    if (f.task_status) {
      filtered = filtered.filter(
        (task) => Number(task.task_status) === Number(f.task_status),
      );
    }

    if (f.task_priority) {
      filtered = filtered.filter(
        (task) => Number(task.task_priority) === Number(f.task_priority),
      );
    }

    if (f.is_my_task !== null && f.is_my_task !== undefined) {
      filtered = filtered.filter(
        (task) => !!task.is_my_task === !!f.is_my_task,
      );
    }

    // ── Recently added task first ──────────────────────────────────────────
    return filtered.sort(sortNewestFirst);
  }, [task_data, projectId, clientId, searchQuery, task_list_filter_keys]);

  // ── Fetch tasks (paginated + date range) ────────────────────────────────────
  // GET /task/?page=1&page_size=25&start_date=2026-09-01&end_date=2026-09-30
  const getAllTasks = useCallback(async () => {
    // only the latest request may update the table (prevents an older,
    // filtered response from overwriting the unfiltered list after clearing)
    const requestId = ++requestIdRef.current;
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const url = `/task/?${params.toString()}`;

    // Keep existing rows on screen; skeleton only when there is nothing to show.
    if (tasksRef.current.length === 0) {
      setIsLoading(true);
    }

    try {
      const response = await Api.get(url);
      if (requestId !== requestIdRef.current) return;

      const body = response?.data;
      const list = pickList(body) || [];
      const total =
        body?.count ??
        body?.total ??
        body?.data?.count ??
        body?.data?.total ??
        list.length;

      dispatch(setTasks(list));
      setTotalCount(total);
      writePageCache("tasks:visited");
      setIsLoading(false);

      // current page became empty (e.g. last task deleted) -> step back
      if (list.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.log("Task Fetch Error :", error);
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [dispatch, page, pageSize, startDate, endDate]);

  // Refetch when page / page size / date range changes.
  // When the date range changes while on page > 1, jump back to page 1 first
  // (the page change then triggers the fetch) so we never request a page that
  // doesn't exist for the new range.
  const prevRangeRef = useRef(`${startDate}|${endDate}`);

  useEffect(() => {
    const rangeKey = `${startDate}|${endDate}`;

    if (prevRangeRef.current !== rangeKey) {
      prevRangeRef.current = rangeKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    getAllTasks();
  }, [getAllTasks, startDate, endDate, page]);

  // reset filter panel once on mount
  useEffect(() => {
    dispatch(resetTaskListFilterKeys());
  }, [dispatch]);

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
        width: 280, // fixed instead of auto
        minWidth: 280,
        accessor: (obj) => {
          const plainDescription =
            obj.description?.replace(/<[^>]*>/g, "") || "";

          const statuses = GetLocalStorageData("task_status") || [];

          const statusObj = statuses.find(
            (s) => Number(s.id) === Number(obj.task_status),
          );

          return (
            <ApvTitle
              icon="ri-task-line"
              tone={statusObj?.name?.toLowerCase().includes("complete") ? "success" : "primary"}
              title={obj.title}
              sub={plainDescription || null}
              onClick={() => openTaskDetail(obj.id)}
            />
          );
        },
      },

      {
        Header: "Related To",
        id: "related_to",
        filterable: false,
        accessor: (obj) => {
          if (obj.related_to === "project")
            return <ApvStatus tone="primary" icon="ri-folder-2-line" label="Project" />;
          if (obj.related_to === "client")
            return <ApvStatus tone="info" icon="ri-user-star-line" label="Client" />;
          return obj.related_to ? (
            <ApvStatus tone="secondary" label={obj.related_to} />
          ) : (
            <ApvEmpty />
          );
        },
      },

      {
        Header: "Project / Client",
        id: "project_client",
        filterable: false,
        accessor: (obj) => {
          if (obj.related_to === "project" && obj.project) {
            return (
              <ApvChip icon="ri-folder-2-line">{getLabel("projects", obj.project, "title")}</ApvChip>
            );
          }
          if (obj.related_to === "client" && obj.client) {
            return (
              <ApvChip icon="ri-building-line">{getLabel("clients", obj.client, "name")}</ApvChip>
            );
          }
          return <ApvEmpty />;
        },
      },

      // Field Visit — only meaningful for Client-related tasks
      {
        Header: "Field Visit",
        id: "requires_field_visit",
        filterable: false,
        accessor: (obj) => {
          if (obj.related_to !== "client") return <ApvEmpty />;
          return obj.requires_field_visit ? (
            <ApvStatus tone="success" icon="ri-map-pin-line" label="Required" />
          ) : (
            <ApvStatus tone="secondary" label="Not required" />
          );
        },
      },

      {
        Header: "Assigned To",
        id: "assigned_to",
        filterable: false,
        accessor: (obj) => <ApvEmployee employee={employeeById(obj.assigned_to)} />,
      },

      {
        Header: "Collaborators",
        id: "collaborators",
        filterable: false,
        accessor: (obj) => {
          const details = obj?.collaborator_details;
          const people =
            Array.isArray(details) && details.length > 0
              ? details.map((d) => employeeById(d.id) || { ...d, first_name: d.first_name || d.name })
              : (obj?.collaborators_id_list || []).map(employeeById);
          return <ApvPeople people={people} max={3} />;
        },
      },

      {
        Header: "Priority",
        id: "task_priority",
        filterable: false,
        accessor: (obj) => {
          const priorities = GetLocalStorageData("task_priority") || [];
          const priority = priorities.find((p) => Number(p.id) === Number(obj.task_priority));
          return (
            <ApvColorTag
              color={priority?.color}
              label={priority?.name}
              icon="ri-flag-2-fill"
            />
          );
        },
      },

      {
        Header: "Status",
        id: "task_status",
        filterable: false,
        accessor: (obj) => {
          const statuses = GetLocalStorageData("task_status") || [];
          const status = statuses.find((s) => Number(s.id) === Number(obj.task_status));
          return <ApvColorTag color={status?.color} label={status?.name} />;
        },
      },

      {
        Header: "Active",
        id: "status",
        filterable: false,
        accessor: (obj) => <ApvActive active={obj.status} />,
      },
    ],
    [openTaskDetail],
  );

  // ── Initial form object — pre-fills project/client when on that page ────────
  const initialFormObj = useMemo(
    () => ({
      id: 0,
      title: "",
      description: "",
      related_to: projectId ? "project" : clientId ? "client" : "custom",
      project: projectId ? Number(projectId) : null,
      client: clientId ? Number(clientId) : null,
      points: "1",
      assigned_to: null,
      collaborators_id_list: [],
      collaborator_details: [],
      task_status: null,
      task_priority: null,
      start_time: "",
      end_time: "",
      requires_field_visit: false,
      client_location: null, // ✅ FIX: keep in sync with TaskListForm's defaultTaskData
    }),
    [projectId, clientId],
  );

  // ── Filter options (current page only) ──────────────────────────────────────
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

  // ── Server pagination config passed to table ────────────────────────────────
  const serverPagination = useMemo(
    () => ({
      page,
      pageSize,
      totalCount,
      onChange: handlePaginationChange,
    }),
    [page, pageSize, totalCount, handlePaginationChange],
  );

  document.title = `Tasks | ${MetaTitle}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <div
        style={{
          position: "relative",
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: "80px 0 0 0",
              zIndex: 20,
              padding: "8px 4px",
              background: "var(--vz-card-bg, #fff)",
              overflow: "hidden",
            }}
          >
            <TableSkeletonBlock rows={8} cols={6} testId="task-list-loading-skeleton" label="Loading tasks" />
          </div>
        )}
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={displayedTasks}
          formname={task_list_component_name}
          initialFormObj={initialFormObj}
          filterKey={filterKey}
          filterOptions={filterOptions}
          width_per={"35%"}
          table_class={"Lc_leave_apply_table me-n3 ms-n3"}
          serverPagination={serverPagination}
        />
      </div>

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
