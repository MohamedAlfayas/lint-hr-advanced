import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { setWorkSchedule } from "../../redux/reducers/ChildReducer/WorkScheduleReducer";

const WorkSchedule = () => {

  const dispatch = useDispatch()

  const { work_schedule_data } = useSelector(state => state.WorkScheduleReducer);

  useEffect(() =>{
    dispatch(setWorkSchedule(GetLocalStorageData('work_schedule') || []))
  },[])
  
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
              days[i].desc.toLowerCase() == (obj.workday[j].s_day).toLowerCase() &&
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
        let status = obj.status ? "Active" : "Inactive";
        let statusClass = obj.status ? "success" : "warning";
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
      auto_clock_out : false,
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
    { option: true, label: "Active", count : work_schedule_data.filter(e => e[filterKey] === true).length || 0 },
    { option: false, label: "Inactive", count : work_schedule_data.filter(e => e[filterKey] === false).length || 0 },
  ];

  document.title = `Work Schedule | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={work_schedule_data}
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
