import React, { useMemo, useState } from "react";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
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
import { useDispatch } from "react-redux";

import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  setAllowances,
  setDeductions,
  setEarnings,
} from "../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import {
  epf_wage_form_component_name,
  professional_tax_form_component_name,
  salary_form_component_name_earnings,
  salary_policy_form_component_name,
  salary_form_component_name_deduction,
  salary_form_component_name_benefits,
  salary_form_component_name_reimbursements
} from "../../common/constant/Constants";
import RecurringTable from "./PayrollComponent/RecurringTable";

// Tab components
import GeneralTab from "./GeneralTab";
import PayCyclesTab from "./PayCyclesTab";
import BasicComponentsTab from "./BasicComponentsTab";
import SalaryComponentsTab from "./SalaryComponent/SalaryComponentsTab";
import SalaryPoliciesTab from "./SalaryPoliciesTab";
import SalaryStructureTab from "./SalaryStructure/SalaryStructureTab";
import PayrollComponentTab from "./PayrollComponent/PayrollComponentTab";
import PayrollSettings from "./AdvancedSettings/PayrollSettings";
import AdvancedSettingsTab from "./AdvancedSettings/AdvancedSettingsTab";
import PayrollRun from "./payrollRun/payrollRun";
import PayrollBulkEditor from "./payrollRun/PayrollBulkEditor";
import EmployeePayslip from "./payrollRun/EmployeePayslip";
import ReimbursementsTab from "./PayrollComponent/ReimbursementsTab";
import StatusMasterTab from "./payrollRun/StatusMasterTab";
defineElement(loadAnimation);

// ─── Shared static data ──────────────────────────────────────────────────────

const payrollobj = {
  general: {
    location: "India",
    currency: "INR",
    calc_based_on: "Month Starting",
  },
  pay_cycle: {
    name: "Junior",
    desc: "",
    from: "Nov, 23",
    repeat: "Month",
    cut_off: "Day 28",
  },
  basic_components: {
    esi: { is_active: true, labour_fund: true },
    epf: {
      is_active: true,
      epf_cycle: 3,
      epf_type: "Weekly",
      epf_type_id: "2",
    },
    labour_fund: true,
    pro_tax: [
      {
        is_active: true,
        company: "Lintcloud It Service Pvt Ltd",
        tag: "HEADQUARTER",
        add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117",
        state: "Tamil Nadu",
        tax_cycle: "Half-yearly",
        slabs: 1,
      },
      {
        is_active: false,
        company: "Lintcloud Human Resource",
        tag: "Lint HR",
        add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117",
        state: "Kerala",
        tax_cycle: "Half-yearly",
        slabs: 2,
      },
    ],
  },
  salary_components: {
    earnings: [
      {
        id: 1, type: "1", name: "Basic Salary", desc: "", pro_rata: true,
        tax: true, insurance: false, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: true,
      },
      {
        id: 2, type: "1", name: "Special Salary", desc: "", pro_rata: true,
        tax: true, insurance: true, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: false,
      },
    ],
    allowances: [
      {
        id: 1, type: "2", name: "HRA", desc: "", pro_rata: true,
        tax: true, insurance: true, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: true,
      },
      {
        id: 2, type: "2", name: "Life Style", desc: "", pro_rata: true,
        tax: true, insurance: true, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: true,
      },
    ],
    deductions: [
      {
        id: 1, type: "3", name: "Year End Fund", desc: "", pro_rata: true,
        tax: true, insurance: true, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: true,
      },
      {
        id: 2, type: "3", name: "Activity Fund", desc: "", pro_rata: true,
        tax: true, insurance: true, calculation_type: 1, time_period: 0,
        selected: false, contribute: [], esi: true, epf: true,
      },
    ],
  },
};

