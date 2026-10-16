import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { useSelector } from "react-redux";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import WebCheckInOut from "../../component/common/timer/WebCheckInOut";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

defineElement(loadAnimation);

const pad = (n) => String(n).padStart(2, "0");

const timeParts = (seconds = 0) => [
  pad(Math.floor(seconds / 3600)),
  pad(Math.floor((seconds % 3600) / 60)),
  pad(Math.floor(seconds % 60)),
];

// Poppins has proportional digits, so each digit gets a fixed-width slot to keep the clock from jittering.
const Digits = ({ value }) =>
  String(value)
    .split("")
    .map((d, i) => (
      <span key={i} className="tt-d">
        {d}
      </span>
    ));

const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
};

const DEFAULT_TARGET_SECONDS = 8 * 3600;

const getMySchedule = () => {
  const profile = GetLocalStorageData("my_profile") || {};
  const schedules = GetLocalStorageData("work_schedule") || [];
  const schedule = Array.isArray(schedules)
    ? schedules.find((s) => s.id === profile?.work_schedule_id)
    : null;
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const today = schedule ? (schedule.workday || []).find((d) => d.weekday === weekday) : null;
  return { schedule, today };
};

// Today's expected work time from the employee's work schedule (seconds).
const getTodayTargetSeconds = () => {
  const { schedule, today } = getMySchedule();
  if (!schedule) return DEFAULT_TARGET_SECONDS;

  const todaySeconds = Number(today?.total_work_duration_without_break) || 0;
  if (today?.is_day_on && todaySeconds > 0) return todaySeconds;

  const fullDay = Number(schedule.fullday_work_duration) || 0;
  return fullDay > 0 ? fullDay : DEFAULT_TARGET_SECONDS;
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const TimeTracking = ({ hideTimer }) => {
  const [firstCheckInTime, setFirstCheckInTime] = useState("--:--");

  const {
    total_seconds,
    currently_checked_in,
    is_on_break,
    total_break_duration,
    maximum_break_duration,
  } = useSelector((state) => state.ClockReducer);
  const isTimerPaused =
    is_on_break && total_break_duration > maximum_break_duration;
  const { employee_total_work_duration } = useSelector(
    (state) => state.TimeTrackingReducer,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Api.get("/attendance/get-total-work-duration/");
        const fetchFirstCheckInTime =
          employee_total_work_duration.first_check_in_time;

        if (fetchFirstCheckInTime) {
          const [, timePart] = fetchFirstCheckInTime.split(" ");
          const [hours, minutes] = timePart.split(":");
          const amOrPm = parseInt(hours) >= 12 ? "PM" : "AM";
          const formattedHours = parseInt(hours) % 12 || 12;
          setFirstCheckInTime(`${formattedHours}:${minutes} ${amOrPm}`);
        } else {
          setFirstCheckInTime("--:--");
        }
      } catch (error) {
        console.log("ERR");
      }
    };

    fetchData();
  }, [employee_total_work_duration]);

  const status = isTimerPaused
    ? { label: "Break exceeded", tone: "danger" }
    : is_on_break
      ? { label: "On Break", tone: "warning" }
      : currently_checked_in
        ? { label: "Checked In", tone: "success" }
        : { label: "Not Checked In", tone: "secondary" };

  const running = currently_checked_in && !is_on_break;
  const [targetSeconds] = useState(getTodayTargetSeconds);
  const worked = total_seconds || 0;
  const goalPct = Math.min(100, Math.round((worked / targetSeconds) * 100));
  const remaining = Math.max(0, targetSeconds - worked);
  const overtime = Math.max(0, worked - targetSeconds);
  const goalTone =
    overtime > 0
      ? "primary"
      : goalPct >= 75
        ? "success"
        : goalPct >= 40
          ? "info"
          : "warning";
  const [hh, mm, ss] = timeParts(total_seconds);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="time-tracking-wrap w-100">
      <Card className="time-tracking-card h-100">
        <CardBody className="tt-body">
          <div className="tt-head">
            <div className="text-start">
              <div className="tt-greet">
                {greeting()} <span className="tt-wave">👋</span>
              </div>
              <div className="tt-date">
                <i className="ri-calendar-2-line me-1" />
                {today}
              </div>
            </div>
            <span className={`tt-status tt-${status.tone}${currently_checked_in ? " is-live" : ""}`}>
              <span className="tt-status-dot" />
              {status.label}
            </span>
          </div>

          <div className="tt-ring-zone">
            <div className={`tt-clock ${running ? "is-running" : "is-idle"} tt-${status.tone}`}>
              <lord-icon
                src="https://cdn.lordicon.com/kbtmbyzy.json"
                trigger={running ? "loop" : "hover"}
                colors="primary:#405189,secondary:#02a8b5"
                style={{ width: "110px", height: "110px" }}
              />
              <div className="tt-time">
                <Digits value={hh} />
                <span className="tt-colon">:</span>
                <Digits value={mm} />
                <span className="tt-colon">:</span>
                <span className="tt-sec">
                  <Digits value={ss} />
                </span>
              </div>
              <div className="tt-time-label">Worked today</div>
              <div className="tt-ring-goal">{goalPct}% of goal</div>
            </div>
          </div>

          <div className={`tt-goal tt-${goalTone}`}>
            <div className="tt-goal-head">
              <span className="tt-goal-title">
                <i className="ri-focus-3-line" />
                Today's goal
              </span>
              <span className="tt-goal-pct">{goalPct}%</span>
            </div>
            <div
              className="tt-goal-track"
              role="progressbar"
              aria-valuenow={goalPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`tt-goal-fill${running ? " is-running" : ""}`}
                style={{ width: `${Math.max(goalPct, worked > 0 ? 2 : 0)}%` }}
              />
              {[25, 50, 75].map((m) => (
                <span key={m} className="tt-goal-tick" style={{ left: `${m}%` }} />
              ))}
            </div>
            <div className="tt-goal-foot">
              <span>
                <b>{formatDuration(worked)}</b> of {formatDuration(targetSeconds)}
              </span>
              {overtime > 0 ? (
                <span className="tt-goal-extra">
                  <i className="ri-trophy-line" /> +{formatDuration(overtime)} overtime
                </span>
              ) : (
                <span>{formatDuration(remaining)} left</span>
              )}
            </div>
          </div>

          <div className="tt-tiles">
            <div className={`tt-tile${currently_checked_in ? " is-active" : ""}`}>
              <i className="ri-login-circle-line tt-tile-icon tt-success" />
              <div>
                <div className="tt-tile-label">First In</div>
                <div className="tt-tile-value">{firstCheckInTime || "--:--"}</div>
              </div>
            </div>
            <div className={`tt-tile is-break${is_on_break ? " is-active" : ""}`}>
              <i className="ri-cup-line tt-tile-icon tt-warning" />
              <div>
                <div className="tt-tile-label">Break</div>
                <div className="tt-tile-value">{formatDuration(total_break_duration || 0)}</div>
              </div>
            </div>
          </div>

          <div
            className={`hstack gap-2 justify-content-center time-tracking-btn ${
              currently_checked_in ? "is-checked-in" : "is-checked-out"
            }`}
          >
            <WebCheckInOut showTimer={false} hideTimer={hideTimer} />
          </div>
        </CardBody>
      </Card>

      <style>{`
        .time-tracking-wrap { display:flex; flex-direction:column; }
        .time-tracking-card { flex:1 1 auto; }
        .tt-body { flex:1 1 auto; display:flex; flex-direction:column; align-items:center; gap:14px; padding:18px 18px 18px; }
        .tt-ring-zone { flex:1 1 auto; width:100%; display:flex; align-items:center; justify-content:center; padding:6px 0; }
        .tt-body .time-tracking-btn { width:100%; padding-top:2px; }
        .tt-head { width:100%; display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
        .tt-greet { font-size:15px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); }
        .tt-date { font-size:12px; color:var(--vz-secondary-color); margin-top:2px; }
        .tt-status {
          display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
          font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px;
          color:var(--tt-c); background:rgba(var(--tt-rgb), .12);
        }
        .tt-status-dot { width:7px; height:7px; border-radius:50%; background:var(--tt-c); }
        .tt-success { --tt-c:var(--vz-success); --tt-rgb:var(--vz-success-rgb); }
        .tt-warning { --tt-c:var(--vz-warning); --tt-rgb:var(--vz-warning-rgb); }
        .tt-danger { --tt-c:var(--vz-danger); --tt-rgb:var(--vz-danger-rgb); }
        .tt-secondary { --tt-c:var(--vz-secondary-color); --tt-rgb:135,138,153; }

        /* entrance */
        .tt-body > * { animation:tt-rise .55s cubic-bezier(.2,.8,.2,1) both; }
        .tt-body > *:nth-child(2) { animation-delay:.08s; }
        .tt-body > *:nth-child(3) { animation-delay:.16s; }
        .tt-body > *:nth-child(4) { animation-delay:.24s; }
        .tt-body > *:nth-child(5) { animation-delay:.32s; }
        @keyframes tt-rise { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

        .tt-wave { display:inline-block; transform-origin:70% 70%; animation:tt-wave 2.6s ease-in-out 0.6s infinite; }
        @keyframes tt-wave { 0%,60%,100% { transform:rotate(0); } 10%,30% { transform:rotate(16deg); } 20% { transform:rotate(-8deg); } 40% { transform:rotate(-4deg); } 50% { transform:rotate(10deg); } }

        .tt-status.is-live .tt-status-dot { animation:tt-ping 1.6s ease-out infinite; }
        .tt-status:not(.is-live) .tt-status-dot { animation:tt-blink 2.4s ease-in-out infinite; }
        @keyframes tt-ping { 0% { box-shadow:0 0 0 0 rgba(var(--tt-rgb), .55); } 80%,100% { box-shadow:0 0 0 7px rgba(var(--tt-rgb), 0); } }
        @keyframes tt-blink { 0%,100% { opacity:1; } 50% { opacity:.35; } }

        /* old lord-icon clock animation */
        .tt-clock {
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
          animation:tt-pop .7s cubic-bezier(.2,.9,.3,1.2) .1s both;
        }
        @keyframes tt-pop { from { opacity:0; transform:scale(.85); } to { opacity:1; transform:none; } }
        .tt-clock.is-running lord-icon { filter:drop-shadow(0 0 10px rgba(2,168,181,.35)); }
        .tt-time { font-size:26px; font-weight:800; letter-spacing:.5px; font-variant-numeric:tabular-nums; color:var(--vz-heading-color, var(--vz-body-color)); display:inline-flex; align-items:baseline; white-space:nowrap; }
        .tt-colon { display:inline-block; margin:0 4px; opacity:.55; }
        .tt-clock.is-running .tt-colon { animation:tt-blink 1s steps(1) infinite; }
        .tt-d { display:inline-block; width:.64em; text-align:center; }
        .tt-sec { display:inline-flex; color:var(--tt-c); }
        .tt-time-label { font-size:11px; color:var(--vz-secondary-color); margin-top:2px; text-transform:uppercase; letter-spacing:.6px; }
        .tt-ring-goal {
          margin-top:6px; padding:1px 8px; border-radius:999px; font-size:10.5px; font-weight:600;
          color:var(--tt-c); background:rgba(var(--tt-rgb), .12);
        }

        /* check in / out button */
        .tt-body .time-tracking-btn .btn, .tt-body .time-tracking-btn button { position:relative; overflow:hidden; transition:transform .2s ease, box-shadow .2s ease; }
        .tt-body .time-tracking-btn.is-checked-out .btn, .tt-body .time-tracking-btn.is-checked-out button { animation:tt-cta 2.4s ease-in-out infinite; }
        @keyframes tt-cta { 0%,100% { filter:drop-shadow(0 0 0 rgba(28,198,190,0)); } 50% { filter:drop-shadow(0 0 10px rgba(28,198,190,.65)); } }
        .tt-body .time-tracking-btn .btn::after, .tt-body .time-tracking-btn button::after {
          content:""; position:absolute; top:0; bottom:0; left:-60%; width:40%;
          background:linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
          transform:skewX(-20deg); animation:tt-sweep 3.6s ease-in-out 1s infinite;
        }
        @keyframes tt-sweep { 0% { left:-60%; } 35%,100% { left:130%; } }
        .tt-body .time-tracking-btn .btn:active, .tt-body .time-tracking-btn button:active { transform:scale(.96); }

        .tt-primary { --tt-c:var(--vz-primary); --tt-rgb:var(--vz-primary-rgb); }
        .tt-info { --tt-c:var(--vz-info); --tt-rgb:var(--vz-info-rgb); }
        .tt-goal { width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--vz-border-color);
          background:linear-gradient(135deg, rgba(var(--tt-rgb), .08), rgba(var(--tt-rgb), .02)); }
        .tt-goal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .tt-goal-title { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--vz-heading-color, var(--vz-body-color)); }
        .tt-goal-title i { font-size:15px; color:var(--tt-c); }
        .tt-goal-pct { font-size:13px; font-weight:800; font-variant-numeric:tabular-nums; color:var(--tt-c); }
        .tt-goal-track { position:relative; height:8px; border-radius:999px; overflow:hidden; background:rgba(var(--tt-rgb), .14); }
        .tt-goal-fill { position:relative; height:100%; border-radius:999px; transition:width .9s ease;
          background:linear-gradient(90deg, rgba(var(--tt-rgb), .65), var(--tt-c)); }
        .tt-goal-fill.is-running::after { content:""; position:absolute; inset:0; border-radius:inherit;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); background-size:200% 100%; animation:tt-shine 2s linear infinite; }
        @keyframes tt-shine { from { background-position:200% 0; } to { background-position:-200% 0; } }
        .tt-goal-tick { position:absolute; top:0; bottom:0; width:2px; margin-left:-1px; background:var(--vz-secondary-bg); opacity:.7; }
        .tt-goal-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:7px; font-size:11px; color:var(--vz-secondary-color); }
        .tt-goal-foot b { color:var(--vz-heading-color, var(--vz-body-color)); font-weight:700; }
        .tt-goal-extra { display:inline-flex; align-items:center; gap:4px; color:var(--tt-c); font-weight:600; }

        .tt-tiles { width:100%; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .tt-tile {
          display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
          border:1px solid var(--vz-border-color); background:var(--vz-tertiary-bg); text-align:left;
        }
        .tt-tile-icon {
          width:34px; height:34px; flex:0 0 34px; border-radius:10px; font-size:17px;
          display:inline-flex; align-items:center; justify-content:center;
          color:var(--tt-c); background:rgba(var(--tt-rgb), .12);
        }
        .tt-tile-label { font-size:11px; color:var(--vz-secondary-color); }
        .tt-tile-value { font-size:14px; font-weight:700; color:var(--vz-heading-color, var(--vz-body-color)); white-space:nowrap; }
        .tt-tile { transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .tt-tile:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(56,65,74,.08); }
        .tt-tile-icon { transition:transform .25s ease; }
        .tt-tile:hover .tt-tile-icon { transform:scale(1.08) rotate(-6deg); }
        .tt-tile.is-active { border-color:rgba(var(--vz-success-rgb), .35); }
        .tt-tile.is-break.is-active { border-color:rgba(var(--vz-warning-rgb), .45); }
        .tt-tile.is-break.is-active .tt-tile-icon { animation:tt-sip 1.8s ease-in-out infinite; }
        @keyframes tt-sip { 0%,100% { transform:rotate(0); } 25% { transform:rotate(-10deg); } 75% { transform:rotate(8deg); } }
        .tt-goal-fill { animation:tt-grow 1.2s cubic-bezier(.2,.8,.2,1) .35s both; transform-origin:left; }
        @keyframes tt-grow { from { transform:scaleX(0); } to { transform:scaleX(1); } }

        @media (prefers-reduced-motion: reduce) {
          .tt-body *, .tt-body *::before, .tt-body *::after { animation:none !important; transition:none !important; }
        }
      `}</style>
    </div>
  );
};

export default TimeTracking;
