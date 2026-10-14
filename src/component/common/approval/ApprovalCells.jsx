import React, { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { UncontrolledTooltip } from "reactstrap";
import { ConvertSecondsToTime } from "../../../common/js/ConvertSecondsToTime";

dayjs.extend(customParseFormat);

// Table cells shared by every data table (approvals, lists, reports).
// Styles live in assets/scss/approval.scss.

export const ApvEmpty = () => <span className="apv-muted">—</span>;

const fullName = (e) => [e?.first_name, e?.last_name].filter(Boolean).join(" ");

// Accepts ISO dates and the app's DD-MM-YYYY display format (which Date() would misread as MM-DD).
const parseDate = (value, format) => {
  if (format) return dayjs(value, format);
  if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}/.test(value)) {
    return dayjs(value, value.length > 10 ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY");
  }
  return dayjs(value);
};

export const ApvAvatar = ({ url, name }) => {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return <img src={url} alt="" className="apv-avatar" onError={() => setBroken(true)} />;
  }
  return <span className="apv-avatar is-text">{name ? name.charAt(0).toUpperCase() : "?"}</span>;
};

/** `tag` renders next to the name (e.g. employee code); `sub` replaces the email line. */
export const ApvEmployee = ({ employee, className = "", onClick, tag, sub }) => {
  if (!employee) return <ApvEmpty />;
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "-";
  const subLine = sub ?? employee.email;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick && { type: "button", onClick })}
      className={`apv-emp ${onClick ? "is-link" : ""} ${className}`}
    >
      <ApvAvatar url={employee.profile_url} name={employee.first_name} />
      <span className="apv-emp-text">
        <span className="apv-emp-name" title={tag ? `${name} · ${tag}` : name}>
          <span className="apv-emp-name-text">{name}</span>
          {tag && <span className="apv-emp-tag">{tag}</span>}
        </span>
        {subLine && (
          <span className="apv-emp-mail" title={typeof subLine === "string" ? subLine : undefined}>
            {subLine}
          </span>
        )}
      </span>
    </Tag>
  );
};

export const ApvDepartment = ({ departments = [], refId }) => {
  if (!departments.length) return <ApvEmpty />;
  const first = departments[0]?.name || "-";
  const rest = departments.slice(1);
  const id = `depListRef-${refId}`;
  return (
    <span>
      <span className="apv-dept" id={id}>
        <i className="ri-building-line"></i>
        {first}
        {rest.length > 0 && <span className="apv-dept-more">+{rest.length}</span>}
      </span>
      {rest.length > 0 && (
        <UncontrolledTooltip placement="bottom" target={id}>
          <div className="mt-1">
            {rest.map((item) => (
              <p className="mb-1" key={item.id}>
                {item.name}
              </p>
            ))}
          </div>
        </UncontrolledTooltip>
      )}
    </span>
  );
};

/** Overlapping avatars for several employees; one person shows name + email instead. */
export const ApvPeople = ({ people = [], max = 4 }) => {
  const list = people.filter(Boolean);
  if (!list.length) return <ApvEmpty />;
  if (list.length === 1) return <ApvEmployee employee={list[0]} />;
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  const names = list.map(fullName).join(", ");
  return (
    <span className="apv-people" title={names}>
      {shown.map((p, i) => (
        <ApvAvatar key={p.id ?? i} url={p.profile_url} name={p.first_name} />
      ))}
      {rest > 0 && <span className="apv-avatar is-text apv-people-more">+{rest}</span>}
    </span>
  );
};

/** External link chip (website, email, phone). */
export const ApvLink = ({ href, icon, children }) =>
  !children ? (
    <ApvEmpty />
  ) : (
    <a data-testid="approval-href-link" className="apv-link" href={href} target="_blank" rel="noreferrer" title={String(children)}>
      {icon && <i className={icon}></i>}
      <span>{children}</span>
    </a>
  );

/** Icon tile + bold title + optional muted sub line, for settings-style rows. */
export const ApvTitle = ({ icon, title, sub, tone = "primary", initials, onClick }) => {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      {...(onClick && {
        type: "button",
        onClick: (e) => {
          e.stopPropagation();
          onClick(e);
        },
      })}
      className="apv-title"
    >
      <span className={`apv-title-icon is-${tone}`}>
        {initials ? <b>{initials}</b> : <i className={icon}></i>}
      </span>
      <span className="apv-title-text">
        <b title={title}>{title || "—"}</b>
        {sub && <small title={typeof sub === "string" ? sub : undefined}>{sub}</small>}
      </span>
    </Tag>
  );
};

