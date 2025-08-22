import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

// import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useMemo } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { contact_group_component_name } from "../../../common/constant/Constants"


const ContactGroup = () => {
  const dispatch = useDispatch();

  const { contact_group_data } = useSelector(
    (state) => state.ContactGroupReducer
  );
  console.log("contact_group_data", contact_group_data);
  

  // useEffect(() => {
  //   dispatch(setStatus)
  // }, []);




  const additionalColumn = [
    {
        Header: "ID",
        accessor: "id",
        filterable: false,
        id: "id",
      },
    {
      Header: "Name",
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
      Header: "Domain",
      accessor: "domain",
      filterable: false,
      id: "domain",
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
      domain:"",
      
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
      contact_group_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
      contact_group_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Contact Group | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={contact_group_data}
        formname={contact_group_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default ContactGroup;
