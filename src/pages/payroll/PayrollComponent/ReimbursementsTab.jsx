import React, { useState, useEffect, useMemo } from "react";
import { PageSkeleton } from "../../../component/common/skeleton/Skeleton";
import {
  Nav, NavItem, NavLink,
  TabContent, TabPane, Alert,
} from "reactstrap";
import classnames from "classnames";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import Select from "../../../shared/ui/TestableSelect";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
import { Api } from "../../../common/api/Api";
import { MonthFormat } from "../../../common/constant/Constants";

import TypeFormModal from "./Modal/TypeFormModal";   // type create/edit modal
import HRClaimModal  from "./Modal/HRClaimModal";    // HR submits on behalf of employee
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import AppTable from "../../../shared/ui/table/AppTable";
import { EditAction, StatusChip } from "../../../shared/ui/table/cells";
import {
  ApvChip,
  ApvDate,
  ApvEmployee,
  ApvLeaveType,
  ApvStatus,
} from "../../../component/common/approval/ApprovalCells";

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

const CLAIM_STATUS = {
  approved: { tone: "success", icon: "ri-checkbox-circle-line" },
  rejected: { tone: "danger", icon: "ri-close-circle-line" },
  submitted: { tone: "warning", icon: "ri-time-line" },
};

const capLabel = (v) => (v > 0 ? `₹${v}` : "No cap");

const typeFlags = (t) => [t.receipt_required && "Receipt", t.is_taxable && "Taxable"].filter(Boolean);

const NotesCell = ({ text }) => (
  <Tooltip title={text} placement="top-start" enterDelay={400}>
    <Typography
      variant="body2"
      sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
      {text}
    </Typography>
  </Tooltip>
);


// ─── Types table ──────────────────────────────────────────────────────────────

const TypesTable = ({ types, loading, onEdit }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.original.name}</Typography>
            {row.original.description && (
              <Typography variant="caption" color="text.secondary">
                {row.original.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: "mode",
        accessorFn: (t) => (t.calculation_mode === "rate_x_units" ? "Rate × Units" : "Flat"),
        header: "Mode",
        filterVariant: "select",
        Cell: ({ row, cell }) => (
          <Chip
            size="small"
            variant="outlined"
            color={row.original.calculation_mode === "rate_x_units" ? "info" : "default"}
            label={cell.getValue()}
            sx={{ fontWeight: 600, textTransform: "uppercase" }}
          />
        ),
      },
      {
        id: "rate",
        accessorFn: (t) =>
          t.calculation_mode === "rate_x_units" ? `₹${t.meta?.rate} / ${t.meta?.unit_label}` : "—",
        header: "Rate / unit",
      },
      {
        id: "max_amount_per_claim",
        accessorFn: (t) => Number(t.max_amount_per_claim) || 0,
        header: "Per-claim cap",
        filterVariant: "range",
        Cell: ({ cell }) => capLabel(cell.getValue()),
        exportValue: (t) => capLabel(t.max_amount_per_claim),
      },
      {
        id: "max_amount_per_period",
        accessorFn: (t) => Number(t.max_amount_per_period) || 0,
        header: "Period cap",
        filterVariant: "range",
        Cell: ({ cell }) => capLabel(cell.getValue()),
        exportValue: (t) => capLabel(t.max_amount_per_period),
      },
      {
        id: "frequency",
        accessorFn: (t) => FREQUENCY_LABELS[t.frequency] || t.frequency || "",
        header: "Frequency",
        filterVariant: "select",
      },
      {
        id: "flags",
        accessorFn: (t) => typeFlags(t).join(", "),
        header: "Flags",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.original.receipt_required && <Chip size="small" color="warning" variant="outlined" label="Receipt" />}
            {row.original.is_taxable && <Chip size="small" color="error" variant="outlined" label="Taxable" />}
          </Stack>
        ),
      },
      {
        id: "status",
        accessorFn: (t) => (t.is_active ? "Active" : "Inactive"),
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => <StatusChip active={row.original.is_active} />,
      },
    ],
    []
  );

  return (
    <AppTable
      columns={columns}
      data={types}
      isLoading={loading}
      exportFileName="reimbursement-types"
      emptyMessage={'No reimbursement types yet. Click "Add Type" to create one.'}
      enableRowActions
      positionActionsColumn="last"
      displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 80 } }}
      renderRowActions={({ row }) => <EditAction onClick={() => onEdit(row.original)} />}
    />
  );
};

