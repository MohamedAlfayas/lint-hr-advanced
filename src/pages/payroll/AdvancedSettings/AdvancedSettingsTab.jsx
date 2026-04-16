import React, { useState } from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import PayrollSettings from "./PayrollSettings";
import PFSettings from "./PFSettings";
import ESISettings from "./ESISettings";
import PTSettings from "./PTSettings";

const AdvancedSettingsTab = ({ onEarningAdd }) => {
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
              Payroll Settings
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "2" })}
              onClick={() => toggleTab("2")}
            >
              PF Settings
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "3" })}
              onClick={() => toggleTab("3")}
            >
              ESI Settings
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "4" })}
              onClick={() => toggleTab("4")}
            >
              Professional Tax Settings
            </NavLink>
          </NavItem>
        </Nav>

        {/* Tab Content */}
        <TabContent activeTab={activeTab}>
          {/* Tab 1 */}
          <TabPane tabId="1">
           
            <PayrollSettings />
          </TabPane>

          {/* Tab 2 */}
          <TabPane tabId="2">
       <PFSettings />
          </TabPane>
          {/* Tab 3 */}
          <TabPane tabId="3">
       <ESISettings />
          </TabPane>
          {/* Tab 4 */}
          <TabPane tabId="4">
      <PTSettings />
          </TabPane>
        </TabContent>
      </Col>
    </Row>
  );
};

export default AdvancedSettingsTab;