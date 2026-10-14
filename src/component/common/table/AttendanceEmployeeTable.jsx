import React, { Fragment, useEffect, useRef, useState } from "react";
import { IconButton, Dropdown, Whisper, Popover, ButtonToolbar } from "rsuite";
import { Table } from "../../../shared/ui/table/RsuiteCompatTable";
import AlignJustifyIcon from "@rsuite/icons/legacy/AlignJustify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  AllMinuteOptions,
  hourOptions,
  hr_status_options,
  leave_application_component_name,
} from "../../../common/constant/Constants";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import SimpleBar from "simplebar-react";
import NotesModal from "../modal/NotesModal";
import { useDispatch, useSelector } from "react-redux";
import { ConvertSecondsToTime } from "../../../common/js/ConvertSecondsToTime";
import { ParseTime } from "../../../common/js/ParseTime";
import Select from "../../../shared/ui/TestableSelect";
import { ToastContainer, toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import {
  requestAttendanceRefresh,
  updateIndividualAttendanceReportData,
} from "../../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { differenceInMinutes } from "date-fns";
import { setFormObj } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLeaveTypeForCurrentEmployee } from "../../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { set } from "lodash";
import { setEmployeeLeaveType } from "../../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import {
  late_entry_display,
  on_time_entry_display,
  earlyin_display,
  earlyout_display,
  not_applicable,
} from "../../../common/constant/Constants";
import DistanceCalculaterInMap from "../../../pages/attendance/DistanceCalculaterInMap";
import AllDistanceCalculater from "../../../pages/attendance/AllDistanceCalculater";
import WebCheckInOut from "./../timer/WebCheckInOut";
import CustomStatusTimeline from "./CustomStatusTimeLine";
// NOTE: adjust this path to wherever ApplyLeaveForm.jsx lives in your project
import ApplyLeaveForm from "../../forms/ApplyLeaveForm";
import { EDIT_TEAM_ATTENDANCE_ACCESS_KEY } from "../../../common/constant/RoleConstants";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";
import { testId, itemTestKey } from "../../../shared/testing/testId";

// ------------------------------------------------------------
// Device type -> icon + label helper (used in the IN/OUT
// timeline modal to show what device a check-in/out came from,
// based on entry_log[i].meta.device_type).
// ------------------------------------------------------------
const getDeviceIcon = (punchedBy) => {
  const type = Number(punchedBy);

  if (type === 1) {
    return {
      icon: "mdi-monitor",
      label: "Desktop",
    };
  }

  if (type === 2) {
    return {
      icon: "mdi-cellphone",
      label: "Mobile",
    };
  }

  return {
    icon: "mdi-help-circle-outline",
    label: "Unknown",
  };
};

