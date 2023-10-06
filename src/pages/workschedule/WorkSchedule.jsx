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
      desc: "Testiing",
      timings: [1, 2, 3, 4, 5],
      grace_time: "03.00",
      full: "08.00",
      half: "04.00",
      break: "0.30",
      auto_clock: false,
      status: 1,
      timingss: [
        {
          id: 1,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
        {
          id: 2,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
        {
          id: 3,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
        {
          id: 4,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
        {
          id: 5,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
        {
          id: 6,
          s: "01.00",
          e: "08.00",
          sh: "08.00",
        },
      ],
    },
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

  const [wsdata1, setwsdata1] = useState([
    {
      id: 1,
      name: "Morning Shift",
      description: "Morning Shift Development Team",
      timezone: "Asia/Kolkata",
      grace_in_time_hr: "0",
      grace_in_time_min: "30",
      grace_out_time_hr: "0",
      grace_out_time_min: "0",
      fullday_hr: "08",
      fullday_min: "00",
      halfday_hr: "04",
      halfday_min: "00",
      maximum_break_hr: "00",
      maximum_break_min: "30",
      auto_clock: true,
      status: 1,
      timings: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      workday: [
        {
          s_day: "monday",
          e_day: "monday",
          s_hr: "09",
          s_min: "00",
          e_hr: "18",
          e_min: "30",
          is_day_on: true,
        },
        {
          s_day: "tuesday",
          e_day: "tuesday",
          s_hr: "09",
          s_min: "00",
          e_hr: "18",
          e_min: "30",
          is_day_on: true,
        },
        {
          s_day: "wednesday",
          e_day: "wednesday",
          s_hr: "09",
          s_min: "00",
          e_hr: "18",
          e_min: "30",
          is_day_on: true,
        },
        {
          s_day: "thursday",
          e_day: "thursday",
          s_hr: "09",
          s_min: "00",
          e_hr: "18",
          e_min: "30",
          is_day_on: true,
        },
        {
          s_day: "friday",
          e_day: "friday",
          s_hr: "09",
          s_min: "00",
          e_hr: "18",
          e_min: "30",
          is_day_on: true,
        },
        {
          s_day: "saturday",
          e_day: "saturday",
          s_hr: "09",
          s_min: "00",
          e_hr: "17",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "sunday",
          e_day: "sunday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
      ],
    },
    {
      id: 2,
      name: "Night Shift",
      description: "Night Shift Development Team",
      timezone: "Asia/Kolkata",
      grace_in_time_hr: "0",
      grace_in_time_min: "30",
      grace_out_time_hr: "0",
      grace_out_time_min: "0",
      fullday_hr: "08",
      fullday_min: "00",
      halfday_hr: "04",
      halfday_min: "00",
      maximum_break_hr: "00",
      maximum_break_min: "30",
      auto_clock: true,
      status: 2,
      workday: [
        {
          s_day: "monday",
          e_day: "tuesday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "tuesday",
          e_day: "wednesday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "wednesday",
          e_day: "thursday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "thursday",
          e_day: "friday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "friday",
          e_day: "saturday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "saturday",
          e_day: "sunday",
          s_hr: "09",
          s_min: "00",
          e_hr: "06",
          e_min: "00",
          is_day_on: true,
        },
        {
          s_day: "sunday",
          e_day: "sunday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
      ],
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
      accessor: "description",
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

        let timings = [];

        for (let i = 0; i < days.length; i++) {
          for (let j = 0; j < obj.workday.length; j++) {
            if (
              days[i].desc.toLowerCase() == obj.workday[j].s_day &&
              obj.workday[j].is_day_on
            ) {
              timings.push(days[i].id);
            }
          }
        }

        let htmltag = days.map((day, i) => (
          <>
            <span
              className={
                timings.includes(day.id)
                  ? "fw-bold me-1"
                  : "fw-normal fw-lighter me-1"
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
      description: "",
      timezone: "Asia/Kolkata",
      grace_in_time_hr: "00",
      grace_in_time_min: "00",
      grace_out_time_hr: "00",
      grace_out_time_min: "00",
      fullday_hr: "00",
      fullday_min: "00",
      halfday_hr: "00",
      halfday_min: "00",
      maximum_break_hr: "00",
      maximum_break_min: "00",
      status: 1,
      workday: [
        {
          s_day: "monday",
          e_day: "monday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "tuesday",
          e_day: "tuesday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "wednesday",
          e_day: "wednesday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "thursday",
          e_day: "thursday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "friday",
          e_day: "friday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "saturday",
          e_day: "saturday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
        {
          s_day: "sunday",
          e_day: "sunday",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
        },
      ],
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
        tabledata={wsdata1}
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
