import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SweetAlert } from "../../common/sweetAlert/SweetAlert";
import Swal from "sweetalert2";
import "../../../pages/payroll/SalaryPoliciesModal.css";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Input,
    Label,
    Row,
    UncontrolledDropdown,
    Table,
    Modal,
    ModalBody,
} from "reactstrap";
import ModalTitle from "rsuite/esm/Modal/ModalTitle";
import {
    editEarnings,
    setEarnings,
    setAllowances,
    setDeductions,
    editDeduction,
    editAllowance,
} from "../../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import {
    allowances_module_name,
    deductions_module_name,
    earnings_module_name,
    payroll_policy_calculation_type,
    payroll_policy_period,
} from "../../../common/constant/Constants";

const locationEditForm = () => {






    return (
        <React.Fragment>
            <Row>

                <div>
                    <Label className="form-label">
                        Allow Clocking in/out on
                    </Label>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <Card className="p-3 mb-3">
                                <div>
                                    <Label>
                                      Web App
                                    </Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="webAppCheckbox"
                                        name="webAppUnit"
                                        type="checkbox"
                                        className="form-check-input"
                                        required
                                    />
                                    {" "}
                                    <Label>Using Manual Button</Label>
                                </div>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card className="p-3 mb-3">
                                <div>
                                    <Label>
                                     Mobile App
                                    </Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="mobileAppCheckbox1"
                                        name="mobileAppUnit1"
                                        type="checkbox"
                                        className="form-check-input"
                                        required
                                    />
                                    {" "}
                                    <Label>Using Manual Button</Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="mobileAppCheckbox2"
                                        name="mobileAppUnit2"
                                        type="checkbox"
                                        className="form-check-input"
                                        required
                                    />
                                    {" "}
                                    <Label>Using QR Code</Label>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <Row>
                        <Col lg={3} sm={3}>
                            <Label
                                className="form-label"
                                htmlFor="geofencinge">
                                Geofencing
                            </Label>
                        </Col>
                        <Col lg={6} sm={12}>
                            <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                    id="geofencinge"
                                    name="geofencing"
                                    type="checkbox"
                                    className="form-check-input"
                                // checked={customFieldObj.insurance}
                                // onChange={(e) =>
                                //     setCustomFieldObj({
                                //         ...customFieldObj,
                                //         insurance: e.target.checked,
                                //     })
                                // } 
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
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
                            Allow clock in/out outside the office    <i
                                className="ri-information-line"
                                style={{ fontSize: "16px" }}
                            ></i>
                        </Label>
                    </div>
                </Col>
                <Col md={8} lg={8} xxl={8}>
                    <div>
                        <Label
                            htmlFor="calculation"
                            className="form-label"
                        >
                            Accurate Address*
                        </Label>
                        <div>
                        <Input
                                type="text"
                                name="name"
                                id="name"
                                className="form-control"
                                
                              

                            />
                            
                        </div>
                        <div
                            id="passwordHelpBlock"
                            className="form-text mb-3"
                        >
                            Select  Accurate Address.
                        </div>
                    </div>
                </Col>
                <Col md={4} lg={4} xxl={4}>
                    <div>
                        <Label
                            htmlFor="calculation"
                            className="form-label"
                        >
                            Radius*
                        </Label>
                        <div>
                        <Select
                                id="calculation"
                                isMulti={false}
                                // options={salary_calculation_option || []}
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
                            Select Radius.
                        </div>
                    </div>
                </Col>
                
            </Row>



        </React.Fragment>
    );
};

export default locationEditForm;
