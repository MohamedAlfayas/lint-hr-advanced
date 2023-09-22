import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

//import images
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar10 from "../../assets/images/users/avatar-10.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import image4 from "../../assets/images/small/img-4.jpg";
import image5 from "../../assets/images/small/img-5.jpg";

//SimpleBar
import SimpleBar from "simplebar-react";

const OrgInfoTab = () => {
  return (
    <React.Fragment>
      <Row>
        <Col xl={9} lg={8}>
          <Card>
            <CardBody>
              <div>
                <h6 className="mb-3 fw-semibold text-uppercase">
                  Company Info
                </h6>

                <div className="live-preview">
                  <Row className="gy-4">
                    <Col xxl={3} md={7}>
                      <div>
                        <Label htmlFor="orgwebsite" className="form-label">
                          Company Website
                        </Label>
                        <div className="form-icon right">
                          <Input
                            type="url"
                            className="form-control form-control-icon"
                            id="orgwebsite"
                            placeholder="www.company.com"
                          />
                          <i className="ri-global-line"></i>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Company Website.
                        </div>
                      </div>
                    </Col>

                    <Col xxl={3} md={7}>
                      <div>
                        <Label htmlFor="contactnumber" className="form-label">
                          Contact Number*
                        </Label>
                        <div className="form-icon right">
                          <Input
                            type="number"
                            className="form-control form-control-icon"
                            id="contactnumber"
                            placeholder="999999999"
                          />
                          <i className="ri-phone-line"></i>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Contact number with country code.
                        </div>
                      </div>
                    </Col>

                    <Col xxl={3} md={7}>
                      <div>
                        <Label htmlFor="companyemail" className="form-label">
                          Contact Email*
                        </Label>
                        <div className="form-icon right">
                          <Input
                            type="email"
                            className="form-control form-control-icon"
                            id="companyemail"
                            placeholder="user@company.com"
                          />
                          <i className="ri-mail-line"></i>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Email.
                        </div>
                      </div>
                    </Col>

                    <Col xxl={3} md={7}>
                      <div>
                        <Label
                          htmlFor="exampleFormControlTextarea5"
                          className="form-label">
                          Address
                        </Label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea5"
                          rows="2"></textarea>
                      </div>
                    </Col>

                    <Col xxl={3} md={7}>
                      <div>
                        <Label
                          htmlFor="exampleFormControlTextarea5"
                          className="form-label">
                          Country
                        </Label>
                        <select class="form-select mb-3" aria-label="Default select example">
                            <option selected>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                      </div>
                    </Col>

                    <Col xxl={3} md={7}>
                      <div>
                        <Label
                          htmlFor="exampleFormControlTextarea5"
                          className="form-label">
                          Company Overview
                        </Label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea5"
                          rows="3"></textarea>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="pt-3 border-top border-top-dashed mt-4">
                  <h6 className="mb-3 fw-semibold text-uppercase">Logo</h6>
                  <Row className="g-3">
                    <Col xxl={4} lg={6}>
                      <div className="border rounded border-dashed p-2">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar-sm">
                              <div className="avatar-title bg-light text-secondary rounded fs-24">
                                <i className="ri-folder-zip-line"></i>
                              </div>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <h5 className="fs-13 mb-1">
                              <Link
                                to="#"
                                className="text-body text-truncate d-block">
                                App pages.zip
                              </Link>
                            </h5>
                            <div>2.2MB</div>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-icon text-muted btn-sm fs-18">
                                <i className="ri-download-2-line"></i>
                              </button>
                              <UncontrolledDropdown>
                                <DropdownToggle
                                  tag="button"
                                  className="btn btn-icon text-muted btn-sm fs-18 dropdown">
                                  <i className="ri-more-fill"></i>
                                </DropdownToggle>
                                <DropdownMenu>
                                  <li>
                                    <DropdownItem>
                                      <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                      Rename
                                    </DropdownItem>
                                  </li>
                                  <li>
                                    <DropdownItem>
                                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                      Delete
                                    </DropdownItem>
                                  </li>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xxl={4} lg={6}>
                      <div className="border rounded border-dashed p-2">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar-sm">
                              <div className="avatar-title bg-light text-secondary rounded fs-24">
                                <i className="ri-file-ppt-2-line"></i>
                              </div>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <h5 className="fs-13 mb-1">
                              <Link
                                to="#"
                                className="text-body text-truncate d-block">
                                Velzon admin.ppt
                              </Link>
                            </h5>
                            <div>2.4MB</div>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-icon text-muted btn-sm fs-18">
                                <i className="ri-download-2-line"></i>
                              </button>
                              <UncontrolledDropdown>
                                <DropdownToggle
                                  tag="button"
                                  className="btn btn-icon text-muted btn-sm fs-18 dropdown">
                                  <i className="ri-more-fill"></i>
                                </DropdownToggle>
                                <DropdownMenu>
                                  <li>
                                    <DropdownItem>
                                      <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                      Rename
                                    </DropdownItem>
                                  </li>
                                  <li>
                                    <DropdownItem>
                                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                      Delete
                                    </DropdownItem>
                                  </li>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} lg={4}>
          <Card>
            <CardBody>
              <h5 className="card-title mb-4">Skills</h5>
              <div className="d-flex flex-wrap gap-2 fs-16">
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  UI/UX
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Figma
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  HTML
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  CSS
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Javascript
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  C#
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Nodejs
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Members</h4>
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-soft-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#inviteMembersModal">
                  <i className="ri-share-line me-1 align-bottom"></i> Invite
                  Member
                </button>
              </div>
            </CardHeader>

            <CardBody>
              <SimpleBar
                data-simplebar
                style={{ height: "235px" }}
                className="mx-n3 px-3">
                <div className="vstack gap-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar2}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Nancy Martino
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <div className="avatar-title bg-danger-subtle text-danger rounded-circle">
                        HB
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Henry Baird
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar3}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Frank Hook
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar4}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Jennifer Carter
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <div className="avatar-title bg-success-subtle text-success rounded-circle">
                        AC
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Alexis Clarke
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar7}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Joseph Parker
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Attachments</h4>
              <div className="flex-shrink-0">
                <button type="button" className="btn btn-soft-info btn-sm">
                  <i className="ri-upload-2-fill me-1 align-bottom"></i> Upload
                </button>
              </div>
            </CardHeader>

            <CardBody>
              <div className="vstack gap-2">
                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-folder-zip-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          App-pages.zip
                        </Link>
                      </h5>
                      <div>2.2MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-file-ppt-2-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          Velzon-admin.ppt
                        </Link>
                      </h5>
                      <div>2.4MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-folder-zip-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          Images.zip
                        </Link>
                      </h5>
                      <div>1.2MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-image-2-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          bg-pattern.png
                        </Link>
                      </h5>
                      <div>1.1MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <button type="button" className="btn btn-success">
                    View more
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default OrgInfoTab;
