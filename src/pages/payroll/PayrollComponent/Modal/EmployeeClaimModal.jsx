// EmployeeClaimModal.jsx
// Employee submits a reimbursement claim for THEMSELVES.
// Same calculation/receipt logic as HRClaimModal, minus the employee picker.
// Place in the same Modal/ folder as HRClaimModal.jsx.

import React, { useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, FormGroup, Label, Input, FormFeedback,
  FormText, Alert, Row, Col, Badge,
} from "reactstrap";
import Dropzone from "react-dropzone";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../../common/api/PostApi";

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const RECEIPT_EXTS = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_RECEIPT_MB = 5;

const emptyClaim = () => ({
  reimbursement_type: "",
  claim_date:         new Date().toISOString().split("T")[0],
  month:              new Date().getMonth() + 1,
  year:               new Date().getFullYear(),
  claim_data:         {},
  description:        "",
});

// employeeId: id of the logged-in employee (pass down from wherever your
// session/auth state lives — e.g. redux state.auth.employee.id).
const EmployeeClaimModal = ({ isOpen, toggle, employeeId, types, onSaved }) => {
  const dispatch = useDispatch();

  const [form, setForm]     = useState(emptyClaim());
  const [errors, setErrors] = useState({});

  const [receipt, setReceipt]           = useState(null);
  const [receiptError, setReceiptError] = useState("");

  const selectedType = types.find((t) => t.id === parseInt(form.reimbursement_type));
  const isRateMode   = selectedType?.calculation_mode === "rate_x_units";
  const unitLabel    = selectedType?.meta?.unit_label || "units";
  const rate         = parseFloat(selectedType?.meta?.rate || 0);
  const units        = parseFloat(form.claim_data?.units  || 0);
  const flatAmt      = parseFloat(form.claim_data?.amount || 0);
  const preview      = isRateMode ? rate * units : flatAmt;

  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCD = (k, v) => setForm((f) => ({ ...f, claim_data: { ...f.claim_data, [k]: v } }));

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

  const validate = () => {
    const e = {};
    if (!form.reimbursement_type) e.type       = "Select a reimbursement type";
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

  const handleToggle = () => {
    setForm(emptyClaim());
    setErrors({});
    setReceipt(null);
    setReceiptError("");
    toggle();
  };

  const handleSave = async () => {
    if (!employeeId) {
      toast.error("Could not identify your employee record. Please re-login.");
      return;
    }
    if (!validate()) return;

    dispatch(setLoaderVisible(true));
    try {
      const fd = new FormData();
      fd.append("employee",           parseInt(employeeId));
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

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} size="md" centered>
      <ModalHeader toggle={handleToggle}>Submit Reimbursement Claim</ModalHeader>

      <ModalBody>
        {errors.cap && <Alert color="warning" className="py-2">{errors.cap}</Alert>}

        <FormGroup>
          <Label>Reimbursement Type <span className="text-danger">*</span></Label>
          <Input
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
            <option value="">— select type —</option>
            {types.filter((t) => t.is_active).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.calculation_mode === "rate_x_units"
                  ? ` (₹${t.meta?.rate}/${t.meta?.unit_label})`
                  : " (flat amount)"}
              </option>
            ))}
          </Input>
          <FormFeedback>{errors.type}</FormFeedback>
        </FormGroup>

        {selectedType && (
          <div className="border rounded p-3 bg-light mb-3">
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
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
                  <span className="text-muted">Rate</span>
                  <span className="fw-medium">₹{rate} / {unitLabel}</span>
                </div>
                <FormGroup className="mb-2">
                  <Label>
                    {unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1)}
                    <span className="text-danger"> *</span>
                  </Label>
                  <Input
                    type="number" min="0" step="0.1"
                    value={form.claim_data?.units || ""}
                    onChange={(e) => setCD("units", e.target.value)}
                    invalid={!!errors.units}
                    placeholder={`Enter ${unitLabel}`}
                  />
                  <FormFeedback>{errors.units}</FormFeedback>
                </FormGroup>
                {units > 0 && (
                  <div className="d-flex justify-content-between border-top pt-2 mt-1">
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
                <FormGroup className="mb-0">
                  <Label>
                    Bill Amount (₹)
                    <span className="text-danger"> *</span>
                  </Label>
                  <Input
                    type="number" min="0" step="0.01"
                    value={form.claim_data?.amount || ""}
                    onChange={(e) => setCD("amount", e.target.value)}
                    invalid={!!errors.amount}
                    placeholder="Enter bill amount"
                  />
                  <FormFeedback>{errors.amount}</FormFeedback>
                </FormGroup>
                {flatAmt > 0 && (
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <span className="text-muted" style={{ fontSize: 13 }}>Payable amount</span>
                    <span className="fw-medium text-success">₹{fmt(flatAmt)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Claim date <span className="text-danger">*</span></Label>
              <Input
                type="date"
                value={form.claim_date}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  set("claim_date", e.target.value);
                  set("month", d.getMonth() + 1);
                  set("year",  d.getFullYear());
                }}
                invalid={!!errors.claim_date}
              />
              <FormFeedback>{errors.claim_date}</FormFeedback>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Payroll period</Label>
              <Input
                disabled
                value={
                  `${new Date(`${form.claim_date}T00:00:00`)
                    .toLocaleString("default", { month: "long" })} ${form.year}`
                }
              />
              <FormText>Appears in this month's payslip once approved</FormText>
            </FormGroup>
          </Col>
        </Row>

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
                    className={`dropzone dz-clickable border rounded p-3 text-center ${
                      isDragActive ? "border-success bg-success-subtle" : ""
                    } ${errors.receipt ? "border-danger" : ""}`}
                  >
                    <div className="dz-message needsclick" {...getRootProps()}>
                      <input {...getInputProps()} />
                      <i className="ri-upload-cloud-2-fill display-6 text-muted d-block mb-1" />
                      <span className="fs-13">Drop receipt here or click to upload</span>
                    </div>
                  </div>
                )}
              </Dropzone>
            ) : (
              <div className="d-flex align-items-center justify-content-between border rounded p-2 bg-light">
                <div className="d-flex align-items-center gap-2 text-truncate">
                  <i className={`${receipt.name.toLowerCase().endsWith(".pdf")
                    ? "ri-file-pdf-fill text-danger"
                    : "ri-image-2-fill text-success"} fs-18`} />
                  <span className="text-truncate" style={{ maxWidth: 220 }}>{receipt.name}</span>
                  <small className="text-muted">({(receipt.size / 1024).toFixed(0)} KB)</small>
                </div>
                <button
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

        <FormGroup>
          <Label>Description / notes</Label>
          <Input
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

        {selectedType?.max_amount_per_period > 0 && (
          <small className="text-muted">
            Period cap for {selectedType.name}: ₹{selectedType.max_amount_per_period}
          </small>
        )}
      </ModalBody>

      <ModalFooter>
        <Button className="btn btn-danger" onClick={handleToggle}>Cancel</Button>
        <Button
          className="btn-label btn btn-success"
          onClick={handleSave}
          disabled={!selectedType}
        >
          <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
          Submit Claim
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EmployeeClaimModal;