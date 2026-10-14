// MyReimbursements.jsx
// Employee self-service: view own claim history + submit new claims.
// Pass the logged-in employee's id as `employeeId` (from your auth/session
// state — plug in whatever you use elsewhere, e.g. redux state.auth.employee.id).
//
// Filter bar styled to match AttendanceFilter.jsx: Card > CardHeader > Row(g-2)
// with antd month DatePicker + react-select Selects.

import React, { useState, useEffect, useMemo } from "react";
import { PageSkeleton } from "../../../component/common/skeleton/Skeleton";
import { Alert } from "reactstrap";
import { DatePicker } from "antd";
import { IconButton, Tooltip, Typography } from "@mui/material";
import {
  ApvDate,
  ApvLeaveType,
  ApvStatus,
} from "../../../component/common/approval/ApprovalCells";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Select from "../../../shared/ui/TestableSelect";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import EmployeeClaimModal from "./Modal/EmployeeClaimModal";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
import { MonthFormat } from "../../../common/constant/Constants";
import AppTable from "../../../shared/ui/table/AppTable";
import "./MyReimbursements.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";
dayjs.extend(customParseFormat);

const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const STATUS_TONES = {
  approved: { tone: "success", icon: "ri-checkbox-circle-line" },
  rejected: { tone: "danger", icon: "ri-close-circle-line" },
  submitted: { tone: "warning", icon: "ri-time-line" },
};

const statusLabel = (status) => (status === "submitted" ? "Pending Approval" : status);

