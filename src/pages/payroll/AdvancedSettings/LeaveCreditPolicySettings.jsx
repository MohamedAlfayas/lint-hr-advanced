// LeaveCreditPolicySettings.jsx
// Company-wide leave-credit / carry-forward / encashment policy (versioned,
// like AttendancePolicySettings) + a small Proration Rule manager.
import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const CREDIT_MODE = [
  { value: true, label: "Monthly accrual" },
  { value: false, label: "Yearly lump" },
];
const BOUNDARY = [
  { value: "FY", label: "Financial Year (Apr–Mar)" },
  { value: "CY", label: "Calendar Year (Jan–Dec)" },
  { value: "DOJ", label: "Date of Joining Anniversary" },
];
const ENCASH_BASE = [
  { value: "BASIC", label: "Basic" },
  { value: "GROSS", label: "Gross" },
];
const PRORATION_METHOD = [
  { value: "PRORATE_DAYS", label: "Prorate by calendar days" },
  { value: "CUTOFF", label: "Full month Credit if joined by cutoff, else zero" },
];

const SectionLabel = ({ children }) => (
  <p className="text-uppercase fw-semibold text-muted mb-2" style={{ fontSize: 11, letterSpacing: "0.8px" }}>
    {children}
  </p>
);
const SettingRow = ({ label, children, last = false }) => (
  <Row className={`align-items-center px-3 py-2 g-0${!last ? " border-bottom" : ""}`}>
    <Col sm={5} md={4}><Label className="mb-0 text-muted" style={{ fontSize: 13 }}>{label}</Label></Col>
    <Col sm={7} md={8}>{children}</Col>
  </Row>
);
const ViewToggle = ({ checked, label }) => (
  <div className="d-flex align-items-center gap-2">
    <span style={{ display: "inline-block", width: 36, height: 20, borderRadius: 12, background: checked ? "var(--vz-success)" : "rgba(var(--vz-secondary-rgb), .35)", position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: checked ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </span>
    {label && <span style={{ fontSize: 13 }}>{label}</span>}
  </div>
);

// ─── Proration Rule catalog (read-only, seed-fed) ────────────────────────────
const ProrationRules = ({ rules }) => (
  <>
    <SectionLabel>Proration Rules (DOJ Joiners)</SectionLabel>
    <div className="border rounded mb-4">
      {rules.length === 0 && (
        <div className="px-3 py-3 text-muted" style={{ fontSize: 13 }}>
          No proration rules seeded.
        </div>
      )}
      {rules.map((r, i) => (
        <SettingRow key={r.id} label={r.code} last={i === rules.length - 1}>
          <span style={{ fontSize: 13 }}>
            {PRORATION_METHOD.find((m) => m.value === r.method)?.label || r.method}
            {r.method === "CUTOFF" && r.cutoff_day ? ` · joined by day ${r.cutoff_day}` : ""}
          </span>
        </SettingRow>
      ))}
    </div>
  </>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const LeaveCreditPolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const ruleOptions = rules.map((r) => ({ value: r.id, label: r.code }));

  const fetchRules = () =>
    Api({ method: "GET", url: "payroll/proration-rule-master/" })
      .then((res) => setRules(res?.data?.data || []));

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      Api({ method: "GET", url: "payroll/company-leave-policy/" }),
      fetchRules(),
    ])
      .then(([res]) => {
        const list = res?.data?.data || [];
        setRecords(list);
        setIsEmpty(list.length === 0);
        if (list.length > 0) setForm({ ...list[0] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const handleToggle = (field) => setForm((p) => ({ ...p, [field]: !p[field] }));

  const validate = () => {
    if (!form.effective_date) { toast.error("Effective date is required"); return false; }
    if (form.credit_based && (form.monthly_credit === "" || form.monthly_credit == null)) { toast.error("Monthly credit is required"); return false; }
    if (!form.credit_based && (form.yearly_credit === "" || form.yearly_credit == null)) { toast.error("Yearly credit is required"); return false; }
    if (!form.encashment_day_divisor) { toast.error("Encashment divisor is required"); return false; }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    const isUpdate = !!form?.id;
    Api({ method: isUpdate ? "PUT" : "POST", url: "payroll/company-leave-policy/", data: form })
      .then((res) => { toast.success(res?.data?.message || "Saved"); fetchData(); setIsEditing(false); })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to save"))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => { if (records.length > 0) setForm({ ...records[0] }); setIsEditing(false); };

  const handleNew = () => {
    setForm({
      effective_date: "", credit_based: true, carry_forward: false,
      boundary_type: "FY", encashment_base: "BASIC", encashment_day_divisor: 30,
      proration_rule: null, monthly_credit: "1.50", yearly_credit: "18.00",
      max_carry_forward: "0.00", pay_remaining: false, is_active: true,
    });
    setIsEmpty(false);
    setIsEditing(true);
  };

  const data = form || {};

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light"><CardTitle tag="h5" className="mb-0">Leave Credit Policy</CardTitle></CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28"><i className="ri-calendar-2-line"></i></div>
            </div>
            <h6 className="mb-1">No Leave Credit Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>Set how paid leave is credited, carried forward and encashed.</p>
            <Button data-testid="leave-credit-policy-configure-policy-button" color="primary" onClick={handleNew}><i className="ri-add-line align-bottom me-1"></i> Configure Policy</Button>
          </div>
          {rules.length > 0 && <div className="mt-2"><ProrationRules rules={rules} /></div>}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <CardTitle tag="h5" className="mb-0">Leave Credit Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Company-wide accrual, carry-forward and encashment. Per-employee counts are set on the salary screen.
          </CardSubtitle>
        </div>
        <div className="d-flex gap-2">
          {!isEditing && (
            <>
              <Button data-testid="leave-credit-policy-edit-button" size="sm" color="primary" outline onClick={() => { setForm({ ...records[0] }); setIsEditing(true); }}>
                <i className="ri-edit-line fs-14"></i> Edit
              </Button>
              <Button data-testid="leave-credit-policy-new-version-button" size="sm" color="success" outline onClick={handleNew}><i className="ri-add-line fs-14"></i> New Version</Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-4">
        {!isEditing && records.length > 1 && (
          <div className="d-flex gap-2 flex-wrap mb-4">
            {records.map((r, i) => (
              <Badge key={r.id} color={form?.id === r.id ? "primary" : "light"}
                className={form?.id === r.id ? "" : "text-dark border"}
                style={{ cursor: "pointer", fontSize: 12, padding: "5px 12px" }}
                onClick={() => setForm({ ...r })}>
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
            {isEditing
              ? <Input data-testid="leave-credit-policy-effective-date-input" type="date" value={form.effective_date || ""} onChange={(e) => handleChange("effective_date", e.target.value)} style={{ width: 180 }} />
              : <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>}
          </SettingRow>
          <SettingRow label="Status">
            {isEditing
              ? <div className="form-check form-switch mb-0"><Input data-testid="leave-credit-policy-is-active-checkbox" className="form-check-input" type="checkbox" checked={!!form.is_active} onChange={() => handleToggle("is_active")} /></div>
              : <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />}
          </SettingRow>
          <SettingRow label="Credit Mode" last>
            {isEditing
              ? <Select
                  testId="leave-credit-policy-credit-based" options={CREDIT_MODE} value={CREDIT_MODE.find((o) => o.value === form.credit_based)}
                  onChange={(o) => handleChange("credit_based", o.value)} styles={{ container: (p) => ({ ...p, width: 220 }) }} />
              : <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>{CREDIT_MODE.find((o) => o.value === data.credit_based)?.label || "—"}</Badge>}
          </SettingRow>
        </div>

        <SectionLabel>Credit Amounts (Company Default)</SectionLabel>
        <div className="border rounded mb-4">
          {(isEditing ? form.credit_based : data.credit_based) ? (
            <SettingRow label="Monthly Credit (days)" last>
              {isEditing
                ? <Input data-testid="leave-credit-policy-monthly-credit-input" type="number" step="0.01" min="0" value={form.monthly_credit ?? ""} onChange={(e) => handleChange("monthly_credit", e.target.value)} style={{ width: 120 }} />
                : <span style={{ fontSize: 13 }}>{data.monthly_credit ?? "—"}</span>}
            </SettingRow>
          ) : (
            <SettingRow label="Yearly Credit (days)" last>
              {isEditing
                ? <Input data-testid="leave-credit-policy-yearly-credit-input" type="number" step="0.01" min="0" value={form.yearly_credit ?? ""} onChange={(e) => handleChange("yearly_credit", e.target.value)} style={{ width: 120 }} />
                : <span style={{ fontSize: 13 }}>{data.yearly_credit ?? "—"}</span>}
            </SettingRow>
          )}
        </div>

        <SectionLabel>Boundary & Carry Forward</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Period Boundary">
            {isEditing
              ? <Select
                  testId="leave-credit-policy-boundary-type" options={BOUNDARY} value={BOUNDARY.find((o) => o.value === form.boundary_type)}
                  onChange={(o) => handleChange("boundary_type", o.value)} styles={{ container: (p) => ({ ...p, width: 260 }) }} />
              : <span style={{ fontSize: 13 }}>{BOUNDARY.find((o) => o.value === data.boundary_type)?.label || "—"}</span>}
          </SettingRow>
          <SettingRow label="Carry Forward" last={!(isEditing ? form.carry_forward : data.carry_forward)}>
            {isEditing
              ? <div className="form-check form-switch mb-0"><Input data-testid="leave-credit-policy-carry-forward-checkbox" className="form-check-input" type="checkbox" checked={!!form.carry_forward} onChange={() => handleToggle("carry_forward")} /></div>
              : <ViewToggle checked={!!data.carry_forward} />}
          </SettingRow>
          {(isEditing ? form.carry_forward : data.carry_forward) && (
            <SettingRow label="Max Carry Forward (days, default)" last>
              {isEditing
                ? <Input data-testid="leave-credit-policy-max-carry-forward-input" type="number" step="0.01" min="0" value={form.max_carry_forward ?? ""} onChange={(e) => handleChange("max_carry_forward", e.target.value)} style={{ width: 120 }} />
                : <span style={{ fontSize: 13 }}>{data.max_carry_forward ?? "—"}</span>}
            </SettingRow>
          )}
        </div>

        <SectionLabel>Remainder & Encashment</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Pay Remaining (encash, default)">
            {isEditing
              ? <div className="form-check form-switch mb-0"><Input data-testid="leave-credit-policy-pay-remaining-checkbox" className="form-check-input" type="checkbox" checked={!!form.pay_remaining} onChange={() => handleToggle("pay_remaining")} />
                  <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{form.pay_remaining ? "Encash" : "Lapse"}</Label></div>
              : <ViewToggle checked={!!data.pay_remaining} label={data.pay_remaining ? "Encash" : "Lapse"} />}
          </SettingRow>
          <SettingRow label="Encashment Base">
            {isEditing
              ? <Select
                  testId="leave-credit-policy-encash" options={ENCASH_BASE} value={ENCASH_BASE.find((o) => o.value === form.encashment_base)}
                  onChange={(o) => handleChange("encashment_base", o.value)} styles={{ container: (p) => ({ ...p, width: 200 }) }} />
              : <span style={{ fontSize: 13 }}>{ENCASH_BASE.find((o) => o.value === data.encashment_base)?.label || "—"}</span>}
          </SettingRow>
          <SettingRow label="Per-day Divisor" last>
            {isEditing
              ? <Input data-testid="leave-credit-policy-encashment-day-divisor-input" type="number" min="1" max="31" value={form.encashment_day_divisor ?? ""} onChange={(e) => handleChange("encashment_day_divisor", e.target.value)} style={{ width: 100 }} />
              : <span style={{ fontSize: 13 }}>{data.encashment_day_divisor ?? "—"}</span>}
          </SettingRow>
        </div>

        <SectionLabel>Joiner Proration</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Proration Rule" last>
            {isEditing
              ? <Select
                  testId="leave-credit-policy-calendar-day-default" options={ruleOptions} isClearable value={ruleOptions.find((o) => o.value === form.proration_rule) || null}
                  onChange={(o) => handleChange("proration_rule", o ? o.value : null)} placeholder="Calendar-day (default)"
                  styles={{ container: (p) => ({ ...p, width: 240 }) }} />
              : <span style={{ fontSize: 13 }}>{rules.find((r) => r.id === data.proration_rule)?.code || "Calendar-day (default)"}</span>}
          </SettingRow>
        </div>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 pt-2 border-top mb-4">
            <Button data-testid="leave-credit-policy-cancel-button" color="light" className="border" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <Button data-testid="leave-credit-policy-save-changes-button" color="success" onClick={handleSave} disabled={loading}>
              <i className="ri-check-double-line align-middle me-1"></i>{loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}

        {!isEditing && <ProrationRules rules={rules} />}
      </CardBody>
    </Card>
  );
};

export default LeaveCreditPolicySettings;