import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Piriorities_data } from "../../../redux/reducers/ChildReducer/PirioritiesReducer";
import { piriorities_component_name,behaviorTypeOptions } from "../../../common/constant/Constants";


const Piriorities = () => {
  const dispatch = useDispatch();

  const { Piriorities_data } = useSelector(
    (state) => state.PirioritiesReducer
  );
  console.log("status_data", Piriorities_data);
  

  // useEffect(() => {
  //   dispatch(setStatus)
  // }, []);




  const additionalColumn = [
    {
      Header: "Piriority Name",
      accessor: "name",
      filterable: false,
      id: "name",
      accessor: (obj) => {
        return (
          <span>
            {obj.name}
          </span>
        );
      },
    },
    {
      Header: "Description",
      accessor: "description",
      filterable: false,
      id: "description",
    },
    {
      Header: "Help text for agents",
      accessor: "help_text",
      filterable: false,
      id: "help_text",
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
      description: "",
      help_text:"",
      default:false,
      
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
      Piriorities_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
      Piriorities_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Priorities | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={Piriorities_data}
        formname={piriorities_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default Piriorities;
