import React, { useEffect, useMemo, useState } from "react";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import {
  Card,
  CardBody,
  Col,
  Container,
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
import Select from "react-select";

// register lottie and define custom element
defineElement(loadAnimation);

const PayRollConfig = () => {
  // Vertical Nav Tabs
  const [verticalTab, setverticalTab] = useState("1");
  const toggleVertical = (tab) => {
    if (verticalTab !== tab) {
      setverticalTab(tab);
    }
  };

  const location_option = useMemo(
    () => [
      { id: "India", label: "India", value: "India" },
      { id: "Srilanka", label: "Srilanka", value: "Srilanka" },
      { id: "Singapore", label: "Singapore", value: "Singapore" },
    ],
    []
  );

  const currency_option = useMemo(
    () => [
      { id: "INR", label: "INR", value: "INR" },
      { id: "USD", label: "USD", value: "USD" },
    ],
    []
  );
  const salary_calculation_option = useMemo(
    () => [
      { id: "1", label: "Actual Calender Days", value: "Actual Calender Days" },
      { id: "2", label: "Month Starting", value: "Month Starting" },
    ],
    []
  );

  document.title = `PayRoll | ${MetaTitle || "Lint HR"} `;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="project-wrapper">
            <Col xxl={12}>
              <Card>
                <CardBody>
                  <h5 className="mb-3">Payroll Configuration</h5>

                  <Row>
                    <Col md={2}>
                      <Nav
                        pills
                        className="flex-column text-left"
                        id="v-pills-tab">
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "1",
                            })}
                            onClick={() => {
                              toggleVertical("1");
                            }}
                            id="v-pills-home-tab">
                            General
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "2",
                            })}
                            onClick={() => {
                              toggleVertical("2");
                            }}
                            id="v-pills-profile-tab">
                            Pay Cycles
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalTab === "3",
                            })}
                            onClick={() => {
                              toggleVertical("3");
                            }}
                            id="v-pills-messages-tab">
                            Basic Components
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: verticalTab === "4",
                            })}
                            onClick={() => {
                              toggleVertical("4");
                            }}
                            id="v-pills-settings-tab">
                            Salary Components
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: verticalTab === "5",
                            })}
                            onClick={() => {
                              toggleVertical("5");
                            }}
                            id="v-pills-settings-tab">
                            Salary Policies
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </Col>
                    <Col md={10}>
                      <TabContent
                        activeTab={verticalTab}
                        className="text-muted mt-4 mt-md-0"
                        id="v-pills-tabContent">
                        <TabPane tabId="1" id="v-pills-home">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="location"
                                    className="form-label">
                                    Location
                                  </Label>
                                  <div>
                                    <Select
                                      id="location"
                                      isMulti={false}
                                      options={location_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Payroll Country.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="currency"
                                    className="form-label">
                                    Currency
                                  </Label>
                                  <div>
                                    <Select
                                      id="currency"
                                      isMulti={false}
                                      options={currency_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Payroll Currency.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Calculate Monthly Salary Based On
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={salary_calculation_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Select Calculate Monthly Salary Based On.
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <p className="mb-0">
                            This may be the most commonly encountered tip I
                            received from the designers I spoke with. They
                            highly encourage that you use different fonts in one
                            design, but do not over-exaggerate and go overboard.
                          </p>
                        </TabPane>
                        <TabPane tabId="2" id="v-pills-profile">
                          <div className="d-flex mb-2">
                            <div className="flex-shrink-0">
                              <img
                                src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                                alt=""
                                width="150"
                                className="rounded"
                              />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <p className="mb-0">
                                {" "}
                                I also decreased the transparency in the text so
                                that the mountains come through the text,
                                bringing the quote truly to life. Make sure that
                                the placement of your text is pleasing to look
                                at, and you try to achieve symmetry for this
                                effect.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            You've probably heard that opposites attract. The
                            same is true for fonts. Don't be afraid to combine
                            font styles that are different but complementary.
                            You can always play around with the text that is
                            overlaid on an image.
                          </p>
                        </TabPane>
                        <TabPane tabId="3" id="v-pills-messages">
                          <div className="d-flex mb-2">
                            <div className="flex-shrink-0">
                              <img
                                src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                                alt=""
                                width="150"
                                className="rounded"
                              />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <p className="mb-0">
                                In this image, you can see that the line height
                                has been reduced significantly, and the size was
                                brought up exponentially. Experiment and play
                                around with the fonts that you already have in
                                the software you’re working with reputable font
                                websites.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            They highly encourage that you use different fonts
                            in one design, but do not over-exaggerate and go
                            overboard This may be the most commonly encountered
                            tip I received from the designers I spoke with.
                          </p>
                        </TabPane>

                        <TabPane tabId="4" id="v-pills-settings">
                          <div className="d-flex mb-2">
                            <div className="flex-shrink-0">
                              <img
                                src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                                alt=""
                                width="150"
                                className="rounded"
                              />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <p className="mb-0">
                                When designing, the goal is to draw someone’s
                                attention and portray to them what you’re trying
                                to say. You can make a big statement by using
                                little tricks, like this one. Use contrasting
                                fonts. you can use a bold sanserif font with a
                                cursive.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            If you’re using multiple elements, make sure that
                            your principal object is larger than the others, as
                            the eye of your viewer will automatically be drawn
                            to the larger of the two objects.
                          </p>
                        </TabPane>
                        <TabPane tabId="5" id="v-pills-home">
                          <div className="d-flex mb-2">
                            <div className="flex-shrink-0">
                              <img
                                src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                                alt=""
                                width="150"
                                className="rounded"
                              />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <p className="mb-0">
                                You always want to make sure that your fonts
                                work well together and try to limit the number
                                of fonts you use to three or less. Experiment
                                and play around with the fonts that you already
                                have in the software you’re working with
                                reputable font websites.
                              </p>
                            </div>
                          </div>
                          <p className="mb-0">
                            This may be the most commonly encountered tip I
                            received from the designers I spoke with. They
                            highly encourage that you use different fonts in one
                            design, but do not over-exaggerate and go overboard.
                          </p>
                        </TabPane>
                      </TabContent>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PayRollConfig;
