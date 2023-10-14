import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setEmployee } from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { GetCustomField } from "../../common/js/GetCustomField";

const Employee = () => {
  const dispatch = useDispatch();
  const { employee_data } = useSelector((state) => state.EmployeeReducer);

  const { version } = useSelector(state => state.MetaReducer)

  useEffect(() => {
    dispatch(setEmployee(GetLocalStorageData("employee") || []));
  }, [version]);


  const CustomFieldsForThisForm = GetCustomField("employee") || []; 

  console.log("CustomFieldsForThisForm = ", CustomFieldsForThisForm);

  // Column
  const additionalColumn = [
    {
      Header: "Name",
      accessor: "fname",
      filterable: false,
      id: "fname",
      accessor: (obj) => {
        return (
          obj.profile_url ? (
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-shrink-0">
                <img src={obj.profile_url} alt="" className="avatar-xs rounded-circle" />
              </div>
              <div className="flex-grow-1">
                <div>{obj.fname}</div>
                <div>{obj.email}</div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-xs rounded-circle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0ab39c' }} data-bs-toggle="tooltip" title={(obj.fname)}>
                  <span className="first_letter" style={{ color: 'white' }} >{(obj.fname).charAt(0)}</span>
                </div>
              </div>
              <div className="flex-grow-1">
                <div>{obj.fname}</div>
                <div>{obj.email}</div>
              </div>
            </div>

          )
        )
      },
      // filterable: false,
      // id: "nameAndEmail",
    },
    // {
    //   Header: "Email",
    //   accessor: "email",
    //   filterable: false,
    //   id: "email",
    // },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        const DepartmentData = GetLocalStorageData("department");
        let thisDepartment = DepartmentData
          ? DepartmentData.filter((data) => obj.primary_department === data.id)
          : [];
        console.log("Name = ", thisDepartment);
        return (
          <>
            {thisDepartment.map((d) => (
              <React.Fragment>{d.name}</React.Fragment>
            ))}
          </>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.is_active ? "Active" : "Inactive";
        let statusClass = obj.is_active ? "success" : "warning";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}>
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
      fname: "",
      lname: "",
      dob: String(new Date()),
      gender: "",
      primary_department: 0,
      sub_department: [],
      role: 0,
      work_schedule: 0,
      profile_timezone: "Asia/Kolkata",
      is_active: true,
      is_manager: false,
      profile_url: null,
      cf_values: CustomFieldsForThisForm || []
    };
  }, [version]);

  const filterKey = "is_active";
  const filterOptions = [
    { option: true, label: "Active" },
    { option: false, label: "Inactive" },
  ];

  document.title = `Employee | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={employee_data}
        formname={"employee"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
      />
    </React.Fragment>
  );
};

export default Employee;
