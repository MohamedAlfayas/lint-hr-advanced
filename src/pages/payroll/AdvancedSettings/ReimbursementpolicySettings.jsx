import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

// ─── Helpers (identical pattern to other policy settings) ─────────────────────

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

// ─── Empty state default form ─────────────────────────────────────────────────

const emptyForm = () => ({
  effective_date: "",
  claim_submission_window_days: 30,
  require_receipt_for_all: true,
  auto_approve_below_amount: "0.00",
  payout_with_salary: true,
  include_reimbursement_in_ctc: false,
  is_taxable_by_default: false,
  is_active: true,
});

// ─── Main Component ───────────────────────────────────────────────────────────

const ReimbursementPolicySettings = () => {
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form,      setForm]      = useState(null);
  const [isEmpty,   setIsEmpty]   = useState(false);

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/reimbrusement-policy-settings/" })
      .then((res) => {
        const list = res?.data?.data || [];
        setRecords(list);
        setIsEmpty(list.length === 0);
        if (list.length > 0) setForm({ ...list[0] });
      })
      .catch(() => toast.error("Failed to load reimbursement policy"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleToggle = (field)        => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSave = () => {
    if (!form.effective_date) {
      toast.error("Effective date is required");
      return;
    }
    setLoading(true);
    const isUpdate = !!form?.id;
    Api({
      method: isUpdate ? "PUT" : "POST",
      url:    "payroll/reimbrusement-policy-settings/",
      data:   form,
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
    setForm(emptyForm());
    setIsEmpty(false);
    setIsEditing(true);
  };

  const data = form || {};

  // ── Empty state ───────────────────────────────────────────────────────────
  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">Reimbursement Policy</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-refund-2-line"></i>
              </div>
            </div>
            <h6 className="mb-1">No Reimbursement Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
              Define claim windows, receipt rules, and payout settings for employee reimbursements.
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
      {/* ── Header ── */}
      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <CardTitle tag="h5" className="mb-0">Reimbursement Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Claim submission rules, receipt requirements, and payout configuration
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

        {/* ── Version history pills ── */}
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

        {/* ── Status banner ── */}
        {!isEditing && (
          <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
            <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
            <span style={{ fontSize: 13 }}>
              <strong>Policy is {data.is_active ? "Active" : "Inactive"}</strong>
              {data.effective_date && (
                <span className="ms-2 opacity-75">· Effective from {data.effective_date}</span>
              )}
            </span>
          </div>
        )}

        {/* ── Section: General ── */}
        <SectionLabel>General</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Effective Date">
            {isEditing ? (
              <Input
                type="date"
                value={form.effective_date || ""}
                onChange={(e) => handleChange("effective_date", e.target.value)}
                style={{ width: 180 }}
              />
            ) : (
              <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>
            )}
          </SettingRow>

          <SettingRow label="Status" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={() => handleToggle("is_active")}
                />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>
                  {form.is_active ? "Active" : "Inactive"}
                </Label>
              </div>
            ) : (
              <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
            )}
          </SettingRow>
        </div>

        {/* ── Section: Claim Submission ── */}
        <SectionLabel>Claim Submission</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Submission Window (days)">
            {isEditing ? (
              <Input
                type="number"
                min="1"
                value={form.claim_submission_window_days || 30}
                onChange={(e) => handleChange("claim_submission_window_days", parseInt(e.target.value))}
                style={{ width: 100 }}
              />
            ) : (
              <Badge color="light" className="text-dark border" style={{ fontSize: 12 }}>
                {data.claim_submission_window_days ?? "—"} days
              </Badge>
            )}
          </SettingRow>

          <SettingRow label="Require Receipt for All Claims" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.require_receipt_for_all}
                  onChange={() => handleToggle("require_receipt_for_all")}
                />
              </div>
            ) : (
              <ViewToggle checked={!!data.require_receipt_for_all} />
            )}
          </SettingRow>
        </div>

        {/* ── Section: Approval & Payout ── */}
        <SectionLabel>Approval &amp; Payout</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Auto-approve Below Amount (₹)">
            {isEditing ? (
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.auto_approve_below_amount || "0.00"}
                  onChange={(e) => handleChange("auto_approve_below_amount", e.target.value)}
                  style={{ width: 140 }}
                />
                <small className="text-muted">0 = always require approval</small>
              </div>
            ) : (
              <span style={{ fontSize: 13 }}>
                {parseFloat(data.auto_approve_below_amount) > 0
                  ? `₹${parseFloat(data.auto_approve_below_amount).toFixed(2)}`
                  : <span className="text-muted">Always requires approval</span>}
              </span>
            )}
          </SettingRow>

          <SettingRow label="Payout with Monthly Salary" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.payout_with_salary}
                  onChange={() => handleToggle("payout_with_salary")}
                />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>
                  {form.payout_with_salary ? "Included in payroll run" : "Separate payout"}
                </Label>
              </div>
            ) : (
              <ViewToggle
                checked={!!data.payout_with_salary}
                label={data.payout_with_salary ? "Included in payroll run" : "Separate payout"}
              />
            )}
          </SettingRow>
        </div>

        {/* ── Section: Tax & CTC ── */}
        <SectionLabel>Tax &amp; CTC</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Taxable by Default">
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.is_taxable_by_default}
                  onChange={() => handleToggle("is_taxable_by_default")}
                />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>
                  {form.is_taxable_by_default ? "Taxable" : "Not taxable"}
                </Label>
              </div>
            ) : (
              <ViewToggle
                checked={!!data.is_taxable_by_default}
                label={data.is_taxable_by_default ? "Taxable" : "Not taxable"}
              />
            )}
          </SettingRow>

          <SettingRow label="Include Reimbursement in CTC" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!form.include_reimbursement_in_ctc}
                  onChange={() => handleToggle("include_reimbursement_in_ctc")}
                />
              </div>
            ) : (
              <ViewToggle checked={!!data.include_reimbursement_in_ctc} />
            )}
          </SettingRow>
        </div>

        {/* ── Actions ── */}
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
  );
};

export default ReimbursementPolicySettings;