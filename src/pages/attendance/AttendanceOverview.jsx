import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import { AttendanceOverviewChart } from "./AttendanceOverviewChart";

const AttendanceOverview = () => {
  // Inside your component

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="p-0 border-0 bg-light-subtle mt-2">
              <Row className="g-0 text-center">
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={51}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Work Schedule</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Check IN Hours</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="0">
                        <CountUp
                          start={0}
                          end={0}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">OT Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0 border-end-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="33">
                        <CountUp
                          start={0}
                          end={-33}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Balance Hours</p>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="p-0 pb-2">
              <div>
                <div dir="ltr" className="apex-charts">
                  <AttendanceOverviewChart dataColors='["--vz-success", "--vz-primary", "--vz-info", "--vz-danger"]' />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default AttendanceOverview;
