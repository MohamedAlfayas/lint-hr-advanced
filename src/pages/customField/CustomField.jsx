import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { setCustomField } from "../../redux/reducers/ChildReducer/CustomFieldReducer";
import {
  custom_field_applicable_modules,
  custom_field_types,
} from "../../common/constant/Constants";

const CustomField = () => {
  // const [CustomData, setCustomdata] = useState([
  //   {
  //     "id": 1,
  //     "name": "Aadhar Number",
  //     "input_name": "aadhar_number",
  //     "type": "text",
  //     "applicable_for_modules": [
  //       "employee"
  //     ],
  //     "is_required": true,
  //     "status": true
  //   },
  //   {
  //     "id": 2,
  //     "name": "MMID No",
  //     "input_name": "mmid_no",
  //     "type": "number",
  //     "applicable_for_modules": [
  //       "organization"
  //     ],
  //     "is_required": true,
  //     "status": true
  //   },
  //   {
  //     "id": 3,
  //     "name": "UAN No",
  //     "input_name": "uan_no",
  //     "type": "number",
  //     "applicable_for_modules": [
  //       "employee"
  //     ],
  //     "is_required": false,
  //     "status": true
  //   },
  //   {
  //     "id": 4,
  //     "name": "GST Number",
  //     "input_name": "gst_number",
  //     "type": "text",
  //     "applicable_for_modules": [
  //       "organization"
  //     ],
  //     "is_required": false,
  //     "status": true
  //   },
  //   {
  //     "id": 5,
  //     "name": "Reg No",
  //     "input_name": "reg_no",
  //     "type": "text",
  //     "applicable_for_modules": [
  //       "organization"
  //     ],
  //     "is_required": true,
  //     "status": true
  //   }
  // ])

  const dispatch = useDispatch();

  const { custom_fields } = useSelector((state) => state.CustomFieldReducer);

  useEffect(() => {
    dispatch(setCustomField(GetLocalStorageData("custom_fields") || []));
  }, []);

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
        return (
          <b>
            {custom_field_types.find((e) => e.value === obj.type)?.label || ""}
          </b>
        );
      },
      filterable: false,
      id: "fieldtype",
    },
    {
      Header: "Applicable For",
      accessor: (obj) => {
        return (
          <b>
            {obj.applicable_for_modules.map((e) => {
              return (
                custom_field_applicable_modules.find((m) => m.value === e)
                  ?.label || ""
              );
            })}
          </b>
        );
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
      type: "",
      options: [],
      max_size: 1,
      is_required: false,
      applicable_for_modules: [],
    };
  }, []);

  const filterKey = "is_required";
  const filterOptions = [
    {
      option: true,
      label: "Required",
      count: custom_fields.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Optional",
      count: custom_fields.filter((e) => e[filterKey] === false).length || 0,
    },
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
