import React, { useMemo, useState } from "react";
import { Modal } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import "./OrgModal.scss";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const TONES = ["primary", "success", "info", "warning", "danger", "secondary"];

const fullName = (e) => [e?.first_name, e?.last_name].filter(Boolean).join(" ") || "-";

const toneOf = (seed) => {
  const s = String(seed || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
};

const Avatar = ({ employee, size = "md" }) => {
  const [broken, setBroken] = useState(false);
  const name = fullName(employee);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <span className={`orgm-avatar is-${size} tone-${toneOf(employee?.id ?? name)}`}>
      {employee?.profile_url && !broken ? (
        <img src={employee.profile_url} alt={name} onError={() => setBroken(true)} />
      ) : (
        initials || "?"
      )}
    </span>
  );
};

const OrgModal = ({ showOrgModal, toggleOrgModal, departmentId, organizationName }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");

  const members = useMemo(() => {
    if (!showOrgModal) return [];
    const employees = GetLocalStorageData("employee") || [];
    const roles = GetLocalStorageData("role") || [];
    return employees
      .filter(
        (e) => e.is_active === true && (e.primary_department_id_list || []).includes(departmentId),
      )
      .map((e) => ({
        ...e,
        name: fullName(e),
        role: roles.find((r) => r.id === e.role_id)?.name || "",
        manager: employees.find((m) => m.id === e.reporting_manager_id) || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [showOrgModal, departmentId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.email, m.emp_id, m.role, m.manager && fullName(m.manager)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [members, query]);

  const stats = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.id));
    const leads = new Set(
      members.filter((m) => memberIds.has(m.reporting_manager_id)).map((m) => m.reporting_manager_id),
    );
    const roleCount = new Set(members.map((m) => m.role).filter(Boolean)).size;
    return { total: members.length, leads: leads.size, roles: roleCount };
  }, [members]);

  const close = () => {
    setQuery("");
    toggleOrgModal();
  };

  const openEmployee = (m) => {
    if (!m?.emp_uuid) return;
    close();
    navigate(`/employee/view/${m.emp_uuid}`);
  };

  return (
    <Modal
      data-testid="org-modal-show-org-dialog"
      isOpen={showOrgModal}
      toggle={close}
      size="lg"
      centered
      scrollable
      className="orgm-modal"
      contentClassName="orgm-content"
    >
      <div className="orgm-hero">
        <span className="orgm-hero-icon">
          <i className="ri-team-line" />
        </span>
        <div className="orgm-hero-text">
          <h5 className="orgm-hero-title" title={organizationName}>
            {organizationName}
          </h5>
          <span className="orgm-hero-sub">Department members</span>
        </div>
        <button data-testid="org-modal-show-org-close-button" type="button" className="orgm-close" onClick={close} aria-label="Close">
          <i className="ri-close-line" />
        </button>

        <div className="orgm-stats">
          <div className="orgm-stat">
            <i className="ri-team-line" />
            <b>{stats.total}</b>
            <span>Members</span>
          </div>
          <div className="orgm-stat">
            <i className="ri-user-star-line" />
            <b>{stats.leads}</b>
            <span>Team leads</span>
          </div>
          <div className="orgm-stat">
            <i className="ri-shield-user-line" />
            <b>{stats.roles}</b>
            <span>Roles</span>
          </div>
        </div>
      </div>

      <div className="orgm-toolbar">
        <label className="orgm-search">
          <i className="ri-search-line" />
          <input
            data-testid="org-modal-show-org-search-by-name-email-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, ID, role or manager"
          />
          {query && (
            <button data-testid="org-modal-show-org-clear-search-button" type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <i className="ri-close-circle-fill" />
            </button>
          )}
        </label>
        <span className="orgm-count">
          {filtered.length} of {members.length}
        </span>
        <div className="orgm-view">
          <button
            data-testid="org-modal-show-org-grid-view-button"
            type="button"
            className={view === "grid" ? "is-active" : ""}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            <i className="ri-layout-grid-line" />
          </button>
          <button
            data-testid="org-modal-show-org-list-view-button"
            type="button"
            className={view === "list" ? "is-active" : ""}
            onClick={() => setView("list")}
            title="List view"
          >
            <i className="ri-list-unordered" />
          </button>
        </div>
      </div>

      <div className="orgm-body">
        {filtered.length ? (
          <div className={`orgm-members is-${view}`}>
            {filtered.map((m, i) => (
              <button
                data-testid={testId("org-modal-show-org", itemTestKey(m), "button")}
                type="button"
                key={m.id}
                className="orgm-card"
                style={{ "--i": Math.min(i, 14) }}
                onClick={() => openEmployee(m)}
              >
                <Avatar employee={m} size={view === "grid" ? "lg" : "md"} />
                <span className="orgm-card-main">
                  <span className="orgm-card-name" title={m.name}>
                    {m.name}
                    {m.emp_id && <span className="orgm-card-id">{m.emp_id}</span>}
                  </span>
                  {m.role && <span className="orgm-card-role">{m.role}</span>}
                  {m.email && (
                    <span className="orgm-card-mail" title={m.email}>
                      <i className="ri-mail-line" />
                      {m.email}
                    </span>
                  )}
                </span>
                <span className="orgm-card-manager" title={m.manager ? `Reports to ${fullName(m.manager)}` : ""}>
                  {m.manager ? (
                    <>
                      <span className="orgm-card-manager-label">
                        <i className="ri-user-shared-line" />
                        Reports to
                      </span>
                      <span className="orgm-card-manager-who">
                        <Avatar employee={m.manager} size="xs" />
                        <span>{fullName(m.manager)}</span>
                      </span>
                    </>
                  ) : (
                    <span className="orgm-card-manager-label is-none">No manager</span>
                  )}
                </span>
                <i className="ri-arrow-right-s-line orgm-card-go" />
              </button>
            ))}
          </div>
        ) : (
          <div className="orgm-empty">
            <span>
              <i className="ri-user-search-line" />
            </span>
            <h6>{members.length ? "No matching members" : "No members yet"}</h6>
            <p>
              {members.length
                ? "Try a different name, email or role."
                : "Employees assigned to this department will appear here."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrgModal;
