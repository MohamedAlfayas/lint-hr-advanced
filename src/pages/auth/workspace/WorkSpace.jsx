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
import { buildRedirectUrl } from "../../../common/api/BuildRedirectURL";

// Letters, numbers, spaces, . , - & ( ) ' _
const COMPANY_NAME_ALLOWED = /^[A-Za-z0-9\s.,\-&()'_]+$/;
const COMPANY_NAME_SANITIZE = /[^A-Za-z0-9\s.,\-&()'_]/g;
const COMPANY_NAME_MAX = 100;

const COMPANY_NAME_MAX_ERROR =
  "Company name cannot exceed 100 characters";

const WorkSpace = () => {
  const [company_name, setDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [maxLengthError, setMaxLengthError] = useState("");

  const navigate = useNavigate();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      company_name: company_name || "",
    },
    validationSchema: Yup.object({
      company_name: Yup.string()
        .trim()
        .required("Please enter company name")
        .min(1, "Please enter company name")
        .max(COMPANY_NAME_MAX, COMPANY_NAME_MAX_ERROR)
        .matches(
          COMPANY_NAME_ALLOWED,
          "Company name can only contain letters, numbers, spaces, and . , - & ( ) ' _",
        ),
    }),
    onSubmit: (values) => {
      // Trim before lookup; API match is case-insensitive
      const trimmedName = (values?.company_name || "").trim();

      if (!trimmedName) return;
      if (trimmedName.length > COMPANY_NAME_MAX) {
        setMaxLengthError(COMPANY_NAME_MAX_ERROR);
        validation.setFieldTouched("company_name", true, false);
        return;
      }

      setDomain(trimmedName);
      validation.setFieldValue("company_name", trimmedName, false);

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
          company_name: trimmedName,
        },
      })
        .then((res) => {
          setErrorMessage(null);
          console.log("REs - ", res);
          if (res?.data && res?.data?.domain) {
            window.location.href = buildRedirectUrl(res?.data?.domain);
          }
        })
        .catch((err) => {
          console.error("Err - ", err);
          setErrorMessage("Company not found");
          toast?.error(
            err?.response?.data?.message || "Company not found",
          );
        });
    },
  });

  const handleCompanyNameChange = (e) => {
    const val = e.target.value.replace(COMPANY_NAME_SANITIZE, "");
    setDomain(val);
    validation.setFieldValue("company_name", val, true);
    validation.setFieldTouched("company_name", true, false);
    setMaxLengthError(
      val.length > COMPANY_NAME_MAX ? COMPANY_NAME_MAX_ERROR : "",
    );
    setErrorMessage(null);
  };

  const handleCompanyNameBlur = () => {
    const trimmed = (company_name || "").trim();
    if (trimmed !== company_name) {
      setDomain(trimmed);
      validation.setFieldValue("company_name", trimmed, true);
      setMaxLengthError(
        trimmed.length > COMPANY_NAME_MAX ? COMPANY_NAME_MAX_ERROR : "",
      );
    }
    validation.setFieldTouched("company_name", true);
  };

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
                  <span className="mdi mdi-alert-circle"></span>
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
                              <Input
                                name="company_name"
                                id="company_name"
                                className="form-control"
                                placeholder="Enter Company"
                                type="text"
                                onChange={handleCompanyNameChange}
                                onBlur={handleCompanyNameBlur}
                                value={company_name || ""}
                                invalid={
                                  !!maxLengthError ||
                                  !!(
                                    validation.touched.company_name &&
                                    validation.errors.company_name
                                  )
                                }
                              />
                              {maxLengthError ? (
                                <FormFeedback
                                  type="invalid"
                                  className="d-block"
                                  style={{ paddingBottom: 0 }}
                                >
                                  {maxLengthError}
                                </FormFeedback>
                              ) : validation.touched.company_name &&
                                validation.errors.company_name ? (
                                <FormFeedback
                                  type="invalid"
                                  className="d-block"
                                  style={{ paddingBottom: 0 }}
                                >
                                  {validation.errors.company_name}
                                </FormFeedback>
                              ) : (
                                <div className="form-text">Domain name.</div>
                              )}
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
