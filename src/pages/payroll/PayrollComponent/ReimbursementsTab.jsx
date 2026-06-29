import React, { useState, useEffect } from "react";
import {
  Table, Input, Nav, NavItem, NavLink,
  TabContent, TabPane, Alert, CardHeader, Badge,
} from "reactstrap";
import classnames from "classnames";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
import { Api } from "../../../common/api/Api";

import TypeFormModal from "./Modal/TypeFormModal";   // type create/edit modal
import HRClaimModal  from "./Modal/HRClaimModal";    // HR submits on behalf of employee

const FREQUENCY_LABELS = {
  monthly:     "Monthly",
  quarterly:   "Quarterly",
  half_yearly: "Half Yearly",
  annually:    "Annually",
};

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

// ─── Types table ──────────────────────────────────────────────────────────────

const TypesTable = ({ types, loading, onEdit }) => (
  <Table bordered hover responsive className="align-middle" style={{ fontSize: 14 }}>
    <thead className="table-light">
      <tr>
        <th>Name</th>
        <th>Mode</th>
        <th>Rate / unit</th>
        <th>Per-claim cap</th>
        <th>Period cap</th>
        <th>Frequency</th>
        <th>Flags</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr><td colSpan={9} className="text-center py-4 text-muted">Loading...</td></tr>
      ) : types.length === 0 ? (
        <tr>
          <td colSpan={9} className="text-center py-4 text-muted">
            No reimbursement types yet. Click "Add Type" to create one.
          </td>
        </tr>
      ) : types.map((t) => (
        <tr key={t.id}>
          <td>
            <div className="fw-medium">{t.name}</div>
            {t.description && <small className="text-muted">{t.description}</small>}
          </td>
          <td>
            {t.calculation_mode === "rate_x_units"
              ? <span className="badge bg-info-subtle text-info text-uppercase px-2 py-1">Rate × Units</span>
              : <span className="badge bg-secondary-subtle text-secondary text-uppercase px-2 py-1">Flat</span>}
          </td>
          <td>
            {t.calculation_mode === "rate_x_units"
              ? `₹${t.meta?.rate} / ${t.meta?.unit_label}`
              : "—"}
          </td>
          <td>{t.max_amount_per_claim > 0  ? `₹${t.max_amount_per_claim}`  : "No cap"}</td>
          <td>{t.max_amount_per_period > 0 ? `₹${t.max_amount_per_period}` : "No cap"}</td>
          <td>{FREQUENCY_LABELS[t.frequency] || t.frequency}</td>
          <td>
            <div className="d-flex gap-1 flex-wrap">
              {t.receipt_required && <span className="badge bg-warning-subtle text-warning px-2 py-1">Receipt</span>}
              {t.is_taxable       && <span className="badge bg-danger-subtle  text-danger  px-2 py-1">Taxable</span>}
            </div>
          </td>
          <td>
            <span className={`badge text-uppercase px-3 py-2 bg-${t.is_active ? "success" : "warning"}-subtle text-${t.is_active ? "success" : "warning"}`}>
              {t.is_active ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="text-center">
            <i className="ri-pencil-line" onClick={() => onEdit(t)} style={{ cursor: "pointer" }} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

// ─── Claims table ─────────────────────────────────────────────────────────────

const ClaimsTable = ({ claims, types, loading, onDelete }) => {
  const total = claims.reduce((s, c) => s + parseFloat(c.computed_amount || 0), 0);

  return (
    <>
      {claims.length > 0 && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Total this period</small>
            <span className="fw-medium text-success fs-5">₹{fmt(total)}</span>
          </div>
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Claims</small>
            <span className="fw-medium fs-5">{claims.length}</span>
          </div>
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Payslip</small>
            <span className="fw-medium" style={{ fontSize: 13 }}>Auto-added end of month</span>
          </div>
        </div>
      )}

      <Table bordered hover responsive className="align-middle" style={{ fontSize: 14 }}>
        <thead className="table-light">
          <tr>
            <th>Employee</th>
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
            <tr><td colSpan={8} className="text-center py-4 text-muted">Loading...</td></tr>
          ) : claims.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-4 text-muted">No claims for this period.</td></tr>
          ) : claims.map((c) => {
            const t      = types.find((x) => x.id === parseInt(c.reimbursement_type));
            const isRate = t?.calculation_mode === "rate_x_units";
            return (
              <tr key={c.id}>
                <td className="fw-medium">
                  {c.employee_name || c.employee || "—"}
                  {c.emp_id && <div><small className="text-muted">{c.emp_id}</small></div>}
                </td>
                <td>{c.type_name || t?.name || "—"}</td>
                <td>{c.claim_date}</td>
                <td>
                  {isRate && c.claim_data?.units
                    ? `${c.claim_data.units} ${t?.meta?.unit_label} × ₹${t?.meta?.rate}`
                    : `₹${fmt(c.claim_data?.amount)}`}
                </td>
                <td className="fw-medium text-success">₹{fmt(c.computed_amount)}</td>
                <td>
                  <span className={`badge text-uppercase px-2 py-1 ${
                    c.status === "approved"  ? "bg-success-subtle text-success" :
                    c.status === "rejected"  ? "bg-danger-subtle  text-danger"  :
                                              "bg-warning-subtle text-warning"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ maxWidth: 160 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.claim_data?.description || "—"}
                  </div>
                </td>
                <td className="text-center">
                  <i
                    className="ri-delete-bin-line text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => onDelete(c)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        {claims.length > 0 && (
          <tfoot>
            <tr className="table-light">
              <td colSpan={4} className="fw-medium">Total</td>
              <td colSpan={4} className="fw-medium text-success">₹{fmt(total)}</td>
            </tr>
          </tfoot>
        )}
      </Table>
    </>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const ReimbursementsTab = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("types");

  // Policy
  const [policyId, setPolicyId]         = useState(null);
  const [policyLoading, setPolicyLoading] = useState(true);

  // Types
  const [types, setTypes]               = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typeModal, setTypeModal]       = useState(false);
  const [editingType, setEditingType]   = useState(null);
  const [typeSearch, setTypeSearch]     = useState("");

  // Claims
  const [claims, setClaims]               = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimModal, setClaimModal]       = useState(false);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear,  setFilterYear]  = useState(now.getFullYear());

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString("default", { month: "long" }),
  }));

  // ── 1. Resolve active policy ──────────────────────────────────────────
  useEffect(() => {
    setPolicyLoading(true);
    Api({ method: "GET", url: "payroll/reimbrusement-policy-settings/" })
      .then((res) => {
        const list   = res?.data?.data || [];
        const active = list.find((p) => p.is_active) || list[0];
        if (active) setPolicyId(active.id);
        else toast.error("No reimbursement policy found. Configure one under Policy Settings.");
      })
      .catch(() => toast.error("Failed to load reimbursement policy"))
      .finally(() => setPolicyLoading(false));
  }, []);

  // ── 2. Fetch types when policy ready ──────────────────────────────────
  const fetchTypes = () => {
    if (!policyId) return;
    setTypesLoading(true);
    Api({ method: "GET", url: `payroll/reimbursement-type/?policy=${policyId}` })
      .then((res) => setTypes(res?.data?.data || []))
      .catch(() => toast.error("Failed to load types"))
      .finally(() => setTypesLoading(false));
  };

  useEffect(() => { fetchTypes(); }, [policyId]);

  // ── 3. Fetch claims for selected period ───────────────────────────────
  const fetchClaims = () => {
    setClaimsLoading(true);
    Api({
      method: "GET",
      url: `payroll/reimbursement-claims/?month=${filterMonth}&year=${filterYear}`,
    })
      .then((res) => setClaims(res?.data?.data || []))
      .catch(() => toast.error("Failed to load claims"))
      .finally(() => setClaimsLoading(false));
  };

  useEffect(() => {
    if (activeTab === "claims") fetchClaims();
  }, [activeTab, filterMonth, filterYear]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleTypeSaved  = () => fetchTypes();
  const handleClaimSaved = (saved) => setClaims((prev) => [saved, ...prev]);

  const handleDeleteClaim = async (claim) => {
    const result = await Swal.fire({
      title: "Delete Claim?",
      html: `Remove this reimbursement claim${
        claim?.type_name ? ` for <b style="color:#7066e0">${claim.type_name}</b>` : ""
      }${claim?.employee_name ? ` (${claim.employee_name})` : ""}?<br/>
        <span style="color:#0ab39c;font-weight:500">₹${fmt(claim?.computed_amount)}</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
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
        toast.success(res?.data?.message || "Claim removed");
      } else {
        toast.error(res?.data?.message || "Failed to remove claim");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      dispatch(setLoaderVisible(false));
    }
  };

  const filteredTypes = types.filter((t) =>
    (t.name || "").toLowerCase().includes(typeSearch.toLowerCase())
  );

  // ── Gate until policy resolved ────────────────────────────────────────
  if (policyLoading) {
    return <div className="text-center py-5 text-muted">Loading policy...</div>;
  }

  if (!policyId) {
    return (
      <Alert color="warning" className="m-3">
        No active reimbursement policy found. Please configure one under{" "}
        <strong>Policy Settings → Reimbursement</strong>.
      </Alert>
    );
  }

  return (
    <div>
      <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
        <NavItem>
          <NavLink
            style={{ cursor: "pointer" }}
            className={classnames({ active: activeTab === "types" })}
            onClick={() => setActiveTab("types")}
          >
            Reimbursement Types
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            style={{ cursor: "pointer" }}
            className={classnames({ active: activeTab === "claims" })}
            onClick={() => setActiveTab("claims")}
          >
            Claims
            {claims.length > 0 && (
              <span className="badge bg-success ms-2" style={{ fontSize: 10 }}>
                {claims.length}
              </span>
            )}
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>

        {/* ── Types tab ── */}
        <TabPane tabId="types">
          <CardHeader className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <Input
              placeholder="Search type..."
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <button
              type="button"
              className="btn btn-success add-btn"
              onClick={() => { setEditingType(null); setTypeModal(true); }}
            >
              <i className="ri-add-line align-bottom me-1" />Add Type
            </button>
          </CardHeader>
          <TypesTable
            types={filteredTypes}
            loading={typesLoading}
            onEdit={(t) => { setEditingType(t); setTypeModal(true); }}
          />
        </TabPane>

        {/* ── Claims tab ── */}
        <TabPane tabId="claims">
          <CardHeader className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 align-items-center">
              <Input
                type="select" bsSize="sm" style={{ width: 140 }}
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Input>
              <Input
                type="select" bsSize="sm" style={{ width: 90 }}
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Input>
            </div>
            <button
              type="button"
              className="btn btn-success add-btn"
              onClick={() => setClaimModal(true)}
            >
              <i className="ri-add-line align-bottom me-1" />Submit Claim
            </button>
          </CardHeader>
          <ClaimsTable
            claims={claims}
            types={types}
            loading={claimsLoading}
            onDelete={handleDeleteClaim}
          />
        </TabPane>

      </TabContent>

      {/* Type create/edit modal */}
      <TypeFormModal
        isOpen={typeModal}
        toggle={() => setTypeModal(false)}
        initial={editingType}
        policyId={policyId}
        onSaved={handleTypeSaved}
      />

      {/* HR claim submission modal */}
      <HRClaimModal
        isOpen={claimModal}
        toggle={() => setClaimModal(false)}
        types={types}
        onSaved={handleClaimSaved}
      />
    </div>
  );
};

export default ReimbursementsTab;