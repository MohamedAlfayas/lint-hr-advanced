import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { custom_status_form_component_name } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const CustomStatus = () => {
  const [custom_status_data, setCustomStatusData] = useState([]);

  // ✅ FIXED: matches reducer key custom_statuses
  const reduxData = useSelector(
    (state) => state.CustomStatusReducer?.custom_statuses,
  );

  useEffect(() => {
    let sourceData = [];

    if (Array.isArray(reduxData) && reduxData.length > 0) {
      sourceData = reduxData;
    } else {
      sourceData = GetLocalStorageData("custom_statuses") || [];
    }

    // ✅ FIXED: normalize icon→emoji, is_active→active consistently
    const formattedData = sourceData
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji ?? item.icon ?? "", // handle both field names
        is_active: item.is_active ?? item.active ?? true, // ✅ keep as is_active
      }));

    setCustomStatusData(formattedData);
  }, [reduxData]);

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
      accessor: (obj) => {
        const label = obj.is_active ? "Active" : "Inactive";
        const cls = obj.is_active ? "success" : "warning";
        return (
          <span className={`badge text-uppercase bg-${cls}-subtle text-${cls}`}>
            {label}
          </span>
        );
      },
    },
  ];

  // ✅ FIXED: initialFormObj uses is_active (matches form)
  const initialFormObj = useMemo(
    () => ({
      id: null,
      name: "",
      emoji: "",
      is_active: true,
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
