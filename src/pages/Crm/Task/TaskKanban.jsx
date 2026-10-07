// import { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Card,
//   CardBody,
//   Row,
//   Col,
//   Button,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   UncontrolledDropdown,
// } from "reactstrap";
// import { task_list_component_name } from "../../../common/constant/Constants";
// import {
//   setComponentToShow,
//   setFormObj,
//   setFormTitle,
//   toggleRSBView,
// } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
// import {
//   setTasks,
//   editTask,
// } from "../../../redux/reducers/ChildReducer/TaskReducer";
// import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
// import { Api } from "../../../common/api/Api";
// import { PutApi } from "../../../common/api/PutApi";
// import Swal from "sweetalert2";

// // ─── Fallback columns ──────────────────────────────────────────────
// const FALLBACK_COLUMNS = [
//   {
//     id: 1,
//     title: "To Do",
//     icon: "ri-checkbox-blank-circle-line",
//     color: "secondary",
//   },
//   { id: 2, title: "In Progress", icon: "ri-loader-4-line", color: "primary" },
//   { id: 3, title: "In Review", icon: "ri-eye-line", color: "warning" },
//   { id: 4, title: "On Hold", icon: "ri-pause-circle-line", color: "info" },
//   { id: 5, title: "Done", icon: "ri-checkbox-circle-line", color: "success" },
// ];

// const STATUS_ICONS = [
//   "ri-checkbox-blank-circle-line",
//   "ri-loader-4-line",
//   "ri-eye-line",
//   "ri-pause-circle-line",
//   "ri-checkbox-circle-line",
//   "ri-git-branch-line",
//   "ri-time-line",
//   "ri-close-circle-line",
// ];
// const STATUS_COLORS = [
//   "secondary",
//   "primary",
//   "warning",
//   "info",
//   "success",
//   "danger",
//   "dark",
//   "light",
// ];

// // ─── Helpers ───────────────────────────────────────────────────────
// function formatDate(iso) {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return d.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function isOverdue(end_time) {
//   if (!end_time) return false;
//   return new Date(end_time) < new Date();
// }

// function buildColumns(taskStatusList) {
//   if (!Array.isArray(taskStatusList) || taskStatusList.length === 0) {
//     return FALLBACK_COLUMNS;
//   }

//   const firstItem = taskStatusList.filter((s) => Number(s.id) === 1);
//   const lastItem = taskStatusList.filter((s) => Number(s.id) === 3);
//   const middleItems = taskStatusList
//     .filter((s) => Number(s.id) !== 1 && Number(s.id) !== 3)
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//   const sortedList = [...firstItem, ...middleItems, ...lastItem];

//   return sortedList.map((s, idx) => ({
//     id: Number(s.id),
//     title: s.title || s.name || `Status ${s.id}`,
//     icon: STATUS_ICONS[idx % STATUS_ICONS.length],
//     color: STATUS_COLORS[idx % STATUS_COLORS.length],
//   }));
// }

// function buildPriorityMap(taskPriorityList) {
//   if (!Array.isArray(taskPriorityList) || taskPriorityList.length === 0) {
//     return {
//       1: { label: "Low", color: "#28a745" },
//       2: { label: "Medium", color: "#ffc107" },
//       3: { label: "High", color: "#dc3545" },
//     };
//   }
//   return taskPriorityList.reduce((acc, p) => {
//     acc[Number(p.id)] = {
//       label: p.name || `Priority ${p.id}`,
//       color: p.color || "#6c757d",
//     };
//     return acc;
//   }, {});
// }

// function buildEmployeeMap(employeeList) {
//   if (!Array.isArray(employeeList) || employeeList.length === 0) return {};
//   return employeeList.reduce((acc, emp) => {
//     const firstName = emp.first_name || "";
//     const lastName = emp.last_name || "";
//     const fullName = `${firstName}`.trim() || `#${emp.id}`;
//     const profile = emp.profile_url || "";
//     const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase();
//     acc[Number(emp.id)] = {
//       name: fullName,
//       initials: initials || `${emp.id}`,
//       profile,
//     };
//     return acc;
//   }, {});
// }

// // ─── Avatar helpers ────────────────────────────────────────────────
// const AVATAR_BG_COLORS = [
//   "#4f46e5",
//   "#0ea5e9",
//   "#10b981",
//   "#f59e0b",
//   "#ef4444",
//   "#8b5cf6",
//   "#ec4899",
//   "#14b8a6",
// ];
// function avatarBg(id) {
//   return AVATAR_BG_COLORS[Number(id) % AVATAR_BG_COLORS.length];
// }

// // ─── Inline styles ─────────────────────────────────────────────────
// const styles = {
//   boardWrapper: {
//     width: "100%",
//     maxWidth: "100%",
//     overflowX: "auto",
//     overflowY: "hidden",
//     WebkitOverflowScrolling: "touch",
//     touchAction: "pan-x",
//     paddingBottom: 12,
//     position: "relative",
//   },

//   boardInner: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 12,
//     width: "max-content",
//     minWidth: "100%",
//     paddingBottom: 8,
//   },

//   column: {
//     width: 350,
//     minWidth: 350,
//     maxWidth: 350,
//     flexShrink: 0,
//     display: "flex",
//     flexDirection: "column",
//   },

//   columnHeader: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "10px 12px",
//     borderRadius: "10px 10px 0 0",
//     border: "1px solid var(--vz-border-color)",
//     borderBottom: "none",
//     background: "var(--vz-card-bg)",
//     minHeight: 52,
//   },

//   dropZone: (isOver) => ({
//     minHeight: 320,
//     padding: 8,
//     background: isOver
//       ? "rgba(var(--vz-primary-rgb),0.05)"
//       : "var(--vz-secondary-bg,#f3f3f9)",
//     borderRadius: "0 0 10px 10px",
//     border: `1px solid ${
//       isOver ? "var(--vz-primary)" : "var(--vz-border-color)"
//     }`,
//     borderTop: "none",
//     transition: "all 0.2s ease",
//     overflowY: "auto",
//     overflowX: "hidden",
//     maxHeight: "calc(100vh - 300px)",
//     flex: 1,
//   }),

//   taskCard: {
//     cursor: "grab",
//     border: "1px solid var(--vz-border-color)",
//     borderRadius: 10,
//     marginBottom: 10,
//     background: "var(--vz-card-bg)",
//     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//     transition: "all 0.2s ease",
//     overflow: "hidden",
//   },
// };

// // ─── AvatarCircle ──────────────────────────────────────────────────
// function AvatarCircle({ id, employeeMap, size = 22, fontSize = 9 }) {
//   const numId = Number(id);
//   const emp = employeeMap[numId];
//   const display = emp ? emp.initials : String(id);
//   const title = emp ? emp.name : `User #${id}`;

