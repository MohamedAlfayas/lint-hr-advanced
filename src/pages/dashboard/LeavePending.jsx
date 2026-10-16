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
import {
  ApvDate,
  ApvDuration,
  ApvEmployee,
  ApvLeaveType,
  ApvReason,
} from "../../component/common/approval/ApprovalCells";
import { VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY } from "../../common/constant/RoleConstants";
import { toast } from "react-toastify";

const LeaveApprovalPending = ({ onDataLengthChange }) => {
  const dispatch = useDispatch();

  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer
  );
  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];
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
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    {
      if (
        profile_data.permission_list.includes(
          VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY
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
      leave_type_id: 1,
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
      leave_type_id: 3,
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
        const emp =
          (EmployeeData || []).find(
            (data) => String(data.id) === String(obj.employee_id),
          ) ||
          (obj?.employee && typeof obj.employee === "object"
            ? obj.employee
            : null);
        return <ApvEmployee employee={emp} />;
      },
    },
    {
      Header: "Start Date",
      accessor: "start",
      filterable: false,
      id: "start",
      accessor: (obj) => <ApvDate value={obj.start} withTime={getUnitId(obj.leave_type_id) !== 1} />,
    },
    {
      Header: "End Date",
      accessor: "end",
      filterable: false,
      id: "end",
      accessor: (obj) => <ApvDate value={obj.end} withTime={getUnitId(obj.leave_type_id) !== 1} />,
    },
    {
      Header: "Total",
      accessor: "total",
      filterable: false,
      id: "total",
      accessor: (obj) => (
        <ApvDuration count={obj.requested_leave_count} days={getUnitId(obj.leave_type_id) === 1} />
      ),
    },
    {
      Header: "Leave Type",
      accessor: "leave_type_id",
      filterable: false,
      id: "leave_type_id",
      accessor: (obj) => (
        <ApvLeaveType name={LeaveTypeData.find((data) => data.id === obj.leave_type_id)?.name} />
      ),
    },
    {
      Header: "Reason",
      accessor: "reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => <ApvReason text={obj.reason} />,
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
        leave_type_id: 3,
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
        leave_type_id: 1,
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
