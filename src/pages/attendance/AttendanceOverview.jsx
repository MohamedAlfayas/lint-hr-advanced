import React, { useMemo } from "react";
import { Card, CardBody } from "reactstrap";
import CountUp from "react-countup";
import { AttendanceOverviewChart } from "./AttendanceOverviewChart";
import { useSelector } from "react-redux";

const STATS = [
  { key: "wsHours", label: "Work Schedule", icon: "ri-calendar-check-line", tone: "primary" },
  { key: "checkInHours", label: "Check In Hours", icon: "ri-login-circle-line", tone: "success" },
  { key: "otHours", label: "OT Hours", icon: "ri-timer-line", tone: "warning" },
  { key: "paidHours", label: "Paid Hours", icon: "ri-wallet-3-line", tone: "info" },
  { key: "leaveHours", label: "Leave Hours", icon: "ri-calendar-event-line", tone: "danger" },
  { key: "balanceHours", label: "Balance Hours", icon: "ri-scales-3-line", tone: "secondary" },
];

const HoursValue = ({ seconds }) => {
  if (!seconds) return <>0 Hr</>;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return (
    <>
      <CountUp start={0} end={hours} suffix=" Hr" separator="" duration={2} />
      {minutes > 0 && (
        <>
          {" "}
          <CountUp start={0} end={minutes} suffix=" Min" separator="" duration={2} />
        </>
      )}
    </>
  );
};

const fmtNum = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 100) / 100);
};

