import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
// import { Table } from 'rsuite';
import { setComponentToShow, setFormObj, setFormTitle, setFormWidthPercentage, toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";

// const { Column, HeaderCell, Cell } = Table;

//import images

const Branch = () => {

  const dispatch = useDispatch()

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


  const handleBranchEdit = () =>{
    dispatch(setFormTitle("Branch"));
    dispatch(setFormObj({
      id : "0",
      name : "",
      total_branches : 1,
      description : "",
    }));
    dispatch(setFormWidthPercentage("40%"))
    dispatch(setComponentToShow('branch'));
    dispatch(toggleRSBView(true));
  }



  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <h4 className="card-title mb-0">Branch</h4>
          <Button onClick={() => handleBranchEdit()}>
            Edit Branch
          </Button>
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