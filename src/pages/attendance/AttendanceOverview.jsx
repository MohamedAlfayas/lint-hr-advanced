import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import { AttendanceOverviewChart } from "./AttendanceOverviewChart";
import { useSelector } from "react-redux";

const AttendanceOverview = () => {
  // Inside your component

  const { chartData, chartInfo } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  const chartDataMemoized = useMemo(() => chartData, [chartData]);

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="p-0 border-0 bg-light-subtle mt-2">
              <Row className="g-0 text-center">
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    {(!!chartInfo?.wsHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.wsHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.wsHours % 3600) / 60) > 0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor((chartInfo?.wsHours % 3600) / 60)
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">Work Schedule</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    {(!!chartInfo?.checkInHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.checkInHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.checkInHours % 3600) / 60) >
                          0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor(
                                    (chartInfo?.checkInHours % 3600) / 60
                                  )
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">Check IN Hours</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    {(!!chartInfo?.otHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.otHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.otHours % 3600) / 60) > 0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor((chartInfo?.otHours % 3600) / 60)
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">OT Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    {(!!chartInfo?.paidHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.paidHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.paidHours % 3600) / 60) > 0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor((chartInfo?.paidHours % 3600) / 60)
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    {(!!chartInfo?.leaveHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.leaveHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.leaveHours % 3600) / 60) >
                          0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor(
                                    (chartInfo?.leaveHours % 3600) / 60
                                  )
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">Leave Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0 border-end-0">
                    {(!!chartInfo?.balanceHours && (
                      <h5 className="mb-1">
                        <span className="counter-value" data-target="51">
                          <CountUp
                            start={0}
                            end={String(
                              Math.floor(chartInfo?.balanceHours / 3600)
                            ).padStart(2, "0")}
                            suffix=" Hr"
                            separator={""}
                            duration={3}
                          />
                        </span>

                        {Math.floor((chartInfo?.balanceHours % 3600) / 60) >
                          0 && (
                          <>
                            {" "}
                            <span className="counter-value" data-target="51">
                              <CountUp
                                start={0}
                                end={String(
                                  Math.floor(
                                    (chartInfo?.balanceHours % 3600) / 60
                                  )
                                ).padStart(2, "0")}
                                suffix=" Min"
                                separator={""}
                                duration={3}
                              />
                            </span>
                          </>
                        )}
                      </h5>
                    )) || <h5 classname="mb-1">0 Hr</h5>}
                    <p className="text-muted mb-0">Balance Hours</p>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="p-0 pb-2">
              <div>
                <div dir="ltr" className="apex-charts">
                  <AttendanceOverviewChart
                    dataColors='["--vz-success", "--vz-orange", "--vz-info", "--vz-danger", "--vz-primary", "--vz-danger","#00FFFF" ,"#8E44AD","#ADD8E6"]'
                    chartData={chartDataMemoized}
                  />
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
