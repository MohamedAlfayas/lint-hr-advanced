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
import { Badge, Button, Container, UncontrolledTooltip } from "reactstrap";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import LeaveApprovalFilter from "../../component/common/tableFilter/LeaveApprovalFilter";

const LeaveApproval = () => {
  const dispatch = useDispatch();

  const { leave_approval_data } = useSelector(
    (data) => data.LeaveApprovalReducer
  );
  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const { version } = useSelector((data) => data.MetaReducer);

  const getUnitId = (id) => {
    const day_type = LeaveTypeData?.find((val) => val?.value === id)?.unit;
    return day_type;
  };

  useEffect(() => {
    dispatch(setLoaderVisible(true));
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    Api({
      method: "GET",
      url:
        "leave/get-leave-application-for-approval/?thisMonth=" +
        thisMonth +
        "&employee_type=1",
    })
      .then((res) => {
        dispatch(setLeaveApproval(res?.data?.data));
        dispatch(setLoaderVisible(false));
      })
      .catch((err) => {
        dispatch(setLeaveApproval([]));
        dispatch(setLoaderVisible(false));
      });
  }, [version]);

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
                style={{ objectFit: "cover" }}
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
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        let thisDepartment = DepartmentData
          ? DepartmentData.filter((data) =>
              obj.primary_department_id_list.includes(data.id)
            )
          : [];

        let firstDep_name = thisDepartment?.length
          ? thisDepartment[0].name
          : "";

        let subDepList = thisDepartment?.length
          ? thisDepartment.filter((datas, index) => {
              if (index !== 0) {
                return datas;
              }
            })
          : [];

        return (
          <span>
            <Button
              color="light"
              id={`depListRef-${obj.id}`}
              className="position-relative"
            >
              <React.Fragment>{firstDep_name}</React.Fragment>
              {subDepList.length > 0 ? (
                <span>
                  <Badge
                    //id="tooltipwithHtml"
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
                    {" "}
                    <div className="mt-1">
                      {subDepList.map((item, key) => (
                        <p className="mb-1">{item.name}</p>
                      ))}
                    </div>{" "}
                  </UncontrolledTooltip>
                </span>
              ) : (
                ""
              )}
            </Button>
          </span>
        );

        return (
          <>
            {thisDepartment.map((d) => (
              <React.Fragment>{d.name}</React.Fragment>
            ))}
          </>
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

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status =
          obj.status === 1
            ? "Pending"
            : obj.status === 2
            ? "Approved"
            : "Rejected";
        let statusClass =
          obj.status === 1
            ? "primary"
            : obj.status === 2
            ? "success"
            : "danger";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
          >
            {" "}
            {status}{" "}
          </span>
        );
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
  ];

  document.title = `Leave Approval | ${MetaTitle}`;
  return (
    <React.Fragment>
      <Container fluid>
        <div className="page-content" style={{ marginBottom: "-135px" }}>
          <div style={{ zIndex: 1000, position: "relative" }}>
            <LeaveApprovalFilter />
          </div>
        </div>
      </Container>
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
