import CountUp from "react-countup";
import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Card,
  CardHeader,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import AttendancePendingTable from "./AttendancePendingTable";
import LeaveApprovalPending from "./LeavePending";
import {
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { setDashPendingApprovalCom } from "../../redux/reducers/ChildReducer/ApprovalComponentReducer";
import { useDispatch } from "react-redux";

const AttendanceLeaveApprovalTable = () => {
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const dispatch = useDispatch();

  const [leaveDataLength, setLeaveDataLength] = useState(0);
  const [attendDataLength, setAttendDataLength] = useState(0);

  const handleLeaveLengthChange = (onDataLengthChange) => {
    setLeaveDataLength(onDataLengthChange);
  };
  const handleAttendLengthChange = (onDataLengthChange) => {
    setAttendDataLength(onDataLengthChange);
  };
  const [showAttendanceApproval, setShowAttendanceApproval] = useState(false);
  const [showLeaveApproval, setShowLeaveApproval] = useState(false);
  const firstEffectExecutedRef = useRef(false);
  useEffect(() => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data"),
    );

    let permission_list = profile_data?.permission_list || [];

    // View Attendance Approval Access

    if (
      profile_data?.is_admin === true ||
      permission_list.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY)
    ) {
      setShowAttendanceApproval(true);
    }

    // View Leave Approval Access

    if (
      profile_data?.is_admin === true ||
      permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY) ||
      permission_list.includes(VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY)
    ) {
      setShowLeaveApproval(true);
    }
    firstEffectExecutedRef.current = true;
  }, []);

  useEffect(() => {
    if (firstEffectExecutedRef.current) {
      if (activeTab === "2" || (!showAttendanceApproval && activeTab === "1")) {
        dispatch(setDashPendingApprovalCom("leave_pending_table"));
      } else if (activeTab === "1") {
        dispatch(setDashPendingApprovalCom("attendance_pending_table"));
      } else {
        setDashPendingApprovalCom("");
      }
    }
  }, [activeTab, showAttendanceApproval, firstEffectExecutedRef.current]);

  return (
    <React.Fragment>
      <Col xl={12}>
        {/* <Card> */}
        <Card className="approval-pending-card">
          <CardHeader className="align-items-center border-0 d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Pending Status</h4>
            <div className="col-md-auto ms-auto" style={{ marginLeft: "10px" }}>
              <Nav
                className="nav-tabs nav-tabs-custom nav-success"
                role="tablist"
              >
                {showAttendanceApproval && (
                  <NavItem>
                    <NavLink
                      data-testid="dashboard-approvals-attendance-approval-link"
                      href="#"
                      className={classnames(
                        { active: activeTab === "1" },
                        `fw-semibold ${
                          activeTab === "1" ? "text-success" : "text-primary"
                        }`,
                      )}
                      onClick={() => {
                        toggleTab("1");
                      }}
                    >
                      <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                      Attendance Approval{" "}
                      <Badge
                        color={activeTab === "1" ? "success" : "primary"}
                        style={{ marginLeft: "5px" }}
                      >
                        {attendDataLength}
                      </Badge>
                    </NavLink>
                  </NavItem>
                )}
                {showLeaveApproval && (
                  <NavItem>
                    {!showAttendanceApproval ? (
                      <NavLink
                        data-testid="dashboard-approvals-leave-approval-link"
                        href="#"
                        className={classnames(
                          { active: activeTab === "1" },
                          `fw-semibold ${"text-success"}`,
                        )}
                        color={"success"}
                      >
                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                        Leave Approval{" "}
                        <Badge color={"success"} style={{ marginLeft: "5px" }}>
                          {leaveDataLength}
                        </Badge>
                      </NavLink>
                    ) : (
                      <NavLink
                        data-testid="dashboard-approvals-leave-approval-link"
                        href="#"
                        className={classnames(
                          { active: activeTab === "2" },
                          `fw-semibold ${
                            activeTab === "2" ? "text-success" : "text-primary"
                          }`,
                        )}
                        color={activeTab === "2" ? "success" : "primary"}
                        onClick={() => {
                          toggleTab("2");
                        }}
                      >
                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                        Leave Approval{" "}
                        <Badge
                          color={activeTab === "2" ? "success" : "primary"}
                          style={{ marginLeft: "5px" }}
                        >
                          {leaveDataLength}
                        </Badge>
                      </NavLink>
                    )}
                  </NavItem>
                )}
              </Nav>
            </div>
          </CardHeader>
          <div className="card-body p-0">
            <TabContent activeTab={activeTab} className="p-0">
              {showAttendanceApproval && (
                <TabPane tabId={showAttendanceApproval ? "1" : "0"}>
                  <AttendancePendingTable
                    onDataLengthChange={handleAttendLengthChange}
                  />
                </TabPane>
              )}

              {showLeaveApproval && (
                <TabPane tabId={!showAttendanceApproval ? "1" : "2"}>
                  <LeaveApprovalPending
                    onDataLengthChange={handleLeaveLengthChange}
                  />
                </TabPane>
              )}
            </TabContent>
          </div>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default AttendanceLeaveApprovalTable;