const EPFCycle = [
  {
    id: 1,
    Employee: "12% of Actual PF Wage",
    Employer: "12% of Actual PF Wage",
  },
  {
    id: 2,
    Employee: "12% of Actual PF Wage",
    Employer: "3.67% of PF Wage restricted at ₹ 15000",
  },
  {
    id: 3,
    Employee: "12% of PF Wage restricted at ₹ 15000",
    Employer: "3.67% of PF Wage restricted at ₹ 15000",
  },
];

const taxSlab = [
  {
    id: 1,
    state: "Tamil Nadu",
    cycle_id: "3",
    range: [
      { s: 0, e: 21000, tax: 0 },
      { s: 21001, e: 30000, tax: 135 },
      { s: 30001, e: 45000, tax: 315 },
      { s: 45001, e: 60000, tax: 690 },
      { s: 60001, e: 75000, tax: 1025 },
      { s: 75001, e: 999999999, tax: 1250 },
    ],
  },
  {
    id: 2,
    state: "Kerala",
    cycle_id: "3",
    range: [
      { s: 0, e: 11999, tax: 0 },
      { s: 12000, e: 17999, tax: 120 },
      { s: 18000, e: 29999, tax: 180 },
      { s: 45001, e: 60000, tax: 690 },
      { s: 60001, e: 75000, tax: 1025 },
      { s: 75001, e: 999999999, tax: 1250 },
    ],
  },
];

// ─── Select options ───────────────────────────────────────────────────────────

const locationOption = [
  { id: "India", label: "India", value: "India" },
  { id: "Srilanka", label: "Srilanka", value: "Srilanka" },
  { id: "Singapore", label: "Singapore", value: "Singapore" },
];

const currencyOption = [
  { id: "INR", label: "INR", value: "INR" },
  { id: "USD", label: "USD", value: "USD" },
];

const salaryCalculationOption = [
  { id: "1", label: "Actual Calender Days", value: "Actual Calender Days" },
  { id: "2", label: "Month Starting", value: "Month Starting" },
];

const repeatOption = [
  { id: "1", label: "Month", value: "Month" },
  { id: "2", label: "Week", value: "Week" },
];

