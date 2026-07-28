import React, { useState } from "react";
import { Button, Input, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";

const BULK_TARGETS = ["under_review", "approved", "rejected", "paid", "excluded"];

const PayslipBulkStatusBar = ({ selectedIds, onDone }) => {
  const [target, setTarget] = useState("");
  const [busy, setBusy]     = useState(false);

  if (!selectedIds.length) return null;

  const apply = () => {
    if (!target) { toast.warning("Choose a target status."); return; }
    Swal.fire({
      icon: "question",
      title: `Move ${selectedIds.length} payslip(s) to "${target}"?`,
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(true);
      Api({
        method: "PATCH",
        url: "payroll/employee-payslip-status/",
        data: { payslip_ids: selectedIds, status: target },
      })
        .then((res) => {
          const { updated_count, skipped } = res?.data?.data || {};
          toast.success(`${updated_count || 0} updated${skipped?.length ? `, ${skipped.length} skipped` : ""}`);
          onDone && onDone();
        })
        .catch((err) => toast.error(err?.response?.data?.error_message || "Bulk update failed."))
        .finally(() => setBusy(false));
    });
  };

  return (
    <div className="d-flex align-items-center gap-2 p-2 bg-light border rounded mb-2">
      <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedIds.length} selected</span>
      <Input type="select" bsSize="sm" style={{ width: 180 }} value={target} onChange={(e) => setTarget(e.target.value)}>
        <option value="">Move to…</option>
        {BULK_TARGETS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
      </Input>
      <Button color="primary" size="sm" onClick={apply} disabled={busy}>
        {busy ? <Spinner size="sm" /> : "Apply"}
      </Button>
    </div>
  );
};

export default PayslipBulkStatusBar;