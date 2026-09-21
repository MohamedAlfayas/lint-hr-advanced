import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "reactstrap";
import WebCheckInOut from "../../component/common/timer/WebCheckInOut";
import { useSelector } from "react-redux";
import { Api } from "../../common/api/Api";
import Lottie from "react-lottie";
import clockanimated from "../auth/loader/animation/Clock-Animated.json"; 
import { employee_total_work_duration } from "./../../redux/reducers/ChildReducer/TimeTrackingReducer";
import axios from 'axios';


const CUBE_THEME = {
  DAY: {
    border: "#3b82f6",
    badge: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
    label: "#1e40af",
  },
  DATE: {
    border: "#facc15",
    badge: "linear-gradient(135deg, #fde047 0%, #eab308 100%)",
    label: "#a16207",
  },
  MONTH: {
    border: "#bb0b95",
    badge: "linear-gradient(135deg, #fb71f4 0%, #e11db6 100%)",
    label: "#9f128c",
  },
  YEAR: {
    border: "#8b5cf6",
    badge: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
    label: "#5b21b6",
  },
};
const CalendarBadgeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="3" fill="rgba(255,255,255,0.35)" />
    <rect x="3" y="4" width="18" height="4.5" rx="2" fill="rgba(255,255,255,0.55)" />
    <line x1="7" y1="2" x2="7" y2="6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="2" x2="17" y2="6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6.5" y="11" width="3" height="3" rx="0.7" fill="#fff" />
    <rect x="11" y="11" width="3" height="3" rx="0.7" fill="#fff" opacity="0.8" />
    <rect x="15.5" y="11" width="3" height="3" rx="0.7" fill="#fff" opacity="0.6" />
  </svg>
);

const DateCubes = ({ size = 60 }) => {
  const now = new Date();

  const dayOfMonth = now.getDate();
  const monthShort = now.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
  const year = now.getFullYear();
  const weekday = now.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();

  const cubes = [
    { label: "DAY", value: weekday, theme: CUBE_THEME.DAY },
    { label: "DATE", value: dayOfMonth, theme: CUBE_THEME.DATE },
    { label: "MONTH", value: monthShort, theme: CUBE_THEME.MONTH },
    { label: "YEAR", value: year, theme: CUBE_THEME.YEAR },
  ];

  return (
    <div className="date-cubes" style={{ "--cube-size": `${size}px` }}>
      {cubes.map((cube) => (
        <div
          key={cube.label}
          className="date-cube"
          style={{ borderColor: cube.theme.border }}
        >
          <div className="date-cube-header">
            <div
              className="date-cube-badge"
              style={{ background: cube.theme.badge }}
            >
              <CalendarBadgeIcon size="0.65em" />
            </div>
            <span
              className="date-cube-label"
              style={{ color: cube.theme.label }}
            >
              {cube.label}
            </span>
          </div>
          <span className="date-cube-value">{cube.value}</span>
        </div>
      ))}
    </div>
  );
};

// const DateCubes = ({ size = 110 }) => {
//   const now = new Date();

//   const dayOfMonth = now.getDate();                                   // 16
//   const monthShort = now.toLocaleDateString(undefined, { month: "short" }).toUpperCase(); // SEP
//   const year = now.getFullYear();                                     // 2026
//   const weekday = now.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();  // WED

//   const cubes = [
//     { label: "DAY", value: weekday, color: "#048c91" },
//     { label: "DATE", value: dayOfMonth, color: "#2b2f38" },
//     { label: "MONTH", value: monthShort, color: "#e5484d" },
//     { label: "YEAR", value: year, color: "#8a8f98" },
//   ];

//   return (
//     <div style={{ display: "flex", gap: "8px" }}>
//       {cubes.map((cube) => (
//         <div
//           key={cube.label}
//           style={{
//             width: size,
//             height: size,
//             borderRadius: size * 0.15 + "px",
//             border: "1.5px solid #dfe3e8",
//             background: "#ffffff",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             boxShadow: "0 2px 4px rgba(253, 25, 25, 0.06)",
//           }}
//         >
//           <span
//             style={{
//               fontSize: size * 0.15,
//               fontWeight: 700,
//               color: cube.color,
//               letterSpacing: "0.5px",
//               marginBottom: "2px",
//             }}
//           >
//             {cube.label}
//           </span>
//           <span
//             style={{
//               fontSize: size * 0.35,
//               fontWeight: 700,
//               color: "#302b2d",
//             }}
//           >
//             {cube.value}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };
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
    <div className="time-tracking-wrap w-100">
      <Card className="time-tracking-card h-100">
        <CardBody className="text-center time-tracking-card-body">
          <div className="date-cubes-row">
            <DateCubes size={52} />
          </div>

          <div className={hideTimer === true ? "mb-1 mt-1" : "mb-1"}>
            <lord-icon
              src="https://cdn.lordicon.com/kbtmbyzy.json"
              trigger={
                currently_checked_in && !isTimerPaused
                  ? "loop"
                  : ""
              }
              colors="primary:#405189,secondary:#02a8b5"
              style={{ width: "80px", height: "80px" }}
            ></lord-icon>
          </div>

          <h3 className="mb-1 fw-bold time-tracking-timer" style={{ color: "#2b2f38", letterSpacing: "0.5px" }}>
            {formatTime(displaySeconds)}
          </h3>
          <h5 className="fs-14 mb-2 time-tracking-first-in" style={{ color: "#6b7280" }}>
            First In : <b style={{ color: "#2b2f38" }}> {firstCheckInTime}</b>
          </h5>
          <div
            className={`hstack gap-2 justify-content-center time-tracking-btn ${
              currently_checked_in ? "is-checked-in" : "is-checked-out"
            }`}
          >
            <WebCheckInOut showTimer={false} hideTimer={hideTimer}/>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TimeTracking;
