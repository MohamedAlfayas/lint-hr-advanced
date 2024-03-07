
import CountUp from "react-countup";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import AttendanceApproval from "../attendanceApproval/AttendanceApproval";
import AttendancePendingTable from "./AttendancePendingTable";
import LeaveApprovalFilter from "../../component/common/tableFilter/LeaveApprovalFilter";
import LeaveApprovalPending from "./LeavePending";

const AttendanceLeaveApprovalTable = () => {
 
    const [activeTab, setActiveTab] = useState('1');
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    return (
        <React.Fragment>
            <Col xl={12}>
                <Card>
                    <CardHeader className="align-items-center border-0 d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Pending Status</h4>
                        <div className="flex-shrink-0">
                            <Nav className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0" role="tablist">
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '1' })}
                                        onClick={() => { toggleTab('1'); }}
                                    >
                                        Attendace Approval</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '2' })}
                                        onClick={() => { toggleTab('2'); }}
                                    >
                                        Leave Approval</NavLink>
                                </NavItem>
                            </Nav>
                        </div>
                    </CardHeader>
                    <div className="card-body p-0">
                        <TabContent activeTab={activeTab} className="p-0">
                            <TabPane tabId="1">
                               <AttendancePendingTable />
                            </TabPane>

                            <TabPane tabId="2">
                              <LeaveApprovalPending />
                            </TabPane>
                        </TabContent>
                    </div>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default AttendanceLeaveApprovalTable;
