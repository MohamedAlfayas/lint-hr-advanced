import React, { useEffect, useState } from "react";
import { ListSkeleton } from "../../../component/common/skeleton/Skeleton";
import {
  Modal, ModalHeader, ModalBody, Table, Badge, Row, Col, Button,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

// Old-vs-current view for one payslip's rerun history.
// GET payroll/employee-payslip-revisions/?payslip_id=<id>
//   -> { data: [ { revision_number, net_pay, gross_earnings, status_at_snapshot,
//                  reason, snapshotted_by, snapshotted_at,
//                  payslip_snapshot: {...every EmployeePayslip field...},
//                  components_snapshot: [ {component_name, component_type, final_amount, ...} ] } ] }
// Ordered newest-first: revisions[0] is the state right before the CURRENT
// live payslip; revisions[i] (i>0) was replaced by revisions[i-1].

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const MONEY_FIELDS = new Set(["net_pay", "gross_earnings", "total_deductions", "lop_deduction"]);

const HEADLINE_FIELDS = [
  { key: "net_pay", label: "Net Pay" },
  { key: "gross_earnings", label: "Gross Earnings" },
  { key: "total_deductions", label: "Total Deductions" },
  { key: "payable_days", label: "Payable Days" },
  { key: "lop_days", label: "LOP Days" },
  { key: "present_days", label: "Present Days" },
];

// A revision only carries payslip_snapshot; the current live row is the
// flat payslip object from the payslips table. Read either shape the same way.
const fieldValue = (obj, key) => (obj?.payslip_snapshot ? obj.payslip_snapshot[key] : obj?.[key]);

const displayValue = (key, val) => (MONEY_FIELDS.has(key) ? `₹${fmt(val)}` : (val ?? "—"));

const DiffBadge = ({ oldVal, newVal, moneyLike }) => {
  const o = Number(oldVal || 0);
  const n = Number(newVal || 0);
  if (o === n) return null;
  const up = n > o;
  const delta = Math.abs(n - o);
  return (
    <Badge color={up ? "success" : "danger"} pill className="ms-2" style={{ fontSize: 10 }}>
      {up ? "▲" : "▼"} {moneyLike ? `₹${fmt(delta)}` : delta}
    </Badge>
  );
};

const PayslipRevisionHistory = ({ isOpen, toggle, payslip }) => {
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen && payslip?.id) {
      setLoading(true);
      setExpandedId(null);
      Api({ method: "GET", url: `payroll/employee-payslip-revisions/?payslip_id=${payslip.id}` })
        .then((res) => setRevisions(res?.data?.data || []))
        .catch(() => toast.error("Failed to load payslip history."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, payslip?.id]);

  if (!payslip) return null;

  return (
    <Modal data-testid="payslip-history-payslip-history-dialog" isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader close={<ModalCloseButton onClick={toggle} testId="payslip-history-payslip-history-close-button" />} toggle={toggle} className="surface-muted p-3">
        Payslip History — {payslip.employee_name}
        {payslip.pay_period && (
          <span className="text-muted ms-2" style={{ fontSize: 12, fontWeight: 400 }}>
            · {payslip.pay_period}
          </span>
        )}
      </ModalHeader>

      <ModalBody className="p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {loading ? (
          <ListSkeleton rows={4} testId="payslip-revision-loading-skeleton" label="Loading revisions" />
        ) : revisions.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No prior versions — this payslip has only ever been computed once.
          </p>
        ) : (
          <>
            {/* ── Current (live) ── */}
            <div className="border rounded p-3 mb-3 surface-muted">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge color="success">Current</Badge>
                <span className="text-muted" style={{ fontSize: 11 }}>{payslip.status}</span>
              </div>
              <Row className="g-2">
                {HEADLINE_FIELDS.map((f) => (
                  <Col xs={6} md={4} key={f.key}>
                    <span className="text-muted" style={{ fontSize: 12 }}>{f.label}: </span>
                    <span className="fw-semibold">{displayValue(f.key, fieldValue(payslip, f.key))}</span>
                  </Col>
                ))}
              </Row>
            </div>

            {/* ── Older versions, newest-first ── */}
            {revisions.map((rev, i) => {
              const replacedBy = i === 0 ? payslip : revisions[i - 1];
              return (
                <div className="border rounded p-3 mb-2" key={rev.id}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <Badge color="secondary" className="me-2">Rev {rev.revision_number}</Badge>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {fmtDateTime(rev.snapshotted_at)}
                        {rev.snapshotted_by ? ` · ${rev.snapshotted_by}` : ""}
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: 11 }}>{rev.reason || "—"}</span>
                  </div>

                  <Row className="g-2">
                    {HEADLINE_FIELDS.map((f) => {
                      const oldVal = fieldValue(rev, f.key);
                      const newVal = fieldValue(replacedBy, f.key);
                      return (
                        <Col xs={6} md={4} key={f.key}>
                          <span className="text-muted" style={{ fontSize: 12 }}>{f.label}: </span>
                          <span className="fw-semibold">{displayValue(f.key, oldVal)}</span>
                          <DiffBadge oldVal={oldVal} newVal={newVal} moneyLike={MONEY_FIELDS.has(f.key)} />
                        </Col>
                      );
                    })}
                  </Row>

                  <Button
                    data-testid={testId("payslip-history-payslip-history-hide-components", itemTestKey(rev), "button")}
                    color="link" size="sm" className="p-0 mt-2 text-decoration-none"
                    onClick={() => setExpandedId(expandedId === rev.id ? null : rev.id)}
                  >
                    {expandedId === rev.id ? "Hide components" : "View components"}
                  </Button>

                  {expandedId === rev.id && (
                    <Table size="sm" bordered className="mt-2 mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-surface">
                        <tr>
                          <th>Component</th>
                          <th>Type</th>
                          <th className="text-end">Final Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rev.components_snapshot || []).length === 0 ? (
                          <tr><td colSpan={3} className="text-center text-muted py-2">No components recorded.</td></tr>
                        ) : rev.components_snapshot.map((c, ci) => (
                          <tr key={ci}>
                            <td>{c.component_name}</td>
                            <td className="text-muted text-capitalize">{c.component_type}</td>
                            <td className="text-end">₹{fmt(c.final_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              );
            })}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default PayslipRevisionHistory;