//   return (
//     <div
//       title={title}
//       style={{
//         width: size,
//         height: size,
//         borderRadius: "50%",
//         overflow: "hidden",
//         display: "inline-flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize,
//         fontWeight: 600,
//         border: "2px solid var(--vz-card-bg)",
//         background: avatarBg(numId),
//         color: "#fff",
//         flexShrink: 0,
//       }}
//     >
//       {emp?.profile ? (
//         <img
//           src={emp.profile}
//           alt={title}
//           style={{ width: "100%", height: "100%", objectFit: "cover" }}
//         />
//       ) : (
//         display
//       )}
//     </div>
//   );
// }

// // ─── TaskCard ──────────────────────────────────────────────────────
// function TaskCard({
//   task,
//   priorityMap,
//   employeeMap,
//   onDragStart,
//   onEdit,
//   onDelete,
// }) {
//   const priority = priorityMap[Number(task.task_priority)] || {
//     label: "Normal",
//     color: "#6c757d",
//   };
//   const overdue = isOverdue(task.end_time);
//   const collabs = task.collaborators_id_list || [];
//   // ✅ only relevant for client-related tasks
//   const showFieldVisitBadge =
//     task.related_to === "client" && !!task.requires_field_visit;

//   return (
//     <div
//       draggable
//       onDragStart={(e) => onDragStart(e, task)}
//       style={styles.taskCard}
//     >
//       <div style={{ padding: "10px 12px" }}>
//         {/* Priority + menu */}
//         <div className="d-flex align-items-start justify-content-between mb-2">
//           <div className="d-flex flex-wrap gap-1">
//             <span
//               className="badge fs-11 d-inline-flex align-items-center gap-1"
//               style={{
//                 background: priority.color + "22",
//                 color: priority.color,
//                 border: `1px solid ${priority.color}44`,
//                 fontWeight: 600,
//               }}
//             >
//               <i className="ri-flag-2-line"></i>
//               {priority.label}
//             </span>

//             {/* Field Visit badge */}
//             {showFieldVisitBadge && (
//               <span
//                 className="badge fs-11 d-inline-flex align-items-center gap-1 badge-soft-info"
//                 title="Requires Field Visit"
//               >
//                 <i className="ri-map-pin-line"></i>
//                 Field Visit
//               </span>
//             )}
//           </div>

//           <UncontrolledDropdown>
//             <DropdownToggle
//               tag="button"
//               className="btn btn-ghost-secondary btn-icon btn-sm"
//               style={{ lineHeight: 1 }}
//             >
//               <i className="ri-more-2-fill fs-16"></i>
//             </DropdownToggle>
//             <DropdownMenu end>
//               <DropdownItem onClick={() => onEdit(task)}>
//                 <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>
//                 Edit
//               </DropdownItem>
//               <DropdownItem
//                 className="text-danger"
//                 onClick={() => onDelete(task.id)}
//               >
//                 <i className="ri-delete-bin-2-line align-bottom me-2"></i>
//                 Delete
//               </DropdownItem>
//             </DropdownMenu>
//           </UncontrolledDropdown>
//         </div>

//         {/* Title */}
//         <h6
//           className="fs-13 mb-1 fw-semibold"
//           style={{ lineHeight: 1.4 }}
//           title={task.title}
//         >
//           {task.title}
//         </h6>

//         {/* Description */}
//         {task.description && (
//           <p
//             className="text-muted fs-12 mb-2"
//             style={{
//               display: "-webkit-box",
//               WebkitLineClamp: 2,
//               WebkitBoxOrient: "vertical",
//               overflow: "hidden",
//               lineHeight: 1.5,
//             }}
//           >
//             {task.description}
//           </p>
//         )}

//         {/* Tags */}
//         <div className="d-flex flex-wrap gap-1 mb-2">
//           {task.related_to && (
//             <span className="badge badge-soft-info fs-10">
//               <i className="ri-links-line align-bottom me-1"></i>
//               {task.related_to}
//             </span>
//           )}
//           {task.points && (
//             <span className="badge badge-soft-warning fs-10">
//               <i className="ri-star-line align-bottom me-1"></i>
//               {task.points} pts
//             </span>
//           )}
//         </div>

//         {/* Dates */}
//         <div className="d-flex align-items-center gap-2 mb-2 fs-11 text-muted">
//           <i className="ri-calendar-event-line"></i>
//           <span className={overdue ? "text-danger fw-semibold" : ""}>
//             {formatDate(task.start_time)} → {formatDate(task.end_time)}
//             {overdue && (
//               <i className="ri-alarm-warning-line ms-1 text-danger"></i>
//             )}
//           </span>
//         </div>

//         {/* Footer */}
//         <div className="d-flex align-items-center justify-content-between pt-2 border-top">
//           <div
//             className="d-flex align-items-center"
//             style={{ flexWrap: "nowrap", gap: 0 }}
//           >
//             {collabs.slice(0, 3).map((cid) => (
//               <span
//                 key={cid}
//                 title={employeeMap[Number(cid)]?.name || `User #${cid}`}
//                 style={{ marginRight: -5, display: "inline-flex" }}
//               >
//                 <AvatarCircle id={cid} employeeMap={employeeMap} />
//               </span>
//             ))}
//             {collabs.length > 3 && (
//               <span style={{ marginRight: -5, display: "inline-flex" }}>
//                 <div
//                   style={{
//                     width: 22,
//                     height: 22,
//                     borderRadius: "50%",
//                     display: "inline-flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: 9,
//                     fontWeight: 600,
//                     border: "2px solid var(--vz-card-bg)",
//                     background: "#6c757d",
//                     color: "#fff",
//                     flexShrink: 0,
//                   }}
//                 >
//                   +{collabs.length - 3}
//                 </div>
//               </span>
//             )}
//             {collabs.length > 0 && (
//               <span className="fs-11 text-muted" style={{ marginLeft: 10 }}>
//                 {employeeMap[Number(collabs[0])]?.name || `#${collabs[0]}`}
//                 {collabs.length > 1 && (
//                   <span className="text-muted"> +{collabs.length - 1}</span>
//                 )}
//               </span>
//             )}
//           </div>

