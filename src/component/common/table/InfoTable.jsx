import React from "react";
UncontrolledDropdown;
import { useState } from "react";
import { useRef } from "react";

import {
  Card,
  swal,
  CardBody,
  Col,
  Container,
  CardHeader,
  Row,
  Label,
  Modal,
  ModalHeader,
  Form,
  ModalBody,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";
import dayjs from "dayjs";
import TableContainer from "../../../component/common/table/TableContainer";
import { rowTestId, testId, itemTestKey } from "../../../shared/testing/testId";
import { testIdModuleFor } from "../../../shared/testing/testIdModules";
import DeleteModal from "../../../component/common/modal/DeleteModal";
import Loader from "../../../component/common/loader/Loader";
import ExportCSV from "../../../component/common/export/ExportCSV";

import { useEffect } from "react";
import { useCallback } from "react";

import { isEmpty } from "lodash";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
  toggleISBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useDispatch, useSelector } from "react-redux";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Status } from "filepond";
import { setActiveTableTab } from "../../../redux/reducers/ChildReducer/TableReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { GetCustomField } from "../../../common/js/GetCustomField";
import { SweetAlert } from "../sweetAlert/SweetAlert";
import Swal from "sweetalert2";
import * as Yup from "yup";
import "../../../common/./css/lc_style.css";
import { ExportSampleData } from "../../../common/js/ExportSampleData";
import {
  attendance_approval_component_name,
  component_list_for_import_btn_access,
  employee_component_name,
  work_schedule_component_name,
  holiday_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_pending_table,
  leave_pending_table,
  leave_application_component_name,
  custom_field_component_name,
  task_list_component_name,
  project_component_name,
  client_component_name,
  status_component_name,
  priorities_component_name,
  custom_status_form_component_name,
  role_component_name,
} from "../../../common/constant/Constants";
import { removeProject } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { removeClient } from "../../../redux/reducers/ChildReducer/ClientReducer";
import { removeTask } from "../../../redux/reducers/ChildReducer/TaskReducer";
import {
  CREATE_CLIENT_ACCESS_KEY,
  EDIT_CLIENT_ACCESS_KEY,
  CREATE_EMPLOYEE_ACCESS_KEY,
  CREATE_CUSTOM_FIELD_ACCESS_KEY,
  EDIT_EMPLOYEE_ACCESS_KEY,
  EDIT_CUSTOM_FIELD_ACCESS_KEY,
  CREATE_ROLES_ACCESS_KEY,
  EDIT_ROLES_ACCESS_KEY,
  APPROVE_REJECT_HIERARCHY_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_HIERARCHY_ATTENDANCE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY,
  CREATE_PROJECT_ACCESS_KEY,   // ← add
  EDIT_PROJECT_ACCESS_KEY,     // ← add
  CREATE_TASK_ACCESS_KEY,            // ← add
  EDIT_TASK_ACCESS_KEY,               // ← add
  CREATE_TASK_SETTINGS_ACCESS_KEY,    // ← add
  EDIT_TASK_SETTINGS_ACCESS_KEY,      // ← add
} from "../../../common/constant/RoleConstants";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { PostApi } from "../../../common/api/PostApi";
import { editLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { updateAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { setTableDataReducer } from "../../../redux/reducers/ChildReducer/TableDataReducer";
import { Api } from "../../../common/api/Api";
import {
  editEmployee,
  setEmployeeActiveStatus,
} from "../../../redux/reducers/ChildReducer/EmployeeReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import {
  setCurrentApprovalComponent,
  setDashPendingApprovalCom,
} from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import TableSkeleton from "../skeleton/TableSkeloton";
import { DeleteApi } from "../../../common/api/DeleteApi";
import { editLeaveApplication } from "../../../redux/reducers/ChildReducer/LeaveApplyReducer";
import {
  editHoliday,
  removeHoliday,
} from "../../../redux/reducers/ChildReducer/HolidayReducer";
import { removeLeaveType } from "../../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { RemoveLocalStorageData } from "../../../meta/RemoveLocalStorageData";
import ReorderStatusModal from "./ReorderStatusModal";
import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";
defineElement(loadAnimation);

const PAGE_META = {
  employee: { title: "Employees", singular: "Employee", icon: "ri-team-line", tone: "primary", sub: "Manage your workforce" },
  role: { title: "Roles", singular: "Role", icon: "ri-shield-user-line", tone: "danger", sub: "Access & permissions" },
  work_schedule: { title: "Work Schedules", singular: "Work Schedule", icon: "ri-calendar-2-line", tone: "info", sub: "Shifts & working days" },
  holiday: { title: "Holidays", singular: "Holiday", icon: "ri-sun-line", tone: "warning", sub: "Company holiday calendar" },
  leave_application: { title: "Leave Applications", singular: "Leave Application", icon: "ri-calendar-event-line", tone: "success", sub: "Your leave requests" },
  leave_types: { title: "Leave Types", singular: "Leave Type", icon: "ri-price-tag-3-line", tone: "info", sub: "Leave policies & quotas" },
  custom_fields: { title: "Custom Fields", singular: "Custom Field", icon: "ri-input-method-line", tone: "secondary", sub: "Extra form fields" },
  CustomStatusForm: { title: "Custom Status", singular: "Custom Status", icon: "ri-emotion-line", tone: "warning", sub: "Employee status options" },
  Status: { title: "Task Status", singular: "Status", icon: "ri-checkbox-circle-line", tone: "success", sub: "Task workflow stages" },
  Priority: { title: "Priorities", singular: "Priority", icon: "ri-flag-2-line", tone: "danger", sub: "Task priority levels" },
  Clients: { title: "Clients", singular: "Client", icon: "ri-building-4-line", tone: "info", sub: "Customer accounts" },
  Projects: { title: "Projects", singular: "Project", icon: "ri-folder-chart-line", tone: "primary", sub: "Track delivery & progress" },
  Task: { title: "Tasks", singular: "Task", icon: "ri-task-line", tone: "success", sub: "Work items & assignments" },
  "Contact Group": { title: "Contact Groups", singular: "Contact Group", icon: "ri-contacts-book-line", tone: "info", sub: "Grouped contacts" },
  Contacts: { title: "Contacts", singular: "Contact", icon: "ri-contacts-line", tone: "primary", sub: "People & companies" },
  custom_form: { title: "Custom Forms", singular: "Custom Form", icon: "ri-file-list-3-line", tone: "secondary", sub: "Build & share forms" },
  "Assign Custom Form": { title: "Assigned Forms", singular: "Assignment", icon: "ri-file-user-line", tone: "info", sub: "Form assignments" },
};

const getPageMeta = (formname) => {
  if (PAGE_META[formname]) return PAGE_META[formname];
  const pretty = String(formname || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { title: pretty, singular: pretty, icon: "ri-table-line", tone: "primary", sub: "" };
};

const TAB_TONES = {
  all: "primary",
  active: "success",
  inactive: "danger",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "secondary",
  canceled: "secondary",
  completed: "success",
  open: "info",
};
const tabToneOf = (label) => TAB_TONES[String(label || "").trim().toLowerCase()] || "info";

// Rows carry many hidden fields (ids, urls, settings); search only the text a
// user sees, matching from the start of the value.
// Last name is only matched as part of the full name, so "d" doesn't pick up
// "Minish D".
const SEARCH_TEXT_KEYS = [
  "first_name",
  "name",
  "title",
  "email",
  "emp_id",
  "company_name",
  "client_name",
  "project_name",
];
const SEARCH_SKIP_KEYS = new Set(["id", "created_by", "updated_by", "work_schedule_id_list"]);

const rowMatchesSearch = (row, rawSearch) => {
  const q = String(rawSearch || "").trim().toLowerCase();
  if (!q) return true;
  const startsWithQ = (v) => v != null && String(v).trim().toLowerCase().startsWith(q);

  if (row.date) {
    const formatted = dayjs(row.date).format("DD-MM-YYYY");
    const compactQ = q.replace(/[-/]/g, "");
    if (formatted.startsWith(q) || (compactQ && formatted.replace(/-/g, "").startsWith(compactQ))) {
      return true;
    }
  }

  const textKeys = SEARCH_TEXT_KEYS.filter((k) => k in row);
  if (textKeys.length) {
    if (row.first_name && startsWithQ(`${row.first_name} ${row.last_name || ""}`)) return true;
    if (row.role && typeof row.role === "object" && startsWithQ(row.role.name)) return true;
    return textKeys.some((k) => startsWithQ(row[k]));
  }

  return Object.entries(row).some(
    ([key, value]) =>
      !SEARCH_SKIP_KEYS.has(key) &&
      !key.endsWith("_id") &&
      key !== "date" &&
      value != null &&
      typeof value !== "object" &&
      startsWithQ(value),
  );
};

const toLocalISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const lastWorkingDayHtml = (message) => {
  const today = toLocalISO(new Date());
  return `
    <p class="lwd-msg">${message}</p>
    <div class="lwd">
      <div class="lwd-label">
        <span><i class="ri-logout-box-r-line"></i> Last working day</span>
        <em>Optional</em>
      </div>
      <div class="lwd-field" id="lwd-field" data-testid="employee-last-working-day-trigger" role="button" tabindex="0">
        <span class="lwd-icon"><i class="ri-calendar-2-line"></i></span>
        <span class="lwd-text">
          <b id="lwd-display" data-testid="employee-last-working-day-selected-value"></b>
          <small id="lwd-rel"></small>
        </span>
        <button type="button" class="lwd-clear" id="lwd-clear" data-testid="employee-last-working-day-clear-button" title="Clear date"><i class="ri-close-line"></i></button>
        <i class="ri-arrow-down-s-line lwd-caret"></i>
        <input type="hidden" id="lwd-input" data-testid="employee-last-working-day-input" value="${today}" />
      </div>
      <div class="lwd-cal" id="lwd-cal" aria-hidden="true"><div class="lwd-cal-inner" id="lwd-cal-inner"></div></div>
      <div class="lwd-chips">
        <button type="button" data-lwd="today" data-testid="employee-last-working-day-today-option">Today</button>
        <button type="button" data-lwd="yesterday" data-testid="employee-last-working-day-yesterday-option">Yesterday</button>
        <button type="button" data-lwd="eom" data-testid="employee-last-working-day-end-of-last-month-option">End of last month</button>
      </div>
      <small class="lwd-hint"><i class="ri-information-line"></i> Payroll will pay this employee up to this date.</small>
    </div>`;
};

const bindLastWorkingDayField = (popup) => {
  const input = popup.querySelector("#lwd-input");
  const field = popup.querySelector("#lwd-field");
  const display = popup.querySelector("#lwd-display");
  const rel = popup.querySelector("#lwd-rel");
  const clear = popup.querySelector("#lwd-clear");
  const chips = popup.querySelectorAll("[data-lwd]");
  if (!input || !field) return;

  const presets = () => {
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return {
      today: toLocalISO(now),
      yesterday: toLocalISO(y),
      eom: toLocalISO(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  };

  const render = () => {
    const v = input.value;
    field.classList.toggle("is-empty", !v);
    if (!v) {
      display.textContent = "No date selected";
      rel.textContent = "Leave blank if unknown";
    } else {
      const d = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.round((today - d) / 86400000);
      display.textContent = d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      rel.textContent = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`;
    }
    const p = presets();
    chips.forEach((c) => c.classList.toggle("is-active", p[c.dataset.lwd] === v));
  };

  // ── Custom calendar ──
  const cal = popup.querySelector("#lwd-cal");
  const calInner = popup.querySelector("#lwd-cal-inner");
  const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS_SHORT = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleDateString(undefined, { month: "short" }),
  );
  const todayIso = () => toLocalISO(new Date());
  let mode = "days";
  let view = new Date();
  view.setDate(1);

  const syncViewToValue = () => {
    const base = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
    view = new Date(base.getFullYear(), base.getMonth(), 1);
  };

  const drawCalendar = () => {
    const tIso = todayIso();
    const now = new Date();
    const y = view.getFullYear();
    const m = view.getMonth();
    const atMaxMonth = y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth());
    const atMaxYear = y >= now.getFullYear();

    if (mode === "months") {
      const months = MONTHS_SHORT.map((label, i) => {
        const future = y > now.getFullYear() || (y === now.getFullYear() && i > now.getMonth());
        const cls = [
          "lwd-cal-month",
          i === m ? "is-selected" : "",
          y === now.getFullYear() && i === now.getMonth() ? "is-today" : "",
        ].join(" ");
        return `<button type="button" class="${cls}" data-month="${i}" data-testid="employee-last-working-day-month-${label.toLowerCase()}-button" ${future ? "disabled" : ""}>${label}</button>`;
      }).join("");
      calInner.innerHTML = `
        <div class="lwd-cal-head">
          <button type="button" class="lwd-cal-nav" data-nav="-12" data-testid="employee-last-working-day-previous-year-button" aria-label="Previous year"><i class="ri-arrow-left-s-line"></i></button>
          <button type="button" class="lwd-cal-title" data-mode="days" data-testid="employee-last-working-day-days-view-button">${y}</button>
          <button type="button" class="lwd-cal-nav" data-nav="12" data-testid="employee-last-working-day-next-year-button" aria-label="Next year" ${atMaxYear ? "disabled" : ""}><i class="ri-arrow-right-s-line"></i></button>
        </div>
        <div class="lwd-cal-months">${months}</div>`;
      return;
    }

    const first = new Date(y, m, 1);
    const start = new Date(y, m, 1 - first.getDay());
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = toLocalISO(d);
      const outside = d.getMonth() !== m;
      const future = iso > tIso;
      const cls = [
        "lwd-cal-day",
        outside ? "is-outside" : "",
        iso === tIso ? "is-today" : "",
        iso === input.value ? "is-selected" : "",
        d.getDay() === 0 || d.getDay() === 6 ? "is-weekend" : "",
      ].join(" ");
      cells.push(
        `<button type="button" class="${cls}" data-date="${iso}" data-testid="employee-last-working-day-day-${iso}-button" ${future ? "disabled" : ""}>${d.getDate()}</button>`,
      );
    }
    const title = view.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    calInner.innerHTML = `
      <div class="lwd-cal-head">
        <button type="button" class="lwd-cal-nav" data-nav="-1" data-testid="employee-last-working-day-previous-month-button" aria-label="Previous month"><i class="ri-arrow-left-s-line"></i></button>
        <button type="button" class="lwd-cal-title" data-mode="months" data-testid="employee-last-working-day-months-view-button">${title}<i class="ri-arrow-down-s-line"></i></button>
        <button type="button" class="lwd-cal-nav" data-nav="1" data-testid="employee-last-working-day-next-month-button" aria-label="Next month" ${atMaxMonth ? "disabled" : ""}><i class="ri-arrow-right-s-line"></i></button>
      </div>
      <div class="lwd-cal-week">${WEEKDAYS.map((w) => `<span>${w}</span>`).join("")}</div>
      <div class="lwd-cal-grid">${cells.join("")}</div>
      <div class="lwd-cal-foot">
        <button type="button" data-act="clear" data-testid="employee-last-working-day-panel-clear-button"><i class="ri-delete-back-2-line"></i> Clear</button>
        <button type="button" data-act="today" data-testid="employee-last-working-day-panel-today-button" class="is-primary"><i class="ri-focus-3-line"></i> Today</button>
      </div>`;
  };

  const setOpen = (open) => {
    cal.classList.toggle("is-open", open);
    field.classList.toggle("is-open", open);
    cal.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      mode = "days";
      syncViewToValue();
      drawCalendar();
    }
  };
  const toggleOpen = () => setOpen(!cal.classList.contains("is-open"));

  calInner.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    if (btn.dataset.nav) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(btn.dataset.nav), 1);
      drawCalendar();
    } else if (btn.dataset.mode) {
      mode = btn.dataset.mode;
      drawCalendar();
    } else if (btn.dataset.month) {
      view = new Date(view.getFullYear(), Number(btn.dataset.month), 1);
      mode = "days";
      drawCalendar();
    } else if (btn.dataset.date) {
      input.value = btn.dataset.date;
      render();
      setOpen(false);
    } else if (btn.dataset.act === "clear") {
      input.value = "";
      render();
      setOpen(false);
    } else if (btn.dataset.act === "today") {
      input.value = todayIso();
      render();
      setOpen(false);
    }
  });

  field.addEventListener("click", toggleOpen);
  field.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    }
  });
  clear.addEventListener("click", (e) => {
    e.stopPropagation();
    input.value = "";
    render();
    if (cal.classList.contains("is-open")) drawCalendar();
  });
  chips.forEach((c) =>
    c.addEventListener("click", () => {
      input.value = presets()[c.dataset.lwd];
      render();
      if (cal.classList.contains("is-open")) {
        syncViewToValue();
        drawCalendar();
      }
    }),
  );
  render();
};

const InfoTable = ({
  additionalColumn,
  tabledata,
  formname,
  initialFormObj,
  filterKey,
  filterOptions,
  width_per,
  import_width_per,
  table_col,
  table_class,
  initialActiveTab,
  onChangeLeave,
  serverPagination, // ✅ ADD THIS
  loading = false,
  ...props
}) => {
  const dispatch = useDispatch();

  const EmployeeData = GetLocalStorageData("employee");

  const { activeTableTab } = useSelector((state) => state.TableReducer);
  const {
    currentApprovalComponent,
    approvalEmployeeTypeFilter,
    dashPendingApprovalCom,
  } = useSelector((state) => state.ApprovalComponentReducer);

  // useEffect(() => {
  //   !!activeTableTab && setActiveTab(activeTableTab);
  // }, [activeTableTab]);

  const {
    search,
    employee_table_filter_keys,
    task_list_filter_keys,
    leave_type_table_filter_keys,
    attendance_approval_table_filter_keys,
  } = useSelector((state) => state.TableFilterReducer);

  const table_filter_keys =
    formname === employee_component_name
      ? employee_table_filter_keys
      : formname === task_list_component_name
        ? task_list_filter_keys
        : formname === leave_type_component_name
          ? leave_type_table_filter_keys
          : formname === attendance_approval_component_name
            ? attendance_approval_table_filter_keys
            : {};

  const tabOptions = filterOptions
    ? filterOptions.map((obj, idx) => {
        return {
          ...obj,
          idx: idx + 2,
        };
      })
    : [];
  // ✅ Status table: id 1 always first, id 3 always last, rest by `order`
  const sortedTableData = useMemo(() => {
    if (formname !== status_component_name) return tabledata || [];

    const list = tabledata || [];
    const firstItem = list.filter((d) => d.id === 1);
    const lastItem = list.filter((d) => d.id === 3);
    const middle = list
      .filter((d) => d.id !== 1 && d.id !== 3)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return [...firstItem, ...middle, ...lastItem];
  }, [tabledata, formname]);
  const [activeTab, setActiveTab] = useState(
    !!initialActiveTab ? initialActiveTab : 1,
  );

  const [dataList, setDataList] = useState(() =>
    Array.isArray(tabledata) && tabledata.length ? [...tabledata] : [],
  );
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [modal, setModal] = useState(false);
  const [modal_list, setmodal_list] = useState(false);
  // const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showContainer, setShowContainer] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isLoading, setIsLoading] = useState(
    () => !(Array.isArray(tabledata) && tabledata.length),
  );
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderList, setReorderList] = useState([]);

  const tidModule = testIdModuleFor(formname);

  const deleteHandler = async (id) => {
    let url = "";
    let entityName = "";
    let storageKey = "";
    let removeAction = null;

    if (formname === project_component_name) {
      url = "/projects/";
      entityName = "Project";
      storageKey = "projects";
      removeAction = removeProject;
    } else if (formname === client_component_name) {
      url = "/clients/";
      entityName = "Client";
      storageKey = "clients";
      removeAction = removeClient;
    } else if (formname === task_list_component_name) {
      url = "/task/";
      entityName = "Task";
      storageKey = "tasks";
      removeAction = removeTask;
    } else {
      return;
    }

    const result = await Swal.fire({
      testId: testId(tidModule, "delete"),
      title: `Delete ${entityName}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        testId: testId(tidModule, "deleting"),
        title: "Deleting...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await Api.delete(url, {
        data: { id },
      });

      Swal.close();

      // Redux Update
      dispatch(removeAction(id));

      // LocalStorage Update
      RemoveLocalStorageData(storageKey, id);

      await Swal.fire({
        testId: testId(tidModule, "deleted"),
        title: "Deleted!",
        text: response?.data?.message || `${entityName} Deleted Successfully`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      Swal.close();

      Swal.fire({
        testId: testId(tidModule, "delete-failed"),
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          `Failed to delete ${entityName}.`,
        icon: "error",
        confirmButtonColor: "#d33",
      });

      console.error(`${entityName} Delete Error:`, error);
    }
  };

  const tog_list = () => {
    setmodal_list(!modal_list);
  };
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(new Date(currentYear, 0, 1));

  const resetCheckBox = () => setSelectedGroupIds([]);

  const handleApproval = async (orderData) => {
    let employee_first_name =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.first_name ||
      "";

    const totalSeconds =
      orderData.final_paid_hr_in_seconds === 0
        ? orderData.work_schedule_duration_without_break
        : orderData.final_paid_hr_in_seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let selectedHour = hours;
    let selectedMinute = minutes;
    let textValue;

    const stepper = (id, value, max, step, unit) => `
      <div class="apv-step">
        <button type="button" class="apv-step-btn" data-target="${id}" data-step="-${step}" data-testid="${testId(tidModule, "approve", id, "decrease-button")}" aria-label="Decrease">
          <i class="ri-subtract-line"></i>
        </button>
        <div class="apv-step-field">
          <input id="${id}" data-testid="${testId(tidModule, "approve", id, "input")}" type="number" min="0" max="${max}" value="${value}" class="apv-step-input" />
          <span class="apv-step-unit">${unit}</span>
        </div>
        <button type="button" class="apv-step-btn" data-target="${id}" data-step="${step}" data-testid="${testId(tidModule, "approve", id, "increase-button")}" aria-label="Increase">
          <i class="ri-add-line"></i>
        </button>
      </div>`;

    const paidHrBlock = `
      <div class="apv-paid">
        <div class="apv-paid-label"><i class="ri-time-line"></i> Edit paid hours</div>
        <div class="apv-paid-fields">
          ${stepper("select-hour", hours, 23, 1, "hrs")}
          <span class="apv-paid-colon">:</span>
          ${stepper("select-minute", minutes, 59, 5, "min")}
        </div>
      </div>`;

    const clampInput = (input) => {
      const max = Number(input.max) || 0;
      const value = parseInt(input.value, 10);
      input.value = Number.isNaN(value) ? 0 : Math.min(max, Math.max(0, value));
    };

    let content =
      formname === leave_approval_component_name ||
      formname === leave_pending_table
        ? `<span>Are You Sure to <strong style='color:green'>Accept </strong> ${orderData.leave_type_name} To <strong style='color:#7066e0'>  ${employee_first_name}</strong>  on  ${orderData.start} to  ${orderData.end} </span> `
        : orderData.is_present === false
          ? `<span>Oops, <strong style='color:#7066e0'>${employee_first_name}</strong> didn't show up on <strong style='color:grey'>${format(
              new Date(orderData.date),
              "dd MMM, yyyy",
            )}</strong>, Ready to regularize and approve?</span>
          <div>
            ${
              formname === attendance_approval_component_name ||
              formname === attendance_pending_table
                ? paidHrBlock
                : undefined
            }
          </div>`
          : `<span><strong style='color:#7066e0'>${employee_first_name}</strong> missed checkout on <strong style='color:grey'>${format(
              new Date(orderData.date),
              "dd MMM, yyyy",
            )}, Would you like to regularize?</span>
          <div>
            ${
              formname === attendance_approval_component_name ||
              formname === attendance_pending_table
                ? paidHrBlock
                : undefined
            }
          </div>`;
    let btnText = "Yes, Approve";

    Swal.fire({
      testId: testId(tidModule, "approve"),
      title: "Confirmation",
      html: content,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      input:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? "text"
          : undefined,

      inputPlaceholder:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? "Enter reason"
          : undefined,
      inputAttributes:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? {
              style:
                "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
            }
          : undefined,
      inputValidator:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? (value) => {
              if (!value) {
                return "Reason is required!";
              }
            }
          : undefined,
      didOpen: (popup) => {
        popup.querySelectorAll(".apv-step-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const input = popup.querySelector(`#${btn.dataset.target}`);
            if (!input) return;
            input.value = (parseInt(input.value, 10) || 0) + Number(btn.dataset.step);
            clampInput(input);
          });
        });
        popup.querySelectorAll(".apv-step-input").forEach((input) => {
          input.addEventListener("blur", () => clampInput(input));
        });
      },
    }).then(async (result) => {
      if (
        formname === leave_approval_component_name ||
        formname === leave_pending_table
      ) {
        if (result.value) {
          const data = {
            leave_application_id_list: [orderData.id],
            status: 2,
            reason_from_authority: "",
          };

          dispatch(editLeaveApproval(data));

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
      ) {
        if (result.value) {
          selectedHour = Math.min(23, Math.max(0, parseInt(document.getElementById("select-hour").value, 10) || 0));
          selectedMinute = Math.min(59, Math.max(0, parseInt(document.getElementById("select-minute").value, 10) || 0));

          const finalHr =
            parseInt(selectedHour) * 3600 + parseInt(selectedMinute) * 60;

          if (finalHr === 0) {
            toast.error("Final Hour Can't Be Zero");
          } else {
            const data = {
              id: [orderData.id],
              hr_status: 2,
              notes: result.value,
              final_paid_hr_in_seconds: finalHr,
              is_single_approval: true,
            };

            const Api = await PostApi(
              "attendance/approve-or-reject/",
              data,
              false,
            );
            if (Api.status && Api.status === 200) {
              resetCheckBox();
              dispatch(updateAttendanceApprovalData(data));
              toast.success(Api?.data?.message);
            } else {
              toast.error(Api?.data?.message || Api?.data?.detail);
            }
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };

  const handleReject = async (orderData) => {
    let employee_first_name =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.first_name ||
      "";
    // const unitLabel = orderData.unit === 1 ? 'day' : 'hour';

    let content =
      formname === leave_approval_component_name ||
      formname === leave_pending_table
        ? `<span>Are You Sure to <strong style='color:red'>Reject</strong> ${orderData.leave_type_name} To <strong style='color:#7066e0'> ${employee_first_name} </strong> on ${orderData.start} to  ${orderData.end} </span>`
        : `<span>Confirm Action : <strong style='color:red'>Reject</strong> pending status and mark <strong style='color:#7066e0'>  ${employee_first_name}</strong>  as absent on   <strong style='color:grey'>${format(
            new Date(orderData.date),
            "dd MMM, yyyy",
          )}</strong></span> `;
    let btnText = "Yes, Reject";

    Swal.fire({
      testId: testId(tidModule, "reject"),
      title: "Confirmation",
      html: content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-danger",
      cancelButtonClass: "btn btn-secondary",
      input: "text",
      inputPlaceholder: "Enter reason for rejection",
      inputAttributes: {
        style:
          "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    }).then(async (result) => {
      if (
        formname === leave_approval_component_name ||
        formname === leave_pending_table
      ) {
        if (result.value) {
          const data = {
            leave_application_id_list: [orderData.id],
            status: 3,
            reason_from_authority: result.value,
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (
        formname == attendance_approval_component_name ||
        formname === attendance_pending_table
      ) {
        if (result.value) {
          const data = {
            id: [orderData.id],
            final_paid_hr_in_seconds: 0,
            hr_status: 4,
            notes: result.value,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };

  const handleBulkApproval = async () => {
    let content =
      formname === leave_approval_component_name
        ? "Are You Sure to <strong style='color:green'>Accept </strong>  Leave To Selected Employees?"
        : "Are you Sure to <strong style='color:green'>Approve</strong> Attendance To Selected Employees?";
    let btnText = "Yes, Approve";

    Swal.fire({
      testId: testId(tidModule, "bulk-approve"),
      title: "Confirmation",
      html: content,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      input:
        formname === attendance_approval_component_name ? "text" : undefined,
      inputPlaceholder:
        formname === attendance_approval_component_name
          ? "Enter reason for Bulk Approve"
          : undefined,
      inputAttributes:
        formname === attendance_approval_component_name
          ? {
              style:
                "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
            }
          : undefined,
      inputValidator:
        formname === attendance_approval_component_name
          ? (value) => {
              if (!value) {
                return "Reason is required!";
              }
            }
          : undefined,
    }).then(async (result) => {
      if (formname === leave_approval_component_name) {
        if (result.value) {
          const data = {
            leave_application_id_list: selectedGroupIds,
            status: 2,
            reason_from_authority: "",
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (formname === attendance_approval_component_name) {
        if (result.value) {
          const data = {
            id: selectedGroupIds,
            hr_status: 2,
            notes: result.value,
            final_paid_hr_in_seconds: 0,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };
  const handleBulkReject = async () => {
    let content =
      formname === leave_approval_component_name
        ? "Are You Sure to <strong style='color:red'>Reject</strong> Leave To Selected Employees?"
        : "Are You Sure to <strong style='color:red'>Reject</strong> Attendance To Selected Employees?";
    let btnText = "Yes, Reject";

    Swal.fire({
      testId: testId(tidModule, "bulk-reject"),
      title: "Confirmation",
      html: content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-danger",
      cancelButtonClass: "btn btn-secondary",
      input: "text",
      inputPlaceholder: "Enter reason for rejection",
      inputAttributes: {
        style:
          "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    }).then(async (result) => {
      if (formname === leave_approval_component_name) {
        if (result.value) {
          const data = {
            leave_application_id_list: selectedGroupIds,
            status: 3,
            reason_from_authority: result.value,
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (formname === attendance_approval_component_name) {
        if (result.value) {
          const data = {
            id: selectedGroupIds,
            hr_status: 4,
            notes: result.value,
            final_paid_hr_in_seconds: 0,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong!");
      }
    });
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleActionClick = async (orderData) => {
    const result = await Swal.fire({
      testId: testId(tidModule, "cancel-request"),
      title: "Cancel Leave Request",
      html: "Are you sure you want to <b>raise a cancel leave request?</b>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, raise request!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await PostApi(
        `leave/raise-cancel-request/`,
        { id: orderData.id },
        false,
      );

      console.log("CANCEL REQUEST RESPONSE:", Api);

      // ✅ Check success
      if (
        Api?.status === 200 &&
        Api?.data?.data?.leave_cancellation_details?.status === 1
      ) {
        // ✅ Update Redux (same pattern as edit)
        dispatch(editLeaveApplication(Api?.data?.data));

        // ✅ Toast
        toast.success(Api?.data?.message || "Cancel request raised");

        // ✅ SweetAlert
        await Swal.fire({
          testId: testId(tidModule, "cancel-request-sent"),
          title: "Request Sent!",
          html: Api?.data?.message || "Cancel request raised successfully",
          icon: "success",
        });
      } else {
        toast.error(
          Api?.data?.message || Api?.data?.detail || "Request failed",
        );
      }
    } catch (error) {
      console.error("CANCEL REQUEST ERROR:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (orderData) => {
    const result = await Swal.fire({
      testId: testId(tidModule, "delete-leave"),
      title: "Delete Leave Application",
      text: "Are you sure you want to delete this leave application?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(
        `leave/leave-application/delete/${orderData.id}`,
        false,
      );

      console.log("DELETE RESPONSE:", Api);

      // ✅ API returns { message, data, leave_type_for_employee }
      // ✅ success is determined by status 200 + data.is_deleted === true
      if (Api?.status === 200 && Api?.data?.data?.is_deleted === true) {
        // ✅ Redux: remove deleted item from list
        dispatch(editLeaveApplication(Api?.data?.data));

        // ✅ Toast
        toast.success(Api?.data?.message || "Deleted successfully");

        // ✅ SweetAlert success
        await Swal.fire({
          testId: testId(tidModule, "leave-deleted"),
          title: "Deleted!",
          html: Api?.data?.message || "Leave Application Deleted Successfully",
          icon: "success",
        });
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail || "Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error("Something went wrong");
    }
  };
  const handleHolidayDelete = async (orderData) => {
    const result = await Swal.fire({
      testId: testId(tidModule, "delete-holiday"),
      title: "Delete Holiday",
      text: "Are you sure you want to delete this Holiday?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(`holiday/delete/${orderData.id}`);

      console.log("DELETE RESPONSE:", Api);

      if (Api?.status === 200) {
        dispatch(removeHoliday(orderData.id));
        RemoveLocalStorageData("holiday", orderData.id);

        toast.success(Api?.data?.message || "Holiday deleted successfully");

        await Swal.fire({
          testId: testId(tidModule, "holiday-deleted"),
          title: "Deleted!",
          text: Api?.data?.message || "Holiday deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0AB39C",
        });
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleLeaveTypeDelete = async (leaveTypeData) => {
    const result = await Swal.fire({
      testId: testId(tidModule, "delete-leave-type"),
      title: "Delete Leave Type",
      text: "Are you sure you want to delete this Leave Type?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(
        `leave/leave_type/delete/${leaveTypeData.id}`,
      );

      console.log("DELETE RESPONSE:", Api);

      if (Api?.status === 200) {
        // Update Redux store if applicable
        dispatch(removeLeaveType(leaveTypeData.id));

        // Clear cached data if applicable
        RemoveLocalStorageData("leave_type");

        toast.success(Api?.data?.message || "Leave Type deleted successfully");

        await Swal.fire({
          testId: testId(tidModule, "leave-type-deleted"),
          title: "Deleted!",
          text: Api?.data?.message || "Leave Type deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0AB39C",
        });
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const openReorderModal = () => {
    const middle = [...(tabledata || [])]
      .filter((d) => d.id !== 1 && d.id !== 3)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setReorderList(middle);
    setShowReorderModal(true);
  };

  const handleSaveReorder = async () => {
    const order_payload = reorderList.map((obj, idx) => ({
      id: obj.id,
      order: idx + 1,
    }));

    const Api = await PostApi("task-status/reorder/", order_payload, false);

    if (Api.status && Api.status === 200) {
      const updatedFull = (tabledata || []).map((obj) => {
        const found = order_payload.find((p) => p.id === obj.id);
        return found ? { ...obj, order: found.order } : obj;
      });
      console.log("uppp", updatedFull);

      dispatch(setStatus(updatedFull));
      SetLocalStorage("task_status", updatedFull, 1);
      toast.success(Api?.data?.message || "Order updated");
      setShowReorderModal(false);
    } else {
      toast.error(Api?.data?.message || "Failed to update order");
    }
  };

  const handleActiveStatus = (orderData) => {
    let orderInfo = {
      text: orderData?.is_active === true ? "Deactivate" : "Activate",
      icon: orderData?.is_active === true ? "warning" : "success",
      confirmBtnColor: orderData?.is_active === true ? "#f06548" : "#0ab39c",
      statusCode: orderData?.is_active === true ? 2 : 1,
      statusToChange: orderData?.is_active === true ? false : true,
    };

    const isDeactivate = orderData?.is_active === true;
    const confirmMsg = `Are you sure you want to ${orderInfo?.text?.toLowerCase()} <b style="color: var(--vz-heading-color)">${orderData.first_name || ""} ${orderData.last_name || ""}</b>?`;

    Swal.fire({
      testId: testId(tidModule, "toggle-active"),
      title: orderInfo.text,
      // On deactivation, capture the last working day so payroll still pays
      // this employee for the month they worked. Optional — can be left blank.
      html: isDeactivate ? lastWorkingDayHtml(confirmMsg) : confirmMsg,
      icon: `${orderInfo?.icon}`,
      showCancelButton: true,
      confirmButtonColor: `${orderInfo?.confirmBtnColor}`,
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, ${orderInfo?.text}`,
      ...(isDeactivate
        ? {
            didOpen: bindLastWorkingDayField,
            preConfirm: () => ({
              date: document.getElementById("lwd-input")?.value || null,
            }),
          }
        : {}),
    }).then(async (result) => {
      if (result.isConfirmed) {
        orderInfo.lastWorkingDay = isDeactivate ? result.value?.date || null : null;
        setActiveInactiveAPIOrderData(orderData);
        setActiveInactiveAPIOrderInfo(orderInfo);
        ActivateOrDeactivate(orderData, orderInfo);
      }
    });
  };

  const [activeInactiveAPIOrderData, setActiveInactiveAPIOrderData] =
    useState(null);
  const [activeInactiveAPIOrderInfo, setActiveInactiveAPIOrderInfo] =
    useState(null);

  const ActivateOrDeactivate = async (orderData, orderInfo) => {
    console.log("ORder Data === ", orderData);
    console.log("ORder Info === ", orderInfo);

    // return false;

    if (!!orderData && !!orderData?.is_active && orderData.is_active === true) {
      DeactivateEmployeeAPI(orderData, orderInfo);
    } else {
      setShowActivateEmpModal(true);
      setActivateEmpName(orderData?.first_name);
      setActivateEmpObj({
        emp_uuid: orderData?.emp_uuid,
        primary_department_id_list: [],
        reporting_manager_id: 0,
      });
    }
  };

  const DeactivateEmployeeAPI = async (orderData, orderInfo) => {
    dispatch(setLoaderVisible(true));

    const payload = {
      emp_uuid: orderData?.emp_uuid,
      status: orderInfo?.statusCode,
      last_working_day: orderInfo?.lastWorkingDay || null,
    };

    const Api = await PostApi(
      "employee/activate-or-deactivate-employee/",
      payload,
      false,
    );

    if (!!Api.status && Api.status === 200) {
      dispatch(
        setEmployeeActiveStatus({
          id: orderData.id,
          is_active: orderInfo?.statusToChange,
        }),
      );

      const thisMetaData = GetLocalStorageData("employee");
      let updated_md = [...thisMetaData].map((d) => {
        if (d.id === orderData.id) {
          return {
            ...d,
            is_active: orderInfo?.statusToChange,
          };
        } else {
          return d;
        }
      });

      let GlobalMetaData =
        localStorage.getItem("lint_hr_globaldata") !== null
          ? JSON.parse(localStorage.getItem("lint_hr_globaldata"))
          : {};
      GlobalMetaData["employee"] = updated_md;
      localStorage.setItem(
        "lint_hr_globaldata",
        JSON.stringify(GlobalMetaData),
      );

      dispatch(setLoaderVisible(false));
      toast.success(Api?.data?.message);
    } else {
      dispatch(setLoaderVisible(false));
      if (
        !!Api?.data?.is_rep_man_error &&
        Api?.data?.is_rep_man_error === true
      ) {
        console.log(
          "team_employees_to_be_updated = ",
          Api?.data?.team_employees_to_be_updated,
        );

        setRMEmpName(orderData?.first_name);

        setTeamsToBeUpdated(Api?.data?.team_employees_to_be_updated);

        setShowRMModal(true);

        console.log("HEHEHEHEEH");
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    }
  };

  const resetPasswordValidationSchema = Yup.object({
    admin_password: Yup.string().required("Please enter Admin Password"),
    new_password: Yup.string()
      .min(8, "Minimum 8 characters required")
      .max(20, "Maximum 20 characters allowed")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/,
        "Must include uppercase, lowercase, number & special character",
      )
      .required("New Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("new_password")], "Passwords do not match")
      .required("Please Confirm Password"),
  });

  const markField = (errorElement, message) => {
    errorElement.textContent = message;
    errorElement.closest(".rp-field")?.classList.toggle("has-error", !!message);
  };

  const handleResetPassword = (orderData) => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data") || "{}",
    );

    const first_name = profile_data?.first_name || "";
    const last_name = profile_data?.last_name || "";

    const field = (id, label, owner, placeholder, extra = "") => `
      <div class="rp-field">
        <label for="${id}">${label} <span>${owner}</span></label>
        <div class="rp-control">
          <i class="ri-lock-2-line rp-lead"></i>
          <input type="password" id="${id}" data-testid="${testId(tidModule, "reset-password", label, "input")}" class="rp-input" placeholder="${placeholder}" autocomplete="new-password" />
          <button type="button" class="rp-toggle" data-target="${id}" data-testid="${testId(tidModule, "reset-password", label, "visibility-button")}" tabindex="-1" title="Show / hide">
            <i class="ri-eye-line"></i>
          </button>
        </div>
        ${extra}
        <div id="${id}Error" data-testid="${testId(tidModule, "reset-password", label, "error")}" class="rp-error"></div>
      </div>`;

    const adminName = `${first_name} ${last_name}`.trim();
    const empName =
      `${orderData.first_name || ""} ${orderData.last_name || ""}`.trim();

    Swal.fire({
      testId: testId(tidModule, "reset-password"),
      title: `<span class="rp-title-icon"><i class="ri-lock-password-line"></i></span>Reset Password`,
      customClass: { popup: "rp-popup" },
      html: `
      <style>
        .swal2-container .swal2-popup.rp-popup.swal2-modal { width: 30rem !important; }
        .swal2-container .swal2-popup.rp-popup.swal2-modal .swal2-title { display: flex !important; flex-direction: column; align-items: center; gap: 12px; }
        .swal2-container .swal2-popup.rp-popup.swal2-modal .swal2-html-container { overflow: visible !important; margin: 6px 0 0 !important; padding: 0 !important; }
        .rp-title-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 24px; color: #fff;
          background: linear-gradient(135deg, var(--vz-primary), var(--vz-info));
          box-shadow: 0 8px 18px rgba(var(--vz-primary-rgb), .35);
        }
        .rp-sub { font-size: 13px; color: var(--vz-secondary-color); margin: 0 0 18px; text-align: center; }
        .rp-sub b { color: var(--vz-heading-color); font-weight: 600; }
        .rp-form { text-align: left; padding: 0 26px 6px; display: flex; flex-direction: column; gap: 14px; }
        .rp-divider { height: 1px; background: var(--vz-border-color); margin: 2px 0; }
        .rp-field label { display: block; margin: 0 0 6px; font-size: 12.5px; font-weight: 600; color: var(--vz-heading-color); }
        .rp-field label span { font-weight: 500; color: var(--vz-secondary-color); }
        .rp-control { position: relative; }
        .rp-lead { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--vz-secondary-color); pointer-events: none; transition: color .15s; }
        .rp-input {
          width: 100%; height: 44px; margin: 0; padding: 0 44px 0 40px;
          border: 1px solid var(--vz-border-color); border-radius: 10px;
          background: var(--vz-body-bg); color: var(--vz-body-color);
          font-size: 13.5px; outline: none; box-shadow: none;
          transition: border-color .15s, box-shadow .15s, background-color .15s;
        }
        .rp-input::placeholder { color: var(--vz-secondary-color); opacity: .8; }
        .rp-input:focus { border-color: var(--vz-primary); background: var(--vz-secondary-bg); box-shadow: 0 0 0 3px rgba(var(--vz-primary-rgb), .15); }
        .rp-control:focus-within .rp-lead { color: var(--vz-primary); }
        .rp-field.has-error .rp-input { border-color: var(--vz-danger); box-shadow: 0 0 0 3px rgba(var(--vz-danger-rgb), .12); }
        .rp-field.has-error .rp-lead { color: var(--vz-danger); }
        .rp-toggle {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 17px; color: var(--vz-secondary-color); cursor: pointer; transition: color .15s, background-color .15s;
        }
        .rp-toggle:hover { color: var(--vz-primary); background: rgba(var(--vz-primary-rgb), .08); }
        .rp-error { font-size: 11.5px; color: var(--vz-danger); margin-top: 5px; }
        .rp-error:empty { display: none; }
        .rp-rules { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .rp-rule {
          display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 999px;
          font-size: 11px; font-weight: 500; color: var(--vz-secondary-color);
          background: var(--vz-tertiary-bg); border: 1px solid var(--vz-border-color); transition: all .15s;
        }
        .rp-rule.ok { color: var(--vz-success); background: rgba(var(--vz-success-rgb), .1); border-color: rgba(var(--vz-success-rgb), .3); }
      </style>

      <p class="rp-sub">Set a new password for <b>${empName || "this employee"}</b></p>
      <form id="resetPasswordForm" class="rp-form" autocomplete="off">
        ${field("adminPassword", "Your Password", `(${adminName})`, "Enter your admin password")}
        <div class="rp-divider"></div>
        ${field(
          "newPassword",
          "New Password",
          `(${empName})`,
          "Enter new password",
          `<div class="rp-rules">
            <span class="rp-rule" data-rule="len"><i class="ri-checkbox-blank-circle-line"></i>8–20 chars</span>
            <span class="rp-rule" data-rule="case"><i class="ri-checkbox-blank-circle-line"></i>Aa</span>
            <span class="rp-rule" data-rule="num"><i class="ri-checkbox-blank-circle-line"></i>123</span>
            <span class="rp-rule" data-rule="special"><i class="ri-checkbox-blank-circle-line"></i>!@#$%^&*</span>
          </div>`,
        )}
        ${field("confirmPassword", "Confirm Password", `(${empName})`, "Re-enter new password")}
      </form>
    `,
      icon: false,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="ri-refresh-line me-1"></i> Reset Password',

      preConfirm: async () => {
        const adminPasswordValue = document
          .getElementById("adminPassword")
          .value.trim();
        const newPasswordValue = document
          .getElementById("newPassword")
          .value.trim();
        const confirmPasswordValue = document
          .getElementById("confirmPassword")
          .value.trim();

        const adminPasswordError =
          document.getElementById("adminPasswordError");
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmPasswordError",
        );

        // Reset previous error messages
        markField(adminPasswordError, "");
        markField(newPasswordError, "");
        markField(confirmPasswordError, "");

        let isValid = true;

        // Validate all fields on submit
        try {
          await resetPasswordValidationSchema.validate(
            {
              admin_password: adminPasswordValue,
              new_password: newPasswordValue,
              confirm_password: confirmPasswordValue,
            },
            { abortEarly: false },
          );
        } catch (err) {
          isValid = false;
          if (err.inner) {
            err.inner.forEach((error) => {
              if (error.path === "admin_password")
                markField(adminPasswordError, error.message);
              if (error.path === "new_password")
                markField(newPasswordError, error.message);
              if (error.path === "confirm_password")
                markField(confirmPasswordError, error.message);
            });
          }
        }

        if (!isValid) {
          return false;
        }

        const data = {
          admin_password: adminPasswordValue,
          emp_uuid: orderData.emp_uuid,
          new_password: newPasswordValue,
          confirm_password: confirmPasswordValue,
        };

        try {
          const Api = await PostApi("employee/reset-password/", data, false);

          if (Api.status && Api.status === 200) {
            return {
              adminPassword: adminPasswordValue,
              newPassword: newPasswordValue,
              confirmPassword: confirmPasswordValue,
              apiResponse: Api,
            };
          } else {
            toast.error(
              Api?.data?.message ||
                Api?.data?.detail ||
                "Reset Password Failed",
            );
            return false;
          }
        } catch (error) {
          toast.error("Something went wrong. Please try again.");
          return false;
        }
      },

      didOpen: () => {
        document.querySelectorAll(".rp-toggle").forEach((button) => {
          button.onclick = () => {
            const input = document.getElementById(button.dataset.target);
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.innerHTML = show
              ? '<i class="ri-eye-off-line"></i>'
              : '<i class="ri-eye-line"></i>';
          };
        });

        const adminPasswordInput = document.getElementById("adminPassword");
        const newPasswordInput = document.getElementById("newPassword");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        const adminPasswordError =
          document.getElementById("adminPasswordError");
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmPasswordError",
        );

        const validateField = async (fieldName, values, errorElement) => {
          try {
            await resetPasswordValidationSchema.validateAt(fieldName, values);
            markField(errorElement, "");
          } catch (err) {
            markField(errorElement, err.message);
          }
        };

        // Realtime validation
        adminPasswordInput.addEventListener("input", () => {
          validateField(
            "admin_password",
            { admin_password: adminPasswordInput.value },
            adminPasswordError,
          );
        });

        const rules = {
          len: (v) => v.length >= 8 && v.length <= 20,
          case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
          num: (v) => /[0-9]/.test(v),
          special: (v) => /[!@#$%^&*]/.test(v),
        };
        const updateRules = (value) => {
          document.querySelectorAll(".rp-rule").forEach((chip) => {
            const ok = rules[chip.dataset.rule](value);
            chip.classList.toggle("ok", ok);
            chip.firstElementChild.className = ok
              ? "ri-checkbox-circle-fill"
              : "ri-checkbox-blank-circle-line";
          });
        };

        newPasswordInput.addEventListener("input", () => {
          updateRules(newPasswordInput.value);
          const values = {
            admin_password: adminPasswordInput.value,
            new_password: newPasswordInput.value,
            confirm_password: confirmPasswordInput.value,
          };

          validateField("new_password", values, newPasswordError);

          if (confirmPasswordInput.value) {
            validateField("confirm_password", values, confirmPasswordError);
          }
        });

        confirmPasswordInput.addEventListener("input", () => {
          validateField(
            "confirm_password",
            {
              admin_password: adminPasswordInput.value,
              new_password: newPasswordInput.value,
              confirm_password: confirmPasswordInput.value,
            },
            confirmPasswordError,
          );
        });

        adminPasswordInput.focus();
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          testId: testId(tidModule, "password-reset-success"),
          title: "Password Reset!",
          html:
            result.value?.apiResponse?.data?.message ||
            "Password has been reset successfully.",
          icon: "success",
        });
      }
    });
  };
  // Column
  const initialColumns = [
    {
      Header: "Action",
      Cell: (cellProps) => {
        const orderData = cellProps.row.original;
        const rowId = (...parts) => rowTestId(testIdModuleFor(formname), orderData, ...parts);
        if (
          formname &&
          (formname === leave_approval_component_name ||
            formname === leave_pending_table) &&
          (orderData.status === 1 ||
            (orderData.status === 4 &&
              orderData?.leave_cancellation_details &&
              orderData?.leave_cancellation_details.status === 1))
        ) {
          const isCancelReq = orderData.status === 4;
          return (
            <div className="apv-actions">
              <button
                type="button"
                className="apv-act is-approve"
                title={isCancelReq ? "Approve cancellation" : "Approve"}
                onClick={() => handleApproval(orderData)}
                data-testid={rowId("approve-button")}
              >
                <i className="ri-check-line"></i>
              </button>
              <button
                type="button"
                className="apv-act is-reject"
                title={isCancelReq ? "Reject cancellation" : "Reject"}
                onClick={() => handleReject(orderData)}
                data-testid={rowId("reject-button")}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          );
        } else if (
          formname &&
          (formname === leave_approval_component_name ||
            formname === leave_pending_table) &&
          orderData.status === 4 &&
          orderData?.leave_cancellation_details &&
          orderData?.leave_cancellation_details.status != 1
        ) {
          return <span className="apv-muted">—</span>;
        } else if (
          formname &&
          (formname === attendance_approval_component_name ||
            formname === attendance_pending_table) &&
          orderData.hr_status === 3
        ) {
          return (
            <div className="apv-actions">
              <button
                type="button"
                className="apv-act is-approve"
                title="Approve"
                onClick={() => handleApproval(orderData)}
                data-testid={rowId("approve-button")}
              >
                <i className="ri-check-line"></i>
              </button>
              <button
                type="button"
                className="apv-act is-reject"
                title="Reject"
                onClick={() => handleReject(orderData)}
                data-testid={rowId("reject-button")}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          );
        } else if (formname === leave_application_component_name) {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {/* ✏️ EDIT + DELETE ONLY WHEN status === 1 AND NOT DELETED */}
              {orderData.status === 1 && orderData.is_deleted === false && (
                <>
                  {/* EDIT */}
                  <li className="list-inline-item edit">
                    <Link
                      to="javascript:void(0)"
                      className="text-primary d-inline-block edit-item-btn"
                      data-testid={rowId("edit-button")}
                      onClick={() => {
                        handleCreateAndUpdate(orderData.id, orderData);
                      }}
                    >
                      <i className="ri-pencil-line fs-16"></i>
                    </Link>
                  </li>

                  {/* DELETE */}
                  <li className="list-inline-item delete">
                    <Link
                      to="javascript:void(0)"
                      className="text-danger d-inline-block delete-item-btn"
                      data-testid={rowId("delete-button")}
                      onClick={() => {
                        handleDelete(orderData);
                      }}
                    >
                      <i className="ri-delete-bin-line fs-16"></i>
                    </Link>
                  </li>
                </>
              )}

              {/* ⋮ THREE DOT MENU */}
              {orderData.allowed_to_cancel_request && (
                <li className="list-inline-item">
                  <button
                    type="button"
                    className="btn btn-soft-warning btn-sm rounded-pill px-2 py-1 text-nowrap"
                    style={{ fontSize: 12, fontWeight: 600 }}
                    title="Raise cancel leave request"
                    data-testid={rowId("cancel-request-button")}
                    onClick={() => handleActionClick(orderData)}
                  >
                    <i className="ri-close-circle-line align-middle me-1"></i>
                    Cancel Request
                  </button>
                </li>
              )}
            </ul>
          );
        } else if (formname === holiday_component_name) {
          return (
            <>
              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  data-testid={rowId("edit-button")}
                  onClick={() => handleCreateAndUpdate(orderData.id, orderData)}
                >
                  <i className="ri-pencil-line fs-16"></i>
                </Link>
              </li>

              <li className="list-inline-item delete">
                <Link
                  to="javascript:void(0)"
                  className="text-danger d-inline-block delete-item-btn"
                  data-testid={rowId("delete-button")}
                  onClick={() => handleHolidayDelete(orderData)}
                >
                  <i className="ri-delete-bin-line fs-16"></i>
                </Link>
              </li>
            </>
          );
        } else if (formname === leave_type_component_name) {
          return (
            <>
              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  data-testid={rowId("edit-button")}
                  onClick={() => handleCreateAndUpdate(orderData.id, orderData)}
                >
                  <i className="ri-pencil-line fs-16"></i>
                </Link>
              </li>

              {/* <li className="list-inline-item delete">
                <Link
                  to="javascript:void(0)"
                  className="text-danger d-inline-block delete-item-btn"
                  onClick={() => handleLeaveTypeDelete(orderData)}
                >
                  <i className="ri-delete-bin-line fs-16"></i>
                </Link>
              </li> */}
            </>
          );
        } else if (
          formname === project_component_name ||
          formname === client_component_name ||
          formname === status_component_name ||
          formname === priorities_component_name ||
          formname === task_list_component_name ||
          formname === custom_status_form_component_name ||
          formname === custom_field_component_name ||
          formname === work_schedule_component_name ||
          formname === role_component_name   // ← add
        ) {
          const rowData = cellProps.row.original;

          const isLockedStatusRow =
            formname === status_component_name &&
            (rowData.id === 1 || rowData.id === 2 || rowData.id === 3);

          return (
            <>
              <li className="list-inline-item edit">
                {isLockedStatusRow ? (
                  <span
                    className="text-muted d-inline-block edit-item-btn"
                    style={{ cursor: "not-allowed", opacity: 0.5 }}
                    title="This status cannot be edited"
                  >
                    <i className="ri-pencil-line fs-16"></i>
                  </span>
                ) : (
                  <Link
                    to="javascript:void(0)"
                    className="text-primary d-inline-block edit-item-btn"
                    data-testid={rowId("edit-button")}
                    onClick={() => handleCreateAndUpdate(rowData.id, rowData)}
                  >
                    <i className="ri-pencil-line fs-16"></i>
                  </Link>
                )}
              </li>

              {/* <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => deleteHandler(rowData.id, formname)}
                >
                  <i className="ri-delete-bin-line fs-16"></i>
                </Link>
              </li> */}
            </>
          );
        } else if (formname && formname === employee_component_name) {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <UncontrolledDropdown className="float-end">
                <DropdownToggle
                  tag="a"
                  className="text-reset dropdown-btn"
                  data-testid={rowId("actions-menu-trigger")}
                  href=""
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="text-primary d-inline-block edit-item-btn fs-16">
                    <i className="mdi mdi-dots-horizontal"></i>
                  </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end" container="body" style={{ zIndex: 1300 }}>
                  {!!orderData && (
                    <DropdownItem
                      data-testid={rowId("toggle-active-option")}
                      onClick={() => {
                        handleActiveStatus(orderData);
                      }}
                    >
                      <i className="ri-shut-down-line"></i>{" "}
                      {orderData?.is_active === true
                        ? "Deactivate"
                        : "Activate"}
                    </DropdownItem>
                  )}
                  <DropdownItem
                    data-testid={rowId("reset-password-option")}
                    onClick={() => {
                      handleResetPassword(orderData);
                    }}
                  >
                    <i className="ri-refresh-line"></i> Reset Password
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>

              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  data-testid={rowId("edit-button")}
                  onClick={() => {
                    handleCreateAndUpdate(orderData.id, orderData);
                  }}
                >
                  <i className="ri-pencil-line fs-16"></i>
                </Link>
              </li>
              {/* <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => {
                    const orderData = cellProps.row.original;
                  }}
                >
                  <i className="ri-delete-bin-line fs-16"></i>
                </Link>
              </li> */}
            </ul>
          );
        } else if (formname === work_schedule_component_name) {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  data-testid={rowId("edit-button")}
                  onClick={() => {
                    handleCreateAndUpdate(orderData.id, orderData);
                  }}
                >
                  <i className="ri-pencil-line fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        } else {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {orderData.status === 2 ||
              orderData.status === 3 ||
              orderData.hr_status === 2 ||
              orderData.hr_status === 4 ? null : ( // ✅ IMPORTANT FIX
                <>
                  {/* EDIT */}
                  <li className="list-inline-item edit">
                    <Link
                      to="javascript:void(0)"
                      className="text-primary d-inline-block edit-item-btn"
                      data-testid={rowId("edit-button")}
                      onClick={() => {
                        handleCreateAndUpdate(orderData.id, orderData);
                      }}
                    >
                      <i className="ri-pencil-line fs-16"></i>
                    </Link>
                  </li>

                  {/* DELETE */}
                  <li className="list-inline-item">
                    <Link
                      to="#"
                      className="text-danger d-inline-block remove-item-btn"
                      data-testid={rowId("delete-button")}
                      onClick={() => {
                        const rowData = cellProps.row.original;
                        // 👉 your delete logic here
                      }}
                    >
                      <i className="ri-delete-bin-line fs-16"></i>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          );
        }
      },
      is_action: true,
    },
  ];

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showImportBtn, setShowImportBtn] = useState(false);
  const [showExportBtn, setShowExportBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);
  const [showAllLeaveApprovalBtn, setShowAllLeaveApprovalBtn] = useState(false);
  const [showTeamLeaveApprovalBtn, setShowTeamLeaveApprovalBtn] =
    useState(false);
  const [showAllAttendanceApprovalBtn, setShowAllAttendanceApprovalBtn] =
    useState(false);
  const [showTeamAttendanceApprovalBtn, setShowTeamAttendanceApprovalBtn] =
    useState(false);
  const firstEffectExecutedRef = useRef(false);
  useEffect(() => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data"),
    );
       const isAdminUser = profile_data?.is_admin === true;
    const approvePermList = profile_data?.permission_list || [];

    if (
      formname === leave_approval_component_name ||
      formname === attendance_approval_component_name ||
      formname === leave_pending_table ||
      formname === attendance_pending_table
    ) {
      setShowAllLeaveApprovalBtn(
        isAdminUser ||
          approvePermList.includes(APPROVE_REJECT_HIERARCHY_LEAVE_ACCESS_KEY),
      );
      setShowTeamLeaveApprovalBtn(
        isAdminUser ||
          approvePermList.includes(APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY),
      );

      setShowAllAttendanceApprovalBtn(
        isAdminUser ||
          approvePermList.includes(
            APPROVE_REJECT_HIERARCHY_ATTENDANCE_ACCESS_KEY,
          ),
      );
      setShowTeamAttendanceApprovalBtn(
        isAdminUser ||
          approvePermList.includes(APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY),
      );
    }
    firstEffectExecutedRef.current = true;
    CheckCreateAccess(profile_data, formname);
    CheckEditAccess(profile_data, formname);
    CheckImportExportAccess(profile_data, formname);
  }, [formname]);

  useEffect(() => {
    if (
      formname === attendance_approval_component_name ||
      formname === leave_approval_component_name
    ) {
      if (firstEffectExecutedRef.current) {
        // ApprovalFilter stores the scope as "all" / "hierarchy" / "team";
        // older screens used 0 (all / hierarchy) and 1 (team).
        const isTeamScope =
          approvalEmployeeTypeFilter === 1 || approvalEmployeeTypeFilter === "team";
        const isAllScope =
          approvalEmployeeTypeFilter === 0 ||
          approvalEmployeeTypeFilter === "all" ||
          approvalEmployeeTypeFilter === "hierarchy";
        if (currentApprovalComponent === attendance_approval_component_name) {
          setShowEditBtn(
            (isAllScope && showAllAttendanceApprovalBtn) ||
              (isTeamScope && showTeamAttendanceApprovalBtn),
          );
        }
        if (currentApprovalComponent === leave_approval_component_name) {
          setShowEditBtn(
            (isAllScope && showAllLeaveApprovalBtn) ||
              (isTeamScope && showTeamLeaveApprovalBtn),
          );
        }
      }
    }
    if (
      formname === attendance_pending_table ||
      formname === leave_pending_table
    ) {
      if (firstEffectExecutedRef.current) {
        if (dashPendingApprovalCom === "attendance_pending_table") {
          showTeamAttendanceApprovalBtn === true
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
        if (dashPendingApprovalCom === "leave_pending_table") {
          showTeamLeaveApprovalBtn === true
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
      }
    }
  }, [
    currentApprovalComponent,
    showAllAttendanceApprovalBtn,
    showTeamAttendanceApprovalBtn,
    showAllLeaveApprovalBtn,
    showTeamLeaveApprovalBtn,
    firstEffectExecutedRef.current,
    approvalEmployeeTypeFilter,
    dashPendingApprovalCom,
  ]);

  const CheckCreateAccess = (profile_data, thisFormName) => {
    console.log("Form Name:", thisFormName);
    console.log("Permissions:", profile_data.permission_list);
    console.log(
      "Has Create Client:",
      profile_data.permission_list.includes(CREATE_CLIENT_ACCESS_KEY),
    );
    if (
      !!profile_data &&
      !!profile_data.is_admin &&
      profile_data?.is_admin === true
    ) {
      setShowCreateBtn(true);
    } else if (!!profile_data && !!profile_data.permission_list) {
      if (!!thisFormName) {
        if (
          (thisFormName === employee_component_name &&
            profile_data.permission_list.includes(
              CREATE_EMPLOYEE_ACCESS_KEY,
            )) ||
          (thisFormName === custom_field_component_name &&
            profile_data.permission_list.includes(
              CREATE_CUSTOM_FIELD_ACCESS_KEY,
            )) ||
          (thisFormName === client_component_name &&
            profile_data.permission_list.includes(CREATE_CLIENT_ACCESS_KEY)) ||
          (thisFormName === role_component_name &&
            profile_data.permission_list.includes(CREATE_ROLES_ACCESS_KEY))  ||
          (thisFormName === project_component_name &&                      
            profile_data.permission_list.includes(CREATE_PROJECT_ACCESS_KEY)) ||
           (thisFormName === task_list_component_name &&                          
            profile_data.permission_list.includes(CREATE_TASK_ACCESS_KEY)) ||    
          ((thisFormName === status_component_name ||                            
            thisFormName === priorities_component_name ||                       
            thisFormName === custom_status_form_component_name) &&               
            profile_data.permission_list.includes(CREATE_TASK_SETTINGS_ACCESS_KEY)) 
        ) {
          console.log("Create Access Granted");
          setShowCreateBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          console.log("Leave Application Access Granted");
          setShowCreateBtn(true);
        } else {
          console.log("Create Access Denied");
          setShowCreateBtn(false);
        }
      }
    } else {
      setShowCreateBtn(true);
    }
  };

  const CheckEditAccess = (profile_data, thisFormName) => {
    if (
      !!profile_data &&
      !!profile_data.is_admin &&
      profile_data?.is_admin === true
    ) {
      setShowEditBtn(true);
    } else if (!!profile_data && !!profile_data.permission_list) {
      if (!!thisFormName) {
        if (
          (thisFormName === employee_component_name &&
            profile_data.permission_list.includes(EDIT_EMPLOYEE_ACCESS_KEY)) ||
          (thisFormName === custom_field_component_name &&
            profile_data.permission_list.includes(
              EDIT_CUSTOM_FIELD_ACCESS_KEY,
            )) ||
          (thisFormName === client_component_name &&
            profile_data.permission_list.includes(EDIT_CLIENT_ACCESS_KEY)) ||
          (thisFormName === role_component_name &&
            profile_data.permission_list.includes(EDIT_ROLES_ACCESS_KEY))  ||
          (thisFormName === project_component_name &&                    
            profile_data.permission_list.includes(EDIT_PROJECT_ACCESS_KEY)) ||
           (thisFormName === task_list_component_name &&                          
            profile_data.permission_list.includes(EDIT_TASK_ACCESS_KEY)) ||      
          ((thisFormName === status_component_name ||                            
            thisFormName === priorities_component_name ||                       
            thisFormName === custom_status_form_component_name) &&               
            profile_data.permission_list.includes(EDIT_TASK_SETTINGS_ACCESS_KEY)) 
        ) {
          setShowEditBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          setShowEditBtn(true);
        } else {
          setShowEditBtn(false);
        }
      }
    } else {
      setShowEditBtn(false);
    }
  };

  const CheckImportExportAccess = (profile_data, thisFormName) => {
    const isAdmin = profile_data?.is_admin === true;
    const perms = profile_data?.permission_list || [];

    // Admins and non-employee forms keep the current behaviour
    if (isAdmin || thisFormName !== employee_component_name) {
      setShowImportBtn(true);
      setShowExportBtn(true);
      return;
    }

    const canCreate = perms.includes(CREATE_EMPLOYEE_ACCESS_KEY);
    const canEdit = perms.includes(EDIT_EMPLOYEE_ACCESS_KEY);

    setShowImportBtn(canCreate);
    setShowExportBtn(canCreate);
  };

  // Data columns first — never start with Action alone (revisit used to flash
  // the pencil on the left before permissions resolved).
  const [tableColumn, setTableColumn] = useState(
    () => (additionalColumn?.length ? [...additionalColumn] : []),
  );

  useEffect(() => {
    const dataCols = Array.isArray(additionalColumn) ? additionalColumn : [];
    if (showEditBtn === true) {
      setTableColumn([...dataCols, ...initialColumns]);
    } else {
      setTableColumn([...dataCols]);
    }
  }, [showEditBtn]);

  const isApprovalTable =
    formname === leave_approval_component_name ||
    formname === attendance_approval_component_name;
  const pageMeta = getPageMeta(formname);
  const isRowSelectable = (row) =>
    formname === leave_approval_component_name
      ? row?.status === 1
      : row?.hr_status === 3;
  const selectableIds = isApprovalTable
    ? (dataList || []).filter(isRowSelectable).map((row) => row.id)
    : [];
  const allRowsSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedGroupIds.includes(id));

  useEffect(() => {
    setSelectedGroupIds((prev) => {
      const next = prev.filter((id) => selectableIds.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [dataList]);

  const selectionColumn = {
    id: "#",
    Header: (
      <input
        type="checkbox"
        className="form-check-input"
        checked={allRowsSelected}
        data-testid={testId(tidModule, "select-all-checkbox")}
        disabled={!selectableIds.length}
        onChange={(e) => setSelectedGroupIds(e.target.checked ? selectableIds : [])}
      />
    ),
    Cell: (cellProps) => {
      const row = cellProps.row.original;
      if (!isRowSelectable(row)) return null;
      return (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedGroupIds.includes(row.id)}
          data-testid={rowTestId(tidModule, row, "checkbox")}
          onChange={(e) => {
            const { checked } = e.target;
            setSelectedGroupIds((prev) =>
              checked
                ? prev.includes(row.id) ? prev : [...prev, row.id]
                : prev.filter((id) => id !== row.id),
            );
          }}
        />
      );
    },
  };

  const columnsForTable =
    isApprovalTable && showEditBtn ? [selectionColumn, ...tableColumn] : tableColumn;

  const toggleTab = (tab, type, condition) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      let filteredDatas = [...sortedTableData];
      if (type !== "all") {
        filteredDatas = [...sortedTableData].filter(
          (data) => data[filterKey] == type,
        );
      }
      setDataList(filteredDatas);
    }
    dispatch(setActiveTableTab(null));
  };

  useEffect(() => {
    if (tabledata && tabledata.length) {
      let type = "";
      if (activeTab === undefined || parseInt(activeTab) === 1) {
        type = "all";
      } else {
        type = tabOptions.length
          ? tabOptions.find((e) => e.idx === parseInt(activeTab))?.option
          : "all";
      }
      let filtered_table_data =
        type === "all"
          ? [...sortedTableData]
          : [...sortedTableData].filter((data) => data[filterKey] == type);

      setDataList(filtered_table_data);
      setIsLoading(false);
    } else if (!loading) {
      setDataList([]);
      setIsLoading(false);
    }
  }, [tabledata, sortedTableData, loading]);

  const handleDataClicks = () => {
    setData("");
  };

  // Delete Multiple
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteMultiple = () => {
    setSelectedGroupIds([]);
    setIsMultiDeleteButton(false);
  };

  const handleDeleteData = (data) => {};

  // CUSTOM FORM

  const handleCreateAndUpdate = ($id, table_obj) => {
    console.log("table_obj === ", table_obj);
    console.log("id === ", $id);

    let FormObj = {};

    if ($id === 0) {
      FormObj = initialFormObj;
    } else {
      let thisCFValues =
        "cf_values" in table_obj ? [...table_obj?.cf_values] : [];
      let cf = [];
      let CustomFieldsForThisForm = GetCustomField(formname);
      if (thisCFValues && thisCFValues.length) {
        cf = CustomFieldsForThisForm.map((obj) => {
          return {
            ...obj,
            value:
              thisCFValues.find((t) => t.id === obj.id)?.value || obj.value,
          };
        });
      } else {
        cf = CustomFieldsForThisForm;
      }

      FormObj = { ...table_obj, cf_values: cf };
    }

    dispatch(setFormTitle(formname));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage(width_per));
    dispatch(setComponentToShow(formname));
    dispatch(toggleRSBView(true));
  };

  const HandleImportExport = () => {
    dispatch(toggleISBView(true));
    dispatch(setComponentToShow(formname));
    dispatch(setFormTitle("Employee Bulk Import"));
    dispatch(setFormWidthPercentage(import_width_per));
  };

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setOrder(null);
    } else {
      setModal(true);
      setDate(defaultdate());
    }
  }, [modal]);

  const [rmEmpName, setRMEmpName] = useState("");
  const [showRMModal, setShowRMModal] = useState(false);
  const onRMModalCloseClick = () => {
    setShowRMModal(false);
  };

  const [TeamsToBeUpdated, setTeamsToBeUpdated] = useState([]);

  const handleNewReportingManager = (e, d_id) => {
    const { value } = e;

    console.log("Handle New Rep Man = ", value);

    const new_rm = [...TeamsToBeUpdated].map((d) => {
      if (d.id === d_id) {
        return {
          ...d,
          new_reporting_manager_id: value,
        };
      } else {
        return d;
      }
    });

    setTeamsToBeUpdated(new_rm);
  };

  const assignNewReportingManager = async () => {
    const f = TeamsToBeUpdated.filter(
      (d) => parseInt(d.new_reporting_manager_id) === 0,
    );
    if (f.length > 0) {
      toast.error("Please Select New Reporting Manager");
    } else {
      dispatch(setLoaderVisible(true));
      const Payload = TeamsToBeUpdated.map((d) => {
        return {
          employee_id: d?.employee_id,
          new_reporting_manager_id: d?.new_reporting_manager_id,
          sub_child_details: d?.employee_details,
        };
      });

      console.log("API Payload = ", Payload);

      const Api = await PostApi(
        "employee/assign-new-reporting-manager/",
        Payload,
        false,
      );

      if (Api.status && Api.status === 200) {
        dispatch(setLoaderVisible(false));
        DeactivateEmployeeAPI(
          activeInactiveAPIOrderData,
          activeInactiveAPIOrderInfo,
        );
        setShowRMModal(false);
      } else {
        dispatch(setLoaderVisible(false));
        console.log("API Exception === ", Api);
        toast.error("Something Went Wrong");
      }
    }
  };

  // Activate employee

  const [activateEmpName, setActivateEmpName] = useState("");
  const [showActivateEmpModal, setShowActivateEmpModal] = useState(false);
  const onActivateEmpModalClick = () => {
    setShowActivateEmpModal(false);
  };

  const initialActivateEmpObj = useMemo(() => {
    return {
      emp_uuid: 0,
      primary_department_id_list: [],
      reporting_manager_id: 0,
    };
  });

  const [activateEmpObj, setActivateEmpObj] = useState(initialActivateEmpObj);
  const dep_options = GetLocalStorageData("department") || [];
  const [reportingManagerOptions, setReportingManagerOptions] = useState([]);

  const handlePrimaryDepChange = async (e) => {
    let valid_dep_obj = [];
    let valid_dep_ids = [];

    for (var i = 0; i < e.length; i++) {
      var is_child = false;
      for (var j = 0; j < e.length; j++) {
        if (i !== j) {
          if (e[j].child_id_list.includes(e[i].id)) {
            is_child = true;
          }
        }
      }
      if (is_child === false) {
        valid_dep_obj.push(e[i]);
        valid_dep_ids.push(e[i].id);
      }
    }

    if (valid_dep_ids.length) {
      GetReportingManager(valid_dep_ids);
    } else {
      setReportingManagerOptions([]);
    }

    setActivateEmpObj({
      ...activateEmpObj,
      primary_department_id_list: valid_dep_ids,
      reporting_manager_id: 0,
    });
  };

  const GetReportingManager = async (valid_dep_ids) => {
    const Api = await PostApi(
      "employee/get-employee-list-for-reporting-manager/",
      { dep_id: valid_dep_ids },
      false,
    );
    if (Api.status && Api.status === 200) {
      const response = Api?.data?.data;
      setReportingManagerOptions(
        EmployeeData.filter(
          (d) => d.id !== activateEmpObj.id && response.includes(d.id),
        ),
      );
    } else {
      console.log("ERRR");
    }
  };

  const ActivateEmployeeAPI = async () => {
    if (
      !!activateEmpObj?.reporting_manager_id &&
      activateEmpObj?.reporting_manager_id !== 0
    ) {
      dispatch(setLoaderVisible(true));
      activateEmpObj["status"] = 1;

      console.log("ACITVATE EMP OBJ === ", activateEmpObj);

      const Api = await PostApi(
        "employee/activate-or-deactivate-employee/",
        activateEmpObj,
        false,
      );
      if (!!Api.status && Api.status === 200) {
        dispatch(setLoaderVisible(false));
        dispatch(editEmployee(Api?.data?.data));
        SetLocalStorage("employee", Api?.data.data, 3);
        setShowActivateEmpModal(false);
        toast.success(Api?.data?.message);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    } else {
      toast.error("Please Select Reporting Manager");
    }
  };

  return (
    <Col lg={table_col || 12}>
      <div className={table_class || "page-content"}>
        <ExportCSV
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          formname={formname} // ✅ use the page's own formname
          data={dataList}
        />

        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteData}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <Card
            id="dataList"
            className={
              formname !== attendance_pending_table && formname !== leave_pending_table
                ? "apv-card it-card"
                : undefined
            }
          >
            {formname &&
              formname !== attendance_pending_table &&
              formname !== leave_pending_table && (
                <CardHeader className="bdata-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="text-start me-auto" style={{ minWidth: 0 }}>
                      {isApprovalTable ? (
                        <div className="apv-head">
                          <span className="apv-head-icon">
                            <i
                              className={
                                formname === attendance_approval_component_name
                                  ? "ri-fingerprint-line"
                                  : "ri-calendar-check-line"
                              }
                            ></i>
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <h5 className="apv-head-title">
                              {formname === attendance_approval_component_name
                                ? "Attendance Approval"
                                : "Leave Approval"}
                            </h5>
                            <span className="apv-head-sub">
                              {selectedGroupIds.length > 0
                                ? `${selectedGroupIds.length} selected for bulk action`
                                : "Review, approve or reject team requests"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="apv-head">
                          <span className={`apv-head-icon tone-${pageMeta.tone}`}>
                            <i className={pageMeta.icon}></i>
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <h5 className="apv-head-title">{pageMeta.title}</h5>
                            <span className="apv-head-sub">
                              {(tabledata?.length || 0).toLocaleString()}{" "}
                              {(tabledata?.length || 0) === 1 ? "record" : "records"}
                              {pageMeta.sub ? ` · ${pageMeta.sub}` : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ms-auto">
                      <div className="d-flex gap-1 flex-wrap justify-content-end">
                        {formname &&
                          formname !== leave_approval_component_name &&
                          formname !== attendance_approval_component_name &&
                          formname !== attendance_pending_table &&
                          formname !== leave_pending_table &&
                          showCreateBtn && (
                            <button
                              type="button"
                              className="it-btn is-primary add-btn"
                              id="create-btn"
                              data-testid={testId(tidModule, "create-button")}
                              onClick={() => {
                                handleCreateAndUpdate(0);
                              }}
                            >
                              <i className="ri-add-line"></i>
                              Create {pageMeta.singular}
                            </button>
                          )}{" "}
                        {formname === status_component_name && showEditBtn &&(
                          <button
                            type="button"
                            className="it-btn is-soft"
                            id="reorder-btn"
                            data-testid={testId(tidModule, "reorder-button")}
                            onClick={openReorderModal}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                            >
                              <circle cx="5" cy="3" r="1.3" />
                              <circle cx="11" cy="3" r="1.3" />
                              <circle cx="5" cy="8" r="1.3" />
                              <circle cx="11" cy="8" r="1.3" />
                              <circle cx="5" cy="13" r="1.3" />
                              <circle cx="11" cy="13" r="1.3" />
                            </svg>
                            Reorder
                          </button>
                        )}{" "}
                        <div className="d-flex gap-1 flex-wrap">
                          {formname &&
                            component_list_for_import_btn_access.includes(
                              formname,
                            ) &&
                            formname !== holiday_component_name &&
                            showImportBtn &&  (
                              <button
                                type="button"
                                className="it-btn is-soft"
                                id="import-btn"
                                data-testid={testId(tidModule, "import-button")}
                                onClick={() => {
                                  HandleImportExport();
                                }}
                              >
                                <i className="ri-upload-cloud-2-line"></i>
                                Import
                              </button>
                            )}{" "}
                          {formname &&
                            formname !== attendance_pending_table &&
                            formname !== leave_pending_table &&
                            formname !== custom_field_component_name &&
                            formname !== leave_application_component_name &&
                            formname !== priorities_component_name &&
                            formname !== status_component_name &&
                            formname !== project_component_name &&
                            formname !== task_list_component_name &&
                            formname !== client_component_name &&
                            formname !== custom_status_form_component_name &&
                            formname !== holiday_component_name && 
                            showExportBtn && (
                              <button
                                type="button"
                                className="it-btn is-soft"
                                onClick={() => setIsExportCSV(true)}
                                data-testid={testId(tidModule, "export-button")}
                              >
                                <i className="ri-download-cloud-2-line"></i>
                                Export
                              </button>
                            )}{" "}
                          {isMultiDeleteButton && <div></div>}
                          {selectedGroupIds.length > 0 &&
                            (formname === leave_approval_component_name ||
                              formname ===
                                attendance_approval_component_name) && (
                              <div className="apv-bulk">
                                {showEditBtn && (
                                  <>
                                    <button
                                      type="button"
                                      className="apv-bulk-btn is-approve"
                                      id="bulk-approve-btn"
                                      data-testid={testId(tidModule, "bulk-approve-button")}
                                      onClick={() => handleBulkApproval()}
                                    >
                                      <i className="ri-check-double-line"></i>
                                      Approve
                                      <span className="apv-bulk-count">
                                        {selectedGroupIds.length}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      className="apv-bulk-btn is-reject"
                                      id="bulk-reject-btn"
                                      data-testid={testId(tidModule, "bulk-reject-button")}
                                      onClick={() => handleBulkReject()}
                                    >
                                      <i className="ri-close-line"></i>
                                      Reject
                                      <span className="apv-bulk-count">
                                        {selectedGroupIds.length}
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              )}

            <CardBody className="pt-0">
              <div>
                {(() => {
                  const showAllTab =
                    formname !== attendance_pending_table &&
                    formname !== leave_pending_table;
                  const tabs = [
                    ...(showAllTab
                      ? [{ value: 1, label: "All", count: tabledata?.length || 0, option: "all" }]
                      : []),
                    ...(filterOptions || []).map((obj, idx) => ({
                      value: String(idx + 2),
                      label: obj.label,
                      count: obj.count || 0,
                      option: obj.option,
                    })),
                  ];
                  if (!tabs.length) return null;
                  return (
                    <div className="it-tabs-row">
                      <div className="it-tabs" role="tablist">
                        {tabs.map((t) => {
                          const active = String(activeTab) === String(t.value);
                          return (
                            <button
                              key={t.value}
                              type="button"
                              role="tab"
                              aria-selected={active}
                              className={`it-tab tone-${tabToneOf(t.label)} ${active ? "is-active" : ""}`}
                              onClick={() => toggleTab(t.value, t.option)}
                              data-testid={testId(tidModule, "tab", t.label)}
                            >
                              <span className="it-tab-dot"></span>
                              {t.label}
                              <span className="it-tab-count">{t.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {(isLoading || loading) && !(dataList && dataList.length) ? (
                  <TableSkeleton />
                ) : (
                  // ✅ FIX: TableContainer (which renders the filter row, e.g.
                  // TaskListFilter) is now ALWAYS rendered, even when dataList
                  // is empty. Previously this whole block was swapped out for
                  // a plain "No Result Found" div whenever a filter produced
                  // zero matches — which made the filter selects themselves
                  // disappear the moment you picked a filter with no results.
                  // The empty-state message is now rendered *inside*
                  // TableContainer, below the filter row, via its `noResults`
                  // prop.
                  <TableContainer
                    columns={columnsForTable}
                    data={
                      dataList
                        ?.filter((obj) => {
                          return Object.entries(table_filter_keys || {}).every(
                            ([key, value]) => {
                              // ─────────────────────────────
                              // Skip Empty Filters
                              // ─────────────────────────────
                              if (
                                value === 0 ||
                                value === null ||
                                value === undefined ||
                                value === "" ||
                                (Array.isArray(value) && value.length === 0)
                              ) {
                                return true;
                              }

                              // ─────────────────────────────
                              // Multi Select Array Filter
                              // collaborator_id
                              // ─────────────────────────────
                              if (Array.isArray(value)) {
                                const taskValues =
                                  obj?.collaborators_id_list ||
                                  obj?.[key] ||
                                  [];

                                return value.some((id) =>
                                  taskValues
                                    .map((v) => Number(v))
                                    .includes(Number(id)),
                                );
                              }

                              // ─────────────────────────────
                              // Nested Object ID
                              // role_id → role.id
                              // ─────────────────────────────
                              if (key.endsWith("_id")) {
                                const objectKey = key.replace("_id", "");

                                if (
                                  obj?.[objectKey] &&
                                  typeof obj[objectKey] === "object" &&
                                  "id" in obj[objectKey]
                                ) {
                                  return (
                                    Number(obj[objectKey].id) === Number(value)
                                  );
                                }
                              }

                              // ─────────────────────────────
                              // Direct Compare
                              // ─────────────────────────────
                              return Number(obj?.[key]) === Number(value);
                            },
                          );
                        })

                        // ─────────────────────────────
                        // Year + Month Filter
                        // ─────────────────────────────
                        .filter((obj) => {
                          const selectedYear =
                            attendance_approval_table_filter_keys?.year;
                          const selectedMonth =
                            attendance_approval_table_filter_keys?.month;

                          // No year selected -> show all
                          if (!selectedYear) return true;

                          const holidayDate = dayjs(obj.date);

                          const yearMatch =
                            holidayDate.year().toString() === selectedYear;

                          const monthMatch =
                            selectedMonth === 0 ||
                            selectedMonth === undefined ||
                            selectedMonth === null ||
                            holidayDate.month() + 1 === selectedMonth;

                          return yearMatch && monthMatch;
                        })

                        // ─────────────────────────────
                        // Search Filter
                        // ─────────────────────────────
                        .filter((d) => rowMatchesSearch(d, search)) || []
                    }
                    isPagination={true}
                    isGlobalFilter={true}
                    formname={formname}
                    customPageSize={50}
                    divClass="table-responsive table-card"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted"
                    handleDataClick={handleDataClicks}
                    isDataFilter={true}
                    SearchPlaceholder="Search for data ID, customer, data status or something..."
                    showInfo={true}
                    serverPagination={serverPagination}
                  />
                )}
              </div>
              <Modal id="showModal" data-testid={testId(tidModule, "order-dialog")} isOpen={modal} toggle={toggle} centered>
                <ModalHeader className="bg-light p-3" toggle={toggle} close={<ModalCloseButton onClick={toggle} testId={testId(tidModule, "order-close-button")} />}>
                  {/* {!!isEdit ? "Edit Order" : "Add Order"} */}
                </ModalHeader>
                <Form
                  className="tablelist-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // validation.handleSubmit();
                    return false;
                  }}
                >
                  <ModalBody>
                    <input type="hidden" id="id-field" />

                    <div className="mb-3">
                      <Label htmlFor="id-field" className="form-label">
                        Order Id
                      </Label>
                      <Input
                        data-testid={testId(tidModule, "order-id-input")}
                        name="orderId"
                        id="id-field"
                        className="form-control"
                        placeholder="Enter Order Id"
                        type="text"
                      />
                    </div>

                    <div className="mb-3">
                      <Label
                        htmlFor="customername-field"
                        className="form-label"
                      >
                        Customer Name
                      </Label>
                      <Input
                        data-testid={testId(tidModule, "order-customer-input")}
                        name="customer"
                        id="customername-field"
                        className="form-control"
                        placeholder="Enter Name"
                        type="text"
                      />
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="productname-field" className="form-label">
                        Product
                      </Label>

                      <Input
                        data-testid={testId(tidModule, "order-product-select")}
                        name="product"
                        type="select"
                        className="form-select"
                        required
                      ></Input>
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="date-field" className="form-label">
                        Order Date
                      </Label>
                    </div>
                    <div className="row gy-4 mb-3">
                      <div className="col-md-6">
                        <div>
                          <Label htmlFor="amount-field" className="form-label">
                            Amount
                          </Label>
                          <Input data-testid={testId(tidModule, "order-amount-input")} name="amount" type="text" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <Label htmlFor="payment-field" className="form-label">
                            Payment Method
                          </Label>

                          <Input
                            data-testid={testId(tidModule, "order-payment-select")}
                            name="payment"
                            type="select"
                            className="form-select"
                          ></Input>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="delivered-status" className="form-label">
                        Delivery Status
                      </Label>

                      <Input
                        data-testid={testId(tidModule, "order-status-select")}
                        name="status"
                        type="select"
                        className="form-select"
                      ></Input>
                    </div>
                  </ModalBody>
                  <div className="modal-footer">
                    <div className="hstack gap-2 justify-content-end">
                      <button
                        data-testid={testId(tidModule, "order-footer-close-button")}
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          setModal(false);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </Form>
              </Modal>

              <Modal
                data-testid={testId(tidModule, "reassign-manager-dialog")}
                fade={true}
                isOpen={showRMModal}
                toggle={onRMModalCloseClick}
                centered={true}
              >
                <ModalBody className="py-2 px-3">
                  <div className="mt-2 text-center">
                    <div className="mt-4 pt-2 fs-15 mx-4">
                      <h4>Assign New Reporting Manager</h4>
                    </div>
                    <div className="mt-3 pt-1">
                      <p>
                        <b>{rmEmpName}</b> is The Reporting Manager For The
                        Following Employees
                      </p>
                    </div>
                    <div className="mt-3 pt-1">
                      {TeamsToBeUpdated &&
                        TeamsToBeUpdated.map((d) => {
                          return (
                            <React.Fragment>
                              <Row className="mt-2">
                                <Col lg={12} style={{ textAlign: "left" }}>
                                  <h5>{d?.name}</h5>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={6}>
                                  <Select
                                    testId={testId(tidModule, "reassign-manager", d?.name || d?.id, "select")}
                                    name={`rep_man_select_${d.id}`}
                                    id={`rep_man_id_${d.id}`}
                                    options={d.rep_man_options}
                                    components={{
                                      Option: EmployeeDisplayInSelect,
                                    }}
                                    value={
                                      d.rep_man_options.find(
                                        (e) =>
                                          e.id ===
                                          parseInt(d.new_reporting_manager_id),
                                      ) || []
                                    }
                                    onChange={(e) =>
                                      handleNewReportingManager(e, d?.id)
                                    }
                                    className="basic-multi-select"
                                  />
                                </Col>
                                <Col lg={6}>
                                  <h5>Employees</h5>
                                  {(d?.employee_details).map((m) => (
                                    <>
                                      <h6>{m?.name}</h6>
                                    </>
                                  ))}
                                </Col>
                              </Row>
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      data-testid={testId(tidModule, "reassign-manager-close-button")}
                      type="button"
                      className="btn w-sm btn-light"
                      data-bs-dismiss="modal"
                      onClick={() => setShowRMModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn w-sm btn-danger"
                      id="assign-record"
                      data-testid={testId(tidModule, "reassign-manager-assign-button")}
                      onClick={assignNewReportingManager}
                    >
                      Assign
                    </button>
                  </div>
                </ModalBody>
              </Modal>

              <Modal
                data-testid={testId(tidModule, "activate-dialog")}
                fade={true}
                isOpen={showActivateEmpModal}
                toggle={onActivateEmpModalClick}
                centered={true}
              >
                <ModalBody className="py-2 px-3">
                  <div className="mt-2 text-center">
                    <div className="mt-4 pt-2 fs-15 mx-4">
                      <h4>
                        Assign New Department & Reporting Manager For{" "}
                        <b>{activateEmpName}</b>
                      </h4>
                    </div>
                  </div>
                  <div className="mt-3 pt-1">
                    <React.Fragment>
                      <Row>
                        <Col lg={12}>
                          <div>
                            <Label
                              htmlFor="primary_department_id_list"
                              className="form-label"
                            >
                              Primary Department
                            </Label>
                            <Select
                              testId={testId(tidModule, "activate-primary-department")}
                              id="primary_department_id_list"
                              name="primary_department_id_list"
                              isMulti={true}
                              options={dep_options || []}
                              className="basic-multi-select"
                              closeMenuOnSelect={false}
                              placeholder={"Select Primary Department"}
                              value={
                                activateEmpObj?.primary_department_id_list
                                  ? dep_options.filter((d) =>
                                      (activateEmpObj?.primary_department_id_list).includes(
                                        d.id,
                                      ),
                                    )
                                  : []
                              }
                              onChange={handlePrimaryDepChange}
                            />
                          </div>
                        </Col>

                        <Col lg={12}>
                          <div>
                            <Label htmlFor="reporting_manager_id">
                              Reporting Manager
                            </Label>
                            <Select
                              testId={testId(tidModule, "activate-reporting-manager")}
                              id="reporting_manager_id"
                              name="reporting_manager_id"
                              isMulti={false}
                              isClearable={true} // Enable clearable feature
                              options={reportingManagerOptions || []}
                              components={{ Option: EmployeeDisplayInSelect }}
                              className="basic-multi-select"
                              value={
                                (activateEmpObj.reporting_manager_id &&
                                  reportingManagerOptions.find(
                                    (e) =>
                                      e.id ===
                                      activateEmpObj.reporting_manager_id,
                                  )) ||
                                null // Set value to null initially
                              }
                              onChange={(selectedOption) => {
                                if (selectedOption) {
                                  // Check if an option is selected
                                  setActivateEmpObj({
                                    ...activateEmpObj,
                                    reporting_manager_id: selectedOption.id,
                                  });
                                } else {
                                  // Clear selection if null (clear button clicked)
                                  setActivateEmpObj({
                                    ...activateEmpObj,
                                    reporting_manager_id: 0,
                                  });
                                }
                              }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </React.Fragment>
                  </div>

                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn w-sm btn-light"
                      data-testid={testId(tidModule, "activate-close-button")}
                      data-bs-dismiss="modal"
                      onClick={() => setShowActivateEmpModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn w-sm btn-danger"
                      id="assign-record"
                      data-testid={testId(tidModule, "activate-assign-button")}
                      onClick={ActivateEmployeeAPI}
                    >
                      Assign
                    </button>
                  </div>
                </ModalBody>
              </Modal>
              <ReorderStatusModal
                isOpen={showReorderModal}
                onClose={() => setShowReorderModal(false)}
                items={reorderList}
                onChange={setReorderList}
                onSave={handleSaveReorder}
                tidModule={tidModule}
              />
            </CardBody>
          </Card>
        </Container>
      </div>
    </Col>
  );
};

export default InfoTable;
