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

const BONUS_BASIS_OPTIONS = [
  { value: "basic", label: "Basic Salary" },
  { value: "ctc", label: "CTC" },
];

const PAYOUT_FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "yearly", label: "Yearly" },
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

const BonusPolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchData = () => {
    setLoading(true);

    Api({
      method: "GET",
      url: "payroll/bonus-policy-settings/",
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
      url: "payroll/bonus-policy-settings/",
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

  const handleCancel = () => {
    if (records.length > 0) {
      setForm({ ...records[0] });
    }
    setIsEditing(false);
  };

  const handleNew = () => {
    setForm({
      effective_date: "",
      enable_statutory_bonus: true,
      statutory_bonus_calculation_basis: "basic",
      statutory_eligibility_ceiling: "21000.00",
      statutory_calculation_ceiling: "7000.00",
      minimum_bonus_percentage: "8.33",
      maximum_bonus_percentage: "20.00",
      minimum_working_days_for_eligibility: 30,
      enable_performance_bonus: false,
      performance_bonus_calculation_basis: null,
      performance_bonus_percentage: null,
      performance_bonus_payout_frequency: null,
      include_bonus_in_ctc: false,
      is_active: true,
    });

    setIsEditing(true);
    setIsEmpty(false);
  };

  const data = form || {};

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">
            Bonus Policy
          </CardTitle>
        </CardHeader>

        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-award-line"></i>
              </div>
            </div>

            <h6>No Bonus Policy Configured</h6>

            <p className="text-muted mb-4">
              Configure statutory and performance bonus rules.
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
            Bonus Policy
          </CardTitle>

          <CardSubtitle
            className="text-muted mt-1"
            style={{ fontSize: 12 }}
          >
            Statutory and Performance Bonus Configuration
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
              <Badge
                key={r.id}
                color={form?.id === r.id ? "primary" : "light"}
                className={
                  form?.id === r.id ? "" : "text-dark border"
                }
                style={{ cursor: "pointer" }}
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
              data.effective_date
            )}
          </SettingRow>

          <SettingRow label="Active Status">
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

          <SettingRow label="Include Bonus In CTC" last>
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.include_bonus_in_ctc}
                  onChange={() =>
                    handleToggle("include_bonus_in_ctc")
                  }
                />
              </div>
            ) : (
              <ViewToggle
                checked={!!data.include_bonus_in_ctc}
              />
            )}
          </SettingRow>
        </div>

        <SectionLabel>Statutory Bonus</SectionLabel>

        <div className="border rounded mb-4">
          <SettingRow label="Enable Statutory Bonus">
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.enable_statutory_bonus}
                  onChange={() =>
                    handleToggle("enable_statutory_bonus")
                  }
                />
              </div>
            ) : (
              <ViewToggle
                checked={!!data.enable_statutory_bonus}
              />
            )}
          </SettingRow>

          {(isEditing
            ? form.enable_statutory_bonus
            : data.enable_statutory_bonus) && (
            <>
              <SettingRow label="Calculation Basis">
                {isEditing ? (
                  <Select
                    options={BONUS_BASIS_OPTIONS}
                    value={BONUS_BASIS_OPTIONS.find(
                      (o) =>
                        o.value ===
                        form.statutory_bonus_calculation_basis
                    )}
                    onChange={(e) =>
                      handleChange(
                        "statutory_bonus_calculation_basis",
                        e.value
                      )
                    }
                  />
                ) : (
                  data.statutory_bonus_calculation_basis
                )}
              </SettingRow>

              <SettingRow label="Eligibility Ceiling">
                {isEditing ? (
                  <Input
                    type="number"
                    value={
                      form.statutory_eligibility_ceiling || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "statutory_eligibility_ceiling",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  `₹ ${data.statutory_eligibility_ceiling}`
                )}
              </SettingRow>

              <SettingRow label="Calculation Ceiling">
                {isEditing ? (
                  <Input
                    type="number"
                    value={
                      form.statutory_calculation_ceiling || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "statutory_calculation_ceiling",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  `₹ ${data.statutory_calculation_ceiling}`
                )}
              </SettingRow>

              <SettingRow label="Minimum Bonus %">
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={form.minimum_bonus_percentage || ""}
                    onChange={(e) =>
                      handleChange(
                        "minimum_bonus_percentage",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  `${data.minimum_bonus_percentage}%`
                )}
              </SettingRow>

              <SettingRow label="Maximum Bonus %">
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={form.maximum_bonus_percentage || ""}
                    onChange={(e) =>
                      handleChange(
                        "maximum_bonus_percentage",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  `${data.maximum_bonus_percentage}%`
                )}
              </SettingRow>

              <SettingRow
                label="Minimum Working Days"
                last
              >
                {isEditing ? (
                  <Input
                    type="number"
                    value={
                      form.minimum_working_days_for_eligibility ||
                      ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "minimum_working_days_for_eligibility",
                        parseInt(e.target.value)
                      )
                    }
                  />
                ) : (
                  `${data.minimum_working_days_for_eligibility} Days`
                )}
              </SettingRow>
            </>
          )}
        </div>

        <SectionLabel>Performance Bonus</SectionLabel>

        <div className="border rounded mb-4">
          <SettingRow label="Enable Performance Bonus">
            {isEditing ? (
              <div className="form-check form-switch">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.enable_performance_bonus}
                  onChange={() =>
                    handleToggle("enable_performance_bonus")
                  }
                />
              </div>
            ) : (
              <ViewToggle
                checked={!!data.enable_performance_bonus}
              />
            )}
          </SettingRow>

          {(isEditing
            ? form.enable_performance_bonus
            : data.enable_performance_bonus) && (
            <>
              <SettingRow label="Calculation Basis">
                <Select
                  options={BONUS_BASIS_OPTIONS}
                  value={BONUS_BASIS_OPTIONS.find(
                    (o) =>
                      o.value ===
                      form.performance_bonus_calculation_basis
                  )}
                  onChange={(e) =>
                    handleChange(
                      "performance_bonus_calculation_basis",
                      e.value
                    )
                  }
                />
              </SettingRow>

              <SettingRow label="Bonus Percentage">
                <Input
                  type="number"
                  step="0.01"
                  value={
                    form.performance_bonus_percentage || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "performance_bonus_percentage",
                      e.target.value
                    )
                  }
                />
              </SettingRow>

              <SettingRow label="Payout Frequency" last>
                <Select
                  options={PAYOUT_FREQUENCY_OPTIONS}
                  value={PAYOUT_FREQUENCY_OPTIONS.find(
                    (o) =>
                      o.value ===
                      form.performance_bonus_payout_frequency
                  )}
                  onChange={(e) =>
                    handleChange(
                      "performance_bonus_payout_frequency",
                      e.value
                    )
                  }
                />
              </SettingRow>
            </>
          )}
        </div>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Button
              color="light"
              className="border"
              onClick={handleCancel}
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

export default BonusPolicySettings;