// HRClaimModal.jsx
// HR submits reimbursement claims on behalf of any employee.
// Supports Travel (km × rate) and Hotel (flat bill amount) out of the box.
// Place this in the same folder as ReimbursementsTab.jsx.

import React, { useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, FormGroup, Label, Input, FormFeedback,
  FormText, Alert, Row, Col, Badge,
} from "reactstrap";
import Dropzone from "react-dropzone";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../../common/api/PostApi";
import ClaimModalStyles from "./ClaimModalStyles";
import { Api } from "../../../../common/api/Api";
import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";
import { testId, itemTestKey } from "../../../../shared/testing/testId";
import ModalCloseButton from "../../../../shared/ui/ModalCloseButton";

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const RECEIPT_EXTS = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_RECEIPT_MB = 5;

const emptyClaim = () => ({
  employee:           "",
  reimbursement_type: "",
  claim_date:         new Date().toISOString().split("T")[0],
  month:              new Date().getMonth() + 1,
  year:               new Date().getFullYear(),
  claim_data:         {},
  description:        "",
});

const HRClaimModal = ({ isOpen, toggle, types, onSaved }) => {
  const dispatch = useDispatch();

  const [form, setForm]       = useState(emptyClaim());
  const [errors, setErrors]   = useState({});
  const employees = GetLocalStorageData("employee");
  const [empLoading, setEmpLoading] = useState(false);

  // ── Receipt upload state ──────────────────────────────────────────────
  const [receipt, setReceipt]           = useState(null);
  const [receiptError, setReceiptError] = useState("");

  // ── Derived values ────────────────────────────────────────────────────
  const selectedType = types.find((t) => t.id === parseInt(form.reimbursement_type));
  const isRateMode   = selectedType?.calculation_mode === "rate_x_units";
  const unitLabel    = selectedType?.meta?.unit_label || "units";
  const rate         = parseFloat(selectedType?.meta?.rate || 0);
  const units        = parseFloat(form.claim_data?.units  || 0);
  const flatAmt      = parseFloat(form.claim_data?.amount || 0);
  const preview      = isRateMode ? rate * units : flatAmt;

  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCD = (k, v) => setForm((f) => ({ ...f, claim_data: { ...f.claim_data, [k]: v } }));

  // ── Receipt drop handler ──────────────────────────────────────────────
  const handleReceiptDrop = (accepted) => {
    setReceiptError("");
    const f = accepted[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!RECEIPT_EXTS.includes(ext)) {
      setReceiptError(`Unsupported file. Allowed: ${RECEIPT_EXTS.join(", ")}`);
      return;
    }
    if (f.size > MAX_RECEIPT_MB * 1024 * 1024) {
      setReceiptError(`File too large (max ${MAX_RECEIPT_MB} MB)`);
      return;
    }
    setReceipt(f);
  };

  // ── Validate ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.employee)           e.employee = "Select an employee";
    if (!form.reimbursement_type) e.type     = "Select a reimbursement type";
    if (!form.claim_date)         e.claim_date = "Claim date is required";

    if (selectedType) {
      if (isRateMode) {
        if (!form.claim_data?.units || units <= 0)
          e.units = `${unitLabel} must be > 0`;
      } else {
        if (!form.claim_data?.amount || flatAmt <= 0)
          e.amount = "Amount must be > 0";
      }
      if (selectedType.max_amount_per_claim > 0 && preview > selectedType.max_amount_per_claim)
        e.cap = `Exceeds per-claim cap of ₹${selectedType.max_amount_per_claim}`;
      if (selectedType.receipt_required && !receipt)
        e.receipt = "Receipt / proof is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Reset everything ──────────────────────────────────────────────────
  const handleToggle = () => {
    setForm(emptyClaim());
    setErrors({});
    setReceipt(null);
    setReceiptError("");
    toggle();
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    dispatch(setLoaderVisible(true));
    try {
      const fd = new FormData();
      fd.append("employee",           parseInt(form.employee));
      fd.append("reimbursement_type", parseInt(form.reimbursement_type));
      fd.append("claim_date",         form.claim_date);
      fd.append("month",              form.month);
      fd.append("year",               form.year);
      fd.append("claim_data", JSON.stringify({
        ...form.claim_data,
        description: form.description,
      }));
      if (receipt) fd.append("receipt", receipt);

      const res = await PostApi("payroll/reimbursement-claims/", fd, false);
      if (res.status === 200) {
        toast.success(res.data.message || "Claim submitted successfully");
        onSaved(res.data.data);
        handleToggle();
      } else {
        toast.error(res.data.message || "Failed to submit claim");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Modal data-testid="hr-claim-dialog" isOpen={isOpen} toggle={handleToggle} size="md" centered className="rc-modal">
      <ClaimModalStyles />
      <ModalHeader close={<ModalCloseButton onClick={handleToggle} testId="hr-claim-close-button" />} toggle={handleToggle} className="rc-head">
        <span className="rc-head-icon"><i className="ri-hand-coin-line" /></span>
        <span className="rc-head-text">
          <span className="rc-head-title">Submit Reimbursement Claim</span>
          <span className="rc-head-sub">HR submitting on behalf of an employee</span>
        </span>
      </ModalHeader>

      <ModalBody>
        {errors.cap && <Alert color="warning" className="py-2">{errors.cap}</Alert>}

        {/* Employee selector */}
        <FormGroup>
          <Label>Employee <span className="text-danger">*</span></Label>
          <Input
            data-testid="hr-claim-employee-select"
            type="select"
            value={form.employee}
            onChange={(e) => { set("employee", e.target.value); setErrors({}); }}
            invalid={!!errors.employee}
            disabled={empLoading}
          >
            <option data-testid="hr-claim-employee-option-none" value="">
              {empLoading ? "Loading employees..." : "— select employee —"}
            </option>
            {employees.map((emp) => (
              <option data-testid={testId("hr-claim-employee-option", itemTestKey(emp))} key={emp.id} value={emp.id}>
                {emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim()} ({emp.emp_id})
              </option>
            ))}
          </Input>
          <FormFeedback data-testid="hr-claim-employee-error">{errors.employee}</FormFeedback>
        </FormGroup>

        {/* Reimbursement type */}
        <FormGroup>
          <Label>Reimbursement Type <span className="text-danger">*</span></Label>
          <Input
            data-testid="hr-claim-reimbursement-type-select"
            type="select"
            value={form.reimbursement_type}
            onChange={(e) => {
              set("reimbursement_type", e.target.value);
              set("claim_data", {});
              setReceipt(null);
              setReceiptError("");
              setErrors({});
            }}
            invalid={!!errors.type}
          >
            <option data-testid="hr-claim-reimbursement-type-option-none" value="">— select type —</option>
            {types.filter((t) => t.is_active).map((t) => (
              <option data-testid={testId("hr-claim-reimbursement-type-option", itemTestKey(t))} key={t.id} value={t.id}>
                {t.name}
                {t.calculation_mode === "rate_x_units"
                  ? ` (₹${t.meta?.rate}/${t.meta?.unit_label})`
                  : " (flat amount)"}
              </option>
            ))}
          </Input>
          <FormFeedback data-testid="hr-claim-reimbursement-type-error">{errors.type}</FormFeedback>
          {selectedType?.description && (
            <FormText>{selectedType.description}</FormText>
          )}
        </FormGroup>

        {/* Dynamic input block */}
        {selectedType && (
          <div className="rc-type-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium" style={{ fontSize: 13 }}>{selectedType.name}</span>
              <Badge
                color={isRateMode ? "info" : "secondary"}
                className="text-uppercase"
                style={{ fontSize: 10 }}
              >
                {isRateMode ? `Rate × ${unitLabel}` : "Flat amount"}
              </Badge>
            </div>

            {isRateMode ? (
              <>
                {/* Travel: km × rate */}
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
                  <span className="text-muted">Rate</span>
                  <span className="fw-medium">₹{rate} / {unitLabel}</span>
                </div>
                <FormGroup className="mb-2">
                  <Label>
                    {unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1)} traveled
                    <span className="text-danger"> *</span>
                  </Label>
                  <Input
                    data-testid="hr-claim-traveled-input"
                    type="number" min="0" step="0.1"
                    value={form.claim_data?.units || ""}
                    onChange={(e) => setCD("units", e.target.value)}
                    invalid={!!errors.units}
                    placeholder={`Enter ${unitLabel}`}
                  />
                  <FormFeedback data-testid="hr-claim-traveled-error">{errors.units}</FormFeedback>
                </FormGroup>
                {units > 0 && (
                  <div className="rc-amount">
                    <span className="text-muted" style={{ fontSize: 13 }}>Computed amount</span>
                    <span className="fw-medium text-success">
                      ₹{fmt(preview)}
                      <small className="text-muted fw-normal ms-1">
                        ({units} {unitLabel} × ₹{rate})
                      </small>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Hotel: flat bill amount */}
                <FormGroup className="mb-0">
                  <Label>
                    Bill Amount (₹)
                    <span className="text-danger"> *</span>
                  </Label>
                  <Input
                    data-testid="hr-claim-bill-amount-input"
                    type="number" min="0" step="0.01"
                    value={form.claim_data?.amount || ""}
                    onChange={(e) => setCD("amount", e.target.value)}
                    invalid={!!errors.amount}
                    placeholder="Enter bill amount"
                  />
                  <FormFeedback data-testid="hr-claim-bill-amount-error">{errors.amount}</FormFeedback>
                </FormGroup>
                {flatAmt > 0 && (
                  <div className="rc-amount">
                    <span className="text-muted" style={{ fontSize: 13 }}>Payable amount</span>
                    <span className="fw-medium text-success">₹{fmt(flatAmt)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Date + period */}
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Claim date <span className="text-danger">*</span></Label>
              <DatePicker
                value={form.claim_date ? dayjs(form.claim_date) : null}
                onChange={(d) => {
                  if (!d) return;
                  set("claim_date", d.format("YYYY-MM-DD"));
                  set("month", d.month() + 1);
                  set("year",  d.year());
                }}
                format="DD MMM YYYY"
                allowClear={false}
                disabledDate={(d) => d.isAfter(dayjs(), "day")}
                status={errors.claim_date ? "error" : undefined}
                popupStyle={{ zIndex: 1080 }}
                className="rc-date"
              />
              {errors.claim_date && <div className="text-danger small mt-1">{errors.claim_date}</div>}
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Payroll period</Label>
              <div className="rc-period">
                <i className="ri-calendar-check-line" />
                <span>
                  {`${new Date(`${form.claim_date}T00:00:00`)
                    .toLocaleString("default", { month: "long" })} ${form.year}`}
                </span>
              </div>
              <div className="rc-hint"><i className="ri-information-line" />Claims appear in this month's payslip</div>
            </FormGroup>
          </Col>
        </Row>

        {/* Receipt upload */}
        {selectedType?.receipt_required && (
          <FormGroup>
            <Label>
              Receipt / Proof <span className="text-danger">*</span>
              <small className="text-muted ms-1">
                ({RECEIPT_EXTS.join(", ")}, max {MAX_RECEIPT_MB}MB)
              </small>
            </Label>

            {!receipt ? (
              <Dropzone onDrop={handleReceiptDrop} multiple={false}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    className={`rc-drop ${isDragActive ? "is-active" : ""} ${errors.receipt ? "is-error" : ""}`}
                  >
                    <div className="dz-message needsclick" {...getRootProps()}>
                      <input data-testid="hr-claim-receipt-file-input" {...getInputProps()} />
                      <div className="rc-drop-icon"><i className="ri-upload-cloud-2-line" /></div>
                      <div className="rc-drop-title">Drop receipt here or click to upload</div>
                      <div className="rc-drop-sub">{RECEIPT_EXTS.join(", ").toUpperCase()} · up to {MAX_RECEIPT_MB} MB</div>
                    </div>
                  </div>
                )}
              </Dropzone>
            ) : (
              <div className="rc-file">
                <div className="d-flex align-items-center gap-2 text-truncate">
                  <i className={`${receipt.name.toLowerCase().endsWith(".pdf")
                    ? "ri-file-pdf-fill text-danger"
                    : "ri-image-2-fill text-success"} fs-18`} />
                  <span className="text-truncate" style={{ maxWidth: 220 }}>{receipt.name}</span>
                  <small className="text-muted">({(receipt.size / 1024).toFixed(0)} KB)</small>
                </div>
                <button
                  data-testid="hr-claim-footer-close-button"
                  type="button"
                  className="btn btn-sm btn-ghost-danger p-0 px-1"
                  onClick={() => setReceipt(null)}
                >
                  <i className="ri-close-line" />
                </button>
              </div>
            )}

            {(errors.receipt || receiptError) && (
              <div className="text-danger fs-12 mt-1">
                <i className="ri-error-warning-line me-1" />
                {errors.receipt || receiptError}
              </div>
            )}
          </FormGroup>
        )}

        {/* Description */}
        <FormGroup>
          <Label>Description / notes</Label>
          <Input
            data-testid="hr-claim-description-notes-textarea"
            type="textarea" rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={
              isRateMode
                ? "Route taken, purpose of travel, destination..."
                : "Hotel name, location, check-in/out dates..."
            }
          />
        </FormGroup>

        {/* Period cap info */}
        {selectedType?.max_amount_per_period > 0 && (
          <small className="text-muted">
            Period cap for {selectedType.name}: ₹{selectedType.max_amount_per_period}
          </small>
        )}
      </ModalBody>

      <ModalFooter className="rc-foot">
        <Button data-testid="hr-claim-cancel-button" className="rc-btn-cancel" onClick={handleToggle}>Cancel</Button>
        <Button
          data-testid="hr-claim-submit-claim-button"
          className="rc-btn-submit"
          onClick={handleSave}
          disabled={!selectedType || !form.employee}
        >
          <i className="ri-send-plane-2-line" />
          Submit Claim
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HRClaimModal;