import React, { useState } from "react";
import { Button, Spinner, ButtonGroup } from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { canReleasePayments, isZeroSettlement, partialAmountEligible, paymentEligibility, releaseSummary, settleFullPay, zeroSettlementEligible } from "./statusHelpers";
import PayslipPaymentModal from "./PayslipPaymentModal";

// Bulk release for a whole payroll run. Shown only once the run is "locked"
// (ready to pay) or "partially_paid" (salary out, incentive pending).
//
//   locked          -> Pay Full (no-incentive employees) + Release Salary
//                       Tranche (employees with a deferred incentive)
//   partially_paid  -> Release Incentive Balance
//
// `payslips` drives the eligible counts so the buttons show what they'll
// actually touch; `onReleased` should re-fetch both the payslip list and the
// run itself (run.status changes as a side effect on the backend).
const RunPaymentActions = ({ run, payslips, onReleased }) => {
  const [busy, setBusy] = useState(null); // which action is in flight
  const [partialOpen, setPartialOpen] = useState(false);

  if (!run || !canReleasePayments(run.status)) return null;

  const rows = payslips || [];
  const { fullEligible, salaryEligible, balanceEligible } = paymentEligibility(rows);
  const partialEligible = partialAmountEligible(rows);
  const nothingPending = !fullEligible.length && !salaryEligible.length && !balanceEligible.length && !partialEligible.length;

  const releaseFull = () => {
    const zeros = zeroSettlementEligible(rows);
    const payable = fullEligible.filter((p) => !isZeroSettlement(p));
    const count = payable.length + zeros.length;
    if (!count) return;
    Swal.fire({
      icon: "question",
      title: `Pay full net pay for ${count} employee${count !== 1 ? "s" : ""}?`,
      text: zeros.length
        ? `${zeros.length} payslip(s) have no amount due and will be marked paid so the run can close.`
        : "This records the payment and cannot be undone from here.",
      showCancelButton: true,
      confirmButtonText: "Yes, release",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy("pay_full");
      settleFullPay({
        payable,
        zeros,
        paymentData: { action: "pay_full", payroll_run: run.id },
      })
        .then((summaries) => {
          const failed = summaries.filter((s) => !s.ok);
          if (failed.length) toast.error(failed.map((s) => s.message).join(" "));
          else toast.success(summaries.map((s) => s.message).join(". ") || "Updated");
          if (summaries.some((s) => s.ok)) onReleased && onReleased();
        })
        .finally(() => setBusy(null));
    });
  };

  const release = (action, label, count) => {
    if (!count) return;
    Swal.fire({
      icon: "question",
      title: `${label} for ${count} employee${count !== 1 ? "s" : ""}?`,
      text: "This records the payment and cannot be undone from here.",
      showCancelButton: true,
      confirmButtonText: "Yes, release",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(action);
      Api({
        method: "POST",
        url: "payroll/payslip-payment/",
        data: { action, payroll_run: run.id },
      })
        .then((res) => {
          const summary = releaseSummary(res?.data?.data);
          summary.ok ? toast.success(summary.message) : toast.error(summary.message);
          if (summary.ok) onReleased && onReleased();
        })
        .catch((err) =>
          toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Release failed.")
        )
        .finally(() => setBusy(null));
    });
  };

  return (
    <>
      <ButtonGroup size="sm">
        {fullEligible.length > 0 && (
          <Button color="success" outline disabled={!!busy} onClick={releaseFull}>
            {busy === "pay_full" ? <Spinner size="sm" className="me-1" /> : <i className="ri-hand-coin-line align-middle me-1"></i>}
            Pay Full ({fullEligible.length})
          </Button>
        )}
        {partialEligible.length > 0 && (
          <Button color="info" outline disabled={!!busy} onClick={() => setPartialOpen(true)}>
            <i className="ri-money-dollar-circle-line align-middle me-1"></i>
            Pay Partial ({partialEligible.length})
          </Button>
        )}
        {salaryEligible.length > 0 && (
          <Button color="warning" outline disabled={!!busy} onClick={() => release("pay_partial", "Release salary tranche", salaryEligible.length)}>
            {busy === "pay_partial" ? <Spinner size="sm" className="me-1" /> : <i className="ri-wallet-3-line align-middle me-1"></i>}
            Release Salary ({salaryEligible.length})
          </Button>
        )}
        {balanceEligible.length > 0 && (
          <Button color="primary" outline disabled={!!busy} onClick={() => release("pay_balance", "Release incentive balance", balanceEligible.length)}>
            {busy === "pay_balance" ? <Spinner size="sm" className="me-1" /> : <i className="ri-gift-2-line align-middle me-1"></i>}
            Release Balance ({balanceEligible.length})
          </Button>
        )}
        {nothingPending && (
          <span className="text-muted" style={{ fontSize: 12 }}>Nothing pending release.</span>
        )}
      </ButtonGroup>
      <PayslipPaymentModal
        isOpen={partialOpen}
        toggle={() => setPartialOpen(false)}
        payslips={partialEligible}
        onDone={() => {
          setPartialOpen(false);
          onReleased && onReleased();
        }}
      />
    </>
  );
};

export default RunPaymentActions;