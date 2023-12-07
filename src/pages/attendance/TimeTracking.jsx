import React from "react";
import { Button, Card, CardBody } from "reactstrap";

const TimeTracking = () => {
  const checkInOutToggle = (ele) => {
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
      <Card style={{ height: "325px" }}>
        <CardBody className="text-center">
          <h6 className="card-title mb-3 flex-grow-1 text-start">
            Date : 10 Dec 2023
          </h6>
          <div className="mb-2">
            <lord-icon
              src="https://cdn.lordicon.com/kbtmbyzy.json"
              trigger="loop"
              colors="primary:#405189,secondary:#02a8b5"
              style={{ width: "90px", height: "90px" }}
            ></lord-icon>
          </div>
          <h3 className="mb-1">07 : 35 : 15</h3>
          <h5 className="fs-14 mb-4">
            First In : <b> 08:25 am</b>
          </h5>
          <div className="hstack gap-2 justify-content-center">
            <Button
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
            </Button>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default TimeTracking;
