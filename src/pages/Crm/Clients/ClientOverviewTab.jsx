import React from "react";
import { Container } from "reactstrap";
import { MetaTitle } from "../../../common/data/MetaTitle";
import ClientSection from "./ClientSection";
const ClientOverviewTab = () => {
  document.title = `Client Overview | ${MetaTitle || "Lint HR"} `;
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <ClientSection />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ClientOverviewTab;
