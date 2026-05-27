import React from "react";
import { Container } from "reactstrap";
import { MetaTitle } from "../../../common/data/MetaTitle";
import ProjectSection from "./ProjectSection";
const ProjectOverviewTab = () => {
  document.title = `Project Overview | ${MetaTitle || "Lint HR"} `;
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <ProjectSection />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProjectOverviewTab;
