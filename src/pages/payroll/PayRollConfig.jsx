import React, { useMemo, useState } from "react";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  Card,
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { MetaTitle } from "../../common/data/MetaTitle";

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
import { testId, itemTestKey } from "../../shared/testing/testId";
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
  // Mount a tab the first time it is opened so its APIs do not run with every other tab.
  const [mountedTabs, setMountedTabs] = useState({ 1: true });
  const [sectionActionsEl, setSectionActionsEl] = useState(null);
  const dispatch = useDispatch();
  const { company_detail } = useSelector((state) => state.CompanyReducer);

  document.title = `Payroll | ${MetaTitle || "Lint HR"}`;

  const toggleVertical = (tab) => {
    if (verticalTab === tab) return;
    setVerticalTab(tab);
    setMountedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
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
    { id: "1", label: "Component", icon: "ri-stack-line", tone: "124, 92, 252", short: "Earnings & deductions", hint: "Recurring salary components" },
    { id: "2", label: "Reimbursement", icon: "ri-hand-coin-line", tone: "247, 144, 9", short: "Claims & types", hint: "Types and employee claims" },
    { id: "3", label: "Salary Structure", icon: "ri-organization-chart", tone: "var(--vz-info-rgb)", short: "Templates & assignment", hint: "Structures and employee assignment" },
    { id: "4", label: "Policy Settings", icon: "ri-shield-check-line", tone: "100, 116, 139", short: "PF, ESI, tax & more", hint: "PF, ESI, leave and tax policies" },
    { id: "5", label: "Payroll Run", icon: "ri-play-circle-line", tone: "var(--vz-success-rgb)", short: "Process monthly pay", hint: "Process and review payroll runs" },
    { id: "6", label: "Regularization", icon: "ri-edit-2-line", tone: "236, 72, 153", short: "Pre-payout fixes", hint: "Adjust attendance before payout" },
  ];
  const activeItem = navItems.find((item) => item.id === verticalTab) || navItems[0];

  return (
    <div className="page-content payroll-page">
      <style>{`
        .payroll-page .pr-shell { border:0; border-radius:0; overflow:hidden; }
        .payroll-page .pr-hero {
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
          padding:22px 28px;
          background:var(--app-head-tint), var(--vz-secondary-bg);
          border-bottom:1px solid var(--vz-border-color);
        }
        .payroll-page .pr-hero-icon {
          width:56px; height:56px; flex:0 0 56px; border-radius:16px; font-size:26px;
          display:inline-flex; align-items:center; justify-content:center;
          color:#fff; background:linear-gradient(135deg, var(--vz-success), color-mix(in srgb, var(--vz-success) 55%, var(--vz-info)));
          box-shadow:0 6px 16px color-mix(in srgb, var(--vz-success) 32%, transparent);
        }
        .payroll-page .pr-title { font-size:20px; font-weight:700; margin:0; color:var(--vz-heading-color, var(--vz-body-color)); }
        .payroll-page .pr-sub { font-size:13px; color:var(--vz-secondary-color); margin-top:2px; }
        .payroll-page .pr-current {
          display:inline-flex; align-items:center; gap:10px; padding:8px 14px 8px 8px; border-radius:14px;
          background:var(--vz-secondary-bg); border:1px solid var(--vz-border-color);
          box-shadow:0 2px 8px rgba(15,23,42,.05);
        }
        .payroll-page .pr-current-icon {
          width:32px; height:32px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center;
          color:rgb(var(--nv, var(--vz-primary-rgb))); background:rgba(var(--nv, var(--vz-primary-rgb)), .12); font-size:16px; transition:all .2s ease;
        }
        .payroll-page .pr-current-label { font-size:13px; font-weight:600; color:var(--vz-heading-color, var(--vz-body-color)); line-height:1.2; }
        .payroll-page .pr-current-hint { font-size:11.5px; color:var(--vz-secondary-color); }

        .payroll-page .pr-nav { padding:16px 12px; position:sticky; top:70px; }
        .payroll-page .pr-nav-title { display:flex; align-items:center; gap:10px; font-size:10.5px; font-weight:700; letter-spacing:1.1px; text-transform:uppercase; color:var(--vz-secondary-color); padding:0 8px 10px; }
        .payroll-page .pr-nav-title::after { content:""; flex:1; height:1px; background:linear-gradient(90deg, var(--vz-border-color), transparent); }
        .payroll-page .payroll-nav-link {
          --nv: var(--vz-primary-rgb);
          position:relative; display:flex; align-items:center; gap:11px; width:100%; border:0; border-radius:12px;
          background:transparent; color:var(--vz-heading-color, var(--vz-body-color)); text-align:left;
          padding:8px 10px; margin-bottom:4px; transition:background-color .18s ease, color .18s ease, box-shadow .18s ease;
        }
        .payroll-page .payroll-nav-icon {
          width:36px; height:36px; border-radius:11px; flex-shrink:0; font-size:17px; line-height:1;
          display:inline-grid; place-items:center;
          background:rgba(var(--nv), .1); color:rgb(var(--nv)); transition:all .2s ease;
        }
        .payroll-page .payroll-nav-text { display:flex; flex-direction:column; min-width:0; flex:1; line-height:1.25; }
        .payroll-page .payroll-nav-label { font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .payroll-page .payroll-nav-short { font-size:11px; font-weight:400; color:var(--vz-secondary-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
        .payroll-page .payroll-nav-chev { font-size:16px; color:rgb(var(--nv)); opacity:0; transform:translateX(-4px); transition:all .2s ease; }
        .payroll-page .payroll-nav-link:hover { background:rgba(var(--nv), .07); }
        .payroll-page .payroll-nav-link:hover .payroll-nav-icon { background:rgba(var(--nv), .16); transform:translateY(-1px); }
        .payroll-page .payroll-nav-link:hover .payroll-nav-chev { opacity:.6; transform:none; }
        .payroll-page .payroll-nav-link.active {
          background:linear-gradient(90deg, rgba(var(--nv), .14), rgba(var(--nv), .03));
          box-shadow:inset 0 0 0 1px rgba(var(--nv), .18);
        }
        .payroll-page .payroll-nav-link.active::before {
          content:""; position:absolute; left:-12px; top:10px; bottom:10px; width:4px; border-radius:0 4px 4px 0;
          background:rgb(var(--nv)); box-shadow:0 0 10px rgba(var(--nv), .6);
        }
        .payroll-page .payroll-nav-link.active .payroll-nav-label { color:rgb(var(--nv)); }
        .payroll-page .payroll-nav-link.active .payroll-nav-icon {
          color:#fff; background:linear-gradient(135deg, rgb(var(--nv)), rgba(var(--nv), .75));
          box-shadow:0 6px 14px -6px rgba(var(--nv), .85);
        }
        .payroll-page .payroll-nav-link.active .payroll-nav-chev { opacity:1; transform:none; }
        .payroll-page .pr-content { padding:20px 24px 24px; min-width:0; }
        .payroll-page .pr-section-head { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
        .payroll-page .pr-section-icon {
          width:40px; height:40px; flex:0 0 40px; border-radius:11px; font-size:19px;
          display:inline-flex; align-items:center; justify-content:center;
          color:#fff; background:linear-gradient(135deg, rgb(var(--nv, var(--vz-primary-rgb))), rgba(var(--nv, var(--vz-primary-rgb)), .75));
        }
        .payroll-page .pr-section-title { font-size:16px; font-weight:700; margin:0; color:var(--vz-heading-color, var(--vz-body-color)); }
        .payroll-page .pr-section-hint { font-size:12.5px; color:var(--vz-secondary-color); }
        /* ── Buttons: keep icon and label on one vertical centre ── */
        .payroll-page .pr-content .btn,
        .payroll-page .pr-hero .btn {
          display:inline-flex; align-items:center; justify-content:center; gap:6px; line-height:1.2;
        }
        .payroll-page .pr-content .btn > i,
        .payroll-page .pr-content .btn > span > i {
          display:inline-flex; align-items:center; justify-content:center;
          line-height:1; margin:0 !important; vertical-align:middle; font-size:15px;
        }
        .payroll-page .pr-content .btn-sm > i { font-size:14px; }
        .payroll-page .pr-content .btn.p-0 { gap:4px; }

        /* ── Shared look for every payroll tab ── */
        .payroll-page .pr-content .nav-tabs-custom {
          display:inline-flex; flex-wrap:nowrap; gap:4px; width:auto; padding:4px; margin-bottom:18px !important;
          border:1px solid var(--vz-border-color); border-radius:12px; background:var(--vz-tertiary-bg);
        }
        .payroll-page .pr-content .nav-tabs-custom .nav-item { flex:0 0 auto; }
        .payroll-page .pr-content .nav-tabs-custom .nav-link {
          border:0 !important; border-radius:9px; padding:7px 18px; font-size:13px; font-weight:600;
          color:var(--vz-secondary-color); background:transparent; white-space:nowrap; transition:all .15s ease;
        }
        .payroll-page .pr-content .nav-tabs-custom .nav-link::after { display:none !important; }
        .payroll-page .pr-content .nav-tabs-custom .nav-link:hover { color:var(--vz-primary); }
        .payroll-page .pr-content .nav-tabs-custom .nav-link.active {
          background:var(--vz-secondary-bg); color:var(--vz-primary);
          box-shadow:0 2px 8px rgba(15,23,42,.08);
        }
        .payroll-page .pr-content .nav-tabs-custom .nav-link .badge { border-radius:999px; }

        .payroll-page .pr-content .card {
          border:1px solid var(--vz-border-color) !important; border-radius:14px; overflow:hidden;
          background:var(--vz-secondary-bg); box-shadow:0 4px 18px rgba(15,23,42,.05) !important;
        }
        .payroll-page .pr-content .card-header {
          background:linear-gradient(120deg, rgba(var(--vz-primary-rgb), .09) 0%, rgba(var(--vz-info-rgb), .04) 60%, transparent 100%) !important;
          border-bottom:1px solid var(--vz-border-color); padding:16px 20px;
        }
        .payroll-page .pr-content .card-header .card-title { font-size:16px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); }
        .payroll-page .pr-content .card-header .card-subtitle { color:var(--vz-secondary-color) !important; }
        .payroll-page .pr-content .card-header .btn { border-radius:8px; font-weight:500; }

        .payroll-page .pr-content .row-cols-xl-5 .card {
          position:relative; box-shadow:none !important; transition:transform .15s ease, box-shadow .15s ease;
        }
        .payroll-page .pr-content .row-cols-xl-5 .card:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(15,23,42,.08) !important; }
        .payroll-page .pr-content .row-cols-xl-5 .card::before {
          content:""; position:absolute; left:0; top:14px; bottom:14px; width:3px; border-radius:0 3px 3px 0;
          background:var(--vz-primary); opacity:.7;
        }
        .payroll-page .pr-content .row-cols-xl-5 .col:nth-child(1) .card::before { background:var(--vz-info); }
        .payroll-page .pr-content .row-cols-xl-5 .col:nth-child(3) .card::before { background:var(--vz-success); }
        .payroll-page .pr-content .row-cols-xl-5 .col:nth-child(4) .card::before { background:var(--vz-warning); }
        .payroll-page .pr-content .row-cols-xl-5 .col:nth-child(5) .card::before { background:var(--vz-secondary-color); }
        .payroll-page .pr-content .row-cols-xl-5 h4 { font-size:24px; }
        .payroll-page .pr-content .text-dark { color:var(--vz-heading-color, var(--vz-body-color)) !important; }

        .payroll-page .pr-content .alert { border-radius:12px; }
        .payroll-page .pr-content .form-control,
        .payroll-page .pr-content .form-select { border-radius:8px; }

        @media (max-width: 991.98px) {
          .payroll-page .pr-content .nav-tabs-custom { display:flex; overflow-x:auto; }
          .payroll-page .pr-nav { position:static; display:flex; gap:6px; overflow-x:auto; padding:12px; }
          .payroll-page .pr-nav-title { display:none; }
          .payroll-page .payroll-nav-link { width:auto; white-space:nowrap; margin-bottom:0; flex:0 0 auto; }
          .payroll-page .payroll-nav-short, .payroll-page .payroll-nav-chev, .payroll-page .payroll-nav-link.active::before { display:none; }
          .payroll-page .pr-content { padding:16px; }
        }
      `}</style>
      <Container fluid>
        <Card className="mt-n4 mx-n4 pr-shell">
          <div className="pr-hero">
            <div className="d-flex align-items-center gap-3">
              <span className="pr-hero-icon">
                <i className="ri-money-dollar-circle-line" />
              </span>
              <div>
                <h4 className="pr-title">Payroll</h4>
                <div className="pr-sub">
                  {company_detail?.full_name ? (
                    <>
                      <i className="ri-building-line align-bottom me-1" />
                      {company_detail.full_name}
                    </>
                  ) : (
                    "Components, structures, policies and payroll runs"
                  )}
                </div>
              </div>
            </div>
            <div className="pr-current">
              <span className="pr-current-icon" style={{ "--nv": activeItem.tone }}>
                <i className={activeItem.icon} />
              </span>
              <div>
                <div className="pr-current-label">{activeItem.label}</div>
                <div className="pr-current-hint">{activeItem.hint}</div>
              </div>
            </div>
          </div>

          <Row className="g-0">
            <Col lg={3} xl={2} className="border-end">
              <div className="pr-nav">
                <div className="pr-nav-title">Payroll</div>
                {navItems.map((item) => (
                  <button
                    data-testid={testId("payroll-config-next", itemTestKey(item), "button")}
                    key={item.id}
                    type="button"
                    className={classnames("payroll-nav-link", { active: verticalTab === item.id })}
                    style={{ "--nv": item.tone }}
                    onClick={() => toggleVertical(item.id)}
                  >
                    <span className="payroll-nav-icon">
                      <i className={item.icon} />
                    </span>
                    <span className="payroll-nav-text">
                      <span className="payroll-nav-label">{item.label}</span>
                      <span className="payroll-nav-short">{item.short}</span>
                    </span>
                    <i className="ri-arrow-right-s-line payroll-nav-chev" />
                  </button>
                ))}
              </div>
            </Col>
            <Col lg={9} xl={10} className="pr-content">
                <div className="pr-section-head">
                  <span className="pr-section-icon" style={{ "--nv": activeItem.tone }}>
                    <i className={activeItem.icon} />
                  </span>
                  <div>
                    <h5 className="pr-section-title">{activeItem.label}</h5>
                    <div className="pr-section-hint">{activeItem.hint}</div>
                  </div>
                  <div ref={setSectionActionsEl} className="ms-auto d-flex align-items-center gap-2" />
                </div>
                <TabContent activeTab={verticalTab} className="text-muted" id="v-pills-tabContent">
                  {mountedTabs["1"] && (
                    <TabPane tabId="1">
                      <RecurringTable
                        actionsContainer={verticalTab === "1" ? sectionActionsEl : null}
                      />
                    </TabPane>
                  )}
                  {mountedTabs["2"] && (
                    <TabPane tabId="2">
                      <ReimbursementsTab />
                    </TabPane>
                  )}
                  {mountedTabs["3"] && (
                    <TabPane tabId="3">
                      <SalaryStructureTab
                        payrollobj={payrollobj}
                        onEarningAdd={handleEarningAdd}
                      />
                    </TabPane>
                  )}
                  {mountedTabs["4"] && (
                    <TabPane tabId="4">
                      <AdvancedSettingsTab />
                    </TabPane>
                  )}
                  {mountedTabs["5"] && (
                    <TabPane tabId="5">
                      <PayrollRun />
                    </TabPane>
                  )}
                  {mountedTabs["6"] && (
                    <TabPane tabId="6">
                      <PayrollBulkEditor />
                    </TabPane>
                  )}
                </TabContent>
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default PayRollConfig;
