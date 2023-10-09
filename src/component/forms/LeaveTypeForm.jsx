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
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LeaveTypeForm;
