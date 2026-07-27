import React, { useState, useEffect, useMemo } from "react";
import {
  Table, Input, Nav, NavItem, NavLink,
  TabContent, TabPane, Alert, CardHeader, Card, Row, Col,
} from "reactstrap";
import classnames from "classnames";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import Select from "react-select";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
import { Api } from "../../../common/api/Api";
import { MonthFormat } from "../../../common/constant/Constants";

import TypeFormModal from "./Modal/TypeFormModal";   // type create/edit modal
import HRClaimModal  from "./Modal/HRClaimModal";    // HR submits on behalf of employee
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

dayjs.extend(customParseFormat);

const FREQUENCY_LABELS = {
  monthly:     "Monthly",
  quarterly:   "Quarterly",
  half_yearly: "Half Yearly",
  annually:    "Annually",
};

const STATUS_OPTIONS = [
  { id: "",          label: "All Status",       value: "" },
  { id: "submitted", label: "Pending Approval", value: "submitted" },
  { id: "approved",  label: "Approved",         value: "approved" },
  { id: "rejected",  label: "Rejected",         value: "rejected" },
];

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};



// Small avatar with initials fallback when no photo is available
const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const EmployeeAvatar = ({ photo, name, size = 32 }) => {
  const [errored, setErrored] = useState(false);
  if (photo && !errored) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErrored(true)}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      className="d-flex align-items-center justify-content-center bg-success-subtle text-success fw-medium"
      style={{ width: size, height: size, borderRadius: "50%", fontSize: 12, flexShrink: 0 }}
    >
      {initials(name) || "?"}
    </div>
  );
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

