import React, { Suspense, lazy, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { MetaTitle } from "../../common/data/MetaTitle";
import TodayAttendanceTable from "./TodayAttendanceTable";
import "../../common/css/lc_style.css";
import {
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

const UsersClusterMap = lazy(() => import("./UsersClusterMap"));
const AttendanceLeaveApprovalTable = lazy(
  () => import("./AttendanceLeaveApprovalTable"),
);

const Dashboard = () => {
  document.title = `Dashboard | ${MetaTitle || "Lint HR"}`;

  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};

  const [showApprovalTable, setShowApprovalTable] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);

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

  // Let Entry Status fetch + paint first; map/approvals start after.
  useEffect(() => {
    const mapTimer = setTimeout(() => setShowMap(true), 450);
    const approvalTimer = setTimeout(() => setShowApprovals(true), 900);
    return () => {
      clearTimeout(mapTimer);
      clearTimeout(approvalTimer);
    };
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="lc_dashboard_row g-3">
            <Col xxl={9} xs={12} className="lc_table_col">
              <TodayAttendanceTable />
            </Col>

            <Col xxl={3} xs={12} className="lc_map_col">
              <div className="card lc_map_card">
                <div className="lc_map_body">
                  {showMap ? (
                    <Suspense fallback={null}>
                      <UsersClusterMap />
                    </Suspense>
                  ) : null}
                </div>
              </div>
            </Col>

            {showApprovals && showApprovalTable && (
              <Col xl={12} className="mb-3">
                <Suspense fallback={null}>
                  <AttendanceLeaveApprovalTable />
                </Suspense>
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
