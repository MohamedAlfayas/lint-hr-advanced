import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";
import { status_component_name,behaviorTypeOptions } from "../../../common/constant/Constants";
import { Api } from "../../../common/api/Api";


const Status = () => {
  const dispatch = useDispatch();

  const { status_data } = useSelector(
    (state) => state.StatusReducer
  );
 
  

  useEffect(() => {
    Api({
      method: "GET",
      url: "/task-status/get/",
    })
      .then((res) => {
        dispatch(setStatus(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR");
      });
  }, []);





  const additionalColumn = [
    {
      Header: "Status Name",
      accessor: "name",
      filterable: false,
      id: "name",
      accessor: (obj) => {
        return (
          <span
            style={{ color: "white", backgroundColor: obj.color, textAlign: "center", padding: "5px", borderRadius: "5px" ,fontSize:"14px"}}
            className="kt-badge kt-badge--md kt-badge--inline kt-badge--pill kt-badge--rounded"
          >
            {obj.name}
          </span>
        );
      },
    },
    
    {
      Header: "Behavior",
      accessor: (obj) => {
         
        const behavior = behaviorTypeOptions.find((e) => e.value === obj.behavior).label;   
        return <b>{behavior}</b>;
      },
      filterable: false,
      id: "Behavior",
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
      color: "#000000",
      behavior:0,
      description: "",
      default:false, 
      
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
      status_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
      status_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Status | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={status_data}
        formname={status_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default Status;
