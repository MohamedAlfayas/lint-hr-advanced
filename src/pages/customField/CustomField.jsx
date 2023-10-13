import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { setCustomField } from "../../redux/reducers/ChildReducer/CustomFieldReducer";

const CustomField = () => {

  const dispatch = useDispatch()

  const { custom_fields } = useSelector(state => state.CustomFieldReducer);

  useEffect(() => {
    dispatch(setCustomField(GetLocalStorageData('custom_fields') || []));
  }, []);

  let types = [
    { id: "text", label: "Text", value: "text" },
    { id: "number", label: "Number", value: "number" },
    { id: "date", label: "Date", value: "date" },
  ];

  let module_lists = [
    { id: "emp", label: "Employee", value: "emp" },
    { id: "org", label: "Organization", value: "org" },
  ];

  // Column
  const additionalColumn = [
    {
      Header: "Display Name",
      accessor: "name",
      accessor: (obj) => {
        return <b>{obj.name}</b>;
      },
      filterable: false,
      id: "name",
    },
    {
      Header: "Field Type",
      accessor: (obj) => {
        return <b>{(types.find(e => e.value === obj.type)).label}</b>;
      },
      filterable: false,
      id: "fieldtype",
    },
    {
      Header: "Applicable For",
      accessor: (obj) => {
        return (
          <b>
            {obj.applicable_for_modules.map(e => {
              return (module_lists.find(m => m.value === e)).label
            })}
          </b>
        )

      },
      filterable: false,
      id: "applicablefor",
    },
    {
      Header: "Required",
      filterable: false,
      id: "is_required",
      accessor: (obj) => {
        let status = obj.is_required ? "Required" : "Optional";
        let statusClass = obj.is_required ? "success" : "warning";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}>
            {" "}
            {status}{" "}
          </span>
        );

      }
    },
  ];

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      type: "",
      is_required: false,
      applicable_for_modules: []
    };
  }, []);


  const filterKey = "is_required";
  const filterOptions = [
    { option: true, label: "Required" },
    { option: false, label: "Optional" },
  ];

  document.title = `Custom Field | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={custom_fields}
        formname={"custom_fields"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
      />
    </React.Fragment>
  );
};


export default CustomField;
