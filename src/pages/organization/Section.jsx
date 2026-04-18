import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

//import images
import slack from "../../assets/images/brands/slack.png";
import DepartmentsTab from "./DepartmentsTab";
import Branch from "./Branch";
import TeamTab from "./TeamTab";
import OrgInfoTab from "./OrgInfoTab";
import PayRollConfig from "./../payroll/PayRollConfig";
import AttendanceConfig from "./../attendanceConfig/AttendanceConfig";
import CustomField from "../customField/CustomField";
import Roles from "../roles/Roles";
import { useSelector } from "react-redux";
import CustomFormTable from "../CustomForms/CustomFormTable";
import LocationGroup from "./LocationGroup";
import CustomStatus from "./CustomStatus";

const Section = () => {
  //Tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      localStorage.setItem("activeTab", tab); // ✅ save tab
    }
  };
  useEffect(() => {
    return () => {
      localStorage.removeItem("activeTab");
    };
  }, []);
  const { company_detail } = useSelector((state) => state.CompanyReducer);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card className="mt-n4 mx-n4">
            <div className="bg-info-subtle">
              <CardBody className="pb-0 px-4">
                <Row className="mb-3">
                  <div className="col-md">
                    <Row className="align-items-center g-3">
                      <div className="col-md-auto">
                        <div className="avatar-md">
                          <div className="avatar-title bg-white rounded-circle">
                            <img src={slack} alt="" className="avatar-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md">
                        <div>
                          <h4 className="fw-bold">
                            {company_detail?.full_name || ""}
                          </h4>
                          <div className="hstack gap-3 flex-wrap">
                            <div>
                              <i className="ri-building-line align-bottom me-1"></i>{" "}
                              HEADQUARTER
                            </div>
                            <div className="vr"></div>
                            <div>
                              Create Date :{" "}
                              <span className="fw-medium">15 Sep, 2021</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Row>
                  </div>
                  <div className="col-md-auto">
                    <div className="hstack gap-1 flex-wrap">
                      <button
                        type="button"
                        className="btn py-0 fs-16 favourite-btn active"
                      >
                        <i className="ri-star-fill"></i>
                      </button>
                      <button
                        type="button"
                        className="btn py-0 fs-16 text-body"
                      >
                        <i className="ri-share-line"></i>
                      </button>
                    </div>
                  </div>
                </Row>

                <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "1" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("1");
                      }}
                      href="#"
                    >
                      Company Info
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "2" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("2");
                      }}
                      href="#"
                    >
                      Departments
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "3" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("3");
                      }}
                      href="#"
                    >
                      Branch
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "4" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("4");
                      }}
                      href="#"
                    >
                      Attendance
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "5" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("5");
                      }}
                      href="#"
                    >
                      Payroll
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "6" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("6");
                      }}
                      href="#"
                    >
                      Custom Field
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "7" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("7");
                      }}
                      href="#"
                    >
                      Roles
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "8" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("8");
                      }}
                      href="#"
                    >
                      Forms
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "9" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("9");
                      }}
                      href="#"
                    >
                      Location Group
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "10" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("10");
                      }}
                      href="#"
                    >
                      Custom Status
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <TabContent activeTab={activeTab} className="text-muted">
            <TabPane tabId="1">
              <OrgInfoTab />
            </TabPane>
            <TabPane tabId="2">
              <DepartmentsTab />
            </TabPane>
            <TabPane tabId="3">
              <Branch />
            </TabPane>
            <TabPane tabId="4">
              <AttendanceConfig />
            </TabPane>
            <TabPane tabId="5">
              <PayRollConfig />
            </TabPane>
            <TabPane tabId="6">
              <CustomField />
            </TabPane>
            <TabPane tabId="7">
              <Roles />
            </TabPane>
            <TabPane tabId="8">
              <CustomFormTable />
            </TabPane>
            <TabPane tabId="9">
              <LocationGroup />
            </TabPane>
            <TabPane tabId="10">
              <CustomStatus />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;
