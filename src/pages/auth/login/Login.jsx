import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Container, Input, Label, Button, Form } from "reactstrap";
import * as Yup from "yup";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import "./login.scss";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";

import avatar1 from "../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../../assets/images/users/avatar-7.jpg";
import { Api } from "../../../common/api/Api";
import { BaseURL, getBaseUrlFromDomain } from "../../../common/api/BaseURL";
import axios from "axios";
import { GetGlobalVersion } from "../../../meta/GetGlobalVersion";
import { toast } from "react-toastify";
import {
  layoutModeTypes,
  leftsidbarSizeTypes,
} from "../../../layout/Constants";
import { changeLeftsidebarSizeTypeAction } from "../../../redux/reducers/ChildReducer/LayoutReducer";
import { setMyProfileDataReducer } from "../../../redux/reducers/ChildReducer/MyProfileReducer";
import AuthLoader from "../loader/AuthLoader";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { generateToken, messaging } from "../../../firebase";
import { deleteToken } from "firebase/messaging";
import { setShowAttendanceTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { changeLayoutMode } from "../../../layout/HtmlLayoutHelpers";

const HERO_WORDS = ["people", "attendance", "payroll", "clients"];

const MODULES = [
  { label: "HRMS", icon: "ri-team-line", tone: "success" },
  { label: "Attendance", icon: "ri-fingerprint-line", tone: "info" },
  { label: "Payroll", icon: "ri-wallet-3-line", tone: "warning" },
  { label: "CRM", icon: "ri-briefcase-4-line", tone: "primary" },
];

const Login = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState([]);
  const [passwordShow, setPasswordShow] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const words = setInterval(
      () => setWordIndex((i) => (i + 1) % HERO_WORDS.length),
      2600,
    );
    return () => {
      clearInterval(clock);
      clearInterval(words);
    };
  }, []);

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  useEffect(() => {
    dispatch(setLoaderVisible(false));
  }, [dispatch]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,

    initialValues: {
      email: userLogin.email || "",
      password: userLogin.password || "",
    },
    validate,
    // validationSchema: Yup.object({
    //   email: Yup.string().trim().required("Please Enter Your Email"),
    //   password: Yup.string().trim().required("Please Enter Your Password"),
    // }),
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .required("Please Enter Your Email")
        .transform((value) => (value ? value.trim().toLowerCase() : value))
        // .max(50, "Email must not exceed 50 characters")
        .max(50, "Enter a valid email address")
        .matches(
          // /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)+$/,
          /^(?!.*\.\.)([a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,13}$/,
          "Enter a valid email address",
        ),
      password: Yup.string().trim().required("Please Enter Your Password"),

      // .max(20, "Password must not exceed 20 characters")
      // .min(8,"Password must be at least 8 characters long")
    }),
    onSubmit: (values) => {
      dispatch(setLoaderVisible(true));

      // localStorage.setItem("token", "abc");
      values["username"] = values.email;
      values["device_type"] = 1;

      const domain = window.location.hostname.split(".")[0];

      let login_url = "";
      let subscribe_topic_url = "";

      if (
        !!process.env.REACT_APP_LC_PLATFORM &&
        process.env.REACT_APP_LC_PLATFORM === "local"
      ) {
        login_url = `${getBaseUrlFromDomain()}employee/auth/login/`;
        subscribe_topic_url = `${getBaseUrlFromDomain()}employee/subscribe-topic/`;
      } else {
        login_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/employee/auth/login/`;
        subscribe_topic_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/employee/subscribe-topic/`;
      }

      axios({
        method: "POST",
        url: login_url,
        data: values,
      })
        .then(async (res) => {
          try {
            await deleteToken(messaging);
          } catch (deleteError) {}

          let res_data = res?.data;
          let profile_data = res_data?.profile_data;

          try {
            const newFCMToken = await generateToken();

            axios({
              method: "POST",
              url: subscribe_topic_url,
              headers: {
                Authorization: `Bearer ${res_data?.token?.access}`,
              },
              data: {
                fcm_token: newFCMToken,
              },
            })
              .then()
              .catch((error) => {
                dispatch(setLoaderVisible(false));
                // toast.error(error?.response?.data?.message);
              });
          } catch (err) {}
          localStorage.setItem("lint_hr_v", res_data.meta_version);
          localStorage.setItem(
            "lint_hr_globaldata",
            JSON.stringify(res_data?.meta_data),
          );
          localStorage.setItem(
            "lint_hr_token",
            JSON.stringify(res_data?.token),
          );
          localStorage.setItem(
            "lint_hr_profile_data",
            JSON.stringify(profile_data),
          );
          localStorage.setItem(
            "user_perm_list",
            JSON.stringify([
              "organization",
              "employee",
              "leave_type",
              "custom_field",
            ]),
          );
          dispatch(setMyProfileDataReducer(profile_data));
          dispatch(setShowAttendanceTimer(profile_data?.can_web_checkin));
          // localStorage.setItem(
          //   "left_side_bar_type",
          //   leftsidbarSizeTypes.DEFAULT
          // );
          dispatch(
            changeLeftsidebarSizeTypeAction(leftsidbarSizeTypes.DEFAULT),
          );

          localStorage.setItem("layoutMode", layoutModeTypes?.LIGHTMODE);
          dispatch(changeLayoutMode(layoutModeTypes?.LIGHTMODE));

          setTimeout(() => {
            toast.success(res?.data?.message);
            navigate("/dashboard");
            dispatch(setLoaderVisible(false));
          }, 1000);
        })
        // .catch((err) => {
        //   dispatch(setLoaderVisible(false));
        //   toast.error(err?.response?.data?.message);
        // });
        .catch((err) => {
          dispatch(setLoaderVisible(false));

          const errorMessage =
            err?.response?.data?.message || "Invalid Email or Password";

          toast.error(errorMessage);
        });
    },
  });

  document.title = `Login | ${MetaTitle || "Lint HR"}`;

  // useEffect(() => {
  //   const domain = window.location.hostname.split(".")[0];
  //   if (!!domain) {
  //     let validate_domain_url = "";

  //     if (
  //       !!process.env.REACT_APP_LC_PLATFORM &&
  //       process.env.REACT_APP_LC_PLATFORM === "local"
  //     ) {
  //       validate_domain_url = `${getBaseUrlFromDomain()}api/auth/validate-domain/`;
  //     } else {
  //       validate_domain_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/api/auth/validate-domain/`;
  //     }

  //     axios({
  //       method: "POST",
  //       url: validate_domain_url,
  //       data: {
  //         domain: domain,
  //       },
  //     })
  //       .then((res) => {
  //         // window.location.href = "/dashboard";
  //       })
  //       .catch((error) => {
  //         console.log("Validate Domain Error - ", error);
  //         if (!!error?.response && error.response.status === 404) {
  //           window.location.href = "/auth/workspace";
  //         } else {
  //           toast?.error(error?.response?.data?.message);
  //         }
  //       });
  //   }
  // }, []);

  useEffect(() => {
    const domain = window.location.hostname.split(".")[0];

    const domainRegex = /^[a-zA-Z0-9-]+$/;

    if (!domain || domain.length < 1) {
      toast.error("Domain is required");
      return;
    }

    if (!domainRegex.test(domain)) {
      toast.error("Domain can contain only letters, numbers and hyphens (-)");
      return;
    }

    if (domain.startsWith("-") || domain.endsWith("-")) {
      toast.error("Domain cannot start or end with a hyphen (-)");
      return;
    }

    let validate_domain_url = "";

    if (
      !!process.env.REACT_APP_LC_PLATFORM &&
      process.env.REACT_APP_LC_PLATFORM === "local"
    ) {
      validate_domain_url = `${getBaseUrlFromDomain()}api/auth/validate-domain/`;
    } else {
      validate_domain_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/api/auth/validate-domain/`;
    }

    axios({
      method: "POST",
      url: validate_domain_url,
      data: {
        domain,
      },
    })
      .then((res) => {})
      .catch((error) => {
        console.log("Validate Domain Error - ", error);

        if (!!error?.response && error.response.status === 404) {
          // window.location.href = "/auth/workspace";
          console.log("Validate Domain Error - ", error);
        } else {
          toast.error(error?.response?.data?.message);
        }
      });
  }, []);

  const hours = now.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  const clockText = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateText = now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short" });
  const emailInvalid = !!(validation.touched.email && validation.errors.email);
  const passwordInvalid = !!(validation.touched.password && validation.errors.password);

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
                  All-in-one workspace
                </span>
                <h1>
                  Run your <span className="lgn-word" key={wordIndex}>{HERO_WORDS[wordIndex]}</span>
                  <br />
                  from a single place.
                </h1>
                <p>
                  Track attendance in real time, manage people and payroll, and keep every client
                  deal moving — all inside Lint HR.
                </p>
              </div>

              <div className="lgn-stage">
                {/* live check-in */}
                <div className="lgn-card lgn-clock">
                  <div className="lgn-card-head">
                    <span className="lgn-live"><span />Live</span>
                    <span className="lgn-muted">{dateText}</span>
                  </div>
                  <div className="lgn-clock-time">{clockText}</div>
                  <div className="lgn-clock-row">
                    <div className="lgn-ring">
                      <svg viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" className="lgn-ring-track" />
                        <circle cx="22" cy="22" r="18" className="lgn-ring-fill" />
                      </svg>
                      <i className="ri-fingerprint-line" />
                    </div>
                    <div>
                      <div className="lgn-clock-label">Checked in · 09:02 AM</div>
                      <div className="lgn-muted">6h 24m worked today</div>
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

                {/* CRM pipeline */}
                <div className="lgn-card lgn-pipe">
                  <div className="lgn-card-head">
                    <span className="lgn-card-title"><i className="ri-briefcase-4-line" />CRM pipeline</span>
                    <span className="lgn-muted">This month</span>
                  </div>
                  {[
                    { label: "Leads", value: 86, tone: "info" },
                    { label: "Proposals", value: 58, tone: "warning" },
                    { label: "Won", value: 34, tone: "success" },
                  ].map((s, i) => (
                    <div key={s.label} className="lgn-pipe-row">
                      <span>{s.label}</span>
                      <div className="lgn-pipe-track">
                        <span className={`is-${s.tone}`} style={{ "--w": `${s.value}%`, "--d": `${0.4 + i * 0.15}s` }} />
                      </div>
                      <b>{s.value}</b>
                    </div>
                  ))}
                </div>

                {/* toast */}
                <div className="lgn-toast">
                  <span className="lgn-toast-icon"><i className="ri-check-line" /></span>
                  <div>
                    <div className="lgn-toast-title">Leave approved</div>
                    <div className="lgn-muted">Priya · 2 days · Casual leave</div>
                  </div>
                </div>
              </div>

              <div className="lgn-foot">
                <div className="lgn-avatars">
                  {[avatar1, avatar2, avatar3, avatar4, avatar5].map((src, i) => (
                    <img key={i} src={src} alt="" />
                  ))}
                  <span>+2k</span>
                </div>
                <div className="lgn-foot-text">
                  <b>Trusted by growing teams</b>
                  <span>for attendance, payroll and client work</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ───────── Sign in ───────── */}
          <main className="lgn-panel">
            <div className="lgn-form-wrap">
              <div className="lgn-mobile-brand">
                <img src={logoDark} alt="Lint HR" height="24" />
              </div>

              <div className="lgn-form-head">
                <span className="lgn-hello">{greeting} 👋</span>
                <h2>Welcome back</h2>
                <p>Sign in to your Lint HR workspace to continue.</p>
              </div>

              <div className="lgn-modules">
                {MODULES.map((m) => (
                  <span key={m.label} className={`lgn-module is-${m.tone}`}>
                    <i className={m.icon} />
                    {m.label}
                  </span>
                ))}
              </div>

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
                <div className="lgn-field">
                  <Label htmlFor="email" className="lgn-label">Work email</Label>
                  <div className={`lgn-input ${emailInvalid ? "is-invalid" : ""}`}>
                    <i className="ri-mail-line lgn-input-icon" />
                    <Input
                      id="email"
                      name="email"
                      placeholder="you@company.com"
                      type="text"
                      autoComplete="username"
                      onChange={validation.handleChange}
                      onBlur={(e) => {
                        const value = e.target.value.trim().toLowerCase();
                        validation.setFieldValue("email", value);
                        validation.handleBlur(e);
                      }}
                      value={validation.values.email || ""}
                      invalid={emailInvalid}
                      data-testid="login-email-input"
                    />
                  </div>
                  {emailInvalid && (
                    <div className="lgn-error" data-testid="login-email-error">
                      <i className="ri-error-warning-line" />
                      {validation.errors.email}
                    </div>
                  )}
                </div>

                <div className="lgn-field">
                  <div className="lgn-label-row">
                    <Label htmlFor="password-input" className="lgn-label">Password</Label>
                    <Link to="/auth/forgot-password" className="lgn-link" data-testid="login-forgot-password-link">Forgot password?</Link>
                  </div>
                  <div className={`lgn-input ${passwordInvalid ? "is-invalid" : ""}`}>
                    <i className="ri-lock-2-line lgn-input-icon" />
                    <Input
                      id="password-input"
                      name="password"
                      value={validation.values.password || ""}
                      type={passwordShow ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      invalid={passwordInvalid}
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      className="lgn-eye"
                      id="password-addon"
                      onClick={() => setPasswordShow(!passwordShow)}
                      aria-label={passwordShow ? "Hide password" : "Show password"}
                      data-testid="login-password-toggle-button"
                    >
                      <i className={passwordShow ? "ri-eye-off-line" : "ri-eye-line"} />
                    </button>
                  </div>
                  {passwordInvalid && (
                    <div className="lgn-error" data-testid="login-password-error">
                      <i className="ri-error-warning-line" />
                      {validation.errors.password}
                    </div>
                  )}
                </div>

                <Button type="submit" className="lgn-submit" data-testid="login-sign-in-button">
                  <span>Sign in</span>
                  <i className="ri-arrow-right-line" />
                </Button>

                <div className="lgn-divider"><span>or</span></div>

                <Link to="/auth/workspace/" className="lgn-workspace" data-testid="login-find-workspace-link">
                  <span className="lgn-workspace-icon"><i className="ri-building-2-line" /></span>
                  <span className="lgn-workspace-text">
                    <b>Find your workspace</b>
                    <small>Not sure which company URL to use?</small>
                  </span>
                  <i className="ri-arrow-right-s-line" />
                </Link>
              </Form>

              <div className="lgn-panel-foot">
                <span><i className="ri-shield-check-line" />Secure, encrypted sign in</span>
                <span>© {now.getFullYear()} Lint HR · Crafted with <i className="ri-heart-3-fill lgn-heart" /> by Lintcloud</span>
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

export default Login;
