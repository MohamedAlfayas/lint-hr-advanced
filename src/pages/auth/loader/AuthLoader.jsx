import React, { useEffect, useState } from "react";
import logo from "../../../assets/images/logo-dark.png";
import animation from "../loader/animation/Animation-login-loader.json";
import Lottie from "react-lottie";
import "./authLoader.scss";

const TASKS = [
  { label: "Preparing your workspace", icon: "ri-building-2-line" },
  { label: "Syncing people & attendance", icon: "ri-fingerprint-line" },
  { label: "Loading payroll & CRM", icon: "ri-briefcase-4-line" },
  { label: "Securing your session", icon: "ri-shield-check-line" },
];

const TASK_INTERVAL = 2200;

const lottieOptions = {
  loop: true,
  autoplay: true,
  animationData: animation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid meet",
  },
};

const AuthLoader = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, TASKS.length - 1)),
      TASK_INTERVAL,
    );
    return () => clearInterval(timer);
  }, []);

  const progress = Math.round(((step + 0.6) / TASKS.length) * 100);

  return (
    <div className="alx" role="status" aria-live="polite">
      <span className="alx-blob is-a" />
      <span className="alx-blob is-b" />
      <span className="alx-blob is-c" />
      <span className="alx-grid" />

      <div className="alx-card">
        <div className="alx-brand">
          <img src={logo} alt="Lint HR" height="22" />
          <span className="alx-live">
            <span />
            Starting up
          </span>
        </div>

        <div className="alx-art">
          <span className="alx-art-glow" />
          <Lottie options={lottieOptions} height={320} width={320} isClickToPauseDisabled />
        </div>

        <h2 className="alx-title">One moment, your site is starting up!</h2>
        <p className="alx-sub">
          Our robots are working on your Lint HR site. This won't take more than a minute —
          you'll be taken there once it's ready.
        </p>

        <div className="alx-progress">
          <div className="alx-progress-head">
            <span key={step} className="alx-status">{TASKS[step].label}…</span>
            <b>{progress}%</b>
          </div>
          <div className="alx-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <ul className="alx-tasks">
          {TASKS.map((t, i) => {
            const state = i < step ? "is-done" : i === step ? "is-active" : "";
            return (
              <li key={t.label} className={state}>
                <span className="alx-task-icon">
                  {i < step ? (
                    <i className="ri-check-line" />
                  ) : i === step ? (
                    <span className="alx-spin" />
                  ) : (
                    <i className={t.icon} />
                  )}
                </span>
                {t.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="alx-foot">
        <i className="ri-shield-check-line" />
        Secure connection · © {new Date().getFullYear()} Lint HR by Lintcloud
      </div>
    </div>
  );
};

export default AuthLoader;
