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
    const [CustomData,setCustomdata] = useState([ 
      {
        "id" : 1,
        
        "name" : "Paul",
        "field_type" : "Text",
        "required" : "No",
        
      },{
        "id" : 2,
        "name" : "Antony",
        "field_type" : "Number",
       "required" : "Yes",
      }
    ])

  // Column
  const additionalColumn = [
    
     
    {
      Header: "Name",
         accessor: (obj) => {
        return <b>{obj.name}</b>;
      },
      filterable: false,
      id: "name",
    },
    {
        Header: "Field Type",
        accessor: (obj) => {
            return <b>{obj.field_type}</b>;
          },
        filterable: false,
        id: "fieldtype",
      },
   
    
    {
      Header: "Required",
      accessor: "required",
      filterable: false,
      id: "required",
      accessor: (obj) => {
        return <b>{obj.required}</b>;
      }
    },
  ];

  const initialFormObj = useMemo(() => {
    return    {
        id : 1,
        
        name: "Paul",
        field_type : "Text",
        required : "No",
        
      },{
        id : 2,
        name : "Antony",
        field_type : "Number",
       required : "Yes",
      }}, []);
    

  const filterKey = "is_active";
  const filterOptions = [
    { option: true, label: "Approval" },
    { option: false, label: "Reject" },
  ];

  document.title = `Custom Field | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={CustomData}
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
