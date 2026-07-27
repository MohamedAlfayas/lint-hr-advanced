// MyReimbursements.jsx
// Employee self-service: view own claim history + submit new claims.
// Pass the logged-in employee's id as `employeeId` (from your auth/session
// state — plug in whatever you use elsewhere, e.g. redux state.auth.employee.id).
//
// Filter bar styled to match AttendanceFilter.jsx: Card > CardHeader > Row(g-2)
// with antd month DatePicker + react-select Selects.

import React, { useState, useEffect, useMemo } from "react";
import { Table, Card, CardHeader, Col, Row, Alert } from "reactstrap";
import { DatePicker } from "antd";
import Select from "react-select";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import EmployeeClaimModal from "./Modal/EmployeeClaimModal";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
import { MonthFormat } from "../../../common/constant/Constants";
dayjs.extend(customParseFormat);

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const STATUS_OPTIONS = [
  { id: "",          label: "All Status",       value: "" },
  { id: "submitted", label: "Pending Approval", value: "submitted" },
  { id: "approved",  label: "Approved",         value: "approved" },
  { id: "rejected",  label: "Rejected",         value: "rejected" },
];

const MyReimbursements = ({ employeeId, canSubmit = true }) => {
  const dispatch = useDispatch();

  const [policyId, setPolicyId]           = useState(null);
  const [policyLoading, setPolicyLoading] = useState(true);

  const [types, setTypes]     = useState([]);
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimModal, setClaimModal] = useState(false);

  // Filters — all optional, blank = no restriction. "" month = show all months.
  const [filterKeys, setFilterKeys] = useState({
    thisMonth: "",
    status:    "",
    type:      "0",
  });

  const typeOptions = useMemo(() => ([
    { id: "0", label: "All Types", value: "0" },
    ...types.map((t) => ({ id: String(t.id), label: t.name, value: String(t.id) })),
  ]), [types]);

  // ── 1. Active policy ─────────────────────────────────────────────────
  useEffect(() => {
    Api({ method: "GET", url: "payroll/reimbrusement-policy-settings/" })
      .then((res) => {
        const list   = res?.data?.data || [];
        const active = list.find((p) => p.is_active) || list[0];
        if (active) setPolicyId(active.id);
      })
      .catch(() => toast.error("Failed to load reimbursement policy"))
      .finally(() => setPolicyLoading(false));
  }, []);

  // ── 2. Types for the active policy ───────────────────────────────────
  useEffect(() => {
    if (!policyId) return;
    Api({ method: "GET", url: `payroll/reimbursement-type/?policy=${policyId}` })
      .then((res) => setTypes(res?.data?.data || []))
      .catch(() => toast.error("Failed to load reimbursement types"));
  }, [policyId]);

  // ── 3. All of my claims, loaded once ──────────────────────────────────
  // No month/year sent here on purpose — we load the full history and let
  // the filter bar narrow it down client-side, sorted latest-first.
  const fetchClaims = () => {
    if (!employeeId) return;
    setLoading(true);
    Api({
      method: "GET",
      url: `payroll/reimbursement-claims/?employee_id=${employeeId}`,
    })
      .then((res) => setClaims(res?.data?.data || []))
      .catch(() => toast.error("Failed to load your claims"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, [employeeId]);

  const handleClaimSaved = (saved) => {
    setClaims((prev) => [saved, ...prev]);
  };

  const handleDeleteClaim = async (claim) => {
    if (claim.status !== "submitted") {
      toast.error("Only claims still pending approval can be withdrawn");
      return;
    }
    const result = await Swal.fire({
      title: "Withdraw Claim?",
      html: `Withdraw this ${claim?.type_name || "reimbursement"} claim for
        <span style="color:#0ab39c;font-weight:500">₹${fmt(claim?.computed_amount)}</span>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Withdraw",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    dispatch(setLoaderVisible(true));
    try {
      const res = await Api({
        method: "PUT",
        url:    "payroll/reimbursement-claims/",
        data:   { id: claim.id, is_active: false },
      });
      if (res.status === 200) {
        setClaims((prev) => prev.filter((c) => c.id !== claim.id));
        toast.success(res?.data?.message || "Claim withdrawn");
      } else {
        toast.error(res?.data?.message || "Failed to withdraw claim");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  // ── Filter handlers (same shape as AttendanceFilter.jsx) ──────────────
  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({ ...prev, thisMonth: monthStr }));
  };

  const handleStatusChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, status: e.value }));
  };

  const handleTypeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, type: e.value }));
  };

  // ── Filter + sort (latest first) ──────────────────────────────────────
  const visibleClaims = useMemo(() => {
    return claims
      .filter((c) => !filterKeys.thisMonth || (c.claim_date || "").slice(0, 7) === filterKeys.thisMonth)
      .filter((c) => !filterKeys.status || c.status === filterKeys.status)
      .filter((c) => filterKeys.type === "0" || String(c.reimbursement_type) === filterKeys.type)
      .sort((a, b) => {
        if (a.claim_date !== b.claim_date) return a.claim_date < b.claim_date ? 1 : -1;
        return (b.id || 0) - (a.id || 0);
      });
  }, [claims, filterKeys]);

  const total = visibleClaims.reduce((s, c) => s + parseFloat(c.computed_amount || 0), 0);

  if (policyLoading) {
    return <div className="text-center py-5 text-muted">Loading...</div>;
  }

  if (!policyId) {
    return (
      <Alert color="warning" className="m-3">
        Reimbursements are not configured yet. Contact HR.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0">My Reimbursements</h5>
        {canSubmit && (
          <button
            type="button"
            className="btn btn-success add-btn"
            onClick={() => setClaimModal(true)}
          >
            <i className="ri-add-line align-bottom me-1" />New Claim
          </button>
        )}
      </div>

      {/* ── Filter bar (matches AttendanceFilter.jsx) ── */}
      <Card>
        <CardHeader className="border-0 rounded">
          <Row className="g-2">
            <Col xl={2}>
              <DatePicker
                value={filterKeys.thisMonth ? dayjs(filterKeys.thisMonth, MonthFormat) : null}
                format={MonthFormat}
                picker="month"
                allowClear={true}
                placeholder="Select Month"
                className="form-control"
                onChange={handleDateRangeChange}
              />
            </Col>

            <Col xl={2}>
              <Select
                options={STATUS_OPTIONS}
                placeholder="Select Status"
                value={STATUS_OPTIONS.find((d) => d.id === filterKeys.status)}
                onChange={handleStatusChange}
              />
            </Col>

            <Col xl={2}>
              <Select
                options={typeOptions}
                placeholder="Select Type"
                value={typeOptions.find((d) => d.id === filterKeys.type)}
                onChange={handleTypeChange}
              />
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {visibleClaims.length > 0 && (
        <div className="d-flex gap-3 my-3 flex-wrap">
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Total shown</small>
            <span className="fw-medium text-success fs-5">₹{fmt(total)}</span>
          </div>
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Claims</small>
            <span className="fw-medium fs-5">{visibleClaims.length}</span>
          </div>
        </div>
      )}

      <Table bordered hover responsive className="align-middle" style={{ fontSize: 14 }}>
        <thead className="table-light">
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Input</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center py-4 text-muted">Loading...</td></tr>
          ) : visibleClaims.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-4 text-muted">No claims found.</td></tr>
          ) : visibleClaims.map((c) => {
            const t      = types.find((x) => x.id === parseInt(c.reimbursement_type));
            const isRate = (c.calculation_mode || t?.calculation_mode) === "rate_x_units";
            return (
              <tr key={c.id}>
                <td>{c.type_name || t?.name || "—"}</td>
                <td>{c.claim_date}</td>
                <td>
                  {isRate && c.claim_data?.units
                    ? `${c.claim_data.units} ${c.unit_label || t?.meta?.unit_label} × ₹${t?.meta?.rate}`
                    : `₹${fmt(c.claim_data?.amount)}`}
                </td>
                <td className="fw-medium text-success">₹{fmt(c.computed_amount)}</td>
                <td>
                  <span className={`badge text-uppercase px-2 py-1 ${
                    c.status === "approved"  ? "bg-success-subtle text-success" :
                    c.status === "rejected"  ? "bg-danger-subtle  text-danger"  :
                                              "bg-warning-subtle text-warning"
                  }`}>
                    {c.status === "submitted" ? "Pending Approval" : c.status}
                  </span>
                </td>
                <td style={{ maxWidth: 160 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.claim_data?.description || "—"}
                  </div>
                </td>
                <td className="text-center">
                  {canSubmit && c.status === "submitted" ? (
                    <i
                      className="ri-delete-bin-line text-danger"
                      style={{ cursor: "pointer" }}
                      title="Withdraw claim"
                      onClick={() => handleDeleteClaim(c)}
                    />
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        {visibleClaims.length > 0 && (
          <tfoot>
            <tr className="table-light">
              <td colSpan={3} className="fw-medium">Total</td>
              <td colSpan={4} className="fw-medium text-success">₹{fmt(total)}</td>
            </tr>
          </tfoot>
        )}
      </Table>

      <EmployeeClaimModal
        isOpen={claimModal}
        toggle={() => setClaimModal(false)}
        employeeId={employeeId}
        types={types}
        onSaved={handleClaimSaved}
      />
    </div>
  );
};

export default MyReimbursements;