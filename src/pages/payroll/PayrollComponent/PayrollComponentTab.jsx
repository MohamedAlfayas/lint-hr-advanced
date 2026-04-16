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

import RecurringTable from "./RecurringTable";
import VariableTable from "./VariableTable";

const PayrollComponentTab = ({ onEarningAdd }) => {
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
           Recurring
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "2" })}
              onClick={() => toggleTab("2")}
            >
          Variable
            </NavLink>
          </NavItem>

         
         
        </Nav>

        {/* Tab Content */}
        <TabContent activeTab={activeTab}>
      
          <TabPane tabId="1">
         

            <RecurringTable  />
          </TabPane>

       
  <TabPane tabId="2">
    

    <VariableTable/>
  </TabPane>


        

         
        </TabContent>
      </Col>
    </Row>
  );
};

export default PayrollComponentTab;