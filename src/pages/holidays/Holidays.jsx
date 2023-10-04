import React, { useEffect } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { setRole } from "../../redux/reducers/ChildReducer/RoleReducer";
import "../holidays/holidays.css"
import {Nav, NavItem, NavLink}  from "reactstrap";
import classnames from "classnames";
import Calender from "./Calendar";
const Roles = () => {
  document.title = `Holidays | ${MetaTitle}`;

  const dispatch = useDispatch()
  const [showCalendar, setShowCalendar] = useState(false);
 


  const { role_data } = useSelector(state => state.RoleReducer);
  console.log("Role DAta = ",role_data);


  useEffect(() => {
    Api({
      method: 'GET',
      url: '/role/get-role'
    })
      .then(res => {
        console.log("RES = ", res);
        dispatch(setRole(res?.data?.data))
      })
      .catch(err => {
        console.log("ERR = ", err);
      })
  }, []);


  const [rolelist, setListData] = useState([
    {
      id: 1,
      Name: "Company",
      priority: 1,
      note: "",
      permission: [
        {
          id: 1,
          notes: "User Can View All Branch",
          element: "per_company_view",
        },
        {
          id: 2,
          notes: "User Can Create New Branch",
          element: "per_company_create",
        },
        {
          id: 3,
          notes: "User Can Edit Branch",
          element: "per_company_edit",
        },
        {
          id: 4,
          notes: "User Can Delete Branch",
          element: "per_company_delete",
        },
      ],
    },
    {
      id: 2,
      Name: "Employee",
      priority: 2,
      note: "",
      permission: [
        {
          id: 5,
          notes: "User Can View All Employee In his Department",
          element: "per_employee_view",
        },
        {
          id: 6,
          notes: "User Can Create New Employee",
          element: "per_employee_create",
        },
        {
          id: 7,
          notes: "User Can Edit Employee",
          element: "per_employee_edit",
        },
        {
          id: 8,
          notes: "User Can Delete Employee",
          element: "per_employee_delete",
        },
      ],
    },
    {
      id: 2,
      Name: "Roles",
      priority: 1,
      note: "",
      permission: [
        {
          id: 9,
          notes: "User Can View All Roles",
          element: "per_role_view",
        },
        {
          id: 10,
          notes: "User Can Create New Role",
          element: "per_role_create",
        },
        {
          id: 11,
          notes: "User Can Edit Role",
          element: "per_role_edit",
        },
        {
          id: 12,
          notes: "User Can Delete Role",
          element: "per_role_delete",
        },
      ],
    },
    {
      id: 3,
      Name: "Work_Schedule",
      priority: 1,
      note: "",
      permission: [
        {
          id: 13,
          notes: "User Can View All Work Schedule",
          element: "per_ws_view",
        },
        {
          id: 14,
          notes: "User Can Create New Work Schedule",
          element: "per_ws_create",
        },
        {
          id: 15,
          notes: "User Can Edit Work Schedule",
          element: "per_ws_edit",
        },
        {
          id: 16,
          notes: "User Can Delete Work Schedule",
          element: "per_ws_delete",
        },
      ],
    },
    {
      id: 4,
      Name: "Holiday",
      priority: 1,
      note: "",
      permission: [
        {
          id: 17,
          notes: "User Can View All Holiday",
          element: "per_holiday_view",
        },
        {
          id: 18,
          notes: "User Can Create New Holiday",
          element: "per_holiday_create",
        },
        {
          id: 19,
          notes: "User Can Edit Holiday",
          element: "per_holiday_edit",
        },
        {
          id: 20,
          notes: "User Can Delete Holiday",
          element: "per_department_delete",
        },
      ],
    },
    {
      id: 5,
      Name: "Department",
      priority: 2,
      note: "",
      permission: [
        {
          id: 21,
          notes: "User Can View All Departments",
          element: "per_department_view",
        },
        {
          id: 22,
          notes: "User Can Create New Departments",
          element: "per_department_create",
        },
        {
          id: 23,
          notes: "User Can Edit Departments",
          element: "per_department_edit",
        },
        {
          id: 24,
          notes: "User Can Delete Departments",
          element: "per_department_delete",
        },
      ],
    },
  ]);


  const additionalColumn = [
    {
      Header: "Name",
      accessor: "name",
      filterable: false,
      id: "name",
    },
    {
      Header: "Date",
      accessor: "date",
      filterable: false,
      id: "date",
    },
    {
      Header: "Description",
      accessor: "description",
      filterable: false,
      id: "description",
      accessor: (obj) => {
        return <b>{obj.roles.length}</b>;
      },
    },
    {
      Header: "Shift",
      id: "shift",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status === 1 ? "Primary" : "Secondary";
        let statusClass = obj.status === 1 ? "success" : "info";
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
      name: "",
      total_employees: 0,
      roles: [],
      status: 1,
      description: "",
    };
  }, []);
console.log('initai' , initialFormObj , typeof initialFormObj);
  const filterKey = "status";
  const filterOptions = [
    { option: 1, label: "Primary" },
    { option: 2, label: "Secondary" },
  ];


  return (
    <React.Fragment>
      <div id="lc_btn" className="page-content">
      <Nav tabs className="nav nav-tabs nav-justified nav-border-top nav-border-top-success mb-3 ">
                                        <NavItem>
                                            <NavLink style={{ cursor: "pointer" }} className={classnames({ active: !showCalendar })} onClick={() => setShowCalendar(false)}> 
                                                 List
                                            </NavLink>
                                            </NavItem>
                                            <NavItem>
                                            <NavLink style={{ cursor: "pointer" }} className={classnames({ active: showCalendar })} onClick={() => setShowCalendar(true)}> 
                                                 Calendar
                                            </NavLink>
                                            </NavItem>
                                            </Nav>
        {/* <button  onClick={() => setShowCalendar(false)}>List</button>
        <button onClick={() => setShowCalendar(true)}>Calendar</button> */}
      </div>
      {showCalendar ? (
        <Calender
        />
      ) 
      : (
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={role_data}
          formname={"Holidays List"}
          initialFormObj={initialFormObj}
          filterKey={filterKey}
          filterOptions={filterOptions}
          width_per={"60%"}
        />
      )}
      {role_data.length === 0 && !showCalendar && (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>No Role Data</h2>
        </div>
      )}
    </React.Fragment>
  );
}

export default Roles;
