import React, { useState, useMemo, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveApproval } from "../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { Api } from "../../common/api/Api";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import {
  VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { setApprovalEmployeeTypeFilter } from "../../redux/reducers/ChildReducer/ApprovalComponentReducer";

const LeaveApproval = ({ PendingLeave, AttendancePending }) => {
  const dispatch = useDispatch();

  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer,
  );
  const { version } = useSelector((data) => data.MetaReducer);

  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

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

  // ── Employee type permission ────────────────────────────────
  let employee_type;
  if (
    profile_data.permission_list.includes(VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY) &&
    profile_data.permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY)
  ) {
    employee_type = 1;
  } else if (
    profile_data.permission_list.includes(VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY) &&
    !profile_data.permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY)
  ) {
    dispatch(setApprovalEmployeeTypeFilter(0));
    employee_type = 0;
  } else {
    employee_type = 1;
  }

  // ── Fetch leave approvals ───────────────────────────────────
  useEffect(() => {
    dispatch(setLoaderVisible(true));
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    if (
      profile_data.permission_list.includes(
        VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
      ) ||
      profile_data.permission_list.includes(VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY)
    ) {
      Api({
        method: "GET",
        url: `leave/get-leave-application-for-approval/?thisMonth=${thisMonth}&employee_type=${employee_type}`,
      })
        .then((res) => {
          dispatch(setLeaveApproval(res?.data?.data || []));
          dispatch(setLoaderVisible(false));
        })
        .catch(() => {
          dispatch(setLeaveApproval([]));
          dispatch(setLoaderVisible(false));
        });
    }
  }, []);

  // ── Table columns ───────────────────────────────────────────
  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "employee_id",
      accessor: (obj) => {
        const EmployeeData = GetLocalStorageData("employee") || [];
        const thisEmployee = EmployeeData.find((d) => d.id === obj.employee_id);
        if (!thisEmployee) return null;

        return thisEmployee.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={thisEmployee.profile_url}
                alt=""
                className="avatar-xs rounded-circle"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.first_name}</div>
              <div>{thisEmployee.email}</div>
            </div>
          </div>
        ) : (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {thisEmployee.first_name?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.first_name}</div>
              <div>{thisEmployee.email}</div>
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
        const thisDepartment = DepartmentData.filter((d) =>
          obj.primary_department_id_list.includes(d.id),
        );
        const firstDep_name = thisDepartment[0]?.name || "";
        const subDepList = thisDepartment.slice(1);

        return (
          <span>
            <Button
              color="light"
              id={`depListRef-${obj.id}`}
              className="position-relative"
            >
              {firstDep_name}
              {subDepList.length > 0 && (
                <span>
                  <Badge
                    pill
                    color="success"
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    +{subDepList.length}
                    <span className="visually-hidden">Departments</span>
                  </Badge>
                  <UncontrolledTooltip
                    placement="bottom"
                    target={`depListRef-${obj.id}`}
                  >
                    <div className="mt-1">
                      {subDepList.map((item, key) => (
                        <p className="mb-1" key={key}>
                          {item.name}
                        </p>
                      ))}
                    </div>
                  </UncontrolledTooltip>
                </span>
              )}
            </Button>
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
        return <React.Fragment>{thisLeaveType?.name}</React.Fragment>;
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

  // ── Filter options ──────────────────────────────────────────
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
      />
    </React.Fragment>
  );
};

export default LeaveApproval;
