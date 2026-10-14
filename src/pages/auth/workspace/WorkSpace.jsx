import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Label, Button, Form, Spinner } from "reactstrap";
import { MetaTitle } from "../../../common/data/MetaTitle";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { getBaseUrlFromDomain } from "../../../common/api/BaseURL";
import { buildRedirectUrl } from "../../../common/api/BuildRedirectURL";
import "../login/login.scss";

// Letters, numbers, spaces, . , - & ( ) ' _
const COMPANY_NAME_ALLOWED = /^[A-Za-z0-9\s.,\-&()'_]+$/;
const COMPANY_NAME_SANITIZE = /[^A-Za-z0-9\s.,\-&()'_]/g;
const COMPANY_NAME_MAX = 100;

const COMPANY_NAME_MAX_ERROR =
  "Company name cannot exceed 100 characters";

const STEPS = [
  { title: "Find your company", sub: "Enter the company name", icon: "ri-building-2-line" },
  { title: "Sign in securely", sub: "Use your work email", icon: "ri-shield-user-line" },
  { title: "Start tracking", sub: "Attendance, payroll & CRM", icon: "ri-fingerprint-line" },
];

const initialsOf = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const WorkSpace = () => {
  const [company_name, setDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [maxLengthError, setMaxLengthError] = useState("");
  const [loading, setLoading] = useState(false);

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
        url = `https://apps.${process.env.REACT_APP_BASE_URL}/api/auth/validate-company/`;
      }

      setLoading(true);
      axios({
        method: "POST",
        url: url,
        data: {
          company_name: trimmedName,
        },
      })
        .then((res) => {
          setErrorMessage(null);
          if (res?.data && res?.data?.domain) {
            window.location.href = buildRedirectUrl(res?.data?.domain);
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Err - ", err);
          setLoading(false);
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

  const typedName = (company_name || "").trim();
  const fieldError =
    maxLengthError ||
    (validation.touched.company_name && validation.errors.company_name) ||
    "";
  const activeStep = typedName ? 1 : 0;
  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

  return (
    <React.Fragment>
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
                Your company, your workspace
              </span>
              <h1>
                One workspace for
                <br />
                your <span className="lgn-word">whole team.</span>
              </h1>
              <p>
                Every company gets its own secure Lint HR space — people, attendance,
                payroll and clients, all in one place.
              </p>
            </div>

            <div className="lgn-stage">
              {/* live workspace preview */}
              <div className="lgn-card lgn-clock lgn-ws-card">
                <div className="lgn-card-head">
                  <span className="lgn-card-title"><i className="ri-building-2-line" />Workspace</span>
                  <span className={`lgn-ws-state ${typedName ? "is-on" : ""}`}>
                    <span />
                    {typedName ? "Ready" : "Waiting"}
                  </span>
                </div>
                <div className="lgn-ws-company">
                  <span className="lgn-ws-avatar">
                    {typedName ? initialsOf(typedName) : <i className="ri-building-4-line" />}
                  </span>
                  <div className="lgn-ws-meta">
                    <b>{typedName || "Your company"}</b>
                    <span className="lgn-muted">Lint HR workspace</span>
                  </div>
                </div>
                <div className="lgn-ws-tags">
                  <span><i className="ri-fingerprint-line" />Attendance</span>
                  <span><i className="ri-briefcase-4-line" />CRM</span>
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

              {/* steps */}
              <div className="lgn-card lgn-pipe lgn-steps">
                <div className="lgn-card-head">
                  <span className="lgn-card-title"><i className="ri-route-line" />Get started</span>
                  <span className="lgn-muted">3 steps</span>
                </div>
                {STEPS.map((s, i) => (
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

              {/* toast */}
              <div className="lgn-toast">
                <span className="lgn-toast-icon"><i className="ri-check-line" /></span>
                <div>
                  <div className="lgn-toast-title">Checked in</div>
                  <div className="lgn-muted">Arjun · 09:02 AM · Office</div>
                </div>
              </div>
            </div>

            <div className="lgn-foot">
              <div className="lgn-foot-text">
                <b>Secure & isolated</b>
                <span>each company's data lives in its own workspace</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ───────── Find workspace ───────── */}
        <main className="lgn-panel">
          <div className="lgn-form-wrap">
            <div className="lgn-mobile-brand">
              <img src={logoDark} alt="Lint HR" height="24" />
            </div>

            <div className="lgn-form-head lgn-ws-head">
              <span className="lgn-hello">{greeting} 👋</span>
              <h2>Find your workspace</h2>
              <p>Enter your company name to continue to your Lint HR account.</p>
            </div>

            {errorMessage && (
              <div className="lgn-alert">
                <i className="ri-error-warning-line" />
                {errorMessage}
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
              <div className="lgn-field">
                <Label htmlFor="company_name" className="lgn-label">Company name</Label>
                <div className={`lgn-input ${fieldError ? "is-invalid" : ""}`}>
                  <i className="ri-building-2-line lgn-input-icon" />
                  <Input
                    name="company_name"
                    id="company_name"
                    placeholder="e.g. Lintcloud Technologies"
                    type="text"
                    autoComplete="organization"
                    autoFocus
                    onChange={handleCompanyNameChange}
                    onBlur={handleCompanyNameBlur}
                    value={company_name || ""}
                    invalid={!!fieldError}
                    data-testid="workspace-company-name-input"
                  />
                  {typedName && !fieldError && (
                    <span className="lgn-eye lgn-ws-ok"><i className="ri-checkbox-circle-fill" /></span>
                  )}
                </div>
                {fieldError ? (
                  <div className="lgn-error" data-testid="workspace-company-name-error">
                    <i className="ri-error-warning-line" />
                    {fieldError}
                  </div>
                ) : (
                  <div className="lgn-hint">
                    <i className="ri-information-line" />
                    The name your organisation registered with Lint HR.
                  </div>
                )}
              </div>

              <Button type="submit" className="lgn-submit" disabled={loading} data-testid="workspace-continue-button">
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Finding workspace…</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <i className="ri-arrow-right-line" />
                  </>
                )}
              </Button>

              <div className="lgn-divider"><span>new here?</span></div>

              <Link to="/auth/register" className="lgn-workspace" data-testid="workspace-create-account-link">
                <span className="lgn-workspace-icon"><i className="ri-user-add-line" /></span>
                <span className="lgn-workspace-text">
                  <b>Create an account</b>
                  <small>Set up Lint HR for your company</small>
                </span>
                <i className="ri-arrow-right-s-line" />
              </Link>
            </Form>

            <div className="lgn-panel-foot">
              <span><i className="ri-shield-check-line" />Secure, encrypted connection</span>
              <span>© {new Date().getFullYear()} Lint HR · Crafted with <i className="ri-heart-3-fill lgn-heart" /> by Lintcloud</span>
            </div>
          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

export default WorkSpace;
