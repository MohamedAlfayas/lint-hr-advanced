import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";


const WorkSchedule = () => {
  const [wsdata, setwsdata] = useState([
    {
      id: 1,
      name: "Morning Shift",
      desc: "elan@lintcloud.com",
      timings: [1, 2, 3, 4, 5],
      status: 1,
    },
    {
      id: 2,
      name: "Night Shift",
      desc: "paul@lintcloud.com",
      timings: [1, 2, 3, 4, 5],
      status: 1,
    },
    {
      id: 3,
      name: "Shift 2",
      desc: "antony@lintcloud.com",
      timings: [1, 2, 3, 4, 5, 6],
      status: 1,
    },
    {
      id: 4,
      name: "Intern",
      desc: "fayaz@lintcloud.com",
      timings: [1, 3, 5],
      status: 1,
    },
    {
      id: 5,
      name: "Contract",
      desc: "thalavai@lintcloud.com",
      timings: [1, 2, 3, 4, 5, 6],
      status: 2,
    },
    {
      id: 6,
      name: "Part Time",
      desc: "kathir@lintcloud.com",
      timings: [1, 2, 3, 4, 5, 6, 7],
      status: 1,
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
      id: "email",
    },
    {
      Header: "Timings",
      id: "timings",
      filterable: false,
      accessor: (obj) => {
        const days = [
          { id: 1, name: "M", desc: "Monday" },
          { id: 2, name: "T", desc: "Tuesday" },
          { id: 3, name: "W", desc: "Wednesday" },
          { id: 4, name: "T", desc: "Thursday" },
          { id: 5, name: "F", desc: "Friday" },
          { id: 6, name: "S", desc: "Saturday" },
          { id: 7, name: "S", desc: "Sunday" },
        ];

        let htmltag = days.map((day) => (
          <>
            <span
              className={
                obj.timings.includes(day.id)
                  ? "fw-bold mr-5"
                  : "fw-normal fw-lighter mr-5"
              }
              key={day.id}
              id={`t_${day.desc}`}>
              {day.name}
            </span>
            <UncontrolledTooltip placement="top" target={`t_${day.desc}`}>
              {" "}
              {day.desc}{" "}
            </UncontrolledTooltip>
          </>
        ));

        return <> {htmltag} </>;
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
      department: [],
      email: "",
      status: 1,
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    { option: "1", label: "Active" },
    { option: "2", label: "Inactive" },
  ];

  document.title = `Work Schedule | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={wsdata}
        formname={"workschedule"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"60%"}
      />
    </React.Fragment>
  );
};

export default WorkSchedule;
