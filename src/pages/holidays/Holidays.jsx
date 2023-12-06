import React, { useEffect } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import "../holidays/holidays.css";
import { Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import Calender from "./Calendar";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { ConvertDateFormat } from "../../common/js/ConvertDateFormat";
import { setHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";

const Holiday = () => {
  document.title = `Holidays | ${MetaTitle}`;

  const dispatch = useDispatch();

  const [showCalendar, setShowCalendar] = useState(false);

  const { holiday_data } = useSelector((state) => state.HolidayReducer);

  useEffect(() => {
    dispatch(setHoliday(GetLocalStorageData("holiday")));
  }, []);

  console.log("holiday DAta = ", holiday_data);

  const additionalColumn = [
    {
      Header: "Name",
      accessor: "name",
      filterable: false,
      id: "name",
    },
    {
      Header: "Date",
      accessor: "date",
      filterable: false,
      id: "date",
      accessor: (obj) => {
        return <React.Fragment>{ConvertDateFormat(obj.date)}</React.Fragment>;
      },
    },
    {
      Header: "Applicable For",
      accessor: "work_schedule_id_list",
      id: "shift",
      filterable: false,
      accessor: (obj) => {
        return <b>{obj.work_schedule_id_list.length} Shifts</b>;
      },
    },
    {
      Header: "Description",
      accessor: "description",
      filterable: false,
      id: "description",
    },
    {
      Header: "Type",
      id: "is_restricted",
      filterable: false,
      accessor: (obj) => {
        let status = obj.is_restricted ? "Restricted" : "Non Restricted";
        let statusClass = obj.is_restricted ? "info" : "success";
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

  const WorkScheduleData = GetLocalStorageData("work_schedule") || [];

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      date: String(new Date()),
      work_schedule_id_list: WorkScheduleData.map((e) => e.id) || [],
      description: "",
      is_restricted: false,
    };
  }, []);
  const filterKey = "is_restricted";
  const filterOptions = [
    {
      option: true,
      label: "Restricted",
      count: holiday_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Non Restricted",
      count: holiday_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  return (
    <React.Fragment>
      <div id="lc_btn" className="page-content">
        <Nav
          tabs
          className="nav nav-tabs nav-justified nav-border-top nav-border-top-success mb-3 "
        >
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: !showCalendar })}
              onClick={() => setShowCalendar(false)}
            >
              List
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: showCalendar })}
              onClick={() => setShowCalendar(true)}
            >
              Calendar
            </NavLink>
          </NavItem>
        </Nav>
        {/* <button  onClick={() => setShowCalendar(false)}>List</button>
        <button onClick={() => setShowCalendar(true)}>Calendar</button> */}
      </div>
      {showCalendar ? (
        <Calender />
      ) : (
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={holiday_data}
          formname={"holiday"}
          initialFormObj={initialFormObj}
          filterKey={filterKey}
          filterOptions={filterOptions}
          width_per={"40%"}
          import_width_per={"50%"}
        />
      )}
    </React.Fragment>
  );
};

export default Holiday;
