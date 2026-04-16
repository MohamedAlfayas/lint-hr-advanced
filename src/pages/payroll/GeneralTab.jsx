import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Label,
  Row,
} from "reactstrap";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";

const GeneralTab = ({ payrollobj, locationOption, currencyOption, salaryCalculationOption }) => {
  return (
    <div className="d-flex mb-2">
      <Row>
        <Col md={6} lg={6} xxl={6}>
          <div>
            <Label htmlFor="location" className="form-label">
              Location
            </Label>
            <div>
              <Select
                id="location"
                isMulti={false}
                options={locationOption || []}
                value={
                  (payrollobj.general.location &&
                    locationOption.find(
                      (e) => e.value === payrollobj.general.location
                    )) ||
                  []
                }
                className="basic-multi-select"
              />
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Select Payroll Country.
            </div>
          </div>
        </Col>

        <Col md={6} lg={6} xxl={6}>
          <div>
            <Label htmlFor="currency" className="form-label">
              Currency
            </Label>
            <div>
              <Select
                id="currency"
                isMulti={false}
                options={currencyOption || []}
                value={
                  (payrollobj.general.currency &&
                    currencyOption.find(
                      (e) => e.value === payrollobj.general.currency
                    )) ||
                  []
                }
                className="basic-multi-select"
              />
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Select Payroll Currency.
            </div>
          </div>
        </Col>

        <Col md={12} lg={12} xxl={12}>
          <div>
            <Label htmlFor="calculation" className="form-label">
              Calculate Monthly Salary Based On
            </Label>
            <div>
              <Select
                id="calculation"
                isMulti={false}
                options={salaryCalculationOption || []}
                value={
                  (payrollobj.general.calc_based_on &&
                    salaryCalculationOption.find(
                      (e) => e.value === payrollobj.general.calc_based_on
                    )) ||
                  []
                }
                className="basic-multi-select"
              />
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Select Calculate Monthly Salary Based On.
            </div>
          </div>
        </Col>

        <Col lg={12}>
          <div className="text-start">
            <Button type="submit" color="success" className="btn-label">
              <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
              Save
            </Button>
          </div>
        </Col>

        <Col md={9} lg={9} xxl={9} className="mt-3">
          <Card>
            <CardBody className="bg-info-subtle">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <FeatherIcon icon="info" className="text-info icon-dual-info" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="fs-15">Payroll General Info Heading @Dinesh!</h6>
                  <p className="text-muted mb-0 hide">
                    Event that applications book will appear here. Click on an
                    event to see the details and manage applicants event.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GeneralTab;