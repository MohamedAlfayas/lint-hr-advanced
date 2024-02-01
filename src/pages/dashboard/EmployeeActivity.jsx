import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

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
        // style={{ height: "100%" }}
        id="layout-rightside-coll"
      >
        <div className="overlay" onClick={props.hideRightColumn}></div>
        <div className="layout-rightside">
          <Card className="h-100 rounded-0">
            <CardHeader className="align-items-center border-0 d-flex">
              {/* <h4 className="card-title mb-0 flex-grow-1"></h4> */}
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
                      All <small>{"(110)"}</small>
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
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => {
                        toggleTab("3");
                      }}
                    >
                      No Data <small>{"(10)"}</small>
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="p-2">
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="search"
                    id="search_activity"
                    className="form-control"
                    placeholder="Name or Department"
                  />
                  <i className="bx bx-search-alt search-icon"></i>
                </div>
              </div>

              <TabContent activeTab={activeTab} className="p-0">
                <TabPane tabId="1">
                  <EmployeeActivityTable></EmployeeActivityTable>

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
