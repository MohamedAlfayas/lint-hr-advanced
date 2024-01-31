import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

//import images
import product8 from "../../assets/images/products/img-8.png";
import product2 from "../../assets/images/products/img-2.png";
import product10 from "../../assets/images/products/img-10.png";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import gitbox from "../../assets/images/giftbox.png";

//SimpleBar
import Select from "react-select";

import SimpleBar from "simplebar-react";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import classnames from "classnames";
import EmployeeActivityTable from "./EmployeeActivityTable";
import { Link } from "react-router-dom";

const EmployeeActivity = (props) => {
  const dep_options = GetLocalStorageData("department") || [];
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  return (
    <React.Fragment>
      <div
        className={
          props.rightColumn
            ? "col-auto layout-rightside-col d-block"
            : "col-auto layout-rightside-col d-none"
        }
        style={{ height: "100%" }}
        id="layout-rightside-coll"
      >
        <div className="overlay" onClick={props.hideRightColumn}></div>
        <div className="layout-rightside">
          <Card className="h-100 rounded-0">
            <CardHeader className="align-items-center border-0 d-flex">
              <h4 className="card-title mb-0 flex-grow-1">Activity</h4>
              <div className="flex-shrink-0">
                <Nav
                  className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0"
                  role="tablist"
                >
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => {
                        toggleTab("1");
                      }}
                    >
                      IN <small>{"(110)"}</small>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => {
                        toggleTab("2");
                      }}
                    >
                      Late <small>{"(10)"}</small>
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="p-1">
                <Select
                  id="primary_department_id_list"
                  name="primary_department_id_list"
                  isMulti={true}
                  options={dep_options || []}
                  className="basic-multi-select"
                  placeholder={"Select Primary Department"}
                />
              </div>

              <TabContent activeTab={activeTab} className="p-0">
                <TabPane tabId="1">
                  <SimpleBar
                    style={{ maxHeight: "550px" }}
                    className="p-3 pt-0"
                  >
                    <div className="acitivity-timeline acitivity-main mt-2">
                      <div className="acitivity-item d-flex mt-1">
                        <div className="flex-shrink-0">
                          <img
                            src={avatar2}
                            alt=""
                            className="avatar-xs rounded-circle acitivity-avatar"
                          />
                        </div>
                        <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
                          <h6 className="mb-0 lh-base">
                            Natasha Carey{" "}
                            <i class="mdi mdi-circle fs-10 align-middle text-warning me-1 ms-2"></i>
                            <span class="fs-12 mb-0 text-muted">Late</span>
                          </h6>
                          <p className="text-muted mb-2">Department | Role</p>

                          <p className="mb-1 text-muted">
                            <small className="mb-0 text-muted">
                              Login - 09:18 AM
                            </small>
                          </p>
                          <p className="mb-1 text-muted">
                            <small className="mb-0 text-muted">Logout -</small>
                          </p>
                        </div>
                      </div>

                      <div className="acitivity-item d-flex mt-1">
                        <div className="flex-shrink-0">
                          <div
                            className="avatar-xs rounded-circle acitivity-avatar"
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              background: "#0ab39c",
                            }}
                            data-bs-toggle="tooltip"
                            title={"Test"}
                          >
                            <span
                              className="first_letter"
                              style={{ color: "white" }}
                            >
                              {"Test".charAt(0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
                          <h6 className="mb-0 lh-base">
                            Natasha Carey{" "}
                            <i class="mdi mdi-circle fs-10 align-middle text-success me-1 ms-2"></i>
                            <span class="fs-12 mb-0 text-muted">Ontime</span>
                          </h6>
                          <p className="text-muted mb-2">Department | Role</p>

                          <p className="mb-1 text-muted">
                            <small className="mb-0 text-muted">
                              Login - 09:18 AM
                            </small>
                          </p>

                          <p className="mb-1 text-muted">
                            <small className="mb-0 text-muted">
                              Logout - 07:35 PM
                            </small>
                          </p>
                          <p className="mb-1 text-muted">
                            <small className="mb-0 text-muted">
                              Total - 08:18 Hr
                            </small>
                          </p>
                        </div>
                      </div>
                    </div>
                  </SimpleBar>

                  {/* <SimpleBar style={{ maxHeight: "100%" }} className="p-3 pt-0">
                    <EmployeeActivityTable></EmployeeActivityTable>
                  </SimpleBar> */}
                </TabPane>

                <TabPane tabId="2">
                  <EmployeeActivityTable></EmployeeActivityTable>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default EmployeeActivity;
