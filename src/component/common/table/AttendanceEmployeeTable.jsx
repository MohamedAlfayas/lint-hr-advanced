import React, { Fragment } from "react";
import { Table } from "rsuite";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Button } from "reactstrap";

const AttendanceEmployeeTable = () => {
  const { Column, HeaderCell, Cell } = Table;
  const [loading, setLoading] = React.useState(false);

  const role_data = GetLocalStorageData("role") || [];
  const Attendance_data = [
    {
      id: 1,
      date: "Jan 1, 2023 (Mon)",
      ws: "9Hr 30m",
      in_hr: "9 Hr 19 Min",
      ot: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      clocking: [
        {
          id: 1,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "09:10 am",
          e: "12:22 pm",
          t: "3 Hr 12 Min",
        },
        {
          id: 2,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "12:55 am",
          e: "06:10 pm",
          t: "06 Hr 7 Min",
        },
      ],
    },
    {
      id: 2,
      date: "Jan 2, 2023 (Tue)",
      ws: "9Hr 30m",
      in_hr: "9 Hr 19 Min",
      ot: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      clocking: [
        {
          id: 1,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "09:00 am",
          e: "06:22 pm",
          t: "09 Hr 22 Min",
        },
      ],
    },
    {
      id: 3,
      date: "Jan 3, 2023 (Wed)",
      ws: "9Hr 30m",
      in_hr: "9 Hr 19 Min",
      ot: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      clocking: [
        {
          id: 1,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "09:00 am",
          e: "06:22 pm",
          t: "09 Hr 22 Min",
        },
      ],
    },
    {
      id: 4,
      date: "Jan 4, 2023 (Thu)",
      ws: "9Hr 30m",
      in_hr: "9 Hr 19 Min",
      ot: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      clocking: [
        {
          id: 1,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "09:00 am",
          e: "06:22 pm",
          t: "09 Hr 22 Min",
        },
      ],
    },
    {
      id: 5,
      date: "Jan 5, 2023 (Fri)",
      ws: "9Hr 30m",
      in_hr: "9 Hr 19 Min",
      ot: "",
      is_in_edit: false,
      is_ot_edit: false,
      notes: "",
      clocking: [
        {
          id: 1,
          in: "Lintcloud, Vallioor",
          out: "Lintcloud, Vallioor",
          s: "09:00 am",
          e: "06:22 pm",
          t: "09 Hr 22 Min",
        },
      ],
    },
  ];

  return (
    <Fragment>
      <Table
        height={400}
        data={Attendance_data}
        autoHeight={true}
        loading={loading}
        bordered={true}
        className="mb-5">
        <Column width={175} align="center" fixed="left">
          <HeaderCell>Date</HeaderCell>
          <Cell dataKey="date" />
        </Column>
        <Column width={150}>
          <HeaderCell>IN</HeaderCell>
          <Cell dataKey="ws" />
        </Column>
        <Column width={150}>
          <HeaderCell>IN Location</HeaderCell>
          <Cell>
            {(rowData, rowIndex) => {
              console.log(rowData);
              console.log(rowIndex);
            }}
          </Cell>
        </Column>
        <Column width={150}>
          <HeaderCell>OUT</HeaderCell>
          <Cell dataKey="ws" />
        </Column>
        <Column width={150}>
          <HeaderCell>OUT Location</HeaderCell>
          <Cell dataKey="ws" />
        </Column>
        <Column width={150}>
          <HeaderCell>Work Schedule</HeaderCell>
          <Cell dataKey="ws" />
        </Column>
        <Column width={150}>
          <HeaderCell>Total IN</HeaderCell>
          <Cell dataKey="in_hr" />
        </Column>
        <Column width={150}>
          <HeaderCell>OT</HeaderCell>
          <Cell dataKey="ot" />
        </Column>
        <Column width={150}>
          <HeaderCell>Status</HeaderCell>
          <Cell dataKey="ot" />
        </Column>
        <Column width={150}>
          <HeaderCell>Notes</HeaderCell>
          <Cell dataKey="notes" />
        </Column>

        <Column width={80} fixed="right">
          <HeaderCell>Action</HeaderCell>

          <Cell style={{ padding: "6px" }}>
            {(rowData) => (
              <Button
                appearance="link"
                onClick={() => alert(`name:${rowData.ot}`)}>
                Edit
              </Button>
            )}
          </Cell>
        </Column>
      </Table>
    </Fragment>
  );
};

export default AttendanceEmployeeTable;
