import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row, Container } from "reactstrap";
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
import { useSelector } from "react-redux";
import { DatePicker } from "antd";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
const AttendanceReport = () => {
  const { Column, HeaderCell, Cell, ColumnGroup } = Table;
  document.title = `Attendance Report | ${MetaTitle}`;
  const [loading, setLoading] = React.useState(false);

  const employee_data = GetLocalStorageData("employee") || [];
  const { team_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );
  console.log("team_attendance_report_data = ", team_attendance_report_data);

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
  const reportList = [
    {
      user_id: 4,
      user_name: "Elango RV",
      first_name: "Elango",
      last_name: "RV",
      user_profile_img:
        "https://lystloc.com/account/api/uploads/user-profile-image/11302018165906-1322.jpg",
      s3_profile_img: "",
      reporting: true,
      location_id: 10595,
      trip_id: "",
      emp_id: "MB10767",
      reports: [
        {
          present: 0,
          date: "01 Jan",
          emp_id: "MB10767",
          name_1: "Elango RV",
          sessions: 0,
          checkins: [],
          in_time: "10:00",
          out_time: "06:30",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "A",
        },
        {
          present: 0,
          date: "02 Jan",
          emp_id: "MB10767",
          name_1: "Divya Ramasamy",
          sessions: 0,
          checkins: [],
          in_time: "09:45",
          out_time: "06:30",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "A",
        },
        {
          present: 0,
          date: "03 Jan",
          emp_id: "MB10767",
          name_1: "Divya Ramasamy",
          sessions: 0,
          checkins: [],
          in_time: "09:30",
          out_time: "5:30",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "A",
        },
      ],
      total_days: 3,
      present_days: 5,
      absent_days: 3.0,
      totalCheckIns: 2,
      totalKms: 0.0,
      total_hrs: "0",
    },
    {
      user_id: 5,
      user_name: "Dinesh Thalavai",
      first_name: "Dinesh",
      last_name: "Thalavai",
      user_profile_img:
        "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      s3_profile_img: "",
      reporting: true,
      location_id: 10595,
      trip_id: "",
      emp_id: "EMP012",
      reports: [
        {
          present: 0,
          date: "01 Jan",
          emp_id: "EMP012",
          name_1: "Aparna ",
          sessions: 0,
          checkins: [],
          in_time: "10:30",
          out_time: "03:30",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "B",
        },
        {
          present: 0,
          date: "02 Jan",
          emp_id: "EMP012",
          name_1: "Aparna ",
          sessions: 0,
          checkins: [],
          in_time: "11:00",
          out_time: "04:00",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "B",
        },
        {
          present: 0,
          date: "03 Jan",
          emp_id: "EMP012",
          name_1: "Aparna ",
          sessions: 0,
          checkins: [],
          in_time: "12:00",
          out_time: "05:00",
          worked_hours: "",
          logins: [],
          no_of_checkins: 0,
          no_of_logins: 0,
          kms: 0,
          branch: "Coimbatore",
          attendance_status: "B",
        },
      ],
      total_days: 4,
      present_days: 6,
      absent_days: 3.0,
      totalCheckIns: 1,
      totalKms: 0.0,
      total_hrs: "0",
    },
    // {
    //   user_id: 6,
    //   user_name: "Paul Prabhakaran",
    //   first_name: "Paul",
    //   last_name: "Prabhakaran",
    //   user_profile_img:
    //     "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
    //   s3_profile_img: "",
    //   reporting: true,
    //   location_id: 10595,
    //   trip_id: "",
    //   emp_id: "EMP123",
    //   reports: [
    //     {
    //       present: 0,
    //       date: "01 Jan",
    //       emp_id: "EMP123",
    //       name_1: "Aswin T",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "09:30",
    //       out_time: "08:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "C",
    //     },
    //     {
    //       present: 0,
    //       date: "02 Jan",
    //       emp_id: "EMP123",
    //       name_1: "Aswin T",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "12:30",
    //       out_time: "09:30",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "C",
    //     },
    //     {
    //       present: 0,
    //       date: "03 Jan",
    //       emp_id: "EMP123",
    //       name_1: "Aswin T",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "10:00",
    //       out_time: "08:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "C",
    //     },
    //   ],
    //   total_days: 5,
    //   present_days: 5,
    //   absent_days: 3.0,
    //   totalCheckIns: 3,
    //   totalKms: 0.0,
    //   total_hrs: "0",
    // },
    // {
    //   user_id: 39177,
    //   user_name: "Antony Donald",
    //   first_name: "Antony",
    //   last_name: "Donald",
    //   user_profile_img:
    //     "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
    //   s3_profile_img: "",
    //   reporting: true,
    //   location_id: 10595,
    //   trip_id: "",
    //   emp_id: "AND24",
    //   reports: [
    //     {
    //       present: 0,
    //       date: "01 Jan",
    //       emp_id: "AND24",
    //       name_1: "Android 0012 ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "10:00",
    //       out_time: "09:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "D",
    //     },
    //     {
    //       present: 0,
    //       date: "02 Jan",
    //       emp_id: "AND24",
    //       name_1: "Android 0012 ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "10:20",
    //       out_time: "07:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "D",
    //     },
    //     {
    //       present: 0,
    //       date: "03 Jan",
    //       emp_id: "AND24",
    //       name_1: "Android 0012 ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "11:00",
    //       out_time: "09:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "D",
    //     },
    //   ],
    //   total_days: 6,
    //   present_days: 4,
    //   absent_days: 3.0,
    //   totalCheckIns: 3,
    //   totalKms: 0.0,
    //   total_hrs: "0",
    // },
    // {
    //   user_id: 43332,
    //   user_name: "Mohammed Fayas",
    //   first_name: "Fayas",
    //   last_name: "Mohammed",
    //   user_profile_img:
    //     "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
    //   s3_profile_img: "",
    //   reporting: true,
    //   location_id: 10595,
    //   trip_id: "",
    //   emp_id: "MB1192",
    //   reports: [
    //     {
    //       present: 0,
    //       date: "01 Jan",
    //       emp_id: "MB1192",
    //       name_1: "Manoj Prabhu ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "09:30",
    //       out_time: "06:30",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "E",
    //     },
    //     {
    //       present: 0,
    //       date: "02 Jan",
    //       emp_id: "MB1192",
    //       name_1: "Manoj Prabhu ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "09:30",
    //       out_time: "07:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "E",
    //     },
    //     {
    //       present: 0,
    //       date: "03 Jan",
    //       emp_id: "MB1192",
    //       name_1: "Manoj Prabhu ",
    //       sessions: 0,
    //       checkins: [],
    //       in_time: "09:00",
    //       out_time: "06:00",
    //       worked_hours: "",
    //       logins: [],
    //       no_of_checkins: 0,
    //       no_of_logins: 0,
    //       kms: 0,
    //       branch: "Coimbatore",
    //       attendance_status: "E",
    //     },
    //   ],
    //   total_days: 3,
    //   present_days: 3,
    //   absent_days: 3.0,
    //   totalCheckIns: 4,
    //   totalKms: 0.0,
    //   total_hrs: "0",
    // },
  ];

  const EmployeeCell = ({ ...props }) => {
    const EmployeeCell = () => {
      return (
        <div className="link-group">
          {reportList.map((employee) => (
            <div key={employee.id} className="d-flex gap-2 align-items-center">
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
                  title={employee.user_name}
                >
                  <span className="first_letter" style={{ color: "white" }}>
                    {employee.user_name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-grow-1">
                <div>
                  <Link to="#" className="link-body-emphasis mb-0">
                    {" "}
                    <h5 className="fs-14 mb-1">{employee.user_name}</h5>
                  </Link>
                </div>
                {/* Include the employee ID in the component */}
                <div>{employee.id}</div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    return <Cell {...props}>{<EmployeeCell />}</Cell>;
  };

  const TotaldaysCell = ({ ...props }) => {
    const at_employee_data = reportList?.find((val) => val?.user_id);
    let html_tag = at_employee_data && (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1">{at_employee_data.total_days}</h5>
            </Link>
          </div>
        </div>
      </div>
    );

    return (
      <Cell {...props} className="link-group">
        {html_tag}
      </Cell>
    );
  };

  const fixedColumns = [
    <Column width={250} fixed="left" align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",
          border: "2px solid #b5f5ec",
          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Employee
      </HeaderCell>
      <Cell dataKey="user_name" />
    </Column>,
  ];
  const dynamicColumns = (reportList) => {
    const allDynamicColumns = [];

    reportList.forEach((employee) => {
      const employeeDates = Array.from(
        new Set(employee.reports.map((report) => report.date))
      );

      console.log("Employee Dates = ", employeeDates);

      employeeDates.forEach((date) => {
        const report = employee.reports.find((r) => r.date === date);

        if (report) {
          const dynamicColumn = (
            <ColumnGroup
              key={`${employee.user_name}_${date}`}
              align="center"
              header={date}
            >
              <Column width={100} align="center">
                <HeaderCell>Attendance</HeaderCell>
                <Cell dataKey={`attendance_${employee.user_name}_${date}`}>
                  {report.attendance_status}
                </Cell>
              </Column>

              <Column width={80} align="center" title="In">
                <HeaderCell>In</HeaderCell>
                <Cell dataKey={`in_time_${employee.user_name}_${date}`}>
                  {report.in_time}
                </Cell>
              </Column>

              <Column width={80} align="center" title="Out">
                <HeaderCell>Out</HeaderCell>
                <Cell dataKey={`out_time_${employee.user_name}_${date}`}>
                  {report.out_time}
                </Cell>
              </Column>
            </ColumnGroup>
          );

          allDynamicColumns.push(dynamicColumn);
        }
      });
    });

    return allDynamicColumns;
  };

  const additionalColumns = [
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",
          border: "2px solid #b5f5ec",
          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Total Days
      </HeaderCell>
      <Cell dataKey="total_days" fullText />
    </Column>,
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",
          border: "2px solid #b5f5ec",
          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Present Days
      </HeaderCell>
      <Cell dataKey="present_days" fullText />
    </Column>,
    <Column width={150} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",
          border: "2px solid #b5f5ec",
          borderRadius: "1px",
          padding: "18px",
        }}
      >
        Total Check-ins{" "}
      </HeaderCell>
      <Cell dataKey="totalCheckIns" fullText />
    </Column>,
  ];

  const allColumns = [
    fixedColumns.concat(dynamicColumns(reportList)),
    ...additionalColumns,
  ];
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
              </Row>
            </CardHeader>
          </Card>
        </Container>
        <Table
          bordered
          cellBordered
          height={420}
          headerHeight={60}
          data={reportList}
          rowHeight={60}
          autoHeight={true}
          loading={loading}
          className="mb-5"
        >
          {allColumns}
        </Table>
      </div>
    </React.Fragment>
  );
};

export default AttendanceReport;
