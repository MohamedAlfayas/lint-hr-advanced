import React, { useEffect, useState } from "react";
import { Button, Col } from "reactstrap";
import { Api } from "../../common/api/Api";
const WebCheckInOut = () => {
  const [isCheckingOut, setIsCheckingOut] = useState(true); 
  const [seconds, setSeconds] = useState(0);

  const handleToggleClick = () => {
    setIsCheckingOut((prev) => !prev);
  };
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);
  
    const hDisplay = h > 0 ? (h < 10 ? "0" + h.toString() : h.toString()) : "00";
    const mDisplay = m > 0 ? (m < 10 ? "0" + m.toString() : m.toString()) : "00";
    const sDisplay = s > 0 ? (s < 10 ? "0" + s.toString() : s.toString()) : "00";
  
    return `${hDisplay} : ${mDisplay} : ${sDisplay}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isCheckingOut) {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckingOut]);

  useEffect(() => {
    // Perform API call when the component mounts
    const fetchData = async () => {
      try {
        const data = await Api.get("/attendance/get-total-work-duration/");
        console.log("RES = ", data);

        // Initialize the timer with fetched data
        LCAttendance.init(data.total_work_duration, data.currently_checked_in);
      } catch (error) {
        console.log("ERR = ", error);
      }
    };

    fetchData();
  }, []);

  const LCAttendance = {
    init: (sec, is_checked_in) => {
      setIsCheckingOut(is_checked_in);
    
    },
  };

  return (
    <Col xxl={6} md={6}>
      <Button
        outline
        className={`custom-toggle ${isCheckingOut ? "btn-outline-warning" : "btn-outline-secondary"}`}
        onClick={handleToggleClick}
      >
        <span className="icon-on">
          <i className="ri-time-line align-bottom me-1"></i> {isCheckingOut ? "Check OUT" : "Check IN"}
        </span>
        <span className="icon-off">
          <i className="ri-time-fill align-bottom me-1"></i> {isCheckingOut ? "Check IN" : "Check OUT"}
        </span>
      </Button>

      <span
        className="ms-1 mt-1"
        style={{
          fontSize: "initial",
          fontWeight: 700,
        }}
      >
        &nbsp;
        <span className="timer">{formatTime(seconds)}</span>
      </span>
    </Col>
  );
};




export default WebCheckInOut;
