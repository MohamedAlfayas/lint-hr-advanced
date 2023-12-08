import React, { Fragment } from "react";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Button } from "reactstrap";

const RsuiteTable = () => {
  const { Column, HeaderCell, Cell } = Table;

  const role_data = GetLocalStorageData("role") || [];

  console.log("Role Data = ", role_data);

  return (
    <Fragment>
      <Table height={400} data={role_data}>
        <Column width={60} align="center" fixed="left">
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={80} fixed="right">
          <HeaderCell>Action</HeaderCell>

          <Cell style={{ padding: "6px" }}>
            {(rowData) => (
              <Button
                appearance="link"
                onClick={() => alert(`name:${rowData.name}`)}
              >
                Edit
              </Button>
            )}
          </Cell>
        </Column>
      </Table>
    </Fragment>
  );
};

export default RsuiteTable;
