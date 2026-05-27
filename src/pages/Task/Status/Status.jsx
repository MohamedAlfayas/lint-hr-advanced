import React, { useEffect, useMemo } from "react";

import "react-toastify/dist/ReactToastify.css";

import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";

import { useDispatch, useSelector } from "react-redux";

import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";

import { status_component_name } from "../../../common/constant/Constants";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

const Status = () => {
  const dispatch = useDispatch();

  const { status_data } = useSelector((state) => state.StatusReducer);

  // ================= LOAD LOCAL STORAGE =================
  useEffect(() => {
    const localStatus = GetLocalStorageData("task_status") || [];

    dispatch(setStatus(localStatus));
  }, [dispatch]);

  // ================= TABLE COLUMNS =================
  const additionalColumn = useMemo(
    () => [
      {
        Header: "Status Name",
        id: "name",
        filterable: false,
        accessor: (obj) => (
          <span
            className="badge text-uppercase"
            style={{
              backgroundColor: obj.color || "#6c757d",
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

        Cell: ({ row }) => {
          return row.original.description || "-";
        },
      },

      {
        Header: "Status",
        id: "status",
        filterable: false,

        Cell: ({ row }) => {
          const obj = row.original;

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
    ],
    [],
  );

  // ================= INITIAL FORM =================
  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      color: "#000000",
      description: "",
      behavior: "",
      status: true,
      default: false,
    };
  }, []);

  // ================= FILTER =================
  const filterKey = "status";

  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
        (status_data || []).filter((e) => e[filterKey] === true).length || 0,
    },

    {
      option: false,
      label: "Inactive",
      count:
        (status_data || []).filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Status | ${MetaTitle}`;

  return (
    <React.Fragment>
      <div style={{ marginBottom: "70px" }}>
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={status_data || []}
          formname={status_component_name}
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

export default Status;
