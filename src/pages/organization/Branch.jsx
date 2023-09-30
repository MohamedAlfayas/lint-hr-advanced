import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
// import { Table } from 'rsuite';
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

// const { Column, HeaderCell, Cell } = Table;

//import images

const Branch = () => {
  const dispatch = useDispatch();

  const [data] = useState([
    {
      id: 1,
      first_name: "Alwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 2,
      first_name: "Blwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 3,
      first_name: "Clwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 4,
      first_name: "Dlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 5,
      first_name: "Elwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 6,
      first_name: "Flwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 7,
      first_name: "Glwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 8,
      first_name: "Hlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 9,
      first_name: "Ilwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 10,
      first_name: "Jlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 11,
      first_name: "Klwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 12,
      first_name: "Llwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
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

  const handleBranchEdit = () => {
    dispatch(setFormTitle("Branch"));
    dispatch(
      setFormObj({
        id: "0",
        name: "",
        total_branches: 1,
        description: "",
      })
    );
    dispatch(setFormWidthPercentage("80%"));
    dispatch(setComponentToShow("branch"));
    dispatch(toggleRSBView(true));
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <h4 className="card-title mb-0">Branch</h4>
          <Button onClick={() => handleBranchEdit()}>Edit Branch</Button>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="card overflow-x-auto">
                {/* <Table
                  height={400}
                  data={data}
                  onRowClick={rowData => {
                    console.log(rowData);
                  }}
                >
                  <Column align="center" fixed>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey="id" />
                  </Column>

                  <Column>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey="first_name" />
                  </Column>

                  <Column>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey="last_name" />
                  </Column>

                  <Column>
                    <HeaderCell>Gender</HeaderCell>
                    <Cell dataKey="gender" />
                  </Column>

                  <Column>
                    <HeaderCell>Age</HeaderCell>
                    <Cell dataKey="age" />
                  </Column>

                  <Column>
                    <HeaderCell>Address</HeaderCell>
                    <Cell dataKey="address" />
                  </Column>

                  <Column>
                    <HeaderCell>City</HeaderCell>
                    <Cell dataKey="city" />
                  </Column>

                  <Column>
                    <HeaderCell>State</HeaderCell>
                    <Cell dataKey="state" />
                  </Column>

                  <Column>
                    <HeaderCell>Country</HeaderCell>
                    <Cell dataKey="country" />
                  </Column>

                  <Column>
                    <HeaderCell>Continent</HeaderCell>
                    <Cell dataKey="continent" />
                  </Column>

                  <Column fixed="right">
                    <HeaderCell>Action</HeaderCell>

                    <Cell style={{ padding: '6px' }}>
                      {rowData => (
                        <Button appearance="link" onClick={() => alert(`id:${rowData.id}`)}>
                          Edit
                        </Button>
                      )}
                    </Cell>
                  </Column>
                </Table> */}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Branch;
