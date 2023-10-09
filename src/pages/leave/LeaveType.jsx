import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";

const LeaveType = () => {
  let types = [
    { id: 1, label: "Paid", value: "Paid" },
    { id: 2, label: "UnPaid", value: "UnPaid" },
    { id: 3, label: "On Duty", value: "On Duty" },
    { id: 4, label: "Comp Off", value: "Comp Off" },
  ];
  let reset = [
    { id: 1, name: "January To December" },
    { id: 2, name: "May To April" },
  ];

  const [leavetype, setLeaveType] = useState([
    {
      id: 1,
      name: "Casual Leave",
      type: 1,
      unit: "Day",
      leave_count: 12,
      reset: 1,
      applicable_ws: [1, 2],
      gender: "M",
      week_between_leave: true,
      holiday_between_leave: false,
      desc: "Connect your bank account or credit card",
      status: 1,
    },
    {
      id: 2,
      name: "Permission",
      type: 2,
      unit: "Hour",
      leave_count: 12,
      reset: 1,
      applicable_ws: [1, 2],
      gender: "M",
      week_between_leave: false,
      holiday_between_leave: true,
      desc: "Connect your bank account or credit card",
      status: 2,
    },
  ]);

  // Column
  const additionalColumn = [
    {
      Header: "Name",
      accessor: "name",
      filterable: false,
      id: "name",
      accessor: (obj) => {
        return <b>{obj.name}</b>;
      },
    },
    {
      Header: "Description",
      accessor: "desc",
      filterable: false,
      id: "desc",
    },
    {
      Header: "Type",
      id: "type",
      filterable: false,
      accessor: (obj) => {
        let htmltag = types.map((type, i) =>
          obj.type == type.id ? type.value : ""
        );

        return <>{htmltag}</>;
      },
    },
    {
      Header: "Unit",
      id: "unit",
      filterable: false,
      accessor: (obj) => {
        return (
          <b>
            {obj.leave_count}
            <small> {obj.unit} / Year</small>
          </b>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status === 1 ? "Active" : "Inactive";
        let statusClass = obj.status === 1 ? "success" : "warning";
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
      id: 0,
      name: "",
      type: 1,
      unit: "Day",
      leave_count: 12,
      reset: 1,
      applicable_ws: [1, 2],
      gender: "M",
      week_between_leave: true,
      holiday_between_leave: false,
      desc: "",
      status: 1,
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    { option: "1", label: "Active" },
    { option: "2", label: "Inactive" },
  ];

  document.title = `Leave Type | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={leavetype}
        formname={"leavetypes"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"40%"}
      />
    </React.Fragment>
  );
};

export default LeaveType;
