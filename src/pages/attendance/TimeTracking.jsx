import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "reactstrap";
import WebCheckInOut from "../../component/common/timer/WebCheckInOut";
import { useSelector } from "react-redux";
import { Api } from "../../common/api/Api";
import { employee_total_work_duration } from "./../../redux/reducers/ChildReducer/TimeTrackingReducer";
import axios from 'axios';


const TimeTracking = ({hideTimer}) => {

  
  const [firstCheckInTime, setFirstCheckInTime] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);

  // const { total_seconds, currently_checked_in } = useSelector(
  //   (state) => state.ClockReducer
  // );

  const {
    total_seconds,
    currently_checked_in,
    is_on_break,
    total_break_duration,
    maximum_break_duration,
  } = useSelector((state) => state.ClockReducer);
  const isTimerPaused =
  is_on_break &&
  total_break_duration > maximum_break_duration;
  const { employee_total_work_duration } = useSelector(
    (state) => state.TimeTrackingReducer
  );

  const getCurrentDate = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "short", day: "numeric" };
    return currentDate.toLocaleDateString(undefined, options);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await Api.get("/attendance/get-total-work-duration/");
        const fetchFirstCheckInTime =
          employee_total_work_duration.first_check_in_time;

        if (!!fetchFirstCheckInTime) {
          const [datePart, timePart] = fetchFirstCheckInTime.split(" ");
          const [hours, minutes] = timePart.split(":");
          const amOrPm = parseInt(hours) >= 12 ? "PM" : "AM";
          const formattedHours = parseInt(hours) % 12 || 12;

          const formattedTime = `${formattedHours}:${minutes} ${amOrPm}`;
          setFirstCheckInTime(formattedTime);
        } else {
          setFirstCheckInTime("--:--");
        }
      } catch (error) {
        console.log("ERR");
      }
    };

    fetchData();
  }, [employee_total_work_duration]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy, speed, heading } = pos.coords;
          const locationDetails = {
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
          };
  
         
  
          // Reverse Geocoding (get address)
          const address = await getAddressFromCoordinates(latitude, longitude);
          
  
          setPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error(' Error getting location:', err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };
  

  const payableBreak = Math.min(
    total_break_duration,
    maximum_break_duration
  );

// const displaySeconds = total_seconds + payableBreak;
const displaySeconds = total_seconds; 

  return (
    <React.Fragment>
      <Card style={{ height: "332px" }}>
        <CardBody className="text-center">
          <h6 className="card-title mb-3 flex-grow-1 text-start">
            Date: {getCurrentDate()}
          </h6>
          <div className={hideTimer === true ?"mb-4 mt-5" :  "mb-2"}>
            <lord-icon
              src="https://cdn.lordicon.com/kbtmbyzy.json"
              trigger={
                // currently_checked_in && currently_checked_in == true
                currently_checked_in && !isTimerPaused
                  ? "loop"
                  : ""
              }
              colors="primary:#405189,secondary:#02a8b5"
              style={{ width: "90px", height: "90px" }}
            ></lord-icon>
          </div>
        

          {/* <h3 className="mb-1">{formatTime(total_seconds)}</h3> */}
          <h3 className="mb-1">{formatTime(displaySeconds)}</h3>
          <h5 className="fs-14 mb-4">
            First In : <b> {firstCheckInTime}</b>
          </h5>
          <div className="hstack gap-2 justify-content-center">
            <WebCheckInOut showTimer={false} hideTimer={hideTimer}/>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default TimeTracking;
