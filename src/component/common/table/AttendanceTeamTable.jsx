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
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { hr_status } from "../../../common/constant/Constants";
import { Link } from "react-router-dom";
import { parse, format } from "date-fns";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";
import { ConvertSecondsToTime } from "../../../common/js/ConvertSecondsToTime";

const AttendanceTeamTable = () => {
  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);

  const ws_data = GetLocalStorageData("work_schedule") || [];
  const holiday_data = GetLocalStorageData("holiday") || [];
  const leave_types_data = GetLocalStorageData("leave_types") || [];
  const employee_data = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);

  const { team_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );

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
      workday_data: [
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
      workday_data: [
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

  const TeamAttendance = [
    {
      employee_id: 40,
      department_id: 9,
      ws_total_hr: "180",
      paied_hr: "170",
      ot_hr: "5h",
      hr_status: 1,
      workday_data: [
        {
          date: "01-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "02-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "03-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "04-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "05-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "06-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "07-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "08-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "09-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "10-12-2023 15:45:56",
          paid_hr: 28800,
        },
      ],
    },
    {
      employee_id: 42,
      department_id: 10,
      ws_total_hr: "180",
      paied_hr: "170",
      ot_hr: "5h",
      hr_status: 1,
      workday_data: [
        {
          date: "01-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "02-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "03-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "04-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "05-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "06-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "07-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "08-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "09-12-2023 15:45:56",
          paid_hr: 28800,
        },
        {
          date: "10-12-2023 15:45:56",
          paid_hr: 0,
        },
      ],
    },
  ];

  const EmployeeCell = ({ rowData, dataKey, ...props }) => {
    let at_employee_data = employee_data.find(function (i) {
      return i.id == rowData.employee_id;
    });

    let html_tag = at_employee_data.profile_url ? (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <img
            src={at_employee_data.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1">{at_employee_data.fname}</h5>
            </Link>
          </div>
          <div>{at_employee_data.email}</div>
        </div>
      </div>
    ) : (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <div
            className="avatar-xs rounded-circle"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#0ab39c",
            }}
            data-bs-toggle="tooltip"
            title={at_employee_data.fname}
          >
            <span className="first_letter" style={{ color: "white" }}>
              {at_employee_data.fname.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1">{at_employee_data.fname}</h5>
            </Link>
          </div>
          <div>{at_employee_data.email}</div>
        </div>
      </div>
    );

    return (
      <Cell {...props} className="link-group">
        {html_tag}
      </Cell>
    );
  };

  const DepartmentCell = ({ rowData, dataKey, ...props }) => {
    let thisDepartment = DepartmentData
      ? DepartmentData.filter((data) =>
          rowData.primary_department_id_list.includes(data.id)
        )
      : [];

    let firstDep_name = thisDepartment?.length ? thisDepartment[0].name : "";

    let subDepList = thisDepartment?.length
      ? thisDepartment.filter((datas, index) => {
          if (index !== 0) {
            return datas;
          }
        })
      : [];

    return (
      <Cell {...props} className="link-group">
        <span>
          <Button
            color="light"
            id={`depListRef-${rowData.employee_id}`}
            className="position-relative"
          >
            <React.Fragment>{firstDep_name}</React.Fragment>
            {subDepList.length > 0 ? (
              <span>
                <Badge
                  //id="tooltipwithHtml"
                  pill
                  color="success"
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  +{subDepList.length}
                  <span className="visually-hidden">Departments</span>
                </Badge>

                <UncontrolledTooltip
                  placement="bottom"
                  target={`depListRef-${rowData.employee_id}`}
                >
                  {" "}
                  <div className="mt-1">
                    {subDepList.map((item, key) => (
                      <p className="mb-1">{item.name}</p>
                    ))}
                  </div>{" "}
                </UncontrolledTooltip>
              </span>
            ) : (
              ""
            )}
          </Button>
        </span>
      </Cell>
    );
  };

  const WSHourCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <div>
          <div className="d-flex mb-2">
            <div className="flex-grow-1">
              <div>Progress </div>
            </div>
            <div className="flex-shrink-0">
              <div>
                {` ${ConvertSecondsToTime(rowData.total_paid_hr_in_seconds)}`}/
                {` ${ConvertSecondsToTime(
                  rowData.total_work_schedule_hr_without_break_in_seconds
                )}`}
              </div>
            </div>
          </div>
          <div className="progress progress-sm animated-progess">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                width: Math.round(
                  (rowData.total_paid_hr_in_seconds /
                    rowData.total_work_schedule_hr_without_break_in_seconds) *
                    100 *
                    2
                ),
              }}
            ></div>
          </div>
        </div>
      </Cell>
    );
  };

  const DynamicHourColumn = ({ rowData, dataKey, ...props }) => {
    let at_employee_data = employee_data.find(function (i) {
      return i.id == rowData.employee_id;
    });
    let at_employee_DepartmentData = DepartmentData.find(function (i) {
      return i.id == at_employee_data.primary_department_id;
    });

    {
      rowData.workday_data.map((item, key) => (
        <Column width={200}>
          <HeaderCell>Date</HeaderCell>
          <Cell dataKey="ws_hours">paid_hr</Cell>
        </Column>
      ));
    }

    return "";
  };

  const fixedColumns = [
    <Column width={250} fixed="left">
      <HeaderCell>Employee</HeaderCell>
      <EmployeeCell dataKey="employee" fullText />
    </Column>,
    <Column width={200} fixed="left">
      <HeaderCell>Paid Time / Work Schedule</HeaderCell>
      <WSHourCell
        dataKey="total_work_schedule_hr_without_break_in_seconds"
        fullText
      />
    </Column>,
    <Column width={200} fixed="left">
      <HeaderCell>Department</HeaderCell>
      <DepartmentCell dataKey="primary_department_id_list" fullText />
    </Column>,
  ];

  const dynamicColumns =
    team_attendance_report_data.length > 0
      ? team_attendance_report_data[0].workday_data.map((day, index) => (
          <Column key={`dynamic_${index}`} width={100} align="center">
            <HeaderCell>
              {" "}
              {format(new Date(day.date), "dd MMM, yyyy")}
            </HeaderCell>
            {/* <Cell dataKey={`workday_data[${index}].final_paid_hr_in_seconds`} /> */}
            <Cell>
              {(rowData) => {
                let result_text = "";
                let result_text_color = "black";

                if (rowData.workday_data[index].is_holiday === true) {
                  let holiday_name =
                    holiday_data.find(
                      (d) => d.id === rowData.workday_data[index].holiday_id
                    ).name || "";
                  result_text = holiday_name;
                  result_text_color = "green";
                } else if (rowData.workday_data[index].is_week_off === true) {
                  result_text =
                    rowData.workday_data[index].week_off_day_name || "";
                  result_text_color = "blue";
                } else if (
                  rowData.workday_data[index].is_leave_approved === true
                ) {
                  result_text = "Leave";
                  result_text_color = "orange";
                } else if (
                  rowData.workday_data[index].leave_taken_without_approval ===
                  true
                ) {
                  result_text = "Inactive";
                  result_text_color = "red";
                } else if (
                  rowData.workday_data[index].is_attendance_exists === false
                ) {
                  result_text = "-";
                  result_text_color = "black";
                } else {
                  result_text =
                    parseInt(
                      rowData.workday_data[index].final_paid_hr_in_seconds
                    ) > 0
                      ? ConvertSecondsToTime(
                          rowData.workday_data[index].final_paid_hr_in_seconds
                        )
                      : "00:00Hr";
                  result_text_color = "black";
                }

                return (
                  <span style={{ color: result_text_color }}>
                    {result_text}
                  </span>
                );
              }}
            </Cell>
          </Column>
        ))
      : [];

  const actionColumn = (
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
  );

  const allColumns = [...fixedColumns, ...dynamicColumns, actionColumn];

  return (
    <Fragment>
      <Table
        height={400}
        data={team_attendance_report_data}
        rowHeight={60}
        autoHeight={true}
        loading={loading}
        bordered={true}
        affixHorizontalScrollbar
        className="mb-5"
      >
        {allColumns}
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

export default AttendanceTeamTable;
