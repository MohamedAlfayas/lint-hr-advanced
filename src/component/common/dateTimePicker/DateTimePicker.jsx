import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./dateTimePicker.scss";
import { testId, useFieldTestId } from "../../../shared/testing/testId";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PANEL_WIDTH = 452;
const PANEL_WIDTH_COMPACT = 300;

const pad = (n) => String(n).padStart(2, "0");

const parseValue = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || "");
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  return new Date(y, mo - 1, d, h, mi);
};

const toValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;

const sameDay = (a, b) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDisplay = (date) => {
  const h = date.getHours() % 12 || 12;
  const ampm = date.getHours() < 12 ? "AM" : "PM";
  return `${pad(date.getDate())} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}, ${pad(
    h,
  )}:${pad(date.getMinutes())} ${ampm}`;
};

const buildPresets = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
  const daysToMonday = ((8 - now.getDay()) % 7) || 7;
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToMonday, 9, 0);
  return [
    { label: "Now", icon: "ri-flashlight-line", date: now },
    { label: "In 1 hour", icon: "ri-timer-line", date: inHour },
    { label: "Tomorrow 9 AM", icon: "ri-sun-line", date: tomorrow },
    { label: "Next Mon 9 AM", icon: "ri-calendar-event-line", date: nextMonday },
  ];
};

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date & time",
  icon = "ri-calendar-line",
  disabled = false,
  clearable = true,
  className = "",
  testId: testIdOverride,
}) => {
  const baseId = useFieldTestId("date-time", testIdOverride);
  const selected = useMemo(() => parseValue(value), [value]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [view, setView] = useState(() => {
    const base = selected || new Date();
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [pos, setPos] = useState({ top: 0, left: 0, compact: false, above: false });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const openPicker = () => {
    if (disabled) return;
    const base = selected || new Date(new Date().setSeconds(0, 0));
    setDraft(new Date(base));
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const compact = window.innerWidth < PANEL_WIDTH + 24;
      const width = compact ? PANEL_WIDTH_COMPACT : PANEL_WIDTH;
      const height = panelRef.current?.offsetHeight || 420;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const fitsBelow = rect.bottom + 6 + height <= window.innerHeight - 8;
      const above = !fitsBelow && rect.top - 6 - height >= 8;
      const top = above
        ? rect.top - 6 - height
        : Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - height - 8));
      setPos({ top, left, compact, above });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const draftHour12 = draft ? draft.getHours() % 12 || 12 : null;
  const draftMinute = draft ? draft.getMinutes() : null;
  const draftPm = draft ? draft.getHours() >= 12 : false;

  const scrolledRef = useRef(false);

  useEffect(() => {
    if (!open) {
      scrolledRef.current = false;
      return;
    }
    const behavior = scrolledRef.current ? "smooth" : "auto";
    scrolledRef.current = true;
    [
      [hourListRef, draftHour12],
      [minuteListRef, draftMinute],
    ].forEach(([ref, val]) => {
      const el = ref.current?.querySelector(`[data-val="${val}"]`);
      if (el && ref.current) {
        ref.current.scrollTo({
          top: el.offsetTop - ref.current.clientHeight / 2 + el.clientHeight / 2,
          behavior,
        });
      }
    });
  }, [open, draftHour12, draftMinute]);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = new Date(view.y, view.m, 1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
  }, [view]);

  const today = new Date();

  const shiftMonth = (delta) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const updateDraft = (mutate) =>
    setDraft((prev) => {
      const next = new Date(prev || new Date());
      mutate(next);
      return next;
    });

  const pickDay = (day) => {
    updateDraft((d) => d.setFullYear(day.getFullYear(), day.getMonth(), day.getDate()));
    if (day.getMonth() !== view.m) setView({ y: day.getFullYear(), m: day.getMonth() });
  };

  const pickHour = (h12) =>
    updateDraft((d) => d.setHours((h12 % 12) + (d.getHours() >= 12 ? 12 : 0)));

  const pickMinute = (min) => updateDraft((d) => d.setMinutes(min));

  const pickMeridiem = (pm) =>
    updateDraft((d) => {
      const h = d.getHours();
      if (pm && h < 12) d.setHours(h + 12);
      if (!pm && h >= 12) d.setHours(h - 12);
    });

  const applyPreset = (date) => {
    setDraft(new Date(date));
    setView({ y: date.getFullYear(), m: date.getMonth() });
  };

  const commit = () => {
    if (draft) onChange?.(toValue(draft));
    setOpen(false);
  };

  const clear = () => {
    onChange?.("");
    setOpen(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid={testId(baseId, "trigger")}
        className={`dtp-trigger ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
        onClick={() => (open ? setOpen(false) : openPicker())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <i className={`${icon} dtp-trigger-icon`} />
        <span className={`dtp-trigger-text ${selected ? "" : "is-placeholder"}`}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        {clearable && selected && !disabled ? (
          <button
            type="button"
            className="dtp-trigger-clear"
            title="Clear"
            data-testid={testId(baseId, "clear-button")}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
          >
            <i className="ri-close-line" />
          </button>
        ) : (
          <i className="ri-arrow-down-s-line dtp-trigger-caret" />
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            data-testid={testId(baseId, "dialog")}
            className={`dtp-panel ${pos.compact ? "is-compact" : ""} ${pos.above ? "is-above" : ""}`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="dtp-presets">
              {buildPresets().map((p) => (
                <button data-testid={testId(baseId, "preset", p.label, "button")} key={p.label} type="button" className="dtp-preset" onClick={() => applyPreset(p.date)}>
                  <i className={p.icon} />
                  {p.label}
                </button>
              ))}
            </div>

            <div className="dtp-main">
              <div className="dtp-cal">
                <div className="dtp-cal-head">
                  <button data-testid={testId(baseId, "previous-month-button")} type="button" className="dtp-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                    <i className="ri-arrow-left-s-line" />
                  </button>
                  <div className="dtp-cal-title">
                    {MONTHS[view.m]} <span>{view.y}</span>
                  </div>
                  <button data-testid={testId(baseId, "next-month-button")} type="button" className="dtp-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>

                <div className="dtp-grid dtp-weekdays">
                  {WEEKDAYS.map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </div>
                <div className="dtp-grid">
                  {days.map((day) => {
                    const cls = [
                      "dtp-day",
                      day.getMonth() !== view.m && "is-out",
                      sameDay(day, today) && "is-today",
                      sameDay(day, draft) && "is-selected",
                      (day.getDay() === 0 || day.getDay() === 6) && "is-weekend",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <button data-testid={testId(baseId, "day", toValue(day).slice(0, 10), "button")} key={day.toISOString()} type="button" className={cls} onClick={() => pickDay(day)}>
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="dtp-time">
                <div className="dtp-time-head">
                  <i className="ri-time-line" />
                  <b>
                    {pad(draftHour12 || 12)}:{pad(draftMinute || 0)}
                  </b>
                  <span>{draftPm ? "PM" : "AM"}</span>
                </div>
                <div className="dtp-time-cols">
                  <div className="dtp-col" ref={hourListRef}>
                    {HOURS.map((h) => (
                      <button
                        data-testid={testId(baseId, "hour", h, "button")}
                        key={h}
                        type="button"
                        data-val={h}
                        className={`dtp-cell ${h === draftHour12 ? "is-selected" : ""}`}
                        onClick={() => pickHour(h)}
                      >
                        {pad(h)}
                      </button>
                    ))}
                  </div>
                  <div className="dtp-col" ref={minuteListRef}>
                    {MINUTES.map((m) => (
                      <button
                        data-testid={testId(baseId, "minute", m, "button")}
                        key={m}
                        type="button"
                        data-val={m}
                        className={`dtp-cell ${m === draftMinute ? "is-selected" : ""}`}
                        onClick={() => pickMinute(m)}
                      >
                        {pad(m)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dtp-meridiem">
                  <button data-testid={testId(baseId, "am-button")} type="button" className={!draftPm ? "is-active" : ""} onClick={() => pickMeridiem(false)}>
                    AM
                  </button>
                  <button data-testid={testId(baseId, "pm-button")} type="button" className={draftPm ? "is-active" : ""} onClick={() => pickMeridiem(true)}>
                    PM
                  </button>
                </div>
              </div>
            </div>

            <div className="dtp-foot">
              <div className="dtp-summary">
                <i className="ri-calendar-check-line" />
                {draft ? formatDisplay(draft) : "No date selected"}
              </div>
              <div className="dtp-actions">
                {clearable && (
                  <button type="button" className="dtp-btn is-ghost" onClick={clear} data-testid={testId(baseId, "panel-clear-button")}>
                    Clear
                  </button>
                )}
                <button data-testid={testId(baseId, "done-button")} type="button" className="dtp-btn is-primary" onClick={commit}>
                  <i className="ri-check-line" />
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default DateTimePicker;
