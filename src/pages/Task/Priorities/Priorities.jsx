import React, { useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setPriorities } from "../../../redux/reducers/ChildReducer/PrioritiesReducer";
import { priorities_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

const Priorities = () => {
  const dispatch = useDispatch();

  const { Priorities_data } = useSelector((state) => state.PrioritiesReducer);

  // ================= LOAD LOCAL STORAGE ON PAGE LOAD =================
  useEffect(() => {
    const localPriorities = GetLocalStorageData("task_priority") || [];
    dispatch(setPriorities(localPriorities));
  }, [dispatch]);

  const isValidColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  };
  

  const additionalColumn = [
    {
      Header: "Priority Name",
      id: "name",
      filterable: false,
      accessor: (obj) => (
        <span
          className="badge text-uppercase"
          style={{
            // backgroundColor: obj.color || "#6c757d",
            backgroundColor: isValidColor(obj.color)
              ? obj.color
              : "#000000",
            color: "#fff",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {obj.name}
        </span>
      ),
    },

    {
      Header: "Description",
      accessor: "description",
      filterable: false,
      id: "description",
    },

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        const status = obj.status ? "Active" : "Inactive";
        const statusClass = obj.status ? "success" : "warning";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
          >
            {status}
          </span>
        );
      },
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
