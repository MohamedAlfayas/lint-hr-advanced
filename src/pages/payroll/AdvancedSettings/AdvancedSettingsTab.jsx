import React, { useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

import PayrollSettings from "./PayrollSettings";
import PFSettings from "./PFSettings";
import ESISettings from "./ESISettings";
import PTSettings from "./PTSettings";
import AttendancePolicySettings from "./Attendancepolicysettings";
import LeavePolicySettings from "./LeavePolicySettings";
import LopPolicySettings from "./LopPolicySettings";
import OvertimePolicySettings from "./OvertimePolicySettings";
import BonusPolicySettings from "./BonusPolicySettings";
import GratuityPolicySettings from "./GratuityPolicySettings";
import ReimbursementPolicySettings from "./ReimbursementpolicySettings";
import LeaveCreditPolicySettings from "./LeaveCreditPolicySettings";
import IncomeTaxPolicySettings from "./IncomeTaxPolicySettings";
import ProbationPolicySettings from "./ProbationPolicySettings";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const POLICY_GROUPS = [
  {
    title: "Payroll & Statutory",
    items: [
      { id: "1", label: "Payroll Settings", hint: "Pay cycle & salary basis", icon: "ri-settings-4-line", tone: "primary", Component: PayrollSettings },
      { id: "2", label: "PF Settings", hint: "Provident fund contribution", icon: "ri-safe-2-line", tone: "info", Component: PFSettings },
      { id: "3", label: "ESI Settings", hint: "Employee state insurance", icon: "ri-heart-pulse-line", tone: "danger", Component: ESISettings },
      { id: "4", label: "Professional Tax", hint: "State-wise PT slabs", icon: "ri-government-line", tone: "warning", Component: PTSettings },
      { id: "13", label: "Income Tax", hint: "Regimes, slabs & surcharge", icon: "ri-percent-line", tone: "success", Component: IncomeTaxPolicySettings },
    ],
  },
  {
    title: "Attendance & Leave",
    items: [
      { id: "5", label: "Attendance Policy", hint: "Half day & late rules", icon: "ri-time-line", tone: "primary", Component: AttendancePolicySettings },
      { id: "6", label: "Leave Policy", hint: "Balance & LOP rules", icon: "ri-calendar-todo-line", tone: "info", Component: LeavePolicySettings },
      { id: "7", label: "Leave Credit", hint: "Accrual & carry forward", icon: "ri-calendar-2-line", tone: "success", Component: LeaveCreditPolicySettings },
      { id: "8", label: "LOP Policy", hint: "Loss of pay calculation", icon: "ri-calendar-event-line", tone: "danger", Component: LopPolicySettings },
      { id: "9", label: "Overtime Policy", hint: "OT eligibility & multipliers", icon: "ri-timer-flash-line", tone: "warning", Component: OvertimePolicySettings },
      { id: "14", label: "Probation Policy", hint: "Duration & confirmation", icon: "ri-user-follow-line", tone: "primary", Component: ProbationPolicySettings },
    ],
  },
  {
    title: "Benefits",
    items: [
      { id: "10", label: "Bonus Policy", hint: "Statutory bonus rules", icon: "ri-gift-line", tone: "success", Component: BonusPolicySettings },
      { id: "11", label: "Gratuity Policy", hint: "Eligibility & formula", icon: "ri-hand-coin-line", tone: "info", Component: GratuityPolicySettings },
      { id: "12", label: "Reimbursement", hint: "Claim limits & approval", icon: "ri-refund-2-line", tone: "warning", Component: ReimbursementPolicySettings },
    ],
  },
];

const ALL_POLICIES = POLICY_GROUPS.flatMap((g) => g.items);

// Remixicon codepoints for each item's icon; CSS pseudo-elements cannot use the class name.
const ICON_GLYPHS = {
  "ri-settings-4-line": "f0e8",
  "ri-safe-2-line": "f0a9",
  "ri-heart-pulse-line": "ee11",
  "ri-government-line": "edd9",
  "ri-percent-line": "efe6",
  "ri-time-line": "f20f",
  "ri-calendar-todo-line": "eb29",
  "ri-calendar-2-line": "eb21",
  "ri-calendar-event-line": "eb25",
  "ri-timer-flash-line": "f214",
  "ri-user-follow-line": "f261",
  "ri-gift-line": "edbb",
  "ri-hand-coin-line": "edf1",
  "ri-refund-2-line": "f066",
};

const paneStyle = ({ icon, tone }) => ({
  "--pol-glyph": `"\\${ICON_GLYPHS[icon] || "f100"}"`,
  "--pol-tone": `var(--vz-${tone}-rgb)`,
});

const AdvancedSettingsTab = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [mountedTabs, setMountedTabs] = useState({ 1: true });
  const [search, setSearch] = useState("");

  const toggleTab = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setMountedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
  };

  const query = search.trim().toLowerCase();
  const groups = POLICY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) => !query || i.label.toLowerCase().includes(query) || i.hint.toLowerCase().includes(query),
    ),
  })).filter((g) => g.items.length);

  return (
    <div className="pol-scope">
      <aside className="pol-side">
        <div className="pol-search">
          <i className="ri-search-line" />
          <input
            data-testid="payroll-advanced-settings-search-policies-input"
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button data-testid="payroll-advanced-settings-clear-button" type="button" onClick={() => setSearch("")} aria-label="Clear">
              <i className="ri-close-line" />
            </button>
          )}
        </div>

        <div className="pol-side-list">
          {groups.length === 0 && <div className="pol-side-empty">No policies match "{search}"</div>}
          {groups.map((group) => (
            <div key={group.title} className="pol-group">
              <div className="pol-group-title">
                {group.title}
                <span>{group.items.length}</span>
              </div>
              {group.items.map((item) => (
                <button
                  data-testid={testId("payroll-advanced-settings-next", itemTestKey(item), "button")}
                  key={item.id}
                  type="button"
                  className={classnames("pol-item", `tone-${item.tone}`, { active: activeTab === item.id })}
                  onClick={() => toggleTab(item.id)}
                >
                  <span className="pol-item-icon">
                    <i className={item.icon} />
                  </span>
                  <span className="pol-item-text">
                    <span className="pol-item-label">{item.label}</span>
                    <span className="pol-item-hint">{item.hint}</span>
                  </span>
                  <i className="ri-arrow-right-s-line pol-item-arrow" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className="pol-content">
        <TabContent activeTab={activeTab}>
          {ALL_POLICIES.map((item) =>
            mountedTabs[item.id] ? (
              <TabPane key={item.id} tabId={item.id} style={paneStyle(item)}>
                <item.Component />
              </TabPane>
            ) : null,
          )}
        </TabContent>
      </section>

      <style>{`
        .pol-scope { display:grid; grid-template-columns:270px minmax(0,1fr); gap:20px; align-items:start; }
        @media (max-width: 991.98px) { .pol-scope { grid-template-columns:1fr; } }

        /* ── Sidebar ── */
        .pol-side {
          position:sticky; top:80px; border:1px solid var(--vz-border-color); border-radius:14px;
          background:var(--vz-secondary-bg); overflow:hidden;
        }
        .pol-search {
          display:flex; align-items:center; gap:8px; margin:12px; padding:0 10px; height:38px; border-radius:10px;
          background:var(--vz-tertiary-bg); border:1px solid transparent; color:var(--vz-secondary-color);
          transition:border-color .15s ease;
        }
        .pol-search:focus-within { border-color:rgba(var(--vz-primary-rgb), .5); }
        .pol-search input { flex:1; min-width:0; border:0; outline:0; background:transparent; font-size:13px; color:var(--vz-body-color); }
        .pol-search input::placeholder { color:var(--vz-secondary-color); }
        .pol-search button { border:0; background:transparent; color:var(--vz-secondary-color); padding:0; display:flex; }
        .pol-side-list { max-height:calc(100vh - 220px); overflow-y:auto; padding:0 10px 10px; }
        .pol-side-empty { padding:24px 8px; text-align:center; font-size:13px; color:var(--vz-secondary-color); }
        .pol-group + .pol-group { margin-top:8px; padding-top:8px; border-top:1px dashed var(--vz-border-color); }
        .pol-group-title {
          display:flex; align-items:center; justify-content:space-between; padding:6px 8px;
          font-size:10.5px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; color:var(--vz-secondary-color);
        }
        .pol-group-title span {
          min-width:20px; height:18px; padding:0 6px; border-radius:999px; font-size:10px;
          display:inline-flex; align-items:center; justify-content:center; background:var(--vz-tertiary-bg);
        }
        .pol-item {
          --tone: var(--vz-primary-rgb);
          display:flex; align-items:center; gap:10px; width:100%; padding:8px; margin-bottom:2px; border:0;
          border-radius:10px; background:transparent; text-align:left; transition:background .15s ease;
        }
        .pol-item.tone-info { --tone: var(--vz-info-rgb); }
        .pol-item.tone-success { --tone: var(--vz-success-rgb); }
        .pol-item.tone-warning { --tone: var(--vz-warning-rgb); }
        .pol-item.tone-danger { --tone: var(--vz-danger-rgb); }
        .pol-item:hover { background:var(--vz-tertiary-bg); }
        .pol-item.active { background:rgba(var(--vz-primary-rgb), .1); box-shadow:inset 3px 0 0 var(--vz-primary); }
        .pol-item-icon {
          width:34px; height:34px; flex:0 0 34px; border-radius:10px; font-size:17px;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(var(--tone), .12); color:rgb(var(--tone));
        }
        .pol-item.active .pol-item-icon { background:rgb(var(--tone)); color:#fff; box-shadow:0 4px 10px rgba(var(--tone), .3); }
        .pol-item-text { display:flex; flex-direction:column; min-width:0; flex:1; }
        .pol-item-label {
          font-size:13px; font-weight:600; color:var(--vz-heading-color, var(--vz-body-color));
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .pol-item.active .pol-item-label { color:var(--vz-primary); }
        .pol-item-hint { font-size:11.5px; color:var(--vz-secondary-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pol-item-arrow { color:var(--vz-secondary-color); opacity:0; transition:opacity .15s ease, transform .15s ease; }
        .pol-item:hover .pol-item-arrow, .pol-item.active .pol-item-arrow { opacity:1; transform:translateX(2px); }
        .pol-item.active .pol-item-arrow { color:var(--vz-primary); }

        /* ── Policy cards (shared by every tab) ── */
        .pol-content { min-width:0; }
        .pol-scope .card {
          border:1px solid var(--vz-border-color); border-radius:14px; overflow:hidden; margin-bottom:0;
          background:var(--vz-secondary-bg); box-shadow:0 4px 18px rgba(15,23,42,.05);
        }
        .pol-scope .card-header,
        .pol-scope .card-header.bg-light {
          position:relative; padding:18px 22px 18px 72px; min-height:76px;
          display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
          background:linear-gradient(120deg, rgba(var(--vz-primary-rgb), .10) 0%, rgba(var(--vz-info-rgb), .05) 60%, transparent 100%) !important;
          border-bottom:1px solid var(--vz-border-color);
        }
        .pol-scope .card-header::before {
          content:var(--pol-glyph, "\\f100"); font-family:"remixicon" !important; font-style:normal; position:absolute; left:22px; top:50%; transform:translateY(-50%);
          width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:19px;
          background:rgb(var(--pol-tone, var(--vz-primary-rgb))); color:#fff;
          box-shadow:0 6px 14px rgba(var(--pol-tone, var(--vz-primary-rgb)), .32);
        }
        .pol-scope .tab-pane .card-header,
        .pol-scope .tab-pane .card-header.bg-light {
          background:linear-gradient(120deg, rgba(var(--pol-tone, var(--vz-primary-rgb)), .12) 0%, rgba(var(--pol-tone, var(--vz-primary-rgb)), .04) 55%, transparent 100%) !important;
        }
        .pol-scope .card-header .card-title { font-size:16.5px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); }
        .pol-scope .card-header .card-subtitle { color:var(--vz-secondary-color) !important; font-size:12.5px !important; }
        .pol-scope .card-header .btn { border-radius:8px; font-weight:500; }
        .pol-scope .card-header .btn-outline-primary {
          background:rgba(var(--vz-primary-rgb), .1); border-color:transparent; color:var(--vz-primary);
        }
        .pol-scope .card-header .btn-outline-primary:hover { background:var(--vz-primary); color:#fff; }
        .pol-scope .card-header .btn-outline-success {
          background:rgba(var(--vz-success-rgb), .1); border-color:transparent; color:var(--vz-success);
        }
        .pol-scope .card-header .btn-outline-success:hover { background:var(--vz-success); color:#fff; }
        .pol-scope .card-body { padding:22px !important; }

        .pol-scope .bg-light { background-color:var(--vz-tertiary-bg) !important; }
        .pol-scope .text-dark { color:var(--vz-body-color) !important; }
        .pol-scope .badge.bg-light {
          background:var(--vz-tertiary-bg) !important; border-color:var(--vz-border-color) !important;
          font-weight:600; border-radius:6px;
        }
        .pol-scope .card-body > .d-flex.flex-wrap > .badge {
          border-radius:999px; padding:6px 14px !important; transition:all .15s ease;
        }
        .pol-scope .card-body > .d-flex.flex-wrap > .badge.bg-primary { box-shadow:0 4px 10px rgba(var(--vz-primary-rgb), .3); }

        .pol-scope .table { color:var(--vz-body-color); border-color:var(--vz-border-color); margin-bottom:0; }
        .pol-scope .table-light,
        .pol-scope .table-light th,
        .pol-scope .table-light td {
          --vz-table-bg:var(--vz-tertiary-bg); --bs-table-bg:var(--vz-tertiary-bg);
          background-color:var(--vz-tertiary-bg) !important; color:var(--vz-secondary-color) !important;
          border-color:var(--vz-border-color) !important; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px;
        }

        .pol-scope .avatar-title.bg-light {
          background:rgba(var(--vz-primary-rgb), .1) !important; color:var(--vz-primary) !important;
        }

        .pol-scope .card-body .border.rounded {
          border-radius:12px !important; border-color:var(--vz-border-color) !important; overflow:hidden;
          background:var(--vz-secondary-bg);
        }
        .pol-scope .card-body .border.rounded > .row { padding-top:12px !important; padding-bottom:12px !important; transition:background .15s ease; }
        .pol-scope .card-body .border.rounded > .row:hover { background:rgba(var(--vz-primary-rgb), .035); }
        .pol-scope .card-body .border.rounded > .row label { color:var(--vz-body-color) !important; font-weight:500; }
        .pol-scope .border-bottom, .pol-scope .border-top, .pol-scope .border { border-color:var(--vz-border-color) !important; }

        .pol-scope p.text-uppercase.fw-semibold {
          display:flex; align-items:center; gap:8px; margin-bottom:10px !important;
          color:var(--vz-heading-color, var(--vz-body-color)) !important; font-size:11.5px !important;
        }
        .pol-scope p.text-uppercase.fw-semibold::before {
          content:""; width:4px; height:14px; border-radius:2px; background:var(--vz-primary);
        }

        .pol-scope .alert-success,
        .pol-scope .alert-secondary { border-radius:12px; padding:12px 16px !important; font-size:13px; }
        .pol-scope .alert-success {
          background:rgba(var(--vz-success-rgb), .1); border:1px solid rgba(var(--vz-success-rgb), .25); color:var(--vz-success);
        }
        .pol-scope .alert-secondary {
          background:var(--vz-tertiary-bg); border:1px solid var(--vz-border-color); color:var(--vz-secondary-color);
        }
        .pol-scope .card-body > .d-flex.justify-content-end.border-top {
          margin:8px -22px -22px; padding:14px 22px !important; background:var(--vz-tertiary-bg);
        }
        .pol-scope .btn-light.border {
          background:var(--vz-secondary-bg); color:var(--vz-body-color); border-color:var(--vz-border-color) !important;
        }
        .pol-scope .form-control, .pol-scope .form-select { border-radius:8px; }

        /* ── Section headings: accent pill + divider line ── */
        .pol-scope p.text-uppercase.fw-semibold {
          margin:6px 0 12px !important; letter-spacing:.8px !important;
        }
        .pol-scope p.text-uppercase.fw-semibold::before {
          width:8px; height:8px; border-radius:3px; background:rgb(var(--pol-tone, var(--vz-primary-rgb)));
          box-shadow:0 0 0 4px rgba(var(--pol-tone, var(--vz-primary-rgb)), .15);
        }
        .pol-scope p.text-uppercase.fw-semibold::after {
          content:""; flex:1; height:1px; margin-left:6px;
          background:linear-gradient(90deg, var(--vz-border-color), transparent);
        }

        /* ── Setting groups: raised panels with label / value columns ── */
        .pol-scope .card-body .border.rounded:not(.p-3) {
          background:var(--vz-secondary-bg); box-shadow:0 1px 3px rgba(15,23,42,.04);
        }
        .pol-scope .card-body .border.rounded:not(.p-3) > .row { padding-left:18px !important; padding-right:18px !important; min-height:52px; }
        .pol-scope .card-body .border.rounded:not(.p-3) > .row > [class*="col-"]:first-child label {
          display:inline-flex; align-items:center; gap:8px; font-size:13px !important;
          color:var(--vz-secondary-color) !important; font-weight:500;
        }
        .pol-scope .card-body .border.rounded:not(.p-3) > .row > [class*="col-"]:first-child label::before {
          content:""; width:5px; height:5px; border-radius:50%; flex-shrink:0;
          background:rgba(var(--pol-tone, var(--vz-primary-rgb)), .55);
        }
        .pol-scope .card-body .border.rounded:not(.p-3) > .row > [class*="col-"]:last-child {
          font-weight:600; color:var(--vz-heading-color, var(--vz-body-color));
        }
        .pol-scope .card-body .border.rounded:not(.p-3) > .row:nth-child(even) { background:rgba(var(--vz-secondary-rgb), .025); }

        /* ── Summary tiles (bordered p-3 boxes) ── */
        .pol-scope .card-body .border.rounded.p-3.h-100 {
          position:relative; overflow:hidden; padding:16px 18px !important; border-radius:12px !important;
          background:linear-gradient(135deg, rgba(var(--tile, var(--vz-primary-rgb)), .1), rgba(var(--tile, var(--vz-primary-rgb)), .02)) !important;
          border-color:rgba(var(--tile, var(--vz-primary-rgb)), .22) !important;
          transition:transform .15s ease, box-shadow .15s ease;
        }
        .pol-scope .card-body .border.rounded.p-3.h-100:hover { transform:translateY(-2px); box-shadow:0 8px 18px rgba(var(--tile, var(--vz-primary-rgb)), .14); }
        .pol-scope .card-body .border.rounded.p-3.h-100::before {
          content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:rgb(var(--tile, var(--vz-primary-rgb)));
        }
        .pol-scope .card-body .row > [class*="col"]:nth-child(4n+1) > .border.rounded.p-3.h-100 { --tile: var(--vz-primary-rgb); }
        .pol-scope .card-body .row > [class*="col"]:nth-child(4n+2) > .border.rounded.p-3.h-100 { --tile: var(--vz-info-rgb); }
        .pol-scope .card-body .row > [class*="col"]:nth-child(4n+3) > .border.rounded.p-3.h-100 { --tile: var(--vz-success-rgb); }
        .pol-scope .card-body .row > [class*="col"]:nth-child(4n+4) > .border.rounded.p-3.h-100 { --tile: var(--vz-warning-rgb); }
        .pol-scope .card-body .border.rounded.p-3.h-100 > p:first-child {
          font-size:10.5px !important; font-weight:700; letter-spacing:.7px !important; color:var(--vz-secondary-color) !important;
          margin-bottom:6px !important;
        }
        .pol-scope .card-body .border.rounded.p-3.h-100 > p:last-child,
        .pol-scope .card-body .border.rounded.p-3.h-100 .fw-semibold {
          font-size:19px !important; font-weight:700 !important; color:rgb(var(--tile, var(--vz-primary-rgb)));
        }

        /* ── Status banner ── */
        .pol-scope .alert-success i, .pol-scope .alert-secondary i {
          width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
          background:rgba(var(--vz-success-rgb), .15);
        }
        .pol-scope .alert-secondary i { background:var(--vz-secondary-bg); }
        .pol-scope .alert .badge { border-radius:999px; padding:4px 10px; }
      `}</style>
    </div>
  );
};

export default AdvancedSettingsTab;
