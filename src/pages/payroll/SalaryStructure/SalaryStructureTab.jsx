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

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
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
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "1" })}
              onClick={() => toggleTab("1")}
            >
               Salary Structure
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
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
      
         {/*    Salary Structure */}
          <TabPane tabId="1">
            <SalaryStructureTable />
          </TabPane>   

       
  <TabPane tabId="2">
    

    <EmployeeSalary/>
  </TabPane>


      

         
        </TabContent>
      </Col>
    </Row>
  );
};

export default SalaryStructureTab;