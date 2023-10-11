import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setLeaveApproval } from "../../redux/reducers/ChildReducer/LeaveApprovalReducer";

const LeaveApproval = () => {

  const dispatch = useDispatch()

  const { leave_approval_data } = useSelector(data => data.LeaveApprovalReducer);

  const { version } = useSelector(data => data.MetaReducer);

  useEffect(() => {
    dispatch(setLeaveApproval(GetLocalStorageData('leave_approval') || []))
  }, [version])

  const [LeaveData, setLeavedata] = useState([
    {
      "id": 1,
      "employee": 41,
      "department": 15,
      "start_date": "2023-05-01",
      "end_date": "2023-05-03",
      "total_days": "3 Days",
      "leave_type": 1,
      "reason": "Family Function",
      "status": 1
    }, {
      "id": 2,
      "employee": 43,
      "department": 14,
      "start_date": "2023-05-30 ",
      "end_date": "2023-05-30 ",
      "total_days": "2 Hours",
      "leave_type": 3,
      "reason": "Traffic",
      "status": 2
    }
  ])
  // Column
  const additionalColumn = [
    {
      Header: "Name",
      accessor: "employee",
      filterable: false,
      id: "employee",
      accessor: (obj) => {
        const EmployeeData = GetLocalStorageData("employee");
        const thisEmployee = EmployeeData.find(data => data.id === obj.employee);
        console.log("This Emp = ", thisEmployee);
        return (
          thisEmployee.profile_url ? (
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-shrink-0">
                <img src={thisEmployee.profile_url} alt="" className="avatar-xs rounded-circle" />
              </div>
              <div className="flex-grow-1">
                <div>{thisEmployee.fname}</div>
                <div>{thisEmployee.email}</div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-xs rounded-circle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0ab39c' }} data-bs-toggle="tooltip" title={(thisEmployee.fname)}>
                  <span className="first_letter" style={{ color: 'white' }} >{(thisEmployee.fname).charAt(0)}</span>
                </div>
              </div>
              <div className="flex-grow-1">
                <div>{thisEmployee.fname}</div>
                <div>{thisEmployee.email}</div>
              </div>
            </div>

          )
        )
      },
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        const DepartmentData = GetLocalStorageData("department");
        const thisDepartment = DepartmentData.find(data => data.id === obj.department);
        return (
          <React.Fragment>{thisDepartment && thisDepartment.name}</React.Fragment>
        );
      },
    },
    {
      Header: "Start Date",
      accessor: "start",
      filterable: false,
      id: "start",
      accessor: (obj) => {
        return <b>{obj.start}</b>;
      },
    },
    {
      Header: "End Date",
      accessor: "end",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        return <b>{obj.end}</b>;
      },
    },
    {
      Header: "Total ",
      accessor: "total",
      filterable: false,
      id: "total",
      accessor: (obj) => {
        return <b>{obj.total}</b>;
      },
    },
    {
      Header: "Leave Type ",
      accessor: "leave_type",
      filterable: false,
      id: "leave_type",
      accessor: (obj) => {
        const LeaveTypeData = GetLocalStorageData("leave_types");
        const thisLeaveType = LeaveTypeData.find(data => data.id === obj.leave_type)
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

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status === 1 ? "Pending" : obj.status === 2 ? "Approved" : "Rejected";
        let statusClass = obj.status === 1 ? "primary" : obj.status === 2 ? "success" : "danger";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}>
            {" "}
            {status}{" "}

          </span>
        );
      },
    },
  ];

  const initialFormObj = useMemo(() => {
    return {

      id: 1,
      employee: 16,
      department: 15,
      start_date: "2023-05-30 ",
      end_date: "2023-05-30",
      total_days: "2 Hours",
      leave_type: 3,
      reason: "Traffic",
      status: 1
    }, {
      id: 2,
      employee: 32,
      department: 14,
      start_date: "2023-05-01",
      end_date: "2023-05-03",
      total_days: "3 Days",
      leave_type: 1,
      reason: "Family Function",
      status: 1
    }
  }, []);


  const filterKey = "status";
  const filterOptions = [
    { option: 1, label: "Pending" },
    { option: 2, label: "Approved" },
    { option: 3, label: "Rejected" },
  ];

  document.title = `Leave Approval | ${MetaTitle}`;
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
