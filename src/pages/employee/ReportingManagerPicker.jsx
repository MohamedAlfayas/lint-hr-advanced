import React, { useMemo, useState } from "react";
import { Modal } from "reactstrap";
import { testId } from "../../shared/testing/testId";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const TONES = ["primary", "success", "info", "warning", "danger", "violet"];
const toneFor = (seed = "") => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return TONES[sum % TONES.length];
};

const fullName = (emp) =>
  `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || emp?.name || "Unknown";

const initials = (emp) => {
  const f = emp?.first_name?.[0] || "";
  const l = emp?.last_name?.[0] || "";
  return (f + l).toUpperCase() || fullName(emp).charAt(0).toUpperCase();
};

// Falls back to initials when the photo URL is missing or broken
const PersonAvatar = ({ emp, size = 40 }) => {
  const [broken, setBroken] = useState(false);
  const name = fullName(emp);
  if (emp?.profile_url && !broken) {
    return (
      <img
        src={emp.profile_url}
        alt={name}
        className="rmp-avatar"
        style={{ width: size, height: size }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      className={`rmp-avatar rmp-avatar-${toneFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(emp)}
    </span>
  );
};

const ReportingManagerPicker = ({
  isOpen,
  onClose,
  employees = [],
  employee,
  currentManagerId,
  search,
  onSearch,
  onSelect,
}) => {
  const departments = GetLocalStorageData("department") || [];

  const deptName = (emp) => {
    const ids = emp?.primary_department_id_list || [];
    const first = departments.find((d) => ids.includes(d.id));
    return first?.name || "";
  };

  const currentManager = useMemo(
    () => employees.find((e) => e.id === currentManagerId) || employee?.reporting_manager_info,
    [employees, currentManagerId, employee],
  );

  const list = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (employees || [])
      .filter(
        (emp) =>
          emp.is_active === true &&
          emp.id !== employee?.id &&
          `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.emp_id}`.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (a.id === currentManagerId) return -1;
        if (b.id === currentManagerId) return 1;
        return fullName(a).localeCompare(fullName(b));
      });
  }, [employees, employee, search, currentManagerId]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered className="rmp-modal" data-testid="reporting-manager-picker-dialog">
      <div className="rmp-head">
        <span className="rmp-head-icon">
          <i className="ri-organization-chart" />
        </span>
        <div className="rmp-head-text">
          <h5>Select Reporting Manager</h5>
          <p>
            {employee ? (
              <>
                For <strong>{fullName(employee)}</strong>
                {employee.emp_id ? <span className="rmp-id">#{employee.emp_id}</span> : null}
              </>
            ) : (
              "Choose who this employee reports to"
            )}
          </p>
        </div>
        <button type="button" className="rmp-close" onClick={onClose} aria-label="Close" data-testid="reporting-manager-picker-close-button">
          <i className="ri-close-line" />
        </button>
      </div>

      {currentManager && (
        <div className="rmp-current">
          <span className="rmp-current-label">
            <i className="ri-user-star-line" /> Current manager
          </span>
          <div className="rmp-current-person">
            <PersonAvatar emp={currentManager} size={28} />
            <span>{fullName(currentManager)}</span>
          </div>
        </div>
      )}

      <div className="rmp-search">
        <i className="ri-search-line" />
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          autoFocus
          data-testid="reporting-manager-picker-search-input"
        />
        {search ? (
          <button type="button" onClick={() => onSearch("")} aria-label="Clear search" data-testid="reporting-manager-picker-clear-search-button">
            <i className="ri-close-circle-fill" />
          </button>
        ) : null}
      </div>

      <div className="rmp-count">
        {list.length} {list.length === 1 ? "employee" : "employees"}
      </div>

      <div className="rmp-list">
        {list.length ? (
          list.map((emp) => {
            const selected = emp.id === currentManagerId;
            const dept = deptName(emp);
            return (
              <button
                type="button"
                key={emp.id}
                className={`rmp-item ${selected ? "is-selected" : ""}`}
                onClick={() => onSelect(emp)}
                data-testid={testId("reporting-manager-picker-option", emp.emp_id || fullName(emp))}
              >
                <PersonAvatar emp={emp} />
                <div className="rmp-item-info">
                  <div className="rmp-item-name">
                    {fullName(emp)}
                    {emp.emp_id ? <span className="rmp-id">#{emp.emp_id}</span> : null}
                  </div>
                  <div className="rmp-item-meta">
                    <span>
                      <i className="ri-mail-line" />
                      {emp.email}
                    </span>
                    {dept && (
                      <span className="rmp-dept">
                        <i className="ri-building-line" />
                        {dept}
                      </span>
                    )}
                  </div>
                </div>
                {selected ? (
                  <span className="rmp-badge">
                    <i className="ri-check-line" /> Current
                  </span>
                ) : (
                  <span className="rmp-choose">
                    Assign <i className="ri-arrow-right-s-line" />
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="rmp-empty">
            <span>
              <i className="ri-user-search-line" />
            </span>
            <h6>No employees found</h6>
            <p>Try a different name or email.</p>
          </div>
        )}
      </div>

      <style>{`
        .rmp-modal{max-width:560px}
        .rmp-modal .modal-content{overflow:hidden;border-radius:18px}
        .rmp-head{position:relative;display:flex;align-items:center;gap:14px;padding:18px 20px;
          background:linear-gradient(135deg,rgba(var(--vz-primary-rgb),.1),rgba(var(--vz-info-rgb),.05) 60%,transparent);
          border-bottom:1px solid var(--vz-border-color)}
        .rmp-head::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--vz-primary),var(--vz-info))}
        .rmp-head-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:21px;color:#fff;
          background:linear-gradient(135deg,var(--vz-primary),var(--vz-info));box-shadow:0 8px 18px -6px rgba(var(--vz-primary-rgb),.6)}
        .rmp-head-text{flex:1;min-width:0}
        .rmp-head-text h5{margin:0;font-size:16px;font-weight:700;color:var(--vz-heading-color)}
        .rmp-head-text p{margin:3px 0 0;font-size:12.5px;color:var(--vz-secondary-color);display:flex;align-items:center;gap:6px}
        .rmp-head-text strong{color:var(--vz-heading-color);font-weight:600}
        .rmp-close{width:34px;height:34px;border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);
          color:var(--vz-secondary-color);display:grid;place-items:center;font-size:18px;transition:all .18s ease}
        .rmp-close:hover{color:var(--vz-danger);border-color:rgba(var(--vz-danger-rgb),.4);background:rgba(var(--vz-danger-rgb),.08);transform:rotate(90deg)}

        .rmp-current{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:16px 20px 0;padding:10px 12px;
          border-radius:12px;background:rgba(var(--vz-success-rgb),.08);border:1px dashed rgba(var(--vz-success-rgb),.4)}
        .rmp-current-label{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--vz-success);
          display:flex;align-items:center;gap:6px}
        .rmp-current-person{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13.5px;color:var(--vz-heading-color)}

        .rmp-search{position:relative;display:flex;align-items:center;margin:14px 20px 0}
        .rmp-search > i{position:absolute;left:14px;font-size:17px;color:var(--vz-secondary-color);pointer-events:none}
        .rmp-search input{width:100%;height:44px;padding:0 40px 0 42px;border-radius:12px;font-size:14px;outline:none;
          color:var(--vz-body-color);background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color);
          transition:border-color .18s,box-shadow .18s,background .18s}
        .rmp-search input:focus{border-color:var(--vz-primary);background:var(--vz-secondary-bg);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .rmp-search button{position:absolute;right:10px;border:0;background:none;padding:0;font-size:17px;color:var(--vz-secondary-color);line-height:1}
        .rmp-search button:hover{color:var(--vz-danger)}
        .rmp-count{margin:12px 20px 6px;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--vz-secondary-color)}

        .rmp-list{max-height:min(52vh,420px);overflow-y:auto;padding:0 14px 16px}
        .rmp-list::-webkit-scrollbar{width:6px}
        .rmp-list::-webkit-scrollbar-thumb{background:var(--vz-border-color);border-radius:6px}
        .rmp-item{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:4px;text-align:left;
          border-radius:12px;border:1px solid transparent;background:transparent;transition:all .16s ease}
        .rmp-item:hover{background:var(--vz-tertiary-bg);border-color:var(--vz-border-color)}
        .rmp-item.is-selected{background:rgba(var(--vz-success-rgb),.08);border-color:rgba(var(--vz-success-rgb),.45)}
        .rmp-avatar{flex-shrink:0;border-radius:50%;object-fit:cover;display:inline-grid;place-items:center;color:#fff;font-weight:700;
          box-shadow:0 0 0 2px var(--vz-secondary-bg),0 0 0 3px var(--vz-border-color)}
        .rmp-avatar-primary{background:linear-gradient(135deg,#405189,#6a7bd6)}
        .rmp-avatar-success{background:linear-gradient(135deg,#0ab39c,#34d3b9)}
        .rmp-avatar-info{background:linear-gradient(135deg,#299cdb,#6fd0f5)}
        .rmp-avatar-warning{background:linear-gradient(135deg,#f7b84b,#ffc977)}
        .rmp-avatar-danger{background:linear-gradient(135deg,#f06548,#ff8a7a)}
        .rmp-avatar-violet{background:linear-gradient(135deg,#7c5cff,#a58bff)}
        .rmp-item-info{flex:1;min-width:0}
        .rmp-item-name{font-weight:600;font-size:14px;color:var(--vz-heading-color);display:flex;align-items:center;gap:6px}
        .rmp-id{font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;color:var(--vz-secondary-color);background:var(--vz-tertiary-bg)}
        .rmp-item-meta{display:flex;align-items:center;gap:12px;margin-top:2px;font-size:12px;color:var(--vz-secondary-color);min-width:0}
        .rmp-item-meta span{display:inline-flex;align-items:center;gap:4px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rmp-dept{flex-shrink:0}
        .rmp-badge{flex-shrink:0;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:700;
          color:#fff;background:linear-gradient(135deg,#0ab39c,#34d3b9)}
        .rmp-choose{flex-shrink:0;display:inline-flex;align-items:center;font-size:12.5px;font-weight:600;color:var(--vz-primary);
          opacity:0;transform:translateX(-4px);transition:all .16s ease}
        .rmp-item:hover .rmp-choose{opacity:1;transform:none}

        .rmp-empty{text-align:center;padding:30px 10px}
        .rmp-empty span{width:60px;height:60px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;font-size:26px;
          color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.1)}
        .rmp-empty h6{margin:0 0 4px;font-weight:700;color:var(--vz-heading-color)}
        .rmp-empty p{margin:0;font-size:13px;color:var(--vz-secondary-color)}
      `}</style>
    </Modal>
  );
};

export default ReportingManagerPicker;
