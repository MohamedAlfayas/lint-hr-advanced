import { GetLocalStorageData } from "../../../../meta/GetLocalStorageData";

export const getLabel = (storageKey, id, labelField = "name") => {
  const list = GetLocalStorageData(storageKey) || [];
  const found = list.find((item) => item.id === id);
  return found ? found[labelField] : "-";
};

export const getEmployeeName = (id) => {
  const employees = GetLocalStorageData("employee") || [];
  const emp = employees.find((e) => e.id === id);
  if (!emp) return "-";
  return (
    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.name || "-"
  );
};
export const getEmployeeProfile = (id) => {
  const employees = GetLocalStorageData("employee") || [];

  const emp = employees.find((e) => String(e.id) === String(id));

  const name = emp?.first_name || "U";

  return {
    profile_url: emp?.profile_url || "",
    name,
    initial: name.charAt(0).toUpperCase(),
  };
};
console.log("getEmployeeProfile", getEmployeeProfile);

/**
 * Formats an ISO date string into a human-readable local string.
 */
export const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

/**
 * Formats an ISO date string with full date + time for activity logs.
 */
export const fmtActivity = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

/**
 * Maps API field names to human-readable labels for activity logs.
 */
export const fieldLabel = (name) => {
  const map = {
    assigned_to: "Assigned To",
    task_status: "Status",
    task_priority: "Priority",
    start_time: "Start Time",
    end_time: "End Time",
    title: "Title",
    description: "Description",
    task: "Task",
  };
  return map[name] || name;
};
