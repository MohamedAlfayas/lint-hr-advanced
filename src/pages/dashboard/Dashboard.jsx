import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "../../component/widget/Widgets";
import Section from "../../component/section/Section";
import { MetaTitle } from "../../common/data/MetaTitle";
import EmployeeActivity from "./EmployeeActivity";

const Dashboard = () => {
  document.title = `Dashboard | ${MetaTitle || "Lint HR"}`;

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <Section rightClickBtn={toggleRightColumn} />
                <Row>
                  <Widget />
                </Row>
              </div>
            </Col>
            <EmployeeActivity
              rightColumn={rightColumn}
              hideRightColumn={toggleRightColumn}
            />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
