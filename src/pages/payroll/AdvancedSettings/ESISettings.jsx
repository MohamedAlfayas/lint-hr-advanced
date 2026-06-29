import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { required, percent, min, runChecks } from "./validators";

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

const toDecimal2 = (val) =>
  val !== "" && val !== null && val !== undefined
    ? parseFloat(Number(val).toFixed(2)).toString()
    : val;

const ESISettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [esiSettings, setEsiSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchESISettings = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/esi-settings/" })
      .then((res) => {
        const data = res?.data?.data || {};
        setEsiSettings(data);
        setForm(data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch ESI settings");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchESISettings(); }, []);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleToggle = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () =>
    runChecks([
      required("Effective date", form.effective_date),
      min("Max monthly gross", form.statutory_max_monthly_gross, 1),
      percent("Employee contribution %", form.employee_contribution_percentage),
      percent("Employer contribution %", form.employer_contribution_percentage),
    ], toast);

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    Api({
      method: "POST",
      url: "payroll/esi-settings/",
      data: {
        is_active: form.is_active,
        effective_date: form.effective_date,
        statutory_max_monthly_gross: toDecimal2(form.statutory_max_monthly_gross),
        employee_contribution_percentage: toDecimal2(form.employee_contribution_percentage),
        employer_contribution_percentage: toDecimal2(form.employer_contribution_percentage),
        include_employer_contribution_in_ctc: form.include_employer_contribution_in_ctc,
        allow_individual_override: form.allow_individual_override,
        enable_wage_based_calculation: form.enable_wage_based_calculation,
      },
    })
      .then((res) => {
        const updated = res?.data?.data || {};
        setEsiSettings(updated);
        setForm(updated);
        setIsEditing(false);
        toast.success("ESI settings updated successfully!");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to update ESI settings");
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setForm(esiSettings);
    setIsEditing(false);
  };

  if (!form) return null;
  const data = isEditing ? form : esiSettings;

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <div>
              <CardTitle tag="h5" className="mb-0">ESI Settings</CardTitle>
              <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
                Employee State Insurance contribution and statutory configuration
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
            {!isEditing && (
              <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
                <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
                <span style={{ fontSize: 13 }}>
                  <strong>ESI is {data.is_active ? "Active" : "Inactive"}</strong>
                  {data.effective_date && (
                    <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>
                  )}
                </span>
                <Badge color="light" className="text-dark border ms-auto" style={{ fontSize: 11 }}>
                  Wage Based: {data.enable_wage_based_calculation ? "On" : "Off"}
                </Badge>
              </div>
            )}

            {!isEditing && (
              <Row className="g-3 mb-4">
                {[
                  {
                    label: "Max Monthly Gross",
                    value: data.statutory_max_monthly_gross
                      ? `₹${Number(data.statutory_max_monthly_gross).toLocaleString()}`
                      : "—",
                  },
                  {
                    label: "Employee Contribution",
                    value: data.employee_contribution_percentage
                      ? `${data.employee_contribution_percentage}%`
                      : "—",
                  },
                  {
                    label: "Employer Contribution",
                    value: data.employer_contribution_percentage
                      ? `${data.employer_contribution_percentage}%`
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <Col sm={6} md={4} key={label}>
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

            <SectionLabel>General</SectionLabel>
            <div className="border rounded mb-4">
              <SettingRow label="ESI Status">
                {isEditing ? (
                  <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                    <Input className="form-check-input" type="checkbox"
                      checked={!!form.is_active}
                      onChange={() => handleToggle("is_active")} />
                    <Label className="form-check-label mb-0" style={{ fontSize: 13 }}>
                      {form.is_active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                ) : (
                  <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
                )}
              </SettingRow>

              <SettingRow label="Effective Date">
                {isEditing ? (
                  <Input type="date" value={form.effective_date || ""}
                    onChange={(e) => handleChange("effective_date", e.target.value)}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>
                )}
              </SettingRow>

              <SettingRow label="Max Monthly Gross for ESI">
                {isEditing ? (
                  <Input type="number" step="0.01"
                    value={form.statutory_max_monthly_gross || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+(\.\d{0,2})?$/.test(val))
                        handleChange("statutory_max_monthly_gross", val);
                    }}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>
                    {data.statutory_max_monthly_gross
                      ? `₹${Number(data.statutory_max_monthly_gross).toLocaleString()}`
                      : "—"}
                  </span>
                )}
              </SettingRow>

              <SettingRow label="Employee Contribution (%)">
                {isEditing ? (
                  <Input type="number" step="0.01"
                    value={form.employee_contribution_percentage || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+(\.\d{0,2})?$/.test(val))
                        handleChange("employee_contribution_percentage", val);
                    }}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>
                    <span className="fw-semibold">{data.employee_contribution_percentage || "—"}%</span>
                    <span className="text-muted ms-1">of Gross Salary</span>
                  </span>
                )}
              </SettingRow>

              <SettingRow label="Employer Contribution (%)" last>
                {isEditing ? (
                  <Input type="number" step="0.01"
                    value={form.employer_contribution_percentage || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+(\.\d{0,2})?$/.test(val))
                        handleChange("employer_contribution_percentage", val);
                    }}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>
                    <span className="fw-semibold">{data.employer_contribution_percentage || "—"}%</span>
                    <span className="text-muted ms-1">of Gross Salary</span>
                  </span>
                )}
              </SettingRow>
            </div>

            <Row className="g-4 mb-4">
              <Col md={6}>
                <SectionLabel>CTC & Override</SectionLabel>
                <div className="border rounded">
                  {[
                    ["include_employer_contribution_in_ctc", "Employer ESI in CTC"],
                    ["allow_individual_override", "Allow Individual Override"],
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

              <Col md={6}>
                <SectionLabel>Calculation Settings</SectionLabel>
                <div className="border rounded">
                  {[
                    ["enable_wage_based_calculation", "Enable Wage-Based ESI Calculation"],
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

            <div className="alert alert-info d-flex gap-2 py-2 px-3 mb-4">
              <i className="ri-information-line fs-16 flex-shrink-0 mt-1"></i>
              <div style={{ fontSize: 12 }}>
                <strong className="d-block mb-1">ESIC Contribution Rates Reference</strong>
                <div className="mb-1">
                  <span className="text-muted me-1">From July 1, 2019 —</span>
                  <span className="me-3">Employer: <strong>3.25%</strong></span>
                  <span>Employee: <strong>0.75%</strong></span>
                </div>
                <div>
                  <span className="text-muted me-1">Until June 30, 2019 —</span>
                  <span className="me-3">Employer: <strong>4.75%</strong></span>
                  <span>Employee: <strong>1.25%</strong></span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <Button color="light" className="border" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button color="success" onClick={handleSave} disabled={loading}>
                  <i className="ri-check-double-line align-middle me-1"></i>
                  {loading ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ESISettings;