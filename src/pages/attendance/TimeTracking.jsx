import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "reactstrap";
import WebCheckInOut from "../../component/common/timer/WebCheckInOut";
import { useSelector } from "react-redux";
import { Api } from "../../common/api/Api";
const TimeTracking = () => {
  const [firstCheckInTime, setFirstCheckInTime] = useState(null);

  // const checkInOutToggle = (ele) => {
  //   if (ele.closest("button").classList.contains("active")) {
  //     ele.closest("button").classList.remove("active");
  //     ele.closest("button").classList.remove("btn-outline-warning");
  //     ele.closest("button").classList.add("btn-outline-secondary");
  //   } else {
  //     ele.closest("button").classList.remove("btn-outline-secondary");
  //     ele.closest("button").classList.add("active");
  //     ele.closest("button").classList.add("btn-outline-warning");
  //   }
  // };

  const { total_seconds, currently_checked_in } = useSelector(
    (state) => state.ClockReducer
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
        console.log("RES = ", data.data.data.first_check_in_time);
        const fetchFirstCheckInTime = data.data.data.first_check_in_time;
        const [datePart, timePart] = fetchFirstCheckInTime.split(" ");
        const [hours, minutes] = timePart.split(":");
        const amOrPm = parseInt(hours) >= 12 ? "PM" : "AM";
        const formattedHours = parseInt(hours) % 12 || 12;

        const formattedTime = `${formattedHours}:${minutes} ${amOrPm}`;
        setFirstCheckInTime(formattedTime);
      } catch (error) {
        console.log("ERR = ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <React.Fragment>
      <Card style={{ height: "325px" }}>
        <CardBody className="text-center">
          <h6 className="card-title mb-3 flex-grow-1 text-start">
            Date: {getCurrentDate()}
          </h6>
          <div className="mb-2">
            <lord-icon
              src="https://cdn.lordicon.com/kbtmbyzy.json"
              trigger={
                currently_checked_in && currently_checked_in == true
                  ? "loop"
                  : ""
              }
              colors="primary:#405189,secondary:#02a8b5"
              style={{ width: "90px", height: "90px" }}
            ></lord-icon>
          </div>
          <h3 className="mb-1">{formatTime(total_seconds)}</h3>
          <h5 className="fs-14 mb-4">
            First In : <b> {firstCheckInTime}</b>
          </h5>
          <div className="hstack gap-2 justify-content-center">
            <WebCheckInOut showTimer={false} />
            {/* <Button
              outline
              className="custom-toggle btn-outline-secondary"
              onClick={(e) => checkInOutToggle(e.target)}
            >
              <span className="icon-on fs-5">
                <i className="mdi mdi-account-arrow-right-outline align-bottom me-1"></i>{" "}
                Check IN
              </span>
              <span className="icon-off fs-5">
                <i className="mdi mdi-account-arrow-left-outline align-bottom me-1 "></i>{" "}
                Check OUT
              </span>
            </Button> */}
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default TimeTracking;
