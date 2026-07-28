import React, { useEffect, useState } from "react";
import { Button, Col, Modal, ModalBody, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import StatusBottomSheet from "../timeLine/StatusBottomSheet";
import TimelineModal from "../timeLine/TimelineModal";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAP_API_KEY;

const WebCheckInOut = ({ showTimer, hideTimer, layout }) => {
  const [loading, setLoading] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // const { total_seconds, currently_checked_in, show_attendance_timer } =
  //   useSelector((state) => state.ClockReducer);

  const {
    total_seconds,
    // display_seconds,
    currently_checked_in,
    total_break_duration,
    is_on_break,
    maximum_break_duration,
    show_attendance_timer,
    clock_initialized, // ADD THIS
  } = useSelector((state) => state.ClockReducer);
  const dispatch = useDispatch();

  const isTimerPaused =
    is_on_break && total_break_duration > maximum_break_duration;

  const [CICOPayload, SetCICOPayload] = useState(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [liveBreakSeconds, setLiveBreakSeconds] = useState(0);
  // useEffect(() => {
  //   if (currently_checked_in) {
  //     const interval = setInterval(() => {
  //       dispatch(
  //         setTimer({
  //           total_seconds: total_seconds + 1,
  //           currently_checked_in: currently_checked_in,
  //         }),
  //       );
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }
  // }, [total_seconds, currently_checked_in, dispatch]);

  useEffect(() => {
    if (!currently_checked_in) return;

    const interval = setInterval(() => {
      // const stopTimer =
      //   is_on_break &&
      //   total_break_duration >= maximum_break_duration;
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
    // Close the status sheet if it was open (checkout flow)
    setShowStatusSheet(false);
    setLoading(true);

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/mobile/i.test(ua)) return "Mobile";
      if (/tablet/i.test(ua)) return "Tablet";
      return "Desktop";
    };
    const device_type = getDeviceType();

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

  /**
   * ✅ KEY FIX:
   * - Check IN  → call handleCheckInOut directly (no bottom sheet)
   * - Check OUT → open StatusBottomSheet so user can update status before leaving
   */
  const handleButtonClick = () => {
    if (currently_checked_in) {
      // Checked IN → show bottom sheet for checkout flow
      setShowStatusSheet(true);
    } else {
      // Not checked in → go straight to check-in, no sheet needed
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

  // const displaySeconds =
  //   total_seconds + payableBreak;
  const displaySeconds = total_seconds;

  return (
    <React.Fragment>
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
            {hideTimer ? null : loading ? (
              <Button color="primary" className="btn-load" outline>
                <span className="d-flex align-items-center">
                  <Spinner size="sm" className="flex-shrink-0">
                    Loading...
                  </Spinner>
                  <span className="flex-grow-1 ms-2">Loading...</span>
                </span>
              </Button>
            ) : (
              <Button
                color={currently_checked_in ? "warning" : "secondary"}
                className="custom-toggle"
                onClick={handleButtonClick} // ✅ FIX: uses smart handler
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
                      <i className="ri-time-line align-bottom me-1" /> Check IN
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

      {/*
        ✅ FIX: StatusBottomSheet is shown ONLY during checkout.
        The onCheckInOut prop triggers the actual checkout API call.
      */}
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

      {/* Late Attendance Modal */}
      <Modal
        fade
        isOpen={showLateModal}
        toggle={() => setShowLateModal(false)}
        centered
      >
        <ModalBody className="py-2 px-3">
          <div className="mt-2 text-center">
            <div className="mt-4 pt-2 fs-15 mx-4">
              <h4>Please Enter the Reason for Late Attendance</h4>
            </div>
            <textarea
              className="form-control"
              placeholder="Enter Reason"
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
            <button
              type="button"
              className="btn w-sm btn-light"
              onClick={() => setShowLateModal(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-danger"
              onClick={FirstCheckinWithLateAttendanceNotesAPI}
            >
              Submit
            </button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default WebCheckInOut;
