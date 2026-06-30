// TypeFormModal.jsx — create/edit a reimbursement type
import React, { useState, useEffect } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, FormGroup, Label, Input, FormFeedback, FormText, Row, Col,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../../common/api/PostApi";

const FREQUENCY_LABELS = {
  monthly:     "Monthly",
  quarterly:   "Quarterly",
  half_yearly: "Half Yearly",
  annually:    "Annually",
};

const COMMON_UNIT_LABELS = ["km", "days", "nights", "meals", "hours", "trips"];

const emptyType = () => ({
  id: 0, name: "", description: "",
  calculation_mode: "flat", meta: {},
  max_amount_per_claim: "", max_amount_per_period: "",
  frequency: "monthly", is_taxable: false,
  receipt_required: true, is_active: true,
});

const stripNumbers = (value) => value.replace(/[0-9]/g, "");

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

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {isEdit ? `Edit — ${initial.name}` : "New Reimbursement Type"}
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={8}>
            <FormGroup>
              <Label>Name <span className="text-danger">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", stripNumbers(e.target.value))}
                invalid={!!errors.name}
                placeholder="e.g. Travel Reimbursement"
              />
              <FormFeedback>{errors.name}</FormFeedback>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Frequency</Label>
              <Input type="select" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label>Description</Label>
          <Input type="textarea" rows={2} value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Shown to HR when submitting a claim" />
        </FormGroup>

        {/* Mode selector */}
        <FormGroup>
          <Label>Calculation mode <span className="text-danger">*</span></Label>
          <Row className="g-2 mt-1">
            {[
              { value: "flat",         label: "Flat Amount",  hint: "HR enters a fixed rupee amount (hotel bills, receipts)" },
              { value: "rate_x_units", label: "Rate × Units", hint: "Amount = rate per unit × units (km, days, nights)" },
            ].map((m) => {
              const active = form.calculation_mode === m.value;
              return (
                <Col md={6} key={m.value}>
                  <div
                    onClick={() => set("calculation_mode", m.value)}
                    className={`border rounded p-3 h-100 ${active ? "border-success bg-success-subtle" : "border-light"}`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Input type="radio" className="m-0" checked={active}
                        onChange={() => set("calculation_mode", m.value)} />
                      <span className={`fw-medium ${active ? "text-success" : ""}`}>{m.label}</span>
                    </div>
                    <small className="text-muted">{m.hint}</small>
                  </div>
                </Col>
              );
            })}
          </Row>
        </FormGroup>

        {form.calculation_mode === "rate_x_units" && (
          <Row className="mt-2">
            <Col md={5}>
              <FormGroup>
                <Label>Unit label <span className="text-danger">*</span></Label>
                <Input type="select" value={form.meta?.unit_label || ""}
                  onChange={(e) => setMeta("unit_label", e.target.value)}
                  invalid={!!errors.unit_label}>
                  <option value="">— select —</option>
                  {COMMON_UNIT_LABELS.map((u) => <option key={u} value={u}>{u}</option>)}
                </Input>
                <FormFeedback>{errors.unit_label}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Rate per {form.meta?.unit_label || "unit"} (₹) <span className="text-danger">*</span></Label>
                <Input type="number" min="0"
                  value={form.meta?.rate || ""}
                  onChange={(e) => setMeta("rate", e.target.value)}
                  invalid={!!errors.rate} placeholder="e.g. 5" />
                <FormFeedback>{errors.rate}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Preview</Label>
                <Input disabled value={
                  form.meta?.rate && form.meta?.unit_label
                    ? `₹${form.meta.rate} / ${form.meta.unit_label}` : "—"
                } />
              </FormGroup>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Max per claim (₹)</Label>
              <Input type="number" min="0" value={form.max_amount_per_claim}
                onChange={(e) => set("max_amount_per_claim", e.target.value)}
                placeholder="0 = no cap" />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Max per period (₹)</Label>
              <Input type="number" min="0" value={form.max_amount_per_period}
                onChange={(e) => set("max_amount_per_period", e.target.value)}
                placeholder="0 = no cap" />
              <FormText>Period = {FREQUENCY_LABELS[form.frequency]}</FormText>
            </FormGroup>
          </Col>
        </Row>

        <Row className="g-2">
          {[["receipt_required", "Receipt required"], ["is_taxable", "Taxable"], ["is_active", "Active"]].map(([key, label]) => (
            <Col md={4} key={key}>
              <FormGroup check className="d-flex align-items-center gap-2">
                <Input type="checkbox" className="form-check-input"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)} />
                <Label check className="mb-0">{label}</Label>
              </FormGroup>
            </Col>
          ))}
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button className="btn btn-danger" onClick={toggle}>Cancel</Button>
        <Button className="btn-label btn btn-success" onClick={handleSave}>
          <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
          {isEdit ? "Update" : "Create"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TypeFormModal;