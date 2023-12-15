import React, { useEffect, useState } from "react";
import { Button, Col } from "reactstrap";
import { Api } from "../../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { setTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
const WebCheckInOut = ({ showTimer }) => {
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
    let payload = {
      entry_type: currently_checked_in === true ? 2 : 1,
      punched_by: 1,
    };

    const Api = await PostApi(
      "attendance/check-in-check-out-entry/",
      payload,
      false
    );

    if (Api.status && Api.status === 200) {
      toast.success(Api?.data?.message);
      GetTotalWorkDuration(dispatch);
    } else {
      toast.error(Api?.data?.message);
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
      <Button
        outline
        className={`custom-toggle ${
          currently_checked_in && currently_checked_in === true
            ? "btn-outline-warning"
            : "btn-outline-secondary"
        }`}
        onClick={handleToggleClick}
      >
        <span className="icon-on">
          <i className="ri-time-line align-bottom me-1"></i>{" "}
          {currently_checked_in && currently_checked_in === true
            ? "Check OUT"
            : "Check IN"}
        </span>
        <span className="icon-off">
          <i className="ri-time-fill align-bottom me-1"></i>{" "}
          {currently_checked_in && currently_checked_in === true
            ? "Check IN"
            : "Check OUT"}
        </span>
      </Button>

      {showTimer && (
        <span
          className="ms-1 mt-1"
          style={{
            fontSize: "initial",
            fontWeight: 700,
          }}
        >
          &nbsp;
          <span className="timer">{formatTime(total_seconds)}</span>
        </span>
      )}
    </Col>
  );
};

export default WebCheckInOut;
