import React, { useEffect, useState } from "react";
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
  VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

const Dashboard = () => {
  document.title = `Dashboard | ${MetaTitle || "Lint HR"}`;

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  const [showApprovalTable, setShowApprovalTable] = useState(false);

  useEffect(() => {
    console.log("Approval Table Comp");

    let permission_list = profile_data?.permission_list || [];

    if (
      profile_data?.is_admin === true ||
      permission_list.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY)
    ) {
      setShowApprovalTable(true);
    }
  }, []);

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

                  {showApprovalTable && (
                    <Col xl={12}>
                      <AttendanceLeaveApprovalTable />
                    </Col>
                  )}

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
