import React, { useEffect, useState } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

// Today's shift from the employee's work schedule. Without a schedule every day is a working day.
export const getTodayShift = () => {
  const profile = GetLocalStorageData("my_profile") || {};
  const schedules = GetLocalStorageData("work_schedule") || [];
  const schedule = Array.isArray(schedules)
    ? schedules.find((s) => s.id === profile?.work_schedule_id)
    : null;
  if (!schedule) return { isWorkDay: true, start: null };

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const today = (schedule.workday || []).find((d) => d.weekday === weekday);
  if (!today?.is_day_on) return { isWorkDay: false, start: null };

  const h = parseInt(today.s_hr, 10);
  const m = parseInt(today.s_min, 10) || 0;
  if (Number.isNaN(h)) return { isWorkDay: true, start: null };
  const start = new Date();
  start.setHours(h, m, 0, 0);
  return { isWorkDay: true, start };
};

const formatClock = (date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

// gender: 1 = male, 2 = female (gender_options)
export const BuddyFigure = ({ gender, size = 36 }) => {
  const female = Number(gender) === 2;
  const skin = "#f6c9a4";
  const hair = female ? "#5b3523" : "#2f2a28";
  const shirt = female ? "#ec6fa0" : "var(--vz-primary)";
  return (
    <svg className="cib-figure" viewBox="14 24 100 106" width={size} height={size} aria-hidden="true">
      {female && (
        <path d="M33 62 C31 30 89 30 87 62 L90 100 C78 106 42 106 30 100 Z" style={{ fill: hair }} />
      )}
      <path d="M26 130 C26 104 41 92 60 92 C79 92 94 104 94 130 Z" style={{ fill: shirt }} />
      <path d="M50 92 L60 104 L70 92 Z" fill="#fff" opacity="0.85" />
      <rect x="54" y="80" width="12" height="14" rx="4" fill={skin} />
      <circle cx="36" cy="63" r="4.5" fill={skin} />
      <circle cx="84" cy="63" r="4.5" fill={skin} />
      {female && (
        <>
          <circle cx="36" cy="70" r="2" fill="#f7b733" />
          <circle cx="84" cy="70" r="2" fill="#f7b733" />
        </>
      )}
      <circle cx="60" cy="60" r="24" fill={skin} />
      {female ? (
        <path d="M35 60 C35 34 85 33 85 60 C76 50 62 44 47 49 C42 51 38 55 35 60 Z" style={{ fill: hair }} />
      ) : (
        <path d="M36 57 C35 33 85 31 85 55 C79 46 67 42 53 44 C46 45 40 50 36 57 Z" style={{ fill: hair }} />
      )}
      <g className="cib-eyes">
        <ellipse cx="51" cy="62" rx="2.6" ry="3.2" fill="#2f2a28" />
        <ellipse cx="69" cy="62" rx="2.6" ry="3.2" fill="#2f2a28" />
      </g>
      <circle cx="46" cy="70" r="3.6" fill="#ff8a8a" opacity="0.45" />
      <circle cx="74" cy="70" r="3.6" fill="#ff8a8a" opacity="0.45" />
      <path d="M52 71 Q60 79 68 71" fill="none" stroke="#7a3b2e" strokeWidth="2.4" strokeLinecap="round" />
      <g className="cib-arm">
        <path d="M86 104 L101 72" style={{ stroke: shirt }} strokeWidth="10" strokeLinecap="round" />
        <circle cx="102" cy="67" r="7" fill={skin} />
      </g>
    </svg>
  );
};

const INTRO_MS = 8000;

/** Waving avatar + "time to check in" bubble for the topbar check-in area. */
const CheckInBuddy = ({ profile, workedSeconds, onCheckIn }) => {
  const [shift] = useState(getTodayShift);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  if (!shift.isWorkDay) return null;

  const late = shift.start && shift.start <= new Date();
  const note = shift.start
    ? `${late ? "Shift started" : "Shift starts"} ${formatClock(shift.start)}`
    : null;

  return (
    <div className={`cib${intro ? " is-intro" : ""}`}>
      <button
        data-testid="check-in-buddy-check-in-button"
        type="button"
        className="cib-avatar"
        onClick={onCheckIn}
        aria-label="Check in"
      >
        <BuddyFigure gender={profile?.gender} />
      </button>

      <div className="cib-bubble" role="status">
        <b>
          Hi{profile?.first_name ? ` ${profile.first_name}` : ""}! <span className="cib-hand">👋</span>
        </b>
        <span>{workedSeconds > 0 ? "Check in to continue your day" : "Time to check in"}</span>
        {note && (
          <small className={late ? "is-late" : ""}>
            <i className="ri-time-line" /> {note}
          </small>
        )}
      </div>

      <style>{`
        .cib { position:relative; display:inline-flex; }
        .cib-avatar {
          position:relative; width:36px; height:36px; padding:0; border:0; border-radius:50%; overflow:hidden; cursor:pointer;
          background:radial-gradient(circle at 50% 35%, rgba(var(--vz-primary-rgb), .16), rgba(var(--vz-primary-rgb), .06));
          box-shadow:inset 0 0 0 2px rgba(var(--vz-success-rgb), .45);
          animation:cib-pop .6s cubic-bezier(.2,.9,.3,1.3) both;
        }
        .cib-avatar::after {
          content:""; position:absolute; inset:0; border-radius:50%;
          animation:cib-ring 2.2s ease-out infinite;
        }
        .cib-figure { display:block; overflow:visible; animation:cib-bob 2.8s ease-in-out infinite; }
        .cib-arm { transform-box:view-box; transform-origin:86px 104px; animation:cib-hi 1.6s ease-in-out infinite; }
        .cib-eyes { transform-box:fill-box; transform-origin:center; animation:cib-blink 4.5s infinite; }

        .cib-bubble {
          position:absolute; top:calc(100% + 12px); right:-6px; z-index:1050; min-width:190px;
          display:flex; flex-direction:column; gap:2px; padding:9px 13px; border-radius:12px;
          font-size:12px; line-height:1.35; color:#fff; white-space:nowrap;
          background:linear-gradient(135deg, #1CC6BE, #0C7C8C); box-shadow:0 10px 24px rgba(12,124,140,.3);
          opacity:0; transform:translateY(-6px) scale(.9); transform-origin:90% 0; pointer-events:none;
          transition:opacity .25s ease, transform .25s ease;
        }
        .cib-bubble::before {
          content:""; position:absolute; top:-6px; right:18px; width:12px; height:12px;
          background:#17a9a7; transform:rotate(45deg); border-radius:2px;
        }
        .cib-bubble b { font-size:13px; }
        .cib-bubble small { margin-top:3px; font-size:10.5px; opacity:.9; }
        .cib-bubble small.is-late { color:#ffe1a8; opacity:1; font-weight:600; }
        .cib.is-intro .cib-bubble, .cib:hover .cib-bubble { opacity:1; transform:none; }
        .cib.is-intro .cib-bubble { animation:cib-float 3s ease-in-out .4s infinite; }
        .cib-hand { display:inline-block; transform-origin:70% 70%; animation:cib-wave 1.6s ease-in-out infinite; }

        @keyframes cib-pop { from { opacity:0; transform:scale(.4); } to { opacity:1; transform:none; } }
        @keyframes cib-ring { 0% { box-shadow:0 0 0 0 rgba(var(--vz-success-rgb), .5); } 80%,100% { box-shadow:0 0 0 8px rgba(var(--vz-success-rgb), 0); } }
        @keyframes cib-bob { 0%,100% { transform:translateY(1px); } 50% { transform:translateY(-1.5px); } }
        @keyframes cib-hi { 0%,100% { transform:rotate(0deg); } 20% { transform:rotate(18deg); } 40% { transform:rotate(-6deg); } 60% { transform:rotate(16deg); } 80% { transform:rotate(-2deg); } }
        @keyframes cib-blink { 0%,92%,100% { transform:scaleY(1); } 95% { transform:scaleY(.1); } }
        @keyframes cib-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
        @keyframes cib-wave { 0%,100% { transform:rotate(0); } 25% { transform:rotate(18deg); } 75% { transform:rotate(-8deg); } }

        @media (max-width: 575.98px) { .cib-bubble { right:-60px; } .cib-bubble::before { right:74px; } }
        @media (prefers-reduced-motion: reduce) {
          .cib *, .cib *::after { animation:none !important; }
        }
      `}</style>
    </div>
  );
};

export default CheckInBuddy;
