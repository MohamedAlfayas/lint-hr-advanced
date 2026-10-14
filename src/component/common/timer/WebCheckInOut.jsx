import React, { useEffect, useState } from "react";
import { Skel } from "../skeleton/Skeleton";
import { Button, Col, Modal, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import StatusBottomSheet from "../timeLine/StatusBottomSheet";
import TimelineModal from "../timeLine/TimelineModal";
import CheckInBuddy from "./CheckInBuddy";
import "./lateReasonModal.scss";
import { testId } from "../../../shared/testing/testId";

const LATE_REASON_MAX = 200;
const LATE_REASONS = [
  { label: "Traffic delay", icon: "ri-traffic-light-line", tone: "warning" },
  { label: "Public transport delay", icon: "ri-bus-line", tone: "info" },
  { label: "Medical appointment", icon: "ri-first-aid-kit-line", tone: "danger" },
  { label: "Personal emergency", icon: "ri-user-heart-line", tone: "pink" },
  { label: "Bad weather", icon: "ri-rainy-line", tone: "primary" },
  { label: "Approved by manager", icon: "ri-user-star-line", tone: "success" },
];

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAP_API_KEY;

const WebCheckInOut = ({ showTimer, hideTimer, layout }) => {
  const [loading, setLoading] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const {
    total_seconds,
    currently_checked_in,
    total_break_duration,
    is_on_break,
    maximum_break_duration,
    show_attendance_timer,
    clock_initialized,
  } = useSelector((state) => state.ClockReducer);
  const { profile_data } = useSelector((state) => state.MyProfileReducer);
  const dispatch = useDispatch();

  const isTimerPaused =
    is_on_break && total_break_duration > maximum_break_duration;

  const [CICOPayload, SetCICOPayload] = useState(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [liveBreakSeconds, setLiveBreakSeconds] = useState(0);

  useEffect(() => {
    if (!currently_checked_in) return;

    const interval = setInterval(() => {
      const exceededBreakLimit = total_break_duration > maximum_break_duration;
      const stopTimer = is_on_break && exceededBreakLimit;
      dispatch(
        setTimer({
          total_seconds: stopTimer ? total_seconds : total_seconds + 1,
          currently_checked_in,
          total_break_duration:
            is_on_break && !stopTimer
              ? total_break_duration + 1
              : total_break_duration,
          is_on_break,
          maximum_break_duration,
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [
    total_seconds,
    total_break_duration,
    currently_checked_in,
    is_on_break,
    maximum_break_duration,
    dispatch,
  ]);

  const handleCheckInOut = async () => {
    setShowStatusSheet(false);
    setLoading(true);

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/mobile/i.test(ua)) return "Mobile";
      if (/tablet/i.test(ua)) return "Tablet";
      return "Desktop";
    };
    const device_type = getDeviceType();

    const getBrowserType = () => {
      const ua = navigator.userAgent;

      if (/edg/i.test(ua)) return "Edge";
      if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
      if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
      if (/firefox|fxios/i.test(ua)) return "Firefox";
      if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) return "Safari";
      if (/msie|trident/i.test(ua)) return "Internet Explorer";

      return "Unknown";
    };
    const device_browser = getBrowserType();

    const getUserIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Error fetching IP:", error);
        return null;
      }
    };

    const ip_address = await getUserIP();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

        let accurate_address = "Address not found";
        let location_id = "";
        let fullMapData = {};

        try {
          const res = await fetch(geocodeUrl);
          const data = await res.json();
          if (data.status === "OK") {
            const result = data.results[0];
            accurate_address = result.formatted_address;
            location_id = result.place_id;
            fullMapData = result;
          }
        } catch (err) {
          console.error("Geocoding error:", err);
        }

        const payload = {
          entry_type: currently_checked_in ? 2 : 1,
          punched_by: 1,
          accurate_address,
          latitude,
          longitude,
          location_id,
          map_data: fullMapData,
          device_type,
          device_browser,
          ip_address,
        };

        try {
          const ApiRes = await PostApi(
            "attendance/check-in-check-out-entry/",
            payload,
            false,
          );

          if (!!ApiRes && ApiRes.status === 200) {
            toast.success(ApiRes?.data?.message);
            GetTotalWorkDuration(dispatch);
            if (currently_checked_in) {
              localStorage.removeItem("active_custom_status");
            }
          } else {
            if (ApiRes?.data?.is_late) {
              SetCICOPayload(payload);
              setLateReason("");
              setShowLateModal(true);
            } else {
              toast.error(ApiRes?.data?.message);
            }
          }
        } catch (err) {
          console.error("Check-in API error:", err);
          toast.error("Something went wrong during check-in/out");
        }

        setLoading(false);
      },
      (error) => {
        toast.error("Location access is required for check-in/out");
        setLoading(false);
      },
    );
  };

  const handleButtonClick = () => {
    if (currently_checked_in) {
      setShowStatusSheet(true);
    } else {
      handleCheckInOut();
    }
  };

  const FirstCheckinWithLateAttendanceNotesAPI = async () => {
    dispatch(setLoaderVisible(true));
    if (lateReason.trim().length === 0) {
      toast.error("Please Enter Valid Reason");
      dispatch(setLoaderVisible(false));
      return;
    }
    const payload = { ...CICOPayload, notes: lateReason };
    const ApiRes = await PostApi(
      "attendance/first-checkin-with-late-attendance-notes/",
      payload,
      false,
    );

    if (!!ApiRes && ApiRes.status === 200) {
      toast.success(ApiRes?.data?.message);
      GetTotalWorkDuration(dispatch);
      setShowLateModal(false);
    } else {
      toast.error(ApiRes?.data?.message);
    }
    dispatch(setLoaderVisible(false));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(" : ");
  };

  const payableBreak = Math.min(total_break_duration, maximum_break_duration);
  const displaySeconds = total_seconds;

  const isHeader = layout === "header";

  return (
    <React.Fragment>
      {isHeader ? (
        <div className="wci-header">
          {show_attendance_timer && clock_initialized && !currently_checked_in && !loading && (
            <CheckInBuddy
              profile={profile_data}
              workedSeconds={total_seconds}
              onCheckIn={handleButtonClick}
            />
          )}
          {show_attendance_timer && (
            <button
              data-testid="check-in-timer-toggle-button"
              type="button"
              className={`wci-btn ${currently_checked_in ? "is-out" : "is-in"}`}
              onClick={handleButtonClick}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <i className={currently_checked_in ? "ri-logout-circle-r-line" : "ri-login-circle-line"} />
              )}
              <span>{currently_checked_in ? "Check Out" : "Check In"}</span>
            </button>
          )}

          {showTimer && (
            <div
              className={`wci-timer${currently_checked_in ? " is-running" : ""}`}
              title={currently_checked_in ? "Checked in" : "Not checked in"}
            >
              <span className="wci-dot" />
              <span className="wci-time">{formatTime(displaySeconds)}</span>
            </div>
          )}

          {currently_checked_in && isTimerPaused && (
            <span className="wci-warn" title="Break time exceeded 1 hour">
              <i className="ri-error-warning-line" /> Break &gt; 1h
            </span>
          )}

          <style>{`
            .wci-header { display:flex; align-items:center; gap:8px; margin-right:8px; }
            .wci-btn {
              display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px;
              border-radius:999px; font-size:13px; font-weight:600; white-space:nowrap;
              border:1px solid transparent; transition:filter .15s ease, background-color .15s ease;
            }
            .wci-btn i { font-size:16px; }
            .wci-btn.is-in { background:var(--vz-success); color:#fff; box-shadow:0 4px 12px rgba(var(--vz-success-rgb), .3); }
            .wci-btn.is-out { background:rgba(var(--vz-warning-rgb), .12); color:var(--vz-warning); border-color:rgba(var(--vz-warning-rgb), .4); }
            .wci-btn:hover:not(:disabled) { filter:brightness(.95); }
            .wci-btn:disabled { opacity:.7; }
            .wci-timer {
              display:inline-flex; align-items:center; gap:8px; height:34px; padding:0 12px;
              border-radius:999px; border:1px solid var(--vz-border-color); background:var(--vz-tertiary-bg);
            }
            .wci-time { font-weight:700; font-size:14px; font-variant-numeric:tabular-nums; letter-spacing:.5px; color:var(--vz-body-color); }
            .wci-dot { width:8px; height:8px; border-radius:50%; background:var(--vz-secondary-color); opacity:.6; }
            .wci-timer.is-running .wci-dot { background:var(--vz-success); opacity:1; animation:wci-pulse 1.6s ease-in-out infinite; }
            @keyframes wci-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(var(--vz-success-rgb), .5); } 50% { box-shadow:0 0 0 5px rgba(var(--vz-success-rgb), 0); } }
            .wci-warn { font-size:11px; font-weight:600; color:var(--vz-danger); white-space:nowrap; }
            @media (max-width: 575.98px) { .wci-btn span { display:none; } .wci-btn { padding:0 10px; } }
          `}</style>
        </div>
      ) : (
      <Col
        xxl={hideTimer ? 3 : 6}
        md={hideTimer ? 3 : 6}
        style={{
          flex: hideTimer ? "0 0 25%" : "1 0 53%",
          maxWidth: hideTimer ? "25%" : "66%",
          display: "flex",
          flexDirection: layout === "header" ? "row" : "column",
          alignItems: layout === "header" ? "center" : "center",
          gap: layout === "header" ? "12px" : "0",
          minWidth: layout === "header" ? "220px" : "auto",
          width: layout === "header" ? "auto" : "100%",
        }}
      >
        {show_attendance_timer && (
          <>
            {loading ? (
              <span className="sk-inline" role="status" aria-label="Loading" data-testid="check-in-loading-button">
                <Skel w={120} h={38} />
              </span>
            ) : (
              <Button
                data-testid="check-in-toggle-button"
                color={currently_checked_in ? "warning" : "secondary"}
                className="custom-toggle"
                onClick={handleButtonClick}
                outline
                style={{ whiteSpace: "nowrap" }}
              >
                <span className="d-flex align-items-center">
                  {currently_checked_in ? (
                    <>
                      <i className="ri-time-line align-bottom me-1" />
                      <span className="flex-grow-1 ms-2">Check Out</span>
                    </>
                  ) : (
                    <span className="icon-on">
                      <i className="ri-time-line align-bottom me-1" /> Check In
                    </span>
                  )}
                </span>
              </Button>
            )}
          </>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {showTimer && (
            <span
              style={{
                display: "inline-block",
                fontSize: "initial",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              <span className="timer">{formatTime(displaySeconds)}</span>
            </span>
          )}

          {currently_checked_in && isTimerPaused && (
            <div
              className="text-danger fw-bold"
              style={{
                fontSize: "10px",
                whiteSpace: "nowrap",
                lineHeight: "1.2",
                marginTop: layout === "header" ? "0" : "8px",
              }}
            >
              ⚠ Break time exceeded 1 hour.
            </div>
          )}
        </div>
      </Col>
      )}

      <StatusBottomSheet
        show={showStatusSheet}
        onClose={() => setShowStatusSheet(false)}
        onOpenTimeline={() => {
          setShowStatusSheet(false);
          setShowTimeline(true);
        }}
        onCheckInOut={handleCheckInOut}
        currentlyCheckedIn={currently_checked_in}
        checkInLoading={loading}
      />

      <TimelineModal
        show={showTimeline}
        onClose={() => setShowTimeline(false)}
      />

      <Modal
        data-testid="check-in-late-reason-dialog"
        fade
        isOpen={showLateModal}
        toggle={() => setShowLateModal(false)}
        centered
        className="lat-modal"
        contentClassName="lat-content"
      >
        <div className="lat-hero">
          <span className="lat-hero-icon"><i className="ri-alarm-warning-line"></i></span>
          <div className="lat-hero-text">
            <h5>You're checking in late</h5>
            <p>Add a short reason so your manager knows what happened</p>
          </div>
          <button type="button" className="lat-close" onClick={() => setShowLateModal(false)} aria-label="Close" data-testid="check-in-late-reason-close-button">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="lat-body">
          <div className="lat-time">
            <i className="ri-time-line"></i>
            <span>Check-in time</span>
            <b>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</b>
            <em>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</em>
          </div>

          <label className="lat-label">Quick reasons</label>
          <div className="lat-chips">
            {LATE_REASONS.map((r) => (
              <button
                data-testid={testId("check-in-late-reason-option", r.label)}
                key={r.label}
                type="button"
                aria-pressed={lateReason === r.label}
                className={`lat-chip tone-${r.tone} ${lateReason === r.label ? "is-active" : ""}`}
                onClick={() => setLateReason(lateReason === r.label ? "" : r.label)}
              >
                <span className="lat-chip-icon"><i className={r.icon}></i></span>
                <span className="lat-chip-label">{r.label}</span>
                <i className="ri-checkbox-circle-fill lat-chip-check"></i>
              </button>
            ))}
          </div>

          <div className="lat-label-row">
            <label className="lat-label" htmlFor="lat-reason">Reason <span>*</span></label>
            <span className="lat-counter">{lateReason.length}/{LATE_REASON_MAX}</span>
          </div>
          <div className="lat-textarea">
            <i className="ri-edit-2-line"></i>
            <textarea
              data-testid="check-in-late-reason-textarea"
              id="lat-reason"
              rows={3}
              maxLength={LATE_REASON_MAX}
              placeholder="e.g. Stuck in heavy traffic on the highway"
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="lat-footer">
          <button type="button" className="it-btn is-soft" onClick={() => setShowLateModal(false)} data-testid="check-in-late-reason-cancel-button">
            Close
          </button>
          <button
            data-testid="check-in-late-reason-submit-button"
            type="button"
            className="it-btn is-primary lat-submit"
            onClick={FirstCheckinWithLateAttendanceNotesAPI}
            disabled={!lateReason.trim()}
          >
            <i className="ri-send-plane-fill"></i>Submit & Check In
          </button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default WebCheckInOut;
