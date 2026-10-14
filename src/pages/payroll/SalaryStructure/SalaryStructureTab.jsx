import React, { useState } from "react";
import {
  Button,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

import SalaryStructureTable from "./SalaryStructureTable";
import EmployeeSalary from "../EmployeeSalary/EmployeeSalary";

const SalaryStructureTab = ({ onEarningAdd }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [mountedTabs, setMountedTabs] = useState({ 1: true });

  const toggleTab = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setMountedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
  };

  return (
    <Row>
      <Col xxl={12}>
        {/* Tabs */}
        <Nav
          tabs
          className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
        >
        <NavItem>
            <NavLink
              data-testid="salary-structure-salary-structure-link"
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "1" })}
              onClick={() => toggleTab("1")}
            >
               Salary Structure
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              data-testid="salary-structure-assign-structure-link"
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "2" })}
              onClick={() => toggleTab("2")}
            >
            Assign Structure
            </NavLink>
          </NavItem>

         
         
        </Nav>

        {/* Tab Content */}
        <TabContent activeTab={activeTab}>
          {mountedTabs["1"] && (
            <TabPane tabId="1">
              <SalaryStructureTable />
            </TabPane>
          )}
          {mountedTabs["2"] && (
            <TabPane tabId="2">
              <EmployeeSalary />
            </TabPane>
          )}


      

         
        </TabContent>
      </Col>
    </Row>
  );
};

export default SalaryStructureTab;