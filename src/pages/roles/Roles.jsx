import React from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";

const Roles = () => {
  document.title = `Role | ${MetaTitle}`;

  const [roledata, setRoleData] = useState([
    {
      id: 1,
      name: "Super Admin",
      description: "",
      status: 1,
      roles: [
        "per_company_view", 
        "per_company_create",
        "per_company_edit",
        "per_company_delete",
        "per_employee_view",
        "per_employee_create",
        "per_employee_edit",
        "per_employee_delete",
        "per_role_view",
        "per_role_create",
        "per_role_edit",
        "per_role_delete",
        "per_ws_view",
        "per_ws_create",
        "per_ws_edit",
        "per_ws_delete",
        "per_holiday_view",
        "per_holiday_create",
        "per_holiday_edit",
        "per_holiday_delete",
        "per_department_view",
        "per_department_create",
        "per_department_edit",
        "per_department_delete",
        "per_attendance_report",
      ],
      total_employees: 43,
    },
    {
      id: 2,
      name: "Admin",
      description: "",
      status: 1,
      roles: [        
        "per_employee_view",
        "per_employee_create",
        "per_employee_edit",
        "per_employee_delete",
        "per_role_view",
        "per_role_create",
        "per_role_edit",
        "per_role_delete",
        "per_ws_view",
        "per_ws_create",
        "per_ws_edit",
        "per_ws_delete",
        "per_holiday_view",
        "per_holiday_create",
        "per_holiday_edit",
        "per_holiday_delete",
        "per_department_view",
        "per_department_create",
        "per_department_edit",
        "per_department_delete",
        "per_attendance_report",
      ],
      total_employees: 43,
    },
    {
      id: 3,
      name: "Manager",
      description: "",
      status: 1,
      roles: [        
        "per_employee_view",
        "per_employee_create",
        "per_employee_edit",
        "per_ws_view",
        "per_ws_create",
        "per_ws_edit",
        "per_holiday_view",
        "per_holiday_create",
        "per_holiday_edit",
        "per_department_view",
      ],
      total_employees: 43,
    },
    {
      id: 4,
      name: "Employee",
      description: "",
      status: 1,
      roles: [
        "per_employee_view",
        "per_role_view",
        "per_ws_view",
        "per_holiday_view",
        "per_department_view",
      ],
      total_employees: 43,
    },
  ]);

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

  const [roledata1, setRoleData1] = useState([
    {
      id: 1,
      description: "",
      name: "Admin",
      status: 1,
      total_employees: 5,
      total_permissions: 100,
    },
    {
      id: 2,
      description: "",
      name: "Manager",
      status: 1,
      total_employees: 12,
      total_permissions: 90,
    },
    {
      id: 3,
      description: "",
      name: "Team Lead",
      status: 1,
      total_employees: 22,
      total_permissions: 50,
    },
    {
      id: 4,
      description: "",
      name: "Developer",
      status: 1,
      total_employees: 57,
      total_permissions: 30,
    },
    {
      id: 5,
      description: "",
      name: "Junior Developer",
      status: 2,
      total_employees: 25,
      total_permissions: 10,
    },
    {
      id: 6,
      description: "",
      name: "Content Writer",
      status: 2,
      total_employees: 25,
      total_permissions: 10,
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
      Header: "Employees",
      accessor: "total_employees",
      filterable: false,
      id: "total_employees",
    },
    {
      Header: "Permissions",
      accessor: "roles",
      filterable: false,
      id: "roles",
      accessor: (obj) => {
        console.log("obj");
        console.log(obj);
        let row_id = obj.id;

        return <b>{obj.roles.length}</b>;
      },
    },
    {
      Header: "Status",
      id: "status",
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

  const filterKey = "status";
  const filterOptions = [
    { option: "1", label: "Primary" },
    { option: "2", label: "Secondary" },
  ];

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={roledata}
        formname={"role"}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"60%"}
      />
    </React.Fragment>
  );
};

export default Roles;
