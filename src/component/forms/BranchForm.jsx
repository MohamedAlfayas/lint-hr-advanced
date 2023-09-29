import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import { Link } from "react-router-dom";

const BranchForm = () => {
  const initialData = useMemo(() => {
    return {
      id: "0",
      name: "",
      total_branches: 1,
      description: "",
    };
  }, []);

  const [branchData, setBranchData] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    console.log("UseEffect Running !!!!");
    setBranchData(form_obj);
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBranchData({
      ...branchData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    console.log("branch data = ", branchData);
  };

  return (
    <React.Fragment>
      <Row className="g-4 mb-3">
        <div className="col-sm">
          <div className="d-flex">
            <div className="search-box me-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search Role..."
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </div>
        </div>
      </Row>

      <Row>
        <div className="team-list list-view-filter">
          <Card className="overflow-hidden shadow-none">
            <CardBody className="bg-secondary-subtle">
              <Row className="align-items-center team-row text-center">
                <Col lg={3} className="ml-2">
                  <b>Access</b>
                </Col>
                <Col lg={3} className="ml-2">
                  <b>Create</b>
                </Col>
                <Col lg={3} className="ml-2">
                  <b>Edit</b>
                </Col>
                <Col lg={3} className="ml-2">
                  <b> Delete</b>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box ribbon-box">
            <CardBody className="px-4">
              <div className="ribbon-two ribbon-two-warning">
                <span>Master</span>
              </div>
              <Row className="align-items-center team-row ">
                <Col lg={3} className="ml-2">
                  <div className="team-profile-img">
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Company</h5>
                      </Link>
                      <p className="text-muted mb-0">Company Access</p>
                    </div>
                  </div>
                </Col>
                <Col lg={9}>
                  <Row className="text-muted text-center align-items-center">
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                          defaultChecked
                        />
                      </div>
                      <p className="text-muted mb-0">
                        User Can Create New Branch
                      </p>
                    </Col>
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Edit Branch</p>{" "}
                    </Col>
                    <Col xs={4}>
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Delete Branch</p>{" "}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box ribbon-box">
            <CardBody className="px-4">
              <div className="ribbon-two ribbon-two-warning">
                <span>Master</span>
              </div>
              <Row className="align-items-center team-row ">
                <Col lg={3} className="ml-2">
                  <div className="team-profile-img">
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Company</h5>
                      </Link>
                      <p className="text-muted mb-0">Company Access</p>
                    </div>
                  </div>
                </Col>
                <Col lg={9}>
                  <Row className="text-muted text-center align-items-center">
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                          defaultChecked
                        />
                      </div>
                      <p className="text-muted mb-0">
                        User Can Create New Branch
                      </p>
                    </Col>
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Edit Branch</p>{" "}
                    </Col>
                    <Col xs={4}>
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Delete Branch</p>{" "}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box ribbon-box">
            <CardBody className="px-4">
              <div className="ribbon-two ribbon-two-warning">
                <span>Master</span>
              </div>
              <Row className="align-items-center team-row ">
                <Col lg={3} className="ml-2">
                  <div className="team-profile-img">
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Company</h5>
                      </Link>
                      <p className="text-muted mb-0">Company Access</p>
                    </div>
                  </div>
                </Col>
                <Col lg={9}>
                  <Row className="text-muted text-center align-items-center">
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                          defaultChecked
                        />
                      </div>
                      <p className="text-muted mb-0">
                        User Can Create New Branch
                      </p>
                    </Col>
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Edit Branch</p>{" "}
                    </Col>
                    <Col xs={4}>
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Delete Branch</p>{" "}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box ribbon-box">
            <CardBody className="px-4">
              <div className="ribbon-two ribbon-two-warning">
                <span>Master</span>
              </div>
              <Row className="align-items-center team-row ">
                <Col lg={3} className="ml-2">
                  <div className="team-profile-img">
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Company</h5>
                      </Link>
                      <p className="text-muted mb-0">Company Access</p>
                    </div>
                  </div>
                </Col>
                <Col lg={9}>
                  <Row className="text-muted text-center align-items-center">
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                          defaultChecked
                        />
                      </div>
                      <p className="text-muted mb-0">
                        User Can Create New Branch
                      </p>
                    </Col>
                    <Col xs={4} className="border-end border-end-dashed">
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Edit Branch</p>{" "}
                    </Col>
                    <Col xs={4}>
                      <div
                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                        dir="ltr">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitchsizemd"
                        />
                      </div>
                      <p className="text-muted mb-0">User Can Delete Branch</p>{" "}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <Row className="align-items-center team-row">
                <div className="col team-settings">
                  <Row className="align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn active">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                  </Row>
                </div>
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <div className="avatar-title bg-danger-subtle text-danger rounded-circle">
                        HB
                      </div>
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Henry Baird</h5>
                      </Link>
                      <p className="text-muted mb-0">Full Stack Developer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <Row className="text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">352</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">376</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <Row className="align-items-center team-row">
                <div className="col team-settings">
                  <Row className="align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn active">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                  </Row>
                </div>
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <img
                        src={avatar3}
                        alt=""
                        className="img-fluid d-block rounded-circle"
                      />
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Frank Hook</h5>
                      </Link>
                      <p className="text-muted mb-0">Project Manager</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <Row className="text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">164</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">182</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <Row className="align-items-center team-row">
                <div className="col team-settings">
                  <Row className="align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                  </Row>
                </div>
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <img
                        src={avatar8}
                        alt=""
                        className="img-fluid d-block rounded-circle"
                      />
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Jennifer Carter</h5>
                      </Link>
                      <p className="text-muted mb-0">UI/UX Designer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <Row className="text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">225</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">197</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <Row className="align-items-center team-row">
                <div className="col team-settings">
                  <Row className="align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                  </Row>
                </div>
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <div className="avatar-title bg-success-subtle text-success rounded-circle">
                        ME
                      </div>
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Megan Elmore</h5>
                      </Link>
                      <p className="text-muted mb-0">
                        Team Leader & Web Developer
                      </p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <Row className="text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">201</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">263</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <Row className="align-items-center team-row">
                <div className="col team-settings">
                  <Row className="align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                  </Row>
                </div>
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <img
                        src={avatar4}
                        alt=""
                        className="img-fluid d-block rounded-circle"
                      />
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Alexis Clarke</h5>
                      </Link>
                      <p className="text-muted mb-0">Backend Developer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <Row className="text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">132</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">147</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <div className="row align-items-center team-row">
                <div className="col team-settings">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <div className="avatar-title bg-info-subtle text-info rounded-circle">
                        NC
                      </div>
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Nathan Cole</h5>
                      </Link>
                      <p className="text-muted mb-0">Front-End Developer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="row text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">352</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">376</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </div>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </div>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <div className="row align-items-center team-row">
                <div className="col team-settings">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <img
                        src={avatar7}
                        alt=""
                        className="img-fluid d-block rounded-circle"
                      />
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Joseph Parker</h5>
                      </Link>
                      <p className="text-muted mb-0">Team Leader & HR</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="row text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">64</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">93</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </div>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </div>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <div className="row align-items-center team-row">
                <div className="col team-settings">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <img
                        src={avatar5}
                        alt=""
                        className="img-fluid d-block rounded-circle"
                      />
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Erica Kernan</h5>
                      </Link>
                      <p className="text-muted mb-0">Web Designer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="row text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">345</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">298</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </div>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </div>
            </CardBody>
          </Card>
          <Card className="team-box">
            <CardBody className="px-4">
              <div className="row align-items-center team-row">
                <div className="col team-settings">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="flex-shrink-0 me-2">
                        <button
                          type="button"
                          className="btn fs-16 p-0 favourite-btn">
                          <i className="ri-star-fill"></i>
                        </button>
                      </div>
                    </div>
                    <UncontrolledDropdown className="col text-end">
                      <DropdownToggle tag="a" role="button">
                        <i className="ri-more-fill fs-17"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                <Col lg={4}>
                  <div className="team-profile-img">
                    <div className="avatar-lg img-thumbnail rounded-circle">
                      <div className="avatar-title border bg-light text-primary rounded-circle">
                        DP
                      </div>
                    </div>
                    <div className="team-content">
                      <Link to="#" className="d-block">
                        <h5 className="fs-16 mb-1">Donald Palmer</h5>
                      </Link>
                      <p className="text-muted mb-0">Wed Developer</p>
                    </div>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="row text-muted text-center">
                    <Col xs={6} className="border-end border-end-dashed">
                      <h5 className="mb-1">97</h5>
                      <p className="text-muted mb-0">Projects</p>
                    </Col>
                    <Col xs={6}>
                      <h5 className="mb-1">135</h5>
                      <p className="text-muted mb-0">Tasks</p>
                    </Col>
                  </div>
                </Col>
                <Col lg={2} className="col">
                  <div className="text-end">
                    <Link
                      to="/pages-profile"
                      className="btn btn-light view-btn">
                      View Profile
                    </Link>
                  </div>
                </Col>
              </div>
            </CardBody>
          </Card>
        </div>
      </Row>
    </React.Fragment>
  );
};

export default BranchForm;
