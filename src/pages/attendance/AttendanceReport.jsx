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
const AttendanceReport = () => {
    const { Column, HeaderCell, Cell, ColumnGroup} = Table;
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
                thisMonth: monthStr,
              });
            };


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



    const fixedColumns = [
        <Column width={250} fixed="left">
          <HeaderCell>Employee</HeaderCell>
          <EmployeeCell dataKey="employee" fullText />
        </Column>,
       
      ];
    
      const dynamicColumns =
        team_attendance_report_data.length > 0
          ? team_attendance_report_data[0].workday_data.map((day, index) => (
            <ColumnGroup key={`date_${index}`} header={<HeaderCell>{format(new Date(day.date), "dd MMM, yyyy")}</HeaderCell>}>
            <Column width={50} align="center">
              <HeaderCell>In</HeaderCell>
              <Cell>{/* Add your logic for In cell here */}</Cell>
            </Column>
            <Column width={50} align="center">
              <HeaderCell>Out</HeaderCell>
              <Cell>{/* Add your logic for Out cell here */}</Cell>
            </Column>
          
          </ColumnGroup>
            ))
          : [];
      const additionalColumns = [
        <Column  width={150} >
          <HeaderCell>Total Days</HeaderCell>
          <Cell>{/* Add your logic for Out cell here */}</Cell>
        </Column>,
        <Column  width={150} >
        <HeaderCell>Present Days</HeaderCell>
        <Cell>{/* Add your logic for Out cell here */}</Cell>
      </Column>,
      <Column  width={150} >
        <HeaderCell>Total Check-ins </HeaderCell>
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
        height={400}
        data={team_attendance_report_data}
        rowHeight={60}
        autoHeight={true}
        loading={loading}
        bordered={true}
        className="mb-5"
      >
        {allColumns}
      </Table>
    </div>
    </React.Fragment>
  );
};

export default AttendanceReport;
