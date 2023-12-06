import React from "react";
import { Card, CardBody } from "reactstrap";

const TimeTracking = () => {
  return (
    <React.Fragment>
      <Card>
        <CardBody className="text-center">
          <h6 className="card-title mb-3 flex-grow-1 text-start">
            Date
          </h6>
          <div className="mb-2">
            <lord-icon
              src="https://cdn.lordicon.com/kbtmbyzy.json"
              trigger="loop"
              colors="primary:#405189,secondary:#02a8b5"
              style={{ width: "90px", height: "90px" }}></lord-icon>
          </div>
          <h3 className="mb-1">9 hrs 13 min</h3>
          <h5 className="fs-14 mb-4">Profile Page Satructure</h5>
          <div className="hstack gap-2 justify-content-center">
            <button className="btn btn-danger btn-sm">
              <i className="ri-stop-circle-line align-bottom me-1"></i> Stop
            </button>
            <button className="btn btn-success btn-sm">
              <i className="ri-play-circle-line align-bottom me-1"></i> Start
            </button>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default TimeTracking;
