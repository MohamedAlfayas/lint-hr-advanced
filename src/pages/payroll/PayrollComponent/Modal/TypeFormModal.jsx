// TypeFormModal.jsx — create/edit a reimbursement type
import React, { useState, useEffect } from "react";
import { Modal } from "reactstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../../common/api/PostApi";
import "./componentModal.scss";
import { testId } from "../../../../shared/testing/testId";

const FREQUENCY_LABELS = {
  monthly:     "Monthly",
  quarterly:   "Quarterly",
  half_yearly: "Half Yearly",
  annually:    "Annually",
};

const COMMON_UNIT_LABELS = ["km", "days", "nights", "meals", "hours", "trips"];

const stripNumbers = (value) => value.replace(/[0-9]/g, "");

const emptyType = () => ({
  id: 0, name: "", description: "",
  calculation_mode: "flat", meta: {},
  max_amount_per_claim: "", max_amount_per_period: "",
  frequency: "monthly", is_taxable: false,
  receipt_required: true, is_active: true,
});

const TypeFormModal = ({ isOpen, toggle, initial, policyId, onSaved }) => {
  const dispatch = useDispatch();
  const [form, setForm]     = useState(emptyType());
  const [errors, setErrors] = useState({});
  const isEdit = !!(initial && initial.id);

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? { ...emptyType(), ...initial } : emptyType());
      setErrors({});
    }
  }, [isOpen, initial]);

  const set     = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setMeta = (k, v) => setForm((f) => ({ ...f, meta: { ...f.meta, [k]: v } }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (/\d/.test(form.name)) e.name = "Name cannot contain numbers";

    if (form.calculation_mode === "rate_x_units") {
      if (!form.meta?.unit_label?.trim()) e.unit_label = "Unit label is required";
      if (!form.meta?.rate || parseFloat(form.meta.rate) <= 0) e.rate = "Rate must be > 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    dispatch(setLoaderVisible(true));
    try {
      const payload = {
        id:    isEdit ? initial.id : 0,
        policy: policyId,
        name:  form.name.trim(),
        description:      form.description,
        calculation_mode: form.calculation_mode,
        meta: form.calculation_mode === "rate_x_units"
          ? {
              unit_label: form.meta.unit_label,
              rate:       parseFloat(form.meta.rate),
              rate_label: `₹${form.meta.rate} / ${form.meta.unit_label}`,
            }
          : {},
        max_amount_per_claim:  parseFloat(form.max_amount_per_claim)  || 0,
        max_amount_per_period: parseFloat(form.max_amount_per_period) || 0,
        frequency:        form.frequency,
        is_taxable:       form.is_taxable,
        receipt_required: form.receipt_required,
        is_active:        form.is_active,
      };

      const res = await PostApi("payroll/reimbursement-type/", payload, false);
      if (res.status === 200) {
        toast.success(res.data.message || "Saved successfully");
        onSaved(res.data.data);
        toggle();
      } else {
        toast.error(res.data.message || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  const isRate = form.calculation_mode === "rate_x_units";
  const unit = form.meta?.unit_label || "";
  const rate = form.meta?.rate || "";
  const periodLabel = FREQUENCY_LABELS[form.frequency];
  const inr = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const claimCap = parseFloat(form.max_amount_per_claim) || 0;
  const periodCap = parseFloat(form.max_amount_per_period) || 0;

  const toggles = [
    ["receipt_required", "Receipt required", "Employee must attach a bill", "ri-file-shield-2-line"],
    ["is_taxable", "Taxable", "Added to taxable income", "ri-percent-line"],
    ["is_active", "Active", "Available for new claims", "ri-checkbox-circle-line"],
  ];

  return (
    <Modal data-testid="pay-type-dialog" isOpen={isOpen} toggle={toggle} size="lg" centered className="cmp-modal" contentClassName="cmp-content">
      <div className="cmp-hero is-info">
        <span className="cmp-hero-icon"><i className="ri-hand-coin-line"></i></span>
        <div className="cmp-hero-text">
          <h5>{isEdit ? `Edit — ${initial.name}` : "New Reimbursement Type"}</h5>
          <p>Define how employees claim and get reimbursed for expenses</p>
        </div>
        <button data-testid="pay-type-close-button" type="button" className="cmp-close" onClick={toggle} aria-label="Close">
          <i className="ri-close-line"></i>
        </button>
      </div>

      <div className="cmp-body">
        <div className="cmp-row">
          <div className="cmp-field cmp-grow">
            <label className="cmp-label" htmlFor="rt-name">Name <span className="cmp-req">*</span></label>
            <div className={`cmp-input ${errors.name ? "is-invalid" : ""}`}>
              <i className="ri-price-tag-3-line"></i>
              <input
                data-testid="pay-type-name-input"
                id="rt-name"
                value={form.name}
                onChange={(e) => set("name", stripNumbers(e.target.value))}
                placeholder="e.g. Travel Reimbursement"
                autoComplete="off"
              />
            </div>
            {errors.name && <div className="cmp-error"><i className="ri-error-warning-line"></i>{errors.name}</div>}
          </div>
          <div className="cmp-field">
            <label className="cmp-label">Frequency</label>
            <div className="cmp-seg">
              {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                <button key={v} data-testid={testId("pay-type-frequency", v, "button")} type="button" className={form.frequency === v ? "is-active" : ""} onClick={() => set("frequency", v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cmp-field">
          <label className="cmp-label" htmlFor="rt-desc">Description <em>optional</em></label>
          <textarea
            data-testid="pay-type-desc-textarea"
            id="rt-desc"
            className="cmp-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Shown to HR when submitting a claim"
          />
        </div>

        <div className="cmp-field">
          <label className="cmp-label">Calculation mode <span className="cmp-req">*</span></label>
          <div className="cmp-types" role="radiogroup">
            {[
              { value: "flat", label: "Flat Amount", hint: "Fixed rupee amount from bills & receipts", icon: "ri-bill-line", tone: "allowance" },
              { value: "rate_x_units", label: "Rate × Units", hint: "Rate per unit × units (km, days, nights)", icon: "ri-calculator-line", tone: "info" },
            ].map((m) => {
              const active = form.calculation_mode === m.value;
              return (
                <button
                  data-testid={testId("pay-type-calculation-mode", m.value, "button")}
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`cmp-type is-${m.tone} ${active ? "is-active" : ""}`}
                  onClick={() => set("calculation_mode", m.value)}
                >
                  <span className="cmp-type-icon"><i className={m.icon}></i></span>
                  <span className="cmp-type-text">
                    <b>{m.label}</b>
                    <small>{m.hint}</small>
                  </span>
                  <i className="ri-checkbox-circle-fill cmp-type-check"></i>
                </button>
              );
            })}
          </div>
        </div>

        {isRate && (
          <div className="cmp-section cmp-reveal">
            <div className="cmp-section-head">
              <span><i className="ri-ruler-line"></i>Rate setup</span>
            </div>
            <div className="cmp-field">
              <label className="cmp-label">Unit <span className="cmp-req">*</span></label>
              <div className="cmp-chips">
                {COMMON_UNIT_LABELS.map((u) => (
                  <button data-testid={testId("pay-type-unit", u, "button")} key={u} type="button" className={`cmp-chip ${unit === u ? "is-active" : ""}`} onClick={() => setMeta("unit_label", u)}>
                    {unit === u && <i className="ri-check-line"></i>}{u}
                  </button>
                ))}
              </div>
              {errors.unit_label && <div className="cmp-error"><i className="ri-error-warning-line"></i>{errors.unit_label}</div>}
            </div>
            <div className="cmp-row mt-3">
              <div className="cmp-field cmp-grow">
                <label className="cmp-label" htmlFor="rt-rate">Rate per {unit || "unit"} <span className="cmp-req">*</span></label>
                <div className={`cmp-input ${errors.rate ? "is-invalid" : ""}`}>
                  <span className="cmp-affix">₹</span>
                  <input
                    data-testid="pay-type-rate-input"
                    id="rt-rate"
                    type="number"
                    min="0"
                    value={rate}
                    onChange={(e) => setMeta("rate", e.target.value)}
                    placeholder="e.g. 5"
                  />
                  <span className="cmp-suffix">/ {unit || "unit"}</span>
                </div>
                {errors.rate && <div className="cmp-error"><i className="ri-error-warning-line"></i>{errors.rate}</div>}
              </div>
            </div>
            <div className={`cmp-preview ${rate && unit ? "is-ready" : ""}`}>
              <i className="ri-eye-line"></i>
              {rate && unit ? (
                <span>Claim of <b>10 {unit}</b> pays <b>{inr(parseFloat(rate) * 10)}</b> at <b>₹{rate} / {unit}</b></span>
              ) : (
                <span>Pick a unit and rate to preview the payout</span>
              )}
            </div>
          </div>
        )}

        <div className="cmp-section">
          <div className="cmp-section-head">
            <span><i className="ri-shield-check-line"></i>Limits</span>
            <em>0 = no cap</em>
          </div>
          <div className="cmp-row">
            <div className="cmp-field cmp-grow">
              <label className="cmp-label" htmlFor="rt-claim">Max per claim</label>
              <div className="cmp-input">
                <span className="cmp-affix">₹</span>
                <input
                  data-testid="pay-type-claim-input" id="rt-claim" type="number" min="0" value={form.max_amount_per_claim}
                  onChange={(e) => set("max_amount_per_claim", e.target.value)} placeholder="No cap" />
              </div>
              <div className="cmp-hint">{claimCap ? `Up to ${inr(claimCap)} per claim` : "Unlimited per claim"}</div>
            </div>
            <div className="cmp-field cmp-grow">
              <label className="cmp-label" htmlFor="rt-period">Max per period</label>
              <div className="cmp-input">
                <span className="cmp-affix">₹</span>
                <input
                  data-testid="pay-type-period-input" id="rt-period" type="number" min="0" value={form.max_amount_per_period}
                  onChange={(e) => set("max_amount_per_period", e.target.value)} placeholder="No cap" />
                <span className="cmp-suffix">/ {periodLabel.toLowerCase()}</span>
              </div>
              <div className="cmp-hint">{periodCap ? `Up to ${inr(periodCap)} every ${periodLabel.toLowerCase()} period` : `Unlimited per ${periodLabel.toLowerCase()} period`}</div>
            </div>
          </div>
        </div>

        <div className="cmp-toggles is-3">
          {toggles.map(([key, label, hint, icon]) => {
            const on = !!form[key];
            return (
              <button
                key={key}
                data-testid={testId("pay-type", key, "switch")}
                type="button"
                role="switch"
                aria-checked={on}
                className={`cmp-toggle ${on ? "is-on" : ""}`}
                onClick={() => set(key, !on)}
              >
                <span className="cmp-toggle-icon"><i className={icon}></i></span>
                <span className="cmp-toggle-text">
                  <b>{label}</b>
                  <small>{hint}</small>
                </span>
                <span className="cmp-switch"><span></span></span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cmp-footer">
        <button data-testid="pay-type-cancel-button" type="button" className="it-btn is-soft" onClick={toggle}>Cancel</button>
        <button data-testid="pay-type-update-button" type="button" className="it-btn is-primary" onClick={handleSave}>
          <i className="ri-check-double-line"></i>
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
};

export default TypeFormModal;
