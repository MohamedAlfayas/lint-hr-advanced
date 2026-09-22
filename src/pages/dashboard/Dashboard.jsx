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
import TodayAttendanceTable from "./TodayAttendanceTable";
import "../../common/css/lc_style.css";
import {
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import LocationMap from "./LocationMap";
import UsersClusterMap from "./UsersClusterMap";
import AdminDashboard from "./AdminDashboard";
import { Link } from "react-router-dom";

const Dashboard = () => {
  document.title = `Dashboard | ${MetaTitle || "Lint HR"}`;

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  const [showApprovalTable, setShowApprovalTable] = useState(false);

  useEffect(() => {
    let permission_list = profile_data?.permission_list || [];

    if (
      profile_data?.is_admin === true ||
      permission_list.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY)
    ) {
      setShowApprovalTable(true);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* <Row>
            <Col xs={12}>
              <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0">Dashboard</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <Link to="#">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Admin Dashboard</li>
                  </ol>
                </div>
              </div>
            </Col>
          </Row> */}
          <Row className="lc_dashboard_row">
            {/* Attendance Table (takes 9 cols on XL, full width on smaller) */}
            <Col
              xl={9}
              lg={8}
              md={13}
              sm={13}
              xs={13}
              className="lc_table_col mx-auto"
            >
              <div className="card ">
                <div className="card-body p-0">
                  <TodayAttendanceTable />
                </div>
              </div>
            </Col>

            {/* Map */}
            <Col
              xl={3}
              lg={4}
              md={11.5}
              sm={11.5}
              xs={11.5}
              className="lc_map_col mx-auto"
            >
              {/* <div className="lc_container"> */}
              <div className="card ">
                <div className="card-body p-0">
                  <UsersClusterMap />
                </div>
              </div>
            </Col>
            {/* <AdminDashboard /> */}

            {showApprovalTable && (
              <Col xl={12} className="mb-3">
                <AttendanceLeaveApprovalTable />
              </Col>
            )}

            <Col xl={12} className="mb-3">
              {/* <DeptWiseAttendanceWidgets /> */}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
