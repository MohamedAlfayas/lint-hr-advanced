import React, {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const VISIBLE_ROWS = 5;
import {
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
} from "reactstrap";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import moment from "moment";
import { Api } from "../../common/api/Api";
import { setTodayAttendance } from "../../redux/reducers/ChildReducer/TodayAttendanceReducer";
import { useDispatch } from "react-redux";
import Lottie from "react-lottie";
import noLocationFind from "../auth/loader/animation/no-location.json";
import { DateFormat, profile_view_component_name } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import UsersClusterMapAll from "./useClusterMapAll";
import AppTable from "../../shared/ui/table/AppTable";
import PillTabs from "../../shared/ui/PillTabs";
import {
  ApvAvatar,
  ApvChip,
  ApvEmpty,
  ApvHours,
  ApvStatus,
  ApvTime,
} from "../../component/common/approval/ApprovalCells";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./LocationWebSocket/WebSocket";

dayjs.extend(customParseFormat);

// ─── Check-in device icon (punched_by: 1 = desktop, 2 = mobile) ──────────
const PunchDeviceIcon = ({ punchedBy }) => {
  const type = Number(punchedBy);

  if (type === 1) {
    return (
      <i
        className="bx bx-desktop"
        title="Checked in from Desktop"
        style={{ color: "#405189", fontSize: "16px", lineHeight: 1 }}
      ></i>
    );
  }

  if (type === 2) {
    return (
      <i
        className="bx bx-mobile-alt"
        title="Checked in from Mobile"
        style={{ color: "#0ab39c", fontSize: "16px", lineHeight: 1 }}
      ></i>
    );
  }

  return null;
};

// ─── Custom status badge ──────────────────────────────────────────────────
const getCheckInStatusBadge = (statusName, customStatuses = []) => {
  const matched = customStatuses.find(
    (cs) =>
      cs.is_active &&
      cs.name.toLowerCase() === (statusName || "").toLowerCase(),
  );

  if (matched) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "#f0f4ff",
          border: "1px solid #c7d2fe",
          color: "#3730a3",
          fontSize: "10px",
          padding: "2px 8px",
          borderRadius: "20px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          letterSpacing: "0.2px",
        }}
      >
        <span style={{ fontSize: "12px", lineHeight: 1 }}>
          {matched.icon || matched.emoji || ""}
        </span>
        {matched.name}
      </span>
    );
  }

  switch ((statusName || "").toLowerCase()) {
    case "checked-in":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          ● Checked In
        </span>
      );
    case "checked-out":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          ● Checked Out
        </span>
      );
    case "not-checked-in":
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "#fef3c7",
            color: "#92400e",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          ● Not Checked In
        </span>
      );
    default:
      return statusName ? (
        <span
          className="badge"
          style={{
            backgroundColor: "#f1f5f9",
            color: "#475569",
            fontSize: "10px",
            padding: "3px 7px",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          ● {statusName}
        </span>
      ) : null;
  }
};

// ─── Approval badge ───────────────────────────────────────────────────────
const APPROVAL_STATUS = {
  1: { label: "Pending", color: "warning" },
  2: { label: "Approved", color: "success" },
  3: { label: "Rejected", color: "error" },
  4: { label: "Cancelled", color: "error" },
};

const getApprovalBadge = (status) => {
  const { label, color } = APPROVAL_STATUS[status] || {
    label: "Unknown",
    color: "default",
  };
  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      label={label}
      sx={{ fontWeight: 600 }}
    />
  );
};

// ─── Attendance status chip colors ────────────────────────────────────────
const ATTENDANCE_STATUS = {
  "On Time": { tone: "success", icon: "ri-checkbox-circle-line" },
  Late: { tone: "warning", icon: "ri-alarm-warning-line" },
  Leave: { tone: "secondary", icon: "ri-calendar-2-line" },
  default: { tone: "danger", icon: "ri-close-circle-line" },
};

const timeSortValue = (value) =>
  value ? new Date(`1970-01-01 ${value}`).getTime() || 0 : 0;

const timeSortingFn = (key) => (a, b) =>
  timeSortValue(a.original[key]) - timeSortValue(b.original[key]);

// ─── Leave type label (for status filter matching) ────────────────────────
const getLeaveTypeLabel = (row) => {
  if (row.halfday) return "Half Day Leave";
  if (row.permission) return "Permission";
  if (row.fullday) return "Full Day Leave";
  return "Full Day Leave";
};

