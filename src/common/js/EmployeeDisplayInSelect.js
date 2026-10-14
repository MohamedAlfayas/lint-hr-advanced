import { useState } from "react";
import { components } from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const departmentData = GetLocalStorageData("department") || [];

/** Round profile photo with an initials fallback; falls back again if the image fails to load. */
export const EmployeeSelectAvatar = ({ employee, label, size = 30, isGroup = false }) => {
  const [broken, setBroken] = useState(false);
  const name = employee?.first_name || label || "?";
  const initials = isGroup
    ? (label || "?").charAt(0)
    : `${name.charAt(0)}${(employee?.last_name || "").charAt(0)}`;
  const base = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: "50%",
  };

  if (!isGroup && employee?.profile_url && !broken) {
    return (
      <img
        src={employee.profile_url}
        alt=""
        onError={() => setBroken(true)}
        style={{ ...base, objectFit: "cover", boxShadow: "0 0 0 2px var(--vz-secondary-bg)" }}
      />
    );
  }

  return (
    <span
      title={label}
      style={{
        ...base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--vz-success, #0ab39c)",
        color: "#fff",
        fontWeight: 700,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        textTransform: "uppercase",
      }}
    >
      {isGroup ? <i className="ri-team-line" /> : initials}
    </span>
  );
};

/** react-select Option for employee lists: photo, name, employee ID and primary department. */
export const EmployeeDisplayInSelect = (props) => {
  const { data, label, isFocused, isSelected, innerProps } = props;
  const employee = data?.data && typeof data.data === "object" ? { ...data.data, ...data } : data;
  const isGroup = employee?.id === "0" || employee?.id === 0;
  const departmentId = employee?.primary_department_id_list?.[0];
  const departmentName =
    !isGroup && departmentId !== undefined
      ? departmentData.find((d) => Number(d.id) === Number(departmentId))?.name
      : "";

  const background = isSelected
    ? "color-mix(in srgb, var(--vz-success) 16%, transparent)"
    : isFocused
      ? "var(--vz-tertiary-bg)"
      : "transparent";

  return (
    <components.Option
      {...props}
      innerProps={{
        ...innerProps,
        style: {
          ...innerProps?.style,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 10px",
          backgroundColor: background,
          color: "var(--vz-body-color)",
          cursor: "pointer",
        },
      }}
    >
      <EmployeeSelectAvatar employee={employee} label={label} isGroup={isGroup} />
      <div style={{ minWidth: 0, lineHeight: 1.25 }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span style={{ fontWeight: 600, color: "var(--vz-heading-color)" }}>{label}</span>
          {employee?.emp_id && !String(label).includes(employee.emp_id) && (
            <span style={{ fontSize: 11, color: "var(--vz-secondary-color)" }}>
              {" "}
              - {employee.emp_id}
            </span>
          )}
        </div>
        {departmentName && (
          <div style={{ fontSize: 11, color: "var(--vz-secondary-color)", marginTop: 1 }}>
            {departmentName}
          </div>
        )}
      </div>
      {isSelected && (
        <i
          className="ri-check-line"
          style={{ marginLeft: "auto", color: "var(--vz-success)", fontSize: 16 }}
        />
      )}
    </components.Option>
  );
};
