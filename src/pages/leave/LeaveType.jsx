import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveType } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import {
  leave_type_component_name,
  leave_type_day_unit,
} from "../../common/constant/Constants";
import { setLeaveTypeTableFilterKeys } from "../../redux/reducers/ChildReducer/TableFilterReducer";

const LeaveType = () => {
  const dispatch = useDispatch();
  const { leave_type_data } = useSelector((state) => state.LeaveTypeReducer);

  useEffect(() => {
    console.log("LT UE RUNNING !!!!!");
    dispatch(setLeaveType(GetLocalStorageData("leave_types") || []));
    dispatch(setLeaveTypeTableFilterKeys({ unit: 0 }));
  }, []);

  let types = [
    { id: 1, label: "Paid", value: 1 },
    { id: 2, label: "UnPaid", value: 2 },
    { id: 3, label: "On Duty", value: 3 },
    { id: 4, label: "Comp Off", value: 4 },
  ];
  let reset = [
    { id: 1, label: "January To December", value: 1 },
    { id: 2, label: "May To April", value: 2 },
  ];

  // const [leavetype, setLeaveType] = useState([
  //   {
  //     id: 1,
  //     name: "Casual Leave",
  //     type: 1,
  //     unit: "Day",
  //     leave_count: 12,
  //     reset: 1,
  //     ws_id: [1, 2],
  //     gender: "M",
  //     week_between_leave: true,
  //     holiday_between_leave: false,
  //     desc: "Connect your bank account or credit card",
  //     status: 1,
  //   },
  //   {
  //     id: 2,
  //     name: "Permission",
  //     type: 2,
  //     unit: "Hour",
  //     leave_count: 12,
  //     reset: 1,
  //     ws_id: [1, 2],
  //     gender: "M",
  //     week_between_leave: false,
  //     holiday_between_leave: true,
  //     desc: "Connect your bank account or credit card",
  //     status: 2,
  //   },
  // ]);

  // Column
  const additionalColumn = [
    {
      Header: "Name",
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
      id: "description",
    },
    {
      Header: "Type",
      id: "type",
      filterable: false,
      accessor: (obj) => {
        let htmltag = types.map((type, i) =>
          obj.type == type.id ? type.label : ""
        );

        return <>{htmltag}</>;
      },
    },
    {
      Header: "Unit",
      id: "unit",
      filterable: false,
      accessor: (obj) => {
        let leave_count = obj.allowed_count;
        let leave_unit = obj.unit === leave_type_day_unit ? "Day" : "Hour";
        return (
          <>
            {leave_count}
            <small> {leave_unit} / Year</small>
          </>
        );
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
      type: 0,
      unit: leave_type_day_unit,
      allowed_count: 0,
      hour_allowed_in_day: 0,
      reset_type: 1,
      ws_id: [],
      genders: [],
      weekend_between_leave: false,
      holiday_between_leave: false,
      description: "",
      status: true,
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: leave_type_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: leave_type_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Leave Type | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={leave_type_data}
        formname={leave_type_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
        import_width_per={"50%"}
      />
    </React.Fragment>
  );
};

export default LeaveType;
