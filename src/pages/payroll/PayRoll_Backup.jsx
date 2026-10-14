import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
  FormFeedback,
  Button,
} from "reactstrap";
import classnames from "classnames";
import Select from "../../shared/ui/TestableSelect";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";

import { Checkbox, Table } from "rsuite";

// register lottie and define custom element
defineElement(loadAnimation);

const { Column, HeaderCell, Cell } = Table;

const PayRollBackup = () => {
  const navigate = useNavigate();

  const [activeTab, setactiveTab] = useState(1);
  const [progressbarvalue, setprogressbarvalue] = useState(0);
  const [passedSteps, setPassedSteps] = useState([1]);

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      payroll_from: "",
      pay_cycle_from: "",
      pay_cycle_to: "",
      company_has_pf: true,
      employee_contribution: "",
      pf_ceiling: true,
      company_has_esi: true,
      deduct_profesional_tax: true,
    };
  }, []);

  const [payRollObj, setPayRollObj] = useState(initialFormObj);

  useEffect(() => {
    console.log("PayRoll Obj = ", payRollObj);
  }, [payRollObj]);

  const payroll_from_options = [
    { id: 1, label: "Jan", value: 1 },
    { id: 2, label: "Feb", value: 2 },
    { id: 3, label: "Mar", value: 3 },
    { id: 4, label: "Apr", value: 4 },
    { id: 5, label: "May", value: 5 },
    { id: 6, label: "Jun", value: 6 },
    { id: 7, label: "Jul", value: 7 },
    { id: 8, label: "Aug", value: 8 },
    { id: 9, label: "Sep", value: 9 },
    { id: 10, label: "Oct", value: 10 },
    { id: 11, label: "Nov", value: 11 },
    { id: 12, label: "Dec", value: 12 },
  ];

  const [pay_cycle_options, setPayCycleOptions] = useState([]);

  useEffect(() => {
    let pco = [];
    for (var i = 1; i <= 29; i++) {
      pco.push({ id: i, label: i, value: i });
    }
    setPayCycleOptions(pco);
  }, []);

  const employee_contribution_options = [
    { id: 1, label: "Basic * 6%", value: 1 },
    { id: 2, label: "Basic * 12%", value: 2 },
    { id: 3, label: "Basic * 24%", value: 3 },
  ];

  const employee_details = [
    {
      id: "LC001",
      first_name: "Elan",
      last_name: "RV",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
    {
      id: "LC002",
      first_name: "Thalavai",
      last_name: "Dinesh",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
    {
      id: "LC003",
      first_name: "Vinish",
      last_name: "Essaku",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
    {
      id: "LC004",
      first_name: "Paul",
      last_name: "Prabhakaran",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
    {
      id: "LC005",
      first_name: "Antony",
      last_name: "Donald",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
    {
      id: "LC006",
      first_name: "Mohammed",
      last_name: "Fayas",
      structure: "Monthly",
      units: "Annual CTC",
      ctc: "0.00",
    },
  ];

  const [checkedKeys, setCheckedKeys] = useState([]);
  let checked = false;
  let indeterminate = false;

  if (checkedKeys.length === employee_details.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  } else if (
    checkedKeys.length > 0 &&
    checkedKeys.length < employee_details.length
  ) {
    indeterminate = true;
  }

  const handleCheckAll = (value, checked) => {
    const keys = checked ? employee_details.map((item) => item.id) : [];
    setCheckedKeys(keys);
  };
  const handleCheck = (value, checked) => {
    const keys = checked
      ? [...checkedKeys, value]
      : checkedKeys.filter((item) => item !== value);
    setCheckedKeys(keys);
  };

  const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: "46px" }}>
        <Checkbox
          value={rowData[dataKey]}
          inline
          onChange={onChange}
          checked={checkedKeys.some((item) => item === rowData[dataKey])}
        />
      </div>
    </Cell>
  );

  function toggleTab(tab, value) {
    if (activeTab !== tab) {
      var modifiedSteps = [...passedSteps, tab];

      if (tab >= 1 && tab <= 4) {
        setactiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
    setprogressbarvalue(value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    toggleTab(activeTab + 1, 100);
    
  };

  document.title = `PayRoll | ${MetaTitle || "Lint HR"} `;

  return (
    <React.Fragment>
      <div className="page-content">
        <Row className="justify-content-center">
          <Col md={10} lg={10} xl={8}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit} className="form-steps">
                  <div className="text-center pt-3 pb-4 mb-1">
                    <h5>PayRoll Setup Wizard</h5>
                  </div>

                  {activeTab < 3 && (
                    <div className="progress-nav mb-4">
                      <Progress
                        value={progressbarvalue}
                        style={{ height: "1px" }}
                      />

                      <Nav
                        className="nav-pills progress-bar-tab custom-nav"
                        role="tablist">
                        <NavItem>
                          <NavLink
                            id="pills-gen-info-tab"
                            className={classnames(
                              {
                                active: activeTab === 1,
                                done: activeTab <= 4 && activeTab >= 0,
                              },
                              "rounded-pill"
                            )}
                            onClick={() => {
                              toggleTab(1, 0);
                            }}
                            tag="button"
                            type="button">
                            1
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            id="pills-gen-info-tab"
                            className={classnames(
                              {
                                active: activeTab === 2,
                                done: activeTab <= 4 && activeTab > 1,
                              },
                              "rounded-pill"
                            )}
                            onClick={() => {
                              toggleTab(2, 50);
                            }}
                            tag="button"
                            type="button">
                            2
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            id="pills-gen-info-tab"
                            className={classnames(
                              {
                                active: activeTab === 3,
                                done: activeTab <= 4 && activeTab > 2,
                              },
                              "rounded-pill"
                            )}
                            // onClick={() => {
                            //   toggleTab(3, 100);
                            // }}
                            tag="button"
                            type="button">
                            3
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  )}

                  <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                      <div>
                        <div className="mb-4">
                          <div className="text-center">
                            <h5 className="mb-1">Payroll Setting</h5>
                          </div>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                When do You Want to Use Linthr's Payroll from
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Select
                                id="parentDepartment"
                                isMulti={false}
                                options={payroll_from_options || []}
                                className="basic-multi-select"
                                placeholder={"Select Payroll From"}
                                value={
                                  (payRollObj.payroll_from &&
                                    payroll_from_options.find(
                                      (e) => e.value === payRollObj.payroll_from
                                    )) ||
                                  []
                                }
                                onChange={(e) =>
                                  setPayRollObj({
                                    ...payRollObj,
                                    payroll_from: e.value,
                                  })
                                }
                              />
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                Pay Cycle
                              </Label>
                            </Col>
                            <Col
                              lg={6}
                              sm={12}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}>
                              <span style={{ marginRight: "3px" }}>From</span>
                              <Select
                                id="pay_cycle"
                                isMulti={false}
                                options={pay_cycle_options || []}
                                className="basic-multi-select"
                                placeholder={"Select Payroll From"}
                                value={
                                  (payRollObj.pay_cycle_from &&
                                    pay_cycle_options.find(
                                      (e) =>
                                        e.value === payRollObj.pay_cycle_from
                                    )) ||
                                  []
                                }
                                onChange={(e) =>
                                  setPayRollObj({
                                    ...payRollObj,
                                    pay_cycle_from: e.value,
                                  })
                                }
                              />
                              <span style={{ marginLeft: "3px" }}>To 31</span>
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                Does Your Company have PF ?
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                  id="company_has_pf"
                                  name="company_has_pf"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={payRollObj.company_has_pf}
                                  onChange={(e) =>
                                    setPayRollObj({
                                      ...payRollObj,
                                      company_has_pf: e.target.checked,
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                Employee Contribution
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <Select
                                id="employee_contribution"
                                name="employee_contribution"
                                isMulti={false}
                                options={employee_contribution_options || []}
                                className="basic-multi-select"
                                placeholder={"Select Employee Contribution"}
                                value={
                                  (payRollObj.employee_contribution &&
                                    employee_contribution_options.find(
                                      (e) =>
                                        e.value ===
                                        payRollObj.employee_contribution
                                    )) ||
                                  []
                                }
                                onChange={(e) =>
                                  setPayRollObj({
                                    ...payRollObj,
                                    employee_contribution: e.value,
                                  })
                                }
                              />
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                PF Ceiling at Rs. 15000
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                  id="pf_ceiling"
                                  name="pf_ceiling"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={payRollObj.pf_ceiling}
                                  onChange={(e) =>
                                    setPayRollObj({
                                      ...payRollObj,
                                      pf_ceiling: e.target.checked,
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                Does Your Company have ESI ?
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                  id="company_has_esi"
                                  name="company_has_esi"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={payRollObj.company_has_esi}
                                  onChange={(e) =>
                                    setPayRollObj({
                                      ...payRollObj,
                                      company_has_esi: e.target.checked,
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <div className="mb-3">
                          <Row>
                            <Col lg={6} sm={12}>
                              <Label
                                className="form-label"
                                htmlFor="gen-info-username-input">
                                Do You deduct Professional Tax ?
                              </Label>
                            </Col>
                            <Col lg={6} sm={12}>
                              <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                  id="deduct_profesional_tax"
                                  name="deduct_profesional_tax"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={payRollObj.deduct_profesional_tax}
                                  onChange={(e) =>
                                    setPayRollObj({
                                      ...payRollObj,
                                      deduct_profesional_tax: e.target.checked,
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                      <div className="d-flex align-items-start gap-3 mt-4">
                        <button
                          type="button"
                          className="btn btn-success btn-label right ms-auto nexttab nexttab"
                          onClick={() => {
                            toggleTab(activeTab + 1, 50);
                          }}>
                          <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                          Next
                        </button>
                      </div>
                    </TabPane>

                    <TabPane tabId={2}>
                      <div>
                        <div className="mb-4">
                          <Table
                            height={400}
                            data={employee_details}
                            onRowClick={(rowData) => {
                              
                            }}>
                            <Column width={60} align="center" fixed>
                              <HeaderCell style={{ padding: 0 }}>
                                <div style={{ lineHeight: "40px" }}>
                                  <Checkbox
                                    inline
                                    checked={checked}
                                    indeterminate={indeterminate}
                                    onChange={handleCheckAll}
                                  />
                                </div>
                              </HeaderCell>
                              <CheckCell
                                dataKey="id"
                                checkedKeys={checkedKeys}
                                onChange={handleCheck}
                              />
                            </Column>

                            <Column width={150}>
                              <HeaderCell>Employee Name</HeaderCell>
                              <Cell>
                                {(rowData) =>
                                  rowData.first_name + " " + rowData.last_name
                                }
                              </Cell>
                            </Column>

                            <Column width={100}>
                              <HeaderCell>Structure</HeaderCell>
                              <Cell dataKey="structure" />
                            </Column>

                            <Column width={100}>
                              <HeaderCell>Units</HeaderCell>
                              <Cell dataKey="units" />
                            </Column>

                            <Column width={150}>
                              <HeaderCell>CTC</HeaderCell>
                              <Cell dataKey="ctc" />
                            </Column>

                            <Column width={80} fixed="right">
                              <HeaderCell>Action</HeaderCell>

                              <Cell style={{ padding: "6px" }}>
                                {(rowData) => (
                                  <Link
                                    style={{ textDecoration: "none" }}
                                    className="text-primary d-inline-block edit-item-btn"
                                    onClick={() =>
                                      console.log("Edit DAta = ", rowData)
                                    }>
                                    <i className="ri-pencil-line fs-16"></i>
                                  </Link>
                                )}
                              </Cell>
                            </Column>
                          </Table>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-3 mt-4">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none btn-label previestab"
                          onClick={() => {
                            toggleTab(activeTab - 1, 0);
                          }}>
                          <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                          Back to General
                        </button>
                        <Button
                          type="submit"
                          className="btn btn-success btn-label right ms-auto nexttab nexttab">
                          <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                          Submit
                        </Button>
                      </div>
                    </TabPane>
                  </TabContent>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default PayRollBackup;
