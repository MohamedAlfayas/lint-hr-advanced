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
  custom_field_component_name,
  custom_field_types,
} from "../../common/constant/Constants";
import {
  ApvChip,
  ApvStatus,
  ApvTitle,
} from "../../component/common/approval/ApprovalCells";

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

      accessor: (obj) => (
        <ApvTitle icon="ri-input-method-line" title={obj.name} sub={obj.input_name} />
      ),
      filterable: false,
      id: "name",
    },
    {
      Header: "Field Type",
      accessor: (obj) => (
        <ApvChip icon="ri-text">
          {custom_field_types.find((e) => e.value === obj.type)?.label || obj.type}
        </ApvChip>
      ),
      filterable: false,
      id: "fieldtype",
    },
    {
      Header: "Applicable For",
      accessor: (obj) => (
        <ApvChip icon="ri-apps-line">
          {(obj.applicable_for_modules || [])
            .map(
              (e) =>
                custom_field_applicable_modules.find((m) => m.value === e)?.label || e,
            )
            .join(" / ")}
        </ApvChip>
      ),
      filterable: false,
      id: "applicablefor",
    },
    {
      Header: "Required",
      filterable: false,
      id: "is_required",
      accessor: (obj) =>
        obj.is_required ? (
          <ApvStatus tone="danger" icon="ri-asterisk" label="Required" />
        ) : (
          <ApvStatus tone="secondary" icon="ri-checkbox-blank-circle-line" label="Optional" />
        ),
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
      img_url: "",
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

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={custom_fields}
        formname={custom_field_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
        table_class={"Lc_leave_apply_table me-n3 ms-n3"}
      />
    </React.Fragment>
  );
};

export default CustomField;
