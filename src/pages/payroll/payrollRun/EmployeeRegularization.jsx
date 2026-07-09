import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner, Badge,
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const STATUS_BADGE = {
  present:     "success",
  leave:       "info",
  lop:         "danger",
  partial_lop: "warning",
  week_off:    "secondary",
  holiday:     "secondary",
};
const secondsToHrs = (s) => (s ? (s / 3600).toFixed(1) : "0.0");

// ───────────────────────────────────────────────────────────────────────────
// Attendance Edit — day table + regularize modal
// ───────────────────────────────────────────────────────────────────────────
const AttendanceEditTab = ({ days, period, employeeName, onRegularize }) => {
  const [editDay, setEditDay] = useState(null);
  const [status, setStatus]   = useState("paid");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving]   = useState(false);

  const openEdit = (day) => {
    setEditDay(day);
    setStatus(day.regularized_status || "paid");
    setRemarks(day.remarks || "");
  };
  const closeEdit = () => setEditDay(null);

  const handleSave = () => {
    const wordCount = remarks.trim().split(/[\s,]+/).filter(Boolean).length;
    if (wordCount < 3) {
      toast.error("Remarks must have at least 3 words.");
      return;
    }
    setSaving(true);
    onRegularize(
      { date: editDay.date, original_status: editDay.computed_status, regularized_status: status, remarks },
      () => { setSaving(false); closeEdit(); },
      () => setSaving(false),
    );
  };

  return (
    <React.Fragment>
      <Card className="shadow-none border">
        <CardHeader className="bg-light">
          <CardTitle tag="h6" className="mb-0">
            {employeeName ? `Attendance — ${employeeName}` : "Attendance"}
          </CardTitle>
          {period && (
            <p className="text-muted mb-0 mt-1" style={{ fontSize: 12 }}>
              Attendance Period: {period.start} to {period.end}
            </p>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive" style={{ maxHeight: "58vh", overflow: "auto" }}>
            <Table className="table-bordered align-middle mb-0" style={{ fontSize: 13 }}>
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: 11 }}>
                <tr>
                  <th>Date</th><th>Worked Hrs</th><th>Leave Hrs</th><th>Week Off</th>
                  <th>Holiday</th><th>Computed Status</th><th>Regularized</th><th>Remarks</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {days.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-muted py-4">No records found.</td></tr>
                ) : days.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{secondsToHrs(d.worked_seconds)}</td>
                    <td>{secondsToHrs(d.leave_seconds)}</td>
                    <td>{d.is_week_off ? <Badge color="secondary">YES</Badge> : "—"}</td>
                    <td>{d.is_holiday ? <Badge color="secondary">YES</Badge> : "—"}</td>
                    <td><Badge color={STATUS_BADGE[d.computed_status] || "secondary"}>{d.computed_status.toUpperCase()}</Badge></td>
                    <td>
                      {d.regularized_status ? (
                        <Badge color={d.regularized_status === "paid" ? "success" : "danger"}>{d.regularized_status}</Badge>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="text-muted" style={{ maxWidth: 160 }}>{d.remarks || "—"}</td>
                    <td className="text-end">
                      <Button color="light" size="sm" className="border py-1 px-2" onClick={() => openEdit(d)}>
                        <i className="ri-edit-line align-middle me-1"></i>Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {editDay && (
        <Modal isOpen toggle={closeEdit} centered>
          <ModalHeader toggle={closeEdit} className="bg-light p-3">Regularize {editDay.date}</ModalHeader>
          <ModalBody className="p-4">
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>
              System computed status:{" "}
              <Badge color={STATUS_BADGE[editDay.computed_status] || "secondary"}>{editDay.computed_status}</Badge>
            </p>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Set As</Label>
              <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="paid">Paid (no LOP)</option>
                <option value="unpaid">Unpaid / LOP</option>
              </Input>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label style={{ fontSize: 13 }}>Remarks <span className="text-danger">*</span></Label>
              <Input type="textarea" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for regularization... (minimum 3 words)" />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-light p-3">
            <Button color="secondary" outline size="sm" onClick={closeEdit} disabled={saving}>Cancel</Button>
            <Button color="success" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : null}Save
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Container — fetches attendance/leave days for the employee/month/year
// and wires up the regularize save call.
// ───────────────────────────────────────────────────────────────────────────
const EmployeeAttendanceEdit = ({ employeeId, employeeName, month, year, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [days, setDays]       = useState([]);
  const [period, setPeriod]   = useState(null);

  const fetchData = () => {
    if (!employeeId || !month || !year) return;
    setLoading(true);
    Api({ method: "GET", url: `payroll/regularization/?employee_id=${employeeId}&month=${month}&year=${year}` })
      .then((res) => {
        setDays(res?.data?.data?.days || []);
        setPeriod(res?.data?.data?.attendance_period || null);
      })
      .catch(() => toast.error("Failed to load attendance & leave records."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [employeeId, month, year]);

  const handleRegularize = (payload, onDone, onFail) => {
    Api({
      method: "POST",
      url: "payroll/regularization/",
      data: { employee_id: employeeId, month, year, ...payload },
    })
      .then(() => {
        toast.success("Regularization saved.");
        fetchData();
        if (typeof onSaved === "function") onSaved();
        onDone && onDone();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Failed to save regularization.");
        onFail && onFail();
      });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>Loading attendance & leave records...</p>
      </div>
    );
  }

  return (
    <AttendanceEditTab
      days={days}
      period={period}
      employeeName={employeeName}
      onRegularize={handleRegularize}
    />
  );
};

export default EmployeeAttendanceEdit;