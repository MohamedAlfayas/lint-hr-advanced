import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import axios from "axios";
import { toast } from "react-toastify";
import { BaseURL, getBaseUrlFromDomain } from "../../../common/api/BaseURL";

const WorkSpace = () => {
  const [company_name, setDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      company_name: company_name || "",
    },
    validationSchema: Yup.object({
      company_name: Yup.string().trim().required("Domain URL is required"),
    }),
    onSubmit: (values) => {
      const company_name = values?.company_name;

      if (!!company_name) {
        let url = "";

        if (
          !!process.env.REACT_APP_LC_PLATFORM &&
          process.env.REACT_APP_LC_PLATFORM === "local"
        ) {
          url = `${getBaseUrlFromDomain()}api/auth/validate-company/`;
        } else {
          const domain = window.location.hostname.split(".")[0];
          url = `https://apps.${process.env.REACT_APP_BASE_URL}/api/auth/validate-company/`;
        }

        axios({
          method: "POST",
          url: url,
          data: {
            company_name: company_name,
          },
        })
          .then((res) => {
            setErrorMessage(null);
            console.log("REs - ", res);
            if (res?.data && res?.data?.redirect_url) {
              window.location.href = res?.data?.redirect_url;
            }
          })
          .catch((err) => {
            console.error("Err - ", err);
            setErrorMessage(
              "We couldn’t find your workspace. Please Try Again.",
            );
            toast?.error(
              err?.response?.data?.message || "Something Went Wrong",
            );
          });
      }
    },
  });

  document.title = `WorkSpace | ${MetaTitle}`;
  return (
    <React.Fragment>
      <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="bg-overlay"></div>
        <div className="auth-page-content overflow-hidden pt-lg-5">
          <Container>
            {errorMessage && (
              <div style={{ textAlign: "center", margin: "20px" }}>
                <div
                  style={{
                    display: "inline-block",
                    border: "1px solid red",
                    borderRadius: "5px",
                    padding: "10px",
                    backgroundColor: "#ffe6e6",
                    color: "red",
                    fontWeight: "light",
                  }}
                >
                  <span class="mdi mdi-alert-circle"></span>
                  {errorMessage}
                </div>
              </div>
            )}
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
                              <Label
                                htmlFor="company_name"
                                className="form-label"
                              >
                                Please enter your company name
                              </Label>
                              <Col lg={12}>
                                <div className="mb-6">
                                  <div className="input-group">
                                    <Input
                                      name="company_name"
                                      className="form-control"
                                      placeholder="Enter Company"
                                      type="text"
                                      onChange={(e) => {
                                        setDomain(e.target.value);
                                      }}
                                      value={company_name || ""}
                                      invalid={
                                        validation.touched.company_name &&
                                        validation.errors.company_name
                                          ? true
                                          : false
                                      }
                                    />

                                    {validation.touched.company_name &&
                                    validation.errors.company_name ? (
                                      <FormFeedback type="invalid">
                                        {validation.errors.company_name}
                                      </FormFeedback>
                                    ) : null}
                                  </div>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  ></div>
                                  {!validation.errors.company_name && (
                                    <div
                                      id="passwordHelpBlock"
                                      className="form-text mb-3"
                                    >
                                      Domain name.
                                    </div>
                                  )}
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

                            <div className="mt-4 text-center"></div>
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