const cutOfMonthOption = [
  { id: "1", label: "Day 21", value: "Day 21" },
  { id: "2", label: "Day 22", value: "Day 22" },
  { id: "3", label: "Day 23", value: "Day 23" },
  { id: "4", label: "Day 24", value: "Day 24" },
  { id: "5", label: "Day 25", value: "Day 25" },
  { id: "6", label: "Day 26", value: "Day 26" },
  { id: "7", label: "Day 27", value: "Day 27" },
  { id: "8", label: "Day 28", value: "Day 28" },
  { id: "9", label: "Last Day Of Month", value: "Last Day Of Month" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const PayRollConfig = () => {
  const [verticalTab, setVerticalTab] = useState("1");
  const dispatch = useDispatch();

  const toggleVertical = (tab) => {
    if (verticalTab !== tab) setVerticalTab(tab);
  };

  // ── Handlers passed down to child tabs ──

  const handleEPFEdit = (obj) => {
    dispatch(setFormObj(obj));
    dispatch(setFormTitle("Edit EPF"));
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow(epf_wage_form_component_name));
    dispatch(toggleRSBView(true));
  };

  const handleTaxEdit = ($id, obj) => {
    dispatch(setFormTitle("Edit Professional Tax"));
    const taxSlabObj = taxSlab.find((data) => data.id === $id);
    dispatch(setFormObj(taxSlabObj));
    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow(professional_tax_form_component_name));
    dispatch(toggleRSBView(true));
  };

  // tabType: "1" = Earnings, "2" = Allowances, "3" = Deductions
 const handleEarningAdd = (item, tabType) => {
  // ✅ Title Mapping
  const titleMap = {
    "1": "Edit Earning",
    "2": "Edit Deduction",
    "3": "Edit Benefit",
    "4": "Edit Reimbursement",
  };

  dispatch(setFormTitle(titleMap[tabType] || "Edit Earning"));

  // ✅ Initial Form Object
  const initialFormObj = {
    id: 0,
    type: tabType,
    name: "",
    desc: "",
    is_pro_rata: false,
    is_taxable: false,
    is_insurance: false,
    contribute: [payrollobj.basic_components],
  };

  // ✅ Source Data Mapping
  const sourceMap = {
    "1": payrollobj.salary_components.earnings,
    "2": payrollobj.salary_components.deductions,
    "3": payrollobj.salary_components.benefits,
    "4": payrollobj.salary_components.reimbursements,
  };

  if (!item) {
    dispatch(setFormObj(initialFormObj));
  } else {
    const found = (sourceMap[tabType] || []).find(
      (d) => d.name === item.name
    );
    dispatch(setFormObj(found || initialFormObj));
  }

  // ✅ Component Mapping (FIXED)
  const componentMap = {
    "1": salary_form_component_name_earnings,
    "2": salary_form_component_name_deduction,
    "3": salary_form_component_name_benefits,
    "4": salary_form_component_name_reimbursements,
  };

  dispatch(setComponentToShow(componentMap[tabType]));

  // ✅ UI Controls
  dispatch(setFormWidthPercentage("40%"));
  dispatch(toggleRSBView(true));
};

  const handleSalaryPoliciesAdd = ($id) => {
    dispatch(setFormTitle("Create policy"));

    const policiesFormObj = {
      id: 0,
      name: "",
      desc: "",
      earnings: [payrollobj.salary_components.earnings],
      allowances: "",
      deductions: "",
      compliances: "",
    };

    dispatch(setFormObj($id === 0 ? policiesFormObj : null));
    dispatch(setEarnings(payrollobj.salary_components.earnings));
    dispatch(setAllowances(payrollobj.salary_components.allowances));
    dispatch(setDeductions(payrollobj.salary_components.deductions));
    dispatch(setFormWidthPercentage("70%"));
    dispatch(setComponentToShow(salary_policy_form_component_name));
    dispatch(toggleRSBView(true));
  };

  const navItems = [
    { id: "1", label: "Component" },
    { id: "2", label: "Reimbursement" },
    { id: "3", label: "Salary Structure" },
    { id: "4", label: "Policy Settings" },
    { id: "5", label: "Payroll Run" },
    { id: "6", label: "Regularization" },
    // { id: "7", label: "Status Master" },
  ];

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <h5 className="mb-3">Payroll Configuration</h5>

          <Row>
            {/* Vertical sidebar nav */}
            <Col md={2} className="border-end">
              <Nav pills className="flex-column text-left" id="v-pills-tab">
                {navItems.map((item) => (
                  <NavItem key={item.id}>
                    <NavLink
                      style={{ cursor: "pointer" }}
                      className={classnames({
                        "mb-2": true,
                        active: verticalTab === item.id,
                      })}
                      onClick={() => toggleVertical(item.id)}
                    >
                      {item.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </Col>

            {/* Tab content */}
            <Col md={10}>
              <TabContent
                activeTab={verticalTab}
                className="text-muted mt-4 mt-md-0"
                id="v-pills-tabContent"
              >
                
                <TabPane tabId="1">
                  <RecurringTable />
                </TabPane>
                <TabPane tabId="2">
                  <ReimbursementsTab />
                </TabPane>
                <TabPane tabId="3">
                  <SalaryStructureTab
                    payrollobj={payrollobj}
                    onEarningAdd={handleEarningAdd}
                  />
                </TabPane>
                <TabPane tabId="4">
                  <AdvancedSettingsTab />
                </TabPane>

                <TabPane tabId="5">
                  <PayrollRun />
                </TabPane>

                
                <TabPane tabId="6">
                  <PayrollBulkEditor />
                </TabPane>

                {/* <TabPane tabId="7">
                  <StatusMasterTab />
                </TabPane> */}
              </TabContent>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default PayRollConfig;