import React, { Fragment, useEffect, useState } from "react";
import {
  Table,
  IconButton,
  Dropdown,
  Icon,
  Whisper,
  Popover,
  ButtonToolbar,
  Menu,
  Affix,
} from "rsuite";
import AlignJustifyIcon from "@rsuite/icons/legacy/AlignJustify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Button,
  Modal,
  ModalBody,
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
import { useDispatch, useSelector } from "react-redux";
import { ConvertSecondsToTime } from "../../../common/js/ConvertSecondsToTime";
import { ParseTime } from "../../../common/js/ParseTime";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { updateIndividualAttendanceReportData } from "../../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { GetAmPmDateTime } from "../../../common/js/ConvertDateTimeToAmPm";
import { differenceInMinutes } from "date-fns";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { set } from "lodash";
import { setEmployeeLeaveType } from "../../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { addLeaveApplication } from "../../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { setLeaveTypeForCurrentEmployee } from "../../../redux/reducers/ChildReducer/LeaveTypeReducer";
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

const AttendanceEmployeeTable = () => {
  const dispatch = useDispatch();

  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);
  const employee_data = GetLocalStorageData("employee") || [];

  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const [notes_modal, setNotes_modal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leave_modal, setLeave_modal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState(null);
  const [attendanceEditData, setAttendanceEditData] = useState(null);
  const [leaveApplyData, setLeaveApplyData] = useState(null);
  const [hrStatus, setHrStatus] = useState(0);
  const [notesLength, setNotesLength] = useState(0);
  const [date, setDate] = useState(null);

  const [notesUpdateObj, setNotesUpdateObj] = useState(null);
  const [notesList, setNotesList] = useState([]);

  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);
  const [locationData, setLocationData] = useState([]);
  const [locationType, setLocationType] = useState("");
  const [allLocationData, setAllLocationData] = useState([]);


  

  const { individual_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  const { employee_leave_data } = useSelector(
    (state) => state.EmployeeLeaveReducer
  );

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const employeeData = GetLocalStorageData("employee") || [];

  const employeeInformation =
    Array.isArray(individual_attendance_report_data) &&
    individual_attendance_report_data.length > 0
      ? employeeData.find(
          (e) => e.id === individual_attendance_report_data[0].employee_id
        )
      : [];
  const employeeWorkSchedule =
    workScheduleData.find(
      (w) => w.id === employeeInformation.work_schedule_id
    ) || [];

  const day_leave_types = employee_leave_data.filter((d) => d.unit === 1);
  // const hour_types = employee_leave_data.filter((d) => d.unit === 2);

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

  const close_timeLine = () => {
    settimeline_modal(false);
  };

  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  const closeLeaveModal = () => {
    setLeave_modal(false);
    setLeaveCount(0);
  };

  const [initialObj, setInitialObj] = useState(0);

  const closeEditModal = () => {
    setAttendanceEditData(null);
    setEditModalOpen(false);
  };

 const DateCell = ({ rowData, dataKey, ...props }) => {
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
          alignItems: "center",     // Center horizontally
          justifyContent: "center", // Center vertically if row height is bigger
          height: "100%",            // Ensure full cell height for vertical centering
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>{format(new Date(rowData.date), "dd MMM, yyyy")}</div>
          <span style={{ marginLeft: "5px" }}>{warning_icon}</span>
        </div>
        <div style={{ fontSize: "12px", color: "#666", fontWeight:"normal" }}>{rowData.day}</div>
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
              className="link-opacity-75 ms-1"
              href="#"
              onClick={() => {
                setTimelineList(rowData?.entry_log);
                setTimeLineDate(
                  format(new Date(rowData?.date), "dd MMM, yyyy")
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
    return (
      <Cell {...props} className="link-group">
        {rowData.is_leave_approved === true ? (
          <span style={{ color: "orange" }}>Leave</span>
        ) : rowData.is_holiday === true ? (
          <span style={{ color: "green" }}>Holiday</span>
        ) : rowData.is_week_off === true ? (
          <span style={{ color: "blue" }}>Week Off</span>
        ) : rowData.is_present === false ? (
          <span style={{ color: "red" }}>Absent</span>
        ) : (
          ConvertSecondsToTime(rowData?.work_schedule_duration_without_break)
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
        rowData.total_break_duration
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
              class={`mdi mdi-circle fs-10 align-middle text-${entry_status?.class} me-1 ms-2`}
            ></i>
            <span class="fs-12 mb-0 text-muted">
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
              class={`mdi mdi-circle fs-10 align-middle text-${entry_status?.class} me-1 ms-2`}
            ></i>
            <span class="fs-12 mb-0 text-muted">
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
      {
        label: "Edit Attendance",
        icon: <i className="ri-pencil-line"></i>,
        onClick: () => editAttendanceReport(rowData),
      },
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
    let initial_obj = {
      id: rowData?.id,
      date: rowData?.date,
      work_schedule_duration_without_break:
        rowData?.work_schedule_duration_without_break,
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

  const applyLeave = (rowData) => {
    let intialObj = {
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
    setLeaveApplyData(intialObj);
    setLeave_modal(true);
    setLeaveDate(rowData.date);
  };

  const handleApplyLeave = async () => {
    dispatch(setLoaderVisible(true));
    if (leaveApplyData.leave_type_id === 0) {
      toast.error("Please Select Leave Type");
    } else {
      const Api = await PostApi(
        "leave/leave-application/create/",
        leaveApplyData,
        false
      );
      if (Api.status && Api.status === 200) {
        if (leaveApplyData.id === 0) {
          dispatch(addLeaveApplication(Api?.data.data));
          dispatch(
            setLeaveTypeForCurrentEmployee(
              Api?.data?.leave_type_for_employee || []
            )
          );
        }
        dispatch(toggleRSBView(false));
        setLeave_modal(false);
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    }
    dispatch(setLoaderVisible(false));
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
      false
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
      <div style={{ position: "relative" }}>
        <Table
          height={400}
          data={individual_attendance_report_data || []}
          autoHeight={true}
          loading={loading}
          bordered={true}
          className="mb-5"
           rowHeight={60}
          affixHorizontalScrollbar
          affixHeader={{
            affix: true,
            offsetTop: 0,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Column width={175} align="center" fixed="left">
            <HeaderCell style={{ offsetTop: 0 }}>Date</HeaderCell>
            <DateCell />
          </Column>
          <Column width={130}>
            <HeaderCell style={{ offsetTop: 0 }}>IN</HeaderCell>
            <InOutCell dataKey="in" />
          </Column>
          <Column width={150}>
            <HeaderCell>IN Location</HeaderCell>
            <LocationCell dataKey="in" fullText />
          </Column>
          <Column width={130}>
            <HeaderCell style={{ offsetTop: 0 }}>OUT</HeaderCell>
            <InOutCell dataKey="out" />
          </Column>
          <Column width={150}>
            <HeaderCell style={{ offsetTop: 0 }}>OUT Location</HeaderCell>
            <LocationCell dataKey="out" fullText />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Work Schedule</HeaderCell>
            <WorkScheduleCell dataKey="ws" />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Break</HeaderCell>
            <BreakHourCell dataKey="total_break_duration" />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Total IN</HeaderCell>
            <SecondsToTimeCell dataKey="final_checked_in_hr_in_seconds" />
          </Column>
          {employeeWorkSchedule.has_ot === true && (
            <Column width={100}>
              <HeaderCell style={{ offsetTop: 0 }}>OT</HeaderCell>
              <SecondsToTimeCell dataKey="final_ot_hr_in_seconds" />
            </Column>
          )}
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Paid Hr</HeaderCell>
            <SecondsToTimeCell dataKey="final_paid_hr_in_seconds" />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Status</HeaderCell>
            <HrStatusCell dataKey="hr_status" />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Activity</HeaderCell>
            <ActivityCell />
          </Column>
          <Column width={100}>
            <HeaderCell style={{ offsetTop: 0 }}>Notes</HeaderCell>
            <NotesCell dataKey="notes" />
          </Column>

          <Column width={80} fixed="right">
            <HeaderCell style={{ offsetTop: 0 }} fixed="center">
              Action
            </HeaderCell>
            <EditableCell />
          </Column>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} toggle={closeEditModal} centered>
        <ModalBody className="text-left">
          {/* Display the values based on attendanceEditData */}
          {!!attendanceEditData && (
            <div>
              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <ModalHeader>
                    <Col>
                      Date:
                      <Label>
                        {format(
                          new Date(attendanceEditData.date),
                          "dd MMM, yyyy"
                        )}
                      </Label>
                    </Col>
                  </ModalHeader>
                </Row>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <Col>
                    <Label htmlFor="calculation" className="form-label">
                      Work Schedule Hour:
                    </Label>
                  </Col>
                  <Col>
                    <Label>
                      {ConvertSecondsToTime(
                        attendanceEditData?.work_schedule_duration_without_break
                      )}
                    </Label>
                  </Col>
                </Row>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <Col>
                    <Label htmlFor="calculation" className="form-label">
                      Total IN:
                    </Label>
                  </Col>
                  <Col>
                    <Label>
                      {" "}
                      {ConvertSecondsToTime(
                        attendanceEditData.total_work_duration
                      )}
                    </Label>
                  </Col>
                </Row>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <Col>
                    <Label htmlFor="calculation" className="form-label">
                      Checked In Hours:
                    </Label>
                  </Col>
                  <Col>
                    <div style={{ display: "flex" }}>
                      <b className="mt-2 me-1 ms-2">H</b>
                      <Select
                        id="paid_hours_hr"
                        name="paid_hours_hr"
                        placeholder={"00"}
                        options={hourOptions || []}
                        value={hourOptions.find(
                          (option) =>
                            option.value ===
                            String(
                              Math.floor(
                                attendanceEditData.final_checked_in_hr_in_seconds /
                                  3600
                              )
                            ).padStart(2, "0")
                        )}
                        onChange={(selectedOption) => {
                          EditHourChange(
                            selectedOption.value,
                            Math.floor(
                              (attendanceEditData.final_checked_in_hr_in_seconds %
                                3600) /
                                60
                            ),
                            "final_checked_in_hr_in_seconds"
                          );
                        }}
                      />
                      <b className="mt-2 me-1 ms-2">M</b>
                      <Select
                        id="paid_hours_min"
                        name="paid_hours_min"
                        placeholder={"00"}
                        options={AllMinuteOptions || []}
                        value={AllMinuteOptions.find(
                          (option) =>
                            option.value ===
                            String(
                              Math.floor(
                                (attendanceEditData.final_checked_in_hr_in_seconds %
                                  3600) /
                                  60
                              )
                            ).padStart(2, "0")
                        )}
                        onChange={(selectedOption) => {
                          EditHourChange(
                            Math.floor(
                              attendanceEditData.final_checked_in_hr_in_seconds /
                                3600
                            ),
                            selectedOption.value,
                            "final_checked_in_hr_in_seconds"
                          );
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
              {employeeWorkSchedule.has_ot === true && (
                <Col md={12} lg={12} xxl={12}>
                  <Row className="mb-2">
                    <Col>
                      <Label htmlFor="calculation" className="form-label">
                        OT:
                      </Label>
                    </Col>
                    <Col>
                      <div style={{ display: "flex" }}>
                        <b className="mt-2 me-1 ms-2">H</b>
                        <Select
                          id="ot_hr"
                          name="ot_hr"
                          placeholder={"00"}
                          options={hourOptions || []}
                          value={hourOptions.find(
                            (option) =>
                              option.value ===
                              String(
                                Math.floor(
                                  attendanceEditData.final_ot_hr_in_seconds /
                                    3600
                                )
                              ).padStart(2, "0")
                          )}
                          onChange={(selectedOption) =>
                            EditHourChange(
                              selectedOption.value,
                              Math.floor(
                                (attendanceEditData.final_ot_hr_in_seconds %
                                  3600) /
                                  60
                              ),
                              "final_ot_hr_in_seconds"
                            )
                          }
                        />
                        <b className="mt-2 me-1 ms-2">M</b>
                        <Select
                          id="ot_min"
                          name="ot_min"
                          placeholder={"00"}
                          options={AllMinuteOptions || []}
                          value={AllMinuteOptions.find(
                            (option) =>
                              option.value ===
                              String(
                                Math.floor(
                                  (attendanceEditData.final_ot_hr_in_seconds %
                                    3600) /
                                    60
                                )
                              ).padStart(2, "0")
                          )}
                          onChange={(selectedOption) =>
                            EditHourChange(
                              Math.floor(
                                attendanceEditData.final_ot_hr_in_seconds / 3600
                              ),
                              selectedOption.value,
                              "final_ot_hr_in_seconds"
                            )
                          }
                        />
                      </div>
                    </Col>
                  </Row>
                </Col>
              )}

              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <Col>
                    <Label htmlFor="calculation" className="form-label">
                      Total Paid Hours:
                    </Label>
                  </Col>
                  <Col>
                    <span>
                      {ConvertSecondsToTime(
                        attendanceEditData?.final_paid_hr_in_seconds
                      )}{" "}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <Row className="mb-2">
                  <Col>
                    <Label htmlFor="calculation" className="form-label">
                      Notes:
                    </Label>
                  </Col>
                  <Col>
                    <textarea
                      className="form-control me-2"
                      id="notes"
                      name="notes"
                      value={attendanceEditData?.notes || ""}
                      onChange={(e) => handleNotesChange(e)}
                    />
                  </Col>
                </Row>
              </Col>

              <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                <button
                  type="button"
                  className="btn w-sm btn-light"
                  data-bs-dismiss="modal"
                  onClick={closeEditModal}
                >
                  Close
                </button>

                {showSaveBtn && (
                  <button
                    type="button"
                    className="btn w-sm btn-success"
                    data-bs-dismiss="modal"
                    onClick={updateAttendance}
                  >
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save
                  </button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
      {/* IN/OUT List Modal */}
      <Modal
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

        <ModalHeader className="text-center">
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
          style={{ maxHeight: "100px", overflowY: "auto" }}
        >
          <div>
            <SimpleBar style={{ maxHeight: "215px" }}>
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
                          "h:mm a"
                        );
                        let checkOutTime = checkOutData
                          ? format(ParseTime(checkOutData.entry_time), "h:mm a")
                          : "";
                        let totalDifference = checkOutData
                          ? differenceInMinutes(
                              ParseTime(checkOutData.entry_time),
                              ParseTime(checkInData.entry_time)
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

                        return (
                          <tr key={idx}>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {checkInTime}
                              </p>
                              <small
                                className="mb-0 text-muted"
                                style={{
                                  display: "inline-block",
                                  maxWidth: "100px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {checkInData.location_id !== null ? (
                                  <a
                                    href={`https://maps.google.com/?q=${checkInData.latitude},${checkInData.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkInData.location || ""}
                                  </a>
                                ) : checkInData &&
                                  checkInData.location !== "" ? (
                                  <span>
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkInData.location}
                                  </span>
                                ) : null}
                              </small>
                            </td>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {checkOutTime}
                              </p>
                              <small
                                className="mb-0 text-muted"
                                style={{
                                  display: "inline-block",
                                  maxWidth: "100px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {checkOutData &&
                                checkOutData.location_id !== null ? (
                                  <a
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
                            </td>
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
                      return null; // Skip rendering if it's not a check-in entry
                    })}
                </tbody>
              </table>
            </SimpleBar>
            <div className="text-center mt-3">
              <Button
                className="btn btn-warning"
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
        size="lg"
        isOpen={locationModal}
        toggle={() => {
          close_location();
        }}
        centered
      >
        <AllDistanceCalculater allLocationData={allLocationData} />
      </Modal>
      {/* Notes Modal */}
      <Modal
        isOpen={notes_modal}
        toggle={() => {
          closeNotesModal();
        }}
        centered
        className="custom-modal"
      >
        <ModalHeader>
          <h5
            className="modal-title"
            id="exampleModalToggleLabel"
            style={{ fontSize: "smaller" }}
          >
            Notes - {format(new Date(date), "dd MMM, yyyy")}
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ height: "200px" }} className="px-3 mx-n3 mb-2">
              {notesList && notesList.length > 0 ? (
                notesList.map((d) => {
                  let emp_details =
                    !!employee_data &&
                    employee_data.find((e) => e.id === d.employee_id);

                  return (
                    <div className="d-flex mb-4">
                      <div className="flex-shrink-0">
                        {emp_details?.profile_url ? (
                          <img
                            src={emp_details?.profile_url}
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
                              objectFit: "cover",
                            }}
                            data-bs-toggle="tooltip"
                            title={emp_details.first_name}
                          >
                            <span
                              className="first_letter"
                              style={{ color: "white" }}
                            >
                              {emp_details?.first_name?.charAt(0) || ""}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1 ms-3">
                        <h5 className="fs-13">
                          {emp_details.first_name}{" "}
                          <small className="text-muted ms-2">
                            {/* 20 Dec 2021 - 05:47AM */}
                            {GetAmPmDateTime(d?.created_time)}
                          </small>
                        </h5>
                        <p className="text-muted">{d?.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "25vh",
                  }}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="loop"
                    colors="primary:#405189,secondary:#0ab39c"
                    style={{
                      marginTop: "20px",
                      width: "150px",
                      height: "80px",
                      marginBottom: "20px",
                    }}
                  ></lord-icon>
                  <p
                    style={{
                      width: "300px",
                      color: "#405189",
                      fontSize: "20px",
                      textAlign: "center",
                    }}
                  >
                    No Notes Found!
                  </p>
                </div>
              )}
            </SimpleBar>
            <form className="mt-4">
              <Row className="g-3">
                {hrStatus != 2 && (
                  <Col xs={12}>
                    <label
                      htmlFor="exampleFormControlTextarea1"
                      className="form-label text-body"
                    >
                      Leave a Notes
                    </label>
                    <textarea
                      className="form-control bg-light border-light"
                      id="exampleFormControlTextarea1"
                      rows="3"
                      placeholder="Enter your comment..."
                      value={notesUpdateObj?.notes || ""}
                      onChange={(e) =>
                        setNotesUpdateObj({
                          ...notesUpdateObj,
                          notes: e.target.value,
                        })
                      }
                    ></textarea>
                  </Col>
                )}
                <Col xs={12} className="text-end">
                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn btn-warning"
                      data-bs-dismiss="modal"
                      onClick={closeNotesModal}
                    >
                      Close
                    </button>

                    {!!notesUpdateObj?.notes &&
                      (notesUpdateObj?.notes).trim().length > 0 &&
                      hrStatus != 2 && (
                        <button
                          type="button"
                          className="btn w-sm btn-success"
                          data-bs-dismiss="modal"
                          onClick={updateNotes}
                        >
                          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                          Save
                        </button>
                      )}
                  </div>
                </Col>
              </Row>
            </form>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={leave_modal}
        toggle={() => {
          closeLeaveModal();
        }}
        centered
        className="custom-modal"
      >
        <ModalHeader className="d-flex justify-content-center">
          <h5
            className="modal-title center"
            id="exampleModalToggleLabel"
            style={{ fontSize: "smaller" }}
          >
            Apply Leave on {format(new Date(leaveDate), "dd MMM, yyyy")}
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <Col md={12} lg={12} xxl={12}>
            <Row className="mb-2">
              <Col>
                <Label htmlFor="calculation" className="form-label">
                  Leave Type:
                </Label>
              </Col>
              <Col>
                <Select
                  name="leave_type_id"
                  isMulti={false}
                  options={day_leave_types || []}
                  value={
                    leaveApplyData?.leave_type_id
                      ? day_leave_types.find(
                          (d) => d.id === leaveApplyData?.leave_type_id
                        )
                      : []
                  }
                  isOptionDisabled={(option) =>
                    option.balance_leave_count === 0
                  }
                  onChange={(e) => {
                    setLeaveApplyData((prevData) => {
                      const newData = {
                        ...prevData,
                        leave_type_id: e.id,
                      };
                      setLeaveCount(
                        newData.leave_type_id
                          ? employee_leave_data.find(
                              (d) => d.id === newData.leave_type_id
                            )?.balance_leave_count
                          : ""
                      );
                      return newData;
                    });
                  }}
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                />
              </Col>
            </Row>
            <Row className="mb-2">
              <Col></Col>
              <Col>
                {leaveApplyData?.leave_type_id ? (
                  <Col>
                    {" "}
                    <div id="passwordHelpBlock" className="form-text">
                      {leaveCount} Days Remaining
                    </div>
                  </Col>
                ) : null}
              </Col>
            </Row>
          </Col>
          <Col md={12} lg={12} xxl={12}>
            <Row className="mt-4">
              <Col>
                <Label htmlFor="calculation" className="form-label">
                  Reason:
                </Label>
              </Col>
              <Col>
                <textarea
                  className="form-control bg-light border-light"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder="Enter Reason"
                  value={leaveApplyData?.reason || ""}
                  onChange={(e) => {
                    setLeaveApplyData({
                      ...leaveApplyData,
                      reason: e.target.value,
                    });
                  }}
                ></textarea>
              </Col>
            </Row>
          </Col>

          <div className="text-center mt-5">
            <Col xs={12} className="text-end">
              <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                <Button
                  className="btn btn-warning"
                  onClick={() => {
                    closeLeaveModal();
                  }}
                >
                  Close
                </Button>

                <button
                  type="button"
                  className="btn w-sm btn-success"
                  data-bs-dismiss="modal"
                  onClick={handleApplyLeave}
                >
                  <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                  Save
                </button>
              </div>
            </Col>
          </div>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default AttendanceEmployeeTable;
