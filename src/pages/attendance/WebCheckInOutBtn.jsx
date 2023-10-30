import React, { useEffect, useState } from "react";
import { Button, Col } from "reactstrap";
import { Api } from "../../common/api/Api";

const WebCheckInOutBtn = () => {
  const favouriteBtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
      ele.closest("button").classList.remove("btn-outline-warning");
      ele.closest("button").classList.add("btn-outline-secondary");
    } else {
      ele.closest("button").classList.remove("btn-outline-secondary");
      ele.closest("button").classList.add("active");
      ele.closest("button").classList.add("btn-outline-warning");
    }
  };

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      console.log("has focus");
      //LCGetTodaysWorkDuration();
      //LCGetTodaysWorkDuration.init();
    } else {
      //clearInterval(interval);
      console.log("lost focus");
    }
  });

  function LCGetTodaysWorkDuration() {
    useEffect(() => {
      Api({
        method: "GET",
        url: "/attendance/get-total-work-duration/",
      })
        .then((data) => {
          console.log("RES = ", data);

          // LCAttendance.init(
          //   data.total_work_duration,
          //   data.currently_checked_in
          // );

          //dispatch(setRole(res?.data?.data))
        })
        .catch((err) => {
          console.log("ERR = ", err);
        });
    }, []);
  }

  var LCGetTodaysWorkDurations = (function () {
    useEffect(() => {
      Api({
        method: "GET",
        url: "/attendance/get-total-work-duration/",
      })
        .then((data) => {
          console.log("RES = ", data);

          LCAttendance.init(
            data.total_work_duration,
            data.currently_checked_in
          );

          //dispatch(setRole(res?.data?.data))
        })
        .catch((err) => {
          console.log("ERR = ", err);
        });
    }, []);

    return {
      init: function () {
        init();
      },
    };
  })();

  var LCAttendance = (function () {
    // Private functions Attendance Timer

    var demos = function (seconds, is_checked_in) {
      let thisSecond = seconds;
      const startStopwatch = document.querySelector(".startStopwatch");
      let startPause = is_checked_in;

      var h = Math.floor(thisSecond / 3600);
      var m = Math.floor((thisSecond % 3600) / 60);
      var s = Math.floor((thisSecond % 3600) % 60);

      var hDisplay =
        h > 0 ? (h < 10 ? "0" + h.toString() : h.toString()) : "00";
      var mDisplay =
        m > 0 ? (m < 10 ? "0" + m.toString() : m.toString()) : "00";
      var sDisplay =
        s > 0 ? (s < 10 ? "0" + s.toString() : s.toString()) : "00";
      $(".timer").text(hDisplay + " : " + mDisplay + " : " + sDisplay);

      intervalFunction();

      function intervalFunction() {
        if (startPause) {
          $(".startStopwatch")
            .removeClass("btn-outline-brand")
            .addClass("btn-outline-warning");
          $(".startStopwatch").html("<i class='fa fa-clock'></i> Check Out");
          $(".startStopwatch").data("status", 2);

          startPause = !startPause;
          clearInterval(interval);
          interval = setInterval(startStopwatchTimer, 1000);

          function startStopwatchTimer() {
            thisSecond++;
            var h = Math.floor(thisSecond / 3600);
            var m = Math.floor((thisSecond % 3600) / 60);
            var s = Math.floor((thisSecond % 3600) % 60);

            var hDisplay =
              h > 0 ? (h < 10 ? "0" + h.toString() : h.toString()) : "00";
            var mDisplay =
              m > 0 ? (m < 10 ? "0" + m.toString() : m.toString()) : "00";
            var sDisplay =
              s > 0 ? (s < 10 ? "0" + s.toString() : s.toString()) : "00";
            $(".timer").text(hDisplay + " : " + mDisplay + " : " + sDisplay);
          }
        } else {
          $(".startStopwatch")
            .removeClass("btn-outline-warning")
            .addClass("btn-outline-brand");
          $(".startStopwatch").html("<i class='fa fa-clock'></i> Check IN");
          $(".startStopwatch").data("status", 1);
          clearInterval(interval);
          startPause = !startPause;
        }
      }
    };

    return {
      // public functions
      init: function (sec, is_checked_in) {
        demos(sec, is_checked_in);
        // demos1();
      },
    };
  })();

  return (
    <React.Fragment>
      <Col xxl={6} md={6}>
        <Button
          outline
          className="custom-toggle btn-outline-secondary"
          onClick={(e) => favouriteBtn(e.target)}>
          <span className="icon-on">
            <i className="ri-time-line align-bottom me-1"></i> Check IN
          </span>
          <span className="icon-off">
            <i className="ri-time-fill align-bottom me-1"></i> Check OUT
          </span>
        </Button>

        <span
          className="ms-1 mt-1"
          style={{
            fontSize: "initial",
            fontWeight: 700,
          }}>
          &nbsp;
          <span class="timer">00 : 00 : 00</span>
        </span>
      </Col>
    </React.Fragment>
  );
};

export default WebCheckInOutBtn;
