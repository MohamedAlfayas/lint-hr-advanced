import React, { useEffect, useMemo, useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import ProjectOverview from "./ProjectOverview";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import Tasks from "../Task/TaskList";
import ProjectsFiles from "./ProjectsFiles";
import {
  CREATE_TASK_ACCESS_KEY,
  EDIT_TASK_ACCESS_KEY,
  CREATE_PROJECT_ACCESS_KEY,
  EDIT_PROJECT_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { project_component_name } from "../../../common/constant/Constants";
import { initialsOf } from "../../../component/common/approval/ApprovalCells";
import "./ProjectDetail.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const hasPermission = (keys) => {
  try {
    const profile = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};
    if (!profile) return false;
    if (profile.is_admin === true) return true;
    const list = Array.isArray(keys) ? keys : [keys];
    return (
      Array.isArray(profile.permission_list) &&
      list.some((k) => profile.permission_list.includes(k))
    );
  } catch {
    return false;
  }
};

const formatDate = (value) => {
  const d = dayjs(value);
  return value && d.isValid() ? d.format("DD MMM YYYY") : null;
};

const dueInfo = (deadline, done) => {
  const d = dayjs(deadline);
  if (!deadline || !d.isValid()) return null;
  if (done) return { tone: "success", icon: "ri-checkbox-circle-line", text: "Completed" };
  const days = d.startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return { tone: "danger", icon: "ri-alarm-warning-line", text: `${-days}d overdue` };
  if (days === 0) return { tone: "warning", icon: "ri-time-line", text: "Due today" };
  return {
    tone: days <= 7 ? "warning" : "info",
    icon: "ri-timer-line",
    text: `${days}d left`,
  };
};

const ProjectSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxProject = useSelector((state) =>
    state.ProjectsReducer.project_data.find((p) => String(p.id) === String(id)),
  );

  const [storedProject, setStoredProject] = useState(null);
  const [loading, setLoading] = useState(!reduxProject);

  useEffect(() => {
    try {
      setLoading(true);
      const found = (GetLocalStorageData("projects") || []).find(
        (p) => String(p.id) === String(id),
      );
      if (found) setStoredProject(found);
    } catch (err) {
      console.error("Error getting project from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const project = reduxProject || storedProject;

  const client = useMemo(() => {
    if (Number(project?.type) !== 2) return null;
    return (GetLocalStorageData("clients") || []).find(
      (c) => Number(c.id) === Number(project?.client),
    );
  }, [project]);

  const hasTaskAccess = hasPermission([CREATE_TASK_ACCESS_KEY, EDIT_TASK_ACCESS_KEY]);
  const canAddFiles = hasPermission([CREATE_PROJECT_ACCESS_KEY]);
  const canEditProject = hasPermission([EDIT_PROJECT_ACCESS_KEY]);

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("activeTab") || "1";
    return saved === "2" && !hasTaskAccess ? "1" : saved;
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

  const handleEditProject = () => {
    if (!project) return;
    dispatch(setFormTitle(project_component_name));
    dispatch(setFormObj(project));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow(project_component_name));
    dispatch(toggleRSBView(true));
  };

  const percent = Math.round(project?.task_status_details?.project_completed_percentage || 0);
  const due = dueInfo(project?.deadline, percent >= 100);
  const isClient = Number(project?.type) === 2;

  const tabs = [
    { id: "1", label: "Overview", icon: "ri-dashboard-line", show: true },
    { id: "2", label: "Task List", icon: "ri-task-line", show: hasTaskAccess },
    { id: "3", label: "Files", icon: "ri-folder-2-line", show: true },
  ].filter((t) => t.show);

  return (
    <React.Fragment>
      <div className="pdx-hero">
        <div className="pdx-hero-main">
          <span className="pdx-hero-logo">
            {initialsOf(project?.title || "P") || <i className="ri-folder-2-line"></i>}
          </span>

          <div className="pdx-hero-text">
            {loading && !project ? (
              <div className="placeholder-glow">
                <span className="placeholder col-6 rounded mb-2 d-block" style={{ height: 22 }}></span>
                <span className="placeholder col-9 rounded d-block" style={{ height: 14 }}></span>
              </div>
            ) : (
              <>
                <div className="pdx-hero-title">
                  <h4 title={project?.title}>{project?.title || "Untitled Project"}</h4>
                  <span className={`apv-status is-${isClient ? "primary" : "info"}`}>
                    <i className={isClient ? "ri-user-star-line" : "ri-building-2-line"}></i>
                    {isClient ? "Client" : "Internal"}
                  </span>
                  {project?.status === false && (
                    <span className="apv-status is-secondary">
                      <i className="ri-forbid-line"></i>Inactive
                    </span>
                  )}
                </div>

                <div className="pdx-hero-meta">
                  {client && (
                    <span>
                      <i className="ri-building-line"></i>
                      {client.name}
                    </span>
                  )}
                  <span>
                    <i className="ri-calendar-line"></i>
                    Created <b>{formatDate(project?.created_on) || "N/A"}</b>
                  </span>
                  <span>
                    <i className="ri-flag-line"></i>
                    Due <b>{formatDate(project?.deadline) || "N/A"}</b>
                  </span>
                  {due && (
                    <span className={`apv-status is-${due.tone}`}>
                      <i className={due.icon}></i>
                      {due.text}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="pdx-hero-actions">
            {canEditProject && activeTab === "1" && (
              <button data-testid="project-detail-edit-project-button" type="button" className="btn btn-primary btn-sm" onClick={handleEditProject}>
                <i className="ri-edit-line align-bottom me-1"></i>Edit Project
              </button>
            )}
            <button
              data-testid="project-detail-back-button"
              type="button"
              className="btn btn-soft-secondary btn-sm"
              onClick={() => navigate(-1)}
            >
              <i className="ri-arrow-left-line align-bottom me-1"></i>Back
            </button>
          </div>
        </div>

        <div className="pdx-hero-foot">
          <div className="pdx-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                data-testid={testId("project-detail", itemTestKey(t), "button")}
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`pdx-tab${activeTab === t.id ? " is-active" : ""}`}
                onClick={() => toggleTab(t.id)}
              >
                <i className={t.icon}></i>
                {t.label}
              </button>
            ))}
          </div>

          <div className="pdx-hero-progress" title={`${percent}% of tasks completed`}>
            <span>Progress</span>
            <span className={`apv-progress is-${percent >= 100 ? "success" : "primary"}`}>
              <span style={{ width: `${percent}%` }} />
            </span>
            <b>{percent}%</b>
          </div>
        </div>
      </div>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <ProjectOverview projectId={id} />
        </TabPane>
        {hasTaskAccess && (
          <TabPane tabId="2">
            <Tasks projectId={id} />
          </TabPane>
        )}
        <TabPane tabId="3">
          <ProjectsFiles projectId={id} canAddFiles={canAddFiles} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  );
};

export default ProjectSection;
