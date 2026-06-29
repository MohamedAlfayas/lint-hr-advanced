import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import Select from "react-select";
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
      background: checked ? "#0ab39c" : "#ced4da", position: "relative", flexShrink: 0,
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

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleToggle = (field) => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () => {
    if (!form.is_ot_enabled)
      return runChecks([required("Effective date", form.effective_date)], toast);

    const checks = [
      required("Effective date", form.effective_date),
      min("OT multiplier", form.ot_multiplier, 1),
      min("Min OT minutes", form.minimum_ot_minutes, 0),
      range("Max OT minutes/day", form.maximum_ot_minutes_per_day, 0, 1440),
    ];
    if (Number(form.maximum_ot_minutes_per_day) < Number(form.minimum_ot_minutes))
      checks.push("Max OT minutes/day must be ≥ Min OT minutes");
    if (form.is_weekend_ot_enabled)
      checks.push(min("Weekend OT multiplier", form.weekend_ot_multiplier, 1));
    if (form.is_holiday_ot_enabled)
      checks.push(min("Holiday OT multiplier", form.holiday_ot_multiplier, 1));
    return runChecks(checks, toast);
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
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to save"))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    if (records.length > 0) setForm({ ...records[0] });
    setIsEditing(false);
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
            <Button color="primary" onClick={handleNew}>
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
              <Button size="sm" color="primary" outline onClick={() => { setForm({ ...records[0] }); setIsEditing(true); }}>
                <i className="ri-edit-line fs-14"></i> Edit
              </Button>
              <Button size="sm" color="success" outline onClick={handleNew}>
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
                onClick={() => setForm({ ...r })}
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
              <Input type="date" value={form.effective_date || ""} onChange={(e) => handleChange("effective_date", e.target.value)} style={{ width: 180 }} />
            ) : (
              <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>
            )}
          </SettingRow>
          <SettingRow label="Status">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input className="form-check-input" type="checkbox" checked={!!form.is_active} onChange={() => handleToggle("is_active")} />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{form.is_active ? "Active" : "Inactive"}</Label>
              </div>
            ) : (
              <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
            )}
          </SettingRow>
          <SettingRow label="Enable Overtime" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input className="form-check-input" type="checkbox" checked={!!form.is_ot_enabled} onChange={() => handleToggle("is_ot_enabled")} />
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
                  <Input type="number" step="0.01" min="1" value={form.ot_multiplier || ""} onChange={(e) => handleChange("ot_multiplier", e.target.value)} style={{ width: 100 }} />
                ) : (
                  <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>×{data.ot_multiplier || "—"}</Badge>
                )}
              </SettingRow>
              <SettingRow label="Min OT Minutes">
                {isEditing ? (
                  <Input type="number" min="0" value={form.minimum_ot_minutes ?? ""} onChange={(e) => handleChange("minimum_ot_minutes", parseInt(e.target.value))} style={{ width: 100 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.minimum_ot_minutes ?? "—"} min</span>
                )}
              </SettingRow>
              <SettingRow label="Max OT Minutes / Day" last>
                {isEditing ? (
                  <Input type="number" min="0" value={form.maximum_ot_minutes_per_day ?? ""} onChange={(e) => handleChange("maximum_ot_minutes_per_day", parseInt(e.target.value))} style={{ width: 100 }} />
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
                    <Input className="form-check-input" type="checkbox" checked={!!form.is_weekend_ot_enabled} onChange={() => handleToggle("is_weekend_ot_enabled")} />
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_weekend_ot_enabled} />
                )}
              </SettingRow>
              {(isEditing ? form.is_weekend_ot_enabled : data.is_weekend_ot_enabled) && (
                <SettingRow label="Weekend OT Multiplier" last>
                  {isEditing ? (
                    <Input type="number" step="0.01" min="1" value={form.weekend_ot_multiplier || ""} onChange={(e) => handleChange("weekend_ot_multiplier", e.target.value)} style={{ width: 100 }} />
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
                    <Input className="form-check-input" type="checkbox" checked={!!form.is_holiday_ot_enabled} onChange={() => handleToggle("is_holiday_ot_enabled")} />
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_holiday_ot_enabled} />
                )}
              </SettingRow>
              {(isEditing ? form.is_holiday_ot_enabled : data.is_holiday_ot_enabled) && (
                <SettingRow label="Holiday OT Multiplier" last>
                  {isEditing ? (
                    <Input type="number" step="0.01" min="1" value={form.holiday_ot_multiplier || ""} onChange={(e) => handleChange("holiday_ot_multiplier", e.target.value)} style={{ width: 100 }} />
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
            <Button color="light" className="border" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <Button color="success" onClick={handleSave} disabled={loading}>
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