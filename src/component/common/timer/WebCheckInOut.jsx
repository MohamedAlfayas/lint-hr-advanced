import React, { useEffect, useState } from "react";
import { Button, Col, Spinner } from "reactstrap";
import { Api } from "../../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
const WebCheckInOut = ({ showTimer }) => {
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
      toast.error(Api?.data?.message);
    }
    setLoading(false);
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
    <Col xxl={6} md={6}>
      {loading ? (
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
  );
};

export default WebCheckInOut;
