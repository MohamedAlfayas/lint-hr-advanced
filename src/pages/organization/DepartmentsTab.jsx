import React, { useEffect, useMemo, useState } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import { useDispatch, useSelector } from "react-redux";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
// Prime React Css
import "primereact/resources/themes/lara-light-indigo/theme.css";

// Prime React Minified Css
import "primereact/resources/primereact.min.css";

import OrgModal from "./common/OrgModal";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setDepartmentDetails } from "../../redux/reducers/ChildReducer/DepartmentReducer";

import {
  CREATE_DEPARTMENT_ACCESS_KEY,
  EDIT_DEPARTMENT_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";
import { initialsOf } from "../../component/common/approval/ApprovalCells";
import "./DepartmentsTab.scss";
import { testId } from "../../shared/testing/testId";

const LEVEL_TONES = ["primary", "success", "info", "warning", "purple", "pink"];
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;

const MemberAvatar = ({ member }) => {
  const [broken, setBroken] = useState(false);
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ");
  return member.profile_url && !broken ? (
    <img src={member.profile_url} alt={name} title={name} onError={() => setBroken(true)} />
  ) : (
    <span title={name}>{member.first_name?.charAt(0)?.toUpperCase() || "?"}</span>
  );
};

const DepartmentsTab = () => {
  const EmployeeData = GetLocalStorageData("employee");

  const dispatch = useDispatch();

  const newDepObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      description: "",
      is_location_required: true,
      allow_only_mobile_checkin: false,
      pid: 0,
      child_id_list: [],
    };
  }, []);

  const handleDepartmentCreateOrEdit = ($id, obj) => {
    const depObj = $id === 0 ? newDepObj : obj;
    dispatch(setFormTitle("Departments"));
    dispatch(setFormObj(depObj));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow("department"));
    dispatch(toggleRSBView(true));
  };

  const { department_data } = useSelector((state) => state.DepartmentReducer);

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setShowCreateBtn(CheckRoleAccess(CREATE_DEPARTMENT_ACCESS_KEY));
    setShowEditBtn(CheckRoleAccess(EDIT_DEPARTMENT_ACCESS_KEY));

    dispatch(
      setDepartmentDetails(GetLocalStorageData("department_details") || []),
    );
  }, []);

  const [showOrgModal, setShowOrgModal] = useState(false);
  function toggleOrgModal() {
    setShowOrgModal(!showOrgModal);
  }

  const [departmentId, setDepartmentId] = useState(0);
  const [departmentName, setDepartmentName] = useState(0);

  const activeEmployees = useMemo(
    () => (EmployeeData || []).filter((d) => d.is_active === true),
    [EmployeeData],
  );

  const { departmentCount, levelById, maxDepth } = useMemo(() => {
    const levels = {};
    let count = 0;
    let deepest = 0;
    const walk = (nodes = [], depth = 0) =>
      nodes.forEach((n) => {
        count += 1;
        levels[n.id] = depth;
        deepest = Math.max(deepest, depth);
        walk(n.children, depth + 1);
      });
    walk(department_data);
    return { departmentCount: count, levelById: levels, maxDepth: deepest + 1 };
  }, [department_data]);

  const openDepartment = (node) => {
    setDepartmentId(node.id);
    setDepartmentName(node.name);
    toggleOrgModal();
  };

  const changeZoom = (delta) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10)));

  const nodeTemplate = (node) => {
    const members = activeEmployees.filter((d) =>
      (d.primary_department_id_list || []).includes(node.id),
    );
    const isRoot = !node.pid;
    const level = levelById[node.id] ?? 0;
    const tone = isRoot ? "root" : LEVEL_TONES[(level - 1) % LEVEL_TONES.length];
    const subCount = (node.children || []).length;
    const shown = members.slice(0, 4);
    const label = node.label || node.name || "Department";

    return (
      <div className={`org-node is-${tone}`} style={{ animationDelay: `${Math.min(level, 6) * 90}ms` }}>
        <div className="org-node-top">
          <span className="org-node-icon">
            {isRoot ? <i className="ri-building-2-line" /> : initialsOf(label) || "D"}
          </span>
          <div className="org-node-title">
            <button type="button" title={label} onClick={() => openDepartment(node)} data-testid={testId("department-node", label, "button")}>
              {label}
            </button>
            <small>
              {isRoot ? "Organization" : node.data?.department_type || `Level ${level} department`}
            </small>
          </div>
          <div className="org-node-actions">
            <button data-testid="department-view-employees-button" type="button" title="View employees" onClick={() => openDepartment(node)}>
              <i className="ri-eye-line" />
            </button>
            {showEditBtn && (
              <button
                data-testid="department-edit-department-button"
                type="button"
                title="Edit department"
                onClick={() => handleDepartmentCreateOrEdit(node.id, node)}
              >
                <i className="ri-pencil-line" />
              </button>
            )}
          </div>
        </div>

        <div className="org-node-foot">
          {members.length ? (
            <div
              className="org-node-people"
              title={members.map((m) => [m.first_name, m.last_name].filter(Boolean).join(" ")).join(", ")}
            >
              {shown.map((m) => (
                <MemberAvatar key={m.id} member={m} />
              ))}
              {members.length > shown.length && <span className="is-more">+{members.length - shown.length}</span>}
            </div>
          ) : (
            <span className="org-node-empty">No employees</span>
          )}
          <div className="org-node-stats">
            {subCount > 0 && (
              <span className="org-chip is-sub" title={`${subCount} sub-department${subCount === 1 ? "" : "s"}`}>
                <i className="ri-node-tree" />
                {subCount}
              </span>
            )}
            <span className={`org-chip${members.length ? "" : " is-zero"}`} title={`${members.length} employees`}>
              <i className="ri-team-line" />
              {members.length}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="org-shell">
        <div className="org-head">
          <div className="org-head-title">
            <span className="org-head-icon">
              <i className="ri-organization-chart" />
            </span>
            <div>
              <h5>Departments</h5>
              <p>Organization structure and team distribution</p>
            </div>
          </div>

          <div className="org-head-stats">
            <span>
              <i className="ri-git-merge-line" />
              <b>{departmentCount}</b> Departments
            </span>
            <span>
              <i className="ri-team-line" />
              <b>{activeEmployees.length}</b> Active employees
            </span>
            <span>
              <i className="ri-node-tree" />
              <b>{maxDepth}</b> Levels
            </span>
          </div>

          {showCreateBtn && (
            <button
              data-testid="department-new-department-button"
              type="button"
              className="btn btn-success btn-sm org-new-btn"
              onClick={() => handleDepartmentCreateOrEdit(0)}
            >
              <i className="ri-add-line align-bottom me-1" />
              New Department
            </button>
          )}
        </div>

        <div className="org-canvas-wrap">
          <div className="org-zoom">
            <button data-testid="department-zoom-out-button" type="button" title="Zoom out" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN}>
              <i className="ri-zoom-out-line" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button data-testid="department-zoom-in-button" type="button" title="Zoom in" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX}>
              <i className="ri-zoom-in-line" />
            </button>
            <button data-testid="department-reset-zoom-button" type="button" title="Reset zoom" onClick={() => setZoom(1)} disabled={zoom === 1}>
              <i className="ri-focus-3-line" />
            </button>
          </div>

          <div className="org-canvas">
          {department_data.length ? (
            <div className="org-stage" style={{ zoom }}>
              <OrganizationChart value={department_data} nodeTemplate={nodeTemplate} />
            </div>
          ) : (
            <div className="org-empty">
              <span>
                <i className="ri-organization-chart" />
              </span>
              <p>No departments yet</p>
              {showCreateBtn && (
                <button
                  data-testid="department-create-the-first-department-button"
                  type="button"
                  className="btn btn-soft-success btn-sm"
                  onClick={() => handleDepartmentCreateOrEdit(0)}
                >
                  <i className="ri-add-line align-bottom me-1" />
                  Create the first department
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      <OrgModal
        showOrgModal={showOrgModal}
        toggleOrgModal={toggleOrgModal}
        departmentId={departmentId}
        organizationName={departmentName}
      />
    </React.Fragment>
  );
};

export default DepartmentsTab;
