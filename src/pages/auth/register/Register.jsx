import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
  FormFeedback,
  Button,
} from "reactstrap";
import classnames from "classnames";

import logoLight from "../../../assets/images/logo-light.png";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import * as Yup from "yup";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";
import AuthParticles from "../../../component/authparticles/AuthParticles";
import { toast } from "react-toastify";

// register lottie and define custom element
defineElement(loadAnimation);

const Register = () => {
  const navigate = useNavigate();

  // const [userRegister, setuserRegister] = useState([]);
  const [passwordShow, setPasswordShow] = useState(false);

  const [activeTab, setactiveTab] = useState(1);
  const [progressbarvalue, setprogressbarvalue] = useState(0);
  const [passedSteps, setPassedSteps] = useState([1]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [comapnyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [domainChangeAccess, setDomainChangeAccess] = useState(true);

  function toggleTab(tab, value) {
    if (activeTab !== tab) {
      var modifiedSteps = [...passedSteps, tab];

      if (tab >= 1 && tab <= 4) {
        setactiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
    setprogressbarvalue(value);
  }

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: name || "",
      email: email || "",
      password: password || "",
      comapnyName: comapnyName || "",
      domain: domain || "",
    },
    validate,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please Enter Your Name"),
      email: Yup.string().trim().required("Please Enter Your Email"),
      password: Yup.string().trim().required("Please Enter Your Password"),
      comapnyName: Yup.string()
        .trim()
        .required("Please Enter Your Company Name"),
      domain: Yup.string().trim().required("Please Enter Your Domain"),
    }),
    onSubmit: (values) => {
      if (
        name.trim().length === 0 ||
        email.trim().length === 0 ||
        password.trim().length === 0 ||
        comapnyName.trim().length === 0 ||
        domain.trim().length === 0
      ) {
        toast.error("Please Fill Your Details");
      } else {
        toggleTab(activeTab + 1, 100);
        // localStorage.setItem("token", "abc")
        // navigate("/login")

        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      }
    },
  });

  const setDomainFormat = (val) => {
    return val
      .replaceAll(" ", "-")
      .replaceAll("--", "-")
      .replaceAll("_", "-")
      .toLowerCase();
  };

  useEffect(() => {
    if (domainChangeAccess === true) {
      setDomain(setDomainFormat(comapnyName));
    }
  }, [comapnyName]);

  const handleDomainChange = (e) => {
    setDomainChangeAccess(false);
    setDomain(setDomainFormat(e.target.value));
  };

  document.title = `Register | ${MetaTitle || "Lint HR"} `;

  return (
    <React.Fragment>
      <AuthParticles>
        <div className="auth-page-content mt-lg-3">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={logoLight} alt="" height="20" />
                    </Link>
                  </div>
                  <p className="mt-3 fs-15 fw-medium">Lint HR Dashboard</p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card>
                  <CardBody>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                      action="#"
                      className="form-steps"
                    >
                      <div className="text-center pt-3 pb-4 mb-1">
                        <h5>Get started for free today 😍</h5>
                      </div>

                      {activeTab < 3 && (
                        <div className="progress-nav mb-4">
                          <Progress
                            value={progressbarvalue}
                            style={{ height: "1px" }}
                          />

                          <Nav
                            className="nav-pills progress-bar-tab custom-nav"
                            role="tablist"
                          >
                            <NavItem>
                              <NavLink
                                id="pills-gen-info-tab"
                                className={classnames(
                                  {
                                    active: activeTab === 1,
                                    done: activeTab <= 4 && activeTab >= 0,
                                  },
                                  "rounded-pill"
                                )}
                                onClick={() => {
                                  toggleTab(1, 0);
                                }}
                                tag="button"
                                type="button"
                              >
                                1
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                id="pills-gen-info-tab"
                                className={classnames(
                                  {
                                    active: activeTab === 2,
                                    done: activeTab <= 4 && activeTab > 1,
                                  },
                                  "rounded-pill"
                                )}
                                onClick={() => {
                                  if (
                                    name.trim().length === 0 ||
                                    (email.trim().length === 0 &&
                                      !validation.errors.email) ||
                                    password.trim().length === 0
                                  ) {
                                    toast.error("Please Enter All Details");
                                  } else if (
                                    email.trim().length !== 0 &&
                                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                      email
                                    )
                                  ) {
                                    toast.error("Invalid Email Format");
                                  } else {
                                    toggleTab(2, 50);
                                  }
                                }}
                                tag="button"
                                type="button"
                              >
                                2
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                id="pills-gen-info-tab"
                                className={classnames(
                                  {
                                    active: activeTab === 3,
                                    done: activeTab <= 4 && activeTab > 2,
                                  },
                                  "rounded-pill"
                                )}
                                // onClick={() => {
                                //   toggleTab(3, 100);
                                // }}
                                tag="button"
                                type="button"
                              >
                                3
                              </NavLink>
                            </NavItem>
                          </Nav>
                        </div>
                      )}

                      <TabContent activeTab={activeTab}>
                        <TabPane tabId={1}>
                          <div>
                            <div className="mb-4">
                              <div>
                                {/* <h5 className="mb-1">General Information</h5>
                                <p className="text-muted">
                                  Fill all Information as below
                                </p> */}
                              </div>
                            </div>
                            <Row>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="gen-info-username-input"
                                  >
                                    Name
                                  </Label>
                                  <Input
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter name"
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={validation.handleBlur}
                                    value={name || ""}
                                    invalid={
                                      validation.touched.name &&
                                      validation.errors.name
                                        ? true
                                        : false
                                    }
                                  />
                                  {validation.touched.name &&
                                  validation.errors.name ? (
                                    <FormFeedback type="invalid">
                                      {validation.errors.name}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                              </Col>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="gen-info-email-input"
                                  >
                                    Email
                                  </Label>
                                  <Input
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter email"
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={validation.handleBlur}
                                    value={email || ""}
                                    invalid={
                                      validation.touched.email &&
                                      validation.errors.email
                                        ? true
                                        : false
                                    }
                                  />
                                  {validation.touched.email &&
                                  validation.errors.email ? (
                                    <FormFeedback type="invalid">
                                      {validation.errors.email}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
                            <div className="mb-3">
                              <Label
                                className="form-label"
                                htmlFor="gen-info-password-input"
                              >
                                Password
                              </Label>
                              <div className="position-relative auth-pass-inputgroup mb-3">
                                <Input
                                  name="password"
                                  value={password || ""}
                                  type={passwordShow ? "text" : "password"}
                                  className="form-control pe-5"
                                  placeholder="Enter Password"
                                  onChange={(e) => setPassword(e.target.value)}
                                  onBlur={validation.handleBlur}
                                  invalid={
                                    validation.touched.password &&
                                    validation.errors.password
                                      ? true
                                      : false
                                  }
                                />
                                {validation.touched.password &&
                                validation.errors.password ? (
                                  <FormFeedback type="invalid">
                                    {validation.errors.password}
                                  </FormFeedback>
                                ) : null}
                                <button
                                  className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                  type="button"
                                  id="password-addon"
                                  onClick={() => setPasswordShow(!passwordShow)}
                                >
                                  <i className="ri-eye-fill align-middle"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              onClick={() => {
                                if (
                                  name.trim().length === 0 ||
                                  email.trim().length === 0 ||
                                  password.trim().length === 0
                                ) {
                                  toast.error("Please Enter All Details");
                                } else if (
                                  email.trim().length !== 0 &&
                                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                    email
                                  )
                                ) {
                                  toast.error("Invalid Email Format");
                                } else {
                                  toggleTab(activeTab + 1, 50);
                                }
                              }}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Continue
                            </button>
                          </div>
                        </TabPane>

                        <TabPane tabId={2}>
                          <div>
                            <div className="mb-4">
                              <div>
                                {/* <h5 className="mb-1">General Information</h5>
                                <p className="text-muted">
                                  Fill all Information as below
                                </p> */}
                              </div>
                            </div>
                            <Row>
                              <Col lg={12}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="gen-info-username-input"
                                  >
                                    Company Name
                                  </Label>
                                  <Input
                                    name="comapnyName"
                                    className="form-control"
                                    placeholder="Enter Company Name"
                                    type="text"
                                    onChange={(e) =>
                                      setCompanyName(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    value={comapnyName || ""}
                                    invalid={
                                      validation.touched.comapnyName &&
                                      validation.errors.comapnyName
                                        ? true
                                        : false
                                    }
                                  />
                                  {validation.touched.comapnyName &&
                                  validation.errors.comapnyName ? (
                                    <FormFeedback type="invalid">
                                      {validation.errors.comapnyName}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="gen-info-username-input"
                                  >
                                    Domain
                                  </Label>
                                  <div className="input-group">
                                    <Input
                                      name="domain"
                                      className="form-control"
                                      placeholder="Enter Domain"
                                      type="text"
                                      onChange={handleDomainChange}
                                      value={domain || ""}
                                      invalid={
                                        validation.touched.domain &&
                                        validation.errors.domain
                                          ? true
                                          : false
                                      }
                                    />
                                    <span
                                      className="input-group-text"
                                      id="basic-addon2"
                                    >
                                      .linthr.com
                                    </span>
                                    {validation.touched.domain &&
                                    validation.errors.domain ? (
                                      <FormFeedback type="invalid">
                                        {validation.errors.domain}
                                      </FormFeedback>
                                    ) : null}
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    <span>
                                      {validation.values.comapnyName
                                        ? `Your company domain will be: https://${domain}.linthr.com`
                                        : "(*) We will create a unique company URL for you to log into Lint HR"}
                                    </span>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </div>

                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-link text-decoration-none btn-label previestab"
                              onClick={() => {
                                toggleTab(activeTab - 1, 0);
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back to General
                            </button>
                            <Button
                              type="submit"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Submit
                            </Button>
                          </div>
                        </TabPane>

                        <TabPane tabId={3}>
                          <div>
                            <div className="text-center">
                              <div className="mb-4">
                                <lord-icon
                                  src="https://cdn.lordicon.com/lupuorrc.json"
                                  trigger="loop"
                                  colors="primary:#0ab39c,secondary:#405189"
                                  style={{ width: "120px", height: "120px" }}
                                ></lord-icon>
                              </div>
                              <h5>Well Done !</h5>
                              <p className="text-muted">
                                You have Successfully Signed Up
                              </p>
                              <p className="text-muted">Please Wait !!!</p>
                            </div>
                          </div>
                        </TabPane>
                      </TabContent>
                    </Form>
                  </CardBody>
                </Card>

                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Already have an account ?{" "}
                    <Link
                      to="/auth/login"
                      className="fw-semibold text-primary text-decoration-underline"
                    >
                      {" "}
                      Signin{" "}
                    </Link>{" "}
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </AuthParticles>
    </React.Fragment>
  );
};

export default Register;
