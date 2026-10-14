import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { fetchStatusMaster, labelFor, colorFor, PAYMENT_ONLY_STATUSES } from "./statusHelpers";
import StatusBadge, { STATUS_ICONS, toneProps } from "./StatusBadge";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const RunStatusActions = ({ run, onChanged, size = "sm" }) => {
  const [rows, setRows]   = useState([]);
  const [busy, setBusy]   = useState(null);

  useEffect(() => { fetchStatusMaster("run").then(setRows); }, []);

  if (!run) return null;
  const current = rows.find((r) => r.code === run.status);
  // "paid" / "partially_paid" are reached automatically as payslips are
  // released (see RunPaymentActions) — a manual cascade here would push
  // every payslip to the same status regardless of who has a deferred
  // incentive still pending, so those two targets are excluded.
  const nextCodes = (current?.allowed_next || []).filter(
    (c) => !PAYMENT_ONLY_STATUSES.includes(c)
  );

  const move = (target) => {
    Swal.fire({
      icon: "question",
      title: `Move run to "${labelFor(rows, target)}"?`,
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(target);
      Api({
        method: "PATCH",
        url: "payroll/payroll-run-status/",
        data: { id: run.id, status: target, cascade_payslips: true },
      })
        .then((res) => {
          const cascaded = res?.data?.data?.payslips_cascaded || 0;
          const nextStatus = res?.data?.data?.status || target;
          toast.success(`Run status updated${cascaded ? ` (${cascaded} payslip(s) cascaded)` : ""}`);
          onChanged && onChanged(nextStatus);
        })
        .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to update status."))
        .finally(() => setBusy(null));
    });
  };

  return (
    <div className="rsa">
      <StatusBadge scope="run" code={run.status} />
      {nextCodes.length > 0 && (
        <div className="rsa-next">
          <span className="rsa-label">
            <i className="ri-arrow-right-line"></i>
            Move to
          </span>
          {nextCodes.map((code) => {
            const row = rows.find((r) => r.code === code);
            const tone = toneProps(row?.color || colorFor(code));
            return (
              <button
                data-testid={testId("payroll-run-status-next", itemTestKey(code), "button")}
                key={code}
                type="button"
                className={`rsa-btn ${tone.className} ${size === "sm" ? "" : "is-lg"}`}
                style={tone.style}
                disabled={!!busy}
                onClick={() => move(code)}
              >
                {busy === code ? (
                  <Spinner size="sm" />
                ) : (
                  <i className={STATUS_ICONS[code] || "ri-arrow-right-circle-line"}></i>
                )}
                {labelFor(rows, code)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RunStatusActions;