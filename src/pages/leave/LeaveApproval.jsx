import React, { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useSelector } from "react-redux";
import { convertDate } from "../../common/js/ConvertDateFormat";
import {
  ApvDate,
  ApvDepartment,
  ApvEmployee,
  ApvLeaveStatus,
} from "../../component/common/approval/ApprovalCells";

// NOTE: This component no longer fetches its own data. ApprovalFilter.jsx is
// the single source of truth for fetching + pagination for both Leave and
// Attendance approval tables (avoids two independent fetches racing to
// overwrite the same Redux slice). This component just renders whatever is
// currently in Redux, using the serverPagination object passed down from
// ApprovalFilter for the table's pager.
const LeaveApproval = ({
  PendingLeave,
  AttendancePending,
  serverPagination,
  loading = false,
}) => {
  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer,
  );

  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const employeeById = useMemo(() => {
    const map = {};
    (EmployeeData || []).forEach((e) => {
      map[String(e.id)] = e;
    });
    return map;
  }, [EmployeeData]);

  const resolveEmployee = (row) => {
    const id = row?.employee_id ?? row?.employee?.id ?? row?.emp_id;
    return (
      (id != null ? employeeById[String(id)] : null) ||
      (row?.employee && typeof row.employee === "object" ? row.employee : null)
    );
  };

  const resolveDepartments = (emp) => {
    if (Array.isArray(emp?.departments) && emp.departments.length) {
      return emp.departments;
    }
    const ids = emp?.primary_department_id_list || [];
    if (!ids.length) return [];
    return (DepartmentData || []).filter((d) =>
      ids.some((id) => String(id) === String(d.id)),
    );
  };

  // unit 1 = days, otherwise hours
  const isDayUnit = (id) =>
    LeaveTypeData?.find((val) => val?.value === id)?.unit === 1;

  const renderDate = (value, withTime) => <ApvDate value={value} withTime={withTime} />;

  // ── Table columns ───────────────────────────────────────────
  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "employee_id",
      accessor: (obj) => <ApvEmployee employee={resolveEmployee(obj)} />,
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => (
        <ApvDepartment
          departments={resolveDepartments(resolveEmployee(obj))}
          refId={obj.id}
        />
      ),
    },
    {
      Header: "Start Date",
      filterable: false,
      id: "start",
      accessor: (obj) => renderDate(obj.start, !isDayUnit(obj.leave_type_id)),
    },
    {
      Header: "End Date",
      filterable: false,
      id: "end",
      accessor: (obj) => renderDate(obj.end, !isDayUnit(obj.leave_type_id)),
    },
    {
      Header: "Total",
      filterable: false,
      id: "total",
      accessor: (obj) => {
        const count = Number(obj.requested_leave_count) || 0;
        const days = isDayUnit(obj.leave_type_id);
        const unit = days ? (count === 1 ? "day" : "days") : count === 1 ? "hour" : "hours";
        return (
          <span className={`apv-duration ${days ? "" : "is-hours"}`}>
            <i className={days ? "ri-calendar-line" : "ri-time-line"}></i>
            {count % 1 === 0 ? count : count.toFixed(2).replace(/0$/, "")} {unit}
          </span>
        );
      },
    },
    {
      Header: "Leave Type",
      filterable: false,
      id: "leave_type_id",
      accessor: (obj) => {
        const thisLeaveType = LeaveTypeData.find((d) => d.id === obj.leave_type_id);
        return (
          <span className="apv-leave-type">
            <span className="apv-leave-type-name">{thisLeaveType?.name || "—"}</span>
            {obj.comp_off_work_date && (
              <small>
                <i className="ri-briefcase-4-line"></i> Worked {convertDate(obj.comp_off_work_date)}
              </small>
            )}
          </span>
        );
      },
    },
    {
      Header: "Reason",
      filterable: false,
      id: "reason",
      accessor: (obj) =>
        obj.reason ? (
          <span className="apv-reason" title={obj.reason}>
            {obj.reason}
          </span>
        ) : (
          <span className="apv-muted">—</span>
        ),
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      Cell: ({ row }) => <ApvLeaveStatus leave={row.original} />,
    },
  ];

  // ── initialFormObj ──────────────────────────────────────────
  const initialFormObj = useMemo(
    () => ({
      id: 0,
      employee_id: 0,
      leave_type_id: 0,
      reason: "",
      start: null,
      end: null,
      requested_leave_count: 0,
      status: 1,
      day_type: 1,
      reapproval_remark: "",
      in_between_dates: [],
    }),
    [],
  );

  // ── Filter options (current page only) ───────────────────────
  const filterKey = "status";
  const filterOptions = [
    {
      option: 1,
      label: "Pending",
      count: leave_approval_data.filter((e) => e[filterKey] === 1).length || 0,
    },
    {
      option: 2,
      label: "Approved",
      count: leave_approval_data.filter((e) => e[filterKey] === 2).length || 0,
    },
    {
      option: 3,
      label: "Rejected",
      count: leave_approval_data.filter((e) => e[filterKey] === 3).length || 0,
    },
    {
      option: 4,
      label: "Cancel Request",
      count: leave_approval_data.filter((e) => e[filterKey] === 4).length || 0,
    },
  ];

  document.title = `Approval | ${MetaTitle}`;

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={leave_approval_data}
        formname={"leave_approval"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
        serverPagination={serverPagination}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default LeaveApproval;
