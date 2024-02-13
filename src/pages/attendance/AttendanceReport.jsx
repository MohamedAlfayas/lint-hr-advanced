import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { MetaTitle } from "../../common/data/MetaTitle";
import CountUp from "react-countup";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { parse, format } from "date-fns";
import { Link } from "react-router-dom";
import { MonthFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../common/api/Api";
import { setTeamDailyAttendanceReport } from "../../redux/reducers/ChildReducer/TeamDailyAttendanceReportReducer";
import { ParseTime } from "../../common/js/ParseTime";
import * as XLSX from 'xlsx';

const AttendanceReport = () => {
  document.title = `Attendance Report | ${MetaTitle}`;

  const { Column, HeaderCell, Cell, ColumnGroup } = Table;
  const [loading, setLoading] = React.useState(false);

  const dispatch = useDispatch();

  const employee_data = GetLocalStorageData("employee") || [];

  const { team_daily_attendance_report } = useSelector(
    (state) => state.TeamDailyAttendanceReportReducer
  );

  console.log("Team Daily Att Rep = ", team_daily_attendance_report);

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    getReportData(thisMonth);
  }, []);

  const getReportData = (thisMonth) => {
    dispatch(setLoaderVisible(true));

    Api({
      type: "GET",
      url: "report/get-team-daily-attendance-report/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setTeamDailyAttendanceReport(res?.data?.data));
        dispatch(setLoaderVisible(false));
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
        dispatch(setLoaderVisible(false));
      });
  };

  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${new Date()
      .getMonth()
      .toString()
      .padStart(2, "0")}`,
  });
  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys({
      ...filterKeys,
      month: monthStr,
    });
  };
  const employeeDatesXls = Array.from(
    new Set(
      team_daily_attendance_report.flatMap((employee) =>
        employee.workday_data.map((report) => report.date)
      )
    )
  );


const handleExport = () => {
  const wb = XLSX.utils.book_new();

  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Add headers
  const headers = ['Employee Name', 'Email'];
  const subheaders = ['', ''];
  employeeDatesXls.forEach(date => {
      headers.push(formatDate(date));
      subheaders.push('Attendance', 'Check-in', 'Check-out');
  });
  headers.push('Total Days', 'Present Days'); // Add more headers as needed
  XLSX.utils.sheet_add_aoa(ws, [headers, subheaders], { origin: 'A1' });

  // Loop through each row of team_daily_attendance_report
  team_daily_attendance_report.forEach((rowData, rowIndex) => {
      const row = [];

      // Find employee data
      const foundEmployee = employee_data.find(emp => rowData.employee_id === emp.id);
      const emp_name = foundEmployee ? foundEmployee.fname : '';

      // Add employee name and email to row
      row.push(emp_name);
      row.push(foundEmployee ? foundEmployee.email : '');

      // Loop through dynamic columns
      employeeDatesXls.forEach(date => {
          const attendance_data = rowData.workday_data.find(day => day.date === date);
          let attend_data =
              attendance_data && attendance_data.is_present === true ? 'P' :
              attendance_data && attendance_data.is_holiday === true ? 'H' :
              attendance_data && attendance_data.is_day_on === false ? 'WO' :
              attendance_data && attendance_data.is_leave_approved === true ? 'L' :
              attendance_data && attendance_data.leave_taken_without_approval === true ? 'A' :
              'A';

          // Add attendance data
          row.push(attend_data);

          // Add check-in and check-out times
          if (attendance_data) {
              const checkInLog = attendance_data.entry_log.find(log => parseInt(log.entry_type) === 1);
              const checkOutLog = attendance_data.entry_log.slice().reverse().find(log => parseInt(log.entry_type) !== 1);
              const firstCheckIn = checkInLog ? format(ParseTime(checkInLog.entry_time), "h:mm a") : '';
              const lastCheckOut = checkOutLog ? format(ParseTime(checkOutLog.entry_time), "h:mm a") : '';
              row.push(firstCheckIn);
              row.push(lastCheckOut);
          } else {
              row.push('');
              row.push('');
          }
      });

      // Add additional columns
      row.push(rowData.total_working_days_count);
      row.push(rowData.total_present_days_count);

      // Add row to worksheet
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${rowIndex + 3}` });
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "MySheet");

  // Write workbook to file
  XLSX.writeFile(wb, "AttendanceReport.xlsx");
};





  function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear().toString().substr(2); // Get last 2 digits of the year
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(dateObj);
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${day} ${month} ${year}`;
  }
  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
console.log("list",timelineList);
  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const FixedColumns = ({ rowData, dataKey, ...props }) => {
    let foundEmployee;
    let emp_name = (foundEmployee = employee_data.find(
      (emp) => rowData.employee_id === emp.id
    ));

    console.log("emp_name", emp_name);

    let html_tag = emp_name.profile_url ? (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <img
            src={emp_name.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
                {emp_name.fname}
              </h5>
            </Link>
          </div>
          <div className="fs-14 mb-1" style={{ textAlign: "left" }}>
            {emp_name.email}
          </div>
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
            title={emp_name.fname}
          >
            <span className="first_letter" style={{ color: "white" }}>
              {emp_name.fname.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
                {emp_name.fname}
              </h5>
            </Link>
          </div>
          <div className="fs-14 mb-1" style={{ textAlign: "left" }}>
            {emp_name.email}
          </div>
        </div>
      </div>
    );
    return (
      <Cell {...props} dataKey="id">
        {html_tag}
      </Cell>
    );
  };

  const dynamicColumns = () => {
    const allDynamicColumns = [];

    const employeeDates = Array.from(
      new Set(
        team_daily_attendance_report.flatMap((employee) =>
          employee.workday_data.map((report) => report.date)
        )
      )
    );

    const AttendanceData = ({ rowData, date, ...props }) => {
      const attendance_data = rowData.workday_data.find(
        (day) => day.date === date
      );
      console.log("attendance_data", attendance_data);
      let attend_data =
        attendance_data.is_present === true
          ? "P"
          : attendance_data.is_holiday === true
            ? "H"
            : attendance_data.is_day_on === false
              ? "WO"
              : attendance_data.is_leave_approved === true
                ? "L"
                : attendance_data.leave_taken_without_approval === true
                  ? "A"
                  : "A";
      return (
        <Cell {...props} dataKey={`is_present${date}`}>
          {attend_data}
        </Cell>
      );
    };

    const InOut = ({ rowData, date, ...props }) => {
      const entryLogForDate = rowData.workday_data.find(
        (day) => day.date === date
      );
      const entryLogLength = entryLogForDate
        ? entryLogForDate.entry_log.length
        : "-";

      return (
        <Cell {...props} dataKey={`entry_log_${date}`}>
          {!!entryLogLength && entryLogLength}
          {!!entryLogLength && entryLogLength > 0 ? (
            <div>
              {" "}
              <Link
                className="link-opacity-75 ms-1"
                href="#"
                style={{ color: "#0AB39C" }}
                onClick={() => {
                  setTimelineList(entryLogForDate?.entry_log);
                  setTimeLineDate(
                    format(new Date(entryLogForDate?.date), "dd MMM, yyyy")
                  );
                  open_timeline();
                }}
              >
                view
              </Link>
            </div>
          ) : (
            <span>-</span>
          )}
        </Cell>
      );
    };

    employeeDates.forEach((date) => {
      const dynamicColumn = (
        <ColumnGroup
          key={`date_${date}`}
          align="center"
          header={formatDate(date)}
        >
          <Column width={100} align="center">
            <HeaderCell>Attendance</HeaderCell>
            <AttendanceData date={date} />
          </Column>

          <Column width={80} align="center" title="In">
            <HeaderCell>In/Out</HeaderCell>
            <InOut date={date} />
          </Column>
        </ColumnGroup>
      );

      allDynamicColumns.push(dynamicColumn);
    });

    return allDynamicColumns;
  };

  const additionalColumns = [
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",

          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Total Days
      </HeaderCell>
      <Cell dataKey="total_working_days_count" fullText />
    </Column>,
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",

          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Present Days
      </HeaderCell>
      <Cell dataKey="total_present_days_count" fullText />
    </Column>,
  ];

  const allColumns = [...dynamicColumns(), ...additionalColumns];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2">
                <Col xl={2}>
                  <div className="form-icon right">
                    <DatePicker
                      value={dayjs(filterKeys?.month, MonthFormat)}
                      format={MonthFormat}
                      picker="month"
                      allowClear={false}
                      className="form-control"
                      placeholder="Select Month"
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </Col>
                <Button
                  type="button"
                  className="btn btn-info"
                  onClick={handleExport}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '80px' }}
                >
                  <i className="ri-file-download-line align-bottom me-1"></i>
                  Export
                </Button>
              </Row>




            </CardHeader>
          </Card>
        </Container>
        <Table
          bordered
          cellBordered
          height={420}
          headerHeight={60}
          data={team_daily_attendance_report || []}
          rowHeight={60}
          autoHeight={true}
          loading={loading}
          className="mb-5"
        >
          <Column width={250} fixed="left" align="center">
            <HeaderCell
              style={{
                background: "#e6f7ff",
                borderRadius: "1px",
                padding: "18px",
              }}
            >
              Employee
            </HeaderCell>
            <FixedColumns />
          </Column>
          {allColumns}
        </Table>
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
      <table className="table">
        <thead>
          <tr>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {timelineList.length &&
            timelineList.map((data, idx) => {
              let py_class =
                idx === 0 || idx === timelineList.length - 1 ? "" : "py-3";
              let isCheckIn = parseInt(data.entry_type) === 1;
              let checkType = isCheckIn ? "Check In" : "Check Out";
              let iconClass = isCheckIn ? "mdi mdi-arrow-right-thick" : "mdi mdi-arrow-left-thick";
              let time = format(ParseTime(data.entry_time), "h:mm a");
              return (
                <tr className={py_class}>
                  <td>
                    {isCheckIn && (
                      <>
                        <div className={`avatar-title bg-success-subtle text-success rounded-circle`}>
                          <i className={`mdi ${iconClass}`}></i>
                        </div>
                        <h6 className="mb-1 lh-base">{checkType}</h6>
                        <p className="text-muted mb-1">{time}</p>
                      </>
                    )}
                  </td>
                  <td>
                    {!isCheckIn && (
                      <>
                        <div className={`avatar-title bg-warning-subtle text-warning rounded-circle`}>
                          <i className={`mdi ${iconClass}`}></i>
                        </div>
                        <h6 className="mb-1 lh-base">{checkType}</h6>
                        <p className="text-muted mb-1">{time}</p>
                      </>
                    )}
                  </td>
                  <td>
                    <small className="mb-0 text-muted">
                      <i className="mdi mdi-map-marker"></i> {data.location || ""}
                    </small>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </SimpleBar>
    <Button className="btn btn-warning" onClick={() => { open_timeline(); }}>
      Continue
    </Button>
  </div>
</ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default AttendanceReport;
