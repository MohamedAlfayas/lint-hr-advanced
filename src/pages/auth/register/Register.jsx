import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
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
import axios from "axios";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { getBaseUrlFromDomain } from "../../../common/api/BaseURL";
import AuthLoader from "../loader/AuthLoader";

defineElement(loadAnimation);

const OTP_LENGTH = 6;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  const [passwordShow, setPasswordShow] = useState(false);
  const [activeTab, setactiveTab] = useState(1);
  const [progressbarvalue, setprogressbarvalue] = useState(0);
  const [passedSteps, setPassedSteps] = useState([1]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [domainChangeAccess, setDomainChangeAccess] = useState(true);

  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // ── Progress values: tab1=0, tab2=33, tab3=66, tab4=100
  function toggleTab(tab, value) {
    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab];
      if (tab >= 1 && tab <= 4) {
        setactiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
    setprogressbarvalue(value);
  }

  const GetOtp = (e) => {
    e.preventDefault();
    console.log("GEt OTP Clicked");
    if (
      name.trim().length === 0 ||
      email.trim().length === 0 ||
      password.trim().length === 0 ||
      companyName.trim().length === 0 ||
      domain.trim().length === 0
    ) {
      toast.error("Please Fill Your Details");
    } else {
      let url = "";

      setOtpLoading(true);

      if (
        !!process.env.REACT_APP_LC_PLATFORM &&
        process.env.REACT_APP_LC_PLATFORM === "local"
      ) {
        url = `${getBaseUrlFromDomain()}company/auth/register/`;
      } else {
        url = `https://apps.${process.env.REACT_APP_BASE_URL}/company/auth/register/`;
      }

      axios({
        method: "POST",
        url: url,
        data: {
          email: email,
          companyName: companyName,
          domain: domain,
        },
      })
        .then((res) => {
          console.log("REs - ", res);
          toggleTab(3, 66);
          startResendTimer();
          toast.info("OTP sent to " + email);
        })
        .catch((err) => {
          toast?.error(err?.response?.data?.message || "Something Went Wrong");
        })
        .finally(() => {
          setOtpLoading(false);
        });
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    if (!canResend) return;

    if (email.trim().length === 0) {
      toast.error("Please Fill Your Details");
    } else {
      let url = "";

      if (
        !!process.env.REACT_APP_LC_PLATFORM &&
        process.env.REACT_APP_LC_PLATFORM === "local"
      ) {
        url = `${getBaseUrlFromDomain()}company/auth/resend-signup-otp/`;
      } else {
        url = `https://apps.${process.env.REACT_APP_BASE_URL}/company/auth/resend-signup-otp/`;
      }

      axios({
        method: "POST",
        url: url,
        data: {
          email: email,
        },
      })
        .then((res) => {
          console.log("REs - ", res);
          setOtp(Array(OTP_LENGTH).fill(""));
          setOtpError("");
          otpRefs.current[0]?.focus();
          startResendTimer();
          toast.success("OTP resent to " + email);
        })
        .catch((err) => {
          toast?.error(err?.response?.data?.message || "Something Went Wrong");
        });
    }
  };

  // OTP box input handler
  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setOtpError("");
    if (val && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      newOtp[i] = ch;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => v === "");
    otpRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: email || "",
      password: password || "",
    },
    validate,
    validationSchema: Yup.object({
      email: Yup.string().trim().required("Please Enter Your Email"),
      password: Yup.string().trim().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      dispatch(setLoaderVisible(true));
      console.log("OTP - ", otp);

      if (otp.length !== 6) {
        toast.error("Please enter complete OTP");
        return;
      }

      let otpString = otp.join("");

      if (
        email.trim().length === 0 ||
        password.trim().length === 0 ||
        otpString.trim().length === 0
      ) {
        toast.error("Please Fill Your Details");
      } else {
        let url = "";

        if (
          !!process.env.REACT_APP_LC_PLATFORM &&
          process.env.REACT_APP_LC_PLATFORM === "local"
        ) {
          url = `${getBaseUrlFromDomain()}company/auth/verify-signup-otp/`;
        } else {
          url = `https://apps.${process.env.REACT_APP_BASE_URL}/company/auth/verify-signup-otp/`;
        }

        axios({
          method: "POST",
          url: url,
          data: {
            name: name,
            email: email,
            password: password,
            otp: otpString,
          },
        })
          .then((res) => {
            console.log("REs - ", res);
            if (res?.data && res?.data?.redirect_url) {
              dispatch(setLoaderVisible(false));
              window.location.href = res?.data?.redirect_url;
            }
          })
          .catch((err) => {
            dispatch(setLoaderVisible(false));
            toast?.error(
              err?.response?.data?.message || "Something Went Wrong",
            );
          });
      }
    },
  });

  const setDomainFormat = (val) =>
    val
      .replaceAll(" ", "-")
      .replaceAll("--", "-")
      .replaceAll("_", "-")
      .toLowerCase();

  useEffect(() => {
    if (domainChangeAccess === true) {
      setDomain(setDomainFormat(companyName));
    }
  }, [companyName]);

  const handleDomainChange = (e) => {
    setDomainChangeAccess(false);
    setDomain(setDomainFormat(e.target.value));
  };

  document.title = `Register | ${MetaTitle || "Lint HR"}`;

  const isEmailValid = (val) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(val);

  return (
    <React.Fragment>
      {showLoader === false ? (
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
                          <h5>Step Into a Smarter Experience</h5>
                        </div>

                        {/* ── Step progress bar — hide on success tab */}
                        {activeTab < 4 && (
                          <div className="progress-nav mb-4">
                            <Progress
                              value={progressbarvalue}
                              style={{ height: "1px" }}
                            />
                            <Nav
                              className="nav-pills progress-bar-tab custom-nav"
                              role="tablist"
                            >
                              {/* Step 1 */}
                              <NavItem>
                                <NavLink
                                  className={classnames(
                                    {
                                      active: activeTab === 1,
                                      done: activeTab > 1,
                                    },
                                    "rounded-pill",
                                  )}
                                  onClick={() => toggleTab(1, 0)}
                                  tag="button"
                                  type="button"
                                >
                                  1
                                </NavLink>
                              </NavItem>
                              {/* Step 2 */}
                              <NavItem>
                                <NavLink
                                  className={classnames(
                                    {
                                      active: activeTab === 2,
                                      done: activeTab > 2,
                                    },
                                    "rounded-pill",
                                  )}
                                  onClick={() => {
                                    if (
                                      !name.trim() ||
                                      !email.trim() ||
                                      !password.trim()
                                    ) {
                                      toast.error("Please Enter All Details");
                                    } else if (!isEmailValid(email)) {
                                      toast.error("Invalid Email Format");
                                    } else {
                                      toggleTab(2, 33);
                                    }
                                  }}
                                  tag="button"
                                  type="button"
                                >
                                  2
                                </NavLink>
                              </NavItem>
                              {/* Step 3 — OTP */}
                              <NavItem>
                                <NavLink
                                  className={classnames(
                                    {
                                      active: activeTab === 3,
                                      done: activeTab > 3,
                                    },
                                    "rounded-pill",
                                  )}
                                  tag="button"
                                  type="button"
                                  disabled
                                >
                                  3
                                </NavLink>
                              </NavItem>
                            </Nav>
                          </div>
                        )}

                        <TabContent activeTab={activeTab}>
                          {/* ── TAB 1: Personal Info ── */}
                          <TabPane tabId={1}>
                            <Row>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Name</Label>
                                  <Input
                                    name="name"
                                    placeholder="Enter name"
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={validation.handleBlur}
                                    value={name || ""}
                                    invalid={
                                      !!(
                                        validation.touched.name &&
                                        validation.errors.name
                                      )
                                    }
                                  />
                                  {validation.touched.name &&
                                    validation.errors.name && (
                                      <FormFeedback>
                                        {validation.errors.name}
                                      </FormFeedback>
                                    )}
                                </div>
                              </Col>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label className="form-label">Email</Label>
                                  <Input
                                    name="email"
                                    placeholder="Enter email"
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={validation.handleBlur}
                                    value={email || ""}
                                    invalid={
                                      !!(
                                        validation.touched.email &&
                                        validation.errors.email
                                      )
                                    }
                                  />
                                  {validation.touched.email &&
                                    validation.errors.email && (
                                      <FormFeedback>
                                        {validation.errors.email}
                                      </FormFeedback>
                                    )}
                                </div>
                              </Col>
                            </Row>
                            <div className="mb-3">
                              <Label className="form-label">Password</Label>
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
                                    !!(
                                      validation.touched.password &&
                                      validation.errors.password
                                    )
                                  }
                                />
                                {validation.touched.password &&
                                  validation.errors.password && (
                                    <FormFeedback>
                                      {validation.errors.password}
                                    </FormFeedback>
                                  )}
                                <button
                                  className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                  type="button"
                                  onClick={() => setPasswordShow(!passwordShow)}
                                >
                                  <i
                                    className={`ri-${passwordShow ? "eye-off" : "eye"}-fill align-middle`}
                                  ></i>
                                </button>
                              </div>
                            </div>
                            <div className="d-flex align-items-start gap-3 mt-4">
                              <button
                                type="button"
                                className="btn btn-success btn-label right ms-auto nexttab"
                                onClick={() => {
                                  if (
                                    !name.trim() ||
                                    !email.trim() ||
                                    !password.trim()
                                  ) {
                                    toast.error("Please Enter All Details");
                                  } else if (!isEmailValid(email)) {
                                    toast.error("Invalid Email Format");
                                  } else {
                                    toggleTab(2, 33);
                                  }
                                }}
                              >
                                <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                Continue
                              </button>
                            </div>
                          </TabPane>

                          {/* ── TAB 2: Company Info ── */}
                          <TabPane tabId={2}>
                            <Row>
                              <Col lg={12}>
                                <div className="mb-3">
                                  <Label className="form-label">
                                    Company Name
                                  </Label>
                                  <Input
                                    name="companyName"
                                    placeholder="Enter Company Name"
                                    type="text"
                                    onChange={(e) =>
                                      setCompanyName(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    value={companyName || ""}
                                    invalid={
                                      !!(
                                        validation.touched.companyName &&
                                        validation.errors.companyName
                                      )
                                    }
                                  />
                                  {validation.touched.companyName &&
                                    validation.errors.companyName && (
                                      <FormFeedback>
                                        {validation.errors.companyName}
                                      </FormFeedback>
                                    )}
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="mb-3">
                                  <Label className="form-label">Domain</Label>
                                  <div className="input-group">
                                    <Input
                                      name="domain"
                                      placeholder="Enter Domain"
                                      type="text"
                                      onChange={handleDomainChange}
                                      value={domain || ""}
                                      invalid={
                                        !!(
                                          validation.touched.domain &&
                                          validation.errors.domain
                                        )
                                      }
                                    />
                                    <span className="input-group-text">
                                      .linthr.com
                                    </span>
                                    {validation.touched.domain &&
                                      validation.errors.domain && (
                                        <FormFeedback>
                                          {validation.errors.domain}
                                        </FormFeedback>
                                      )}
                                  </div>
                                  <div className="form-text">
                                    {companyName
                                      ? `Your company domain will be: https://${domain}.linthr.com`
                                      : "(*) We will create a unique company URL for you to log into Lint HR"}
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            <div className="d-flex align-items-start gap-3 mt-4">
                              <button
                                type="button"
                                className="btn btn-link text-decoration-none btn-label previestab"
                                onClick={() => toggleTab(1, 0)}
                              >
                                <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                Back
                              </button>
                              <Button
                                type="button"
                                className="btn btn-success btn-label right ms-auto nexttab"
                                onClick={(e) => GetOtp(e)}
                                disabled={otpLoading}
                              >
                                {otpLoading ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                    ></span>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                    Get OTP
                                  </>
                                )}
                              </Button>
                            </div>
                          </TabPane>

                          {/* ── TAB 3: OTP Verification (NEW) ── */}
                          <TabPane tabId={3}>
                            <div className="text-center mb-4">
                              <div
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: "50%",
                                  background: "#e6f1fb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 16px",
                                }}
                              >
                                <i
                                  className="ri-mail-send-line"
                                  style={{ fontSize: 24, color: "#185FA5" }}
                                ></i>
                              </div>
                              <h5 className="mb-1">Verify your email</h5>
                              <p
                                className="text-muted mb-0"
                                style={{ fontSize: 13 }}
                              >
                                We sent a 6-digit code to
                              </p>
                              <p
                                className="fw-semibold"
                                style={{ fontSize: 13 }}
                              >
                                {email}
                              </p>
                            </div>

                            {/* OTP boxes */}
                            <div
                              className="d-flex justify-content-center gap-2 mb-3"
                              onPaste={handleOtpPaste}
                            >
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={(el) => (otpRefs.current[index] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(e, index)}
                                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                  style={{
                                    width: 46,
                                    height: 52,
                                    textAlign: "center",
                                    fontSize: 22,
                                    fontWeight: 500,
                                    border: otpError
                                      ? "1.5px solid #e24b4a"
                                      : digit
                                        ? "1.5px solid #185FA5"
                                        : "1.5px solid #ddd",
                                    borderRadius: 8,
                                    outline: "none",
                                    background: digit
                                      ? "#e6f1fb"
                                      : "transparent",
                                    color: "#185FA5",
                                    transition:
                                      "border 0.15s, background 0.15s",
                                  }}
                                />
                              ))}
                            </div>

                            {otpError && (
                              <p
                                className="text-center text-danger"
                                style={{ fontSize: 12 }}
                              >
                                {otpError}
                              </p>
                            )}

                            {/* Resend */}
                            <p
                              className="text-center text-muted mb-4"
                              style={{ fontSize: 13 }}
                            >
                              {canResend ? (
                                <>
                                  Didn't receive the code?{" "}
                                  <span
                                    onClick={handleResendOtp}
                                    style={{
                                      color: "#185FA5",
                                      cursor: "pointer",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Resend OTP
                                  </span>
                                </>
                              ) : (
                                <>
                                  Resend OTP in <strong>{resendTimer}s</strong>
                                </>
                              )}
                            </p>

                            <div className="d-flex align-items-start gap-3">
                              <button
                                type="button"
                                className="btn btn-link text-decoration-none btn-label previestab"
                                onClick={() => toggleTab(2, 33)}
                              >
                                <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                Back
                              </button>
                              <button
                                type="submit"
                                className="btn btn-success btn-label right ms-auto"
                              >
                                <i className="ri-shield-check-line label-icon align-middle fs-16 ms-2"></i>
                                Verify & Continue
                              </button>
                            </div>
                          </TabPane>

                          {/* ── TAB 4: Success (was tab 3) ── */}
                          <TabPane tabId={4}>
                            <div className="text-center">
                              <div className="mb-4">
                                <lord-icon
                                  src="https://cdn.lordicon.com/lupuorrc.json"
                                  trigger="loop"
                                  colors="primary:#0ab39c,secondary:#405189"
                                  style={{ width: "120px", height: "120px" }}
                                ></lord-icon>
                              </div>
                              <h5>Well Done!</h5>
                              <p className="text-muted">
                                You have successfully signed up.
                              </p>
                              <p className="text-muted">
                                Redirecting to login…
                              </p>
                            </div>
                          </TabPane>
                        </TabContent>
                      </Form>
                    </CardBody>
                  </Card>

                  <div className="mt-4 text-center">
                    <p className="mb-0">
                      Already have an account?{" "}
                      <Link
                        to="/auth/workspace"
                        className="fw-semibold text-primary text-decoration-underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </AuthParticles>
      ) : (
        <Container>
          <AuthLoader />
        </Container>
      )}
    </React.Fragment>
  );
};

export default Register;
