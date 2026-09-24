import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { releaseSummary } from "./statusHelpers";

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toCents = (val) => Math.round(Number(val) * 100);

const balanceOf = (payslip) => parseFloat(payslip?.balance_amount || 0);

const empLabel = (payslip) => payslip.employee_name || `Employee #${payslip.employee}`;

const empCode = (payslip) => payslip.employee_emp_id || payslip.emp_id || "";

// Blank and zero amounts are skipped. A positive amount at or under the
// balance is kept. Paying the whole balance is pay_full; anything less is
// pay_partial so the payslip can land on partially_paid.
const splitPayments = (payslips, amounts) => {
  const fullIds = [];
  const partials = [];
  const errors = {};

  payslips.forEach((payslip) => {
    const raw = amounts[payslip.id];
    if (raw == null || String(raw).trim() === "") return;
    const cents = toCents(raw);
    const balanceCents = toCents(balanceOf(payslip));
    if (!Number.isFinite(cents) || cents <= 0) {
      errors[payslip.id] = "Enter an amount greater than 0, or leave the row blank.";
      return;
    }
    if (cents > balanceCents) {
      errors[payslip.id] = `Cannot exceed the balance of ₹${fmt(balanceOf(payslip))}.`;
      return;
    }
    if (cents === balanceCents) {
      fullIds.push(payslip.id);
    } else {
      partials.push({ payslip_id: payslip.id, amount: (cents / 100).toFixed(2) });
    }
  });

  return { fullIds, partials, errors };
};

const postPayment = (data) =>
  Api({ method: "POST", url: "payroll/payslip-payment/", data });

const PayslipPaymentModal = ({ isOpen, toggle, payslips = [], onDone }) => {
  const [amounts, setAmounts] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmounts({});
      setErrors({});
      setBusy(false);
    }
  }, [isOpen]);

  const setAmount = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const fillBalance = (payslip) => {
    setAmount(payslip.id, balanceOf(payslip).toFixed(2));
  };

  const submit = () => {
    const { fullIds, partials, errors: nextErrors } = splitPayments(payslips, amounts);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!fullIds.length && !partials.length) {
      toast.warning("Enter an amount for at least one employee.");
      return;
    }

    const calls = [];
    if (partials.length) calls.push(postPayment({ action: "pay_partial", payments: partials }));
    if (fullIds.length) calls.push(postPayment({ action: "pay_full", payslip_ids: fullIds }));

    setBusy(true);
    let recorded = false;
    calls
      .reduce(
        (chain, call) =>
          chain.then((totals) =>
            call.then((res) => {
              const data = res?.data?.data || {};
              const processed = data.processed || [];
              const skipped = Array.isArray(data.skipped) ? data.skipped : [];
              if (processed.length) recorded = true;
              return {
                processed: totals.processed.concat(processed),
                skipped: totals.skipped.concat(skipped),
              };
            })
          ),
        Promise.resolve({ processed: [], skipped: [] })
      )
      .then((totals) => {
        const summary = releaseSummary(totals);
        if (summary.ok) {
          recorded = true;
          toast.success(summary.message);
        } else {
          toast.error(summary.message);
        }
      })
      .catch((err) =>
        toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Release failed.")
      )
      .finally(() => {
        setBusy(false);
        if (recorded) onDone && onDone();
      });
  };

  return (
    <Modal isOpen={isOpen} toggle={busy ? undefined : toggle} centered size="lg" scrollable>
      <ModalHeader toggle={busy ? undefined : toggle}>Pay partial balance</ModalHeader>
      <ModalBody className="p-0">
        <p className="text-muted px-3 pt-3 mb-2" style={{ fontSize: 12 }}>
          Enter the amount to pay now. Leave a row blank to skip it. An amount equal to the balance pays the payslip in full.
        </p>
        <div style={{ maxHeight: "60vh", overflow: "auto" }}>
          <Table className="align-middle mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light text-muted text-uppercase" style={{ fontSize: 11 }}>
              <tr>
                <th className="ps-3">Employee</th>
                <th>Net Pay</th>
                <th>Paid</th>
                <th>Balance</th>
                <th style={{ width: 180 }}>Amount now</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No balances pending.</td>
                </tr>
              ) : (
                payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="ps-3">
                      <div className="fw-medium">{empLabel(payslip)}</div>
                      {empCode(payslip) && (
                        <div className="text-muted" style={{ fontSize: 11 }}>{empCode(payslip)}</div>
                      )}
                    </td>
                    <td>₹{fmt(payslip.net_pay)}</td>
                    <td>₹{fmt(payslip.paid_amount)}</td>
                    <td className="fw-semibold">₹{fmt(payslip.balance_amount)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Input
                          bsSize="sm"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={amounts[payslip.id] ?? ""}
                          disabled={busy}
                          invalid={!!errors[payslip.id]}
                          onChange={(e) => setAmount(payslip.id, e.target.value)}
                        />
                        <Button
                          color="link"
                          size="sm"
                          className="p-0 text-nowrap"
                          disabled={busy}
                          onClick={() => fillBalance(payslip)}
                        >
                          Max
                        </Button>
                      </div>
                      {errors[payslip.id] && (
                        <div className="text-danger" style={{ fontSize: 11 }}>{errors[payslip.id]}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={busy}>Cancel</Button>
        <Button color="primary" onClick={submit} disabled={busy || !payslips.length}>
          {busy ? <Spinner size="sm" /> : "Record payment"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PayslipPaymentModal;
