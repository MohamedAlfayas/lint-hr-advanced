import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { MetaTitle } from "../../../common/data/MetaTitle";

import TaskList from "./TaskList";
import TaskKanban from "./TaskKanban";

const TaskTab = () => {
  document.title = `Tasks | ${MetaTitle}`;

  // grid = kanban | list = task list
  const [viewType, setViewType] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <React.Fragment>
      <div id="lc_btn" className="page-content">
        <Card>
          <CardBody>
            <Row className="g-2 align-items-center">
              {/* Search */}
              {viewType === "grid" && (
                <Col sm={4}>
                  <div className="search-box">
                    <Input
                      type="text"
                      className="form-control"
                      id="searchMemberList"
                      placeholder="Search for task..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="ri-search-line search-icon"></i>
                  </div>
                </Col>
              )}

              {/* Right Actions */}
              <Col sm="auto" className="ms-auto">
                <div className="list-grid-nav hstack gap-1">
                  {/* Grid / Kanban View */}

                  {/* List View */}
                  <Button
                    type="button"
                    color="soft-info"
                    className={`nav-link btn-icon fs-14 filter-button ${
                      viewType === "list" ? "active" : ""
                    }`}
                    onClick={() => setViewType("list")}
                  >
                    <i className="ri-list-unordered"></i>
                  </Button>
                  <Button
                    type="button"
                    color="soft-info"
                    className={`nav-link btn-icon fs-14 filter-button ${
                      viewType === "grid" ? "active" : ""
                    }`}
                    onClick={() => setViewType("grid")}
                  >
                    <i className="ri-grid-fill"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Content */}
        <div className="mt-3">
          {viewType === "list" ? (
            <TaskList searchQuery={searchQuery} />
          ) : (
            <TaskKanban searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TaskTab;
