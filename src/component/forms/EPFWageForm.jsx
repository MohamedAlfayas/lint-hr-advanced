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

const EPFWageForm = () => {
  const deduction_cycle_option = useMemo(
    () => [
      { id: "1", label: "Monthly", value: "Monthly" },
      { id: "2", label: "Weekly", value: "Weekly" },
    ],
    []
  );
  return (
    <React.Fragment>
      <Row>
        <Col xxl={12} className="col-6 folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col lg={12}>
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
                Please select type of leave.
              </div>
            </Col>
            <Card className="bg-light shadow-none" id={"folder-1"}>
              <CardBody>
                <div className="d-flex mb-1">
                  <div className="form-check form-check-danger mb-3 fs-15 flex-grow-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value=""
                      id={"folderlistCheckbox_1"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={"folderlistCheckbox_1"}>
                      Method 1
                    </label>
                  </div>
                </div>
                <div className="py-3">
                  <Row className="gy-3">
                    <Col xs={6}>
                      <div>
                        <p className="text-muted mb-1">
                          Employee's Contribution
                        </p>
                        <h5 className="fs-14">12% of Actual PF Wage</h5>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <p className="text-muted mb-1">
                          Employer's Contribution
                        </p>
                        <h5 className="fs-14">12% of Actual PF Wage</h5>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default EPFWageForm;
