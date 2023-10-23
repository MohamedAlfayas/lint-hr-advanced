import React, { useState } from "react";
import { Button, Col } from "reactstrap";

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
          <span class="timer">239 : 51 : 47</span>
        </span>
      </Col>
    </React.Fragment>
  );
};

export default WebCheckInOutBtn;
