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
  const [CustomData, setCustomdata] = useState([
    {
      "id": 1,

      "name": "Paul",
      "type": "Text",
      "applicable_for_modules": ["Organization"],
      "is_required": true,

    }, {
      "id": 2,
      "name": "Antony",
      "type": "Number",
      "applicable_for_modules": ["Employee"],
      "is_required": false,
    }
  ])

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
        return <b>{obj.type}</b>;
      },
      filterable: false,
      id: "fieldtype",
    },
    {
      Header: "Applicable For",
      accessor: (obj) => {
        return <b>{obj.applicable_for_modules}</b>;
      },
      filterable: false,
      id: "applicablefor",
    },
    {
      Header: "Required",
      filterable: false,
      id: "is_required",
      accessor: (obj) => {
        return <b>{obj.is_required ? 'Required' : 'Not Required'}</b>;
        
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
