import React, { useEffect, useState } from "react";
import { Button, Spinner, ButtonGroup } from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { fetchStatusMaster } from "./statusHelpers";
import StatusBadge from "./StatusBadge";

const RunStatusActions = ({ run, onChanged, size = "sm" }) => {
  const [rows, setRows]   = useState([]);
  const [busy, setBusy]   = useState(false);

  useEffect(() => { fetchStatusMaster("run").then(setRows); }, []);

  if (!run) return null;
  const current   = rows.find((r) => r.code === run.status);
  const nextCodes = current?.allowed_next || [];

  const move = (target) => {
    Swal.fire({
      icon: "question",
      title: `Move run to "${target}"?`,
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setBusy(true);
      Api({
        method: "PATCH",
        url: "payroll/payroll-run-status/",
        data: { id: run.id, status: target, cascade_payslips: true },
      })
        .then((res) => {
          const cascaded = res?.data?.data?.payslips_cascaded || 0;
          toast.success(`Run status updated${cascaded ? ` (${cascaded} payslip(s) cascaded)` : ""}`);
          onChanged && onChanged();
        })
        .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to update status."))
        .finally(() => setBusy(false));
    });
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <StatusBadge scope="run" code={run.status} />
      {nextCodes.length > 0 && (
        <ButtonGroup size={size}>
          {nextCodes.map((code) => (
            <Button key={code} color="light" className="border" disabled={busy} onClick={() => move(code)}>
              {busy ? <Spinner size="sm" /> : `→ ${code.replace(/_/g, " ")}`}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </div>
  );
};

export default RunStatusActions;