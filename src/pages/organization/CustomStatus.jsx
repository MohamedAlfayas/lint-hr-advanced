import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfoTable from "../../component/common/table/InfoTable";
import { custom_status_form_component_name } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setCustomStatus } from "../../redux/reducers/ChildReducer/CustomStatusReducer";
import {
  ApvActive,
  ApvStatus,
  ApvTitle,
} from "../../component/common/approval/ApprovalCells";

const YesNo = ({ value, icon }) => (
  <ApvStatus tone={value ? "success" : "secondary"} icon={icon} label={value ? "Yes" : "No"} />
);
YesNo.toText = ({ value }) => (value ? "Yes" : "No");

const CustomStatus = () => {
  const { custom_status_data } = useSelector(
    (state) => state.CustomStatusReducer,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCustomStatus(GetLocalStorageData("custom_statuses")));
  }, []);

  const [customStatusData, setCustomStatusData] = useState([]);

  useEffect(() => {
    console.log("Redux Data = ", custom_status_data);

    let t = custom_status_data
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji ?? item.icon ?? "",
        is_active: item.is_active ?? item.active ?? true,
        location_required: item.location_required ?? false,
        notes_required: item.notes_required ?? false,
        is_break: item.is_break ?? false,
      }));

    setCustomStatusData(t);
  }, [custom_status_data]);

  const additionalColumn = [
    {
      Header: "Name",
      accessor: (obj) => (
        <ApvTitle
          icon="ri-emotion-line"
          initials={obj.emoji || undefined}
          title={obj.name}
          tone={obj.is_break ? "warning" : "info"}
        />
      ),
    },
    {
      Header: "Status",
      accessor: (obj) => <ApvActive active={obj.is_active} />,
    },
    {
      Header: "Location Required",
      accessor: (obj) => <YesNo value={obj.location_required} icon="ri-map-pin-line" />,
    },
    {
      Header: "Notes Required",
      accessor: (obj) => <YesNo value={obj.notes_required} icon="ri-sticky-note-line" />,
    },
    {
      Header: "Exclude Hours",
      accessor: (obj) => <YesNo value={obj.is_break} icon="ri-timer-line" />,
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
      is_break: false,
    }),
    [],
  );

  const filterKey = "is_active";

  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: customStatusData.filter((e) => e.is_active).length,
    },
    {
      option: false,
      label: "Inactive",
      count: customStatusData.filter((e) => !e.is_active).length,
    },
  ];

  return (
    <InfoTable
      additionalColumn={additionalColumn}
      tabledata={customStatusData}
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