// ─── Worked-time progress (share of today's work schedule) ────────────────
const PROGRESS_TONES = [
  { min: 90, from: "#0ab39c", to: "#34d399", text: "#0a8f7d" },
  { min: 50, from: "#4b6cb7", to: "#6a8dff", text: "#4b6cb7" },
  { min: 25, from: "#f7b84b", to: "#fcd34d", text: "#c98a16" },
  { min: 0, from: "#f06548", to: "#fb923c", text: "#e04b2c" },
];

const WorkProgress = ({ value = 0, worked }) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const tone = PROGRESS_TONES.find((t) => pct >= t.min);
  return (
    <Tooltip
      arrow
      placement="bottom-start"
      title={`${worked ? `${worked} worked · ` : ""}${pct}% of work schedule`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "6px",
          maxWidth: "200px",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            height: "6px",
            borderRadius: "999px",
            background: "rgba(135,138,153,.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              minWidth: pct > 0 ? "6px" : 0,
              height: "100%",
              borderRadius: "inherit",
              background: `linear-gradient(90deg, ${tone.from}, ${tone.to})`,
              boxShadow: pct > 0 ? `0 0 6px ${tone.from}66` : "none",
              transition: "width .6s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            color: tone.text,
            minWidth: "30px",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct}%
        </span>
      </div>
    </Tooltip>
  );
};

// ─── Divider between info blocks ──────────────────────────────────────────
const InfoDivider = () => (
  <div
    style={{
      width: "1px",
      backgroundColor: "#e5e7eb",
      alignSelf: "stretch",
      minHeight: "40px",
    }}
  />
);

