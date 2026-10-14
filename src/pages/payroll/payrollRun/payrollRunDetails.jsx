import React, { useEffect, useRef, useState } from "react";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";
import {
  Button, TabContent, TabPane, Input,
} from "reactstrap";
import "./payrollRunDetails.scss";
import Select from "../../../shared/ui/TestableSelect";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import EmployeePayslip from "./EmployeePayslip";
import EmployeeRegularization from "./EmployeeRegularization";
import RunStatusActions from "./RunStatusActions";
import RunPaymentActions from "./RunPaymentActions";
import StatusBadge from "./StatusBadge";
import { isRunFullySettled, promoteSettledRun } from "./statusHelpers";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const BONUS_PAGE_SIZE = 15;
const employees = GetLocalStorageData("employee") || [];
const departments = GetLocalStorageData("department") || [];
const deptMap = departments.reduce((acc, d) => {
  acc[d.id] = d.name;
  return acc;
}, {});

const getDeptName = (emp) => {
  const ids = emp?.primary_department_id_list || [];
  return deptMap[ids[0]] || emp?.department_name || "";
};

const enrichPayslip = (slip) => {
  const emp = employees.find((e) => String(e.id) === String(slip.employee));
  return {
    ...slip,
    employee_name: slip.employee_name
      || (emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : `Employee #${slip.employee}`),
    emp_id: slip.employee_emp_id || emp?.emp_id || "—",
    department: slip.department_name || getDeptName(emp),
  };
};

const bonusDeptSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    fontSize: 13,
    borderRadius: 4,
    borderColor: state.isFocused ? "var(--vz-success)" : "var(--vz-border-color)",
    boxShadow: state.isFocused ? "0 0 0 0.15rem rgba(10,179,156,0.25)" : "none",
    "&:hover": { borderColor: state.isFocused ? "var(--vz-success)" : "var(--vz-secondary-color)" },
  }),
  valueContainer: (base) => ({ ...base, height: 36, padding: "0 10px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: 36 }),
  indicatorSeparator: () => ({ display: "none" }),
  placeholder: (base) => ({ ...base, fontSize: 13, color: "var(--vz-secondary-color)" }),
  singleValue: (base) => ({ ...base, fontSize: 13 }),
  menu: (base) => ({ ...base, fontSize: 13, zIndex: 10 }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    backgroundColor: state.isSelected ? "var(--vz-success)" : state.isFocused ? "rgba(var(--vz-success-rgb), .1)" : "var(--vz-secondary-bg)",
    color: state.isSelected ? "#fff" : "var(--vz-heading-color, var(--vz-body-color))",
  }),
};

const fmtDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmtDays = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const wholeDays = Math.floor(num);
  const hours = Math.round((num - wholeDays) * 9);
  if (hours === 0) return `${wholeDays} day${wholeDays !== 1 ? "s" : ""}`;
  if (wholeDays === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  return `${wholeDays} day${wholeDays !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`;
};

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const BONUS_COLORS = {
  employee:   { bg: "var(--vz-tertiary-bg)", text: "var(--vz-body-color)", border: "var(--vz-border-color)", cell: "var(--vz-tertiary-bg)" },
  bonus:      { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .4)", cell: "rgba(var(--vz-success-rgb), .1)" },
  perform:    { bg: "rgba(var(--vz-primary-rgb), .08)", text: "var(--vz-primary)", border: "rgba(var(--vz-primary-rgb), .4)", cell: "rgba(var(--vz-primary-rgb), .07)" },
  total:      { bg: "rgba(var(--vz-success-rgb), .1)", text: "var(--vz-success)", border: "rgba(var(--vz-success-rgb), .55)", cell: "rgba(var(--vz-success-rgb), .1)" },
  gratuity:   { bg: "rgba(var(--vz-warning-rgb), .1)", text: "var(--vz-warning)", border: "rgba(var(--vz-warning-rgb), .45)", cell: "rgba(var(--vz-warning-rgb), .07)" },
  deduction:  { bg: "rgba(var(--vz-danger-rgb), .08)", text: "var(--vz-danger)", border: "rgba(var(--vz-danger-rgb), .4)", cell: "rgba(var(--vz-danger-rgb), .06)" },
};

const BONUS_HEAD_H = 36;

