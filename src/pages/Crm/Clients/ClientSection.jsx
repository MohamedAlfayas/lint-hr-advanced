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
import { useParams } from "react-router-dom";
import slack from "../../../assets/images/brands/slack.png";
import { useSelector } from "react-redux";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import Tasks from "../Task/TaskList";
import ClientOverview from "./ClientOverview";
import Clients from "./Clients";
import Projects from "../Projects/Projects";

const ClientSection = () => {
  const { id } = useParams();

  // Try Redux cache first for instant render
  const cachedclient = useSelector((state) =>
    state.ClientReducer.client_data.find((p) => String(p.id) === String(id)),
  );

  const [client, setClient] = useState(cachedclient || null);
  const [loading, setLoading] = useState(!cachedclient);

  // Fetch fresh data from API
  useEffect(() => {
    try {
      setLoading(true);

      const ClientData = GetLocalStorageData("clients") || [];

      const foundClient = ClientData.find((p) => String(p.id) === String(id));

      if (foundClient) {
        setClient(foundClient);
      }
    } catch (err) {
      console.error("Error getting Client from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      localStorage.setItem("activeTab", tab);
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("activeTab");
    };
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card className="mt-n4 mx-n4">
            <div className="bg-info-subtle">
              <CardBody className="pb-0 px-4">
                <Row className="mb-3">
                  <div className="col-md">
                    <Row className="align-items-center g-3">
                      <div className="col-md-auto">
                        <div className="avatar-md">
                          <div className="avatar-title bg-white rounded-circle">
                            <img src={slack} alt="" className="avatar-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md">
                        {loading ? (
                          // Skeleton loader while fetching
                          <div>
                            <div
                              className="placeholder-glow"
                              style={{
                                width: "200px",
                                height: "24px",
                                marginBottom: "8px",
                              }}
                            >
                              <span className="placeholder col-12 rounded"></span>
                            </div>
                            <div
                              className="placeholder-glow"
                              style={{ width: "300px", height: "16px" }}
                            >
                              <span className="placeholder col-12 rounded"></span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="fw-bold">
                              {client?.name || "Untitled client"}
                            </h4>
                            <div className="hstack gap-3 flex-wrap">
                              <div>
                                Create Date:{" "}
                                <span className="fw-medium">
                                  {formatDate(client?.updated_on)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Row>
                  </div>
                </Row>

                <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                  {/* <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "1" },
                        "fw-semibold",
                      )}
                      onClick={() => toggleTab("1")}
                      href="#"
                    >
                      Overview
                    </NavLink>
                  </NavItem> */}
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "1" },
                        "fw-semibold",
                      )}
                      onClick={() => toggleTab("1")}
                      href="#"
                    >
                      Projects
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "2" },
                        "fw-semibold",
                      )}
                      onClick={() => toggleTab("2")}
                      href="#"
                    >
                      Task List
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
            {/* <TabPane tabId="1">
            
              <ClientOverview client={client} loading={loading} clientId={id} />
            </TabPane> */}
            <TabPane tabId="1">
              <Projects clientId={id} />
            </TabPane>
            <TabPane tabId="2">
              <Tasks clientId={id} />
            </TabPane>
            {/* <TabPane tabId="3">
              <ProjectsFiles />
            </TabPane> */}
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ClientSection;
