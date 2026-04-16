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
import AssignStructureTable from "./AssignStructureTable";

const SalaryStructureTab = ({ onEarningAdd }) => {
  const [activeTab, setActiveTab] = useState("1");

  const default_salary_components = {
    earnings: [
      {
        id: 1,
        name: "Basic",
        earning_type: "basic",
        earning_type_label: "Basic",
        calculation_type: "percentage",
        calculation_type_label: "Fixed; 50% of CTC",
        epf: true,
        epf_mode: "always",
        esi: true,
        mark_active: true,
      },
      {
        id: 2,
        name: "Basic Pay",
        earning_type: "basic",
        earning_type_label: "Basic",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat Amount",
        epf: true,
        epf_mode: "always",
        esi: true,
        mark_active: true,
      },
      {
        id: 3,
        name: "House Rent Allowance",
        earning_type: "hra",
        earning_type_label: "House Rent Allowance",
        calculation_type: "percentage",
        calculation_type_label: "Fixed; 50% of Basic",
        epf: false,
        epf_mode: "always",
        esi: true,
        mark_active: true,
      },
      {
        id: 4,
        name: "Conveyance Allowance",
        earning_type: "conveyance",
        earning_type_label: "Conveyance Allowance",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat Amount",
        epf: true,
        epf_mode: "pf_wage",
        esi: false,
        mark_active: true,
      },
      {
        id: 5,
        name: "Children Education Allowance",
        earning_type: "children_education",
        earning_type_label: "Children Education Allowance",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat Amount",
        epf: true,
        epf_mode: "pf_wage",
        esi: true,
        mark_active: false,
      },
      {
        id: 6,
        name: "Transport Allowance",
        earning_type: "transport",
        earning_type_label: "Transport Allowance",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat amount of 1600",
        epf: true,
        epf_mode: "pf_wage",
        esi: true,
        mark_active: false,
      },
      {
        id: 7,
        name: "Travelling Allowance",
        earning_type: "travelling",
        earning_type_label: "Travelling Allowance",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat Amount",
        epf: true,
        epf_mode: "pf_wage",
        esi: false,
        mark_active: false,
      },
      {
        id: 8,
        name: "Fixed Allowance",
        earning_type: "fixed",
        earning_type_label: "Fixed Allowance",
        calculation_type: "flat",
        calculation_type_label: "Fixed; Flat Amount",
        epf: true,
        epf_mode: "pf_wage",
        esi: true,
        mark_active: true,
      },
      {
        id: 9,
        name: "Overtime Allowance",
        earning_type: "overtime",
        earning_type_label: "Overtime Allowance",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: true,
        mark_active: false,
      },
      {
        id: 10,
        name: "Gratuity",
        earning_type: "gratuity",
        earning_type_label: "Gratuity",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: false,
        mark_active: true,
      },
      {
        id: 11,
        name: "Bonus",
        earning_type: "bonus",
        earning_type_label: "Bonus",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: false,
        mark_active: true,
      },
      {
        id: 12,
        name: "Commission",
        earning_type: "commission",
        earning_type_label: "Commission",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: true,
        mark_active: true,
      },
      {
        id: 13,
        name: "Leave Encashment",
        earning_type: "leave_encashment",
        earning_type_label: "Leave Encashment",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: false,
        mark_active: true,
      },
      {
        id: 14,
        name: "Notice Pay",
        earning_type: "notice_pay",
        earning_type_label: "Notice Pay",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: false,
        mark_active: true,
      },
      {
        id: 15,
        name: "Hold Salary",
        earning_type: "hold_salary",
        earning_type_label: "Hold Salary (Non Taxable)",
        calculation_type: "flat",
        calculation_type_label: "Variable; Flat Amount",
        epf: false,
        epf_mode: "always",
        esi: false,
        mark_active: true,
      },
    ],
    deductions: [
      { id: 1, name: "Withheld Salary", deduction_type_label: "Withheld Salary", frequency_label: "One Time", mark_active: true },
      { id: 2, name: "Notice Pay Deduction", deduction_type_label: "Notice Pay Deduction", frequency_label: "One Time", mark_active: true },
    ],
    benefits: [
      { id: 1, name: "Voluntary Provident Fund", deduction_type_label: "Voluntary Provident Fund", frequency_label: "Recurring", mark_active: true },
    ],
  reimbursements: [
  { id: 1, name: "Fuel Reimbursement", deduction_type_label: "Fuel Reimbursement", maximum_reimbursable_amount: 0, mark_active: false },
  { id: 2, name: "Driver Reimbursement", deduction_type_label: "Driver Reimbursement", maximum_reimbursable_amount: 0, mark_active: false },
  { id: 3, name: "Vehicle Maintenance Reimbursement", deduction_type_label: "Vehicle Maintenance Reimbursement", maximum_reimbursable_amount: 0, mark_active: false },
  { id: 4, name: "Telephone Reimbursement", deduction_type_label: "Telephone Reimbursement", maximum_reimbursable_amount: 0, mark_active: false },
  { id: 5, name: "Leave Travel Allowance", deduction_type_label: "Leave Travel Allowance", maximum_reimbursable_amount: 0, mark_active: false },
],
  };

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
            <SalaryStructureTable   />
          </TabPane>   

       
  <TabPane tabId="2">
    

    <AssignStructureTable/>
  </TabPane>


      

         
        </TabContent>
      </Col>
    </Row>
  );
};

export default SalaryStructureTab;