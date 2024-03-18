import CountUp from "react-countup";
import React, { useState, useEffect } from "react";
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
import AttendanceApproval from "../attendanceApproval/AttendanceApproval";
import AttendancePendingTable from "./AttendancePendingTable";
import LeaveApprovalPending from "./LeavePending";

const AttendanceLeaveApprovalTable = () => {
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  console.log("active Tab", activeTab);

  const [leaveDataLength, setLeaveDataLength] = useState(0);
  const [attendDataLength, setAttendDataLength] = useState(0);

  const handleLeaveLengthChange = (onDataLengthChange) => {
    setLeaveDataLength(onDataLengthChange);
  };
  const handleAttendLengthChange = (onDataLengthChange) => {
    setAttendDataLength(onDataLengthChange);
  };

  return (
    <React.Fragment>
      <Col xl={12}>
        <Card>
          <CardHeader className="align-items-center border-0 d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Pending Status</h4>
            <div className="flex-shrink-0">
              <Nav
                className="nav-tabs nav-tabs-custom nav-success"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames(
                      { active: activeTab === "1" },
                      `fw-semibold ${
                        activeTab === "1" ? "text-success" : "text-primary"
                      }`
                    )}
                    onClick={() => {
                      toggleTab("1");
                    }}
                  >
                    <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                    Attendace Approval{" "}
                    <Badge
                      color={activeTab === "1" ? "success" : "primary"}
                      style={{ marginLeft: "5px" }}
                    >
                      {attendDataLength}
                    </Badge>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames(
                      { active: activeTab === "2" },
                      `fw-semibold ${
                        activeTab === "2" ? "text-success" : "text-primary"
                      }`
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
                </NavItem>
              </Nav>
            </div>
          </CardHeader>
          <div className="card-body p-0">
            <TabContent activeTab={activeTab} className="p-0">
              <TabPane tabId="1">
                <AttendancePendingTable
                  onDataLengthChange={handleAttendLengthChange}
                />
              </TabPane>

              <TabPane tabId="2">
                <LeaveApprovalPending
                  onDataLengthChange={handleLeaveLengthChange}
                />
              </TabPane>
            </TabContent>
          </div>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default AttendanceLeaveApprovalTable;
