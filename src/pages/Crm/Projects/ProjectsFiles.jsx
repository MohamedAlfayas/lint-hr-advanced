import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import FilesList from "./Files/FilesList";
import { Folder } from "react-feather";
import Folders from "./Files/Folders";

const ProjectsFiles = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <React.Fragment>
      <Col xxl={12}>
        <Card className="card-height-100">
          {/* ✅ Header Left Align */}
          <CardHeader className="d-flex justify-content-start">
            <Nav
              className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
              role="tablist"
            >
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  Files List
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                >
                  Folders
                </NavLink>
              </NavItem>
            </Nav>
          </CardHeader>

          <CardBody className="p-0">
            <TabContent activeTab={activeTab} className="text-muted">
              <TabPane tabId="1">
                <FilesList projectId={projectId} />
              </TabPane>

              <TabPane tabId="2">
                <Folders projectId={projectId} />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default ProjectsFiles;
