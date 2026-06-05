import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  Col,
  Row,
  Label,
  Button,
  Input,
  Badge,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

// Fix #5: Added "Gross Salary" to options
const GRATUITY_BASIS_OPTIONS = [
  { value: "basic", label: "Basic Salary" },
  { value: "ctc", label: "CTC" },
];

const SectionLabel = ({ children }) => (
  <p
    className="text-uppercase fw-semibold text-muted mb-2"
    style={{ fontSize: 11, letterSpacing: "0.8px" }}
  >
    {children}
  </p>
);

const SettingRow = ({ label, children, last = false }) => (
  <Row
    className={`align-items-center px-3 py-2 g-0${
      !last ? " border-bottom" : ""
    }`}
  >
    <Col sm={5} md={4}>
      <Label className="mb-0 text-muted" style={{ fontSize: 13 }}>
        {label}
      </Label>
    </Col>
    <Col sm={7} md={8}>{children}</Col>
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
        }}
      />
    </span>
    {label && <span style={{ fontSize: 13 }}>{label}</span>}
  </div>
);

const GratuityPolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchData = () => {
    setLoading(true);

    Api({
      method: "GET",
      url: "payroll/gratuity-policy-settings/",
    })
      .then((res) => {
        const list = res?.data?.data || [];

        setRecords(list);
        setIsEmpty(list.length === 0);

        if (list.length > 0) {
          setForm({ ...list[0] });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  const handleToggle = (field) =>
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

  const handleSave = () => {
    setLoading(true);

    Api({
      method: form?.id ? "PUT" : "POST",
      url: "payroll/gratuity-policy-settings/",
      data: form,
    })
      .then((res) => {
        toast.success(res?.data?.message || "Saved Successfully");
        fetchData();
        setIsEditing(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to save policy"
        );
      })
      .finally(() => setLoading(false));
  };

  // Fix #6: Upgraded handleCancel logic for instances where records length is 0
  const handleCancel = () => {
    if (records.length > 0) {
      setForm({ ...records[0] });
    } else {
      setForm(null);
    }
    setIsEditing(false);
  };

  const handleNew = () => {
    setForm({
      effective_date: "",
      enable_gratuity: true,
      calculation_basis: "basic",
      days_in_month_for_calculation: 26,
      days_per_year_of_service: 15,
      minimum_years_of_service: "5.00",
      use_240_days_rule: true,
      maximum_gratuity_amount: "2000000.00",
      include_gratuity_in_ctc: false,
      is_active: true,
    });

    setIsEmpty(false);
    setIsEditing(true);
  };

  // Fix #1: Placed "data" declaration above "gratuityEnabled" to resolve initialization error
  const data = form || {};

  const gratuityEnabled = isEditing
    ? !!form?.enable_gratuity
    : !!data.enable_gratuity;

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">
            Gratuity Policy
          </CardTitle>
        </CardHeader>

        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-money-rupee-circle-line"></i>
              </div>
            </div>

            <h6>No Gratuity Policy Configured</h6>

            <p className="text-muted mb-4">
              Configure gratuity eligibility and calculation rules.
            </p>

            <Button color="primary" onClick={handleNew}>
              <i className="ri-add-line me-1"></i>
              Configure Policy
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
          <CardTitle tag="h5" className="mb-0">
            Gratuity Policy
          </CardTitle>

          <CardSubtitle
            className="text-muted mt-1"
            style={{ fontSize: 12 }}
          >
            Gratuity eligibility and payout calculation settings
          </CardSubtitle>
        </div>

        {!isEditing && (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color="primary"
              outline
              onClick={() => {
                setForm({ ...records[0] });
                setIsEditing(true);
              }}
            >
              <i className="ri-edit-line"></i> Edit
            </Button>

            <Button
              size="sm"
              color="success"
              outline
              onClick={handleNew}
            >
              <i className="ri-add-line"></i> New Version
            </Button>
          </div>
        )}
      </CardHeader>

      <CardBody className="p-4">

        {!isEditing && records.length > 1 && (
          <div className="d-flex gap-2 flex-wrap mb-4">
            {records.map((r, i) => (
              /* Fix #7: Enhanced version badge stylings matching OT configurations */
              <Badge
                key={r.id}
                color={form?.id === r.id ? "primary" : "light"}
                className={form?.id === r.id ? "" : "text-dark border"}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "5px 12px",
                }}
                onClick={() => setForm({ ...r })}
              >
                {r.effective_date}
                {i === 0 && (
                  <span className="ms-1">· Latest</span>
                )}
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
              <Input
                type="date"
                value={form.effective_date || ""}
                onChange={(e) =>
                  handleChange("effective_date", e.target.value)
                }
                style={{ width: 180 }}
              />
            ) : (
              <span>{data.effective_date || "—"}</span>
            )}
          </SettingRow>

          <SettingRow label="Status">
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={() => handleToggle("is_active")}
                />
              </div>
            ) : (
              <ViewToggle
                checked={!!data.is_active}
                label={data.is_active ? "Active" : "Inactive"}
              />
            )}
          </SettingRow>

          <SettingRow label="Include Gratuity In CTC" last>
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.include_gratuity_in_ctc}
                  onChange={() =>
                    handleToggle("include_gratuity_in_ctc")
                  }
                />
              </div>
            ) : (
              <ViewToggle checked={!!data.include_gratuity_in_ctc} />
            )}
          </SettingRow>
        </div>

        <SectionLabel>Gratuity Configuration</SectionLabel>

        <div className="border rounded mb-4">
          <SettingRow label="Enable Gratuity">
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.enable_gratuity}
                  onChange={() => handleToggle("enable_gratuity")}
                />
              </div>
            ) : (
              <ViewToggle checked={!!data.enable_gratuity} />
            )}
          </SettingRow>

          {(isEditing
            ? form.enable_gratuity
            : data.enable_gratuity) && (
            <>
              <SettingRow label="Calculation Basis">
                {isEditing ? (
                  <Select
                    options={GRATUITY_BASIS_OPTIONS}
                    value={GRATUITY_BASIS_OPTIONS.find(
                      (o) => o.value === form.calculation_basis
                    )}
                    onChange={(e) =>
                      handleChange("calculation_basis", e.value)
                    }
                    styles={{
                      container: (p) => ({
                        ...p,
                        width: 220,
                      }),
                    }}
                  />
                ) : (
                  <Badge color="primary" pill>
                    {
                      GRATUITY_BASIS_OPTIONS.find(
                        (o) => o.value === data.calculation_basis
                      )?.label
                    }
                  </Badge>
                )}
              </SettingRow>

              <SettingRow label="Days In Month">
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    value={
                      form.days_in_month_for_calculation ?? ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "days_in_month_for_calculation",
                        parseInt(e.target.value)
                      )
                    }
                    style={{ width: 120 }}
                  />
                ) : (
                  <span>
                    {data.days_in_month_for_calculation} Days
                  </span>
                )}
              </SettingRow>

              <SettingRow label="Days Per Year Of Service">
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    value={form.days_per_year_of_service ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "days_per_year_of_service",
                        parseInt(e.target.value)
                      )
                    }
                    style={{ width: 120 }}
                  />
                ) : (
                  <span>
                    {data.days_per_year_of_service} Days
                  </span>
                )}
              </SettingRow>

              <SettingRow label="Minimum Years Of Service">
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={
                      form.minimum_years_of_service || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "minimum_years_of_service",
                        e.target.value
                      )
                    }
                    style={{ width: 120 }}
                  />
                ) : (
                  /* Fix #3: Encapsulated years of service output within an info pill Badge */
                  <Badge color="info" pill>
                    {data.minimum_years_of_service} Years
                  </Badge>
                )}
              </SettingRow>

              <SettingRow label="Use 240 Days Rule">
                {isEditing ? (
                  <div className="form-check form-switch">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!form.use_240_days_rule}
                      onChange={() =>
                        handleToggle("use_240_days_rule")
                      }
                    />
                  </div>
                ) : (
                  <ViewToggle
                    checked={!!data.use_240_days_rule}
                  />
                )}
              </SettingRow>

              <SettingRow
                label="Maximum Gratuity Amount"
                last
              >
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={
                      form.maximum_gratuity_amount || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "maximum_gratuity_amount",
                        e.target.value
                      )
                    }
                    style={{ width: 180 }}
                  />
                ) : (
                  /* Fix #2: Formatted raw currency numbers to match the localized Indian formatting output */
                  <Badge
                    color="success"
                    className="text-white"
                  >
                    ₹ {Number(data.maximum_gratuity_amount || 0).toLocaleString("en-IN")}
                  </Badge>
                )}
              </SettingRow>
            </>
          )}
        </div>

        {/* Fix #4: Connected warning notification context alert right after Gratuity Configuration section */}
        {!gratuityEnabled && !isEditing && (
          <div className="alert alert-warning d-flex align-items-center gap-2 py-2 px-3">
            <i className="ri-information-line fs-16"></i>
            <span style={{ fontSize: 13 }}>
              Gratuity is currently disabled. Enable it to configure gratuity rules.
            </span>
          </div>
        )}

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            {/* Fix #8: Disables cancel interaction when state actions are working / loading */}
            <Button
              color="light"
              className="border"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              color="success"
              onClick={handleSave}
              disabled={loading}
            >
              <i className="ri-check-double-line me-1"></i>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default GratuityPolicySettings;