import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
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
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Row,
  TabContent,
  Table,
  TabPane,
  UncontrolledCollapse,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";

const EmployeeView = () => {
  document.title = "Profile | Velzon - React Admin & Dashboard Template";

  SwiperCore.use([Autoplay]);

  const [activeTab, setActiveTab] = useState("1");
  const [activityTab, setActivityTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const toggleActivityTab = (tab) => {
    if (activityTab !== tab) {
      setActivityTab(tab);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="profile-foreground position-relative mx-n4 mt-n4">
            <div className="profile-wid-bg">
              <img
                src="https://themes.themesbrand.com/velzon/react/default/static/media/profile-bg.9adf95fb1ea25aaaf8df.jpg"
                alt=""
                className="profile-wid-img"
              />
            </div>
          </div>
          <div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
            <Row className="g-4">
              <div className="col-auto">
                <div className="avatar-lg">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
                    alt="Available"
                    className="avatar-lg img-thumbnail rounded-circle mx-auto border-success"
                  />
                </div>
              </div>

              <Col>
                <div className="p-2">
                  <h3 className="text-white mb-1">Kathir</h3>
                  <p className="text-white text-opacity-75">Developer</p>
                  <div className="hstack text-white-50 gap-1">
                    <div className="me-2">
                      <i className="ri-at-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      <Link to="mailto:Kathir@lc.com" className="link-light">
                        Kathir@lc.com
                      </Link>{" "}
                    </div>
                    <div>
                      <i className="ri-phone-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      <Link to="tel:+91 9999999999" className="link-light">
                        +91 9999999999
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col lg={12}>
              <div>
                <div className="d-flex">
                  <Nav
                    pills
                    className="animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
                    role="tablist">
                    <NavItem className="fs-14">
                      <NavLink
                        href="#overview-tab"
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          toggleTab("1");
                        }}>
                        <i className="ri-airplay-fill d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Overview
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        href="#attendance"
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          toggleTab("2");
                        }}>
                        <i className="ri-list-unordered d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Attendance
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        href="#payroll"
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          toggleTab("3");
                        }}>
                        <i className="ri-price-tag-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Payroll
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        href="#documents"
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => {
                          toggleTab("4");
                        }}>
                        <i className="ri-folder-4-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Documents
                        </span>
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <div className="flex-shrink-0">
                    <Link
                      to="/pages-profile-settings"
                      className="btn btn-success">
                      <i className="ri-edit-box-line align-bottom"></i> Account
                      Settings
                    </Link>
                  </div>
                </div>

                <TabContent activeTab={activeTab} className="pt-4">
                  <TabPane tabId="1">
                    <Card>
                      <CardBody>
                        <div className="d-flex align-items-center mb-4">
                          <h5 className="card-title flex-grow-1 mb-0">
                            Documents
                          </h5>
                          <div className="flex-shrink-0">
                            <Input
                              className="form-control d-none"
                              type="file"
                              id="formFile"
                            />
                            <Label
                              htmlFor="formFile"
                              className="btn btn-danger">
                              <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                              Upload File
                            </Label>
                          </div>
                        </div>
                        <Row>
                          <Col lg={12}>
                            <div className="table-responsive">
                              <Table className="table-borderless align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col">File Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Upload Date</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr key="1">
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar-sm">
                                          <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                            <i className="ri-image-2-fill"></i>
                                          </div>
                                        </div>
                                        <div className="ms-3 flex-grow-1">
                                          <h6 className="fs-15 mb-0">
                                            <Link to="#">Passport</Link>
                                          </h6>
                                        </div>
                                      </div>
                                    </td>
                                    <td>PNG File </td>
                                    <td>879 KB</td>
                                    <td>02 Nov 2021</td>
                                    <td>
                                      <UncontrolledDropdown direction="start">
                                        <DropdownToggle
                                          tag="a"
                                          className="btn btn-light btn-icon"
                                          id="dropdownMenuLink15"
                                          role="button">
                                          <i className="ri-equalizer-fill"></i>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem>
                                            <i className="ri-eye-fill me-2 align-middle text-muted" />
                                            View
                                          </DropdownItem>
                                          <DropdownItem>
                                            <i className="ri-download-2-fill me-2 align-middle text-muted" />
                                            Download
                                          </DropdownItem>
                                          <DropdownItem divider />
                                          <DropdownItem>
                                            <i className="ri-delete-bin-5-line me-2 align-middle text-muted" />
                                            Delete
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                            <div className="text-center mt-3">
                              <Link to="#" className="text-success ">
                                <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                Load more{" "}
                              </Link>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </TabPane>
                  <TabPane tabId="2">
                    <Card>
                      <CardBody>
                        <div className="d-flex align-items-center mb-4">
                          <h5 className="card-title flex-grow-1 mb-0">
                            Documents
                          </h5>
                          <div className="flex-shrink-0">
                            <Input
                              className="form-control d-none"
                              type="file"
                              id="formFile"
                            />
                            <Label
                              htmlFor="formFile"
                              className="btn btn-danger">
                              <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                              Upload File
                            </Label>
                          </div>
                        </div>
                        <Row>
                          <Col lg={12}>
                            <div className="table-responsive">
                              <Table className="table-borderless align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col">File Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Upload Date</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr key="1">
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar-sm">
                                          <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                            <i className="ri-image-2-fill"></i>
                                          </div>
                                        </div>
                                        <div className="ms-3 flex-grow-1">
                                          <h6 className="fs-15 mb-0">
                                            <Link to="#">Passport</Link>
                                          </h6>
                                        </div>
                                      </div>
                                    </td>
                                    <td>PNG File </td>
                                    <td>879 KB</td>
                                    <td>02 Nov 2021</td>
                                    <td>
                                      <UncontrolledDropdown direction="start">
                                        <DropdownToggle
                                          tag="a"
                                          className="btn btn-light btn-icon"
                                          id="dropdownMenuLink15"
                                          role="button">
                                          <i className="ri-equalizer-fill"></i>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem>
                                            <i className="ri-eye-fill me-2 align-middle text-muted" />
                                            View
                                          </DropdownItem>
                                          <DropdownItem>
                                            <i className="ri-download-2-fill me-2 align-middle text-muted" />
                                            Download
                                          </DropdownItem>
                                          <DropdownItem divider />
                                          <DropdownItem>
                                            <i className="ri-delete-bin-5-line me-2 align-middle text-muted" />
                                            Delete
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                            <div className="text-center mt-3">
                              <Link to="#" className="text-success ">
                                <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                Load more{" "}
                              </Link>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </TabPane>

                  <TabPane tabId="3">
                    <Card>
                      <CardBody>
                        <div className="d-flex align-items-center mb-4">
                          <h5 className="card-title flex-grow-1 mb-0">
                            Documents
                          </h5>
                          <div className="flex-shrink-0">
                            <Input
                              className="form-control d-none"
                              type="file"
                              id="formFile"
                            />
                            <Label
                              htmlFor="formFile"
                              className="btn btn-danger">
                              <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                              Upload File
                            </Label>
                          </div>
                        </div>
                        <Row>
                          <Col lg={12}>
                            <div className="table-responsive">
                              <Table className="table-borderless align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col">File Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Upload Date</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr key="1">
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar-sm">
                                          <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                            <i className="ri-image-2-fill"></i>
                                          </div>
                                        </div>
                                        <div className="ms-3 flex-grow-1">
                                          <h6 className="fs-15 mb-0">
                                            <Link to="#">Passport</Link>
                                          </h6>
                                        </div>
                                      </div>
                                    </td>
                                    <td>PNG File </td>
                                    <td>879 KB</td>
                                    <td>02 Nov 2021</td>
                                    <td>
                                      <UncontrolledDropdown direction="start">
                                        <DropdownToggle
                                          tag="a"
                                          className="btn btn-light btn-icon"
                                          id="dropdownMenuLink15"
                                          role="button">
                                          <i className="ri-equalizer-fill"></i>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem>
                                            <i className="ri-eye-fill me-2 align-middle text-muted" />
                                            View
                                          </DropdownItem>
                                          <DropdownItem>
                                            <i className="ri-download-2-fill me-2 align-middle text-muted" />
                                            Download
                                          </DropdownItem>
                                          <DropdownItem divider />
                                          <DropdownItem>
                                            <i className="ri-delete-bin-5-line me-2 align-middle text-muted" />
                                            Delete
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                            <div className="text-center mt-3">
                              <Link to="#" className="text-success ">
                                <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                Load more{" "}
                              </Link>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </TabPane>

                  <TabPane tabId="4">
                    <Card>
                      <CardBody>
                        <div className="d-flex align-items-center mb-4">
                          <h5 className="card-title flex-grow-1 mb-0">
                            Documents
                          </h5>
                          <div className="flex-shrink-0">
                            <Input
                              className="form-control d-none"
                              type="file"
                              id="formFile"
                            />
                            <Label
                              htmlFor="formFile"
                              className="btn btn-danger">
                              <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                              Upload File
                            </Label>
                          </div>
                        </div>
                        <Row>
                          <Col lg={12}>
                            <div className="table-responsive">
                              <Table className="table-borderless align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col">File Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Upload Date</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr key="1">
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar-sm">
                                          <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                            <i className="ri-image-2-fill"></i>
                                          </div>
                                        </div>
                                        <div className="ms-3 flex-grow-1">
                                          <h6 className="fs-15 mb-0">
                                            <Link to="#">Passport</Link>
                                          </h6>
                                        </div>
                                      </div>
                                    </td>
                                    <td>PNG File </td>
                                    <td>879 KB</td>
                                    <td>02 Nov 2021</td>
                                    <td>
                                      <UncontrolledDropdown direction="start">
                                        <DropdownToggle
                                          tag="a"
                                          className="btn btn-light btn-icon"
                                          id="dropdownMenuLink15"
                                          role="button">
                                          <i className="ri-equalizer-fill"></i>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem>
                                            <i className="ri-eye-fill me-2 align-middle text-muted" />
                                            View
                                          </DropdownItem>
                                          <DropdownItem>
                                            <i className="ri-download-2-fill me-2 align-middle text-muted" />
                                            Download
                                          </DropdownItem>
                                          <DropdownItem divider />
                                          <DropdownItem>
                                            <i className="ri-delete-bin-5-line me-2 align-middle text-muted" />
                                            Delete
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                            <div className="text-center mt-3">
                              <Link to="#" className="text-success ">
                                <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                Load more{" "}
                              </Link>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </TabPane>
                </TabContent>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EmployeeView;
