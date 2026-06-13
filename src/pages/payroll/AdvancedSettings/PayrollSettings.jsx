import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setPayrollSettings,
  updatePayrollSettings,
  setPayrollLoading,
} from "../../../redux/reducers/ChildReducer/PayrollSettingsReducer";

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
    <Col sm={7} md={8}>
      {children}
    </Col>
  </Row>
);

// Read-only toggle display (no disabled input)
const ViewToggle = ({ checked, label }) => (
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: 36,
        height: 20,
        borderRadius: 12,
        background: checked ? "#0ab39c" : "#ced4da",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 18 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </span>
    {label && <span style={{ fontSize: 13 }}>{label}</span>}
  </div>
);

const PayrollSettings = () => {
  const dispatch = useDispatch();
  const { payroll_settings, payroll_loading } = useSelector(
    (state) => state.PayrollSettingsReducer || {}
  );
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchPayroll = () => {
    dispatch(setPayrollLoading(true));
    Api({ method: "GET", url: "payroll/payroll-settings/" })
      .then((res) => {
        const d = res?.data?.data;
        const hasData = d && Object.keys(d).length > 0;
        setIsEmpty(!hasData);
        dispatch(setPayrollSettings(d || {}));
        setForm(d || {});
      })
      .finally(() => dispatch(setPayrollLoading(false)));
  };

  useEffect(() => { fetchPayroll(); }, []);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleToggle = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSave = () => {
    dispatch(setPayrollLoading(true));
    Api({ method: "POST", url: "payroll/payroll-settings/", data: form })
      .then((res) => {
        dispatch(updatePayrollSettings(res?.data?.data || {}));
        setIsEmpty(false);
        setIsEditing(false);
        toast.success("Payroll settings updated successfully!");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to update payroll settings");
      })
      .finally(() => dispatch(setPayrollLoading(false)));
  };

  const handleCancel = () => {
    setForm(payroll_settings);
    setIsEditing(false);
  };

  const data = isEditing ? form : (payroll_settings || {});

  const cycleEnd = (from) =>
    !from ? "—" : from === 1 ? 31 : from - 1;

  // ── Empty State ────────────────────────────────────────────────
  if (!form || isEmpty) {
    return (
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="bg-light d-flex justify-content-between align-items-center">
              <div>
                <CardTitle tag="h5" className="mb-0">Pay Settings</CardTitle>
                <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
                  Payroll configuration and cycle preferences
                </CardSubtitle>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center py-5">
                <div className="avatar-md mx-auto mb-4">
                  <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                    <i className="ri-settings-3-line"></i>
                  </div>
                </div>
                <h6 className="mb-1">No Pay Settings Configured</h6>
                <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                  Set up your pay cycle and salary preferences to get started.
                </p>
                <Button color="primary" onClick={() => { setIsEmpty(false); setIsEditing(true); }}>
                  <i className="ri-settings-3-line align-bottom me-1"></i>
                  Configure Pay Settings
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  // ── Main View ──────────────────────────────────────────────────
  return (
    <Row>
      <Col lg={12}>
        <Card>

          {/* Header */}
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <div>
              <CardTitle tag="h5" className="mb-0">Pay Settings</CardTitle>
              <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
                Manage your payroll configuration and cycle preferences
              </CardSubtitle>
            </div>
            {!isEditing && (
              <Button size="sm" color="primary" outline onClick={() => setIsEditing(true)}
                className="d-flex align-items-center gap-1">
                <i className="ri-edit-line fs-14"></i> Edit Settings
              </Button>
            )}
          </CardHeader>

          <CardBody className="p-4">

            {/* Status Banner */}
            {!isEditing && (
              <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
                <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
                <span style={{ fontSize: 13 }}>
                  <strong>Payroll is {data.is_active ? "Active" : "Inactive"}</strong>
                  {data.effective_date && (
                    <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>
                  )}
                </span>
                <Badge color="light" className="text-dark border ms-auto" style={{ fontSize: 11 }}>Monthly</Badge>
              </div>
            )}

            {/* ── General ─────────────────────────────────────────── */}
            <SectionLabel>General</SectionLabel>
            <div className="border rounded mb-4">

              {/* Payroll Status */}
              <SettingRow label="Payroll Status">
                {isEditing ? (
                  <div className="form-check form-switch mb-0">
                    <Input className="form-check-input" type="checkbox"
                      checked={!!form.is_active}
                      onChange={() => handleToggle("is_active")} />
                    <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>
                      {form.is_active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
                )}
              </SettingRow>

              {/* Effective Date */}
              <SettingRow label="Effective Date">
                {isEditing ? (
                  <Input type="date" value={form.effective_date || ""}
                    onChange={(e) => handleChange("effective_date", e.target.value)}
                    style={{ width: 180 }} />
                ) : (
                  <span className="text-body" style={{ fontSize: 13 }}>
                    {data.effective_date || "—"}
                  </span>
                )}
              </SettingRow>

              {/* Salary Structure Based On */}
              <SettingRow label="Salary Structure Based On" last>
                {isEditing ? (
                  <div className="d-flex gap-3">
                    {["gross", "ctc"].map((opt) => (
                      <div className="form-check" key={opt}>
                        <Input className="form-check-input" type="radio"
                          name="salary_structure_based_on"
                          checked={form.salary_structure_based_on === opt}
                          onChange={() => handleChange("salary_structure_based_on", opt)} />
                        <Label className="form-check-label text-capitalize" style={{ fontSize: 13 }}>
                          {opt.toUpperCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex gap-3 align-items-center">
                    {["gross", "ctc"].map((opt) => (
                      <div key={opt} className="d-flex align-items-center gap-1">
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: `2px solid ${data.salary_structure_based_on === opt ? "#405189" : "#ced4da"}`,
                            background: data.salary_structure_based_on === opt ? "#405189" : "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {data.salary_structure_based_on === opt && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />
                          )}
                        </span>
                        <span style={{ fontSize: 13 }}>{opt.toUpperCase()}</span>
                      </div>
                    ))}
                    <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
                      {(data.salary_structure_based_on || "—").toUpperCase()}
                    </Badge>
                  </div>
                )}
              </SettingRow>
            </div>

            {/* ── Pay Cycle & Schedule ─────────────────────────────── */}
            <SectionLabel>Pay Cycle & Schedule</SectionLabel>

            {/* Cycle summary cards (view only) */}
            {!isEditing && (
              <Row className="g-3 mb-4">
                {[
                  { label: "Pay Cycle", value: `${data.pay_cycle_from || "—"} → ${cycleEnd(data.pay_cycle_from)}` },
                  { label: "Leave & Attendance", value: `${data.payroll_leave_and_attendance_cycle_from || "—"} → ${cycleEnd(data.payroll_leave_and_attendance_cycle_from)}` },
                  { label: "Payout Date", value: data.payout_date ? `${data.payout_date}th` : "—" },
                  { label: "DOJ Cutoff", value: data.payroll_doj_cutoff_date ? `${data.payroll_doj_cutoff_date}th` : "—" },
                ].map(({ label, value }) => (
                  <Col sm={6} md={3} key={label}>
                    <div className="border rounded p-3 bg-light h-100">
                      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {label}
                      </p>
                      <p className="mb-0 fw-semibold" style={{ fontSize: 15 }}>{value}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {/* Cycle edit rows */}
            {isEditing && (
              <div className="border rounded mb-4">
                <SettingRow label="Pay Frequency">
                  <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>Monthly</Badge>
                </SettingRow>
                <SettingRow label="Pay Cycle">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: 13 }}>From</span>
                    <Select options={DAY_OPTIONS}
                      value={DAY_OPTIONS.find(o => o.value === form.pay_cycle_from)}
                      onChange={(e) => handleChange("pay_cycle_from", e.value)}
                      styles={{ container: (p) => ({ ...p, width: 90 }) }} />
                    <span className="text-muted" style={{ fontSize: 13 }}>to</span>
                    <span className="fw-medium">{cycleEnd(form.pay_cycle_from)}</span>
                  </div>
                </SettingRow>
                <SettingRow label="Leave & Attendance Cycle">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: 13 }}>From</span>
                    <Select options={DAY_OPTIONS}
                      value={DAY_OPTIONS.find(o => o.value === form.payroll_leave_and_attendance_cycle_from)}
                      onChange={(e) => handleChange("payroll_leave_and_attendance_cycle_from", e.value)}
                      styles={{ container: (p) => ({ ...p, width: 90 }) }} />
                    <span className="text-muted" style={{ fontSize: 13 }}>to</span>
                    <span className="fw-medium">{cycleEnd(form.payroll_leave_and_attendance_cycle_from)}</span>
                  </div>
                </SettingRow>
                <SettingRow label="Payout Date">
                  <Select options={DAY_OPTIONS}
                    value={DAY_OPTIONS.find(o => o.value === form.payout_date)}
                    onChange={(e) => handleChange("payout_date", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 120 }) }} />
                </SettingRow>
                <SettingRow label="DOJ Cutoff Date" last>
                  <Select options={DAY_OPTIONS}
                    value={DAY_OPTIONS.find(o => o.value === form.payroll_doj_cutoff_date)}
                    onChange={(e) => handleChange("payroll_doj_cutoff_date", e.value)}
                    styles={{ container: (p) => ({ ...p, width: 120 }) }} />
                </SettingRow>
              </div>
            )}

            {/* ── Calculation Prefs + Day Inclusions ───────────────── */}
            <Row className="g-4 mb-4">
              <Col md={6}>
                <SectionLabel>Calculation Preferences</SectionLabel>
                <div className="border rounded">
                  {[
                    ["allow_decimal_in_payslip", "Allow Decimal in Payslip"],
                    ["wage_esi_for_overtime", "Wage ESI for Overtime"],
                    ["enable_da_payroll_calculation", "Enable DA Calculation"],
                  ].map(([key, label], i, arr) => (
                    <Row key={key}
                      className={`align-items-center px-3 py-2 g-0${i < arr.length - 1 ? " border-bottom" : ""}`}>
                      <Col xs={8}>
                        <Label className="mb-0" style={{ fontSize: 13 }}>{label}</Label>
                      </Col>
                      <Col xs={4} className="text-end">
                        {isEditing ? (
                          <div className="form-check form-switch mb-0 d-flex justify-content-end">
                            <Input className="form-check-input" type="checkbox"
                              checked={!!form[key]}
                              onChange={() => handleToggle(key)} />
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end">
                            <ViewToggle checked={!!data[key]} />
                          </div>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>
            </Row>

            {/* ── Save / Cancel ─────────────────────────────────────── */}
            {isEditing && (
              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <Button color="light" className="border" onClick={handleCancel} disabled={payroll_loading}>
                  Cancel
                </Button>
                <Button color="success" onClick={handleSave} disabled={payroll_loading}>
                  <i className="ri-check-double-line align-middle me-1"></i>
                  {payroll_loading ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}

          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default PayrollSettings;