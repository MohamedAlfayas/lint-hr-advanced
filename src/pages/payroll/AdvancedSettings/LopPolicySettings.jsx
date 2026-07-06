// LopPolicySettings.jsx
import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { required, day, isBlank, runChecks } from "./validators";

const LOP_METHOD_OPTIONS = [
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

const LopPolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [attendanceMethod, setAttendanceMethod] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/lop-policy-settings/" })
      .then((res) => {
        const list = res?.data?.data || [];
        setRecords(list);
        setIsEmpty(list.length === 0);
        if (list.length > 0) setForm({ ...list[0] });
      })
      .finally(() => setLoading(false));
  };

  const fetchAttendanceMethod = () => {
    Api({ method: "GET", url: "payroll/attendence-policy-settings/" })
      .then((res) => {
        const list = res?.data?.data || [];
        if (list.length > 0) setAttendanceMethod(list[0].salary_calculation_method);
      });
  };

  useEffect(() => {
    fetchData();
    fetchAttendanceMethod();
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleToggle = (field) => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () => {
    const checks = [
      required("Effective date", form.effective_date),
      required("LOP calculation method", form.lop_calculation_method),
    ];
    if (form.lop_calculation_method === "fixed_days") {
      checks.push(required("Fixed days", form.fixed_days));
      checks.push(day("Fixed days", form.fixed_days));
    }
    if (!isBlank(form.max_lop_days_per_month) && form.max_lop_days_per_month !== 0)
      checks.push(day("Max LOP days per month", form.max_lop_days_per_month));
    return runChecks(checks, toast);
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    const isUpdate = form?.id;
    Api({
      method: isUpdate ? "PUT" : "POST",
      url: "payroll/lop-policy-settings/",
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
      lop_calculation_method: "calendar_days",
      fixed_days: null,
      include_week_offs_in_lop: false,
      include_holidays_in_lop: false,
      prioritise_leave_over_lop: true,
      max_lop_days_per_month: null,
      is_active: true,
    });
    setIsEmpty(false);
    setIsEditing(true);
  };

  const data = form || {};
  const currentMethod = isEditing ? form?.lop_calculation_method : data.lop_calculation_method;
  const methodMismatch = attendanceMethod && currentMethod && currentMethod !== attendanceMethod;

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">LOP Policy</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-subtract-line"></i>
              </div>
            </div>
            <h6 className="mb-1">No LOP Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
              Define how Loss of Pay is calculated for your employees.
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
          <CardTitle tag="h5" className="mb-0">LOP Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Loss of Pay calculation method and deduction rules
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
          <SettingRow label="LOP Calculation Method" last>
            {isEditing ? (
              <div>
                <Select
                  options={LOP_METHOD_OPTIONS}
                  value={LOP_METHOD_OPTIONS.find(o => o.value === form.lop_calculation_method)}
                  onChange={(e) => {
                    handleChange("lop_calculation_method", e.value);
                    if (e.value !== "fixed_days") handleChange("fixed_days", null);
                  }}
                  styles={{ container: (p) => ({ ...p, width: 220 }) }}
                />
                {methodMismatch && (
                  <small className="text-warning d-block mt-1">
                    ⚠ Differs from Attendance Policy ({LOP_METHOD_OPTIONS.find(o => o.value === attendanceMethod)?.label})
                  </small>
                )}
              </div>
            ) : (
              <div>
                <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                  {LOP_METHOD_OPTIONS.find(o => o.value === data.lop_calculation_method)?.label || "—"}
                </Badge>
                {methodMismatch && (
                  <small className="text-warning d-block mt-1">
                    ⚠ Differs from Attendance Policy ({LOP_METHOD_OPTIONS.find(o => o.value === attendanceMethod)?.label})
                  </small>
                )}
              </div>
            )}
          </SettingRow>
        </div>

        {currentMethod === "fixed_days" && (
          <>
            <SectionLabel>Fixed Days</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="Fixed Days" last>
                {isEditing ? (
                  <Select
                    options={DAY_OPTIONS}
                    value={DAY_OPTIONS.find(o => o.value === form.fixed_days)}
                    onChange={(e) => handleChange("fixed_days", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 120 }) }}
                  />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.fixed_days || "—"}</span>
                )}
              </SettingRow>
            </div>
          </>
        )}

        {currentMethod !== "fixed_days" && (
          <>
            <SectionLabel>Day Inclusions</SectionLabel>
            <div className="border rounded mb-4">
              {[
                ["include_week_offs_in_lop", "Include Week Offs in LOP"],
                ["include_holidays_in_lop", "Include Holidays in LOP"],
              ].map(([key, label], i, arr) => (
                <SettingRow key={key} label={label} last={i === arr.length - 1}>
                  {isEditing ? (
                    <div className="form-check form-switch mb-0">
                      <Input className="form-check-input" type="checkbox" checked={!!form[key]} onChange={() => handleToggle(key)} />
                    </div>
                  ) : (
                    <ViewToggle checked={!!data[key]} />
                  )}
                </SettingRow>
              ))}
            </div>
          </>
        )}

        <SectionLabel>Rules & Limits</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Prioritise Leave Over LOP">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input className="form-check-input" type="checkbox" checked={!!form.prioritise_leave_over_lop} onChange={() => handleToggle("prioritise_leave_over_lop")} />
              </div>
            ) : (
              <ViewToggle checked={!!data.prioritise_leave_over_lop} />
            )}
          </SettingRow>
          <SettingRow label="Max LOP Days Per Month" last>
            {isEditing ? (
              <Input
                type="number" min="0" max="31"
                value={form.max_lop_days_per_month ?? ""}
                placeholder="No limit"
                onChange={(e) => {
                  let val = e.target.value === "" ? null : parseInt(e.target.value);
                  if (val !== null && val > 31) val = 31;
                  if (val !== null && val < 0) val = 0;
                  handleChange("max_lop_days_per_month", val);
                }}
                style={{ width: 120 }}
              />
            ) : (
              <span style={{ fontSize: 13 }}>{data.max_lop_days_per_month ?? <span className="text-muted">No limit</span>}</span>
            )}
          </SettingRow>
        </div>

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

export default LopPolicySettings;