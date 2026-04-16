import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MonthFormat } from "../../common/constant/Constants";

dayjs.extend(customParseFormat);

const PayCyclesTab = ({ payrollobj, repeatOption, cutOfMonthOption }) => {
  return (
    <div className="d-flex mb-2">
      <Row>
        <Col md={12} lg={12} xxl={12}>
          <div>
            <Label htmlFor="pc_name" className="form-label">
              Name
            </Label>
            <div className="form-icon right">
              <Input
                type="text"
                name="pc_name"
                id="pc_name"
                className="form-control"
                placeholder="Pay Cycle Name"
                value={payrollobj.pay_cycle.name || ""}
              />
              <i className="ri-profile-line"></i>
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Enter Pay Cycle Name.
            </div>
          </div>
        </Col>

        <Col md={12} lg={12} xxl={12}>
          <div>
            <Label htmlFor="description" className="form-label">
              Description
            </Label>
            <div className="form-icon right">
              <textarea
                name="description"
                className="form-control"
                id="description"
                value={payrollobj.pay_cycle.desc || ""}
                placeholder="Enter description"
              ></textarea>
              <i className="ri-file-list-3-line"></i>
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Enter Description Of Pay Cycles.
            </div>
          </div>
        </Col>

        <Col md={6} lg={6} xxl={6}>
          <div>
            <Label htmlFor="effectiveFrom" className="form-label">
              Effective From
            </Label>
            <div>
              <DatePicker
                className="form-control"
                placeholder="Effective From"
                format={MonthFormat}
                picker="month"
                allowClear={false}
              />
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              Choose the day after 30 Nov 2023.
            </div>
          </div>
        </Col>

        <Col md={6} lg={6} xxl={6}>
          <div>
            <Label htmlFor="repeatEvery" className="form-label">
              Repeat Every
            </Label>
            <div>
              <Select
                id="repeatEvery"
                isMulti={false}
                options={repeatOption || []}
                value={
                  (payrollobj.pay_cycle.repeat &&
                    repeatOption.find(
                      (e) => e.value === payrollobj.pay_cycle.repeat
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

        <Col md={6} lg={6} xxl={6}>
          <div>
            <Label htmlFor="cutoffDate" className="form-label">
              Cut-off Date
            </Label>
            <div>
              <Select
                id="cutoffDate"
                isMulti={false}
                options={cutOfMonthOption || []}
                value={
                  (payrollobj.pay_cycle.cut_off &&
                    cutOfMonthOption.find(
                      (e) => e.value === payrollobj.pay_cycle.cut_off
                    )) ||
                  []
                }
                className="basic-multi-select"
              />
            </div>
            <div id="passwordHelpBlock" className="form-text mb-3">
              This is the latest date that payroll information should be
              submitted to calculate payroll.
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

export default PayCyclesTab;