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
import { useParams, useNavigate  } from "react-router-dom";
import slack from "../../../assets/images/brands/slack.png";
import ProjectOverview from "./ProjectOverview";
import { useSelector } from "react-redux";
import { GetApi } from "../../../common/api/GetApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import Tasks from "../Task/TaskList";
import ProjectsFiles from "./ProjectsFiles";

const ProjectSection = () => {
  const { id } = useParams();
   const navigate = useNavigate();

  // Try Redux cache first for instant render
  const cachedProject = useSelector((state) =>
    state.ProjectsReducer.project_data.find((p) => String(p.id) === String(id)),
  );

  const [project, setProject] = useState(cachedProject || null);
  const [loading, setLoading] = useState(!cachedProject);

  // Fetch fresh data from API
  useEffect(() => {
    try {
      setLoading(true);

      const ProjectData = GetLocalStorageData("projects") || [];

      const foundProject = ProjectData.find((p) => String(p.id) === String(id));

      if (foundProject) {
        setProject(foundProject);
      }
    } catch (err) {
      console.error("Error getting project from localStorage:", err);
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
                <Row className="mb-3" align-items-end>
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
                              {project?.title || "Untitled Project"}
                            </h4>
                            <div className="hstack gap-3 flex-wrap">
                              <div>
                                Create Date:{" "}
                                <span className="fw-medium">
                                  {formatDate(project?.created_on)}
                                </span>
                              </div>
                              <div className="vr"></div>
                              <div>
                                Due Date:{" "}
                                <span className="fw-medium">
                                  {formatDate(project?.deadline)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                                            </div>
                    </Row>
                  </div>
                  <div className="col-md-auto ms-auto me-3">
                    <button
                      type="button"
                      className="btn btn btn-primary"
                      onClick={() => navigate(-1)}
                    >
                      <i className="ri-arrow-left-line align-bottom me-1"></i>
                      Back
                    </button>
                  </div>
                </Row>

                <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                  <NavItem>
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
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "3" },
                        "fw-semibold",
                      )}
                      onClick={() => toggleTab("3")}
                      href="#"
                    >
                      Files
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
              {/* Pass project down so ProjectOverview doesn't need to re-fetch */}
              <ProjectOverview
                project={project}
                loading={loading}
                projectId={id}
              />
            </TabPane>
            <TabPane tabId="2">
              <Tasks projectId={id} />
            </TabPane>
            <TabPane tabId="3">
              <ProjectsFiles projectId={id} />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectSection;