const ClaimsTable = ({ claims, types, loading, onDelete, onDecide }) => {
  const total = claims.reduce((s, c) => s + parseFloat(c.computed_amount || 0), 0);

  return (
    <>
      {claims.length > 0 && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div className="border rounded p-2 px-3">
            <small className="text-muted d-block">Total shown</small>
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
            <th>Department</th>
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
            <tr><td colSpan={9} className="text-center py-4 text-muted">Loading...</td></tr>
          ) : claims.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-4 text-muted">No claims found.</td></tr>
          ) : claims.map((c) => {
            const t      = types.find((x) => x.id === parseInt(c.reimbursement_type));
            const isRate = t?.calculation_mode === "rate_x_units";
            return (
              <tr key={c.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <EmployeeAvatar photo={c.employee_photo} name={c.employee_name} />
                    <div>
                      <div className="fw-medium">{c.employee_name || c.employee || "—"}</div>
                      {c.emp_id && <small className="text-muted">{c.emp_id}</small>}
                    </div>
                  </div>
                </td>
                <td>{c.department_name || "—"}</td>
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
                  <div className="d-flex gap-2 justify-content-center align-items-center">
                    {c.status === "submitted" && (
                      <>
                        <i
                          className="ri-checkbox-circle-line text-success fs-16"
                          style={{ cursor: "pointer" }}
                          title="Approve"
                          onClick={() => onDecide(c, "approved")}
                        />
                        <i
                          className="ri-close-circle-line text-danger fs-16"
                          style={{ cursor: "pointer" }}
                          title="Reject"
                          onClick={() => onDecide(c, "rejected")}
                        />
                      </>
                    )}
                    <i
                      className="ri-delete-bin-line text-danger"
                      style={{ cursor: "pointer" }}
                      title="Delete"
                      onClick={() => onDelete(c)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        {claims.length > 0 && (
          <tfoot>
            <tr className="table-light">
              <td colSpan={5} className="fw-medium">Total</td>
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

  // Claims — fetched in full once, filtered client-side
  const [claims, setClaims]               = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsLoaded, setClaimsLoaded]   = useState(false);
  const [claimModal, setClaimModal]       = useState(false);


  const employees = GetLocalStorageData("employee") || [];
  const departments = GetLocalStorageData("department") || [];

  // employee_id -> {name, photo, department_ids, department_name} lookup, for enrichment + filtering.
  // Employee objects only ever expose first_name/last_name (no `.name`),
  // profile_url (no `.photo`/`.avatar_url`), and primary_department_id_list
  // — an ARRAY, since an employee can sit in more than one department —
  // never a singular `.department`/`.department_id`. Matches the same
  // fields used in AccountSettings.jsx / EmployeeView.jsx.
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      const deptIds = e.primary_department_id_list || [];
      map[e.id] = {
        name: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
        photo: e.profile_url || null,
        department_ids: deptIds,
        department_name: deptIds
          .map((id) => departments.find((d) => d.id === id)?.name || departments.find((d) => d.id === id)?.label)
          .filter(Boolean)
          .join(" / "),
      };
    });
    return map;
  }, [employees, departments]);

  const [filterKeys, setFilterKeys] = useState({
    thisMonth:  "",
    status:     "",
    type:       "0",
    department: "0",
    employee:   "0",
  });

  const typeOptions = useMemo(() => ([
    { id: "0", label: "All Types", value: "0" },
    ...types.map((t) => ({ id: String(t.id), label: t.name, value: String(t.id) })),
  ]), [types]);

  const departmentOptions = useMemo(() => ([
    { id: "0", label: "All Departments", value: "0" },
    ...departments.map((d) => ({ id: String(d.id), label: d.name || d.label, value: String(d.id) })),
  ]), [departments]);

  const employeeOptions = useMemo(() => ([
    { id: "0", label: "All Employees", value: "0" },
    ...employees.map((e) => ({
      id: String(e.id),
      label: `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.emp_id || `#${e.id}`,
      value: String(e.id),
    })),
  ]), [employees]);

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

  // ── 3. Fetch ALL claims once — enrich with employee photo/department from GlobalMetaData ──
  const fetchClaims = () => {
    setClaimsLoading(true);
    Api({ method: "GET", url: "payroll/reimbursement-claims/" })
      .then((res) => {
        const list = res?.data?.data || [];
        const enriched = list.map((c) => {
          const meta = employeeMap[c.employee] || {};
          return {
            ...c,
            employee_name:   c.employee_name || meta.name,
            employee_photo:  c.employee_photo || meta.photo,
            department_name: c.department_name || meta.department_name,
          };
        });
        setClaims(enriched);
      })
      .catch(() => toast.error("Failed to load claims"))
      .finally(() => {
        setClaimsLoading(false);
        setClaimsLoaded(true);
      });
  };

  // Load once, the first time the Claims tab is opened (after employeeMap is ready)
  useEffect(() => {
    if (activeTab === "claims" && !claimsLoaded && employees.length >= 0) fetchClaims();
  }, [activeTab, claimsLoaded]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleTypeSaved  = () => fetchTypes();
  const handleClaimSaved = (saved) => {
    const meta = employeeMap[saved.employee] || {};
    setClaims((prev) => [{
      ...saved,
      employee_name:   saved.employee_name || meta.name,
      employee_photo:  saved.employee_photo || meta.photo,
      department_name: saved.department_name || meta.department_name,
    }, ...prev]);
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({ ...prev, thisMonth: monthStr }));
  };

  const handleStatusChange     = (e) => setFilterKeys((prev) => ({ ...prev, status: e.value }));
  const handleTypeChange       = (e) => setFilterKeys((prev) => ({ ...prev, type: e.value }));
  const handleDepartmentChange = (e) => setFilterKeys((prev) => ({ ...prev, department: e.value }));
  const handleEmployeeChange   = (e) => setFilterKeys((prev) => ({ ...prev, employee: e.value }));

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

  const handleDecideClaim = async (claim, decision) => {
    const isApprove = decision === "approved";

    const result = await Swal.fire({
      title: isApprove ? "Approve Claim?" : "Reject Claim?",
      html: `${isApprove ? "Approve" : "Reject"} this ${claim?.type_name || "reimbursement"} claim${
        claim?.employee_name ? ` for ${claim.employee_name}` : ""
      }?<br/>
        <span style="color:#0ab39c;font-weight:500">₹${fmt(claim?.computed_amount)}</span>`,
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#0ab39c" : "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isApprove ? "Yes, Approve" : "Yes, Reject",
      cancelButtonText: "Cancel",
      ...(isApprove ? {} : {
        input: "text",
        inputPlaceholder: "Reason for rejection (optional)",
      }),
    });
    if (!result.isConfirmed) return;

    dispatch(setLoaderVisible(true));
    try {
      const res = await Api({
        method: "PUT",
        url:    "payroll/reimbursement-claims/",
        data:   {
          id:     claim.id,
          status: decision,
          ...(isApprove ? {} : { rejection_reason: result.value || "" }),
        },
      });
      if (res.status === 200) {
        const meta = employeeMap[res.data.data.employee] || {};
        setClaims((prev) => prev.map((c) => (c.id === claim.id ? {
          ...res.data.data,
          employee_name:   res.data.data.employee_name || meta.name,
          employee_photo:  res.data.data.employee_photo || meta.photo,
          department_name: res.data.data.department_name || meta.department_name,
        } : c)));
        toast.success(res?.data?.message || `Claim ${decision}`);
      } else {
        toast.error(res?.data?.message || "Failed to update claim");
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

  // ── Filter + sort (latest first) ──────────────────────────────────────
  const visibleClaims = useMemo(() => {
    return claims
      .filter((c) => !filterKeys.thisMonth || (c.claim_date || "").slice(0, 7) === filterKeys.thisMonth)
      .filter((c) => !filterKeys.status || c.status === filterKeys.status)
      .filter((c) => filterKeys.type === "0" || String(c.reimbursement_type) === filterKeys.type)
      .filter((c) => {
        if (filterKeys.department === "0") return true;
        const meta = employeeMap[c.employee] || {};
        return (meta.department_ids || []).map(String).includes(filterKeys.department);
      })
      .filter((c) => filterKeys.employee === "0" || String(c.employee) === filterKeys.employee)
      .sort((a, b) => {
        if (a.claim_date !== b.claim_date) return a.claim_date < b.claim_date ? 1 : -1;
        return (b.id || 0) - (a.id || 0);
      });
  }, [claims, filterKeys, employeeMap]);

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
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">Claims</h5>
            <button
              type="button"
              className="btn btn-success add-btn"
              onClick={() => setClaimModal(true)}
            >
              <i className="ri-add-line align-bottom me-1" />Submit Claim
            </button>
          </div>

          {/* ── Filter bar (matches MyReimbursements.jsx / AttendanceFilter.jsx) ── */}
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

                <Col xl={2}>
                  <Select
                    options={departmentOptions}
                    placeholder="Select Department"
                    value={departmentOptions.find((d) => d.id === filterKeys.department)}
                    onChange={handleDepartmentChange}
                  />
                </Col>

                <Col xl={2}>
                  <Select
                    options={employeeOptions}
                    placeholder="Select Employee"
                    value={employeeOptions.find((d) => d.id === filterKeys.employee)}
                    onChange={handleEmployeeChange}
                  />
                </Col>
              </Row>
            </CardHeader>
          </Card>

          <ClaimsTable
            claims={visibleClaims}
            types={types}
            loading={claimsLoading}
            onDelete={handleDeleteClaim}
            onDecide={handleDecideClaim}
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