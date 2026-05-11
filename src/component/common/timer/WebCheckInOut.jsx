import React, { useEffect, useState } from "react";
import { Button, Col, Modal, ModalBody, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import StatusBottomSheet from "../timeLine/StatusBottomSheet";
import TimelineModal from "../timeLine/TimelineModal"; // ✅ FIX: was missing

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAP_API_KEY;

const WebCheckInOut = ({ showTimer, hideTimer }) => {
  const [loading, setLoading] = useState(false);
  // ✅ FIX: removed local currentlyCheckedIn — use Redux source of truth only
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const { total_seconds, currently_checked_in, show_attendance_timer } =
    useSelector((state) => state.ClockReducer);

  const dispatch = useDispatch();

  const [CICOPayload, SetCICOPayload] = useState(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState("");

  useEffect(() => {
    if (currently_checked_in) {
      const interval = setInterval(() => {
        dispatch(
          setTimer({
            total_seconds: total_seconds + 1,
            currently_checked_in: currently_checked_in,
          }),
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [total_seconds, currently_checked_in, dispatch]);

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
          entry_type: currently_checked_in ? 2 : 1, // ✅ FIX: uses Redux value
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
            // ✅ FIX: no local state to flip — Redux handles truth via GetTotalWorkDuration
            GetTotalWorkDuration(dispatch);
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

  return (
    <React.Fragment>
      <Col
        xxl={hideTimer ? 3 : 6}
        md={hideTimer ? 3 : 6}
        style={{
          flex: hideTimer ? "0 0 25%" : "0 0 53%",
          maxWidth: hideTimer ? "25%" : "53%",
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
                onClick={() => setShowStatusSheet(true)}
                outline
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

        {showTimer && (
          <span
            className="ms-1 mt-1"
            style={{
              display: "inline-block",
              width: "90px",
              fontSize: "initial",
              fontWeight: 700,
            }}
          >
            &nbsp;<span className="timer">{formatTime(total_seconds)}</span>
          </span>
        )}
      </Col>

      <StatusBottomSheet
        show={showStatusSheet}
        onClose={() => setShowStatusSheet(false)}
        onOpenTimeline={() => {
          setShowStatusSheet(false);
          setShowTimeline(true);
        }}
        onCheckInOut={handleCheckInOut}
        currentlyCheckedIn={currently_checked_in} // ✅ FIX: Redux value only
        checkInLoading={loading}
      />

      {/* ✅ FIX: TimelineModal was missing from this component */}
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
