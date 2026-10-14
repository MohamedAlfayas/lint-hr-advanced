import React, { useEffect, useMemo } from "react";

import "react-toastify/dist/ReactToastify.css";

import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";

import { useDispatch, useSelector } from "react-redux";

import { setMapping } from "../../redux/reducers/ChildReducer/AssignCustomFormReducer";

import { assign_custom_form_component_name } from "../../common/constant/Constants";

import { GetApi } from "../../common/api/GetApi";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  ApvChip,
  ApvEmpty,
  ApvPeople,
  ApvTitle,
} from "../../component/common/approval/ApprovalCells";

const CUSTOM_FORM_STORAGE_KEY = "custom_form";

const AsignCustomFormTable = () => {
  const dispatch = useDispatch();

  const { mapping_data } = useSelector(
    (state) => state.AssignCustomFormReducer,
  );

  // ================= FETCH MAPPING FROM API -> REDUX ONLY (NO LOCALSTORAGE) =================
  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const response = await GetApi(
          "custom/employee-custom-form-mapping/",
          false,
        );

        if (response?.status === 200) {
          const mappings = response?.data?.data || [];
          dispatch(setMapping(mappings));
        }
      } catch (error) {
        console.log("ERROR =", error);
      }
    };

    fetchMapping();
  }, [dispatch]);

  // ================= CUSTOM FORM ID -> NAME LOOKUP =================
  const customFormMap = useMemo(() => {
    const forms = GetLocalStorageData(CUSTOM_FORM_STORAGE_KEY) || [];

    return forms.reduce((acc, form) => {
      if (form?.id !== undefined && form?.id !== null) {
        acc[String(form.id)] =
          form.name || form.label || form.title || `#${form.id}`;
      }

      return acc;
    }, {});
  }, []);

  // ================= EMPLOYEE ID -> FULL PROFILE LOOKUP =================
  const employeeProfileMap = useMemo(() => {
    const employees = GetLocalStorageData("employee") || [];

    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, []);

  // ================= CUSTOM STATUS ID -> STATUS LOOKUP =================
  const statusMap = useMemo(() => {
    const statuses = GetLocalStorageData("custom_statuses") || [];

    return statuses.reduce((acc, st) => {
      acc[st.id] = st;
      return acc;
    }, {});
  }, []);

  // ================= TABLE COLUMNS =================
  const additionalColumn = useMemo(
    () => [
      {
        Header: "Custom Form",
        id: "custom_form",
        filterable: false,
        accessor: (obj) => {
          const name = obj?.custom_form ? customFormMap[String(obj.custom_form)] : null;
          return name ? (
            <ApvTitle icon="ri-survey-line" title={name} tone="info" />
          ) : (
            <ApvEmpty />
          );
        },
      },
      {
        Header: "Custom Status",
        id: "custom_status",
        filterable: false,
        accessor: (obj) => {
          const st = statusMap[obj.custom_status];
          const emoji = st?.emoji ?? st?.icon;
          return (
            <ApvChip icon={emoji ? undefined : "ri-emotion-line"}>
              {`${emoji ? `${emoji} ` : ""}${st?.name || `#${obj.custom_status}`}`}
            </ApvChip>
          );
        },
      },
      {
        Header: "Employees",
        id: "employee_id_list",
        filterable: false,
        accessor: (obj) => (
          <ApvPeople
            people={(obj.employee_id_list || []).map(
              (id) => employeeProfileMap[id] || { id, first_name: `#${id}` },
            )}
          />
        ),
      },
    ],
    [customFormMap, employeeProfileMap, statusMap],
  );

  // ================= INITIAL FORM =================
  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      custom_form: 0,
      custom_status: 0,
      employee_id_list: [],
    };
  }, []);

  document.title = `Assign Custom Form | ${MetaTitle}`;

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={mapping_data || []}
        formname={assign_custom_form_component_name}
        initialFormObj={initialFormObj}
        width_per={"30%"}
        table_class={"Lc_leave_apply_table"}
      />
    </React.Fragment>
  );
};

export default AsignCustomFormTable;