const fmtHours = (value) => {
  const totalMin = Math.round((Number(value) || 0) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (!h && !m) return "0 Hr";
  return [h ? `${h} Hr` : "", m ? `${m} Min` : ""].filter(Boolean).join(" ");
};

const SummaryStrip = ({ summary }) => {
  const percentage = Math.max(0, Math.min(100, Number(summary.percentage) || 0));
  const pending = Number(summary.pending_attendance_count) || 0;
  const leaves = Number(summary.leaves_taken) || 0;

  return (
    <div className="ao-summary">
      <div className="ao-sum ao-success">
        <span className="ao-stat-icon">
          <i className="ri-user-follow-line" />
        </span>
        <div className="ao-stat-text flex-grow-1">
          <div className="ao-stat-label">Present Days</div>
          <div className="ao-sum-value">
            {fmtNum(summary.total_count)}
            <span className="ao-sum-of"> / {fmtNum(summary.total_days_in_month)}</span>
          </div>
          <div className="ao-progress">
            <span style={{ width: `${percentage}%` }} />
          </div>
          <div className="ao-sum-hint">{fmtNum(percentage)}% attendance</div>
        </div>
      </div>

      <div className="ao-sum ao-danger">
        <span className="ao-stat-icon">
          <i className="ri-calendar-2-line" />
        </span>
        <div className="ao-stat-text">
          <div className="ao-stat-label">Leaves Taken</div>
          <div className="ao-sum-value">
            {fmtNum(leaves)}
            <span className="ao-sum-of"> {leaves === 1 ? "day" : "days"}</span>
          </div>
          <div className="ao-sum-hint">This period</div>
        </div>
      </div>

      <div className="ao-sum ao-warning">
        <span className="ao-stat-icon">
          <i className="ri-door-open-line" />
        </span>
        <div className="ao-stat-text">
          <div className="ao-stat-label">Permission Hours</div>
          <div className="ao-sum-value">{fmtHours(summary.permission_hours_taken)}</div>
          <div className="ao-sum-hint">Taken this period</div>
        </div>
      </div>

      <div className={`ao-sum ao-info ${pending > 0 ? "is-alert" : ""}`}>
        <span className="ao-stat-icon">
          <i className="ri-error-warning-line" />
        </span>
        <div className="ao-stat-text">
          <div className="ao-stat-label">Pending Attendance</div>
          <div className="ao-sum-value">{fmtNum(pending)}</div>
          <div className="ao-sum-hint">
            {pending > 0 ? "Needs regularisation" : "All up to date"}
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceOverview = () => {
  const { chartData, chartInfo, attendanceSummary, attendanceMonth } =
    useSelector((state) => state.AttendanceReportReducer);

  const monthLabel = useMemo(() => {
    const [y, m] = String(attendanceMonth || "").split("-").map(Number);
    const date = y && m ? new Date(y, m - 1, 1) : new Date();
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }, [attendanceMonth]);

  const chartDataMemoized = useMemo(() => chartData, [chartData]);

  return (
    <div className="attendance-overview-wrap w-100">
      <Card className="attendance-overview-card h-100">
        <CardBody className="p-3 pb-2">
          <div className="ao-head">
            <h6 className="mb-0 fw-semibold">Attendance Overview</h6>
            <span className="ao-month">
              <i className="ri-calendar-line" />
              {monthLabel}
            </span>
          </div>

          {attendanceSummary && <SummaryStrip summary={attendanceSummary} />}

          <div className="ao-stats">
            {STATS.map((stat) => (
              <div key={stat.key} className={`ao-stat ao-${stat.tone}`}>
                <span className="ao-stat-icon">
                  <i className={stat.icon} />
                </span>
                <div className="ao-stat-text">
                  <div className="ao-stat-value">
                    <HoursValue seconds={chartInfo?.[stat.key]} />
                  </div>
                  <div className="ao-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div dir="ltr" className="apex-charts mt-2">
            <AttendanceOverviewChart
              dataColors='["--vz-success", "--vz-orange", "--vz-info", "--vz-danger", "--vz-primary", "--vz-danger","#00FFFF" ,"#8E44AD","#ADD8E6"]'
              chartData={chartDataMemoized}
            />
          </div>
        </CardBody>
      </Card>
      <style>{`
        .attendance-overview-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          margin-bottom: 1.5rem;
        }
        .attendance-overview-card {
          flex: 1 1 auto;
          width: 100%;
          margin-bottom: 0 !important;
          container: ao-card / inline-size;
        }
        .ao-head { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
        .ao-stats {
          display:grid; gap:10px;
          grid-template-columns:repeat(2, minmax(0, 1fr));
        }
        @container ao-card (min-width: 620px) { .ao-stats { grid-template-columns:repeat(3, minmax(0, 1fr)); } }
        @container ao-card (min-width: 1100px) { .ao-stats { grid-template-columns:repeat(6, minmax(0, 1fr)); } }
        @container ao-card (max-width: 300px) { .ao-stats { grid-template-columns:minmax(0, 1fr); } }
        .ao-stat {
          display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
          border:1px solid var(--vz-border-color); background:var(--vz-tertiary-bg);
          border-left:3px solid var(--ao-c); min-width:0;
        }
        @container ao-card (max-width: 420px) {
          .ao-stat { gap:8px; padding:9px 10px; }
          .ao-stat .ao-stat-icon { width:30px; height:30px; flex-basis:30px; font-size:15px; border-radius:8px; }
          .ao-stat-value { font-size:13.5px; }
        }
        .ao-stat-icon {
          width:36px; height:36px; flex:0 0 36px; border-radius:10px; font-size:18px;
          display:inline-flex; align-items:center; justify-content:center;
          color:var(--ao-c); background:rgba(var(--ao-rgb), .12);
        }
        .ao-stat-text { min-width:0; flex:1 1 auto; }
        .ao-stat-value {
          font-size:15px; font-weight:700; line-height:1.3; font-variant-numeric:tabular-nums;
          color:var(--vz-heading-color, var(--vz-body-color));
        }
        .ao-stat-value > span { white-space:nowrap; }
        .ao-stat-label { font-size:11.5px; line-height:1.25; color:var(--vz-secondary-color); overflow-wrap:anywhere; }
        .ao-month {
          display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px;
          font-size:12.5px; font-weight:600; white-space:nowrap;
          color:var(--vz-primary); background:rgba(var(--vz-primary-rgb), .1);
        }
        .ao-month i { font-size:14px; }
        .ao-summary {
          display:grid; gap:10px; margin-bottom:10px;
          grid-template-columns:repeat(2, minmax(0, 1fr));
        }
        @container ao-card (min-width: 900px) { .ao-summary { grid-template-columns:repeat(4, minmax(0, 1fr)); } }
        @container ao-card (max-width: 340px) { .ao-summary { grid-template-columns:minmax(0, 1fr); } }
        @container ao-card (max-width: 480px) {
          .ao-sum { gap:10px; padding:10px 12px; }
          .ao-sum .ao-stat-icon { width:32px; height:32px; flex-basis:32px; font-size:16px; }
          .ao-sum-value { font-size:18px; }
        }
        .ao-sum .ao-stat-label { font-size:12px; }
        .ao-sum {
          display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border-radius:12px; min-width:0;
          border:1px solid rgba(var(--ao-rgb), .25); background:rgba(var(--ao-rgb), .07);
        }
        .ao-sum.ao-info:not(.is-alert) { border-color:var(--vz-border-color); background:var(--vz-tertiary-bg); }
        .ao-sum-value {
          font-size:20px; font-weight:700; line-height:1.25; white-space:nowrap; font-variant-numeric:tabular-nums;
          color:var(--vz-heading-color, var(--vz-body-color));
        }
        .ao-sum-of { font-size:13px; font-weight:500; color:var(--vz-secondary-color); }
        .ao-sum-hint { font-size:11.5px; line-height:1.3; color:var(--vz-secondary-color); }
        .ao-sum.is-alert .ao-sum-hint { color:var(--ao-c); font-weight:500; }
        .ao-progress { height:5px; border-radius:999px; margin:6px 0 4px; background:rgba(var(--ao-rgb), .15); overflow:hidden; }
        .ao-progress > span { display:block; height:100%; border-radius:inherit; background:var(--ao-c); transition:width .6s ease; }
        .ao-primary { --ao-c:var(--vz-primary); --ao-rgb:var(--vz-primary-rgb); }
        .ao-success { --ao-c:var(--vz-success); --ao-rgb:var(--vz-success-rgb); }
        .ao-warning { --ao-c:var(--vz-warning); --ao-rgb:var(--vz-warning-rgb); }
        .ao-info { --ao-c:var(--vz-info); --ao-rgb:var(--vz-info-rgb); }
        .ao-danger { --ao-c:var(--vz-danger); --ao-rgb:var(--vz-danger-rgb); }
        .ao-secondary { --ao-c:var(--vz-secondary-color); --ao-rgb:135,138,153; }
      `}</style>
    </div>
  );
};

export default AttendanceOverview;