/** Up to two initials from a name, e.g. "Lint Cloud" → "LC". */
export const initialsOf = (name = "") =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Neutral chip with an icon, same look as the department chip. */
export const ApvChip = ({ icon, children, title }) =>
  children == null || children === "" ? (
    <ApvEmpty />
  ) : (
    <span className="apv-dept" title={title}>
      {icon && <i className={icon}></i>}
      {children}
    </span>
  );

/** tone: success | warning | danger | info | secondary */
export const ApvStatus = ({ tone, icon, label }) => (
  <span className={`apv-status is-${tone}`}>
    {icon && <i className={icon}></i>}
    {label}
  </span>
);

/** Pill tinted with any CSS colour (user-defined task statuses / priorities). */
export const ApvColorTag = ({ color, label, icon }) =>
  !label ? (
    <ApvEmpty />
  ) : (
    <span className="apv-tag" style={{ "--c": color || "var(--vz-secondary-color)" }}>
      {icon ? <i className={icon}></i> : <span className="apv-tag-dot" />}
      {label}
    </span>
  );

/** Active / Inactive pill. */
export const ApvActive = ({ active, on = "Active", off = "Inactive" }) =>
  active ? (
    <ApvStatus tone="success" icon="ri-checkbox-circle-line" label={on} />
  ) : (
    <ApvStatus tone="secondary" icon="ri-forbid-line" label={off} />
  );

const LEAVE_STATUS = {
  1: { label: "Pending", tone: "warning", icon: "ri-time-line" },
  2: { label: "Approved", tone: "success", icon: "ri-checkbox-circle-line" },
  3: { label: "Rejected", tone: "danger", icon: "ri-close-circle-line" },
  4: { label: "Cancel Request", tone: "info", icon: "ri-arrow-go-back-line" },
};

const CANCEL_STATUS = {
  1: { label: "Cancel pending", tone: "warning", icon: "ri-time-line" },
  2: { label: "Cancel approved", tone: "success", icon: "ri-checkbox-circle-line" },
  3: { label: "Cancel rejected", tone: "danger", icon: "ri-close-circle-line" },
};

/** Leave status with the cancellation request status stacked under it. */
export const ApvLeaveStatus = ({ leave }) => {
  const main = leave.is_deleted
    ? { label: "Cancelled", tone: "secondary", icon: "ri-forbid-line" }
    : LEAVE_STATUS[leave.status] || { label: "Unknown", tone: "secondary" };
  const cancel = leave.leave_cancellation_details
    ? CANCEL_STATUS[leave.leave_cancellation_details.status] || CANCEL_STATUS[3]
    : null;
  return (
    <span className={`apv-status-stack ${cancel ? "has-cancel" : ""}`}>
      <ApvStatus {...main} />
      {cancel && <ApvStatus {...cancel} />}
    </span>
  );
};

/** Day tile + month/year; second line shows the time when `withTime`, else the weekday. */
export const ApvDate = ({ value, withTime = false, format }) => {
  const d = parseDate(value, format);
  if (!value || !d.isValid()) return <ApvEmpty />;
  return (
    <span className="apv-date">
      <span className="apv-date-day">{d.format("DD")}</span>
      <span className="apv-date-text">
        <b>{d.format("MMM YYYY")}</b>
        <small>{withTime ? d.format("h:mm A") : d.format("dddd")}</small>
      </span>
    </span>
  );
};

/** kind: in | out | plain */
export const ApvTime = ({ value, kind = "plain" }) => {
  if (!value || value === "-") return <ApvEmpty />;
  const icon = { in: "ri-login-circle-line", out: "ri-logout-circle-r-line", plain: "ri-time-line" }[kind];
  return (
    <span className={`apv-time is-${kind}`}>
      <i className={icon}></i>
      {value}
    </span>
  );
};

/** Duration from seconds, e.g. 28800 → "08:00 hr". */
export const ApvSeconds = ({ seconds, tone, strong }) => {
  const value = ConvertSecondsToTime(seconds);
  if (!value || value === "-") return <ApvEmpty />;
  return <ApvHours value={value.replace(" Hr", "")} tone={tone} strong={strong} />;
};

