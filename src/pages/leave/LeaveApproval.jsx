import React, { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useSelector } from "react-redux";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";

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
}) => {
  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer,
  );

  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];

  // ── Status helpers ──────────────────────────────────────────
  const getStatusLabel = (status, is_deleted) => {
    if (is_deleted) return "Cancelled";
    switch (status) {
      case 1:
        return "Pending";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";
      case 4:
        return "Cancel Request";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status, is_deleted) => {
    if (is_deleted) return "danger";
    switch (status) {
      case 1:
        return "warning";
      case 2:
        return "success";
      case 3:
        return "danger";
      case 4:
        return "info";
      default:
        return "secondary";
    }
  };

  const getUnitId = (id) =>
    LeaveTypeData?.find((val) => val?.value === id)?.unit;

  // ── Table columns ───────────────────────────────────────────
  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "employee_id",
      accessor: (obj) => {
        const emp = obj?.employee;
        if (!emp) return <span className="text-muted">-</span>;

        const firstName = emp.first_name || "-";

        return (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              {emp.profile_url ? (
                <img
                  src={emp.profile_url}
                  alt={firstName}
                  className="avatar-xs rounded-circle"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="avatar-xs rounded-circle"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#0ab39c",
                  }}
                  title={firstName}
                >
                  <span className="first_letter" style={{ color: "white" }}>
                    {firstName !== "-" ? firstName.charAt(0).toUpperCase() : "-"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-grow-1">
              <div>{firstName}</div>
              <div>{emp.email || ""}</div>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        const departments = obj?.employee?.departments || [];
        const firstDep_name = departments[0]?.name || "-";
        const subDepList = departments.slice(1);

        return (
          <span>
            <Button
              color="light"
              id={`depListRef-${obj.id}`}
              className="position-relative"
            >
              {firstDep_name}
              {subDepList.length > 0 && (
                <Badge
                  pill
                  color="success"
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  +{subDepList.length}
                  <span className="visually-hidden">Departments</span>
                </Badge>
              )}
            </Button>

            {subDepList.length > 0 && (
              <UncontrolledTooltip
                placement="bottom"
                target={`depListRef-${obj.id}`}
              >
                <div className="mt-1">
                  {subDepList.map((item) => (
                    <p className="mb-1" key={item.id}>
                      {item.name}
                    </p>
                  ))}
                </div>
              </UncontrolledTooltip>
            )}
          </span>
        );
      },
    },
    {
      Header: "Start Date",
      filterable: false,
      id: "start",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.start).toDateString());
        const time = convertTime(new Date(obj.start).toTimeString());
        return (
          <b>
            {getUnitId(obj.leave_type_id) === 1 ? date : `${date} - ${time}`}
          </b>
        );
      },
    },
    {
      Header: "End Date",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.end).toDateString());
        const time = convertTime(new Date(obj.end).toTimeString());
        return (
          <b>
            {getUnitId(obj.leave_type_id) === 1 ? date : `${date} - ${time}`}
          </b>
        );
      },
    },
    {
      Header: "Total",
      filterable: false,
      id: "total",
      accessor: (obj) => (
        <b>{`${obj.requested_leave_count} ${
          getUnitId(obj.leave_type_id) === 1 ? "Days" : "Hour"
        }`}</b>
      ),
    },
    {
      Header: "Leave Type",
      filterable: false,
      id: "leave_type_id",
      accessor: (obj) => {
        const thisLeaveType = LeaveTypeData.find(
          (d) => d.id === obj.leave_type_id,
        );
        return (
          <div>
            <div>{thisLeaveType?.name}</div>

            {obj.comp_off_work_date && (
              <small className="text-muted">
                {convertDate(obj.comp_off_work_date)}
              </small>
            )}
          </div>
        );
      },
    },
    {
      Header: "Reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => <b>{obj.reason}</b>,
    },
    {
      Header: () => (
        <div style={{ textAlign: "center", width: "100%" }}>Status</div>
      ),
      id: "status",
      filterable: false,

      Cell: ({ row }) => {
        const obj = row.original;

        const label = getStatusLabel(obj.status, obj.is_deleted);
        const color = getStatusColor(obj.status, obj.is_deleted);

        let cancelBadge = null;

        if (obj.leave_cancellation_details) {
          const cancelStatus = obj.leave_cancellation_details.status;

          let cancelLabel = "";
          let cancelColor = "";

          if (cancelStatus === 1) {
            cancelLabel = "Pending";
            cancelColor = "warning";
          } else if (cancelStatus === 2) {
            cancelLabel = "Cancelled Leave Req Approved";
            cancelColor = "success";
          } else {
            cancelLabel = "Cancelled Leave Req Rejected";
            cancelColor = "danger";
          }

          cancelBadge = (
            <span
              className={`badge text-uppercase bg-${cancelColor}-subtle text-${cancelColor}`}
            >
              {cancelLabel}
            </span>
          );
        }

        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              {/* DOTTED LINE */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "2px dotted #ccc",
                }}
              />

              {/* MAIN STATUS */}
              <span
                className={`badge text-uppercase bg-${color}-subtle text-${color}`}
                style={{ zIndex: 1 }}
              >
                {label}
              </span>

              {/* CANCEL STATUS */}
              {cancelBadge && <div style={{ zIndex: 1 }}>{cancelBadge}</div>}
            </div>
          </div>
        );
      },
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
      />
    </React.Fragment>
  );
};

export default LeaveApproval;
