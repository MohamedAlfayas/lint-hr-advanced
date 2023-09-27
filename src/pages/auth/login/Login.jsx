import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";
import * as Yup from "yup";
import logoLight from "../../../assets/images/logo-light.png";
import AuthParticles from "../../../component/authparticles/AuthParticles";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";

import avatar1 from "../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../../assets/images/users/avatar-7.jpg";

const Login = () => {
  let tempGlobalData = {
    Employee: [
      {
        id: 1,
        img: avatar1,
        name: "Fayaz",
        dep: [3, 1],
        role: 1,
        status: "Active",
      },
      {
        id: 2,
        img: avatar2,
        name: "Antony",
        dep: [2],
        role: 1,
        status: "Active",
      },
      {
        id: 3,
        img: avatar3,
        name: "Tharun",
        dep: [4, 1],
        role: 1,
        status: "Active",
      },
      {
        id: 4,
        img: avatar4,
        name: "Kathir",
        dep: [1, 2, 3, 4, 5],
        role: 1,
        status: "Active",
      },
      {
        id: 5,
        img: avatar5,
        name: "Thalavai",
        dep: [4, 2],
        role: 1,
        status: "Active",
      },
      {
        id: 6,
        img: avatar6,
        name: "Paul",
        dep: [5, 1],
        role: 1,
        status: "Active",
      },
      {
        id: 7,
        img: avatar7,
        name: "Elan",
        dep: [2, 1],
        role: 1,
        status: "Active",
      },
      {
        id: 8,
        img: avatar1,
        name: "Lintcloud",
        dep: [4, 1],
        role: 1,
        status: "Active",
      },
    ],
    Department: [
      {
        id: 1,
        name: "Lintcloud",
        pid: 0,
        desc: "",
      },
      {
        id: 2,
        name: "Android",
        pid: 1,
        desc: "",
      },
      {
        id: 3,
        name: "Full Stock",
        pid: 1,
        desc: "",
      },
      {
        id: 4,
        name: "Marketing",
        pid: 1,
        desc: "",
      },
      {
        id: 5,
        name: "Intern",
        pid: 3,
        desc: "",
      },
    ],
    Roles: [
      {
        id: 1,
        name: "Admin",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 2,
        name: "Super Admin",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 3,
        name: "Manager",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 4,
        name: "Employee",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
    ],
    RoleList: {
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
    },
  };

  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState([]);
  const [passwordShow, setPasswordShow] = useState(false);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: userLogin.email || "admin@lintcloud.com" || "",
      password: userLogin.password || "lintcloud" || "",
    },
    validate,
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      console.log("Form Values = ", values);
      localStorage.setItem("token", "abc");
      localStorage.setItem("lcEdu_GlobalData", JSON.stringify(tempGlobalData));
      navigate("/dashboard");
    },
  });

  document.title = `Login | ${MetaTitle || "Lint HR"}`;

  return (
    <React.Fragment>
      <AuthParticles>
        <div className="auth-page-content mt-lg-5">
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
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Welcome Back !</h5>
                      <p className="text-muted">
                        Sign in to continue to Lint HR.
                      </p>
                    </div>
                    <div className="p-2 mt-4">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                        action="#">
                        <div className="mb-3">
                          <Label htmlFor="email" className="form-label">
                            Email
                          </Label>
                          <Input
                            name="email"
                            className="form-control"
                            placeholder="Enter email"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ""}
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

                        <div className="mb-3">
                          <div className="float-end">
                            <Link
                              to="/auth/forgot-password"
                              className="text-muted">
                              Forgot password?
                            </Link>
                          </div>
                          <Label
                            className="form-label"
                            htmlFor="password-input">
                            Password
                          </Label>
                          <div className="position-relative auth-pass-inputgroup mb-3">
                            <Input
                              name="password"
                              value={validation.values.password || ""}
                              type={passwordShow ? "text" : "password"}
                              className="form-control pe-5"
                              placeholder="Enter Password"
                              onChange={validation.handleChange}
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
                              onClick={() => setPasswordShow(!passwordShow)}>
                              <i className="ri-eye-fill align-middle"></i>
                            </button>
                          </div>
                        </div>

                        <div className="form-check">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id="auth-remember-check"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="auth-remember-check">
                            Remember me
                          </Label>
                        </div>

                        <div className="mt-4">
                          <Button
                            color="success"
                            className="btn btn-success w-100"
                            type="submit">
                            Sign In
                          </Button>
                        </div>

                        <div className="mt-4 text-center">
                          <div className="signin-other-title">
                            <h5 className="fs-13 mb-4 title">Sign In with</h5>
                          </div>
                          <div>
                            <Link
                              to="#"
                              className="btn btn-primary btn-icon me-1"
                              onClick={(e) => {
                                e.preventDefault();
                              }}>
                              <i className="ri-facebook-fill fs-16" />
                            </Link>
                            <Link
                              to="#"
                              className="btn btn-danger btn-icon me-1"
                              onClick={(e) => {
                                e.preventDefault();
                              }}>
                              <i className="ri-google-fill fs-16" />
                            </Link>
                            <Button color="dark" className="btn-icon">
                              <i className="ri-github-fill fs-16"></i>
                            </Button>{" "}
                            <Button color="info" className="btn-icon">
                              <i className="ri-twitter-fill fs-16"></i>
                            </Button>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>

                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Don't have an account ?{" "}
                    <Link
                      to="/auth/register"
                      className="fw-semibold text-primary text-decoration-underline">
                      {" "}
                      Signup{" "}
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

export default Login;
