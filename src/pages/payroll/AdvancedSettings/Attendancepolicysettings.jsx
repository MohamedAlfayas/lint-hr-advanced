// AttendancePolicySettings.jsx
// One screen, ONE shared Effective Date + Status, ONE Save button.
// Three sections still persist to their own endpoints (backend tables kept
// separate); Save fires them sequentially and STOPS on first failure.
//   1. Attendance Policy       -> payroll/attendence-policy-settings/
//   2. Attendance Hours Policy -> payroll/attendance-hours-policy/
//   3. Comp Off Policy         -> payroll/comp-off-policy/
import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge, Spinner,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { required, range, day, runChecks } from "./validators";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import { DetailSkeleton } from "../../../component/common/skeleton/Skeleton";

const SALARY_METHOD_OPTIONS = [
  { value: "calendar_days", label: "Calendar Days" },
  { value: "working_days", label: "Working Days" },
  { value: "fixed_days", label: "Fixed Days" },
];
const ROUNDING_OPTIONS = [
  { value: "actual", label: "Actual (No Rounding)" },
  { value: "round_30", label: "Round Down to 30 Minutes" },
  { value: "round_60", label: "Round Down to 60 Minutes" },
];
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

const SectionLabel = ({ children }) => (
  <p className="text-uppercase fw-semibold text-muted mb-2 mt-1" style={{ fontSize: 11, letterSpacing: "0.8px" }}>
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

const Switch = ({ checked, onChange, disabled, testId: switchTestId }) => (
  <div className="form-check form-switch mb-0">
    <Input className="form-check-input" type="checkbox" checked={!!checked} disabled={disabled} onChange={onChange} data-testid={switchTestId} />
  </div>
);

// ── section blanks (effective_date / is_active injected from shared) ─────
const ATT_BLANK = {
  salary_calculation_method: "calendar_days",
  fixed_pay_days: null,
  include_week_offs: true,
  include_holidays: true,
  half_day_value: "0.50",
  enable_late_mark_policy: false,
  late_mark_limit: 0,
  late_mark_penalty_days: "0.00",
  mark_absent_if_no_attendance: true,
};
const HOURS_BLANK = {
  half_day_minimum_hours: "4.00",
  full_day_minimum_hours: "7.00",
  max_permission_hours_per_day: "0.00",
};
const COMP_BLANK = {
  is_comp_off_enabled: false,
  rounding_method: "actual",
  minimum_hours_for_rounding: "7.00",
  max_comp_off_hours_per_day: "",
  compensation_rounding_method: "actual",
};

const AttendancePolicySettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // shared
  const [effectiveDate, setEffectiveDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // per-section field state + existing ids
  const [att, setAtt] = useState(ATT_BLANK);
  const [attId, setAttId] = useState(null);
  const [hours, setHours] = useState(HOURS_BLANK);
  const [hoursId, setHoursId] = useState(null);
  const [comp, setComp] = useState(COMP_BLANK);
  const [compId, setCompId] = useState(null);

  const [isEmpty, setIsEmpty] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      Api({ method: "GET", url: "payroll/attendence-policy-settings/" }).then(r => r?.data?.data || []).catch(() => []),
      Api({ method: "GET", url: "payroll/attendance-hours-policy/" }).then(r => r?.data?.data || []).catch(() => []),
      Api({ method: "GET", url: "payroll/comp-off-policy/" }).then(r => r?.data?.data || []).catch(() => []),
    ])
      .then(([attList, hoursList, compList]) => {
        const a = attList[0], h = hoursList[0], c = compList[0];

        setIsEmpty(!a && !h && !c);

        // shared effective/active seeded from the attendance policy (fallback to others)
        const seed = a || h || c || {};
        setEffectiveDate(seed.effective_date || "");
        setIsActive(seed.is_active ?? true);

        setAttId(a?.id || null);
        setAtt(a ? {
          salary_calculation_method: a.salary_calculation_method || "calendar_days",
          fixed_pay_days: a.fixed_pay_days ?? null,
          include_week_offs: a.include_week_offs ?? true,
          include_holidays: a.include_holidays ?? true,
          half_day_value: String(a.half_day_value ?? "0.50"),
          enable_late_mark_policy: a.enable_late_mark_policy ?? false,
          late_mark_limit: a.late_mark_limit ?? 0,
          late_mark_penalty_days: String(a.late_mark_penalty_days ?? "0.00"),
          mark_absent_if_no_attendance: a.mark_absent_if_no_attendance ?? true,
        } : ATT_BLANK);

        setHoursId(h?.id || null);
        setHours(h ? {
          half_day_minimum_hours: String(h.half_day_minimum_hours ?? "4.00"),
          full_day_minimum_hours: String(h.full_day_minimum_hours ?? "7.00"),
          max_permission_hours_per_day: String(h.max_permission_hours_per_day ?? "0.00"),
        } : HOURS_BLANK);

        setCompId(c?.id || null);
        setComp(c ? {
          is_comp_off_enabled: c.is_comp_off_enabled ?? false,
          rounding_method: c.rounding_method || "actual",
          minimum_hours_for_rounding: String(c.minimum_hours_for_rounding ?? "7.00"),
          max_comp_off_hours_per_day:
            c.max_comp_off_hours_per_day === null || c.max_comp_off_hours_per_day === undefined
              ? "" : String(c.max_comp_off_hours_per_day),
          compensation_rounding_method: c.compensation_rounding_method || "actual",
        } : COMP_BLANK);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const setA = (k, v) => setAtt((f) => ({ ...f, [k]: v }));
  const setH = (k, v) => setHours((f) => ({ ...f, [k]: v }));
  const setC = (k, v) => setComp((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const checks = [
      required("Effective date", effectiveDate),
      required("Salary calculation method", att.salary_calculation_method),
      range("Half day value", att.half_day_value, 0, 1),
    ];
    if (att.salary_calculation_method === "fixed_days") {
      checks.push(required("Fixed pay days", att.fixed_pay_days));
      checks.push(day("Fixed pay days", att.fixed_pay_days));
    }
    if (att.enable_late_mark_policy) {
      checks.push(range("Allowed late marks", att.late_mark_limit, 0, 31));
      checks.push(range("Late mark penalty (LOP days)", att.late_mark_penalty_days, 0, 31));
    }
    if (!runChecks(checks, toast)) return false;

    // hours cross-field
    const half = parseFloat(hours.half_day_minimum_hours);
    const full = parseFloat(hours.full_day_minimum_hours);
    if (isNaN(half) || isNaN(full)) { toast.error("Attendance hours thresholds must be numbers."); return false; }
    if (half >= full) { toast.error("Half-day minimum must be less than full-day minimum."); return false; }
    return true;
  };

  // sequential save, STOP on first failure
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const shared = { effective_date: effectiveDate, is_active: isActive };
    const attBody   = { ...att,   ...shared, ...(attId   ? { id: attId }   : {}) };
    const hoursBody = { ...hours, ...shared, ...(hoursId ? { id: hoursId } : {}) };
    const compBody  = {
      ...comp, ...shared,
      max_comp_off_hours_per_day: comp.max_comp_off_hours_per_day === "" ? null : comp.max_comp_off_hours_per_day,
      ...(compId ? { id: compId } : {}),
    };

    const steps = [
      { name: "Attendance Policy",       url: "payroll/attendence-policy-settings/", id: attId,   body: attBody },
      { name: "Attendance Hours Policy", url: "payroll/attendance-hours-policy/",    id: hoursId, body: hoursBody },
      { name: "Comp Off Policy",         url: "payroll/comp-off-policy/",            id: compId,  body: compBody },
    ];

    try {
      for (const step of steps) {
        await Api({ method: step.id ? "PUT" : "POST", url: step.url, data: step.body });
      }
      toast.success("All policies saved.");
      setIsEditing(false);
      fetchAll();
    } catch (err) {
      const which = err?.config?.url?.includes("attendance-hours") ? "Attendance Hours Policy"
        : err?.config?.url?.includes("comp-off") ? "Comp Off Policy"
        : "Attendance Policy";
      toast.error(
        `${which}: ${err?.response?.data?.message || err?.response?.data?.error_message || "save failed"}. ` +
        "Earlier sections were saved; fix and Save again."
      );
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setIsEditing(false); fetchAll(); };

  const handleNew = () => {
    setEffectiveDate(""); setIsActive(true);
    setAtt(ATT_BLANK); setAttId(null);
    setHours(HOURS_BLANK); setHoursId(null);
    setComp(COMP_BLANK); setCompId(null);
    setIsEmpty(false); setIsEditing(true);
  };

  const isWorkingDays = att.salary_calculation_method === "working_days";
  const compDisabled = !comp.is_comp_off_enabled;

  if (loading) {
    return <DetailSkeleton sections={3} testId="attendance-policy-loading-skeleton" label="Loading attendance policy" />;
  }

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">Attendance Policy</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-calendar-check-line"></i>
              </div>
            </div>
            <h6 className="mb-1">No Attendance Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
              Set up attendance, hours, and comp-off preferences.
            </p>
            <Button data-testid="attendance-policy-configure-policy-button" color="primary" onClick={handleNew}>
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
          <CardTitle tag="h5" className="mb-0">Attendance Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Salary calculation, hours thresholds & comp-off — one effective date
          </CardSubtitle>
        </div>
        {!isEditing && (
          <Button data-testid="attendance-policy-edit-button" size="sm" color="primary" outline onClick={() => setIsEditing(true)}>
            <i className="ri-edit-line fs-14"></i> Edit
          </Button>
        )}
      </CardHeader>

      <CardBody className="p-4">
        {/* Active banner */}
        <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${isActive ? "alert-success" : "alert-secondary"}`}>
          <i className={`fs-16 ${isActive ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
          <span style={{ fontSize: 13 }}>
            <strong>Policy is {isActive ? "Active" : "Inactive"}</strong>
            {effectiveDate && <span className="ms-2 opacity-75">· Effective from {effectiveDate}</span>}
          </span>
        </div>

        {/* GENERAL (shared) */}
        <SectionLabel>General</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Effective Date">
            {isEditing ? (
              <Input data-testid="attendance-policy-effective-date-input" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} style={{ width: 180 }} />
            ) : <span style={{ fontSize: 13 }}>{effectiveDate || "—"}</span>}
          </SettingRow>
          <SettingRow label="Status">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input data-testid="attendance-policy-is-active-checkbox" className="form-check-input" type="checkbox" checked={isActive} onChange={() => setIsActive(v => !v)} />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{isActive ? "Active" : "Inactive"}</Label>
              </div>
            ) : <ViewToggle checked={isActive} label={isActive ? "Active" : "Inactive"} />}
          </SettingRow>
          <SettingRow label="Salary Calculation Method" last>
            {isEditing ? (
              <Select
                testId="attendance-policy-active"
                options={SALARY_METHOD_OPTIONS}
                value={SALARY_METHOD_OPTIONS.find(o => o.value === att.salary_calculation_method)}
                onChange={(e) => {
                  setA("salary_calculation_method", e.value);
                  if (e.value === "working_days") { setA("include_week_offs", false); setA("include_holidays", false); }
                  if (e.value !== "fixed_days") setA("fixed_pay_days", null);
                }}
                styles={{ container: (p) => ({ ...p, width: 220 }) }}
              />
            ) : (
              <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                {SALARY_METHOD_OPTIONS.find(o => o.value === att.salary_calculation_method)?.label || "—"}
              </Badge>
            )}
          </SettingRow>
        </div>

        {/* DAY INCLUSIONS / FIXED DAYS */}
        {att.salary_calculation_method !== "fixed_days" ? (
          <>
            <SectionLabel>Day Inclusions & Half Day</SectionLabel>
            <div className="border rounded mb-4">
              {[
                ["include_week_offs", "Include Weekly Offs in Payable Days"],
                ["include_holidays", "Include Holidays in Payable Days"],
                ["mark_absent_if_no_attendance", "Mark Absent if No Attendance"],
              ].map(([key, label], i, arr) => (
                <SettingRow key={key} label={label} last={false}>
                  {isEditing
                    ? <Switch testId={testId("attendance-policy", key, "switch")} checked={att[key]} disabled={isWorkingDays && ["include_week_offs", "include_holidays"].includes(key)} onChange={() => setA(key, !att[key])} />
                    : <ViewToggle checked={!!att[key]} />}
                </SettingRow>
              ))}
              <SettingRow label="Half Day Value" last>
                {isEditing ? (
                  <Input data-testid="attendance-policy-half-day-value-input" type="number" step="0.01" min="0" max="1" value={att.half_day_value}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v !== "" && Number(v) > 1) v = "1";
                      if (v !== "" && Number(v) < 0) v = "0";
                      setA("half_day_value", v);
                    }} style={{ width: 100 }} />
                ) : <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>{att.half_day_value || "—"}</Badge>}
              </SettingRow>
            </div>
          </>
        ) : (
          <>
            <SectionLabel>Fixed Days</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Fixed Pay Days">
                {isEditing ? (
                  <Select
                    testId="attendance-policy-fixed-pay-days"
                    options={DAY_OPTIONS}
                    value={DAY_OPTIONS.find(o => o.value === att.fixed_pay_days)}
                    onChange={(e) => setA("fixed_pay_days", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 120 }) }} />
                ) : <span style={{ fontSize: 13 }}>{att.fixed_pay_days || "—"}</span>}
              </SettingRow>
              <SettingRow label="Half Day Value" last>
                {isEditing ? (
                  <Input data-testid="attendance-policy-half-day-value-input" type="number" step="0.01" min="0" max="1" value={att.half_day_value}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v !== "" && Number(v) > 1) v = "1";
                      if (v !== "" && Number(v) < 0) v = "0";
                      setA("half_day_value", v);
                    }} style={{ width: 100 }} />
                ) : <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>{att.half_day_value || "—"}</Badge>}
              </SettingRow>
            </div>
          </>
        )}

        {/* LATE MARK */}
        <SectionLabel>Late Mark Policy</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Enable Late Mark Policy" last={!att.enable_late_mark_policy}>
            {isEditing
              ? <Switch testId="attendance-policy-enable-late-mark-policy-switch" checked={att.enable_late_mark_policy} onChange={() => setA("enable_late_mark_policy", !att.enable_late_mark_policy)} />
              : <ViewToggle checked={!!att.enable_late_mark_policy} />}
          </SettingRow>
          {att.enable_late_mark_policy && (
            <>
              <SettingRow label="Allowed Late Marks">
                {isEditing ? (
                  <Input
                    data-testid="attendance-policy-late-mark-limit-input" type="number" min="0" max="31" value={att.late_mark_limit || 0}
                    onChange={(e) => { let v = parseInt(e.target.value) || 0; v = Math.max(0, Math.min(31, v)); setA("late_mark_limit", v); }}
                    style={{ width: 100 }} />
                ) : <span style={{ fontSize: 13 }}>{att.late_mark_limit ?? "—"}</span>}
              </SettingRow>
              <SettingRow label="Penalty (LOP Days)" last>
                {isEditing ? (
                  <Input
                    data-testid="attendance-policy-late-mark-penalty-days-input" type="number" step="0.01" min="0" max="31" value={att.late_mark_penalty_days || "0.00"}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v !== "" && Number(v) > 31) v = "31";
                      if (v !== "" && Number(v) < 0) v = "0";
                      setA("late_mark_penalty_days", v);
                    }} style={{ width: 100 }} />
                ) : <span style={{ fontSize: 13 }}>{att.late_mark_penalty_days ?? "—"}</span>}
              </SettingRow>
            </>
          )}
        </div>

        {/* HOURS THRESHOLDS */}
        <SectionLabel>Hours Thresholds (Day Loss)</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Half-Day Minimum (hrs)">
            {isEditing ? (
              <Input
                data-testid="attendance-policy-half-day-minimum-hours-input" type="number" step="0.25" min="0" value={hours.half_day_minimum_hours}
                onChange={(e) => setH("half_day_minimum_hours", e.target.value)} style={{ width: 120 }} />
            ) : <span style={{ fontSize: 13 }}>{hours.half_day_minimum_hours}</span>}
          </SettingRow>
          <SettingRow label="Full-Day Minimum (hrs)">
            {isEditing ? (
              <Input
                data-testid="attendance-policy-full-day-minimum-hours-input" type="number" step="0.25" min="0" value={hours.full_day_minimum_hours}
                onChange={(e) => setH("full_day_minimum_hours", e.target.value)} style={{ width: 120 }} />
            ) : <span style={{ fontSize: 13 }}>{hours.full_day_minimum_hours}</span>}
          </SettingRow>
          <SettingRow label="Max Permission (hrs/day)" last>
            {isEditing ? (
              <Input
                data-testid="attendance-policy-max-permission-hours-per-input" type="number" step="0.25" min="0" value={hours.max_permission_hours_per_day}
                onChange={(e) => setH("max_permission_hours_per_day", e.target.value)} style={{ width: 120 }} />
            ) : <span style={{ fontSize: 13 }}>{hours.max_permission_hours_per_day}</span>}
          </SettingRow>
        </div>

        {/* COMP OFF */}
        <SectionLabel>Comp Off</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Comp-Off Enabled">
            {isEditing
              ? <Switch testId="attendance-policy-is-comp-off-enabled-switch" checked={comp.is_comp_off_enabled} onChange={() => setC("is_comp_off_enabled", !comp.is_comp_off_enabled)} />
              : <ViewToggle checked={!!comp.is_comp_off_enabled} />}
          </SettingRow>
          <SettingRow label="Pending Rounding Method">
            {isEditing ? (
              <Input
                data-testid="attendance-policy-rounding-method-select" type="select" value={comp.rounding_method} disabled={compDisabled}
                onChange={(e) => setC("rounding_method", e.target.value)} style={{ width: 240 }}>
                {ROUNDING_OPTIONS.map((o) => <option data-testid={testId("attendance-policy-rounding-method-option", itemTestKey(o))} key={o.value} value={o.value}>{o.label}</option>)}
              </Input>
            ) : <span style={{ fontSize: 13 }}>{ROUNDING_OPTIONS.find(o => o.value === comp.rounding_method)?.label || "—"}</span>}
          </SettingRow>
          <SettingRow label="Compensation Rounding Method">
            {isEditing ? (
              <Input
                data-testid="attendance-policy-compensation-rounding-method-select" type="select" value={comp.compensation_rounding_method} disabled={compDisabled}
                onChange={(e) => setC("compensation_rounding_method", e.target.value)} style={{ width: 240 }}>
                {ROUNDING_OPTIONS.map((o) => <option data-testid={testId("attendance-policy-compensation-rounding-method-option", itemTestKey(o))} key={o.value} value={o.value}>{o.label}</option>)}
              </Input>
            ) : <span style={{ fontSize: 13 }}>{ROUNDING_OPTIONS.find(o => o.value === comp.compensation_rounding_method)?.label || "—"}</span>}
          </SettingRow>
          <SettingRow label="Minimum Hours for Rounding">
            {isEditing ? (
              <Input
                data-testid="attendance-policy-minimum-hours-for-rounding-input" type="number" step="0.25" min="0" disabled={compDisabled} value={comp.minimum_hours_for_rounding}
                onChange={(e) => setC("minimum_hours_for_rounding", e.target.value)} style={{ width: 120 }} />
            ) : <span style={{ fontSize: 13 }}>{comp.minimum_hours_for_rounding}</span>}
          </SettingRow>
          <SettingRow label="Max Comp-Off (hrs/day)" last>
            {isEditing ? (
              <Input
                data-testid="attendance-policy-blank-no-cap-input" type="number" step="0.25" min="0" disabled={compDisabled}
                value={comp.max_comp_off_hours_per_day} placeholder="Blank = no cap"
                onChange={(e) => setC("max_comp_off_hours_per_day", e.target.value)} style={{ width: 160 }} />
            ) : <span style={{ fontSize: 13 }}>{comp.max_comp_off_hours_per_day === "" ? "No cap" : comp.max_comp_off_hours_per_day}</span>}
          </SettingRow>
        </div>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button data-testid="attendance-policy-cancel-button" color="light" className="border" onClick={handleCancel} disabled={saving}>Cancel</Button>
            <Button data-testid="attendance-policy-save-changes-button" color="success" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : <i className="ri-check-double-line align-middle me-1"></i>}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AttendancePolicySettings;