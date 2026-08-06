import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner, Badge, Row, Col, Input,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

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

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner color="primary" size="sm" />
      </div>
    );
  }

  return (
    <Card className="shadow-none border">
      <CardHeader className="bg-light">
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

        <div className="table-responsive" style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Table className="table-bordered align-middle mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light text-muted text-uppercase" style={{ fontSize: 11 }}>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Remaining (debit)</th>
                <th>Offsets</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">No comp-off activity.</td></tr>
              ) : entries.map((e, i) => (
                <tr key={i}>
                  <td>{e.date}</td>
                  <td>
                    {e.entry_type === "debit"
                      ? <Badge color="danger">Pending</Badge>
                      : <Badge color="success">Compensated</Badge>}
                  </td>
                  <td>{secondsToHrs(e.seconds)}</td>
                  <td>{e.entry_type === "debit" ? secondsToHrs(e.balance_seconds) : "—"}</td>
                  <td className="text-muted">
                    {e.offsets ? `debit #${e.offsets}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default CompOffLedger;