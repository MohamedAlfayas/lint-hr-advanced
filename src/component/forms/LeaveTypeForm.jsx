import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
  Button,
} from "reactstrap";
import Select from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

// register lottie and define custom element
defineElement(loadAnimation);

const LeaveTypeForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [leaveTypeData, setLeaveTypeData] = useState({});
  useEffect(() => {
    setLeaveTypeData(form_obj);
  }, [form_obj]);

  const handleSubmit = () => {
    console.log("employee data = ", leaveTypeData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name = ", name, "   value = ", value);
    setLeaveTypeData({
      ...leaveTypeData,
      [name]: value,
    });
  };

  let types = [
    { id: 1, label: "Paid", value: "Paid" },
    { id: 2, label: "UnPaid", value: "UnPaid" },
    { id: 3, label: "On Duty", value: "On Duty" },
    { id: 4, label: "Comp Off", value: "Comp Off" },
  ];
  let reset = [
    { id: 1, name: "January To December" },
    { id: 2, name: "May To April" },
  ];

  document.title = "WorkSchedule | Lint HR";
  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form className="form-steps">
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="lName" className="form-label">
                    Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="lName"
                      id="lName"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="ri-chat-new-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Enter Leave Type Name.
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="gender" className="form-label">
                    Type *
                  </Label>

                  <Select
                    required
                    isMulti={false}
                    options={types || []}
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.type &&
                        types.find((e) => e.value === leaveTypeData.id)) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({ ...leaveTypeData, type: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Unit *
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_day"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        defaultChecked
                        required
                      />
                      <Label className="form-check-label" htmlFor="lt_day">
                        Days
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_hour"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        required
                      />
                      <Label className="form-check-label" htmlFor="lt_hour">
                        Hour
                      </Label>
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type Unit.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="lt_days_allow" className="form-label">
                    Leave Days Count{" "}
                    <small>
                      <i>Leave Days Allowed in a year</i>
                    </small>
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="number"
                      name="lt_days_allow"
                      id="lt_days_allow"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-calendar-2-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Please Enter Leave Days Allowed in a year.
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="lt_hour_allow" className="form-label">
                    Leave Hour{" "}
                    <small>
                      <i>Leave Hour Allowed in a Year</i>
                    </small>
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="number"
                      name="lt_hour_allow"
                      id="lt_hour_allow"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-time-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Please Enter Leave Hour Allowed in a year.
                  </div>
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_reset" className="form-label">
                    Reset *
                  </Label>

                  <Select
                    required
                    isMulti={false}
                    options={types || []}
                    id="lt_reset"
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.type &&
                        types.find((e) => e.value === leaveTypeData.id)) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({ ...leaveTypeData, type: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please Select Reset Leave.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_ws" className="form-label">
                    Applicable For *
                  </Label>

                  <Select
                    required
                    isMulti={false}
                    options={types || []}
                    id="lt_ws"
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.type &&
                        types.find((e) => e.value === leaveTypeData.id)) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({ ...leaveTypeData, type: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please select associate work schedule.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Gender *
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_gender_male"
                        name="Gender"
                        type="checkbox"
                        className="form-check-input"
                        defaultChecked
                        required
                      />
                      <Label
                        className="form-check-label"
                        htmlFor="lt_gender_male">
                        Male
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_gender_female"
                        name="Gender"
                        type="checkbox"
                        className="form-check-input"
                        required
                      />
                      <Label
                        className="form-check-label"
                        htmlFor="lt_gender_female">
                        Female
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_gender_others"
                        name="Gender"
                        type="checkbox"
                        className="form-check-input"
                        required
                      />
                      <Label
                        className="form-check-label"
                        htmlFor="lt_gender_others">
                        Others
                      </Label>
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please select applicable Gender.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_weekend" className="form-label">
                    Weekend Between Leave
                  </Label>
                  <div className="mb-2">
                    <div className="form-check form-switch form-check-inline">
                      <Input
                        type="checkbox"
                        className="form-check-input form-switch-md"
                        id="lt_weekend"
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_holiday" className="form-label">
                    Holiday Between Leave
                  </Label>
                  <div className="mb-2">
                    <div className="form-check form-switch form-check-inline">
                      <Input
                        type="checkbox"
                        className="form-check-input form-switch-md"
                        id="lt_holiday"
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="lt_desc"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LeaveTypeForm;
