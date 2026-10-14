import React, { useMemo } from "react";
import { Dialog } from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { testId } from "../../../shared/testing/testId";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const NOTE_TIME_FORMAT = "DD-MM-YYYY HH:mm:ss";
const AVATAR_TONES = ["primary", "success", "info", "warning", "danger", "secondary"];

const parseNoteTime = (value) => {
  const t = dayjs(value, NOTE_TIME_FORMAT, true);
  return t.isValid() ? t : null;
};

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

/** Same person always gets the same avatar colour. */
const toneOf = (name = "") => {
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

/**
 * Notes history for one attendance day, newest first.
 * `summary` is shown under the header (paid hours, status...).
 */
const NotesDialog = ({ open, onClose, date, notes = [], summary = [] }) => {
  const items = useMemo(
    () =>
      notes
        .map((n) => ({ ...n, time: parseNoteTime(n.created_time) }))
        .sort((a, b) => (b.time?.valueOf() || 0) - (a.time?.valueOf() || 0)),
    [notes],
  );
  const people = useMemo(
    () => [...new Set(notes.map((n) => n.employee_name).filter(Boolean))],
    [notes],
  );
  const day = date ? dayjs(date) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: "abe-nd" } }}
    >
      <div className="abe-nd-head">
        <span className="abe-nd-date">
          <b>{day?.format("DD")}</b>
          <small>{day?.format("MMM")}</small>
        </span>
        <div className="abe-nd-title">
          <h5>
            Notes
            <span className="abe-nd-count">{notes.length}</span>
          </h5>
          <p>{day?.format("dddd, DD MMMM YYYY")}</p>
        </div>
        <button
          data-testid="attendance-bulk-edit-notes-close-button"
          type="button"
          className="abe-nd-close"
          aria-label="Close"
          onClick={onClose}
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      {(summary.length > 0 || people.length > 0) && (
        <div className="abe-nd-summary">
          {summary.map((s) => (
            <span key={s.label} className={`abe-nd-stat is-${s.tone || "secondary"}`}>
              <i className={s.icon}></i>
              <span>
                <small>{s.label}</small>
                <b>{s.value}</b>
              </span>
            </span>
          ))}
          {people.length > 0 && (
            <span className="abe-nd-people" title={people.join(", ")}>
              {people.slice(0, 4).map((p) => (
                <span key={p} className={`abe-nd-avatar is-${toneOf(p)}`}>
                  {initialsOf(p)}
                </span>
              ))}
              {people.length > 4 && <span className="abe-nd-avatar is-more">+{people.length - 4}</span>}
            </span>
          )}
        </div>
      )}

      <div className="abe-nd-body">
        <ol className="abe-nd-timeline">
          {items.map((n, i) => (
            <li
              key={n.id}
              data-testid={testId("attendance-bulk-edit-note", n.id, "item")}
              className="abe-nd-item"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <span className={`abe-nd-avatar is-${toneOf(n.employee_name)}`}>
                {initialsOf(n.employee_name)}
              </span>
              <div className="abe-nd-card">
                <div className="abe-nd-meta">
                  <b>{n.employee_name || "Unknown"}</b>
                  {i === 0 && <span className="abe-nd-latest">Latest</span>}
                  <span
                    className="abe-nd-time"
                    title={n.time ? n.time.format("DD MMM YYYY, hh:mm:ss A") : n.created_time}
                  >
                    <i className="ri-time-line"></i>
                    {n.time ? n.time.format("DD MMM, hh:mm A") : n.created_time}
                    {n.time && <em>· {n.time.fromNow()}</em>}
                  </span>
                </div>
                <p className="abe-nd-msg">{n.message}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="abe-nd-foot">
        <span>
          <i className="ri-information-line"></i>
          Newest notes are shown first.
        </span>
        <button
          data-testid="attendance-bulk-edit-notes-done-button"
          type="button"
          className="abe-btn-primary"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </Dialog>
  );
};

export default NotesDialog;
