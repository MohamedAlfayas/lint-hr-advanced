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
      "user_id": 1322,
      "user_name": "Divya Ramasamy",
      "first_name": "Divya",
      "last_name": "Ramasamy",
      "user_profile_img": "https://lystloc.com/account/api/uploads/user-profile-image/11302018165906-1322.jpg",
      "s3_profile_img": "",
      "reporting": true,
      "location_id": 10595,
      "trip_id": "",
      "emp_id": "MB10767",
      "reports": [
        {
          "present": 0,
          "date": "01 Jan",
          "emp_id": "MB10767",
          "name_1": "Divya Ramasamy",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "02 Jan",
          "emp_id": "MB10767",
          "name_1": "Divya Ramasamy",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "03 Jan",
          "emp_id": "MB10767",
          "name_1": "Divya Ramasamy",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        }
      ],
      "total_days": 3,
      "present_days": 0.0,
      "absent_days": 3.0,
      "totalCheckIns": 0,
      "totalKms": 0.0,
      "total_hrs": "0"
    },
    {
      "user_id": 25955,
      "user_name": "Aparna ",
      "first_name": "Aparna",
      "last_name": "",
      "user_profile_img": "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      "s3_profile_img": "",
      "reporting": true,
      "location_id": 10595,
      "trip_id": "",
      "emp_id": "EMP012",
      "reports": [
        {
          "present": 0,
          "date": "01 Jan",
          "emp_id": "EMP012",
          "name_1": "Aparna ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "02 Jan",
          "emp_id": "EMP012",
          "name_1": "Aparna ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "03 Jan",
          "emp_id": "EMP012",
          "name_1": "Aparna ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        }
      ],
      "total_days": 3,
      "present_days": 0.0,
      "absent_days": 3.0,
      "totalCheckIns": 0,
      "totalKms": 0.0,
      "total_hrs": "0"
    },
    {
      "user_id": 35577,
      "user_name": "Aswin T",
      "first_name": "Aswin",
      "last_name": "T",
      "user_profile_img": "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      "s3_profile_img": "",
      "reporting": true,
      "location_id": 10595,
      "trip_id": "",
      "emp_id": "EMP123",
      "reports": [
        {
          "present": 0,
          "date": "01 Jan",
          "emp_id": "EMP123",
          "name_1": "Aswin T",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "02 Jan",
          "emp_id": "EMP123",
          "name_1": "Aswin T",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "03 Jan",
          "emp_id": "EMP123",
          "name_1": "Aswin T",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        }
      ],
      "total_days": 3,
      "present_days": 0.0,
      "absent_days": 3.0,
      "totalCheckIns": 0,
      "totalKms": 0.0,
      "total_hrs": "0"
    },
    {
      "user_id": 39177,
      "user_name": "Android 0012 ",
      "first_name": "Android 0012",
      "last_name": "",
      "user_profile_img": "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      "s3_profile_img": "",
      "reporting": true,
      "location_id": 10595,
      "trip_id": "",
      "emp_id": "AND24",
      "reports": [
        {
          "present": 0,
          "date": "01 Jan",
          "emp_id": "AND24",
          "name_1": "Android 0012 ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "02 Jan",
          "emp_id": "AND24",
          "name_1": "Android 0012 ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "03 Jan",
          "emp_id": "AND24",
          "name_1": "Android 0012 ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        }
      ],
      "total_days": 3,
      "present_days": 0.0,
      "absent_days": 3.0,
      "totalCheckIns": 0,
      "totalKms": 0.0,
      "total_hrs": "0"
    },
    {
      "user_id": 43332,
      "user_name": "Manoj Prabhu ",
      "first_name": "Manoj Prabhu",
      "last_name": "",
      "user_profile_img": "https://lystloc.com/account/api/uploads/user-profile-image/profile.png",
      "s3_profile_img": "",
      "reporting": true,
      "location_id": 10595,
      "trip_id": "",
      "emp_id": "MB1192",
      "reports": [
        {
          "present": 0,
          "date": "01 Jan",
          "emp_id": "MB1192",
          "name_1": "Manoj Prabhu ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "02 Jan",
          "emp_id": "MB1192",
          "name_1": "Manoj Prabhu ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        },
        {
          "present": 0,
          "date": "03 Jan",
          "emp_id": "MB1192",
          "name_1": "Manoj Prabhu ",
          "sessions": 0,
          "checkins": [],
          "in_time": "-",
          "out_time": "-",
          "worked_hours": "",
          "logins": [],
          "no_of_checkins": 0,
          "no_of_logins": 0,
          "kms": 0,
          "branch": "Coimbatore",
          "attendance_status": "A"
        }
      ],
      "total_days": 3,
      "present_days": 0.0,
      "absent_days": 3.0,
      "totalCheckIns": 0,
      "totalKms": 0.0,
      "total_hrs": "0"
    }
  ]

  const EmployeeCell = ({ ...props }) => {
    // let at_employee_data = reportList.find(function (i) {
    //   return i.id == rowData.employee_id;
    // });
    // const at_employee_data = reportList?.map((obj) => obj?.user_name)
    // console.log('at_employee_data ===', at_employee_data);
    // console.log('rowData ===', rowData);
    // let html_tag = at_employee_data.profile_url ? (
    //   <div className="d-flex gap-2 align-items-center">
    //     <div className="flex-shrink-0">
    //       <img
    //         src={at_employee_data.profile_url}
    //         alt=""
    //         className="avatar-xs rounded-circle"
    //         style={{ objectFit: "cover" }}
    //       />
    //     </div>
    //     <div className="flex-grow-1">
    //       <div>
    //         <Link to="#" className="link-body-emphasis mb-0">
    //           {" "}
    //           <h5 className="fs-14 mb-1">{at_employee_data.fname}</h5>
    //         </Link>
    //       </div>
    //       <div>{at_employee_data.email}</div>
    //     </div>
    //   </div>
    // ) : (
    // <div className="d-flex gap-2 align-items-center">
    //   <div className="flex-shrink-0">
    //     <div
    //       className="avatar-xs rounded-circle"
    //       style={{
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //         background: "#0ab39c",
    //       }}
    //       data-bs-toggle="tooltip"
    //       title={at_employee_data.user_name}
    //     >
    //       <span className="first_letter" style={{ color: "white" }}>
    //         {at_employee_data.user_name.charAt(0)}
    //       </span>
    //     </div>
    //   </div>
    //   <div className="flex-grow-1">
    //     <div>
    //       <Link to="#" className="link-body-emphasis mb-0">
    //         {" "}
    //         <h5 className="fs-14 mb-1">{at_employee_data.user_name}</h5>
    //       </Link>
    //     </div>
    //     {/* <div>{at_employee_data.email}</div> */}
    //   </div>
    // </div>
    // );
    const at_employee_data = reportList?.find((val) => val?.user_id)
    let html_tag = at_employee_data &&
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
              title={at_employee_data.user_name}
            >
              <span className="first_letter" style={{ color: "white" }}>
                {at_employee_data.user_name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-grow-1">
            <div>
              <Link to="#" className="link-body-emphasis mb-0">
                {" "}
                <h5 className="fs-14 mb-1">{at_employee_data.user_name}</h5>
              </Link>
            </div>
            {/* <div>{at_employee_data.email}</div> */}
          </div>
        </div>
     
    

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
          background: '#e6f7ff',
          border: '2px solid #b5f5ec',
          borderRadius: '1px',
          padding: '18px',

        }}
      >
        Employee
      </HeaderCell>
      <EmployeeCell dataKey="employee" fullText />
    </Column>,
  ];

  const dynamicColumns =
    team_attendance_report_data.length > 0
      ? team_attendance_report_data[0].workday_data.map((day, index) => (
        <ColumnGroup
          align="center"
          key={`date_${index}`}
          header={format(new Date(day.date), "dd MMM, yyyy")}

        >
          <Column
            width={100}
            colSpan={2}
            align="center"
            title="In"

          >
            <HeaderCell>Attendance</HeaderCell>
            <Cell>{/* Add your logic for In cell here */}</Cell>
          </Column>
          <Column
            width={80}
            colSpan={2}
            align="center"
            title="In"

          >
            <HeaderCell>In</HeaderCell>
            <Cell>{/* Add your logic for In cell here */}</Cell>
          </Column>
          <Column
            width={80}
            align="center"
            title="Out"

          >
            <HeaderCell>Out</HeaderCell>
            <Cell>{/* Add your logic for Out cell here */}</Cell>
          </Column>
        </ColumnGroup>
      ))
      : [];


  const additionalColumns = [
    <Column width={130} align="center" >
      <HeaderCell
        style={{
          background: '#e6f7ff',
          border: '2px solid #b5f5ec',
          borderRadius: '1px',
          padding: '18px',

        }}
      >Total Days</HeaderCell>
      <Cell>{/* Add your logic for Out cell here */}</Cell>
    </Column>,
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: '#e6f7ff',
          border: '2px solid #b5f5ec',
          borderRadius: '1px',
          padding: '18px',

        }}
      >Present Days</HeaderCell>
      <Cell>{/* Add your logic for Out cell here */}</Cell>
    </Column>,
    <Column width={150} align="center">
      <HeaderCell
        style={{
          background: '#e6f7ff',
          border: '2px solid #b5f5ec',
          borderRadius: '1px',
          padding: '18px',

        }}
      >Total Check-ins </HeaderCell>
      <Cell>{/* Add your logic for Out cell here */}</Cell>
    </Column>,


  ];


  const allColumns = [...fixedColumns, ...dynamicColumns, ...additionalColumns];
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
          bordered cellBordered height={420} headerHeight={60}

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
