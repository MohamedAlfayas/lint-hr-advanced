import React from "react";
import { Container } from "reactstrap";
import Section from "./Section";
import { MetaTitle } from "../../common/data/MetaTitle";
const ProjectOverview = () => {
  document.title = `Organization | ${MetaTitle || "Lint HR"} `;
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Section />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProjectOverview;
