import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Autoplay, Mousewheel } from "swiper";
import { useDispatch } from "react-redux";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import "./LeaveTypesWidgets.scss";
import { testId, itemTestKey } from "../../shared/testing/testId";

const RING_SIZE = 96;
const RING_STROKE = 9;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

const TYPE_STYLES = [
  { match: /sick|medical/i, tone: "danger", icon: "ri-first-aid-kit-line" },
  { match: /casual/i, tone: "warning", icon: "ri-sun-line" },
  { match: /permission|short/i, tone: "info", icon: "ri-time-line" },
  { match: /earned|privilege|annual|vacation/i, tone: "success", icon: "ri-plane-line" },
  { match: /maternity|paternity|parental/i, tone: "pink", icon: "ri-parent-line" },
  { match: /comp/i, tone: "primary", icon: "ri-exchange-line" },
];
const FALLBACK_TONES = ["primary", "purple", "info", "success"];

const typeStyle = (name = "", index) =>
  TYPE_STYLES.find((t) => t.match.test(name)) || {
    tone: FALLBACK_TONES[index % FALLBACK_TONES.length],
    icon: "ri-calendar-event-line",
  };

const healthOf = (pct, available) => {
  if (available <= 0) return { tone: "danger", label: "Exhausted", icon: "ri-error-warning-line" };
  if (pct <= 25) return { tone: "warning", label: "Running low", icon: "ri-alarm-warning-line" };
  return { tone: "success", label: "Healthy", icon: "ri-leaf-line" };
};

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
};

const formatNum = (n) => (Number.isInteger(n) ? n : Math.round(n * 10) / 10);

const BalanceRing = ({ pct, available, unit, uid }) => {
  const shown = useCountUp(available);
  const target = Number.isInteger(available) ? Math.round(shown) : formatNum(shown);
  return (
    <div className="lvw-ring">
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <defs>
          <linearGradient id={`lvwGrad${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--h)", stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: "var(--h)", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle
          className="lvw-ring-track"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {pct > 0 && (
          <circle
            className="lvw-ring-arc"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            strokeWidth={RING_STROKE}
            fill="none"
            stroke={`url(#lvwGrad${uid})`}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - Math.min(pct, 100) / 100)}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ "--c-len": `${RING_C}px` }}
          />
        )}
      </svg>
      <div className="lvw-ring-center">
        <b>{target}</b>
        <small>{unit} left</small>
      </div>
    </div>
  );
};

const LeaveTypesWidgets = ({
  formname,
  initialFormObj,
  width_per,
  leaveTypeForEmployeeData,
}) => {
  const dispatch = useDispatch();

  const handleApplyLeave = (lt) => {
    let FormObj = {
      ...initialFormObj,
      leave_type_id: lt.leave_type.id,
    };

    dispatch(setFormTitle(formname));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage(width_per));
    dispatch(setComponentToShow(formname));
    dispatch(toggleRSBView(true));
  };

  const getUnitLabel = (value, unitType) => {
    const base = unitType === 1 ? "Day" : "Hour";
    return value === 1 ? base : `${base}s`;
  };

  return (
    <div className="lvw-wrap">
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        mousewheel={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
          1600: { slidesPerView: 4 },
        }}
        modules={[Autoplay, Mousewheel]}
        className="leaveTypeSlider"
      >
        {(leaveTypeForEmployeeData || [])
          .filter(
            (item) => !["Comp Off", "Restricted Leave"].includes(item?.leave_type?.name),
          )
          .map((item, key) => {
            const name = item?.leave_type?.name || "Leave";
            const allowed = item?.available_count || 0;
            const paidTaken = item?.paid_taken || 0;
            const unpaidTaken = item?.unpaid_taken || 0;
            const available = item?.paid_balance_count || 0;
            const unitType = item?.leave_type?.unit;
            const unitShort = unitType === 1 ? "days" : "hrs";

            const pct = allowed > 0 ? Math.max(Math.round((available / allowed) * 100), 0) : 0;
            const usedPct = allowed > 0 ? Math.min(100, (paidTaken / allowed) * 100) : 0;
            const unpaidPct = allowed > 0 ? Math.min(100 - usedPct, (unpaidTaken / allowed) * 100) : 0;
            const health = healthOf(pct, available);
            const type = typeStyle(name, key);

            return (
              <SwiperSlide key={item?.leave_type?.id ?? key} style={{ height: "auto" }}>
                <div
                  className={`lvw-card t-${type.tone} h-${health.tone}`}
                  style={{ animationDelay: `${Math.min(key, 5) * 70}ms` }}
                >
                  <i className={`lvw-watermark ${type.icon}`} aria-hidden="true" />

                  <div className="lvw-head">
                    <span className="lvw-icon">
                      <i className={type.icon} />
                    </span>
                    <div className="lvw-title">
                      <h6 title={name}>{name}</h6>
                      <small>
                        {allowed} {getUnitLabel(allowed, unitType)} per year
                      </small>
                    </div>
                    <span className="lvw-health">
                      <i className={health.icon} />
                      {health.label}
                    </span>
                  </div>

                  <div className="lvw-body">
                    <BalanceRing pct={pct} available={available} unit={unitShort} uid={`${key}`} />

                    <div className="lvw-stats">
                      <div className="lvw-stat">
                        <small>Allowed</small>
                        <b>
                          {allowed} <em>{unitShort}</em>
                        </b>
                      </div>
                      <div className="lvw-stat is-avail">
                        <small>Available</small>
                        <b>
                          {available} <em>{unitShort}</em>
                        </b>
                      </div>
                      <div className="lvw-stat">
                        <small>Paid taken</small>
                        <b>
                          {paidTaken} <em>{unitShort}</em>
                        </b>
                      </div>
                      <div className={`lvw-stat${unpaidTaken > 0 ? " is-warn" : ""}`}>
                        <small>Unpaid taken</small>
                        <b>
                          {unpaidTaken} <em>{unitShort}</em>
                        </b>
                      </div>
                    </div>
                  </div>

                  <div className="lvw-usage" title={`${Math.round(usedPct)}% used`}>
                    <div className="lvw-usage-bar">
                      <span className="is-used" style={{ width: `${usedPct}%` }} />
                      <span className="is-unpaid" style={{ width: `${unpaidPct}%` }} />
                    </div>
                    <div className="lvw-usage-legend">
                      <span>
                        <i className="dot is-used" />
                        Used {Math.round(usedPct)}%
                      </span>
                      {unpaidTaken > 0 && (
                        <span>
                          <i className="dot is-unpaid" />
                          Unpaid
                        </span>
                      )}
                      <span className="ms-auto">
                        <i className="dot is-left" />
                        {pct}% left
                      </span>
                    </div>
                  </div>

                  <button data-testid={testId("leave-balance-apply", itemTestKey(item), "button")} type="button" className="lvw-apply" onClick={() => handleApplyLeave(item)}>
                    <i className="ri-calendar-check-line" />
                    <span>Apply {name}</span>
                    <i className="ri-arrow-right-line lvw-apply-arrow" />
                  </button>
                </div>
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};

export default LeaveTypesWidgets;