/** Worked seconds with a progress bar against the planned seconds. */
export const ApvWorked = ({ worked = 0, planned = 0 }) => {
  const pct = planned > 0 ? Math.min(100, Math.round((worked / planned) * 100)) : 0;
  const tone = pct >= 100 ? "success" : pct >= 60 ? "warning" : "danger";
  return (
    <span className="apv-progress-cell">
      <ApvSeconds seconds={worked} />
      {planned > 0 && worked > 0 && (
        <span className={`apv-progress is-${tone}`} title={`${pct}% of schedule`}>
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
    </span>
  );
};

/** Signed difference in seconds as a green/red pill. */
export const ApvDiff = ({ seconds }) => {
  if (!seconds) return <ApvEmpty />;
  const value = ConvertSecondsToTime(Math.abs(seconds)).replace(" Hr", "");
  return (
    <span className={`apv-diff ${seconds > 0 ? "is-up" : "is-down"}`}>
      <i className={seconds > 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
      {value}
    </span>
  );
};

/** First check-in time plus a button showing the number of log entries. */
export const ApvCheckIn = ({ time, entries = 0, onOpenLog }) => (
  <span className="apv-checkin">
    <ApvTime value={time} kind="in" />
    {entries > 0 && onOpenLog && (
      <button
        data-testid="approval-view-check-in-timeline-button"
        type="button"
        className="apv-log-btn"
        title="View check-in timeline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenLog();
        }}
      >
        <i className="ri-history-line"></i>
        {entries}
      </button>
    )}
  </span>
);

export const ApvNotesButton = ({ count = 0, onClick }) => (
  <button
    data-testid="approval-note-button"
    type="button"
    className={`apv-notes-btn ${count ? "has-notes" : ""}`}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
  >
    <i className={count ? "ri-chat-3-line" : "ri-chat-new-line"}></i>
    {count ? `${count} ${count === 1 ? "note" : "notes"}` : "Add"}
  </button>
);

/** Leave length as a pill: "2 days" or "3 hours". */
export const ApvDuration = ({ count, days = true }) => {
  const n = Number(count) || 0;
  const unit = days ? (n === 1 ? "day" : "days") : n === 1 ? "hour" : "hours";
  return (
    <span className={`apv-duration ${days ? "" : "is-hours"}`}>
      <i className={days ? "ri-calendar-line" : "ri-time-line"}></i>
      {n % 1 === 0 ? n : n.toFixed(2).replace(/0$/, "")} {unit}
    </span>
  );
};

export const ApvLeaveType = ({ name, note }) => (
  <span className="apv-leave-type">
    <span className="apv-leave-type-name">{name || "—"}</span>
    {note && <small>{note}</small>}
  </span>
);

export const ApvReason = ({ text }) =>
  text ? (
    <span className="apv-reason" title={text}>
      {text}
    </span>
  ) : (
    <ApvEmpty />
  );

/** Pre-formatted duration ("08:00") with a small unit label. */
export const ApvHours = ({ value, unit = "hr", tone, strong }) => {
  if (value == null || value === "" || value === "-") return <ApvEmpty />;
  return (
    <span className={`apv-hours ${tone ? `is-${tone}` : ""} ${strong ? "is-strong" : ""}`}>
      {value}
      {unit && <small>{unit}</small>}
    </span>
  );
};

// Plain-text versions used by legacy tables for search, sort and export.
const dateText = (value, withTime) => {
  const d = parseDate(value);
  if (!value || !d.isValid()) return "";
  return d.format(withTime ? "DD MMM YYYY h:mm A" : "DD MMM YYYY");
};

ApvEmployee.toText = ({ employee }) => [fullName(employee), employee?.email].filter(Boolean).join(" ");
ApvDepartment.toText = ({ departments = [] }) => departments.map((d) => d.name).join(", ");
ApvPeople.toText = ({ people = [] }) => people.filter(Boolean).map(fullName).join(", ");
ApvLink.toText = ({ children }) => (children ? String(children) : "");
ApvTitle.toText = ({ title, sub }) => [title, typeof sub === "string" ? sub : ""].filter(Boolean).join(" ");
ApvChip.toText = ({ children }) => (typeof children === "string" || typeof children === "number" ? children : "");
ApvStatus.toText = ({ label }) => label;
ApvColorTag.toText = ({ label }) => label || "";
ApvActive.toText = ({ active, on = "Active", off = "Inactive" }) => (active ? on : off);
ApvLeaveStatus.toText = ({ leave }) =>
  leave.is_deleted ? "Cancelled" : LEAVE_STATUS[leave.status]?.label || "";
ApvDate.toText = ({ value, withTime }) => dateText(value, withTime);
ApvTime.toText = ({ value }) => (value && value !== "-" ? value : "");
ApvSeconds.toText = ({ seconds }) => ConvertSecondsToTime(seconds);
ApvWorked.toText = ({ worked }) => ConvertSecondsToTime(worked);
ApvDiff.toText = ({ seconds }) => (seconds ? ConvertSecondsToTime(Math.abs(seconds)) : "");
ApvCheckIn.toText = ({ time }) => time || "";
ApvNotesButton.toText = ({ count = 0 }) => String(count);
ApvDuration.toText = ({ count, days = true }) => `${count} ${days ? "days" : "hours"}`;
ApvLeaveType.toText = ({ name }) => name || "";
ApvReason.toText = ({ text }) => text || "";
ApvHours.toText = ({ value }) => (value == null ? "" : value);