const STATUS_OPTIONS = [
  { id: "",          label: "All Status",       value: "" },
  { id: "submitted", label: "Pending Approval", value: "submitted" },
  { id: "approved",  label: "Approved",         value: "approved" },
  { id: "rejected",  label: "Rejected",         value: "rejected" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: "var(--vz-secondary-bg)",
    borderColor: state.isFocused ? "var(--vz-primary)" : "var(--vz-border-color)",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(var(--vz-primary-rgb), 0.12)" : "none",
    "&:hover": { borderColor: "color-mix(in srgb, var(--vz-primary) 50%, var(--vz-border-color))" },
  }),
  valueContainer: (base) => ({ ...base, paddingInline: 12 }),
  singleValue: (base) => ({ ...base, color: "var(--vz-body-color)", fontWeight: 500 }),
  input: (base) => ({ ...base, color: "var(--vz-body-color)" }),
  placeholder: (base) => ({ ...base, color: "var(--vz-secondary-color)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "var(--vz-primary)" : "var(--vz-secondary-color)",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
    transition: "transform .2s",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    marginTop: 6,
    overflow: "hidden",
    borderRadius: 14,
    border: "1px solid var(--vz-border-color)",
    backgroundColor: "var(--vz-secondary-bg)",
    boxShadow: "0 24px 48px -16px rgba(15, 23, 42, 0.28)",
  }),
  menuList: (base) => ({ ...base, padding: 6 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 9,
    margin: "2px 0",
    cursor: "pointer",
    fontWeight: state.isSelected ? 600 : 500,
    color: state.isSelected ? "#fff" : state.isFocused ? "var(--vz-primary)" : "var(--vz-body-color)",
    background: state.isSelected
      ? "linear-gradient(135deg, var(--vz-primary), var(--vz-info))"
      : state.isFocused
        ? "rgba(var(--vz-primary-rgb), 0.08)"
        : "transparent",
    "&:active": { backgroundColor: "rgba(var(--vz-primary-rgb), 0.15)" },
  }),
};

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

  // Per-status totals respect the month + type filters but not the status filter,
  // so the status pills always show what each choice would return.
  const statusSummary = useMemo(() => {
    const base = { submitted: { count: 0, amount: 0 }, approved: { count: 0, amount: 0 }, rejected: { count: 0, amount: 0 } };
    claims
      .filter((c) => !filterKeys.thisMonth || (c.claim_date || "").slice(0, 7) === filterKeys.thisMonth)
      .filter((c) => filterKeys.type === "0" || String(c.reimbursement_type) === filterKeys.type)
      .forEach((c) => {
        const bucket = base[c.status];
        if (!bucket) return;
        bucket.count += 1;
        bucket.amount += parseFloat(c.computed_amount || 0);
      });
    return base;
  }, [claims, filterKeys.thisMonth, filterKeys.type]);

  const activeFilterCount =
    (filterKeys.thisMonth ? 1 : 0) + (filterKeys.status ? 1 : 0) + (filterKeys.type !== "0" ? 1 : 0);
  const resetFilters = () => setFilterKeys({ thisMonth: "", status: "", type: "0" });

  const columns = useMemo(() => {
    const typeOf = (c) => types.find((x) => x.id === parseInt(c.reimbursement_type));
    const inputText = (c) => {
      const t = typeOf(c);
      const isRate = (c.calculation_mode || t?.calculation_mode) === "rate_x_units";
      return isRate && c.claim_data?.units
        ? `${c.claim_data.units} ${c.unit_label || t?.meta?.unit_label} × ₹${t?.meta?.rate}`
        : `₹${fmt(c.claim_data?.amount)}`;
    };

    return [
      {
        id: "type",
        accessorFn: (c) => c.type_name || typeOf(c)?.name || "—",
        header: "Type",
        filterVariant: "select",
        Cell: ({ cell }) => <ApvLeaveType name={cell.getValue()} />,
        Footer: () => (visibleClaims.length > 0 ? <strong>Total</strong> : null),
      },
      {
        accessorKey: "claim_date",
        header: "Date",
        Cell: ({ cell }) => <ApvDate value={cell.getValue()} />,
      },
      { id: "input", accessorFn: inputText, header: "Input" },
      {
        id: "computed_amount",
        accessorFn: (c) => parseFloat(c.computed_amount || 0),
        header: "Amount",
        filterVariant: "range",
        Cell: ({ row }) => (
          <span className="fw-medium text-success">₹{fmt(row.original.computed_amount)}</span>
        ),
        exportValue: (c) => fmt(c.computed_amount),
        Footer: () =>
          visibleClaims.length > 0 ? (
            <span className="fw-medium text-success">₹{fmt(total)}</span>
          ) : null,
      },
      {
        id: "status",
        accessorFn: (c) => statusLabel(c.status),
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => {
          const s = STATUS_TONES[row.original.status] || STATUS_TONES.submitted;
          const label = String(statusLabel(row.original.status) || "");
          return (
            <ApvStatus
              tone={s.tone}
              icon={s.icon}
              label={label.replace(/^\w/, (c) => c.toUpperCase())}
            />
          );
        },
      },
      {
        id: "notes",
        accessorFn: (c) => c.claim_data?.description || "—",
        header: "Notes",
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue()} placement="top-start" enterDelay={400}>
            <Typography
              variant="body2"
              sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {cell.getValue()}
            </Typography>
          </Tooltip>
        ),
      },
    ];
  }, [types, visibleClaims.length, total]);

  if (policyLoading) {
    return <PageSkeleton testId="my-reimbursements-loading-skeleton" label="Loading reimbursements" />;
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
      <div className="rmb-head">
        <div className="apv-head">
          <span className="apv-head-icon tone-success">
            <i className="ri-wallet-3-line" />
          </span>
          <div style={{ minWidth: 0 }}>
            <h5 className="apv-head-title">My Reimbursements</h5>
            <span className="apv-head-sub">Submit expense claims and track their approval</span>
          </div>
        </div>
        {canSubmit && (
          <button data-testid="my-reimbursements-new-claim-button" type="button" className="it-btn is-primary" onClick={() => setClaimModal(true)}>
            <i className="ri-add-line" />
            New Claim
          </button>
        )}
      </div>

      <div className="rmb-stats">
        <div className="rmb-stat tone-success">
          <span className="rmb-stat-icon">
            <i className="ri-wallet-3-line" />
          </span>
          <div>
            <small>Total shown</small>
            <b>₹{fmt(total)}</b>
          </div>
        </div>
        <div className="rmb-stat tone-primary">
          <span className="rmb-stat-icon">
            <i className="ri-file-list-3-line" />
          </span>
          <div>
            <small>Claims</small>
            <b>{visibleClaims.length}</b>
          </div>
        </div>
        <div className="rmb-stat tone-warning">
          <span className="rmb-stat-icon">
            <i className="ri-time-line" />
          </span>
          <div>
            <small>Pending</small>
            <b>₹{fmt(statusSummary.submitted.amount)}</b>
            <em>{statusSummary.submitted.count} claims</em>
          </div>
        </div>
        <div className="rmb-stat tone-info">
          <span className="rmb-stat-icon">
            <i className="ri-checkbox-circle-line" />
          </span>
          <div>
            <small>Approved</small>
            <b>₹{fmt(statusSummary.approved.amount)}</b>
            <em>{statusSummary.approved.count} claims</em>
          </div>
        </div>
      </div>

      <div className="rmb-filters">
        <div className="rmb-filters-title">
          <i className="ri-filter-3-line" />
          Filters
          {activeFilterCount > 0 && <span className="rmb-filters-badge">{activeFilterCount}</span>}
        </div>

        <div className="rmb-filters-row">
          <div className="rmb-field">
            <label>
              <i className="ri-calendar-2-line" /> Month
            </label>
            <DatePicker
              value={filterKeys.thisMonth ? dayjs(filterKeys.thisMonth, MonthFormat) : null}
              format={MonthFormat}
              picker="month"
              allowClear={true}
              placeholder="All months"
              onChange={handleDateRangeChange}
              style={{ width: "100%", height: 40 }}
            />
          </div>

          <div className="rmb-field">
            <label>
              <i className="ri-checkbox-circle-line" /> Status
            </label>
            <Select
              testId="my-reimbursements-status"
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find((o) => o.id === filterKeys.status)}
              onChange={handleStatusChange}
              styles={selectStyles}
              classNamePrefix="rmb-select"
              isSearchable={false}
              formatOptionLabel={(o) => (
                <span className={`rmb-opt tone-${o.id ? STATUS_TONES[o.id].tone : "primary"}`}>
                  <i className={o.id ? STATUS_TONES[o.id].icon : "ri-apps-2-line"} />
                  <em>{o.label}</em>
                  <span className="rmb-opt-count">
                    {o.id ? statusSummary[o.id].count : claims.length}
                  </span>
                </span>
              )}
            />
          </div>

          <div className="rmb-field">
            <label>
              <i className="ri-price-tag-3-line" /> Type
            </label>
            <Select
              testId="my-reimbursements-all-types"
              options={typeOptions}
              placeholder="All types"
              value={typeOptions.find((d) => d.id === filterKeys.type)}
              onChange={handleTypeChange}
              styles={selectStyles}
              isSearchable
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="rmb-active">
            {filterKeys.thisMonth && (
              <span className="rmb-chip">
                <i className="ri-calendar-2-line" />
                {dayjs(filterKeys.thisMonth, MonthFormat).format("MMM YYYY")}
                <button data-testid="my-reimbursements-remove-month-filter-button" type="button" onClick={() => setFilterKeys((p) => ({ ...p, thisMonth: "" }))} aria-label="Remove month filter">
                  <i className="ri-close-line" />
                </button>
              </span>
            )}
            {filterKeys.status && (
              <span className="rmb-chip">
                <i className={STATUS_TONES[filterKeys.status].icon} />
                {STATUS_OPTIONS.find((o) => o.id === filterKeys.status)?.label}
                <button data-testid="my-reimbursements-remove-status-filter-button" type="button" onClick={() => setFilterKeys((p) => ({ ...p, status: "" }))} aria-label="Remove status filter">
                  <i className="ri-close-line" />
                </button>
              </span>
            )}
            {filterKeys.type !== "0" && (
              <span className="rmb-chip">
                <i className="ri-price-tag-3-line" />
                {typeOptions.find((o) => o.id === filterKeys.type)?.label}
                <button data-testid="my-reimbursements-remove-type-filter-button" type="button" onClick={() => setFilterKeys((p) => ({ ...p, type: "0" }))} aria-label="Remove type filter">
                  <i className="ri-close-line" />
                </button>
              </span>
            )}
            <button data-testid="my-reimbursements-reset-all-button" type="button" className="rmb-reset" onClick={resetFilters}>
              <i className="ri-refresh-line" />
              Reset all
            </button>
          </div>
        )}
      </div>

      <AppTable
        columns={columns}
        data={visibleClaims}
        isLoading={loading}
        onRefresh={fetchClaims}
        exportFileName="my-reimbursements"
        emptyMessage="No claims found."
        enableRowActions
        positionActionsColumn="last"
        displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 80 } }}
        renderRowActions={({ row }) =>
          canSubmit && row.original.status === "submitted" ? (
            <Tooltip title="Withdraw claim">
              <IconButton data-testid="my-reimbursements-delete-outline-button" size="small" color="error" onClick={() => handleDeleteClaim(row.original)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            "—"
          )
        }
      />

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