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
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useDispatch } from "react-redux";

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

  const payrollobj = useMemo(
    () => [
      {
        general: {
          location: "India",
          currency: "INR",
          calc_based_on: 1,
        },
        pay_cycle: {
          name: "Junior",
          desc: "",
          from: "Nov, 23",
          repeat: "Month",
          cut_off: 3,
        },
        basic_components: {
          esi: true,
          epf: {
            epf_cycle: 2,
            epf_type: 2,
          },
          pro_tax: [
            {
              company: "Lintcloud It Service Pvt Ltd",
              tag: "HEADQUARTER",
              add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117",
              state: "Tamil Nadu",
              tax_cycle: "Half-yearly",
              slabs: 1,
            },
            {
              company: "Lintcloud It Service Pvt Ltd",
              tag: "HEADQUARTER",
              add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117",
              state: "Tamil Nadu",
              tax_cycle: "Half-yearly",
              slabs: 1,
            },
          ],
        },
      },
    ],
    []
  );

  const tax_slab = useMemo(
    () => [
      {
        id: 1,
        state: "Tamil Nadu",
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
        id: 1,
        state: "Kerala",
        range: [
          { s: 0, e: 11999, tax: 0 },
          { s: 12000, e: 17999, tax: 120 },
          { s: 18000, e: 29999, tax: 180 },
          { s: 45001, e: 60000, tax: 690 },
          { s: 60001, e: 75000, tax: 1025 },
          { s: 75001, e: 999999999, tax: 1250 },
        ],
      },
    ],
    []
  );

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

  const handleEPFEdit = ($id, obj) => {
    console.log("Dep Edit = ", obj);

    const depObj = $id === 0 ? newDepObj : obj;
    dispatch(setFormTitle("Edit EPF"));
    dispatch(setFormObj(depObj));
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow("EPFWageForm"));
    dispatch(toggleRSBView(true));
  };

  const [modal_animationZoom, setmodal_animationZoom] = useState(false);
  function tog_animationZoom() {
    setmodal_animationZoom(!modal_animationZoom);
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
                    <Col md={2}>
                      <Nav
                        pills
                        className="flex-column text-left"
                        id="v-pills-tab">
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
                            id="v-pills-home-tab">
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
                            id="v-pills-profile-tab">
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
                            id="v-pills-messages-tab">
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
                            id="v-pills-settings-tab">
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
                            id="v-pills-settings-tab">
                            Salary Policies
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </Col>
                    <Col md={10}>
                      <TabContent
                        activeTab={verticalTab}
                        className="text-muted mt-4 mt-md-0"
                        id="v-pills-tabContent">
                        <TabPane tabId="1" id="v-pills-home">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="location"
                                    className="form-label">
                                    Location
                                  </Label>
                                  <div>
                                    <Select
                                      id="location"
                                      isMulti={false}
                                      options={location_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Payroll Country.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="currency"
                                    className="form-label">
                                    Currency
                                  </Label>
                                  <div>
                                    <Select
                                      id="currency"
                                      isMulti={false}
                                      options={currency_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Payroll Currency.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Calculate Monthly Salary Based On
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={salary_calculation_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Calculate Monthly Salary Based On.
                                  </div>
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="text-start">
                                  <Button
                                    type="submit"
                                    color="success"
                                    className="btn-label">
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
                        <TabPane tabId="2" id="v-pills-profile">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="pc_name"
                                    className="form-label">
                                    Name
                                  </Label>
                                  <div className="form-icon right">
                                    <Input
                                      type="text"
                                      name="pc_name"
                                      id="pc_name"
                                      className="form-control"
                                      placeholder="Pay Cycle Name"
                                    />
                                    <i className="ri-profile-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Enter Pay Cycle Name.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="description"
                                    className="form-label">
                                    Description
                                  </Label>
                                  <div className="form-icon right">
                                    <textarea
                                      type="text"
                                      name="description"
                                      className="form-control"
                                      id="description"
                                      placeholder="Enter description"></textarea>
                                    <i className="ri-file-list-3-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Enter Description Of Pay Cycles.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Effective From
                                  </Label>
                                  <div>
                                    <Flatpickr
                                      className="form-control"
                                      placeholder="Effective From"
                                      //value={endHour}
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
                                    className="form-text mb-3">
                                    Choose the day after 30 Nov 2023.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Repeat Every
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={repeat_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Calculate Monthly Salary Based On.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Cut-off Date
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={cut_of_month_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
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
                                    className="btn-label">
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
                        <TabPane tabId="3" id="v-pills-messages">
                          {/* Tab Inside Tab @Elan */}
                          <Row>
                            <Col xxl={12}>
                              <Nav
                                tabs
                                className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "1",
                                    })}
                                    onClick={() => {
                                      toggleCustom("1");
                                    }}>
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
                                    }}>
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
                                    }}>
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
                                    }}>
                                    LABOUR WELFARE FUND
                                  </NavLink>
                                </NavItem>
                              </Nav>

                              <TabContent
                                activeTab={customActiveTab}
                                className="text-muted">
                                {/* ESI Tab */}
                                <TabPane tabId="1" id="home1">
                                  <div className="d-flex">
                                    <Col
                                      xxl={12}
                                      sm={12}
                                      className="project-card">
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body">
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
                                                      id="SwitchCheck3"
                                                      defaultChecked
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="SwitchCheck3">
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)">
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
                                      className="project-card">
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body">
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
                                                      defaultChecked
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="enableEPF">
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    onClick={() =>
                                                      handleEPFEdit(0)
                                                    }
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)">
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
                                                    12% of Actual PF Wage
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={4}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Employer's Contribution
                                                  </p>
                                                  <h5 className="fs-14">
                                                    12% of Actual PF Wage
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
                                      className="project-card">
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body">
                                                    Lintcloud It Service Pvt Ltd
                                                    <span className="badge border border-dark text-body ms-2">
                                                      HEADQUARTER
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
                                                      defaultChecked
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="enableEPF">
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    onClick={() =>
                                                      handleEPFEdit(0)
                                                    }
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)">
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
                                                    694, C/10, SAHAR COMPLEX,
                                                    NEAR MATHUMITHA HOSPITAL,
                                                    OPP BUS STAND, VALLIOOR -
                                                    627117
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={2}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    State
                                                  </p>
                                                  <h5 className="fs-14">
                                                    Tamil Nadu
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={2}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Deduction Cycle
                                                  </p>
                                                  <h5 className="fs-14">
                                                    Half-yearly
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
                                                        tog_animationZoom()
                                                      }
                                                      className="link-success">
                                                      View Tax Slabs
                                                    </Link>
                                                  </p>
                                                </div>
                                              </Col>
                                            </Row>
                                          </div>
                                        </CardBody>
                                      </Card>

                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="#"
                                                    className="text-body">
                                                    Lintcloud Education
                                                    <span className="badge border border-dark text-body ms-2">
                                                      LintHr Team
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
                                                      defaultChecked
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="enableEPF">
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    onClick={() =>
                                                      handleEPFEdit(0)
                                                    }
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)">
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
                                                    694, C/10, SAHAR COMPLEX,
                                                    NEAR MATHUMITHA HOSPITAL,
                                                    OPP BUS STAND, VALLIOOR -
                                                    627117
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={2}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    State
                                                  </p>
                                                  <h5 className="fs-14">
                                                    Kerala
                                                  </h5>
                                                </div>
                                              </Col>
                                              <Col xs={2}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Deduction Cycle
                                                  </p>
                                                  <h5 className="fs-14">
                                                    Monthly
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
                                                        tog_animationZoom()
                                                      }
                                                      className="link-success">
                                                      View Tax Slabs
                                                    </Link>
                                                  </p>
                                                </div>
                                              </Col>
                                            </Row>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    </Col>
                                  </div>
                                </TabPane>
                                <TabPane tabId="4">
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <i className="ri-checkbox-multiple-blank-fill text-success"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      when darkness overspreads my eyes, and
                                      heaven and earth seem to dwell in my soul
                                      and absorb its power, like the form of a
                                      beloved mistress, then I often think with
                                      longing, Oh, would I could describe these
                                      conceptions, could impress upon paper all
                                      that is living so full and warm within me,
                                      that it might be the.
                                      <div className="mt-2">
                                        <Link
                                          to="#"
                                          className="btn btn-sm btn-soft-primary">
                                          Read More{" "}
                                          <i className="ri-arrow-right-line ms-1 align-middle"></i>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </TabPane>
                              </TabContent>
                            </Col>
                          </Row>
                        </TabPane>

                        <TabPane tabId="4" id="v-pills-settings">
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
                              <p className="mb-0">
                                When designing, the goal is to draw someone’s
                                attention and portray to them what you’re trying
                                to say. You can make a big statement by using
                                little tricks, like this one. Use contrasting
                                fonts. you can use a bold sanserif font with a
                                cursive.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            If you’re using multiple elements, make sure that
                            your principal object is larger than the others, as
                            the eye of your viewer will automatically be drawn
                            to the larger of the two objects.
                          </p>
                        </TabPane>
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
                              <p className="mb-0">
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
          tog_animationZoom();
        }}
        modalClassName="zoomIn"
        centered>
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
                    <tr>
                      <td className="fw-medium">1 - 21000</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">21001 - 30000</td>
                      <td>135</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">30001 - 45000</td>
                      <td>315</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">45001 - 60000</td>
                      <td>690</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">60001 - 75000</td>
                      <td>1025</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">75001 - 999999999</td>
                      <td>1250</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Col>

            <div className="hstack gap-2 justify-content-center mt-3">
              <Link
                to="#"
                className="btn btn-link link-success fw-medium"
                onClick={() => setmodal_animationZoom(false)}>
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
