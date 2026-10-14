import React, { useEffect, useState } from "react";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner, Badge,
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label,
  Nav, NavItem, NavLink, TabContent, TabPane,
} from "reactstrap";
import classnames from "classnames";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import CompOffLedger from "./CompOffLedger";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

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
  const [dayType, setDayType] = useState("full");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving]   = useState(false);

  const openEdit = (day) => {
    setEditDay(day);
    setStatus(day.regularized_status || "paid");
    setDayType(day.day_type || "full");
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
      {
        date: editDay.date,
        original_status: editDay.computed_status,
        regularized_status: status,
        day_type: dayType,
        remarks,
      },
      () => { setSaving(false); closeEdit(); },
      () => setSaving(false),
    );
  };

  return (
    <React.Fragment>
      <Card className="shadow-none border">
        <CardHeader className="surface-muted">
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
              <thead className="table-surface text-muted text-uppercase" style={{ fontSize: 11 }}>
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
                    <td>
                      <Badge color={STATUS_BADGE[d.computed_status] || "secondary"}>{d.computed_status.toUpperCase()}</Badge>
                      {d.is_sandwich && (
                        <Badge color={d.sandwich_is_paid ? "info" : "warning"} className="ms-1">sandwich</Badge>
                      )}
                    </td>
                    <td>
                      {d.regularized_status ? (
                        <>
                          <Badge color={d.regularized_status === "paid" ? "success" : "danger"}>{d.regularized_status}</Badge>
                          {d.day_type === "half" && (
                            <Badge color="secondary" className="ms-1">half day</Badge>
                          )}
                        </>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="text-muted" style={{ maxWidth: 160 }}>{d.remarks || "—"}</td>
                    <td className="text-end">
                      <Button data-testid={testId("payroll-regularization-edit", itemTestKey(d), "button")} color="light" size="sm" className="border py-1 px-2" onClick={() => openEdit(d)}>
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
        <Modal data-testid="payroll-regularization-regularize-dialog" isOpen toggle={closeEdit} centered>
          <ModalHeader close={<ModalCloseButton onClick={closeEdit} testId="payroll-regularization-regularize-close-button" />} toggle={closeEdit} className="surface-muted p-3">Regularize {editDay.date}</ModalHeader>
          <ModalBody className="p-4">
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>
              System computed status:{" "}
              <Badge color={STATUS_BADGE[editDay.computed_status] || "secondary"}>{editDay.computed_status}</Badge>
              {editDay.is_sandwich && (
                <span className="text-muted ms-2">
                  (sandwich leave — {editDay.sandwich_is_paid ? "currently paid" : "currently unpaid/LOP"})
                </span>
              )}
            </p>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Set As</Label>
              <Input data-testid="payroll-regularization-regularize-set-as-select" type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option data-testid="payroll-regularization-regularize-set-as-option-paid" value="paid">Paid (no LOP)</option>
                <option data-testid="payroll-regularization-regularize-set-as-option-unpaid" value="unpaid">Unpaid / LOP</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Day Type</Label>
              <Input data-testid="payroll-regularization-regularize-day-type-select" type="select" value={dayType} onChange={(e) => setDayType(e.target.value)}>
                <option data-testid="payroll-regularization-regularize-day-type-option-full" value="full">Full Day</option>
                <option data-testid="payroll-regularization-regularize-day-type-option-half" value="half">Half Day</option>
              </Input>
              {status === "unpaid" && (
                <small className="text-muted d-block mt-1">
                  {dayType === "half"
                    ? "Deducts exactly 0.5 day of pay."
                    : "Deducts a full day of pay."}
                </small>
              )}
              {status === "paid" && (
                <small className="text-muted d-block mt-1">
                  Paid covers the day fully either way — day type is kept for the record only.
                </small>
              )}
            </FormGroup>
            <FormGroup className="mb-0">
              <Label style={{ fontSize: 13 }}>Remarks <span className="text-danger">*</span></Label>
              <Input
                data-testid="payroll-regularization-regularize-reason-textarea" type="textarea" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for regularization... (minimum 3 words)" />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="surface-muted p-3">
            <Button data-testid="payroll-regularization-regularize-cancel-button" color="secondary" outline size="sm" onClick={closeEdit} disabled={saving}>Cancel</Button>
            <Button data-testid="payroll-regularization-regularize-save-button" color="success" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : null}Save
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Container — two tabs: Attendance edit + Comp-Off ledger.
// Fetches attendance/leave days and wires up the regularize save call.
// ───────────────────────────────────────────────────────────────────────────
const EmployeeAttendanceEdit = ({ employeeId, employeeName, month, year, onSaved }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [mountedTabs, setMountedTabs] = useState({ 1: true });
  const [loading, setLoading] = useState(false);
  const [days, setDays]       = useState([]);
  const [period, setPeriod]   = useState(null);
  // bump this to force CompOffLedger to reload after a regularization save
  const [ledgerRefresh, setLedgerRefresh] = useState(0);

  const toggleTab = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setMountedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
  };

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
        setLedgerRefresh((n) => n + 1); // comp-off ledger changed on recompute
        if (typeof onSaved === "function") onSaved();
        onDone && onDone();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Failed to save regularization.");
        onFail && onFail();
      });
  };

  return (
    <React.Fragment>
      <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
        <NavItem>
          <NavLink
            data-testid="payroll-regularization-attendance-link" style={{ cursor: "pointer" }}
            className={classnames({ active: activeTab === "1" })}
            onClick={() => toggleTab("1")}>
            Attendance
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            data-testid="payroll-regularization-comp-off-ledger-link" style={{ cursor: "pointer" }}
            className={classnames({ active: activeTab === "2" })}
            onClick={() => toggleTab("2")}>
            Comp-Off Ledger
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {loading ? (
            <div className="py-3">
              <TableSkeletonBlock rows={8} cols={5} avatar={false} testId="employee-regularization-loading-skeleton" label="Loading attendance and leave records" />
            </div>
          ) : (
            <AttendanceEditTab
              days={days}
              period={period}
              employeeName={employeeName}
              onRegularize={handleRegularize}
            />
          )}
        </TabPane>

        {mountedTabs["2"] && (
          <TabPane tabId="2">
            <CompOffLedger
              key={ledgerRefresh}
              employeeId={employeeId}
              employeeName={employeeName}
              month={month}
              year={year}
            />
          </TabPane>
        )}
      </TabContent>
    </React.Fragment>
  );
};

export default EmployeeAttendanceEdit;