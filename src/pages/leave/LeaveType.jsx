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
import {
  ApvEmpty,
  ApvReason,
  ApvStatus,
  ApvTitle,
} from "../../component/common/approval/ApprovalCells";

// Leave type id → colour + icon (1 Paid, 2 Unpaid, 3 On Duty, 4 Comp Off).
const TYPE_STYLE = {
  1: { tone: "success", icon: "ri-hand-coin-line" },
  2: { tone: "danger", icon: "ri-money-dollar-circle-line" },
  3: { tone: "info", icon: "ri-briefcase-4-line" },
  4: { tone: "primary", icon: "ri-exchange-line" },
};

const LeaveType = () => {
  const dispatch = useDispatch();
  const { leave_type_data } = useSelector((state) => state.LeaveTypeReducer);

  useEffect(() => {
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
        const t = TYPE_STYLE[obj.type] || TYPE_STYLE[1];
        const isDay = obj.unit === leave_type_day_unit;
        return (
          <ApvTitle
            icon={isDay ? "ri-calendar-event-line" : "ri-time-line"}
            tone={t.tone}
            title={obj.name}
            sub={isDay ? "Day-based leave" : "Hour-based leave"}
          />
        );
      },
    },
    {
      Header: "Description",
      filterable: false,
      id: "description",
      accessor: (obj) => <ApvReason text={obj.description} />,
    },
    {
      Header: "Type",
      id: "type",
      filterable: false,
      accessor: (obj) => {
        const label = types.find((type) => type.id == obj.type)?.label;
        const t = TYPE_STYLE[obj.type];
        return label ? <ApvStatus tone={t.tone} icon={t.icon} label={label} /> : <ApvEmpty />;
      },
    },
    {
      Header: "Unit",
      id: "unit",
      filterable: false,
      accessor: (obj) => {
        const count = Number(obj.allowed_count) || 0;
        const isDay = obj.unit === leave_type_day_unit;
        const unit = isDay ? (count === 1 ? "day" : "days") : count === 1 ? "hour" : "hours";
        return (
          <span className="apv-quota">
            <b>{count}</b>
            <small>{unit} / year</small>
          </span>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) =>
        obj.status ? (
          <ApvStatus tone="success" icon="ri-checkbox-circle-line" label="Active" />
        ) : (
          <ApvStatus tone="secondary" icon="ri-forbid-line" label="Inactive" />
        ),
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
      role_id: [],
      genders: [],
      weekend_between_leave: false,
      holiday_between_leave: false,
      is_config_exempt: false,
      allow_employee_to_exceed_limit: true,
      allowed_to_carry_forward: false,
      carry_forward_limit: 0,
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
