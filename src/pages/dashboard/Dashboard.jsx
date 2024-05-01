import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Section from "../../component/section/Section";
import { MetaTitle } from "../../common/data/MetaTitle";
import EmployeeActivity from "./EmployeeActivity";
import AttendanceStatistics from "./AttendanceStatistics";
import PayrollWidgets from "./PayrollWidgets";
import AttendanceGraph from "./AttendanceGraph";
import DeptWiseAttendanceWidgets from "./DeptWiseAttendanceWidgets";
import AttendanceLeaveApprovalTable from "./AttendanceLeaveApprovalTable";
import {
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/Constants";

const Dashboard = () => {
  document.title = `Dashboard | ${MetaTitle || "Lint HR"}`;

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <Section rightClickBtn={toggleRightColumn} />

                <Row>
                  <Col xl={3}>
                    <AttendanceStatistics />
                  </Col>

                  <Col xl={9}>
                    <Row>
                      <PayrollWidgets />
                    </Row>
                    <Row>
                      <AttendanceGraph />
                    </Row>
                  </Col>
                  {profile_data.permission_list.includes(
                    VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY
                  ) ||
                  profile_data.permission_list.includes(
                    VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY
                  ) ? (
                    <Col xl={12}>
                      <AttendanceLeaveApprovalTable />
                    </Col>
                  ) : null}

                  <Col xl={12}> {/* <DeptWiseAttendanceWidgets /> */}</Col>
                </Row>
              </div>
            </Col>
            <EmployeeActivity
              rightColumn={rightColumn}
              hideRightColumn={toggleRightColumn}
            />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
