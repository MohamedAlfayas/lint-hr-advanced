import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "../../component/widget/Widgets";
import Section from "../../component/section/Section";

const Dashboard = () => {
  document.title = "Dashboard | Velzon - React Admin & Dashboard Template";

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
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
