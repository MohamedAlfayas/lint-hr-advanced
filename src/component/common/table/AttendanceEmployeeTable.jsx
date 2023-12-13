import React, { Fragment, useState } from "react";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Badge, Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { hr_status } from "../../../common/constant/Constants";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import SimpleBar from "simplebar-react";

const AttendanceEmployeeTable = () => {
  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);

  const ws_data = GetLocalStorageData("work_schedule") || [];
  const holiday_data = GetLocalStorageData("holiday") || [];
  const leave_types_data = GetLocalStorageData("leave_types") || [];

  const [timeline_modal, settimeline_modal] = useState(false);

  function open_timeline(rowData) {
    settimeline_modal(!timeline_modal);
  }

  const Attendance_data1 = [
    {
      id: 16,
      employee: 40,
      date: "2023-10-26T11:22:20.785092Z",
      work_schedule: 7,
      is_present: true,
      total_work_duration: 224,
      total_break_duration: 54,
      currently_checked_in: false,
      total_no_of_check_in: 3,
      total_no_of_check_out: 3,
      status: false,
      is_properly_closed: true,
      is_holiday: false,
      holiday: 0,
      is_leave_approved: false,
      leave_approval: 0,
      is_week_off: false,
      week_off_day: null,
      leave_taken_without_approval: false,
      paid_hr: "",
      ot_hr: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      hr_status: 1,

      entry_log: [
        {
          id: 78,
          entry_time: "2023-10-26T11:22:20.785092Z",
          entry_type: 1,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 79,
          entry_time: "2023-10-26T11:23:28.133874Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 80,
          entry_time: "2023-10-26T11:23:35.009025Z",
          entry_type: 1,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 81,
          entry_time: "2023-10-26T11:23:54.387661Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 82,
          entry_time: "2023-10-26T11:24:41.136607Z",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 83,
          entry_time: "2023-10-26T11:26:58.080142Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, ",
        },
      ],
    },
    {
      id: 16,
      employee: 40,
      date: "2023-10-26T11:22:20.785092Z",
      work_schedule: 7,
      is_present: true,
      total_work_duration: 224,
      total_break_duration: 54,
      currently_checked_in: false,
      total_no_of_check_in: 3,
      total_no_of_check_out: 3,
      status: false,
      is_properly_closed: true,
      is_holiday: false,
      holiday: 0,
      is_leave_approved: false,
      leave_approval: 0,
      is_week_off: false,
      week_off_day: null,
      leave_taken_without_approval: false,
      paid_hr: "",
      ot_hr: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      hr_status: 1,

      entry_log: [
        {
          id: 78,
          entry_time: "2023-10-26T11:22:20.785092Z",
          entry_type: 1,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 79,
          entry_time: "2023-10-26T11:23:28.133874Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 80,
          entry_time: "2023-10-26T11:23:35.009025Z",
          entry_type: 1,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 81,
          entry_time: "2023-10-26T11:23:54.387661Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 82,
          entry_time: "2023-10-26T11:24:41.136607Z",
          entry_type: 1,
          punched_by: 1,
          location: "Lintcloud, Vallioor",
        },
        {
          id: 83,
          entry_time: "2023-10-26T11:26:58.080142Z",
          entry_type: 2,
          punched_by: 2,
          location: "Lintcloud, ",
        },
      ],
    },
  ];

  const InOutCell = ({ rowData, dataKey, ...props }) => {
    let in_count = rowData.entry_log.filter(function (i) {
      return i.entry_type == 1;
    }).length;

    let out_count = rowData.entry_log.filter(function (i) {
      return i.entry_type == 2;
    }).length;

    let at_time =
      rowData.entry_log && rowData.entry_log.length > 0 && dataKey == "in"
        ? rowData.entry_log.filter(function (i) {
            return i.entry_type == 1;
          })[0].entry_time
        : rowData.entry_log && rowData.entry_log.length > 0 && dataKey == "out"
        ? rowData.entry_log.filter(function (i) {
            return i.entry_type == 2;
          })[out_count - 1].entry_time
        : "---";

    return (
      <Cell {...props} className="link-group">
        {rowData.entry_log && rowData.entry_log.length > 0 ? (
          <>
            {format(new Date(at_time), "p")}

            <Link
              className="link-opacity-75 ms-1"
              href="#"
              onClick={() => open_timeline(rowData)}>
              +{dataKey == "in" ? in_count : out_count}
              &nbsp;
              {in_count != out_count ? (
                <i class="ri-error-warning-line text-warning fs-5"></i>
              ) : (
                ""
              )}
            </Link>
          </>
        ) : (
          ""
        )}
      </Cell>
    );
  };
  const LocationCell = ({ rowData, dataKey, ...props }) => {
    let out_count = rowData.entry_log.filter(function (i) {
      return i.entry_type == 2;
    }).length;
    let at_location =
      rowData.entry_log && rowData.entry_log.length > 0 && dataKey == "in"
        ? rowData.entry_log.filter(function (i) {
            return i.entry_type == 1;
          })[0].location
        : rowData.entry_log && rowData.entry_log.length > 0 && dataKey == "out"
        ? rowData.entry_log.filter(function (i) {
            return i.entry_type == 2;
          })[out_count - 1].location
        : "---";
    return (
      <Cell {...props} className="link-group">
        <i className="mdi mdi-map-marker-outline"></i> {at_location}
      </Cell>
    );
  };

  const WorkScheduleCell = ({ rowData, dataKey, ...props }) => {
    let at_ws_data = ws_data.filter(function (i) {
      return i.id == rowData.work_schedule;
    });

    let at_ws = at_ws_data && at_ws_data.length == 1 ? at_ws_data[0] : "";

    return (
      <Cell {...props} className="link-group">
        {at_ws.fullday_hr} : {at_ws.fullday_min} Hr
      </Cell>
    );
  };

  const SecondsToTimeCell = ({ rowData, dataKey, ...props }) => {
    console.log(rowData[dataKey]);
    return (
      <Cell {...props} className="link-group">
        {rowData[dataKey] != 0
          ? new Date(rowData[dataKey] * 1000).toISOString().slice(11, 16) +
            " Hr"
          : ""}{" "}
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
        className="mb-5">
        <Column width={175} align="center" fixed="left">
          <HeaderCell>Date</HeaderCell>
          <Cell dataKey="date" className="fw-bold">
            {(rowData, rowIndex) => {
              console.log(rowData);
              let val = format(new Date(rowData.date), "dd MMM, yyyy");
              return val;
            }}
          </Cell>
        </Column>
        <Column width={130}>
          <HeaderCell>IN</HeaderCell>
          <InOutCell dataKey="in" />
        </Column>
        <Column width={150}>
          <HeaderCell>IN Location</HeaderCell>
          <LocationCell dataKey="in" />
        </Column>
        <Column width={130}>
          <HeaderCell>OUT</HeaderCell>
          <InOutCell dataKey="out" />
        </Column>
        <Column width={150}>
          <HeaderCell>OUT Location</HeaderCell>
          <LocationCell dataKey="out" />
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
          <Cell dataKey="employee" />
        </Column>
        <Column width={100}>
          <HeaderCell>Notes</HeaderCell>
          <Cell dataKey="employee" />
        </Column>

        <Column width={80} fixed="right">
          <HeaderCell>Action</HeaderCell>

          <Cell style={{ padding: "6px" }}>
            {(rowData) => (
              <Button
                appearance="link"
                onClick={() => alert(`name:${rowData.date}`)}>
                Edit
              </Button>
            )}
          </Cell>
        </Column>
      </Table>
      <Modal
        isOpen={timeline_modal}
        toggle={() => {
          open_timeline();
        }}
        centered>
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
              }}>
              Continue
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default AttendanceEmployeeTable;
