import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { DatePicker } from "antd";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import { DateFormat } from "../../common/constant/Constants";
dayjs.extend(customParseFormat);
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  setDepartmentData,
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
  setTaxSlab,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

import InfoTable from "../../component/common/table/InfoTable";
import {
  setAllowances,
  setDeductions,
  setEarnings,
} from "../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import {
  epf_wage_form_component_name,
  professional_tax_form_component_name,
  salary_form_component_name,
  salary_policy_form_component_name,
  location_edit_form_component_name,
} from "../../common/constant/Constants";
import GeneralConfiguration from "./GeneralConfiguration";

// register lottie and define custom element
defineElement(loadAnimation);

const AttendanceConfig = () => {
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

  const attendanceobj = {
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
      loc_pol: [
        {
          is_active: true,
          company: "Lintcloud It Service Pvt Ltd",
          tag: "HEADQUARTER",
          add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117,Tamil Nadu",
          qr_code: "No",
          in_out: "Desktop,Mobile",
          radius: "25 meters",
          policy: "Not allow clock in/out outside the office",
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
          insurance: false,
          calculation_type: 1,
          time_period: 0,
          selected: false,
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
          calculation_type: 1,
          time_period: 0,
          selected: false,
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
          calculation_type: 1,
          time_period: 0,
          selected: false,
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
          calculation_type: 1,
          time_period: 0,
          selected: false,
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
          calculation_type: 1,
          time_period: 0,
          selected: false,
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
          calculation_type: 1,
          time_period: 0,
          selected: false,
          contribute: [],
          esi: true,
          epf: true,
        },
      ],
    },
  };

  const approval_cycle = useMemo(
    () => [
      { id: "1", label: "Monthly", value: "Monthly" },
      { id: "2", label: "Weekly", value: "Weekly" },
    ],
    []
  );

  const security_type = useMemo(
    () => [
      { id: "1", label: "Public URL Everyone", value: "Public URL Everyone" },
      {
        id: "2",
        label: "Restricted URL with Password",
        value: "Restricted URL with Password",
      },
    ],
    []
  );
  const generate_qr = useMemo(
    () => [
      { id: "1", label: "Second(s)", value: "Second(s)" },
      { id: "2", label: "Minute(s)", value: "Minute(s)" },
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

  const [autoGenerateValue, setAutoGenerateValue] = useState("");
  const [securityTypeValue, setSecurityTypeValue] = useState("");

  const handleAutoGenerateChange = (value) => {
    setAutoGenerateValue(value);
  };

  const handleSecurityTypeChange = (value) => {
    setSecurityTypeValue(value);
  };

  const handleStartGeneratingCode = () => {
    if (!autoGenerateValue || !securityTypeValue) {
      console.error("Please fill in all required fields.");
      return;
    }

    console.log("Auto Generate QR Code Every:", autoGenerateValue);
    console.log("Security Type:", securityTypeValue);
    setAutoGenerateValue("");
    setSecurityTypeValue("");
  };

  const [attendanceStartDate, setAttendanceStartDate] = useState();

  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [attendanceObj, setAttendanceObj] = useState({});
  const [date, setDate] = useState("");
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    setAttendanceObj({
      ...attendanceObj,
      date: ConvertISODateFormat(String(new Date())),
    });
    setDate(ConvertDateFormat(ConvertISODateFormat(String(new Date()))));
  }, []);

  // Function to handle input changes

  // Function to handle date change

  const handleSubmit = () => {
    // Log input values to console
    console.log("Total Hour Calculation:", totalHourCalculation);
    console.log("Attendance Start Date:", attendanceStartDate);
    console.log("Attendance Approval Cycle:", attendanceApprovalCycle);
    console.log("Repeat On:", repeatOn);
    console.log("Locations:", locations);
    console.log("Receive Notifications:", receiveNotifications);
  };

  const salary_calculation_option = useMemo(
    () => [
      { id: "1", label: "Actual Calender Days", value: "Actual Calender Days" },
      { id: "2", label: "Month Starting", value: "Month Starting" },
    ],
    []
  );
  const dispatch = useDispatch();
  const handlelocationEdit = ($id) => {
    dispatch(setFormTitle("Locations and Policies Edit"));

    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow(location_edit_form_component_name));
    dispatch(toggleRSBView(true));
  };

  // const initialFormObj = useMemo(() => {
  //     return {
  //       id: 0,
  //       totalHourCalculation: "",
  //       date: "",
  //       approval_cycle: "",
  //       repeatOn: "",
  //       locations: "",
  //       notification: false,

  //     };
  //   }, []);

  document.title = `Attendance-config | ${MetaTitle || "Lint HR"} `;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="project-wrapper">
            <Col xxl={12}>
              <Card>
                <CardBody>
                  <h5 className="mb-3">Attendance Configuration</h5>

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
                            Location and Policies
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
                            QR Code
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
                          <GeneralConfiguration />
                        </TabPane>
                        {/* General Tab End */}

                        {/* Locations and Policies Tab Start */}
                        <TabPane tabId="2" id="v-pills-profile">
                          <div className="d-flex mb-2">
                            <Label>
                              <strong>Locations and Policies</strong>
                            </Label>
                          </div>
                          <Col xxl={12} sm={12} className="project-card">
                            {(attendanceobj.basic_components.loc_pol || []).map(
                              (item, key) => (
                                <Card key={key}>
                                  <CardBody>
                                    <div
                                      className={`p-3 mt-n3 mx-n3 bg-${
                                        item.is_active ? "success" : "dark"
                                      }-subtle rounded-top`}
                                    >
                                      <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                          <h5 className="mb-0 fs-14">
                                            <Link to="#" className="text-body">
                                              {item.company}
                                              <span className="badge border border-dark text-body ms-2">
                                                {item.tag}
                                              </span>
                                            </Link>
                                          </h5>
                                        </div>

                                        <div className="flex-shrink-0">
                                          <div className="d-flex gap-1 align-items-center my-n2">
                                            <a
                                              onClick={() =>
                                                handlelocationEdit()
                                              }
                                              className="text-primary d-inline-block edit-item-btn ms-2"
                                              href="javascript:void(0)"
                                            >
                                              <i className="mdi mdi-dots-vertical"></i>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                  <div className="d-flex mb-2">
                                    <Row>
                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="text-start"
                                      >
                                        <Row className="mb-3">
                                          <Col>
                                            <Label
                                              htmlFor="location"
                                              className="form-label"
                                            >
                                              Clocking in/out from
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div className="d-flex align-items-center">
                                              <h5 className="fs-14">
                                                {item.in_out}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>

                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="mb-3"
                                      >
                                        <Row>
                                          <Col>
                                            <Label
                                              htmlFor="security"
                                              className="form-label"
                                            >
                                              QR Code
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.qr_code}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="mb-3"
                                      >
                                        <Row>
                                          <Col>
                                            <Label
                                              htmlFor="security"
                                              className="form-label"
                                            >
                                              Geofencing
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div className="form-check form-switch form-switch-success">
                                              <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="enablegeofencing"
                                                checked={item.is_active}
                                              />
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="mb-3"
                                      >
                                        <Row>
                                          <Col>
                                            <Label
                                              htmlFor="security"
                                              className="form-label"
                                            >
                                              Accurate Address
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.add}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="mb-3"
                                      >
                                        <Row>
                                          <Col>
                                            <Label
                                              htmlFor="security"
                                              className="form-label"
                                            >
                                              Radius
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.radius}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                      <Col
                                        md={12}
                                        lg={12}
                                        xxl={12}
                                        className="mb-3"
                                      >
                                        <Row>
                                          <Col>
                                            <Label
                                              htmlFor="security"
                                              className="form-label"
                                            >
                                              Policy
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.policy}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  </div>
                                </Card>
                              )
                            )}
                          </Col>
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
                                      Attendance General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Time Attendance Keeps track of employees
                                      working hours, clock in and out time, and
                                      which task they were doing. Time
                                      Attendance can be used with Payroll to
                                      calculate salary automatically.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                        {/* Locations and Policies Tab End */}

                        {/* QR Code Tab Start */}
                        <TabPane TabPane tabId="3" id="v-pills-messages">
                          <Row>
                            <Nav
                              tabs
                              className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                            >
                              <div>
                                <Label>
                                  <strong>QR Code</strong>
                                </Label>
                              </div>
                              <p>
                                {" "}
                                Generate a QR code to let everyone clock in/out
                                easily by scanning with the LintHr app Start
                                displaying QR Code
                              </p>
                            </Nav>

                            <TabPane tabId="1" id="home1">
                              <div className="d-flex mb-2">
                                <Row>
                                  <Col
                                    md={12}
                                    lg={12}
                                    xxl={12}
                                    className="text-start"
                                  >
                                    <Row className="mb-3">
                                      <Col>
                                        <Label
                                          htmlFor="calculation"
                                          className="form-label"
                                        >
                                          Auto Generate QR Code Every*
                                        </Label>
                                      </Col>
                                      <Col lg={3}>
                                        <input
                                          id="number"
                                          type="number"
                                          value={autoGenerateValue}
                                          onChange={(e) =>
                                            handleAutoGenerateChange(
                                              e.target.value
                                            )
                                          }
                                          className="form-control me-2"
                                        />
                                      </Col>
                                      <Col lg={3}>
                                        <Select
                                          id="time"
                                          isMulti={false}
                                          options={generate_qr || []}
                                          value={autoGenerateValue}
                                          onChange={(value) =>
                                            handleAutoGenerateChange(value)
                                          }
                                          className="basic-multi-select"
                                        />
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col
                                    md={12}
                                    lg={12}
                                    xxl={12}
                                    className="mb-3"
                                  >
                                    <Row>
                                      <Col>
                                        <Label
                                          htmlFor="security"
                                          className="form-label"
                                        >
                                          Security Type*
                                        </Label>
                                      </Col>
                                      <Col>
                                        <div>
                                          <Select
                                            id="security"
                                            isMulti={false}
                                            options={security_type || []}
                                            value={securityTypeValue}
                                            onChange={(value) =>
                                              handleSecurityTypeChange(value)
                                            }
                                            className="basic-multi-select"
                                          />
                                        </div>
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col lg={12}>
                                    <div className="text-start">
                                      <Button
                                        type="submit"
                                        color="success"
                                        className="btn-label"
                                        onClick={handleStartGeneratingCode}
                                      >
                                        {" "}
                                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                        Start Generating QR Code{" "}
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
                                          Attendance General Info Heading
                                          @Dinesh!
                                        </h6>
                                        <p className="text-muted mb-0 hide">
                                          Keep track of employee's working
                                          hours,clock in out time,and which task
                                          they were doing.Time Attendance can be
                                          used with Payroll to calculate salary
                                          automatically.
                                        </p>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>
                              </Col>
                            </TabPane>
                          </Row>
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
    </React.Fragment>
  );
};

export default AttendanceConfig;
