import React from "react";
import { Col, Container, Row } from "reactstrap";
import LeaveTypesWidgets from "./LeaveTypesWidgets";
import HolidayCalenderAPi from "../holidays/HolidayCalenderAPi";

const LeaveDashboard = () => {
  document.title = "Projects | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="project-wrapper">
            <Col xxl={12}>
              <LeaveTypesWidgets />
            </Col>
            <HolidayCalenderAPi />
          </Row>
          <Row></Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default LeaveDashboard;
