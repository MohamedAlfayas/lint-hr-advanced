import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, Row, Col,
} from "reactstrap";
import {
  ApvDate,
  ApvHours,
  ApvStatus,
} from "../../../component/common/approval/ApprovalCells";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import AppTable from "../../../shared/ui/table/AppTable";

// Read-only view of comp-off DEBIT (pending) and CREDIT (compensated) rows.
// GET payroll/comp-off-ledger/?employee_id=&month=&year=
//   -> { data: { entries: [ {date, entry_type, seconds, balance_seconds, offsets} ],
//                summary: { pending_seconds, compensated_seconds } } }

const secondsToHrs = (s) => (s ? (s / 3600).toFixed(2) : "0.00");

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CompOffLedger = ({ employeeId, employeeName, month, year }) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ pending_seconds: 0, compensated_seconds: 0 });

  const load = () => {
    if (!employeeId || !month || !year) return;
    setLoading(true);
    Api({
      method: "GET",
      url: `payroll/comp-off-ledger/?employee_id=${employeeId}&month=${month}&year=${year}`,
    })
      .then((res) => {
        setEntries(res?.data?.data?.entries || []);
        setSummary(res?.data?.data?.summary || { pending_seconds: 0, compensated_seconds: 0 });
      })
      .catch(() => toast.error("Failed to load comp-off ledger."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [employeeId, month, year]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        Cell: ({ cell }) => <ApvDate value={cell.getValue()} />,
      },
      {
        id: "entry_type",
        accessorFn: (e) => (e.entry_type === "debit" ? "Pending" : "Compensated"),
        header: "Type",
        filterVariant: "select",
        Cell: ({ row, cell }) =>
          row.original.entry_type === "debit" ? (
            <ApvStatus tone="danger" icon="ri-time-line" label={cell.getValue()} />
          ) : (
            <ApvStatus tone="success" icon="ri-checkbox-circle-line" label={cell.getValue()} />
          ),
      },
      {
        id: "hours",
        accessorFn: (e) => Number(secondsToHrs(e.seconds)),
        header: "Hours",
        filterVariant: "range",
        Cell: ({ row }) => <ApvHours value={secondsToHrs(row.original.seconds)} strong />,
      },
      {
        id: "remaining",
        accessorFn: (e) => (e.entry_type === "debit" ? secondsToHrs(e.balance_seconds) : "—"),
        header: "Remaining (debit)",
      },
      {
        id: "offsets",
        accessorFn: (e) => (e.offsets ? `debit #${e.offsets}` : "—"),
        header: "Offsets",
        Cell: ({ cell }) => <span className="text-muted">{cell.getValue()}</span>,
      },
    ],
    []
  );

  return (
    <Card className="shadow-none border">
      <CardHeader className="surface-muted">
        <CardTitle tag="h6" className="mb-0">
          Comp-Off Ledger {employeeName ? `— ${employeeName}` : ""}
        </CardTitle>
        <p className="text-muted mb-0 mt-1" style={{ fontSize: 12 }}>
          {MONTHS[parseInt(month, 10)] || month} {year}
        </p>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col sm={6}>
            <Card className="shadow-none border mb-0">
              <CardBody className="p-3">
                <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11 }}>
                  Pending (Uncompensated)
                </p>
                <h4 className="mb-0 fw-bold text-danger">
                  {secondsToHrs(summary.pending_seconds)} hrs
                </h4>
              </CardBody>
            </Card>
          </Col>
          <Col sm={6}>
            <Card className="shadow-none border mb-0">
              <CardBody className="p-3">
                <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11 }}>
                  Compensated
                </p>
                <h4 className="mb-0 fw-bold text-success">
                  {secondsToHrs(summary.compensated_seconds)} hrs
                </h4>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <AppTable
          columns={columns}
          data={entries}
          isLoading={loading}
          onRefresh={load}
          exportFileName={`comp-off-ledger-${month}-${year}`}
          emptyMessage="No comp-off activity."
          muiTableContainerProps={{ sx: { maxHeight: "50vh" } }}
        />
      </CardBody>
    </Card>
  );
};

export default CompOffLedger;