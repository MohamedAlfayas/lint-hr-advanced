import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
} from "reactstrap";
import AuthSlider from "./AuthSlider";
import { MetaTitle } from "../../../common/data/MetaTitle";
import logoDark from "../../../assets/images/logo-dark.png";
import { useFormik } from "formik";
import * as Yup from "yup";

const WorkSpace = () => {
  const [domain, setDomain] = useState("");
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      domain: domain || "",
    },
    validationSchema: Yup.object({
      domain: Yup.string().trim().required("Please Enter Your Domain"),
    }),
    onSubmit: (values) => {
      console.log("Values = ", values);
      //   if (domain.trim().length === 0) {
      //     toast.error("Please Fill Your Details");
      //   } else {
      //     console.log("Form Values = ", values);
      //     setTimeout(() => {
      //       navigate("/auth/login");
      //     }, 2000);
      //   }
    },
  });

  document.title = `WorkSpace | ${MetaTitle}`;
  return (
    <React.Fragment>
      <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="bg-overlay"></div>
        <div className="auth-page-content overflow-hidden pt-lg-5">
          <Container>
            <Row>
              {/* <Col lg={3}></Col> */}
              <Col lg={12}>
                <Card className="overflow-hidden">
                  <Row className="g-0">
                    <AuthSlider />

                    <Col lg={6}>
                      <div className="p-lg-5 p-4 mb-4">
                        {/* <div className="mb-4">
                          <Link to="" className="d-block">
                            <img src={logoDark} alt="" height="18" />
                          </Link>
                        </div> */}
                        <div>
                          <h5 className="text-primary">
                            Log in to your LintHR account
                          </h5>
                          <p className="text-muted"></p>
                        </div>

                        <div className="mt-4">
                          <Form
                            onSubmit={(e) => {
                              e.preventDefault();
                              validation.handleSubmit();
                              return false;
                            }}
                            action="#"
                          >
                            <div className="mb-3">
                              <Label htmlFor="domain" className="form-label">
                                Please enter your domain name
                              </Label>
                              <Col lg={12}>
                                <div className="mb-6">
                                  <div className="input-group">
                                    <Input
                                      name="domain"
                                      className="form-control"
                                      placeholder="Enter Domain"
                                      type="text"
                                      onChange={(e) => {
                                        setDomain(e.target.value);
                                      }}
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
                                  ></div>
                                </div>
                              </Col>
                            </div>

                            <div className="mt-4">
                              <Button
                                color="success"
                                className="w-100"
                                type="submit"
                              >
                                Continue
                              </Button>
                            </div>

                            <div className="mt-4 text-center">
                              {/* <div className="signin-other-title">
                                <h5 className="fs-13 mb-4 title">
                                  Sign In with
                                </h5>
                              </div>

                              <div>
                                <Button
                                  color="primary"
                                  className="btn-icon me-1"
                                >
                                  <i className="ri-facebook-fill fs-16"></i>
                                </Button>
                                <Button
                                  color="danger"
                                  className="btn-icon me-1"
                                >
                                  <i className="ri-google-fill fs-16"></i>
                                </Button>
                                <Button color="dark" className="btn-icon me-1">
                                  <i className="ri-github-fill fs-16"></i>
                                </Button>
                                <Button color="info" className="btn-icon">
                                  <i className="ri-twitter-fill fs-16"></i>
                                </Button>
                              </div> */}
                            </div>
                          </Form>
                        </div>

                        <div className="mt-5 text-center">
                          <p className="mb-0">
                            Don't have an account ?{" "}
                            <Link
                              to="/auth/register"
                              className="fw-semibold text-primary text-decoration-underline"
                            >
                              {" "}
                              Signup
                            </Link>{" "}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>

        <footer className="footer">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center">
                  <p className="mb-0">
                    &copy; {new Date().getFullYear()} Lint HR. Crafted with{" "}
                    <i className="mdi mdi-heart text-danger"></i> by Lintcloud
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </footer>
      </div>
    </React.Fragment>
  );
};

export default WorkSpace;
