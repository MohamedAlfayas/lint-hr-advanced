import React, { useEffect, useMemo, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";

import { useDispatch, useSelector } from "react-redux";

import { setMapping } from "../../redux/reducers/ChildReducer/AssignCustomFormReducer";

import { assign_custom_form_component_name } from "../../common/constant/Constants";

import { GetApi } from "../../common/api/GetApi";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const CUSTOM_FORM_STORAGE_KEY = "custom_form_list";

// ================= EMPLOYEE AVATAR =================
const EmployeeAvatar = ({ emp, size = 32, style = {} }) => {
  const initial =
    `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() ||
    (emp.label || emp.name || "?")[0].toUpperCase();

  const name =
    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
    emp.label ||
    emp.name ||
    "";

  return (
    <div
      data-bs-toggle="tooltip"
      title={name}
      style={{ flexShrink: 0, ...style }}
    >
      {emp.profile_url ? (
        <img
          src={emp.profile_url}
          alt={name}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #fff",
          }}
        />
      ) : (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: "#0ab39c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: size * 0.4,
            border: "2px solid #fff",
          }}
        >
          {initial}
        </div>
      )}
    </div>
  );
};

const AsignCustomFormTable = () => {
  const dispatch = useDispatch();

  const { mapping_data } = useSelector(
    (state) => state.AssignCustomFormReducer,
  );

  const [customForms, setCustomForms] = useState([]);

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

  // ================= CUSTOM FORM LIST (FOR NAME LOOKUP) — FROM LOCAL STORAGE =================
  useEffect(() => {
    const forms = GetLocalStorageData(CUSTOM_FORM_STORAGE_KEY) || [];
    setCustomForms(forms);
  }, []);

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

  // ================= EMPLOYEE ID -> NAME LOOKUP =================
  const employeeMap = useMemo(() => {
    const employees = GetLocalStorageData("employee") || [];

    return employees.reduce((acc, emp) => {
      acc[emp.id] =
        emp.first_name || emp.employee_name || emp.full_name || `#${emp.id}`;
      return acc;
    }, {});
  }, []);

  // ================= EMPLOYEE ID -> FULL PROFILE LOOKUP (for avatars) =================
  const employeeProfileMap = useMemo(() => {
    const employees = GetLocalStorageData("employee") || [];

    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, []);

  const getEmployeeProfile = (id) =>
    employeeProfileMap[id] || { id, label: employeeMap[id] || `#${id}` };

  // ================= CUSTOM STATUS ID -> NAME LOOKUP =================
  const statusMap = useMemo(() => {
    const statuses = GetLocalStorageData("custom_statuses") || [];

    return statuses.reduce((acc, st) => {
      acc[st.id] = st.name || `#${st.id}`;
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

        Cell: ({ row }) => {
          const customFormId = row.original?.custom_form;

          if (
            customFormId === undefined ||
            customFormId === null ||
            customFormId === 0 ||
            customFormId === "0"
          ) {
            return "-";
          }

          return (
            <b>{customFormMap[String(customFormId)] || `#${customFormId}`}</b>
          );
        },
      },
      {
        Header: "Custom Status",
        id: "custom_status",
        filterable: false,

        Cell: ({ row }) => {
          const id = row.original.custom_status;
          return statusMap[id] || `#${id}`;
        },
      },

      {
        Header: "Employees",
        id: "employee_id_list",
        filterable: false,

        Cell: ({ row }) => {
          const list = row.original.employee_id_list || [];

          if (!list.length) return "-";

          const avatarSize = window.innerWidth < 768 ? 24 : 32;
          const visible = list.slice(0, 3);
          const extra = list.length - visible.length;

          return (
            <div className="d-flex align-items-center">
              {visible.map((id, idx) => {
                const employee = getEmployeeProfile(id);
                return (
                  <EmployeeAvatar
                    key={id}
                    emp={employee}
                    size={avatarSize}
                    style={{
                      marginLeft: idx === 0 ? 0 : -avatarSize * 0.35,
                      zIndex: visible.length - idx,
                      position: "relative",
                    }}
                  />
                );
              })}

              {extra > 0 && (
                <div
                  style={{
                    width: `${avatarSize}px`,
                    height: `${avatarSize}px`,
                    borderRadius: "50%",
                    background: "#e9ecef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#495057",
                    fontWeight: 600,
                    fontSize: avatarSize * 0.32,
                    border: "2px solid #fff",
                    marginLeft: -avatarSize * 0.35,
                    position: "relative",
                    zIndex: 0,
                  }}
                >
                  +{extra}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [customFormMap, employeeMap, employeeProfileMap, statusMap],
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
