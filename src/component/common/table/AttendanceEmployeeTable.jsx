import React, { Fragment, useState } from "react";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { hr_status } from "../../../common/constant/Constants";
import { Link } from "react-router-dom";
import { parse, format } from "date-fns";
import SimpleBar from "simplebar-react";

const AttendanceEmployeeTable = () => {
  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);

  const ws_data = GetLocalStorageData("work_schedule") || [];
  const holiday_data = GetLocalStorageData("holiday") || [];
  const leave_types_data = GetLocalStorageData("leave_types") || [];

  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);

  function open_timeline(rowData) {
    settimeline_modal(!timeline_modal);
  }

  function open_notes_modal(rowData) {
    setNotes_modal(!notes_modal);
  }

  const Attendance_data1 = [
    {
      id: 31,
      employee_id: 40,
      work_schedule_id: 8,
      is_present: true,
      date: "2023-12-14",
      total_work_duration: 4042,
      total_break_duration: 102219,
      currently_checked_in: true,
      total_no_of_check_in: 13,
      total_no_of_check_out: 12,
      first_check_in: "14-12-2023 10:34:57",
      last_check_out: "15-12-2023 16:05:50",
      first_check_in_location: "Lintcloud",
      last_check_out_location: "Lintcloud",
      status: true,
      is_properly_closed: true,
      is_holiday: false,
      holiday_id: 0,
      is_leave_approved: false,
      leave_approval_id: 0,
      is_week_off: false,
      week_off_day: null,
      leave_taken_without_approval: false,
      paid_hr: 0,
      ot_hr: 0,
      is_paid_hr_edit: false,
      is_ot_hr_edit: false,
      notes: [],
      hr_status: 1,
      entry_log: [
        {
          id: 348,
          entry_time: "14-12-2023 10:34:57",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 349,
          entry_time: "14-12-2023 10:35:05",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 350,
          entry_time: "14-12-2023 10:35:53",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 351,
          entry_time: "14-12-2023 10:36:06",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 352,
          entry_time: "15-12-2023 14:47:27",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 353,
          entry_time: "15-12-2023 14:52:08",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 354,
          entry_time: "15-12-2023 14:55:33",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 355,
          entry_time: "15-12-2023 14:57:06",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 356,
          entry_time: "15-12-2023 14:58:57",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 357,
          entry_time: "15-12-2023 14:59:31",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 358,
          entry_time: "15-12-2023 14:59:37",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 359,
          entry_time: "15-12-2023 14:59:42",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 360,
          entry_time: "15-12-2023 14:59:47",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 361,
          entry_time: "15-12-2023 15:00:19",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 362,
          entry_time: "15-12-2023 15:00:31",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 363,
          entry_time: "15-12-2023 15:05:08",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 364,
          entry_time: "15-12-2023 15:08:35",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 365,
          entry_time: "15-12-2023 15:14:31",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 366,
          entry_time: "15-12-2023 15:16:36",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 367,
          entry_time: "15-12-2023 15:16:46",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 368,
          entry_time: "15-12-2023 15:16:50",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 369,
          entry_time: "15-12-2023 15:22:03",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 370,
          entry_time: "15-12-2023 15:22:10",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 371,
          entry_time: "15-12-2023 16:05:50",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 372,
          entry_time: "15-12-2023 16:05:59",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
      ],
    },
    {
      id: 30,
      employee_id: 40,
      work_schedule_id: 8,
      is_present: true,
      date: "2023-12-13",
      total_work_duration: 161,
      total_break_duration: 693,
      currently_checked_in: false,
      total_no_of_check_in: 2,
      total_no_of_check_out: 2,
      first_check_in: "13-12-2023 15:45:56",
      last_check_out: "13-12-2023 16:00:10",
      first_check_in_location: "Lintcloud",
      last_check_out_location: "Lintcloud",
      status: false,
      is_properly_closed: true,
      is_holiday: false,
      holiday_id: 0,
      is_leave_approved: false,
      leave_approval_id: 0,
      is_week_off: false,
      week_off_day: null,
      leave_taken_without_approval: false,
      paid_hr: 0,
      ot_hr: 0,
      is_paid_hr_edit: false,
      is_ot_hr_edit: false,
      notes: [],
      hr_status: 1,
      entry_log: [
        {
          id: 344,
          entry_time: "13-12-2023 15:45:56",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 345,
          entry_time: "13-12-2023 15:47:01",
          entry_type: 2,
          punched_by: 1,
          location: "Lintcloud",
        },
        {
          id: 346,
          entry_time: "13-12-2023 15:58:34",
          entry_type: 1,
          punched_by: 2,
          location: "Lintcloud",
        },
        {
          id: 347,
          entry_time: "13-12-2023 16:00:10",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud",
        },
      ],
    },
  ];

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
      ? format(
          parse(rowData?.first_check_in, "dd-MM-yyyy HH:mm:ss", new Date()),
          "h:mm a"
        )
      : null;
    let out_time = rowData?.last_check_out
      ? format(
          parse(rowData?.last_check_out, "dd-MM-yyyy HH:mm:ss", new Date()),
          "h:mm a"
        )
      : null;
    let thisCellTime = dataKey === "in" ? in_time : out_time;

    return (
      <Cell {...props} className="link-group">
        {!!thisCellTime && thisCellTime}
        {!!thisCellTime && (
          <Link
            className="link-opacity-75 ms-1"
            href="#"
            onClick={() => open_timeline(rowData)}
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

    return (
      <Cell {...props} className="link-group">
        <i className="mdi mdi-map-marker-outline"></i>{" "}
        {dataKey === "in" ? in_location : out_location}
      </Cell>
    );
  };

  const WorkScheduleCell = ({ rowData, dataKey, ...props }) => {
    let at_ws_data = ws_data.find(function (i) {
      return i.id == rowData.work_schedule_id;
    });

    let fullday_hr = at_ws_data?.fullday_hr || "";
    let fullday_min = at_ws_data?.fullday_min || "";

    return (
      <Cell {...props} className="link-group">
        {fullday_hr} : {fullday_min} Hr
      </Cell>
    );
  };

  const SecondsToTimeCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        {rowData[dataKey] != 0
          ? new Date(rowData[dataKey] * 1000).toISOString().slice(11, 16) +
            " Hr"
          : ""}{" "}
      </Cell>
    );
  };

  const HrStatusCell = ({ rowData, dataKey, ...props }) => {
    let at_hr_status_data = hr_status.find(function (i) {
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
          onClick={() => open_notes_modal(rowData)}
        >
          {rowData.notes.length} Notes
        </Link>
      </Cell>
    );
  };

  const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
    const editing = rowData.status === "EDIT";
    return (
      <Cell {...props} className={editing ? "table-content-editing" : ""}>
        {editing ? (
          <input
            className="rs-input"
            defaultValue={rowData[dataKey]}
            onChange={(event) => {
              onChange && onChange(rowData.id, dataKey, event.target.value);
            }}
          />
        ) : (
          <span className="table-content-edit-span">{rowData[dataKey]}</span>
        )}
      </Cell>
    );
  };

  return (
    <Fragment>
      <Table
        height={400}
        data={Attendance_data1}
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
          <HeaderCell>Total IN</HeaderCell>
          <SecondsToTimeCell dataKey="total_work_duration" />
        </Column>
        <Column width={100}>
          <HeaderCell>Break</HeaderCell>
          <SecondsToTimeCell dataKey="total_break_duration" />
        </Column>
        <Column width={125}>
          <HeaderCell>OT</HeaderCell>
          <SecondsToTimeCell dataKey="ot_hr" />
        </Column>
        <Column width={125}>
          <HeaderCell>Paid Hr</HeaderCell>
          <SecondsToTimeCell dataKey="paid_hr" />
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

          <Cell style={{ padding: "6px" }}>
            {(rowData) => (
              <Button
                appearance="link"
                onClick={() => alert(`name:${rowData.date}`)}
              >
                Edit
              </Button>
            )}
          </Cell>
        </Column>
      </Table>
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
            Date :
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ maxHeight: "410px" }} className="p-3 pt-0">
              <div className="acitivity-timeline acitivity-main">
                <div className="acitivity-item d-flex">
                  <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle">
                      <i className="mdi mdi-arrow-right-thick"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Check IN </h6>
                    <p className="text-muted mb-1">02:14 PM Today </p>
                    <small className="mb-0 text-muted">
                      <i className="mdi mdi-map-marker"></i> Lintcloud, Vallioor
                    </small>
                  </div>
                </div>

                <div className="acitivity-item py-3 d-flex">
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
                </div>
              </div>
            </SimpleBar>
            <Button
              className="btn btn-warning"
              onClick={() => {
                open_timeline(false);
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
          open_notes_modal();
        }}
        centered
      >
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ height: "300px" }} className="px-3 mx-n3 mb-2">
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/72/profile/c436ed58-7f6a-467e-80f0-f2034dad859f.jpg"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Joseph Parker{" "}
                    <small className="text-muted ms-2">
                      20 Dec 2021 - 05:47AM
                    </small>
                  </h5>
                  <p className="text-muted">
                    I am getting message from customers that when they place
                    order always get error message .
                  </p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/67/profile/2e06ae27-9238-458c-b0c7-bd4eba75e835.jpg"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Donald Palmer{" "}
                    <small className="text-muted ms-2">
                      24 Dec 2021 - 05:20PM
                    </small>
                  </h5>
                  <p className="text-muted">
                    If you have further questions, please contact Customer
                    Support from the “Action Menu” on your .
                  </p>
                </div>
              </div>
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/62/profile/8a2e638c-c521-4129-9742-adc05acaae51.webp"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Alexis Clarke{" "}
                    <small className="text-muted ms-2">26 min ago</small>
                  </h5>
                  <p className="text-muted">
                    Your provides you with the most current status of your
                    order. To help manage your order refer to the “Action Menu”
                    to initiate return, contact Customer Support and more.
                  </p>
                </div>
              </div>
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
                  ></textarea>
                </Col>
                <Col xs={12} className="text-end">
                  <button
                    type="button"
                    className="btn btn-ghost-secondary btn-icon waves-effect me-1"
                  >
                    <i className="ri-attachment-line fs-16"></i>
                  </button>
                  <Link to="#" className="btn btn-success">
                    Post Notes
                  </Link>
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
