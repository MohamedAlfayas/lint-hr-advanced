import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

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

const LeavePolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/leave-policy-settings/" })
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

  const handleSave = () => {
    setLoading(true);
    const isUpdate = form?.id;
    Api({
      method: isUpdate ? "PUT" : "POST",
      url: "payroll/leave-policy-settings/",
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
      allow_negative_leave_balance: false,
      convert_excess_leave_to_lop: true,
      treat_absent_as_lop: true,
      unapproved_leave_as_lop: true,
      is_active: true,
    });
    setIsEmpty(false);
    setIsEditing(true);
  };

  const data = form || {};

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">Leave Policy</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light rounded-circle text-muted fs-28">
                <i className="ri-calendar-todo-line"></i>
              </div>
            </div>
            <h6 className="mb-1">No Leave Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
              Configure how leave balances and LOP deductions are handled.
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
          <CardTitle tag="h5" className="mb-0">Leave Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>
            Leave balance rules and LOP deduction settings
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
          <SettingRow label="Status" last>
            {isEditing ? (
              <div className="form-check form-switch mb-0">
                <Input className="form-check-input" type="checkbox" checked={!!form.is_active} onChange={() => handleToggle("is_active")} />
                <Label className="form-check-label ms-1" style={{ fontSize: 13 }}>{form.is_active ? "Active" : "Inactive"}</Label>
              </div>
            ) : (
              <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />
            )}
          </SettingRow>
        </div>

        <SectionLabel>Leave Balance Rules</SectionLabel>
        <div className="border rounded mb-4">
          {[
            ["allow_negative_leave_balance", "Allow Negative Leave Balance"],
            ["convert_excess_leave_to_lop", "Convert Excess Leave to LOP"],
            ["treat_absent_as_lop", "Treat Absent as LOP"],
            ["unapproved_leave_as_lop", "Treat Unapproved Leave as LOP"],
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

export default LeavePolicySettings;