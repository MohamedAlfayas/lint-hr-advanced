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
import AttendancePolicySettings from "./Attendancepolicysettings";
import LeavePolicySettings from "./LeavePolicySettings";
import LopPolicySettings from "./LopPolicySettings";
import OvertimePolicySettings from "./OvertimePolicySettings";
import BonusPolicySettings from "./BonusPolicySettings";
import GratuityPolicySettings from "./GratuityPolicySettings";
import ReimbursementPolicySettings from "./ReimbursementpolicySettings";
import LeaveCreditPolicySettings from "./LeaveCreditPolicySettings";
import IncomeTaxPolicySettings from "./IncomeTaxPolicySettings";
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

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "5" })}
              onClick={() => toggleTab("5")}
            >
              Attendance Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "6" })}
              onClick={() => toggleTab("6")}
            >
              Leave Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "7" })}
              onClick={() => toggleTab("7")}
            >
              Leave Credit Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "8" })}
              onClick={() => toggleTab("8")}
            >
              LOP Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "9" })}
              onClick={() => toggleTab("9")}
            >
              Overtime Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "10" })}
              onClick={() => toggleTab("10")}
            >
              Bonus Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "11" })}
              onClick={() => toggleTab("11")}
            >
              Gratuity Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "12" })}
              onClick={() => toggleTab("12")}
            >
              Reimbursement Policy
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "13" })}
              onClick={() => toggleTab("13")}>
              Income Tax Policy
            </NavLink>
          </NavItem>

        </Nav>

        {/* Tab Content */}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <PayrollSettings />
          </TabPane>

          <TabPane tabId="2">
            <PFSettings />
          </TabPane>

          <TabPane tabId="3">
            <ESISettings />
          </TabPane>

          <TabPane tabId="4">
            <PTSettings />
          </TabPane>

          <TabPane tabId="5">
            <AttendancePolicySettings />
          </TabPane>

          <TabPane tabId="6">
            <LeavePolicySettings />
          </TabPane>

          <TabPane tabId="7">
            <LeaveCreditPolicySettings />
          </TabPane>

          <TabPane tabId="8">
            <LopPolicySettings />
          </TabPane>

          <TabPane tabId="9">
            <OvertimePolicySettings />
          </TabPane>

          <TabPane tabId="10">
            <BonusPolicySettings />
          </TabPane>

          <TabPane tabId="11">
            <GratuityPolicySettings />
          </TabPane>

          <TabPane tabId="12">
            <ReimbursementPolicySettings/>
          </TabPane>

          <TabPane tabId="13">
            <IncomeTaxPolicySettings/>
          </TabPane>

        </TabContent>
      </Col>
    </Row>
  );
};

export default AdvancedSettingsTab;