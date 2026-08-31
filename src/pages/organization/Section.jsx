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
import {
  CONFIGURATION_VIEW_ACCESS_KEY,
  COMPANY_PROFILE_VIEW_ACCESS_KEY,
  DEPARTMENT_VIEW_ACCESS_KEY,
  BRANCH_VIEW_ACCESS_KEY,
  CUSTOM_FIELD_VIEW_ACCESS_KEY,
  ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY,
  PAYROLL_VIEW_ACCESS_KEY,
  ROLES_VIEW_ACCESS_KEY,
  FORMS_VIEW_ACCESS_KEY,
  LOCATION_GROUP_VIEW_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import CustomFormConfig from "../CustomFormConfig/CustomFormConfig";

const Section = () => {
  // const [departmentView, SetDepartmentView] = useState(false);
  // const [branchView, SetBranchView] = useState(false);

  // useEffect(() =>{
  //   let profile_data = JSON.parse(localStorage.getItem('lint_hr_profile_data'));

  //   if(profile_data){
  //     let permission_list = profile_data?.permission_list
  //     console.log("Permission List = ",permission_list);

  //     if(permission_list.includes(DEPARTMENT_VIEW_ACCESS_KEY)){
  //       SetDepartmentView(true)
  //     }
  //     else{
  //       SetDepartmentView(false)
  //     }

  //     if(permission_list.includes(BRANCH_VIEW_ACCESS_KEY)){
  //       SetBranchView(true)
  //     }
  //     else{
  //       SetBranchView(false)
  //     }
  //   }

  // },[])

  const [permissions, setPermissions] = useState({
    companyInfo: false,
    department: false,
    branch: false,
    attendance: false,
    payroll: false,
    customField: false,
    roles: false,
    forms: false,
    locationGroup: false,
    customStatus: false,
  });

  useEffect(() => {
    const profileData = JSON.parse(
      localStorage.getItem("lint_hr_profile_data"),
    );
    console.log(profileData.permission_list);
    console.log("Profile Data:", profileData);

    if (!profileData?.permission_list) return;

    const permissionList = profileData.permission_list;
    console.log("Permission List:", permissionList);

    console.log("Payroll:", permissionList.includes(PAYROLL_VIEW_ACCESS_KEY));

    console.log("Roles:", permissionList.includes(ROLES_VIEW_ACCESS_KEY));

    console.log("Forms:", permissionList.includes(FORMS_VIEW_ACCESS_KEY));

    console.log(
      "Location Group:",
      permissionList.includes(LOCATION_GROUP_VIEW_ACCESS_KEY),
    );

    console.log(
      "Attendance Config:",
      permissionList.includes(ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY),
    );
    setPermissions({
      companyInfo: permissionList.includes(COMPANY_PROFILE_VIEW_ACCESS_KEY),

      department: permissionList.includes(DEPARTMENT_VIEW_ACCESS_KEY),

      branch: permissionList.includes(BRANCH_VIEW_ACCESS_KEY),

      customField: permissionList.includes(CUSTOM_FIELD_VIEW_ACCESS_KEY),

      attendance: permissionList.includes(
        ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY,
      ),

      payroll: permissionList.includes(PAYROLL_VIEW_ACCESS_KEY),

      roles: permissionList.includes(ROLES_VIEW_ACCESS_KEY),

      forms: permissionList.includes(FORMS_VIEW_ACCESS_KEY),

      locationGroup: permissionList.includes(LOCATION_GROUP_VIEW_ACCESS_KEY),

      customStatus: permissionList.includes(CONFIGURATION_VIEW_ACCESS_KEY),
    });
  }, []);

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

  console.log("Current Active Tab:", activeTab);

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
                  {permissions.companyInfo && (
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
                  )}
                  {(permissions.department && (
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
                  )) ||
                    null}

                  {(permissions.branch && (
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
                  )) ||
                    null}

                  {(permissions.attendance && (
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
                  )) ||
                    null}

                  {(permissions.payroll && (
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
                  )) ||
                    null}

                  {(permissions.customField && (
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
                  )) ||
                    null}

                  {(permissions.roles && (
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
                  )) ||
                    null}

                  {(permissions.forms && (
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
                  )) ||
                    null}

                  {(permissions.locationGroup && (
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
                  )) ||
                    null}
                  {/* <NavItem>
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
                  </NavItem> */}
                </Nav>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <TabContent activeTab={activeTab} className="text-muted">
            {(permissions.companyInfo && (
              <TabPane tabId="1">
                <OrgInfoTab />
              </TabPane>
            )) ||
              null}
            {(permissions.department && (
              <TabPane tabId="2">
                <DepartmentsTab />
              </TabPane>
            )) ||
              null}

            {(permissions.branch && (
              <TabPane tabId="3">
                <Branch />
              </TabPane>
            )) ||
              null}
            {(permissions.attendance && (
              <TabPane tabId="4">
                <AttendanceConfig />
              </TabPane>
            )) ||
              null}
            {(permissions.payroll && (
              <TabPane tabId="5">
                <PayRollConfig />
              </TabPane>
            )) ||
              null}
            {(permissions.customField && (
              <TabPane tabId="6">
                <CustomField />
              </TabPane>
            )) ||
              null}
            {(permissions.roles && (
              <TabPane tabId="7">
                <Roles />
              </TabPane>
            )) ||
              null}
            {(permissions.forms && (
              <TabPane tabId="8">
                <CustomFormConfig />
              </TabPane>
            )) ||
              null}
            {(permissions.locationGroup && (
              <TabPane tabId="9">
                <LocationGroup />
              </TabPane>
            )) ||
              null}
            {(permissions.customStatus && (
              <TabPane tabId="10">
                <CustomStatus />
              </TabPane>
            )) ||
              null}
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;