// ─── Claims table ─────────────────────────────────────────────────────────────

const ClaimsTable = ({ claims, types, loading, onDelete, onDecide, filters, endActions }) => {
  const total = claims.reduce((s, c) => s + parseFloat(c.computed_amount || 0), 0);

  const columns = useMemo(() => {
    const typeOf = (c) => types.find((x) => x.id === parseInt(c.reimbursement_type));
    const inputText = (c) => {
      const t = typeOf(c);
      const isRate = t?.calculation_mode === "rate_x_units";
      return isRate && c.claim_data?.units
        ? `${c.claim_data.units} ${t?.meta?.unit_label} × ₹${t?.meta?.rate}`
        : `₹${fmt(c.claim_data?.amount)}`;
    };

    return [
      {
        id: "employee",
        accessorFn: (c) => String(c.employee_name || c.employee || "—"),
        header: "Employee",
        size: 220,
        exportValue: (c) => `${c.employee_name || c.employee || "—"}${c.emp_id ? ` (${c.emp_id})` : ""}`,
        Cell: ({ row }) => (
          <ApvEmployee
            employee={{
              first_name: String(row.original.employee_name || row.original.employee || "—"),
              profile_url: row.original.employee_photo,
            }}
            sub={row.original.emp_id ? `#${row.original.emp_id}` : null}
          />
        ),
        Footer: () => (claims.length > 0 ? <strong>Total</strong> : null),
      },
      {
        id: "department",
        accessorFn: (c) => c.department_name || "—",
        header: "Department",
        Cell: ({ cell }) => (
          <ApvChip icon="ri-building-line">{cell.getValue() === "—" ? "" : cell.getValue()}</ApvChip>
        ),
      },
      {
        id: "type",
        accessorFn: (c) => c.type_name || typeOf(c)?.name || "—",
        header: "Type",
        filterVariant: "select",
        Cell: ({ cell }) => <ApvLeaveType name={cell.getValue()} />,
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
          claims.length > 0 ? <span className="fw-medium text-success">₹{fmt(total)}</span> : null,
      },
      {
        id: "status",
        accessorFn: (c) => c.status || "",
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => {
          const s = CLAIM_STATUS[row.original.status] || CLAIM_STATUS.submitted;
          return (
            <ApvStatus
              tone={s.tone}
              icon={s.icon}
              label={String(row.original.status || "submitted").replace(/^\w/, (c) => c.toUpperCase())}
            />
          );
        },
      },
      {
        id: "notes",
        accessorFn: (c) => c.claim_data?.description || "—",
        header: "Notes",
        Cell: ({ cell }) => <NotesCell text={cell.getValue()} />,
      },
    ];
  }, [types, claims.length, total]);

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

      <AppTable
        columns={columns}
        data={claims}
        isLoading={loading}
        exportFileName="reimbursement-claims"
        emptyMessage="No claims found."
        toolbarActions={filters}
        toolbarEndActions={endActions}
        enableRowActions
        positionActionsColumn="last"
        displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 120 } }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {row.original.status === "submitted" && (
              <>
                <Tooltip title="Approve">
                  <IconButton data-testid="reimbursements-check-circle-outline-button" size="small" color="success" onClick={() => onDecide(row.original, "approved")}>
                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton data-testid="reimbursements-cancel-button" size="small" color="error" onClick={() => onDecide(row.original, "rejected")}>
                    <CancelOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="Delete">
              <IconButton data-testid="reimbursements-delete-outline-button" size="small" color="error" onClick={() => onDelete(row.original)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
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
      ...e,
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
        <span style="color:var(--vz-success);font-weight:500">₹${fmt(claim?.computed_amount)}</span>`,
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
        <span style="color:var(--vz-success);font-weight:500">₹${fmt(claim?.computed_amount)}</span>`,
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "var(--vz-success)" : "#d33",
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
    return <PageSkeleton testId="reimbursements-loading-skeleton" label="Loading reimbursement policy" />;
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
            data-testid="reimbursements-reimbursement-types-link"
            style={{ cursor: "pointer" }}
            className={classnames({ active: activeTab === "types" })}
            onClick={() => setActiveTab("types")}
          >
            Reimbursement Types
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            data-testid="reimbursements-claims-link"
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
          <div className="d-flex justify-content-end align-items-center mb-3">
            <button
              data-testid="reimbursements-add-type-button"
              type="button"
              className="btn btn-success add-btn"
              onClick={() => { setEditingType(null); setTypeModal(true); }}
            >
              <i className="ri-add-line align-bottom me-1" />Add Type
            </button>
          </div>
          <TypesTable
            types={types}
            loading={typesLoading}
            onEdit={(t) => { setEditingType(t); setTypeModal(true); }}
          />
        </TabPane>

        {/* ── Claims tab ── */}
        <TabPane tabId="claims">
          <ClaimsTable
            claims={visibleClaims}
            types={types}
            loading={claimsLoading}
            onDelete={handleDeleteClaim}
            onDecide={handleDecideClaim}
            filters={
              <div className="claims-toolbar-filters">
                <DatePicker
                  value={filterKeys.thisMonth ? dayjs(filterKeys.thisMonth, MonthFormat) : null}
                  format={MonthFormat}
                  picker="month"
                  allowClear={true}
                  placeholder="Select Month"
                  className="form-control"
                  onChange={handleDateRangeChange}
                />
                <Select
                  testId="reimbursements-select-status"
                  options={STATUS_OPTIONS}
                  placeholder="Select Status"
                  value={STATUS_OPTIONS.find((d) => d.id === filterKeys.status)}
                  onChange={handleStatusChange}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }}
                />
                <Select
                  testId="reimbursements-select-type"
                  options={typeOptions}
                  placeholder="Select Type"
                  value={typeOptions.find((d) => d.id === filterKeys.type)}
                  onChange={handleTypeChange}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }}
                />
                <Select
                  testId="reimbursements-select-department"
                  options={departmentOptions}
                  placeholder="Select Department"
                  value={departmentOptions.find((d) => d.id === filterKeys.department)}
                  onChange={handleDepartmentChange}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }}
                />
                <Select
                  testId="reimbursements-select-employee"
                  options={employeeOptions}
                  placeholder="Select Employee"
                  value={employeeOptions.find((d) => d.id === filterKeys.employee)}
                  onChange={handleEmployeeChange}
                  components={{ Option: EmployeeDisplayInSelect }}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }}
                />
              </div>
            }
            endActions={
              <button
                data-testid="reimbursements-submit-claim-button"
                type="button"
                className="btn btn-success add-btn text-nowrap"
                onClick={() => setClaimModal(true)}
              >
                <i className="ri-add-line align-bottom me-1" />Submit Claim
              </button>
            }
          />
          <style>{`
            .claims-toolbar-filters {
              display:flex; flex-wrap:nowrap; gap:8px; align-items:center;
              max-width:100%; overflow-x:auto; padding-bottom:2px; scrollbar-width:thin;
            }
            .claims-toolbar-filters > * { width:150px; min-width:150px; flex:0 0 auto; }
            .claims-toolbar-filters > .ant-picker { width:140px; min-width:140px; }
            .claims-toolbar-filters [class*='-indicatorSeparator'] { display:none; }
            .claims-toolbar-filters [class*='-indicatorContainer'] { padding:0 6px; }
            .claims-toolbar-filters .form-control,
            .claims-toolbar-filters .ant-picker { height:40px; }
            .claims-toolbar-filters [class*='-control'] { min-height:40px; height:40px; flex-wrap:nowrap; }
            .claims-toolbar-filters [class*='-placeholder'],
            .claims-toolbar-filters [class*='-singleValue'] { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          `}</style>
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