import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import { MonthFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { Table } from "rsuite";
const { Column, HeaderCell, Cell } = Table;
import { Card, CardBody, CardHeader, Col, Row, Container } from "reactstrap";
import CountUp from "react-countup";
import { extend } from "lodash";

const AttendanceReport = () => {
  const reportList = [
    {
      user_id: 1322,
      user_name: "Divya Ramasamy",
      first_name: "Divya",
      last_name: "Ramasamy",
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
          name_1: "Divya Ramasamy",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          in_time: "-",
          out_time: "-",
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
          in_time: "-",
          out_time: "-",
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
      present_days: 0.0,
      absent_days: 3.0,
      totalCheckIns: 0,
      totalKms: 0.0,
      total_hrs: "0",
    },
    {
      user_id: 25955,
      user_name: "Aparna ",
      first_name: "Aparna",
      last_name: "",
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
          in_time: "-",
          out_time: "-",
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
          emp_id: "EMP012",
          name_1: "Aparna ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "EMP012",
          name_1: "Aparna ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
      present_days: 0.0,
      absent_days: 3.0,
      totalCheckIns: 0,
      totalKms: 0.0,
      total_hrs: "0",
    },
    {
      user_id: 35577,
      user_name: "Aswin T",
      first_name: "Aswin",
      last_name: "T",
      user_profile_img:
        "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      s3_profile_img: "",
      reporting: true,
      location_id: 10595,
      trip_id: "",
      emp_id: "EMP123",
      reports: [
        {
          present: 0,
          date: "01 Jan",
          emp_id: "EMP123",
          name_1: "Aswin T",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "EMP123",
          name_1: "Aswin T",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "EMP123",
          name_1: "Aswin T",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
      present_days: 0.0,
      absent_days: 3.0,
      totalCheckIns: 0,
      totalKms: 0.0,
      total_hrs: "0",
    },
    {
      user_id: 39177,
      user_name: "Android 0012 ",
      first_name: "Android 0012",
      last_name: "",
      user_profile_img:
        "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      s3_profile_img: "",
      reporting: true,
      location_id: 10595,
      trip_id: "",
      emp_id: "AND24",
      reports: [
        {
          present: 0,
          date: "01 Jan",
          emp_id: "AND24",
          name_1: "Android 0012 ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "AND24",
          name_1: "Android 0012 ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "AND24",
          name_1: "Android 0012 ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
      present_days: 0.0,
      absent_days: 3.0,
      totalCheckIns: 0,
      totalKms: 0.0,
      total_hrs: "0",
    },
    {
      user_id: 43332,
      user_name: "Manoj Prabhu ",
      first_name: "Manoj Prabhu",
      last_name: "",
      user_profile_img:
        "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      s3_profile_img: "",
      reporting: true,
      location_id: 10595,
      trip_id: "",
      emp_id: "MB1192",
      reports: [
        {
          present: 0,
          date: "01 Jan",
          emp_id: "MB1192",
          name_1: "Manoj Prabhu ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "MB1192",
          name_1: "Manoj Prabhu ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
          emp_id: "MB1192",
          name_1: "Manoj Prabhu ",
          sessions: 0,
          checkins: [],
          in_time: "-",
          out_time: "-",
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
      present_days: 0.0,
      absent_days: 3.0,
      totalCheckIns: 0,
      totalKms: 0.0,
      total_hrs: "0",
    },
  ];

  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${new Date()
      .getMonth()
      .toString()
      .padStart(2, "0")}`,
  });

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys({
      ...filterKeys,
      thisMonth: monthStr,
    });
  };
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (reportList.length > 0) {
      createColumns(reportList[0]);
    }
  }, [reportList]);

  const createColumns = (report) => {
    const newColumns = [
      { dataIndex: "user_name", title: "Name" },
      { dataIndex: "total_days", title: "Total Days" },
    ];

    report.reports.forEach((day) => {
      newColumns.push({
        title: `${day.date}`,
        children: [
          {
            dataIndex: `reports[${report.reports.indexOf(
              day
            )}].attendance_status`,
            title: "Attendance",
          },
          {
            dataIndex: `reports[${report.reports.indexOf(day)}].in_time`,
            title: "In/Out",
          },
          {
            dataIndex: `reports[${report.reports.indexOf(day)}].no_of_checkins`,
            title: "Checkins",
          },
        ],

        render: (rowData) => (
          <>
            <td>
              <span
                style={{
                  color: rowData.attendance_status === "A" ? "red" : "black",
                }}
              >
                {rowData.reports[report.reports.indexOf(day)].attendance_status}
              </span>
            </td>
          </>
        ),
      });
    });
    console.log("Columns", newColumns);
    setColumns(newColumns);
  };

  return (
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
      <Table data={reportList} Column={columns} />
    </div>
  );
};

export default AttendanceReport;
