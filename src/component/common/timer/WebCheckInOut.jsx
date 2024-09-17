import React, { useEffect, useState } from "react";
import { Button, Col, Modal, ModalBody, Spinner } from "reactstrap";
import { Api } from "../../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
const WebCheckInOut = ({ showTimer, hideTimer }) => {
  const [loading, setLoading] = useState(false);
  const [currentlyCheckedIn, setCurrentlyCheckedIn] = useState(false);
  const { total_seconds, currently_checked_in } = useSelector(
    (state) => state.ClockReducer
  );

  useEffect(() => {
    if (currently_checked_in && currently_checked_in === true) {
      const interval = setInterval(() => {
        dispatch(
          setTimer({
            total_seconds: total_seconds + 1,
            currently_checked_in: currently_checked_in,
          })
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [total_seconds, currently_checked_in]);

  const dispatch = useDispatch();

  const [CICOPayload, SetCICOPayload] = useState(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState("");

  const handleToggleClick = async () => {
    setLoading(true);
    let payload = {
      entry_type: currently_checked_in === true ? 2 : 1,
      punched_by: 1,
    };

    const Api = await PostApi(
      "attendance/check-in-check-out-entry/",
      payload,
      false
    );

    if (!!Api && Api.status && Api.status === 200) {
      toast.success(Api?.data?.message);
      setCurrentlyCheckedIn(!currently_checked_in);
      GetTotalWorkDuration(dispatch);
    } else {
      console.log("CHECK IN CHECK OUT API EXCEPTION == ", Api?.data);
      console.log("IS LATE ATTENDANCE == ", Api?.data?.is_late);
      if (Api?.data?.is_late === true) {
        SetCICOPayload(payload);
        setLateReason("");
        setShowLateModal(true);
      } else {
        toast.error(Api?.data?.message);
        setShowLateModal(false);
      }
    }
    setLoading(false);
  };

  const onLAModalCloseClick = () => setShowLateModal(false);

  const FirstCheckinWithLateAttendanceNotesAPI = async () => {
    dispatch(setLoaderVisible(true));
    console.log("CICOPayload = ", CICOPayload);
    if (lateReason.trim().length === 0) {
      toast.error("Please Enter Valid Reason");
    } else {
      const payload = {
        ...CICOPayload,
        notes: lateReason,
      };
      const Api = await PostApi(
        "attendance/first-checkin-with-late-attendance-notes/",
        payload,
        false
      );

      console.log("Attendance Notes API = ", Api);

      if (!!Api && Api.status && Api.status === 200) {
        dispatch(setLoaderVisible(false));
        toast.success(Api?.data?.message);
        setCurrentlyCheckedIn(!currently_checked_in);
        GetTotalWorkDuration(dispatch);
        setShowLateModal(false);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error(Api?.data?.message);
      }
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    const hDisplay =
      h > 0 ? (h < 10 ? "0" + h.toString() : h.toString()) : "00";
    const mDisplay =
      m > 0 ? (m < 10 ? "0" + m.toString() : m.toString()) : "00";
    const sDisplay =
      s > 0 ? (s < 10 ? "0" + s.toString() : s.toString()) : "00";

    return `${hDisplay} : ${mDisplay} : ${sDisplay}`;
  };

  console.log("Hide Timer ", hideTimer)

  // useEffect(() => {
  //   // Perform API call when the component mounts
  //   const fetchData = async () => {
  //     try {
  //       const data = await Api.get("/attendance/get-total-work-duration/");
  //       console.log("RES = ", data);

  //       // Initialize the timer with fetched data
  //       LCAttendance.init(data.total_work_duration, data.currently_checked_in);
  //     } catch (error) {
  //       console.log("ERR = ", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const LCAttendance = {
    init: (sec, is_checked_in) => {
      setCurrentlyCheckedIn(is_checked_in);
    },
  };

  return (
    <React.Fragment>

      <Col xxl={hideTimer ? 3 : 6} md={hideTimer ? 3 : 6}>
      
        {hideTimer === true ? null : (
          loading ? (
                <Button color="primary" className="btn-load" outline>
                  <span className="d-flex align-items-center">
                    <Spinner size="sm" className="flex-shrink-0">
                      {" "}
                      Loading...{" "}
                    </Spinner>
                    <span className="flex-grow-1 ms-2">Loading...</span>
                  </span>
                </Button>
              ) : (
                <Button
                  color={currently_checked_in ? "warning" : "secondary"}
                  className="custom-toggle"
                  onClick={handleToggleClick}
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
                        <i className="ri-time-line align-bottom me-1" />{" "}
                        {currently_checked_in ? "Check OUT" : "Check IN"}
                      </span>
                    )}
                  </span>
                </Button>
              )
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

      <Modal
        fade={true}
        isOpen={showLateModal}
        toggle={onLAModalCloseClick}
        centered={true}
      >
        <ModalBody className="py-2 px-3">
          <div className="mt-2 text-center">
            <div className="mt-4 pt-2 fs-15 mx-4">
              <h4>Please Enter the Reason for Late Attendance</h4>
            </div>

            <textarea
              id="reason"
              name="reason"
              className="form-control"
              placeholder="Enter Reason"
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
            ></textarea>
          </div>
          <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
            <button
              type="button"
              className="btn w-sm btn-light"
              data-bs-dismiss="modal"
              onClick={() => setShowLateModal(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-danger"
              id="assign-record"
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