// ─── Single leave/permission info block ───────────────────────────────────
const LeaveInfoBlock = ({
  status,
  timeStart,
  timeEnd,
  dateStart,
  dateEnd,
  reason,
  formatTime,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "3px",
      minWidth: "110px",
    }}
  >
    {getApprovalBadge(status)}

    {/* Show date range for full_day, time range for half_day / permission */}
    {dateStart ? (
      <small style={{ color: "#78716c", fontSize: "10px" }}>
        {dateStart}
        {dateEnd && dateEnd !== dateStart ? ` – ${dateEnd}` : ""}
      </small>
    ) : timeStart ? (
      <small style={{ color: "#78716c", fontSize: "10px" }}>
        {formatTime(timeStart)}
        {timeEnd ? ` – ${formatTime(timeEnd)}` : ""}
      </small>
    ) : null}

    {reason && (
      <small
        title={reason}
        style={{
          color: "#57534e",
          fontSize: "10px",
          fontStyle: "italic",
          maxWidth: "130px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {reason}
      </small>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
const TodayAttendanceTable = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
  );
  const [search, setSearch] = useState("");
  const tableScrollRef = useRef(null);
  const [tableMaxHeight, setTableMaxHeight] = useState(420);
  const [departments, setDepartments] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  // ── Map modal state ──
  const [mapEmployees, setMapEmployees] = useState([]);

  const [mapSelectedEmpId, setMapSelectedEmpId] = useState(null);
  const [mapSelectedEmpName, setMapSelectedEmpName] = useState("");
  const [mapSelectedEmpProfileUrl, setMapSelectedEmpProfileUrl] =
    useState(null);
  const [mapSelectedDate, setMapSelectedDate] = useState(null); // ISO (YYYY-MM-DD) date to seed the map's date filter
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMapFull, setIsMapFull] = useState(false);

  const [countIn, setCountIn] = useState(0);
  const [countNotCheckIn, setCountNotCheckIn] = useState(0);
  const [countLeave, setCountLeave] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Load departments + custom_statuses from localStorage
  useEffect(() => {
    const globalData = localStorage.getItem("lint_hr_globaldata");
    if (globalData) {
      try {
        const parsedData = JSON.parse(globalData);
        if (Array.isArray(parsedData.department)) {
          setDepartments(parsedData.department);
        }
        if (Array.isArray(parsedData.custom_statuses)) {
          setCustomStatuses(parsedData.custom_statuses);
        }
      } catch (error) {
        console.error("Failed to parse global data", error);
      }
    }
  }, []);

  // ✅ Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setAttendanceData([]);
        setCountIn(0);
        setCountNotCheckIn(0);
        setCountLeave(0);
        dispatch(setTodayAttendance([]));

        const response = await Api.get(
          `/attendance/get-attendance-status?date=${ConvertISODateFormat(
            ConvertDateFormat(dateFilter),
          )}`,
        );
        const result = response.data;

        if (!Array.isArray(result) || result.length === 0) {
          setAttendanceData([]);
          dispatch(setTodayAttendance([]));
          return;
        }

        const formattedData = result.map((item) => {
          // ─── Determine which leave records exist ──────────────────────
          // full_day  → is_on_leave true, full_day object present
          // half_day  → half_day object present
          // permission → permission object present
          // An employee can be BOTH present AND have leave records.

          const hasFullDay = !!item.full_day;
          const hasHalfDay = !!item.half_day;
          const hasPermission = !!item.permission;
          const hasAnyLeave =
            item.is_on_leave || hasHalfDay || hasPermission || hasFullDay;

          // Primary attendance status (Tab 1 / Tab 2 gate)
          let attendanceStatus;
          if (item.is_present) {
            attendanceStatus = item.is_late ? "Late" : "On Time";
          } else if (hasAnyLeave) {
            attendanceStatus = "Leave";
          } else {
            attendanceStatus = "Not Check In";
          }

          // ✅ First check-in device: punched_by 1 = desktop, 2 = mobile
          const firstCheckIn =
            (Array.isArray(item.location_history) &&
              item.location_history[0]) ||
            item.first_check_in ||
            null;
          const punchedBy = firstCheckIn?.punched_by ?? null;

          return {
            emp_id: item.employee.emp_id,
            employee_id: item.employee.id,
            first_name: item.employee.first_name || "-",
            profile_url: item.employee.profile_url || null,
            email: item.employee.email || "-",
            department:
              Array.isArray(item.employee.primary_department_id_list) &&
              item.employee.primary_department_id_list.length > 0
                ? departments.find(
                    (d) => d.id === item.employee.primary_department_id_list[0],
                  )?.name || ""
                : "",

            inTime: item.first_check_in_time || null,
            outTime: item.last_check_out_time || null,
            punchedBy,

            totalSeconds: item.total_time_worked_till_last_checkout || 0,

            totalHours: (() => {
              const totalSeconds =
                item.total_time_worked_till_last_checkout || 0;
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              return `${hours}h ${minutes}m`;
            })(),

            status: attendanceStatus,

            // ✅ showInLeaveTab: true when any leave record exists
            showInLeaveTab: hasAnyLeave,

            isOnLeave: item.is_on_leave || false,
            checkInStatus: item.status || null,
            date: item.date,
            location_history: item.location_history,

            progress:
              item.total_work_duration && item.total_time_worked
                ? Math.min(
                    100,
                    Math.round(
                      (item.total_time_worked / item.total_work_duration) * 100,
                    ),
                  )
                : 0,

            // ✅ full_day mapped from API
            fullday: item.full_day
              ? {
                  start: item.full_day.start || null, // e.g. "2026-04-23"
                  end: item.full_day.end || null, // e.g. "2026-04-24"
                  reason: item.full_day.reason || "-",
                  status: item.full_day.status,
                }
              : null,

            halfday: item.half_day
              ? {
                  start: item.half_day.start || null,
                  end: item.half_day.end || null,
                  reason: item.half_day.reason || "-",
                  status: item.half_day.status,
                }
              : null,

            permission: item.permission
              ? {
                  start: item.permission.start || null,
                  end: item.permission.end || null,
                  reason: item.permission.reason || "-",
                  status: item.permission.status,
                }
              : null,
          };
        });

        setAttendanceData(formattedData);
        dispatch(setTodayAttendance(result));
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData([]);
        dispatch(setTodayAttendance([]));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [dateFilter, departments, dispatch]);

  // ✅ Recalculate tab badge counts
  useEffect(() => {
    if (attendanceData.length === 0) {
      setCountIn(0);
      setCountNotCheckIn(0);
      setCountLeave(0);
      return;
    }

    const filtered = attendanceData.filter((item) =>
      departmentFilter === "All" ? true : item.department === departmentFilter,
    );

    setCountIn(
      filtered.filter((i) => i.status === "On Time" || i.status === "Late")
        .length,
    );

    setCountNotCheckIn(
      filtered.filter((i) => i.status === "Not Check In").length,
    );

    // ✅ Leave count: everyone with any leave record
    setCountLeave(filtered.filter((i) => i.showInLeaveTab).length);
  }, [attendanceData, departmentFilter]);

  // ─── Status filter options ────────────────────────────────────────────────
  const statusFilterOptions = useMemo(() => {
    if (activeTab === "1") {
      const customOptions = customStatuses
        .filter((cs) => cs.is_active)
        .map((cs) => ({
          value: cs.name,
          label: `${cs.icon || cs.emoji || ""} ${cs.name}`.trim(),
        }));
      return [{ value: "All", label: "All Status" }, ...customOptions];
    }
    if (activeTab === "3") {
      return [
        { value: "All", label: "All Leave Types" },
        { value: "Full Day Leave", label: "Full Day Leave" },
        { value: "Half Day Leave", label: "Half Day Leave" },
        { value: "Permission", label: "Permission" },
      ];
    }
    return [];
  }, [activeTab, customStatuses]);

  const showStatusFilter = activeTab === "1" || activeTab === "3";

  // ✅ Opens the map modal seeded with every employee. The map's own
  // filter bar (department + employee) then lets the user switch between
  // them without closing the modal. The table's currently selected
  // dateFilter (DD-MM-YYYY) is converted to ISO (YYYY-MM-DD) and passed
  // down as initialDate so the map opens on the SAME date the table is
  // showing, instead of always defaulting to "today".
  const handleViewLocations = (row) => {
    const isoDate = ConvertISODateFormat(ConvertDateFormat(dateFilter));

    setMapEmployees(attendanceData);
    setMapSelectedEmpId(row.employee_id);
    setMapSelectedEmpName(row.first_name);
    setMapSelectedEmpProfileUrl(row.profile_url || null);
    setMapSelectedDate(isoDate);
    setIsMapFull(true);
    setIsMapOpen(true);
  };

  const viewEmployee = (row) => {
    const employee = (GetLocalStorageData("employee") || []).find(
      (e) => e.id === row.employee_id,
    );
    dispatch(setFormTitle("Employee Details"));
    dispatch(
      setFormObj(
        employee || {
          id: row.employee_id,
          emp_id: row.emp_id,
          first_name: row.first_name,
          email: row.email,
          profile_url: row.profile_url,
        },
      ),
    );
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow(profile_view_component_name));
    dispatch(toggleRSBView(true));
  };

  // connect when modal opens with a selected employee, disconnect on close/unmount
  useEffect(() => {
    if (isMapOpen && mapSelectedEmpId) {
      connectWebSocket(mapSelectedEmpId);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [isMapOpen, mapSelectedEmpId]);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    if (typeof timeString === "string" && timeString.includes(" ")) {
      return timeString;
    }
    try {
      const parsed = moment.utc(timeString);
      if (!parsed.isValid()) return "-";
      return parsed.format("hh:mm A");
    } catch {
      return "-";
    }
  };

  // ✅ Filtered data
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      if (activeTab === "1" && !["On Time", "Late"].includes(item.status))
        return false;
      if (activeTab === "2" && item.status !== "Not Check In") return false;
      if (activeTab === "3" && !item.showInLeaveTab) return false;

      if (departmentFilter !== "All" && item.department !== departmentFilter)
        return false;

      if (statusFilter !== "All") {
        if (activeTab === "1") {
          const csName = (item.checkInStatus || "").toLowerCase();
          if (csName !== statusFilter.toLowerCase()) return false;
        } else if (activeTab === "3") {
          if (getLeaveTypeLabel(item) !== statusFilter) return false;
        }
      }

      return true;
    });
  }, [attendanceData, activeTab, departmentFilter, statusFilter]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("All");
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: noLocationFind,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  // ─── Leave type pills renderer ────────────────────────────────────────────
  const renderLeaveTypePills = (row) => {
    const pills = [];

    if (row.fullday) {
      pills.push(
        <span
          key="fullday"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <i className="bx bx-calendar-x" style={{ color: "#ef4444" }}></i>
          Full Day Leave
        </span>,
      );
    }

    if (row.halfday) {
      pills.push(
        <span
          key="halfday"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <i className="bx bx-time-five" style={{ color: "#d97706" }}></i>
          Half Day Leave
        </span>,
      );
    }

    if (row.permission) {
      pills.push(
        <span
          key="permission"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#f5f3ff",
            border: "1px solid #c4b5fd",
            color: "#4c1d95",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <i className="bx bx-exit" style={{ color: "#7c3aed" }}></i>
          Permission
        </span>,
      );
    }

    // Fallback: on_leave but no typed records
    if (pills.length === 0 && row.isOnLeave) {
      pills.push(
        <span
          key="leave"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <i className="bx bx-calendar-x" style={{ color: "#ef4444" }}></i>
          Full Day Leave
        </span>,
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {pills}
      </div>
    );
  };

  // ─── Info cell renderer ───────────────────────────────────────────────────
  const renderInfoCell = (row) => {
    const blocks = [];

    // Full Day Leave block
    if (row.fullday) {
      blocks.push(
        <LeaveInfoBlock
          key="fullday"
          status={row.fullday.status}
          dateStart={row.fullday.start}
          dateEnd={row.fullday.end}
          reason={row.fullday.reason}
          formatTime={formatTime}
        />,
      );
    }

    // Half Day block
    if (row.halfday) {
      if (blocks.length > 0) blocks.push(<InfoDivider key="div1" />);
      blocks.push(
        <LeaveInfoBlock
          key="halfday"
          status={row.halfday.status}
          timeStart={row.halfday.start}
          timeEnd={row.halfday.end}
          reason={row.halfday.reason}
          formatTime={formatTime}
        />,
      );
    }

    // Permission block
    if (row.permission) {
      if (blocks.length > 0) blocks.push(<InfoDivider key="div2" />);
      blocks.push(
        <LeaveInfoBlock
          key="permission"
          status={row.permission.status}
          timeStart={row.permission.start}
          timeEnd={row.permission.end}
          reason={row.permission.reason}
          formatTime={formatTime}
        />,
      );
    }

    if (blocks.length === 0) {
      return <span style={{ color: "#d1d5db", fontSize: "18px" }}>—</span>;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {blocks}
      </div>
    );
  };

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const nameColumn = {
      id: "first_name",
      accessorFn: (row) => `${row.first_name} #${row.emp_id}`,
      header: "Name",
      size: 260,
      exportValue: (row) => row.first_name,
      Cell: ({ row: { original: row } }) => (
        <div className="apv-emp align-items-start">
          <ApvAvatar url={row.profile_url} name={row.first_name} />
          <div className="apv-emp-text">
            <span className="apv-emp-name" title={row.first_name}>
              <button
                type="button"
                className="apv-emp-name-text"
                data-testid={`today-attendance-row-${row.emp_id || row.employee_id}-name-button`}
                onClick={() => viewEmployee(row)}
              >
                {row.first_name}
              </button>
              {row.emp_id && <span className="apv-emp-tag">#{row.emp_id}</span>}
            </span>

            {((row.inTime && row.punchedBy) || row.checkInStatus) && (
              <div className="d-flex align-items-center gap-2 flex-wrap my-1">
                {row.inTime && <PunchDeviceIcon punchedBy={row.punchedBy} />}
                {row.checkInStatus &&
                  getCheckInStatusBadge(row.checkInStatus, customStatuses)}
              </div>
            )}

            <span className="apv-emp-mail" title={row.email}>
              {row.email}
            </span>

            {activeTab === "1" && (
              <WorkProgress value={row.progress} worked={row.totalHours} />
            )}
          </div>
        </div>
      ),
    };

    const departmentColumn = {
      id: "department",
      accessorFn: (row) => row.department || "-",
      header: "Department",
      filterVariant: "select",
      Cell: ({ cell }) => <ApvChip icon="ri-building-line">{cell.getValue() === "-" ? "" : cell.getValue()}</ApvChip>,
    };

    if (activeTab === "3") {
      return [
        nameColumn,
        departmentColumn,
        {
          id: "leave_type",
          accessorFn: getLeaveTypeLabel,
          header: "Leave Type",
          filterVariant: "select",
          Header: () => (
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <i
                className="bx bx-calendar-x"
                style={{ color: "#ef4444", fontSize: "14px" }}
              ></i>
              Leave Type
            </span>
          ),
          Cell: ({ row }) => renderLeaveTypePills(row.original),
        },
        {
          id: "info",
          accessorFn: (row) =>
            [row.fullday, row.halfday, row.permission]
              .filter(Boolean)
              .map((l) => l.reason)
              .join(", "),
          header: "Info",
          size: 320,
          enableSorting: false,
          enableGlobalFilter: false,
          Cell: ({ row }) => renderInfoCell(row.original),
        },
      ];
    }

    return [
      nameColumn,
      departmentColumn,
      {
        id: "inTime",
        accessorFn: (row) => formatTime(row.inTime),
        header: "In Time",
        sortingFn: timeSortingFn("inTime"),
        Cell: ({ cell }) => <ApvTime value={cell.getValue()} kind="in" />,
      },
      {
        id: "outTime",
        accessorFn: (row) => formatTime(row.outTime),
        header: "Out Time",
        sortingFn: timeSortingFn("outTime"),
        Cell: ({ cell }) => <ApvTime value={cell.getValue()} kind="out" />,
      },
      {
        accessorKey: "totalHours",
        header: "Total Hours",
        sortingFn: (a, b) => a.original.totalSeconds - b.original.totalSeconds,
        Cell: ({ cell, row }) =>
          row.original.totalSeconds ? (
            <ApvHours value={cell.getValue()} unit={null} strong />
          ) : (
            <ApvEmpty />
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        Cell: ({ cell }) => {
          const s = ATTENDANCE_STATUS[cell.getValue()] || ATTENDANCE_STATUS.default;
          return <ApvStatus tone={s.tone} icon={s.icon} label={cell.getValue()} />;
        },
      },
    ];
  }, [activeTab, customStatuses]);

  // Size the scroll area to exactly the header + first VISIBLE_ROWS rows.
  useLayoutEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const head = el.querySelector("thead");
    const rows = Array.from(el.querySelectorAll("tbody tr")).slice(0, VISIBLE_ROWS);
    if (!head || rows.length === 0) return;
    const rowsHeight = rows.reduce((sum, r) => sum + r.getBoundingClientRect().height, 0);
    const avgRow = rowsHeight / rows.length;
    const height = Math.ceil(head.getBoundingClientRect().height + avgRow * VISIBLE_ROWS) + 2;
    setTableMaxHeight((prev) => (Math.abs(prev - height) > 1 ? height : prev));
  }, [filteredData, activeTab, loading]);

  return (
    <>
          <Card id="attendanceList" className="h-100 mb-0">
            <CardHeader
              className="d-flex align-items-center justify-content-between flex-wrap gap-2"
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--vz-border-color)",
                borderRadius: "var(--vz-card-inner-border-radius, 12px) var(--vz-card-inner-border-radius, 12px) 0 0",
                background: "var(--app-head-tint), var(--vz-secondary-bg)",
              }}
            >
              <div className="apv-head">
                <span className="apv-head-icon">
                  <i className="ri-fingerprint-line"></i>
                </span>
                <div style={{ minWidth: 0 }}>
                  <h5 className="apv-head-title">Entry Status</h5>
                  <span className="apv-head-sub">
                    Check-in and check-out activity for your team
                  </span>
                </div>
              </div>
              <span
                className="d-inline-flex align-items-center gap-2 fw-semibold"
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  color: "var(--vz-heading-color)",
                  background: "var(--vz-secondary-bg)",
                  border: "1px solid var(--vz-border-color)",
                }}
              >
                <i className="ri-calendar-line" style={{ color: "var(--vz-success)", fontSize: 15 }}></i>
                {dateFilter}
              </span>
            </CardHeader>

            <CardBody>
              <Box sx={{ border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                  <PillTabs
                    value={activeTab}
                    onChange={handleTabChange}
                    tabs={[
                      { value: "1", label: "In", count: countIn, tone: "success", icon: "ri-login-circle-line" },
                      { value: "2", label: "Not Check In", count: countNotCheckIn, tone: "danger", icon: "ri-user-unfollow-line" },
                      { value: "3", label: "Leave", count: countLeave, tone: "primary", icon: "ri-calendar-event-line" },
                    ]}
                  />
                </Box>

                <AppTable
                  key={activeTab}
                  columns={columns}
                  data={filteredData}
                  isLoading={loading}
                  exportFileName={`attendance-${dateFilter}`}
                  emptyMessage="No Data Found!"
                  state={{ globalFilter: search }}
                  onGlobalFilterChange={(value) => setSearch(value ?? "")}
                  muiTablePaperProps={{ elevation: 0, sx: { border: 0, borderRadius: 0 } }}
                  enablePagination={false}
                  enableColumnDragging={false}
                  muiTableContainerProps={{
                    ref: tableScrollRef,
                    sx: {
                      maxHeight: tableMaxHeight,
                      maxWidth: "100%",
                      overflow: "auto",
                      scrollbarWidth: "thin",
                    },
                  }}
                  toolbarActions={
                    <>
                      <TextField
                        select
                        size="small"
                        label="Department"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        sx={{ width: 180 }}
                      >
                        <MenuItem value="All">All Departments</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      {showStatusFilter && (
                        <TextField
                          select
                          size="small"
                          label="Status"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          sx={{ width: 160 }}
                        >
                          {statusFilterOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                      <DatePicker
                        label="Date"
                        format={DateFormat}
                        value={dayjs(dateFilter, DateFormat)}
                        onChange={(d) => d?.isValid() && setDateFilter(d.format(DateFormat))}
                        slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                      />
                    </>
                  }
                  enableRowActions={activeTab === "1"}
                  positionActionsColumn="last"
                  displayColumnDefOptions={{
                    "mrt-row-actions": { header: "Location", size: 110 },
                  }}
                  renderRowActions={({ row }) => (
                    <Tooltip title="View Locations">
                      <Button
                        data-testid="today-attendance-view-button"
                        size="small"
                        color="info"
                        variant="text"
                        startIcon={<PlaceOutlinedIcon fontSize="small" />}
                        onClick={() => handleViewLocations(row.original)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          minWidth: 0,
                          px: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>
                  )}
                />
              </Box>
            </CardBody>
          </Card>

        {/* ── Map Modal ── */}
        <Modal
          size={isMapFull ? undefined : "xl"}
          fullscreen={isMapFull}
          isOpen={isMapOpen}
          toggle={() => setIsMapOpen(!isMapOpen)}
          className="lhm-modal"
          onOpened={() => {
            // Google Maps sizes itself off its container's dimensions at the
            // moment it's created. If that happens while the reactstrap
            // Modal is still animating in (container is 0-size / mid-fade),
            // the map renders blank and never self-corrects. Firing a
            // resize once the modal has FULLY opened lets the map component
            // (which listens for "resize") trigger Google's own resize
            // event and re-fit the route — the same thing "Full view"
            // does manually.
            window.dispatchEvent(new Event("resize"));
          }}
        >
          <div className="lhm-head">
            <button
              data-testid="today-attendance-back-button"
              type="button"
              className="lhm-icon-btn"
              onClick={() => setIsMapOpen(false)}
              title="Back"
            >
              <i className="ri-arrow-left-line"></i>
            </button>

            <div className="lhm-title-wrap">
              <span className="lhm-title-icon">
                <i className="ri-map-pin-time-line"></i>
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="lhm-title">Employee Location History</div>
                <div className="lhm-sub">
                  Route playback, activity and device timeline
                </div>
              </div>
            </div>

            {mapSelectedEmpName && (
              <div className="lhm-emp">
                {mapSelectedEmpProfileUrl ? (
                  <img
                    src={mapSelectedEmpProfileUrl}
                    alt=""
                    className="lhm-emp-avatar"
                  />
                ) : (
                  <span className="lhm-emp-avatar">
                    {mapSelectedEmpName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="lhm-emp-text">
                  <div className="lhm-emp-name">{mapSelectedEmpName}</div>
                  <div className="lhm-emp-tag">Tracking</div>
                </div>
              </div>
            )}

            <button
              data-testid="today-attendance-close-button"
              type="button"
              className="lhm-icon-btn is-close"
              onClick={() => setIsMapOpen(false)}
              title="Close"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          <ModalBody
            style={{
              height: isMapFull ? "calc(100vh - 65px)" : "78vh",
              padding: 0,
            }}
          >
            {mapEmployees && mapEmployees.length > 0 ? (
              <UsersClusterMapAll
                employees={mapEmployees}
                initialEmpId={mapSelectedEmpId}
                initialDate={mapSelectedDate}
                departments={departments.map((d) => d.name)}
                onSelectEmployee={(emp) => {
                  setMapSelectedEmpName(emp?.first_name || "");
                  setMapSelectedEmpProfileUrl(emp?.profile_url || null);
                }}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Lottie options={defaultOptions} height={250} width={250} />
                <p className="lhm-empty-text">
                  No location history available
                </p>
              </div>
            )}
          </ModalBody>
        </Modal>
    </>
  );
};

export default TodayAttendanceTable;
