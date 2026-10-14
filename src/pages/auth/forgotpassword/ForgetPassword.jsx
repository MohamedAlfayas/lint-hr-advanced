import PropTypes from "prop-types";
import React from "react";
import { Input, Label, Form, Button } from "reactstrap";

import { Link } from "react-router-dom";
import withRouter from "../../../common/js/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";
import "../login/login.scss";
import "./forgotPassword.scss";
const RESET_STEPS = [
  { title: "Enter your email", sub: "The one you sign in with", icon: "ri-mail-line" },
  { title: "Open the reset link", sub: "Check your inbox", icon: "ri-link" },
  { title: "Set a new password", sub: "And you're back in", icon: "ri-lock-password-line" },
];

const ForgetPassword = () => {
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
    },
    validate,
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
    }),
    onSubmit: (values) => {
      console.log("Forgot Password value");
    },
  });

  document.title = `Reset Password | ${MetaTitle || "Lint HR"}`;
  const emailInvalid = !!(validation.touched.email && validation.errors.email);
  const activeStep = validation.values.email && !validation.errors.email ? 1 : 0;

  return (
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
              Account recovery
            </span>
            <h1>
              Locked out?
              <br />
              We've <span className="lgn-word">got you.</span>
            </h1>
            <p>
              Reset your password in a few clicks and get straight back to your team,
              attendance and clients.
            </p>
          </div>

          <div className="lgn-stage">
            {/* reset email preview */}
            <div className="lgn-card lgn-clock fp-mail">
              <div className="lgn-card-head">
                <span className="lgn-card-title"><i className="ri-mail-open-line" />Inbox</span>
                <span className="lgn-muted">just now</span>
              </div>
              <div className="fp-mail-row">
                <span className="fp-mail-avatar"><i className="ri-shield-keyhole-line" /></span>
                <div className="fp-mail-meta">
                  <b>Reset your Lint HR password</b>
                  <span className="lgn-muted">Click the secure link to continue…</span>
                </div>
              </div>
              <span className="fp-mail-btn">Reset password</span>
            </div>

            {/* security */}
            <div className="lgn-card lgn-chart fp-secure">
              <div className="lgn-card-head">
                <span className="lgn-card-title"><i className="ri-shield-check-line" />Protected</span>
              </div>
              <div className="fp-shield">
                <span className="fp-shield-ring" />
                <span className="fp-shield-ring is-2" />
                <i className="ri-lock-2-fill" />
              </div>
              <ul className="fp-checks">
                <li><i className="ri-check-line" />Encrypted link</li>
                <li><i className="ri-check-line" />Expires automatically</li>
                <li><i className="ri-check-line" />One-time use</li>
              </ul>
            </div>

            {/* steps */}
            <div className="lgn-card lgn-pipe lgn-steps">
              <div className="lgn-card-head">
                <span className="lgn-card-title"><i className="ri-route-line" />How it works</span>
                <span className="lgn-muted">3 steps</span>
              </div>
              {RESET_STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className={`lgn-step ${i < activeStep ? "is-done" : ""} ${i === activeStep ? "is-active" : ""}`}
                >
                  <span className="lgn-step-dot">
                    <i className={i < activeStep ? "ri-check-line" : s.icon} />
                  </span>
                  <div>
                    <b>{s.title}</b>
                    <span className="lgn-muted">{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lgn-toast fp-toast">
              <span className="lgn-toast-icon"><i className="ri-lock-unlock-line" /></span>
              <div>
                <div className="lgn-toast-title">Password updated</div>
                <div className="lgn-muted">You can sign in again</div>
              </div>
            </div>
          </div>

          <div className="lgn-foot">
            <div className="lgn-foot-text">
              <b>Your account stays safe</b>
              <span>we never share or reveal your password</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────── Reset form ───────── */}
      <main className="lgn-panel">
        <div className="lgn-form-wrap">
          <div className="lgn-mobile-brand">
            <img src={logoDark} alt="Lint HR" height="24" />
          </div>

          <div className="fp-badge">
            <span className="fp-badge-ring" />
            <i className="ri-key-2-line" />
          </div>

          <div className="lgn-form-head fp-head">
            <span className="lgn-hello">Forgot password?</span>
            <h2>Reset your password</h2>
            <p>Enter the email linked to your Lint HR account and we'll send you a reset link.</p>
          </div>

          <div className="fp-note">
            <i className="ri-information-line" />
            The reset link will be sent to this email.
          </div>

          <Form
            className="lgn-form"
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            noValidate
          >
            <div className="lgn-field">
              <Label htmlFor="fp-email" className="lgn-label">Work email</Label>
              <div className={`lgn-input ${emailInvalid ? "is-invalid" : ""}`}>
                <i className="ri-mail-line lgn-input-icon" />
                <Input
                  id="fp-email"
                  name="email"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.email || ""}
                  invalid={emailInvalid}
                  data-testid="forgot-password-email-input"
                />
              </div>
              {emailInvalid && (
                <div className="lgn-error" data-testid="forgot-password-email-error">
                  <i className="ri-error-warning-line" />
                  {validation.errors.email}
                </div>
              )}
            </div>

            <Button type="submit" className="lgn-submit" data-testid="forgot-password-send-link-button">
              <i className="ri-send-plane-2-line" />
              <span>Send reset link</span>
            </Button>
          </Form>

          <Link to="/auth/login" className="fp-back" data-testid="forgot-password-back-to-login-link">
            <i className="ri-arrow-left-line" />
            Wait, I remember my password — <b>Back to sign in</b>
          </Link>

          <div className="lgn-panel-foot">
            <span><i className="ri-shield-check-line" />Secure, encrypted reset</span>
            <span>© {new Date().getFullYear()} Lint HR · Crafted with <i className="ri-heart-3-fill lgn-heart" /> by Lintcloud</span>
          </div>
        </div>
      </main>
    </div>
  );
};

ForgetPassword.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPassword);
