import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Input,
  Label,
  TabContent,
  TabPane,
  Button,
} from "reactstrap";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import * as Yup from "yup";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";
import { toast } from "react-toastify";
import "../login/login.scss";
import "./register.scss";
import axios from "axios";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { getBaseUrlFromDomain } from "../../../common/api/BaseURL";
import AuthLoader from "../loader/AuthLoader";
import { buildRedirectUrl } from "../../../common/api/BuildRedirectURL";
import { testId } from "../../../shared/testing/testId";

defineElement(loadAnimation);

const OTP_LENGTH = 6;

const REG_STEPS = [
  { title: "Your details", sub: "Name, email & password", icon: "ri-user-3-line" },
  { title: "Company workspace", sub: "Name & company URL", icon: "ri-building-2-line" },
  { title: "Verify email", sub: "6-digit code", icon: "ri-mail-check-line" },
];

const STRENGTH = [
  { label: "Too weak", tone: "is-weak" },
  { label: "Weak", tone: "is-weak" },
  { label: "Fair", tone: "is-fair" },
  { label: "Good", tone: "is-good" },
  { label: "Strong", tone: "is-strong" },
];

const passwordScore = (pwd) =>
  [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pwd)).length;

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
            if (res?.data && res?.data?.domain) {
              dispatch(setLoaderVisible(false));
              window.location.href = buildRedirectUrl(res?.data?.domain);
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

  const goToCompanyStep = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please Enter All Details");
    } else if (!isEmailValid(email)) {
      toast.error("Invalid Email Format");
    } else {
      toggleTab(2, 33);
    }
  };

  const score = passwordScore(password);
  const strength = STRENGTH[score];
  const domainPreview = domain || "your-company";
  const otpFilled = otp.filter(Boolean).length;
  const stepIndex = Math.min(activeTab, 4) - 1;

  return (
    <React.Fragment>
      {showLoader === false ? (
        <div className="lgn">
          {/* ───────── Showcase ───────── */}
          <aside className="lgn-hero" aria-hidden="true">
            <span className="lgn-blob is-a" />
            <span className="lgn-blob is-b" />
            <span className="lgn-blob is-c" />
            <span className="lgn-grid" />

            <div className="lgn-hero-inner">
              <div className="lgn-brand">
                <img src={logoLight} alt="" height="24" />
                <span className="lgn-brand-tag">HRMS · Attendance · CRM</span>
              </div>

              <div className="lgn-headline">
                <span className="lgn-eyebrow">
                  <span className="lgn-eyebrow-dot" />
                  Free to get started
                </span>
                <h1>
                  Set up your company
                  <br />
                  in <span className="lgn-word">minutes.</span>
                </h1>
                <p>
                  Create your Lint HR workspace and start tracking attendance, running
                  payroll and managing clients today.
                </p>
              </div>

              <div className="lgn-stage">
                {/* company URL preview */}
                <div className="lgn-card lgn-clock reg-url-card">
                  <div className="reg-browser">
                    <span className="reg-dots"><i /><i /><i /></span>
                    <span className="reg-url">
                      <i className="ri-lock-2-line" />
                      <b>{domainPreview}</b>.linthr.com
                    </span>
                  </div>
                  <div className="lgn-ws-company">
                    <span className="lgn-ws-avatar">
                      {companyName.trim() ? (
                        companyName
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                      ) : (
                        <i className="ri-building-4-line" />
                      )}
                    </span>
                    <div className="lgn-ws-meta">
                      <b>{companyName.trim() || "Your company"}</b>
                      <span className="lgn-muted">
                        {name.trim() ? `Admin · ${name.trim()}` : "Your new workspace"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* team attendance */}
                <div className="lgn-card lgn-chart">
                  <div className="lgn-card-head">
                    <span className="lgn-card-title"><i className="ri-team-line" />Team present</span>
                    <span className="lgn-up"><i className="ri-arrow-up-line" />4.2%</span>
                  </div>
                  <div className="lgn-chart-value">92<small>%</small></div>
                  <div className="lgn-bars">
                    {[62, 78, 70, 88, 94, 84, 92].map((h, i) => (
                      <span key={i} style={{ "--h": `${h}%`, "--d": `${i * 0.08}s` }} />
                    ))}
                  </div>
                  <div className="lgn-bars-days">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* signup progress */}
                <div className="lgn-card lgn-pipe lgn-steps">
                  <div className="lgn-card-head">
                    <span className="lgn-card-title"><i className="ri-route-line" />Your setup</span>
                    <span className="lgn-muted">{Math.min(stepIndex, 3)} / 3 done</span>
                  </div>
                  {REG_STEPS.map((s, i) => (
                    <div
                      key={s.title}
                      className={`lgn-step ${i < stepIndex ? "is-done" : ""} ${i === stepIndex ? "is-active" : ""}`}
                    >
                      <span className="lgn-step-dot">
                        <i className={i < stepIndex ? "ri-check-line" : s.icon} />
                      </span>
                      <div>
                        <b>{s.title}</b>
                        <span className="lgn-muted">{s.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lgn-toast">
                  <span className="lgn-toast-icon"><i className="ri-check-line" /></span>
                  <div>
                    <div className="lgn-toast-title">Workspace created</div>
                    <div className="lgn-muted">Ready in under 2 minutes</div>
                  </div>
                </div>
              </div>

              <div className="lgn-foot">
                <div className="lgn-foot-text">
                  <b>No credit card required</b>
                  <span>set up attendance, payroll and CRM in one place</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ───────── Sign up ───────── */}
          <main className="lgn-panel">
            <div className="lgn-form-wrap">
              <div className="lgn-mobile-brand">
                <img src={logoDark} alt="Lint HR" height="24" />
              </div>

              <div className="lgn-form-head reg-head">
                <span className="lgn-hello">Step into a smarter experience ✨</span>
                <h2>{activeTab === 4 ? "You're all set" : "Create your account"}</h2>
                <p>
                  {activeTab === 1 && "Tell us a little about yourself."}
                  {activeTab === 2 && "Name your company and pick its Lint HR URL."}
                  {activeTab === 3 && "One last step — confirm your email address."}
                  {activeTab === 4 && "Your Lint HR workspace is ready."}
                </p>
              </div>

              {activeTab < 4 && (
                <div className="reg-stepper" style={{ "--p": Math.min(1, (progressbarvalue * 1.5) / 100) }}>
                  <span className="reg-stepper-line" />
                  {REG_STEPS.map((s, i) => {
                    const step = i + 1;
                    const state = activeTab > step ? "is-done" : activeTab === step ? "is-active" : "";
                    return (
                      <button
                        key={s.title}
                        type="button"
                        className={`reg-step ${state}`}
                        data-testid={testId("register-step", s.title, "button")}
                        disabled={step === 3 || step > activeTab + 1}
                        onClick={() => {
                          if (step === 1) toggleTab(1, 0);
                          if (step === 2) goToCompanyStep();
                        }}
                      >
                        <span className="reg-step-num">
                          {activeTab > step ? <i className="ri-check-line" /> : step}
                        </span>
                        <span className="reg-step-label">{s.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <Form
                className="lgn-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
                action="#"
                noValidate
              >
                <TabContent activeTab={activeTab}>
                  {/* ── Step 1: personal details ── */}
                  <TabPane tabId={1}>
                    <div className="lgn-field">
                      <Label htmlFor="reg-name" className="lgn-label">Full name</Label>
                      <div className="lgn-input">
                        <i className="ri-user-3-line lgn-input-icon" />
                        <Input
                          id="reg-name"
                          name="name"
                          placeholder="e.g. Arjun Kumar"
                          type="text"
                          autoComplete="name"
                          onChange={(e) => setName(e.target.value)}
                          onBlur={validation.handleBlur}
                          value={name || ""}
                          data-testid="register-name-input"
                        />
                      </div>
                    </div>

                    <div className="lgn-field">
                      <Label htmlFor="reg-email" className="lgn-label">Work email</Label>
                      <div className={`lgn-input ${email && !isEmailValid(email) ? "is-invalid" : ""}`}>
                        <i className="ri-mail-line lgn-input-icon" />
                        <Input
                          id="reg-email"
                          name="email"
                          placeholder="you@company.com"
                          type="email"
                          autoComplete="email"
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={validation.handleBlur}
                          value={email || ""}
                          data-testid="register-email-input"
                        />
                        {email && isEmailValid(email) && (
                          <span className="lgn-eye lgn-ws-ok"><i className="ri-checkbox-circle-fill" /></span>
                        )}
                      </div>
                    </div>

                    <div className="lgn-field">
                      <Label htmlFor="reg-password" className="lgn-label">Password</Label>
                      <div className="lgn-input">
                        <i className="ri-lock-2-line lgn-input-icon" />
                        <Input
                          id="reg-password"
                          name="password"
                          value={password || ""}
                          type={passwordShow ? "text" : "password"}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={validation.handleBlur}
                          data-testid="register-password-input"
                        />
                        <button
                          type="button"
                          className="lgn-eye"
                          onClick={() => setPasswordShow(!passwordShow)}
                          aria-label={passwordShow ? "Hide password" : "Show password"}
                          data-testid="register-password-toggle-button"
                        >
                          <i className={passwordShow ? "ri-eye-off-line" : "ri-eye-line"} />
                        </button>
                      </div>
                      {password && (
                        <div className={`reg-strength ${strength.tone}`}>
                          <div className="reg-strength-bars">
                            {[0, 1, 2, 3].map((i) => (
                              <span key={i} className={i < score ? "is-on" : ""} />
                            ))}
                          </div>
                          <span>{strength.label}</span>
                        </div>
                      )}
                    </div>

                    <Button type="button" className="lgn-submit" onClick={goToCompanyStep} data-testid="register-continue-button">
                      <span>Continue</span>
                      <i className="ri-arrow-right-line" />
                    </Button>
                  </TabPane>

                  {/* ── Step 2: company ── */}
                  <TabPane tabId={2}>
                    <div className="lgn-field">
                      <Label htmlFor="reg-company" className="lgn-label">Company name</Label>
                      <div className="lgn-input">
                        <i className="ri-building-2-line lgn-input-icon" />
                        <Input
                          id="reg-company"
                          name="companyName"
                          placeholder="e.g. Lintcloud Technologies"
                          type="text"
                          autoComplete="organization"
                          onChange={(e) => setCompanyName(e.target.value)}
                          onBlur={validation.handleBlur}
                          value={companyName || ""}
                          data-testid="register-company-name-input"
                        />
                      </div>
                    </div>

                    <div className="lgn-field">
                      <Label htmlFor="reg-domain" className="lgn-label">Company URL</Label>
                      <div className="lgn-input reg-domain">
                        <i className="ri-global-line lgn-input-icon" />
                        <Input
                          id="reg-domain"
                          name="domain"
                          placeholder="your-company"
                          type="text"
                          onChange={handleDomainChange}
                          value={domain || ""}
                          data-testid="register-domain-input"
                        />
                        <span className="reg-domain-suffix">.linthr.com</span>
                      </div>
                      <div className="lgn-hint">
                        <i className="ri-information-line" />
                        {companyName
                          ? <span>Your team will sign in at <b>https://{domain}.linthr.com</b></span>
                          : "We'll create a unique URL for your team to sign in to Lint HR."}
                      </div>
                    </div>

                    <div className="reg-actions">
                      <button type="button" className="reg-back" onClick={() => toggleTab(1, 0)} data-testid="register-company-back-button">
                        <i className="ri-arrow-left-line" />
                        Back
                      </button>
                      <Button
                        type="button"
                        className="lgn-submit"
                        onClick={(e) => GetOtp(e)}
                        disabled={otpLoading}
                        data-testid="register-get-otp-button"
                      >
                        {otpLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" />
                            <span>Sending code…</span>
                          </>
                        ) : (
                          <>
                            <span>Get OTP</span>
                            <i className="ri-arrow-right-line" />
                          </>
                        )}
                      </Button>
                    </div>
                  </TabPane>

                  {/* ── Step 3: OTP ── */}
                  <TabPane tabId={3}>
                    <div className="reg-otp-head">
                      <span className="reg-otp-icon"><i className="ri-mail-send-line" /></span>
                      <div>
                        <b>Check your inbox</b>
                        <span>We sent a 6-digit code to <strong>{email}</strong></span>
                      </div>
                    </div>

                    <div className="reg-otp" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          aria-label={`Digit ${index + 1}`}
                          className={`${digit ? "is-filled" : ""} ${otpError ? "is-invalid" : ""}`}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          data-testid={`register-otp-digit-${index + 1}-input`}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <div className="lgn-error reg-center" data-testid="register-otp-error">
                        <i className="ri-error-warning-line" />
                        {otpError}
                      </div>
                    )}

                    <div className="reg-resend">
                      {canResend ? (
                        <>
                          Didn't receive the code?
                          <button type="button" onClick={handleResendOtp} data-testid="register-resend-otp-button">
                            <i className="ri-refresh-line" />
                            Resend OTP
                          </button>
                        </>
                      ) : (
                        <>
                          <i className="ri-time-line" />
                          Resend code in <b>{resendTimer}s</b>
                        </>
                      )}
                    </div>

                    <div className="reg-actions">
                      <button type="button" className="reg-back" onClick={() => toggleTab(2, 33)} data-testid="register-otp-back-button">
                        <i className="ri-arrow-left-line" />
                        Back
                      </button>
                      <Button type="submit" className="lgn-submit" disabled={otpFilled < OTP_LENGTH} data-testid="register-verify-button">
                        <i className="ri-shield-check-line" />
                        <span>Verify & continue</span>
                      </Button>
                    </div>
                  </TabPane>

                  {/* ── Step 4: success ── */}
                  <TabPane tabId={4}>
                    <div className="reg-done" data-testid="register-success-message">
                      <lord-icon
                        src="https://cdn.lordicon.com/lupuorrc.json"
                        trigger="loop"
                        colors="primary:#0ab39c,secondary:#405189"
                        style={{ width: "120px", height: "120px" }}
                      ></lord-icon>
                      <h5>Well done!</h5>
                      <p>You have successfully signed up.</p>
                      <span className="reg-done-chip">
                        <span className="spinner-border spinner-border-sm" role="status" />
                        Redirecting to login…
                      </span>
                    </div>
                  </TabPane>
                </TabContent>
              </Form>

              <div className="reg-signin">
                Already have an account?
                <Link to="/auth/workspace" className="lgn-link" data-testid="register-sign-in-link">Sign in</Link>
              </div>

              <div className="lgn-panel-foot">
                <span><i className="ri-shield-check-line" />Your data is encrypted and secure</span>
                <span>© {new Date().getFullYear()} Lint HR · Crafted with <i className="ri-heart-3-fill lgn-heart" /> by Lintcloud</span>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <Container>
          <AuthLoader />
        </Container>
      )}
    </React.Fragment>
  );
};

export default Register;
