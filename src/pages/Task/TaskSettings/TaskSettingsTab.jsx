import React, { useEffect, useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import { useSelector } from "react-redux";

import Status from "../Status/Status";
import Priorities from "../Priorities/Priorities";
import "./TaskSettingsTab.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const TaskSettingsTab = () => {
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

  const { status_data } = useSelector((state) => state.StatusReducer);
  const { Priorities_data } = useSelector((state) => state.PrioritiesReducer);

  const tabs = [
    {
      id: "1",
      label: "Status",
      icon: "ri-checkbox-circle-line",
      count: (status_data || []).length,
    },
    {
      id: "2",
      label: "Priority",
      icon: "ri-flag-2-line",
      count: (Priorities_data || []).length,
    },
  ];

  return (
    <React.Fragment>
      <div className="tst-head">
        <div className="tst-title">
          <span className="tst-title-icon">
            <i className="ri-settings-4-line"></i>
          </span>
          <div>
            <h5>Task Settings</h5>
            <p>Manage the statuses and priorities used across tasks</p>
          </div>
        </div>

        <div className="tst-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              data-testid={testId("task-settings", itemTestKey(t), "button")}
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={`tst-tab${activeTab === t.id ? " is-active" : ""}`}
              onClick={() => toggleTab(t.id)}
            >
              <i className={t.icon}></i>
              {t.label}
              <span className="tst-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Status />
        </TabPane>
        <TabPane tabId="2">
          <Priorities />
        </TabPane>
      </TabContent>
    </React.Fragment>
  );
};

export default TaskSettingsTab;
