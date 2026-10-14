import React, { useEffect, useMemo, useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import Tasks from "../Task/TaskList";
import Projects from "../Projects/Projects";
import { initialsOf } from "../../../component/common/approval/ApprovalCells";
import "../Projects/ProjectDetail.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const formatDate = (value) => {
  const d = dayjs(value);
  return value && d.isValid() ? d.format("DD MMM YYYY") : null;
};

const ClientSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const reduxClient = useSelector((state) =>
    state.ClientReducer.client_data.find((p) => String(p.id) === String(id)),
  );
  const { project_data } = useSelector((state) => state.ProjectsReducer);

  const [storedClient, setStoredClient] = useState(null);
  const [loading, setLoading] = useState(!reduxClient);

  useEffect(() => {
    try {
      setLoading(true);
      const found = (GetLocalStorageData("clients") || []).find(
        (p) => String(p.id) === String(id),
      );
      if (found) setStoredClient(found);
    } catch (err) {
      console.error("Error getting Client from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const client = reduxClient || storedClient;

  const owner = useMemo(
    () =>
      (GetLocalStorageData("employee") || []).find(
        (e) => String(e.id) === String(client?.owner),
      ),
    [client],
  );

  const projectCount = useMemo(
    () =>
      (project_data?.length ? project_data : GetLocalStorageData("projects") || []).filter(
        (p) => Number(p.type) === 2 && Number(p.client) === Number(id),
      ).length,
    [project_data, id],
  );

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

  const location = [client?.city, client?.state, client?.country].filter(Boolean).join(", ");
  const phone = client?.phone_number
    ? `${client?.country_code || ""} ${client.phone_number}`.trim()
    : "";
  const website = client?.website || "";
  const created = formatDate(client?.created_on ?? client?.updated_on);

  const tabs = [
    { id: "1", label: "Projects", icon: "ri-folder-2-line", count: projectCount },
    { id: "2", label: "Task List", icon: "ri-task-line" },
  ];

  return (
    <React.Fragment>
      <div className="pdx-hero">
        <div className="pdx-hero-main">
          <span className="pdx-hero-logo is-client">
            {initialsOf(client?.name || "") || <i className="ri-building-line"></i>}
          </span>

          <div className="pdx-hero-text">
            {loading && !client ? (
              <div className="placeholder-glow">
                <span className="placeholder col-6 rounded mb-2 d-block" style={{ height: 22 }}></span>
                <span className="placeholder col-9 rounded d-block" style={{ height: 14 }}></span>
              </div>
            ) : (
              <>
                <div className="pdx-hero-title">
                  <h4 title={client?.name}>{client?.name || "Untitled client"}</h4>
                  <span className="apv-status is-primary">
                    <i className="ri-user-star-line"></i>Client
                  </span>
                  {client && (
                    <span className={`apv-status is-${client.status === false ? "secondary" : "success"}`}>
                      <i className={client.status === false ? "ri-forbid-line" : "ri-checkbox-circle-line"}></i>
                      {client.status === false ? "Inactive" : "Active"}
                    </span>
                  )}
                </div>

                <div className="pdx-hero-meta">
                  {location && (
                    <span>
                      <i className="ri-map-pin-line"></i>
                      {location}
                    </span>
                  )}
                  {phone && (
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} data-testid="client-detail-phone-link">
                      <i className="ri-phone-line"></i>
                      {phone}
                    </a>
                  )}
                  {website && (
                    <a
                      data-testid="client-detail-website-link"
                      href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="ri-global-line"></i>
                      {website.replace(/^https?:\/\//i, "")}
                    </a>
                  )}
                  {owner && (
                    <span>
                      <i className="ri-user-star-line"></i>
                      Owner <b>{[owner.first_name, owner.last_name].filter(Boolean).join(" ")}</b>
                    </span>
                  )}
                  <span>
                    <i className="ri-calendar-line"></i>
                    Created <b>{created || "N/A"}</b>
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="pdx-hero-actions">
            <button
              data-testid="client-detail-back-button"
              type="button"
              className="btn btn-soft-secondary btn-sm"
              onClick={() => navigate("/clients")}
            >
              <i className="ri-arrow-left-line align-bottom me-1"></i>Back
            </button>
          </div>
        </div>

        <div className="pdx-hero-foot">
          <div className="pdx-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                data-testid={testId("client-detail", itemTestKey(t), "button")}
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`pdx-tab${activeTab === t.id ? " is-active" : ""}`}
                onClick={() => toggleTab(t.id)}
              >
                <i className={t.icon}></i>
                {t.label}
                {t.count != null && <span className="pdx-tab-count">{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Projects clientId={id} />
        </TabPane>
        <TabPane tabId="2">
          <Tasks clientId={id} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  );
};

export default ClientSection;
