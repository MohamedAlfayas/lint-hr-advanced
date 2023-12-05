import React, { useEffect, useMemo, useState } from "react";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";

import {
  setDepartmentData,
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
  setTaxSlab,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useDispatch } from "react-redux";
import InfoTable from "../../component/common/table/InfoTable";
import { setAllowances, setDeductions, setEarnings } from "../../redux/reducers/ChildReducer/SalaryComponentsReducer";

// register lottie and define custom element
defineElement(loadAnimation);

const PayRollConfig = () => {
  // Vertical Nav Tabs
  const [verticalTab, setverticalTab] = useState("1");
  const toggleVertical = (tab) => {
    if (verticalTab !== tab) {
      setverticalTab(tab);
    }
  };

  // Custom Tabs Bordered
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };
  const [customActiveTab1, setcustomActiveTab1] = useState("1");
  const toggleCustom1 = (tab) => {
    if (customActiveTab1 !== tab) {
      setcustomActiveTab1(tab);
    }
  };

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
      esi: {
        is_active: true,
        labour_fund: true,
      },
      epf: {
        is_active: true,
        epf_cycle: 3,
        epf_type: "Weekly",
        epf_type_id: "2",
      },
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
          id: 1,
          type: "1",
          name: "Basic Salary",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: true,
        },
        {
          id: 2,
          type: "1",
          name: "Special Salary",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: false,
        },
      ],
      allowances: [
        {
          id: 1,
          type: "2",
          name: "HRA",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: true,
        },
        {
          id: 2,
          type: "2",
          name: "Life Style",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: true,
        },
      ],
      deductions: [
        {
          id: 1,
          type: "3",
          name: "Year End Fund",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: true,
        },
        {
          id: 2,
          type: "3",
          name: "Activity Fund",
          desc: "",
          pro_rata: true,
          tax: true,
          insurance: true,
          contribute: [],
          esi: true,
          epf: true,
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

  const tax_slab = [
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

  console.log(payrollobj);

  const location_option = useMemo(
    () => [
      { id: "India", label: "India", value: "India" },
      { id: "Srilanka", label: "Srilanka", value: "Srilanka" },
      { id: "Singapore", label: "Singapore", value: "Singapore" },
    ],
    []
  );

  const currency_option = useMemo(
    () => [
      { id: "INR", label: "INR", value: "INR" },
      { id: "USD", label: "USD", value: "USD" },
    ],
    []
  );
  const salary_calculation_option = useMemo(
    () => [
      { id: "1", label: "Actual Calender Days", value: "Actual Calender Days" },
      { id: "2", label: "Month Starting", value: "Month Starting" },
    ],
    []
  );

  const repeat_option = useMemo(
    () => [
      { id: "1", label: "Month", value: "Month" },
      { id: "2", label: "Week", value: "Week" },
    ],
    []
  );

  const cut_of_month_option = useMemo(
    () => [
      { id: "1", label: "Day 21", value: "Day 21" },
      { id: "2", label: "Day 22", value: "Day 22" },
      { id: "3", label: "Day 23", value: "Day 23" },
      { id: "4", label: "Day 24", value: "Day 24" },
      { id: "5", label: "Day 25", value: "Day 25" },
      { id: "6", label: "Day 26", value: "Day 26" },
      { id: "7", label: "Day 27", value: "Day 27" },
      { id: "8", label: "Day 28", value: "Day 28" },
      { id: "9", label: "Last Day Of Month", value: "Last Day Of Month" },
    ],
    []
  );

  const cut_of_week_option = useMemo(
    () => [
      { id: "1", label: "Friday", value: "Friday" },
      { id: "2", label: "Saturday", value: "Saturday" },
      { id: "3", label: "Sunday", value: "Sunday" },
    ],
    []
  );

  const dispatch = useDispatch();

  const newDepObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      description: "",
      pid: 0,
    };
  }, []);

  const handleEPFEdit = (obj) => {
    dispatch(setFormObj(obj));
    dispatch(setFormTitle("Edit EPF"));
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow("EPFWageForm"));
    dispatch(toggleRSBView(true));
  };

  const handleTaxEdit = ($id, obj) => {
    console.log('Calling handleTaxEdit with id:', $id, 'and object:', tax_slab);

    dispatch(setFormTitle("Edit Professional Tax"));
    let tax_slab_obj = tax_slab.find((data) => data.id == $id);
    dispatch(setFormObj(tax_slab_obj));

    console.log("test....", tax_slab_obj)

    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow("ProfessionalTaxForm"));
    dispatch(toggleRSBView(true));
  };


  const initialFormObj = useMemo(() => {

    return {
      id: 0,
      type: customActiveTab1,
      name: "",
      desc: "",
      is_pro_rata: false,
      is_taxable: false,
      is_insurance: false,
      contribute: [payrollobj.basic_components]

    };
  }, []);

  const handleEaringAdd = ($id) => {
    const value = customActiveTab1 == 1 ? "Edit Earning" :
      customActiveTab1 == 2 ? 'Edit Allowance' :
        customActiveTab1 == 3 ? 'Edit Deduction' : ""
    // dispatch(setFormTitle("Edit Earning"));
    dispatch(setFormTitle(value));

    if ($id == 0) {


      dispatch(setFormObj(initialFormObj));


    } else {
      dispatch(setFormObj(earning_obj[0]));



    }
    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow("SalaryCmpntForm"));
    dispatch(toggleRSBView(true));
  };

  const policiesFormObj = useMemo(() => {

    return {
      id: 0,
      name: "",
      desc: "",
      earnings: [payrollobj.salary_components.earnings],
      allowances: "",
      deductions: "",
      compliances: "",

    };
  }, []);
  const handleSalaryPoliciesAdd = ($id) => {
    dispatch(setFormTitle("Create policy"));

    if ($id == 0) {


      dispatch(setFormObj(policiesFormObj));


    } else {
      dispatch(setFormObj(earning_obj[0]));
    

    }
    dispatch(setEarnings(payrollobj.salary_components.earnings))
    dispatch(setEarnings(payrollobj.salary_components.earnings))
    dispatch(setAllowances(payrollobj.salary_components.allowances))
    dispatch(setDeductions(payrollobj.salary_components.deductions))
    dispatch(setFormWidthPercentage("50%"));
    dispatch(setComponentToShow("SalaryPoliciesForm"));
    dispatch(toggleRSBView(true));
  };

  const [modal_animationZoom, setmodal_animationZoom] = useState(false);
  const [tax_slabId, setTax_slabId] = useState(0);

  function show_taxSlabModal($id) {
    console.log($id);
    setTax_slabId($id);

    console.log(tax_slab.find((e) => e.id == $id).range);
    setmodal_animationZoom(!modal_animationZoom);
  }

  let leavetypes = [
    { id: 1, name: "Casual Leave (CL)", type: "Day" },
    { id: 2, name: "Earned Leave (EL)", type: "Hour" },
    { id: 3, name: "Sick Leave (SL)", type: "Day" },
    { id: 4, name: "Permission", type: "Hour" },
  ];

  const handleCreateAndUpdate = (item) => {
    console.log('item', item, customActiveTab1);
    const value = customActiveTab1 == 1 ? "Edit Earning" :
      customActiveTab1 == 2 ? 'Edit Allowance' :
        customActiveTab1 == 3 ? 'Edit Deduction' : ""
    dispatch(setFormTitle(value));
    let componentType;
    let componentObj;
    console.log('edit clicked');
    if (customActiveTab1 == 1) {
      componentType = 'earnings';
      componentObj = payrollobj.salary_components.earnings.find((data) => data.name === item?.name);
      console.log(`${componentType}:`, componentObj);
    } else if (customActiveTab1 == 2) {
      componentType = 'allowances';
      componentObj = payrollobj.salary_components.allowances.find((data) => data.name === item?.name);
      console.log(`${componentType}:`, componentObj);
    } else if (customActiveTab1 == 3) {
      componentType = 'deductions';
      componentObj = payrollobj.salary_components.deductions.find((data) => data.name === item?.name);
      console.log(`${componentType}:`, componentObj);
    }

    console.log("jjj", componentObj);
    dispatch(setFormObj(componentObj))
  

    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow("SalaryCmpntForm"));
    dispatch(toggleRSBView(true));
  }


  document.title = `PayRoll | ${MetaTitle || "Lint HR"} `;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="project-wrapper">
            <Col xxl={12}>
              <Card>
                <CardBody>
                  <h5 className="mb-3">Payroll Configuration</h5>

                  <Row>
                    <Col md={2} className="border-end">
                      <Nav
                        pills
                        className="flex-column text-left"
                        id="v-pills-tab"
                      >
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "1",
                            })}
                            onClick={() => {
                              toggleVertical("1");
                            }}
                            id="v-pills-home-tab"
                          >
                            General
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "2",
                            })}
                            onClick={() => {
                              toggleVertical("2");
                            }}
                            id="v-pills-profile-tab"
                          >
                            Pay Cycles
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "3",
                            })}
                            onClick={() => {
                              toggleVertical("3");
                            }}
                            id="v-pills-messages-tab"
                          >
                            Basic Components
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: verticalTab === "4",
                            })}
                            onClick={() => {
                              toggleVertical("4");
                            }}
                            id="v-pills-settings-tab"
                          >
                            Salary Components
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: verticalTab === "5",
                            })}
                            onClick={() => {
                              toggleVertical("5");
                            }}
                            id="v-pills-settings-tab"
                          >
                            Salary Policies
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </Col>
                    <Col md={10}>
                      <TabContent
                        activeTab={verticalTab}
                        className="text-muted mt-4 mt-md-0"
                        id="v-pills-tabContent"
                      >
                        {/* General Tab Start */}
                        <TabPane tabId="1" id="v-pills-home">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="location"
                                    className="form-label"
                                  >
                                    Location
                                  </Label>
                                  <div>
                                    <Select
                                      id="location"
                                      isMulti={false}
                                      options={location_option || []}
                                      value={
                                        (payrollobj.general.location &&
                                          location_option.find(
                                            (e) =>
                                              e.value ===
                                              payrollobj.general.location
                                          )) ||
                                        []
                                      }
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Select Payroll Country.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="currency"
                                    className="form-label"
                                  >
                                    Currency
                                  </Label>
                                  <div>
                                    <Select
                                      id="currency"
                                      isMulti={false}
                                      options={currency_option || []}
                                      value={
                                        (payrollobj.general.currency &&
                                          currency_option.find(
                                            (e) =>
                                              e.value ===
                                              payrollobj.general.currency
                                          )) ||
                                        []
                                      }
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Select Payroll Currency.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label"
                                  >
                                    Calculate Monthly Salary Based On
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={salary_calculation_option || []}
                                      value={
                                        (payrollobj.general.calc_based_on &&
                                          salary_calculation_option.find(
                                            (e) =>
                                              e.value ===
                                              payrollobj.general.calc_based_on
                                          )) ||
                                        []
                                      }
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Select Calculate Monthly Salary Based On.
                                  </div>
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="text-start">
                                  <Button
                                    type="submit"
                                    color="success"
                                    className="btn-label"
                                  >
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                  </Button>{" "}
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <Col md={9} lg={9} xxl={9}>
                            <Card>
                              <CardBody className="bg-info-subtle">
                                <div className="d-flex">
                                  <div className="flex-shrink-0">
                                    <FeatherIcon
                                      icon="info"
                                      className="text-info icon-dual-info"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6 className="fs-15">
                                      Payroll General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Event that applications book will appear
                                      here. Click on an event to see the details
                                      and manage applicants event.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                        {/* General Tab End */}

                        {/* Pay Cycle Tab Start */}
                        <TabPane tabId="2" id="v-pills-profile">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="pc_name"
                                    className="form-label"
                                  >
                                    Name
                                  </Label>
                                  <div className="form-icon right">
                                    <Input
                                      type="text"
                                      name="pc_name"
                                      id="pc_name"
                                      className="form-control"
                                      placeholder="Pay Cycle Name"
                                      value={payrollobj.pay_cycle.name || ""}
                                    />
                                    <i className="ri-profile-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Enter Pay Cycle Name.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="description"
                                    className="form-label"
                                  >
                                    Description
                                  </Label>
                                  <div className="form-icon right">
                                    <textarea
                                      type="text"
                                      name="description"
                                      className="form-control"
                                      id="description"
                                      value={payrollobj.pay_cycle.desc || ""}
                                      placeholder="Enter description"
                                    ></textarea>
                                    <i className="ri-file-list-3-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Enter Description Of Pay Cycles.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label"
                                  >
                                    Effective From
                                  </Label>
                                  <div>
                                    <Flatpickr
                                      className="form-control"
                                      placeholder="Effective From"
                                      value={payrollobj.pay_cycle.from}
                                      options={{
                                        shorthand: true, //defaults to false https://flatpickr.js.org/plugins/
                                        dateFormat: "M, y", //defaults to "F Y"
                                        altFormat: "F Y", //defaults to "F Y"
                                        theme: "dark", // defaults to "light"
                                      }}
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Choose the day after 30 Nov 2023.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label"
                                  >
                                    Repeat Every
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={repeat_option || []}
                                      value={
                                        (payrollobj.pay_cycle.repeat &&
                                          repeat_option.find(
                                            (e) =>
                                              e.value ===
                                              payrollobj.pay_cycle.repeat
                                          )) ||
                                        []
                                      }
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    Select Calculate Monthly Salary Based On.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label"
                                  >
                                    Cut-off Date
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={cut_of_month_option || []}
                                      value={
                                        (payrollobj.pay_cycle.cut_off &&
                                          cut_of_month_option.find(
                                            (e) =>
                                              e.value ===
                                              payrollobj.pay_cycle.cut_off
                                          )) ||
                                        []
                                      }
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3"
                                  >
                                    This is the latest date that payroll
                                    information should be submitted to calculate
                                    payroll.
                                  </div>
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="text-start">
                                  <Button
                                    type="submit"
                                    color="success"
                                    className="btn-label"
                                  >
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                  </Button>{" "}
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <Col md={9} lg={9} xxl={9}>
                            <Card>
                              <CardBody className="bg-info-subtle">
                                <div className="d-flex">
                                  <div className="flex-shrink-0">
                                    <FeatherIcon
                                      icon="info"
                                      className="text-info icon-dual-info"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6 className="fs-15">
                                      Payroll General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Event that applications book will appear
                                      here. Click on an event to see the details
                                      and manage applicants event.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                        {/* Pay Cycle Tab End */}

                        {/* Basic Components Tab Start */}
                        <TabPane tabId="3" id="v-pills-messages">
                          {/* Tab Inside Tab @Elan */}
                          <Row>
                            <Col xxl={12}>
                              <Nav
                                tabs
                                className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                              >
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "1",
                                    })}
                                    onClick={() => {
                                      toggleCustom("1");
                                    }}
                                  >
                                    ESI{" "}
                                    <small>
                                      {"(Employees state insurance)"}
                                    </small>
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "2",
                                    })}
                                    onClick={() => {
                                      toggleCustom("2");
                                    }}
                                  >
                                    EPF{" "}
                                    <small>
                                      {"(Employees' Provident Fund)"}
                                    </small>
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "3",
                                    })}
                                    onClick={() => {
                                      toggleCustom("3");
                                    }}
                                  >
                                    Professional Tax
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "4",
                                    })}
                                    onClick={() => {
                                      toggleCustom("4");
                                    }}
                                  >
                                    LABOUR WELFARE FUND
                                  </NavLink>
                                </NavItem>
                              </Nav>

                              <TabContent
                                activeTab={customActiveTab}
                                className="text-muted"
                              >
                                {/* ESI Tab */}
                                <TabPane tabId="1" id="home1">
                                  <div className="d-flex">
                                    <Col
                                      xxl={12}
                                      sm={12}
                                      className="project-card"
                                    >
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-${payrollobj.basic_components.esi
                                              ? "success"
                                              : "dark"
                                              }-subtle rounded-top`}
                                          >
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body"
                                                  >
                                                    ESI
                                                  </Link>
                                                </h5>
                                              </div>
                                              <div className="flex-shrink-0">
                                                <div className="d-flex gap-1 align-items-center my-n2">
                                                  <div className="form-check form-switch form-switch-success  ">
                                                    <Input
                                                      className="form-check-input"
                                                      type="checkbox"
                                                      role="switch"
                                                      id="enableESI"
                                                      checked={
                                                        payrollobj
                                                          .basic_components.esi
                                                          .is_active
                                                      }
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="enableESI"
                                                    >
                                                      Active
                                                    </Label>
                                                  </div>

                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="py-3">
                                            <Row className="gy-3">
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Deduction Cycle
                                                  </p>
                                                  <h5 className="fs-14">
                                                    Monthly
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Employee's Contribution
                                                  </p>
                                                  <h5 className="fs-14">
                                                    0.75 % of Gross Pay
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Employer's Contribution
                                                  </p>
                                                  <h5 className="fs-14">
                                                    3.25 % of Gross Pay
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col md={12} lg={12} xxl={12}>
                                                <Card>
                                                  <CardBody className="bg-info-subtle">
                                                    <div className="d-flex">
                                                      <div className="flex-shrink-0">
                                                        <FeatherIcon
                                                          icon="info"
                                                          className="text-info icon-dual-info"
                                                        />
                                                      </div>
                                                      <div className="flex-grow-1 ms-3">
                                                        <h6 className="fs-15">
                                                          Note!
                                                        </h6>
                                                        <p className="text-muted mb-0 hide">
                                                          ESI deductions will be
                                                          made only if the
                                                          employee’s monthly
                                                          salary is less than or
                                                          equal to ₹ 21,000. If
                                                          the employee gets a
                                                          salary revision which
                                                          increases their
                                                          monthly salary above ₹
                                                          21,000, they would
                                                          have to continue
                                                          making ESI
                                                          contributions till the
                                                          end of the
                                                          contribution period in
                                                          which the salary was
                                                          revised
                                                          (April-September or
                                                          October-March).
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardBody>
                                                </Card>
                                              </Col>
                                            </Row>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    </Col>
                                  </div>
                                </TabPane>

                                {/* EPF Tab */}
                                <TabPane tabId="2">
                                  <div className="d-flex">
                                    <Col
                                      xxl={12}
                                      sm={12}
                                      className="project-card"
                                    >
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-${payrollobj.basic_components.epf
                                              .is_active
                                              ? "success"
                                              : "dark"
                                              }-subtle rounded-top`}
                                          >
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body"
                                                  >
                                                    EPF
                                                  </Link>
                                                </h5>
                                              </div>
                                              <div className="flex-shrink-0">
                                                <div className="d-flex gap-1 align-items-center my-n2">
                                                  <div className="form-check form-switch form-switch-success  ">
                                                    <Input
                                                      className="form-check-input"
                                                      type="checkbox"
                                                      role="switch"
                                                      id="enableEPF"
                                                      checked={
                                                        payrollobj
                                                          .basic_components.epf
                                                          .is_active
                                                      }
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="enableEPF"
                                                    >
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    onClick={() =>
                                                      handleEPFEdit(payrollobj
                                                        .basic_components.epf)
                                                    }
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)"
                                                  >
                                                    <i class="ri-pencil-fill fs-16"></i>
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="py-3">
                                            <Row className="gy-3">
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Deduction Cycle
                                                  </p>
                                                  <h5 className="fs-14">
                                                    {
                                                      payrollobj
                                                        .basic_components.epf
                                                        .epf_type
                                                    }
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Employee's Contribution
                                                  </p>
                                                  <h5 className="fs-14">
                                                    {payrollobj.basic_components
                                                      .epf.epf_cycle
                                                      ? EPFCycle.find(
                                                        (obj) =>
                                                          obj.id ===
                                                          payrollobj
                                                            .basic_components
                                                            .epf.epf_cycle
                                                      ).Employee
                                                      : []}
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Employer's Contribution
                                                  </p>
                                                  <h5 className="fs-14">
                                                    {payrollobj.basic_components
                                                      .epf.epf_cycle
                                                      ? EPFCycle.find(
                                                        (obj) =>
                                                          obj.id ===
                                                          payrollobj
                                                            .basic_components
                                                            .epf.epf_cycle
                                                      ).Employer
                                                      : []}
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col md={12} lg={12} xxl={12}>
                                                <Card>
                                                  <CardBody className="bg-info-subtle">
                                                    <div className="d-flex">
                                                      <div className="flex-shrink-0">
                                                        <FeatherIcon
                                                          icon="info"
                                                          className="text-info icon-dual-info"
                                                        />
                                                      </div>
                                                      <div className="flex-grow-1 ms-3">
                                                        <h6 className="fs-15">
                                                          Note!
                                                        </h6>
                                                        <p className="text-muted mb-0 hide">
                                                          Employer's EPF
                                                          Contribution would
                                                          include EDLI & Admin
                                                          charge in CTC salary
                                                          structure.
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardBody>
                                                </Card>
                                              </Col>
                                            </Row>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    </Col>
                                  </div>
                                </TabPane>

                                <TabPane tabId="3">
                                  <div className="d-flex">
                                    <Col
                                      xxl={12}
                                      sm={12}
                                      className="project-card"
                                    >
                                      {(
                                        payrollobj.basic_components.pro_tax ||
                                        []
                                      ).map((item, key) => (
                                        <Card key={key}>
                                          <CardBody>
                                            <div
                                              className={`p-3 mt-n3 mx-n3 bg-${item.is_active
                                                ? "success"
                                                : "dark"
                                                }-subtle rounded-top`}
                                            >
                                              <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                  <h5 className="mb-0 fs-14">
                                                    <Link
                                                      to="#"
                                                      className="text-body"
                                                    >
                                                      {item.company}
                                                      <span className="badge border border-dark text-body ms-2">
                                                        {item.tag}
                                                      </span>
                                                    </Link>
                                                  </h5>
                                                </div>
                                                <div className="flex-shrink-0">
                                                  <div className="d-flex gap-1 align-items-center my-n2">
                                                    <div className="form-check form-switch form-switch-success  ">
                                                      <Input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="enableEPF"
                                                        checked={item.is_active}
                                                      />
                                                      <Label
                                                        className="form-check-label"
                                                        for="enableEPF"
                                                      >
                                                        Active
                                                      </Label>
                                                    </div>
                                                    <a
                                                      onClick={() =>
                                                        handleTaxEdit(
                                                          item.slabs
                                                        )
                                                      }
                                                      className="text-primary d-inline-block edit-item-btn ms-2"
                                                      href="javascript:void(0)"
                                                    >
                                                      <i class="ri-pencil-fill fs-16"></i>
                                                    </a>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="py-3">
                                              <Row className="gy-3">
                                                <Col xs={4}>
                                                  <div>
                                                    <p className="text-muted mb-1">
                                                      Address{" "}
                                                    </p>
                                                    <h5 className="fs-14">
                                                      {item.add}
                                                    </h5>
                                                  </div>
                                                </Col>
                                                <Col xs={2}>
                                                  <div>
                                                    <p className="text-muted mb-1">
                                                      State
                                                    </p>
                                                    <h5 className="fs-14">
                                                      {item.state}
                                                    </h5>
                                                  </div>
                                                </Col>
                                                <Col xs={2}>
                                                  <div>
                                                    <p className="text-muted mb-1">
                                                      Deduction Cycle
                                                    </p>
                                                    <h5 className="fs-14">
                                                      {item.tax_cycle}
                                                    </h5>
                                                  </div>
                                                </Col>
                                                <Col xs={2}>
                                                  <div>
                                                    <p className="text-muted mb-1">
                                                      PT Slabs
                                                    </p>

                                                    <p>
                                                      <Link
                                                        to="#"
                                                        onClick={() =>
                                                          show_taxSlabModal(
                                                            item.slabs
                                                          )
                                                        }
                                                        className="link-success"
                                                      >
                                                        View Tax Slabs
                                                      </Link>
                                                    </p>
                                                  </div>
                                                </Col>
                                              </Row>
                                            </div>
                                          </CardBody>
                                        </Card>
                                      ))}
                                    </Col>
                                  </div>
                                </TabPane>

                                <TabPane tabId="4">
                                  <div className="d-flex">
                                    <Card>
                                      <CardBody>
                                        <div
                                          className={`p-3 mt-n3 mx-n3 bg-${payrollobj.basic_components
                                            .labour_fund
                                            ? "success"
                                            : "dark"
                                            }-subtle rounded-top`}
                                        >
                                          <div className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                              <h5 className="mb-0 fs-14">
                                                <Link
                                                  to="#"
                                                  className="text-body"
                                                >
                                                  Tamil Nadu
                                                </Link>
                                              </h5>
                                            </div>
                                            <div className="flex-shrink-0">
                                              <div className="d-flex gap-1 align-items-center my-n2">
                                                <div className="form-check form-switch form-switch-success  ">
                                                  <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="enableEPF"
                                                    checked={
                                                      payrollobj
                                                        .basic_components
                                                        .labour_fund
                                                    }
                                                  />
                                                  <Label
                                                    className="form-check-label"
                                                    for="enableEPF"
                                                  >
                                                    Active
                                                  </Label>
                                                </div>

                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="py-3">
                                          <Row className="gy-3">
                                            <Col xs={4}>
                                              <div>
                                                <p className="text-muted mb-1">
                                                  Deduction Cycle
                                                </p>
                                                <h5 className="fs-14">
                                                  Yearly
                                                </h5>
                                              </div>
                                            </Col>
                                            <Col xs={4}>
                                              <div>
                                                <p className="text-muted mb-1">
                                                  Employee's Contribution
                                                </p>
                                                <h5 className="fs-14">₹ 20</h5>
                                              </div>
                                            </Col>
                                            <Col xs={4}>
                                              <div>
                                                <p className="text-muted mb-1">
                                                  Employer's Contribution
                                                </p>
                                                <h5 className="fs-14">₹ 40</h5>
                                              </div>
                                            </Col>
                                          </Row>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </div>
                                </TabPane>
                              </TabContent>
                            </Col>
                          </Row>
                        </TabPane>
                        {/* Basic Components Tab End */}

                        {/* Salary Components Tab Start */}
                        <TabPane tabId="4" id="v-pills-settings">
                          <Row>
                            <Col xxl={12}>
                              <Nav
                                tabs
                                className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                              >
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab1 === "1",
                                    })}
                                    onClick={() => {
                                      toggleCustom1("1");
                                    }}
                                  >
                                    Earnings
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab1 === "2",
                                    })}
                                    onClick={() => {
                                      toggleCustom1("2");
                                    }}
                                  >
                                    Allowances
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab1 === "3",
                                    })}
                                    onClick={() => {
                                      toggleCustom1("3");
                                    }}
                                  >
                                    Deductions
                                  </NavLink>
                                </NavItem>
                              </Nav>

                              <TabContent
                                activeTab={customActiveTab1}
                                className="text-muted"
                              >
                                {/* Earnings Tab */}
                                <TabPane tabId="1" id="home1">
                                  <Row>
                                    <Col md={12} lg={12} xxl={12}>
                                      <div className=" mb-2">
                                        <div className="table-responsive">
                                          <Table className="table-borderless align-middle table-nowrap mb-0">
                                            <thead>
                                              <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Pro-rata</th>
                                                <th scope="col">Taxable</th>
                                                <th scope="col">
                                                  Contribute to Insurance & Fund
                                                </th>
                                                <th scope="col">Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {payrollobj.salary_components.earnings.map(
                                                (item, key) => (
                                                  <tr key={key}>
                                                    <td className="fw-medium">
                                                      {item.name}
                                                    </td>
                                                    <td>{item.desc}</td>
                                                    <td>
                                                      {item.pro_rata
                                                        ? "Yes"
                                                        : "No"}
                                                    </td>
                                                    <td>
                                                      {item.tax ? "Yes" : "No"}
                                                    </td>
                                                    <td>
                                                      {item.contribute
                                                        ? "Yes : "
                                                        : "No"}
                                                      {item.epf ? (
                                                        <span className="badge border border-light text-body">
                                                          EPF
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                      {item.esi ? (
                                                        <span className="badge border border-light text-body">
                                                          ESI
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </td>
                                                    <td>
                                                      <div className="hstack gap-3 fs-15">
                                                        <Link
                                                          to="#"
                                                          className="link-primary"
                                                          onClick={() => {
                                                            handleCreateAndUpdate(item);
                                                          }}
                                                        >
                                                          <i className="ri-pencil-fill fs-16"></i>
                                                        </Link>
                                                        <Link>
                                                          <span style={{ margin: '0 2px' }}></span>
                                                          <i className="ri-delete-bin-5-fill fs-16"></i>
                                                        </Link>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                          </Table>
                                          <Button color="primary" onClick={() => {
                                            handleEaringAdd(0);
                                          }
                                          }>
                                            <i className="ri-add-line align-bottom me-1"></i>
                                            Add
                                          </Button>{' '}
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </TabPane>

                                {/* Allowances Tab */}
                                <TabPane tabId="2">
                                  {" "}
                                  <Row>
                                    <Col md={12} lg={12} xxl={12}>
                                      <div className=" mb-2">
                                        <div className="table-responsive">
                                          <Table className="table-borderless align-middle table-nowrap mb-0">
                                            <thead>
                                              <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Pro-rata</th>
                                                <th scope="col">Taxable</th>
                                                <th scope="col">
                                                  Contribute to Insurance & Fund
                                                </th>
                                                <th scope="col">Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {payrollobj.salary_components.allowances.map(
                                                (item, key) => (
                                                  <tr key={key}>
                                                    <td className="fw-medium">
                                                      {item.name}
                                                    </td>
                                                    <td>{item.desc}</td>
                                                    <td>
                                                      {item.pro_rata
                                                        ? "Yes"
                                                        : "No"}
                                                    </td>
                                                    <td>
                                                      {item.tax ? "Yes" : "No"}
                                                    </td>
                                                    <td>
                                                      {item.contribute
                                                        ? "Yes : "
                                                        : "No"}
                                                      {item.epf ? (
                                                        <span className="badge border border-light text-body">
                                                          EPF
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                      {item.esi ? (
                                                        <span className="badge border border-light text-body">
                                                          ESI
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </td>
                                                    <td>
                                                      <div className="hstack gap-3 fs-15">
                                                        <Link
                                                          to="#"
                                                          className="link-primary"
                                                          onClick={() => {
                                                            handleCreateAndUpdate(item);
                                                          }}
                                                        >
                                                          <i className="ri-pencil-fill fs-16"></i>
                                                        </Link>
                                                        <Link>
                                                          <span style={{ margin: '0 2px' }}></span>
                                                          <i className="ri-delete-bin-5-fill fs-16"></i>
                                                        </Link>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                          </Table>
                                          <Button color="primary" onClick={() => {
                                            // handleAllowencesAdd(0);
                                            handleEaringAdd(0);
                                          }
                                          }>
                                            <i className="ri-add-line align-bottom me-1"></i>
                                            Add
                                          </Button>{' '}
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </TabPane>

                                {/* Deductions Tab */}
                                <TabPane tabId="3">
                                  {" "}
                                  <Row>
                                    <Col md={12} lg={12} xxl={12}>
                                      <div className=" mb-2">
                                        <div className="table-responsive">
                                          <Table className="table-borderless align-middle table-nowrap mb-0">
                                            <thead>
                                              <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Pro-rata</th>
                                                <th scope="col">Taxable</th>
                                                <th scope="col">
                                                  Contribute to Insurance & Fund
                                                </th>
                                                <th scope="col">Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {payrollobj.salary_components.deductions.map(
                                                (item, key) => (
                                                  <tr key={key}>
                                                    <td className="fw-medium">
                                                      {item.name}
                                                    </td>
                                                    <td>{item.desc}</td>
                                                    <td>
                                                      {item.pro_rata
                                                        ? "Yes"
                                                        : "No"}
                                                    </td>
                                                    <td>
                                                      {item.tax ? "Yes" : "No"}
                                                    </td>
                                                    <td>
                                                      {item.contribute
                                                        ? "Yes : "
                                                        : "No"}
                                                      {item.epf ? (
                                                        <span className="badge border border-light text-body">
                                                          EPF
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                      {item.esi ? (
                                                        <span className="badge border border-light text-body">
                                                          ESI
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </td>
                                                    <td>
                                                      <div className="hstack gap-3 fs-15">
                                                        <Link
                                                          to="#"
                                                          className="link-primary"
                                                          onClick={() => {
                                                            handleCreateAndUpdate(item);
                                                          }}
                                                        >
                                                          <i className="ri-pencil-fill fs-16"></i>
                                                        </Link>
                                                        <Link>
                                                          <span style={{ margin: '0 2px' }}></span>
                                                          <i className="ri-delete-bin-5-fill fs-16"></i>
                                                        </Link>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                          </Table>
                                          <Button color="primary" onClick={() => {
                                            // handleDeductionsAdd(0);
                                            handleEaringAdd(0);
                                          }
                                          }>
                                            <i className="ri-add-line align-bottom me-1"></i>
                                            Add
                                          </Button>{' '}
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </TabPane>
                              </TabContent>
                            </Col>
                          </Row>
                        </TabPane>
                        {/* Salary Components Tab End */}

                        {/* Salary Policies Tab Start */}
                        <TabPane tabId="5" id="v-pills-home">
                          <div className="d-flex mb-2">
                            <div className="flex-shrink-0">
                              <img
                                src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                                alt=""
                                width="150"
                                className="rounded"
                              />
                            </div>

                            <div className="flex-grow-1 ms-3">
                              <Button color="primary"
                                onClick={() => {
                                  handleSalaryPoliciesAdd(0)

                                }}
                              >
                                <i className="ri-add-line align-bottom me-1"></i>
                                Add
                              </Button>{' '}
                              <p className="mb-0">
                                <br></br>
                                You always want to make sure that your fonts
                                work well together and try to limit the number
                                of fonts you use to three or less. Experiment
                                and play around with the fonts that you already
                                have in the software you’re working with
                                reputable font websites.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            This may be the most commonly encountered tip I
                            received from the designers I spoke with. They
                            highly encourage that you use different fonts in one
                            design, but do not over-exaggerate and go overboard.
                          </p>
                        </TabPane>
                        {/* Salary Policies Tab End */}
                      </TabContent>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
        id="flipModal"
        isOpen={modal_animationZoom}
        toggle={() => {
          show_taxSlabModal();
        }}
        modalClassName="zoomIn"
        centered
      >
        <ModalHeader>
          <h5 className="modal-title" id="staticBackdropLabel">
            Tax Slabs for Lintcloud It Service Pvt Ltd
          </h5>
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="mt-4">
            <Col xl={12}>
              <div className="">
                <Table className="table-hover table-striped align-middle table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Half-yearly Gross Salary (₹)</th>
                      <th scope="col">Half-yearly Tax Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      (tax_slabId &&
                        tax_slab.find((e) => e.id == tax_slabId).range) ||
                      []
                    ).map((item, key) => (
                      <tr key={key}>
                        <td className="fw-medium">
                          {item.s} - {item.e}
                        </td>
                        <td>{item.tax}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>

            <div className="hstack gap-2 justify-content-center mt-3">
              <Link
                to="#"
                className="btn btn-link link-success fw-medium"
                onClick={() => setmodal_animationZoom(false)}
              >
                <i className="ri-close-line me-1 align-middle"></i> Close
              </Link>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default PayRollConfig;
