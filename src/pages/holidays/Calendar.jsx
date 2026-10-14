import React, { useMemo, useRef, useState } from "react";
import { Container, Modal } from "reactstrap";
import dayjs from "dayjs";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { MetaTitle } from "../../common/data/MetaTitle";
import "./Calendar.scss";
import { testId, itemTestKey } from "../../shared/testing/testId";

const VIEWS = [
  { key: "dayGridMonth", label: "Month", icon: "ri-layout-grid-line" },
  { key: "listYear", label: "List", icon: "ri-list-check" },
];

const UPCOMING_LIMIT = 6;

const daysFromToday = (d) => d.startOf("day").diff(dayjs().startOf("day"), "day");

const relativeLabel = (d) => {
  const n = daysFromToday(d);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `In ${n} days`;
};

const Calender = () => {
  document.title = `Holiday Calendar | ${MetaTitle}`;

  const calendarRef = useRef(null);
  const [title, setTitle] = useState("");
  const [view, setView] = useState("dayGridMonth");
  const [selected, setSelected] = useState(null);

  const holidays = useMemo(
    () =>
      (GetLocalStorageData("holiday") || [])
        .filter((h) => h?.date && dayjs(h.date).isValid())
        .map((h) => ({ ...h, day: dayjs(h.date) }))
        .sort((a, b) => a.day.valueOf() - b.day.valueOf()),
    []
  );

  const holidayDates = useMemo(
    () => new Set(holidays.map((h) => h.day.format("YYYY-MM-DD"))),
    [holidays]
  );

  const events = useMemo(
    () =>
      holidays.map((h, i) => ({
        id: String(h.id ?? i),
        title: h.name,
        start: h.day.format("YYYY-MM-DD"),
        allDay: true,
        classNames: ["hcal-ev", h.is_restricted ? "is-restricted" : "is-public"],
        extendedProps: { holiday: h },
      })),
    [holidays]
  );

  const stats = useMemo(() => {
    const year = dayjs().year();
    const thisYear = holidays.filter((h) => h.day.year() === year);
    const upcoming = holidays.filter((h) => daysFromToday(h.day) >= 0);
    return {
      year,
      total: thisYear.length,
      upcoming,
      restricted: thisYear.filter((h) => h.is_restricted).length,
      next: upcoming[0],
    };
  }, [holidays]);

  const api = () => calendarRef.current?.getApi();

  const goToHoliday = (h) => {
    api()?.gotoDate(h.day.toDate());
    setSelected(h);
  };

  const renderEvent = ({ event, view: v }) => {
    const h = event.extendedProps.holiday;
    if (v.type.startsWith("list")) {
      const idx = holidays.indexOf(h);
      const prev = holidays[idx - 1];
      const monthStart = !prev || !prev.day.isSame(h.day, "month");
      const monthCount = holidays.filter((x) => x.day.isSame(h.day, "month")).length;
      const diff = daysFromToday(h.day);
      const when = diff >= 0 ? relativeLabel(h.day) : `${Math.abs(diff)} days ago`;
      const tone = h.is_restricted ? "is-restricted" : "is-public";
      return (
        <>
          {monthStart && (
            <div className="hcal-lmonth">
              <span>{h.day.format("MMMM YYYY")}</span>
              <em>
                {monthCount} holiday{monthCount > 1 ? "s" : ""}
              </em>
            </div>
          )}
          <div
            className={`hcal-lrow ${tone}${diff < 0 ? " is-past" : ""}${diff === 0 ? " is-today" : ""}`}
            data-testid={testId("holiday-calendar-list", itemTestKey(h), "item")}
          >
            <span className="hcal-up-date">
              <span className="hcal-up-mon">{h.day.format("MMM")}</span>
              <span className="hcal-up-day">{h.day.format("DD")}</span>
            </span>
            <span className="hcal-lrow-text">
              <span className="hcal-lrow-name" title={event.title}>
                {event.title}
              </span>
              <span className="hcal-lrow-meta">
                <span>
                  <i className="ri-calendar-line"></i>
                  {h.day.format("dddd")}
                </span>
                <span className={`hcal-lrow-when${diff >= 0 ? " is-upcoming" : ""}`}>
                  <i className={diff >= 0 ? "ri-time-line" : "ri-history-line"}></i>
                  {when}
                </span>
              </span>
            </span>
            <span className={`hcal-tag ${tone}`}>
              <i className={h.is_restricted ? "ri-lock-line" : "ri-global-line"}></i>
              {h.is_restricted ? "Restricted" : "Public"}
            </span>
            <i className="ri-arrow-right-s-line hcal-lrow-go"></i>
          </div>
        </>
      );
    }
    return (
      <div className="hcal-ev-inner" title={event.title}>
        <span className="hcal-ev-dot" />
        <span className="hcal-ev-title">{event.title}</span>
      </div>
    );
  };

  const statCards = [
    { tone: "primary", icon: "ri-calendar-2-line", label: `Holidays in ${stats.year}`, value: stats.total },
    { tone: "success", icon: "ri-calendar-check-line", label: "Upcoming", value: stats.upcoming.length },
    { tone: "danger", icon: "ri-lock-line", label: "Restricted", value: stats.restricted },
    {
      tone: "warning",
      icon: "ri-timer-2-line",
      label: stats.next ? stats.next.name : "Next holiday",
      value: stats.next ? relativeLabel(stats.next.day) : "—",
    },
  ];

  return (
    <div className="page-content">
      <Container fluid className="hcal">
        {/* ── Header ── */}
        <div className="hcal-hero">
          <div className="hcal-hero-title">
            <span className="hcal-hero-icon">
              <i className="ri-calendar-event-line"></i>
            </span>
            <div>
              <h4>Holiday Calendar</h4>
              <p>Public and restricted holidays for your organisation</p>
            </div>
          </div>

          <div className="hcal-stats">
            {statCards.map((s) => (
              <div key={s.label} className={`hcal-stat is-${s.tone}`}>
                <span className="hcal-stat-icon">
                  <i className={s.icon}></i>
                </span>
                <div className="hcal-stat-text">
                  <div className="hcal-stat-value">{s.value}</div>
                  <div className="hcal-stat-label" title={s.label}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hcal-grid">
          {/* ── Calendar ── */}
          <section className="hcal-card hcal-main">
            <div className="hcal-toolbar">
              <div className="hcal-nav">
                <button data-testid="holiday-calendar-previous-button" type="button" className="hcal-icon-btn" onClick={() => api()?.prev()} title="Previous">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button data-testid="holiday-calendar-next-button" type="button" className="hcal-icon-btn" onClick={() => api()?.next()} title="Next">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
                <button data-testid="holiday-calendar-today-button" type="button" className="hcal-today-btn" onClick={() => api()?.today()}>
                  Today
                </button>
              </div>

              <h5 className="hcal-title">{title}</h5>

              <div className="hcal-views">
                {VIEWS.map((v) => (
                  <button
                    data-testid={testId("holiday-calendar", itemTestKey(v), "button")}
                    key={v.key}
                    type="button"
                    className={`hcal-view-btn ${view === v.key ? "active" : ""}`}
                    onClick={() => api()?.changeView(v.key)}
                  >
                    <i className={v.icon}></i>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hcal-body">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={2}
                events={events}
                eventContent={renderEvent}
                eventClick={({ event }) => setSelected(event.extendedProps.holiday)}
                datesSet={({ view: v }) => {
                  setTitle(v.title);
                  setView(v.type);
                }}
                dayCellClassNames={({ date }) =>
                  holidayDates.has(dayjs(date).format("YYYY-MM-DD")) ? ["has-holiday"] : []
                }
                noEventsContent={() => (
                  <div className="hcal-empty">
                    <i className="ri-calendar-2-line"></i>
                    No holidays in this period
                  </div>
                )}
              />
            </div>
          </section>

          {/* ── Upcoming ── */}
          <aside className="hcal-card hcal-side">
            <div className="hcal-side-head">
              <h6>
                <i className="ri-calendar-todo-line"></i>
                Upcoming holidays
              </h6>
              <span className="hcal-count">{stats.upcoming.length}</span>
            </div>

            {stats.upcoming.length === 0 ? (
              <div className="hcal-empty">
                <i className="ri-sun-line"></i>
                No upcoming holidays
              </div>
            ) : (
              <ul className="hcal-up-list">
                {stats.upcoming.slice(0, UPCOMING_LIMIT).map((h, i) => (
                  <li key={h.id ?? i}>
                    <button
                      data-testid={testId("holiday-calendar-mmm", itemTestKey(h), "button")}
                      type="button"
                      className={`hcal-up ${h.is_restricted ? "is-restricted" : "is-public"}`}
                      onClick={() => goToHoliday(h)}
                    >
                      <span className="hcal-up-date">
                        <span className="hcal-up-mon">{h.day.format("MMM")}</span>
                        <span className="hcal-up-day">{h.day.format("DD")}</span>
                      </span>
                      <span className="hcal-up-text">
                        <span className="hcal-up-name" title={h.name}>
                          {h.name}
                        </span>
                        <span className="hcal-up-meta">
                          {h.day.format("dddd")} · {relativeLabel(h.day)}
                        </span>
                      </span>
                      <span className={`hcal-tag ${h.is_restricted ? "is-restricted" : "is-public"}`}>
                        {h.is_restricted ? "Restricted" : "Public"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="hcal-legend">
              <span>
                <i className="hcal-legend-dot is-public"></i>Public holiday
              </span>
              <span>
                <i className="hcal-legend-dot is-restricted"></i>Restricted holiday
              </span>
              <span>
                <i className="hcal-legend-dot is-today"></i>Today
              </span>
            </div>
          </aside>
        </div>
      </Container>

      {/* ── Holiday details ── */}
      <Modal data-testid="holiday-calendar-selected-dialog" isOpen={!!selected} toggle={() => setSelected(null)} centered className="hcal-modal">
        {selected && (
          <div className="hcal-detail">
            <div className={`hcal-detail-head ${selected.is_restricted ? "is-restricted" : "is-public"}`}>
              <span className="hcal-detail-date">
                <span className="hcal-up-mon">{selected.day.format("MMM")}</span>
                <span className="hcal-up-day">{selected.day.format("DD")}</span>
              </span>
              <div className="hcal-detail-title">
                <h5>{selected.name}</h5>
                <span className={`hcal-tag ${selected.is_restricted ? "is-restricted" : "is-public"}`}>
                  {selected.is_restricted ? "Restricted holiday" : "Public holiday"}
                </span>
              </div>
              <button data-testid="holiday-calendar-selected-close-button" type="button" className="hcal-icon-btn" onClick={() => setSelected(null)} title="Close">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="hcal-detail-body">
              <div className="hcal-detail-row">
                <i className="ri-calendar-2-line"></i>
                <div>
                  <span>Date</span>
                  {selected.day.format("dddd, DD MMMM YYYY")}
                </div>
              </div>
              <div className="hcal-detail-row">
                <i className="ri-time-line"></i>
                <div>
                  <span>When</span>
                  {daysFromToday(selected.day) >= 0
                    ? relativeLabel(selected.day)
                    : `${Math.abs(daysFromToday(selected.day))} days ago`}
                </div>
              </div>
              <div className="hcal-detail-row">
                <i className="ri-file-text-line"></i>
                <div>
                  <span>Description</span>
                  {selected.description || "No description"}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calender;
