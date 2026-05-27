import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import InfoTable from "../../component/common/table/InfoTable";
import { custom_status_form_component_name } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const CustomStatus = () => {
  const reduxData = useSelector(
    (state) => state.CustomStatusReducer?.custom_status_data,
  );

  const custom_status_data = useMemo(() => {
    const sourceData =
      Array.isArray(reduxData) && reduxData.length > 0
        ? reduxData
        : GetLocalStorageData("custom_statuses") || [];

    return sourceData
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji ?? item.icon ?? "",
        is_active: item.is_active ?? item.active ?? true,
        location_required: item.location_required ?? false,
        notes_required: item.notes_required ?? false,
      }));
  }, [reduxData]);

  const BoolBadge = ({ value, trueLabel = "Yes", falseLabel = "No" }) => (
    <span
      className={`badge text-uppercase bg-${value ? "success" : "warning"}-subtle text-${value ? "success" : "warning"}`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );

  const additionalColumn = [
    {
      Header: "Emoji",
      accessor: (obj) => (
        <span style={{ fontSize: "1.4rem" }}>{obj.emoji}</span>
      ),
    },
    {
      Header: "Name",
      accessor: (obj) => <b>{obj.name}</b>,
    },
    {
      Header: "Status",
      accessor: (obj) => (
        <BoolBadge
          value={obj.is_active}
          trueLabel="Active"
          falseLabel="Inactive"
        />
      ),
    },
    {
      Header: "Location Required",
      accessor: (obj) => <BoolBadge value={obj.location_required} />,
    },
    {
      Header: "Notes Required",
      accessor: (obj) => <BoolBadge value={obj.notes_required} />,
    },
  ];

  const initialFormObj = useMemo(
    () => ({
      id: null,
      name: "",
      emoji: "",
      is_active: true,
      location_required: false,
      notes_required: false,
    }),
    [],
  );

  const filterKey = "is_active";

  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: custom_status_data.filter((e) => e.is_active).length,
    },
    {
      option: false,
      label: "Inactive",
      count: custom_status_data.filter((e) => !e.is_active).length,
    },
  ];

  return (
    <InfoTable
      additionalColumn={additionalColumn}
      tabledata={custom_status_data}
      formname={custom_status_form_component_name}
      initialFormObj={initialFormObj}
      filterKey={filterKey}
      filterOptions={filterOptions}
      width_per={"35%"}
      import_width_per={"50%"}
      table_class={"Lc_leave_apply_table me-n3 ms-n3"}
    />
  );
};

export default CustomStatus;
