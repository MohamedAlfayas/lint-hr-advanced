import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
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
} from "reactstrap";

const ProfessionalTaxForm = () => {
  const deduction_cycle_option = useMemo(
    () => [
      { id: "1", label: "Monthly", value: "Monthly" },
      { id: "2", label: "Quarterly", value: "Quarterly" },
      { id: "3", label: "Half-Yearly", value: "Half-Yearly" },
      { id: "4", label: "Annually", value: "Annually" },
    ],
    []
  );
  return (
    <React.Fragment>
      <Row>
        <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label htmlFor="emailid" className="form-label">
                  Location
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="emp_id"
                    id="employeeid"
                    className="form-control"
                    placeholder="Employee ID"
                    value="Tamil Nadu"
                    disabled
                  />
                  <i className="ri-map-pin-user-line"></i>
                </div>
              </div>
            </Col>
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label>Deduction Cycle</Label>
                <Select
                  required
                  isMulti={false}
                  options={deduction_cycle_option || []}
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                />
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Please select Deduction Cycle.
              </div>
            </Col>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProfessionalTaxForm;
