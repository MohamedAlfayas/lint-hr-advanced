import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { Link } from "react-router-dom";
import TaxSlabModal from "./TaxSlabModal";

const BasicComponentsTab = ({
  payrollobj,
  epfCycle,
  taxSlab,
  onEPFEdit,
  onTaxEdit,
}) => {
  const [activeTab, setActiveTab] = useState("1");
  const [modalOpen, setModalOpen] = useState(false);
  const [taxSlabId, setTaxSlabId] = useState(0);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const showTaxSlabModal = (id) => {
    setTaxSlabId(id);
    setModalOpen(!modalOpen);
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <Row>
      <Col xxl={12}>
        <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "1" })}
              onClick={() => toggleTab("1")}
            >
              ESI <small>{"(Employees state insurance)"}</small>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "2" })}
              onClick={() => toggleTab("2")}
            >
              EPF <small>{"(Employees' Provident Fund)"}</small>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "3" })}
              onClick={() => toggleTab("3")}
            >
              Professional Tax
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "4" })}
              onClick={() => toggleTab("4")}
            >
              LABOUR WELFARE FUND
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className="text-muted">
          {/* ESI Tab */}
          <TabPane tabId="1">
            <div className="d-flex">
              <Col xxl={12} sm={12} className="project-card">
                <Card>
                  <CardBody>
                    <div
                      className={`p-3 mt-n3 mx-n3 bg-${
                        payrollobj.basic_components.esi?.is_active ? "success" : "dark"
                      }-subtle rounded-top`}
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h5 className="mb-0 fs-14">
                            <Link to="#" className="text-body">ESI</Link>
                          </h5>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="d-flex gap-1 align-items-center my-n2">
                            <div className="form-check form-switch form-switch-success">
                              <Input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="enableESI"
                                checked={payrollobj.basic_components.esi.is_active}
                                readOnly
                              />
                              <Label className="form-check-label" htmlFor="enableESI">
                                Active
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-3">
                      <Row className="gy-3">
                        <Col xs={4}>
                          <p className="text-muted mb-1">Deduction Cycle</p>
                          <h5 className="fs-14">Monthly</h5>
                        </Col>
                        <Col xs={4}>
                          <p className="text-muted mb-1">Employee's Contribution</p>
                          <h5 className="fs-14">0.75 % of Gross Pay</h5>
                        </Col>
                        <Col xs={4}>
                          <p className="text-muted mb-1">Employer's Contribution</p>
                          <h5 className="fs-14">3.25 % of Gross Pay</h5>
                        </Col>
                        <Col md={12}>
                          <Card>
                            <CardBody className="bg-info-subtle">
                              <div className="d-flex">
                                <div className="flex-shrink-0">
                                  <FeatherIcon icon="info" className="text-info icon-dual-info" />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="fs-15">Note!</h6>
                                  <p className="text-muted mb-0">
                                    ESI deductions will be made only if the employee's monthly
                                    salary is less than or equal to ₹ 21,000. If the employee
                                    gets a salary revision which increases their monthly salary
                                    above ₹ 21,000, they would have to continue making ESI
                                    contributions till the end of the contribution period in
                                    which the salary was revised (April-September or October-March).
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
              <Col xxl={12} sm={12} className="project-card">
                <Card>
                  <CardBody>
                    <div
                      className={`p-3 mt-n3 mx-n3 bg-${
                        payrollobj.basic_components.epf.is_active ? "success" : "dark"
                      }-subtle rounded-top`}
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h5 className="mb-0 fs-14">
                            <Link to="#" className="text-body">EPF</Link>
                          </h5>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="d-flex gap-1 align-items-center my-n2">
                            <div className="form-check form-switch form-switch-success">
                              <Input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="enableEPF"
                                checked={payrollobj.basic_components.epf.is_active}
                                readOnly
                              />
                              <Label className="form-check-label" htmlFor="enableEPF">
                                Active
                              </Label>
                            </div>
                            <a
                              onClick={() => onEPFEdit(payrollobj.basic_components.epf)}
                              className="text-primary d-inline-block edit-item-btn ms-2"
                              href="javascript:void(0)"
                            >
                              <i className="ri-pencil-fill fs-16"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-3">
                      <Row className="gy-3">
                        <Col xs={4}>
                          <p className="text-muted mb-1">Deduction Cycle</p>
                          <h5 className="fs-14">{payrollobj.basic_components.epf.epf_type}</h5>
                        </Col>
                        <Col xs={4}>
                          <p className="text-muted mb-1">Employee's Contribution</p>
                          <h5 className="fs-14">
                            {payrollobj.basic_components.epf.epf_cycle
                              ? epfCycle.find(
                                  (obj) => obj.id === payrollobj.basic_components.epf.epf_cycle
                                )?.Employee
                              : ""}
                          </h5>
                        </Col>
                        <Col xs={4}>
                          <p className="text-muted mb-1">Employer's Contribution</p>
                          <h5 className="fs-14">
                            {payrollobj.basic_components.epf.epf_cycle
                              ? epfCycle.find(
                                  (obj) => obj.id === payrollobj.basic_components.epf.epf_cycle
                                )?.Employer
                              : ""}
                          </h5>
                        </Col>
                        <Col md={12}>
                          <Card>
                            <CardBody className="bg-info-subtle">
                              <div className="d-flex">
                                <div className="flex-shrink-0">
                                  <FeatherIcon icon="info" className="text-info icon-dual-info" />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="fs-15">Note!</h6>
                                  <p className="text-muted mb-0">
                                    Employer's EPF Contribution would include EDLI & Admin charge
                                    in CTC salary structure.
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

          {/* Professional Tax Tab */}
          <TabPane tabId="3">
            <div className="d-flex">
              <Col xxl={12} sm={12} className="project-card">
                {(payrollobj.basic_components.pro_tax || []).map((item, key) => (
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
                              <div className="form-check form-switch form-switch-success">
                                <Input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id={`enableProTax_${key}`}
                                  checked={item.is_active}
                                  readOnly
                                />
                                <Label className="form-check-label" htmlFor={`enableProTax_${key}`}>
                                  Active
                                </Label>
                              </div>
                              <a
                                onClick={() => onTaxEdit(item.slabs, item)}
                                className="text-primary d-inline-block edit-item-btn ms-2"
                                href="javascript:void(0)"
                              >
                                <i className="ri-pencil-fill fs-16"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-3">
                        <Row className="gy-3">
                          <Col xs={4}>
                            <p className="text-muted mb-1">Address</p>
                            <h5 className="fs-14">{item.add}</h5>
                          </Col>
                          <Col xs={2}>
                            <p className="text-muted mb-1">State</p>
                            <h5 className="fs-14">{item.state}</h5>
                          </Col>
                          <Col xs={2}>
                            <p className="text-muted mb-1">Deduction Cycle</p>
                            <h5 className="fs-14">{item.tax_cycle}</h5>
                          </Col>
                          <Col xs={2}>
                            <p className="text-muted mb-1">PT Slabs</p>
                            <p>
                              <Link
                                to="#"
                                onClick={() => showTaxSlabModal(item.slabs)}
                                className="link-success"
                              >
                                View Tax Slabs
                              </Link>
                            </p>
                          </Col>
                        </Row>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Col>
            </div>
          </TabPane>

          {/* Labour Welfare Fund Tab */}
          <TabPane tabId="4">
            <div className="d-flex">
              <Card>
                <CardBody>
                  <div
                    className={`p-3 mt-n3 mx-n3 bg-${
                      payrollobj.basic_components.labour_fund ? "success" : "dark"
                    }-subtle rounded-top`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fs-14">
                          <Link to="#" className="text-body">Tamil Nadu</Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex gap-1 align-items-center my-n2">
                          <div className="form-check form-switch form-switch-success">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="enableLabourFund"
                              checked={payrollobj.basic_components.labour_fund}
                              readOnly
                            />
                            <Label className="form-check-label" htmlFor="enableLabourFund">
                              Active
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <Row className="gy-3">
                      <Col xs={4}>
                        <p className="text-muted mb-1">Deduction Cycle</p>
                        <h5 className="fs-14">Yearly</h5>
                      </Col>
                      <Col xs={4}>
                        <p className="text-muted mb-1">Employee's Contribution</p>
                        <h5 className="fs-14">₹ 20</h5>
                      </Col>
                      <Col xs={4}>
                        <p className="text-muted mb-1">Employer's Contribution</p>
                        <h5 className="fs-14">₹ 40</h5>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </div>
          </TabPane>
        </TabContent>
      </Col>

      {/* Tax Slab Modal lives here since it's triggered from this tab */}
      <TaxSlabModal
        isOpen={modalOpen}
        toggle={toggleModal}
        taxSlabId={taxSlabId}
        taxSlab={taxSlab}
      />
    </Row>
  );
};

export default BasicComponentsTab;