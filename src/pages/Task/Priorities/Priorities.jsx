import React, { useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setPriorities } from "../../../redux/reducers/ChildReducer/PrioritiesReducer";
import { priorities_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  ApvActive,
  ApvColorTag,
  ApvReason,
} from "../../../component/common/approval/ApprovalCells";

const Priorities = () => {
  const dispatch = useDispatch();

  const { Priorities_data } = useSelector((state) => state.PrioritiesReducer);

  // ================= LOAD LOCAL STORAGE ON PAGE LOAD =================
  useEffect(() => {
    const localPriorities = GetLocalStorageData("task_priority") || [];
    dispatch(setPriorities(localPriorities));
  }, [dispatch]);

  const additionalColumn = [
    {
      Header: "Priority Name",
      id: "name",
      filterable: false,
      accessor: (obj) => (
        <ApvColorTag color={obj.color} label={obj.name} icon="ri-flag-2-fill" />
      ),
    },
    {
      Header: "Description",
      id: "description",
      filterable: false,
      accessor: (obj) => <ApvReason text={obj.description} />,
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => <ApvActive active={obj.status} />,
    },
  ];

  const initialFormObj = useMemo(
    () => ({
      id: 0,
      name: "",
      color: "",
      description: "",
      default: false,
    }),
    [],
  );

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: Priorities_data?.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: Priorities_data?.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Priorities | ${MetaTitle}`;

  return (
    <React.Fragment>
      <div style={{ marginBottom: "70px" }}>
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={Priorities_data || []}
          formname={priorities_component_name}
          initialFormObj={initialFormObj}
          filterKey={filterKey}
          filterOptions={filterOptions}
          width_per={"30%"}
          table_class={"Lc_leave_apply_table"}
        />
      </div>
    </React.Fragment>
  );
};

export default Priorities;