const bonusTh = (color, extra = {}) => ({
  padding: "6px 8px",
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  verticalAlign: "middle",
  textAlign: "center",
  position: "sticky",
  top: 0,
  zIndex: 3,
  background: `linear-gradient(${color.bg}, ${color.bg}), var(--vz-secondary-bg)`,
  color: color.text,
  borderRight: "1px solid var(--vz-border-color)",
  borderBottom: "2px solid var(--vz-border-color)",
  borderTop: `2px solid ${color.border}`,
  height: BONUS_HEAD_H,
  boxSizing: "border-box",
  ...extra,
});

const bonusSubTh = (color, extra = {}) => bonusTh(color, {
  top: BONUS_HEAD_H,
  borderTop: "none",
  whiteSpace: "normal",
  lineHeight: 1.3,
  height: "auto",
  minWidth: 120,
  ...extra,
});

const bonusTd = (color, extra = {}) => ({
  padding: "8px",
  fontSize: 12,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "right",
  background: color.cell,
  color: color.text,
  borderRight: "1px solid var(--vz-border-color)",
  borderBottom: "1px solid var(--vz-border-color)",
  ...extra,
});

// `isOpen` / `toggle` are kept as props for drop-in compatibility with
// existing callers (toggle is used to close/exit the full-screen page).
// `onChanged` is optional — pass the parent list's refetch (e.g. payrollRun.jsx's
// fetchData) so the run list picks up the status change too once a tranche is released.
const PayrollRunDetails = ({ isOpen, toggle, data, onChanged }) => {
  const [activeTab, setActiveTab]       = useState("overview");
  const [payslips, setPayslips]         = useState([]);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [bonusSearch, setBonusSearch] = useState("");
  const [bonusDebouncedSearch, setBonusDebouncedSearch] = useState("");
  const [bonusDepartment, setBonusDepartment] = useState(null);
  const [bonusPage, setBonusPage] = useState(1);
  const [bonusRows, setBonusRows] = useState([]);
  const [bonusTotal, setBonusTotal] = useState(0);
  const [bonusTotalPages, setBonusTotalPages] = useState(1);
  const [bonusLoading, setBonusLoading] = useState(false);

  // Run status is tracked locally so the badge/actions update immediately
  // after a payment release, without waiting for the parent list to refetch
  // and re-pass `data` (data.status itself never mutates in place here).
  const [runStatus, setRunStatus] = useState(data?.status);
  useEffect(() => { setRunStatus(data?.status); }, [data?.id, data?.status, isOpen]);

  const refreshRunStatus = () => {
    if (!data?.id) return;
    Api({ method: "GET", url: "payroll/payroll-run/" })
      .then((res) => {
        const rows = res?.data?.data || res?.data || [];
        const match = rows.find((r) => String(r.id) === String(data.id));
        if (match) setRunStatus(match.status);
      })
      .catch(() => {});
  };

  // ── Regularization tab state ─────────────────────────────────────────────
  const [selectedRegEmp, setSelectedRegEmp] = useState(null); // react-select option

  // ── Cross-tab refresh ────────────────────────────────────────────────────
  // Incremented whenever a regularization is saved in the Regularization tab.
  // Passed as `refreshKey` to EmployeePayslip so it re-fetches and the
  // Payslips tab immediately reflects the new LOP days / net pay.
  const [payslipRefreshKey, setPayslipRefreshKey] = useState(0);
  const handleRegularizationSaved = () => setPayslipRefreshKey((k) => k + 1);
  const promotedRunId = useRef(null);

  // Reset UI state only when the panel is (re)opened for a run — not on
  // every payslipRefreshKey bump, or a payment release would bounce the
  // user back to the Overview tab mid-review.
  useEffect(() => {
    if (isOpen && data?.id) {
      setActiveTab("overview");
      setSelectedRegEmp(null);
      setBonusSearch("");
      setBonusDebouncedSearch("");
      setBonusDepartment(null);
      setBonusPage(1);
    }
  }, [isOpen, data?.id]);

  useEffect(() => {
    if (isOpen && data?.id) {
      setPayslips([]);
      setLoadingSlips(true);
      refreshRunStatus();
      Api({ method: "GET", url: `payroll/employee-payslip/?payroll_run=${data.id}` })
        .then((res) => {
          const raw = res?.data?.data || [];
          setPayslips(raw.map(enrichPayslip));
        })
        .catch(() => toast.error("Failed to load payslip breakdown"))
        .finally(() => setLoadingSlips(false));
    }
    // payslipRefreshKey bumps after a regularization save OR a payment
    // release, so the Overview/Bonus aggregates (incl. Paid/Balance) stay
    // in sync with what EmployeePayslip's own table is showing.
  }, [isOpen, data?.id, payslipRefreshKey]);

  // Balance can already be zero while the run is still partially_paid.
  // Paid is hidden as a manual next step, so Close never shows until the
  // run itself is paid.
  useEffect(() => {
    if (!isOpen || !data?.id || loadingSlips) return;
    if (runStatus !== "locked" && runStatus !== "partially_paid") return;
    if (!isRunFullySettled(payslips)) return;
    if (promotedRunId.current === data.id) return;
    promotedRunId.current = data.id;
    promoteSettledRun(data.id)
      .then((res) => {
        const status = res?.data?.data?.status;
        if (status && status !== "paid") {
          promotedRunId.current = null;
          toast.error(`Run stayed ${status}.`);
          return;
        }
        setRunStatus("paid");
        setPayslipRefreshKey((k) => k + 1);
        toast.success("Payroll run marked paid");
        onChanged && onChanged();
      })
      .catch((err) => {
        promotedRunId.current = null;
        const data = err?.response?.data;
        const raw = data?.error_message || data?.detail || err?.message || "Could not mark the run paid.";
        const text = Array.isArray(raw) ? raw.map(String).join(" ") : String(raw);
        const quoted = text.match(/string="([\s\S]*)",\s*code=/);
        toast.error(quoted ? quoted[1] : text);
      });
  }, [isOpen, data?.id, loadingSlips, runStatus, payslips, onChanged]);

  // Lock body scroll while the full-screen page is open (same behaviour a
  // Modal would have given us for free).
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prevOverflow; };
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setBonusDebouncedSearch(bonusSearch.trim()), 300);
    return () => clearTimeout(timer);
  }, [bonusSearch]);

  const bonusFiltersKey = `${data?.id || ""}|${bonusDebouncedSearch}|${bonusDepartment?.value ?? ""}`;
  const bonusFiltersRef = useRef(bonusFiltersKey);
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  useEffect(() => {
    if (!isOpen || activeTab !== "bonus & gratuity" || !data?.id) return undefined;
    const filtersChanged = bonusFiltersRef.current !== bonusFiltersKey;
    bonusFiltersRef.current = bonusFiltersKey;
    if (filtersChanged && bonusPage !== 1) {
      setBonusPage(1);
      return undefined;
    }
    const params = new URLSearchParams();
    params.set("payroll_run", String(data.id));
    params.set("page", String(bonusPage));
    params.set("page_size", String(BONUS_PAGE_SIZE));
    if (bonusDebouncedSearch) params.set("search", bonusDebouncedSearch);
    if (bonusDepartment?.value != null && bonusDepartment.value !== "") {
      params.set("department", String(bonusDepartment.value));
    }
    let cancelled = false;
    setBonusLoading(true);
    Api({ method: "GET", url: `payroll/employee-payslip/?${params.toString()}` })
      .then((res) => {
        if (cancelled) return;
        const raw = res?.data?.data || [];
        setBonusRows(raw.map(enrichPayslip));
        setBonusTotal(Number(res?.data?.count ?? raw.length));
        setBonusTotalPages(Math.max(1, Number(res?.data?.total_pages ?? 1)));
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load bonus data.");
      })
      .finally(() => {
        if (!cancelled) setBonusLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, activeTab, data?.id, bonusPage, bonusFiltersKey, payslipRefreshKey]);

  if (!isOpen || !data) return null;

  const totalNetPay     = payslips.reduce((s, p) => s + parseFloat(p.net_pay         || 0), 0);
  const totalGross      = payslips.reduce((s, p) => s + parseFloat(p.gross_earnings  || 0), 0);
  const totalDeductions = payslips.reduce((s, p) => s + parseFloat(p.total_deductions|| 0), 0);
  const totalBonus      = payslips.reduce((s, p) => s + parseFloat(p.total_bonus     || 0), 0);
  const totalGratuity   = payslips.reduce((s, p) => s + parseFloat(p.gratuity_provision || 0), 0);
  const totalPF         = payslips.reduce((s, p) => s + parseFloat(p.pf_employee     || 0), 0);
  const totalPaid       = payslips.reduce((s, p) => s + parseFloat(p.paid_amount     || 0), 0);
  const totalBalance    = payslips.reduce((s, p) => s + parseFloat(p.balance_amount  || 0), 0);
  const lopCount        = payslips.filter((p) => parseFloat(p.lop_days || 0) > 0).length;
  const regularizedCount = payslips.filter((p) => p.is_regularized).length;
  const netPct = totalGross > 0 ? Math.max(0, Math.min(100, Math.round((totalNetPay / totalGross) * 100))) : 100;
  const paidPct = totalPaid + totalBalance > 0 ? Math.round((totalPaid / (totalPaid + totalBalance)) * 100) : 0;
  const lopPct = payslips.length ? Math.round((lopCount / payslips.length) * 100) : 0;
  const bonusStart = bonusTotal === 0 ? 0 : (bonusPage - 1) * BONUS_PAGE_SIZE + 1;
  const bonusEnd = Math.min(bonusPage * BONUS_PAGE_SIZE, bonusTotal);
  const bonusPageNumbers = [];
  for (let n = 1; n <= bonusTotalPages; n += 1) {
    if (n === 1 || n === bonusTotalPages || Math.abs(n - bonusPage) <= 1) bonusPageNumbers.push(n);
  }
  const totalsReady = !(loadingSlips && payslips.length === 0);

  const handlePaymentReleased = () => {
    setPayslipRefreshKey((k) => k + 1); // re-fetch payslips inside EmployeePayslip tab
    refreshRunStatus();
    onChanged && onChanged();
  };

  // ── Build react-select options for Regularization tab ───────────────────
  // Each option shows name + emp_id + department so duplicates are distinguishable
  const employeeOptions = payslips.map((p) => ({
    value:      p.employee,
    label:      p.employee_name,
    emp_id:     p.emp_id,
    department: p.department,
    month:      data.month,
    year:       data.year,
  }));

  const selectedPayslip = selectedRegEmp
    ? payslips.find((p) => String(p.employee) === String(selectedRegEmp.value))
    : null;

  const TABS = ["overview", "payslips", "bonus & gratuity"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1040,
        background: "var(--vz-secondary-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div className="prd-top">
        <div className="prd-top-main">
          <button data-testid="payroll-run-detail-back-button" type="button" className="prd-back" onClick={toggle} title="Back">
            <i className="ri-arrow-left-line"></i>
          </button>
          <span className="prd-top-icon">
            <i className="ri-bank-line"></i>
          </span>
          <div className="prd-top-text">
            <span className="prd-top-sub">Payroll run</span>
            <span className="prd-top-title">
              {MONTH_NAMES[data.month]} {data.year}
            </span>
          </div>
          <div className="prd-top-actions">
            <RunStatusActions
              run={{ ...data, status: runStatus }}
              onChanged={(nextStatus) => {
                if (typeof nextStatus === "string") setRunStatus(nextStatus);
                setPayslipRefreshKey((k) => k + 1);
                refreshRunStatus();
                onChanged && onChanged();
              }}
            />
            <RunPaymentActions
              run={{ ...data, status: runStatus }}
              payslips={payslips}
              payslipsLoading={loadingSlips}
              onReleased={handlePaymentReleased}
            />
          </div>
        </div>
        <button data-testid="payroll-run-detail-close-button" type="button" className="prd-close" onClick={toggle} aria-label="Close">
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* ── Body ── */}
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ minHeight: 0, overflow: "hidden" }}
      >
        {/* ── Tabs ── */}
        <div className="prd-tabs-row">
          <div className="prd-tabs" role="tablist">
            {TABS.map((tab) => {
              const meta = {
                overview: { icon: "ri-dashboard-line", label: "Overview" },
                payslips: { icon: "ri-file-list-3-line", label: "Payslips", count: payslips.length || null },
                "bonus & gratuity": { icon: "ri-award-line", label: "Bonus & Gratuity" },
              }[tab];
              return (
                <button
                  data-testid={testId("payroll-run-detail", itemTestKey(tab), "button")}
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`prd-tab ${activeTab === tab ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <i className={meta.icon}></i>
                  {meta.label}
                  {meta.count != null && <span className="prd-tab-count">{meta.count}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <TabContent
          activeTab={activeTab}
          className="flex-grow-1 d-flex flex-column"
          style={{ minHeight: 0, overflow: "hidden" }}
        >

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <TabPane tabId="overview" className="h-100" style={{ minHeight: 0, overflow: "auto" }}>
              <div className="prd-overview">
                {/* Hero */}
                <div className="prd-hero">
                  <div className="prd-hero-main">
                    <span className="prd-hero-cal">
                      <small>{(MONTH_NAMES[data.month] || "").slice(0, 3)}</small>
                      <b>{data.year}</b>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="prd-eyebrow">Pay period</div>
                      <div className="prd-hero-title">
                        {MONTH_NAMES[data.month]} {data.year}
                      </div>
                      <div className="prd-hero-meta">
                        <span>
                          <i className="ri-group-line"></i>
                          {loadingSlips ? "Loading employees…" : `${payslips.length} employee${payslips.length === 1 ? "" : "s"}`}
                        </span>
                        <StatusBadge scope="run" code={runStatus} />
                      </div>
                    </div>
                  </div>

                  <div className="prd-hero-net">
                    <div className="prd-eyebrow">Net payable</div>
                    <div className="prd-hero-amount">{loadingSlips ? "—" : `₹${fmt(totalNetPay)}`}</div>
                    <div className="prd-split" title={`Net ${netPct}% · Deductions ${100 - netPct}%`}>
                      <span className="is-net" style={{ width: `${netPct}%` }}></span>
                      <span className="is-ded" style={{ width: `${100 - netPct}%` }}></span>
                    </div>
                    <div className="prd-split-legend">
                      <span><i className="is-net"></i>Net {netPct}%</span>
                      <span><i className="is-ded"></i>Deductions {100 - netPct}%</span>
                      <span className="ms-auto">Gross ₹{fmt(totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="prd-steps">
                  {[
                    { label: "Processed", value: data.processed_at, icon: "ri-cpu-line" },
                    { label: "Approved", value: data.approved_at, icon: "ri-shield-check-line" },
                    { label: "Paid", value: data.paid_at, icon: "ri-bank-card-line" },
                  ].map((step, i, arr) => {
                    const done = !!step.value;
                    const nextDone = i < arr.length - 1 && !!arr[i + 1].value;
                    return (
                      <React.Fragment key={step.label}>
                        <div className={`prd-step ${done ? "is-done" : ""}`}>
                          <span className="prd-step-dot">
                            <i className={done ? "ri-check-line" : step.icon}></i>
                          </span>
                          <div>
                            <b>{step.label}</b>
                            <span>{done ? fmtDateTime(step.value) : "Pending"}</span>
                          </div>
                        </div>
                        {i < arr.length - 1 && <span className={`prd-step-line ${nextDone ? "is-done" : ""}`}></span>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* KPIs */}
                <div className="prd-kpis">
                  {[
                    { label: "Gross earnings", value: totalGross, icon: "ri-arrow-up-circle-line", tone: "success" },
                    { label: "Deductions", value: totalDeductions, icon: "ri-arrow-down-circle-line", tone: "danger" },
                    { label: "Net pay", value: totalNetPay, icon: "ri-wallet-3-line", tone: "primary" },
                    { label: "Balance due", value: totalBalance, icon: "ri-scales-3-line", tone: "warning" },
                  ].map((k, i) => (
                    <div key={k.label} className={`prd-kpi tone-${k.tone}`} style={{ "--i": i }}>
                      <span className="prd-kpi-icon"><i className={k.icon}></i></span>
                      <div>
                        <small>{k.label}</small>
                        <b>{loadingSlips ? "—" : `₹${fmt(k.value)}`}</b>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detail panels */}
                <div className="prd-panels">
                  <div className="prd-panel tone-warning">
                    <div className="prd-panel-head">
                      <span><i className="ri-group-line"></i></span>
                      People
                    </div>
                    <div className="prd-row">
                      <span>Employees</span>
                      <b>{loadingSlips ? "—" : payslips.length}</b>
                    </div>
                    <div className="prd-row">
                      <span><i className="ri-user-unfollow-line"></i> With LOP</span>
                      <b>{loadingSlips ? "—" : lopCount}</b>
                    </div>
                    <div className="prd-meter" title={`${lopPct}% of employees have LOP`}>
                      <span style={{ width: `${lopPct}%` }}></span>
                    </div>
                    <div className="prd-row">
                      <span><i className="ri-calendar-2-line"></i> Regularized</span>
                      <b>{loadingSlips ? "—" : regularizedCount}</b>
                    </div>
                  </div>

                  <div className="prd-panel tone-primary">
                    <div className="prd-panel-head">
                      <span><i className="ri-hand-coin-line"></i></span>
                      Settlement
                      <em>{paidPct}% paid</em>
                    </div>
                    <div className="prd-ring-wrap">
                      <svg viewBox="0 0 64 64" className="prd-ring">
                        <circle cx="32" cy="32" r="26" className="prd-ring-track" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="prd-ring-arc"
                          style={{ strokeDasharray: `${(paidPct / 100) * 163.36} 163.36` }}
                        />
                      </svg>
                      <div className="prd-ring-rows">
                        <div className="prd-row">
                          <span><i className="prd-dot is-paid"></i> Paid</span>
                          <b>{loadingSlips ? "—" : `₹${fmt(totalPaid)}`}</b>
                        </div>
                        <div className="prd-row">
                          <span><i className="prd-dot is-bal"></i> Balance</span>
                          <b>{loadingSlips ? "—" : `₹${fmt(totalBalance)}`}</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="prd-panel tone-danger">
                    <div className="prd-panel-head">
                      <span><i className="ri-safe-2-line"></i></span>
                      Statutory &amp; benefits
                    </div>
                    <div className="prd-row">
                      <span>PF (employee)</span>
                      <b>{loadingSlips ? "—" : `₹${fmt(totalPF)}`}</b>
                    </div>
                    <div className="prd-row">
                      <span>Bonus</span>
                      <b>{loadingSlips ? "—" : `₹${fmt(totalBonus)}`}</b>
                    </div>
                    <div className="prd-row">
                      <span>Gratuity provision</span>
                      <b>{loadingSlips ? "—" : `₹${fmt(totalGratuity)}`}</b>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className={`prd-remarks ${data.remarks ? "" : "is-empty"}`}>
                  <span className="prd-remarks-icon"><i className="ri-chat-quote-line"></i></span>
                  <div>
                    <div className="prd-eyebrow">Remarks</div>
                    <p>{data.remarks || "No remarks for this run."}</p>
                  </div>
                </div>
              </div>
            </TabPane>
          )}

          {/* ── Payslips ── */}
          {activeTab === "payslips" && (
            <TabPane tabId="payslips" className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
              <div className="p-4 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: "hidden" }}>
                <EmployeePayslip
                  payrollRunId={data?.id}
                  month={data.month}
                  year={data.year}
                  refreshKey={payslipRefreshKey}
                  runStatus={runStatus}
                  onPaymentReleased={handlePaymentReleased}
                  runTotals={{
                    ready: totalsReady,
                    gross: totalGross,
                    deductions: totalDeductions,
                    netPay: totalNetPay,
                    paid: totalPaid,
                    balance: totalBalance,
                  }}
                />
              </div>
            </TabPane>
          )}

          {/* ── Bonus & Gratuity ── */}
          {activeTab === "bonus & gratuity" && (
            <TabPane tabId="bonus & gratuity" className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
                <div className="d-flex flex-column h-100 p-4" style={{ minHeight: 0 }}>
                  <style>{`
                    .bonus-scroll {
                      overflow: auto;
                      min-height: 0;
                      flex: 1 1 auto;
                      scrollbar-width: thin;
                      scrollbar-color: rgba(var(--vz-primary-rgb), .35) var(--vz-tertiary-bg);
                    }
                    .bonus-scroll::-webkit-scrollbar { width: 8px; height: 10px; }
                    .bonus-scroll::-webkit-scrollbar-track { background: var(--vz-tertiary-bg); }
                    .bonus-scroll::-webkit-scrollbar-thumb {
                      background: rgba(var(--vz-primary-rgb), .35);
                      border-radius: 8px;
                      border: 2px solid var(--vz-tertiary-bg);
                    }
                    .bonus-scroll::-webkit-scrollbar-thumb:hover { background: var(--vz-primary); }
                    .bonus-scroll::-webkit-scrollbar-corner { background: var(--vz-tertiary-bg); }
                  `}</style>
                  <div className="d-flex flex-wrap gap-3 mb-3 flex-shrink-0">
                    {[
                      { label: "Total Statutory Bonus", val: payslips.reduce((s, p) => s + parseFloat(p.statutory_bonus || 0), 0), color: BONUS_COLORS.bonus },
                      { label: "Total Performance Bonus", val: payslips.reduce((s, p) => s + parseFloat(p.performance_bonus || 0), 0), color: BONUS_COLORS.perform },
                      { label: "Total Bonus Payout", val: totalBonus, color: BONUS_COLORS.total },
                      { label: "Total Gratuity (CTC)", val: totalGratuity, color: BONUS_COLORS.gratuity },
                      { label: "Bonus + Gratuity", val: totalBonus + totalGratuity, color: BONUS_COLORS.employee },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="text-center"
                        style={{
                          flex: "1 1 180px",
                          background: c.color.cell,
                          color: c.color.text,
                          borderTop: `3px solid ${c.color.border}`,
                          borderRadius: 8,
                          padding: "12px 14px",
                        }}
                      >
                        <p className="mb-1 text-uppercase fw-semibold" style={{ fontSize: 10, letterSpacing: "0.4px" }}>{c.label}</p>
                        <h5 className="mb-0 fw-bold">{totalsReady ? `₹${fmt(c.val)}` : "—"}</h5>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex align-items-center gap-3 flex-wrap mb-3 flex-shrink-0">
                    <div className="search-box" style={{ width: 240, height: 38 }}>
                      <Input
                        data-testid="payroll-run-detail-search-employee-name-or-input"
                        type="search"
                        className="form-control search"
                        style={{ height: 38, fontSize: 13 }}
                        placeholder="Search employee name or ID..."
                        value={bonusSearch}
                        onChange={(e) => setBonusSearch(e.target.value)}
                      />
                      <i className="ri-search-line search-icon"></i>
                    </div>
                    <div style={{ width: 220 }}>
                      <Select
                        testId="payroll-run-detail-filter-by-department"
                        options={departmentOptions}
                        value={bonusDepartment}
                        onChange={(val) => setBonusDepartment(val)}
                        isClearable
                        placeholder="Filter by department..."
                        classNamePrefix="select2-selection"
                        styles={bonusDeptSelectStyles}
                      />
                    </div>
                    {bonusDepartment && (
                      <Button
                        data-testid="payroll-run-detail-clear-department-button"
                        color="link"
                        size="sm"
                        className="text-muted p-0 text-decoration-none"
                        style={{ fontSize: 12 }}
                        onClick={() => setBonusDepartment(null)}
                      >
                        Clear department
                      </Button>
                    )}
                    <span className="text-muted ms-auto" style={{ fontSize: 12 }}>
                      {bonusTotal} employee{bonusTotal !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="bonus-scroll border rounded">
                    <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: "max-content", fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={bonusTh(BONUS_COLORS.employee, { left: 0, zIndex: 6, minWidth: 220, textAlign: "left", height: "auto", boxShadow: "4px 0 6px -4px rgba(15, 23, 42, 0.18)" })}>
                            Employee
                          </th>
                          <th colSpan={4} style={bonusTh(BONUS_COLORS.bonus, { borderLeft: `3px solid ${BONUS_COLORS.bonus.border}` })}>Bonus</th>
                          <th colSpan={3} style={bonusTh(BONUS_COLORS.gratuity, { borderLeft: `3px solid ${BONUS_COLORS.gratuity.border}` })}>Gratuity</th>
                          <th rowSpan={2} style={bonusTh(BONUS_COLORS.employee, { height: "auto", minWidth: 140, borderLeft: `3px solid ${BONUS_COLORS.employee.border}` })}>Bonus + Gratuity</th>
                        </tr>
                        <tr>
                          <th style={bonusSubTh(BONUS_COLORS.bonus, { borderLeft: `3px solid ${BONUS_COLORS.bonus.border}`, textAlign: "center" })}>Statutory Eligible</th>
                          <th style={bonusSubTh(BONUS_COLORS.bonus)}>Statutory Bonus</th>
                          <th style={bonusSubTh(BONUS_COLORS.perform)}>Performance Bonus</th>
                          <th style={bonusSubTh(BONUS_COLORS.total)}>Total Bonus</th>
                          <th style={bonusSubTh(BONUS_COLORS.gratuity, { borderLeft: `3px solid ${BONUS_COLORS.gratuity.border}`, textAlign: "center" })}>Eligible</th>
                          <th style={bonusSubTh(BONUS_COLORS.gratuity)}>Years of Service</th>
                          <th style={bonusSubTh(BONUS_COLORS.gratuity)}>Provision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bonusLoading ? (
                          <tr>
                            <td colSpan={9} className="py-3">
                              <TableSkeletonBlock rows={5} cols={9} head={false} testId="payroll-run-bonus-loading-skeleton" label="Loading bonus details" />
                            </td>
                          </tr>
                        ) : bonusRows.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-4 text-muted">
                              {bonusSearch || bonusDepartment ? "No employees match this search." : "No payslips generated for this run."}
                            </td>
                          </tr>
                        ) : bonusRows.map((slip, i) => (
                          <tr key={slip.id || i}>
                            <td style={bonusTd(BONUS_COLORS.employee, { position: "sticky", left: 0, zIndex: 2, textAlign: "left", minWidth: 220, background: "var(--vz-secondary-bg)", boxShadow: "4px 0 6px -4px rgba(15, 23, 42, 0.18)" })}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--vz-body-color)" }}>{slip.employee_name}</div>
                              <div style={{ fontSize: 11, color: "var(--vz-secondary-color)" }}>
                                {slip.emp_id}
                                {slip.department && <span className="ms-1">· {slip.department}</span>}
                              </div>
                            </td>
                            <td style={bonusTd(BONUS_COLORS.bonus, { textAlign: "center", fontWeight: 600 })}>
                              {slip.is_statutory_bonus_eligible ? "Yes" : "No"}
                            </td>
                            <td style={bonusTd(BONUS_COLORS.bonus)}>₹{fmt(slip.statutory_bonus)}</td>
                            <td style={bonusTd(BONUS_COLORS.perform)}>₹{fmt(slip.performance_bonus)}</td>
                            <td style={bonusTd(BONUS_COLORS.total, { fontWeight: 800 })}>₹{fmt(slip.total_bonus)}</td>
                            <td style={bonusTd(BONUS_COLORS.gratuity, { textAlign: "center", fontWeight: 600 })}>
                              {slip.is_gratuity_eligible ? "Yes" : "Provisioning"}
                            </td>
                            <td style={bonusTd(BONUS_COLORS.gratuity, { textAlign: "center" })}>
                              {slip.gratuity_years_of_service || "—"} yrs
                            </td>
                            <td style={bonusTd(BONUS_COLORS.gratuity, { fontWeight: 700 })}>₹{fmt(slip.gratuity_provision)}</td>
                            <td style={bonusTd(BONUS_COLORS.employee, { fontWeight: 800, background: BONUS_COLORS.employee.cell })}>
                              ₹{fmt(parseFloat(slip.total_bonus || 0) + parseFloat(slip.gratuity_provision || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 flex-shrink-0">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Showing <span className="fw-semibold">{bonusStart}</span> to{" "}
                      <span className="fw-semibold">{bonusEnd}</span> of{" "}
                      <span className="fw-semibold">{bonusTotal}</span>
                    </div>
                    {bonusTotalPages > 1 && (
                      <ul className="pagination pagination-separated pagination-sm mb-0">
                        <li className={bonusPage <= 1 || bonusLoading ? "page-item disabled" : "page-item"}>
                          <button data-testid="payroll-run-detail-previous-button" type="button" className="page-link" disabled={bonusPage <= 1 || bonusLoading} onClick={() => setBonusPage(bonusPage - 1)}>
                            Previous
                          </button>
                        </li>
                        {bonusPageNumbers.map((n, idx) => {
                          const prev = bonusPageNumbers[idx - 1];
                          const gap = prev && n - prev > 1;
                          return (
                            <React.Fragment key={n}>
                              {gap && (
                                <li className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              )}
                              <li className="page-item">
                                <button
                                  data-testid={testId("payroll-run-detail", itemTestKey(n), "button")}
                                  type="button"
                                  className={n === bonusPage ? "page-link active" : "page-link"}
                                  disabled={bonusLoading}
                                  onClick={() => setBonusPage(n)}
                                >
                                  {n}
                                </button>
                              </li>
                            </React.Fragment>
                          );
                        })}
                        <li className={bonusPage >= bonusTotalPages || bonusLoading ? "page-item disabled" : "page-item"}>
                          <button data-testid="payroll-run-detail-next-button" type="button" className="page-link" disabled={bonusPage >= bonusTotalPages || bonusLoading} onClick={() => setBonusPage(bonusPage + 1)}>
                            Next
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
            </TabPane>
          )}

        </TabContent>
      </div>
    </div>
  );
};

export default PayrollRunDetails;
