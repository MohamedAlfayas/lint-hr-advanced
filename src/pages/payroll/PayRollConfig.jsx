import React, { useEffect, useMemo, useState } from "react";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";

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

  // Custom Tabs Bordered
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
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

  const repeat_option = useMemo(
    () => [
      { id: "1", label: "Month", value: "Month" },
      { id: "2", label: "Week", value: "Week" },
    ],
    []
  );

  const cut_of_month_option = useMemo(
    () => [
      { id: "1", label: "Day 21", value: "Day 21" },
      { id: "2", label: "Day 22", value: "Day 22" },
      { id: "3", label: "Day 23", value: "Day 23" },
      { id: "4", label: "Day 24", value: "Day 24" },
      { id: "5", label: "Day 25", value: "Day 25" },
      { id: "6", label: "Day 26", value: "Day 26" },
      { id: "7", label: "Day 27", value: "Day 27" },
      { id: "8", label: "Day 28", value: "Day 28" },
      { id: "9", label: "Last Day Of Month", value: "Last Day Of Month" },
    ],
    []
  );

  const cut_of_week_option = useMemo(
    () => [
      { id: "1", label: "Friday", value: "Friday" },
      { id: "2", label: "Saturday", value: "Saturday" },
      { id: "3", label: "Sunday", value: "Sunday" },
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
                              <Col lg={12}>
                                <div className="text-start">
                                  <Button
                                    type="submit"
                                    color="success"
                                    className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                  </Button>{" "}
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <Col md={9} lg={9} xxl={9}>
                            <Card>
                              <CardBody className="bg-info-subtle">
                                <div className="d-flex">
                                  <div className="flex-shrink-0">
                                    <FeatherIcon
                                      icon="info"
                                      className="text-info icon-dual-info"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6 className="fs-15">
                                      Payroll General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Event that applications book will appear
                                      here. Click on an event to see the details
                                      and manage applicants event.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                        <TabPane tabId="2" id="v-pills-profile">
                          <div className="d-flex mb-2">
                            <Row>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="pc_name"
                                    className="form-label">
                                    Name
                                  </Label>
                                  <div className="form-icon right">
                                    <Input
                                      type="text"
                                      name="pc_name"
                                      id="pc_name"
                                      className="form-control"
                                      placeholder="Pay Cycle Name"
                                    />
                                    <i className="ri-profile-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Enter Pay Cycle Name.
                                  </div>
                                </div>
                              </Col>
                              <Col md={12} lg={12} xxl={12}>
                                <div>
                                  <Label
                                    htmlFor="description"
                                    className="form-label">
                                    Description
                                  </Label>
                                  <div className="form-icon right">
                                    <textarea
                                      type="text"
                                      name="description"
                                      className="form-control"
                                      id="description"
                                      placeholder="Enter description"></textarea>
                                    <i className="ri-file-list-3-line"></i>
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Enter Description Of Pay Cycles.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Effective From
                                  </Label>
                                  <div>
                                    <Flatpickr
                                      className="form-control"
                                      placeholder="Effective From"
                                      //value={endHour}
                                      options={{
                                        shorthand: true, //defaults to false https://flatpickr.js.org/plugins/
                                        dateFormat: "M, y", //defaults to "F Y"
                                        altFormat: "F Y", //defaults to "F Y"
                                        theme: "dark", // defaults to "light"
                                      }}
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    Choose the day after 30 Nov 2023.
                                  </div>
                                </div>
                              </Col>
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Repeat Every
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={repeat_option || []}
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
                              <Col md={6} lg={6} xxl={6}>
                                <div>
                                  <Label
                                    htmlFor="calculation"
                                    className="form-label">
                                    Cut-off Date
                                  </Label>
                                  <div>
                                    <Select
                                      id="calculation"
                                      isMulti={false}
                                      options={cut_of_month_option || []}
                                      className="basic-multi-select "
                                    />
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text mb-3">
                                    This is the latest date that payroll
                                    information should be submitted to calculate
                                    payroll.
                                  </div>
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="text-start">
                                  <Button
                                    type="submit"
                                    color="success"
                                    className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                  </Button>{" "}
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <Col md={9} lg={9} xxl={9}>
                            <Card>
                              <CardBody className="bg-info-subtle">
                                <div className="d-flex">
                                  <div className="flex-shrink-0">
                                    <FeatherIcon
                                      icon="info"
                                      className="text-info icon-dual-info"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6 className="fs-15">
                                      Payroll General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Event that applications book will appear
                                      here. Click on an event to see the details
                                      and manage applicants event.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                        <TabPane tabId="3" id="v-pills-messages">
                          {/* Tab Inside Tab @Elan */}
                          <Row>
                            <Col xxl={12}>
                              <Nav
                                tabs
                                className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "1",
                                    })}
                                    onClick={() => {
                                      toggleCustom("1");
                                    }}>
                                    ESI{" "}
                                    <small>(Employees state insurance)</small>
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "2",
                                    })}
                                    onClick={() => {
                                      toggleCustom("2");
                                    }}>
                                    EPF{" "}
                                    <small>(Employees' Provident Fund)</small>
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "3",
                                    })}
                                    onClick={() => {
                                      toggleCustom("3");
                                    }}>
                                    Professional Tax
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                      active: customActiveTab === "4",
                                    })}
                                    onClick={() => {
                                      toggleCustom("4");
                                    }}>
                                    Settings
                                  </NavLink>
                                </NavItem>
                              </Nav>

                              <TabContent
                                activeTab={customActiveTab}
                                className="text-muted">
                                <TabPane tabId="1" id="home1">
                                  <div className="d-flex">
                                    <Col
                                      xxl={12}
                                      sm={12}
                                      className="project-card">
                                      <Card>
                                        <CardBody>
                                          <div
                                            className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h5 className="mb-0 fs-14">
                                                  <Link
                                                    to="/apps-projects-overview"
                                                    className="text-body">
                                                    Test Lable
                                                  </Link>
                                                </h5>
                                              </div>
                                              <div className="flex-shrink-0">
                                                <div className="d-flex gap-1 align-items-center my-n2">
                                                  <div className="form-check form-switch form-switch-success  ">
                                                    <Input
                                                      className="form-check-input"
                                                      type="checkbox"
                                                      role="switch"
                                                      id="SwitchCheck3"
                                                      defaultChecked
                                                    />
                                                    <Label
                                                      className="form-check-label"
                                                      for="SwitchCheck3">
                                                      Active
                                                    </Label>
                                                  </div>
                                                  <a
                                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                                    href="javascript:void(0)">
                                                    <i class="ri-pencil-fill fs-16"></i>
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="py-3">
                                            <Row className="gy-3">
                                              <Col xs={6}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Status
                                                  </p>
                                                  <div
                                                    className={
                                                      "fs-12 badge bg-success-subtle"
                                                    }>
                                                    Status...
                                                  </div>
                                                </div>
                                              </Col>
                                              <Col xs={6}>
                                                <div>
                                                  <p className="text-muted mb-1">
                                                    Deadline
                                                  </p>
                                                  <h5 className="fs-14">
                                                    18 Sep, 2021
                                                  </h5>
                                                </div>
                                              </Col>
                                            </Row>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    </Col>
                                  </div>
                                </TabPane>
                                <TabPane tabId="2">
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <i className="ri-checkbox-multiple-blank-fill text-success"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      When, while the lovely valley teems with
                                      vapour around me, and the meridian sun
                                      strikes the upper surface of the
                                      impenetrable foliage of my trees, and but
                                      a few stray gleams steal into the inner
                                      sanctuary, I throw myself down among the
                                      tall grass by the trickling stream; and,
                                      as I lie close to the earth, a thousand
                                      unknown.
                                      <div className="mt-2">
                                        <Link
                                          to="#"
                                          className="btn btn-sm btn-soft-primary">
                                          Read More{" "}
                                          <i className="ri-arrow-right-line ms-1 align-middle"></i>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </TabPane>
                                <TabPane tabId="3">
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <i className="ri-checkbox-multiple-blank-fill text-success"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      Etsy mixtape wayfarers, ethical wes
                                      anderson tofu before they sold out
                                      mcsweeney's organic lomo retro fanny pack
                                      lo-fi farm-to-table readymade. Messenger
                                      bag gentrify pitchfork tattooed craft
                                      beer, iphone skateboard locavore carles
                                      etsy salvia banksy hoodie helvetica. DIY
                                      synth PBR banksy irony.
                                      <div className="mt-2">
                                        <Link
                                          to="#"
                                          className="btn btn-sm btn-soft-primary">
                                          Read More{" "}
                                          <i className="ri-arrow-right-line ms-1 align-middle"></i>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </TabPane>
                                <TabPane tabId="4">
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <i className="ri-checkbox-multiple-blank-fill text-success"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      when darkness overspreads my eyes, and
                                      heaven and earth seem to dwell in my soul
                                      and absorb its power, like the form of a
                                      beloved mistress, then I often think with
                                      longing, Oh, would I could describe these
                                      conceptions, could impress upon paper all
                                      that is living so full and warm within me,
                                      that it might be the.
                                      <div className="mt-2">
                                        <Link
                                          to="#"
                                          className="btn btn-sm btn-soft-primary">
                                          Read More{" "}
                                          <i className="ri-arrow-right-line ms-1 align-middle"></i>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </TabPane>
                              </TabContent>
                            </Col>
                          </Row>
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