//           {task.assigned_to && (
//             <div
//               className="d-flex align-items-center gap-1 text-muted fs-11"
//               style={{ flexShrink: 0, marginLeft: 6 }}
//             >
//               <AvatarCircle
//                 id={task.assigned_to}
//                 employeeMap={employeeMap}
//                 size={20}
//                 fontSize={8}
//               />
//               <span
//                 style={{
//                   maxWidth: 70,
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {employeeMap[Number(task.assigned_to)]?.name ||
//                   `#${task.assigned_to}`}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── KanbanColumn ──────────────────────────────────────────────────
// function KanbanColumn({
//   column,
//   tasks,
//   priorityMap,
//   employeeMap,
//   onDragStart,
//   onDrop,
//   onDragOver,
//   onEdit,
//   onDelete,
// }) {
//   const [isOver, setIsOver] = useState(false);

//   return (
//     <div style={styles.column}>
//       <div style={styles.columnHeader}>
//         <div className="d-flex align-items-center gap-2">
//           <span className={`text-${column.color} fs-15`}>
//             <i className={column.icon}></i>
//           </span>
//           <h6 className="mb-0 fw-semibold fs-13">{column.title}</h6>
//           <span
//             className={`badge badge-soft-${column.color} fs-10 ms-1`}
//             style={{ minWidth: 22, textAlign: "center" }}
//           >
//             {tasks.length}
//           </span>
//         </div>
//       </div>

//       <div
//         onDragOver={(e) => {
//           e.preventDefault();
//           setIsOver(true);
//           onDragOver(e);
//         }}
//         onDragLeave={() => setIsOver(false)}
//         onDrop={(e) => {
//           setIsOver(false);
//           onDrop(e, column.id);
//         }}
//         style={styles.dropZone(isOver)}
//       >
//         {tasks.length === 0 ? (
//           <div
//             className="d-flex flex-column align-items-center justify-content-center text-muted"
//             style={{ minHeight: 100, opacity: 0.45 }}
//           >
//             <i className="ri-inbox-line fs-24 mb-1"></i>
//             <span className="fs-12">No tasks</span>
//           </div>
//         ) : (
//           tasks.map((task) => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               priorityMap={priorityMap}
//               employeeMap={employeeMap}
//               onDragStart={onDragStart}
//               onEdit={onEdit}
//               onDelete={onDelete}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────
// const TaskKanban = ({ searchQuery = "" }) => {
//   const dispatch = useDispatch();

//   const tasks = useSelector(
//     (state) =>
//       state.TaskReducer?.tasks ?? state.Task?.tasks ?? state.task?.tasks ?? [],
//   );

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [updatingIds, setUpdatingIds] = useState(new Set());
//   const draggedTask = useRef(null);
//   const boardScrollRef = useRef(null);
//   const isPanning = useRef(false);
//   const panStart = useRef({ x: 0, scrollLeft: 0 });

//   // ── Build lookup maps from localStorage ──────────────────────────
//   const taskStatusList = (GetLocalStorageData("task_status") || []).filter(
//     (s) => s.status === true,
//   );
//   const taskPriorityList = GetLocalStorageData("task_priority") || [];
//   const employeeList = GetLocalStorageData("employee") || [];

//   const columns = buildColumns(taskStatusList);
//   const priorityMap = buildPriorityMap(taskPriorityList);
//   const employeeMap = buildEmployeeMap(employeeList);

//   // ── Fetch tasks on mount ──────────────────────────────────────────
//   useEffect(() => {
//     const getAllTasks = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await Api.get("/task/");
//         // ✅ FIX: API returns { data: [...] } — a flat array, not { external, internal }
//         const fetchedTasks = Array.isArray(response?.data?.data)
//           ? response.data.data
//           : [];
//         dispatch(setTasks(fetchedTasks));
//       } catch (err) {
//         console.error("Task Fetch Error:", err);
//         setError("Failed to load tasks. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     getAllTasks();
//   }, [dispatch]);

//   // ── Filtering ─────────────────────────────────────────────────────
//   const activeTasks = tasks.filter((t) => t.status === true);

//   const filteredTasks = activeTasks.filter((t) => {
//     if (!searchQuery.trim()) return true;
//     const q = searchQuery.toLowerCase();
//     return (
//       t.title?.toLowerCase().includes(q) ||
//       t.description?.toLowerCase().includes(q)
//     );
//   });

//   function getTasksForColumn(columnId) {
//     return filteredTasks.filter(
//       (t) => Number(t.task_status) === Number(columnId),
//     );
//   }

//   // ── Drag & drop ───────────────────────────────────────────────────
//   function handleDragStart(e, task) {
//     draggedTask.current = task;
//     e.dataTransfer.effectAllowed = "move";
//   }

//   function handleDragOver(e) {
//     e.preventDefault();
//   }

//   // ── Click & drag to scroll (outside cards) ────────────────────────
//   function handlePanMouseDown(e) {
//     if (e.target.closest("[draggable='true']")) return;
//     if (e.button !== 0) return;
//     const rect = boardScrollRef.current.getBoundingClientRect();
//     const clickedOnScrollbar =
//       e.clientY > rect.bottom - 17 &&
//       boardScrollRef.current.scrollWidth > boardScrollRef.current.clientWidth;
//     if (clickedOnScrollbar) return;
//     isPanning.current = true;
//     panStart.current = {
//       x: e.pageX,
//       scrollLeft: boardScrollRef.current.scrollLeft,
//     };
//     boardScrollRef.current.style.cursor = "grabbing";
//   }

//   function handlePanMouseMove(e) {
//     if (!isPanning.current) return;
//     e.preventDefault();
//     const dx = e.pageX - panStart.current.x;
//     boardScrollRef.current.scrollLeft = panStart.current.scrollLeft - dx;
//   }

//   function handlePanMouseUp() {
//     isPanning.current = false;
//     if (boardScrollRef.current) {
//       boardScrollRef.current.style.cursor = "default";
//     }
//   }

//   async function handleDrop(e, targetColumnId) {
//     e.preventDefault();
//     const task = draggedTask.current;
//     draggedTask.current = null;

//     if (!task || Number(task.task_status) === Number(targetColumnId)) return;

//     const optimisticTask = { ...task, task_status: Number(targetColumnId) };
//     dispatch(editTask(optimisticTask));

//     const payload = {
//       id: task.id,
//       task_status: Number(targetColumnId),
//     };

//     setUpdatingIds((prev) => new Set(prev).add(task.id));
//     try {
//       const response = await PutApi(`task/`, payload, false);

//       if (response?.status === 200 || response?.status === 201) {
//         const serverData = response?.data?.data;
//         if (serverData) {
//           dispatch(editTask(serverData));
//         }
//       } else {
//         dispatch(editTask(task));
//         console.error("Status update failed:", response);
//       }
//     } catch (err) {
//       dispatch(editTask(task));
//       console.error("Status update error:", err);
//     } finally {
//       setUpdatingIds((prev) => {
//         const next = new Set(prev);
//         next.delete(task.id);
//         return next;
//       });
//     }
//   }

//   // ── Delete handler ────────────────────────────────────────────────
//   async function handleDelete(taskId) {
//     const result = await Swal.fire({
//       title: "Delete Task?",
//       text: "You won't be able to revert this task.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, Delete",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       const response = await Api.delete("/task/", {
//         data: { id: taskId },
//       });

//       if (response?.status === 200 || response?.status === 201) {
//         dispatch(setTasks(tasks.filter((item) => item.id !== taskId)));

//         Swal.fire({
//           icon: "success",
//           title: "Deleted!",
//           text: response?.data?.message || "Task Deleted Successfully",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error!",
//           text: response?.data?.message || "Failed to delete task",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error!",
//         text: error?.response?.data?.message || "Failed to delete task",
//       });
//     }
//   }

//   // ── Edit handler ──────────────────────────────────────────────────
//   function handleEdit(task) {
//     dispatch(setFormObj(task));
//     dispatch(setFormTitle("Edit Task"));
//     dispatch(setComponentToShow(task_list_component_name));
//     dispatch(toggleRSBView(true));
//   }

//   // ── Add handler ───────────────────────────────────────────────────
//   function handleAddTask() {
//     dispatch(setFormObj({}));
//     dispatch(setFormTitle("Add Task"));
//     dispatch(setComponentToShow(task_list_component_name));
//     dispatch(toggleRSBView(true));
//   }

//   // ── Stats ─────────────────────────────────────────────────────────
//   const totalTasks = activeTasks.length;
//   const doneColumnId = columns[columns.length - 1]?.id;
//   const doneTasks = activeTasks.filter(
//     (t) => Number(t.task_status) === Number(doneColumnId),
//   ).length;
//   const overdueTasks = activeTasks.filter(
//     (t) =>
//       isOverdue(t.end_time) && Number(t.task_status) !== Number(doneColumnId),
//   ).length;
//   const progressPct =
//     totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

//   // ── Render ────────────────────────────────────────────────────────
//   return (
//     <div>
//       {/* Top Bar */}
//       <Card className="mb-3">
//         <CardBody className="pb-0">
//           <Row className="g-2 align-items-center">
//             <Col xs="auto">
//               <Button color="primary" size="sm" onClick={handleAddTask}>
//                 <i className="ri-add-line align-bottom me-1"></i>Add Task
//               </Button>
//             </Col>
//             <Col xs={12} sm="auto" className="ms-auto">
//               <div className="d-flex flex-wrap align-items-center gap-3">
//                 <div className="d-flex align-items-center gap-1 text-muted fs-13">
//                   <i className="ri-task-line fs-15 text-primary"></i>
//                   <span className="fw-medium text-dark">{totalTasks}</span>
//                   <span>Total</span>
//                 </div>
//                 <div className="d-flex align-items-center gap-1 text-muted fs-13">
//                   <i className="ri-checkbox-circle-line fs-15 text-success"></i>
//                   <span className="fw-medium text-dark">{doneTasks}</span>
//                   <span>Done</span>
//                 </div>
//                 {overdueTasks > 0 && (
//                   <div className="d-flex align-items-center gap-1 text-muted fs-13">
//                     <i className="ri-alarm-warning-line fs-15 text-danger"></i>
//                     <span className="fw-medium text-danger">
//                       {overdueTasks}
//                     </span>
//                     <span>Overdue</span>
//                   </div>
//                 )}
//               </div>
//             </Col>
//           </Row>

//           {totalTasks > 0 && (
//             <div className="mt-3 pb-3">
//               <div className="d-flex justify-content-between align-items-center mb-1">
//                 <span className="text-muted fs-12">Overall progress</span>
//                 <span className="fs-12 fw-medium text-success">
//                   {progressPct}%
//                 </span>
//               </div>
//               <div className="progress" style={{ height: 4 }}>
//                 <div
//                   className="progress-bar bg-success"
//                   style={{
//                     width: `${progressPct}%`,
//                     transition: "width 0.4s ease",
//                   }}
//                 />
//               </div>
//             </div>
//           )}
//         </CardBody>
//       </Card>

//       {/* Error */}
//       {error && (
//         <div
//           className="alert alert-danger d-flex align-items-center gap-2 mb-3"
//           role="alert"
//         >
//           <i className="ri-error-warning-line fs-16"></i>
//           <span>{error}</span>
//           <Button
//             color="link"
//             size="sm"
//             className="ms-auto p-0 text-danger"
//             onClick={() => window.location.reload()}
//           >
//             Retry
//           </Button>
//         </div>
//       )}

//       {/* Board */}
//       {loading ? (
//         <div className="text-center py-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading…</span>
//           </div>
//           <p className="text-muted mt-2 fs-14">Loading tasks…</p>
//         </div>
//       ) : (
//         <div
//           className="kanban-scroll-wrapper"
//           style={styles.boardWrapper}
//           ref={boardScrollRef}
//           onMouseDown={handlePanMouseDown}
//           onMouseMove={handlePanMouseMove}
//           onMouseUp={handlePanMouseUp}
//           onMouseLeave={handlePanMouseUp}
//         >
//           <div style={styles.boardInner}>
//             {columns.map((col) => (
//               <KanbanColumn
//                 key={col.id}
//                 column={col}
//                 tasks={getTasksForColumn(col.id)}
//                 priorityMap={priorityMap}
//                 employeeMap={employeeMap}
//                 onDragStart={handleDragStart}
//                 onDrop={handleDrop}
//                 onDragOver={handleDragOver}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskKanban;



import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
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

// ─── Theme (colors reused from the project's DEFAULT_COLORS chart palette) ──
const PALETTE = {
  inHour: "#1ab394", // teal-green  (IN Hour)
  pending: "#f79a3e", // orange      (Pending)
  holiday: "#2d9cdb", // blue        (Holiday)
  weekend: "#3d4a85", // navy        (Weekend)
  permission: "#8e44ad", // purple      (Permission)
  halfDay: "#add8e6", // light blue  (Half Day)
};

const THEME = {
  primary: PALETTE.permission,
  primarySoft: "#f0e6f6",
  track: "#e8ebf3",
  success: PALETTE.inHour,
  panelBg: "#f5f7fb",
  cardBg: "#ffffff",
  text: PALETTE.weekend,
  muted: "#7b809a",
  border: "#e6e9f2",
};

// ─── The 4 board columns ───────────────────────────────────────────
// Each column is matched to a status from localStorage "task_status" by
// its title. If no title matches, fallbackId is used.
// ⚠ Check the fallbackId values against your task_status table.
const COLUMN_DEFS = [
  {
    key: "todo",
    title: "To Do",
    match: /^\s*(to[\s-]*do|open|new|pending)\s*$/i,
    fallbackId: 1,
    color: PALETTE.pending,
  },
  {
    key: "inprogress",
    title: "In Progress",
    match: /in[\s-]*progress|ongoing|working/i,
    fallbackId: 2,
    color: PALETTE.holiday,
  },
  {
    key: "qa",
    title: "QA",
    match: /\bqa\b|quality|testing|\btest\b|review/i,
    fallbackId: 4,
    color: PALETTE.permission,
  },
  {
    key: "done",
    title: "Done",
    match: /done|complete|closed/i,
    fallbackId: 3,
    color: PALETTE.inHour,
  },
];

// Colors for non-default status columns (e.g. On Hold) that only appear
// while they contain tasks.
const EXTRA_COLUMN_COLORS = [
  "#f2634a",
  PALETTE.weekend,
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#0ea5e9",
];

const HIDDEN_COLUMNS_STORAGE_KEY = "task_kanban_hidden_columns";

function loadHiddenColumns() {
  try {
    const value = JSON.parse(localStorage.getItem(HIDDEN_COLUMNS_STORAGE_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

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

// Default columns are always present. Any other status only gets a column
// while at least one active task is in it.
function buildColumns(taskStatusList, activeTasks) {
  const list = Array.isArray(taskStatusList) ? taskStatusList : [];
  const activeStatuses = list.filter((s) => s.status === true);
  const used = new Set();

  const defaultColumns = COLUMN_DEFS.map((def) => {
    const found = activeStatuses.find(
      (s) =>
        !used.has(Number(s.id)) &&
        def.match.test(String(s.title || s.name || "")),
    );
    const id = found ? Number(found.id) : def.fallbackId;
    used.add(id);
    return {
      key: def.key,
      id,
      title: def.title,
      color: def.color,
      isDefault: true,
    };
  });

  const extraIds = [
    ...new Set(activeTasks.map((t) => Number(t.task_status))),
  ].filter((id) => !Number.isNaN(id) && !used.has(id));

  const extraColumns = extraIds
    .map((id) => ({ id, status: list.find((s) => Number(s.id) === id) }))
    .sort(
      (a, b) =>
        (a.status?.order ?? Infinity) - (b.status?.order ?? Infinity) ||
        a.id - b.id,
    )
    .map(({ id, status }, idx) => ({
      key: `status-${id}`,
      id,
      title: status?.title || status?.name || `Status ${id}`,
      color:
        status?.color || EXTRA_COLUMN_COLORS[idx % EXTRA_COLUMN_COLORS.length],
      isDefault: false,
    }));

  const doneColumn = defaultColumns.filter((c) => c.key === "done");
  const otherDefaults = defaultColumns.filter((c) => c.key !== "done");
  return [...otherDefaults, ...extraColumns, ...doneColumn];
}

function buildPriorityMap(taskPriorityList) {
  if (!Array.isArray(taskPriorityList) || taskPriorityList.length === 0) {
    return {
      1: { label: "Low", color: "#1ab394" },
      2: { label: "Medium", color: "#f79a3e" },
      3: { label: "High", color: "#f2634a" },
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
    const fullName = `${firstName} ${lastName}`.trim() || `#${emp.id}`;
    const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase();
    acc[Number(emp.id)] = {
      name: fullName,
      initials: initials || `${emp.id}`,
      profile: emp.profile_url || "",
    };
    return acc;
  }, {});
}

// Uses task.progress (0-100) when the API sends it, otherwise derives it
// from the default column position (To Do = 0%, Done = 100%).
// Returns null for tasks in non-default columns such as On Hold.
function getProgress(task, columns) {
  if (typeof task.progress === "number") {
    return Math.max(0, Math.min(100, Math.round(task.progress)));
  }
  const defaults = columns.filter((c) => c.isDefault);
  const idx = defaults.findIndex((c) => c.id === Number(task.task_status));
  if (idx < 0) return null;
  if (defaults.length < 2) return 0;
  return Math.round((idx / (defaults.length - 1)) * 100);
}

const AVATAR_BG_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f79a3e",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];
const avatarBg = (id) => AVATAR_BG_COLORS[Number(id) % AVATAR_BG_COLORS.length];

// ─── Styles ────────────────────────────────────────────────────────
const CSS = `
.tk-board { scrollbar-width: thin; scrollbar-color: #cfd4e4 transparent; }
.tk-board::-webkit-scrollbar { height: 8px; }
.tk-board::-webkit-scrollbar-thumb { background: #cfd4e4; border-radius: 8px; }
.tk-card { transition: box-shadow .2s ease, transform .2s ease, opacity .2s ease; }
.tk-card:hover { box-shadow: 0 8px 22px rgba(61,74,133,.15); transform: translateY(-1px); }
.tk-card.is-dragging { opacity: .45; border: 1.5px dashed #aab1cf !important; box-shadow: none; transform: none; }
.tk-add-btn { width: 28px; height: 28px; border-radius: 50%; border: none; display: inline-flex; align-items: center; justify-content: center; transition: filter .15s ease; }
.tk-add-btn:hover { filter: brightness(.92); }
.tk-menu-btn { border: none; background: transparent; color: #9aa0b8; width: 26px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
.tk-menu-btn:hover { background: #eef0f7; color: ${THEME.text}; }
.tk-dropzone::-webkit-scrollbar { width: 6px; }
.tk-dropzone::-webkit-scrollbar-thumb { background: #d3d8e6; border-radius: 6px; }
.tk-create-btn:hover, .tk-create-btn:focus { filter: brightness(.92); color: #fff !important; }
`;

const styles = {
  panel: {
    background: THEME.panelBg,
    borderRadius: 16,
    padding: 16,
  },
  boardWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 8,
    position: "relative",
  },
  boardInner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    minWidth: "100%",
    width: "max-content",
  },
  column: {
    width: 320,
    minWidth: 320,
    flex: "1 0 320px",
    display: "flex",
    flexDirection: "column",
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 4px 12px",
  },
  dropZone: (isOver, color) => ({
    minHeight: 200,
    padding: 6,
    borderRadius: 14,
    border: `1.5px dashed ${isOver ? color : "transparent"}`,
    background: isOver ? color + "12" : "transparent",
    transition: "all .2s ease",
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "calc(100vh - 330px)",
  }),
  taskCard: {
    cursor: "grab",
    background: THEME.cardBg,
    borderRadius: 14,
    border: `1px solid ${THEME.border}`,
    boxShadow: "0 2px 10px rgba(61,74,133,0.07)",
    marginBottom: 12,
    padding: "12px 14px",
    height: 190,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  pill: {
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 11,
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};

// ─── AvatarCircle ──────────────────────────────────────────────────
function AvatarCircle({ id, employeeMap, size = 24, fontSize = 9 }) {
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
        border: "2px solid #fff",
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
  columns,
  accent,
  priorityMap,
  employeeMap,
  isDragging,
  isUpdating,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}) {
  const priority = priorityMap[Number(task.task_priority)] || {
    label: "Normal",
    color: "#6c757d",
  };
  const overdue = isOverdue(task.end_time);
  const collabs = task.collaborators_id_list || [];
  const showFieldVisitBadge =
    task.related_to === "client" && !!task.requires_field_visit;

  const progress = getProgress(task, columns);
  const barColor = accent || THEME.primary;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`tk-card${isDragging ? " is-dragging" : ""}`}
      style={{ ...styles.taskCard, opacity: isUpdating ? 0.6 : undefined }}
    >
      {/* Tag pill + menu */}
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div
          className="d-flex gap-1"
          style={{ flexWrap: "nowrap", overflow: "hidden", minWidth: 0 }}
        >
          <span
            style={{
              ...styles.pill,
              background: priority.color + "1f",
              color: priority.color,
              padding: "4px 12px",
              fontWeight: 600,
            }}
          >
            {priority.label}
          </span>
          {task.related_to && (
            <span
              style={{
                ...styles.pill,
                background: "#eef0f7",
                color: THEME.text,
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {task.related_to}
            </span>
          )}
          {showFieldVisitBadge && (
            <span
              title="Requires Field Visit"
              style={{
                ...styles.pill,
                background: PALETTE.halfDay + "55",
                color: PALETTE.holiday,
                fontWeight: 500,
              }}
            >
              <i className="ri-map-pin-line me-1 align-bottom"></i>
              Field Visit
            </span>
          )}
        </div>

        <UncontrolledDropdown>
          <DropdownToggle tag="button" type="button" className="tk-menu-btn">
            <i className="ri-more-fill fs-16"></i>
          </DropdownToggle>
          {/* container="body" stops the menu being clipped by the scroll area */}
          <DropdownMenu end container="body">
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
      <div
        className="d-flex align-items-center gap-2 mb-1"
        style={{ flexShrink: 0, minWidth: 0 }}
      >
        <i
          className="ri-calendar-todo-fill"
          style={{
            fontSize: 20,
            lineHeight: 1,
            color: accent || THEME.primary,
            flexShrink: 0,
          }}
        ></i>
        <h6
          className="mb-0"
          title={task.title}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: THEME.text,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
        >
          {task.title}
        </h6>
      </div>

      {/* Description (always reserves 2 lines so every card is the same height) */}
      <p
        className="mb-2"
        title={task.description || ""}
        style={{
          color: THEME.muted,
          fontSize: 12,
          lineHeight: 1.5,
          height: 36,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {task.description || ""}
      </p>

      {/* Dates */}
      <div
        className="d-flex align-items-center gap-1 mb-2"
        style={{
          fontSize: 11,
          color: overdue ? "#f2634a" : THEME.muted,
          fontWeight: overdue ? 600 : 400,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        <i className="ri-calendar-event-line"></i>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {formatDate(task.start_time)} → {formatDate(task.end_time)}
        </span>
        {overdue && <i className="ri-alarm-warning-line ms-1"></i>}
      </div>

      {/* Progress + avatars (single row) */}
      <div
        className="d-flex align-items-center gap-2"
        style={{ marginTop: "auto", flexShrink: 0 }}
      >
        {/* bar + percentage (space is kept even when hidden so cards stay aligned) */}
        <div
          className="d-flex align-items-center gap-2"
          style={{
            flex: 1,
            minWidth: 0,
            visibility: progress === null ? "hidden" : "visible",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 5,
              borderRadius: 5,
              background: THEME.track,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress ?? 0}%`,
                height: "100%",
                background: barColor,
                borderRadius: 5,
                transition: "width .4s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              color: THEME.muted,
              minWidth: 34,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {progress ?? 0}%
          </span>
        </div>

        {/* avatars */}
        <div
          className="d-flex align-items-center"
          style={{ flexShrink: 0, paddingLeft: 6 }}
        >
          {task.assigned_to && (
            <span style={{ display: "inline-flex", marginRight: -6 }}>
              <AvatarCircle id={task.assigned_to} employeeMap={employeeMap} />
            </span>
          )}
          {collabs.slice(0, 2).map((cid) => (
            <span key={cid} style={{ display: "inline-flex", marginRight: -6 }}>
              <AvatarCircle id={cid} employeeMap={employeeMap} />
            </span>
          ))}
          {collabs.length > 2 && (
            <span style={{ display: "inline-flex", marginRight: -6 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  border: "2px solid #fff",
                  background: "#9aa0b8",
                  color: "#fff",
                }}
              >
                +{collabs.length - 2}
              </div>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KanbanColumn ──────────────────────────────────────────────────
function KanbanColumn({
  column,
  columns,
  tasks,
  priorityMap,
  employeeMap,
  draggingId,
  updatingIds,
  onDragStart,
  onDragEnd,
  onDrop,
  onEdit,
  onDelete,
  onAdd,
  onHide,
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div style={styles.column}>
      <div style={styles.columnHeader}>
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: column.color,
              display: "inline-block",
            }}
          />
          <h6
            className="mb-0"
            style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}
          >
            {column.title}
          </h6>
          <span
            style={{
              background: column.color + "26",
              color: column.color,
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
            }}
          >
            {tasks.length}
          </span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="tk-menu-btn"
            title={`Hide ${column.title} column`}
            onClick={() => onHide(column.key)}
          >
            <i className="ri-eye-off-line fs-15"></i>
          </button>
          <button
            type="button"
            className="tk-add-btn"
            style={{ background: column.color + "26", color: column.color }}
            title={`Add task to ${column.title}`}
            onClick={() => onAdd(column.id)}
          >
            <i className="ri-add-line"></i>
          </button>
        </div>
      </div>

      <div
        className="tk-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          if (!isOver) setIsOver(true);
        }}
        onDragLeave={(e) => {
          // ignore leave events fired when moving over child elements
          if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
        }}
        onDrop={(e) => {
          setIsOver(false);
          onDrop(e, column.id);
        }}
        style={styles.dropZone(isOver, column.color)}
      >
        {tasks.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              minHeight: 120,
              color: THEME.muted,
              opacity: 0.6,
              border: `1.5px dashed ${column.color}55`,
              borderRadius: 14,
            }}
          >
            <i className="ri-inbox-line fs-24 mb-1"></i>
            <span style={{ fontSize: 12 }}>No tasks</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              accent={column.color}
              priorityMap={priorityMap}
              employeeMap={employeeMap}
              isDragging={draggingId === task.id}
              isUpdating={updatingIds.has(task.id)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}


// ─── Header widgets ────────────────────────────────────────────────
const PRIORITY_RANK = ["low", "medium", "high", "critical", "very critical"];
const priorityRank = (label) => {
  const i = PRIORITY_RANK.indexOf(String(label).trim().toLowerCase());
  return i === -1 ? 99 : i;
};

function ProgressBar({ value, done, overdue, total }) {
  const pct = Math.max(0, Math.min(100, value));
  const donePct = total > 0 ? (done / total) * 100 : 0;
  const overduePct = total > 0 ? (overdue / total) * 100 : 0;
  const remaining = Math.max(0, total - done - overdue);
  const RED = "#f2634a";

  return (
    <div style={{ flex: "1 1 280px", minWidth: 240, maxWidth: 480 }}>
      <div className="d-flex align-items-baseline justify-content-between mb-2">
        <span style={{ fontSize: 12, color: THEME.muted }}>Overall Progress</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: THEME.text, lineHeight: 1 }}>
          {pct}%
        </span>
      </div>

      <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
        {/* track with two segments: done + overdue */}
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 10,
            background: THEME.track,
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* done */}
          <div
            title={`Done: ${done}`}
            style={{
              width: `${donePct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${PALETTE.inHour}, ${PALETTE.holiday})`,
              boxShadow: `0 0 10px ${PALETTE.inHour}88`,
              transition: "width .5s ease",
            }}
          />
          {/* overdue */}
          <div
            title={`Overdue: ${overdue}`}
            style={{
              width: `${overduePct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${RED}, #ff8a75)`,
              boxShadow: `0 0 10px ${RED}88`,
              transition: "width .5s ease",
            }}
          />
        </div>

        {/* knob (sits at the end of the done segment) */}
        <div
          style={{
            position: "absolute",
            left: `clamp(11px, ${donePct}%, calc(100% - 11px))`,
            transform: "translateX(-50%)",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            border: `4px solid ${pct > 50 ? PALETTE.holiday : PALETTE.inHour}`,
            boxShadow: `0 2px 8px ${PALETTE.holiday}66`,
            transition: "left .5s ease",
          }}
        />
      </div>

      {/* legend */}
      <div
        className="d-flex flex-wrap align-items-center gap-3"
        style={{ fontSize: 11, color: THEME.muted, marginTop: 6 }}
      >
        <span className="d-inline-flex align-items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: 3, background: PALETTE.inHour }} />
          Done {done}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: 3, background: RED }} />
          Overdue {overdue}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: 3, background: THEME.track, border: "1px solid #cfd4e4" }} />
          Remaining {remaining}
        </span>
      </div>
    </div>
  );
}

// Cylinder-style bar (rounded top and bottom for a 3D look)
function StatBar3D({ label, value, max, color }) {
  const h = 18 + (max > 0 ? (value / max) * 40 : 0);
  return (
    <div style={{ width: 66, textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          height: 68,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {/* floor shadow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: 46,
            height: 10,
            borderRadius: "50%",
            background: color + "26",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 34,
            height: h,
            marginBottom: 5,
            transition: "height .4s ease",
          }}
        >
          {/* body */}
          <div
            style={{
              position: "absolute",
              top: 5,
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: "0 0 50% 50% / 0 0 7px 7px",
              background: `linear-gradient(90deg, ${color}cc, ${color}, ${color}cc)`,
              boxShadow: `0 6px 10px ${color}40`,
            }}
          />
          {/* lid */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              borderRadius: "50%",
              background: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), ${color}`,
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function PriorityCard({ title, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      style={{
        flex: "1 1 120px",
        minWidth: 112,
        maxWidth: 170,
        background: "#fff",
        borderRadius: 14,
        padding: "10px 12px",
        border: `1px solid ${THEME.border}`,
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 3px 10px rgba(61,74,133,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      <div className="d-flex align-items-baseline justify-content-between mb-1">
        <span style={{ fontSize: 20, fontWeight: 800, color: THEME.text }}>
          {count}
        </span>
        <span style={{ fontSize: 11, color: THEME.muted }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 5,
          background: THEME.track,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 5,
            transition: "width .4s ease",
          }}
        />
      </div>
    </div>
  );
}

const Divider = () => (
  <span
    style={{ width: 0, height:0, background: THEME.border, flexShrink: 0 }}
  />
);

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
  const [draggingId, setDraggingId] = useState(null);
  const [hiddenKeys, setHiddenKeys] = useState(loadHiddenColumns);
  const draggedTask = useRef(null);
  const boardScrollRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, scrollLeft: 0 });

  // ── Lookup maps from localStorage ────────────────────────────────
  const taskStatusList = GetLocalStorageData("task_status") || [];
  const taskPriorityList = GetLocalStorageData("task_priority") || [];
  const employeeList = GetLocalStorageData("employee") || [];

  const activeTasks = tasks.filter((t) => t.status === true);
  const columns = buildColumns(taskStatusList, activeTasks);
  const priorityMap = buildPriorityMap(taskPriorityList);
  const employeeMap = buildEmployeeMap(employeeList);

  // ── Column visibility ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(
      HIDDEN_COLUMNS_STORAGE_KEY,
      JSON.stringify(hiddenKeys),
    );
  }, [hiddenKeys]);

  const visibleColumns = columns.filter((c) => !hiddenKeys.includes(c.key));
  const hiddenCount = columns.length - visibleColumns.length;

  function toggleColumn(key) {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function showAllColumns() {
    setHiddenKeys([]);
  }

  const taskCountByStatus = activeTasks.reduce((acc, t) => {
    const id = Number(t.task_status);
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // ── Fetch tasks ───────────────────────────────────────────────────
  const getAllTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.get("/task/");
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
  }, [dispatch]);

  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  // ── Filtering ─────────────────────────────────────────────────────
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
    // delay so the browser's drag image isn't captured in the faded state
    setTimeout(() => setDraggingId(task.id), 0);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  // ── Click & drag to scroll (outside cards) ────────────────────────
  function handlePanMouseDown(e) {
    if (e.target.closest("[draggable='true'], button, a")) return;
    if (e.button !== 0) return;
    const el = boardScrollRef.current;
    const rect = el.getBoundingClientRect();
    const clickedOnScrollbar =
      e.clientY > rect.bottom - 17 && el.scrollWidth > el.clientWidth;
    if (clickedOnScrollbar) return;
    isPanning.current = true;
    panStart.current = { x: e.pageX, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
  }

  function handlePanMouseMove(e) {
    if (!isPanning.current) return;
    e.preventDefault();
    const dx = e.pageX - panStart.current.x;
    boardScrollRef.current.scrollLeft = panStart.current.scrollLeft - dx;
  }

  function handlePanMouseUp() {
    isPanning.current = false;
    if (boardScrollRef.current) boardScrollRef.current.style.cursor = "default";
  }

  async function handleDrop(e, targetColumnId) {
    e.preventDefault();
    const task = draggedTask.current;
    draggedTask.current = null;
    setDraggingId(null);

    if (!task || Number(task.task_status) === Number(targetColumnId)) return;

    dispatch(editTask({ ...task, task_status: Number(targetColumnId) }));

    const payload = { id: task.id, task_status: Number(targetColumnId) };

    setUpdatingIds((prev) => new Set(prev).add(task.id));
    try {
      const response = await PutApi(`task/`, payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const serverData = response?.data?.data;
        if (serverData) dispatch(editTask(serverData));
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
      const response = await Api.delete("/task/", { data: { id: taskId } });

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

  // ── Edit / Add handlers ───────────────────────────────────────────
  function handleEdit(task) {
    dispatch(setFormObj(task));
    dispatch(setFormTitle("Edit Task"));
    dispatch(setComponentToShow(task_list_component_name));
    dispatch(toggleRSBView(true));
  }

  // Passing a columnId pre-selects that status in the form
  function handleAddTask(columnId) {
    dispatch(setFormObj(columnId ? { task_status: Number(columnId) } : {}));
    dispatch(setFormTitle("Add Task"));
    dispatch(setComponentToShow(task_list_component_name));
    dispatch(toggleRSBView(true));
  }

  // ── Stats ─────────────────────────────────────────────────────────
  const totalTasks = activeTasks.length;
  const doneColumnId = columns.find((c) => c.key === "done")?.id;
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
    <div style={styles.panel}>
      <style>{CSS}</style>

      {/* Title */}
      <h5 className="mb-2" style={{ fontWeight: 700, color: THEME.text }}>
        Tasks
      </h5>

      {/* Header bar */}
            {/* Header bar */}
      <div
        className="d-flex flex-wrap align-items-center gap-3 mb-3"
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "12px 18px",
          boxShadow: "0 2px 10px rgba(61,74,133,0.07)",
        }}
      >
        {/* LEFT: overall progress bar */}
        <ProgressBar value={progressPct} done={doneTasks} overdue={overdueTasks} total={totalTasks} />

        {/* RIGHT: cylinders + columns + create */}
        <div className="d-flex flex-wrap align-items-center gap-3 ms-auto">
          {/* <div className="d-flex align-items-end gap-2">
            <StatBar3D
              label="Total"
              value={totalTasks}
              max={totalTasks}
              color={PALETTE.holiday}
            />
            <StatBar3D
              label="Done"
              value={doneTasks}
              max={totalTasks}
              color={THEME.success}
            />
            <StatBar3D
              label="Overdue"
              value={overdueTasks}
              max={totalTasks}
              color="#f2634a"
            />
          </div> */}

          <Divider />

          <UncontrolledDropdown>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              style={{
                background: "#fff",
                border: `1px solid ${THEME.border}`,
                color: THEME.text,
                borderRadius: 10,
                padding: "8px 14px",
                fontWeight: 600,
              }}
            >
              <i className="ri-layout-column-line"></i>
              Columns
              {hiddenCount > 0 && (
                <span
                  style={{
                    background: THEME.primarySoft,
                    color: THEME.primary,
                    borderRadius: 10,
                    fontSize: 10,
                    padding: "2px 8px",
                  }}
                >
                  {hiddenCount} hidden
                </span>
              )}
            </DropdownToggle>
            <DropdownMenu end container="body" style={{ minWidth: 220 }}>
              <DropdownItem header>Show / hide columns</DropdownItem>
              {columns.map((col) => {
                const isVisible = !hiddenKeys.includes(col.key);
                return (
                  <DropdownItem
                    key={col.key}
                    toggle={false}
                    onClick={() => toggleColumn(col.key)}
                    className="d-flex align-items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={isVisible}
                      readOnly
                      style={{ pointerEvents: "none" }}
                    />
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: col.color,
                        display: "inline-block",
                      }}
                    />
                    <span>{col.title}</span>
                    <span className="ms-auto text-muted fs-11">
                      {taskCountByStatus[col.id] || 0}
                    </span>
                  </DropdownItem>
                );
              })}
              {hiddenCount > 0 && (
                <>
                  <DropdownItem divider />
                  <DropdownItem toggle={false} onClick={showAllColumns}>
                    <i className="ri-eye-line align-bottom me-2 text-muted"></i>
                    Show all columns
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>

          <Button
            size="sm"
            className="tk-create-btn"
            onClick={() => handleAddTask()}
            style={{
              background: THEME.success,
              borderColor: THEME.success,
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 600,
            }}
          >
            <i className="ri-add-line align-bottom me-1"></i>Create Task
          </Button>
        </div>
      </div>

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
            onClick={getAllTasks}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
            style={{ color: THEME.primary }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-2 fs-14" style={{ color: THEME.muted }}>
            Loading tasks…
          </p>
        </div>
      ) : visibleColumns.length === 0 ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center py-5"
          style={{ color: THEME.muted }}
        >
          <i className="ri-eye-off-line fs-24 mb-2"></i>
          <p className="mb-2 fs-14">All columns are hidden.</p>
          <Button
            size="sm"
            onClick={showAllColumns}
            style={{
              background: THEME.primary,
              borderColor: THEME.primary,
              borderRadius: 10,
            }}
          >
            Show all columns
          </Button>
        </div>
      ) : (
        <div
          className="tk-board"
          style={styles.boardWrapper}
          ref={boardScrollRef}
          onMouseDown={handlePanMouseDown}
          onMouseMove={handlePanMouseMove}
          onMouseUp={handlePanMouseUp}
          onMouseLeave={handlePanMouseUp}
        >
          <div style={styles.boardInner}>
            {visibleColumns.map((col) => (
              <KanbanColumn
                key={col.key}
                column={col}
                columns={columns}
                tasks={getTasksForColumn(col.id)}
                priorityMap={priorityMap}
                employeeMap={employeeMap}
                draggingId={draggingId}
                updatingIds={updatingIds}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAddTask}
                onHide={toggleColumn}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskKanban;