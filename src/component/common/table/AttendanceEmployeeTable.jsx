import React, { Fragment, useEffect, useState } from "react";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import {
  AllMinuteOptions,
  hourOptions,
  hr_status_options,
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

const AttendanceEmployeeTable = () => {
  const dispatch = useDispatch();

  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);

  const ws_data = GetLocalStorageData("work_schedule") || [];
  const holiday_data = GetLocalStorageData("holiday") || [];
  const leave_types_data = GetLocalStorageData("leave_types") || [];
  const employee_data = GetLocalStorageData("employee") || [];

  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const [notes_modal, setNotes_modal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attendanceEditData, setAttendanceEditData] = useState(null);

  const [notesUpdateObj, setNotesUpdateObj] = useState(null);
  const [notesList, setNotesList] = useState([]);

  const [showSaveBtn, setShowSaveBtn] = useState(false);

  const { individual_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  const [initialObj, setInitialObj] = useState(0);

  const closeEditModal = () => {
    setAttendanceEditData(null);
    setEditModalOpen(false);
  };

  const DateCell = ({ rowData, dataKey, ...props }) => {
    let warning_icon =
      rowData?.total_no_of_check_in !== rowData?.total_no_of_check_out ? (
        <i class="ri-error-warning-line text-warning fs-5"></i>
      ) : null;

    return (
      <Cell {...props} className="fw-bold">
        {format(new Date(rowData.date), "dd MMM, yyyy")}
        <span style={{ marginLeft: "10px" }}>{warning_icon}</span>
      </Cell>
    );
  };

  const InOutCell = ({ rowData, dataKey, ...props }) => {
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
              setTimeLineDate(format(new Date(rowData?.date), "dd MMM, yyyy"));
              open_timeline();
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
  };

  const LocationCell = ({ rowData, dataKey, ...props }) => {
    let in_location = rowData?.first_check_in_location || "";
    let out_location = rowData?.last_check_out_location || "";
    let location_text = dataKey === "in" ? in_location : out_location;

    return (
      <Cell {...props} className="link-group">
        {location_text !== "" && (
          <>
            <i className="mdi mdi-map-marker-outline"></i> {location_text}
          </>
        )}
      </Cell>
    );
  };

  const WorkScheduleCell = ({ rowData, dataKey, ...props }) => {
    // let at_ws_data = ws_data.find(function (i) {
    //   return i.id == rowData.work_schedule_id;
    // });
    // const date = new Date(rowData?.date);
    // const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    //   weekday: "long",
    // }).format(date);

    // const work_hr = at_ws_data?.workday.find(
    //   (val) => val.weekday.toLowerCase() === dayOfWeek.toLowerCase()
    // );
    // let total_work_duration = work_hr ? work_hr.total_work_duration : 0;

    let work_schedule_hr = ConvertSecondsToTime(
      rowData?.work_schedule_duration_without_break
    );

    return (
      <Cell {...props} className="link-group">
        {work_schedule_hr}
      </Cell>
    );
  };

  const BreakHourCell = ({ rowData, dataKey, ...props }) => {
    // let at_ws_data = ws_data.find(function (i) {
    //   return i.id == rowData.work_schedule_id;
    // });
    // const date = new Date(rowData?.date);
    // const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    //   weekday: "long",
    // }).format(date);

    // const work_hr = at_ws_data?.workday.find(
    //   (val) => val.weekday.toLowerCase() === dayOfWeek.toLowerCase()
    // );
    // let break_hr_duration = work_hr ? work_hr.break_duration : 0;

    let break_schedule_hr = ConvertSecondsToTime(rowData.total_break_duration);

    return (
      <Cell {...props} className="link-group">
        {break_schedule_hr}
      </Cell>
    );
  };

  const WorkScheduleData = ({ rowData, dataKey, ...props }) => {
    let at_ws_data = ws_data.find(function (i) {
      return i.id == rowData.work_schedule_id;
    });

    let fullday_hr = at_ws_data?.fullday_hr || "";
    let fullday_min = at_ws_data?.fullday_min || "";

    return (
      <Label {...props} className="link-group">
        {fullday_hr} : {fullday_min}
      </Label>
    );
  };

  const SecondsToTimeCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        {` ${ConvertSecondsToTime(rowData[dataKey])}`}
      </Cell>
    );
  };

  const HrStatusCell = ({ rowData, dataKey, ...props }) => {
    let at_hr_status_data = hr_status_options.find(function (i) {
      return i.id == rowData.hr_status;
    });

    let class_name = at_hr_status_data?.class || "";
    let label = at_hr_status_data?.label || "";

    return (
      <Cell {...props} className="link-group">
        <span className={`badge bg-${class_name}-subtle text-${class_name}`}>
          <b className="fs-7"> {label}</b>
        </span>
      </Cell>
    );
  };

  const NotesCell = ({ rowData, dataKey, ...props }) => {
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
  };

  const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
    if (
      rowData?.status === false &&
      (rowData?.hr_status === 1 || rowData?.hr_status === 3)
    ) {
      return (
        <Cell style={{ padding: "6px" }} {...props}>
          <Button
            appearance="link"
            onClick={() => editAttendanceReport(rowData)}
          >
            Edit
          </Button>
        </Cell>
      );
    } else {
      return (
        <Cell style={{ padding: "6px" }} {...props}>
          ------
        </Cell>
      );
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

    console.log("Notes Length = ", newNotes.trim().length);

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

    console.log("Initial Obj = ", initial_obj);

    setInitialObj(initial_obj);

    setAttendanceEditData(initial_obj);

    setShowSaveBtn(false);

    setEditModalOpen(true);
  };

  const updateAttendance = async () => {
    console.log("final Update Obj = ", attendanceEditData);

    dispatch(setLoaderVisible(true));

    const Api = await PostApi("/attendance/edit/", attendanceEditData, false);

    if (Api.status && Api.status === 200) {
      setEditModalOpen(false);
      dispatch(updateIndividualAttendanceReportData(Api?.data?.data));
      toast.success(Api?.data?.message);
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    dispatch(setLoaderVisible(false));
  };

  const viewNotes = (rowData) => {
    console.log("This rowData = ", rowData);

    let initial_obj = {
      id: rowData?.id,
      final_checked_in_hr_in_seconds: rowData?.final_checked_in_hr_in_seconds,
      final_ot_hr_in_seconds: rowData?.final_ot_hr_in_seconds,
      final_paid_hr_in_seconds: rowData?.final_paid_hr_in_seconds,
      notes: "",
    };
    setNotesUpdateObj(initial_obj);

    setNotesList(rowData?.notes);

    setNotes_modal(true);
  };

  const updateNotes = async () => {
    console.log("UPdated Notes = ", notesUpdateObj);

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
      <Table
        height={400}
        data={individual_attendance_report_data || []}
        autoHeight={true}
        loading={loading}
        bordered={true}
        className="mb-5"
      >
        <Column width={175} align="center" fixed="left">
          <HeaderCell>Date</HeaderCell>
          <DateCell />
        </Column>
        <Column width={130}>
          <HeaderCell>IN</HeaderCell>
          <InOutCell dataKey="in" />
        </Column>
        <Column width={150}>
          <HeaderCell>IN Location</HeaderCell>
          <LocationCell dataKey="in" fullText />
        </Column>
        <Column width={130}>
          <HeaderCell>OUT</HeaderCell>
          <InOutCell dataKey="out" />
        </Column>
        <Column width={150}>
          <HeaderCell>OUT Location</HeaderCell>
          <LocationCell dataKey="out" fullText />
        </Column>
        <Column width={100}>
          <HeaderCell>Work Schedule</HeaderCell>
          <WorkScheduleCell dataKey="ws" />
        </Column>
        <Column width={100}>
          <HeaderCell>Break</HeaderCell>
          <BreakHourCell dataKey="total_break_duration" />
        </Column>
        <Column width={100}>
          <HeaderCell>Total IN</HeaderCell>
          <SecondsToTimeCell dataKey="final_checked_in_hr_in_seconds" />
        </Column>
        <Column width={125}>
          <HeaderCell>OT</HeaderCell>
          <SecondsToTimeCell dataKey="final_ot_hr_in_seconds" />
        </Column>
        <Column width={125}>
          <HeaderCell>Paid Hr</HeaderCell>
          <SecondsToTimeCell dataKey="final_paid_hr_in_seconds" />
        </Column>
        <Column width={150}>
          <HeaderCell>Status</HeaderCell>
          <HrStatusCell dataKey="hr_status" />
        </Column>
        <Column width={100}>
          <HeaderCell>Notes</HeaderCell>
          <NotesCell dataKey="notes" />
        </Column>

        <Column width={80} fixed="right">
          <HeaderCell>Action</HeaderCell>
          <EditableCell />
        </Column>
      </Table>
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
                          console.log("SEL HR = ", selectedOption);
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
                          console.log("SLE Min = ", selectedOption);
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
                                attendanceEditData.final_ot_hr_in_seconds / 3600
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
        isOpen={timeline_modal}
        toggle={() => {
          open_timeline();
        }}
        centered
      >
        <ModalHeader>
          <h5 className="modal-title" id="exampleModalToggleLabel">
            Date : {timelineDate}
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ maxHeight: "410px" }} className="p-3 pt-0">
              <div className="acitivity-timeline acitivity-main">
                {timelineList.length &&
                  timelineList.map((data, idx) => {
                    let py_class =
                      idx === 0 || idx === data.length - 1 ? "" : "py-3";
                    let info =
                      parseInt(data.entry_type) === 1
                        ? {
                            class: "success",
                            text: "IN",
                            iconClass: "right",
                          }
                        : {
                            class: "warning",
                            text: "Out",
                            iconClass: "left",
                          };
                    return (
                      <div className={`acitivity-item  d-flex ${py_class}`}>
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                          <div
                            className={`avatar-title bg-${info?.class}-subtle text-${info?.class} rounded-circle`}
                          >
                            <i
                              className={`mdi mdi-arrow-${info?.iconClass}-thick`}
                            ></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">Check {info?.text} </h6>
                          <p className="text-muted mb-1">
                            {format(ParseTime(data?.entry_time), "h:mm a")}
                          </p>
                          <small className="mb-0 text-muted">
                            <i className="mdi mdi-map-marker"></i>{" "}
                            {data?.location || ""}
                          </small>
                        </div>
                      </div>
                    );
                  })}

                {/* <div className="acitivity-item py-3 d-flex">
                  <div className="flex-shrink-0">
                    <div className="avatar-xs acitivity-avatar">
                      <div className="avatar-title rounded-circle bg-warning-subtle text-warning">
                        <i className="mdi mdi-arrow-left-thick"></i>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Check Out</h6>
                    <p className="text-muted mb-1">02:14 PM Today </p>
                    <small className="mb-0 text-muted">
                      <i className="mdi mdi-map-marker"></i> Lintcloud, Vallioor
                    </small>
                  </div>
                </div>

                <div className="acitivity-item d-flex">
                  <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle">
                      <i className="ri-shopping-cart-2-line"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Purchase by James Price</h6>
                    <p className="text-muted mb-1">
                      Product noise evolve smartwatch{" "}
                    </p>
                    <small className="mb-0 text-muted">02:14 PM Today</small>
                  </div>
                </div> */}
              </div>
            </SimpleBar>
            <Button
              className="btn btn-warning"
              onClick={() => {
                open_timeline();
              }}
            >
              Continue
            </Button>
          </div>
        </ModalBody>
      </Modal>
      {/* Notes Modal */}
      <Modal
        isOpen={notes_modal}
        toggle={() => {
          closeNotesModal();
        }}
        centered
      >
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ height: "300px" }} className="px-3 mx-n3 mb-2">
              {!!notesList &&
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
                            title={emp_details.fname}
                          >
                            <span
                              className="first_letter"
                              style={{ color: "white" }}
                            >
                              {emp_details.fname.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1 ms-3">
                        <h5 className="fs-13">
                          {emp_details.fname}{" "}
                          <small className="text-muted ms-2">
                            {/* 20 Dec 2021 - 05:47AM */}
                            {GetAmPmDateTime(d?.created_time)}
                          </small>
                        </h5>
                        <p className="text-muted">{d?.message}</p>
                      </div>
                    </div>
                  );
                })}
            </SimpleBar>
            <form className="mt-4">
              <Row className="g-3">
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
                <Col xs={12} className="text-end">
                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn w-sm btn-light"
                      data-bs-dismiss="modal"
                      onClick={closeNotesModal}
                    >
                      Close
                    </button>

                    {!!notesUpdateObj?.notes &&
                      (notesUpdateObj?.notes).trim().length > 0 && (
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
    </Fragment>
  );
};

export default AttendanceEmployeeTable;
