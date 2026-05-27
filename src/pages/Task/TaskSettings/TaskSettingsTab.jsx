import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

//import images
import slack from "../../../assets/images/brands/slack.png";
import Status from "../Status/Status";
import Priorities from "../Priorities/Priorities";
import { useSelector } from "react-redux";

const TaskSettingsTab = () => {
  //Tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      localStorage.setItem("activeTab", tab); // ✅ save tab
    }
  };
  useEffect(() => {
    return () => {
      localStorage.removeItem("activeTab");
    };
  }, []);
  const { company_detail } = useSelector((state) => state.CompanyReducer);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card style={{ marginTop: "70px" }}>
            <div className="bg-info-subtle">
              <CardBody className="pb-0 px-4">
                <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "1" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("1");
                      }}
                      href="#"
                    >
                      Status
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "2" },
                        "fw-semibold",
                      )}
                      onClick={() => {
                        toggleTab("2");
                      }}
                      href="#"
                    >
                      Priority
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <TabContent activeTab={activeTab} className="text-muted">
            <TabPane tabId="1">
              <Status />
            </TabPane>
            <TabPane tabId="2">
              <Priorities />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TaskSettingsTab;
