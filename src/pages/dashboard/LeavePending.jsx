import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setLeaveApproval } from "../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { Api } from "../../common/api/Api";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY } from "../../common/constant/Constants";
import { toast } from "react-toastify";

const LeaveApprovalPending = ({ onDataLengthChange }) => {
  const dispatch = useDispatch();

  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer
  );
  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const { version } = useSelector((data) => data.MetaReducer);

  const pendingData = leave_approval_data.filter((item) => item.status === 1);
  const DataLength = pendingData.length;

  useEffect(() => {
    onDataLengthChange(DataLength);
  }, [DataLength, onDataLengthChange]);

  const getUnitId = (id) => {
    const day_type = LeaveTypeData?.find((val) => val?.value === id)?.unit;
    return day_type;
  };
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    {
      if (
        profile_data.permission_list.includes(
          APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY
        )
      ) {
        Api({
          method: "GET",
          url:
            "leave/get-leave-application-for-approval/?thisMonth=" +
            thisMonth +
            "&employee_type=1",
        })
          .then((res) => {
            dispatch(setLeaveApproval(res?.data?.data));
          })
          .catch((err) => {
            dispatch(setLeaveApproval([]));
          });
      }
    }
  }, [dispatch]);

  const [LeaveData, setLeavedata] = useState([
    {
      id: 1,
      employee: 41,
      department: 15,
      start_date: "2023-05-01",
      end_date: "2023-05-03",
      total_days: "3 Days",
      leave_type: 1,
      reason: "Family Function",
      status: 1,
    },
    {
      id: 2,
      employee: 43,
      department: 14,
      start_date: "2023-05-30 ",
      end_date: "2023-05-30 ",
      total_days: "2 Hours",
      leave_type: 3,
      reason: "Traffic",
      status: 2,
    },
  ]);
  // Column
  const additionalColumn = [
    {
      Header: "Name",
      accessor: "employee_id",
      filterable: false,
      id: "employee_id",

      accessor: (obj) => {
        const EmployeeData = GetLocalStorageData("employee") || [];
        const thisEmployee = EmployeeData.find(
          (data) => data.id === obj.employee_id
        );
        return thisEmployee.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={thisEmployee.profile_url}
                alt=""
                className="avatar-xs rounded-circle"
              />
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.fname}</div>
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
                data-bs-toggle="tooltip"
                title={thisEmployee.fname}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {thisEmployee.fname.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.fname}</div>
              <div>{thisEmployee.email}</div>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Start Date",
      accessor: "start",
      filterable: false,
      id: "start",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.start).toDateString());
        const time = convertTime(new Date(obj.start).toTimeString());
        return (
          <b>{`${
            getUnitId(obj.leave_type) === 1 ? date : `${date} - ${time}`
          }`}</b>
        );
      },
    },
    {
      Header: "End Date",
      accessor: "end",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.end).toDateString());
        const time = convertTime(new Date(obj.end).toTimeString());
        return (
          <b>{`${
            getUnitId(obj.leave_type) === 1 ? date : `${date} - ${time}`
          }`}</b>
        );
      },
    },
    {
      Header: "Total ",
      accessor: "total",
      filterable: false,
      id: "total",
      accessor: (obj) => {
        let leave_count = obj.requested_leave_count;
        return (
          <b>{`${leave_count} ${
            getUnitId(obj.leave_type) === 1 ? "Days" : "Hour"
          }`}</b>
        );
      },
    },
    {
      Header: "Leave Type ",
      accessor: "leave_type",
      filterable: false,
      id: "leave_type",
      accessor: (obj) => {
        const thisLeaveType = LeaveTypeData.find(
          (data) => data.id === obj.leave_type
        );
        return (
          <React.Fragment>{thisLeaveType && thisLeaveType.name}</React.Fragment>
        );
      },
    },
    {
      Header: "Reason",
      accessor: "reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => {
        return <b>{obj.reason}</b>;
      },
    },
  ];

  const initialFormObj = useMemo(() => {
    return (
      {
        id: 1,
        employee: 16,
        department: 15,
        start_date: "2023-05-30 ",
        end_date: "2023-05-30",
        total_days: "2 Hours",
        leave_type: 3,
        reason: "Traffic",
        status: 1,
      },
      {
        id: 2,
        employee: 32,
        department: 14,
        start_date: "2023-05-01",
        end_date: "2023-05-03",
        total_days: "3 Days",
        leave_type: 1,
        reason: "Family Function",
        status: 1,
      }
    );
  }, []);

  // const filterKey = "status";
  // const filterOptions = [
  //   {
  //     option: 1,
  //     label: "Pending",
  //     count: leave_approval_data.filter((e) => e[filterKey] === 1).length || 0,
  //   },

  // ];

  // document.title = `Leave Approval | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={pendingData}
        formname={"leave_pending_table"}
        initialFormObj={initialFormObj}
        // filterKey={filterKey}
        // filterOptions={filterOptions}
        width_per={"35%"}
        table_class={"Lc_leave_apply_table"}
      />
    </React.Fragment>
  );
};

export default LeaveApprovalPending;
