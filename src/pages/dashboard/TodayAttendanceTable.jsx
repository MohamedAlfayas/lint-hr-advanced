import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import classnames from "classnames";
import moment from "moment";
import { Api } from "../../common/api/Api";
import { setTodayAttendance } from "../../redux/reducers/ChildReducer/TodayAttendanceReducer";
import { useDispatch } from "react-redux";
import Lottie from "react-lottie";
import noLocationFind from "../auth/loader/animation/no-location.json";
import { DatePicker } from "antd";
import { DateFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import UsersClusterMapAll from "./useClusterMapAll";
import SkletonDashboard from "../../component/common/skeleton/SkletonDashboard";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

dayjs.extend(customParseFormat);

// ─── Responsive styles injected once ─────────────────────────────────────
const RESPONSIVE_STYLES = `
  .attendance-table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .attendance-table {
    width: 100%;
    min-width: 700px;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .attendance-table.leave-tab {
    min-width: 560px;
  }
  @media (max-width: 991px) {
    .attendance-table {
      min-width: 620px;
    }
    .attendance-table.leave-tab {
      min-width: 480px;
    }
  }
  @media (max-width: 575px) {
    .attendance-table,
    .attendance-table.leave-tab {
      min-width: 520px;
    }
    .filter-container .row > [class*="col-"] {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
  .attendance-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #f8f9fa;
  }
  @media (max-width: 767px) {
    .attendance-table td,
    .attendance-table th {
      padding: 8px 6px !important;
      font-size: 12px;
    }
  }
`;

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
const getApprovalBadge = (status) => {
  switch (status) {
    case 1:
      return (
        <span className="badge bg-warning-subtle text-warning">Pending</span>
      );
    case 2:
      return (
        <span className="badge bg-success-subtle text-success">Approved</span>
      );
    case 3:
      return (
        <span className="badge bg-danger-subtle text-danger">Rejected</span>
      );
    case 4:
      return (
        <span className="badge bg-danger-subtle text-danger">Cancelled</span>
      );
    default:
      return (
        <span className="badge bg-secondary-subtle text-secondary">
          Unknown
        </span>
      );
  }
};

// ─── Leave type label (for status filter matching) ────────────────────────
const getLeaveTypeLabel = (row) => {
  if (row.halfday) return "Half Day Leave";
  if (row.permission) return "Permission";
  if (row.fullday) return "Full Day Leave";
  return "Full Day Leave";
};

// ─── Filter field style ───────────────────────────────────────────────────
const FILTER_HEIGHT = "38px";
const filterInputStyle = {
  height: FILTER_HEIGHT,
  borderRadius: "6px",
  border: "1px solid #ced4da",
  fontSize: "13px",
  width: "100%",
  boxSizing: "border-box",
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

  const thCenter = { textAlign: "center", verticalAlign: "middle" };
  const tdCenter = { textAlign: "center", verticalAlign: "middle" };

  // Inject responsive CSS once
  useEffect(() => {
    const styleId = "attendance-table-responsive-styles";
    if (!document.getElementById(styleId)) {
      const tag = document.createElement("style");
      tag.id = styleId;
      tag.textContent = RESPONSIVE_STYLES;
      document.head.appendChild(tag);
    }
  }, []);

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

          return {
            emp_id: item.employee.emp_id,
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

  // ✅ Opens the map modal seeded with every employee that has a usable route
  // (≥2 location points) on the currently selected date. The map's own
  // filter bar (department + employee) then lets the user switch between
  // them without closing the modal. The table's currently selected
  // dateFilter (DD-MM-YYYY) is converted to ISO (YYYY-MM-DD) and passed
  // down as initialDate so the map opens on the SAME date the table is
  // showing, instead of always defaulting to "today".
  const handleViewLocations = (row) => {
    const withLocations = attendanceData.filter(
      (e) => Array.isArray(e.location_history) && e.location_history.length > 1,
    );

    const isoDate = ConvertISODateFormat(ConvertDateFormat(dateFilter));

    setMapEmployees(withLocations);
    setMapSelectedEmpId(row.emp_id);
    setMapSelectedEmpName(row.first_name);
    setMapSelectedEmpProfileUrl(row.profile_url || null);
    setMapSelectedDate(isoDate);
    setIsMapFull(false);
    setIsMapOpen(true);
  };

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

      const q = search.toLowerCase();
      return (
        !q ||
        (item.first_name || "").toLowerCase().includes(q) ||
        (item.department || "").toLowerCase().includes(q) ||
        (item.status || "").toLowerCase().includes(q) ||
        (item.totalHours || "").toLowerCase().includes(q)
      );
    });
  }, [attendanceData, activeTab, departmentFilter, statusFilter, search]);

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

  const getColumnCount = (tab) => {
    if (tab === "1") return 7;
    if (tab === "2") return 6;
    return 4;
  };

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ title, sortKey, style = {} }) => (
    <th
      onClick={() => handleSort(sortKey)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        {title}

        {sortConfig.key === sortKey ? (
          sortConfig.direction === "asc" ? (
            <i className="bx bx-chevron-up"></i>
          ) : (
            <i className="bx bx-chevron-down"></i>
          )
        ) : (
          <i className="bx bx-sort-alt-2" style={{ opacity: 0.5 }}></i>
        )}
      </div>
    </th>
  );

  // ─── Table headers ────────────────────────────────────────────────────────
  const renderTableHeaders = () => {
    if (activeTab === "3") {
      return (
        <tr>
          <SortableHeader
            title="Name"
            sortKey="first_name"
            style={{ width: "28%", minWidth: "160px" }}
          />

          <SortableHeader
            title="Department"
            sortKey="department"
            style={{ width: "15%", minWidth: "100px", ...thCenter }}
          />

          <th
            onClick={() => handleSort("leave_type")}
            style={{
              width: "20%",
              minWidth: "130px",
              cursor: "pointer",
              userSelect: "none",
              ...thCenter,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <i
                className="bx bx-calendar-x"
                style={{ color: "#ef4444", fontSize: "14px" }}
              ></i>
              Leave Type
              {sortConfig.key === "leave_type" ? (
                sortConfig.direction === "asc" ? (
                  <i className="bx bx-chevron-up"></i>
                ) : (
                  <i className="bx bx-chevron-down"></i>
                )
              ) : (
                <i className="bx bx-sort-alt-2" style={{ opacity: 0.5 }}></i>
              )}
            </span>
          </th>

          <SortableHeader
            title="Info"
            sortKey="info"
            style={{ width: "37%", minWidth: "180px", ...thCenter }}
          />
        </tr>
      );
    }

    return (
      <tr>
        <SortableHeader
          title="Name"
          sortKey="first_name"
          style={{ width: "28%", minWidth: "170px" }}
        />

        <SortableHeader
          title="Department"
          sortKey="department"
          style={{ width: "14%", minWidth: "100px", ...thCenter }}
        />

        <SortableHeader
          title="In Time"
          sortKey="inTime"
          style={{ width: "11%", minWidth: "80px", ...thCenter }}
        />

        <SortableHeader
          title="Out Time"
          sortKey="outTime"
          style={{ width: "11%", minWidth: "80px", ...thCenter }}
        />

        <SortableHeader
          title="Total Hours"
          sortKey="totalHours"
          style={{ width: "11%", minWidth: "80px", ...thCenter }}
        />

        <SortableHeader
          title="Status"
          sortKey="status"
          style={{ width: "10%", minWidth: "70px", ...thCenter }}
        />

        {activeTab === "1" && (
          <SortableHeader
            title="Location"
            sortKey="location"
            style={{ width: "10%", minWidth: "70px", ...thCenter }}
          />
        )}
      </tr>
    );
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

  // ─── Table rows ───────────────────────────────────────────────────────────
  const renderTableRows = () => {
    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={getColumnCount(activeTab)} style={{ border: "none" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "220px",
              }}
            >
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#405189,secondary:#0ab39c"
                style={{ width: "80px", height: "80px", marginBottom: "12px" }}
              ></lord-icon>

              <p
                style={{
                  color: "#405189",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                No Data Found!
              </p>
            </div>
          </td>
        </tr>
      );
    }

    // Sort Data
    const sortedData = [...filteredData].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      aValue = aValue ?? "";
      bValue = bValue ?? "";

      // Time sorting
      if (sortConfig.key === "inTime" || sortConfig.key === "outTime") {
        aValue = aValue ? new Date(`1970-01-01 ${aValue}`).getTime() : 0;

        bValue = bValue ? new Date(`1970-01-01 ${bValue}`).getTime() : 0;
      }

      // Total Hours sorting
      if (sortConfig.key === "totalHours") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // String sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);

        return sortConfig.direction === "asc" ? result : -result;
      }

      // Number sorting
      const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

      return sortConfig.direction === "asc" ? result : -result;
    });

    return sortedData.map((row, idx) => (
      <tr key={idx}>
        {/* Name */}
        <td style={{ verticalAlign: "middle" }}>
          <div className="d-flex gap-2 align-items-start">
            <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
              {row.profile_url ? (
                <img
                  src={row.profile_url}
                  alt=""
                  className="avatar-xs rounded-circle"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="avatar-xs rounded-circle"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#0ab39c",
                  }}
                >
                  <span style={{ color: "white" }}>
                    {(row.first_name || "?").charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div
                className="d-flex align-items-center gap-2 flex-wrap"
                style={{ marginBottom: "2px" }}
              >
                <h5 className="fs-14 mb-0" style={{ whiteSpace: "nowrap" }}>
                  {row.first_name}{" "}
                  <span
                    style={{
                      color: "#a29797",
                      fontSize: "smaller",
                    }}
                  >
                    #{row.emp_id}
                  </span>
                </h5>

                {row.checkInStatus &&
                  getCheckInStatusBadge(row.checkInStatus, customStatuses)}
              </div>

              <div
                className="text-muted"
                style={{
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.email}
              </div>

              {activeTab === "1" && (
                <div className="progress progress-sm animated-progess lc-color mt-1">
                  <div
                    className={`progress-bar ${
                      row.status === "On Time"
                        ? "bg-success"
                        : "bg-danger progress-bar-striped"
                    }`}
                    role="progressbar"
                    aria-valuenow={row.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: `${row.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Leave Tab */}
        {activeTab === "3" ? (
          <>
            <td style={tdCenter}>{row.department || "-"}</td>

            <td style={tdCenter}>{renderLeaveTypePills(row)}</td>

            <td style={tdCenter}>{renderInfoCell(row)}</td>
          </>
        ) : (
          <>
            <td style={tdCenter}>{row.department || "-"}</td>

            <td style={tdCenter}>{formatTime(row.inTime)}</td>

            <td style={tdCenter}>{formatTime(row.outTime)}</td>

            <td style={tdCenter}>{row.totalHours}</td>

            <td style={tdCenter}>
              <span
                className={`badge text-uppercase ${
                  row.status === "On Time"
                    ? "bg-success-subtle text-success"
                    : row.status === "Late"
                      ? "bg-warning-subtle text-warning"
                      : row.status === "Leave"
                        ? "bg-secondary-subtle text-secondary"
                        : "bg-danger-subtle text-danger"
                }`}
              >
                {row.status}
              </span>
            </td>

            {activeTab === "1" && (
              <td style={tdCenter}>
                <Button
                  color="info"
                  size="sm"
                  onClick={() => handleViewLocations(row)}
                >
                  View
                </Button>
              </td>
            )}
          </>
        )}
      </tr>
    ));
  };

  return (
    <Container fluid>
      <Row>
        <Col lg={12}>
          <Card id="attendanceList">
            <CardHeader className="border-0 pb-0">
              <h5 className="card-title mb-0">
                <b>{dateFilter}</b> - Entry Status
              </h5>
            </CardHeader>

            <CardBody>
              {/* ── Filters ── */}
              <div className="filter-container p-2 pt-2 pb-0">
                <Row className="mb-3 g-2" style={{ alignItems: "stretch" }}>
                  {/* 1. Department */}
                  <Col
                    xs={12}
                    sm={6}
                    md={showStatusFilter ? 3 : 4}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Input
                      type="select"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      style={filterInputStyle}
                    >
                      <option value="All">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </Input>
                  </Col>

                  {/* 2. Status / leave filter */}
                  {showStatusFilter && (
                    <Col
                      xs={12}
                      sm={6}
                      md={3}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Input
                        type="select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={filterInputStyle}
                      >
                        {statusFilterOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                    </Col>
                  )}

                  {/* 3. Date picker */}
                  <Col
                    xs={12}
                    sm={6}
                    md={showStatusFilter ? 3 : 4}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <DatePicker
                      value={dayjs(dateFilter, DateFormat)}
                      format={DateFormat}
                      allowClear={false}
                      onChange={(e, f) => setDateFilter(f)}
                      style={{
                        width: "100%",
                        height: "38px",
                        borderRadius: "6px",
                        border: "1px solid #ced4da",
                        padding: "0 11px",
                        fontSize: "14px",
                      }}
                    />
                  </Col>

                  {/* 4. Search */}
                  <Col
                    xs={12}
                    sm={6}
                    md={showStatusFilter ? 3 : 4}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <i
                      className="bx bx-search-alt search-icon position-absolute"
                      style={{
                        top: "50%",
                        left: "20px",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        color: "#888",
                        fontSize: "15px",
                        pointerEvents: "none",
                      }}
                    ></i>
                    <Input
                      type="text"
                      placeholder="Search employee"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ ...filterInputStyle, paddingLeft: "30px" }}
                    />
                  </Col>
                </Row>
              </div>

              {/* ── Tabs ── */}
              <Nav
                className="nav-tabs nav-tabs-custom nav-success pt-2"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "1" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("1")}
                    href="#"
                  >
                    In <span className="badge bg-success ms-1">{countIn}</span>
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "2" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("2")}
                    href="#"
                  >
                    Not Check In{" "}
                    <span className="badge bg-danger ms-1">
                      {countNotCheckIn}
                    </span>
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames(
                      { active: activeTab === "3" },
                      "fw-semibold",
                    )}
                    onClick={() => handleTabChange("3")}
                    href="#"
                  >
                    Leave{" "}
                    <span className="badge bg-secondary ms-1">
                      {countLeave}
                    </span>
                  </NavLink>
                </NavItem>
              </Nav>

              {/* ── Responsive table wrapper ── */}
              <div
                className="attendance-table-wrapper"
                style={{
                  marginTop: "8px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <SimpleBar
                  style={{ maxHeight: "420px", minHeight: "420px" }}
                  autoHide={false}
                >
                  <style>
                    {`.simplebar-track { display: none !important; }`}
                  </style>
                  <div style={{ minWidth: "100%" }}>
                    <table
                      className={`table align-middle mb-0 attendance-table${
                        activeTab === "3" ? " leave-tab" : ""
                      }`}
                    >
                      <thead className="table-light text-muted">
                        {renderTableHeaders()}
                      </thead>
                      <tbody>
                        {loading ? (
                          <SkletonDashboard
                            rows={6}
                            columns={getColumnCount(activeTab)}
                            hasAvatar={true}
                          />
                        ) : (
                          renderTableRows()
                        )}
                      </tbody>
                    </table>
                  </div>
                </SimpleBar>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* ── Map Modal ── */}
        <Modal
          size={isMapFull ? undefined : "xl"}
          fullscreen={isMapFull}
          isOpen={isMapOpen}
          toggle={() => setIsMapOpen(!isMapOpen)}
        >
          {/* Custom header (no default close btn) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #e9ecef",
            }}
          >
            {/* Left: back arrow */}
            <button
              onClick={() => setIsMapOpen(false)}
              title="Back"
              style={{
                border: "none",
                background: "transparent",
                fontSize: "22px",
                lineHeight: 1,
                cursor: "pointer",
                color: "#374151",
                padding: "2px 6px",
              }}
            >
              <i className="ri-arrow-left-line"></i>
            </button>

            {/* Middle: title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
                marginLeft: "10px",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "18px" }}>
                Employee Location History
              </span>
            </div>

            {/* Right: employee avatar + name, fullscreen toggle, close */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#e0f7fa",
                  color: "#00796b",
                  padding: "3px 10px 3px 3px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginRight: "6px",
                }}
              >
                {mapSelectedEmpProfileUrl ? (
                  <img
                    src={mapSelectedEmpProfileUrl}
                    alt=""
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#00796b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {(mapSelectedEmpName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{mapSelectedEmpName}</span>
              </div>

              <button
                onClick={() => setIsMapFull((f) => !f)}
                title={isMapFull ? "Exit full view" : "Full view"}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "20px",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#374151",
                  padding: "2px 6px",
                }}
              >
                <i
                  className={
                    isMapFull ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"
                  }
                ></i>
              </button>

              <button
                onClick={() => setIsMapOpen(false)}
                title="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "22px",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#374151",
                  padding: "2px 6px",
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>

          <ModalBody
            style={{
              height: isMapFull ? "calc(100vh - 58px)" : "78vh",
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
                <p
                  style={{
                    marginTop: "15px",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#555",
                    textAlign: "center",
                  }}
                >
                  No location history available
                </p>
              </div>
            )}
          </ModalBody>
        </Modal>
      </Row>
    </Container>
  );
};

export default TodayAttendanceTable;
