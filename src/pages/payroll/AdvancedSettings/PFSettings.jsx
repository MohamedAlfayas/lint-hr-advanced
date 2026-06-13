import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const PF_CONTRIBUTION_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed" },
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

const ViewRadio = ({ options, value }) => (
  <div className="d-flex gap-3 align-items-center">
    {options.map((opt) => (
      <div key={opt.value} className="d-flex align-items-center gap-1">
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `2px solid ${value === opt.value ? "#405189" : "#ced4da"}`,
            background: value === opt.value ? "#405189" : "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {value === opt.value && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />
          )}
        </span>
        <span style={{ fontSize: 13 }}>{opt.label}</span>
      </div>
    ))}
    <Badge color="primary" pill style={{ fontSize: 12, padding: "4px 12px" }}>
      {options.find(o => o.value === value)?.label || "—"}
    </Badge>
  </div>
);

const PFSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [pfSettings, setPfSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salaryComponents] = useState([
    { value: 1, label: "Basic" },
    { value: 2, label: "DA" },
  ]);

  const fetchPFSettings = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/pf-settings/" })
      .then((res) => {
        const data = res?.data?.data || {};
        setPfSettings(data);
        setForm(data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch PF settings");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPFSettings(); }, []);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleToggle = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSave = () => {
    setLoading(true);
    Api({ method: "POST", url: "payroll/pf-settings/", data: form })
      .then((res) => {
        const updated = res?.data?.data || {};
        setPfSettings(updated);
        setForm(updated);
        setIsEditing(false);
        toast.success("PF settings updated successfully!");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to update PF settings");
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setForm(pfSettings);
    setIsEditing(false);
  };

  if (!form) return null;
  const data = isEditing ? form : pfSettings;

  const selectedComponents = salaryComponents.filter((c) =>
    (data.pf_contribution_calculation_based_on || []).includes(c.value)
  );

  const contributionLabel =
    data.pf_contribution_calculation_type === "percentage"
      ? `${data.pf_contribution_calculation_value || "—"}%`
      : data.pf_contribution_calculation_value || "—";

  return (
    <Row>
      <Col lg={12}>
        <Card>

          {/* Header */}
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <div>
              <CardTitle tag="h5" className="mb-0">PF Settings</CardTitle>
              <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
                Provident Fund contribution and statutory configuration
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
                  <strong>PF is {data.is_active ? "Active" : "Inactive"}</strong>
                  {data.effective_date && (
                    <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>
                  )}
                </span>
                <Badge color="light" className="text-dark border ms-auto" style={{ fontSize: 11 }}>
                  {PF_CONTRIBUTION_TYPE_OPTIONS.find(o => o.value === data.pf_contribution_calculation_type)?.label || "—"}
                </Badge>
              </div>
            )}

            {/* Summary Cards (view mode) */}
            {!isEditing && (
              <Row className="g-3 mb-4">
                {[
                  {
                    label: "Min Eligibility Amount",
                    value: data.minimum_monthly_amount_for_pf_calculation
                      ? `₹${Number(data.minimum_monthly_amount_for_pf_calculation).toLocaleString()}`
                      : "—"
                  },
                  {
                    label: "PF Wage Ceiling",
                    value: data.pf_wage_ceiling
                      ? `₹${Number(data.pf_wage_ceiling).toLocaleString()}`
                      : "—"
                  },
                  { label: "Contribution Value", value: contributionLabel },
                  {
                    label: "Based On",
                    value: selectedComponents.length ? selectedComponents.map(c => c.label).join(", ") : "—"
                  },
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

            {/* General Section */}
            <SectionLabel>General</SectionLabel>
            <div className="border rounded mb-4">

              {/* PF Status */}
              <SettingRow label="PF Status">
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

              {/* Effective Date */}
              <SettingRow label="Effective Date">
                {isEditing ? (
                  <Input type="date" value={form.effective_date || ""}
                    onChange={(e) => handleChange("effective_date", e.target.value)}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>
                )}
              </SettingRow>

              {/* Min Eligibility Amount */}
              <SettingRow label="Min Monthly Amount for PF Eligibility">
                {isEditing ? (
                  <Input type="number"
                    value={form.minimum_monthly_amount_for_pf_calculation || ""}
                    onChange={(e) => handleChange("minimum_monthly_amount_for_pf_calculation", Number(e.target.value))}
                    style={{ width: 180 }} />
                ) : (
                  <span style={{ fontSize: 13 }}>
                    {data.minimum_monthly_amount_for_pf_calculation
                      ? `₹${Number(data.minimum_monthly_amount_for_pf_calculation).toLocaleString()}`
                      : "—"}
                  </span>
                )}
              </SettingRow>

              {/* PF Wage Ceiling */}
              <SettingRow label="PF Wage Ceiling (Statutory)">
                {isEditing ? (
                  <Input
                    type="number"
                    value={form.pf_wage_ceiling || ""}
                    onChange={(e) => handleChange("pf_wage_ceiling", Number(e.target.value))}
                    style={{ width: 180 }}
                  />
                ) : (
                  <span style={{ fontSize: 13 }}>
                    {data.pf_wage_ceiling
                      ? `₹${Number(data.pf_wage_ceiling).toLocaleString()}`
                      : "—"}
                  </span>
                )}
              </SettingRow>

              {/* Contribution Calculation Type */}
              <SettingRow label="Contribution Calculation Type">
                {isEditing ? (
                  <div className="d-flex gap-3">
                    {PF_CONTRIBUTION_TYPE_OPTIONS.map((opt) => (
                      <div className="form-check" key={opt.value}>
                        <Input className="form-check-input" type="radio"
                          name="pf_contribution_calculation_type"
                          checked={form.pf_contribution_calculation_type === opt.value}
                          onChange={() => handleChange("pf_contribution_calculation_type", opt.value)} />
                        <Label className="form-check-label" style={{ fontSize: 13 }}>{opt.label}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ViewRadio options={PF_CONTRIBUTION_TYPE_OPTIONS} value={data.pf_contribution_calculation_type} />
                )}
              </SettingRow>

              {/* Contribution Based On */}
              <SettingRow label="Contribution Based On">
                {isEditing ? (
                  <Select isMulti options={salaryComponents}
                    value={salaryComponents.filter((c) =>
                      (form.pf_contribution_calculation_based_on || []).includes(c.value)
                    )}
                    onChange={(selected) =>
                      handleChange("pf_contribution_calculation_based_on", selected.map(s => s.value))
                    }
                    styles={{ container: (p) => ({ ...p, minWidth: 250 }) }} />
                ) : (
                  <div className="d-flex flex-wrap gap-1">
                    {selectedComponents.length
                      ? selectedComponents.map(c => (
                          <Badge key={c.value} color="light" className="text-dark border" style={{ fontSize: 12 }}>
                            {c.label}
                          </Badge>
                        ))
                      : <span style={{ fontSize: 13 }}>—</span>}
                  </div>
                )}
              </SettingRow>

              {/* Contribution Value */}
              <SettingRow label={`Contribution Value ${data.pf_contribution_calculation_type === "percentage" ? "(%)" : "(Fixed Amount)"}`} last>
                {isEditing ? (
                  <Input type="number" step="0.01"
                    value={form.pf_contribution_calculation_value || ""}
                    onChange={(e) => handleChange("pf_contribution_calculation_value", e.target.value)}
                    style={{ width: 180 }} />
                ) : (
                  <span className="fw-semibold" style={{ fontSize: 13 }}>
                    {data.pf_contribution_calculation_value
                      ? `${data.pf_contribution_calculation_value}${data.pf_contribution_calculation_type === "percentage" ? "%" : ""}`
                      : "—"}
                  </span>
                )}
              </SettingRow>
            </div>

            {/* Toggles — two-column layout */}
            <Row className="g-4 mb-4">
              <Col md={6}>
                <SectionLabel>Statutory Settings</SectionLabel>
                <div className="border rounded">
                  {[
                    ["enable_statutory_minimum_ceiling", "Enable Statutory Min. Ceiling"],
                    ["lop_dependant", "LOP Dependant"],
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
                <SectionLabel>CTC Inclusions</SectionLabel>
                <div className="border rounded">
                  {[
                    ["include_employer_pf_in_ctc", "Employer PF in CTC"],
                    ["include_edli_pf_admin_charges_in_ctc", "EDLI & PF Admin Charges in CTC"],
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

            {/* Info Note */}
            <div className="alert alert-info d-flex gap-2 py-2 px-3 mb-4">
              <i className="ri-information-line fs-16 flex-shrink-0 mt-1"></i>
              <div style={{ fontSize: 12 }}>
                <strong className="d-block mb-1">PF Contribution Rates Reference</strong>
                <span className="me-3">Employer: <strong>12%</strong></span>
                <span className="me-3">Employee: <strong>12%</strong></span>
                <span className="me-3">EPS: <strong>8.33%</strong> (max ₹1,250/mo)</span>
                <span>EPF: <strong>3.67%</strong></span>
              </div>
            </div>

            {/* Save / Cancel */}
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

export default PFSettings;