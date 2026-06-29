import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { required, range, day, min, runChecks } from "./validators";

const SALARY_METHOD_OPTIONS = [
  { value: "calendar_days", label: "Calendar Days" },
  { value: "working_days", label: "Working Days" },
  { value: "fixed_days", label: "Fixed Days" },
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

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

const AttendancePolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/attendence-policy-settings/" })
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
    const checks = [
      required("Effective date", form.effective_date),
      required("Salary calculation method", form.salary_calculation_method),
      range("Half day value", form.half_day_value, 0, 1),
    ];
    if (form.salary_calculation_method === "fixed_days") {
      checks.push(required("Fixed pay days", form.fixed_pay_days));
      checks.push(day("Fixed pay days", form.fixed_pay_days));
    }
    if (form.enable_late_mark_policy) {
      checks.push(range("Allowed late marks", form.late_mark_limit, 0, 31));
      checks.push(min("Late mark penalty (LOP days)", form.late_mark_penalty_days, 0));
    }
    return runChecks(checks, toast);
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    const isUpdate = form?.id;
    Api({
      method: isUpdate ? "PUT" : "POST",
      url: "payroll/attendence-policy-settings/",
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
      salary_calculation_method: "calendar_days",
      fixed_pay_days: null,
      include_week_offs: true,
      include_holidays: true,
      half_day_value: "0.50",
      enable_late_mark_policy: false,
      late_mark_limit: 0,
      late_mark_penalty_days: "0.00",
      mark_absent_if_no_attendance: true,
      is_active: true,
    });
    setIsEmpty(false);
    setIsEditing(true);
  };

  const data = form || {};

  const isWorkingDays =
    (isEditing ? form?.salary_calculation_method : data?.salary_calculation_method)
    === "working_days";

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
              Set up your attendance and salary calculation preferences.
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
          <CardTitle tag="h5" className="mb-0">Attendance Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Salary calculation method and late mark rules
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
        {/* Version history pills */}
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

        {/* Status banner */}
        {!isEditing && (
          <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
            <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
            <span style={{ fontSize: 13 }}>
              <strong>Policy is {data.is_active ? "Active" : "Inactive"}</strong>
              {data.effective_date && <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>}
            </span>
          </div>
        )}

        {/* General */}
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

          <SettingRow label="Salary Calculation Method" last>
            {isEditing ? (
              <Select
                options={SALARY_METHOD_OPTIONS}
                value={SALARY_METHOD_OPTIONS.find(o => o.value === form.salary_calculation_method)}
                onChange={(e) => {
                  handleChange("salary_calculation_method", e.value);

                  if (e.value === "working_days") {
                    handleChange("include_week_offs", false);
                    handleChange("include_holidays", false);
                  }
                }}
                styles={{ container: (p) => ({ ...p, width: 220 }) }}
              />
            ) : (
              <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                {SALARY_METHOD_OPTIONS.find(o => o.value === data.salary_calculation_method)?.label || "—"}
              </Badge>
            )}
          </SettingRow>
        </div>

        {/* Fixed Days (conditional) */}
        {(isEditing ? form.salary_calculation_method : data.salary_calculation_method) === "fixed_days" && (
          <>
            <SectionLabel>Fixed Days</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Fixed Pay Days" last>
                {isEditing ? (
                  <Select
                    options={DAY_OPTIONS}
                    value={DAY_OPTIONS.find(o => o.value === form.fixed_pay_days)}
                    onChange={(e) => handleChange("fixed_pay_days", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 120 }) }}
                  />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.fixed_pay_days || "—"}</span>
                )}
              </SettingRow>
            </div>
          </>
        )}

        {/* Inclusions */}
        <SectionLabel>Day Inclusions & Half Day</SectionLabel>
        <div className="border rounded mb-4">
          {[
            ["include_week_offs", "Include Weekly Offs in Payable Days"],
            ["include_holidays", "Include Holidays in Payable Days"],
            ["mark_absent_if_no_attendance", "Mark Absent if No Attendance"],
          ].map(([key, label], i, arr) => (
            <SettingRow key={key} label={label} last={i === arr.length - 1 && !isEditing}>
              {isEditing ? (
                <div className="form-check form-switch mb-0">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!form[key]}
                    disabled={
                      isWorkingDays &&
                      ["include_week_offs", "include_holidays"].includes(key)
                    }
                    onChange={() => handleToggle(key)}
                  />
                </div>
              ) : (
                <ViewToggle checked={!!data[key]} />
              )}
            </SettingRow>
          ))}
          <SettingRow label="Half Day Value" last>
            {isEditing ? (
              <Input type="number" step="0.01" min="0" max="1" value={form.half_day_value || ""} onChange={(e) => handleChange("half_day_value", e.target.value)} style={{ width: 100 }} />
            ) : (
              <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>{data.half_day_value || "—"}</Badge>
            )}
          </SettingRow>
        </div>

        {/* Late Mark */}
        <SectionLabel>Late Mark Policy</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Enable Late Mark Policy">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input className="form-check-input" type="checkbox" checked={!!form.enable_late_mark_policy} onChange={() => handleToggle("enable_late_mark_policy")} />
              </div>
            ) : (
              <ViewToggle checked={!!data.enable_late_mark_policy} />
            )}
          </SettingRow>

          {(isEditing ? form.enable_late_mark_policy : data.enable_late_mark_policy) && (
            <>
              <SettingRow label="Allowed Late Marks">
                {isEditing ? (
                  <Input type="number" min="0" value={form.late_mark_limit || 0} onChange={(e) => handleChange("late_mark_limit", parseInt(e.target.value))} style={{ width: 100 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.late_mark_limit ?? "—"}</span>
                )}
              </SettingRow>
              <SettingRow label="Penalty (LOP Days)" last>
                {isEditing ? (
                  <Input type="number" step="0.01" min="0" value={form.late_mark_penalty_days || "0.00"} onChange={(e) => handleChange("late_mark_penalty_days", e.target.value)} style={{ width: 100 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.late_mark_penalty_days ?? "—"}</span>
                )}
              </SettingRow>
            </>
          )}
          {!(isEditing ? form.enable_late_mark_policy : data.enable_late_mark_policy) && (
            <SettingRow label="" last><span className="text-muted" style={{ fontSize: 12 }}>No late mark penalty configured</span></SettingRow>
          )}
        </div>

        {/* Actions */}
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

export default AttendancePolicySettings;