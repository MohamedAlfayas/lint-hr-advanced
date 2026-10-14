import React, { useEffect, useState } from "react";
import { Button, Input, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import {
  bulkTargetCodes,
  canReleasePayments,
  fetchStatusMaster,
  isZeroSettlement,
  labelFor,
  partialAmountEligible,
  paymentEligibility,
  releaseSummary,
  settleFullPay,
} from "./statusHelpers";
import PayslipPaymentModal from "./PayslipPaymentModal";
import { testId, itemTestKey } from "../../../shared/testing/testId";

// "paid" / "partially_paid" are intentionally NOT offered as move targets —
// they're only ever set via the dedicated release actions below, so
// paid_amount / balance_amount / PayslipPayment stay accurate.
//
// `payslips` should be the full row objects for the current selection (not
// just ids) so this can tell who has a deferred incentive and who doesn't.
const PayslipBulkStatusBar = ({ selectedIds, payslips = [], runStatus, onDone }) => {
  const [target, setTarget] = useState("");
  const [busy, setBusy]     = useState(false);
  const [rows, setRows]     = useState([]);
  const [partialOpen, setPartialOpen] = useState(false);

  useEffect(() => {
    fetchStatusMaster("payslip").then(setRows).catch(() => {});
  }, []);

  if (!selectedIds.length) return null;

  const selected = payslips.filter((p) => selectedIds.includes(p.id));
  const targets = bulkTargetCodes(rows, selected, runStatus);
  const safeTarget = targets.includes(target) ? target : "";
  const { fullEligible, salaryEligible, balanceEligible } = paymentEligibility(selected);
  const partialEligible = partialAmountEligible(selected);
  const releaseAllowed = canReleasePayments(runStatus);

  const apply = () => {
    if (!safeTarget) { toast.warning("Choose a target status."); return; }
    const label = labelFor(rows, safeTarget);
    Swal.fire({
      icon: "question",
      title: `Move ${selectedIds.length} payslip(s) to "${label}"?`,
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(true);
      Api({
        method: "PATCH",
        url: "payroll/employee-payslip-status/",
        data: { payslip_ids: selectedIds, status: safeTarget },
      })
        .then((res) => {
          const { updated_count, skipped } = res?.data?.data || {};
          toast.success(`${updated_count || 0} updated${skipped?.length ? `, ${skipped.length} skipped` : ""}`);
          setTarget("");
          onDone && onDone();
        })
        .catch((err) => toast.error(err?.response?.data?.error_message || "Bulk update failed."))
        .finally(() => setBusy(false));
    });
  };

  const releaseFull = (eligibleRows) => {
    if (!releaseAllowed || !eligibleRows.length) return;
    const zeros = eligibleRows.filter(isZeroSettlement);
    const payable = eligibleRows.filter((p) => !isZeroSettlement(p));
    Swal.fire({
      icon: "question",
      title: `Pay full net pay for ${eligibleRows.length} employee${eligibleRows.length !== 1 ? "s" : ""}?`,
      text: zeros.length
        ? `${zeros.length} payslip(s) have no amount due and will be marked paid.`
        : "This records the payment and cannot be undone from here.",
      showCancelButton: true,
      confirmButtonText: "Yes, release",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(true);
      settleFullPay({
        payable,
        zeros,
        paymentData: { action: "pay_full", payslip_ids: payable.map((p) => p.id) },
      })
        .then((summaries) => {
          const failed = summaries.filter((s) => !s.ok);
          if (failed.length) toast.error(failed.map((s) => s.message).join(" "));
          else toast.success(summaries.map((s) => s.message).join(". ") || "Updated");
          if (summaries.some((s) => s.ok)) onDone && onDone();
        })
        .finally(() => setBusy(false));
    });
  };

  const release = (action, label, eligibleRows) => {
    if (!releaseAllowed || !eligibleRows.length) return;
    Swal.fire({
      icon: "question",
      title: `${label} for ${eligibleRows.length} employee${eligibleRows.length !== 1 ? "s" : ""}?`,
      text: "This records the payment and cannot be undone from here.",
      showCancelButton: true,
      confirmButtonText: "Yes, release",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(true);
      Api({
        method: "POST",
        url: "payroll/payslip-payment/",
        data: { action, payslip_ids: eligibleRows.map((p) => p.id) },
      })
        .then((res) => {
          const summary = releaseSummary(res?.data?.data);
          summary.ok ? toast.success(summary.message) : toast.error(summary.message);
          if (summary.ok) onDone && onDone();
        })
        .catch((err) => toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Release failed."))
        .finally(() => setBusy(false));
    });
  };

  return (
    <>
    <div className="d-flex align-items-center gap-2 px-3 py-2 surface-muted border-bottom flex-wrap flex-shrink-0">
      <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedIds.length} selected</span>

      <Input
        data-testid="payslip-bulk-status-safe-target-select"
        type="select"
        bsSize="sm"
        style={{ width: 180 }}
        value={safeTarget}
        onChange={(e) => setTarget(e.target.value)}
      >
        <option data-testid="payslip-bulk-status-safe-target-option-none" value="">Move to…</option>
        {targets.map((c) => <option data-testid={testId("payslip-bulk-status-safe-target-option", itemTestKey(c))} key={c} value={c}>{labelFor(rows, c)}</option>)}
      </Input>
      <Button data-testid="payslip-bulk-status-apply-button" color="primary" size="sm" onClick={apply} disabled={busy || !safeTarget}>
        {busy ? <Spinner size="sm" /> : "Apply"}
      </Button>

      {releaseAllowed && (
        <span className="border-start ps-2 d-flex align-items-center gap-2 flex-wrap">
          {fullEligible.length > 0 && (
            <Button data-testid="payslip-bulk-status-pay-full-button" color="success" outline size="sm" disabled={busy} onClick={() => releaseFull(fullEligible)}>
              Pay Full ({fullEligible.length})
            </Button>
          )}
          {partialEligible.length > 0 && (
            <Button data-testid="payslip-bulk-status-pay-partial-button" color="info" outline size="sm" disabled={busy} onClick={() => setPartialOpen(true)}>
              Pay Partial ({partialEligible.length})
            </Button>
          )}
          {salaryEligible.length > 0 && (
            <Button data-testid="payslip-bulk-status-release-salary-button" color="warning" outline size="sm" disabled={busy} onClick={() => release("pay_partial", "Release salary tranche", salaryEligible)}>
              Release Salary ({salaryEligible.length})
            </Button>
          )}
          {balanceEligible.length > 0 && (
            <Button data-testid="payslip-bulk-status-release-balance-button" color="primary" outline size="sm" disabled={busy} onClick={() => release("pay_balance", "Release incentive balance", balanceEligible)}>
              Release Balance ({balanceEligible.length})
            </Button>
          )}
        </span>
      )}
    </div>
    <PayslipPaymentModal
      isOpen={partialOpen}
      toggle={() => setPartialOpen(false)}
      payslips={partialEligible}
      onDone={() => {
        setPartialOpen(false);
        onDone && onDone();
      }}
    />
    </>
  );
};

export default PayslipBulkStatusBar;