const AttendanceEmployeeTable = () => {
  const dispatch = useDispatch();

  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);
  const employee_data = GetLocalStorageData("employee") || [];
  console.log("EMP DATA", employee_data);

  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const [notes_modal, setNotes_modal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leave_modal, setLeave_modal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [leaveDate, setLeaveDate] = useState(null);
  const [attendanceEditData, setAttendanceEditData] = useState(null);
  const [hrStatus, setHrStatus] = useState(0);
  const [notesLength, setNotesLength] = useState(0);
  const [date, setDate] = useState(null);

  const [notesUpdateObj, setNotesUpdateObj] = useState(null);
  const [notesList, setNotesList] = useState([]);

  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [locationType, setLocationType] = useState("");
  const [allLocationData, setAllLocationData] = useState([]);

  const containerRef = useRef(null);
  // Fixed table height -> header stays fixed, only body rows scroll.
  const [tableHeight, setTableHeight] = useState(500);

  useEffect(() => {
    const updateHeight = () => {
      // 280 = space used by page header, filters, table toolbar, paddings.
      // Tune this number to fit your layout.
      setTableHeight(Math.max(300, window.innerHeight - 280));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  console.log("timeline", timelineList);


  const { individual_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer,
  );

  // Used to auto-close the Apply Leave modal once ApplyLeaveForm submits
  // successfully (the form dispatches add/editLeaveApplication on success).
  const { leave_application_data } = useSelector(
    (state) => state.LeaveApplyReducer,
  );
  const leaveSnapshotRef = useRef(leave_application_data);

  // ApplyLeaveForm reads its leave types from LeaveTypeReducer
  // (leave_type_for_current_employee), which is empty on this page.
  // The attendance page already has the leave types + balances in
  // EmployeeLeaveReducer, so map them into the shape the form expects:
  // { leave_type: {id, name, unit, ...}, available_count }
  const { employee_leave_data } = useSelector(
    (state) => state.EmployeeLeaveReducer,
  );

  const buildLeaveTypeRecords = () =>
    (employee_leave_data || []).map((item) =>
      item?.leave_type
        ? item
        : {
            leave_type: {
              ...item,
              id: item.id,
              name: item.name || item.label,
              unit: item.unit,
            },
            available_count:
              item.balance_leave_count ?? item.available_count ?? 0,
          },
    );

  useEffect(() => {
    if (leave_modal && leave_application_data !== leaveSnapshotRef.current) {
      closeLeaveModal();
    }
  }, [leave_application_data, leave_modal]);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const employeeData = GetLocalStorageData("employee") || [];

  const employeeInformation =
    Array.isArray(individual_attendance_report_data) &&
    individual_attendance_report_data.length > 0
      ? employeeData.find(
          (e) => e.id === individual_attendance_report_data[0].employee_id,
        )
      : // : [];
        null;
  const employeeWorkSchedule =
    workScheduleData.find(
      // (w) => w.id === employeeInformation.work_schedule_id,
      (w) => w.id === employeeInformation?.work_schedule_id,
    ) || [];

  const profile_data_lc = JSON.parse(
    localStorage.getItem("lint_hr_profile_data") || "{}",
  );
  const isOwnAttendance = employeeInformation?.id === profile_data_lc?.id;
  const canEditTeamAttendance =
    profile_data_lc?.permission_list?.includes(
      EDIT_TEAM_ATTENDANCE_ACCESS_KEY,
    ) || false;

  function open_timeline(rowData) {
    settimeline_modal(!timeline_modal);
    setAllLocationData(rowData);
  }

  function open_location(rowData, dataKey) {
    setLocationModal(!locationModal);
    setAllLocationData(rowData);
    setLocationType(dataKey);
  }

  const close_location = () => {
    setLocationModal(false);
  };

  const open_image_preview = (url) => {
    setPreviewImageUrl(url);
    setImagePreviewModal(true);
  };

  const close_image_preview = () => {
    setImagePreviewModal(false);
    setPreviewImageUrl("");
  };

  const close_timeLine = () => {
    settimeline_modal(false);
  };

  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  const closeLeaveModal = () => {
    setLeave_modal(false);
  };

  const [initialObj, setInitialObj] = useState(0);

  const closeEditModal = () => {
    setAttendanceEditData(null);
    setEditModalOpen(false);
  };

  const DateCell = ({ rowData, dataKey, ...props }) => {
    console.log("data", rowData);

    const warning_icon =
      rowData?.total_no_of_check_in !== rowData?.total_no_of_check_out ? (
        <i className="ri-error-warning-line text-warning fs-5"></i>
      ) : null;

    return (
      <Cell {...props} className="fw-bold">
        <div
          style={{
            display: "flex",
            flexDirection: "column", // Stack date and day vertically
            alignItems: "center", // Center horizontally
            justifyContent: "center", // Center vertically if row height is bigger
            height: "100%", // Ensure full cell height for vertical centering
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>{format(new Date(rowData.date), "dd MMM, yyyy")}</div>
            <span style={{ marginLeft: "5px" }}>{warning_icon}</span>
          </div>
          <div
            style={{ fontSize: "12px", color: "#666", fontWeight: "normal" }}
          >
            {rowData.day}
          </div>
        </div>
      </Cell>
    );
  };

  const InOutCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      let in_time = rowData?.first_check_in
        ? format(ParseTime(rowData?.first_check_in), "h:mm a")
        : null;
      let out_time = rowData?.last_check_out
        ? format(ParseTime(rowData?.last_check_out), "h:mm a")
        : null;
      let thisCellTime = dataKey === "in" ? in_time : out_time;

      return (
        <Cell {...props} className="link-group">
          {!!thisCellTime && thisCellTime}
          {!!thisCellTime && (
            <Link
              data-testid="attendance-employee-in-link"
              className="link-opacity-75 ms-1"
              href="#"
              onClick={() => {
                setTimelineList(rowData?.entry_log);
                setTimeLineDate(
                  format(new Date(rowData?.date), "dd MMM, yyyy"),
                );
                open_timeline(rowData);
              }}
            >
              +
              {dataKey == "in"
                ? rowData?.total_no_of_check_in
                : rowData?.total_no_of_check_out}
            </Link>
          )}
        </Cell>
      );
    }
  };

  const LocationCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      let in_location = rowData?.first_check_in_location || "";
      let out_location = rowData?.last_check_out_location || "";
      let location_text = dataKey === "in" ? in_location : out_location;
      let latitudeData =
        dataKey === "in"
          ? rowData.first_check_in_latitude
          : rowData.last_check_out_latitude;

      let CheckInOutType =
        rowData?.entry_log !== null
          ? dataKey === "in"
            ? rowData?.entry_log[0]?.punched_by || 0
            : rowData?.entry_log.filter((e) => e.entry_type === 2).slice(-1)[0]
                ?.punched_by || 0
          : 0;

      let branch_text =
        rowData?.entry_log !== null
          ? dataKey === "in"
            ? CheckInOutType === 1
              ? "Web Check In"
              : CheckInOutType === 2
                ? "Mobile Check In"
                : ""
            : CheckInOutType === 1
              ? "Web Check Out"
              : CheckInOutType === 2
                ? "Mobile Check Out"
                : ""
          : "";

      return (
        <Cell {...props} className="link-group">
          {location_text !== "" && (
            <>
              {latitudeData === null ? (
                <div style={{ color: "dimgrey" }}>
                  {CheckInOutType === 1 ? (
                    <i className="mdi mdi-laptop"></i>
                  ) : (
                    <i className="mdi mdi-cellphone"></i>
                  )}{" "}
                  {branch_text}
                </div>
              ) : (
                <Link
                  href="#"
                  data-testid={testId("attendance-employee-row", rowData?.date, dataKey, "location-link")}
                  onClick={() => {
                    open_location(rowData, dataKey);
                  }}
                >
                  <i className="mdi mdi-map-marker-outline"></i> {location_text}
                </Link>
              )}
            </>
          )}
        </Cell>
      );
    }
  };

  const WorkScheduleCell = ({ rowData, dataKey, ...props }) => {
    const employeeLeaveData = useSelector(
      (state) => state.EmployeeLeaveReducer.employee_leave_data,
    );

    // Find matching leave type
    const leaveType = employeeLeaveData.find(
      (item) => item.id === rowData?.leave_type_id,
    );
    return (
      <Cell {...props} className="link-group">
        {rowData.is_leave_approved === true ? (
          <span style={{ color: "red" }}>
            {leaveType ? leaveType.name : "Leave"}
          </span>
        ) : rowData.is_holiday === true ? (
          <span style={{ color: "green" }}>Holiday</span>
        ) : rowData.is_week_off === true ? (
          <span style={{ color: "blue" }}>Week Off</span>
        ) : rowData.is_present === false ? (
          <span style={{ color: "red" }}>Absent</span>
        ) : (
          ConvertSecondsToTime(rowData?.maximum_full_day_work_duration)
        )}
      </Cell>
    );
  };

  const BreakHourCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      let break_schedule_hr = ConvertSecondsToTime(
        rowData.total_break_duration,
      );

      return (
        <Cell {...props} className="link-group">
          {break_schedule_hr}
        </Cell>
      );
    }
  };

  const SecondsToTimeCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      return (
        <Cell {...props} className="link-group">
          {` ${ConvertSecondsToTime(rowData[dataKey])}`}
        </Cell>
      );
    }
  };

  const HrStatusCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      let at_hr_status_data = hr_status_options.find(function (i) {
        return i.id == rowData.hr_status;
      });

      let class_name = at_hr_status_data?.class || "";
      let label = at_hr_status_data?.label || "";

      return (
        <Cell
          {...props}
          className="link-group"
          style={{ textOverflow: "unset" }}
        >
          <span className={`badge bg-${class_name}-subtle text-${class_name}`}>
            <b className="fs-7"> {label}</b>
          </span>
        </Cell>
      );
    }
  };

  const ActivityCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      let entry_status;
      if (rowData.day_status === null) {
        entry_status = not_applicable;
        return (
          <Cell {...props} className="link-group">
            <i
              className={`mdi mdi-circle fs-10 align-middle text-${entry_status?.class} me-1 ms-2`}
            ></i>
            <span className="fs-12 mb-0 text-muted">
              {entry_status?.text || ""}
            </span>
          </Cell>
        );
      } else {
        entry_status =
          rowData.day_status.early_in === true
            ? earlyin_display
            : rowData.day_status.ontime === true
              ? on_time_entry_display
              : rowData.day_status?.late === true
                ? late_entry_display
                : rowData.day_status?.early_out === true
                  ? earlyout_display
                  : not_applicable;
        return (
          <Cell {...props} className="link-group">
            <i
              className={`mdi mdi-circle fs-10 align-middle text-${entry_status?.class} me-1 ms-2`}
            ></i>
            <span className="fs-12 mb-0 text-muted">
              {entry_status?.text || ""}
            </span>
          </Cell>
        );
      }
    }
  };

  const NotesCell = ({ rowData, dataKey, ...props }) => {
    if (rowData.is_present === false) {
      return (
        <Cell {...props} className="link-group">
          {null}
        </Cell>
      );
    } else {
      return (
        <Cell {...props} className="link-group">
          <Link
            data-testid="attendance-employee-notes-link"
            className="link-opacity-75 ms-1"
            href="#"
            onClick={() => viewNotes(rowData)}
          >
            {rowData.notes.length} Notes
          </Link>
        </Cell>
      );
    }
  };

  const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
    const dropdownItems = [
      ...(isOwnAttendance || canEditTeamAttendance
        ? [
            {
              label: "Edit Attendance",
              icon: <i className="ri-pencil-line"></i>,
              onClick: () => editAttendanceReport(rowData),
            },
          ]
        : []),
      {
        label: "Apply Leave",
        icon: <i className="ri-check-line"></i>,
        onClick: () => applyLeave(rowData),
      },
    ];
    let dropdownMenu;
    if (
      rowData.leave_taken_without_approval === true &&
      rowData.is_leave_pending === false
    ) {
      dropdownMenu = (
        <Popover style={{ padding: "3px" }}>
          <Dropdown.Menu>
            {dropdownItems.map((item, index) => (
              <Dropdown.Item
                key={index}
                onClick={item.onClick}
                style={{ padding: "8px" }}
              >
                {item.icon} {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Popover>
      );
    } else {
      const firstItemInDropdown = dropdownItems[0];
      dropdownMenu = (
        <Popover style={{ padding: "3px" }}>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={firstItemInDropdown.onClick}
              style={{ padding: "8px" }}
            >
              {firstItemInDropdown.icon} {firstItemInDropdown.label}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Popover>
      );
    }

    if (
      rowData.is_holiday === true ||
      (rowData.is_week_off === true && rowData.is_present === false)
    ) {
      return (
        <Cell
          {...props}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span>-</span>
        </Cell>
      );
    } else {
      if (
        rowData?.status === false &&
        (rowData?.hr_status === 1 || rowData?.hr_status === 3)
      ) {
        return (
          <Cell
            {...props}
            className="link-group"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="rsuite-table-dropdown">
              <Whisper
                placement="autoEnd"
                trigger="click"
                speaker={dropdownMenu}
              >
                <ButtonToolbar>
                  <IconButton
                    data-testid="attendance-employee-more-button"
                    appearance="subtle"
                    icon={
                      <span className="text-primary d-inline-block edit-item-btn fs-16">
                        <i className="mdi mdi-dots-horizontal"></i>
                      </span>
                    }
                  />
                </ButtonToolbar>
              </Whisper>
            </div>
          </Cell>
        );
      } else {
        return (
          <Cell
            {...props}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span>-</span>
          </Cell>
        );
      }
    }
  };

  const EditHourChange = (selectedHour, selectedMinute, name) => {
    const newDuration =
      parseInt(selectedHour) * 3600 + parseInt(selectedMinute) * 60;

    let new_obj = {
      ...attendanceEditData,
      [name]: newDuration,
    };

    CalculateTotaPaidHours(new_obj);
  };

  const CalculateTotaPaidHours = (obj) => {
    let paid_hr = parseInt(obj.final_checked_in_hr_in_seconds);
    let ot_hr = parseInt(obj.final_ot_hr_in_seconds);

    let total_paid_hr = paid_hr + ot_hr;

    let final_obj = {
      ...attendanceEditData,
      final_checked_in_hr_in_seconds: paid_hr,
      final_ot_hr_in_seconds: ot_hr,
      final_paid_hr_in_seconds: total_paid_hr,
    };

    setAttendanceEditData(final_obj);

    isValueChanged(final_obj);
  };

  const handleNotesChange = (e) => {
    let final_obj = {
      ...attendanceEditData,
      notes: e.target.value,
    };

    setAttendanceEditData(final_obj);

    isValueChanged(final_obj);
  };

  const isValueChanged = (new_obj) => {
    let initialHr = !!initialObj?.final_paid_hr_in_seconds
      ? Math.floor(initialObj?.final_paid_hr_in_seconds / 3600)
      : 0;
    let initialMin = !!initialObj?.final_paid_hr_in_seconds
      ? Math.floor((initialObj?.final_paid_hr_in_seconds % 3600) / 60)
      : 0;

    let initialNotes = !!initialObj?.notes ? !!initialObj?.notes : "";

    let newHr = Math.floor(new_obj?.final_paid_hr_in_seconds / 3600);
    let newMin = Math.floor((new_obj?.final_paid_hr_in_seconds % 3600) / 60);
    let newNotes = new_obj?.notes;

    if (
      initialHr === newHr &&
      initialMin === newMin &&
      initialNotes === newNotes
    ) {
      setShowSaveBtn(false);
    } else if (initialNotes !== newNotes && newNotes.trim().length === 0) {
      setShowSaveBtn(false);
    } else {
      setShowSaveBtn(true);
    }
  };

  //Edit Modal Function
  const editAttendanceReport = (rowData) => {
    if (!isOwnAttendance && !canEditTeamAttendance) {
      toast.error("You don't have permission to edit this attendance");
      return;
    }

    let initial_obj = {
      id: rowData?.id,
      date: rowData?.date,
      work_schedule_duration_without_break:
        rowData?.maximum_full_day_work_duration,
      total_work_duration: rowData?.final_checked_in_hr_in_seconds,
      final_checked_in_hr_in_seconds: rowData?.final_checked_in_hr_in_seconds,
      final_ot_hr_in_seconds: rowData?.final_ot_hr_in_seconds,
      final_paid_hr_in_seconds: rowData?.final_paid_hr_in_seconds,
      old_checked_in_hr_in_seconds: rowData?.final_checked_in_hr_in_seconds,
      old_ot_hr_in_seconds: rowData?.final_ot_hr_in_seconds,
      old_paid_hr_in_seconds: rowData?.final_paid_hr_in_seconds,
      notes: "",
    };

    setInitialObj(initial_obj);

    setAttendanceEditData(initial_obj);

    setShowSaveBtn(false);

    setEditModalOpen(true);
  };

  // Apply Leave: seed ApplyLeaveForm through the shared form_obj
  // (same contract the right-sidebar flow uses), then show it in a modal.
  const applyLeave = (rowData) => {
    const initialLeaveObj = {
      id: 0,
      leave_type_id: 0,
      reason: "",
      start: rowData?.date,
      end: rowData?.date,
      requested_leave_count: 1,
      status: 1,
      day_type: 1,
      in_between_dates: [rowData?.date],
      employee_id: rowData?.employee_id,
    };

    // Populate the form's leave type dropdown before the modal mounts
    if (Array.isArray(employee_leave_data) && employee_leave_data.length > 0) {
      dispatch(setLeaveTypeForCurrentEmployee(buildLeaveTypeRecords()));
    }
    dispatch(setFormObj(initialLeaveObj));
    leaveSnapshotRef.current = leave_application_data;
    setLeaveDate(rowData?.date);
    setLeave_modal(true);
  };

  const updateAttendance = async () => {
    dispatch(setLoaderVisible(true));
    if (attendanceEditData.final_paid_hr_in_seconds === 0) {
      toast.error("Final Paid Hour Can't be zero");
    } else {
      const Api = await PostApi("/attendance/edit/", attendanceEditData, false);

      if (Api.status && Api.status === 200) {
        setEditModalOpen(false);
        dispatch(updateIndividualAttendanceReportData(Api?.data?.data));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    }

    dispatch(setLoaderVisible(false));
  };

  const viewNotes = (rowData) => {
    let initial_obj = {
      id: rowData?.id,
      final_checked_in_hr_in_seconds: rowData?.final_checked_in_hr_in_seconds,
      final_ot_hr_in_seconds: rowData?.final_ot_hr_in_seconds,
      final_paid_hr_in_seconds: rowData?.final_paid_hr_in_seconds,
      notes: "",
    };
    setNotesUpdateObj(initial_obj);

    setNotesList(rowData?.notes);
    setHrStatus(rowData?.hr_status);
    setNotesLength(rowData?.entry_log.length);
    setDate(rowData?.date);
    setNotes_modal(true);
  };

  const updateNotes = async () => {
    dispatch(setLoaderVisible(true));

    const Api = await PostApi(
      "/attendance/update-notes/",
      notesUpdateObj,
      false,
    );

    if (Api.status && Api.status === 200) {
      setNotes_modal(false);
      dispatch(updateIndividualAttendanceReportData(Api?.data?.data));
      toast.success(Api?.data?.message);
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    dispatch(setLoaderVisible(false));
  };

  return (
    <Fragment>
      {/* Table */}
      <div ref={containerRef} style={{ width: "100%" }}>
        <Table
          variant="app"
          columnMenu
          storageKey="attendance_employee"
          onRefresh={() => dispatch(requestAttendanceRefresh())}
          height={tableHeight}
          data={individual_attendance_report_data || []}
          loading={loading}
          bordered
          rowHeight={60}
          headerHeight={40}
          className="mb-5"
        >
          <Column width={140} fixed="left" align="center" enableHiding={false}>
            <HeaderCell>Date</HeaderCell>
            <DateCell />
          </Column>

          <Column flexGrow={1} minWidth={110}>
            <HeaderCell>IN</HeaderCell>
            <InOutCell dataKey="in" />
          </Column>

          <Column flexGrow={1.5} minWidth={140} defaultHidden>
            <HeaderCell>IN Location</HeaderCell>
            <LocationCell dataKey="in" />
          </Column>

          <Column flexGrow={1} minWidth={110}>
            <HeaderCell>OUT</HeaderCell>
            <InOutCell dataKey="out" />
          </Column>

          <Column flexGrow={1.5} minWidth={140} defaultHidden>
            <HeaderCell>OUT Location</HeaderCell>
            <LocationCell dataKey="out" />
          </Column>

          <Column flexGrow={1} minWidth={110} defaultHidden>
            <HeaderCell>Work Schedule</HeaderCell>
            <WorkScheduleCell dataKey="ws" />
          </Column>

          <Column flexGrow={1} minWidth={90}>
            <HeaderCell>Break</HeaderCell>
            <BreakHourCell dataKey="total_break_duration" />
          </Column>

          <Column flexGrow={1} minWidth={90}>
            <HeaderCell>Total IN</HeaderCell>
            <SecondsToTimeCell dataKey="final_checked_in_hr_in_seconds" />
          </Column>

          {employeeWorkSchedule?.has_ot && (
            <Column flexGrow={1} minWidth={90}>
              <HeaderCell>OT</HeaderCell>
              <SecondsToTimeCell dataKey="final_ot_hr_in_seconds" />
            </Column>
          )}

          <Column flexGrow={1} minWidth={90}>
            <HeaderCell>Paid Hr</HeaderCell>
            <SecondsToTimeCell dataKey="final_paid_hr_in_seconds" />
          </Column>

          <Column flexGrow={1} minWidth={100}>
            <HeaderCell>Status</HeaderCell>
            <HrStatusCell dataKey="hr_status" />
          </Column>

          <Column flexGrow={1} minWidth={100} defaultHidden>
            <HeaderCell>Activity</HeaderCell>
            <ActivityCell />
          </Column>

          <Column flexGrow={1.2} minWidth={140} align="center" defaultHidden>
            <HeaderCell>Activity Status</HeaderCell>
            <CustomStatusTimeline dataKey="custom_status_timeline" />
          </Column>

          <Column flexGrow={1} minWidth={110} defaultHidden>
            <HeaderCell>Notes</HeaderCell>
            <NotesCell dataKey="notes" />
          </Column>

          <Column width={80} fixed="right" enableHiding={false}>
            <HeaderCell>Action</HeaderCell>
            <EditableCell />
          </Column>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal
        data-testid="attendance-employee-edit-attendance-dialog"
        isOpen={editModalOpen}
        toggle={closeEditModal}
        centered
        className="aem-modal"
      >
        <ModalHeader close={<ModalCloseButton onClick={closeEditModal} testId="attendance-employee-edit-attendance-close-button" />} toggle={closeEditModal}>
          <span className="aem-head">
            <span className="aem-head-icon">
              <i className="ri-time-line" />
            </span>
            <span>
              <span className="aem-head-title">Edit Attendance</span>
              {!!attendanceEditData && (
                <span className="aem-head-date">
                  <i className="ri-calendar-2-line" />
                  {format(new Date(attendanceEditData.date), "EEEE, dd MMM yyyy")}
                </span>
              )}
            </span>
          </span>
        </ModalHeader>

        {!!attendanceEditData && (
          <>
            <ModalBody>
              <div className="aem-stats">
                <div className="aem-stat is-primary">
                  <div className="aem-stat-top">
                    <span className="aem-stat-icon"><i className="ri-briefcase-4-line" /></span>
                    <span className="aem-stat-label">Schedule</span>
                  </div>
                  <div>
                    <div className="aem-stat-value">
                      {ConvertSecondsToTime(
                        attendanceEditData?.work_schedule_duration_without_break,
                      )}
                    </div>
                  </div>
                </div>
                <div className="aem-stat is-info">
                  <div className="aem-stat-top">
                    <span className="aem-stat-icon"><i className="ri-login-circle-line" /></span>
                    <span className="aem-stat-label">Total In</span>
                  </div>
                  <div>
                    <div className="aem-stat-value">
                      {ConvertSecondsToTime(attendanceEditData.total_work_duration)}
                    </div>
                  </div>
                </div>
                <div className="aem-stat is-success">
                  <div className="aem-stat-top">
                    <span className="aem-stat-icon"><i className="ri-money-dollar-circle-line" /></span>
                    <span className="aem-stat-label">Paid Hours</span>
                  </div>
                  <div>
                    <div className="aem-stat-value">
                      {ConvertSecondsToTime(
                        attendanceEditData?.final_paid_hr_in_seconds,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="aem-section-title">
                <i className="ri-edit-2-line" /> Adjust hours
              </div>

              <div className="aem-field">
                <label className="aem-label">Checked In Hours</label>
                <div className="aem-time">
                  <div className="aem-time-part">
                    <Select
                      testId="attendance-employee-edit-attendance-paid-hours-hr"
                      id="paid_hours_hr"
                      name="paid_hours_hr"
                      placeholder={"00"}
                      classNamePrefix="aem-rs"
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
                      options={hourOptions || []}
                      value={hourOptions.find(
                        (option) =>
                          option.value ===
                          String(
                            Math.floor(
                              attendanceEditData.final_checked_in_hr_in_seconds /
                                3600,
                            ),
                          ).padStart(2, "0"),
                      )}
                      onChange={(selectedOption) => {
                        EditHourChange(
                          selectedOption.value,
                          Math.floor(
                            (attendanceEditData.final_checked_in_hr_in_seconds %
                              3600) /
                              60,
                          ),
                          "final_checked_in_hr_in_seconds",
                        );
                      }}
                    />
                    <span className="aem-time-unit">hrs</span>
                  </div>
                  <span className="aem-time-sep">:</span>
                  <div className="aem-time-part">
                    <Select
                      testId="attendance-employee-edit-attendance-paid-hours-min"
                      id="paid_hours_min"
                      name="paid_hours_min"
                      placeholder={"00"}
                      classNamePrefix="aem-rs"
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
                      options={AllMinuteOptions || []}
                      value={AllMinuteOptions.find(
                        (option) =>
                          option.value ===
                          String(
                            Math.floor(
                              (attendanceEditData.final_checked_in_hr_in_seconds %
                                3600) /
                                60,
                            ),
                          ).padStart(2, "0"),
                      )}
                      onChange={(selectedOption) => {
                        EditHourChange(
                          Math.floor(
                            attendanceEditData.final_checked_in_hr_in_seconds /
                              3600,
                          ),
                          selectedOption.value,
                          "final_checked_in_hr_in_seconds",
                        );
                      }}
                    />
                    <span className="aem-time-unit">min</span>
                  </div>
                  <span className="aem-time-total">
                    <i className="ri-timer-line" />
                    {Math.floor((attendanceEditData.final_checked_in_hr_in_seconds || 0) / 3600)}h{" "}
                    {String(
                      Math.floor(((attendanceEditData.final_checked_in_hr_in_seconds || 0) % 3600) / 60),
                    ).padStart(2, "0")}m
                  </span>
                </div>
              </div>

              {employeeWorkSchedule.has_ot === true && (
                <div className="aem-field">
                  <label className="aem-label">Overtime</label>
                  <div className="aem-time">
                    <div className="aem-time-part">
                      <Select
                        testId="attendance-employee-edit-attendance-ot-hr"
                        id="ot_hr"
                        name="ot_hr"
                        placeholder={"00"}
                        classNamePrefix="aem-rs"
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
                        options={hourOptions || []}
                        value={hourOptions.find(
                          (option) =>
                            option.value ===
                            String(
                              Math.floor(
                                attendanceEditData.final_ot_hr_in_seconds / 3600,
                              ),
                            ).padStart(2, "0"),
                        )}
                        onChange={(selectedOption) =>
                          EditHourChange(
                            selectedOption.value,
                            Math.floor(
                              (attendanceEditData.final_ot_hr_in_seconds % 3600) /
                                60,
                            ),
                            "final_ot_hr_in_seconds",
                          )
                        }
                      />
                      <span className="aem-time-unit">hrs</span>
                    </div>
                    <span className="aem-time-sep">:</span>
                    <div className="aem-time-part">
                      <Select
                        testId="attendance-employee-edit-attendance-ot-min"
                        id="ot_min"
                        name="ot_min"
                        placeholder={"00"}
                        classNamePrefix="aem-rs"
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
                        options={AllMinuteOptions || []}
                        value={AllMinuteOptions.find(
                          (option) =>
                            option.value ===
                            String(
                              Math.floor(
                                (attendanceEditData.final_ot_hr_in_seconds %
                                  3600) /
                                  60,
                              ),
                            ).padStart(2, "0"),
                        )}
                        onChange={(selectedOption) =>
                          EditHourChange(
                            Math.floor(
                              attendanceEditData.final_ot_hr_in_seconds / 3600,
                            ),
                            selectedOption.value,
                            "final_ot_hr_in_seconds",
                          )
                        }
                      />
                      <span className="aem-time-unit">min</span>
                    </div>
                    <span className="aem-time-total is-ot">
                      <i className="ri-flashlight-line" />
                      {Math.floor((attendanceEditData.final_ot_hr_in_seconds || 0) / 3600)}h{" "}
                      {String(
                        Math.floor(((attendanceEditData.final_ot_hr_in_seconds || 0) % 3600) / 60),
                      ).padStart(2, "0")}m
                    </span>
                  </div>
                </div>
              )}

              <div className="aem-field mb-0">
                <label className="aem-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  data-testid="attendance-employee-edit-attendance-notes-textarea"
                  className="form-control aem-notes"
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Add a note about this change…"
                  value={attendanceEditData?.notes || ""}
                  onChange={(e) => handleNotesChange(e)}
                />
              </div>
            </ModalBody>

            <ModalFooter className="aem-foot">
              {!showSaveBtn && (
                <span className="aem-foot-hint">
                  <i className="ri-information-line" />
                  Change hours or notes to save
                </span>
              )}
              <button
                data-testid="attendance-employee-edit-attendance-footer-close-button"
                type="button"
                className="btn aem-btn-close"
                onClick={closeEditModal}
              >
                Close
              </button>
              {showSaveBtn && (
                <button
                  data-testid="attendance-employee-edit-attendance-save-changes-button"
                  type="button"
                  className="btn aem-btn-save"
                  onClick={updateAttendance}
                >
                  <i className="ri-check-double-line" />
                  Save Changes
                </button>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>
      <style>{`
        .aem-modal .modal-header{padding:16px 20px}
        .aem-modal .modal-header .modal-title{flex:1;min-width:0}
        .aem-modal .modal-header .modal-title::before{display:none}
        .aem-head{display:flex;align-items:center;gap:12px}
        .aem-head-icon{width:42px;height:42px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:20px;color:#fff;
          background:linear-gradient(135deg,var(--vz-primary),var(--vz-info));box-shadow:0 8px 18px -8px rgba(var(--vz-primary-rgb),.8)}
        .aem-head-title{display:block;font-size:1.02rem;font-weight:600;color:var(--vz-heading-color);line-height:1.2}
        .aem-head-date{display:inline-flex;align-items:center;gap:5px;margin-top:3px;font-size:.78rem;font-weight:500;color:var(--vz-secondary-color)}

        .aem-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:20px}
        @media (max-width:480px){.aem-stats{grid-template-columns:1fr}}
        .aem-stat{--t:var(--vz-primary-rgb);position:relative;overflow:hidden;display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:14px;
          border:1px solid rgba(var(--t),.2);background:linear-gradient(160deg,rgba(var(--t),.1),rgba(var(--t),.02) 70%)}
        .aem-stat::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:rgb(var(--t));opacity:.8}
        .aem-stat.is-info{--t:var(--vz-info-rgb)}
        .aem-stat.is-success{--t:var(--vz-success-rgb)}
        .aem-stat-top{display:flex;align-items:center;gap:8px;min-width:0}
        .aem-stat-icon{width:28px;height:28px;flex-shrink:0;border-radius:8px;display:grid;place-items:center;font-size:15px;color:rgb(var(--t));background:rgba(var(--t),.15)}
        .aem-stat-label{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--vz-secondary-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aem-stat-value{font-size:1.15rem;font-weight:700;line-height:1.1;color:var(--vz-heading-color);font-variant-numeric:tabular-nums;white-space:nowrap}

        .aem-section-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--vz-heading-color)}
        .aem-section-title i{color:var(--vz-primary);font-size:14px}
        .aem-section-title::after{content:"";flex:1;height:1px;background:var(--vz-border-color)}

        .aem-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
        .aem-label{margin:0;font-size:.8rem;font-weight:600;color:var(--vz-heading-color)}
        .aem-time{display:flex;align-items:center;gap:4px;padding:4px;border-radius:14px;border:1px solid var(--vz-border-color);
          background:var(--vz-tertiary-bg);transition:border-color .15s,box-shadow .15s}
        .aem-time:focus-within{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .aem-time-part{position:relative;flex:1;max-width:150px}
        .aem-time-unit{position:absolute;right:34px;top:50%;transform:translateY(-50%);font-size:.72rem;font-weight:500;color:var(--vz-secondary-color);pointer-events:none}
        .aem-time-sep{font-size:1.2rem;font-weight:700;color:var(--vz-primary);padding:0 2px}
        .aem-time .aem-rs__control{min-height:40px;border-radius:10px;border:0;background:var(--vz-secondary-bg);box-shadow:0 1px 2px rgba(15,23,42,.06);cursor:pointer}
        .aem-time .aem-rs__control:hover{box-shadow:0 0 0 1px rgba(var(--vz-primary-rgb),.35)}
        .aem-time .aem-rs__control--is-focused{box-shadow:0 0 0 1px var(--vz-primary) !important}
        .aem-time-total{margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:999px;font-size:.8rem;font-weight:700;
          font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.1)}
        .aem-time-total.is-ot{color:var(--vz-warning);background:rgba(var(--vz-warning-rgb),.14)}

        .aem-notes.form-control{border-radius:12px;background:var(--vz-tertiary-bg);border-color:var(--vz-border-color)}
        .aem-notes.form-control:focus{background:var(--vz-secondary-bg);border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}

        .aem-modal .aem-foot{padding:14px 20px}
        .aem-foot-hint{margin-right:auto !important;display:inline-flex;align-items:center;gap:6px;font-size:.78rem;color:var(--vz-secondary-color)}
        .aem-foot .btn{height:40px;padding:0 18px;border-radius:10px;font-weight:600}
        .aem-foot .aem-btn-close{background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);color:var(--vz-body-color);box-shadow:none}
        .aem-foot .aem-btn-close:hover{border-color:var(--vz-secondary-color);color:var(--vz-heading-color)}
        .aem-foot .aem-btn-save{border:0;color:#fff;background:linear-gradient(135deg,var(--vz-success),#34d3b9);box-shadow:0 8px 18px -8px rgba(var(--vz-success-rgb),.8)}
        .aem-foot .aem-btn-save:hover{color:#fff;transform:translateY(-1px)}
        .aem-time .aem-rs__single-value,.aem-time .aem-rs__placeholder{font-size:1rem;font-weight:700;font-variant-numeric:tabular-nums;color:var(--vz-heading-color)}
        .aem-time .aem-rs__indicator-separator{display:none}
        .aem-time .aem-rs__indicator{color:var(--vz-secondary-color);padding:0 8px}
        .aem-rs__menu{border-radius:12px !important;overflow:hidden;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg) !important;box-shadow:0 16px 40px -12px rgba(0,0,0,.3) !important}
        .aem-rs__menu-list{padding:6px !important;max-height:220px !important}
        .aem-rs__option{border-radius:8px;font-size:.88rem;font-variant-numeric:tabular-nums;color:var(--vz-heading-color) !important;cursor:pointer !important}
        .aem-rs__option--is-focused{background:rgba(var(--vz-primary-rgb),.08) !important}
        .aem-rs__option--is-selected{background:rgba(var(--vz-primary-rgb),.14) !important;color:var(--vz-primary) !important;font-weight:600}
        .aem-notes{min-height:84px;resize:vertical;font-size:.86rem}
      `}</style>
      {/* IN/OUT List Modal */}
      <Modal
        data-testid="attendance-employee-date-dialog"
        size="lg"
        isOpen={timeline_modal}
        toggle={() => {
          close_timeLine();
        }}
        centered
      >
        {timelineList.filter((d) => d.location_id !== null).length !== 0 ? (
          <AllDistanceCalculater allLocationData={allLocationData} />
        ) : null}

        <ModalHeader
          close={<ModalCloseButton onClick={() => {
          close_timeLine();
        }} testId="attendance-employee-date-close-button" />} className="text-center" toggle={() => {
          close_timeLine();
        }}>
          <h5
            className="modal-title text-center"
            id="exampleModalToggleLabel"
            style={{ fontSize: "smaller" }}
          >
            Date: {timelineDate}
          </h5>
        </ModalHeader>
        <ModalBody
          className="text-left"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div>
            <SimpleBar style={{ maxHeight: "calc(70vh - 110px)" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      Check In{" "}
                      <i className="mdi mdi-arrow-down-thick arrow-icon"></i>
                    </th>
                    <th>
                      Check Out{" "}
                      <i className="mdi mdi-arrow-up-thick arrow-icon"></i>
                    </th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineList.length > 0 &&
                    timelineList.map((data, idx) => {
                      let checkInData = timelineList[idx];
                      let checkOutData = timelineList[idx + 1];

                      if (
                        checkInData &&
                        parseInt(checkInData.entry_type) === 1
                      ) {
                        let checkInTime = format(
                          ParseTime(checkInData.entry_time),
                          "h:mm a",
                        );

                        let checkOutTime = checkOutData
                          ? format(ParseTime(checkOutData.entry_time), "h:mm a")
                          : "";

                        let totalDifference = checkOutData
                          ? differenceInMinutes(
                              ParseTime(checkOutData.entry_time),
                              ParseTime(checkInData.entry_time),
                            )
                          : 0;

                        let totalHours = Math.floor(totalDifference / 60);
                        let totalMinutes = totalDifference % 60;

                        let formattedTotalHours = totalHours
                          .toString()
                          .padStart(2, "0");

                        let formattedTotalMinutes = totalMinutes
                          .toString()
                          .padStart(2, "0");

                        // Device information
                        const checkInDevice = getDeviceIcon(
                          checkInData?.punched_by,
                        );

                        const checkOutDevice = checkOutData
                          ? getDeviceIcon(checkOutData?.punched_by)
                          : null;

                        return (
                          <tr key={idx}>
                            {/* CHECK IN */}
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                {checkInData.face_url ? (
                                  <img
                                    src={checkInData.face_url}
                                    alt="check-in"
                                    onClick={() =>
                                      open_image_preview(checkInData.face_url)
                                    }
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                      flexShrink: 0,
                                      cursor: "pointer",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <i
                                      className="mdi mdi-account-circle"
                                      style={{
                                        fontSize: "44px",
                                        color: "#adb5bd",
                                        lineHeight: 1,
                                      }}
                                    ></i>
                                  </div>
                                )}

                                <div>
                                  {/* TIME + DEVICE */}
                                  <p
                                    className="text-muted mb-1 d-flex align-items-center"
                                    style={{
                                      fontWeight: "bold",
                                      gap: "6px",
                                    }}
                                  >
                                    <span>{checkInTime}</span>

                                    <span
                                      className="d-flex align-items-center"
                                      style={{
                                        gap: "3px",
                                        fontWeight: "normal",
                                        fontSize: "13px",
                                      }}
                                      title={checkInDevice.label}
                                    >
                                      <i
                                        className={`mdi ${checkInDevice.icon}`}
                                        style={{
                                          fontSize: "16px",
                                          color: "#6c757d",
                                        }}
                                      ></i>

                                      <span>{checkInDevice.label}</span>
                                    </span>
                                  </p>

                                  {/* LOCATION */}
                                  <small
                                    className="mb-0 text-muted"
                                    style={{
                                      display: "inline-block",
                                      maxWidth: "150px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {checkInData.location_id !== null ? (
                                      <a
                                        data-testid={testId("attendance-employee-date-check-in-location", itemTestKey(data), "link")}
                                        href={`https://maps.google.com/?q=${checkInData.latitude},${checkInData.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <i className="mdi mdi-map-marker"></i>{" "}
                                        {checkInData.location || ""}
                                      </a>
                                    ) : checkInData.location !== "" ? (
                                      <span>
                                        <i className="mdi mdi-map-marker"></i>{" "}
                                        {checkInData.location}
                                      </span>
                                    ) : null}
                                  </small>
                                </div>
                              </div>
                            </td>

                            {/* CHECK OUT */}
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                {checkOutData?.face_url ? (
                                  <img
                                    src={checkOutData.face_url}
                                    alt="check-out"
                                    onClick={() =>
                                      open_image_preview(checkOutData.face_url)
                                    }
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                      flexShrink: 0,
                                      cursor: "pointer",
                                    }}
                                  />
                                ) : checkOutData ? (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <i
                                      className="mdi mdi-account-circle"
                                      style={{
                                        fontSize: "44px",
                                        color: "#adb5bd",
                                        lineHeight: 1,
                                      }}
                                    ></i>
                                  </div>
                                ) : null}

                                <div>
                                  {/* TIME + DEVICE */}
                                  <p
                                    className="text-muted mb-1 d-flex align-items-center"
                                    style={{
                                      fontWeight: "bold",
                                      gap: "6px",
                                    }}
                                  >
                                    <span>{checkOutTime}</span>

                                    {checkOutDevice && (
                                      <span
                                        className="d-flex align-items-center"
                                        style={{
                                          gap: "3px",
                                          fontWeight: "normal",
                                          fontSize: "13px",
                                        }}
                                        title={checkOutDevice.label}
                                      >
                                        <i
                                          className={`mdi ${checkOutDevice.icon}`}
                                          style={{
                                            fontSize: "16px",
                                            color: "#6c757d",
                                          }}
                                        ></i>

                                        <span>{checkOutDevice.label}</span>
                                      </span>
                                    )}
                                  </p>

                                  {/* LOCATION */}
                                  <small
                                    className="mb-0 text-muted"
                                    style={{
                                      display: "inline-block",
                                      maxWidth: "150px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {checkOutData &&
                                    checkOutData.location_id !== null ? (
                                      <a
                                        data-testid={testId("attendance-employee-date-check-out-location", itemTestKey(data), "link")}
                                        href={`https://maps.google.com/?q=${checkOutData.latitude},${checkOutData.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <i className="mdi mdi-map-marker"></i>{" "}
                                        {checkOutData.location || ""}
                                      </a>
                                    ) : checkOutData &&
                                      checkOutData.location !== "" ? (
                                      <span>
                                        <i className="mdi mdi-map-marker"></i>{" "}
                                        {checkOutData.location}
                                      </span>
                                    ) : null}
                                  </small>
                                </div>
                              </div>
                            </td>

                            {/* TOTAL HOURS */}
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {formattedTotalHours}:{formattedTotalMinutes} Hr
                              </p>
                            </td>
                          </tr>
                        );
                      }

                      // Skip rendering if it is not a check-in entry
                      return null;
                    })}
                </tbody>
              </table>
            </SimpleBar>
            <div className="text-center mt-3">
              <Button
                data-testid="attendance-employee-date-footer-close-button"
                className="btn btn-light modal-dismiss-btn"
                onClick={() => {
                  close_timeLine();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
      {/*Location Modal */}
      <Modal
        data-testid="attendance-employee-location-dialog"
        size="lg"
        isOpen={locationModal}
        toggle={() => {
          close_location();
        }}
        centered
      >
        <AllDistanceCalculater allLocationData={allLocationData} />
      </Modal>
      {/* Image Preview Modal */}
      <Modal
        data-testid="attendance-employee-image-preview-dialog"
        isOpen={imagePreviewModal}
        toggle={() => {
          close_image_preview();
        }}
        centered
      >
        <ModalBody className="text-center">
          <img
            src={previewImageUrl}
            alt="preview"
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
          <div className="text-center mt-3">
            <Button
              data-testid="attendance-employee-image-preview-close-button"
              className="btn btn-light modal-dismiss-btn"
              onClick={() => {
                close_image_preview();
              }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
      {/* Notes Modal */}
      <NotesModal
        isOpen={notes_modal}
        onClose={closeNotesModal}
        date={date}
        notes={notesList}
        resolveEmployee={(n) =>
          !!employee_data && employee_data.find((e) => e.id === n.employee_id)
        }
        canWrite={false}
        value={notesUpdateObj?.notes}
        onChange={(v) => setNotesUpdateObj({ ...notesUpdateObj, notes: v })}
        onSave={updateNotes}
      />

      {/* Apply Leave Modal — renders the shared ApplyLeaveForm */}
      <Modal
        data-testid="attendance-employee-apply-leave-dialog"
        isOpen={leave_modal}
        toggle={closeLeaveModal}
        centered
        className="alm-modal"
      >
        <div className="alm-head">
          <span className="alm-head-icon">
            <i className="ri-calendar-event-line" />
          </span>
          <div className="alm-head-text">
            <h5>Apply Leave</h5>
            <p>Request time off for this attendance day</p>
          </div>
          {leaveDate && (
            <div className="alm-date">
              <span className="alm-date-day">{format(new Date(leaveDate), "dd")}</span>
              <span className="alm-date-rest">
                <strong>{format(new Date(leaveDate), "MMM yyyy")}</strong>
                {format(new Date(leaveDate), "EEEE")}
              </span>
            </div>
          )}
          <button
            data-testid="attendance-employee-apply-leave-close-button"
            type="button"
            className="alm-close"
            aria-label="Close"
            onClick={closeLeaveModal}
          >
            <i className="ri-close-line" />
          </button>
        </div>
        <ModalBody className="alm-body">
          {/* antd picker popups default to z-index 1050, which sits behind
              the Bootstrap modal (1055). Lift them while this modal is open. */}
          <style>{`
            .ant-picker-dropdown { z-index: 1100 !important; }

            .alm-modal{max-width:540px}
            .alm-modal .modal-content{overflow:hidden;border-radius:18px}
            .alm-head{position:relative;display:flex;align-items:center;gap:14px;padding:18px 20px;
              background:linear-gradient(135deg,rgba(var(--vz-success-rgb),.12),rgba(var(--vz-info-rgb),.05) 60%,transparent);
              border-bottom:1px solid var(--vz-border-color)}
            .alm-head::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--vz-success),var(--vz-info))}
            .alm-head-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:21px;color:#fff;
              background:linear-gradient(135deg,var(--vz-success),#34d3b9);box-shadow:0 8px 18px -6px rgba(var(--vz-success-rgb),.6)}
            .alm-head-text{flex:1;min-width:0}
            .alm-head-text h5{margin:0;font-size:16px;font-weight:700;color:var(--vz-heading-color)}
            .alm-head-text p{margin:2px 0 0;font-size:12.5px;color:var(--vz-secondary-color)}
            .alm-date{display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;border-radius:12px;
              background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color)}
            .alm-date-day{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:700;font-size:15px;color:#fff;
              background:linear-gradient(135deg,var(--vz-primary),var(--vz-info))}
            .alm-date-rest{display:flex;flex-direction:column;font-size:11px;line-height:1.25;color:var(--vz-secondary-color)}
            .alm-date-rest strong{font-size:12.5px;color:var(--vz-heading-color)}
            .alm-close{width:34px;height:34px;flex-shrink:0;border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);
              color:var(--vz-secondary-color);display:grid;place-items:center;font-size:18px;transition:all .18s ease}
            .alm-close:hover{color:var(--vz-danger);border-color:rgba(var(--vz-danger-rgb),.4);background:rgba(var(--vz-danger-rgb),.08);transform:rotate(90deg)}

            .alm-modal .modal-body.alm-body{padding:24px}
            .alm-body .MuiTypography-overline{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--vz-heading-color)}
            .alm-body .MuiTypography-overline::before{content:"";width:6px;height:6px;border-radius:50%;
              background:var(--vz-success);box-shadow:0 0 0 3px rgba(var(--vz-success-rgb),.18)}
            .alm-body .MuiOutlinedInput-root{border-radius:12px;background:var(--vz-tertiary-bg);transition:background .18s,box-shadow .18s}
            .alm-body .MuiOutlinedInput-root.Mui-focused{background:var(--vz-secondary-bg);box-shadow:0 0 0 3px rgba(var(--vz-success-rgb),.15)}
            .alm-body .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline{border-color:var(--vz-success)}
            .alm-body .MuiInputLabel-root.Mui-focused{color:var(--vz-success)}
            .alm-body .ant-picker{border-radius:12px;background:var(--vz-tertiary-bg)}
            .alm-body .MuiToggleButtonGroup-root{border-radius:12px;background:var(--vz-tertiary-bg);padding:3px;gap:3px}
            .alm-body .MuiToggleButton-root{border:0 !important;border-radius:9px !important;font-weight:600;text-transform:none}
            .alm-body .MuiToggleButton-root.Mui-selected{color:#fff;background:linear-gradient(135deg,var(--vz-success),#34d3b9)}
            .alm-body form > .MuiStack-root:last-child{background:var(--vz-tertiary-bg)}
            .alm-body form > .MuiStack-root:last-child .MuiButton-root{height:40px;padding:0 18px;border-radius:10px;font-weight:600;text-transform:none}
            .alm-body form > .MuiStack-root:last-child .MuiButton-contained{background:linear-gradient(135deg,var(--vz-success),#34d3b9);
              box-shadow:0 8px 18px -8px rgba(var(--vz-success-rgb),.8)}
            @media (max-width:575px){.alm-date{display:none}}
          `}</style>
          <ApplyLeaveForm lockedDate={leaveDate} onCancel={closeLeaveModal} />
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default AttendanceEmployeeTable;
