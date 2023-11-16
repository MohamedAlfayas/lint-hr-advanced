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
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

const Employee = () => {
  const dispatch = useDispatch();
  const { employee_data } = useSelector((state) => state.EmployeeReducer);

  const { version } = useSelector((state) => state.MetaReducer);

  useEffect(() => {
    dispatch(setEmployee(GetLocalStorageData("employee") || []));
  }, [version]);

  const CustomFieldsForThisForm = GetCustomField("employee") || [];

  const viewEmployee = (obj) => {
    console.log("Dep Edit = ", obj);

    dispatch(setFormTitle("Employee Details"));
    dispatch(setFormObj(obj));
    dispatch(setFormWidthPercentage("25%"));
    dispatch(setComponentToShow("profileViewMin"));
    dispatch(toggleRSBView(true));
  };

  // Column
  const additionalColumn = [
    {
      Header: "Name",
      accessor: "fname",
      filterable: false,
      id: "fname",
      accessor: (obj) => {
        return obj.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={obj.profile_url}
                alt=""
                className="avatar-xs rounded-circle"
              />
            </div>
            <div className="flex-grow-1">
              <div>
                <Link
                  to="#"
                  onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0">
                  {" "}
                  <h5 className="fs-14 mb-1">{obj.fname}</h5>
                </Link>
              </div>
              <div>{obj.email}</div>
            </div>
          </div>
        ) : (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={obj.fname}>
                <span className="first_letter" style={{ color: "white" }}>
                  {obj.fname.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div>
                <Link
                  to="#"
                  onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0">
                  {" "}
                  <h5 className="fs-14 mb-1">{obj.fname}</h5>
                </Link>
              </div>
              <div>{obj.email}</div>
            </div>
          </div>
        );
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
      Header: "Role",
      id: "role",
      filterable: false,
      accessor: (obj) => {
        const RoleData = GetLocalStorageData("role");
        let thisRole = RoleData
          ? RoleData.filter((data) => obj.role === data.id)
          : [];
        return (
          <>
            {thisRole.map((d) => (
              <React.Fragment>{d.name}</React.Fragment>
            ))}
          </>
        );
      },
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        const DepartmentData = GetLocalStorageData("department");
        let thisDepartment = DepartmentData
          ? DepartmentData.filter((data) => obj.primary_department === data.id)
          : [];

        var subDepList = obj.sub_department
          ? DepartmentData.filter((datas, index) => {
              if (obj.sub_department.includes(parseInt(datas.id))) {
                return datas;
              }
            })
          : [];

        return (
          <span>
            <Button
              color="light"
              id={`depListRef-${obj.id}`}
              className="position-relative">
              {thisDepartment.map((d) => (
                <React.Fragment>{d.name}</React.Fragment>
              ))}
              {obj.sub_department.length > 0 ? (
                <span>
                  <Badge
                    //id="tooltipwithHtml"
                    pill
                    color="success"
                    className="position-absolute top-0 start-100 translate-middle">
                    +{obj.sub_department.length}
                    <span className="visually-hidden">Departments</span>
                  </Badge>

                  <UncontrolledTooltip
                    placement="bottom"
                    target={`depListRef-${obj.id}`}>
                    {" "}
                    <div className="mt-1">
                      {subDepList.map((item, key) => (
                        <p className="mb-1">{item.name}</p>
                      ))}
                    </div>{" "}
                  </UncontrolledTooltip>
                </span>
              ) : (
                ""
              )}
            </Button>
          </span>
        );

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
      emp_id:"",
      fname: "",
      lname: "",
      dob: String(new Date()),
      joining_date: String(new Date()),
      id_proof: null,
      file_1:null,
      file_2:null,
      file_3:null,
      file_4:null,
      file_5:null,
      contact_number:"",
      gender: "",
      primary_department: 0,
      sub_department: [],
      role: 0,
      work_schedule: 0,
      profile_timezone: "Asia/Kolkata",
      is_active: true,
      is_manager: false,
      profile_url: null,
      cf_values: CustomFieldsForThisForm || [],
    };
  }, [version]);

  const filterKey = "is_active";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: employee_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: employee_data.filter((e) => e[filterKey] === false).length || 0,
    },
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
