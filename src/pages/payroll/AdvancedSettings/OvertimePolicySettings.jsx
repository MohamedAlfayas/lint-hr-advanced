import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge, FormFeedback,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { required, range, min, runChecks } from "./validators";

const OT_METHOD_OPTIONS = [
  { value: "actual", label: "Actual Hours" },
  { value: "rounded", label: "Rounded Hours" },
];

const COMPENSATION_OPTIONS = [
  { value: "payout", label: "Payout" },
  { value: "comp_off", label: "Compensatory Off" },
];

const OT_BASED_ON_OPTIONS = [
  { value: "basic", label: "Basic Salary" },
  { value: "gross", label: "Gross Salary" },
  { value: "ctc", label: "CTC" },
];

// Fields that only matter (and should only be validated / shown as invalid)
// when their parent toggle is on. Keeps validation state in sync with
// which fields are actually interactable.
const FIELDS_GATED_BY = {
  is_ot_enabled: ["ot_multiplier", "minimum_ot_minutes", "maximum_ot_minutes_per_day"],
  is_weekend_ot_enabled: ["weekend_ot_multiplier"],
  is_holiday_ot_enabled: ["holiday_ot_multiplier"],
};

// Sane bounds for any "×" multiplier field — prevents someone fat-fingering
// a multiplier like 50 that would blow up payroll calculations.
const MULTIPLIER_RANGE = { min: 1, max: 5 };

const SectionLabel = ({ children }) => (
  <p className="text-uppercase fw-semibold text-muted mb-2" style={{ fontSize: 11, letterSpacing: "0.8px" }}>
    {children}
  </p>
);

const SettingRow = ({ label, children, last = false }) => (
  <Row className={`align-items-center px-3 py-2 g-0${!last ? " border-bottom" : ""}`}>
    <Col sm={5} md={4}>
      <Label className="mb-0 text-muted" style={{ fontSize: 13 }}>{label}</Label>
    </Col>
    <Col sm={7} md={8}>{children}</Col>
  </Row>
);

const ViewToggle = ({ checked, label }) => (
  <div className="d-flex align-items-center gap-2">
    <span style={{
      display: "inline-block", width: 36, height: 20, borderRadius: 12,
      background: checked ? "var(--vz-success)" : "rgba(var(--vz-secondary-rgb), .35)", position: "relative", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s",
      }} />
    </span>
    {label && <span style={{ fontSize: 13 }}>{label}</span>}
  </div>
);

const OvertimePolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/overtime-policy-settings/" })
      .then((res) => {
        const list = res?.data?.data || [];
        setRecords(list);
        setIsEmpty(list.length === 0);
        if (list.length > 0) setForm({ ...list[0] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Live-clear the error for this field as soon as it's edited; the
    // authoritative re-check happens on blur / save.
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Validates a single field against the same rules used on save, but only
  // if the field is currently "active" (its gating toggle, if any, is on).
  const validateFieldLive = (field, value = form?.[field]) => {
    let msg = null;

    switch (field) {
      case "effective_date":
        msg = required("Effective date", value);
        break;
      case "ot_multiplier":
        if (form.is_ot_enabled) msg = range("OT multiplier", value, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
        break;
      case "minimum_ot_minutes":
        if (form.is_ot_enabled) {
          msg = min("Min OT minutes", value, 0, 1440);
          if (!msg && Number(value) > Number(form.maximum_ot_minutes_per_day)) {
            msg = "Min OT minutes cannot exceed Max OT minutes/day";
          }
        }
        break;
      case "maximum_ot_minutes_per_day":
        if (form.is_ot_enabled) {
          msg = range("Max OT minutes/day", value, 0, 1440);
          if (!msg && Number(value) < Number(form.minimum_ot_minutes)) {
            msg = "Max OT minutes/day must be ≥ Min OT minutes";
          }
        }
        break;
      case "weekend_ot_multiplier":
        if (form.is_ot_enabled && form.is_weekend_ot_enabled) msg = range("Weekend OT multiplier", value, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
        break;
      case "holiday_ot_multiplier":
        if (form.is_ot_enabled && form.is_holiday_ot_enabled) msg = range("Holiday OT multiplier", value, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
        break;
      default:
        break;
    }

    setErrors((prev) => {
      const updated = { ...prev };
      if (msg) updated[field] = msg;
      else delete updated[field];
      return updated;
    });
  };

  const handleBlur = (field) => validateFieldLive(field);

  // Toggling a switch off must immediately drop any lingering validation
  // errors for the field(s) it gates, since those fields become inactive
  // and are excluded from the save-time validation below.
  const handleToggle = (field) => {
    const turningOff = !!form?.[field];
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

    if (turningOff && FIELDS_GATED_BY[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        FIELDS_GATED_BY[field].forEach((f) => delete updated[f]);
        return updated;
      });
    } else if (!turningOff) {
      // Turning a gate ON: re-validate its dependent fields against
      // whatever values are currently sitting in the form.
      setTimeout(() => {
        (FIELDS_GATED_BY[field] || []).forEach((f) => validateFieldLive(f));
      }, 0);
    }
  };

  const buildValidationErrors = () => {
    const errs = {};

    const effDateErr = required("Effective date", form.effective_date);
    if (effDateErr) errs.effective_date = effDateErr;

    if (form.is_ot_enabled) {
      const otMultErr = range("OT multiplier", form.ot_multiplier, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
      if (otMultErr) errs.ot_multiplier = otMultErr;

      const minOtErr = min("Min OT minutes", form.minimum_ot_minutes, 0, 1440);
      if (minOtErr) errs.minimum_ot_minutes = minOtErr;

      const maxOtErr = range("Max OT minutes/day", form.maximum_ot_minutes_per_day, 0, 1440);
      if (maxOtErr) errs.maximum_ot_minutes_per_day = maxOtErr;

      // Bidirectional check: Min must never exceed Max, and Max must never
      // fall below Min — flag whichever field(s) aren't already showing
      // their own range error, so the message lands wherever the user is
      // actually looking.
      if (!minOtErr && !maxOtErr && Number(form.minimum_ot_minutes) > Number(form.maximum_ot_minutes_per_day)) {
        errs.minimum_ot_minutes = errs.minimum_ot_minutes || "Min OT minutes cannot exceed Max OT minutes/day";
        errs.maximum_ot_minutes_per_day = errs.maximum_ot_minutes_per_day || "Max OT minutes/day must be ≥ Min OT minutes";
      }

      // Interlinked check: only validate weekend/holiday multipliers when
      // their own toggle — and the parent OT toggle — are both on.
      if (form.is_weekend_ot_enabled) {
        const weekendErr = range("Weekend OT multiplier", form.weekend_ot_multiplier, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
        if (weekendErr) errs.weekend_ot_multiplier = weekendErr;
      }
      if (form.is_holiday_ot_enabled) {
        const holidayErr = range("Holiday OT multiplier", form.holiday_ot_multiplier, MULTIPLIER_RANGE.min, MULTIPLIER_RANGE.max);
        if (holidayErr) errs.holiday_ot_multiplier = holidayErr;
      }
    }

    return errs;
  };

  const validate = () => {
    const errs = buildValidationErrors();
    setErrors(errs);

    const messages = Object.values(errs).filter(Boolean);
    if (messages.length > 0) {
      toast.error(messages[0]);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    const isUpdate = form?.id;
    Api({
      method: isUpdate ? "PUT" : "POST",
      url: "payroll/overtime-policy-settings/",
      data: form,
    })
      .then((res) => {
        toast.success(res?.data?.message || "Saved successfully");
        fetchData();
        setIsEditing(false);
        setErrors({});
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to save"))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    if (records.length > 0) setForm({ ...records[0] });
    setIsEditing(false);
    setErrors({});
  };

  const handleNew = () => {
    setForm({
      effective_date: "",
      is_ot_enabled: true,
      minimum_ot_minutes: 30,
      maximum_ot_minutes_per_day: 120,
      ot_calculation_method: "actual",
      compensation_type: "payout",
      ot_multiplier: "1.50",
      ot_based_on: "basic",
      is_weekend_ot_enabled: true,
      weekend_ot_multiplier: "1.50",
      is_holiday_ot_enabled: true,
      holiday_ot_multiplier: "2.00",
      is_active: true,
    });
    setIsEmpty(false);
    setIsEditing(true);
    setErrors({});
  };

  const data = form || {};
  const otEnabled = isEditing ? !!form?.is_ot_enabled : !!data.is_ot_enabled;

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">Overtime Policy</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-time-line"></i>
              </div>
            </div>
            <h6 className="mb-1">No Overtime Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
              Set up overtime calculation rules and compensation types.
            </p>
            <Button data-testid="overtime-policy-configure-policy-button" color="primary" onClick={handleNew}>
              <i className="ri-add-line align-bottom me-1"></i> Configure Policy
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <CardTitle tag="h5" className="mb-0">Overtime Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            OT calculation method, multipliers and compensation settings
          </CardSubtitle>
        </div>
        <div className="d-flex gap-2">
          {!isEditing && (
            <>
              <Button data-testid="overtime-policy-edit-button" size="sm" color="primary" outline onClick={() => { setForm({ ...records[0] }); setIsEditing(true); setErrors({}); }}>
                <i className="ri-edit-line fs-14"></i> Edit
              </Button>
              <Button data-testid="overtime-policy-new-version-button" size="sm" color="success" outline onClick={handleNew}>
                <i className="ri-add-line fs-14"></i> New Version
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-4">
        {!isEditing && records.length > 1 && (
          <div className="d-flex gap-2 flex-wrap mb-4">
            {records.map((r, i) => (
              <Badge
                key={r.id}
                color={form?.id === r.id ? "primary" : "light"}
                className={form?.id === r.id ? "" : "text-dark border"}
                style={{ cursor: "pointer", fontSize: 12, padding: "5px 12px" }}
                onClick={() => { setForm({ ...r }); setErrors({}); }}
              >
                {r.effective_date} {i === 0 && <span className="ms-1">· Latest</span>}
              </Badge>
            ))}
          </div>
        )}

        {!isEditing && (
          <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
            <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
            <span style={{ fontSize: 13 }}>
              <strong>Policy is {data.is_active ? "Active" : "Inactive"}</strong>
              {data.effective_date && <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>}
            </span>
          </div>
        )}

        <SectionLabel>General</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Effective Date">
            {isEditing ? (
              <div>
                <Input
                  data-testid="overtime-policy-effective-date-input"
                  type="date"
                  invalid={!!errors.effective_date}
                  value={form.effective_date || ""}
                  onChange={(e) => handleChange("effective_date", e.target.value)}
                  onBlur={() => handleBlur("effective_date")}
                  style={{ width: 180 }}
                />
                {errors.effective_date && <FormFeedback data-testid="overtime-policy-effective-date-error" style={{ display: "block" }}>{errors.effective_date}</FormFeedback>}
              </div>
            ) : (
              <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>
            )}
          </SettingRow>
          <SettingRow label="Status">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input data-testid="overtime-policy-is-active-checkbox" className="form-check-input" type="checkbox" checked={!!form.is_active} onChange={() => handleToggle("is_active")} />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{form.is_active ? "Active" : "Inactive"}</Label>
              </div>
            ) : (
              <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
            )}
          </SettingRow>
          <SettingRow label="Enable Overtime" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input data-testid="overtime-policy-active-checkbox" className="form-check-input" type="checkbox" checked={!!form.is_ot_enabled} onChange={() => handleToggle("is_ot_enabled")} />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{form.is_ot_enabled ? "Enabled" : "Disabled"}</Label>
              </div>
            ) : (
              <ViewToggle checked={!!data.is_ot_enabled} label={data.is_ot_enabled ? "Enabled" : "Disabled"} />
            )}
          </SettingRow>
        </div>

        {otEnabled && (
          <>
            <SectionLabel>OT Calculation</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Calculation Method">
                {isEditing ? (
                  <Select
                    testId="overtime-policy-enabled"
                    options={OT_METHOD_OPTIONS}
                    value={OT_METHOD_OPTIONS.find(o => o.value === form.ot_calculation_method)}
                    onChange={(e) => handleChange("ot_calculation_method", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 200 }) }}
                  />
                ) : (
                  <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                    {OT_METHOD_OPTIONS.find(o => o.value === data.ot_calculation_method)?.label || "—"}
                  </Badge>
                )}
              </SettingRow>
              <SettingRow label="Compensation Type">
                {isEditing ? (
                  <Select
                    testId="overtime-policy-compensation-type"
                    options={COMPENSATION_OPTIONS}
                    value={COMPENSATION_OPTIONS.find(o => o.value === form.compensation_type)}
                    onChange={(e) => handleChange("compensation_type", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 200 }) }}
                  />
                ) : (
                  <Badge color="info" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                    {COMPENSATION_OPTIONS.find(o => o.value === data.compensation_type)?.label || "—"}
                  </Badge>
                )}
              </SettingRow>
              <SettingRow label="OT Based On">
                {isEditing ? (
                  <Select
                    testId="overtime-policy-ot-based-on"
                    options={OT_BASED_ON_OPTIONS}
                    value={OT_BASED_ON_OPTIONS.find(o => o.value === form.ot_based_on)}
                    onChange={(e) => handleChange("ot_based_on", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 200 }) }}
                  />
                ) : (
                  <Badge color="secondary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                    {OT_BASED_ON_OPTIONS.find(o => o.value === data.ot_based_on)?.label || "—"}
                  </Badge>
                )}
              </SettingRow>
              <SettingRow label="OT Multiplier">
                {isEditing ? (
                  <div>
                    <Input
                      data-testid="overtime-policy-ot-multiplier-input"
                      type="number" step="0.01" min={MULTIPLIER_RANGE.min} max={MULTIPLIER_RANGE.max}
                      invalid={!!errors.ot_multiplier}
                      value={form.ot_multiplier || ""}
                      onChange={(e) => handleChange("ot_multiplier", e.target.value)}
                      onBlur={() => handleBlur("ot_multiplier")}
                      style={{ width: 100 }}
                    />
                    {errors.ot_multiplier && <FormFeedback data-testid="overtime-policy-ot-multiplier-error" style={{ display: "block" }}>{errors.ot_multiplier}</FormFeedback>}
                  </div>
                ) : (
                  <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>×{data.ot_multiplier || "—"}</Badge>
                )}
              </SettingRow>
              <SettingRow label="Min OT Minutes">
                {isEditing ? (
                  <div>
                    <Input
                      data-testid="overtime-policy-minimum-ot-minutes-input"
                      type="number" min="0"
                      invalid={!!errors.minimum_ot_minutes}
                      value={form.minimum_ot_minutes ?? ""}
                      onChange={(e) => handleChange("minimum_ot_minutes", parseInt(e.target.value))}
                      onBlur={() => {
                        handleBlur("minimum_ot_minutes");
                        // Min/Max are interlinked — re-check Max whenever Min changes.
                        validateFieldLive("maximum_ot_minutes_per_day");
                      }}
                      style={{ width: 100 }}
                    />
                    {errors.minimum_ot_minutes && <FormFeedback data-testid="overtime-policy-minimum-ot-minutes-error" style={{ display: "block" }}>{errors.minimum_ot_minutes}</FormFeedback>}
                  </div>
                ) : (
                  <span style={{ fontSize: 13 }}>{data.minimum_ot_minutes ?? "—"} min</span>
                )}
              </SettingRow>
              <SettingRow label="Max OT Minutes / Day" last>
                {isEditing ? (
                  <div>
                    <Input
                      data-testid="overtime-policy-maximum-ot-minutes-per-input"
                      type="number" min="0"
                      invalid={!!errors.maximum_ot_minutes_per_day}
                      value={form.maximum_ot_minutes_per_day ?? ""}
                      onChange={(e) => handleChange("maximum_ot_minutes_per_day", parseInt(e.target.value))}
                      onBlur={() => {
                        handleBlur("maximum_ot_minutes_per_day");
                        // Min/Max are interlinked — re-check Min whenever Max changes.
                        validateFieldLive("minimum_ot_minutes");
                      }}
                      style={{ width: 100 }}
                    />
                    {errors.maximum_ot_minutes_per_day && <FormFeedback data-testid="overtime-policy-maximum-ot-minutes-per-error" style={{ display: "block" }}>{errors.maximum_ot_minutes_per_day}</FormFeedback>}
                  </div>
                ) : (
                  <span style={{ fontSize: 13 }}>{data.maximum_ot_minutes_per_day ?? "—"} min</span>
                )}
              </SettingRow>
            </div>

            <SectionLabel>Weekend Overtime</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Enable Weekend OT">
                {isEditing ? (
                  <div className="form-check form-switch mb-0">
                    <Input data-testid="overtime-policy-is-weekend-ot-enabled-checkbox" className="form-check-input" type="checkbox" checked={!!form.is_weekend_ot_enabled} onChange={() => handleToggle("is_weekend_ot_enabled")} />
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_weekend_ot_enabled} />
                )}
              </SettingRow>
              {(isEditing ? form.is_weekend_ot_enabled : data.is_weekend_ot_enabled) && (
                <SettingRow label="Weekend OT Multiplier" last>
                  {isEditing ? (
                    <div>
                      <Input
                        data-testid="overtime-policy-weekend-ot-multiplier-input"
                        type="number" step="0.01" min={MULTIPLIER_RANGE.min} max={MULTIPLIER_RANGE.max}
                        invalid={!!errors.weekend_ot_multiplier}
                        value={form.weekend_ot_multiplier || ""}
                        onChange={(e) => handleChange("weekend_ot_multiplier", e.target.value)}
                        onBlur={() => handleBlur("weekend_ot_multiplier")}
                        style={{ width: 100 }}
                      />
                      {errors.weekend_ot_multiplier && <FormFeedback data-testid="overtime-policy-weekend-ot-multiplier-error" style={{ display: "block" }}>{errors.weekend_ot_multiplier}</FormFeedback>}
                    </div>
                  ) : (
                    <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>×{data.weekend_ot_multiplier || "—"}</Badge>
                  )}
                </SettingRow>
              )}
              {!(isEditing ? form.is_weekend_ot_enabled : data.is_weekend_ot_enabled) && (
                <SettingRow label="" last><span className="text-muted" style={{ fontSize: 12 }}>Weekend OT not applicable</span></SettingRow>
              )}
            </div>

            <SectionLabel>Holiday Overtime</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Enable Holiday OT">
                {isEditing ? (
                  <div className="form-check form-switch mb-0">
                    <Input data-testid="overtime-policy-is-holiday-ot-enabled-checkbox" className="form-check-input" type="checkbox" checked={!!form.is_holiday_ot_enabled} onChange={() => handleToggle("is_holiday_ot_enabled")} />
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_holiday_ot_enabled} />
                )}
              </SettingRow>
              {(isEditing ? form.is_holiday_ot_enabled : data.is_holiday_ot_enabled) && (
                <SettingRow label="Holiday OT Multiplier" last>
                  {isEditing ? (
                    <div>
                      <Input
                        data-testid="overtime-policy-holiday-ot-multiplier-input"
                        type="number" step="0.01" min={MULTIPLIER_RANGE.min} max={MULTIPLIER_RANGE.max}
                        invalid={!!errors.holiday_ot_multiplier}
                        value={form.holiday_ot_multiplier || ""}
                        onChange={(e) => handleChange("holiday_ot_multiplier", e.target.value)}
                        onBlur={() => handleBlur("holiday_ot_multiplier")}
                        style={{ width: 100 }}
                      />
                      {errors.holiday_ot_multiplier && <FormFeedback data-testid="overtime-policy-holiday-ot-multiplier-error" style={{ display: "block" }}>{errors.holiday_ot_multiplier}</FormFeedback>}
                    </div>
                  ) : (
                    <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>×{data.holiday_ot_multiplier || "—"}</Badge>
                  )}
                </SettingRow>
              )}
              {!(isEditing ? form.is_holiday_ot_enabled : data.is_holiday_ot_enabled) && (
                <SettingRow label="" last><span className="text-muted" style={{ fontSize: 12 }}>Holiday OT not applicable</span></SettingRow>
              )}
            </div>
          </>
        )}

        {!otEnabled && !isEditing && (
          <div className="alert alert-warning d-flex align-items-center gap-2 py-2 px-3">
            <i className="ri-information-line fs-16"></i>
            <span style={{ fontSize: 13 }}>Overtime is currently disabled. Enable it to configure OT rules.</span>
          </div>
        )}

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button data-testid="overtime-policy-cancel-button" color="light" className="border" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <Button data-testid="overtime-policy-save-changes-button" color="success" onClick={handleSave} disabled={loading}>
              <i className="ri-check-double-line align-middle me-1"></i>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OvertimePolicySettings;