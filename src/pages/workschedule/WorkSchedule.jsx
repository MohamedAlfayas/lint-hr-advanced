import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { setWorkSchedule } from "../../redux/reducers/ChildReducer/WorkScheduleReducer";
import { work_schedule_component_name } from "../../common/constant/Constants";

const WorkSchedule = () => {
  const dispatch = useDispatch();

  const { work_schedule_data } = useSelector(
    (state) => state.WorkScheduleReducer
  );

  useEffect(() => {
    dispatch(setWorkSchedule(GetLocalStorageData("work_schedule") || []));
  }, []);

  const data = work_schedule_data;

  data.forEach((item) => {
    item.workday.forEach((workday) => {
      const s_hr = workday.s_hr;
      const s_min = workday.s_min;
      const e_hr = workday.e_hr;
      const e_min = workday.e_min;
    });
  });

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
              days[i].desc.toLowerCase() == obj.workday[j].s_day.toLowerCase()
            ) {
              timings.push({
                ws_id: obj.id,
                id: days[i].id,
                name: obj.workday[j].s_day,
                s_hr: obj.workday[j].s_hr,
                s_min: obj.workday[j].s_min,
                e_hr: obj.workday[j].e_hr,
                e_min: obj.workday[j].e_min,
                is_day_on: obj.workday[j].is_day_on,
              });
            }
          }
        }

        let timings_data = timings.filter((d) => d.ws_id === obj.id);

        let htmltag = days.map((day, i) => {
          let thisDayTimeObj = timings_data.find(
            (timing) => timing.id === day.id
          );

          return (
            <>
              <span
                className={
                  !!thisDayTimeObj && thisDayTimeObj?.is_day_on === true
                    ? "fw-bold me-1"
                    : "fw-normal fw-lighter me-1"
                }
                key={thisDayTimeObj.id}
                id={`t_${thisDayTimeObj?.ws_id}_${thisDayTimeObj?.id}`}
              >
                {day?.name}
              </span>
              <UncontrolledTooltip
                className="lc_tooltip"
                placement="top"
                target={`t_${thisDayTimeObj?.ws_id}_${thisDayTimeObj?.id}`}
              >
                {" "}
                {thisDayTimeObj?.name}{" "}
                {!!thisDayTimeObj && thisDayTimeObj?.is_day_on === true && (
                  <>
                    {`${thisDayTimeObj?.s_hr}:${thisDayTimeObj?.s_min} - ${thisDayTimeObj?.e_hr}:${thisDayTimeObj?.e_min}`}
                  </>
                )}
              </UncontrolledTooltip>
            </>
          );
        });

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
    return {
      id: 0,
      name: "",
      description: "",
      timezone: "Asia/Kolkata",
      auto_clock_out: true,
      has_ot: false,
      is_default: false,
      status: false,
      fullday_work_duration: 0,
      halfday_work_duration: 0,
      grace_time_duration: 0,
      maximum_break_duration: 0,
      twenty_four_hrs_duration: 0,
      type: "1",
      workday: [
        {
          id: 0,
          s_day: "Monday",
          weekday: "Monday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Tuesday",
          weekday: "Tuesday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Wednesday",
          weekday: "Wednesday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Thursday",
          weekday: "Thursday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Friday",
          weekday: "Friday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Saturday",
          weekday: "Saturday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
        {
          id: 0,
          s_day: "Sunday",
          weekday: "Sunday",
          e_day: "",
          s_hr: "00",
          s_min: "00",
          e_hr: "00",
          e_min: "00",
          is_day_on: false,
          total_work_duration: 0,
          break_duration: 0,
          total_work_duration_without_break: 0,
        },
      ],
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
        work_schedule_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
        work_schedule_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Work Schedule | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={work_schedule_data}
        formname={work_schedule_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"60%"}
      />
    </React.Fragment>
  );
};

export default WorkSchedule;
