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

  const {form_obj} = useSelector((state) => state.RightSideBarReducer);
  const [EPFField, setEPFField] = useState(form_obj)
  console.log("llee",form_obj);
  

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
        <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label>Deduction Cycle</Label>
                <Select
                  required
                  isMulti={false}
                  options={deduction_cycle_option || []}
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                  value={EPFField ? deduction_cycle_option.find(d => d.id === EPFField.epf_type_id) : []}
                />
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Please select type of leave.
              </div>
            </Col>
            <Card className="bg-light shadow-none" id={"folder-2"}>
              <CardBody>
                <div className="d-flex mb-1">
                  <div className="form-check form-check-danger mb-3 fs-15 flex-grow-1">
                    <input
                      className="form-check-input"
                      type="radio"
                      value={EPFField ? deduction_cycle_option.find(d => d.id === EPFField.epf_cycle) : []}
                      name="EPFmethods"
                      id={"folderlistCheckbox_1"}
                     checked={EPFField}
                     
                    />
                    <label
                      className="form-check-label"
                      htmlFor={"folderlistCheckbox_1"}>
                      Method 1
                    </label>
                  </div>
                </div>
                <div>
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
            <Card className="bg-light shadow-none" id={"folder-2"}>
              <CardBody>
                <div className="d-flex mb-1">
                  <div className="form-check form-check-danger mb-3 fs-15 flex-grow-1">
                    <input
                      className="form-check-input"
                      type="radio"
                      value=""
                      name="EPFmethods"
                      id={"folderlistCheckbox_2"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={"folderlistCheckbox_2"}>
                      Method 2
                    </label>
                  </div>
                </div>
                <div>
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
                        <h5 className="fs-14">
                          3.67% of PF Wage restricted at ₹ 15000
                        </h5>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-light shadow-none" id={"folder-3"}>
              <CardBody>
                <div className="d-flex mb-1">
                  <div className="form-check form-check-danger mb-3 fs-15 flex-grow-1">
                    <input
                      className="form-check-input"
                      type="radio"
                      value=""
                      name="EPFmethods"
                      id={"folderlistCheckbox_3"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={"folderlistCheckbox_3"}>
                      Method 3
                    </label>
                  </div>
                </div>
                <div>
                  <Row className="gy-3">
                    <Col xs={6}>
                      <div>
                        <p className="text-muted mb-1">
                          Employee's Contribution
                        </p>
                        <h5 className="fs-14">
                          12% of PF Wage restricted at ₹ 15000
                        </h5>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <p className="text-muted mb-1">
                          Employer's Contribution
                        </p>
                        <h5 className="fs-14">
                          3.67% of PF Wage restricted at ₹ 15000
                        </h5>
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
