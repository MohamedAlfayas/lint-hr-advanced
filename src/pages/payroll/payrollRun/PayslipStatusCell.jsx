import React, { useEffect, useState } from "react";
import { Input, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { fetchStatusMaster } from "./statusHelpers";
import StatusBadge from "./StatusBadge";

const PayslipStatusCell = ({ payslip, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchStatusMaster("payslip").then(setRows); }, []);

  const current   = rows.find((r) => r.code === payslip.status);
  const nextCodes = current?.allowed_next || [];

  const handleChange = (e) => {
    const target = e.target.value;
    if (!target) return;
    setBusy(true);
    Api({
      method: "PATCH",
      url: "payroll/employee-payslip-status/",
      data: { id: payslip.id, status: target },
    })
      .then(() => { toast.success("Status updated"); onChanged && onChanged(); })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to update status."))
      .finally(() => setBusy(false));
  };

  if (busy) return <Spinner size="sm" />;

  return (
    <div className="d-flex align-items-center gap-1">
      <StatusBadge scope="payslip" code={payslip.status} />
      {nextCodes.length > 0 && (
        <Input type="select" bsSize="sm" style={{ width: 110, fontSize: 11 }} value="" onChange={handleChange}>
          <option value="">Move to…</option>
          {nextCodes.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </Input>
      )}
    </div>
  );
};

export default PayslipStatusCell;