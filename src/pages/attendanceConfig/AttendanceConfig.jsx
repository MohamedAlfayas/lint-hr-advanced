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

      const repeat_onselect = useMemo(
        () => [
          { id: "1", label: "Monthly on day 19", value: "Monthly on day 19" },
          { id: "2", label: "Monthly on the third Tuesday", value: "Monthly on the third Tuesday" },
        ],
        []
      );

      const security_type = useMemo(
        () => [
          { id: "1", label: "Public URL Everyone", value: "Public URL Everyone" },
          { id: "2", label: "Restricted URL with Password", value: "Restricted URL with Password" },
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
    //   const radius_option = useMemo(
    //     () => [
    //       { id: "1", label: "10(meters)", value: "10(meters)" },
    //       { id: "2", label: "25(meters)", value: "25(meters)" },
    //       { id: "3", label: "50(meters)", value: "50(meters)" },
    //       { id: "4", label: "100(meters)", value: "100(meters)" },
    //       { id: "5", label: "200(meters)", value: "200(meters)" },
    //       { id: "6", label: "500(meters)", value: "500(meters)" },
    //     ],
    //     []
    //   );
    const location_option = useMemo(
        () => [
            { id: "India", label: "India", value: "India" },
            { id: "Srilanka", label: "Srilanka", value: "Srilanka" },
            { id: "Singapore", label: "Singapore", value: "Singapore" },
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
  const dispatch = useDispatch();
  const handlelocationEdit = ($id) => {
    dispatch(setFormTitle("Locations and Policies Edit"));

   
    dispatch(setFormWidthPercentage("40%"));
    dispatch(setComponentToShow(location_edit_form_component_name));
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
            contribute: [payrollobj.basic_components],
        };
    }, []);

   

   
    

    const [modal_animationZoom, setmodal_animationZoom] = useState(false);
    const [tax_slabId, setTax_slabId] = useState(0);

    function show_taxSlabModal($id) {
        console.log($id);
        setTax_slabId($id);

        console.log(tax_slab.find((e) => e.id == $id).range);
        setmodal_animationZoom(!modal_animationZoom);
    }

  
   

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
                                                    <div className="d-flex mb-2">
                                                        <Row>
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
                                                                        General
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
                                                                        Person In Charge
                                                                    </NavLink>
                                                                </NavItem>

                                                            </Nav>
                                                            <TabContent
                                                                activeTab={customActiveTab1}
                                                                className="text-muted"
                                                            >
                                                                <TabPane tabId="1">
                                                                    {" "}
                                                                    <Row>
                                                                        <Col md={6} lg={6} xxl={6}>
                                                                            <div>
                                                                                <Label
                                                                                    htmlFor="calculation"
                                                                                    className="form-label"
                                                                                >
                                                                                    Total Hour Calculation
                                                                                </Label>
                                                                                <div>
                                                                                <Select
                                                                                           id="calculation"
                                                                                           isMulti={false}
                                                                                           options={[{ label: 'Every Valid Check-in&Check-out', value: 'Every Valid Check-in&Check-out' }]}
                                                                                           defaultValue={{ label: 'Every Valid Check-in&Check-out', value: 'Every Valid Check-in&Check-out' }}
                                                                                           isDisabled={true} 
                                                                                           className="basic-multi-select"
                                                                                    />
                                                                                </div>
                                                                                <div
                                                                                    id="passwordHelpBlock"
                                                                                    className="form-text mb-3"
                                                                                >
                                                                                    Select Total Hour Calculation.
                                                                                </div>
                                                                            </div>
                                                                        </Col>

                                                                        <Col md={3} lg={3} xxl={3}>
                                                                            <div>
                                                                                <Label htmlFor="calculation" className="form-label">
                                                                                    Attendance Approval Cycle
                                                                                </Label>
                                                                                <div>
                                                                                    <Select
                                                                                        id="approval"
                                                                                        isMulti={false}
                                                                                        options={[{ label: '1', value: 1 }]} 
                                                                                        // value={
                                                                                        //     (payrollobj.general.calc_based_on &&
                                                                                        //         salary_calculation_option.find(
                                                                                        //             (e) => e.value === payrollobj.general.calc_based_on
                                                                                        //         )) ||
                                                                                        //     []
                                                                                        // }
                                                                                        className="basic-multi-select"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                <Select
                                                                                        id="calculation"
                                                                                        isMulti={false}
                                                                                        options={approval_cycle || []}
                                                                                        // value={
                                                                                        //     (payrollobj.general.calc_based_on &&
                                                                                        //         salary_calculation_option.find(
                                                                                        //             (e) => e.value === payrollobj.general.calc_based_on
                                                                                        //         )) ||
                                                                                        //     []
                                                                                        // }
                                                                                        className="basic-multi-select"
                                                                                    />
                                                                                </div>
                                                                                <div id="passwordHelpBlock" className="form-text mb-3">
                                                                                    Select Attendance Approval Cycle.
                                                                                </div>
                                                                            </div>
                                                                        </Col>
                                                                        <Col md={6} lg={6} xxl={6}>
                                                                            <div>
                                                                                <Label
                                                                                    htmlFor="calculation"
                                                                                    className="form-label"
                                                                                >
                                                                                    Repeat On
                                                                                </Label>
                                                                                <div>
                                                                                    <Select
                                                                                        id="repeaton"
                                                                                        isMulti={false}
                                                                                        options={repeat_onselect || []}
                                                                                        // value={
                                                                                        //     (payrollobj.general.calc_based_on &&
                                                                                        //         salary_calculation_option.find(
                                                                                        //             (e) =>
                                                                                        //                 e.value ===
                                                                                        //                 payrollobj.general.calc_based_on
                                                                                        //         )) ||
                                                                                        //     []
                                                                                        // }
                                                                                        className="basic-multi-select "
                                                                                    />
                                                                                </div>
                                                                                <div
                                                                                    id="passwordHelpBlock"
                                                                                    className="form-text mb-3"
                                                                                >
                                                                                    Select Repeat On.
                                                                                </div>
                                                                            </div>
                                                                        </Col>
                                                                        <Col md={6} lg={6} xxl={6}>
                                                                            <div>
                                                                                <Label
                                                                                    htmlFor="location"
                                                                                    className="form-label"
                                                                                >
                                                                                    Locations
                                                                                </Label>
                                                                                <div>
                                                                                <Select
                                                                                           id="location"
                                                                                           isMulti={false}
                                                                                           options={[{ label: 'All Offices', value: 'All Offices' }]}
                                                                                           defaultValue={{ label: 'All Offices', value: 'All Offices' }}
                                                                                           isDisabled={true} 
                                                                                           className="basic-multi-select"
                                                                                    />
                                                                                </div>
                                                                                <div
                                                                                    id="passwordHelpBlock"
                                                                                    className="form-text mb-3"
                                                                                >
                                                                                    Select  Locations.
                                                                                </div>
                                                                            </div>
                                                                        </Col>
                                                                        <Col md={12} lg={12} xxl={12}>
                                                                            <div className="form-check form-check-inline">
                                                                                <Input
                                                                                    id="p-tax"
                                                                                    name="Unit"
                                                                                    type="checkbox"
                                                                                    className="form-check-input"
                                                                                    required
                                                                                />
                                                                                <Label className="form-check-label" htmlFor="lt_day">
                                                                                    Manager will receive notifications 1 day before the end of the attendance cycle
                                                                                </Label>
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
                                                                </TabPane>

                                                                <TabPane tabId="2">
                                                                    {" "}
                                                                    <Row>
                                                                        <Col md={12} lg={12} xxl={12}>
                                                                            <div className=" mb-2">
                                                                                <div className="table-responsive">
                                                                                    <div>
                                                                                        <Label
                                                                                            htmlFor="location"
                                                                                            className="form-label"
                                                                                        >
                                                                                            <i
                                                                                                className="ri-information-line"
                                                                                                style={{ fontSize: "16px" }}
                                                                                            ></i>The Person In Charge Will Get Notified Whrn An Employee's Attendance Is Updated
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

                                                                                    </div>

                                                                                </div>
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                </TabPane>
                                                            </TabContent>
                                                        </Row>
                                                    </div>

                                                </TabPane>
                                                {/* General Tab End */}

                                                {/* Locations and Policies Tab Start */}
                                                <TabPane tabId="2" id="v-pills-profile">
                                                    <div className="d-flex mb-2">
                                                        <Label><strong>Locations and Policies</strong></Label>
                                                    </div>
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
                                                                               
                                                                                    <a
                                                                                        onClick={() =>
                                                                                            handlelocationEdit(
                                                                                                item.slabs
                                                                                            )
                                                                                        }
                                                                                        className="text-primary d-inline-block edit-item-btn ms-2"
                                                                                        href="javascript:void(0)"
                                                                                    >
                                                                                        <i class="mdi mdi-dots-vertical"></i>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                  
                                                                </CardBody>
                                                            </Card>
                                                        ))}
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
                                                                            Time Attendance
                                                                            Keeps track of employees working hours, clock in and out time, and which task they were doing. Time Attendance can be used with Payroll to calculate salary automatically.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </TabPane>
                                                {/* Locations and Policies Tab End */}

                                                {/* QR Code Tab Start */}
                                                <TabPane tabId="3" id="v-pills-messages">
                                                  
                                                    <Row>
                                                        <Nav
                                                            tabs
                                                            className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                                                        >
                                                            <div>
                                                                <Label>
                                                                    <strong>QR Code</strong>
                                                                </Label>
                                                                {""}
                                                            </div>
                                                            <Label> Generate a QR code to let everyone clock in/out easily by scanning with the LintHr app Start displaying QR Code</Label>

                                                        </Nav>

                                                        <TabPane tabId="1" id="home1">
                                                            <div className="d-flex mb-2">
                                                                <Row>
                                                                    <Col md={6} lg={6} xxl={6}>
                                                                        <div>
                                                                            <Label
                                                                                htmlFor="location"
                                                                                className="form-label"
                                                                            >
                                                                                Auto Generate QR Code Every
                                                                            </Label>
                                                                            <div>
                                                                                <input
                                                                                    id="number"
                                                                                   
                                                                                   type="number"
                                                                                    className="basic-multi-select "
                                                                                />
                                                                                <Select
                                                                                    id="location"
                                                                                    isMulti={false}
                                                                                    options={ generate_qr || []}
                                                                                    // value={
                                                                                    //     (payrollobj.general.location &&
                                                                                    //         location_option.find(
                                                                                    //             (e) =>
                                                                                    //                 e.value ===
                                                                                    //                 payrollobj.general.location
                                                                                    //         )) ||
                                                                                    //     []
                                                                                    // }
                                                                                    className="basic-multi-select "
                                                                                />
                                                                            </div>

                                                                            <div
                                                                                id="passwordHelpBlock"
                                                                                className="form-text mb-3"
                                                                            >
                                                                                Select  Auto Generate QR Code.
                                                                            </div>
                                                                        </div>
                                                                    </Col>

                                                                    <Col md={12} lg={12} xxl={12}>
                                                                        <div>
                                                                            <Label
                                                                                htmlFor="security"
                                                                                className="form-label"
                                                                            >
                                                                                Security Type
                                                                            </Label>
                                                                            <div>
                                                                                <Select
                                                                                    id="security"
                                                                                    isMulti={false}
                                                                                    options={ security_type || []}
                                                                                    // value={
                                                                                    //     (payrollobj.general.calc_based_on &&
                                                                                    //         salary_calculation_option.find(
                                                                                    //             (e) =>
                                                                                    //                 e.value ===
                                                                                    //                 payrollobj.general.calc_based_on
                                                                                    //         )) ||
                                                                                    //     []
                                                                                    // }
                                                                                    className="basic-multi-select "
                                                                                />
                                                                            </div>
                                                                            <div
                                                                                id="passwordHelpBlock"
                                                                                className="form-text mb-3"
                                                                            >
                                                                                Select  Security Type.
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
                                                                                    Attendance General Info Heading @Dinesh!
                                                                                </h6>
                                                                                <p className="text-muted mb-0 hide">
                                                                                    Keep track of employee's working hours,clock in out time,and which task they were doing.Time Attendance can be used with Payroll to calculate salary automatically.
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
