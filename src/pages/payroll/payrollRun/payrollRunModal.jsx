import React, { useState } from "react";
import { Modal, Form, Input, Spinner } from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import "./payrollRunModal.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

const REMARK_SUGGESTIONS = ["Regular cycle", "Off-cycle run", "Arrears adjustment", "Bonus payout"];
const REMARKS_MAX = 250;

const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const PayrollRunModal = ({ isOpen, toggle, onSuccess }) => {
  const now = new Date();
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(now.getFullYear());
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const yearIdx = YEARS.indexOf(year);

  const period = month !== null ? (() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    let workingDays = 0;
    for (let d = 1; d <= end.getDate(); d++) {
      if (new Date(year, month, d).getDay() !== 0) workingDays++;
    }
    return { start, end, days: end.getDate(), workingDays };
  })() : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (month === null || !year) {
      toast.warning("Please specify both Month and Year operations.");
      return;
    }

    setSubmitting(true);
    Api({
      method: "POST",
      url: "payroll/payroll-run/",
      data: { month: month + 1, year, remarks },
    })
      .then(() => {
        toast.success("Payroll Processed Successfully");
        onSuccess();
        handleClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.detail || "Failed to execute calculations.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleClose = () => {
    setMonth(null);
    setYear(new Date().getFullYear());
    setRemarks("");
    toggle();
  };

  const applySuggestion = (s) => {
    const label = month !== null ? `${MONTHS[month]} ${year} – ${s}` : s;
    setRemarks(label.slice(0, REMARKS_MAX));
  };

  return (
    <Modal data-testid="payroll-run-create-dialog" isOpen={isOpen} toggle={handleClose} centered className="prm-modal" contentClassName="prm-content">
      <Form onSubmit={handleSubmit}>
        <div className="prm-hero">
          <span className="prm-hero-icon"><i className="ri-bank-line"></i></span>
          <div className="prm-hero-text">
            <h5>Run New Payroll Cycle</h5>
            <p>Pick the pay period and execute salary computation</p>
          </div>
          <button data-testid="payroll-run-create-close-button" type="button" className="prm-close" onClick={handleClose} aria-label="Close">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="prm-body">
          <div className="prm-section-head">
            <span className="prm-label"><i className="ri-calendar-2-line"></i>Pay period</span>
            <div className="prm-year">
              <button data-testid="payroll-run-create-previous-year-button" type="button" disabled={yearIdx <= 0} onClick={() => setYear(YEARS[yearIdx - 1])} aria-label="Previous year">
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{year}</span>
              <button data-testid="payroll-run-create-next-year-button" type="button" disabled={yearIdx >= YEARS.length - 1} onClick={() => setYear(YEARS[yearIdx + 1])} aria-label="Next year">
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>

          <div className="prm-months" role="radiogroup" aria-label="Target month">
            {MONTHS.map((m, i) => {
              const isCurrent = i === now.getMonth() && year === now.getFullYear();
              const isActive = month === i;
              return (
                <button
                  data-testid={testId("payroll-run-create-run-new-payroll-cycle", itemTestKey(m), "button")}
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`prm-month ${isActive ? "is-active" : ""} ${isCurrent ? "is-current" : ""}`}
                  onClick={() => setMonth(i)}
                >
                  <span className="prm-month-short">{m.slice(0, 3)}</span>
                  <span className="prm-month-num">{String(i + 1).padStart(2, "0")}</span>
                  {isCurrent && <span className="prm-month-dot" title="Current month"></span>}
                </button>
              );
            })}
          </div>

          <div className={`prm-summary ${period ? "is-ready" : ""}`}>
            {period ? (
              <>
                <i className="ri-calendar-check-line prm-summary-icon"></i>
                <div className="prm-summary-main">
                  <b>{MONTHS[month]} {year}</b>
                  <span>{fmtDate(period.start)} → {fmtDate(period.end)}</span>
                </div>
                <div className="prm-summary-stats">
                  <span><b>{period.days}</b> days</span>
                  <span><b>{period.workingDays}</b> excl. Sundays</span>
                </div>
              </>
            ) : (
              <>
                <i className="ri-information-line prm-summary-icon"></i>
                <div className="prm-summary-main">
                  <b>No month selected</b>
                  <span>Choose a month above to preview the pay period</span>
                </div>
              </>
            )}
          </div>

          <div className="prm-section-head mt-4">
            <span className="prm-label"><i className="ri-sticky-note-line"></i>Remarks <em>optional</em></span>
            <span className="prm-counter">{remarks.length}/{REMARKS_MAX}</span>
          </div>
          <Input
            data-testid="payroll-run-create-remarks-textarea"
            type="textarea"
            rows="3"
            maxLength={REMARKS_MAX}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. May regular cycle payments"
            className="prm-textarea"
          />
          <div className="prm-chips">
            {REMARK_SUGGESTIONS.map((s) => (
              <button data-testid={testId("payroll-run-create-run-new-payroll-cycle", itemTestKey(s), "button")} key={s} type="button" className="prm-chip" onClick={() => applySuggestion(s)}>
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div className="prm-footer">
          <button data-testid="payroll-run-create-cancel-button" type="button" className="it-btn is-soft" onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button data-testid="payroll-run-create-play-button" type="submit" className="it-btn is-primary prm-run" disabled={submitting || month === null}>
            {submitting ? <Spinner size="sm" /> : <i className="ri-play-circle-line"></i>}
            {submitting ? "Running…" : month !== null ? `Run ${MONTHS[month].slice(0, 3)} ${year} Payroll` : "Execute Payroll Run"}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default PayrollRunModal;
