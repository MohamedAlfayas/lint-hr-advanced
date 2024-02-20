import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  Progress,
  Row,
  TabContent,
  TabPane,
  Table,
  UncontrolledCollapse,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { gender_options } from "../../common/constant/Constants";

const EmployeeOverview = (props) => {
  SwiperCore.use([Autoplay]);
  const { profileObj } = props;

  const DepartmentData = GetLocalStorageData("department") || [];
  const RoleData = GetLocalStorageData("role") || [];
  const WorkScheduleData = GetLocalStorageData("work_schedule") || [];

  const [activityTab, setActivityTab] = useState("1");
  const toggleActivityTab = (tab) => {
    if (activityTab !== tab) {
      setActivityTab(tab);
    }
  };

  return (
    <div>
      <Row>
        <Col xxl={3} sm={3} md={3} lg={3}>
          <Card>
            <CardBody>
              <h5 className="card-title mb-5">Complete Your Profile</h5>
              <Progress
                value={30}
                color="primary"
                className="animated-progess custom-progress progress-label"
              >
                <div className="label">30%</div>{" "}
              </Progress>
            </CardBody>
          </Card>

          <Card>
            <div
              style={{
                height: "400px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "transparent transparent",
              }}
            >
              <CardBody>
                <h5 className="card-title mb-3">Info</h5>
                <div className="table-responsive">
                  <Table className="table-borderless mb-0">
                    <tbody>
                      <tr>
                        <th
                          className="ps-0"
                          scope="row"
                          style={{ width: "120px" }}
                        >
                          Name :
                        </th>
                        <td className="text-muted">
                          {" "}
                          {profileObj?.fname} {profileObj?.lname}
                        </td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          ID:
                        </th>
                        <td className="text-muted"> {profileObj?.emp_id}</td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Mobile :
                        </th>
                        <td className="text-muted">
                          {profileObj?.contact_number}
                        </td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          E-mail :
                        </th>
                        <td className="text-muted">{profileObj?.email}</td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Gender :
                        </th>
                        <td className="text-muted">
                          {profileObj?.gender
                            ? gender_options.length
                              ? gender_options.find(
                                  (d) => d.id === profileObj?.gender
                                )?.label
                              : ""
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          DOB :
                        </th>
                        <td className="text-muted">{profileObj?.dob}</td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Branch :
                        </th>
                        <td className="text-muted">{profileObj?.email}</td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Department :
                        </th>
                        <td className="text-muted">
                          {profileObj?.primary_department_id_list
                            ? profileObj.primary_department_id_list
                                .map(
                                  (deptId) =>
                                    DepartmentData.find(
                                      (dept) => dept.id === deptId
                                    )?.name
                                )
                                .join(" / ")
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Role :
                        </th>
                        <td className="text-muted">
                          {profileObj?.role_id
                            ? RoleData.length
                              ? RoleData.find(
                                  (d) => d.id === profileObj?.role_id
                                )?.name
                              : ""
                            : ""}
                        </td>
                      </tr>

                      <tr>
                        <th className="ps-0" scope="row">
                          Work Schedule :
                        </th>
                        <td className="text-muted">
                          {profileObj?.work_schedule_id
                            ? WorkScheduleData.length
                              ? WorkScheduleData.find(
                                  (d) => d.id === profileObj?.work_schedule_id
                                )?.name
                              : ""
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <th className="ps-0" scope="row">
                          Joining Date :
                        </th>
                        <td className="text-muted">
                          {profileObj?.joining_date}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </div>
          </Card>

          <Card>
            <CardBody>
              <h5 className="card-title mb-4">Portfolio</h5>
              <div className="d-flex flex-wrap gap-2">
                <div>
                  <Link to="#" className="avatar-xs d-block">
                    <span className="avatar-title rounded-circle fs-16 bg-body text-body">
                      <i className="ri-github-fill"></i>
                    </span>
                  </Link>
                </div>
                <div>
                  <Link to="#" className="avatar-xs d-block">
                    <span className="avatar-title rounded-circle fs-16 bg-primary-subtle text-primary">
                      <i className="ri-global-fill"></i>
                    </span>
                  </Link>
                </div>
                <div>
                  <Link to="#" className="avatar-xs d-block">
                    <span className="avatar-title rounded-circle fs-16 bg-danger-subtle text-danger">
                      <i className="ri-dribbble-fill"></i>
                    </span>
                  </Link>
                </div>
                <div>
                  <Link to="#" className="avatar-xs d-block">
                    <span className="avatar-title rounded-circle fs-16 bg-success-subtle text-success">
                      <i className="ri-pinterest-fill"></i>
                    </span>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h5 className="card-title mb-4">Skills</h5>
              <div className="d-flex flex-wrap gap-2 fs-15">
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  Photoshop
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  illustrator
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  HTML
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  CSS
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  Javascript
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  Php
                </Link>
                <Link
                  to="#"
                  className="badge bg-secondary-subtle text-secondary"
                >
                  Python
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="d-flex align-items-center mb-4">
                <div className="flex-grow-1">
                  <h5 className="card-title mb-0">Suggestions</h5>
                </div>
                <div className="flex-shrink-0">
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="a"
                      id="dropdownMenuLink2"
                      role="button"
                    >
                      <i className="ri-more-2-fill fs-14"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>View</DropdownItem>
                      <DropdownItem>Edit</DropdownItem>
                      <DropdownItem>Delete</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </div>
              <div>
                <div className="d-flex align-items-center py-3">
                  <div className="avatar-xs flex-shrink-0 me-3">
                    <img src={""} alt="" className="img-fluid rounded-circle" />
                  </div>
                  <div className="flex-grow-1">
                    <div>
                      <h5 className="fs-14 mb-1">Esther James</h5>
                      <p className="fs-13 text-muted mb-0">
                        Frontend Developer
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="ri-user-add-line align-middle"></i>
                    </button>
                  </div>
                </div>
                <div className="d-flex align-items-center py-3">
                  <div className="avatar-xs flex-shrink-0 me-3">
                    <img src={""} alt="" className="img-fluid rounded-circle" />
                  </div>
                  <div className="flex-grow-1">
                    <div>
                      <h5 className="fs-14 mb-1">Jacqueline Steve</h5>
                      <p className="fs-13 text-muted mb-0">UI/UX Designer</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="ri-user-add-line align-middle"></i>
                    </button>
                  </div>
                </div>
                <div className="d-flex align-items-center py-3">
                  <div className="avatar-xs flex-shrink-0 me-3">
                    <img src={""} alt="" className="img-fluid rounded-circle" />
                  </div>
                  <div className="flex-grow-1">
                    <div>
                      <h5 className="fs-14 mb-1">George Whalen</h5>
                      <p className="fs-13 text-muted mb-0">Backend Developer</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="ri-user-add-line align-middle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="d-flex align-items-center mb-4">
                <div className="flex-grow-1">
                  <h5 className="card-title mb-0">Popular Posts</h5>
                </div>
                <div className="flex-shrink-0">
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="a"
                      id="dropdownMenuLink1"
                      role="button"
                    >
                      <i className="ri-more-2-fill fs-14"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>View</DropdownItem>
                      <DropdownItem>Edit</DropdownItem>
                      <DropdownItem>Delete</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img src={""} alt="" height="50" className="rounded" />
                </div>
                <div className="flex-grow-1 ms-3 overflow-hidden">
                  <Link to="#">
                    <h6 className="text-truncate fs-14">
                      Design your apps in your own way
                    </h6>
                  </Link>
                  <p className="text-muted mb-0">15 Dec 2021</p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img src={""} alt="" height="50" className="rounded" />
                </div>
                <div className="flex-grow-1 ms-3 overflow-hidden">
                  <Link to="#">
                    <h6 className="text-truncate fs-14">
                      Smartest Applications for Business
                    </h6>
                  </Link>
                  <p className="text-muted mb-0">28 Nov 2021</p>
                </div>
              </div>
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <img src={""} alt="" height="50" className="rounded" />
                </div>
                <div className="flex-grow-1 ms-3 overflow-hidden">
                  <Link to="#">
                    <h6 className="text-truncate fs-14">
                      How to get creative in your work
                    </h6>
                  </Link>
                  <p className="text-muted mb-0">21 Nov 2021</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xxl={9} sm={9} md={9} lg={9}>
          <Card>
            <CardBody>
              <h5 className="card-title mb-3">About</h5>
              <p>
                Hi I'm Anna Adame, It will be as simple as Occidental; in fact,
                it will be Occidental. To an English person, it will seem like
                simplified English, as a skeptical Cambridge friend of mine told
                me what Occidental is European languages are members of the same
                family.
              </p>
              <p>
                You always want to make sure that your fonts work well together
                and try to limit the number of fonts you use to three or less.
                Experiment and play around with the fonts that you already have
                in the software you’re working with reputable font websites.
                This may be the most commonly encountered tip I received from
                the designers I spoke with. They highly encourage that you use
                different fonts in one design, but do not over-exaggerate and go
                overboard.
              </p>
              <Row>
                <Col xs={6} md={6}>
                  <div className="d-flex mt-4">
                    <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                      <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                        <i className="ri-user-2-fill"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="mb-1">Designation :</p>
                      <h6 className="text-truncate mb-0">
                        {profileObj?.role_id
                          ? RoleData.length
                            ? RoleData.find((d) => d.id === profileObj?.role_id)
                                ?.name
                            : ""
                          : ""}{" "}
                        /{" "}
                        {profileObj?.primary_department_id_list
                          ? profileObj.primary_department_id_list
                              .map(
                                (deptId) =>
                                  DepartmentData.find(
                                    (dept) => dept.id === deptId
                                  )?.name
                              )
                              .join(" / ")
                          : ""}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col xs={6} md={4}>
                  <div className="d-flex mt-4">
                    <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                      <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                        <i className="ri-global-line"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="mb-1">Website :</p>
                      <Link to="#" className="fw-semibold">
                        www.velzon.com
                      </Link>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Row>
            <Col lg={12}>
              <Card>
                <div
                  style={{
                    height: "400px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                  }}
                >
                  <CardHeader className="align-items-center d-flex">
                    <h4 className="card-title mb-0  me-2">Recent Activity</h4>
                    <div className="flex-shrink-0 ms-auto">
                      <Nav
                        className="justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0"
                        role="tablist"
                      >
                        <NavItem>
                          <NavLink
                            href="#"
                            className={classnames({
                              active: activityTab === "1",
                            })}
                            onClick={() => {
                              toggleActivityTab("1");
                            }}
                          >
                            Today
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            href="#"
                            className={classnames({
                              active: activityTab === "2",
                            })}
                            onClick={() => {
                              toggleActivityTab("2");
                            }}
                          >
                            Last 7 Days
                          </NavLink>
                        </NavItem>
                        <NavItem className="nav-item">
                          <NavLink
                            href="#"
                            className={classnames({
                              active: activityTab === "3",
                            })}
                            onClick={() => {
                              toggleActivityTab("3");
                            }}
                          >
                            Last 30 Days
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={activityTab} className="text-muted">
                      <TabPane tabId="1">
                        <div className="profile-timeline">
                          <div></div>
                          <div
                            className="accordion accordion-flush"
                            id="todayExample"
                          >
                            <div className="accordion-item border-0">
                              <div className="accordion-header">
                                <button
                                  className="accordion-button p-2 shadow-none"
                                  type="button"
                                  id="headingOne"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Jacqueline Steve
                                      </h6>
                                      <small className="text-muted">
                                        We has changed 2 attributes on 05:16PM
                                      </small>
                                    </div>
                                  </div>
                                </button>
                              </div>
                              <UncontrolledCollapse
                                className="accordion-collapse"
                                toggler="#headingOne"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  In an awareness campaign, it is vital for
                                  people to begin put 2 and 2 together and begin
                                  to recognize your cause. Too much or too
                                  little spacing, as in the example below, can
                                  make things unpleasant for the reader. The
                                  goal is to make your text as comfortable to
                                  read as possible. A wonderful serenity has
                                  taken possession of my entire soul, like these
                                  sweet mornings of spring which I enjoy with my
                                  whole heart.
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="headingTwo">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapseTwo"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0 avatar-xs">
                                      <div className="avatar-title bg-light text-success rounded-circle">
                                        M
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Megan Elmore
                                      </h6>
                                      <small className="text-muted">
                                        Adding a new event with attachments -
                                        04:45PM
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="collapseTwo"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  <Row className="g-2">
                                    <div className="col-auto">
                                      <div className="d-flex border border-dashed p-2 rounded position-relative">
                                        <div className="flex-shrink-0">
                                          <i className="ri-image-2-line fs-17 text-secondary"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                          <h6>
                                            <Link
                                              to="#"
                                              className="stretched-link"
                                            >
                                              Business Template - UI/UX design
                                            </Link>
                                          </h6>
                                          <small>685 KB</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-auto">
                                      <div className="d-flex border border-dashed p-2 rounded position-relative">
                                        <div className="flex-shrink-0">
                                          <i className="ri-file-zip-line fs-17 text-secondary"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                          <h6>
                                            <Link
                                              to="#"
                                              className="stretched-link"
                                            >
                                              Bank Management System - PSD
                                            </Link>
                                          </h6>
                                          <small>8.78 MB</small>
                                        </div>
                                      </div>
                                    </div>
                                  </Row>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div
                                className="accordion-header"
                                id="headingThree"
                              >
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        New ticket received
                                      </h6>
                                      <small className="text-muted mb-2">
                                        User
                                        <span className="text-secondary">
                                          Erica245
                                        </span>
                                        submitted a ticket - 02:33PM
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                            <div className="accordion-item border-0">
                              <div
                                className="accordion-header"
                                id="headingFour"
                              >
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapseFour"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0 avatar-xs">
                                      <div className="avatar-title bg-light text-muted rounded-circle">
                                        <i className="ri-user-3-fill"></i>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Nancy Martino
                                      </h6>
                                      <small className="text-muted">
                                        Commented on 12:57PM
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="collapseFour"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  " A wonderful serenity has taken possession of
                                  my entire soul, like these sweet mornings of
                                  spring which I enjoy with my whole heart. Each
                                  design is a new, unique piece of art birthed
                                  into this world, and while you have the
                                  opportunity to be creative and make your own
                                  style choices. "
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div
                                className="accordion-header"
                                id="headingFive"
                              >
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapseFive"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Lewis Arnold
                                      </h6>
                                      <small className="text-muted">
                                        Create new project buildng product -
                                        10:05AM
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="collapseFive"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  <p className="text-muted mb-2">
                                    Every team project can have a velzon. Use
                                    the velzon to share information with your
                                    team to understand and contribute to your
                                    project.
                                  </p>
                                  <div className="avatar-group">
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="Christi"
                                    >
                                      <img
                                        src={""}
                                        alt=""
                                        className="rounded-circle avatar-xs"
                                      />
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="Frank Hook"
                                    >
                                      <img
                                        src={""}
                                        alt=""
                                        className="rounded-circle avatar-xs"
                                      />
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title=" Ruby"
                                    >
                                      <div className="avatar-xs">
                                        <div className="avatar-title rounded-circle bg-light text-primary">
                                          R
                                        </div>
                                      </div>
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="more"
                                    >
                                      <div className="avatar-xs">
                                        <div className="avatar-title rounded-circle">
                                          2+
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId="2">
                        <div className="profile-timeline">
                          <div
                            className="accordion accordion-flush"
                            id="weeklyExample"
                          >
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading6">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse6"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Joseph Parker
                                      </h6>
                                      <small className="text-muted">
                                        New people joined with our company -
                                        Yesterday
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse6"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  It makes a statement, it’s impressive graphic
                                  design. Increase or decrease the letter
                                  spacing depending on the situation and try,
                                  try again until it looks right, and each
                                  letter has the perfect spot of its own.
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading7">
                                <Link
                                  className="accordion-button p-2 shadow-none"
                                  data-bs-toggle="collapse"
                                  to="#collapse7"
                                  aria-expanded="false"
                                >
                                  <div className="d-flex">
                                    <div className="avatar-xs">
                                      <div className="avatar-title rounded-circle bg-light text-danger">
                                        <i className="ri-shopping-bag-line"></i>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Your order is placed{" "}
                                        <span className="badge bg-success-subtle text-success align-middle">
                                          Completed
                                        </span>
                                      </h6>
                                      <small className="text-muted">
                                        These customers can rest assured their
                                        order has been placed - 1 week Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading8">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse8"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0 avatar-xs">
                                      <div className="avatar-title bg-light text-success rounded-circle">
                                        <i className="ri-home-3-line"></i>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Velzon admin dashboard templates layout
                                        upload
                                      </h6>
                                      <small className="text-muted">
                                        We talked about a project on linkedin -
                                        1 week Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse8"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5 fst-italic">
                                  Powerful, clean & modern responsive bootstrap
                                  5 admin template. The maximum file size for
                                  uploads in this demo :
                                  <Row className="mt-2">
                                    <Col xxl={6}>
                                      <Row className="border border-dashed gx-2 p-2">
                                        <Col xs={3}>
                                          <img
                                            src={""}
                                            alt=""
                                            className="img-fluid rounded"
                                          />
                                        </Col>

                                        <Col xs={3}>
                                          <img
                                            src={""}
                                            alt=""
                                            className="img-fluid rounded"
                                          />
                                        </Col>

                                        <Col xs={3}>
                                          <img
                                            src={""}
                                            alt=""
                                            className="img-fluid rounded"
                                          />
                                        </Col>

                                        <Col xs={3}>
                                          <img
                                            src={""}
                                            alt=""
                                            className="img-fluid rounded"
                                          />
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading9">
                                <Link
                                  className="accordion-button p-2 shadow-none"
                                  data-bs-toggle="collapse"
                                  to="#collapse9"
                                  aria-expanded="false"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        New ticket created{" "}
                                        <span className="badge bg-info-subtle text-info align-middle">
                                          Inprogress
                                        </span>
                                      </h6>
                                      <small className="text-muted mb-2">
                                        User
                                        <span className="text-secondary">
                                          Jack365
                                        </span>
                                        submitted a ticket - 2 week Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading10">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse10"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Jennifer Carter
                                      </h6>
                                      <small className="text-muted">
                                        Commented - 4 week Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse10"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  <p className="text-muted fst-italic mb-2">
                                    " This is an awesome admin dashboard
                                    template. It is extremely well structured
                                    and uses state of the art components (e.g.
                                    one of the only templates using boostrap
                                    5.1.3 so far). I integrated it into a Rails
                                    6 project. Needs manual integration work of
                                    course but the template structure made it
                                    easy. "
                                  </p>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId="3">
                        <div className="profile-timeline">
                          <div
                            className="accordion accordion-flush"
                            id="monthlyExample"
                          >
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading11">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse11"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0 avatar-xs">
                                      <div className="avatar-title bg-light text-success rounded-circle">
                                        M
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Megan Elmore
                                      </h6>
                                      <small className="text-muted">
                                        Adding a new event with attachments - 1
                                        month Ago.
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse11"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  <div className="row g-2">
                                    <div className="col-auto">
                                      <div className="d-flex border border-dashed p-2 rounded position-relative">
                                        <div className="flex-shrink-0">
                                          <i className="ri-image-2-line fs-17 text-danger"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                          <h6>
                                            <Link
                                              to="#"
                                              className="stretched-link"
                                            >
                                              Business Template - UI/UX design
                                            </Link>
                                          </h6>
                                          <small>685 KB</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-auto">
                                      <div className="d-flex border border-dashed p-2 rounded position-relative">
                                        <div className="flex-shrink-0">
                                          <i className="ri-file-zip-line fs-17 text-secondary"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                          <h6>
                                            <Link
                                              to="#"
                                              className="stretched-link"
                                            >
                                              Bank Management System - PSD
                                            </Link>
                                          </h6>
                                          <small>8.78 MB</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-auto">
                                      <div className="d-flex border border-dashed p-2 rounded position-relative">
                                        <div className="flex-shrink-0">
                                          <i className="ri-file-zip-line fs-17 text-info"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                          <h6>
                                            <Link
                                              to="#"
                                              className="stretched-link"
                                            >
                                              Bank Management System - PSD
                                            </Link>
                                          </h6>
                                          <small>8.78 MB</small>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading12">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse12"
                                  aria-expanded="true"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Jacqueline Steve
                                      </h6>
                                      <small className="text-muted">
                                        We has changed 2 attributes on 3 month
                                        Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="collapse12"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  In an awareness campaign, it is vital for
                                  people to begin put 2 and 2 together and begin
                                  to recognize your cause. Too much or too
                                  little spacing, as in the example below, can
                                  make things unpleasant for the reader. The
                                  goal is to make your text as comfortable to
                                  read as possible. A wonderful serenity has
                                  taken possession of my entire soul, like these
                                  sweet mornings of spring which I enjoy with my
                                  whole heart.
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading13">
                                <Link
                                  className="accordion-button p-2 shadow-none"
                                  data-bs-toggle="collapse"
                                  to="#collapse13"
                                  aria-expanded="false"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        New ticket received
                                      </h6>
                                      <small className="text-muted mb-2">
                                        User
                                        <span className="text-secondary">
                                          Erica245
                                        </span>
                                        submitted a ticket - 5 month Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading14">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse14"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0 avatar-xs">
                                      <div className="avatar-title bg-light text-muted rounded-circle">
                                        <i className="ri-user-3-fill"></i>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Nancy Martino
                                      </h6>
                                      <small className="text-muted">
                                        Commented on 24 Nov, 2021.
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse14"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5 fst-italic">
                                  " A wonderful serenity has taken possession of
                                  my entire soul, like these sweet mornings of
                                  spring which I enjoy with my whole heart. Each
                                  design is a new, unique piece of art birthed
                                  into this world, and while you have the
                                  opportunity to be creative and make your own
                                  style choices. "
                                </div>
                              </UncontrolledCollapse>
                            </div>
                            <div className="accordion-item border-0">
                              <div className="accordion-header" id="heading15">
                                <Link
                                  to="#"
                                  className="accordion-button p-2 shadow-none"
                                  id="collapse15"
                                >
                                  <div className="d-flex">
                                    <div className="flex-shrink-0">
                                      <img
                                        src={""}
                                        alt=""
                                        className="avatar-xs rounded-circle"
                                      />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                      <h6 className="fs-14 mb-1">
                                        Lewis Arnold
                                      </h6>
                                      <small className="text-muted">
                                        Create new project buildng product - 8
                                        month Ago
                                      </small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                              <UncontrolledCollapse
                                toggler="#collapse15"
                                className="accordion-collapse collapse"
                                defaultOpen
                              >
                                <div className="accordion-body ms-2 ps-5">
                                  <p className="text-muted mb-2">
                                    Every team project can have a velzon. Use
                                    the velzon to share information with your
                                    team to understand and contribute to your
                                    project.
                                  </p>
                                  <div className="avatar-group">
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="Christi"
                                    >
                                      <img
                                        src={""}
                                        alt=""
                                        className="rounded-circle avatar-xs"
                                      />
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="Frank Hook"
                                    >
                                      <img
                                        src={""}
                                        alt=""
                                        className="rounded-circle avatar-xs"
                                      />
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title=" Ruby"
                                    >
                                      <div className="avatar-xs">
                                        <div className="avatar-title rounded-circle bg-light text-primary">
                                          R
                                        </div>
                                      </div>
                                    </Link>
                                    <Link
                                      to="#"
                                      className="avatar-group-item"
                                      data-bs-toggle="tooltip"
                                      data-bs-trigger="hover"
                                      data-bs-placement="top"
                                      title=""
                                      data-bs-original-title="more"
                                    >
                                      <div className="avatar-xs">
                                        <div className="avatar-title rounded-circle">
                                          2+
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </UncontrolledCollapse>
                            </div>
                          </div>
                        </div>
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </div>
              </Card>
            </Col>
          </Row>

          <Card>
            <CardBody>
              <h5 className="card-title">Projects</h5>
              <div className="d-flex justify-content-end gap-2 mb-2">
                <div className="slider-button-prev">
                  <div className="avatar-title fs-18 rounded px-1">
                    <i className="ri-arrow-left-s-line"></i>
                  </div>
                </div>
                <div className="slider-button-next">
                  <div className="avatar-title fs-18 rounded px-1">
                    <i className="ri-arrow-right-s-line"></i>
                  </div>
                </div>
              </div>
              <Swiper
                className="project-swiper"
                slidesPerView={3}
                spaceBetween={20}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
              >
                <div className="swiper-wrapper">
                  <SwiperSlide>
                    <Card className="profile-project-card shadow-none profile-project-primary mb-0">
                      <CardBody className="p-4">
                        <div className="d-flex">
                          <div className="flex-grow-1 text-muted overflow-hidden">
                            <h5 className="fs-14 text-truncate mb-1">
                              <Link to="#" className="text-dark">
                                ABC Project Customization
                              </Link>
                            </h5>
                            <p className="text-muted text-truncate mb-0">
                              Last Update :{" "}
                              <span className="fw-semibold text-dark">
                                4 hr Ago
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="badge bg-warning-subtle text-warning fs-10">
                              Inprogress
                            </div>
                          </div>
                        </div>
                        <div className="d-flex mt-4">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <h5 className="fs-12 text-muted mb-0">
                                  Members :
                                </h5>
                              </div>
                              <div className="avatar-group">
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <div className="avatar-title rounded-circle bg-light text-primary">
                                      A
                                    </div>
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>

                  <SwiperSlide>
                    <Card className="profile-project-card shadow-none profile-project-success mb-0">
                      <CardBody className="p-4">
                        <div className="d-flex">
                          <div className="flex-grow-1 text-muted overflow-hidden">
                            <h5 className="fs-14 text-truncate mb-1">
                              <Link to="#" className="text-dark">
                                Client - John
                              </Link>
                            </h5>
                            <p className="text-muted text-truncate mb-0">
                              Last Update :{" "}
                              <span className="fw-semibold text-dark">
                                1 hr Ago
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="badge bg-success-subtle text-success fs-10">
                              Completed
                            </div>
                          </div>
                        </div>
                        <div className="d-flex mt-4">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <h5 className="fs-12 text-muted mb-0">
                                  Members :
                                </h5>
                              </div>
                              <div className="avatar-group">
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <div className="avatar-title rounded-circle bg-light text-primary">
                                      C
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                  <SwiperSlide>
                    <Card className="profile-project-card shadow-none profile-project-primary mb-0">
                      <CardBody className="p-4">
                        <div className="d-flex">
                          <div className="flex-grow-1 text-muted overflow-hidden">
                            <h5 className="fs-14 text-truncate mb-1">
                              <Link to="#" className="text-dark">
                                Brand logo Design
                              </Link>
                            </h5>
                            <p className="text-muted text-truncate mb-0">
                              Last Update :{" "}
                              <span className="fw-semibold text-dark">
                                2 hr Ago
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="badge bg-warning-subtle text-warning fs-10">
                              Inprogress
                            </div>
                          </div>
                        </div>
                        <div className="d-flex mt-4">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <h5 className="fs-12 text-muted mb-0">
                                  Members :
                                </h5>
                              </div>
                              <div className="avatar-group">
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                  <SwiperSlide>
                    <Card className="profile-project-card shadow-none profile-project-success mb-0">
                      <CardBody className="p-4">
                        <div className="d-flex">
                          <div className="flex-grow-1 text-muted overflow-hidden">
                            <h5 className="fs-14 text-truncate mb-1">
                              <Link to="#" className="text-dark">
                                Project update
                              </Link>
                            </h5>
                            <p className="text-muted text-truncate mb-0">
                              Last Update :{" "}
                              <span className="fw-semibold text-dark">
                                4 hr Ago
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="badge bg-success-subtle text-success fs-10">
                              Completed
                            </div>
                          </div>
                        </div>

                        <div className="d-flex mt-4">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <h5 className="fs-12 text-muted mb-0">
                                  Members :
                                </h5>
                              </div>
                              <div className="avatar-group">
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>

                  <SwiperSlide>
                    <Card className="profile-project-card shadow-none profile-project-primary mb-0">
                      <CardBody className="p-4">
                        <div className="d-flex">
                          <div className="flex-grow-1 text-muted overflow-hidden">
                            <h5 className="fs-14 text-truncate mb-1">
                              <Link to="#" className="text-dark">
                                Chat App
                              </Link>
                            </h5>
                            <p className="text-muted text-truncate mb-0">
                              Last Update :{" "}
                              <span className="fw-semibold text-dark">
                                1 hr Ago
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="badge bg-warning-subtle text-warning fs-10">
                              Inprogress
                            </div>
                          </div>
                        </div>

                        <div className="d-flex mt-4">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <h5 className="fs-12 text-muted mb-0">
                                  Members :
                                </h5>
                              </div>
                              <div className="avatar-group">
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <img
                                      src={""}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    />
                                  </div>
                                </div>
                                <div className="avatar-group-item">
                                  <div className="avatar-xs">
                                    <div className="avatar-title rounded-circle bg-light text-primary">
                                      A
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                </div>
              </Swiper>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeOverview;
